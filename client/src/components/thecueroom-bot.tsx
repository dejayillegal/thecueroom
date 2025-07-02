import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, AlertTriangle, CheckCircle, Music, Users, Shield } from "lucide-react";

interface BotMessage {
  id: string;
  type: 'welcome' | 'warning' | 'info' | 'celebration' | 'monitoring';
  message: string;
  timestamp: Date;
  action?: string;
}

interface BotProps {
  userId?: string;
  className?: string;
}

export default function TheCueRoomBot({ userId, className = "" }: BotProps) {
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [currentMessage, setCurrentMessage] = useState<BotMessage | null>(null);

  const groundRules = [
    "Keep discussions focused on underground techno and house music",
    "No spam or promotional content without permission", 
    "Respect fellow artists and community members",
    "Share authentic music content only",
    "No file uploads over 5MB",
    "Upload only supported image/audio formats"
  ];

  const botResponses = {
    welcome: [
      "Welcome to the underground! 🎧 Keep the vibe authentic and the beats heavy.",
      "Another soul enters the warehouse... Remember, this is a space for real electronic music culture.",
      "The bass is calling... Make sure your content matches our underground standards.",
    ],
    fileWarning: [
      "Hold up! That file is too large for our underground servers. Keep it under 5MB to maintain the flow.",
      "File rejected! We keep it tight in the underground - 5MB max to respect our digital space.",
      "Big files kill the vibe... Compress it down under 5MB and try again.",
    ],
    contentWarning: [
      "That content doesn't match our underground culture. Keep it real, keep it techno.",
      "Off-topic detected! This warehouse is for electronic music discussions only.",
      "Content moderated. Remember, we're here for authentic underground music culture.",
    ],
    celebration: [
      "That track is absolute fire! The underground approves.",
      "Now that's what we call proper techno content! Keep it coming.",
      "Quality post detected! This is the underground energy we live for.",
    ],
    monitoring: [
      "TheCueRoom AI Bot is monitoring... Keeping the underground safe and authentic.",
      "Scanning for authentic electronic music content... All systems green.",
      "Underground guardian active... Protecting the culture, one post at a time.",
    ]
  };

  const generateBotMessage = (type: BotMessage['type'], customMessage?: string): BotMessage => {
    let message = customMessage;
    
    if (!message) {
      const responses = botResponses[type as keyof typeof botResponses] || botResponses.monitoring;
      message = responses[Math.floor(Math.random() * responses.length)];
    }

    return {
      id: `bot-${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date(),
    };
  };

  const showBotMessage = (message: BotMessage) => {
    setCurrentMessage(message);
    setMessages(prev => [message, ...prev.slice(0, 4)]); // Keep last 5 messages
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setCurrentMessage(null);
    }, 5000);
  };

  // Periodic monitoring messages
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.2) { // 20% chance every interval
        const message = generateBotMessage('monitoring');
        showBotMessage(message);
      }
    }, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [isActive]);

  // Welcome message for new users
  useEffect(() => {
    if (userId) {
      setTimeout(() => {
        const welcomeMessage = generateBotMessage('welcome');
        showBotMessage(welcomeMessage);
      }, 2000);
    }
  }, [userId]);

  // File upload monitoring (simulate)
  useEffect(() => {
    const handleFileValidation = (event: CustomEvent) => {
      const { fileSize, fileType } = event.detail;
      
      if (fileSize > 5 * 1024 * 1024) {
        const message = generateBotMessage('warning', 
          "File too large! Underground servers keep it tight - 5MB max to maintain the flow."
        );
        showBotMessage(message);
      }
      
      if (!['image/', 'audio/'].some(type => fileType.startsWith(type))) {
        const message = generateBotMessage('warning',
          "Unsupported file type! Only images and audio keep the underground vibe alive."
        );
        showBotMessage(message);
      }
    };

    window.addEventListener('file-upload-attempt', handleFileValidation as EventListener);
    return () => window.removeEventListener('file-upload-attempt', handleFileValidation as EventListener);
  }, []);

  const getBotIcon = (type: BotMessage['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'celebration':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'welcome':
        return <Users className="w-4 h-4 text-blue-400" />;
      default:
        return <Shield className="w-4 h-4 text-purple-400" />;
    }
  };

  const getBotColor = (type: BotMessage['type']) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-400 bg-yellow-900/20';
      case 'celebration':
        return 'border-green-400 bg-green-900/20';
      case 'welcome':
        return 'border-blue-400 bg-blue-900/20';
      default:
        return 'border-purple-400 bg-purple-900/20';
    }
  };

  if (!isActive || !currentMessage) return null;

  return (
    <div className={`fixed bottom-20 right-6 z-50 max-w-xs ${className}`}>
      <Card className={`border-2 ${getBotColor(currentMessage.type)} backdrop-blur-sm animate-in slide-in-from-bottom-5 duration-500`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-purple-400 flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div className="absolute -top-1 -right-1">
                {getBotIcon(currentMessage.type)}
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-purple-400 text-purple-400">
                  TheCueRoom AI Bot
                </Badge>
                <span className="text-xs text-gray-400">
                  {currentMessage.timestamp.toLocaleTimeString()}
                </span>
              </div>
              
              <p className="text-sm text-white leading-relaxed">
                {currentMessage.message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bot Status Indicator */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center animate-pulse">
          <Music className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  );
}

// Utility functions for triggering bot responses
export const triggerBotResponse = {
  fileUploadAttempt: (fileSize: number, fileType: string) => {
    const event = new CustomEvent('file-upload-attempt', {
      detail: { fileSize, fileType }
    });
    window.dispatchEvent(event);
  },
  
  contentModeration: (reason: string) => {
    const event = new CustomEvent('content-moderated', {
      detail: { reason }
    });
    window.dispatchEvent(event);
  },
  
  celebration: (message: string) => {
    const event = new CustomEvent('celebrate-content', {
      detail: { message }
    });
    window.dispatchEvent(event);
  }
};