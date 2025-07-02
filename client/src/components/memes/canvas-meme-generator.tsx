import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, Camera, Plus, Trash2, RotateCcw } from 'lucide-react';

interface MemeText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  outlineColor: string;
  outlineWidth: number;
  shadowSize: number;
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
  allCaps: boolean;
  backgroundColor: string;
  backgroundEnabled: boolean;
}

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
}

// Underground music-themed meme templates
const undergroundMemeTemplates: MemeTemplate[] = [
  {
    id: 'drake-hotline',
    name: 'Drake Hotline (Techno vs House)',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    width: 1200,
    height: 1200
  },
  {
    id: 'distracted-boyfriend',
    name: 'Distracted Boyfriend (New Track)',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
    width: 1200,
    height: 800
  },
  {
    id: 'two-buttons',
    name: 'Two Buttons (Festival Choice)',
    url: 'https://i.imgflip.com/1g8my4.jpg',
    width: 908,
    height: 716
  },
  {
    id: 'change-my-mind',
    name: 'Change My Mind (Music Opinion)',
    url: 'https://i.imgflip.com/24y43o.jpg',
    width: 1200,
    height: 900
  },
  {
    id: 'expanding-brain',
    name: 'Expanding Brain (BPM Evolution)',
    url: 'https://i.imgflip.com/1jwhww.jpg',
    width: 857,
    height: 1202
  },
  {
    id: 'morpheus',
    name: 'Matrix Morpheus (Festival Truth)',
    url: 'https://i.imgflip.com/25w3.jpg',
    width: 665,
    height: 441
  },
  {
    id: 'one-does-not-simply',
    name: 'One Does Not Simply (Rave Life)',
    url: 'https://i.imgflip.com/1bij.jpg',
    width: 568,
    height: 335
  },
  {
    id: 'success-kid',
    name: 'Success Kid (Set Victory)',
    url: 'https://i.imgflip.com/1bhk.jpg',
    width: 500,
    height: 500
  },
  {
    id: 'woman-yelling-cat',
    name: 'Woman Yelling at Cat (DJ vs Crowd)',
    url: 'https://i.imgflip.com/345v97.jpg',
    width: 680,
    height: 438
  },
  {
    id: 'always-has-been',
    name: 'Always Has Been (Techno Truth)',
    url: 'https://i.imgflip.com/3lmzyx.jpg',
    width: 960,
    height: 540
  },
  {
    id: 'is-this-pigeon',
    name: 'Is This a Pigeon? (Festival Confusion)',
    url: 'https://i.imgflip.com/1o00in.jpg',
    width: 1587,
    height: 1423
  },
  {
    id: 'mocking-spongebob',
    name: 'Mocking SpongeBob (Genre Debate)',
    url: 'https://i.imgflip.com/1otk96.jpg',
    width: 502,
    height: 353
  },
  {
    id: 'sad-pablo-escobar',
    name: 'Sad Pablo Escobar (Festival Memories)',
    url: 'https://i.imgflip.com/1c1uej.jpg',
    width: 720,
    height: 709
  },
  {
    id: 'leonardo-dicaprio-cheers',
    name: 'Leonardo DiCaprio Cheers (Drop Incoming)',
    url: 'https://i.imgflip.com/39t1o.jpg',
    width: 600,
    height: 400
  },
  {
    id: 'surprised-pikachu',
    name: 'Surprised Pikachu (Festival Lineup)',
    url: 'https://i.imgflip.com/2kbn1e.jpg',
    width: 1893,
    height: 1893
  },
  {
    id: 'this-is-fine',
    name: 'This is Fine (Sound System Issues)',
    url: 'https://i.imgflip.com/26am.jpg',
    width: 580,
    height: 282
  },
  {
    id: 'evil-kermit',
    name: 'Evil Kermit (Buy Another Synth)',
    url: 'https://i.imgflip.com/1e7ql7.jpg',
    width: 700,
    height: 325
  },
  {
    id: 'galaxy-brain',
    name: 'Galaxy Brain (Underground Evolution)',
    url: 'https://i.imgflip.com/1jwhww.jpg',
    width: 857,
    height: 1202
  },
  {
    id: 'running-away-balloon',
    name: 'Running Away Balloon (Festival FOMO)',
    url: 'https://i.imgflip.com/261o3j.jpg',
    width: 761,
    height: 1024
  },
  // GIF Templates for Underground Music
  {
    id: 'dancing-baby',
    name: '🎵 Dancing Baby (Old School Vibes)',
    url: 'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif',
    width: 480,
    height: 360
  },
  {
    id: 'perfect-loop-dance',
    name: '🎭 Perfect Loop Dance (Techno Trance)',
    url: 'https://media.giphy.com/media/xTiTnDAP0RiCo9k85W/giphy.gif',
    width: 480,
    height: 368
  },
  {
    id: 'headbanging-gif',
    name: '🤘 Epic Headbanging (Bass Drop)',
    url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
    width: 480,
    height: 270
  },
  {
    id: 'cat-vibing',
    name: '😸 Cat Vibing (Underground Groove)',
    url: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif',
    width: 498,
    height: 498
  },
  {
    id: 'dancing-skeleton',
    name: '💀 Dancing Skeleton (Spooky Beats)',
    url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif',
    width: 480,
    height: 360
  },
  {
    id: 'rave-party-gif',
    name: '🎉 Rave Party (Festival Energy)',
    url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
    width: 480,
    height: 270
  },
  {
    id: 'dj-mixing',
    name: '🎧 DJ Mixing (Studio Session)',
    url: 'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif',
    width: 480,
    height: 270
  },
  {
    id: 'synth-wave',
    name: '🌊 Synth Wave (Retro Aesthetic)',
    url: 'https://media.giphy.com/media/l0HlKrB02QY0f1mbm/giphy.gif',
    width: 480,
    height: 270
  }
];

