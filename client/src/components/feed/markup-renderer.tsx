/**
 * Discord-style Markup Renderer
 * Supports links, images, and basic formatting
 */
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Image as ImageIcon } from "lucide-react";

interface MarkupRendererProps {
  content: string;
  className?: string;
}

export default function MarkupRenderer({ content, className }: MarkupRendererProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (url: string) => {
    setImageErrors(prev => new Set([...prev, url]));
  };

  const renderContent = (text: string) => {
    // Split content by URLs and images
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    
    let result: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    
    // First pass: handle images
    let match;
    let processedText = text;
    const imageMatches: { full: string; alt: string; url: string; index: number }[] = [];
    
    while ((match = imageRegex.exec(text)) !== null) {
      imageMatches.push({
        full: match[0],
        alt: match[1] || 'Image',
        url: match[2],
        index: match.index
      });
    }
    
    // Remove image markdown from text for URL processing
    imageMatches.reverse().forEach(img => {
      processedText = processedText.slice(0, img.index) + `__IMAGE_${img.index}__` + processedText.slice(img.index + img.full.length);
    });
    
    // Second pass: handle URLs in remaining text
    const parts = processedText.split(urlRegex);
    
    parts.forEach((part, index) => {
      if (part.match(urlRegex)) {
        // This is a URL
        const isYouTube = part.includes('youtube.com') || part.includes('youtu.be');
        const isSoundCloud = part.includes('soundcloud.com');
        const isSpotify = part.includes('spotify.com');
        
        result.push(
          <Card key={`url-${index}`} className="inline-flex items-center p-2 m-1 border border-yellow-200 bg-yellow-50 max-w-xs">
            <ExternalLink className="w-3 h-3 mr-2 text-yellow-600" />
            <div className="min-w-0 flex-1">
              <a 
                href={part} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-yellow-700 hover:text-yellow-800 truncate block"
                title={part}
              >
                {isYouTube && '🎵 YouTube'}
                {isSoundCloud && '🎧 SoundCloud'}
                {isSpotify && '🎶 Spotify'}
                {!isYouTube && !isSoundCloud && !isSpotify && 
                  part.replace(/https?:\/\/(www\.)?/, '').substring(0, 20) + 
                  (part.length > 20 ? '...' : '')
                }
              </a>
            </div>
          </Card>
        );
      } else if (part.includes('__IMAGE_')) {
        // Handle image placeholders
        const imageMatch = imageMatches.find(img => part.includes(`__IMAGE_${img.index}__`));
        if (imageMatch && !imageErrors.has(imageMatch.url)) {
          const textParts = part.split(`__IMAGE_${imageMatch.index}__`);
          
          if (textParts[0]) result.push(textParts[0]);
          
          result.push(
            <div key={`img-${imageMatch.index}`} className="my-2">
              <img 
                src={imageMatch.url}
                alt={imageMatch.alt}
                className="max-w-full max-h-48 rounded-lg border border-yellow-200"
                onError={() => handleImageError(imageMatch.url)}
                loading="lazy"
              />
            </div>
          );
          
          if (textParts[1]) result.push(textParts[1]);
        } else {
          // Image failed to load or placeholder without match
          const cleanText = part.replace(`__IMAGE_${imageMatch?.index}__`, imageMatch ? `[Image: ${imageMatch.alt}]` : '');
          if (cleanText) result.push(cleanText);
        }
      } else {
        // Regular text
        if (part) result.push(part);
      }
    });
    
    return result;
  };

  return (
    <div className={className}>
      {renderContent(content)}
    </div>
  );
}