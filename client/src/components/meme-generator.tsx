import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, Upload, RotateCcw, Palette, Type, Move } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { safeCanvas, safeDownload, safeLog } from "@/lib/safe-dom";

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  topText?: string;
  bottomText?: string;
}

const UNDERGROUND_MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: "drake",
    name: "Drake Pointing",
    url: "/api/meme-templates/drake.jpg",
    topText: "Mainstream EDM",
    bottomText: "Underground Techno"
  },
  {
    id: "distracted",
    name: "Distracted Boyfriend", 
    url: "/api/meme-templates/distracted.jpg",
    topText: "Me at a club",
    bottomText: "Underground rave happening nearby"
  },
  {
    id: "brain",
    name: "Expanding Brain",
    url: "/api/meme-templates/brain.jpg",
    topText: "Listening to house music",
    bottomText: "Creating underground techno beats"
  },
  {
    id: "custom",
    name: "Upload Custom",
    url: "",
    topText: "Custom meme",
    bottomText: "Underground vibes"
  }
];

export default function MemeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(UNDERGROUND_MEME_TEMPLATES[0]);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState([40]);
  const [textColor, setTextColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState([2]);
  const [textPosition, setTextPosition] = useState({ top: 10, bottom: 90 });
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setCustomImage(imageUrl);
      setSelectedTemplate({
        id: "custom",
        name: "Custom Upload",
        url: imageUrl,
        topText: "Your text here",
        bottomText: "Underground vibes"
      });
    };
    reader.readAsDataURL(file);
  };

  const drawMeme = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = safeCanvas.getContext(canvas, '2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    return new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          // Set canvas size to match image
          canvas.width = 800;
          canvas.height = (img.height / img.width) * 800;
          
          // Clear canvas first
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw background image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Set font properties
        ctx.font = `bold ${fontSize[0]}px Arial, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth[0];
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Enable shadow for better text visibility
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw top text
        if (topText) {
          const topY = (canvas.height * textPosition.top) / 100;
          ctx.strokeText(topText.toUpperCase(), canvas.width / 2, topY);
          ctx.fillText(topText.toUpperCase(), canvas.width / 2, topY);
        }
        
        // Draw bottom text
        if (bottomText) {
          const bottomY = (canvas.height * textPosition.bottom) / 100;
          ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, bottomY);
          ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, bottomY);
        }
        
          resolve();
        } catch (error) {
          console.error('Canvas drawing error:', error);
          reject(error);
        }
      };
      
      img.onerror = () => {
        console.error('Image loading error');
        reject(new Error('Failed to load image'));
      };
      
      // Use fallback for missing images
      const imageUrl = customImage || selectedTemplate.url;
      if (imageUrl && imageUrl !== '') {
        img.src = imageUrl;
      } else {
        // Create a default canvas background
        try {
          canvas.width = 800;
          canvas.height = 600;
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#666';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Select an image or template', canvas.width/2, canvas.height/2);
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  };

  const generateMeme = async () => {
    setIsGenerating(true);
    try {
      await drawMeme();
      toast({
        title: "Meme generated!",
        description: "Your underground meme is ready to share"
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate meme. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const success = safeDownload.downloadCanvas(canvas, `underground-meme-${Date.now()}.png`);
    
    if (success) {
      toast({
        title: "Meme Downloaded",
        description: "Your underground meme has been saved!",
      });
    } else {
      safeLog.error('Meme download failed');
      toast({
        title: "Download Failed",
        description: "Unable to download the meme. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetMeme = () => {
    setTopText("");
    setBottomText("");
    setFontSize([40]);
    setTextColor("#ffffff");
    setStrokeColor("#000000");
    setStrokeWidth([2]);
    setTextPosition({ top: 10, bottom: 90 });
    setCustomImage(null);
    setSelectedTemplate(UNDERGROUND_MEME_TEMPLATES[0]);
  };

  const handleTemplateSelect = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setTopText(template.topText || "");
    setBottomText(template.bottomText || "");
    
    if (template.id === "custom") {
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    if (selectedTemplate.url || customImage) {
      generateMeme();
    }
  }, [selectedTemplate, topText, bottomText, fontSize, textColor, strokeColor, strokeWidth, textPosition, customImage]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white flex items-center justify-center gap-2">
            <Palette className="w-6 h-6 text-purple-400" />
            Underground Meme Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Template Selection */}
          <div className="space-y-4">
            <Label className="text-white font-medium">Select Template</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {UNDERGROUND_MEME_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-200 hover:scale-105 ${
                    selectedTemplate.id === template.id
                      ? 'border-purple-400 ring-2 ring-purple-400 ring-opacity-50'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  {template.id === "custom" ? (
                    <div className="aspect-square bg-gray-800 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  ) : (
                    <img
                      src={template.url}
                      alt={template.name}
                      className="w-full aspect-square object-cover"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 text-center">
                    {template.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Text Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Top Text
                </Label>
                <Textarea
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="Enter top text..."
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Bottom Text
                </Label>
                <Textarea
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="Enter bottom text..."
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  rows={2}
                />
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label className="text-white">Font Size: {fontSize[0]}px</Label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  max={80}
                  min={20}
                  step={2}
                  className="w-full"
                />
              </div>

              {/* Text Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Text Color</Label>
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 bg-gray-800 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Stroke Color</Label>
                  <Input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-full h-10 bg-gray-800 border-gray-600"
                  />
                </div>
              </div>

              {/* Stroke Width */}
              <div className="space-y-2">
                <Label className="text-white">Stroke Width: {strokeWidth[0]}px</Label>
                <Slider
                  value={strokeWidth}
                  onValueChange={setStrokeWidth}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Text Position */}
              <div className="space-y-4">
                <Label className="text-white flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Text Position
                </Label>
                <div className="space-y-2">
                  <Label className="text-white text-sm">Top Text: {textPosition.top}%</Label>
                  <Slider
                    value={[textPosition.top]}
                    onValueChange={(value) => setTextPosition(prev => ({ ...prev, top: value[0] }))}
                    max={45}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white text-sm">Bottom Text: {textPosition.bottom}%</Label>
                  <Slider
                    value={[textPosition.bottom]}
                    onValueChange={(value) => setTextPosition(prev => ({ ...prev, bottom: value[0] }))}
                    max={95}
                    min={55}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Canvas Preview */}
            <div className="space-y-4">
              <Label className="text-white">Preview</Label>
              <div className="border-2 border-gray-600 rounded-lg overflow-hidden bg-gray-800">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={generateMeme}
                  disabled={isGenerating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isGenerating ? "Generating..." : "Generate Meme"}
                </Button>
                <Button
                  onClick={downloadMeme}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  onClick={resetMeme}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

        </CardContent>
      </Card>
    </div>
  );
}