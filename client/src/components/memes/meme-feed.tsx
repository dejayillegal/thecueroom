/**
 * Meme Feed Component
 * Displays meme templates in a grid layout similar to Spotlight feed
 * Integrates with Meme Maker API for authentic meme templates
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, RotateCcw, Laugh, Zap, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { memeMakerService, type MemeTemplate } from "@/services/memeMakerService";
import { useToast } from "@/hooks/use-toast";

interface MemeFeedProps {
  className?: string;
}

export default function MemeFeed({ className }: MemeFeedProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMeme, setSelectedMeme] = useState<MemeTemplate | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch meme templates
  const { 
    data: memeTemplates = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['meme-templates', refreshKey, searchQuery],
    queryFn: async () => {
      if (searchQuery.trim()) {
        return await memeMakerService.searchMemes(searchQuery.trim());
      }
      return await memeMakerService.getUndergroundMemes();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const handleMemeSelect = (meme: MemeTemplate) => {
    setSelectedMeme(meme);
    setTopText(meme.topText || "");
    setBottomText(meme.bottomText || "");
  };

  const handleGenerateMeme = async () => {
    if (!selectedMeme) return;
    
    try {
      await memeMakerService.submitMeme(selectedMeme.ID, topText, bottomText);
      toast({
        title: "Meme Created!",
        description: "Your underground meme is ready to share",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to create meme. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadMeme = () => {
    if (!selectedMeme) return;
    
    // Create a simple download link for the meme image
    const link = document.createElement('a');
    link.href = selectedMeme.image;
    link.download = `${selectedMeme.name.replace(/\s+/g, '-').toLowerCase()}-meme.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Meme Downloaded",
      description: "Your meme template has been saved!",
    });
  };

  const shareMeme = async () => {
    if (!selectedMeme) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selectedMeme.name} Meme`,
          text: `Check out this meme: ${topText} / ${bottomText}`,
          url: selectedMeme.image,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(selectedMeme.image);
        toast({
          title: "Link Copied",
          description: "Meme link copied to clipboard!",
        });
      }
    } else {
      navigator.clipboard.writeText(selectedMeme.image);
      toast({
        title: "Link Copied",
        description: "Meme link copied to clipboard!",
      });
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading underground memes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("py-8", className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load memes. Please try again.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-4"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Laugh className="w-8 h-8 text-pink-500 animate-bounce" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Underground Memes
          </h2>
          <Zap className="w-8 h-8 text-purple-500 animate-pulse" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create viral techno memes using popular templates. Express your underground humor and share with the community.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <Input
            placeholder="Search meme templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background/50 border-border/50"
          />
        </div>
      </div>

      {/* Meme Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {memeTemplates.map((meme) => (
          <Dialog key={meme.ID}>
            <DialogTrigger asChild>
              <Card 
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur-sm border-border/50"
                onClick={() => handleMemeSelect(meme)}
              >
                <CardHeader className="p-4">
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                    <img
                      src={meme.image}
                      alt={meme.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/300/300';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {meme.name}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-1">{meme.name}</h3>
                    {meme.tags && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {meme.tags}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Laugh className="w-5 h-5" />
                  Create Meme: {meme.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Meme Preview */}
                <div className="relative">
                  <img
                    src={meme.image}
                    alt={meme.name}
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                  {/* Text Overlays */}
                  {topText && (
                    <div className="absolute top-4 left-4 right-4 text-center">
                      <div className="bg-black/70 text-white px-4 py-2 rounded font-bold text-lg">
                        {topText.toUpperCase()}
                      </div>
                    </div>
                  )}
                  {bottomText && (
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <div className="bg-black/70 text-white px-4 py-2 rounded font-bold text-lg">
                        {bottomText.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Input */}
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Top Text</label>
                    <Textarea
                      placeholder="Enter top text..."
                      value={topText}
                      onChange={(e) => setTopText(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bottom Text</label>
                    <Textarea
                      placeholder="Enter bottom text..."
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleGenerateMeme}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Meme
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={downloadMeme}
                    className="border-border/50"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={shareMeme}
                    className="border-border/50"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* No Results */}
      {memeTemplates.length === 0 && !isLoading && (
        <div className="text-center py-12 space-y-4">
          <Laugh className="w-16 h-16 mx-auto text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No memes found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or refresh to load more templates.
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh Templates
          </Button>
        </div>
      )}
    </div>
  );
}