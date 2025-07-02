import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, AtSign, Lightbulb, RefreshCw, Wand2, Sparkles, Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AISuggestionService } from "@/lib/ai-suggestions";

interface SmartCommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  postId?: number;
  postContent?: string;
  recentComments?: string[];
  disabled?: boolean;
  isSubmitting?: boolean;
}

export default function SmartCommentInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Add a comment... (Use @ to mention artists)",
  postId,
  postContent = "",
  recentComments = [],
  disabled = false,
  isSubmitting = false
}: SmartCommentInputProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState<'casual' | 'professional' | 'enthusiastic'>('casual');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch users for mentions
  const { data: users } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  // Fetch commenters for this post
  const { data: postCommenters } = useQuery<any[]>({
    queryKey: [`/api/posts/${postId}/commenters`],
    enabled: !!postId,
  });

  // AI-powered suggestion functions
  const generateAISuggestions = async () => {
    if (!postContent.trim()) return;
    
    setIsGeneratingAI(true);
    try {
      const suggestions = await AISuggestionService.generateCommentSuggestions({
        postContent,
        postTitle: postContent.split('\n')[0] || postContent.slice(0, 100),
        recentComments,
        suggestionType: 'generate'
      });
      setAiSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('AI suggestion error:', error);
      setAiSuggestions(getFallbackSuggestions());
      setShowSuggestions(true);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const rewriteWithAI = async (tone: 'casual' | 'professional' | 'enthusiastic') => {
    if (!value.trim()) return;
    
    setIsGeneratingAI(true);
    try {
      const suggestions = await AISuggestionService.rewriteComment(value, tone);
      setAiSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('AI rewrite error:', error);
      setAiSuggestions([value]); // Fallback to original
      setShowSuggestions(true);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const enhanceWithAI = async () => {
    if (!value.trim()) return;
    
    setIsGeneratingAI(true);
    try {
      const suggestions = await AISuggestionService.enhanceComment(value, postContent);
      setAiSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('AI enhance error:', error);
      setAiSuggestions([value]); // Fallback to original
      setShowSuggestions(true);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Generate smart suggestions based on post content and context
  const getFallbackSuggestions = () => {
    const suggestions = [];
    
    // Music-related suggestions based on post content
    if (postContent.toLowerCase().includes('techno')) {
      suggestions.push("Love the techno vibes! 🎵", "This track is fire!", "Perfect for the dancefloor!");
    }
    if (postContent.toLowerCase().includes('house')) {
      suggestions.push("House music all night long!", "Deep house feels 🏠", "This groove is infectious!");
    }
    if (postContent.toLowerCase().includes('gig') || postContent.toLowerCase().includes('event')) {
      suggestions.push("Can't wait for this event!", "See you on the dancefloor!", "This lineup is incredible!");
    }
    if (postContent.toLowerCase().includes('new') || postContent.toLowerCase().includes('release')) {
      suggestions.push("Just added to my playlist!", "When is this dropping?", "Need the full track!");
    }

    // General music community suggestions
    const generalSuggestions = [
      "This is exactly what I needed today!",
      "The underground scene is alive!",
      "Bangalore techno at its finest!",
      "Where can I hear more like this?",
      "Incredible sound design!",
      "This gives me warehouse vibes",
      "Peak time energy right here!",
      "The bassline is insane!",
      "Adding this to my DJ set!",
      "Underground gold! 💎"
    ];

    suggestions.push(...generalSuggestions.slice(0, 3));
    return suggestions.slice(0, 5);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    
    onChange(text);
    setCursorPosition(cursor);

    // Check for @ mentions
    const lastAtIndex = text.lastIndexOf('@', cursor - 1);
    if (lastAtIndex !== -1 && lastAtIndex >= cursor - 20) {
      const query = text.slice(lastAtIndex + 1, cursor);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setShowMentions(true);
        setShowSuggestions(false);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }

    // Show suggestions if input is empty or user typed a question
    if (text.trim() === '' || text.includes('?')) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (username: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const lastAtIndex = value.lastIndexOf('@', cursorPosition - 1);
    const beforeMention = value.slice(0, lastAtIndex);
    const afterMention = value.slice(cursorPosition);
    const newValue = `${beforeMention}@${username} ${afterMention}`;
    
    onChange(newValue);
    setShowMentions(false);
    setMentionQuery("");
    
    // Focus and set cursor after mention
    setTimeout(() => {
      textarea.focus();
      const newCursor = lastAtIndex + username.length + 2;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const insertSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    (user.stageName && user.stageName.toLowerCase().includes(mentionQuery.toLowerCase()))
  ).slice(0, 6) || [];

  // Prioritize post commenters
  const prioritizedUsers = postCommenters ? [
    ...filteredUsers.filter(user => postCommenters.some(c => c.id === user.id)),
    ...filteredUsers.filter(user => !postCommenters.some(c => c.id === user.id))
  ] : filteredUsers;

  const suggestions = getFallbackSuggestions();

  return (
    <div className="relative">
      <div className="flex space-x-3">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={handleTextChange}
          disabled={disabled}
          className="min-h-[80px] resize-none"
        />
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          {/* AI Suggestions Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={generateAISuggestions}
            disabled={isGeneratingAI}
            type="button"
          >
            {isGeneratingAI ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
          </Button>

          {/* AI Rewrite Options */}
          {value.trim() && (
            <Popover open={showAIOptions} onOpenChange={setShowAIOptions}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  disabled={isGeneratingAI}
                  type="button"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" side="top">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2">AI Rewrite</div>
                  <Select value={selectedTone} onValueChange={(value: any) => setSelectedTone(value)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 flex-1"
                      onClick={() => rewriteWithAI(selectedTone)}
                      disabled={isGeneratingAI}
                      type="button"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Rewrite
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 flex-1"
                      onClick={enhanceWithAI}
                      disabled={isGeneratingAI}
                      type="button"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Enhance
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Mentions Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => setShowMentions(!showMentions)}
            type="button"
          >
            <AtSign className="h-4 w-4" />
          </Button>

          {/* Quick Suggestions Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => {
              setAiSuggestions(getFallbackSuggestions());
              setShowSuggestions(!showSuggestions);
            }}
            type="button"
          >
            <Lightbulb className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          size="sm" 
          onClick={onSubmit}
          disabled={!value.trim() || isSubmitting}
          type="button"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>

      {/* Mention Suggestions */}
      {showMentions && prioritizedUsers.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            {postCommenters?.length ? "People in this conversation" : "Mention users"}
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {prioritizedUsers.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start p-2 h-auto"
                onClick={() => insertMention(user.username)}
                type="button"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {(user.stageName || user.username || "A").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm">{user.stageName || user.username}</span>
                  <span className="text-xs text-muted-foreground">@{user.username}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      {showSuggestions && suggestions.length > 0 && !value.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Quick responses
          </div>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary/20 transition-colors text-xs"
                onClick={() => insertSuggestion(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}