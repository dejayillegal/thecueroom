import { storage } from '../storage';

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  genre: string;
  style: string;
  trackCount: number;
  followerCount: number;
  duration: string;
  spotifyUrl: string;
  embedUrl: string;
  imageUrl: string;
  curator: string;
  tags: string[];
  bpmRange?: [number, number];
  isActive: boolean;
}

export class SpotifyService {
  private undergroundPlaylists: SpotifyPlaylist[] = [
    // Underground Techno
    {
      id: 'ugtech_001',
      name: 'Berlin Underground: Raw Techno',
      description: 'Deep underground techno from Berlin\'s darkest clubs. Pure 4/4 minimalism.',
      genre: 'Techno',
      style: 'Underground Techno',
      trackCount: 89,
      followerCount: 15420,
      duration: '5h 34m',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      curator: 'Underground Collective',
      tags: ['berlin', 'minimal', 'dark', 'club'],
      bpmRange: [125, 135],
      isActive: true
    },
    {
      id: 'ugtech_002',
      name: 'Detroit Techno Essentials',
      description: 'The birthplace sound. Classic Detroit techno and modern interpretations.',
      genre: 'Techno',
      style: 'Detroit Style',
      trackCount: 67,
      followerCount: 8930,
      duration: '4h 12m',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP',
      imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220c9c412ad?w=400&h=400&fit=crop',
      curator: 'Motor City Sounds',
      tags: ['detroit', 'classic', 'futuristic', 'motor city'],
      bpmRange: [120, 130],
      isActive: true
    },
    
    // Underground House
    {
      id: 'ughouse_001',
      name: 'Deep Chicago House Vault',
      description: 'Authentic Chicago house from the underground. Soulful, deep, and raw.',
      genre: 'House',
      style: 'Underground House',
      trackCount: 78,
      followerCount: 12340,
      duration: '4h 45m',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXa8NOEUWPuuK',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXa8NOEUWPuuK',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
      curator: 'Warehouse Collective',
      tags: ['chicago', 'deep', 'soul', 'warehouse'],
      bpmRange: [118, 125],
      isActive: true
    },
    {
      id: 'ughouse_002',
      name: 'LA Underground House Sessions',
      description: 'West Coast house music from LA\'s underground scene. Smooth, groovy, innovative.',
      genre: 'House',
      style: 'LA Underground Style',
      trackCount: 92,
      followerCount: 9870,
      duration: '5h 18m',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4JAvHpjipBk',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4JAvHpjipBk',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      curator: 'West Coast Vibes',
      tags: ['los angeles', 'smooth', 'groove', 'innovative'],
      bpmRange: [120, 128],
      isActive: true
    },

    // Experimental Music
    {
      id: 'exp_001',
      name: 'Experimental Electronic Lab',
      description: 'Cutting-edge experimental electronic music. Ambient, noise, and beyond.',
      genre: 'Experimental',
      style: 'Experimental Music',
      trackCount: 54,
      followerCount: 6780,
      duration: '6h 23m',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0rHZ6Cq7kLm',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0rHZ6Cq7kLm',
      imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220c9c412ad?w=400&h=400&fit=crop',
      curator: 'Sonic Experiments',
      tags: ['experimental', 'ambient', 'noise', 'avant-garde'],
      bpmRange: [60, 180],
      isActive: true
    },

    // Underground DnB
    {
      id: 'ugdnb_001',
      name: 'Underground Drum & Bass',
      description: 'Deep underground D&B. Liquid, neurofunk, and rolling basslines.',
      genre: 'Drum & Bass',
      style: 'Underground DnB',
      trackCount: 83,
      followerCount: 11250,
      duration: '4h 56m',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX1vvY4ykUlLh',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX1vvY4ykUlLh',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
      curator: 'Bassline Underground',
      tags: ['liquid', 'neurofunk', 'rolling', 'underground'],
      bpmRange: [170, 180],
      isActive: true
    },

    // Underground Ambient
    {
      id: 'ugamb_001',
      name: 'Deep Ambient Spaces',
      description: 'Immersive ambient soundscapes from the underground electronic scene.',
      genre: 'Ambient',
      style: 'Underground Ambient',
      trackCount: 45,
      followerCount: 8420,
      duration: '7h 12m',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX3Ogo9pFvBkY',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      curator: 'Ambient Collective',
      tags: ['ambient', 'drone', 'atmospheric', 'meditation'],
      bpmRange: [40, 90],
      isActive: true
    },

    // Tresor Style
    {
      id: 'tresor_001',
      name: 'Tresor Berlin: Vault Sessions',
      description: 'The legendary Tresor sound. Hard, industrial techno from Berlin\'s underground.',
      genre: 'Techno',
      style: 'Tresor Style',
      trackCount: 72,
      followerCount: 14530,
      duration: '4h 38m',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX6xCfpRtIGq8',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX6xCfpRtIGq8',
      imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220c9c412ad?w=400&h=400&fit=crop',
      curator: 'Tresor Records',
      tags: ['tresor', 'industrial', 'hard', 'berlin'],
      bpmRange: [130, 140],
      isActive: true
    },

    // Panorama Bar Style
    {
      id: 'panorama_001',
      name: 'Panorama Bar: Sunday Sessions',
      description: 'The uplifting sound of Panorama Bar. House and techno for the morning after.',
      genre: 'House/Techno',
      style: 'Panorama Bar Style',
      trackCount: 65,
      followerCount: 13680,
      duration: '5h 24m',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX5Ejj0EkURtP',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX5Ejj0EkURtP',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
      curator: 'Panorama Collective',
      tags: ['panorama bar', 'uplifting', 'morning', 'berghain'],
      bpmRange: [120, 130],
      isActive: true
    },

    // Movement Style
    {
      id: 'movement_001',
      name: 'Movement Festival Essentials',
      description: 'The sound of Detroit\'s Movement Festival. Past, present, and future.',
      genre: 'Techno',
      style: 'Movement Style',
      trackCount: 88,
      followerCount: 16420,
      duration: '5h 45m',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8FwnYE6PRIf',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8FwnYE6PRIf',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      curator: 'Movement Detroit',
      tags: ['movement', 'festival', 'detroit', 'techno'],
      bpmRange: [120, 135],
      isActive: true
    },

    // CRSSD Style
    {
      id: 'crssd_001',
      name: 'CRSSD Festival Vibes',
      description: 'San Diego\'s CRSSD Festival sound. House and techno by the ocean.',
      genre: 'House/Techno',
      style: 'CRSSD Style',
      trackCount: 76,
      followerCount: 12980,
      duration: '4h 52m',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX1lVhptIYRda',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX1lVhptIYRda',
      imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220c9c412ad?w=400&h=400&fit=crop',
      curator: 'CRSSD Festival',
      tags: ['crssd', 'san diego', 'ocean', 'festival'],
      bpmRange: [118, 130],
      isActive: true
    },

    // LA Compound Style
    {
      id: 'compound_001',
      name: 'LA Compound Sessions',
      description: 'The underground warehouse sound of LA. Raw, industrial, and uncompromising.',
      genre: 'Techno',
      style: 'LA Compound Style',
      trackCount: 61,
      followerCount: 7890,
      duration: '4h 18m',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX9GRpeH4hY7X',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX9GRpeH4hY7X',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
      curator: 'LA Underground',
      tags: ['compound', 'warehouse', 'industrial', 'los angeles'],
      bpmRange: [128, 138],
      isActive: true
    }
  ];

