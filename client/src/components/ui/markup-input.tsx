import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Bold, 
  Italic, 
  Code, 
  Image, 
  Link, 
  AtSign, 
  Hash,
  Send,
  Bot,
  Music,
  Video,
  Sparkles,
  Brush,
  X,
  Check
} from "lucide-react";
import MarkupRenderer from "./markup-renderer";

interface MarkupInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  showPreview?: boolean;
  allowEmbeds?: boolean;
  postId?: number;
  postContent?: string;
  onMemeAttach?: (memeData: string) => void;
  attachedMeme?: string | null;
}

export default function MarkupInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type a message... Use **bold**, *italic*, @mentions, #hashtags, and paste links for embeds",
  disabled = false,
  isSubmitting = false,
  showPreview = false,
  allowEmbeds = true,
  postId,
  postContent = "",
  onMemeAttach,
  attachedMeme
}: MarkupInputProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [detectedEmbeds, setDetectedEmbeds] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState(0);
  const [showMemePicker, setShowMemePicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Meme templates for picker
  const memeTemplates = [
    {
      id: 'drake-pointing',
      name: 'Drake Pointing (Genre Choice)',
      url: 'https://i.imgflip.com/30b1gx.jpg'
    },
    {
      id: 'woman-yelling-cat',
      name: 'Woman Yelling at Cat (DJ vs Crowd)',
      url: 'https://i.imgflip.com/345v97.jpg'
    },
    {
      id: 'this-is-fine',
      name: 'This is Fine (Sound System Issues)',
      url: 'https://i.imgflip.com/26am.jpg'
    },
    {
      id: 'cat-vibing',
      name: 'Cat Vibing (Underground Groove)',
      url: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif'
    },
    {
      id: 'headbanging-gif',
      name: 'Epic Headbanging (Bass Drop)',
      url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif'
    },
    {
      id: 'dancing-skeleton',
      name: 'Dancing Skeleton (Spooky Beats)',
      url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif'
    }
  ];

  // Fetch users for mentions
  const { data: users } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  // Detect potential embeds in real-time
  useEffect(() => {
    const embedPatterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g,
      /(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/g,
      /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(track|album|playlist|artist)\/[a-zA-Z0-9]+/g,
      /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?/gi
    ];

    const embeds: string[] = [];
    embedPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(value)) !== null) {
        embeds.push(match[0]);
      }
    });

    setDetectedEmbeds(embeds);
  }, [value]);

  // Detect @ mentions and show user suggestions
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionPosition(cursorPos - mentionMatch[0].length);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  }, [value]);

  // Filter users for mention suggestions
  const filteredUsers = users?.filter(user => 
    user.stageName?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5) || [];

  // Add special @thecueroom bot option
  const mentionOptions = [
    {
      id: "thecueroom_bot",
      stageName: "TheCueRoom Bot",
      username: "thecueroom",
      isBot: true,
      isVerified: true
    },
    ...filteredUsers
  ];

  const insertFormatting = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newValue);

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      const newCursor = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const insertMention = (type: 'user' | 'bot') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const mentionText = type === 'bot' ? '@thecueroom ' : '@';
    const start = textarea.selectionStart;
    const newValue = value.substring(0, start) + mentionText + value.substring(start);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + mentionText.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const handleMentionSelect = (user: any) => {
    const beforeMention = value.substring(0, mentionPosition);
    const afterMention = value.substring(mentionPosition + mentionQuery.length + 1);
    const newValue = beforeMention + `@${user.username} ` + afterMention;
    
    onChange(newValue);
    setShowMentions(false);
    setMentionQuery("");
    
    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPos = beforeMention.length + user.username.length + 2;
      textareaRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!value.trim() || disabled || isSubmitting) return;
    
    // Check for @thecueroom mention and handle bot response
    if (value.toLowerCase().includes('@thecueroom') && postContent) {
      try {
        const response = await fetch('/api/ai/bot-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mentionContent: value,
            postContent,
            postTitle: 'Community Post'
          })
        });
        
        if (response.ok) {
          const { response: botResponse } = await response.json();
          
          // Submit the original comment first
          await onSubmit();
          onChange('');
          
          // Auto-generate bot response comment after a brief delay
          setTimeout(async () => {
            onChange(`🤖 **TheCueRoom Bot**: ${botResponse}`);
            await onSubmit();
            onChange('');
          }, 1500);
        } else {
          await onSubmit();
          onChange('');
        }
      } catch (error) {
        console.error('Bot response error:', error);
        await onSubmit();
        onChange('');
      }
    } else {
      await onSubmit();
      onChange('');
    }
    
    setIsPreviewMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    
    // Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertFormatting('**');
    }
    
    // Ctrl/Cmd + I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertFormatting('*');
    }
  };

  return (
    <div className="space-y-2">
      {/* Format Toolbar - Always Visible */}
      <div className="flex items-center justify-between bg-gray-900/50 border border-[#00cc88]/30 rounded-md p-2">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-[#00cc88] font-bold">Format:</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => insertFormatting('**')}
            type="button"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => insertFormatting('*')}
            type="button"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => insertFormatting('`')}
            type="button"
            title="Code"
          >
            <Code className="h-3 w-3" />
          </Button>
          
          {/* Meme Picker Button - Always Visible */}
          <div className="w-px h-4 bg-border mx-1" />
          <Popover open={showMemePicker} onOpenChange={setShowMemePicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 hover:bg-[#00cc88]/20 bg-[#00cc88]/10 border border-[#00cc88]/50"
                type="button"
                title="🎭 Attach Underground Meme"
              >
                <span className="text-[12px] font-bold text-[#00cc88]">🎭 Meme</span>
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
                        if (onMemeAttach) {
                          onMemeAttach(template.url);
                        }
                        setShowMemePicker(false);
                      }}
                    >
                      <img
                        src={template.url}
                        alt={template.name}
                        className="w-full h-16 object-cover rounded mb-1"
                      />
                      <p className="text-xs text-center font-medium truncate">{template.name}</p>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 text-center">
                  🤖 TheCueRoom AI Bot monitors all meme content
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Mention Buttons */}
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => insertMention('user')}
            type="button"
            title="Mention User"
          >
            <AtSign className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => insertMention('bot')}
            type="button"
            title="Mention TheCueRoom Bot"
          >
            <Bot className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => insertFormatting('#')}
            type="button"
            title="Hashtag"
          >
            <Hash className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center space-x-1">
          {showPreview && (
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground rounded-md px-3 text-xs h-7 ml-[28px] mr-[28px] font-extralight text-right pl-[5px] pr-[5px]"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              type="button"
            >
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
          )}
          
          {/* Detected Embeds Indicator */}
          {detectedEmbeds.length > 0 && allowEmbeds && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  type="button"
                >
                  <Video className="h-3 w-3 mr-1" />
                  {detectedEmbeds.length} embed{detectedEmbeds.length !== 1 ? 's' : ''}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" side="top">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Detected Embeds
                  </div>
                  {detectedEmbeds.map((embed, index) => (
                    <div key={index} className="text-xs p-2 bg-muted/30 rounded truncate">
                      {embed}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      {/* Input Area */}
      <div className="relative">
        {isPreviewMode && showPreview ? (
          <div className="min-h-[80px] p-3 border border-border rounded-md bg-muted/10">
            <MarkupRenderer 
              content={value || "Nothing to preview..."}
              allowEmbeds={allowEmbeds}
              maxEmbeds={3}
            />
          </div>
        ) : (
          <>
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground placeholder:text-[12px] placeholder:font-thin focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[80px] resize-none mt-[1px] mb-[1px] pt-[0px] pb-[0px] pl-[-5px] pr-[-5px] ml-[-12px] mr-[-12px]"
            />
            
            {/* Mention suggestions dropdown */}
            {showMentions && mentionOptions.length > 0 && (
              <div className="absolute z-50 top-full mt-1 max-w-xs bg-popover border border-border rounded-md shadow-lg">
                <div className="p-2 space-y-1">
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    Mention users
                  </div>
                  {mentionOptions.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleMentionSelect(user)}
                      className="w-full text-left px-2 py-2 rounded-sm hover:bg-muted/50 transition-colors flex items-center space-x-2"
                    >
                      <div className="flex items-center space-x-2">
                        {user.isBot ? (
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <Music className="h-3 w-3 text-primary" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center">
                            <AtSign className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium flex items-center">
                            {user.stageName}
                            {user.isVerified && (
                              <Check className="h-3 w-3 ml-1 text-primary" />
                            )}
                            {user.isBot && (
                              <Badge variant="secondary" className="ml-1 text-xs">
                                Bot
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Attached Meme Preview */}
        {attachedMeme && (
          <div className="mt-2 p-2 border border-[#00cc88]/30 rounded-md bg-[#00cc88]/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#00cc88] font-medium">🎭 Attached Meme</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => onMemeAttach && onMemeAttach(null)}
                title="Remove Meme"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <img
              src={attachedMeme}
              alt="Attached meme"
              className="w-full max-w-32 h-20 object-cover rounded border"
            />
          </div>
        )}
      </div>
      {/* Submit Button */}
      <div className="flex items-center justify-between font-thin text-[12px] ml-[12px] mr-[12px] mt-[2px] mb-[2px]">
        <div className="flex items-center space-x-2">
          {/* Helpful Tips */}
          <div className="text-muted-foreground ml-[-25px] mr-[-25px] mt-[0px] mb-[0px] text-[12px]">
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Enter</kbd> to send
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={handleSubmit}
          disabled={!value.trim() || isSubmitting}
          type="button"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3 text-[14px] font-bold text-center ml-[2px] mr-[2px] mt-[3px] mb-[3px] pl-[14px] pr-[14px] pt-[0px] pb-[0px]"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Posting..." : "Send"}
        </Button>
      </div>
      {/* Format Help */}
      {showFormatting && (
        <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted/20 rounded border">
          <div><code>**bold**</code> → <strong>bold</strong></div>
          <div><code>*italic*</code> → <em>italic</em></div>
          <div><code>`code`</code> → <code className="bg-muted px-1 rounded">code</code></div>
          <div><code>@username</code> → mention users</div>
          <div><code>@thecueroom</code> → get AI analysis</div>
          <div><code>#hashtag</code> → add tags</div>
          <div>Paste YouTube, SoundCloud, Spotify links for embeds</div>
        </div>
      )}
    </div>
  );
}