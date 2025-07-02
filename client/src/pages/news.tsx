/**
 * News Page - Category-driven music industry news feed
 * RA.co and 6AM Group inspired layout matching TheCueRoom aesthetic
 */
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import UniversalHeader from "@/components/layout/universal-header";
import { Footer } from "@/components/layout/footer";
import NewsFeed from "@/components/news/news-feed";

export default function News() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    // Set page title
    document.title = "Industry News - TheCueRoom";
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-pulse">Loading news...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UniversalHeader />
      
      <div className="max-w-7xl mx-auto py-6">
        <NewsFeed />
      </div>

      <Footer />
    </div>
  );
}