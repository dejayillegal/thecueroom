import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AnimatedAvatarDisplay from "@/components/animated-avatar-display";
import { 
  User, 
  MapPin, 
  Calendar, 
  Check, 
  Music, 
  Mail,
  ExternalLink,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatTimeAgo } from "@/lib/utils";

interface UserProfileCardProps {
  userId: string;
  onClose?: () => void;
  trigger?: "hover" | "click";
  className?: string;
}

export function UserProfileCard({ userId, onClose, trigger = "click", className = "" }: UserProfileCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Fetch user profile data
  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: [`/api/users/${userId}/profile`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/users/${userId}/profile`);
      return response;
    },
    enabled: !!userId
  });

  useEffect(() => {
    if (userProfile) {
      setIsVisible(true);
    }
  }, [userProfile]);

  if (isLoading) {
    return (
      <Card className={`w-80 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 animate-pulse">
            <div className="w-16 h-16 bg-muted rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !userProfile) {
    return (
      <Card className={`w-80 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Profile not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const user = userProfile;

  return (
    <Card className={`w-80 shadow-lg border-2 border-primary/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative">
              {user.avatar && user.avatarConfig ? (
                <div className="relative">
                  <AnimatedAvatarDisplay 
                    config={user.avatarConfig}
                    size={64}
                    className="w-16 h-16"
                  />
                  {user.avatarConfig?.animation !== 'none' && (
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full">
                      ✨
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {(user.stageName || user.firstName || "A").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg leading-none">
                  {user.stageName || `${user.firstName} ${user.lastName}` || "Anonymous Artist"}
                </h3>
                {user.isVerified && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                @{user.username}
              </p>
              {user.firstName && user.lastName && user.stageName && (
                <p className="text-xs text-muted-foreground">
                  {user.firstName} {user.lastName}
                </p>
              )}
            </div>
          </div>

          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        {user.bio && (
          <div>
            <p className="text-sm leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* Music Info */}
        {(user.genres || user.subgenres) && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Music className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Music Style</span>
            </div>
            
            {user.genres && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Genres</p>
                <div className="flex flex-wrap gap-1">
                  {user.genres.split(',').map((genre: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {genre.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {user.subgenres && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Subgenres</p>
                <div className="flex flex-wrap gap-1">
                  {user.subgenres.split(',').map((subgenre: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {subgenre.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* User Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold">{user.postsCount || 0}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{user.commentsCount || 0}</p>
            <p className="text-xs text-muted-foreground">Comments</p>
          </div>
        </div>

        {/* Join Date */}
        {user.createdAt && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Joined {formatTimeAgo(new Date(user.createdAt))}</span>
          </div>
        )}

        {/* Music Platforms */}
        {(user.spotifyUrl || user.soundcloudUrl || user.mixcloudUrl) && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Music Platforms</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.spotifyUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => window.open(user.spotifyUrl, '_blank')}
                >
                  Spotify
                </Button>
              )}
              {user.soundcloudUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => window.open(user.soundcloudUrl, '_blank')}
                >
                  SoundCloud
                </Button>
              )}
              {user.mixcloudUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => window.open(user.mixcloudUrl, '_blank')}
                >
                  Mixcloud
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hover Profile Card Component
interface HoverProfileCardProps {
  userId: string;
  children: React.ReactNode;
  delay?: number;
}

export function HoverProfileCard({ userId, children, delay = 500 }: HoverProfileCardProps) {
  const [showCard, setShowCard] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => {
      setShowCard(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setShowCard(false);
  };

  return (
    <div 
      className="relative inline-block text-[14px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showCard && (
        <div className="absolute z-50 top-full left-0 mt-2 pointer-events-none">
          <UserProfileCard 
            userId={userId} 
            trigger="hover"
            className="pointer-events-auto"
          />
        </div>
      )}
    </div>
  );
}

// Click Profile Card Component  
interface ClickProfileCardProps {
  userId: string;
  children: React.ReactNode;
}

export function ClickProfileCard({ userId, children }: ClickProfileCardProps) {
  const [showCard, setShowCard] = useState(false);

  return (
    <>
      <div 
        className="cursor-pointer"
        onClick={() => setShowCard(true)}
      >
        {children}
      </div>

      {showCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-md w-full mx-4">
            <UserProfileCard 
              userId={userId} 
              onClose={() => setShowCard(false)}
              trigger="click"
            />
          </div>
        </div>
      )}
    </>
  );
}