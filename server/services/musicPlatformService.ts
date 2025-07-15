import OpenAI from "openai";

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  console.warn("OpenAI API key not provided; music platform AI features disabled");
}

interface PlatformProfile {
  platform: string;
  username: string;
  url: string;
  verified: boolean;
  followers?: number;
  tracks?: number;
}

interface ArtistProfile {
  spotify?: PlatformProfile;
  soundcloud?: PlatformProfile;
  youtube?: PlatformProfile;
  beatport?: PlatformProfile;
  bandcamp?: PlatformProfile;
  mixcloud?: PlatformProfile;
  residentAdvisor?: PlatformProfile;
  instagram?: PlatformProfile;
}

interface TrackMetadata {
  title: string;
  artist: string;
  genre: string;
  bpm?: number;
  key?: string;
  duration?: number;
  releaseDate?: string;
  platforms: string[];
}

interface PlaylistData {
  name: string;
  description: string;
  tracks: TrackMetadata[];
  platform: string;
  url: string;
  isPublic: boolean;
}

class MusicPlatformService {
  // Validate and extract platform profile URLs
  async validatePlatformURL(url: string): Promise<{ platform: string; username: string; isValid: boolean }> {
    const platformPatterns = {
      spotify: /^https?:\/\/(open\.)?spotify\.com\/(artist|user)\/([a-zA-Z0-9]+)/,
      soundcloud: /^https?:\/\/(www\.)?soundcloud\.com\/([a-zA-Z0-9_-]+)/,
      youtube: /^https?:\/\/(www\.)?(youtube\.com\/(channel\/|c\/|user\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
      beatport: /^https?:\/\/(www\.)?beatport\.com\/artist\/([a-zA-Z0-9_-]+)/,
      bandcamp: /^https?:\/\/([a-zA-Z0-9_-]+)\.bandcamp\.com/,
      mixcloud: /^https?:\/\/(www\.)?mixcloud\.com\/([a-zA-Z0-9_-]+)/,
      residentAdvisor: /^https?:\/\/(www\.)?ra\.co\/dj\/([a-zA-Z0-9_-]+)/,
      instagram: /^https?:\/\/(www\.)?instagram\.com\/([a-zA-Z0-9_.-]+)/
    };

    for (const [platform, pattern] of Object.entries(platformPatterns)) {
      const match = url.match(pattern);
      if (match) {
        const username = match[2] || match[3] || match[4];
        return { platform, username, isValid: true };
      }
    }

    return { platform: 'unknown', username: '', isValid: false };
  }

  // Generate platform-specific embed codes
  generateEmbedCode(platform: string, username: string, trackId?: string): string {
    switch (platform) {
      case 'spotify':
        if (trackId) {
          return `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator" width="100%" height="152" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
        }
        return `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/artist/${username}?utm_source=generator" width="100%" height="352" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
      
      case 'soundcloud':
        return `<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/${username}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>`;
      
      case 'youtube':
        return `<iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=${username}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      
      case 'mixcloud':
        return `<iframe width="100%" height="120" src="https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=%2F${username}%2F" frameborder="0"></iframe>`;
      
      default:
        return '';
    }
  }

  // Fetch artist data from platforms (simulated - would require API keys)
  async fetchArtistData(platform: string, username: string): Promise<PlatformProfile | null> {
    try {
      // Simulate platform API calls - in production, would use actual APIs
      const mockData: Record<string, Partial<PlatformProfile>> = {
        spotify: { followers: Math.floor(Math.random() * 10000), tracks: Math.floor(Math.random() * 50) },
        soundcloud: { followers: Math.floor(Math.random() * 5000), tracks: Math.floor(Math.random() * 100) },
        youtube: { followers: Math.floor(Math.random() * 15000), tracks: Math.floor(Math.random() * 30) },
        beatport: { tracks: Math.floor(Math.random() * 25) },
        bandcamp: { tracks: Math.floor(Math.random() * 20) },
        mixcloud: { followers: Math.floor(Math.random() * 3000), tracks: Math.floor(Math.random() * 40) }
      };

      return {
        platform,
        username,
        url: this.constructPlatformURL(platform, username),
        verified: Math.random() > 0.7, // 30% chance of verification
        ...mockData[platform]
      };
    } catch (error) {
      console.error(`Error fetching data for ${platform}:`, error);
      return null;
    }
  }

  private constructPlatformURL(platform: string, username: string): string {
    const baseUrls: Record<string, string> = {
      spotify: 'https://open.spotify.com/artist/',
      soundcloud: 'https://soundcloud.com/',
      youtube: 'https://youtube.com/c/',
      beatport: 'https://beatport.com/artist/',
      bandcamp: `https://${username}.bandcamp.com`,
      mixcloud: 'https://mixcloud.com/',
      residentAdvisor: 'https://ra.co/dj/',
      instagram: 'https://instagram.com/'
    };

    if (platform === 'bandcamp') {
      return baseUrls[platform];
    }
    return baseUrls[platform] + username;
  }

  // Generate platform-specific content recommendations
  async generatePlatformStrategy(artistProfile: ArtistProfile, genre: string): Promise<string> {
    if (!openai) {
      return JSON.stringify({
        general: "Focus on consistent posting, engage with your community, and cross-promote between platforms"
      });
    }
    try {
      const platforms = Object.keys(artistProfile).filter(key => artistProfile[key as keyof ArtistProfile]);
      
      const prompt = `As a music industry expert, provide strategic advice for a ${genre} artist with profiles on: ${platforms.join(', ')}. 

Focus on:
1. Platform-specific content strategies for techno/house music
2. Cross-platform promotion techniques
3. Audience engagement tactics for underground music
4. Release strategies for independent artists
5. Community building in the electronic music scene

Provide specific, actionable advice in JSON format with sections for each platform.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error('Error generating platform strategy:', error);
      return JSON.stringify({
        general: "Focus on consistent posting, engage with your community, and cross-promote between platforms",
        spotify: "Create playlists, collaborate with other artists, submit to editorial playlists",
        soundcloud: "Upload regular mixes, engage with comments, follow other techno artists",
        youtube: "Create video content, live streams, behind-the-scenes content"
      });
    }
  }

  // Analyze track performance across platforms
  async analyzeTrackPerformance(trackData: TrackMetadata[]): Promise<any> {
    const analysis = {
      totalTracks: trackData.length,
      platformDistribution: {} as Record<string, number>,
      genreBreakdown: {} as Record<string, number>,
      averageBPM: 0,
      recommendedReleaseStrategy: ""
    };

    // Calculate platform distribution
    trackData.forEach(track => {
      track.platforms.forEach(platform => {
        analysis.platformDistribution[platform] = (analysis.platformDistribution[platform] || 0) + 1;
      });
      
      analysis.genreBreakdown[track.genre] = (analysis.genreBreakdown[track.genre] || 0) + 1;
    });

    // Calculate average BPM
    const bpmTracks = trackData.filter(track => track.bpm);
    if (bpmTracks.length > 0) {
      analysis.averageBPM = Math.round(
        bpmTracks.reduce((sum, track) => sum + (track.bpm || 0), 0) / bpmTracks.length
      );
    }

    // Generate release strategy recommendation
    const topPlatform = Object.entries(analysis.platformDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'spotify';
    
    analysis.recommendedReleaseStrategy = `Focus on ${topPlatform} for maximum reach. Consider releasing on Fridays for optimal algorithmic pickup.`;

    return analysis;
  }

  // Generate curated playlists based on user preferences
  async generateCuratedPlaylist(genre: string, mood: string, bpmRange: [number, number]): Promise<PlaylistData> {
    if (!openai) {
      return {
        name: `${genre} ${mood} Mix`,
        description: `A collection of ${genre} tracks perfect for ${mood} moments`,
        tracks: [],
        platform: 'TheCueRoom',
        url: '#',
        isPublic: true
      };
    }
    try {
      const prompt = `Create a curated ${genre} playlist for ${mood} mood with BPM range ${bpmRange[0]}-${bpmRange[1]}. 

Include 15-20 tracks from both established and emerging artists. Focus on underground and cutting-edge releases from 2023-2025.

Return JSON with playlist name, description, and tracks array containing: title, artist, genre, bpm, key, platforms.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const playlistData = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        name: playlistData.name || `${genre} ${mood} Selection`,
        description: playlistData.description || `Curated ${genre} tracks for ${mood} vibes`,
        tracks: playlistData.tracks || [],
        platform: 'TheCueRoom',
        url: '#',
        isPublic: true
      };
    } catch (error) {
      console.error('Error generating playlist:', error);
      return {
        name: `${genre} ${mood} Mix`,
        description: `A collection of ${genre} tracks perfect for ${mood} moments`,
        tracks: [],
        platform: 'TheCueRoom',
        url: '#',
        isPublic: true
      };
    }
  }

  // Get trending tracks from various platforms
  async getTrendingTracks(genre: string = 'techno'): Promise<TrackMetadata[]> {
    // Simulated trending tracks - in production would aggregate from multiple APIs
    const mockTrendingTracks: TrackMetadata[] = [
      {
        title: "Infinite Loop",
        artist: "Tech Panda",
        genre: "Techno",
        bpm: 128,
        key: "Am",
        duration: 420,
        releaseDate: "2025-01-15",
        platforms: ["spotify", "soundcloud", "beatport"]
      },
      {
        title: "Mumbai Nights",
        artist: "Anish Sood",
        genre: "Progressive House",
        bpm: 124,
        key: "Dm",
        duration: 380,
        releaseDate: "2025-01-10",
        platforms: ["spotify", "youtube", "bandcamp"]
      },
      {
        title: "Underground Movement",
        artist: "DJ Ana Lilia",
        genre: "Minimal Techno",
        bpm: 132,
        key: "Gm",
        duration: 450,
        releaseDate: "2025-01-08",
        platforms: ["soundcloud", "mixcloud", "beatport"]
      }
    ];

    return mockTrendingTracks.filter(track => 
      track.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }
}

export const musicPlatformService = new MusicPlatformService();