import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import AnimatedAvatarDisplay from "@/components/animated-avatar-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  User, 
  MoreHorizontal,
  Flag,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
  AtSign,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ReactionSelector from "./reaction-selector";
import QuickMemegen from "./quick-memegen";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  compact?: boolean;
  onOpenThread?: () => void;
}

export default function PostCard({ post, compact = true, onOpenThread }: PostCardProps) {
  const [currentReaction, setCurrentReaction] = useState<string>("");
  const [reactions, setReactions] = useState<Record<string, number>>({
    heart: post.likesCount || 0,
    like: 0,
    dislike: 0, 
    laugh: 0,
    smile: 0,
    surprise: 0,
    explode: 0
  });
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [showFullPost, setShowFullPost] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutations
  const reactionMutation = useMutation({
    mutationFn: async (reaction: string) => {
      const response = await apiRequest('POST', `/api/posts/${post.id}/react`, { reaction });
      return response;
    },
    onSuccess: (data) => {
      setReactions(data.reactions);
      setCurrentReaction(data.userReaction);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (commentData: any) => {
      const response = await apiRequest('POST', `/api/posts/${post.id}/comments`, commentData);
      return response;
    },
    onSuccess: (newComment) => {
      setComments(prev => [...prev, newComment]);
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate();
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getAvatarGradient = (userId: string) => {
    const gradients = [
      'from-purple-400 to-primary',
      'from-blue-400 to-primary',
      'from-red-400 to-primary',
      'from-yellow-400 to-primary',
      'from-pink-400 to-primary',
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  };

  const canDelete = user?.id === post.userId || user?.isAdmin;

  return (
    <div className="bg-accent rounded-lg p-4 border border-border hover:border-primary/20 transition-colors">
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        {post.user.avatar && post.user.avatarConfig ? (
          <AnimatedAvatarDisplay 
            config={post.user.avatarConfig}
            size={40}
            className="w-10 h-10"
          />
        ) : (
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.user.profileImageUrl || ""} />
            <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(post.userId)} text-primary-foreground`}>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-foreground">
                {post.user.username || "Anonymous Artist"}
              </span>
              <span className="text-muted-foreground text-sm">
                {formatTimeAgo(post.createdAt)}
              </span>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
                {canDelete && (
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <h3 className="font-semibold mb-2 text-foreground">{post.title}</h3>
          <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Image */}
          {post.imageUrl && (
            <img 
              src={post.imageUrl} 
              alt="Post content"
              className="w-full max-h-60 object-cover rounded-lg mb-3 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(post.imageUrl!, '_blank')}
            />
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4 text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`p-2 h-auto ${isLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-primary`}
              onClick={handleLike}
              disabled={likeMutation.isPending}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 h-auto text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{post.commentsCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 h-auto text-muted-foreground hover:text-primary"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Link copied",
                  description: "Post link copied to clipboard",
                });
              }}
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
