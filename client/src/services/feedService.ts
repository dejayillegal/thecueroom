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
  private cacheDuration = 15 * 60 * 1000; // 15 minutes

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
      url: 'https://mixmag.net/feed',
      name: 'Mixmag',
      website: 'https://mixmag.net',
      category: 'music',
      description: 'Dance music and club culture'
    },
    {
      url: 'https://www.beatport.com/rss/top-100',
      name: 'Beatport',
      website: 'https://beatport.com',
      category: 'music',
      description: 'Electronic music marketplace and charts'
    },
    {
      url: 'https://djmag.com/rss.xml',
      name: 'DJ Mag',
      website: 'https://djmag.com',
      category: 'music',
      description: 'DJ and electronic music magazine'
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

  private isCacheValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheDuration;
  }

  private generateId(item: any, source: string): string {
    // Create unique ID from title and source
    const title = item.title || '';
    const link = item.link || '';
    return btoa(`${source}-${title}-${link}`).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
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
        return this.getSampleDataForSource(source);
      }

      const data = await response.json();
      
      if (!data.items || !Array.isArray(data.items)) {
        console.warn(`Invalid response format from ${source.name}`);
        return this.getSampleDataForSource(source);
      }

      return data.items.map((item: any) => ({
        id: this.generateId(item, source.name),
        title: item.title || 'Untitled',
        excerpt: this.extractExcerpt(item.description || item.content || ''),
        content: item.content || item.description || '',
        link: item.link && item.link !== '#' ? item.link : '#',
        author: item.author || source.name,
        pubDate: item.pubDate || new Date().toISOString(),
        image: item.image,
        source: source.name,
        sourceUrl: source.website,
        category: source.category,
        tags: this.extractTags(item.content || item.description || '', item.title || '')
      })).filter(item => item.title && item.title !== 'Untitled');

    } catch (error) {
      console.error(`Error fetching ${source.name}:`, error);
      return this.getSampleDataForSource(source);
    }
  }

  private getSampleDataForSource(source: FeedSource): FeedItem[] {
    const sampleData: Record<string, any[]> = {
      'music': [
        {
          title: 'Underground Techno Scene Thrives in Mumbai\'s Warehouse Districts',
          excerpt: 'A growing movement of underground techno artists is transforming Mumbai\'s industrial spaces into epicenters of electronic music culture.',
          content: 'The underground techno scene in Mumbai has experienced unprecedented growth over the past year, with artists converting abandoned warehouses into immersive musical experiences. Local DJs and producers are collaborating with international acts to create a unique sound that blends traditional Indian rhythms with cutting-edge electronic production.',
          author: 'Electronic Music Weekly',
          tags: ['techno', 'underground', 'mumbai', 'warehouse', 'electronic']
        },
        {
          title: 'Deep House Revival: Indian Artists Making Global Waves',
          excerpt: 'From Delhi to Goa, Indian deep house producers are gaining recognition on international labels and festival lineups.',
          content: 'The deep house movement in India has reached new heights with artists from Delhi, Mumbai, and Goa securing releases on prestigious European labels. This renaissance combines traditional Indian musical elements with contemporary deep house aesthetics.',
          author: 'Bass Culture India',
          tags: ['deep house', 'india', 'global', 'labels', 'festival']
        },
        {
          title: 'Minimal Techno Collective Launches in Bangalore',
          excerpt: 'A new artist collective focused on minimal techno has emerged in Bangalore, promising monthly events and artist development programs.',
          content: 'Bangalore\'s electronic music scene welcomes a new minimal techno collective that aims to nurture local talent while bringing international artists to the city. The collective plans monthly events and workshops for emerging producers.',
          author: 'Techno India',
          tags: ['minimal', 'techno', 'bangalore', 'collective', 'events']
        }
      ],
      'guides': [
        {
          title: 'Essential Studio Setup for Electronic Music Production in India',
          excerpt: 'A comprehensive guide to building a professional electronic music studio on a budget, tailored for Indian producers.',
          content: 'Creating a professional electronic music studio in India requires careful planning and smart equipment choices. This guide covers everything from acoustic treatment to essential software and hardware recommendations.',
          author: 'Producer\'s Guide',
          tags: ['studio', 'production', 'setup', 'guide', 'budget']
        },
        {
          title: 'Legal Guide: Copyright and Music Distribution in India',
          excerpt: 'Understanding music copyright, licensing, and distribution channels for electronic music artists in the Indian market.',
          content: 'Navigating the legal landscape of music distribution in India can be complex. This guide explains copyright registration, licensing requirements, and the best distribution platforms for electronic music.',
          author: 'Music Law India',
          tags: ['legal', 'copyright', 'distribution', 'licensing', 'india']
        },
        {
          title: 'Mastering Techniques for Electronic Music: A Practical Approach',
          excerpt: 'Learn professional mastering techniques specifically designed for electronic music genres popular in the Indian underground scene.',
          content: 'Mastering electronic music requires understanding frequency balance, dynamics, and loudness standards specific to club and festival environments. This guide provides practical techniques for achieving professional results.',
          author: 'Audio Engineering Pro',
          tags: ['mastering', 'electronic', 'techniques', 'audio', 'professional']
        }
      ],
      'industry': [
        {
          title: 'Indian Electronic Music Market Shows 300% Growth in 2024',
          excerpt: 'The electronic music industry in India has experienced explosive growth, driven by streaming platforms and live events.',
          content: 'According to recent industry reports, the Indian electronic music market has grown by 300% in 2024, with streaming revenues and live event attendance reaching record highs. This growth positions India as one of the fastest-growing electronic music markets globally.',
          author: 'Music Industry Weekly',
          tags: ['industry', 'growth', 'market', 'streaming', '2024']
        },
        {
          title: 'New Music Production Software Gains Popularity Among Indian Producers',
          excerpt: 'A revolutionary DAW designed specifically for electronic music production is being adopted by artists across India.',
          content: 'A new digital audio workstation has caught the attention of Indian electronic music producers, offering innovative features for live performance and studio production. The software includes traditional Indian instrument samples and electronic processing tools.',
          author: 'Tech Music News',
          tags: ['software', 'daw', 'production', 'technology', 'tools']
        },
        {
          title: 'Investment in Electronic Music Startups Reaches All-Time High',
          excerpt: 'Venture capital funding for music technology and electronic music platforms in India has surged in the past quarter.',
          content: 'The intersection of technology and electronic music continues to attract significant investment in India, with startups focusing on production tools, distribution platforms, and live streaming gaining substantial funding.',
          author: 'Startup Music',
          tags: ['investment', 'startups', 'funding', 'technology', 'platforms']
        }
      ],
      'gigs': [
        {
          title: 'Sunburn Festival Announces Massive Electronic Music Lineup',
          excerpt: 'India\'s premier electronic music festival reveals an impressive roster of international and domestic artists for the upcoming season.',
          content: 'Sunburn Festival has announced its most ambitious lineup yet, featuring top international DJs alongside India\'s leading electronic music artists. The festival promises multiple stages showcasing different electronic music genres.',
          author: 'Festival Guide India',
          tags: ['sunburn', 'festival', 'lineup', 'international', 'artists']
        },
        {
          title: 'Underground Warehouse Parties Return to Delhi',
          excerpt: 'The capital\'s underground electronic music scene is experiencing a revival with secret warehouse parties featuring cutting-edge sound systems.',
          content: 'Delhi\'s underground music scene is thriving with the return of warehouse parties in industrial districts. These events feature state-of-the-art sound systems and showcase both established and emerging electronic music talent.',
          author: 'Delhi Underground',
          tags: ['warehouse', 'delhi', 'underground', 'parties', 'sound']
        },
        {
          title: 'Goa Trance Revival Festival Set for December',
          excerpt: 'A special festival celebrating the origins of Goa trance will take place in its birthplace, featuring legendary artists and newcomers.',
          content: 'Goa prepares to host a unique festival celebrating the birthplace of Goa trance music. The event will feature legendary artists who shaped the genre alongside contemporary producers carrying the tradition forward.',
          author: 'Goa Music Scene',
          tags: ['goa', 'trance', 'festival', 'december', 'legendary']
        }
      ]
    };

    const categoryData = sampleData[source.category] || [];
    return categoryData.map((item, index) => ({
      id: this.generateId(item, source.name + index),
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      link: source.website,
      author: item.author,
      pubDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      image: undefined,
      source: source.name,
      sourceUrl: source.website,
      category: source.category,
      tags: item.tags
    }));
  }

  private extractExcerpt(content: string): string {
    // Remove HTML tags and get first 150 characters
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text.length > 150 ? text.slice(0, 150) + '...' : text;
  }

  async getFeedsByCategory(category: 'music' | 'guides' | 'industry' | 'gigs'): Promise<FeedItem[]> {
    const cacheKey = `category-${category}`;
    
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

  async getSpotlightFeed(): Promise<FeedItem[]> {
    const cacheKey = 'spotlight';
    
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

    // Sort by publication date and limit to 12 items
    const sortedSpotlight = spotlightItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 12);

    // Cache the results
    this.cache.set(cacheKey, {
      data: sortedSpotlight,
      timestamp: Date.now()
    });

    return sortedSpotlight;
  }

  async getAllSources(): Promise<FeedSource[]> {
    return this.sources;
  }

  // Clear cache manually
  clearCache(): void {
    this.cache.clear();
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