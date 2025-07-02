import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { MessageSquare, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PostCard from "./enhanced-post-card";
import type { Post } from "@/types";

const createPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  tags: z.string(),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

export default function CommunityFeed() {
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(['all']);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const availableHashtags = [
    "all", "production", "troubleshooting", "memes", "techno", "house", 
    "ableton", "flstudio", "daw", "electronicequipments", "pioneer", 
    "ni", "digitak", "cdj", "controller", "modular", "synth", 
    "drummachine", "sequencer", "303", "bassline", "tip"
  ];

  const handleHashtagToggle = (hashtag: string) => {
    if (hashtag === "all") {
      setSelectedHashtags(["all"]);
    } else {
      setSelectedHashtags(prev => {
        // Remove "all" when selecting specific hashtags
        const withoutAll = prev.filter(tag => tag !== "all");
        
        if (withoutAll.includes(hashtag)) {
          // Remove the hashtag if already selected
          const newTags = withoutAll.filter(tag => tag !== hashtag);
          return newTags.length === 0 ? ["all"] : newTags;
        } else {
          // Add the hashtag
          return [...withoutAll, hashtag];
        }
      });
    }
  };

  const tags = availableHashtags.map(hashtag => ({
    value: hashtag,
    label: `#${hashtag}`,
    color: hashtag === 'all' 
      ? (selectedHashtags.includes('all') ? 'text-[#00cc88]' : 'text-[#fafafa]')
      : selectedHashtags.includes(hashtag)
        ? 'text-[#00cc88]'
        : 'text-[#fafafa] hover:text-[#00cc88]'
  }));

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });

  // Filter posts based on selected hashtags
  const filteredPosts = posts?.filter(post => {
    if (selectedHashtags.includes('all')) {
      return true;
    }
    
    if (!post.tags || post.tags.length === 0) {
      return false;
    }
    
    return selectedHashtags.some(selectedTag => 
      post.tags.some(postTag => postTag.toLowerCase() === selectedTag.toLowerCase())
    );
  }) || [];

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostForm) => {
      const postData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };
      await apiRequest('POST', '/api/posts', postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreatePostForm) => {
    createPostMutation.mutate(data);
  };

  return (
    <Card className="bg-secondary border-border">
      <CardContent className="pt-6 pb-4 px-4">
        {/* Forum Topic Navigation */}
        <div className="flex flex-wrap gap-0 leading-none text-[12px]">
          {tags.map((tag, index) => (
            <span key={tag.value}>
              <Badge
                variant="outline"
                className={`cursor-pointer transition-colors bg-transparent border-none px-0 py-0 h-auto font-normal ${tag.color}`}
                onClick={() => handleHashtagToggle(tag.value)}
              >
                {tag.label}
              </Badge>
              {index < tags.length - 1 && <span className="text-muted-foreground mx-1">•</span>}
            </span>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-1 mt-3">
          {isLoading ? (
            // Loading skeleton
            ([...Array(3)].map((_, i) => (
              <div key={i} className="bg-accent rounded-lg p-4 loading-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-16 bg-muted rounded w-full mb-3" />
                    <div className="flex space-x-4">
                      <div className="h-4 bg-muted rounded w-16" />
                      <div className="h-4 bg-muted rounded w-16" />
                      <div className="h-4 bg-muted rounded w-16" />
                    </div>
                  </div>
                </div>
              </div>
            )))
          ) : filteredPosts && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="border-b border-border/30 last:border-b-0">
                <PostCard post={post} />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
              <p className="text-muted-foreground mb-4">
                {selectedHashtags.includes('all') 
                  ? "Be the first to start a conversation in the community!" 
                  : `No posts found for ${selectedHashtags.map(tag => `#${tag}`).join(', ')}. Try a different topic or create the first post.`
                }
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                Create First Post
              </Button>
            </div>
          )}
        </div>

        {filteredPosts && filteredPosts.length > 0 && (
          <div className="text-center mt-6">
            <Button variant="ghost" className="text-primary hover:text-primary/90">
              Load More Posts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