const fonts = [
  'Impact',
  'Arial',
  'Arial Black',
  'Helvetica',
  'Comic Sans MS',
  'Times',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Georgia',
  'Palatino',
  'Garamond',
  'Bookman',
  'Trebuchet MS',
  'Oswald',
  'Roboto',
  'Open Sans'
];

export default function CanvasMemeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [memeTexts, setMemeTexts] = useState<MemeText[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 });
  const [isGenerating, setIsGenerating] = useState(false);

  const createNewText = (): MemeText => ({
    id: Date.now().toString(),
    text: 'Your text here',
    x: canvasSize.width / 2,
    y: canvasSize.height / 4,
    fontSize: 48,
    fontFamily: 'Impact',
    fontWeight: 'bold',
    color: '#FFFFFF',
    outlineColor: '#000000',
    outlineWidth: 2,
    shadowSize: 0,
    textAlign: 'center',
    rotation: 0,
    allCaps: true,
    backgroundColor: '#000000',
    backgroundEnabled: false
  });

  const addText = () => {
    const newText = createNewText();
    setMemeTexts([...memeTexts, newText]);
    setSelectedTextId(newText.id);
  };

  const removeText = (id: string) => {
    setMemeTexts(memeTexts.filter(t => t.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  const updateText = (id: string, updates: Partial<MemeText>) => {
    setMemeTexts(memeTexts.map(text => 
      text.id === id ? { ...text, ...updates } : text
    ));
  };

  const selectedText = memeTexts.find(t => t.id === selectedTextId);

  const handleTemplateSelect = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setCustomImage(null);
    setCanvasSize({ width: Math.min(template.width, 500), height: Math.min(template.height, 400) });
    
    // Add default top and bottom text for classic meme templates
    const topText = createNewText();
    topText.text = 'TOP TEXT';
    topText.y = 50;
    
    const bottomText = createNewText();
    bottomText.id = (Date.now() + 1).toString();
    bottomText.text = 'BOTTOM TEXT';
    bottomText.y = canvasSize.height - 50;
    
    setMemeTexts([topText, bottomText]);
    setSelectedTextId(topText.id);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 500;
          const maxHeight = 400;
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          setCanvasSize({ width, height });
          setCustomImage(e.target?.result as string);
          setSelectedTemplate(null);
          setMemeTexts([]);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw all text elements
      memeTexts.forEach(memeText => {
        ctx.save();
        
        // Move to text position
        ctx.translate(memeText.x, memeText.y);
        ctx.rotate((memeText.rotation * Math.PI) / 180);
        
        // Set font
        ctx.font = `${memeText.fontWeight} ${memeText.fontSize}px ${memeText.fontFamily}`;
        ctx.textAlign = memeText.textAlign;
        ctx.textBaseline = 'middle';
        
        let displayText = memeText.allCaps ? memeText.text.toUpperCase() : memeText.text;
        
        // Draw text background if enabled
        if (memeText.backgroundEnabled) {
          const metrics = ctx.measureText(displayText);
          const padding = 10;
          ctx.fillStyle = memeText.backgroundColor;
          ctx.fillRect(
            -metrics.width / 2 - padding,
            -memeText.fontSize / 2 - padding,
            metrics.width + padding * 2,
            memeText.fontSize + padding * 2
          );
        }
        
        // Draw text shadow
        if (memeText.shadowSize > 0) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillText(displayText, memeText.shadowSize, memeText.shadowSize);
        }
        
        // Draw text outline
        if (memeText.outlineWidth > 0) {
          ctx.strokeStyle = memeText.outlineColor;
          ctx.lineWidth = memeText.outlineWidth;
          ctx.strokeText(displayText, 0, 0);
        }
        
        // Draw text
        ctx.fillStyle = memeText.color;
        ctx.fillText(displayText, 0, 0);
        
        ctx.restore();
      });
    };

    const imageUrl = customImage || selectedTemplate?.url;
    if (imageUrl) {
      img.src = imageUrl;
    }
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const resetCanvas = () => {
    setSelectedTemplate(null);
    setCustomImage(null);
    setMemeTexts([]);
    setSelectedTextId(null);
    setCanvasSize({ width: 500, height: 400 });
  };

  useEffect(() => {
    drawMeme();
  }, [selectedTemplate, customImage, memeTexts, canvasSize]);

  return (
    <div className="space-y-6">
      {/* Underground Memes Animated Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00cc88] to-[#00ff99] bg-clip-text text-transparent animate-pulse">
            Underground Memes
          </h1>
          <div className="absolute -top-2 -left-2 w-2 h-2 bg-[#00cc88] rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 w-1 h-1 bg-[#00ff99] rounded-full animate-ping"></div>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Create viral techno memes using popular templates. Express your underground humor and share with the community.
        </p>
        <div className="flex justify-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-[#00cc88] rounded-full mr-2 animate-pulse"></div>
            {undergroundMemeTemplates.length} Templates
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-[#00ff99] rounded-full mr-2 animate-pulse"></div>
            Canvas Editor
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-[#00cc88] rounded-full mr-2 animate-pulse"></div>
            AI Moderated
          </span>
        </div>
      </div>

      {/* Canvas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-[#00cc88]">Meme Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="border border-gray-300 rounded-lg shadow-lg bg-white"
              onClick={(e) => {
                if (!selectedTemplate && !customImage) return;
                
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * canvasSize.width;
                const y = ((e.clientY - rect.top) / rect.height) * canvasSize.height;
                
                if (selectedText) {
                  updateText(selectedText.id, { x, y });
                }
              }}
            />
          </div>
          
          <div className="flex justify-center gap-2">
            <Button onClick={downloadMeme} disabled={!selectedTemplate && !customImage}>
              <Download className="w-4 h-4 mr-2" />
              Download Meme
            </Button>
            <Button onClick={resetCanvas} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {/* Image Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Image</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="templates" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>
              
              <TabsContent value="templates" className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {undergroundMemeTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`cursor-pointer border-2 rounded-lg p-1 transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-[#00cc88] bg-[#00cc88]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <img
                        src={template.url}
                        alt={template.name}
                        className="w-full h-12 object-cover rounded mb-1"
                      />
                      <p className="text-xs text-center font-medium truncate">{template.name}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Text Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Text Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={addText} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Text
              </Button>
              {memeTexts.length > 0 && (
                <Select value={selectedTextId || ''} onValueChange={setSelectedTextId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select text to edit" />
                  </SelectTrigger>
                  <SelectContent>
                    {memeTexts.map((text, index) => (
                      <SelectItem key={text.id} value={text.id}>
                        Text {index + 1}: {text.text.substring(0, 20)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedText && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Edit Text</h4>
                  <Button
                    onClick={() => removeText(selectedText.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <Label htmlFor="text">Text</Label>
                  <Input
                    id="text"
                    value={selectedText.text}
                    onChange={(e) => updateText(selectedText.id, { text: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="font" className="text-sm">Font</Label>
                    <Select
                      value={selectedText.fontFamily}
                      onValueChange={(value) => updateText(selectedText.id, { fontFamily: value })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fontSize">Size: {selectedText.fontSize}px</Label>
                    <Slider
                      value={[selectedText.fontSize]}
                      onValueChange={([value]) => updateText(selectedText.id, { fontSize: value })}
                      min={12}
                      max={120}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="textColor" className="text-sm">Text Color</Label>
                    <Input
                      id="textColor"
                      type="color"
                      value={selectedText.color}
                      onChange={(e) => updateText(selectedText.id, { color: e.target.value })}
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label htmlFor="outlineColor" className="text-sm">Outline Color</Label>
                    <Input
                      id="outlineColor"
                      type="color"
                      value={selectedText.outlineColor}
                      onChange={(e) => updateText(selectedText.id, { outlineColor: e.target.value })}
                      className="h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="outlineWidth">Outline Width: {selectedText.outlineWidth}px</Label>
                  <Slider
                    value={[selectedText.outlineWidth]}
                    onValueChange={([value]) => updateText(selectedText.id, { outlineWidth: value })}
                    min={0}
                    max={8}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="rotation">Rotation: {selectedText.rotation}°</Label>
                  <Slider
                    value={[selectedText.rotation]}
                    onValueChange={([value]) => updateText(selectedText.id, { rotation: value })}
                    min={-180}
                    max={180}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allCaps"
                    checked={selectedText.allCaps}
                    onChange={(e) => updateText(selectedText.id, { allCaps: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="allCaps">ALL CAPS</Label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}