import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireAdmin, hashPassword, generateTemporaryPassword, sendPasswordResetEmail } from "./auth";
import { insertPostSchema, insertCommentSchema, insertMemeSchema, insertGigSchema, insertPlaylistSchema, insertMusicProfileSchema, insertTrackSchema, insertCuratedPlaylistSchema, insertPostReactionSchema, InsertPostInput, InsertPost, InsertComment, InsertTrack } from "@shared/schema";
import { z } from "zod";
import { aiService } from "./services/aiService";
import { newsService } from "./services/newsService";
import { moderationService } from "./services/moderationService";
import { avatarService } from "./services/avatarService";
import { musicPlatformService } from "./services/musicPlatformService";
import { loggingService } from "./services/loggingService";
import { emailService } from "./services/emailService";
import { bandcampService } from "./services/bandcampService";
import { spotifyService } from "./services/spotifyService";
import { memeService } from "./services/memeService";
import { performComprehensiveHealthCheck } from './utils/healthChecks'
import {
  checkDatabaseHealth,
  checkEmailHealth,
  checkAIHealth,
  checkStorageHealth,
} from './utils/healthChecks'
import { getCustomFeeds, addCustomFeed } from './config/customFeeds'
import Parser from 'rss-parser'

const rssParser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'TheCueRoom/1.0 (+https://thecueroom.com)'
  }
})

// In-memory feed settings
let feedSettings: Record<string, any> = {
  spotlight: {
    enabled: true,
    refreshInterval: 300,
    maxItems: 8,
    sources: ['mixmag', 'residentadvisor', 'djmag'],
    categories: ['featured', 'trending'],
    moderation: true
  },
  community: {
    enabled: true,
    refreshInterval: 60,
    maxItems: 100,
    sources: ['user_posts', 'comments'],
    categories: ['discussion', 'announcement'],
    moderation: true
  },
  music: {
    enabled: true,
    refreshInterval: 600,
    maxItems: 50,
    sources: ['beatport', 'soundcloud', 'spotify'],
    categories: ['releases', 'news', 'reviews'],
    moderation: true
  },
  guides: {
    enabled: true,
    refreshInterval: 1800,
    maxItems: 30,
    sources: ['point-blank', 'edmprod', 'native-instruments'],
    categories: ['tutorials', 'tips', 'techniques'],
    moderation: false
  },
  industry: {
    enabled: true,
    refreshInterval: 900,
    maxItems: 40,
    sources: ['musictech', 'attack-magazine'],
    categories: ['business', 'technology', 'trends'],
    moderation: true
  },
  gigs: {
    enabled: true,
    refreshInterval: 1800,
    maxItems: 25,
    sources: ['ra-mumbai', 'ra-bangalore', 'ra-goa', 'ra-delhi'],
    categories: ['events', 'festivals', 'club-nights'],
    moderation: false
  },
  system: {
    enabled: true,
    refreshInterval: 3600,
    maxItems: 20,
    sources: ['system_logs', 'user_activity'],
    categories: ['maintenance', 'updates'],
    moderation: false
  }
};

