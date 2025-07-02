import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface ModerationResult {
  approved: boolean;
  confidence: number;
  violations: string[];
  suggestion?: string;
  moderatedContent?: string;
  requiresHumanReview: boolean;
}

export interface BotResponse {
  shouldRespond: boolean;
  response?: string;
  context: string;
  confidence: number;
}

export class AIModerationService {
  // Comprehensive content moderation using AI
  static async moderateContent(content: string, context?: string): Promise<ModerationResult> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a content moderator for TheCueRoom, an underground techno and house music community in India. 

COMMUNITY GUIDELINES:
- Allow creative expression and underground music culture discussion
- Block spam, harassment, hate speech, and off-topic content
- Encourage music discussions, event promotion, artist collaboration
- Flag inappropriate sexual content, violence, or harmful substances
- Support artist verification and genuine music industry networking

MODERATION RESPONSE FORMAT:
{
  "approved": boolean,
  "confidence": 0.0-1.0,
  "violations": ["category1", "category2"],
  "suggestion": "helpful suggestion for improvement",
  "moderatedContent": "cleaned version if minor violations",
  "requiresHumanReview": boolean
}

Analyze content and respond with JSON only.`
          },
          {
            role: "user",
            content: `Content: "${content}"\nContext: ${context || "Community post"}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        approved: result.approved ?? true,
        confidence: result.confidence ?? 0.8,
        violations: result.violations ?? [],
        suggestion: result.suggestion,
        moderatedContent: result.moderatedContent,
        requiresHumanReview: result.requiresHumanReview ?? false
      };
    } catch (error) {
      console.error("AI moderation error:", error);
      // Default to approved with low confidence on AI errors
      return {
        approved: true,
        confidence: 0.5,
        violations: [],
        requiresHumanReview: true
      };
    }
  }

  // Enhanced @thecueroom bot responses with AI analysis
  static async generateBotResponse(
    mentionContent: string, 
    postContent: string, 
    userContext?: any
  ): Promise<BotResponse> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are TheCueRoom Bot, an AI assistant for India's underground techno and house music community.

PERSONALITY:
- Knowledgeable about electronic music, especially techno and house
- Supportive of underground artists and DJs
- Enthusiastic about music production, events, and collaboration
- Professional but with underground music culture awareness
- Helpful with music industry advice and community building

CAPABILITIES:
- Analyze music content and provide insights
- Offer advice on music production, gigs, and industry networking
- Suggest collaborations and events
- Provide feedback on tracks and artistic direction
- Help with community guidelines and platform features

RESPONSE FORMAT:
{
  "shouldRespond": boolean,
  "response": "your response text",
  "context": "reason for response",
  "confidence": 0.0-1.0
}

Only respond when:
1. Directly mentioned with @thecueroom
2. Asked for music analysis or advice
3. Questions about community features
4. Requests for event or collaboration suggestions

Keep responses concise, helpful, and music-focused. Respond with JSON only.`
          },
          {
            role: "user",
            content: `Mention: "${mentionContent}"\nOriginal Post: "${postContent}"\nUser: ${userContext?.stageName || "Community member"}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        shouldRespond: result.shouldRespond ?? false,
        response: result.response,
        context: result.context ?? "AI analysis",
        confidence: result.confidence ?? 0.8
      };
    } catch (error) {
      console.error("Bot response error:", error);
      return {
        shouldRespond: false,
        response: undefined,
        context: "error",
        confidence: 0.0
      };
    }
  }

  // Real-time content analysis for community insights
  static async analyzeContent(content: string): Promise<{
    topics: string[];
    sentiment: number;
    musicGenres: string[];
    suggestions: string[];
  }> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze content for TheCueRoom community. Extract:
            
ANALYSIS FORMAT:
{
  "topics": ["topic1", "topic2"],
  "sentiment": -1.0 to 1.0,
  "musicGenres": ["techno", "house", "minimal"],
  "suggestions": ["actionable suggestion1", "suggestion2"]
}

Focus on music production, events, collaboration opportunities, and community building. Respond with JSON only.`
          },
          {
            role: "user",
            content: content
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        topics: result.topics ?? [],
        sentiment: result.sentiment ?? 0,
        musicGenres: result.musicGenres ?? [],
        suggestions: result.suggestions ?? []
      };
    } catch (error) {
      console.error("Content analysis error:", error);
      return {
        topics: [],
        sentiment: 0,
        musicGenres: [],
        suggestions: []
      };
    }
  }

  // Smart mention detection and response triggers
  static shouldTriggerBotResponse(content: string): boolean {
    const botTriggers = [
      /@thecueroom/i,
      /what.*(think|opinion|advice)/i,
      /help.*(production|mixing|mastering)/i,
      /(analyze|feedback|review).*(track|mix|set)/i,
      /recommend.*(event|gig|collaboration)/i,
      /(music|techno|house).*(question|help)/i
    ];

    return botTriggers.some(trigger => trigger.test(content));
  }

  // Generate contextual community responses
  static generateCommunityResponse(content: string, userStage?: string): string {
    const responses = [
      `Great to see ${userStage || "you"} engaging with the community! 🎧`,
      `Love the underground vibes, ${userStage || "artist"}! Keep the techno spirit alive 🔥`,
      `This is what TheCueRoom is all about - authentic music discussion! 🎵`,
      `The underground scene needs more voices like yours, ${userStage || "friend"}! 💫`,
      `Quality content for the community! The dance floor awaits 🕺`,
      `Building connections in the underground - this is the way! 🤝`,
      `Your contribution to the scene is appreciated, ${userStage || "artist"}! 🙌`,
      `Keep pushing boundaries and supporting the underground! 🚀`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export default AIModerationService;