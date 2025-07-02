import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Laugh, 
  Smile, 
  Zap,
  Bomb
} from "lucide-react";

interface ReactionSelectorProps {
  onReact: (reaction: string) => void;
  currentReaction?: string;
  reactions: Record<string, number>;
}

const reactionIcons = {
  heart: { icon: Heart, color: "text-red-500", label: "Love" },
  like: { icon: ThumbsUp, color: "text-blue-500", label: "Like" },
  dislike: { icon: ThumbsDown, color: "text-gray-500", label: "Dislike" },
  laugh: { icon: Laugh, color: "text-yellow-500", label: "Funny" },
  smile: { icon: Smile, color: "text-green-500", label: "Happy" },
  surprise: { icon: Zap, color: "text-purple-500", label: "Surprise" },
  explode: { icon: Bomb, color: "text-orange-500", label: "Mind Blown" }
};

export default function ReactionSelector({ onReact, currentReaction, reactions = {} }: ReactionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReaction = async (reaction: string) => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    try {
      await onReact(reaction);
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe handling of reactions object
  const safeReactions = reactions || {};
  const totalReactions = Object.values(safeReactions).reduce((sum, count) => sum + (count || 0), 0);

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 h-auto text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105"
          >
            {currentReaction && reactionIcons[currentReaction] ? (
              <>
                {(() => {
                  const IconComponent = reactionIcons[currentReaction].icon;
                  return <IconComponent className={`h-4 w-4 mr-1 ${reactionIcons[currentReaction].color}`} />;
                })()}
                <span className="text-xs">{totalReactions}</span>
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-1" />
                <span className="text-xs">{totalReactions}</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" side="top">
          <div className="flex gap-1">
            {Object.entries(reactionIcons).map(([key, { icon, color, label }]) => {
              const IconComponent = icon;
              return (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  className={`p-2 h-auto transition-all duration-200 hover:scale-110 ${
                    currentReaction === key ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleReaction(key)}
                  title={label}
                >
                  <IconComponent className={`h-4 w-4 ${color}`} />
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Show breakdown if there are reactions */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {Object.entries(safeReactions).map(([reaction, count]) => {
            const iconData = reactionIcons[reaction];
            if (!iconData || !count || count === 0) return null;
            
            const IconComponent = iconData.icon;
            return (
              <div key={reaction} className="flex items-center gap-1">
                <IconComponent className={`h-3 w-3 ${iconData.color}`} />
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}