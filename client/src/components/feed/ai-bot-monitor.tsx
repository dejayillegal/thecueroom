/**
 * TheCueRoom AI Bot - Real-time Content Monitoring
 * Monitors posts and comments for ToS violations with humorous responses
 */
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ContentModerationResult {
  isViolation: boolean;
  violationType: string;
  botResponse: string;
  shouldRemove: boolean;
}

export const useAIBotMonitor = () => {
  const queryClient = useQueryClient();

  const moderationMutation = useMutation({
    mutationFn: async ({ content, type, postId }: { content: string; type: 'post' | 'comment'; postId: number }) => {
      return apiRequest('/api/ai-bot/moderate', {
        method: 'POST',
        body: { content, type, postId }
      });
    },
    onSuccess: (data: ContentModerationResult, variables) => {
      if (data.isViolation && data.shouldRemove) {
        // Auto-remove content and add bot comment
        queryClient.invalidateQueries({ queryKey: [`post-${variables.postId}-comments`] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    }
  });

  const moderateContent = (content: string, type: 'post' | 'comment', postId: number) => {
    // Real-time content analysis
    const violations = detectViolations(content);
    
    if (violations.length > 0) {
      // Submit to backend for processing
      moderationMutation.mutate({ content, type, postId });
    }
  };

  return { moderateContent };
};

// Client-side violation detection for immediate feedback
const detectViolations = (content: string): string[] => {
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
};

// Bot response generator with humor
export const generateBotResponse = (violationType: string): string => {
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
};