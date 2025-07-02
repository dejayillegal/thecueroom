/**
 * Enhanced Community Feed Component
 * With create post, AI monitoring, hashtag filtering, and Discord-style markup
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle, RotateCcw, Plus, Zap, Bot, Brush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CommunityPostCard from "./community-post-card";
import { useAIBotMonitor } from "./ai-bot-monitor";
import CanvasMemeGenerator from "@/components/memes/canvas-meme-generator";
import type { PostWithUser } from "@shared/schema";

interface CommunitySpotlightFeedProps {
  className?: string;
}

const createPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  tags: z.string(),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

export default function CommunitySpotlightFeed({ className }: CommunitySpotlightFeedProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(['all']);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMemeCreateOpen, setIsMemeCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { moderateContent } = useAIBotMonitor();

  // Available hashtags for filtering
  const availableHashtags = [
    "all", "production", "troubleshooting", "memes", "techno", "house", 
    "ableton", "flstudio", "daw", "electronicequipments", "pioneer", 
    "ni", "digitak", "cdj", "controller", "modular", "synth", 
    "drummachine", "sequencer", "303", "bassline", "tip", "gigs",
    "events", "mixing", "mastering", "vocals", "collaboration"
  ];

  // Create post form
  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  // Fetch community posts
  const { 
    data: posts = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery<PostWithUser[]>({
    queryKey: ['/api/posts', refreshKey],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
  });

  // Create post mutation with AI monitoring
  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostForm) => {
      // AI monitoring before submission
      moderateContent(data.content, 'post', 0);
      
      return apiRequest('POST', '/api/posts', data);
    },
    onSuccess: () => {
      form.reset();
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Success",
        description: "Post created successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  });

  // Handle hashtag filtering
  const handleHashtagToggle = (hashtag: string) => {
    if (hashtag === "all") {
      setSelectedHashtags(["all"]);
    } else {
      setSelectedHashtags(prev => {
        const withoutAll = prev.filter(tag => tag !== "all");
        
        if (withoutAll.includes(hashtag)) {
          const newTags = withoutAll.filter(tag => tag !== hashtag);
          return newTags.length === 0 ? ["all"] : newTags;
        } else {
          return [...withoutAll, hashtag];
        }
      });
    }
  };

  // Filter posts based on selected hashtags
  const filteredPosts = (posts as PostWithUser[])?.filter((post: PostWithUser) => {
    if (selectedHashtags.includes('all')) {
      return true;
    }
    
    if (!post.tags || post.tags.length === 0) {
      return false;
    }
    
    // Tags are stored as an array in the database
    const postTags = post.tags || [];
    
    return selectedHashtags.some((selectedTag: string) => 
      postTags.some((postTag: string) => postTag.toLowerCase().includes(selectedTag.toLowerCase()))
    );
  }) || [];

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const onSubmit = (data: CreatePostForm) => {
    createPostMutation.mutate(data);
  };

  // Spotlight layout - 2x2 grid for featured items
  const gridClasses = "grid grid-cols-1 md:grid-cols-2 gap-6";

  return (
    <div className={cn("w-full", className)}>
      {/* Community Header with Create Post */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Community Feed
          </h2>
          <p className="text-muted-foreground text-xs">
            Latest discussions and posts from the TheCueRoom community
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Create Post Button */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-[#06c23e] hover:bg-gray-900 hover:text-[#06c216] font-medium border border-[#06c23e]/30">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="bg-gradient-to-r from-[#06c23e] to-[#06c216] bg-clip-text text-transparent">
                  Create New Post
                </DialogTitle>
                <DialogDescription>
                  Share your thoughts, ask questions, or start a discussion. Links and images supported!
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="What's on your mind?" 
                            {...field}
                            className="border-[#06c23e]/30 focus:border-[#06c216]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share your thoughts... You can include links and images using ![alt](url) format"
                            className="min-h-[100px] border-[#06c23e]/30 focus:border-[#06c216]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="techno, house, production..." 
                            {...field}
                            className="border-[#06c23e]/30 focus:border-[#06c216]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Bot className="w-4 h-4 text-[#06c23e]" />
                    <span className="text-xs text-muted-foreground">
                      TheCueRoom AI Bot monitors for community guidelines
                    </span>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-[#06c23e] to-[#06c216] hover:from-[#06c23e]/80 hover:to-[#06c216]/80 text-white"
                    disabled={createPostMutation.isPending}
                  >
                    {createPostMutation.isPending ? "Creating..." : "Create Post"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Create Meme Button */}
          <Dialog open={isMemeCreateOpen} onOpenChange={setIsMemeCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-[#00cc88] hover:bg-gray-900 hover:text-[#00cc88] font-medium border border-[#00cc88]/30">
                <Brush className="w-4 h-4 mr-2" />
                Create Meme
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="bg-gradient-to-r from-[#00cc88] to-[#00ff99] bg-clip-text text-transparent">
                  Create Underground Meme
                </DialogTitle>
                <DialogDescription>
                  Use our professional canvas-based meme generator to create memes for the community
                </DialogDescription>
              </DialogHeader>
              <CanvasMemeGenerator />
            </DialogContent>
          </Dialog>
        </div>


      </div>

      {/* Hashtag Filter Bar */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {availableHashtags.slice(0, 15).map((hashtag) => (
            <button
              key={hashtag}
              onClick={() => handleHashtagToggle(hashtag)}
              className={cn(
                "text-xs px-2 py-1 rounded-md transition-all duration-200 hover:scale-105",
                selectedHashtags.includes(hashtag)
                  ? "bg-gradient-to-r from-[#06c23e] to-[#06c216] text-white font-medium"
                  : "text-muted-foreground hover:bg-gradient-to-r hover:from-[#06c23e]/20 hover:to-[#06c216]/20"
              )}
            >
              #{hashtag}
            </button>
          ))}
          {availableHashtags.length > 15 && (
            <span className="text-xs text-muted-foreground px-2 py-1">
              +{availableHashtags.length - 15} more
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#06c23e]" />
            <p className="text-muted-foreground">
              Loading community posts...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load community posts. Please check your connection and try again.
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredPosts.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-foreground">
            {selectedHashtags.includes('all') ? 'No community posts yet' : 'No posts found for selected hashtags'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto text-xs">
            {selectedHashtags.includes('all') 
              ? "Be the first to start a conversation! Share your thoughts, ask questions, or discuss music production."
              : `No posts found for ${selectedHashtags.map(tag => `#${tag}`).join(', ')}. Try different hashtags or create the first post.`
            }
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => setIsCreateOpen(true)} 
              className="bg-gradient-to-r from-[#06c23e] to-[#06c216] hover:from-[#06c23e]/80 hover:to-[#06c216]/80 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Post
            </Button>
            {!selectedHashtags.includes('all') && (
              <Button 
                variant="outline"
                onClick={() => setSelectedHashtags(['all'])}
                className="border-[#06c23e] text-[#06c23e] hover:bg-[#06c23e] hover:text-white"
              >
                View All Posts
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Community Content */}
      {!isLoading && !error && filteredPosts.length > 0 && (
        <>
          {/* Posts Grid */}
          <div className={gridClasses}>
            {filteredPosts.slice(0, 4).map((post: PostWithUser, index: number) => (
              <CommunityPostCard
                key={`${post.id}-${index}`}
                post={post}
                variant="spotlight"
                className="h-full"
              />
            ))}
          </div>

          {/* More Posts Indicator */}
          {filteredPosts.length > 4 && (
            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground mb-2">
                Showing 4 of {filteredPosts.length} posts
              </p>
            </div>
          )}

          {/* Refresh Button */}
          <div className="text-center mt-6">
            <Button 
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 border-[#06c23e] text-[#06c23e] hover:bg-[#06c23e] hover:text-white"
            >
              <RotateCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              <span>Refresh Community</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}