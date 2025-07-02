import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Music, Image, ExternalLink, Volume2 } from "lucide-react";

interface EmbedData {
  type: 'youtube' | 'soundcloud' | 'image' | 'spotify' | 'bandcamp' | 'mixcloud' | 'generic';
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  embedId?: string;
  platform?: string;
}

interface MarkupRendererProps {
  content: string;
  allowEmbeds?: boolean;
  maxEmbeds?: number;
  className?: string;
}

export default function MarkupRenderer({ 
  content, 
  allowEmbeds = true, 
  maxEmbeds = 3,
  className = ""
}: MarkupRendererProps) {
  const [embeds, setEmbeds] = useState<EmbedData[]>([]);
  const [processedContent, setProcessedContent] = useState("");

  useEffect(() => {
    if (!allowEmbeds) {
      // Still process markdown even when embeds are disabled
      const processedText = processMarkdownSyntax(content);
      setProcessedContent(processedText);
      setEmbeds([]);
      return;
    }

    const { processedText, detectedEmbeds } = processMarkupContent(content, maxEmbeds);
    setProcessedContent(processedText);
    setEmbeds(detectedEmbeds);
  }, [content, allowEmbeds, maxEmbeds]);

  return (
    <div className={className}>
      {/* Rendered text content with markdown */}
      <div 
        className="prose prose-sm dark:prose-invert max-w-none text-[#f5f9fc] text-[12px] text-left ml-[53px] mr-[53px] mt-[0px] mb-[0px] pl-[0px] pr-[0px] font-light pt-[2px] pb-[2px]"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
      {/* Embedded media */}
      {embeds.length > 0 && (
        <div className="mt-3 space-y-3">
          {embeds.map((embed, index) => (
            <EmbedCard key={index} embed={embed} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmbedCard({ embed }: { embed: EmbedData }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (embed.type === 'image') {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
        <img 
          src={embed.url} 
          alt={embed.title || "Embedded image"}
          className="w-full max-h-96 object-cover"
          loading="lazy"
        />
        {embed.title && (
          <div className="p-2 text-xs text-muted-foreground">
            {embed.title}
          </div>
        )}
      </div>
    );
  }

  if (embed.type === 'youtube') {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
        <div className="relative aspect-video">
          {isPlaying ? (
            <iframe
              src={`https://www.youtube.com/embed/${embed.embedId}?autoplay=1`}
              title={embed.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div 
              className="w-full h-full bg-black flex items-center justify-center cursor-pointer group relative"
              onClick={() => setIsPlaying(true)}
            >
              {embed.thumbnail && (
                <img 
                  src={embed.thumbnail} 
                  alt={embed.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Button size="lg" className="rounded-full">
                  <Play className="h-6 w-6 ml-1" fill="currentColor" />
                </Button>
              </div>
            </div>
          )}
        </div>
        {embed.title && (
          <div className="p-3">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-400">
                YouTube
              </Badge>
              <span className="text-sm font-medium">{embed.title}</span>
            </div>
            {embed.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {embed.description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (embed.type === 'soundcloud') {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
        <div className="aspect-[3/1] bg-gradient-to-r from-orange-500/20 to-orange-600/20">
          <iframe
            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(embed.url)}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay"
          />
        </div>
        <div className="p-3">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-400">
              SoundCloud
            </Badge>
            {embed.title && <span className="text-sm font-medium">{embed.title}</span>}
          </div>
        </div>
      </div>
    );
  }

  if (embed.type === 'spotify') {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
        <div className="aspect-[3/1]">
          <iframe
            src={`https://open.spotify.com/embed/${embed.embedId}`}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
              Spotify
            </Badge>
            {embed.title && <span className="text-sm font-medium">{embed.title}</span>}
          </div>
        </div>
      </div>
    );
  }

  // Generic link embed
  return (
    <div className="border border-border rounded-lg p-3 bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            {embed.platform && (
              <Badge variant="outline" className="text-xs">
                {embed.platform}
              </Badge>
            )}
            <a 
              href={embed.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline truncate"
            >
              {embed.title || embed.url}
            </a>
          </div>
          {embed.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {embed.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function processMarkupContent(content: string, maxEmbeds: number): { 
  processedText: string; 
  detectedEmbeds: EmbedData[] 
} {
  const embeds: EmbedData[] = [];
  let processedText = content;

  // URL patterns for different platforms
  const patterns = {
    youtube: [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g
    ],
    soundcloud: [
      /(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/g
    ],
    spotify: [
      /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/g
    ],
    image: [
      /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?/gi
    ],
    bandcamp: [
      /(?:https?:\/\/)?[a-zA-Z0-9_-]+\.bandcamp\.com\/(?:track|album)\/[a-zA-Z0-9_-]+/g
    ],
    mixcloud: [
      /(?:https?:\/\/)?(?:www\.)?mixcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/g
    ]
  };

  // Process each type of embed
  Object.entries(patterns).forEach(([type, typePatterns]) => {
    if (embeds.length >= maxEmbeds) return;

    typePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null && embeds.length < maxEmbeds) {
        const url = match[0];
        const embedData = createEmbedData(type as any, url, match);
        
        if (embedData && isValidEmbed(embedData)) {
          embeds.push(embedData);
          // Remove the URL from the text content or replace with placeholder
          processedText = processedText.replace(url, '');
        }
      }
    });
  });

  // Process markdown-style formatting
  processedText = processMarkdownSyntax(processedText);

  return { processedText: processedText.trim(), detectedEmbeds: embeds };
}

function createEmbedData(type: string, url: string, match: RegExpExecArray): EmbedData | null {
  switch (type) {
    case 'youtube':
      return {
        type: 'youtube',
        url,
        embedId: match[1],
        thumbnail: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`,
        platform: 'YouTube'
      };
    
    case 'soundcloud':
      return {
        type: 'soundcloud',
        url,
        platform: 'SoundCloud'
      };
    
    case 'spotify':
      return {
        type: 'spotify',
        url,
        embedId: `${match[1]}/${match[2]}`,
        platform: 'Spotify'
      };
    
    case 'image':
      return {
        type: 'image',
        url,
        platform: 'Image'
      };
    
    case 'bandcamp':
      return {
        type: 'generic',
        url,
        platform: 'Bandcamp'
      };
    
    case 'mixcloud':
      return {
        type: 'generic',
        url,
        platform: 'Mixcloud'
      };
    
    default:
      return null;
  }
}

function isValidEmbed(embed: EmbedData): boolean {
  // Basic validation - ensure URL is not malicious
  try {
    const url = new URL(embed.url);
    const allowedDomains = [
      'youtube.com', 'youtu.be', 'www.youtube.com',
      'soundcloud.com', 'www.soundcloud.com',
      'spotify.com', 'open.spotify.com',
      'bandcamp.com',
      'mixcloud.com', 'www.mixcloud.com',
      // Add more trusted domains for images
      'imgur.com', 'i.imgur.com',
      'reddit.com', 'i.redd.it',
      'discord.com', 'cdn.discordapp.com'
    ];
    
    return allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

function processMarkdownSyntax(text: string): string {
  // Basic markdown processing
  return text
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    // Line breaks
    .replace(/\n/g, '<br>')
    // Mentions (highlight @username)
    .replace(/@([a-zA-Z0-9_]+)/g, '<span class="text-primary font-medium">@$1</span>')
    // Hashtags
    .replace(/#([a-zA-Z0-9_]+)/g, '<span class="text-secondary font-medium">#$1</span>');
}