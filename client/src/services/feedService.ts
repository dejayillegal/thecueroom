/**
 * Feed Service for RSS-based News Aggregation
 * Handles category-based content feeds with caching and API integration
 */

export interface FeedItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  link: string;
  author?: string;
  pubDate: string;
  image?: string;
  source: string;
  sourceUrl: string;
  category: 'music' | 'guides' | 'industry' | 'gigs';
  tags?: string[];
}

export interface FeedSource {
  url: string;
  name: string;
  website: string;
  category: 'music' | 'guides' | 'industry' | 'gigs';
  description: string;
}

import { apiRequest } from "@/lib/queryClient";

class FeedService {
  private cache = new Map<string, { data: FeedItem[]; timestamp: number }>();
  private cacheDuration = 60 * 60 * 1000; // 1 hour
  private customSourcesLoaded = false;

  // Major electronic music RSS sources categorized
  private sources: FeedSource[] = [
    // Music Category
    {
      url: 'https://ra.co/rss',
      name: 'Resident Advisor',
      website: 'https://ra.co',
      category: 'music',
      description: 'Electronic music news and reviews'
    },
    {
      url: 'https://mixmag.net/rss.xml',
      name: 'Mixmag',
      website: 'https://mixmag.net',
      category: 'music',
      description: 'Dance music and club culture'
    },
    {
      url: 'http://api.beatport.com/catalog/most-popular/?locale=en_US&page=1&perPage=100&format=rss&type=track&genre=12&v=1.0',
      name: 'Beatport',
      website: 'https://beatport.com',
      category: 'music',
      description: 'Beatport most popular tracks'
    },
    {
      url: 'https://feeds.feedburner.com/DJmag-LatestNews',
      name: 'DJ Mag',
      website: 'https://djmag.com',
      category: 'music',
      description: 'DJ Mag latest news'
    },
    {
      url: 'https://weraveyou.com/category/news/feed/',
      name: 'We Rave You - News',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'Latest electronic music news'
    },
    {
      url: 'https://weraveyou.com/category/featured/feed/',
      name: 'We Rave You - Featured',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'Featured articles'
    },
    {
      url: 'https://weraveyou.com/category/editorials/feed/',
      name: 'We Rave You - Editorials',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'Editorial content'
    },
    {
      url: 'https://weraveyou.com/category/interviews/feed/',
      name: 'We Rave You - Interviews',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'Artist interviews'
    },
    {
      url: 'https://weraveyou.com/category/music/feed/',
      name: 'We Rave You - All Music',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'All music news'
    },
    {
      url: 'https://weraveyou.com/category/house/feed/',
      name: 'We Rave You - House',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'House music news'
    },
    {
      url: 'https://weraveyou.com/category/progressive-house/feed/',
      name: 'We Rave You - Progressive House',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'Progressive house releases'
    },
    {
      url: 'https://weraveyou.com/category/deep-house/feed/',
      name: 'We Rave You - Deep House',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'Deep house releases'
    },
    {
      url: 'https://weraveyou.com/category/future-house/feed/',
      name: 'We Rave You - Future House',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'Future house releases'
    },
    {
      url: 'https://weraveyou.com/category/tropical-house/feed/',
      name: 'We Rave You - Tropical House',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'Tropical house releases'
    },
    {
      url: 'https://weraveyou.com/category/tech-house/feed/',
      name: 'We Rave You - Tech House',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'Tech house releases'
    },
    {
      url: 'https://weraveyou.com/category/techno/feed/',
      name: 'We Rave You - Techno',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'Techno releases'
    },
    {
      url: 'https://weraveyou.com/category/trance/feed/',
      name: 'We Rave You - Trance',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'Trance releases'
    },
    {
      url: 'https://daily-beat.com/feed/',
      name: 'Daily Beat',
      website: 'https://daily-beat.com',
      category: 'music',
      description: 'Latest electronic music news'
    },
    {
      url: 'https://raverrafting.com/feed/',
      name: 'RaverRafting',
      website: 'https://raverrafting.com',
      category: 'music',
      description: 'Dance music culture and news'
    },
    {
      url: 'https://hardstylemag.com/feed/',
      name: 'Hardstyle Mag',
      website: 'https://hardstylemag.com',
      category: 'music',
      description: 'Hardstyle releases and features'
    },
    {
      url: 'https://dancingastronaut.com/feed/',
      name: 'Dancing Astronaut',
      website: 'https://dancingastronaut.com',
      category: 'music',
      description: 'Electronic music news and features'
    },
    {
      url: 'https://edm.com/.rss/full/',
      name: 'EDM.com',
      website: 'https://edm.com',
      category: 'music',
      description: 'Comprehensive EDM news'
    },
    {
      url: 'https://www.mindmusic.online/feed/',
      name: 'Mind Music',
      website: 'https://www.mindmusic.online',
      category: 'music',
      description: 'Underground music updates'
    },
    {
      url: 'https://smashtheclub.com/category/blog/feed/',
      name: 'Smash The Club',
      website: 'https://smashtheclub.com',
      category: 'music',
      description: 'DJ edits and remixes'
    },
    {
      url: 'https://daily.bandcamp.com/feed/',
      name: 'Bandcamp Daily',
      website: 'https://bandcamp.com',
      category: 'music',
      description: 'Bandcamp Daily features'
    },
    {
      url: 'https://weraveyou.com/feed/',
      name: 'We Rave You',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'All We Rave You articles'
    },
    {
      url: 'https://eatsleepedm.com/blog/feed/',
      name: 'Eat Sleep EDM',
      website: 'https://eatsleepedm.com',
      category: 'music',
      description: 'EDM releases and reviews'
    },
    {
      url: 'https://weraveyou.com/category/exclusive/feed/',
      name: 'We Rave You - Exclusive',
      website: 'https://weraveyou.com',
      category: 'music',
      description: 'Exclusive content'
    },
    {
      url: 'https://soundplate.com/feed',
      name: 'Soundplate',
      website: 'https://soundplate.com',
      category: 'music',
      description: 'Electronic music playlists'
    },
    {
      url: 'https://www.technoairlines.com/feed',
      name: 'Techno Airlines',
      website: 'https://www.technoairlines.com',
      category: 'music',
      description: 'Techno news and features'
    },
    {
      url: 'https://edmidentity.com/feed/',
      name: 'EDM Identity',
      website: 'https://edmidentity.com',
      category: 'music',
      description: 'Electronic dance music community news'
    },
    {
      url: 'https://www.edmsauce.com/feed/',
      name: 'EDM Sauce',
      website: 'https://www.edmsauce.com',
      category: 'music',
      description: 'EDM news and releases'
    },
    {
      url: 'https://5mag.net/category/news/feed/',
      name: '5 Magazine',
      website: 'https://5mag.net',
      category: 'music',
      description: 'Chicago house news'
    },
    {
      url: 'https://www.deephouseamsterdam.com/feed/',
      name: 'Deep House Amsterdam',
      website: 'https://www.deephouseamsterdam.com',
      category: 'music',
      description: 'Deep house music news'
    },
    {
      url: 'https://feeds.feedburner.com/DeeperShadesOfHouse',
      name: 'Deeper Shades of House',
      website: 'https://www.deepershades.net',
      category: 'music',
      description: 'Deep house podcasts and news'
    },

    // Industry Category
    {
      url: 'https://www.musictech.net/feed/',
      name: 'MusicTech',
      website: 'https://musictech.net',
      category: 'industry',
      description: 'Music production and technology'
    },
    {
      url: 'https://www.attackmagazine.com/feed/',
      name: 'Attack Magazine',
      website: 'https://attackmagazine.com',
      category: 'industry',
      description: 'Electronic music production tutorials'
    },
    {
      url: 'https://blog.native-instruments.com/feed/',
      name: 'Native Instruments',
      website: 'https://native-instruments.com',
      category: 'industry',
      description: 'Music production software and hardware'
    },
    {
      url: 'https://weraveyou.com/category/industry/feed/',
      name: 'We Rave You - Industry',
      website: 'https://weraveyou.com',
      category: 'industry',
      description: 'Industry news and analysis'
    },
    {
      url: 'https://yourghostproduction.com/feed/',
      name: 'Your Ghost Production',
      website: 'https://yourghostproduction.com',
      category: 'industry',
      description: 'Ghost production industry insights'
    },
    {
      url: 'https://theghostproduction.com/feed/',
      name: 'The Ghost Production',
      website: 'https://theghostproduction.com',
      category: 'industry',
      description: 'Professional ghost production news'
    },
    {
      url: 'https://www.decodedmagazine.com/feed/',
      name: 'Decoded Magazine',
      website: 'https://decodedmagazine.com',
      category: 'industry',
      description: 'Music industry features and interviews'
    },
    {
      url: 'https://idmmag.com/category/regular-content/feed/',
      name: 'IDM Mag',
      website: 'https://idmmag.com',
      category: 'industry',
      description: 'Dance music industry news'
    },

    // Guides Category  
    {
      url: 'https://www.point-blank.co.uk/blog/feed/',
      name: 'Point Blank',
      website: 'https://point-blank.co.uk',
      category: 'guides',
      description: 'Music production education and tutorials'
    },
    {
      url: 'https://www.edmprod.com/feed/',
      name: 'EDMProd',
      website: 'https://edmprod.com',
      category: 'guides',
      description: 'Electronic music production guides'
    },
    {
      url: 'https://djtechtools.com/feed/',
      name: 'DJ TechTools',
      website: 'https://djtechtools.com',
      category: 'guides',
      description: 'DJ gear reviews and tutorials'
    },
    {
      url: 'https://www.synthtopia.com/feed/',
      name: 'Synthtopia',
      website: 'https://www.synthtopia.com',
      category: 'guides',
      description: 'Synth news and production tips'
    },
    {
      url: 'https://romanmusictherapy.com/feed/',
      name: 'Roman Music Therapy',
      website: 'https://romanmusictherapy.com',
      category: 'guides',
      description: 'Music therapy insights and resources'
    },
    {
      url: 'https://www.heartandharmony.com/feed/',
      name: 'Heart and Harmony',
      website: 'https://www.heartandharmony.com',
      category: 'guides',
      description: 'Music therapy blog and news'
    },
    {
      url: 'https://musictherapyed.com/feed/',
      name: 'Music Therapy Ed',
      website: 'https://musictherapyed.com',
      category: 'guides',
      description: 'Music therapy education articles'
    },
    {
      url: 'https://feeds.buzzsprout.com/2101894.rss',
      name: 'The Music Therapy Podcast',
      website: 'https://buzzsprout.com/2101894',
      category: 'guides',
      description: 'Music therapy podcast feed'
    },
    {
      url: 'https://www.hypebot.com/feed',
      name: 'Hypebot',
      website: 'https://www.hypebot.com',
      category: 'guides',
      description: 'Music business tips and trends'
    },
    {
      url: 'https://blog.airgigs.com/feed/',
      name: 'AirGigs Blog',
      website: 'https://blog.airgigs.com',
      category: 'guides',
      description: 'Advice for session musicians'
    },
    {
      url: 'https://musictravelguide.net/feed/',
      name: 'Music Travel Guide',
      website: 'https://musictravelguide.net',
      category: 'guides',
      description: 'Travel tips for touring musicians'
    },
    {
      url: 'https://www.musicianshealthcorner.com/blog/feed',
      name: 'Musicians Health Corner',
      website: 'https://www.musicianshealthcorner.com',
      category: 'guides',
      description: 'Health and wellness advice for musicians'
    },

    // Gigs Category - India Events
    {
      url: 'https://www.residentadvisor.net/events/india/mumbai?view=rss',
      name: 'RA Mumbai',
      website: 'https://ra.co',
      category: 'gigs',
      description: 'Electronic music events in Mumbai'
    },
    {
      url: 'https://www.residentadvisor.net/events/india/bangalore?view=rss',
      name: 'RA Bangalore',
      website: 'https://ra.co',
      category: 'gigs',
      description: 'Electronic music events in Bangalore'
    },
    {
      url: 'https://www.residentadvisor.net/events/india/goa?view=rss',
      name: 'RA Goa',
      website: 'https://ra.co',
      category: 'gigs',
      description: 'Electronic music events in Goa'
    },
    {
      url: 'https://www.residentadvisor.net/events/india/delhi?view=rss',
      name: 'RA Delhi',
      website: 'https://ra.co',
      category: 'gigs',
      description: 'Electronic music events in Delhi'
    },
    {
      url: 'https://www.edmtunes.com/feed/',
      name: 'EDMTunes',
      website: 'https://edmtunes.com',
      category: 'gigs',
      description: 'Electronic music events and festivals'
    }
  ];

