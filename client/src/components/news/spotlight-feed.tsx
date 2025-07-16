/**
 * Dedicated Spotlight Feed Component
 * Extracted from NewsFeed to be used as primary home spotlight
 * Uses the same style as /news?category=music spotlight section
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { feedService } from "@/services/feedService";
import { useFeedSettings } from "@/hooks/useFeedSettings";
import NewsFeedCard from "./news-feed-card";

interface SpotlightFeedProps {
  className?: string;
}

export default function SpotlightFeed({ className }: SpotlightFeedProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const feedSettings = useFeedSettings();
  const maxItems = feedSettings?.spotlight?.maxItems ?? 8;

  // Fetch spotlight feeds
  const { 
    data: feedItems = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['spotlight-feed', refreshKey, maxItems],
    queryFn: async () => {
      return await feedService.getSpotlightFeed(maxItems);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
  });

  // Filter out any community feed items (if any exist)
  const newsOnlyFeeds = feedItems.filter(item => 
    item.source !== 'community' && 
    !item.title.toLowerCase().includes('community') &&
    !item.category?.includes('community')
  );

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  // Spotlight layout - 2x2 grid for featured items
  const gridClasses = "grid grid-cols-1 md:grid-cols-2 gap-6";

  return (
    <div className={cn("w-full", className)}>
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">
              Loading spotlight feeds...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load spotlight feeds. Please check your connection and try again.
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
      {!isLoading && !error && newsOnlyFeeds.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="text-4xl mb-4">🎵</div>
          <h3 className="text-lg font-semibold text-foreground">No spotlight content available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're working on getting the latest content for you. Check back soon!
          </p>
          <Button onClick={handleRefresh} className="mt-4">
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh Feeds
          </Button>
        </div>
      )}

      {/* Spotlight Content */}
      {!isLoading && !error && newsOnlyFeeds.length > 0 && (
        <>
          {/* Spotlight Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Spotlight Feed
            </h2>
            <p className="text-muted-foreground">
              Featured content from across the electronic music industry
            </p>
          </div>

          {/* Feed Grid */}
          <div className={gridClasses}>
            {newsOnlyFeeds.slice(0, maxItems).map((item, index) => (
              <NewsFeedCard
                key={`${item.id}-${index}`}
                item={item}
                variant="spotlight"
                className="h-full"
              />
            ))}
          </div>

          {/* Refresh Button */}
          {newsOnlyFeeds.length > 0 && (
            <div className="text-center mt-6">
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RotateCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                <span>Refresh Spotlight</span>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}