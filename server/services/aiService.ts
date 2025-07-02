import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

interface ModerationResult {
  approved: boolean;
  reason?: string;
  confidence: number;
}

class AIService {
  async moderateContent(content: string): Promise<ModerationResult> {
    try {
      // Simple rule-based moderation for production reliability
      const lowercaseContent = content.toLowerCase();
      
      // Check for spam patterns
      if (lowercaseContent.includes('buy now') || 
          lowercaseContent.includes('click here') ||
          lowercaseContent.includes('free money') ||
          lowercaseContent.match(/\b(viagra|cialis|lottery|casino)\b/)) {
        return {
          approved: false,
          reason: "Detected spam content",
          confidence: 0.9
        };
      }
      
      // Check for harassment patterns
      if (lowercaseContent.match(/\b(kill yourself|kys|die|hate|stupid|idiot)\b/)) {
        return {
          approved: false,
          reason: "Detected potentially harmful language",
          confidence: 0.8
        };
      }
      
      // For music-related content, be more permissive
      if (lowercaseContent.match(/\b(techno|house|electronic|music|beat|track|mix|dj|artist|producer|remix|synth|bass|kick|snare)\b/)) {
        return {
          approved: true,
          reason: "Music-related content approved",
          confidence: 0.9
        };
      }
      
      // Default to approval for community engagement
      return {
        approved: true,
        reason: "Content approved by basic moderation",
        confidence: 0.7
      };
      
    } catch (error) {
      console.error("Content moderation error:", error);
      // Fail-safe: approve content to avoid blocking legitimate posts
      return {
        approved: true,
        reason: "Moderation service error - content approved by default",
        confidence: 0.5
      };
    }
  }

  async generateMeme(prompt: string, category: string): Promise<string> {
    try {
      // First, create a safe, music-themed prompt
      const safePrompt = await this.createSafeMemePrompt(prompt, category);
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: safePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      return response.data?.[0]?.url || "";
    } catch (error) {
      console.error("Meme generation error:", error);
      // Return placeholder SVG when API is unavailable
      return this.generateFallbackMeme(prompt, category);
    }
  }

