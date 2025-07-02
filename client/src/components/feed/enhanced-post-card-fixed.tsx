import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  Clock,
  Reply,
  Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ReactionSelector from "./reaction-selector";
import QuickMemegen from "../quick-memegen";

interface PostCardProps {
  post: any;
  compact?: boolean;
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [showFullPost, setShowFullPost] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Reaction mutation
  const reactionMutation = useMutation({
    mutationFn: async (reaction: string) => {
      const response = await apiRequest('POST', `/api/posts/${post.id}/reactions`, { reaction });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
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

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (commentData: any) => {
      const response = await apiRequest('POST', `/api/posts/${post.id}/comments`, commentData);
      return response;
    },
    onSuccess: (newComment) => {
      setComments(prev => [...prev, newComment]);
      setNewComment("");
      setReplyContent("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
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

  // Helper functions
  const formatTimeAgo = (date: Date) => {
    if (!date || isNaN(date.getTime())) return "now";
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 0) return "now";
    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  const handleReaction = (reaction: string) => {
    reactionMutation.mutate(reaction);
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    
    const mentions = Array.from(newComment.matchAll(/@(\w+)/g))
      .map(match => match[1]);
    
    commentMutation.mutate({
      content: newComment,
      mentions: mentions,
      parentId: replyTo
    });
  };

  const handleReply = (commentId: string) => {
    setReplyTo(commentId);
  };

  const handleMemeCreated = (memeUrl: string, caption: string) => {
    setNewComment(prev => prev + `\n![Meme](${memeUrl})\n${caption}`);
  };

  // Fetch comments when toggled
  const { data: fetchedComments, isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
    enabled: showComments,
    staleTime: 30000,
  });

  useEffect(() => {
    if (fetchedComments && Array.isArray(fetchedComments)) {
      setComments(fetchedComments);
    }
  }, [fetchedComments]);

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  // Avatar component with fallback
  const UserAvatar = ({ userId, stageName, username, className = "h-10 w-10" }: any) => {
    const initial = (stageName || username || "A").charAt(0).toUpperCase();
    return (
      <div className={`${className} rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0`}>
        <span className="text-sm font-bold text-primary">
          {initial}
        </span>
      </div>
    );
  };

  // Determine if this is a compact view
  const isCompact = compact && !showFullPost;

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-3 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:bg-card/80 group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <UserAvatar 
            userId={post.userId}
            stageName={post.user?.stageName}
            username={post.user?.username}
            className="h-10 w-10"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm">
                {post.user?.stageName || post.author || "Anonymous Artist"}
              </span>
              {post.user?.isVerified && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>@{post.user?.username || post.userId?.slice(-8) || "anonymous"}</span>
              <span>•</span>
              <span>{formatTimeAgo(new Date(post.createdAt))}</span>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Flag className="h-4 w-4 mr-2" />
              Report
            </DropdownMenuItem>
            {user?.id === post.userId && (
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg leading-tight">{post.title}</h3>
        <div className={`text-sm text-muted-foreground leading-relaxed ${isCompact ? 'line-clamp-2' : ''}`}>
          {post.content}
        </div>
        
        {isCompact && post.content.length > 150 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFullPost(true)}
            className="p-0 h-auto text-primary hover:text-primary/80"
          >
            Show more
          </Button>
        )}
      </div>

      {/* Tags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.hashtags.map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-1">
          <ReactionSelector onReaction={handleReaction} currentReaction={currentReaction} />
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 h-auto text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105"
            onClick={toggleComments}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="ml-1 text-xs">{comments.length}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 h-auto text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105"
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

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 border-t border-border/50 pt-4">
          {/* Comment Input */}
          <div className="flex space-x-3">
            <UserAvatar 
              userId={user?.id}
              stageName={user?.stageName}
              username={user?.username}
              className="h-8 w-8"
            />
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Add a comment... (Use @ to mention artists)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <QuickMemegen onMemeCreated={handleMemeCreated} />
                  <Button variant="ghost" size="sm" className="p-2">
                    <AtSign className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleComment}
                  disabled={!newComment.trim() || commentMutation.isPending}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {commentMutation.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          {commentsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment: any) => (
                <div key={comment.id} className={`flex space-x-3 ${comment.parentId ? 'ml-8' : ''}`}>
                  {comment.isBot ? (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">🤖</span>
                    </div>
                  ) : (
                    <UserAvatar 
                      userId={comment.userId}
                      stageName={comment.stageName}
                      username={comment.username}
                      className="h-8 w-8"
                    />
                  )}
                  <div className={`flex-1 rounded-xl p-3 ${comment.isBot ? 'bg-gradient-to-r from-primary/10 to-purple/10 border border-primary/20' : 'bg-muted/30 hover:bg-muted/50'} transition-all duration-200`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold text-sm ${comment.isBot ? 'text-primary' : 'text-foreground'}`}>
                          {comment.stageName || comment.author || user?.stageName || "Anonymous Artist"}
                        </span>
                        {!comment.isBot && (comment.isVerified || user?.isVerified) && (
                          <Check className="h-3 w-3 text-primary" />
                        )}
                        {comment.isBot && (
                          <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">AI Assistant</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(new Date(comment.createdAt))}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-muted-foreground opacity-75">
                        @{comment.username || comment.userId?.slice(-8) || user?.username?.slice(-8) || "anonymous"}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed mb-2">{comment.content || "No content available"}</p>
                    
                    {/* Reply button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs p-1 h-auto text-muted-foreground hover:text-primary"
                      onClick={() => handleReply(comment.id)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}