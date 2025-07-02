/**
 * @ Mention Input Component
 * Shows user suggestions when typing @ symbol
 */
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, CheckCircle } from "lucide-react";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

interface UserSuggestion {
  id: string;
  username: string;
  stageName?: string;
  isVerified?: boolean;
}

export default function MentionInput({
  value,
  onChange,
  onKeyDown,
  placeholder = "Add a comment...",
  className,
  maxLength = 500
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock users for suggestions (in production, this would fetch from API)
  const mockUsers: UserSuggestion[] = [
    { id: "user_1", username: "techno_producer", stageName: "Bass Frequency", isVerified: true },
    { id: "user_2", username: "house_vibes", stageName: "Deep House Master", isVerified: false },
    { id: "user_3", username: "underground_dj", stageName: "Vinyl Warrior", isVerified: true },
    { id: "user_4", username: "acid_303", stageName: "Acid Tech", isVerified: false },
    { id: "user_5", username: "minimal_beats", stageName: "Minimal Mind", isVerified: true },
  ];

  // Filter users based on mention query
  const filteredUsers = mockUsers.filter(user => 
    user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    (user.stageName && user.stageName.toLowerCase().includes(mentionQuery.toLowerCase()))
  ).slice(0, 5);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check for @ mentions
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setMentionQuery("");
    }
  };

  const insertMention = (user: UserSuggestion) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    
    // Find the @ symbol and replace with mention
    const mentionMatch = textBeforeCursor.match(/@\w*$/);
    if (mentionMatch) {
      const beforeMention = textBeforeCursor.slice(0, mentionMatch.index);
      const newValue = `${beforeMention}@${user.username} ${textAfterCursor}`;
      onChange(newValue);
      
      // Set cursor position after the mention
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = beforeMention.length + user.username.length + 2;
          inputRef.current.setSelectionRange(newPosition, newPosition);
          inputRef.current.focus();
        }
      }, 0);
    }
    
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && filteredUsers.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredUsers.length);
          return;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
          return;
        case 'Enter':
          e.preventDefault();
          insertMention(filteredUsers[selectedIndex]);
          return;
        case 'Escape':
          setShowSuggestions(false);
          return;
      }
    }
    
    onKeyDown?.(e);
  };

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("text-xs h-7 border-yellow-200 focus:border-yellow-400", className)}
        maxLength={maxLength}
      />
      
      {/* Mention Suggestions Dropdown */}
      {showSuggestions && filteredUsers.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-black border border-gray-600 rounded-md shadow-lg z-50 max-h-32 overflow-y-auto hidden-scrollbar">
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              onClick={() => insertMention(user)}
              className={cn(
                "w-full px-3 py-2 text-left hover:bg-gray-800 flex items-center space-x-2",
                index === selectedIndex && "bg-gray-800"
              )}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
                <User className="w-2 h-2 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Stage/Artist Name - smaller font, doesn't exceed avatar */}
                <div className="text-[10px] text-gray-300 truncate max-w-[120px]">
                  {user.stageName || user.username}
                  {user.isVerified && (
                    <CheckCircle className="w-2 h-2 text-yellow-500 inline ml-1" />
                  )}
                </div>
                {/* Username - even smaller font */}
                <div className="text-[9px] text-gray-500 truncate">
                  @{user.username}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}