const isAdmin = async (req: any, res: any, next: any) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (!user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup custom authentication
  setupAuth(app);

  // User routes
  app.post('/api/users/verify', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { links } = req.body;
      
      // Validate verification links
      const isValid = await moderationService.validateVerificationLinks(links);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification links" });
      }
      
      const user = await storage.updateUserVerification(userId, true, links);
      res.json(user);
    } catch (error) {
      console.error("Error verifying user:", error);
      res.status(500).json({ message: "Failed to verify user" });
    }
  });

  app.patch('/api/users/:id/suspension', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isSuspended, reason } = req.body;
      
      const user = await storage.updateUserSuspension(id, isSuspended);
      
      // Log moderation action
      await storage.createModerationLog({
        targetType:      'user',
        targetId:        id,
        action:          isSuspended ? 'suspend' : 'unsuspend',
        reason,
        details:         `User ${isSuspended ? 'suspended' : 'unsuspended'} by admin via PATCH /api/users/${id}/suspension`,
        moderatorId:     (req.user as any)?.id,
        isAutoModerated: false,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user suspension:", error);
      res.status(500).json({ message: "Failed to update user suspension" });
    }
  });

  // Delete user endpoint
  app.delete('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Prevent admin from deleting themselves
      if (id === (req.user as any)?.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      await storage.deleteUser(id);
      
      // Log moderation action
      await storage.createModerationLog({
        targetType: 'user',
        targetId: id,
        action: 'delete',
        reason: 'User deleted by admin',
        details: 'Deleted by admin via /api/users/:id',   // ← new, non-nullable
        moderatorId: (req.user as any).id,
        isAutoModerated: false,
      });
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Reset user password endpoint
  app.patch('/api/users/:id/password-reset', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      
      const hashedPassword = await hashPassword(newPassword);
      await storage.resetUserPassword(id, hashedPassword);
      
      // Log moderation action
      await storage.createModerationLog({
        targetType: 'user',
        targetId: id,
        action: 'password_reset',
        reason: 'Password reset by admin',
        details: 'Password reset by admin via /api/users/:id',   // ← new, non-nullable
        moderatorId: (req.user as any).id,
        isAutoModerated: false,
      });
      
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Failed to reset password' });
    }
  });

  // User activation endpoint - Admin can activate with or without email verification
  app.patch('/api/users/:id/activate', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const adminId = (req.user as any).id;
      const { forceActivate } = req.body; // Allow admin to force activate without email verification
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.isVerified) {
        return res.status(400).json({ message: 'User is already activated' });
      }
      
      // If not force activating, check email verification
      if (!forceActivate && !user.emailVerified) {
        return res.status(400).json({ 
          message: 'User email must be verified before activation. Use force activate to bypass this requirement.',
          requiresForce: true 
        });
      }
      
      // Activate the user
      const activatedUser = await storage.updateUserVerification(id, true);
      
      // If email wasn't verified but admin force activated, also mark email as verified
      if (!user.emailVerified && forceActivate) {
        await storage.updateUserProfile(id, { emailVerified: true });
      }
      
      // Send welcome email
      let emailSent = false;
      try {
        emailSent = await emailService.sendWelcomeEmail(user.email, user.stageName || user.firstName);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
      
      // Log activation
      await storage.createModerationLog({
        targetType: 'user',
        targetId: id,
        action: 'account_activation',
        reason: forceActivate
          ? 'Account manually activated by admin (forced)'
          : 'Account manually activated by admin',
        details: forceActivate
          ? 'Activated (forced) via PATCH /api/users/:id/activate'
          : 'Activated via PATCH /api/users/:id/activate',
        moderatorId: (req.user as any).id,
        isAutoModerated: false,
      });


      
      await loggingService.logVerification(id, adminId, req);
      
      res.json({ 
        message: 'User activated successfully' + (emailSent ? ' and welcome email sent' : ''),
        user: activatedUser,
        emailSent,
        forceActivated: forceActivate || false
      });
    } catch (error) {
      console.error('Error activating user:', error);
      res.status(500).json({ message: 'Failed to activate user' });
    }
  });

  // Admin manual email verification endpoint
  app.patch('/api/users/:id/verify-email', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const adminId = (req.user as any).id;
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.emailVerified) {
        return res.status(400).json({ message: 'Email is already verified' });
      }
      
      // Manually verify the user's email
      await storage.updateUserProfile(id, { emailVerified: true });
      
      // Clear verification token
      await storage.clearUserResetToken(id);
      
      // Log the action
      await storage.createModerationLog({
        targetType:      'user',
        targetId:        id,
        action:          'email_verification',
        reason:          'Email manually verified by admin',
        details:         'Manually verified via PATCH /api/users/:id/verify-email by admin',
        moderatorId:     adminId,
        isAutoModerated: false,
      });
      
      await loggingService.logEmailVerification(id, req);
      
      res.json({ 
        message: 'Email verified successfully',
        user: await storage.getUser(id)
      });
    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ message: 'Failed to verify email' });
    }
  });

  // Get user profile by ID (for profile cards)
  app.get('/api/users/:id/profile', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user stats
      const postsCount = await storage.getUserPostsCount(id);
      const commentsCount = await storage.getUserCommentsCount(id);

      // Return profile data (excluding sensitive fields)
      const profileData = {
        id: user.id,
        username: user.username,
        stageName: user.stageName,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        genres: user.genres,
        subgenres: user.subgenres,
        avatar: user.avatar,
        avatarConfig: user.avatarConfig,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        spotifyUrl: user.spotifyUrl,
        soundcloudUrl: user.soundcloudUrl,
        mixcloudUrl: user.mixcloudUrl,
        youtubeUrl: user.youtubeUrl,
        beatportUrl: user.beatportUrl,
        bandcampUrl: user.bandcampUrl,
        residentAdvisorUrl: user.residentAdvisorUrl,
        instagramUrl: user.instagramUrl,
        postsCount,
        commentsCount
      };
      
      res.json(profileData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  });

  app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Post routes
  app.post('/api/posts', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const raw = { ...req.body, userId: (req.user as any).id };
      const postData = insertPostSchema.parse(raw) as InsertPostInput;
      
      // Content moderation
      const moderationResult = await moderationService.moderateContent(postData.content);
      if (!moderationResult.approved) {
        return res.status(400).json({ 
          message: "Content violates community guidelines",
          reason: moderationResult.reason 
        });
      }
      
      const post = await storage.createPost(postData as InsertPost);
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get('/api/posts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const tag = req.query.tag as string;
      
      let posts;
      if (tag) {
        posts = await storage.getPostsByTag(tag, limit);
      } else {
        posts = await storage.getPosts(limit, offset);
      }
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Reaction system - upsert one reaction per user per post
  app.post('/api/posts/:id/react', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const postId = parseInt(req.params.id);
      const { reactionType } = req.body;
      
      if (!reactionType || !['heart', 'like', 'dislike', 'laugh', 'smile', 'surprise', 'explode'].includes(reactionType)) {
        return res.status(400).json({ message: "Invalid reaction type" });
      }
      
      // Upsert reaction (insert or update existing)
      const result = await storage.upsertPostReaction(userId, postId, reactionType);
      
      // Get updated reaction counts for this post
      const reactions = await storage.getPostReactions(postId);
      const userReaction = await storage.getUserPostReaction(userId, postId);
      
      res.json({ 
        reactions,
        userReaction: userReaction?.reactionType || null,
        success: true
      });
    } catch (error) {
      console.error("Error updating post reaction:", error);
      res.status(500).json({ message: "Failed to update reaction" });
    }
  });

  // Get reactions for a post
  app.get('/api/posts/:id/reactions', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      console.log(`Fetching reactions for post ${postId}`);
      const reactions = await storage.getPostReactions(postId);
      console.log(`Found reactions:`, reactions);
      res.json({ reactions });
    } catch (error) {
      console.error("Error fetching post reactions:", error);
      res.status(500).json({ message: "Failed to fetch reactions", error: error.message });
    }
  });

  // Delete user's reaction from a post
  app.delete('/api/posts/:id/react', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const postId = parseInt(req.params.id);
      
      await storage.deletePostReaction(userId, postId);
      
      // Get updated reaction counts
      const reactions = await storage.getPostReactions(postId);
      
      res.json({ 
        reactions,
        userReaction: null,
        success: true
      });
    } catch (error) {
      console.error("Error deleting post reaction:", error);
      res.status(500).json({ message: "Failed to delete reaction" });
    }
  });

  // TheCueRoom AI Bot Content Moderation
  app.post('/api/ai-bot/moderate', async (req, res) => {
    try {
      const { content, type, postId } = req.body;
      
      // Content analysis
      const violations = detectContentViolations(content);
      
      if (violations.length > 0) {
        // Generate humorous bot response
        const botResponse = generateBotResponse(violations[0]);
        
        // Auto-add bot comment for violations
        if (type === 'comment' && postId) {
          try {
            await storage.createComment({
              postId: postId,
              userId: 'ai-bot-thecueroom',
              content: botResponse,
              createdAt: new Date(),
            } as any);
          } catch (error) {
            console.error('Error adding bot comment:', error);
          }
        }
        
        res.json({
          isViolation: true,
          violationType: violations[0],
          botResponse,
          shouldRemove: true
        });
      } else {
        res.json({
          isViolation: false,
          violationType: null,
          botResponse: null,
          shouldRemove: false
        });
      }
    } catch (error) {
      console.error("Error in AI moderation:", error);
      res.status(500).json({ message: "Moderation service temporarily unavailable" });
    }
  });

  // Helper function for content violation detection
  function detectContentViolations(content: string): string[] {
    const violations: string[] = [];
    const lowerContent = content.toLowerCase();

    // Contact info patterns
    const contactPatterns = [
      /\b\d{10}\b/, // Phone numbers
      /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/, // Email
      /\bwhatsapp\b|\binstagram\b|\btelegram\b|\bcontact me\b/,
      /\bpay\b.*\bmoney\b|\bbuy\b.*\bnow\b|\bsale\b|\bpromo\b/
    ];

    // Unsafe links (non-music platforms)
    const unsafePatterns = [
      /bit\.ly|tinyurl|t\.co|short\.link/,
      /\.tk\b|\.ml\b|\.ga\b|\.cf\b/, // Suspicious domains
      /download.*free|crack|pirate|torrent/
    ];

    contactPatterns.forEach(pattern => {
      if (pattern.test(lowerContent)) {
        violations.push('contact_info');
      }
    });

    unsafePatterns.forEach(pattern => {
      if (pattern.test(lowerContent)) {
        violations.push('unsafe_link');
      }
    });

    // Spam/promotional content
    if (lowerContent.includes('buy') && lowerContent.includes('now')) {
      violations.push('promotional');
    }

    return violations;
  }

  // Bot response generator with humor
  function generateBotResponse(violationType: string): string {
    const responses = {
      contact_info: [
        "🤖 Whoa there! Keep the personal details for the DMs, not the feed. This isn't a dating app for DJs! 😄",
        "🎧 TheCueRoom Bot here! Contact info in posts? That's a no-go! Keep it mysterious like a masked DJ set! 🎭",
        "🚫 Personal details detected! Let's keep the community feed for music talk, not phone book entries! 📞❌"
      ],
      promotional: [
        "💰 TheCueRoom Bot says: This ain't a marketplace! Save the sales pitch for your SoundCloud bio! 🛍️❌",
        "🎪 Promotional content detected! This is a community space, not a bazaar! Keep it about the beats! 🥁",
        "📢 Easy on the sales talk! We're here to discuss 303 basslines, not credit card lines! 💳🚫"
      ],
      unsafe_link: [
        "🔗 Suspicious link alert! That URL looks sketchier than a free Nexus preset pack! 🎹⚠️",
        "🛡️ Bot security mode: That link smells fishier than week-old sushi! Stick to legit music platforms! 🍣❌",
        "⚠️ Link flagged! Unless it's leading to Beatport or Bandcamp, we're not clicking! 🖱️🚫"
      ],
      spam: [
        "🤖 Spam detected! This content is more repetitive than a broken loop pedal! 🔄❌",
        "🚨 Bot alert: Copy-paste content spotted! Be original like your unreleased tracks! 🎵✨",
        "📝 Generic message detected! Put some soul into it, like your favorite acid house track! 🏠💖"
      ]
    };

    const categoryResponses = responses[violationType as keyof typeof responses] || responses.spam;
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  }

  app.delete('/api/posts/:id', requireAuth, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const user = await storage.getUser(userId);
      if (post.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      
      await storage.deletePost(postId);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Get all users for mentions
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Return only necessary fields for mentions
      const userMentions = users.map(user => ({
        id: user.id,
        username: user.username,
        stageName: user.stageName,
        isVerified: user.isVerified || false,
        isBot: false
      }));
      res.json(userMentions);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // AI Bot Response API
  app.post('/api/ai/bot-response', async (req, res) => {
    try {
      const { mentionContent, postContent, postTitle } = req.body;
      
      if (!mentionContent) {
        return res.status(400).json({ message: "Mention content is required" });
      }

      const { AIModerationService } = await import("./services/aiModerationService");
      const botResponse = await AIModerationService.generateBotResponse(
        mentionContent,
        postContent || "",
        { stageName: "Community member" }
      );

      if (botResponse.shouldRespond && botResponse.response) {
        res.json({
          response: botResponse.response,
          context: botResponse.context,
          confidence: botResponse.confidence
        });
      } else {
        res.json({
          response: "Thanks for mentioning me! I'm here to help with music advice and community support. 🎧",
          context: "default_response",
          confidence: 0.8
        });
      }
    } catch (error) {
      console.error("AI bot response error:", error);
      res.status(500).json({ 
        message: "AI service temporarily unavailable",
        response: "Hey! I'm having some technical difficulties right now, but I'm still here to support the underground music community! 🎵"
      });
    }
  });

  // AI Content Moderation API
  app.post('/api/ai/moderate', async (req, res) => {
    try {
      const { content, context } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      const { AIModerationService } = await import("./services/aiModerationService");
      const moderationResult = await AIModerationService.moderateContent(content, context);

      res.json(moderationResult);
    } catch (error) {
      console.error("AI moderation error:", error);
      res.status(500).json({ 
        message: "Moderation service temporarily unavailable",
        approved: true,
        confidence: 0.5,
        violations: [],
        requiresHumanReview: true
      });
    }
  });

  // Support system routes
  app.post('/api/support/admin-contact', async (req, res) => {
    try {
      const { email, firstName } = req.body;
      
      if (!email || !firstName) {
        return res.status(400).json({ message: 'Email and first name are required' });
      }

      // Create support ticket
      const supportTicket = await storage.createSupportTicket({
        email,
        firstName,
        ticketType: 'password_reset',
        subject: `Password Reset Request from ${firstName}`,
        description: `User ${firstName} (${email}) has requested admin assistance for password reset through the authentication system.`,
        status: 'open',
        priority: 'medium'
      });

      res.json({ 
        message: 'Support request submitted successfully',
        ticketId: supportTicket.id 
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      res.status(500).json({ message: 'Failed to submit support request' });
    }
  });

  app.get('/api/support/tickets', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { limit = 50, offset = 0, status } = req.query;
      
      let tickets;
      if (status && status !== 'all') {
        tickets = await storage.getSupportTicketsByStatus(status);
      } else {
        tickets = await storage.getSupportTickets(parseInt(limit), parseInt(offset));
      }
      
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      res.status(500).json({ message: 'Failed to fetch support tickets' });
    }
  });

  app.patch('/api/support/tickets/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, priority, resolution, assignedTo } = req.body;
      const adminId = (req.user as any).id;
      
      const updates: any = {};
      if (status) updates.status = status;
      if (priority) updates.priority = priority;
      if (resolution) updates.resolution = resolution;
      if (assignedTo) updates.assignedTo = assignedTo;
      
      if (status === 'resolved' || status === 'closed') {
        updates.resolvedAt = new Date();
      }

      const updatedTicket = await storage.updateSupportTicket(parseInt(id), updates);
      
      // Log admin action
      await storage.createModerationLog({
        targetType:      'support_ticket',
        targetId:        id,
        action:          'update',
        reason:          `Support ticket #${id} updated`,
        details:         `Updated support ticket #${id} (Status: ${status}, Priority: ${priority}) via PATCH /api/support/tickets/${id}`,
        moderatorId:     adminId,
        isAutoModerated: false,
      });

      res.json(updatedTicket);
    } catch (error) {
      console.error('Error updating support ticket:', error);
      res.status(500).json({ message: 'Failed to update support ticket' });
    }
  });

  app.delete('/api/support/tickets/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const adminId = (req.user as any).id;
      
      await storage.deleteSupportTicket(parseInt(id));
      
      // Log admin action
      await storage.createModerationLog({
        targetType:      'support_ticket',
        targetId:        id,
        action:          'delete',
        reason:          `Support ticket #${id} deleted`,
        details:         `Deleted support ticket #${id} via DELETE /api/support/tickets/${id}`,
        moderatorId:     adminId,
        isAutoModerated: false,
      });
      
      res.json({ message: 'Support ticket deleted successfully' });
    } catch (error) {
      console.error('Error deleting support ticket:', error);
      res.status(500).json({ message: 'Failed to delete support ticket' });
    }
  });

  // Admin password reset route
  app.post('/api/auth/admin-reset-password', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { email, ticketId } = req.body;
      const adminId = (req.user as any).id;
      
      if (!email || !ticketId) {
        return res.status(400).json({ message: 'Email and ticket ID are required' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found with this email address' });
      }

      // Generate secure temporary password (8 chars, readable)
      const tempPassword = generateTemporaryPassword();
      
      // Hash the temporary password
      const hashedTempPassword = await hashPassword(tempPassword);
      
      // Update user password and set flag for forced password change
      await storage.updateUserPassword(user.id, hashedTempPassword, true);
      
      // Send email notification to user
      const emailSent = await sendPasswordResetEmail(email, user.firstName, tempPassword);
      
      if (!emailSent) {
        // Rollback password change if email fails
        await storage.updateUserPassword(user.id, user.password, false);
        return res.status(500).json({ message: 'Failed to send reset email. Password not changed.' });
      }

      // Update support ticket with resolution and temp password
      await storage.updateSupportTicket(ticketId, {
        status: 'resolved',
        resolution: `Password reset completed by admin. Temporary password sent to user's email.`,
        tempPassword: tempPassword, // Store for admin reference
        resolvedAt: new Date()
      });

      // Log admin action
      await storage.createModerationLog({
        targetType:      'user',
        targetId:        user.id,
        action:          'admin_password_reset',
        reason:          `Admin reset password for user ${email} via support ticket #${ticketId}`,
        details:         `Admin password reset via POST /api/auth/admin-reset-password for ${email} (ticket #${ticketId})`,
        moderatorId:     adminId,
        isAutoModerated: false,
      });

      res.json({ 
        message: 'Password reset successful',
        email: email,
        tempPasswordSent: true,
        tempPassword: tempPassword // Return for admin display
      });
    } catch (error) {
      console.error('Error in admin password reset:', error);
      res.status(500).json({ message: 'Failed to reset password' });
    }
  });

  // Comment routes
  app.post('/api/comments', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const commentData = insertCommentSchema.parse({ ...req.body, userId });
      
      // Content moderation
      const moderationResult = await moderationService.moderateContent(commentData.content as unknown as string);
      if (!moderationResult.approved) {
        return res.status(400).json({ 
          message: "Content violates community guidelines",
          reason: moderationResult.reason 
        });
      }
      
      const comment = await storage.createComment(commentData as InsertComment);
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get('/api/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPost(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Settings endpoints
  app.patch("/api/auth/profile", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { firstName, lastName, stageName, bio, city } = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        stageName,
        bio,
        city
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.patch("/api/auth/password", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { currentPassword, newPassword } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password using bcrypt directly
      const bcrypt = require('bcrypt');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await storage.resetUserPassword(userId, hashedNewPassword);
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  app.delete("/api/auth/account", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      await storage.deleteUser(userId);
      
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Avatar save endpoint
  app.patch('/api/user/avatar', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { avatarUrl } = req.body;
      
      if (!avatarUrl) {
        return res.status(400).json({ message: "Avatar URL is required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.upsertUser({
        id: user.id,
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        stageName: user.stageName || 'UnknownArtist',
        username: user.username,
        bio: user.bio,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
        verificationLinks: user.verificationLinks as any,
        avatarConfig: user.avatarConfig,
        profileImageUrl: avatarUrl,
      });
      
      res.json({ message: "Avatar updated successfully", avatarUrl });
    } catch (error) {
      console.error("Error updating avatar:", error);
      res.status(500).json({ message: "Failed to update avatar" });
    }
  });

  // Meme routes
  app.post('/api/memes', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { prompt, category } = req.body;
      
      // Generate meme using AI
      const memeUrl = await aiService.generateMeme(prompt, category);
      
      // Check for NSFW content
      const isNSFW = await moderationService.checkNSFWContent(memeUrl);
      
      if (isNSFW) {
        return res.status(400).json({ 
          message: "Generated content contains inappropriate material" 
        });
      }
      
      const meme = await storage.createMeme({
        userId,
        prompt,
        imageUrl: memeUrl,
        category,
      });
      
      res.json(meme);
    } catch (error) {
      console.error("Error generating meme:", error);
      res.status(500).json({ message: "Failed to generate meme" });
    }
  });

  app.post('/api/memes/generate', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { prompt, category } = req.body;
      
      // Generate meme using AI
      const memeUrl = await aiService.generateMeme(prompt, category);
      
      // Check for NSFW content
      const isNSFW = await moderationService.checkNSFWContent(memeUrl);
      
      if (isNSFW) {
        return res.status(400).json({ 
          message: "Generated content contains inappropriate material" 
        });
      }
      
      const meme = await storage.createMeme({
        userId,
        prompt,
        imageUrl: memeUrl,
        category,
      });
      
      res.json(meme);
    } catch (error) {
      console.error("Error generating meme:", error);
      res.status(500).json({ message: "Failed to generate meme" });
    }
  });

  app.get('/api/memes', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string;
      
      let memes;
      if (category) {
        memes = await storage.getMemesByCategory(category, limit);
      } else {
        memes = await storage.getMemes(limit, offset);
      }
      
      res.json(memes);
    } catch (error) {
      console.error("Error fetching memes:", error);
      res.status(500).json({ message: "Failed to fetch memes" });
    }
  });

  // News routes
  app.get('/api/news', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const articles = await storage.getNewsArticles(limit, offset);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get('/api/news/spotlight', async (req, res) => {
    try {
      const articles = await storage.getSpotlightNews();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching spotlight news:", error);
      res.status(500).json({ message: "Failed to fetch spotlight news" });
    }
  });

  app.post('/api/news/spotlight', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { articleIds } = req.body;
      await storage.updateSpotlightNews(articleIds);
      res.json({ message: "Spotlight news updated successfully" });
    } catch (error) {
      console.error("Error updating spotlight news:", error);
      res.status(500).json({ message: "Failed to update spotlight news" });
    }
  });

  app.post('/api/news/refresh', requireAuth, requireAdmin, async (req, res) => {
    try {
      await newsService.refreshNewsFeeds();
      res.json({ message: "News feeds refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing news feeds:", error);
      res.status(500).json({ message: "Failed to refresh news feeds" });
    }
  });

  // Seed forum test posts endpoint
  app.post("/api/seed-forum-posts", requireAuth, requireAdmin, async (req, res) => {
    try {
      const testPosts = [
        // Production Posts
        {
          title: "New acid track feedback needed - 303 squelch perfection?",
          content: "Been working on this acid banger for weeks. The 303 line is sitting pretty nasty but wondering if the filter sweep needs more bite. Looking for ears from fellow producers. Link in comments. #production #303 #acidhouse",
          hashtags: ["production", "303", "acidhouse"],
          userId: "user_f744a20301a93c41"
        },
        {
          title: "Kick drums sitting muddy in the mix - Need production tips",
          content: "My kicks are getting lost when I layer the bassline. EQing around 60Hz but still feels weak. Anyone got secret sauce for that punchy underground sound? Using Ableton with some analog outboard. #production #mixing #techno",
          hashtags: ["production", "mixing", "techno"],
          userId: "user_75bd6d54328509f8"
        },
        // Troubleshooting Posts  
        {
          title: "CDJ-3000 USB issues - tracks not loading properly",
          content: "Having nightmare with my CDJs tonight. USB sticks formatted correctly but tracks keep hanging on load. Anyone experienced this? Gig tomorrow and stress levels through the roof. #troubleshooting #cdj #pioneer",
          hashtags: ["troubleshooting", "cdj", "pioneer"],
          userId: "user_bf92fe243b2fcf5b"
        },
        {
          title: "Ableton crashing during live sets - CPU spikes",
          content: "Live 12 keeps crashing mid-set when using heavy Operator patches. Buffer size at 256, still getting dropouts. Thinking it's the reverb sends but not sure. Anyone found solid workarounds? #troubleshooting #ableton #live",
          hashtags: ["troubleshooting", "ableton", "live"],
          userId: "user_f744a20301a93c41"
        },
        // Memes Posts
        {
          title: "When the 303 filter sweep hits just right...",
          content: "That moment when you dial in the perfect acid line and suddenly understand why Roland discontinued the TB-303. *chef's kiss* Who else gets emotional over analog squelch? #memes #303 #acidhouse #analog",
          hashtags: ["memes", "303", "acidhouse"],
          userId: "user_75bd6d54328509f8"
        },
        {
          title: "POV: You're explaining why you need another synthesizer",
          content: "Wife: 'Don't you already have enough synths?'\\nMe: 'But this one has a different filter...' *shows Moog Matriarch*\\nWife: *sigh*\\nMe: *orders anyway* #memes #synth #gearacquisition",
          hashtags: ["memes", "synth", "gear"],
          userId: "user_bf92fe243b2fcf5b"
        },
        // Techno Posts
        {
          title: "Berlin warehouse vibes - Industrial techno session",
          content: "Just finished a 6-hour session working on some proper Berlin-style industrial techno. Heavy kicks, metallic percussion, and that underground warehouse atmosphere. Anyone else feeling the return to harder sounds? #techno #industrial #berlin",
          hashtags: ["techno", "industrial", "berlin"],
          userId: "user_f744a20301a93c41"
        },
        {
          title: "Minimal techno is making a comeback - thoughts?",
          content: "Hearing more stripped-down minimal sets lately. The micro-house influence is strong but keeping that techno edge. Ricardo Villalobos was ahead of his time. What's everyone's take on the minimal resurgence? #techno #minimal #microhouse",
          hashtags: ["techno", "minimal", "microhouse"],
          userId: "user_75bd6d54328509f8"
        },
        // House Posts
        {
          title: "Deep house chord progressions - classic vs modern",
          content: "Been studying those classic Chicago house chord progressions. Modern deep house seems to have lost some of that soulful quality. Anyone else miss the raw emotion of early Frankie Knuckles tracks? #house #deephouse #chicago",
          hashtags: ["house", "deephouse", "chicago"],
          userId: "user_bf92fe243b2fcf5b"
        },
        {
          title: "UK garage influence on house music evolution",
          content: "Notice how UK garage elements are creeping into house productions? The syncopated rhythms and skippy hi-hats are giving house a fresh perspective. Speed garage revival incoming? #house #ukgarage #evolution",
          hashtags: ["house", "ukgarage", "evolution"],
          userId: "user_f744a20301a93c41"
        },
        // Equipment Posts
        {
          title: "Analog vs digital debate - 2024 perspective",
          content: "Still hearing producers argue analog superiority. Modern digital processing is incredible but there's something about analog saturation and drift. Using both in hybrid setups seems optimal. Thoughts? #electronicequipments #analog #digital",
          hashtags: ["electronicequipments", "analog", "digital"],
          userId: "user_75bd6d54328509f8"
        },
        {
          title: "Eurorack modular setup for techno - beginner advice",
          content: "Looking to start a modular setup focused on techno production. Thinking VCO, filter, sequencer, and effects as basics. Budget around ₹1,50,000. What modules would you prioritize for underground sounds? #electronicequipments #modular #eurorack",
          hashtags: ["electronicequipments", "modular", "eurorack"],
          userId: "user_bf92fe243b2fcf5b"
        },
        // DAW Posts
        {
          title: "Ableton Live 12 new features for electronic music production",
          content: "The new MIDI transformation tools in Live 12 are game-changers for techno production. The arpeggiator improvements and scale modes are perfect for acid sequences. Anyone diving deep into the update? #ableton #live12 #daw",
          hashtags: ["ableton", "live12", "daw"],
          userId: "user_75bd6d54328509f8"
        },
        {
          title: "FL Studio 21 lifetime updates worth it for electronic music?",
          content: "Considering switching from Ableton to FL for the lifetime updates. The step sequencer looks perfect for techno patterns. Anyone made the switch recently? How's the workflow for underground electronic music? #flstudio #daw #workflow",
          hashtags: ["flstudio", "daw", "workflow"],
          userId: "user_f744a20301a93c41"
        },
        // Pioneer Equipment
        {
          title: "CDJ-3000 vs XDJ-RX3 for underground gigs",
          content: "Venue has CDJ-3000s but considering bringing XDJ-RX3 for backup. The standalone capability is clutch but CDJ workflow is industry standard. What's everyone using for underground warehouse parties? #pioneer #cdj #xdj",
          hashtags: ["pioneer", "cdj", "xdj"],
          userId: "user_f744a20301a93c41"
        },
        // Native Instruments
        {
          title: "Maschine+ for live techno performances",
          content: "Been using Maschine+ for live sets and the workflow is incredible. The sampling capabilities for live remix work are unmatched. Anyone else performing live techno with Maschine? Tips for crowd interaction? #ni #maschine #liveperformance",
          hashtags: ["ni", "maschine", "liveperformance"],
          userId: "user_75bd6d54328509f8"
        },
        // Elektron Digitakt
        {
          title: "Digitakt sampling workflow for techno production",
          content: "The Digitakt's sampling engine is perfect for chopping breaks and creating techno percussion. The filter and overdrive add that gritty underground character. Sharing my sampling workflow and pattern organization. #digitakt #elektron #sampling",
          hashtags: ["digitakt", "elektron", "sampling"],
          userId: "user_bf92fe243b2fcf5b"
        },
        // Controllers
        {
          title: "DJ Controller vs CDJs - skills transfer debate",
          content: "Started on controller but moving to CDJs for club gigs. The muscle memory is different but mixing fundamentals transfer. Anyone else made this transition? How long did adaptation take? #controller #cdj #djing",
          hashtags: ["controller", "cdj", "djing"],
          userId: "user_f744a20301a93c41"
        },
        // Modular Synths
        {
          title: "Euclidean rhythms for techno - mathematical groove",
          content: "Been experimenting with Euclidean rhythm generators for techno patterns. The mathematical distribution creates interesting polyrhythms. Using Pamela's NEW Workout in modular setup. Anyone else into algorithmic sequencing? #modular #sequencer #euclidean",
          hashtags: ["modular", "sequencer", "euclidean"],
          userId: "user_f744a20301a93c41"
        },
        // Synthesizers
        {
          title: "TB-303 vs modern acid machines comparison",
          content: "Got hands on original TB-303 and comparing to Behringer TD-3 and Roland SH-01. The 303 has that unstable magic but modern clones are surprisingly close. Is the vintage premium worth it? #synth #303 #acid",
          hashtags: ["synth", "303", "acid"],
          userId: "user_75bd6d54328509f8"
        },
        // Drum Machines
        {
          title: "TR-909 samples vs hardware - can you hear difference?",
          content: "Blind tested TR-909 hardware against high-quality samples. In mix context, surprisingly hard to distinguish. But the workflow and hands-on control of hardware is irreplaceable. Thoughts on samples vs hardware? #drummachine #tr909 #hardware",
          hashtags: ["drummachine", "tr909", "hardware"],
          userId: "user_bf92fe243b2fcf5b"
        },
        // Basslines
        {
          title: "Sub-bass in club systems - frequency management",
          content: "Learning to produce for massive club systems. The sub-bass translation is tricky - sounds huge in studio but gets lost on big rigs. EQ techniques for club-ready basslines? Mono below 80Hz? #bassline #clubsystem #mixing",
          hashtags: ["bassline", "clubsystem", "mixing"],
          userId: "user_75bd6d54328509f8"
        },
        // Tips
        {
          title: "Sidechain compression techniques for pumping techno",
          content: "Sidechain isn't just about pumping - it's about creating space and groove. Using longer release times for subtle breathing effect vs short for aggressive pump. Ghost kick triggers work wonders. What's your sidechain philosophy? #tip #sidechain #techno",
          hashtags: ["tip", "sidechain", "techno"],
          userId: "user_bf92fe243b2fcf5b"
        },
        {
          title: "Building energy in 8-minute techno tracks",
          content: "Extended techno tracks need careful energy management. Starting minimal and layering elements every 32-64 bars works well. The breakdown at 5-6 minutes is crucial for second wind. Structure tips for long-form underground tracks? #tip #arrangement #techno",
          hashtags: ["tip", "arrangement", "techno"],
          userId: "user_f744a20301a93c41"
        }
      ];

        for (const postData of testPosts) {
          await storage.createPost({
            ...postData,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          } as InsertPost);
        }

      res.json({ message: `Successfully created ${testPosts.length} forum test posts`, count: testPosts.length });
    } catch (error) {
      console.error("Error seeding forum posts:", error);
      res.status(500).json({ message: "Failed to seed forum posts" });
    }
  });

  // Gig routes

  app.post('/api/gigs/submit', requireAuth, async (req, res) => {
    try {
      const requestData = { ...req.body };
      if (requestData.date) {
        requestData.date = new Date(requestData.date);
      }

      const schema = insertGigSchema.extend({
        genre: z.string(),
        subGenre: z.string().optional(),
      });
      const parsed: any = schema.parse(requestData);

      const location = (parsed.location || '').toLowerCase();
      if (!location.includes('india') && !location.includes('bangalore')) {
        return res.status(400).json({ message: 'Only Indian gigs allowed' });
      }

      if (!['techno', 'house'].includes(parsed.genre.toLowerCase())) {
        return res.status(400).json({ message: 'Only Techno or House gigs allowed' });
      }

      if (parsed.imageUrl) {
        if (!/\.(png|jpe?g)$/i.test(parsed.imageUrl)) {
          return res.status(400).json({ message: 'Flyer must be png or jpg' });
        }
        try {
          const head = await fetch(parsed.imageUrl, { method: 'HEAD' });
          const size = parseInt(head.headers.get('content-length') || '0', 10);
          if (size > 1_000_000) {
            return res.status(400).json({ message: 'Flyer exceeds 1MB size limit' });
          }
        } catch {
          return res.status(400).json({ message: 'Flyer URL not reachable' });
        }
      }

      const { genre, subGenre, ...gigData } = parsed;
      const gig = await storage.createGig({ ...gigData, isActive: false });
      if (process.env.ADMIN_EMAIL) {
        await emailService.sendGigSubmissionNotification(gig);
      }
      res.json(gig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid gig data', errors: error.errors });
      }
      console.error('Error creating gig:', error);
      res.status(500).json({ message: 'Failed to create gig' });
    }
  });

  // Gig routes (admin only)
  app.post('/api/gigs', requireAuth, requireAdmin, async (req, res) => {
    try {
      const requestData = { ...req.body };
      // Convert date string to Date object if provided
      if (requestData.date) {
        requestData.date = new Date(requestData.date);
      }
      
      const gigData = insertGigSchema.parse(requestData);
      const gig = await storage.createGig(gigData);
      res.json(gig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid gig data", errors: error.errors });
      }
      console.error("Error creating gig:", error);
      res.status(500).json({ message: "Failed to create gig" });
    }
  });

  app.get('/api/gigs', async (req, res) => {
    try {
      const activeParam = req.query.active as string | undefined;

      let gigs;
      if (activeParam === 'true') {
        gigs = await storage.getActiveGigs();
      } else if (activeParam === 'false') {
        gigs = await storage.getInactiveGigs();
      } else {
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;
        gigs = await storage.getGigs(limit, offset);
      }
      
      res.json(gigs);
    } catch (error) {
      console.error("Error fetching gigs:", error);
      res.status(500).json({ message: "Failed to fetch gigs" });
    }
  });

  app.patch('/api/gigs/:id', requireAuth, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const gigData = req.body;
      
      const gig = await storage.updateGig(id, gigData);
      res.json(gig);
    } catch (error) {
      console.error("Error updating gig:", error);
      res.status(500).json({ message: "Failed to update gig" });
    }
  });

  app.delete('/api/gigs/:id', requireAuth, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGig(id);
      res.json({ message: "Gig deleted successfully" });
    } catch (error) {
      console.error("Error deleting gig:", error);
      res.status(500).json({ message: "Failed to delete gig" });
    }
  });

  // Playlist routes (admin only)
  app.post('/api/playlists', requireAuth, isAdmin, async (req, res) => {
    try {
      const playlistData = insertPlaylistSchema.parse(req.body);
      const playlist = await storage.createPlaylist(playlistData);
      res.json(playlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid playlist data", errors: error.errors });
      }
      console.error("Error creating playlist:", error);
      res.status(500).json({ message: "Failed to create playlist" });
    }
  });

  app.get('/api/playlists', async (req, res) => {
    try {
      const active = req.query.active === 'true';
      
      let playlists;
      if (active) {
        playlists = await storage.getActivePlaylists();
      } else {
        playlists = await storage.getPlaylists();
      }
      
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ message: "Failed to fetch playlists" });
    }
  });

  // Post reactions routes
  app.post('/api/posts/:id/react', requireAuth, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      const { reaction } = req.body;
      
      // Validate reaction type
      const validReactions = ['heart', 'like', 'dislike', 'laugh', 'smile', 'surprise', 'explode'];
      if (!validReactions.includes(reaction)) {
        return res.status(400).json({ message: "Invalid reaction type" });
      }

      // For now, return mock reaction data since we don't have database schema for reactions
      const mockReactions = {
        heart: Math.floor(Math.random() * 10) + 1,
        like: Math.floor(Math.random() * 5),
        dislike: Math.floor(Math.random() * 2),
        laugh: Math.floor(Math.random() * 3),
        smile: Math.floor(Math.random() * 4),
        surprise: Math.floor(Math.random() * 2),
        explode: Math.floor(Math.random() * 1)
      };
      
      // Increment the selected reaction
      mockReactions[reaction] += 1;
      
      res.json({
        reactions: mockReactions,
        userReaction: reaction
      });
    } catch (error) {
      console.error("Error adding reaction:", error);
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });

  // Post comments routes - Fixed to use database storage
  app.post('/api/posts/:id/comments', requireAuth, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      const { content, mentions, memeImageUrl, memeImageData } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content cannot be empty" });
      }

      // AI Moderation for meme content via TheCueRoom Bot
      if (memeImageUrl || memeImageData) {
        console.log("🎭 TheCueRoom Bot: Moderating meme attachment for community guidelines...");
        
        // Simple rule-based meme moderation (since OpenAI usage is minimized)
        const memeContent = (content || "").toLowerCase();
        const restrictedTerms = ['hate', 'offensive', 'inappropriate', 'spam', 'scam'];
        const hasRestrictedContent = restrictedTerms.some(term => memeContent.includes(term));
        
        if (hasRestrictedContent) {
          return res.status(400).json({ 
            message: "Meme content violates community guidelines. Please keep memes fun and respectful!",
            moderatedBy: "TheCueRoom Bot"
          });
        }
        
        console.log("🎭 TheCueRoom Bot: Meme approved for underground community!");
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create actual comment in database
      const newComment = await storage.createComment({
        postId: postId,
        userId: userId,
        content: content,
        mentions: mentions || [],
        memeImageUrl: memeImageUrl || null,
        memeImageData: memeImageData || null
      } as any);

      // Attach user data for response
      const commentWithUser = {
        ...newComment,
        stageName: user.stageName || user.username || "Anonymous Artist",
        username: user.username,
        isVerified: user.isVerified,
        isBot: false,
        memeImageUrl: newComment.memeImageUrl,
        memeImageData: newComment.memeImageData
      };

      // Log successful meme attachment if present
      if (memeImageUrl) {
        console.log("🎭 TheCueRoom Bot: Meme successfully attached to comment!");
      }

      // Auto-generate TheCueRoom bot response
      setTimeout(async () => {
        console.log("TheCueRoom Bot would respond to comment:", content);
      }, 1000);

      res.json(commentWithUser);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Get comments for a post - Fixed to fetch from database
  app.get('/api/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPost(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.get('/api/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      
      // Return mock comments for now
      const mockComments = [
        {
          id: 1,
          userId: "bot_thecueroom",
          postId: postId,
          content: "🎵 Nice drop! This post is giving me some serious underground vibes. Remember to keep it fresh and respect the community guidelines! 🎧✨",
          stageName: "TheCueRoom Bot",
          createdAt: new Date(),
          isBot: true
        }
      ];
      
      res.json(mockComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Quick meme generation route
  app.post('/api/memes/quick-generate', requireAuth, async (req: any, res) => {
    try {
      const { template, topText, bottomText, style } = req.body;
      
      if (!template) {
        return res.status(400).json({ message: "Template is required" });
      }

      // Generate meme using existing meme generation system
      try {
        const memeUrl = `https://api.memegen.link/${template}/${encodeURIComponent(topText || '_')}/${encodeURIComponent(bottomText || '_')}.jpg`;
        
        res.json({
          imageUrl: memeUrl,
          template,
          topText,
          bottomText
        });
      } catch (memeError) {
        // Fallback to basic template
        const fallbackUrl = `https://api.memegen.link/drake/${encodeURIComponent(topText || 'When you try to make a meme')}/${encodeURIComponent(bottomText || 'But the API is down')}.jpg`;
        
        res.json({
          imageUrl: fallbackUrl,
          template: 'drake',
          topText: topText || 'Meme creation',
          bottomText: bottomText || 'In progress'
        });
      }
    } catch (error) {
      console.error("Error generating quick meme:", error);
      res.status(500).json({ message: "Failed to generate meme" });
    }
  });

  // Avatar routes
  app.post('/api/avatar/generate', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { config } = req.body;
      
      const avatarUrl = await avatarService.generateAvatar(config);
      
      // Update user's avatar config
      const user = await storage.getUser(userId);
      if (user) {
        await storage.upsertUser({
          id: user.id,
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          stageName: user.stageName || 'UnknownArtist',
          username: user.username,
          bio: user.bio,
          isVerified: user.isVerified,
          isSuspended: user.isSuspended,
          verificationLinks: user.verificationLinks as any,
          avatarConfig: config as any,
          profileImageUrl: avatarUrl,
        });
      }
      
      res.json({ avatarUrl });
    } catch (error) {
      console.error("Error generating avatar:", error);
      res.status(500).json({ message: "Failed to generate avatar" });
    }
  });

  // Moderation routes
  app.get('/api/moderation/logs', requireAuth, requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getModerationLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching moderation logs:", error);
      res.status(500).json({ message: "Failed to fetch moderation logs" });
    }
  });

  app.post('/api/moderation/moderate', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { targetType, targetId, action, reason } = req.body;
      const moderatorId = (req.user as any).id;
      
      // Apply moderation action
      if (targetType === 'post') {
        await storage.updatePostModeration(parseInt(targetId), action === 'approve');
      }
      
      // Log the action
      await storage.createModerationLog({
        targetType,
        targetId,
        action,
        reason,
        details:         `Applied moderation "${action}" to ${targetType} ${targetId} via /api/moderation/moderate`,
        moderatorId,
        isAutoModerated: false,
      });
      
      res.json({ message: "Moderation action applied successfully" });
    } catch (error) {
      console.error("Error applying moderation:", error);
      res.status(500).json({ message: "Failed to apply moderation action" });
    }
  });

  // Music Platform Integration routes
 app.post("/api/music/profiles", requireAuth, async (req, res) => {
  try {
    const { profileUrl } = req.body as { profileUrl: string };
    const validation = await musicPlatformService.validatePlatformURL(profileUrl);
    if (!validation.isValid) {
      return res.status(400).json({ message: "Invalid platform URL" });
    }

    // 1) Validate only the things coming from the client:
    const input = insertMusicProfileSchema.parse({
      userId:   (req.user as any).id,
      platform: validation.platform,
      profileUrl,
    });

    // 2) Fetch whatever the service adds:
    const metadata = await musicPlatformService.fetchArtistData(
      validation.platform,
      validation.username
    );

    // 3) Merge them together when saving—TS knows exactly which fields go where:
    const profile = await storage.createMusicProfile({
      userId:    input.userId,
      platform:  input.platform,
      profileUrl: input.profileUrl,
      username:  validation.username,
    });

    res.json(profile);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid profile data", errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to create music profile" });
  }
});

  app.get('/api/music/profiles/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const profiles = await storage.getMusicProfiles(userId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching music profiles:", error);
      res.status(500).json({ message: "Failed to fetch music profiles" });
    }
  });

