/**
 * Main News Feed Component
 * RA.co and 6AM Group inspired layout with category navigation and responsive grid
 */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2, AlertCircle, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { feedService, type FeedItem } from "@/services/feedService";
import { useFeedSettings } from "@/hooks/useFeedSettings";
import NewsFeedCard from "./news-feed-card";

interface NewsFeedProps {
  className?: string;
}

export default function NewsFeed({ className }: NewsFeedProps) {
  const [location] = useLocation();
  const [activeCategory, setActiveCategory] = useState<'home' | 'music' | 'guides' | 'industry' | 'gigs'>('home');
  const [sortBy, setSortBy] = useState<'date' | 'source'>('date');
  const [refreshKey, setRefreshKey] = useState(0);
  const feedSettings = useFeedSettings();
  const maxItems = feedSettings?.spotlight?.maxItems ?? 8;

  // Detect category from current URL path
  useEffect(() => {
    if (location === '/music') {
      setActiveCategory('music');
    } else if (location === '/guides') {
      setActiveCategory('guides');
    } else if (location === '/industry') {
      setActiveCategory('industry');
    } else if (location === '/gigs') {
      setActiveCategory('gigs');
    } else if (location === '/news' || location.startsWith('/news?category=')) {
      // Handle legacy news page with URL parameters
      const urlParams = new URLSearchParams(location.split('?')[1] || '');
      const category = urlParams.get('category') as 'music' | 'guides' | 'industry' | 'gigs';
      if (category) {
        setActiveCategory(category);
      } else {
        setActiveCategory('home');
      }
    } else {
      setActiveCategory('home');
    }
  }, [location]);

  // Fetch feeds based on active category
  const { 
    data: feedItems = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['news-feed', activeCategory, refreshKey, maxItems],
    queryFn: async () => {
      if (activeCategory === 'home') {
        return await feedService.getSpotlightFeed(maxItems);
      }
      return await feedService.getFeedsByCategory(activeCategory);
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 60 * 60 * 1000, // Auto-refresh every hour
  });

  // Sort and filter feeds
  const sortedFeeds = feedItems ? [...feedItems].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    }
    return a.source.localeCompare(b.source);
  }) : [];

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  // Get responsive grid classes
  const getGridClasses = () => {
    if (activeCategory === 'home') {
      // Spotlight layout - 2x2 grid for featured items
      return "grid grid-cols-1 md:grid-cols-2 gap-6";
    }
    // Category feeds - responsive columns
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
  };

  return (
    <div className={cn("w-full max-w-7xl mx-auto", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6 px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: 'date' | 'source') => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Latest</SelectItem>
                <SelectItem value="source">Source</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {feedItems.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {feedItems.length} {feedItems.length === 1 ? 'article' : 'articles'}
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <RotateCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Content */}
      <div className="px-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">
                Loading {activeCategory === 'home' ? 'spotlight' : activeCategory} feeds...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load feeds. Please check your connection and try again.
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !error && feedItems.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="text-4xl mb-4">📰</div>
            <h3 className="text-lg font-semibold text-foreground">No articles available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {activeCategory === 'home' 
                ? "We're working on getting the latest content for you. Check back soon!"
                : `No ${activeCategory} articles found at the moment. Try refreshing or check another category.`
              }
            </p>
            <Button onClick={handleRefresh} className="mt-4">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh Feeds
            </Button>
          </div>
        )}

        {/* Feed Grid */}
        {!isLoading && !error && feedItems.length > 0 && (
          <>
            {/* Spotlight Header */}
            {activeCategory === 'home' && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Spotlight Feed
                </h2>
                <p className="text-muted-foreground">
                  Featured content from across the electronic music industry
                </p>
              </div>
            )}

            {/* Feed Grid */}
            <div className={getGridClasses()}>
              {sortedFeeds
                .slice(0, activeCategory === 'home' ? maxItems : sortedFeeds.length)
                .map((item, index) => (
                <NewsFeedCard
                  key={`${item.id}-${index}`}
                  item={item}
                  variant={activeCategory === 'home' ? 'spotlight' : 'default'}
                  className="h-full"
                />
              ))}
            </div>

            {/* Load More for category feeds */}
            {activeCategory !== 'home' && feedItems.length >= 20 && (
              <div className="text-center mt-8">
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Could implement pagination here
                    handleRefresh();
                  }}
                  className="px-8"
                >
                  Load More Articles
                </Button>
              </div>
            )}
          </>
        )}

        {/* Attribution Footer */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Content aggregated from trusted electronic music sources
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              <span>• Data from Resident Advisor, Mixmag, Beatport, and more</span>
              <span>• Updated hourly</span>
              <span>• Links direct to original sources</span>
            </div>
            <p className="text-xs text-muted-foreground">
              TheCueRoom aggregates content under fair use. All rights remain with original publishers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}