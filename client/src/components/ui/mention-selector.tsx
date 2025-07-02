import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, AtSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  username: string;
  stageName?: string;
  isVerified?: boolean;
}

interface MentionSelectorProps {
  onSelect: (username: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postId?: number;
  searchQuery?: string;
}

export default function MentionSelector({ onSelect, isOpen, onOpenChange, postId, searchQuery = "" }: MentionSelectorProps) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Fetch users (prioritize users who commented on this post)
  const { data: allUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: postCommenters } = useQuery<User[]>({
    queryKey: [`/api/posts/${postId}/commenters`],
    enabled: !!postId,
  });

  useEffect(() => {
    if (!allUsers) return;

    let users = [...allUsers];
    
    // If we have post commenters, prioritize them
    if (postCommenters && postCommenters.length > 0) {
      const commenterIds = new Set(postCommenters.map(u => u.id));
      const commenters = users.filter(u => commenterIds.has(u.id));
      const others = users.filter(u => !commenterIds.has(u.id));
      users = [...commenters, ...others];
    }

    // Filter by search query
    if (searchQuery) {
      users = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.stageName && user.stageName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredUsers(users.slice(0, 8)); // Limit to 8 suggestions
  }, [allUsers, postCommenters, searchQuery]);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <AtSign className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" side="top">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
          {postId ? "People in this conversation" : "Suggest users"}
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start p-2 h-auto"
                onClick={() => {
                  onSelect(user.username);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {(user.stageName || user.username || "A").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">
                        {user.stageName || user.username}
                      </span>
                      {user.isVerified && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">@{user.username}</span>
                  </div>
                </div>
              </Button>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No users found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}