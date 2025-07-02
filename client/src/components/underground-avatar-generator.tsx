import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Download, 
  Palette, 
  Zap, 
  Music,
  Headphones,
  Disc3
} from "lucide-react";
import { safeCanvas, safeDownload, safeLog } from "@/lib/safe-dom";

interface AvatarConfig {
  face: string;
  eyes: string;
  accessory: string;
  background: string;
  effect: string;
  color1: string;
  color2: string;
  size: number;
}

const UNDERGROUND_ELEMENTS = {
  faces: [
    { id: 'rave', name: 'Rave Face', emoji: '🤤' },
    { id: 'sunglasses', name: 'Cool DJ', emoji: '😎' },
    { id: 'party', name: 'Party Animal', emoji: '🥳' },
    { id: 'mind-blown', name: 'Mind Blown', emoji: '🤯' },
    { id: 'sleepy', name: 'After Hours', emoji: '😴' },
    { id: 'crazy', name: 'Techno Crazy', emoji: '🤪' },
    { id: 'alien', name: 'Underground Alien', emoji: '👽' },
    { id: 'robot', name: 'Synth Bot', emoji: '🤖' }
  ],
  accessories: [
    { id: 'headphones', name: 'DJ Headphones', symbol: '🎧' },
    { id: 'vinyl', name: 'Vinyl Record', symbol: '💿' },
    { id: 'synthesizer', name: 'Mini Synth', symbol: '🎹' },
    { id: 'lightning', name: 'Electric Vibes', symbol: '⚡' },
    { id: 'crown', name: 'Techno King', symbol: '👑' },
    { id: 'diamond', name: 'Rave Diamond', symbol: '💎' },
    { id: 'fire', name: 'Fire Beat', symbol: '🔥' },
    { id: 'rainbow', name: 'Spectrum Wave', symbol: '🌈' }
  ],
  backgrounds: [
    { id: 'warehouse', name: 'Underground Warehouse', color: '#1a1a1a' },
    { id: 'neon', name: 'Neon Lights', color: '#ff00ff' },
    { id: 'laser', name: 'Laser Show', color: '#00ffff' },
    { id: 'strobes', name: 'Strobe Effect', color: '#ffff00' },
    { id: 'deep', name: 'Deep Space', color: '#000033' },
    { id: 'acid', name: 'Acid Trip', color: '#33ff33' },
    { id: 'bass', name: 'Bass Wave', color: '#ff3333' },
    { id: 'minimal', name: 'Minimal Dark', color: '#0a0a0a' }
  ],
  effects: [
    { id: 'none', name: 'Clean' },
    { id: 'glow', name: 'Glow Effect' },
    { id: 'pulse', name: 'Pulse Beat' },
    { id: 'wobble', name: 'Bass Wobble' },
    { id: 'spin', name: 'Vinyl Spin' },
    { id: 'flash', name: 'Strobe Flash' },
    { id: 'wave', name: 'Sound Wave' },
    { id: 'bounce', name: 'Drop Bounce' }
  ]
};

const RAVE_QUOTES = [
  "In Bass We Trust",
  "Underground Forever",
  "4/4 Life",
  "Techno Never Dies",
  "Warehouse Warrior",
  "Acid Test Survivor",
  "Minimal Maximal",
  "Synth Wizard",
  "Beat Seeker",
  "Frequency Fighter"
];

