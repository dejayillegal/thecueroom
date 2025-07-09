import {
  users,
  posts,
  comments,
  postLikes,
  postReactions,
  memes,
  gigs,
  playlists,
  newsArticles,
  moderationLogs,
  userMusicProfiles,
  tracks,
  curatedPlaylists,
  platformIntegrations,
  userLogs,
  newsletterSubscriptions,
  articleAnalytics,
  bandcampSettings,
  supportTickets,
  adminSettings,
  type User,
  type UpsertUser,
  type Post,
  type PostWithUser,
  type InsertPost,
  type Comment,
  type CommentWithUser,
  type InsertComment,
  type PostReaction,
  type InsertPostReaction,
  type Meme,
  type MemeWithUser,
  type InsertMeme,
  type Gig,
  type InsertGig,
  type Playlist,
  type InsertPlaylist,
  type NewsArticle,
  type InsertNewsArticle,
  type ModerationLog,
  type MusicProfile,
  type MusicProfileWithUser,
  type InsertMusicProfile,
  type Track,
  type TrackWithUser,
  type InsertTrack,
  type CuratedPlaylist,
  type CuratedPlaylistWithUser,
  type InsertCuratedPlaylist,
  type PlatformIntegration,
  type InsertPlatformIntegration,
  type UserLog,
  type UserLogWithUser,
  type AdminSetting,
  type InsertAdminSetting,
  type InsertUserLog,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
  type ArticleAnalytics,
  type InsertArticleAnalytics,
  type BandcampSettings,
  type SupportTicket,
  type InsertSupportTicket,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, inArray, lt } from "drizzle-orm";

