import { storage } from '../storage';

interface BandcampTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  url: string;
  imageUrl?: string;
  genre: string;
  tags: string[];
  price?: number;
  releaseDate?: Date;
}

interface BandcampTrending {
  tracks: BandcampTrack[];
  lastUpdated: Date;
}

export class BandcampService {
  private readonly genres = [
    'electronic',
    'techno',
    'house',
    'ambient',
    'experimental',
    'industrial',
    'breakbeat',
    'drum-and-bass',
    'dubstep',
    'synthwave'
  ];

  async isEnabled(): Promise<boolean> {
    const settings = await storage.getBandcampSettings();
    return settings?.isEnabled ?? true;
  }

  async isTrendingEnabled(): Promise<boolean> {
    const settings = await storage.getBandcampSettings();
    return settings?.trendingEnabled ?? true;
  }

  async isSpotlightEnabled(): Promise<boolean> {
    const settings = await storage.getBandcampSettings();
    return settings?.spotlightEnabled ?? true;
  }

  async getTrendingTracks(): Promise<BandcampTrending> {
    if (!(await this.isTrendingEnabled())) {
      return { tracks: [], lastUpdated: new Date() };
    }

    // Simulated trending tracks for underground electronic music
    const trendingTracks: BandcampTrack[] = [
      {
        id: 'bc_001',
        title: 'Acid Dreams',
        artist: 'Underground Collective',
        album: 'Deep Cuts Vol. 1',
        url: 'https://bandcamp.com/track/acid-dreams',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        genre: 'acid techno',
        tags: ['acid', 'techno', 'underground', '303'],
        price: 1.50,
        releaseDate: new Date('2024-12-01')
      },
      {
        id: 'bc_002',
        title: 'Mumbai Bass',
        artist: 'Desi Frequencies',
        url: 'https://bandcamp.com/track/mumbai-bass',
        imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220c9c412ad?w=300&h=300&fit=crop',
        genre: 'bass',
        tags: ['bass', 'mumbai', 'indian', 'electronic'],
        price: 2.00,
        releaseDate: new Date('2024-11-28')
      },
      {
        id: 'bc_003',
        title: 'Bangalore Nights',
        artist: 'Silicon Valley Sounds',
        album: 'Tech City',
        url: 'https://bandcamp.com/track/bangalore-nights',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
        genre: 'deep house',
        tags: ['deep house', 'bangalore', 'night', 'ambient'],
        price: 1.75,
        releaseDate: new Date('2024-11-25')
      },
      {
        id: 'bc_004',
        title: 'Minimal Monsoon',
        artist: 'Rain Patterns',
        url: 'https://bandcamp.com/track/minimal-monsoon',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        genre: 'minimal techno',
        tags: ['minimal', 'techno', 'monsoon', 'atmospheric'],
        price: 1.25,
        releaseDate: new Date('2024-11-20')
      },
      {
        id: 'bc_005',
        title: 'Goa Trance Revival',
        artist: 'Psychedelic Collective',
        album: 'New Age Goa',
        url: 'https://bandcamp.com/track/goa-trance-revival',
        imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220c9c412ad?w=300&h=300&fit=crop',
        genre: 'psytrance',
        tags: ['goa', 'trance', 'psychedelic', 'revival'],
        price: 2.50,
        releaseDate: new Date('2024-11-15')
      }
    ];

    return {
      tracks: trendingTracks,
      lastUpdated: new Date()
    };
  }

  async getSpotlightTracks(): Promise<BandcampTrack[]> {
    if (!(await this.isSpotlightEnabled())) {
      return [];
    }

    const trending = await this.getTrendingTracks();
    return trending.tracks.slice(0, 3); // Top 3 for spotlight
  }

  async searchByGenre(genre: string): Promise<BandcampTrack[]> {
    const trending = await this.getTrendingTracks();
    return trending.tracks.filter(track => 
      track.genre.toLowerCase().includes(genre.toLowerCase()) ||
      track.tags.some(tag => tag.toLowerCase().includes(genre.toLowerCase()))
    );
  }

  async getGenreStats(): Promise<{ genre: string; count: number }[]> {
    const trending = await this.getTrendingTracks();
    const genreCount: Record<string, number> = {};

    trending.tracks.forEach(track => {
      const genre = track.genre;
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });

    return Object.entries(genreCount)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);
  }

  async refreshTrendingData(): Promise<void> {
    console.log('Refreshing Bandcamp trending data...');
    // In a real implementation, this would fetch from Bandcamp API
    // For now, we simulate the refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Bandcamp trending data refreshed');
  }
}

export const bandcampService = new BandcampService();
