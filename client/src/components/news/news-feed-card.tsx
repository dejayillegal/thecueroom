/**
 * News Feed Card Component
 * RA.co and 6AM Group inspired article cards with proper attribution
 */
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, ExternalLink, User, Calendar, Music, MapPin, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedItem } from "@/services/feedService";

interface NewsFeedCardProps {
  item: FeedItem;
  variant?: 'default' | 'spotlight' | 'compact';
  className?: string;
}

const categoryIcons = {
  music: Music,
  guides: MapPin,
  industry: Settings,
  gigs: Calendar
};

const categoryColors = {
  music: 'from-blue-500 to-cyan-500',
  guides: 'from-green-500 to-emerald-500',
  industry: 'from-orange-500 to-red-500',
  gigs: 'from-indigo-500 to-purple-500'
};

export default function NewsFeedCard({ item, variant = 'default', className }: NewsFeedCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const CategoryIcon = categoryIcons[item.category];
  const categoryGradient = categoryColors[item.category];

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 48) return 'Yesterday';
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return 'Recently';
    }
  };

  const getSourceInitials = (source: string) => {
    return source.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const isSpotlight = variant === 'spotlight';
  const isCompact = variant === 'compact';

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm border-border/50",
        isHovered && "scale-[1.02] shadow-xl",
        isSpotlight && "h-full",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category gradient header */}
      <div className={cn("h-1 bg-gradient-to-r", categoryGradient)} />
      
      <CardContent className={cn("p-0", isCompact ? "p-3" : "p-6")}>
        {/* Header with source and date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={`https://www.google.com/s2/favicons?domain=${item.sourceUrl}&sz=32`}
                alt={item.source}
                onError={() => setImageError(true)}
              />
              <AvatarFallback className="text-xs font-bold bg-muted">
                {getSourceInitials(item.source)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.source}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatDate(item.pubDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <CategoryIcon className="w-3 h-3 mr-1" />
              {item.category}
            </Badge>
          </div>
        </div>

        {/* Featured image */}
        {item.image && !imageError && !isCompact && (
          <div className="relative mb-4 overflow-hidden rounded-lg bg-muted">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="space-y-3">
          {/* Title */}
          <h3 className={cn(
            "font-bold text-foreground leading-tight transition-colors duration-200 group-hover:text-primary",
            isSpotlight ? "text-lg" : "text-base",
            isCompact && "text-sm"
          )}>
            {item.title}
          </h3>

          {/* Excerpt */}
          <p className={cn(
            "text-muted-foreground leading-relaxed",
            isSpotlight ? "text-sm" : "text-sm",
            isCompact && "text-xs line-clamp-2"
          )}>
            {item.excerpt}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && !isCompact && (
            <div className="flex flex-wrap gap-1 mt-3">
              {item.tags.slice(0, 4).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-accent/50 hover:bg-accent transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
              {item.tags.length > 4 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{item.tags.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Author */}
          {item.author && !isCompact && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
              <User className="w-3 h-3" />
              <span>By {item.author}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-xs text-muted-foreground">
              Read more on <span className="font-semibold text-foreground">{item.source}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1"
              >
                <span>{isCompact ? "Read" : "Read Article"}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 pointer-events-none",
          categoryGradient,
          isHovered && "opacity-5"
        )} />
      </CardContent>
    </Card>
  );
}