import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Laugh, Download, Share, Heart, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Meme } from "@/types";

const generateMemeSchema = z.object({
  prompt: z.string().min(5, "Prompt must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
});

type GenerateMemeForm = z.infer<typeof generateMemeSchema>;

export default function MemeGenerator() {
  const [generatedMeme, setGeneratedMeme] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "music_production", label: "🎛️ Music Production" },
    { value: "dj_life", label: "🎧 DJ Life" },
    { value: "club_culture", label: "🕺 Club Culture" },
    { value: "techno_humor", label: "⚡ Techno Humor" },
  ];

  const form = useForm<GenerateMemeForm>({
    resolver: zodResolver(generateMemeSchema),
    defaultValues: {
      prompt: "",
      category: "music_production",
    },
  });

  const { data: existingMemes, isLoading: memesLoading } = useQuery<Meme[]>({
    queryKey: selectedCategory === "all" 
      ? ['/api/memes'] 
      : ['/api/memes', { category: selectedCategory }],
  });

  const generateMutation = useMutation({
    mutationFn: async (data: GenerateMemeForm) => {
      const response = await apiRequest('POST', '/api/memes/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedMeme(data.imageUrl);
      toast({
        title: "Meme Generated! 🎉",
        description: "Your underground music meme is ready!",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message.includes("inappropriate") 
          ? "Content contains inappropriate material. Please try a different prompt."
          : "Failed to generate meme. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GenerateMemeForm) => {
    generateMutation.mutate(data);
  };

  const handleDownload = () => {
    if (generatedMeme) {
      const link = document.createElement('a');
      link.href = generatedMeme;
      link.download = 'underground-meme.png';
      link.click();
    }
  };

  const handleShare = () => {
    if (navigator.share && generatedMeme) {
      navigator.share({
        title: 'Check out this underground music meme!',
        url: generatedMeme,
      });
    } else {
      navigator.clipboard.writeText(generatedMeme);
      toast({
        title: "Link Copied",
        description: "Meme link copied to clipboard!",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Generate AI Meme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="music_production">🎛️ Music Production</SelectItem>
                          <SelectItem value="dj_life">🎧 DJ Life</SelectItem>
                          <SelectItem value="club_culture">🕺 Club Culture</SelectItem>
                          <SelectItem value="techno_humor">⚡ Techno Humor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meme Prompt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your meme idea... e.g., 'When you finally nail that perfect kick pattern' or 'DJ struggling with technical difficulties'"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Laugh className="h-4 w-4 mr-2" />
                      Generate Meme
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Example Prompts */}
            <div className="mt-6 p-4 bg-accent rounded-lg">
              <h4 className="font-semibold mb-3 text-sm">💡 Example Prompts</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>• "When your track gets played at the main stage"</div>
                <div>• "DJ controller dies mid-set"</div>
                <div>• "Waiting for the drop in minimal techno"</div>
                <div>• "Studio monitor vs. club sound system"</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-primary">Generated Meme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-accent rounded-lg flex items-center justify-center">
              {generateMutation.isPending ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center animate-pulse">
                    <Sparkles className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Generating your meme...</p>
                    <p className="text-sm text-muted-foreground">
                      This might take a few moments
                    </p>
                  </div>
                </div>
              ) : generatedMeme ? (
                <img 
                  src={generatedMeme} 
                  alt="Generated Meme" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                    <Laugh className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Your meme will appear here</p>
                    <p className="text-sm text-muted-foreground">
                      Enter a prompt and generate your first underground music meme!
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {generatedMeme && (
              <div className="mt-4 flex space-x-2">
                <Button 
                  onClick={handleDownload}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Community Memes Section */}
      <Card className="bg-secondary border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary flex items-center">
              <Laugh className="h-5 w-5 mr-2" />
              Community Memes
            </CardTitle>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.value}
                  variant="secondary"
                  className={`cursor-pointer transition-colors ${
                    selectedCategory === category.value 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-accent hover:bg-primary hover:text-primary-foreground'
                  }`}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {memesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-accent rounded-lg p-4 loading-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : existingMemes && existingMemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingMemes.map((meme) => (
                <div key={meme.id} className="bg-accent rounded-lg p-4 hover:bg-accent/80 transition-colors">
                  <img 
                    src={meme.imageUrl} 
                    alt={meme.prompt}
                    className="w-full aspect-square object-cover rounded-lg mb-3 cursor-pointer"
                    onClick={() => window.open(meme.imageUrl, '_blank')}
                  />
                  <p className="text-sm font-medium mb-2 line-clamp-2">{meme.prompt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>by {meme.user.username}</span>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-3 w-3" />
                      <span>{meme.likesCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Laugh className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Memes Yet</h3>
              <p className="text-muted-foreground mb-4">
                {selectedCategory === "all" 
                  ? "Be the first to generate a meme for the community!" 
                  : `No memes found in this category. Create the first one!`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
