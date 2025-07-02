/**
 * Meme Maker API Service
 * Integrates with https://mememaker.github.io/API/ for meme templates and generation
 */

export interface MemeTemplate {
  ID: number;
  name: string;
  image: string;
  topText?: string;
  bottomText?: string;
  tags: string;
  detail?: string;
  thumb?: string;
  rank?: number;
  submissions?: MemeSubmission[];
}

export interface MemeSubmission {
  topText: string;
  bottomText: string;
  dateCreated: string;
  memeID?: number;
}

export interface MemeMakerResponse<T> {
  code: number;
  data: T;
  message: string;
  next?: string;
}

export interface GeneratedMeme {
  id: number;
  name: string;
  image: string;
  topText: string;
  bottomText: string;
  generatedAt: Date;
}

class MemeMakerService {
  private readonly baseUrl = '/api';

  /**
   * Get all available meme templates
   */
  async getAllMemes(page: number = 1): Promise<MemeTemplate[]> {
    try {
      const url = `${this.baseUrl}/meme-templates${page > 1 ? `?page=${page}` : ''}`;
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch memes: ${response.statusText}`);
      }

      const result: MemeMakerResponse<MemeTemplate[]> = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || 'Failed to fetch memes');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching memes:', error);
      throw error;
    }
  }

  /**
   * Get a specific meme template by ID
   */
  async getMeme(id: number): Promise<MemeTemplate | null> {
    try {
      const response = await fetch(`${this.baseUrl}/meme-templates/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch meme: ${response.statusText}`);
      }

      const result: MemeMakerResponse<MemeTemplate> = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || 'Failed to fetch meme');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching meme:', error);
      throw error;
    }
  }

  /**
   * Get submissions for a specific meme
   */
  async getMemeSubmissions(memeId: number): Promise<MemeSubmission[]> {
    try {
      const response = await fetch(`${this.baseUrl}/meme-templates/${memeId}/submissions`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.statusText}`);
      }

      const result: MemeMakerResponse<MemeSubmission[]> = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || 'Failed to fetch submissions');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  }

  /**
   * Submit a new meme creation (without saving to API)
   */
  async submitMeme(memeId: number, topText: string, bottomText: string): Promise<MemeSubmission> {
    const submission: MemeSubmission = {
      topText,
      bottomText,
      dateCreated: new Date().toISOString(),
      memeID: memeId
    };

    // Note: We're not actually posting to the API since we don't have credentials
    // This method creates a local submission object for use in our app
    return submission;
  }

  /**
   * Generate a meme URL with text overlay (using a simple image generation approach)
   */
  async generateMemeUrl(template: MemeTemplate, topText: string, bottomText: string): Promise<string> {
    // For now, we'll return the original image URL
    // In a production app, you might use a service like imgflip.com or canvas generation
    return template.image;
  }

  /**
   * Get popular/trending memes
   */
  async getTrendingMemes(): Promise<MemeTemplate[]> {
    const memes = await this.getAllMemes(1);
    
    // Filter and sort by popularity indicators
    return memes
      .filter(meme => meme.tags && meme.name)
      .sort((a, b) => (b.rank || 0) - (a.rank || 0))
      .slice(0, 12); // Top 12 trending memes
  }

  /**
   * Search memes by name or tags
   */
  async searchMemes(query: string): Promise<MemeTemplate[]> {
    const allMemes = await this.getAllMemes(1);
    const lowerQuery = query.toLowerCase();
    
    return allMemes.filter(meme => 
      meme.name.toLowerCase().includes(lowerQuery) ||
      meme.tags.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get underground/music-themed memes
   */
  async getUndergroundMemes(): Promise<MemeTemplate[]> {
    const allMemes = await this.getAllMemes(1);
    
    // Filter for memes that could work well with underground music themes
    const musicKeywords = ['drake', 'guy', 'brain', 'interesting', 'grumpy', 'success', 'fry', 'woman', 'batman'];
    
    return allMemes.filter(meme => 
      musicKeywords.some(keyword => 
        meme.name.toLowerCase().includes(keyword) ||
        meme.tags.toLowerCase().includes(keyword)
      )
    ).slice(0, 8);
  }
}

export const memeMakerService = new MemeMakerService();