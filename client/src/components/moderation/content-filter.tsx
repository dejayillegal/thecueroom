import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Bot,
  Eye,
  Flag
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ModerationResult {
  approved: boolean;
  reason?: string;
  confidence: number;
}

export default function ContentFilter() {
  const [testContent, setTestContent] = useState("");
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const { toast } = useToast();

  const moderateMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/moderation/test', { content });
      return response.json();
    },
    onSuccess: (result) => {
      setModerationResult(result);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to test content moderation",
        variant: "destructive",
      });
    },
  });

  const handleTest = () => {
    if (testContent.trim()) {
      moderateMutation.mutate(testContent);
    }
  };

  const getModerationIcon = (approved: boolean) => {
    return approved ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getModerationColor = (approved: boolean) => {
    return approved ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Content Moderation Test */}
      <Card className="bg-secondary border-border">
        <CardHeader>
          <CardTitle className="text-primary flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            AI Content Moderation Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Content</label>
            <Textarea
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              placeholder="Enter content to test moderation (e.g., posts, comments, meme prompts)..."
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={handleTest}
            disabled={!testContent.trim() || moderateMutation.isPending}
            className="w-full"
          >
            {moderateMutation.isPending ? "Analyzing..." : "Test Moderation"}
          </Button>

          {moderationResult && (
            <Alert className={`${moderationResult.approved ? 'border-green-500/50' : 'border-red-500/50'}`}>
              <div className="flex items-center space-x-2">
                {getModerationIcon(moderationResult.approved)}
                <AlertDescription className={getModerationColor(moderationResult.approved)}>
                  <strong>
                    {moderationResult.approved ? "Content Approved" : "Content Rejected"}
                  </strong>
                  {moderationResult.reason && (
                    <div className="mt-1 text-sm">
                      Reason: {moderationResult.reason}
                    </div>
                  )}
                  <div className="mt-1 text-xs">
                    Confidence: {Math.round(moderationResult.confidence * 100)}%
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Moderation Guidelines */}
      <Card className="bg-secondary border-border">
        <CardHeader>
          <CardTitle className="text-primary flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Moderation Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prohibited Content */}
              <div className="space-y-3">
                <h4 className="font-semibold text-red-400 flex items-center">
                  <XCircle className="h-4 w-4 mr-2" />
                  Prohibited Content
                </h4>
                <div className="space-y-2">
                  <Badge variant="destructive" className="block w-fit">
                    <Flag className="h-3 w-3 mr-1" />
                    Self-promotion & Spam
                  </Badge>
                  <Badge variant="destructive" className="block w-fit">
                    <Flag className="h-3 w-3 mr-1" />
                    Harassment & Bullying
                  </Badge>
                  <Badge variant="destructive" className="block w-fit">
                    <Flag className="h-3 w-3 mr-1" />
                    Discrimination
                  </Badge>
                  <Badge variant="destructive" className="block w-fit">
                    <Flag className="h-3 w-3 mr-1" />
                    Off-topic Content
                  </Badge>
                  <Badge variant="destructive" className="block w-fit">
                    <Flag className="h-3 w-3 mr-1" />
                    NSFW Material
                  </Badge>
                </div>
              </div>

              {/* Allowed Content */}
              <div className="space-y-3">
                <h4 className="font-semibold text-green-400 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Encouraged Content
                </h4>
                <div className="space-y-2">
                  <Badge variant="secondary" className="block w-fit bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Production Tips
                  </Badge>
                  <Badge variant="secondary" className="block w-fit bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Technical Discussions
                  </Badge>
                  <Badge variant="secondary" className="block w-fit bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Scene History
                  </Badge>
                  <Badge variant="secondary" className="block w-fit bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Underground Culture
                  </Badge>
                  <Badge variant="secondary" className="block w-fit bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Safe Humor & Memes
                  </Badge>
                </div>
              </div>
            </div>

            {/* AI Moderation Features */}
            <div className="mt-6 p-4 bg-accent rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                AI Moderation Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Real-time Content Analysis</strong>
                  <p className="text-muted-foreground">
                    All posts and comments are automatically analyzed for policy violations
                  </p>
                </div>
                <div>
                  <strong>NSFW Detection</strong>
                  <p className="text-muted-foreground">
                    AI-generated memes are filtered for inappropriate content
                  </p>
                </div>
                <div>
                  <strong>Promotion Detection</strong>
                  <p className="text-muted-foreground">
                    Automatic identification of self-promotional content and spam
                  </p>
                </div>
                <div>
                  <strong>Context Awareness</strong>
                  <p className="text-muted-foreground">
                    Understanding of underground music culture and appropriate discussions
                  </p>
                </div>
              </div>
            </div>

            {/* Bot Status */}
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-medium">TheCueRoom AI Bot Status</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm text-primary font-medium">Active & Monitoring</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
