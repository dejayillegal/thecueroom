import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import UniversalHeader from "@/components/layout/universal-header";
import { Footer } from "@/components/layout/footer";
import MemeFeed from "@/components/memes/meme-feed";
import CanvasMemeGenerator from "@/components/memes/canvas-meme-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Heart, Brush } from 'lucide-react';

export default function Memes() {
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
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        <div className="absolute top-4 right-4 w-16 h-16 border-2 border-pink-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-purple-400/20 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
      </div>
      
      <UniversalHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Underground Memes
              </h1>
              <p className="text-muted-foreground mt-2">
                Create professional memes with our canvas-based generator
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Brush className="w-5 h-5 text-[#00cc88]" />
              <span className="text-sm font-medium">Canvas Generator</span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Meme
              </TabsTrigger>
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Meme Feed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <CanvasMemeGenerator />
            </TabsContent>

            <TabsContent value="feed">
              <MemeFeed />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}
