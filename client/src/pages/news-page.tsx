/**
 * News Page - Category-driven music industry news feed
 * RA.co and 6AM Group inspired layout matching TheCueRoom aesthetic
 */
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import NewsFeed from "@/components/news/news-feed";
import { Logo } from "@/components/ui/logo";
import Footer from "@/components/ui/footer";

export default function NewsPage() {
  const { user } = useAuth();

  useEffect(() => {
    // Set page title
    document.title = "Industry News - TheCueRoom";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Industry News - TheCueRoom | Electronic Music News & Updates</title>
        <meta 
          name="description" 
          content="Stay updated with the latest electronic music industry news, producer guides, gear reviews, and event listings from trusted sources like Resident Advisor, Mixmag, and more." 
        />
        <meta name="keywords" content="electronic music news, techno news, house music, producer guides, music industry, DJ news, music gear reviews" />
        <meta property="og:title" content="Industry News - TheCueRoom" />
        <meta property="og:description" content="Latest electronic music industry news and updates" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo showText={true} />
              <div className="hidden md:block h-6 w-px bg-border/50" />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-foreground">Industry News</h1>
                <p className="text-sm text-muted-foreground">
                  Electronic music news & insights
                </p>
              </div>
            </div>

            {user && (
              <div className="text-sm text-muted-foreground">
                Welcome back, <span className="font-semibold text-foreground">{user.stageName}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <NewsFeed />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}