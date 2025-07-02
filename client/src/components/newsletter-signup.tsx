import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface NewsletterPreferences {
  weeklyUpdates: boolean;
  eventAnnouncements: boolean;
  curatedPlaylists: boolean;
  artistSpotlights: boolean;
}

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState<NewsletterPreferences>({
    weeklyUpdates: true,
    eventAnnouncements: true,
    curatedPlaylists: true,
    artistSpotlights: false,
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", {
        email,
        preferences,
      });
      return response.json();
    },
    onSuccess: () => {
      setIsSubscribed(true);
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive weekly updates about the underground electronic music scene.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    subscribeMutation.mutate();
  };

  if (isSubscribed) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Welcome to the underground!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                You're now subscribed to weekly updates from India's underground electronic music community.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Weekly Newsletter
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Stay updated with the latest from India's underground electronic music scene
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Newsletter preferences:</h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weeklyUpdates"
                  checked={preferences.weeklyUpdates}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, weeklyUpdates: checked as boolean }))
                  }
                />
                <label htmlFor="weeklyUpdates" className="text-sm">
                  Weekly music updates & underground news
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="eventAnnouncements"
                  checked={preferences.eventAnnouncements}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, eventAnnouncements: checked as boolean }))
                  }
                />
                <label htmlFor="eventAnnouncements" className="text-sm">
                  Event announcements & gig listings
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="curatedPlaylists"
                  checked={preferences.curatedPlaylists}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, curatedPlaylists: checked as boolean }))
                  }
                />
                <label htmlFor="curatedPlaylists" className="text-sm">
                  Curated playlists & new music discoveries
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="artistSpotlights"
                  checked={preferences.artistSpotlights}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, artistSpotlights: checked as boolean }))
                  }
                />
                <label htmlFor="artistSpotlights" className="text-sm">
                  Artist spotlights & interviews
                </label>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={subscribeMutation.isPending}
          >
            {subscribeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              "Subscribe to Newsletter"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You can unsubscribe at any time. We respect your privacy and won't spam you.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}