  private generateFallbackMeme(prompt: string, category: string): string {
    // Create contextually relevant meme based on prompt content
    const template = this.selectTemplateByPrompt(prompt.toLowerCase());
    const { topText, bottomText } = this.optimizeMemeText(prompt);
    
    const svg = `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${template.gradientStart};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${template.gradientEnd};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="500" height="500" fill="url(#bg)"/>
      
      <!-- Meme template area -->
      <rect x="25" y="25" width="450" height="450" fill="#000" opacity="0.7" rx="10"/>
      
      <!-- Template-specific elements -->
      ${template.elements}
      
      <!-- Top text with outline -->
      <text x="250" y="80" font-family="Impact, Arial Black, sans-serif" font-size="28" font-weight="900" 
            text-anchor="middle" fill="white" stroke="black" stroke-width="3">
        ${this.wrapText(topText, 20)}
      </text>
      
      <!-- Bottom text with outline -->
      <text x="250" y="440" font-family="Impact, Arial Black, sans-serif" font-size="28" font-weight="900" 
            text-anchor="middle" fill="white" stroke="black" stroke-width="3">
        ${this.wrapText(bottomText, 20)}
      </text>
      
      <!-- Category watermark -->
      <text x="450" y="480" font-family="Arial, sans-serif" font-size="12" 
            text-anchor="end" fill="rgba(255,255,255,0.6)">
        #${category}
      </text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  async generateMemeContent(prompt: string): Promise<{ category: string; texts: string[] }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a meme content generator for underground electronic music culture. Generate funny, relatable meme text that resonates with techno/house music producers, DJs, and club culture enthusiasts. Respond with JSON containing 'category' (one of: production, club, gear, scene, synth, debate) and 'texts' array with exactly 2 strings for top and bottom text."
          },
          {
            role: "user",
            content: `Generate meme content for: ${prompt}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 200,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        category: result.category || 'production',
        texts: result.texts || [prompt, 'Underground music life']
      };
    } catch (error) {
      console.error('AI meme content generation failed:', error);
      return {
        category: 'production',
        texts: [prompt, 'When AI fails but the beat goes on']
      };
    }
  }

  private selectTemplateByPrompt(prompt: string): any {
    if (prompt.includes('studio') || prompt.includes('monitor') || prompt.includes('production')) {
      return {
        name: 'Studio',
        gradientStart: '#0f3460',
        gradientEnd: '#533483',
        elements: this.getStudioElements()
      };
    } else if (prompt.includes('club') || prompt.includes('sound system') || prompt.includes('dj') || prompt.includes('crowd')) {
      return {
        name: 'Club',
        gradientStart: '#16213e',
        gradientEnd: '#0f3460',
        elements: this.getClubElements()
      };
    } else if (prompt.includes('vinyl') || prompt.includes('turntable') || prompt.includes('mix') || prompt.includes('deck')) {
      return {
        name: 'DJ booth',
        gradientStart: '#1a1a2e',
        gradientEnd: '#16213e',
        elements: this.getDJElements()
      };
    } else {
      // Default to techno/electronic theme
      return {
        name: 'Electronic',
        gradientStart: '#1a1a2e',
        gradientEnd: '#533483',
        elements: this.getElectronicElements()
      };
    }
  }

  private optimizeMemeText(prompt: string): { topText: string; bottomText: string } {
    // Smart text splitting for better meme format
    const words = prompt.split(' ');
    
    if (words.length <= 3) {
      return { topText: words.join(' ').toUpperCase(), bottomText: '' };
    }
    
    // Find natural break point (vs, vs., against, or, but, etc.)
    const breakWords = ['vs', 'vs.', 'versus', 'against', 'or', 'but', 'when', 'while'];
    let breakIndex = -1;
    
    for (let i = 0; i < words.length; i++) {
      if (breakWords.includes(words[i].toLowerCase())) {
        breakIndex = i;
        break;
      }
    }
    
    if (breakIndex > 0 && breakIndex < words.length - 1) {
      return {
        topText: words.slice(0, breakIndex).join(' ').toUpperCase(),
        bottomText: words.slice(breakIndex + 1).join(' ').toUpperCase()
      };
    }
    
    // Default split at midpoint
    const midPoint = Math.ceil(words.length / 2);
    return {
      topText: words.slice(0, midPoint).join(' ').toUpperCase(),
      bottomText: words.slice(midPoint).join(' ').toUpperCase()
    };
  }

  private wrapText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  private getDJElements(): string {
    return `
      <!-- DJ deck -->
      <rect x="150" y="200" width="200" height="100" fill="#333" rx="10"/>
      <circle cx="180" cy="225" r="15" fill="#666"/>
      <circle cx="220" cy="225" r="15" fill="#666"/>
      <circle cx="320" cy="225" r="15" fill="#666"/>
      
      <!-- Vinyl record -->
      <circle cx="250" cy="280" r="40" fill="#1a1a1a"/>
      <circle cx="250" cy="280" r="5" fill="#666"/>
      
      <!-- Waveforms -->
      <g transform="translate(100, 350)">
        <rect x="0" y="0" width="3" height="20" fill="#8B5CF6"/>
        <rect x="8" y="-5" width="3" height="30" fill="#8B5CF6"/>
        <rect x="16" y="2" width="3" height="16" fill="#8B5CF6"/>
        <rect x="24" y="-8" width="3" height="36" fill="#8B5CF6"/>
      </g>
    `;
  }

  private getStudioElements(): string {
    return `
      <!-- Studio monitors -->
      <rect x="100" y="180" width="80" height="60" fill="#333" rx="5"/>
      <rect x="320" y="180" width="80" height="60" fill="#333" rx="5"/>
      <circle cx="140" cy="210" r="20" fill="#666"/>
      <circle cx="360" cy="210" r="20" fill="#666"/>
      
      <!-- Mixing console -->
      <rect x="150" y="280" width="200" height="80" fill="#2a2a2a" rx="5"/>
      <circle cx="180" cy="310" r="8" fill="#06B6D4"/>
      <circle cx="220" cy="310" r="8" fill="#06B6D4"/>
      <circle cx="260" cy="310" r="8" fill="#06B6D4"/>
      <circle cx="300" cy="310" r="8" fill="#06B6D4"/>
      
      <!-- Cables -->
      <path d="M 150 320 Q 120 340 100 320" stroke="#8B5CF6" stroke-width="3" fill="none"/>
    `;
  }

  private getClubElements(): string {
    return `
      <!-- Stage/booth -->
      <rect x="150" y="200" width="200" height="80" fill="#1a1a1a" rx="5"/>
      
      <!-- Crowd silhouettes -->
      <ellipse cx="80" cy="350" rx="15" ry="30" fill="#333" opacity="0.8"/>
      <ellipse cx="120" cy="340" rx="12" ry="25" fill="#333" opacity="0.8"/>
      <ellipse cx="380" cy="345" rx="18" ry="35" fill="#333" opacity="0.8"/>
      <ellipse cx="420" cy="355" rx="14" ry="28" fill="#333" opacity="0.8"/>
      
      <!-- Lights -->
      <circle cx="200" cy="150" r="8" fill="#F59E0B" opacity="0.7"/>
      <circle cx="300" cy="140" r="6" fill="#06B6D4" opacity="0.7"/>
      <circle cx="350" cy="160" r="7" fill="#EF4444" opacity="0.7"/>
      
      <!-- Sound waves -->
      <path d="M 250 250 Q 200 280 180 320" stroke="#8B5CF6" stroke-width="2" fill="none" opacity="0.6"/>
      <path d="M 250 250 Q 300 280 320 320" stroke="#8B5CF6" stroke-width="2" fill="none" opacity="0.6"/>
    `;
  }

  private getElectronicElements(): string {
    return `
      <!-- Synthesizer -->
      <rect x="100" y="200" width="300" height="100" fill="#2a2a2a" rx="10"/>
      <g transform="translate(120, 220)">
        <circle cx="0" cy="0" r="12" fill="#06B6D4"/>
        <circle cx="40" cy="0" r="12" fill="#8B5CF6"/>
        <circle cx="80" cy="0" r="12" fill="#F59E0B"/>
        <circle cx="120" cy="0" r="12" fill="#EF4444"/>
        <circle cx="160" cy="0" r="12" fill="#10B981"/>
        <circle cx="200" cy="0" r="12" fill="#06B6D4"/>
        <circle cx="240" cy="0" r="12" fill="#8B5CF6"/>
      </g>
      
      <!-- Waveforms -->
      <g transform="translate(150, 350)">
        <rect x="0" y="0" width="4" height="25" fill="#8B5CF6" opacity="0.8"/>
        <rect x="10" y="-8" width="4" height="41" fill="#8B5CF6" opacity="0.8"/>
        <rect x="20" y="3" width="4" height="19" fill="#8B5CF6" opacity="0.8"/>
        <rect x="30" y="-12" width="4" height="49" fill="#8B5CF6" opacity="0.8"/>
        <rect x="40" y="1" width="4" height="23" fill="#8B5CF6" opacity="0.8"/>
        <rect x="50" y="-6" width="4" height="37" fill="#8B5CF6" opacity="0.8"/>
        <rect x="60" y="5" width="4" height="15" fill="#8B5CF6" opacity="0.8"/>
        <rect x="70" y="-10" width="4" height="45" fill="#8B5CF6" opacity="0.8"/>
        <rect x="80" y="2" width="4" height="21" fill="#8B5CF6" opacity="0.8"/>
        <rect x="90" y="-4" width="4" height="33" fill="#8B5CF6" opacity="0.8"/>
        <rect x="100" y="6" width="4" height="13" fill="#8B5CF6" opacity="0.8"/>
        <rect x="110" y="-7" width="4" height="39" fill="#8B5CF6" opacity="0.8"/>
        <rect x="120" y="0" width="4" height="25" fill="#8B5CF6" opacity="0.8"/>
        <rect x="130" y="-9" width="4" height="43" fill="#8B5CF6" opacity="0.8"/>
        <rect x="140" y="4" width="4" height="17" fill="#8B5CF6" opacity="0.8"/>
        <rect x="150" y="-11" width="4" height="47" fill="#8B5CF6" opacity="0.8"/>
        <rect x="160" y="1" width="4" height="23" fill="#8B5CF6" opacity="0.8"/>
        <rect x="170" y="-5" width="4" height="35" fill="#8B5CF6" opacity="0.8"/>
        <rect x="180" y="7" width="4" height="11" fill="#8B5CF6" opacity="0.8"/>
        <rect x="190" y="-8" width="4" height="41" fill="#8B5CF6" opacity="0.8"/>
      </g>
      
      <!-- Circuit pattern -->
      <g transform="translate(80, 150)">
        <path d="M 0 0 L 20 0 L 20 10 L 40 10" stroke="#06B6D4" stroke-width="2" fill="none" opacity="0.4"/>
        <path d="M 40 10 L 60 10 L 60 -5 L 80 -5" stroke="#06B6D4" stroke-width="2" fill="none" opacity="0.4"/>
        <circle cx="0" cy="0" r="3" fill="#06B6D4" opacity="0.6"/>
        <circle cx="20" cy="10" r="3" fill="#06B6D4" opacity="0.6"/>
        <circle cx="40" cy="10" r="3" fill="#06B6D4" opacity="0.6"/>
        <circle cx="60" cy="-5" r="3" fill="#06B6D4" opacity="0.6"/>
        <circle cx="80" cy="-5" r="3" fill="#06B6D4" opacity="0.6"/>
      </g>
    `;
  }

  private async createSafeMemePrompt(userPrompt: string, category: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are creating safe, family-friendly meme prompts for underground electronic music culture.
            Transform the user's prompt into a safe, creative image description that relates to ${category}.
            
            Categories:
            - music_production: Studio equipment, DJ setups, production struggles
            - dj_life: DJ booth scenes, crowd interactions, technical difficulties  
            - club_culture: Underground venue atmosphere, dance floor moments
            - techno_humor: Genre-specific jokes and references
            
            Make it visual, safe, and humorous. Avoid any content that could be inappropriate.
            
            Respond with just the image prompt, no explanation.`
          },
          {
            role: "user", 
            content: userPrompt
          }
        ],
      });

      const safePrompt = response.choices[0].message.content || userPrompt;
      
      // Add underground music context
      return `${safePrompt}, underground electronic music theme, dark club aesthetic, neon lighting, safe for work, meme style illustration`;
    } catch (error) {
      console.error("Safe prompt creation error:", error);
      return `Underground electronic music meme about ${category}, safe for work, club aesthetic`;
    }
  }

  async analyzeNewsRelevance(title: string, content: string): Promise<number> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are analyzing news articles for relevance to underground electronic music culture.
            Rate the relevance on a scale of 0-100 where:
            - 90-100: Directly about underground electronic music, techno, house, underground artists/labels
            - 70-89: Electronic music industry news, major festivals, technology
            - 50-69: General music industry news that affects electronic music
            - 30-49: Tangentially related to music/entertainment
            - 0-29: Not relevant to electronic music
            
            Respond with JSON: { "relevance": number, "reason": string }`
          },
          {
            role: "user",
            content: `Title: ${title}\n\nContent: ${content.substring(0, 500)}...`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return Math.max(0, Math.min(100, result.relevance || 0));
    } catch (error) {
      console.error("News relevance analysis error:", error);
      return 0;
    }
  }

  async generateUsername(preferences?: any): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Generate a creative username for an underground electronic music artist.
            Style should be:
            - Underground/techno/house music inspired
            - Cool and edgy but professional
            - Include common suffixes like _BLR, _DEL, _MUM, _GOA for Indian cities
            - Or music terms like Beat, Bass, Tech, Deep, Minimal, Acid
            - 8-20 characters max
            - No offensive content
            
            Examples: TechnoMaster_BLR, DeepVibes_GOA, MinimalMind_DEL, AcidBassline_MUM
            
            Generate 3 options and return as JSON: { "usernames": ["option1", "option2", "option3"] }`
          },
          {
            role: "user",
            content: `Generate usernames${preferences ? ` with preferences: ${JSON.stringify(preferences)}` : ''}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      const usernames = result.usernames || [];
      
      return usernames[Math.floor(Math.random() * usernames.length)] || `TechnoUser_${Date.now()}`;
    } catch (error) {
      console.error("Username generation error:", error);
      return `TechnoUser_${Date.now()}`;
    }
  }

  async generateCuratedPlaylist(params: {
    genre: string;
    mood?: string;
    description?: string;
    trackCount: number;
    userId: string;
  }): Promise<{ title: string; description: string; tracks: any[] }> {
    try {
      const prompt = `Create a curated ${params.genre} playlist with ${params.trackCount} tracks. 
      ${params.mood ? `Mood: ${params.mood}. ` : ''}
      ${params.description ? `Additional context: ${params.description}. ` : ''}
      
      Focus on underground and emerging artists in the ${params.genre} scene. 
      Include a mix of established classics and fresh discoveries.
      
      Return JSON with:
      - title: Creative playlist name
      - description: 2-3 sentence description
      - tracks: Array of ${params.trackCount} tracks with artist, title, duration, and brief description
      
      Example format:
      {
        "title": "Underground Techno Vault",
        "description": "A journey through the darkest corners of techno...",
        "tracks": [
          {
            "artist": "Ben Klock",
            "title": "Subzero", 
            "duration": "6:42",
            "description": "Hypnotic minimal techno with industrial undertones"
          }
        ]
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a music curator specializing in underground electronic music scenes." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        title: result.title || `${params.genre} Curation`,
        description: result.description || `A curated selection of ${params.genre} tracks`,
        tracks: result.tracks || []
      };
    } catch (error) {
      console.error('Error generating curated playlist:', error);
      
      // Fallback playlist generation
      return {
        title: `${params.genre} Underground Selection`,
        description: `A carefully curated collection of underground ${params.genre} tracks selected for the community.`,
        tracks: this.generateFallbackTracks(params.genre, params.trackCount)
      };
    }
  }

  private generateFallbackTracks(genre: string, count: number): any[] {
    const trackTemplates = {
      techno: [
        { artist: "Underground Artist", title: "Deep Minimal", duration: "6:30" },
        { artist: "Berlin Collective", title: "Industrial Drive", duration: "7:15" },
        { artist: "Raw Sound", title: "Warehouse Nights", duration: "5:45" }
      ],
      house: [
        { artist: "Deep Selector", title: "Soulful Groove", duration: "5:20" },
        { artist: "Chicago Underground", title: "Warehouse Vibe", duration: "6:10" },
        { artist: "House Collective", title: "Deep Cuts", duration: "5:50" }
      ],
      ambient: [
        { artist: "Atmospheric", title: "Floating Spaces", duration: "8:30" },
        { artist: "Drone Collective", title: "Infinite Echo", duration: "12:15" },
        { artist: "Ambient Flow", title: "Weightless", duration: "9:45" }
      ]
    };

    const genreKey = genre.toLowerCase();
    const templates = trackTemplates[genreKey as keyof typeof trackTemplates] || trackTemplates.techno;
    const tracks = [];
    
    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      tracks.push({
        ...template,
        title: `${template.title} ${i + 1}`,
        description: `Underground ${genre} track with unique sonic characteristics`
      });
    }
    
    return tracks;
  }

  async generateCommentSuggestions(prompt: string): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an AI assistant for TheCueRoom, an underground techno and house music community. Generate authentic, engaging comment suggestions that fit the underground electronic music culture. Be supportive, knowledgeable about music production, and use appropriate music terminology. Respond only with a JSON array of 3 suggestions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      
      // Extract suggestions from the response
      if (Array.isArray(result)) {
        return result.slice(0, 3);
      } else if (result.suggestions && Array.isArray(result.suggestions)) {
        return result.suggestions.slice(0, 3);
      } else {
        // Parse as simple array structure
        const suggestions = Object.values(result).filter(v => typeof v === 'string').slice(0, 3);
        return suggestions.length > 0 ? suggestions as string[] : this.getFallbackSuggestions();
      }
    } catch (error) {
      console.error('AI comment suggestion failed:', error);
      return this.getFallbackSuggestions();
    }
  }

  private getFallbackSuggestions(): string[] {
    return [
      "This track hits different! 🔥",
      "The underground scene needs more of this",
      "Perfect for peak time sets!"
    ];
  }

  async generateBotResponse(mentionContent: string, postContent: string, postTitle?: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are TheCueRoom Bot, the AI assistant for India's underground techno and house music community. When @mentioned, provide:
            - Insightful analysis of music posts, tracks, or events
            - Technical feedback on production elements (basslines, percussion, mixing)
            - Scene knowledge about underground music culture
            - Supportive, constructive responses in underground music slang
            - Keep responses 1-2 sentences, conversational and authentic
            - Use music production terms when relevant (BPM, drop, breakdown, etc.)
            
            Respond as if you're a knowledgeable member of the underground scene who understands both the technical and cultural aspects of techno/house music.`
          },
          {
            role: "user", 
            content: `Post Title: "${postTitle || 'Untitled'}"
            Post Content: "${postContent}"
            User's message: "${mentionContent}"
            
            Provide a helpful response as TheCueRoom Bot.`
          }
        ],
        max_tokens: 150
      });

      return completion.choices[0].message.content || "Thanks for the mention! Keep pushing the underground scene forward 🎵";
    } catch (error) {
      console.error('AI bot response error:', error);
      // Fallback responses based on content analysis
      const lowerContent = mentionContent.toLowerCase();
      if (lowerContent.includes('track') || lowerContent.includes('song')) {
        return "This track has some serious underground energy! The production quality is solid 🔥";
      }
      if (lowerContent.includes('mix') || lowerContent.includes('set')) {
        return "Nice flow in this mix! Perfect for those late-night warehouse sessions 🎧";
      }
      if (lowerContent.includes('event') || lowerContent.includes('gig')) {
        return "This event looks fire! India's underground scene keeps getting stronger 💪";
      }
      return "Thanks for the mention! Keep pushing the boundaries of underground music 🎵";
    }
  }
}

export const aiService = new AIService();
