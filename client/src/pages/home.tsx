import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import UniversalHeader from "@/components/layout/universal-header";
import { Footer } from "@/components/layout/footer";
import SpotlightFeed from "@/components/news/spotlight-feed";

export default function Home() {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-pulse">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-primary-foreground rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background animations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-purple-600/20 animate-pulse" />
        <div className="absolute top-4 right-4 w-16 h-16 border-2 border-purple-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-cyan-400/20 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
      </div>
      
      <UniversalHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="space-y-8">
          {/* Primary Spotlight Feed - Full Width */}
          <div className="w-full">
            <SpotlightFeed />
          </div>
          

        </div>
      </div>

      {/* Floating Bot Indicator */}
      <div className="cue-floating-bot">
        <div className="relative">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