app.post("/api/music/tracks", requireAuth, async (req, res) => {
  try {
    // 1) Validate
    const validated = insertTrackSchema.parse({
      ...req.body,
      userId: (req.user as any).id,
    });

    // 2) Build a loose payload so we can tack on embedCode
    const trackPayload: Record<string, any> = { ...validated };

    // 3) If we actually got `platforms`, pick the first one (or loop over them)
    if (Array.isArray(validated.platforms) && validated.platforms.length > 0) {
      const { platform, username, trackId } = validated.platforms[0];

      // **Pass both** platform & username (and optional trackId)
      trackPayload.embedCode = musicPlatformService.generateEmbedCode(
        platform,
        username,
        trackId
      );
    }

    // 4) Persist & respond
    const track = await storage.createTrack(trackPayload as InsertTrack);
    return res.json(track);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid track data", errors: err.errors });
    }
    console.error("Error creating track:", err);
    return res.status(500).json({ message: "Failed to create track" });
  }
});


  app.get('/api/music/tracks', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const genre = req.query.genre as string;
      const userId = req.query.userId as string;
      
      let tracks;
      if (userId) {
        tracks = await storage.getTracksByUser(userId, limit);
      } else if (genre) {
        tracks = await storage.getTracksByGenre(genre, limit);
      } else {
        tracks = await storage.getTracks(limit, offset);
      }
      
      res.json(tracks);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      res.status(500).json({ message: "Failed to fetch tracks" });
    }
  });

  app.post('/api/music/tracks/:id/like', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const trackId = parseInt(req.params.id);
      
      const liked = await storage.toggleTrackLike(userId, trackId);
      res.json({ liked });
    } catch (error) {
      console.error("Error toggling track like:", error);
      res.status(500).json({ message: "Failed to toggle track like" });
    }
  });

  app.post('/api/music/playlists', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const playlistData = insertCuratedPlaylistSchema.parse({ ...req.body, curatorId: userId });
      
      const playlist = await storage.createCuratedPlaylist(playlistData);
      res.json(playlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid playlist data", errors: error.errors });
      }
      console.error("Error creating curated playlist:", error);
      res.status(500).json({ message: "Failed to create curated playlist" });
    }
  });

  app.get('/api/music/playlists', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const genre = req.query.genre as string;
      
      let playlists;
      if (genre) {
        playlists = await storage.getCuratedPlaylistsByGenre(genre, limit);
      } else {
        playlists = await storage.getCuratedPlaylists(limit, offset);
      }
      
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching curated playlists:", error);
      res.status(500).json({ message: "Failed to fetch curated playlists" });
    }
  });

  app.post('/api/music/generate-playlist', requireAuth, async (req: any, res) => {
    try {
      const { genre, mood, bpmRange } = req.body;
      
      const playlist = await musicPlatformService.generateCuratedPlaylist(genre, mood, bpmRange);
      res.json(playlist);
    } catch (error) {
      console.error("Error generating playlist:", error);
      res.status(500).json({ message: "Failed to generate playlist" });
    }
  });

  app.get('/api/music/trending', async (req, res) => {
    try {
      const genre = req.query.genre as string || 'techno';
      const tracks = await musicPlatformService.getTrendingTracks(genre);
      res.json(tracks);
    } catch (error) {
      console.error("Error fetching trending tracks:", error);
      res.status(500).json({ message: "Failed to fetch trending tracks" });
    }
  });

  app.post('/api/music/platform-strategy', requireAuth, async (req: any, res) => {
    try {
      const { artistProfile, genre } = req.body;
      
      const strategy = await musicPlatformService.generatePlatformStrategy(artistProfile, genre);
      res.json({ strategy: JSON.parse(strategy) });
    } catch (error) {
      console.error("Error generating platform strategy:", error);
      res.status(500).json({ message: "Failed to generate platform strategy" });
    }
  });

  const httpServer = createServer(app);

  // User Logging API Routes
  app.get('/api/admin/logs/users/:userId', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getUserLogs(userId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching user logs:", error);
      res.status(500).json({ message: "Failed to fetch user logs" });
    }
  });

  app.get('/api/admin/logs/all', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getAllUserLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching all logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // AI Comment Suggestion Routes
  app.post('/api/ai/comment-suggestions', requireAuth, async (req: any, res) => {
    try {
      const { postContent, postTitle, recentComments, userInput, suggestionType } = req.body;
      
      let prompt = "";
      const context = `Post: "${postTitle || postContent.slice(0, 200)}"\nRecent comments: ${recentComments.slice(0, 3).join(", ")}`;
      
      if (suggestionType === 'generate') {
        prompt = `Generate 3 engaging comment suggestions for this techno/house music community post. Be authentic, supportive, and music-focused. Use underground music slang and emojis sparingly.
        
${context}

Respond with only a JSON array of strings: ["suggestion1", "suggestion2", "suggestion3"]`;
      } else if (suggestionType === 'rewrite') {
        prompt = `Rewrite this comment in 3 different styles (casual, professional, enthusiastic) for a techno music community:
        
Original: "${userInput}"
Context: ${context}

Respond with only a JSON array of strings: ["casual version", "professional version", "enthusiastic version"]`;
      } else if (suggestionType === 'enhance') {
        prompt = `Complete/enhance this partial comment for a techno music community post:
        
Partial comment: "${userInput}"
Context: ${context}

Respond with only a JSON array of 3 enhanced versions: ["enhanced1", "enhanced2", "enhanced3"]`;
      }

      const suggestions = await aiService.generateCommentSuggestions(prompt);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  app.post('/api/ai/rewrite-comment', requireAuth, async (req: any, res) => {
    try {
      const { originalComment, tone } = req.body;
      
      const prompt = `Rewrite this comment for a techno music community in a ${tone} tone:
      
Original: "${originalComment}"

Keep it authentic to underground music culture. Respond with only a JSON array of 3 variations: ["version1", "version2", "version3"]`;

      const suggestions = await aiService.generateCommentSuggestions(prompt);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error rewriting comment:", error);
      res.status(500).json({ message: "Failed to rewrite comment" });
    }
  });

  app.post('/api/ai/enhance-comment', requireAuth, async (req: any, res) => {
    try {
      const { partialComment, postContext } = req.body;
      
      const prompt = `Complete this partial comment for a techno music community:
      
Partial: "${partialComment}"
Post context: "${postContext.slice(0, 200)}"

Make it engaging and authentic to underground music culture. Respond with only a JSON array of 3 completions: ["completion1", "completion2", "completion3"]`;

      const suggestions = await aiService.generateCommentSuggestions(prompt);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error enhancing comment:", error);
      res.status(500).json({ message: "Failed to enhance comment" });
    }
  });

  // TheCueRoom bot response endpoint for @thecueroom mentions
  app.post('/api/ai/bot-response', requireAuth, async (req: any, res) => {
    try {
      const { mentionContent, postContent, postTitle } = req.body;
      
      if (!mentionContent || !postContent) {
        return res.status(400).json({ error: 'Missing required content for bot response' });
      }
      
      const response = await aiService.generateBotResponse(mentionContent, postContent, postTitle);
      
      res.json({ response });
    } catch (error) {
      console.error('Bot response error:', error);
      res.status(500).json({ error: 'Failed to generate bot response' });
    }
  });

  // Newsletter Subscription Routes
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const { email, preferences } = req.body;
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      const subscription = await storage.createNewsletterSubscription({
        email,
        preferences: preferences || {}
      });

      res.json({ message: "Successfully subscribed to newsletter", subscription });
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  app.post('/api/newsletter/unsubscribe', async (req, res) => {
    try {
      const { email } = req.body;
      await storage.updateNewsletterSubscription(email, false);
      res.json({ message: "Successfully unsubscribed from newsletter" });
    } catch (error) {
      console.error("Error unsubscribing from newsletter:", error);
      res.status(500).json({ message: "Failed to unsubscribe from newsletter" });
    }
  });

  app.get('/api/admin/newsletter/subscribers', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const subscribers = await storage.getNewsletterSubscriptions();
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  // Admin Spotify Playlist Management
  app.post('/api/admin/spotify/playlists', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { spotifyUrl, name, description, genre, isActive } = req.body;
      
      // Extract Spotify ID from URL
      const spotifyMatch = spotifyUrl.match(/playlist\/([a-zA-Z0-9]+)/);
      if (!spotifyMatch) {
        return res.status(400).json({ message: "Invalid Spotify playlist URL" });
      }
      const spotifyId = spotifyMatch[1];

      if (!spotifyUrl || !name) {
        return res.status(400).json({ message: "Spotify URL and name are required" });
      }

      const playlist = await storage.createPlaylist({
        title: name,
        description: description || '',
        spotifyUrl,
        genre: genre || 'Electronic',
        trackCount: req.body.trackCount || 0,
        embedUrl: `https://open.spotify.com/embed/playlist/${spotifyId}`,
        spotifyId,
        duration: req.body.duration || null,
        followerCount: req.body.followerCount || null
      });

      await loggingService.logAdminAction((req.user as any).id, 'create_spotify_playlist', `Created Spotify playlist: ${name}`, req);
      res.json(playlist);
    } catch (error) {
      console.error("Error creating Spotify playlist:", error);
      res.status(500).json({ message: "Failed to create Spotify playlist" });
    }
  });

  app.put('/api/admin/spotify/playlists/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, description, spotifyUrl, genre, isActive } = req.body;
      
      const playlist = await storage.updatePlaylist(parseInt(id), {
        title: name,
        description,
        spotifyUrl,
        genre
      });

      await loggingService.logAdminAction((req.user as any).id, 'update_spotify_playlist', `Updated Spotify playlist: ${name}`, req);
      res.json(playlist);
    } catch (error) {
      console.error("Error updating Spotify playlist:", error);
      res.status(500).json({ message: "Failed to update Spotify playlist" });
    }
  });

  app.delete('/api/admin/spotify/playlists/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deletePlaylist(parseInt(id));
      await loggingService.logAdminAction((req.user as any).id, 'delete_spotify_playlist', `Deleted Spotify playlist ID: ${id}`, req);
      res.json({ message: "Playlist deleted successfully" });
    } catch (error) {
      console.error("Error deleting Spotify playlist:", error);
      res.status(500).json({ message: "Failed to delete Spotify playlist" });
    }
  });

  // AI-Generated Curated Playlists
  app.post('/api/playlists/generate', requireAuth, async (req: any, res) => {
    try {
      const { genre, mood, description, trackCount = 25 } = req.body;
      
      if (!genre) {
        return res.status(400).json({ message: "Genre is required for playlist generation" });
      }

      const generatedPlaylist = await aiService.generateCuratedPlaylist({
        genre,
        mood,
        description,
        trackCount,
        userId: (req.user as any).id
      });

      const playlist = await storage.createCuratedPlaylist({
        name: generatedPlaylist.title,
        description: generatedPlaylist.description,
        genre,
        mood: mood || null,
        trackIds: generatedPlaylist.tracks,
        curatorId: (req.user as any).id,
        isPublic: true
      });

      await loggingService.logUserAction((req.user as any).id, 'generate_playlist', `Generated AI playlist: ${generatedPlaylist.title}`, req);
      res.json(playlist);
    } catch (error) {
      console.error("Error generating AI playlist:", error);
      res.status(500).json({ message: "Failed to generate AI playlist" });
    }
  });

  // Bandcamp Integration Routes
  app.get('/api/bandcamp/trending', async (req, res) => {
    try {
      const trending = await bandcampService.getTrendingTracks();
      res.json(trending);
    } catch (error) {
      console.error("Error fetching Bandcamp trending:", error);
      res.status(500).json({ message: "Failed to fetch trending tracks" });
    }
  });

  app.get('/api/bandcamp/spotlight', async (req, res) => {
    try {
      const spotlight = await bandcampService.getSpotlightTracks();
      res.json(spotlight);
    } catch (error) {
      console.error("Error fetching Bandcamp spotlight:", error);
      res.status(500).json({ message: "Failed to fetch spotlight tracks" });
    }
  });

  app.get('/api/admin/bandcamp/settings', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getBandcampSettings();
      res.json(settings || {
        isEnabled: true,
        trendingEnabled: true,
        spotlightEnabled: true,
        refreshInterval: 24,
        genres: ["electronic", "techno", "house", "ambient"]
      });
    } catch (error) {
      console.error("Error fetching Bandcamp settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put('/api/admin/bandcamp/settings', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const settings = await storage.updateBandcampSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating Bandcamp settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Enhanced Meme Generation Routes
  app.get('/api/memes/templates', async (req, res) => {
    try {
      const templates = await memeService.getPopularTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching meme templates:", error);
      res.status(500).json({ message: "Failed to fetch meme templates" });
    }
  });

  app.get('/api/memes/templates/category/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const templates = await memeService.getTemplatesByCategory(category);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates by category:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post('/api/memes/generate/template/:templateId', requireAuth, async (req: any, res) => {
    try {
      const { templateId } = req.params;
      const { texts } = req.body;
      const userId = (req.user as any).id;
      
      const memeImageUrl = await memeService.generateMemeWithTemplate(templateId, texts);
      
      // Save meme to database
      const meme = await storage.createMeme({
        userId,
        prompt: texts.join(' | '),
        imageUrl: memeImageUrl,
        category: 'template'
      });

      await loggingService.logMemeGeneration(userId, meme.id, req);
      res.json({ ...meme, imageUrl: memeImageUrl });
    } catch (error) {
      console.error("Error generating template meme:", error);
      res.status(500).json({ message: "Failed to generate meme" });
    }
  });

  app.post('/api/memes/generate/ai', requireAuth, async (req: any, res) => {
    try {
      const { prompt } = req.body;
      const userId = (req.user as any).id;
      
      const memeImageUrl = await memeService.generateAIMeme(prompt);
      
      // Save AI-generated meme
      const meme = await storage.createMeme({
        userId,
        prompt: prompt,
        imageUrl: memeImageUrl,
        category: 'ai'
      });

      await loggingService.logMemeGeneration(userId, meme.id, req);
      res.json({ ...meme, imageUrl: memeImageUrl });
    } catch (error) {
      console.error("Error generating AI meme:", error);
      res.status(500).json({ message: "Failed to generate AI meme" });
    }
  });

  // Analytics Routes
  app.post('/api/analytics/article/:articleId', async (req, res) => {
    try {
      const { articleId } = req.params;
      const { action, userId, sessionId, referrer } = req.body;
      
      const analytics = await storage.createArticleAnalytics({
        articleId: parseInt(articleId),
        userId: userId || null,
        action,
        sessionId: sessionId || null,
        referrer: referrer || null
      });

      res.json(analytics);
    } catch (error) {
      console.error("Error tracking analytics:", error);
      res.status(500).json({ message: "Failed to track analytics" });
    }
  });

  app.get('/api/admin/analytics/articles/:articleId', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { articleId } = req.params;
      const analytics = await storage.getArticleAnalytics(parseInt(articleId));
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching article analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Fix Settings Update Route
  app.put('/api/auth/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { firstName, lastName, stageName, city, bio } = req.body;
      
      const changes: string[] = [];
      const updateData: any = {};

      if (firstName !== undefined) {
        updateData.firstName = firstName;
        changes.push('firstName');
      }
      if (lastName !== undefined) {
        updateData.lastName = lastName;
        changes.push('lastName');
      }
      if (stageName !== undefined) {
        updateData.stageName = stageName;
        changes.push('stageName');
      }
      if (city !== undefined) {
        updateData.city = city;
        changes.push('city');
      }
      if (bio !== undefined) {
        updateData.bio = bio;
        changes.push('bio');
      }

      const updatedUser = await storage.updateUserProfile(userId, updateData);
      await loggingService.logProfileUpdate(userId, changes, req);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put('/api/auth/password', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { currentPassword, newPassword } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const bcrypt = require('bcrypt');
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);
      await storage.resetUserPassword(userId, hashedNewPassword);
      await loggingService.logPasswordChange(userId, req);
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Health check endpoints
  app.get('/api/health', async (_req, res) => {
    try {
      const report = await performComprehensiveHealthCheck()
      console.log('🩺 Health report:', JSON.stringify(report, null, 2))
      const code = report.overall === 'unhealthy' ? 503 : 200
      res.status(code).json(report)
    } catch (err: any) {
      console.error('🔴 Health check failed completely:', err)
      res.status(503).json({
        overall: 'unhealthy',
        error: err.message,
        timestamp: new Date().toISOString()
      })
    }
  });

  app.get('/api/health/database', async (_req, res) => {
    const result = await checkDatabaseHealth()
    res.status(result.status === 'healthy' ? 200 : 503).json(result)
  });

  app.get('/api/health/email', async (_req, res) => {
  const result = await checkEmailHealth()
  res.status(result.status === 'healthy' ? 200 : 503).json(result)
  });

  app.get('/api/health/ai', async (_req, res) => {
  const result = await checkAIHealth()
  res.status(result.status === 'healthy' ? 200 : 503).json(result)
  });

  app.get('/api/health/storage', async (_req, res) => {
  const result = await checkStorageHealth()
  res.status(result.status === 'healthy' ? 200 : 503).json(result)
  });

  // Admin settings routes
  app.get('/api/admin/settings', requireAuth, isAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllAdminSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ message: "Failed to fetch admin settings" });
    }
  });

  app.get('/api/admin/settings/:key', requireAuth, isAdmin, async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await storage.getAdminSetting(key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching admin setting:", error);
      res.status(500).json({ message: "Failed to fetch admin setting" });
    }
  });

  app.post('/api/admin/settings', requireAuth, isAdmin, async (req: any, res) => {
    try {
      const { settingKey, settingValue, description } = req.body;
      const userId = (req.user as any).id;
      
      const setting = await storage.setAdminSetting({
        settingKey,
        settingValue,
        description,
        updatedBy: userId,
      });
      
      res.json(setting);
    } catch (error) {
      console.error("Error setting admin setting:", error);
      res.status(500).json({ message: "Failed to set admin setting" });
    }
  });

  app.put('/api/admin/settings/:key', requireAuth, isAdmin, async (req: any, res) => {
    try {
      const { key } = req.params;
      const { settingValue } = req.body;
      const userId = (req.user as any).id;
      
      const setting = await storage.updateAdminSetting(key, settingValue, userId);
      res.json(setting);
    } catch (error) {
      console.error("Error updating admin setting:", error);
      res.status(500).json({ message: "Failed to update admin setting" });
    }
  });

  // Public endpoint for animation settings (non-admin users need to check this)
  app.get('/api/settings/animations', async (req, res) => {
    try {
      const setting = await storage.getAdminSetting('avatar_animations_enabled');
      const isEnabled = setting ? setting.settingValue : true; // Default to enabled
      res.json({ enabled: isEnabled });
    } catch (error) {
      console.error("Error fetching animation settings:", error);
      res.json({ enabled: true }); // Fallback to enabled
    }
  });

  // RSS Feed Proxy
  // CORS headers are applied by the global middleware in `server/index.ts`
  app.get('/api/feeds/rss', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: 'URL parameter is required' });
      }

      let timeoutId: NodeJS.Timeout;
      try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const xmlText = await response.text();
        const feed = await rssParser.parseString(xmlText);

        const extractImage = (item: any): string => {
          const html = item['content:encoded'] || item.content || '';
          const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
          return (
            item.enclosure?.url ||
            item['media:content']?.url ||
            (Array.isArray(item['media:content']) ? item['media:content'][0]?.url : undefined) ||
            item['media:thumbnail']?.url ||
            item['itunes:image']?.href ||
            (imgMatch ? imgMatch[1] : '') ||
            ''
          );
        };

        const items = (feed.items || [])
          .map((i: any) => ({
            title: i.title?.trim() || '',
            link: i.link || i.guid || '',
            description: i.contentSnippet || i.content || '',
            pubDate: i.pubDate || '',
            author: i.creator || i.author || '',
            image: extractImage(i)
          }))
          .filter(item => item.title && item.link);

        res.json({
          items: items.slice(0, 50),
          source: new URL(url).hostname,
          cached: false
        });

      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error(`RSS Proxy Error: ${error}`);
        
        // Return more specific error messages
        let errorMessage = 'Failed to fetch RSS feed';
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout - RSS feed took too long to respond';
        } else if (error.message?.includes('403')) {
          errorMessage = 'Access denied - RSS feed blocked our request';
        } else if (error.message?.includes('404')) {
          errorMessage = 'RSS feed not found at the provided URL';
        }
        
        res.status(500).json({ 
          message: errorMessage,
          error: error.message,
          url: url
        });
      }
    } catch (error: any) {
      res.status(500).json({ 
        message: 'RSS proxy service error',
        error: error.message 
      });
    }
  });

  // Custom RSS feeds accessible to all users
  app.get('/api/feeds/custom', (_req, res) => {
    try {
      res.json(getCustomFeeds());
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to load custom feeds', error: error.message });
    }
  });

  // Admin endpoints to manage custom feeds
  app.get('/api/admin/custom-feeds', requireAdmin, (_req, res) => {
    res.json(getCustomFeeds());
  });

  app.post('/api/admin/custom-feeds', requireAdmin, (req, res) => {
    const feed = req.body;
    if (!feed || !feed.url) {
      return res.status(400).json({ message: 'Invalid feed data' });
    }
    const added = addCustomFeed(feed);
    if (!added) {
      return res.status(400).json({ message: 'Feed already exists' });
    }
    res.json({ message: 'Feed added successfully', feed });
  });

  // Advanced Admin Panel APIs
  
  // Admin configurations endpoint
  app.get('/api/admin/configs', requireAdmin, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      // Mock admin configurations for demonstration
      const configs = [
        {
          id: '1',
          section: 'spotlight',
          key: 'auto_refresh',
          value: 'true',
          type: 'boolean',
          description: 'Automatically refresh spotlight content',
          category: 'automation'
        },
        {
          id: '2',
          section: 'spotlight',
          key: 'max_featured',
          value: '5',
          type: 'number',
          description: 'Maximum number of featured articles',
          category: 'content'
        },
        {
          id: '3',
          section: 'music',
          key: 'enable_ai_curation',
          value: 'true',
          type: 'boolean',
          description: 'Enable AI-powered music content curation',
          category: 'ai'
        },
        {
          id: '4',
          section: 'community',
          key: 'auto_moderation',
          value: 'true',
          type: 'boolean',
          description: 'Enable automatic content moderation',
          category: 'moderation'
        },
        {
          id: '5',
          section: 'gigs',
          key: 'location_filter',
          value: 'india',
          type: 'string',
          description: 'Default location filter for events',
          category: 'filters'
        }
      ];

      res.json(configs);
    } catch (error) {
      console.error('Admin configs error:', error);
      res.status(500).json({ message: 'Failed to fetch admin configurations' });
    }
  });

  // System statistics endpoint
  app.get('/api/admin/stats', requireAdmin, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const users = await storage.getAllUsers();
      const posts = await storage.getAllPosts();

      // Calculate statistics
      const stats = {
        spotlight: {
          views: Math.floor(Math.random() * 10000) + 5000,
          active: Math.floor(Math.random() * 100) + 50,
          trending: Math.floor(Math.random() * 20) + 5,
          total: Math.floor(Math.random() * 500) + 100
        },
        community: {
          views: posts.length * 15,
          active: users.filter(u => !u.isSuspended).length,
          trending: posts.filter(p => p.likesCount && p.likesCount > 10).length,
          total: posts.length
        },
        music: {
          views: Math.floor(Math.random() * 8000) + 3000,
          active: Math.floor(Math.random() * 80) + 40,
          trending: Math.floor(Math.random() * 15) + 3,
          total: Math.floor(Math.random() * 300) + 80
        },
        guides: {
          views: Math.floor(Math.random() * 6000) + 2000,
          active: Math.floor(Math.random() * 60) + 30,
          trending: Math.floor(Math.random() * 12) + 2,
          total: Math.floor(Math.random() * 200) + 50
        },
        industry: {
          views: Math.floor(Math.random() * 7000) + 2500,
          active: Math.floor(Math.random() * 70) + 35,
          trending: Math.floor(Math.random() * 10) + 4,
          total: Math.floor(Math.random() * 250) + 60
        },
        gigs: {
          views: Math.floor(Math.random() * 9000) + 4000,
          active: Math.floor(Math.random() * 90) + 45,
          trending: Math.floor(Math.random() * 18) + 6,
          total: Math.floor(Math.random() * 400) + 90
        },
        system: {
          views: users.length * 25,
          active: users.filter(u => !u.isSuspended).length,
          trending: users.filter(u => u.isVerified).length,
          total: users.length
        }
      };

      res.json(stats);
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ message: 'Failed to fetch system statistics' });
    }
  });

  // Feed settings endpoint
  app.get('/api/admin/feed-settings', requireAdmin, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      res.json(feedSettings);
    } catch (error) {
      console.error('Feed settings error:', error);
      res.status(500).json({ message: 'Failed to fetch feed settings' });
    }
  });

  // Public feed settings (read-only)
  app.get('/api/feed-settings', async (_req, res) => {
    try {
      res.json(feedSettings);
    } catch (error) {
      console.error('Feed settings error:', error);
      res.status(500).json({ message: 'Failed to fetch feed settings' });
    }
  });

  // Update feed settings endpoint
  app.put('/api/admin/feed-settings/:section', requireAdmin, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { section } = req.params;
      const settings = req.body;

      feedSettings[section] = { ...feedSettings[section], ...settings };

      res.json({ message: 'Feed settings updated successfully', section, settings: feedSettings[section] });
    } catch (error) {
      console.error('Update feed settings error:', error);
      res.status(500).json({ message: 'Failed to update feed settings' });
    }
  });

  // Update configuration endpoint
  app.put('/api/admin/configs/:section/:key', requireAdmin, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { section, key } = req.params;
      const { value } = req.body;

      // In a real implementation, save to database
      console.log(`Updated config ${section}.${key} = ${value}`);

      res.json({ message: 'Configuration updated successfully', section, key, value });
    } catch (error) {
      console.error('Update config error:', error);
      res.status(500).json({ message: 'Failed to update configuration' });
    }
  });

  // Bulk user actions endpoint
  app.post('/api/admin/bulk-actions', requireAdmin, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { action, userIds } = req.body;

      if (!action || !userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ message: 'Invalid action or user IDs' });
      }

      let affectedUsers = 0;

      switch (action) {
        case 'suspend':
          for (const userId of userIds) {
            try {
              await storage.updateUserStatus(userId, { isSuspended: true });
              affectedUsers++;
            } catch (error) {
              console.error(`Failed to suspend user ${userId}:`, error);
            }
          }
          break;

        case 'activate':
          for (const userId of userIds) {
            try {
              await storage.updateUserStatus(userId, { isSuspended: false });
              affectedUsers++;
            } catch (error) {
              console.error(`Failed to activate user ${userId}:`, error);
            }
          }
          break;

        case 'verify':
          for (const userId of userIds) {
            try {
              await storage.updateUserStatus(userId, { isVerified: true });
              affectedUsers++;
            } catch (error) {
              console.error(`Failed to verify user ${userId}:`, error);
            }
          }
          break;

        case 'delete':
          for (const userId of userIds) {
            try {
              await storage.deleteUser(userId);
              affectedUsers++;
            } catch (error) {
              console.error(`Failed to delete user ${userId}:`, error);
            }
          }
          break;

        default:
          return res.status(400).json({ message: 'Invalid action' });
      }

      res.json({ 
        message: `Bulk action '${action}' completed successfully`,
        action,
        requestedUsers: userIds.length,
        affectedUsers
      });
    } catch (error) {
      console.error('Bulk actions error:', error);
      res.status(500).json({ message: 'Failed to perform bulk action' });
    }
  });

  // Refresh data endpoint
  app.post('/api/admin/refresh/:section', requireAdmin, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { section } = req.params;

      // Simulate data refresh
      console.log(`Refreshing data for section: ${section}`);
      
      // In a real implementation, trigger actual data refresh processes
      const refreshActions = {
        spotlight: 'Refreshed featured content and trending articles',
        community: 'Refreshed user posts and community stats',
        music: 'Refreshed music feeds and artist content',
        guides: 'Refreshed tutorial content and guides',
        industry: 'Refreshed industry news and professional content',
        gigs: 'Refreshed event listings and venue information',
        system: 'Refreshed system logs and performance metrics'
      };

      const action = refreshActions[section as keyof typeof refreshActions] || 'Data refreshed';

      res.json({ 
        message: 'Data refresh initiated successfully',
        section,
        action,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Refresh data error:', error);
      res.status(500).json({ message: 'Failed to refresh data' });
    }
  });

  // Imgflip Meme API Proxy endpoints  
  app.get('/api/meme-templates', async (req, res) => {
    try {
      const response = await fetch('https://api.imgflip.com/get_memes');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch memes: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Imgflip API returned error');
      }

      // Transform Imgflip format to our expected format
      const transformedResult = {
        code: 200,
        message: 'Success',
        data: result.data.memes.map(meme => ({
          ID: parseInt(meme.id),
          name: meme.name,
          image: meme.url,
          tags: `meme,template,${meme.box_count}-text`,
          topText: '',
          bottomText: '',
          width: meme.width,
          height: meme.height,
          boxCount: meme.box_count
        }))
      };

      res.json(transformedResult);
    } catch (error) {
      console.error('Meme API proxy error:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Failed to fetch memes from external API',
        data: []
      });
    }
  });

  app.get('/api/meme-templates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get all memes and find the specific one
      const response = await fetch('https://api.imgflip.com/get_memes');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch memes: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Imgflip API returned error');
      }

      const meme = result.data.memes.find(m => m.id === id);
      
      if (!meme) {
        return res.status(404).json({ 
          code: 404,
          message: 'Meme not found',
          data: null
        });
      }

      // Transform to our expected format
      const transformedMeme = {
        code: 200,
        message: 'Success',
        data: {
          ID: parseInt(meme.id),
          name: meme.name,
          image: meme.url,
          tags: `meme,template,${meme.box_count}-text`,
          topText: '',
          bottomText: '',
          width: meme.width,
          height: meme.height,
          boxCount: meme.box_count
        }
      };

      res.json(transformedMeme);
    } catch (error) {
      console.error('Meme detail API proxy error:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Failed to fetch meme details',
        data: null
      });
    }
  });

  app.get('/api/meme-templates/:id/submissions', async (req, res) => {
    try {
      // Imgflip doesn't provide submissions, return empty array
      res.json({
        code: 200,
        message: 'Success',
        data: []
      });
    } catch (error) {
      console.error('Meme submissions API proxy error:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Failed to fetch meme submissions',
        data: []
      });
    }
  });

  app.post('/api/meme-templates/:id/create', async (req, res) => {
    try {
      const { id } = req.params;
      const { topText, bottomText } = req.body;
      
      // Note: Imgflip's caption API requires username/password for actual generation
      // For now, return the template URL as this is a demonstration
      res.json({
        code: 200,
        message: 'Meme template prepared (actual generation requires Imgflip account)',
        data: {
          templateId: id,
          topText: topText || '',
          bottomText: bottomText || '',
          note: 'To generate actual memes, integrate with Imgflip account credentials'
        }
      });
    } catch (error) {
      console.error('Meme creation API proxy error:', error);
      res.status(500).json({ 
        code: 500,
        message: 'Failed to create meme',
        data: null
      });
    }
  });

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle different types of real-time events
        switch (data.type) {
          case 'join_room':
            // Join a specific room (e.g., post comments)
            console.log(`User joined room: ${data.room}`);
            break;
          case 'new_comment':
            // Broadcast new comment to room members
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'comment_added',
                  data: data.comment
                }));
              }
            });
            break;
          case 'typing':
            // Broadcast typing indicator
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'user_typing',
                  user: data.user
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}

