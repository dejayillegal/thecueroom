import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AvatarConfig } from "@/types";

export default function AvatarEditor() {
  const { toast } = useToast();
  const [config, setConfig] = useState<AvatarConfig>({
    style: 'techno',
    accessory: 'headphones',
    color: 'green',
    background: 'dark',
    musicElement: 'vinyl',
  });
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const generateMutation = useMutation({
    mutationFn: async (avatarConfig: AvatarConfig) => {
      const response = await apiRequest('POST', '/api/avatar/generate', { config: avatarConfig });
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewUrl(data.avatarUrl);
      toast({
        title: "Success",
        description: "Avatar generated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate avatar",
        variant: "destructive",
      });
    },
  });

  const saveAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      const response = await apiRequest('PATCH', '/api/user/avatar', { avatarUrl });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Avatar Saved",
        description: "Your new avatar has been set as your profile picture!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save avatar to profile",
        variant: "destructive",
      });
    },
  });

  const handleConfigChange = (key: keyof AvatarConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    generateMutation.mutate(config);
  };

  const handleRandomize = () => {
    const styles = ['techno', 'house', 'minimal', 'acid'] as const;
    const accessories = ['headphones', 'sunglasses', 'cap', 'none'] as const;
    const colors = ['green', 'blue', 'purple', 'red', 'yellow'] as const;
    const backgrounds = ['dark', 'neon', 'gradient'] as const;
    const musicElements = ['vinyl', 'waveform', 'speaker', 'mixer'] as const;

    setConfig({
      style: styles[Math.floor(Math.random() * styles.length)],
      accessory: accessories[Math.floor(Math.random() * accessories.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
      musicElement: musicElements[Math.floor(Math.random() * musicElements.length)],
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Configuration Panel */}
      <Card className="bg-secondary border-border">
        <CardHeader>
          <CardTitle className="text-primary">Customize Your Avatar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Style Selection */}
          <div className="space-y-2">
            <Label htmlFor="style">Music Style</Label>
            <Select value={config.style} onValueChange={(value) => handleConfigChange('style', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="techno">Techno</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="acid">Acid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Accessory Selection */}
          <div className="space-y-2">
            <Label htmlFor="accessory">Accessory</Label>
            <Select value={config.accessory} onValueChange={(value) => handleConfigChange('accessory', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select accessory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="headphones">Headphones</SelectItem>
                <SelectItem value="sunglasses">Sunglasses</SelectItem>
                <SelectItem value="cap">Cap</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label htmlFor="color">Primary Color</Label>
            <Select value={config.color} onValueChange={(value) => handleConfigChange('color', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="green">🟢 Green</SelectItem>
                <SelectItem value="blue">🔵 Blue</SelectItem>
                <SelectItem value="purple">🟣 Purple</SelectItem>
                <SelectItem value="red">🔴 Red</SelectItem>
                <SelectItem value="yellow">🟡 Yellow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Background Selection */}
          <div className="space-y-2">
            <Label htmlFor="background">Background</Label>
            <Select value={config.background} onValueChange={(value) => handleConfigChange('background', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select background" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="neon">Neon</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Music Element Selection */}
          <div className="space-y-2">
            <Label htmlFor="musicElement">Music Element</Label>
            <Select value={config.musicElement} onValueChange={(value) => handleConfigChange('musicElement', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select element" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vinyl">🎵 Vinyl Record</SelectItem>
                <SelectItem value="waveform">📊 Waveform</SelectItem>
                <SelectItem value="speaker">🔊 Speaker</SelectItem>
                <SelectItem value="mixer">🎛️ Mixer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button 
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {generateMutation.isPending ? "Generating..." : "Generate Avatar"}
            </Button>
            <Button 
              onClick={handleRandomize}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              🎲 Random
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card className="bg-secondary border-border">
        <CardHeader>
          <CardTitle className="text-primary">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-accent rounded-lg flex items-center justify-center">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Generated Avatar" 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-2xl">🎧</span>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Your avatar will appear here</p>
                  <p className="text-sm text-muted-foreground">
                    Customize the options and click "Generate Avatar"
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {previewUrl && (
            <div className="mt-4 space-y-2">
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => saveAvatarMutation.mutate(previewUrl)}
                disabled={saveAvatarMutation.isPending}
              >
                {saveAvatarMutation.isPending ? "Saving..." : "Save as Profile Picture"}
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewUrl;
                  link.download = 'my-avatar.svg';
                  link.click();
                }}
              >
                Download Avatar
              </Button>
            </div>
          )}
          
          {/* Style Preview Info */}
          <div className="mt-4 p-3 bg-accent rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Current Style</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>🎵 Style: <span className="capitalize">{config.style}</span></div>
              <div>🎧 Accessory: <span className="capitalize">{config.accessory}</span></div>
              <div>🎨 Color: <span className="capitalize">{config.color}</span></div>
              <div>🌈 Background: <span className="capitalize">{config.background}</span></div>
              <div>🎛️ Element: <span className="capitalize">{config.musicElement}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
