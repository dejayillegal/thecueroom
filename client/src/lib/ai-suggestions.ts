import { apiRequest } from "@/lib/queryClient";

interface SuggestionRequest {
  postContent: string;
  postTitle: string;
  recentComments: string[];
  userInput?: string;
  suggestionType: 'generate' | 'rewrite' | 'enhance';
}

interface SuggestionResponse {
  suggestions: string[];
  error?: string;
}

export class AISuggestionService {
  static async generateCommentSuggestions({
    postContent,
    postTitle,
    recentComments,
    userInput = "",
    suggestionType = 'generate'
  }: SuggestionRequest): Promise<string[]> {
    try {
      const response = await apiRequest('POST', '/api/ai/comment-suggestions', {
        postContent,
        postTitle,
        recentComments: recentComments.slice(-5), // Last 5 comments for context
        userInput,
        suggestionType
      });
      
      const data: SuggestionResponse = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('AI suggestion error:', error);
      return this.getFallbackSuggestions(postContent, suggestionType);
    }
  }

  static getFallbackSuggestions(postContent: string, suggestionType: string): string[] {
    if (suggestionType === 'rewrite') {
      return [
        "Let me rephrase that for you...",
        "Here's another way to say it...",
        "Try this alternative..."
      ];
    }

    // Context-based fallback suggestions
    const content = postContent.toLowerCase();
    
    if (content.includes('techno')) {
      return [
        "This techno track is absolutely fire! 🔥",
        "Love the underground vibes in this one",
        "Perfect for peak time sets!"
      ];
    }
    
    if (content.includes('house')) {
      return [
        "House music all night long! 🏠",
        "This groove is infectious",
        "Deep house perfection"
      ];
    }
    
    if (content.includes('gig') || content.includes('event')) {
      return [
        "Can't wait for this event!",
        "See you on the dancefloor!",
        "This lineup is incredible!"
      ];
    }

    // General music suggestions
    return [
      "This is exactly what I needed today!",
      "The underground scene is alive!",
      "Incredible sound design!",
      "Adding this to my playlist!",
      "Underground gold! 💎"
    ];
  }

  static async rewriteComment(originalComment: string, tone: 'professional' | 'casual' | 'enthusiastic' = 'casual'): Promise<string[]> {
    try {
      const response = await apiRequest('POST', '/api/ai/rewrite-comment', {
        originalComment,
        tone
      });
      
      const data = await response.json();
      return data.suggestions || [originalComment];
    } catch (error) {
      console.error('AI rewrite error:', error);
      return [originalComment];
    }
  }

  static async enhanceComment(partialComment: string, postContext: string): Promise<string[]> {
    try {
      const response = await apiRequest('POST', '/api/ai/enhance-comment', {
        partialComment,
        postContext
      });
      
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('AI enhance error:', error);
      return [];
    }
  }
}