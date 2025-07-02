
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import UniversalHeader from "@/components/layout/universal-header";
import CommunitySpotlightFeed from "@/components/feed/community-spotlight-feed";
import { Footer } from "@/components/layout/footer";

function CommunityError({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}

function CommunityLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}

export default function Community() {
  return (
    <ErrorBoundary fallbackRender={CommunityError}>
      <div className="min-h-screen bg-background relative">
        {/* Background animations */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#06c23e]/20 via-[#06c216]/20 to-[#06c23e]/20 animate-pulse" />
          <div className="absolute top-4 right-4 w-16 h-16 border-2 border-[#06c23e]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-[#06c216]/20 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        </div>
        
        <UniversalHeader />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="space-y-8">
            {/* Primary Community Spotlight Feed - Full Width */}
            <div className="w-full">
              <Suspense fallback={<CommunityLoading />}>
                <CommunitySpotlightFeed />
              </Suspense>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}
