/**
 * TheCueRoom Bot - Real-time Content Monitoring System
 * Automatically detects and masks contact information and inappropriate content
 */

// Contact information patterns
const CONTACT_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+91|91)?[\s-]?[6-9]\d{9}|\b\d{10}\b|[\+]?[1-9]{1}[0-9]{1,2}[\s-]?\([0-9]{1,4}\)[\s-]?[0-9]{1,4}[\s-]?[0-9]{1,9}/g,
  whatsapp: /\b(whatsapp|wa\.me|chat\.whatsapp)\b/gi,
  telegram: /\b(telegram|t\.me|@[A-Za-z0-9_]+)\b/gi,
  instagram: /\b(instagram|insta|ig|@[A-Za-z0-9_.]+)\b/gi,
  discord: /\b(discord|discord\.gg)\b/gi,
  website: /\b(www\.|https?:\/\/)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  socialHandle: /@[A-Za-z0-9_.]+/g
};

// Inappropriate content keywords
const FLAGGED_KEYWORDS = [
  'contact me', 'dm me', 'call me', 'text me', 'reach out',
  'my number', 'my email', 'my ig', 'my insta',
  'book me', 'hire me', 'collaboration outside',
  'meet offline', 'personal chat', 'private message'
];

export interface ModerationResult {
  originalContent: string;
  maskedContent: string;
  hasViolations: boolean;
  violations: string[];
  severity: 'low' | 'medium' | 'high';
  botResponse?: string;
}

export class ContentMonitor {
  static moderateContent(content: string): ModerationResult {
    let maskedContent = content;
    const violations: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';

    // Mask contact information
    Object.entries(CONTACT_PATTERNS).forEach(([type, pattern]) => {
      if (pattern.test(content)) {
        violations.push(`${type} detected`);
        maskedContent = maskedContent.replace(pattern, (match) => '*'.repeat(match.length));
        severity = type === 'email' || type === 'phone' ? 'high' : 'medium';
      }
    });

    // Check for flagged keywords
    FLAGGED_KEYWORDS.forEach(keyword => {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        violations.push(`inappropriate keyword: ${keyword}`);
        severity = 'medium';
      }
    });

    const hasViolations = violations.length > 0;
    let botResponse: string | undefined;

    if (hasViolations) {
      if (severity === 'high') {
        botResponse = "🤖 Contact information has been automatically masked to protect privacy. Please use TheCueRoom's messaging system for connections.";
      } else if (severity === 'medium') {
        botResponse = "🤖 Reminder: Keep all communications within TheCueRoom platform. Let's maintain our underground community safe and focused on music!";
      }
    }

    return {
      originalContent: content,
      maskedContent,
      hasViolations,
      violations,
      severity,
      botResponse
    };
  }

  static generateBotResponse(postContent: string, userStage: string): string {
    const responses = [
      `🎵 ${userStage}, that's some serious underground vibes! Keep pushing those boundaries in the scene.`,
      `🔥 Love the energy in this post! The underground techno community needs more artists like you, ${userStage}.`,
      `⚡ This post is giving me those warehouse party feels. Keep the underground spirit alive, ${userStage}!`,
      `🎧 ${userStage}, your passion for the underground scene really shows. Keep creating and inspiring the community!`,
      `🌟 The dedication to the craft is real with this one. ${userStage}, you're contributing to something special here.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  static shouldTriggerBotResponse(content: string): boolean {
    const triggerWords = [
      'feedback', 'help', 'advice', 'thoughts', 'opinion',
      'new track', 'finished', 'working on', 'production',
      'gig', 'event', 'party', 'underground', 'techno', 'house'
    ];
    
    return triggerWords.some(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );
  }
}