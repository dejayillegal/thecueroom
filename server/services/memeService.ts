import { aiService } from './aiService';

interface MemeTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  textBoxes: {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    strokeColor: string;
    strokeWidth: number;
    textAlign: 'left' | 'center' | 'right';
  }[];
  category: string;
  popularity: number;
}

export class MemeService {
  private undergroundMusicTemplates: MemeTemplate[] = [
    {
      id: 'ug_001',
      name: 'Techno Producer Struggle',
      description: 'When you spend 8 hours perfecting a hi-hat',
      imageUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#1a1a1a"/>
          <rect x="50" y="50" width="300" height="200" fill="#333" stroke="#666" stroke-width="2"/>
          <circle cx="200" cy="100" r="30" fill="#ff6b6b"/>
          <rect x="150" y="140" width="100" height="20" fill="#4ecdc4"/>
          <rect x="120" y="170" width="160" height="10" fill="#45b7d1"/>
          <rect x="130" y="190" width="140" height="10" fill="#96ceb4"/>
          <text x="200" y="240" text-anchor="middle" fill="white" font-family="Arial" font-size="12">DAW SCREEN</text>
        </svg>
      `),
      textBoxes: [
        {
          x: 10, y: 10, width: 380, height: 30,
          fontSize: 16, fontFamily: 'Arial Black', color: 'white',
          strokeColor: 'black', strokeWidth: 2, textAlign: 'center'
        },
        {
          x: 10, y: 260, width: 380, height: 30,
          fontSize: 16, fontFamily: 'Arial Black', color: 'white',
          strokeColor: 'black', strokeWidth: 2, textAlign: 'center'
        }
      ],
      category: 'production',
      popularity: 95
    },
    {
      id: 'ug_002',
      name: 'Berghain Queue',
      description: 'The eternal wait at Berlin\'s most exclusive club',
      imageUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#2c3e50"/>
          <rect x="350" y="0" width="50" height="300" fill="#34495e"/>
          <rect x="360" y="120" width="30" height="60" fill="#1a1a1a"/>
          <circle cx="100" cy="200" r="15" fill="#f39c12"/>
          <circle cx="150" cy="200" r="15" fill="#e74c3c"/>
          <circle cx="200" cy="200" r="15" fill="#3498db"/>
          <circle cx="250" cy="200" r="15" fill="#2ecc71"/>
          <line x1="50" y1="215" x2="300" y2="215" stroke="#7f8c8d" stroke-width="2"/>
          <text x="200" y="250" text-anchor="middle" fill="white" font-family="Arial" font-size="10">QUEUE</text>
        </svg>
      `),
      textBoxes: [
        {
          x: 10, y: 10, width: 380, height: 30,
          fontSize: 16, fontFamily: 'Arial Black', color: 'white',
          strokeColor: 'black', strokeWidth: 2, textAlign: 'center'
        },
        {
          x: 10, y: 260, width: 380, height: 30,
          fontSize: 16, fontFamily: 'Arial Black', color: 'white',
          strokeColor: 'black', strokeWidth: 2, textAlign: 'center'
        }
      ],
      category: 'club',
      popularity: 88
    },
    {
      id: 'ug_003',
      name: 'DJ Equipment Addiction',
      description: 'When you see new gear but your bank account says no',
      imageUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#ecf0f1"/>
          <rect x="50" y="80" width="300" height="140" fill="#2c3e50" stroke="#34495e" stroke-width="3"/>
          <circle cx="120" cy="150" r="25" fill="#1a1a1a"/>
          <circle cx="200" cy="150" r="25" fill="#1a1a1a"/>
          <circle cx="280" cy="150" r="25" fill="#1a1a1a"/>
          <rect x="100" y="180" width="200" height="15" fill="#e74c3c"/>
          <circle cx="80" cy="250" r="20" fill="#f39c12"/>
          <text x="80" y="255" text-anchor="middle" fill="black" font-family="Arial" font-size="12">$</text>
          <text x="200" y="40" text-anchor="middle" fill="black" font-family="Arial" font-size="12">MUSIC GEAR STORE</text>
        </svg>
      `),
      textBoxes: [
        {
          x: 10, y: 10, width: 380, height: 25,
          fontSize: 14, fontFamily: 'Arial Black', color: 'black',
          strokeColor: 'white', strokeWidth: 2, textAlign: 'center'
        },
        {
          x: 10, y: 270, width: 380, height: 25,
          fontSize: 14, fontFamily: 'Arial Black', color: 'black',
          strokeColor: 'white', strokeWidth: 2, textAlign: 'center'
        }
      ],
      category: 'gear',
      popularity: 92
    },
    {
      id: 'ug_004',
      name: 'Festival Main Stage vs Underground',
      description: 'The eternal choice between mainstream and underground',
      imageUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="300" fill="#ff6b6b"/>
          <rect x="200" y="0" width="200" height="300" fill="#1a1a1a"/>
          <polygon points="50,250 150,250 100,200" fill="#ffd93d"/>
          <rect x="80" y="260" width="40" height="30" fill="#8b4513"/>
          <rect x="250" y="200" width="100" height="80" fill="#333"/>
          <rect x="260" y="210" width="80" height="10" fill="#666"/>
          <rect x="260" y="230" width="80" height="10" fill="#666"/>
          <circle cx="100" cy="150" r="8" fill="white"/>
          <circle cx="300" cy="150" r="8" fill="#ff0000"/>
          <text x="100" y="100" text-anchor="middle" fill="white" font-family="Arial" font-size="10">MAIN</text>
          <text x="300" y="100" text-anchor="middle" fill="white" font-family="Arial" font-size="10">UNDERGROUND</text>
        </svg>
      `),
      textBoxes: [
        {
          x: 10, y: 10, width: 380, height: 30,
          fontSize: 16, fontFamily: 'Arial Black', color: 'white',
          strokeColor: 'black', strokeWidth: 2, textAlign: 'center'
        },
        {
          x: 10, y: 260, width: 380, height: 30,
          fontSize: 16, fontFamily: 'Arial Black', color: 'white',
          strokeColor: 'black', strokeWidth: 2, textAlign: 'center'
        }
      ],
      category: 'scene',
      popularity: 84
    },
    {
      id: 'ug_005',
      name: 'Modular Synth Addiction',
      description: 'When someone asks about your modular setup',
      imageUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#2c3e50"/>
          <rect x="20" y="50" width="360" height="200" fill="#1a1a1a" stroke="#444" stroke-width="2"/>
          <g id="module">
            <rect x="30" y="60" width="50" height="80" fill="#333" stroke="#666" stroke-width="1"/>
            <circle cx="45" cy="80" r="5" fill="#e74c3c"/>
            <circle cx="65" cy="80" r="5" fill="#3498db"/>
            <rect x="40" y="100" width="20" height="30" fill="#666"/>
          </g>
          <use href="#module" x="60" y="0"/>
          <use href="#module" x="120" y="0"/>
          <use href="#module" x="180" y="0"/>
          <use href="#module" x="240" y="0"/>
          <use href="#module" x="300" y="0"/>
          <path d="M 60 85 Q 80 75 100 85" stroke="#f39c12" stroke-width="2" fill="none"/>
          <path d="M 120 85 Q 140 95 160 85" stroke="#f39c12" stroke-width="2" fill="none"/>
          <path d="M 180 85 Q 200 75 220 85" stroke="#f39c12" stroke-width="2" fill="none"/>
          <text x="200" y="280" text-anchor="middle" fill="white" font-family="Arial" font-size="12">MODULAR SYNTH</text>
        </svg>
      `),
      textBoxes: [
        {
          x: 10, y: 10, width: 380, height: 30,
          fontSize: 16, fontFamily: 'Arial Black', color: 'white',
          strokeColor: 'black', strokeWidth: 2, textAlign: 'center'
        },
        {
          x: 10, y: 260, width: 380, height: 30,
          fontSize: 16, fontFamily: 'Arial Black', color: 'white',
          strokeColor: 'black', strokeWidth: 2, textAlign: 'center'
        }
      ],
      category: 'synth',
      popularity: 89
    },
    {
      id: 'ug_006',
      name: 'Vinyl vs Digital',
      description: 'The age-old debate in electronic music',
      imageUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="300" fill="#8b4513"/>
          <rect x="200" y="0" width="200" height="300" fill="#2c3e50"/>
          <circle cx="100" cy="150" r="80" fill="#1a1a1a"/>
          <circle cx="100" cy="150" r="60" fill="#333"/>
          <circle cx="100" cy="150" r="40" fill="#1a1a1a"/>
          <circle cx="100" cy="150" r="20" fill="#333"/>
          <circle cx="100" cy="150" r="5" fill="#1a1a1a"/>
          <rect x="250" y="100" width="100" height="100" fill="#333" stroke="#666" stroke-width="2"/>
          <rect x="260" y="110" width="80" height="60" fill="#000"/>
          <circle cx="280" cy="130" r="3" fill="#0f0"/>
          <circle cx="320" cy="130" r="3" fill="#f00"/>
          <rect x="270" y="140" width="60" height="20" fill="#444"/>
          <text x="100" y="250" text-anchor="middle" fill="white" font-family="Arial" font-size="10">VINYL</text>
          <text x="300" y="250" text-anchor="middle" fill="white" font-family="Arial" font-size="10">DIGITAL</text>
        </svg>
      `),
      textBoxes: [
        {
          x: 10, y: 10, width: 380, height: 30,
          fontSize: 16, fontFamily: 'Arial Black', color: 'white',
          strokeColor: 'black', strokeWidth: 2, textAlign: 'center'
        },
        {
          x: 10, y: 260, width: 380, height: 30,
          fontSize: 16, fontFamily: 'Arial Black', color: 'white',
          strokeColor: 'black', strokeWidth: 2, textAlign: 'center'
        }
      ],
      category: 'debate',
      popularity: 91
    }
  ];

  async getPopularTemplates(): Promise<MemeTemplate[]> {
    return this.undergroundMusicTemplates
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10);
  }

  async getTemplatesByCategory(category: string): Promise<MemeTemplate[]> {
    return this.undergroundMusicTemplates.filter(template => 
      template.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getTemplateById(id: string): Promise<MemeTemplate | undefined> {
    return this.undergroundMusicTemplates.find(template => template.id === id);
  }

  async generateMemeWithTemplate(templateId: string, texts: string[]): Promise<string> {
    const template = await this.getTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Create SVG with text overlays
    const svgContent = this.createMemeWithText(template, texts);
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  }

  private createMemeWithText(template: MemeTemplate, texts: string[]): string {
    // Get base image data
    const baseImageData = template.imageUrl.split(',')[1];
    const baseSvg = atob(baseImageData);
    
    // Parse the SVG and add text overlays
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(baseSvg, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // Add text elements
    template.textBoxes.forEach((textBox, index) => {
      if (texts[index]) {
        const textElement = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
        
        // Set text properties
        textElement.setAttribute('x', textBox.x.toString());
        textElement.setAttribute('y', (textBox.y + textBox.fontSize).toString());
        textElement.setAttribute('font-family', textBox.fontFamily);
        textElement.setAttribute('font-size', textBox.fontSize.toString());
        textElement.setAttribute('font-weight', 'bold');
        textElement.setAttribute('fill', textBox.color);
        textElement.setAttribute('stroke', textBox.strokeColor);
        textElement.setAttribute('stroke-width', textBox.strokeWidth.toString());
        textElement.setAttribute('text-anchor', textBox.textAlign === 'center' ? 'middle' : textBox.textAlign);
        
        // Handle text wrapping
        const words = texts[index].split(' ');
        let line = '';
        let lines: string[] = [];
        
        words.forEach(word => {
          const testLine = line + word + ' ';
          if (testLine.length * (textBox.fontSize * 0.6) > textBox.width && line.length > 0) {
            lines.push(line.trim());
            line = word + ' ';
          } else {
            line = testLine;
          }
        });
        lines.push(line.trim());

        // Add text lines as tspan elements
        lines.forEach((lineText, lineIndex) => {
          const tspan = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tspan.setAttribute('x', textBox.textAlign === 'center' ? (textBox.x + textBox.width / 2).toString() : textBox.x.toString());
          tspan.setAttribute('dy', lineIndex === 0 ? '0' : textBox.fontSize.toString());
          tspan.textContent = lineText;
          textElement.appendChild(tspan);
        });

        svgElement.appendChild(textElement);
      }
    });

    return new XMLSerializer().serializeToString(svgDoc);
  }

  async generateAIMeme(prompt: string): Promise<string> {
    try {
      // Use AI to suggest a template and generate texts
      const aiResponse = await aiService.generateMemeContent(prompt);
      
      // Find the best matching template
      const template = this.undergroundMusicTemplates.find(t => 
        aiResponse.category && t.category.includes(aiResponse.category.toLowerCase())
      ) || this.undergroundMusicTemplates[0];

      // Generate the meme with AI-suggested texts
      return await this.generateMemeWithTemplate(template.id, aiResponse.texts);
    } catch (error) {
      console.error('AI meme generation failed:', error);
      // Fallback to a default template
      return await this.generateMemeWithTemplate('ug_001', [prompt, 'When AI fails but the beat goes on']);
    }
  }

  async searchTemplates(query: string): Promise<MemeTemplate[]> {
    const lowerQuery = query.toLowerCase();
    return this.undergroundMusicTemplates.filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.category.toLowerCase().includes(lowerQuery)
    );
  }

  async getCategories(): Promise<string[]> {
    const categories = new Set(this.undergroundMusicTemplates.map(t => t.category));
    return Array.from(categories);
  }
}

export const memeService = new MemeService();