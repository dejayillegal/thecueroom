import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Music, ExternalLink, Users, Play, Heart, Headphones, Sparkles, TrendingUp } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MusicProfile {
  id: number;
  platform: string;
  username: string;
  profileUrl: string;
  isVerified: boolean;
  followers: number;
  tracks: number;
  metadata: any;
}

interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  bpm?: number;
  musicalKey?: string;
  duration?: number;
  platforms: any[];
  embedCode?: string;
  likesCount: number;
  playsCount: number;
  user: any;
}

interface CuratedPlaylist {
  id: number;
  name: string;
  description: string;
  genre: string;
  mood?: string;
  bpmRange?: [number, number];
  trackIds: number[];
  likesCount: number;
  curator: any;
}

const platformIcons = {
  spotify: "🎵",
  soundcloud: "☁️",
  youtube: "📺",
  beatport: "🎧",
  bandcamp: "📻",
  mixcloud: "🎛️",
  residentAdvisor: "🏠",
  instagram: "📸"
};

export default function MusicPlatforms() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profiles");
  const [newProfileUrl, setNewProfileUrl] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("techno");

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

  // Fetch user's music profiles
  const { data: musicProfiles, isLoading: profilesLoading } = useQuery<MusicProfile[]>({
    queryKey: ['/api/music/profiles', user?.id],
    enabled: !!user?.id,
  });

  // Fetch tracks
  const { data: tracks, isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ['/api/music/tracks'],
  });

  // Fetch curated playlists
  const { data: playlists, isLoading: playlistsLoading } = useQuery<CuratedPlaylist[]>({
    queryKey: ['/api/music/playlists'],
  });

  // Fetch trending tracks
  const { data: trendingTracks } = useQuery<Track[]>({
    queryKey: ['/api/music/trending', { genre: selectedGenre }],
  });

  // Add music profile mutation
  const addProfileMutation = useMutation({
    mutationFn: async (profileUrl: string) => {
      const response = await apiRequest('POST', '/api/music/profiles', {
        profileUrl
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/music/profiles'] });
      setNewProfileUrl("");
      toast({
        title: "Profile Added",
        description: "Your music platform profile has been added successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add music profile",
        variant: "destructive",
      });
    },
  });

  // Generate playlist mutation
  const generatePlaylistMutation = useMutation({
    mutationFn: async (data: { genre: string; mood: string; bpmRange: [number, number] }) => {
      const response = await apiRequest('POST', '/api/music/generate-playlist', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Playlist Generated",
        description: `Created "${data.name}" with ${data.tracks.length} tracks!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate playlist",
        variant: "destructive",
      });
    },
  });

  const handleAddProfile = () => {
    if (!newProfileUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid platform URL",
        variant: "destructive",
      });
      return;
    }
    addProfileMutation.mutate(newProfileUrl);
  };

  const handleGeneratePlaylist = () => {
    generatePlaylistMutation.mutate({
      genre: selectedGenre,
      mood: "underground",
      bpmRange: [120, 140]
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-pulse">Loading music platforms...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
            <Music className="h-8 w-8" />
            Music Platform Integration
          </h1>
          <p className="text-muted-foreground">
            Connect your profiles across platforms and discover new music
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profiles">My Profiles</TabsTrigger>
            <TabsTrigger value="tracks">Track Library</TabsTrigger>
            <TabsTrigger value="playlists">Curated Lists</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connect Music Platforms</CardTitle>
                <CardDescription>
                  Add your profiles from Spotify, SoundCloud, Beatport, and other platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://open.spotify.com/artist/... or SoundCloud URL"
                    value={newProfileUrl}
                    onChange={(e) => setNewProfileUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAddProfile}
                    disabled={addProfileMutation.isPending}
                  >
                    {addProfileMutation.isPending ? "Adding..." : "Add Profile"}
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Supported platforms: Spotify, SoundCloud, YouTube, Beatport, Bandcamp, Mixcloud, Resident Advisor, Instagram
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profilesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))
              ) : musicProfiles && musicProfiles.length > 0 ? (
                musicProfiles.map((profile) => (
                  <Card key={profile.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{platformIcons[profile.platform as keyof typeof platformIcons] || "🎵"}</span>
                        <div>
                          <h3 className="font-semibold capitalize">{profile.platform}</h3>
                          <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        </div>
                        {profile.isVerified && (
                          <Badge variant="secondary" className="ml-auto">Verified</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {profile.followers}
                          </span>
                          <span className="flex items-center gap-1">
                            <Music className="h-3 w-3" />
                            {profile.tracks}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Profiles Connected</h3>
                    <p className="text-muted-foreground">
                      Add your first music platform profile to get started
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tracks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Community Tracks</h2>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="techno">Techno</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="acid">Acid</SelectItem>
                  <SelectItem value="progressive">Progressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracksLoading ? (
                Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))
              ) : tracks && tracks.length > 0 ? (
                tracks.map((track) => (
                  <Card key={track.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <p className="text-sm text-muted-foreground">by {track.artist}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{track.genre}</Badge>
                        {track.bpm && (
                          <Badge variant="secondary">{track.bpm} BPM</Badge>
                        )}
                        {track.musicalKey && (
                          <Badge variant="secondary">{track.musicalKey}</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {track.likesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {track.playsCount}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          by {track.user?.username}
                        </span>
                      </div>
                      
                      {track.embedCode && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          Platform embeds available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Tracks Yet</h3>
                    <p className="text-muted-foreground">
                      Community tracks will appear here as artists share their music
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="playlists" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Curated Playlists</h2>
              <Button onClick={handleGeneratePlaylist} disabled={generatePlaylistMutation.isPending}>
                <Sparkles className="h-4 w-4 mr-2" />
                {generatePlaylistMutation.isPending ? "Generating..." : "AI Generate"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlistsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-full mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))
              ) : playlists && playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <Card key={playlist.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold">{playlist.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {playlist.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{playlist.genre}</Badge>
                        {playlist.mood && (
                          <Badge variant="secondary">{playlist.mood}</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Music className="h-3 w-3" />
                            {Array.isArray(playlist.trackIds) ? playlist.trackIds.length : 0} tracks
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {playlist.likesCount}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          by {playlist.curator?.username}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Playlists Yet</h3>
                    <p className="text-muted-foreground">
                      Generate your first AI-curated playlist or create one manually
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Trending in {selectedGenre}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingTracks && trendingTracks.length > 0 ? (
                trendingTracks.map((track, index) => (
                  <Card key={`trending-${index}`} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{track.title}</h3>
                          <p className="text-sm text-muted-foreground">by {track.artist}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{track.genre}</Badge>
                            {track.bpm && (
                              <Badge variant="secondary">{track.bpm} BPM</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <span>Available on:</span>
                            {track.platforms?.map((platform: string, i: number) => (
                              <span key={i}>{platformIcons[platform as keyof typeof platformIcons] || "🎵"}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Trending Tracks</h3>
                    <p className="text-muted-foreground">
                      Trending tracks for {selectedGenre} will appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}