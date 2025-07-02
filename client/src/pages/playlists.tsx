import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import UniversalHeader from "@/components/layout/universal-header";
import { Footer } from "@/components/layout/footer";
import { Play, Clock, Calendar, ExternalLink, Plus, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Playlist } from "@shared/schema";

export default function Playlists() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: playlists, isLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  const generatePlaylistMutation = useMutation({
    mutationFn: async (data: { genre: string; mood?: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/playlists/generate", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({
        title: "Playlist Generated",
        description: "AI has created a new curated playlist for the community",
      });
      setIsGenerateOpen(false);
      setGenre("");
      setMood("");
      setDescription("");
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <UniversalHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UniversalHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Weekly Playlists</h1>
            <p className="text-muted-foreground">
              AI-curated underground techno and house selections for the community
            </p>
          </div>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate AI Curated Playlist</DialogTitle>
                <DialogDescription>Create a custom playlist using AI curation based on your preferences</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Genre</label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="techno">Techno</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="ambient">Ambient</SelectItem>
                      <SelectItem value="progressive">Progressive</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Mood (Optional)</label>
                  <Input 
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="e.g., energetic, dark, uplifting"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the playlist vibe or theme..."
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setIsGenerateOpen(false)} 
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => generatePlaylistMutation.mutate({ genre, mood, description })}
                    disabled={!genre || generatePlaylistMutation.isPending}
                  >
                    {generatePlaylistMutation.isPending ? "Generating..." : "Generate Playlist"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {!playlists || playlists.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Play className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Playlists Yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Weekly playlists will appear here once they're created by the community moderators.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{playlist.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{playlist.genre}</Badge>
                        {playlist.isActive && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </div>
                    </div>
                    <Play className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {playlist.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{playlist.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(playlist.createdAt!).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {playlist.spotifyUrl && (
                    <div className="space-y-3">
                      <iframe
                        src={`https://open.spotify.com/embed/playlist/${playlist.spotifyUrl.split('/').pop()}?utm_source=generator&theme=0`}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-lg"
                      />
                      <Button 
                        variant="outline"
                        className="w-full" 
                        onClick={() => window.open(playlist.spotifyUrl!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Spotify
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}