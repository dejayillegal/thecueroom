import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import TheCueRoomBot from "@/components/thecueroom-bot";
import { ErrorBoundary } from "@/components/error-boundary";
import { AnimationProvider } from "@/contexts/AnimationContext";
import Landing from "@/pages/landing";
import LoadingScreen from "@/components/layout/loading-screen";
import Home from "@/pages/home";
import Community from "@/pages/community";
import Admin from "@/pages/admin";
import AdminLogs from "@/pages/admin-logs";
import AdminSupport from "@/pages/admin-support";
import Profile from "@/pages/profile";
import Memes from "@/pages/memes";
import Gigs from "@/pages/gigs";
import News from "@/pages/news";
import Playlists from "@/pages/playlists";
import MusicPlatforms from "@/pages/music-platforms";
import Settings from "@/pages/settings";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Create a component wrapper that handles authentication-based rendering
  const AuthenticatedRoute = ({ component: Component, fallback: Fallback = Landing }: { component: React.ComponentType, fallback?: React.ComponentType }) => {
    if (isLoading) {
      return <LoadingScreen />; // Avoid landing flash during auth check
    }
    return isAuthenticated ? <Component /> : <Fallback />;
  };

  return (
    <Switch>
      {/* Always define all routes to prevent 404 flashes */}
      <Route path="/" component={() => <AuthenticatedRoute component={Home} fallback={Landing} />} />
      <Route path="/community" component={() => <AuthenticatedRoute component={Community} />} />
      <Route path="/music" component={() => <AuthenticatedRoute component={News} />} />
      <Route path="/guides" component={() => <AuthenticatedRoute component={News} />} />
      <Route path="/industry" component={() => <AuthenticatedRoute component={News} />} />
      <Route path="/admin" component={() => <AuthenticatedRoute component={Admin} />} />
      <Route path="/admin/logs" component={() => <AuthenticatedRoute component={AdminLogs} />} />
      <Route path="/admin/support" component={() => <AuthenticatedRoute component={AdminSupport} />} />
      <Route path="/profile" component={() => <AuthenticatedRoute component={Profile} />} />
      <Route path="/memes" component={() => <AuthenticatedRoute component={Memes} />} />
      <Route path="/gigs" component={() => <AuthenticatedRoute component={Gigs} />} />
      <Route path="/news" component={() => <AuthenticatedRoute component={News} />} />
      <Route path="/playlists" component={() => <AuthenticatedRoute component={Playlists} />} />
      <Route path="/music-platforms" component={() => <AuthenticatedRoute component={MusicPlatforms} />} />
      <Route path="/settings" component={() => <AuthenticatedRoute component={Settings} />} />
      
      {/* Public routes accessible anytime */}
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      
      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AnimationProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Toaster />
              <ErrorBoundary>
                <Router />
              </ErrorBoundary>
              <ErrorBoundary>
                <TheCueRoomBot />
              </ErrorBoundary>
            </div>
          </TooltipProvider>
        </AnimationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
