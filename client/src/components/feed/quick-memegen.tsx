import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Zap, Image, Send, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuickMemegenProps {
  onMemeCreated: (memeUrl: string, caption: string) => void;
}

const quickTemplates = [
  { id: "drake", name: "Drake", emoji: "🦆" },
  { id: "brain", name: "Brain", emoji: "🧠" },
  { id: "distracted", name: "Distracted", emoji: "👀" },
  { id: "woman-yelling", name: "Woman Yelling", emoji: "😠" },
  { id: "two-buttons", name: "Two Buttons", emoji: "🔘" }
];

export default function QuickMemegen({ onMemeCreated }: QuickMemegenProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (memeData: any) => {
      const response = await apiRequest('POST', '/api/memes/quick-generate', memeData);
      return response;
    },
    onSuccess: (data) => {
      onMemeCreated(data.imageUrl, `${topText} ${bottomText}`.trim());
      setIsOpen(false);
      setTopText("");
      setBottomText("");
      setSelectedTemplate("");
      toast({
        title: "Meme created!",
        description: "Your meme has been added to the comment",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate meme",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    if (!selectedTemplate) {
      toast({
        title: "Select a template",
        description: "Please choose a meme template first",
        variant: "destructive",
      });
      return;
    }

    if (!topText && !bottomText) {
      toast({
        title: "Add some text",
        description: "Please add at least some text for the meme",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateMutation.mutate({
      template: selectedTemplate,
      topText,
      bottomText,
      style: "techno" // Default style for underground feel
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2 h-auto text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105"
          title="Quick Meme Generator"
        >
          <Zap className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="top">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Quick Meme</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="h-auto p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Template</label>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map((template) => (
                <Badge
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedTemplate === template.id ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <span className="mr-1">{template.emoji}</span>
                  {template.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Text Inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Top Text</label>
              <Input
                placeholder="Top text..."
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Bottom Text</label>
              <Input
                placeholder="Bottom text..."
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || generateMutation.isPending}
            className="w-full"
          >
            {isGenerating || generateMutation.isPending ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Add to Comment
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}