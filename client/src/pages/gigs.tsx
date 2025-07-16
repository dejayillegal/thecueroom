import { useAuth } from "@/hooks/useAuth";
import UniversalHeader from "@/components/layout/universal-header";
import { Footer } from "@/components/layout/footer";
import NewsFeed from "@/components/news/news-feed";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function Gigs() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <UniversalHeader />
        <div className="container mx-auto px-4 pt-20 pb-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-48 mx-auto" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UniversalHeader />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              <Calendar className="inline-block h-8 w-8 mr-3 text-indigo-500" />
              Gigs
            </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Live events and gigs across India
          </p>
          {isAuthenticated && (
            <Button asChild className="mt-4">
              <a href="/submit-gig">Submit Event</a>
            </Button>
          )}
        </div>

          <NewsFeed className="mt-8" />
        </div>
      </div>
      <Footer />
    </div>
  );
}