  async getUndergroundPlaylists(): Promise<SpotifyPlaylist[]> {
    return this.undergroundPlaylists.filter(playlist => playlist.isActive);
  }

  async getPlaylistsByStyle(style: string): Promise<SpotifyPlaylist[]> {
    return this.undergroundPlaylists.filter(playlist => 
      playlist.style.toLowerCase().includes(style.toLowerCase()) && playlist.isActive
    );
  }

  async getPlaylistsByGenre(genre: string): Promise<SpotifyPlaylist[]> {
    return this.undergroundPlaylists.filter(playlist => 
      playlist.genre.toLowerCase().includes(genre.toLowerCase()) && playlist.isActive
    );
  }

  async getFeaturedPlaylists(): Promise<SpotifyPlaylist[]> {
    // Return top 6 most followed playlists
    return this.undergroundPlaylists
      .filter(playlist => playlist.isActive)
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, 6);
  }

  async getPlaylistById(id: string): Promise<SpotifyPlaylist | undefined> {
    return this.undergroundPlaylists.find(playlist => playlist.id === id && playlist.isActive);
  }

  async getStyleStats(): Promise<{ style: string; count: number; totalFollowers: number }[]> {
    const styleStats: Record<string, { count: number; totalFollowers: number }> = {};

    this.undergroundPlaylists
      .filter(playlist => playlist.isActive)
      .forEach(playlist => {
        const style = playlist.style;
        if (!styleStats[style]) {
          styleStats[style] = { count: 0, totalFollowers: 0 };
        }
        styleStats[style].count++;
        styleStats[style].totalFollowers += playlist.followerCount;
      });

    return Object.entries(styleStats)
      .map(([style, stats]) => ({ style, ...stats }))
      .sort((a, b) => b.totalFollowers - a.totalFollowers);
  }

  async searchPlaylists(query: string): Promise<SpotifyPlaylist[]> {
    const lowerQuery = query.toLowerCase();
    return this.undergroundPlaylists.filter(playlist => 
      playlist.isActive && (
        playlist.name.toLowerCase().includes(lowerQuery) ||
        playlist.description.toLowerCase().includes(lowerQuery) ||
        playlist.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        playlist.style.toLowerCase().includes(lowerQuery) ||
        playlist.genre.toLowerCase().includes(lowerQuery)
      )
    );
  }
}

export const spotifyService = new SpotifyService();