import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { realTimeService } from "@/services/realTimeService";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  User, 
  MoreHorizontal,
  Flag,
  Trash2,
  Send,
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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { HoverProfileCard, ClickProfileCard } from "@/components/ui/user-profile-card";
import { useAuth } from "@/hooks/useAuth";
import ReactionSelector from "./reaction-selector";
import QuickMemegen from "./quick-memegen";
import { ContentMonitor } from "@/lib/content-monitor";
import MarkupRenderer from "@/components/ui/markup-renderer";
import MarkupInput from "@/components/ui/markup-input";
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
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [attachedMeme, setAttachedMeme] = useState<string | null>(null);
  const [commentFilter, setCommentFilter] = useState<'relevant' | 'all'>('relevant');
  const [showAllComments, setShowAllComments] = useState(false);

  // Instagram-style comment filtering
  const getFilteredComments = () => {
    if (!comments.length) return [];
    
    let filteredComments = [...comments];
    
    if (commentFilter === 'relevant') {
      // Sort by engagement (replies, mentions, bot responses, recent)
      filteredComments.sort((a, b) => {
        const aScore = (a.isBot ? 100 : 0) + (a.content?.includes('@') ? 50 : 0) + 
                      (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) / 1000000;
        const bScore = (b.isBot ? 100 : 0) + (b.content?.includes('@') ? 50 : 0) + 
                      (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) / 1000000;
        return bScore - aScore;
      });
      
      // Limit to 5 comments unless showing all
      if (!showAllComments) {
        filteredComments = filteredComments.slice(0, 5);
      }
    } else {
      // Sort by newest first for "All Comments"
      filteredComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return filteredComments;
  };

  // Auto-mention reply handler
  const handleReplyClick = (comment: any) => {
    const username = comment.user?.username || comment.username || 'anonymous';
    setReplyContent(`@${username} `);
    setReplyTo(comment.id);
  };
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutations
  const reactionMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      if (currentReaction === reactionType) {
        // If clicking the same reaction, remove it
        const response = await apiRequest('DELETE', `/api/posts/${post.id}/react`);
        return response;
      } else {
        // Otherwise upsert the new reaction
        const response = await apiRequest('POST', `/api/posts/${post.id}/react`, { reactionType });
        return response;
      }
    },
    onMutate: async (reactionType: string) => {
      // Optimistic update for immediate UI feedback
      const previousReaction = currentReaction;
      const previousReactions = { ...reactions };
      
      if (currentReaction === reactionType) {
        // Removing reaction
        setCurrentReaction("");
        setReactions(prev => ({
          ...prev,
          [reactionType]: Math.max(0, (prev[reactionType] || 0) - 1)
        }));
        realTimeService.optimisticReactionUpdate(post.id, reactionType, currentReaction);
      } else {
        // Adding/changing reaction
        const newReactions = { ...reactions };
        
        // Remove old reaction count if exists
        if (currentReaction) {
          newReactions[currentReaction] = Math.max(0, (newReactions[currentReaction] || 0) - 1);
        }
        
        // Add new reaction count
        newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
        
        setCurrentReaction(reactionType);
        setReactions(newReactions);
        realTimeService.optimisticReactionUpdate(post.id, reactionType, currentReaction);
      }
      
      return { previousReaction, previousReactions };
    },
    onSuccess: (data) => {
      // Update with server response
      if (data?.reactions) {
        setReactions(data.reactions);
      }
      if (data?.userReaction !== undefined) {
        setCurrentReaction(data.userReaction || "");
      }
      // Invalidate the post queries to update counts everywhere
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: (error, variables, context) => {
      // Revert optimistic update on error
      if (context) {
        setCurrentReaction(context.previousReaction);
        setReactions(context.previousReactions);
      }
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (commentData: any) => {
      const response = await apiRequest('POST', `/api/posts/${post.id}/comments`, commentData);
      return response;
    },
    onMutate: async (commentData) => {
      // Optimistic update - add comment immediately
      const optimisticComment = {
        id: `temp_${Date.now()}`,
        userId: user?.id || "",
        stageName: user?.stageName || user?.username || "Anonymous",
        username: user?.username || "anonymous",
        content: commentData.content,
        createdAt: new Date().toISOString(),
        isBot: false,
        isVerified: user?.isVerified || false,
        user: user
      };
      
      // Update local state immediately
      setComments(prev => [...prev, optimisticComment]);
      
      // Update cache for instant feedback
      realTimeService.optimisticCommentUpdate(post.id, optimisticComment);
      
      // Clear input immediately
      setNewComment("");
      setReplyContent("");
      setReplyTo(null);
      
      return { optimisticComment };
    },
    onSuccess: async (newComment, variables, context) => {
      // Replace optimistic comment with real one
      if (context?.optimisticComment) {
        setComments(prev => 
          prev.map(comment => 
            comment.id === context.optimisticComment.id ? newComment : comment
          )
        );
      }
      
      // Invalidate queries for real-time sync across components
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
      toast({
        title: "Comment posted",
        description: "Your comment is now live",
      });

      // Check for @thecueroom mention and trigger AI bot response
      if (newComment.content.toLowerCase().includes('@thecueroom')) {
        try {
          const response = await fetch('/api/ai/bot-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mentionContent: newComment.content,
              postContent: post.content,
              postTitle: post.title || 'Community Post'
            })
          });
          
          if (response.ok) {
            const { response: botResponse } = await response.json();
            
            // Add bot response after a short delay
            setTimeout(() => {
              const botComment = {
                id: `bot_${Date.now()}`,
                userId: "bot_thecueroom",
                stageName: "TheCueRoom Bot",
                username: "thecueroom",
                content: botResponse,
                createdAt: new Date(),
                isBot: true,
                isVerified: true,
                user: {
                  stageName: "TheCueRoom Bot",
                  username: "thecueroom",
                  isBot: true,
                  isVerified: true,
                  profileImageUrl: null
                }
              };
              
              setComments(prev => [...prev, botComment]);
            }, 1500);
          }
        } catch (error) {
          console.error("AI bot response error:", error);
          // Add fallback bot response
          setTimeout(() => {
            const fallbackComment = {
              id: `bot_fallback_${Date.now()}`,
              userId: "bot_thecueroom",
              stageName: "TheCueRoom Bot", 
              username: "thecueroom",
              content: "Hey! Thanks for mentioning me. I'm here to help with music advice and community support! 🎧",
              createdAt: new Date(),
              isBot: true,
              isVerified: true,
              user: {
                stageName: "TheCueRoom Bot",
                username: "thecueroom",
                isBot: true,
                isVerified: true,
                profileImageUrl: null
              }
            };
            
            setComments(prev => [...prev, fallbackComment]);
          }, 1500);
        }
      }
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  // Load existing reactions on mount
  useEffect(() => {
    const loadReactions = async () => {
      try {
        const response = await fetch(`/api/posts/${post.id}/reactions`);
        const data = await response.json();
        
        if (data.reactions) {
          setReactions(data.reactions);
        }

        // Get user's current reaction if authenticated
        if (user) {
          try {
            const userResponse = await fetch(`/api/posts/${post.id}/reactions`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setCurrentReaction(userData.userReaction || "");
            }
          } catch (error) {
            // User reaction endpoint might not exist, ignore error
          }
        }
      } catch (error) {
        console.error('Failed to load reactions:', error);
      }
    };

    loadReactions();
  }, [post.id, user]);

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
      memeImageUrl: attachedMeme,
      memeImageData: attachedMeme
    });
    
    // Clear meme attachment
    setAttachedMeme(null);
  };

  const handleMemeCreated = (memeUrl: string, caption: string) => {
    setNewComment(prev => prev + `\n![Meme](${memeUrl})\n${caption}`);
  };

  const handleReply = (commentId: string | number) => {
    if (!replyContent.trim()) return;
    
    const mentions = Array.from(replyContent.matchAll(/@(\w+)/g))
      .map(match => match[1]);
    
    commentMutation.mutate({
      content: replyContent,
      mentions: mentions,
      parentId: commentId
    });
    
    // Clear the reply form
    setReplyContent("");
    setReplyTo(null);
  };

  // Fetch comments from database on component mount (always enabled for real-time count)
  const { data: fetchedComments } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
    staleTime: 5000, // Reduced for more real-time updates
    refetchInterval: 3000, // Auto-refresh every 3 seconds
  });

  // Subscribe to real-time updates for this post
  useEffect(() => {
    const unsubscribe = realTimeService.subscribeToPost(post.id);
    return unsubscribe;
  }, [post.id]);

  useEffect(() => {
    if (fetchedComments && Array.isArray(fetchedComments)) {
      setComments(fetchedComments);
    }
  }, [fetchedComments]);

  const toggleComments = () => {
    setShowComments(!showComments);
    // Comments will be fetched automatically via useQuery when showComments becomes true
  };

  // Determine if this is a compact view
  const isCompact = compact && !showFullPost;

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-2 mb-2 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:bg-card/80 hover:border-primary/30 group cursor-pointer"
         onClick={() => {
           setShowFullPost(!showFullPost);
           setShowComments(!showComments);
           if (onOpenThread) onOpenThread();
         }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          <ClickProfileCard userId={post.userId || post.user?.id || ""}>
            <div className="relative">
              <div className="h-10 w-10 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center cursor-pointer">
                <span className="text-sm font-bold text-primary">
                  {(post.user?.stageName || post.author || "A").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
          </ClickProfileCard>
          <div>
            <div className="flex items-center space-x-2">
              <HoverProfileCard userId={post.userId || post.user?.id || ""}>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors cursor-pointer hover:underline">
                  {post.user?.stageName || post.author || "Anonymous Artist"}
                </h3>
              </HoverProfileCard>
              {post.user?.isVerified && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>@{post.user?.username || post.userId?.slice(-8) || "anonymous"}</span>
              <span>•</span>
              <Clock className="h-3 w-3" />
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
      <div className="space-y-1 ml-13">
        <h2 className="font-bold text-xs group-hover:text-primary transition-colors leading-tight ml-[53px] mr-[53px]">
          {post.title}
        </h2>
        <div className="relative">
          <div className={`text-foreground leading-relaxed text-xs ${
            isCompact && post.content.length > 120 && !showFullPost ? 'line-clamp-2' : ''
          }`}>
            {isCompact && post.content.length > 120 && !showFullPost ? (
              <div className="space-y-2">
                <p className="font-thin ml-[53px] mr-[0px] flex justify-between items-center">
                  <span>{post.content.substring(0, 70)}...</span>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 underline-offset-4 hover:underline rounded-md text-xs p-0 h-auto text-primary ml-[48px] mr-[48px] font-normal"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullPost(true);
                      setShowComments(true);
                    }}
                  >
                    Read more
                  </Button>
                </p>
              </div>
            ) : (
              <MarkupRenderer 
                content={post.content} 
                allowEmbeds={true}
                maxEmbeds={3}
                className=""
              />
            )}
          </div>
        </div>
      </div>
      {/* Line Break */}
      <div className="border-t border-border/30 my-1 ml-13"></div>
      {/* Actions */}
      <div className="flex items-center justify-between text-[16px] font-normal ml-[47px] mr-[47px] mt-[-4px] mb-[-4px] pl-[-5px] pr-[-5px] pt-[-3px] pb-[-3px] text-left"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center space-x-1">
          <ReactionSelector
            onReact={handleReaction}
            currentReaction={currentReaction}
            reactions={reactions}
          />
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-6 text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105"
            onClick={toggleComments}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            <span className="text-xs">{comments.length}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-6 text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast({
                title: "Link copied",
                description: "Post link copied to clipboard",
              });
            }}
          >
            <Share className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Tags - aligned to right */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-0.5 text-[12px]">
            {post.tags.slice(0, isCompact ? 3 : post.tags.length).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs hover:bg-primary/20 transition-colors py-0 px-2 text-[#289368] pl-[0px] pr-[0px]">
                #{tag}
              </Badge>
            ))}
            {isCompact && post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs py-0 px-2">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
      {/* Comments Section */}
      {showComments && (
        <div className="space-y-2 border-t border-border/30 pt-2 ml-13"
             onClick={(e) => e.stopPropagation()}>
          {/* Comment Input */}
          <div className="flex space-x-2 ml-[45.5px] mr-[45.5px] pl-[0px] pr-[0px] pt-[0px] pb-[0px] mt-[0px] mb-[0px] text-[12px] font-bold">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 ml-[0px] mr-[0px] text-[12px] font-normal text-left">
              <span className="text-xs font-bold text-primary">
                {(user?.stageName || user?.username || "A").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <MarkupInput
                value={newComment}
                onChange={setNewComment}
                onSubmit={handleComment}
                disabled={commentMutation.isPending}
                isSubmitting={commentMutation.isPending}
                onMemeAttach={setAttachedMeme}
                attachedMeme={attachedMeme}
                placeholder={`Comment on this post... Use **bold**, *italic*, @mentions, and paste media links for embeds`}
                allowEmbeds={true}
                showPreview={true}
                postId={post.id}
                postContent={post.content}
              />
            </div>
          </div>

          {/* Comment Filter Buttons - Instagram Style */}
          {comments.length > 0 && (
            <div className="flex items-center justify-between ml-[45.5px] mr-[45.5px] mb-2">
              <div className="flex items-center space-x-4">
                <Button
                  variant={commentFilter === 'relevant' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs h-7 px-3"
                  onClick={() => {
                    setCommentFilter('relevant');
                    setShowAllComments(false);
                  }}
                >
                  Most Relevant Comments
                </Button>
                <Button
                  variant={commentFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs h-7 px-3"
                  onClick={() => {
                    setCommentFilter('all');
                    setShowAllComments(true);
                  }}
                >
                  All Comments
                </Button>
              </div>
              {commentFilter === 'relevant' && comments.length > 5 && !showAllComments && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => setShowAllComments(true)}
                >
                  View {comments.length - 5} more comments
                </Button>
              )}
            </div>
          )}

          {/* Existing Comments */}
          {comments.length > 0 && (
            <div className="space-y-1 ml-[40px] mr-[53px]">
              {getFilteredComments().map((comment, index) => (
                <div key={index} className="flex space-x-2 hover:bg-muted/10 rounded-lg p-1 transition-colors group pt-[0px] pb-[0px] pl-[4px] pr-[4px]">
                  {comment.isBot ? (
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">🤖</span>
                    </div>
                  ) : (
                    <ClickProfileCard userId={comment.userId || ""}>
                      <div className="h-6 w-6 rounded-full flex-shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
                        <span className="text-xs font-bold text-primary">
                          {(comment.user?.stageName || comment.stageName || comment.username || "A").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </ClickProfileCard>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-2 mb-1">
                      {comment.isBot ? (
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-primary">
                            {comment.stageName || comment.author || "TheCueRoom Bot"}
                          </span>
                          <Badge variant="secondary" className="text-xs bg-primary/20 text-primary px-1 py-0">BOT</Badge>
                        </div>
                      ) : (
                        <HoverProfileCard userId={comment.userId || ""}>
                          <span className="font-semibold text-sm text-foreground cursor-pointer hover:underline hover:text-primary">
                            {comment.user?.stageName || comment.stageName || comment.author || "Anonymous Artist"}
                          </span>
                        </HoverProfileCard>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(new Date(comment.createdAt))}
                      </span>
                      {!comment.isBot && (comment.user?.isVerified || comment.isVerified) && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <div className="mb-1">
                      <MarkupRenderer 
                        content={comment.content || "No content available"} 
                        allowEmbeds={true}
                        maxEmbeds={2}
                        className="text-sm leading-relaxed break-words"
                      />
                    </div>
                    
                    {/* Attached Meme Thumbnail */}
                    {comment.memeImageUrl && (
                      <div className="mt-2 mb-1">
                        <img
                          src={comment.memeImageUrl}
                          alt="Attached meme"
                          className="w-20 h-16 object-cover rounded border border-[#00cc88]/30 cursor-pointer hover:border-[#00cc88]/60 transition-colors"
                          onClick={() => {
                            // Optional: Open meme in modal/fullscreen
                            window.open(comment.memeImageUrl, '_blank');
                          }}
                        />
                        <div className="text-xs text-[#00cc88] mt-1">🎭 Meme</div>
                      </div>
                    )}
                    
                    {/* Reply button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs p-1 h-auto text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleReplyClick(comment)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>

                    {/* Reply form - Discord-style thread */}
                    {replyTo === comment.id && (
                      <div className="mt-2 ml-2 border-l-2 border-primary/30 pl-3 bg-muted/20 rounded-r-lg p-2">
                        <div className="text-xs text-muted-foreground mb-2 flex items-center">
                          <Reply className="h-3 w-3 mr-1" />
                          Replying to @{comment.user?.username || comment.username || "anonymous"}
                        </div>
                        <MarkupInput
                          value={replyContent}
                          onChange={setReplyContent}
                          onSubmit={() => handleReply(comment.id)}
                          placeholder={`Reply with **bold**, *italic*, @mentions, and media embeds...`}
                          disabled={commentMutation.isPending}
                          isSubmitting={commentMutation.isPending}
                          allowEmbeds={true}
                          showPreview={false}
                          postId={post.id}
                          postContent={post.content}
                        />
                      </div>
                    )}
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