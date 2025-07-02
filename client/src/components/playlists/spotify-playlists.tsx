import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Music, ExternalLink } from "lucide-react";
import type { Playlist } from "@/types";

export default function SpotifyPlaylists() {
  const { data: playlists, isLoading } = useQuery<Playlist[]>({
    queryKey: ['/api/playlists', { active: true }],
  });

  if (isLoading) {
    return (
      <Card className="bg-secondary border-border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Music className="h-5 w-5 text-primary" />
            <CardTitle className="text-primary">Weekly Curated</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-accent rounded-lg p-3 loading-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                <div className="flex justify-between">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-6 w-6 bg-muted rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!playlists || playlists.length === 0) {
    return (
      <Card className="bg-secondary border-border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Music className="h-5 w-5 text-primary" />
            <CardTitle className="text-primary">Weekly Curated</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Playlists Yet</h3>
            <p className="text-muted-foreground text-sm">
              Curated playlists will appear here when available.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary border-border">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <CardTitle className="text-primary">Weekly Curated</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="bg-accent rounded-lg p-3 hover:bg-accent/80 transition-colors">
            <h4 className="font-semibold mb-2 line-clamp-1">{playlist.title}</h4>
            <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
              {playlist.description || "Curated by TheCueRoom Team"}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Music className="h-3 w-3" />
                  <span>{playlist.trackCount} tracks</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{playlist.followerCount} followers</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 text-primary hover:text-primary/90"
                  onClick={() => window.open(`https://open.spotify.com/playlist/${playlist.spotifyId}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
                  onClick={() => window.open(playlist.embedUrl, '_blank')}
                >
                  <Play className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Spotify Embed Example */}
        {playlists.length > 0 && (
          <div className="mt-4">
            <iframe 
              src={`https://open.spotify.com/embed/playlist/${playlists[0].spotifyId}?utm_source=generator&theme=0`}
              width="100%" 
              height="152" 
              frameBorder="0" 
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
              className="rounded-lg"
            />
          </div>
        )}
        
        <div className="text-center pt-4 border-t border-accent">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90">
            View All Playlists
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