  private async loadCustomSources() {
    if (this.customSourcesLoaded) return;
    try {
      const res = await apiRequest('GET', '/api/feeds/custom');
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach((src: FeedSource) => {
          if (!this.sources.some(s => s.url === src.url)) {
            this.sources.push(src);
          }
        });
      }
    } catch (err) {
      console.error('Failed to load custom feeds', err);
    }
    this.customSourcesLoaded = true;
  }

  private isCacheValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheDuration;
  }

  private generateId(item: any, source: string): string {
    // Create unique ID from title and source
    const title = item.title || '';
    const link = item.link || '';
    const combined = `${source}-${title}-${link}`;
    // Encode to base64 safely for UTF-8 strings
    const encoded = btoa(unescape(encodeURIComponent(combined)));
    return encoded.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  }

  private extractTags(content: string, title: string): string[] {
    const tags: Set<string> = new Set();
    
    // Common electronic music terms
    const musicTerms = [
      'techno', 'house', 'minimal', 'deep house', 'tech house', 'progressive',
      'trance', 'ambient', 'breakbeat', 'drum and bass', 'dubstep', 'garage',
      'synthesizer', 'remix', 'mix', 'dj', 'producer', 'label', 'release',
      'album', 'ep', 'single', 'vinyl', 'digital', 'streaming', 'festival',
      'club', 'rave', 'underground', 'dance', 'electronic', 'edm'
    ];

    const text = (title + ' ' + content).toLowerCase();
    
    musicTerms.forEach(term => {
      if (text.includes(term)) {
        tags.add(term);
      }
    });

    return Array.from(tags).slice(0, 5); // Limit to 5 tags
  }

  private async fetchFeedData(source: FeedSource): Promise<FeedItem[]> {
    try {
      const response = await apiRequest(
        'GET',
        `/api/feeds/rss?url=${encodeURIComponent(source.url)}`
      );
      
      if (!response.ok) {
        console.warn(`Failed to fetch ${source.name}: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      
      if (!data.items || !Array.isArray(data.items)) {
        console.warn(`Invalid response format from ${source.name}`);
        return [];
      }

      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

      return data.items
        .map((item: any) => {
          const parsed = new Date(item.pubDate || "");
          const validDate = !isNaN(parsed.getTime()) ? parsed : new Date();

          return {
            id: this.generateId(item, source.name),
            title: item.title || 'Untitled',
            excerpt: this.extractExcerpt(item.description || item.content || ''),
            content: item.content || item.description || '',
            link: item.link && item.link !== '#' ? item.link : '#',
            author: item.author || source.name,
            pubDate: validDate.toISOString(),
            image: item.image,
            source: source.name,
            sourceUrl: source.website,
            category: source.category,
            tags: this.extractTags(item.content || item.description || '', item.title || '')
          } as FeedItem;
        })
        .filter(item => item.title && item.title !== 'Untitled')
        .filter(item => new Date(item.pubDate).getTime() >= twoWeeksAgo);

    } catch (error) {
      console.error(`Error fetching ${source.name}:`, error);
      return [];
    }
  }

  private getSampleDataForSource(_source: FeedSource): FeedItem[] {
    return [];
  }

  private extractExcerpt(content: string): string {
    // Remove HTML tags and get first 150 characters
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text.length > 150 ? text.slice(0, 150) + '...' : text;
  }

  async getFeedsByCategory(category: 'music' | 'guides' | 'industry' | 'gigs'): Promise<FeedItem[]> {
    const cacheKey = `category-${category}`;

    await this.loadCustomSources();
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    const categoryFeeds = this.sources.filter(source => source.category === category);
    const feedPromises = categoryFeeds.map(source => this.fetchFeedData(source));
    
    try {
      const feedResults = await Promise.allSettled(feedPromises);
      const allItems: FeedItem[] = [];

      feedResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allItems.push(...result.value);
        } else {
          console.error(`Failed to fetch ${categoryFeeds[index].name}:`, result.reason);
        }
      });

      // Sort by publication date (newest first)
      const sortedItems = allItems.sort((a, b) => 
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );

      // Cache the results
      this.cache.set(cacheKey, {
        data: sortedItems,
        timestamp: Date.now()
      });

      return sortedItems;

    } catch (error) {
      console.error(`Error fetching ${category} feeds:`, error);
      return [];
    }
  }

  async getSpotlightFeed(maxItems = 8): Promise<FeedItem[]> {
    const cacheKey = `spotlight-${maxItems}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    // Get recent items from all categories
    const [music, guides, industry, gigs] = await Promise.all([
      this.getFeedsByCategory('music'),
      this.getFeedsByCategory('guides'), 
      this.getFeedsByCategory('industry'),
      this.getFeedsByCategory('gigs')
    ]);

    // Mix items from different categories (latest from each)
    const spotlightItems: FeedItem[] = [];
    const maxPerCategory = 3;

    [music, guides, industry, gigs].forEach(categoryItems => {
      spotlightItems.push(...categoryItems.slice(0, maxPerCategory));
    });

    // Sort by publication date
    const sortedSpotlight = spotlightItems.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    const uniqueSpotlight: FeedItem[] = [];
    const seenSources = new Set<string>();
    for (const item of sortedSpotlight) {
      if (!seenSources.has(item.source)) {
        uniqueSpotlight.push(item);
        seenSources.add(item.source);
      }
      if (uniqueSpotlight.length >= maxItems) break;
    }

    // Cache the results
    this.cache.set(cacheKey, {
      data: uniqueSpotlight,
      timestamp: Date.now()
    });

    return uniqueSpotlight;
  }

  async getAllSources(): Promise<FeedSource[]> {
    return this.sources;
  }

  // Clear cache manually
  clearCache(): void {
    this.cache.clear();
  }

  async refreshCustomSources(): Promise<void> {
    this.customSourcesLoaded = false;
    await this.loadCustomSources();
  }

  // Get cache status
  getCacheStatus(): { key: string; itemCount: number; age: number }[] {
    return Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      itemCount: value.data.length,
      age: Date.now() - value.timestamp
    }));
  }
}

export const feedService = new FeedService();
export default feedService;