export default function UndergroundAvatarGenerator() {
  const [config, setConfig] = useState<AvatarConfig>({
    face: 'rave',
    eyes: 'normal',
    accessory: 'headphones',
    background: 'warehouse',
    effect: 'glow',
    color1: '#ff00ff',
    color2: '#00ffff',
    size: 200
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateRandomAvatar = () => {
    setIsGenerating(true);
    
    // Random selections with underground culture bias
    const randomConfig: AvatarConfig = {
      face: UNDERGROUND_ELEMENTS.faces[Math.floor(Math.random() * UNDERGROUND_ELEMENTS.faces.length)].id,
      eyes: Math.random() > 0.5 ? 'glowing' : 'normal',
      accessory: UNDERGROUND_ELEMENTS.accessories[Math.floor(Math.random() * UNDERGROUND_ELEMENTS.accessories.length)].id,
      background: UNDERGROUND_ELEMENTS.backgrounds[Math.floor(Math.random() * UNDERGROUND_ELEMENTS.backgrounds.length)].id,
      effect: UNDERGROUND_ELEMENTS.effects[Math.floor(Math.random() * UNDERGROUND_ELEMENTS.effects.length)].id,
      color1: `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`,
      color2: `hsl(${Math.floor(Math.random() * 360)}, 80%, 40%)`,
      size: 200
    };
    
    setConfig(randomConfig);
    setCurrentQuote(RAVE_QUOTES[Math.floor(Math.random() * RAVE_QUOTES.length)]);
    
    setTimeout(() => setIsGenerating(false), 800);
  };

  const drawAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const ctx = safeCanvas.getContext(canvas, '2d') as CanvasRenderingContext2D;
      if (!ctx) return;

      const size = config.size;
      
      // Safely set canvas dimensions
      if (!safeCanvas.setDimensions(canvas, size, size)) {
        throw new Error('Failed to set canvas dimensions');
      }

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

    // Background
    const bgConfig = UNDERGROUND_ELEMENTS.backgrounds.find(b => b.id === config.background);
    if (bgConfig) {
      const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      gradient.addColorStop(0, bgConfig.color);
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }

    // Main avatar circle
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/3, 0, 2 * Math.PI);
    const avatarGradient = ctx.createLinearGradient(0, 0, size, size);
    avatarGradient.addColorStop(0, config.color1);
    avatarGradient.addColorStop(1, config.color2);
    ctx.fillStyle = avatarGradient;
    ctx.fill();

    // Effect overlay
    if (config.effect !== 'none') {
      ctx.globalCompositeOperation = 'overlay';
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/3 + 10, 0, 2 * Math.PI);
      ctx.strokeStyle = config.color1;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }

    // Face emoji
    const faceConfig = UNDERGROUND_ELEMENTS.faces.find(f => f.id === config.face);
    if (faceConfig) {
      ctx.font = `${size/4}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(faceConfig.emoji, size/2, size/2 - 10);
    }

    // Accessory
    const accessoryConfig = UNDERGROUND_ELEMENTS.accessories.find(a => a.id === config.accessory);
    if (accessoryConfig) {
      ctx.font = `${size/6}px serif`;
      ctx.fillText(accessoryConfig.symbol, size/2, size/2 + size/4);
    }

    // Underground music elements
    ctx.font = `${size/12}px Arial, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;
    
    // BPM indicator
    const bpm = [120, 128, 132, 138, 140, 145, 150, 174][Math.floor(Math.random() * 8)];
    ctx.fillText(`${bpm} BPM`, size/2, size - 20);
    
    // Genre tag
    const genres = ['TECHNO', 'HOUSE', 'MINIMAL', 'ACID', 'HARDCORE'];
    const genre = genres[Math.floor(Math.random() * genres.length)];
    ctx.fillText(genre, size/2, 20);
    
      ctx.globalAlpha = 1;

      // Glow effect
      if (config.effect === 'glow') {
        ctx.shadowColor = config.color1;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/3 - 5, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    } catch (error) {
      console.error('Avatar drawing failed:', error);
      toast({
        title: "Avatar Generation Failed",
        description: "Unable to generate avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Generate avatar first
    drawAvatar();
    
    // Wait for drawing to complete, then download safely
    setTimeout(() => {
      const success = safeDownload.downloadCanvas(canvas, `underground-avatar-${Date.now()}.png`);
      
      if (success) {
        toast({
          title: "Avatar Downloaded",
          description: "Your underground avatar has been saved!",
        });
      } else {
        safeLog.error('Avatar download failed');
        toast({
          title: "Download Failed",
          description: "Unable to download avatar. Please try again.",
          variant: "destructive",
        });
      }
    }, 100);
  };

  const updateConfig = (key: keyof AvatarConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    drawAvatar();
  }, [config]);

  useEffect(() => {
    generateRandomAvatar();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white flex items-center justify-center gap-2">
            <Disc3 className="w-6 h-6 text-purple-400 animate-spin" />
            Underground Avatar Creator
          </CardTitle>
          {currentQuote && (
            <p className="text-center text-purple-400 italic">"{currentQuote}"</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Avatar Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className={`relative ${config.effect === 'pulse' ? 'animate-pulse' : ''} ${config.effect === 'bounce' ? 'animate-bounce' : ''}`}>
                  <canvas
                    ref={canvasRef}
                    className={`border-2 border-purple-400 rounded-full ${
                      config.effect === 'spin' ? 'animate-spin' : ''
                    } ${config.effect === 'wobble' ? 'animate-pulse' : ''}`}
                    style={{
                      filter: config.effect === 'glow' ? 'drop-shadow(0 0 20px currentColor)' : 'none'
                    }}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={generateRandomAvatar}
                  disabled={isGenerating}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Creating Vibe...' : 'Random Avatar'}
                </Button>
                
                <Button
                  onClick={downloadAvatar}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {/* Customization Controls */}
            <div className="space-y-6">
              
              {/* Face Selection */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Rave Face
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {UNDERGROUND_ELEMENTS.faces.map((face) => (
                    <Button
                      key={face.id}
                      onClick={() => updateConfig('face', face.id)}
                      variant={config.face === face.id ? "default" : "outline"}
                      className={`h-12 text-lg ${
                        config.face === face.id 
                          ? 'bg-purple-600 border-purple-400' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {face.emoji}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Accessories */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  Underground Gear
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {UNDERGROUND_ELEMENTS.accessories.map((accessory) => (
                    <Button
                      key={accessory.id}
                      onClick={() => updateConfig('accessory', accessory.id)}
                      variant={config.accessory === accessory.id ? "default" : "outline"}
                      className={`h-12 text-lg ${
                        config.accessory === accessory.id 
                          ? 'bg-purple-600 border-purple-400' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                      title={accessory.name}
                    >
                      {accessory.symbol}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Background Vibe */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Venue Vibe
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {UNDERGROUND_ELEMENTS.backgrounds.map((bg) => (
                    <Button
                      key={bg.id}
                      onClick={() => updateConfig('background', bg.id)}
                      variant={config.background === bg.id ? "default" : "outline"}
                      className={`h-10 text-xs ${
                        config.background === bg.id 
                          ? 'bg-purple-600 border-purple-400' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                      style={{
                        backgroundColor: config.background === bg.id ? undefined : bg.color + '40'
                      }}
                    >
                      {bg.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Effects */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Beat Effects
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {UNDERGROUND_ELEMENTS.effects.map((effect) => (
                    <Button
                      key={effect.id}
                      onClick={() => updateConfig('effect', effect.id)}
                      variant={config.effect === effect.id ? "default" : "outline"}
                      className={`h-10 text-xs ${
                        config.effect === effect.id 
                          ? 'bg-purple-600 border-purple-400' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {effect.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Customization */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Primary Color</Label>
                  <Input
                    type="color"
                    value={config.color1}
                    onChange={(e) => updateConfig('color1', e.target.value)}
                    className="w-full h-10 bg-gray-800 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white text-sm">Secondary Color</Label>
                  <Input
                    type="color"
                    value={config.color2}
                    onChange={(e) => updateConfig('color2', e.target.value)}
                    className="w-full h-10 bg-gray-800 border-gray-600"
                  />
                </div>
              </div>

              {/* Size Control */}
              <div className="space-y-2">
                <Label className="text-white text-sm">Avatar Size: {config.size}px</Label>
                <Slider
                  value={[config.size]}
                  onValueChange={(value) => updateConfig('size', value[0])}
                  max={300}
                  min={100}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Underground Music Culture Info */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="text-white font-medium mb-2">Your Underground Identity</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Badge variant="outline" className="border-purple-400 text-purple-400 justify-center">
                Face: {UNDERGROUND_ELEMENTS.faces.find(f => f.id === config.face)?.name}
              </Badge>
              <Badge variant="outline" className="border-blue-400 text-blue-400 justify-center">
                Gear: {UNDERGROUND_ELEMENTS.accessories.find(a => a.id === config.accessory)?.name}
              </Badge>
              <Badge variant="outline" className="border-green-400 text-green-400 justify-center">
                Venue: {UNDERGROUND_ELEMENTS.backgrounds.find(b => b.id === config.background)?.name}
              </Badge>
              <Badge variant="outline" className="border-yellow-400 text-yellow-400 justify-center">
                Effect: {UNDERGROUND_ELEMENTS.effects.find(e => e.id === config.effect)?.name}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}