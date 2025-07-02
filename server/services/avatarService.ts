interface AvatarConfig {
  style: 'techno' | 'house' | 'minimal' | 'acid';
  accessory: 'headphones' | 'sunglasses' | 'cap' | 'none';
  color: 'green' | 'blue' | 'purple' | 'red' | 'yellow';
  background: 'dark' | 'neon' | 'gradient';
  musicElement: 'vinyl' | 'waveform' | 'speaker' | 'mixer';
}

class AvatarService {
  async generateAvatar(config: AvatarConfig): Promise<string> {
    try {
      // Generate SVG avatar based on configuration
      const svg = this.createSVGAvatar(config);
      
      // In a real implementation, you might:
      // 1. Save the SVG to a file storage service
      // 2. Convert to PNG/JPG if needed
      // 3. Return the URL to the stored image
      
      // For now, we'll return a data URL
      const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      
      return svgDataUrl;
    } catch (error) {
      console.error("Avatar generation error:", error);
      throw new Error("Failed to generate avatar");
    }
  }

  private createSVGAvatar(config: AvatarConfig): string {
    const colors = {
      green: '#00C896',
      blue: '#3B82F6',
      purple: '#8B5CF6',
      red: '#EF4444',
      yellow: '#F59E0B'
    };

    const backgrounds = {
      dark: '#0A0A0B',
      neon: 'url(#neonGradient)',
      gradient: 'url(#backgroundGradient)'
    };

    const primaryColor = colors[config.color];
    const bgColor = backgrounds[config.background];

    return `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="neonGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
          </radialGradient>
          <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="200" height="200" fill="${bgColor}" rx="20"/>
        
        <!-- Main Avatar Circle -->
        <circle cx="100" cy="100" r="70" fill="${primaryColor}" opacity="0.8"/>
        <circle cx="100" cy="100" r="60" fill="#1A1A1C" stroke="${primaryColor}" stroke-width="2"/>
        
        ${this.generateMusicElement(config.musicElement, primaryColor)}
        ${this.generateAccessory(config.accessory, primaryColor)}
        
        <!-- Style indicator -->
        <text x="100" y="180" text-anchor="middle" fill="${primaryColor}" font-family="monospace" font-size="12" font-weight="bold">
          ${config.style.toUpperCase()}
        </text>
      </svg>
    `;
  }

  private generateMusicElement(element: string, color: string): string {
    switch (element) {
      case 'vinyl':
        return `
          <circle cx="100" cy="100" r="40" fill="#000" stroke="${color}" stroke-width="2"/>
          <circle cx="100" cy="100" r="30" fill="${color}" opacity="0.3"/>
          <circle cx="100" cy="100" r="5" fill="#000"/>
        `;
      
      case 'waveform':
        return `
          <g transform="translate(60, 95)">
            ${Array.from({length: 10}, (_, i) => 
              `<rect x="${i * 8}" y="${Math.random() * 10}" width="4" height="${5 + Math.random() * 10}" fill="${color}" opacity="0.8"/>`
            ).join('')}
          </g>
        `;
      
      case 'speaker':
        return `
          <rect x="80" y="80" width="40" height="40" rx="5" fill="#333" stroke="${color}" stroke-width="2"/>
          <circle cx="100" cy="100" r="15" fill="${color}" opacity="0.6"/>
          <circle cx="100" cy="100" r="8" fill="#000"/>
        `;
      
      case 'mixer':
        return `
          <rect x="70" y="90" width="60" height="20" rx="3" fill="#333" stroke="${color}" stroke-width="1"/>
          <circle cx="85" cy="100" r="4" fill="${color}"/>
          <circle cx="100" cy="100" r="4" fill="${color}"/>
          <circle cx="115" cy="100" r="4" fill="${color}"/>
        `;
      
      default:
        return '';
    }
  }

  private generateAccessory(accessory: string, color: string): string {
    switch (accessory) {
      case 'headphones':
        return `
          <path d="M 70 80 Q 100 60 130 80" stroke="${color}" stroke-width="3" fill="none"/>
          <circle cx="75" cy="85" r="8" fill="${color}" opacity="0.8"/>
          <circle cx="125" cy="85" r="8" fill="${color}" opacity="0.8"/>
        `;
      
      case 'sunglasses':
        return `
          <rect x="80" y="85" width="40" height="12" rx="6" fill="#000" stroke="${color}" stroke-width="1"/>
          <circle cx="90" cy="91" r="5" fill="#333"/>
          <circle cx="110" cy="91" r="5" fill="#333"/>
        `;
      
      case 'cap':
        return `
          <path d="M 75 75 Q 100 65 125 75 L 130 85 L 70 85 Z" fill="${color}" opacity="0.8"/>
          <ellipse cx="100" cy="75" rx="20" ry="5" fill="${color}"/>
        `;
      
      default:
        return '';
    }
  }

  async getDefaultAvatarConfig(): Promise<AvatarConfig> {
    const styles = ['techno', 'house', 'minimal', 'acid'] as const;
    const accessories = ['headphones', 'sunglasses', 'cap', 'none'] as const;
    const colors = ['green', 'blue', 'purple', 'red', 'yellow'] as const;
    const backgrounds = ['dark', 'neon', 'gradient'] as const;
    const musicElements = ['vinyl', 'waveform', 'speaker', 'mixer'] as const;

    return {
      style: styles[Math.floor(Math.random() * styles.length)],
      accessory: accessories[Math.floor(Math.random() * accessories.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
      musicElement: musicElements[Math.floor(Math.random() * musicElements.length)]
    };
  }
}

export const avatarService = new AvatarService();