export interface IStorage {
  // User operations (custom auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserVerification(id: string, isVerified: boolean, links?: any): Promise<User>;
  updateUserSuspension(id: string, isSuspended: boolean): Promise<User>;
  verifyEmail(token: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  resetUserPassword(id: string, hashedPassword: string): Promise<User>;
  updateUserPassword(id: string, hashedPassword: string, forcePasswordChange?: boolean): Promise<User>;
  updateUserResetToken(id: string, token: string, expiry: Date): Promise<User>;
  verifyResetToken(token: string, email: string): Promise<User | undefined>;
  clearUserResetToken(id: string): Promise<User>;
  updateUserProfile(id: string, profileData: Partial<UpsertUser>): Promise<User>;
  updateUserStatus(id: string, status: { isSuspended?: boolean; isVerified?: boolean }): Promise<User>;
  getAllPosts(): Promise<PostWithUser[]>;

  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<PostWithUser | undefined>;
  getPosts(limit?: number, offset?: number): Promise<PostWithUser[]>;
  getPostsByTag(tag: string, limit?: number): Promise<PostWithUser[]>;
  deletePost(id: number): Promise<void>;
  togglePostLike(userId: string, postId: number): Promise<boolean>;
  updatePostModeration(id: number, isModerated: boolean): Promise<void>;

  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<CommentWithUser[]>;
  deleteComment(id: number): Promise<void>;

  // Meme operations
  createMeme(meme: InsertMeme): Promise<Meme>;
  getMemes(limit?: number, offset?: number): Promise<MemeWithUser[]>;
  getMemesByCategory(category: string, limit?: number): Promise<MemeWithUser[]>;
  deleteMeme(id: number): Promise<void>;
  toggleMemeLike(userId: string, memeId: number): Promise<boolean>;

  // News operations
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  getNewsArticles(limit?: number, offset?: number): Promise<NewsArticle[]>;
  getSpotlightNews(): Promise<NewsArticle[]>;
  updateSpotlightNews(ids: number[]): Promise<void>;
  deleteNewsArticle(id: number): Promise<void>;

  // Gig operations
  createGig(gig: InsertGig): Promise<Gig>;
  getGigs(limit?: number, offset?: number): Promise<Gig[]>;
  getActiveGigs(): Promise<Gig[]>;
  updateGig(id: number, gig: Partial<InsertGig>): Promise<Gig>;
  deleteGig(id: number): Promise<void>;

  // Playlist operations
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  getPlaylists(): Promise<Playlist[]>;
  getActivePlaylists(): Promise<Playlist[]>;
  updatePlaylist(id: number, playlist: Partial<InsertPlaylist>): Promise<Playlist>;
  deletePlaylist(id: number): Promise<void>;

  // Moderation operations
  createModerationLog(log: Omit<ModerationLog, 'id' | 'createdAt'>): Promise<ModerationLog>;
  getModerationLogs(limit?: number): Promise<ModerationLog[]>;

  // Music platform operations
  createMusicProfile(profile: InsertMusicProfile): Promise<MusicProfile>;
  getMusicProfiles(userId: string): Promise<MusicProfile[]>;
  updateMusicProfile(id: number, profile: Partial<InsertMusicProfile>): Promise<MusicProfile>;
  deleteMusicProfile(id: number): Promise<void>;

  // Track operations
  createTrack(track: InsertTrack): Promise<Track>;
  getTracks(limit?: number, offset?: number): Promise<TrackWithUser[]>;
  getTracksByUser(userId: string, limit?: number): Promise<TrackWithUser[]>;
  getTracksByGenre(genre: string, limit?: number): Promise<TrackWithUser[]>;
  updateTrack(id: number, track: Partial<InsertTrack>): Promise<Track>;
  deleteTrack(id: number): Promise<void>;
  toggleTrackLike(userId: string, trackId: number): Promise<boolean>;

  // Support ticket operations
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTickets(limit?: number, offset?: number): Promise<SupportTicket[]>;
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  updateSupportTicket(id: number, updates: Partial<InsertSupportTicket>): Promise<SupportTicket>;
  deleteSupportTicket(id: number): Promise<void>;
  getSupportTicketsByStatus(status: string): Promise<SupportTicket[]>;
  assignSupportTicket(id: number, assignedTo: string): Promise<SupportTicket>;

  // Playlist operations
  createCuratedPlaylist(playlist: InsertCuratedPlaylist): Promise<CuratedPlaylist>;
  getCuratedPlaylists(limit?: number, offset?: number): Promise<CuratedPlaylistWithUser[]>;
  getCuratedPlaylistsByGenre(genre: string, limit?: number): Promise<CuratedPlaylistWithUser[]>;
  updateCuratedPlaylist(id: number, playlist: Partial<InsertCuratedPlaylist>): Promise<CuratedPlaylist>;
  deleteCuratedPlaylist(id: number): Promise<void>;
  togglePlaylistLike(userId: string, playlistId: number): Promise<boolean>;

  // Platform integration operations
  createPlatformIntegration(integration: InsertPlatformIntegration): Promise<PlatformIntegration>;
  getPlatformIntegrations(userId: string): Promise<PlatformIntegration[]>;
  updatePlatformIntegration(id: number, integration: Partial<InsertPlatformIntegration>): Promise<PlatformIntegration>;
  deletePlatformIntegration(id: number): Promise<void>;

  // User logging operations
  createUserLog(log: InsertUserLog): Promise<UserLog>;
  getUserLogs(userId: string, limit?: number): Promise<UserLogWithUser[]>;
  getAllUserLogs(limit?: number): Promise<UserLogWithUser[]>;

  // Newsletter operations
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  updateNewsletterSubscription(email: string, isActive: boolean): Promise<NewsletterSubscription>;

  // Analytics operations
  createArticleAnalytics(analytics: InsertArticleAnalytics): Promise<ArticleAnalytics>;
  getArticleAnalytics(articleId: number): Promise<ArticleAnalytics[]>;
  getUserAnalytics(userId: string): Promise<ArticleAnalytics[]>;

  // Bandcamp settings operations
  getBandcampSettings(): Promise<BandcampSettings | undefined>;
  updateBandcampSettings(settings: Partial<BandcampSettings>): Promise<BandcampSettings>;

  // Content management operations
  getContentSettings(): Promise<any>;
  updateContentSettings(settings: any): Promise<any>;
  getStorageStats(): Promise<any>;
  cleanupContent(type: string, days?: number, force?: boolean): Promise<any>;

  // User stats operations
  getUserPostsCount(userId: string): Promise<number>;
  getUserCommentsCount(userId: string): Promise<number>;

  // Admin settings operations
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  getAllAdminSettings(): Promise<AdminSetting[]>;
  setAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting>;
  updateAdminSetting(key: string, value: any, updatedBy: string): Promise<AdminSetting>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async verifyEmail(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    if (!user) return undefined;

    const [updatedUser] = await db
      .update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return updatedUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          username: userData.username,
          bio: userData.bio,
          isVerified: userData.isVerified,
          isSuspended: userData.isSuspended,
          verificationLinks: userData.verificationLinks,
          avatarConfig: userData.avatarConfig,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async updateUserVerification(id: string, isVerified: boolean, links?: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        isVerified, 
        verificationLinks: links,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserSuspension(id: string, isSuspended: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        isSuspended,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async resetUserPassword(id: string, hashedPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: string, hashedPassword: string, forcePasswordChange: boolean = false): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        password: hashedPassword,
        forcePasswordChange: forcePasswordChange,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserResetToken(id: string, token: string, expiry: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        resetToken: token,
        resetTokenExpiry: expiry,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async verifyResetToken(token: string, email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.resetToken, token),
          sql`${users.resetTokenExpiry} > NOW()`
        )
      );
    return user;
  }

  async clearUserResetToken(id: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: string, profileData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStatus(id: string, status: { isSuspended?: boolean; isVerified?: boolean }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...status,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPost(id: number): Promise<PostWithUser | undefined> {
    const [post] = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id));
    
    if (!post) return undefined;
    
    return {
      ...post.posts,
      user: post.users!,
    };
  }

  async getPosts(limit = 20, offset = 0): Promise<PostWithUser[]> {
    const result = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.posts,
      user: row.users!,
    }));
  }

  async getPostsByTag(tag: string, limit = 20): Promise<PostWithUser[]> {
    const result = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(sql`${posts.tags} @> ${[tag]}`)
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row.posts,
      user: row.users!,
    }));
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async togglePostLike(userId: string, postId: number): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));

    if (existingLike.length > 0) {
      await db
        .delete(postLikes)
        .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));
      
      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} - 1` })
        .where(eq(posts.id, postId));
      
      return false;
    } else {
      await db.insert(postLikes).values({ userId, postId });
      
      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, postId));
      
      return true;
    }
  }

  async getAllPosts(): Promise<PostWithUser[]> {
    const result = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));

    return result.map(row => ({
      ...row.posts,
      user: row.users!,
    }));
  }

  async updatePostModeration(id: number, isModerated: boolean): Promise<void> {
    await db
      .update(posts)
      .set({ isModerated })
      .where(eq(posts.id, id));
  }

  // Reaction operations - upsert system for one reaction per user per post
  async upsertPostReaction(userId: string, postId: number, reactionType: string): Promise<PostReaction> {
    try {
      // First try to update existing reaction
      const [updated] = await db
        .update(postReactions)
        .set({ 
          reactionType, 
          updatedAt: new Date() 
        })
        .where(and(eq(postReactions.userId, userId), eq(postReactions.postId, postId)))
        .returning();

      if (updated) {
        return updated;
      }

      // If no existing reaction, insert new one
      const [inserted] = await db
        .insert(postReactions)
        .values({
          userId,
          postId,
          reactionType
        })
        .returning();

      return inserted;
    } catch (error) {
      // Handle unique constraint violation by falling back to update
      const [updated] = await db
        .update(postReactions)
        .set({ 
          reactionType, 
          updatedAt: new Date() 
        })
        .where(and(eq(postReactions.userId, userId), eq(postReactions.postId, postId)))
        .returning();
      
      if (!updated) {
        throw new Error('Failed to upsert reaction');
      }
      
      return updated;
    }
  }

  async getPostReactions(postId: number): Promise<Record<string, number>> {
    try {
      const result = await db
        .select({
          reactionType: postReactions.reactionType,
          count: sql<number>`count(*)::int`
        })
        .from(postReactions)
        .where(eq(postReactions.postId, postId))
        .groupBy(postReactions.reactionType);

      const reactions: Record<string, number> = {
        heart: 0,
        like: 0,
        dislike: 0,
        laugh: 0,
        smile: 0,
        surprise: 0,
        explode: 0
      };

      result.forEach(row => {
        reactions[row.reactionType] = row.count;
      });

      return reactions;
    } catch (error) {
      console.error('Error in getPostReactions:', error);
      // Return default empty reactions if query fails
      return {
        heart: 0,
        like: 0,
        dislike: 0,
        laugh: 0,
        smile: 0,
        surprise: 0,
        explode: 0
      };
    }
  }

  async getUserPostReaction(userId: string, postId: number): Promise<PostReaction | null> {
    const [reaction] = await db
      .select()
      .from(postReactions)
      .where(and(eq(postReactions.userId, userId), eq(postReactions.postId, postId)));

    return reaction || null;
  }

  async deletePostReaction(userId: string, postId: number): Promise<void> {
    await db
      .delete(postReactions)
      .where(and(eq(postReactions.userId, userId), eq(postReactions.postId, postId)));
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    // Update comments count
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, comment.postId));
    
    return newComment;
  }

  async getCommentsByPost(postId: number): Promise<CommentWithUser[]> {
    const result = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    return result.map(row => ({
      ...row.comments,
      user: row.users!,
    }));
  }

  async deleteComment(id: number): Promise<void> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    if (comment) {
      await db.delete(comments).where(eq(comments.id, id));
      
      // Update comments count
      await db
        .update(posts)
        .set({ commentsCount: sql`${posts.commentsCount} - 1` })
        .where(eq(posts.id, comment.postId));
    }
  }

  // Meme operations
  async createMeme(meme: InsertMeme): Promise<Meme> {
    const [newMeme] = await db.insert(memes).values(meme).returning();
    return newMeme;
  }

  async getMemes(limit = 20, offset = 0): Promise<MemeWithUser[]> {
    const result = await db
      .select()
      .from(memes)
      .leftJoin(users, eq(memes.userId, users.id))
      .where(eq(memes.isNSFW, false))
      .orderBy(desc(memes.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.memes,
      user: row.users!,
    }));
  }

  async getMemesByCategory(category: string, limit = 20): Promise<MemeWithUser[]> {
    const result = await db
      .select()
      .from(memes)
      .leftJoin(users, eq(memes.userId, users.id))
      .where(and(eq(memes.category, category), eq(memes.isNSFW, false)))
      .orderBy(desc(memes.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row.memes,
      user: row.users!,
    }));
  }

  async deleteMeme(id: number): Promise<void> {
    await db.delete(memes).where(eq(memes.id, id));
  }

  async toggleMemeLike(userId: string, memeId: number): Promise<boolean> {
    // Similar to post likes but for memes
    const likesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(memes)
      .where(eq(memes.id, memeId));

    await db
      .update(memes)
      .set({ likesCount: sql`${memes.likesCount} + 1` })
      .where(eq(memes.id, memeId));

    return true;
  }

  // News operations
  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [newArticle] = await db.insert(newsArticles).values(article).returning();
    return newArticle;
  }

  async getNewsArticles(limit = 20, offset = 0): Promise<NewsArticle[]> {
    return await db
      .select()
      .from(newsArticles)
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async getSpotlightNews(): Promise<NewsArticle[]> {
    return await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.isSpotlight, true))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(5);
  }

  async updateSpotlightNews(ids: number[]): Promise<void> {
    // First, remove all spotlight flags
    await db
      .update(newsArticles)
      .set({ isSpotlight: false });

    // Then set spotlight for selected articles
    if (ids.length > 0) {
      await db
        .update(newsArticles)
        .set({ isSpotlight: true })
        .where(inArray(newsArticles.id, ids));
    }
  }

  async deleteNewsArticle(id: number): Promise<void> {
    await db.delete(newsArticles).where(eq(newsArticles.id, id));
  }

  // Gig operations
  async createGig(gig: InsertGig): Promise<Gig> {
    const [newGig] = await db.insert(gigs).values(gig).returning();
    return newGig;
  }

  async getGigs(limit = 20, offset = 0): Promise<Gig[]> {
    return await db
      .select()
      .from(gigs)
      .orderBy(desc(gigs.date))
      .limit(limit)
      .offset(offset);
  }

  async getActiveGigs(): Promise<Gig[]> {
    return await db
      .select()
      .from(gigs)
      .where(and(eq(gigs.isActive, true), sql`${gigs.date} >= NOW()`))
      .orderBy(gigs.date);
  }

  async updateGig(id: number, gigData: Partial<InsertGig>): Promise<Gig> {
    const [updatedGig] = await db
      .update(gigs)
      .set(gigData)
      .where(eq(gigs.id, id))
      .returning();
    return updatedGig;
  }

  async deleteGig(id: number): Promise<void> {
    await db.delete(gigs).where(eq(gigs.id, id));
  }

  // Playlist operations
  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const [newPlaylist] = await db.insert(playlists).values(playlist).returning();
    return newPlaylist;
  }

  async getPlaylists(): Promise<Playlist[]> {
    return await db
      .select()
      .from(playlists)
      .orderBy(desc(playlists.createdAt));
  }

  async getActivePlaylists(): Promise<Playlist[]> {
    return await db
      .select()
      .from(playlists)
      .where(eq(playlists.isActive, true))
      .orderBy(desc(playlists.createdAt));
  }

  async updatePlaylist(id: number, playlistData: Partial<InsertPlaylist>): Promise<Playlist> {
    const [updatedPlaylist] = await db
      .update(playlists)
      .set(playlistData)
      .where(eq(playlists.id, id))
      .returning();
    return updatedPlaylist;
  }

  async deletePlaylist(id: number): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  // Support ticket operations
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db.insert(supportTickets).values(ticket).returning();
    return newTicket;
  }

  async getSupportTickets(limit: number = 50, offset: number = 0): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket;
  }

  async updateSupportTicket(id: number, updates: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  async deleteSupportTicket(id: number): Promise<void> {
    await db.delete(supportTickets).where(eq(supportTickets.id, id));
  }

  async getSupportTicketsByStatus(status: string): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.status, status))
      .orderBy(desc(supportTickets.createdAt));
  }

  async assignSupportTicket(id: number, assignedTo: string): Promise<SupportTicket> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ assignedTo, status: 'in_progress', updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  // Moderation operations
  async createModerationLog(logData: Omit<ModerationLog, 'id' | 'createdAt'>): Promise<ModerationLog> {
    const [log] = await db.insert(moderationLogs).values(logData).returning();
    return log;
  }

  async getModerationLogs(limit = 50): Promise<ModerationLog[]> {
    return await db
      .select()
      .from(moderationLogs)
      .orderBy(desc(moderationLogs.createdAt))
      .limit(limit);
  }

  // Music platform operations
  async createMusicProfile(profile: InsertMusicProfile): Promise<MusicProfile> {
    const [newProfile] = await db.insert(userMusicProfiles).values(profile).returning();
    return newProfile;
  }

  async getMusicProfiles(userId: string): Promise<MusicProfile[]> {
    return await db
      .select()
      .from(userMusicProfiles)
      .where(eq(userMusicProfiles.userId, userId))
      .orderBy(desc(userMusicProfiles.createdAt));
  }

  async updateMusicProfile(id: number, profile: Partial<InsertMusicProfile>): Promise<MusicProfile> {
    const [updatedProfile] = await db
      .update(userMusicProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(userMusicProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  async deleteMusicProfile(id: number): Promise<void> {
    await db.delete(userMusicProfiles).where(eq(userMusicProfiles.id, id));
  }

  // Track operations
  async createTrack(track: InsertTrack): Promise<Track> {
    const [newTrack] = await db.insert(tracks).values(track).returning();
    return newTrack;
  }

  async getTracks(limit = 20, offset = 0): Promise<TrackWithUser[]> {
    const result = await db
      .select()
      .from(tracks)
      .leftJoin(users, eq(tracks.userId, users.id))
      .where(eq(tracks.isPublic, true))
      .orderBy(desc(tracks.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.tracks,
      user: row.users!,
    }));
  }

  async getTracksByUser(userId: string, limit = 20): Promise<TrackWithUser[]> {
    const result = await db
      .select()
      .from(tracks)
      .leftJoin(users, eq(tracks.userId, users.id))
      .where(eq(tracks.userId, userId))
      .orderBy(desc(tracks.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row.tracks,
      user: row.users!,
    }));
  }

  async getTracksByGenre(genre: string, limit = 20): Promise<TrackWithUser[]> {
    const result = await db
      .select()
      .from(tracks)
      .leftJoin(users, eq(tracks.userId, users.id))
      .where(and(eq(tracks.genre, genre), eq(tracks.isPublic, true)))
      .orderBy(desc(tracks.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row.tracks,
      user: row.users!,
    }));
  }

  async updateTrack(id: number, track: Partial<InsertTrack>): Promise<Track> {
    const [updatedTrack] = await db
      .update(tracks)
      .set({ ...track, updatedAt: new Date() })
      .where(eq(tracks.id, id))
      .returning();
    return updatedTrack;
  }

  async deleteTrack(id: number): Promise<void> {
    await db.delete(tracks).where(eq(tracks.id, id));
  }

  async toggleTrackLike(userId: string, trackId: number): Promise<boolean> {
    await db
      .update(tracks)
      .set({ likesCount: sql`${tracks.likesCount} + 1` })
      .where(eq(tracks.id, trackId));
    return true;
  }

  // Curated playlist operations
  async createCuratedPlaylist(playlist: InsertCuratedPlaylist): Promise<CuratedPlaylist> {
    const [newPlaylist] = await db.insert(curatedPlaylists).values(playlist).returning();
    return newPlaylist;
  }

  async getCuratedPlaylists(limit = 20, offset = 0): Promise<CuratedPlaylistWithUser[]> {
    const result = await db
      .select()
      .from(curatedPlaylists)
      .leftJoin(users, eq(curatedPlaylists.curatorId, users.id))
      .where(eq(curatedPlaylists.isPublic, true))
      .orderBy(desc(curatedPlaylists.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.curated_playlists,
      curator: row.users!,
    }));
  }

  async getCuratedPlaylistsByGenre(genre: string, limit = 20): Promise<CuratedPlaylistWithUser[]> {
    const result = await db
      .select()
      .from(curatedPlaylists)
      .leftJoin(users, eq(curatedPlaylists.curatorId, users.id))
      .where(and(eq(curatedPlaylists.genre, genre), eq(curatedPlaylists.isPublic, true)))
      .orderBy(desc(curatedPlaylists.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row.curated_playlists,
      curator: row.users!,
    }));
  }

  async updateCuratedPlaylist(id: number, playlist: Partial<InsertCuratedPlaylist>): Promise<CuratedPlaylist> {
    const [updatedPlaylist] = await db
      .update(curatedPlaylists)
      .set({ ...playlist, updatedAt: new Date() })
      .where(eq(curatedPlaylists.id, id))
      .returning();
    return updatedPlaylist;
  }

  async deleteCuratedPlaylist(id: number): Promise<void> {
    await db.delete(curatedPlaylists).where(eq(curatedPlaylists.id, id));
  }

  async togglePlaylistLike(userId: string, playlistId: number): Promise<boolean> {
    await db
      .update(curatedPlaylists)
      .set({ likesCount: sql`${curatedPlaylists.likesCount} + 1` })
      .where(eq(curatedPlaylists.id, playlistId));
    return true;
  }

  // Platform integration operations
  async createPlatformIntegration(integration: InsertPlatformIntegration): Promise<PlatformIntegration> {
    const [newIntegration] = await db.insert(platformIntegrations).values(integration).returning();
    return newIntegration;
  }

  async getPlatformIntegrations(userId: string): Promise<PlatformIntegration[]> {
    return await db
      .select()
      .from(platformIntegrations)
      .where(and(eq(platformIntegrations.userId, userId), eq(platformIntegrations.isActive, true)))
      .orderBy(desc(platformIntegrations.createdAt));
  }

  async updatePlatformIntegration(id: number, integration: Partial<InsertPlatformIntegration>): Promise<PlatformIntegration> {
    const [updatedIntegration] = await db
      .update(platformIntegrations)
      .set({ ...integration, updatedAt: new Date() })
      .where(eq(platformIntegrations.id, id))
      .returning();
    return updatedIntegration;
  }

  async deletePlatformIntegration(id: number): Promise<void> {
    await db.delete(platformIntegrations).where(eq(platformIntegrations.id, id));
  }

  // User logging operations
  async createUserLog(logData: InsertUserLog): Promise<UserLog> {
    const [log] = await db.insert(userLogs).values(logData).returning();
    return log;
  }

  async getUserLogs(userId: string, limit = 50): Promise<UserLogWithUser[]> {
    const result = await db
      .select()
      .from(userLogs)
      .leftJoin(users, eq(userLogs.userId, users.id))
      .where(eq(userLogs.userId, userId))
      .orderBy(desc(userLogs.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row.user_logs,
      user: row.users!,
    }));
  }

  async getAllUserLogs(limit = 100): Promise<UserLogWithUser[]> {
    const result = await db
      .select()
      .from(userLogs)
      .leftJoin(users, eq(userLogs.userId, users.id))
      .orderBy(desc(userLogs.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row.user_logs,
      user: row.users!,
    }));
  }

  // Newsletter operations
  async createNewsletterSubscription(subscriptionData: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [subscription] = await db.insert(newsletterSubscriptions).values(subscriptionData).returning();
    return subscription;
  }

  async getNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.isActive, true));
  }

  async updateNewsletterSubscription(email: string, isActive: boolean): Promise<NewsletterSubscription> {
    const [updated] = await db
      .update(newsletterSubscriptions)
      .set({ isActive, unsubscribedAt: isActive ? null : new Date() })
      .where(eq(newsletterSubscriptions.email, email))
      .returning();
    return updated;
  }

  // Analytics operations
  async createArticleAnalytics(analyticsData: InsertArticleAnalytics): Promise<ArticleAnalytics> {
    const [analytics] = await db.insert(articleAnalytics).values(analyticsData).returning();
    return analytics;
  }

  async getArticleAnalytics(articleId: number): Promise<ArticleAnalytics[]> {
    return await db
      .select()
      .from(articleAnalytics)
      .where(eq(articleAnalytics.articleId, articleId))
      .orderBy(desc(articleAnalytics.createdAt));
  }

  async getUserAnalytics(userId: string): Promise<ArticleAnalytics[]> {
    return await db
      .select()
      .from(articleAnalytics)
      .where(eq(articleAnalytics.userId, userId))
      .orderBy(desc(articleAnalytics.createdAt));
  }

  // Bandcamp settings operations
  async getBandcampSettings(): Promise<BandcampSettings | undefined> {
    const [settings] = await db.select().from(bandcampSettings).limit(1);
    return settings;
  }

  async updateBandcampSettings(settingsData: Partial<BandcampSettings>): Promise<BandcampSettings> {
    const existing = await this.getBandcampSettings();
    
    if (existing) {
      const [updated] = await db
        .update(bandcampSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(bandcampSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(bandcampSettings)
        .values({ ...settingsData, updatedAt: new Date() })
        .returning();
      return created;
    }
  }

  // Content management operations
  async getContentSettings(): Promise<any> {
    try {
      return {
        autoDeleteEnabled: false,
        newsRetentionDays: 30,
        postsRetentionDays: 90,
        memesRetentionDays: 60,
        imagesRetentionDays: 120,
        lastCleanup: null,
        storageThresholdMB: 1000,
        autoCleanupEnabled: false
      };
    } catch (error) {
      console.error('Error getting content settings:', error);
      throw error;
    }
  }

  async updateContentSettings(settings: any): Promise<any> {
    try {
      return {
        ...settings,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating content settings:', error);
      throw error;
    }
  }

  async getStorageStats(): Promise<any> {
    try {
      const [newsCount] = await db.select({ count: sql`count(*)` }).from(newsArticles);
      const [postsCount] = await db.select({ count: sql`count(*)` }).from(posts);
      const [memesCount] = await db.select({ count: sql`count(*)` }).from(memes);
      
      const totalUsed = (newsCount.count * 0.5) + (postsCount.count * 0.1) + (memesCount.count * 2);
      
      return {
        totalUsed: Math.round(totalUsed),
        newsCount: newsCount.count,
        postsCount: postsCount.count,
        memesCount: memesCount.count,
        imagesCount: 0,
        oldestContent: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  async cleanupContent(type: string, days?: number, force?: boolean): Promise<any> {
    try {
      let deleted = 0;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (days || 30));

      if (type === 'news' || type === 'all') {
        const result = await db
          .delete(newsArticles)
          .where(lt(newsArticles.publishedAt, cutoffDate));
        deleted += result.rowCount || 0;
      }

      if (type === 'posts' || type === 'all') {
        const result = await db
          .delete(posts)
          .where(lt(posts.createdAt, cutoffDate));
        deleted += result.rowCount || 0;
      }

      if (type === 'memes' || type === 'all') {
        const result = await db
          .delete(memes)
          .where(lt(memes.createdAt, cutoffDate));
        deleted += result.rowCount || 0;
      }

      const freedMB = deleted * 0.5;

      return {
        deleted,
        freedMB: Math.round(freedMB),
        type,
        cutoffDate: cutoffDate.toISOString()
      };
    } catch (error) {
      console.error('Error cleaning up content:', error);
      throw error;
    }
  }

  // Admin settings operations
  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    const [setting] = await db.select().from(adminSettings).where(eq(adminSettings.settingKey, key));
    return setting;
  }

  async getAllAdminSettings(): Promise<AdminSetting[]> {
    return await db.select().from(adminSettings).orderBy(adminSettings.settingKey);
  }

  async setAdminSetting(settingData: InsertAdminSetting): Promise<AdminSetting> {
    const [setting] = await db
      .insert(adminSettings)
      .values(settingData)
      .onConflictDoUpdate({
        target: adminSettings.settingKey,
        set: {
          settingValue: settingData.settingValue,
          updatedBy: settingData.updatedBy,
          updatedAt: new Date(),
        },
      })
      .returning();
    return setting;
  }

  // User stats operations
  async getUserPostsCount(userId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(posts)
        .where(eq(posts.userId, userId));
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting user posts count:', error);
      return 0;
    }
  }

  async getUserCommentsCount(userId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(comments)
        .where(eq(comments.userId, userId));
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting user comments count:', error);
      return 0;
    }
  }

  async updateAdminSetting(key: string, value: any, updatedBy: string): Promise<AdminSetting> {
    const [setting] = await db
      .update(adminSettings)
      .set({
        settingValue: value,
        updatedBy: updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(adminSettings.settingKey, key))
      .returning();
    return setting;
  }
}

export const storage = new DatabaseStorage();
