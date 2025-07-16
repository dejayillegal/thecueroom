// server/services/newsService.ts
// @ts-nocheck

import Parser from 'rss-parser';
import { storage } from '../storage';

interface NewsSource {
  name: string;
  url: string;
  category: string;
  region?: string;
}

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  guid?: string;
}

class NewsService {
  private parser: Parser;
  private sources: NewsSource[] = [
    // Global Electronic Music Sources
    { name: 'Resident Advisor', url: 'https://ra.co/xml/rss.xml', category: 'Electronic' },
    { name: 'Mixmag', url: 'https://mixmag.net/rss.xml', category: 'Electronic' },
    { name: 'DJ Mag', url: 'https://djmag.com/rss.xml', category: 'Electronic' },
    { name: 'Dancing Astronaut', url: 'https://dancingastronaut.com/feed/', category: 'Electronic' },
    { name: 'EDM.com', url: 'https://edm.com/feed', category: 'Electronic' },
    { name: 'We Rave You', url: 'https://weraveyou.com/feed/', category: 'Electronic' },
    { name: 'Your EDM', url: 'https://youredm.com/feed/', category: 'Electronic' },
    { name: 'Disco Vinyl', url: 'https://feeds.feedburner.com/DiscoVinyl', category: 'House' },
    { name: 'EDM Identity', url: 'https://edmidentity.com/feed/', category: 'Electronic' },
    { name: 'EDM Sauce', url: 'https://www.edmsauce.com/feed/', category: 'Electronic' },
    { name: 'Techno Airlines', url: 'https://www.technoairlines.com/feed', category: 'Techno' },
    { name: 'No Dough Music', url: 'https://www.nodoughmusic.com/feed/', category: 'House' },
    { name: 'Web Radio House Music', url: 'https://webradiohousemusic.blogspot.com/feeds/posts/default?alt=rss', category: 'House' },
    { name: 'The Techno Kittens', url: 'https://thetechnokittens.com/feed/?x=1', category: 'Techno' },
    { name: '5 Magazine', url: 'https://5mag.net/category/news/feed/', category: 'Electronic' },
    { name: 'Acid Ted', url: 'https://acidted.wordpress.com/feed/', category: 'Electronic' },
    { name: 'Deep House Amsterdam', url: 'https://www.deephouseamsterdam.com/feed/', category: 'Deep House' },
    { name: 'Soundplate', url: 'https://soundplate.com/feed/', category: 'Electronic' },
    { name: 'Deeper Shades of House', url: 'https://feeds.feedburner.com/DeeperShadesOfHouse', category: 'House' },
    { name: 'Fresh New Tracks', url: 'https://freshnewtracks.com/category/house/feed/', category: 'House' },

    // Techno & House Focused
    { name: 'Beatport News', url: 'https://news.beatport.com/feed/', category: 'Techno/House' },
    { name: 'Data Transmission', url: 'https://datatransmission.co/feed/', category: 'Techno/House' },
    { name: 'When We Dip', url: 'https://whenwedip.com/feed/', category: 'Deep House' },
    { name: 'This Song Is Sick', url: 'https://thissongsick.com/feed/', category: 'Electronic' },
    { name: 'EARMILK', url: 'https://earmilk.com/feed/', category: 'Electronic' },

    // Underground & Alternative
    { name: 'XLR8R', url: 'https://xlr8r.com/feed/', category: 'Underground' },
    { name: 'The Quietus', url: 'https://thequietus.com/feed', category: 'Alternative' },
    { name: 'Electronic Beats', url: 'https://electronicbeats.net/feed/', category: 'Electronic' },
    { name: 'FACT Magazine', url: 'https://www.factmag.com/feed/', category: 'Electronic' },

    // Industry & Business
    { name: 'Music Industry How To', url: 'https://www.musicindustryhowto.com/feed/', category: 'Industry' },
    { name: 'Digital Music News', url: 'https://www.digitalmusicnews.com/feed/', category: 'Industry' },
    { name: 'Music Business Worldwide', url: 'https://www.musicbusinessworldwide.com/feed/', category: 'Industry' },

    // Indian & Asian Music Sources
    { name: 'Rolling Stone India', url: 'https://rollingstoneindia.com/feed/', category: 'Music', region: 'India' },
    { name: 'NH7 Bacardi', url: 'https://nh7.in/feed/', category: 'Music', region: 'India' },
    { name: 'Homegrown India', url: 'https://homegrown.co.in/feed/', category: 'Music', region: 'India' },
    { name: 'Wild City', url: 'https://wildcity.com/feed/', category: 'Electronic', region: 'Asia' },
    { name: 'Magnetic Magazine Asia', url: 'https://magneticmag.com/feed/', category: 'Electronic', region: 'Asia' },
    { name: 'Time Out Mumbai', url: 'https://www.timeout.com/mumbai/feed/', category: 'Culture', region: 'India' },
    { name: 'Time Out Delhi', url: 'https://www.timeout.com/delhi/feed/', category: 'Culture', region: 'India' },
    { name: 'Bangalore Mirror Music', url: 'https://bangaloremirror.indiatimes.com/rss.cms', category: 'Music', region: 'India' },

    // Label & Platform News
    { name: 'Anjunabeats', url: 'https://www.anjunabeats.com/feed/', category: 'Label' },
    { name: 'Spinnin Records', url: 'https://www.spinninrecords.com/feed/', category: 'Label' },
    { name: 'Monstercat', url: 'https://www.monstercat.com/feed/', category: 'Label' },

    // European Electronic Music Sources
    { name: 'De:Bug Germany', url: 'https://de-bug.de/feed/', category: 'Electronic', region: 'Europe' },
    { name: 'Groove Magazine', url: 'https://groove.de/feed/', category: 'Electronic', region: 'Europe' },
    { name: 'Rewind Italy', url: 'https://rewinditaly.com/feed/', category: 'Electronic', region: 'Europe' },
    { name: 'Clubbing Spain', url: 'https://clubbingspain.com/feed/', category: 'Club', region: 'Europe' },
    { name: 'DJ Mag UK', url: 'https://djmag.com/rss.xml', category: 'Electronic', region: 'Europe' },
    { name: 'Techno Station', url: 'https://techno-station.com/feed/', category: 'Techno', region: 'Europe' },
    { name: 'Music Radar Europe', url: 'https://www.musicradar.com/news/tech/rss', category: 'Technology', region: 'Europe' },
    { name: 'Future Music', url: 'https://www.musicradar.com/futuremusic/rss', category: 'Production', region: 'Europe' },

    // Technology & Production
    { name: 'Attack Magazine', url: 'https://www.attackmagazine.com/feed/', category: 'Production' },
    { name: 'Computer Music', url: 'https://www.musicradar.com/computermusic/rss', category: 'Production' },
    { name: 'Point Blank Music School', url: 'https://www.pointblankmusicschool.com/feed/', category: 'Education' },
    { name: 'Ableton Blog', url: 'https://blog.ableton.com/feed/', category: 'Production' },
    { name: 'Native Instruments Blog', url: 'https://blog.native-instruments.com/feed/', category: 'Production' },
    { name: 'Splice Sounds Blog', url: 'https://splice.com/blog/feed/', category: 'Production' },
    { name: 'Producer Hive', url: 'https://producerhive.com/feed/', category: 'Production' },
    { name: 'LANDR Blog', url: 'https://blog.landr.com/feed/', category: 'Production' },
  ];

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'TheCueRoom/1.0 (+https://thecueroom.com)'
      }
    });
  }

  async fetchAllNews(): Promise<void> {
    console.log(`Fetching news from ${this.sources.length} sources...`);
    
    const fetchPromises = this.sources.map(source =>
      this.fetchFromSource(source).catch(error => {
        console.error(`Failed to fetch from ${source.name}:`, (error as Error).message);
        return [];
      })
    );

    const results = await Promise.allSettled(fetchPromises);
    
    let totalFetched = 0;
    let totalSaved = 0;
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const articles = result.value;
        totalFetched += articles.length;
        for (const article of articles) {
          try {
            await this.saveArticle(article);
            totalSaved++;
          } catch {
            // Skip duplicates or invalid articles
          }
        }
      }
    }
    
    console.log(`Fetched ${totalFetched} articles, saved ${totalSaved} new articles`);
  }

  private async fetchFromSource(source: NewsSource): Promise<any[]> {
    try {
      const feed = await this.parser.parseURL(source.url);
      
      return feed.items.slice(0, 10).map((item: RSSItem) => ({
        title: this.cleanText(item.title || ''),
        content: this.cleanText(item.contentSnippet || item.content || ''),
        url: item.link || '',
        source: source.name,
        category: source.category,
        region: source.region,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        guid: item.guid || item.link || '',
      })).filter(article => 
        article.title && 
        article.url && 
        this.isRelevantContent(article.title, article.content)
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`RSS fetch failed for ${source.name}: ${message}`);
    }
  }

  private isRelevantContent(title: string, content: string): boolean {
    const relevantKeywords = [
      'techno', 'house', 'electronic', 'dance', 'edm', 'trance', 'dubstep', 
      'drum and bass', 'ambient', 'downtempo', 'deep house', 'tech house',
      'minimal', 'progressive', 'electro', 'acid', 'breakbeat', 'garage',
      'dj', 'producer', 'artist', 'label', 'release', 'album', 'ep', 'single',
      'remix', 'mix', 'set', 'performance', 'live', 'concert', 'festival',
      'club', 'venue', 'studio', 'production', 'mastering', 'mixing',
      'synthesizer', 'drum machine', 'sampler', 'sequencer', 'daw', 'plugin',
      'vst', 'midi', 'analog', 'digital', 'modular', 'hardware', 'software',
      'underground', 'scene', 'culture', 'community', 'rave', 'party',
      'nightlife', 'radio', 'podcast', 'stream', 'vinyl', 'record',
      'spotify', 'soundcloud', 'beatport', 'bandcamp', 'mixcloud', 'youtube',
      'apple music', 'tidal'
    ];

    const text = (title + ' ' + content).toLowerCase();
    return relevantKeywords.some(keyword => text.includes(keyword));
  }

  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000);
  }

  private async saveArticle(article: any): Promise<void> {
    const existing = await storage.getNewsArticles(1, 0);
    const isDuplicate = existing.some(a => a.url === article.url || a.title === article.title);
    if (isDuplicate) return;

    await storage.createNewsArticle({
      title: article.title,
      content: article.content,
      url: article.url,
      source: article.source,
      publishedAt: article.publishedAt,
      imageUrl: null,
    });
  }

  async getSourceStats(): Promise<{ source: string; count: number }[]> {
    const articles = await storage.getNewsArticles(1000, 0);
    const stats: Record<string, number> = {};
    for (const a of articles) {
      stats[a.source] = (stats[a.source] || 0) + 1;
    }
    return Object.entries(stats)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }

  async updateSpotlightArticles(): Promise<void> {
    const articles = await storage.getNewsArticles(50, 0);
    const spotlightCandidates = articles
      .filter(article => {
        if (!article.publishedAt) return false;
        const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
        return hoursOld < 72;
      })
      .slice(0, 5);

    const spotlightIds = spotlightCandidates.map(a => a.id);
    await storage.updateSpotlightNews(spotlightIds);
  }

  async refreshNewsFeeds(): Promise<void> {
    await this.fetchAllNews();
    await this.updateSpotlightArticles();
  }
}

export const newsService = new NewsService();
