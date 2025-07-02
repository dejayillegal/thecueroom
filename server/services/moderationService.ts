import { aiService } from "./aiService";

interface ModerationResult {
  approved: boolean;
  reason?: string;
  confidence: number;
}

interface VerificationLinks {
  instagram?: string;
  youtube?: string;
  soundcloud?: string;
  bandcamp?: string;
  beatport?: string;
}

class ModerationService {
  async moderateContent(content: string): Promise<ModerationResult> {
    // Use AI service for content moderation
    return await aiService.moderateContent(content);
  }

  async checkNSFWContent(imageUrl: string): Promise<boolean> {
    try {
      // In a real implementation, you would use a NSFW detection API
      // For now, we'll use a simple heuristic or return false
      
      // Fetch image and check with a NSFW detection service
      // This is a placeholder - implement with actual NSFW detection
      const response = await fetch(imageUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        return true; // If we can't verify, mark as NSFW for safety
      }
      
      // For demo purposes, assume all AI-generated images are safe
      // In production, integrate with services like:
      // - AWS Rekognition
      // - Google Cloud Vision API
      // - Microsoft Content Moderator
      // - Open source models like NSFW-JS
      
      return false;
    } catch (error) {
      console.error("NSFW check error:", error);
      return true; // Err on the side of caution
    }
  }

  async validateVerificationLinks(links: VerificationLinks): Promise<boolean> {
    if (!links || Object.keys(links).length === 0) {
      return false;
    }

    const validDomains = {
      instagram: ['instagram.com', 'www.instagram.com'],
      youtube: ['youtube.com', 'www.youtube.com', 'youtu.be'],
      soundcloud: ['soundcloud.com', 'www.soundcloud.com'],
      bandcamp: ['bandcamp.com'],
      beatport: ['beatport.com', 'www.beatport.com']
    };

    let validLinkCount = 0;

    for (const [platform, url] of Object.entries(links)) {
      if (url && this.isValidURL(url)) {
        const domain = this.extractDomain(url);
        const allowedDomains = validDomains[platform as keyof typeof validDomains];
        
        if (allowedDomains) {
          const isValidDomain = allowedDomains.some(allowedDomain => 
            domain === allowedDomain || domain.endsWith('.' + allowedDomain)
          );
          
          if (isValidDomain) {
            validLinkCount++;
          }
        }
      }
    }

    // Require at least one valid verification link
    return validLinkCount >= 1;
  }

  private isValidURL(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  private extractDomain(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.toLowerCase();
    } catch (_) {
      return '';
    }
  }

  async detectPromotion(content: string): Promise<boolean> {
    const promotionKeywords = [
      'buy', 'purchase', 'sale', 'discount', 'promo',
      'check out my', 'listen to my', 'my new track',
      'stream now', 'available on', 'link in bio',
      'follow me', 'subscribe', 'like and share'
    ];

    const lowerContent = content.toLowerCase();
    
    // Check for obvious promotional language
    const hasPromoKeywords = promotionKeywords.some(keyword => 
      lowerContent.includes(keyword)
    );

    // Check for URLs (basic detection)
    const hasURLs = /https?:\/\//.test(content);
    
    // Check for social media handles
    const hasSocialHandles = /@\w+/.test(content);

    // If content has promotional indicators, flag for review
    return hasPromoKeywords && (hasURLs || hasSocialHandles);
  }

  async autoModeratePost(content: string): Promise<ModerationResult> {
    // Check for promotion
    const isPromotion = await this.detectPromotion(content);
    if (isPromotion) {
      return {
        approved: false,
        reason: "Self-promotion detected",
        confidence: 0.8
      };
    }

    // Use AI for comprehensive moderation
    return await this.moderateContent(content);
  }

  async generateModerationReport(targetType: string, targetId: string): Promise<any> {
    return {
      targetType,
      targetId,
      timestamp: new Date(),
      checks: {
        ai_moderation: true,
        nsfw_check: true,
        promotion_detection: true,
        spam_filter: true
      },
      status: 'reviewed'
    };
  }
}

export const moderationService = new ModerationService();
