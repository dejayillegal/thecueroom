/**
 * Community Post Card Component - Professional Layout
 * Enhanced with proper alignments, verified ticks, and seamless interactions
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MessageSquare, Heart, User, CheckCircle, Send, Zap, Bot, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MarkupRenderer from "@/components/ui/markup-renderer";
import { useAIBotMonitor } from "./ai-bot-monitor";
import UserAvatar from "@/components/user-avatar";
import MentionInput from "./mention-input";
import MarkupInput from "@/components/ui/markup-input";
import { useAuth } from "@/hooks/useAuth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PostWithUser } from "@shared/schema";

interface CommunityPostCardProps {
  post: PostWithUser;
  variant?: "default" | "spotlight";
  className?: string;
}

export default function CommunityPostCard({ 
  post, 
  variant = "default",
  className 
}: CommunityPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [showMemePicker, setShowMemePicker] = useState(false);
  const [attachedMeme, setAttachedMeme] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { moderateContent } = useAIBotMonitor();

  // Underground Meme Templates
  const memeTemplates = [
    { id: 1, name: "Dancing", url: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif" },
    { id: 2, name: "Headbanging", url: "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif" },
    { id: 3, name: "Rave Lights", url: "https://media.giphy.com/media/3oriO04qxVReM5rJEA/giphy.gif" },
    { id: 4, name: "DJ Mixing", url: "https://media.giphy.com/media/xT5LMzIK1AdZJ4cYW4/giphy.gif" },
    { id: 5, name: "Crowd", url: "https://media.giphy.com/media/xT5LMOLf0jJCE/giphy.gif" },
    { id: 6, name: "Underground", url: "https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif" }
  ];

  // Fetch reactions for this post
  const { data: reactions = { heart: 0, like: 0, dislike: 0, laugh: 0, smile: 0, surprise: 0, explode: 0 } } = useQuery({
    queryKey: [`post-${post.id}-reactions`],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/reactions`);
      if (!response.ok) throw new Error('Failed to fetch reactions');
      const data = await response.json();
      return data.reactions || {};
    },
    refetchInterval: 10000,
  });

  // Fetch comments for this post
  const { data: comments = [] } = useQuery({
    queryKey: [`post-${post.id}-comments`],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    enabled: showComments,
    refetchInterval: 5000,
  });

  // Reaction mutation - Fix API endpoint
  const reactionMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      return apiRequest('POST', `/api/posts/${post.id}/react`, { reactionType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`post-${post.id}-reactions`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive"
      });
    }
  });

  // Comment mutation with AI monitoring
  const commentMutation = useMutation({
    mutationFn: async (commentData: { content: string; memeImageUrl?: string }) => {
      // AI monitoring before submission
      moderateContent(commentData.content, 'comment', post.id);
      
      return apiRequest('POST', `/api/posts/${post.id}/comments`, commentData);
    },
    onSuccess: () => {
      setNewComment("");
      setAttachedMeme(null);
      setShowAISuggestions(false);
      queryClient.invalidateQueries({ queryKey: [`post-${post.id}-comments`] });
      toast({
        title: "Comment Posted",
        description: attachedMeme ? "Comment with meme posted successfully!" : "Comment posted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  });

  // AI Suggestions generator
  const generateAISuggestions = (postContent: string, postTitle: string) => {
    const suggestions = [
      "This track really captures that underground vibe! 🔥",
      "Have you tried using more reverb on the kick? Might add some depth",
      "The progression reminds me of classic Detroit techno. Love it!",
      "What DAW did you use for this? The mix sounds crisp",
      "This deserves to be played at proper warehouse parties!",
      "The bassline is absolutely infectious! Well done",
      "I can already hear this at 3 AM on a dark dancefloor"
    ];
    
    // Filter suggestions based on content context
    if (postContent.toLowerCase().includes('mix') || postTitle.toLowerCase().includes('mix')) {
      return suggestions.filter(s => s.includes('mix') || s.includes('reverb') || s.includes('DAW'));
    }
    if (postContent.toLowerCase().includes('techno') || postTitle.toLowerCase().includes('techno')) {
      return suggestions.filter(s => s.includes('techno') || s.includes('warehouse') || s.includes('dancefloor'));
    }
    
    return suggestions.slice(0, 3);
  };

  // Quick meme generator
  const generateQuickMeme = () => {
    const memeTemplates = [
      "When the 303 bassline hits just right... 😎",
      "Me: I'll just make a quick loop... *6 hours later*",
      "That moment when your kick and bass finally sync perfectly",
      "POV: You're explaining why techno needs to be at 130+ BPM",
      "When someone calls your underground track 'just noise' 🙄"
    ];
    
    const randomMeme = memeTemplates[Math.floor(Math.random() * memeTemplates.length)];
    setNewComment(randomMeme);
  };

  // Format date and time professionally
  const formatDateTime = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Relative time
    let relativeTime = '';
    if (diffMins < 60) relativeTime = `${diffMins}m`;
    else if (diffHours < 24) relativeTime = `${diffHours}h`;
    else if (diffDays < 7) relativeTime = `${diffDays}d`;
    else relativeTime = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Exact date and time
    const exactTime = d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${relativeTime} • ${exactTime}`;
  };

  // Get display name with proper fallback
  const getDisplayName = () => {
    if (post.user?.stageName) return post.user.stageName;
    if (post.user?.username) return post.user.username;
    return post.userId.split('_')[1]?.substring(0, 8) || 'Artist';
  };

  // Parse tags with robust handling - tags are stored as array in database
  const tags = (post.tags || []).filter(Boolean);

  // Professional content truncation - 1 line with inline read more
  const maxLength = 120;
  const needsTruncation = post.content.length > maxLength;
  const displayContent = isExpanded ? post.content : post.content.substring(0, maxLength);

  // Total reaction count for professional display
  const totalReactions = Object.values(reactions).reduce((sum: number, count: number) => sum + count, 0);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking interactive elements or comment section
    const clickedElement = e.target as HTMLElement;
    if (clickedElement.closest('button, input, textarea, [role="dialog"], [role="button"], .markup-input, .comment-section, [data-radix-popper-content-wrapper]')) {
      return;
    }
    setShowComments(!showComments);
  };

  const handleReaction = (reactionType: string) => {
    reactionMutation.mutate(reactionType);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const commentData = {
        content: newComment.trim(),
        ...(attachedMeme && { memeImageUrl: attachedMeme })
      };
      commentMutation.mutate(commentData);
    }
  };

  return (
    <Card className={cn(
      "group cursor-pointer transition-all duration-300 hover:shadow-lg border border-border/50",
      variant === "spotlight" && "hover:scale-[1.01] hover:border-[#06c23e]/50",
      className
    )}
    onClick={handleCardClick}
    >
      <CardContent className="p-5">
        {/* Professional Header: Avatar + Stage/Artist Name */}
        <div className="flex items-start space-x-2 mb-3">
          <UserAvatar 
            userId={post.userId} 
            config={post.user?.avatarConfig} 
            size={32} 
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            {/* Stage/Artist Name */}
            <div className="font-medium text-sm text-foreground">
              {getDisplayName()}
            </div>
            {/* Username + Verified + Time */}
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>@{post.user?.username || post.userId.split('_')[1]?.substring(0, 8) || 'user'}</span>
              {post.user?.isVerified && (
                <CheckCircle className="w-3 h-3 text-[#06c23e]" />
              )}
              <span>•</span>
              <span className="text-xs text-gray-400 font-medium">
                {post.createdAt ? formatDateTime(post.createdAt) : "just now"}
              </span>
            </div>
          </div>
        </div>

        {/* Title with Yellow Gradient */}
        <h3 className={cn(
          "font-bold mb-2 line-clamp-1 text-sm",
          variant === "spotlight" && "bg-gradient-to-r from-[#06c23e] to-[#06c216] bg-clip-text text-transparent"
        )}>
          {post.title}
        </h3>

        {/* Content with Discord-style Markup Rendering */}
        <div className="mb-3">
          {isExpanded ? (
            <MarkupRenderer content={post.content} className="text-muted-foreground text-xs leading-relaxed" />
          ) : (
            <div className="text-muted-foreground text-xs leading-relaxed inline">
              <MarkupRenderer content={displayContent} />
              {needsTruncation && (
                <>
                  {"... "}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(true);
                    }}
                    className="text-[#06c23e] hover:text-[#06c216] font-medium ml-1"
                  >
                    Read more
                  </button>
                </>
              )}
            </div>
          )}
          {isExpanded && needsTruncation && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="text-[#06c23e] hover:text-[#06c216] font-medium text-xs mt-1"
            >
              Show less
            </button>
          )}
        </div>

        {/* Professional Bottom Row: Reactions + Comments + Tags */}
        <div className="flex items-center justify-between">
          {/* Left: Reactions and Comments */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReaction('like');
              }}
              className="text-muted-foreground hover:text-[#06c23e] transition-colors p-1 h-auto"
              disabled={reactionMutation.isPending}
            >
              <Heart className="w-3 h-3 mr-1" />
              <span className="text-xs">{reactions.like || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className="text-muted-foreground hover:text-[#06c23e] transition-colors p-1 h-auto"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              <span className="text-xs">{comments.length}</span>
            </Button>
          </div>

          {/* Right: Yellow Gradient Hashtags */}
          {tags.length > 0 && (
            <div className="flex items-center max-w-[40%]">
              {tags.slice(0, 2).map((tag, index) => (
                <span 
                  key={index}
                  className="text-[10px] bg-gradient-to-r from-[#06c23e] to-[#06c216] bg-clip-text text-transparent font-medium mr-1"
                >
                  #{tag.length > 8 ? tag.substring(0, 8) + '..' : tag}
                </span>
              ))}
              {tags.length > 2 && (
                <button 
                  className="text-[10px] bg-gradient-to-r from-[#06c23e] to-[#06c216] bg-clip-text text-transparent hover:from-[#06c23e]/80 hover:to-[#06c216]/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Show all tags in a tooltip or expand
                    console.log('Show all tags:', tags);
                  }}
                >
                  +{tags.length - 2}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Expandable Comments Section */}
        {showComments && (
          <div className="mt-4 pt-3 border-t border-border/50 comment-section">
            {/* Comments List - Clean Scrollable */}
            {comments.length > 0 && (
              <div className="max-h-32 overflow-y-auto pr-2 mb-3 hidden-scrollbar">
                <div className="space-y-2">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="flex space-x-2">
                      <UserAvatar 
                        userId={comment.userId} 
                        config={comment.user?.avatarConfig} 
                        size={20} 
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        {/* Stage/Artist Name */}
                        <div className="text-xs font-medium text-foreground">
                          {comment.user?.stageName || comment.user?.username || comment.userId}
                        </div>
                        {/* Username + Verified + Time */}
                        <div className="flex items-center space-x-1 text-[10px] text-muted-foreground">
                          <span>@{comment.user?.username || comment.userId.split('_')[1]?.substring(0, 8) || 'user'}</span>
                          {comment.user?.isVerified && (
                            <CheckCircle className="w-2 h-2 text-yellow-500 flex-shrink-0" />
                          )}
                          <span>•</span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {comment.createdAt ? formatDateTime(comment.createdAt) : "just now"}
                          </span>
                        </div>
                        {/* Comment Content */}
                        <div className="text-xs text-muted-foreground mt-1 break-words">
                          <MarkupRenderer 
                            content={comment.content} 
                            className="[&>div]:!ml-0 [&>div]:!mr-0 [&>div]:text-xs [&>div]:text-muted-foreground" 
                            allowEmbeds={false}
                          />
                        </div>
                        
                        {/* Attached Meme Thumbnail */}
                        {comment.memeImageUrl && (
                          <div className="mt-2 mb-1">
                            <img
                              src={comment.memeImageUrl}
                              alt="Attached meme"
                              className="w-16 h-12 object-cover rounded border border-[#00cc88]/30 cursor-pointer hover:border-[#00cc88]/60 transition-colors"
                              onClick={() => {
                                window.open(comment.memeImageUrl, '_blank');
                              }}
                            />
                            <div className="text-xs text-[#00cc88] mt-1">🎭 Meme</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggested Replies */}
            {showAISuggestions && (
              <div className="mb-3 p-2 border border-[#06c23e]/30 rounded-md bg-[#06c23e]/10">
                <div className="flex items-center space-x-1 mb-2">
                  <Bot className="w-3 h-3 text-[#06c23e]" />
                  <span className="text-xs font-medium text-[#06c216]">AI Suggested Replies</span>
                </div>
                <div className="space-y-1">
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setNewComment(suggestion);
                        setShowAISuggestions(false);
                      }}
                      className="block w-full text-left text-xs p-1 rounded hover:bg-[#06c23e]/20 text-[#06c216]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Comment Input with AI Features, Embeds, and Memes */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {(user?.stageName || user?.username || "A").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <MarkupInput
                    value={newComment}
                    onChange={setNewComment}
                    onSubmit={handleAddComment}
                    disabled={commentMutation.isPending}
                    isSubmitting={commentMutation.isPending}
                    onMemeAttach={setAttachedMeme}
                    attachedMeme={attachedMeme}
                    placeholder="Comment on this post... Use **bold**, *italic*, @mentions, paste media links for embeds, and attach memes!"
                    allowEmbeds={true}
                    showPreview={false}
                    postId={post.id}
                    postContent={post.content}
                  />
                </div>
              </div>
              
              {/* AI Features Row */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const suggestions = generateAISuggestions(post.content, post.title);
                      setAISuggestions(suggestions);
                      setShowAISuggestions(!showAISuggestions);
                    }}
                    className="h-5 px-2 text-[10px] text-[#06c23e] hover:text-[#06c216] hover:bg-[#06c23e]/10"
                  >
                    <Sparkles className="w-2 h-2 mr-1" />
                    AI Reply
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateQuickMeme}
                    className="h-5 px-2 text-[10px] text-[#06c23e] hover:text-[#06c216] hover:bg-[#06c23e]/10"
                  >
                    <Zap className="w-2 h-2 mr-1" />
                    Quick Meme
                  </Button>
                  
                  {/* Meme Picker Button */}
                  <Popover open={showMemePicker} onOpenChange={setShowMemePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-2 text-[10px] text-[#06c23e] hover:text-[#06c216] hover:bg-[#06c23e]/10"
                      >
                        <span className="mr-1">🎭</span>
                        Attach Meme
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3" side="top">
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-[#00cc88]">🎭 Attach Underground Meme</div>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                          {memeTemplates.map((template) => (
                            <div
                              key={template.id}
                              className="cursor-pointer border-2 border-gray-200 hover:border-[#00cc88] rounded-lg p-2 transition-colors"
                              onClick={() => {
                                setAttachedMeme(template.url);
                                setShowMemePicker(false);
                                toast({
                                  title: "Meme Attached",
                                  description: `${template.name} meme ready to post!`,
                                });
                              }}
                            >
                              <img 
                                src={template.url} 
                                alt={template.name}
                                className="w-full h-20 object-cover rounded"
                              />
                              <div className="text-xs text-center mt-1 text-gray-600">{template.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Bot className="w-2 h-2 text-[#06c23e]" />
                  <span className="text-[9px] text-muted-foreground">AI monitored</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}