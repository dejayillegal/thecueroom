/**
 * UserAvatar Component
 * Generates static avatars based on user configuration
 */
import { useEffect, useRef, useMemo } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

// Underground music themed avatar elements
const DROID_ELEMENTS = {
  droidTypes: [
    { id: 'classic', name: 'Classic DJ' },
    { id: 'cyber', name: 'Cyber Producer' },
    { id: 'minimal', name: 'Minimal Artist' },
    { id: 'acid', name: 'Acid Techno' }
  ],
  accessories: [
    { id: 'headphones', name: 'Headphones' },
    { id: 'sunglasses', name: 'Sunglasses' },
    { id: 'cap', name: 'Cap' },
    { id: 'none', name: 'None' }
  ],
  gadgets: [
    { id: 'mixer', name: 'Mixer' },
    { id: 'vinyl', name: 'Vinyl' },
    { id: 'synthesizer', name: 'Synthesizer' },
    { id: 'speakers', name: 'Speakers' }
  ],
  backgrounds: [
    { id: 'club', name: 'Club Scene' },
    { id: 'studio', name: 'Studio' },
    { id: 'stage', name: 'Stage' },
    { id: 'minimal', name: 'Minimal' }
  ]
};

const TECHNO_COLORS = [
  '#06c23e', '#06c216', '#00ff88', '#00cc66', '#33ff99',
  '#66ffcc', '#99ffdd', '#ccffee', '#e6fff7', '#f0fff9'
];

interface AvatarConfig {
  droidType: string;
  accessory: string;
  gadget: string;
  background: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  size: number;
}

interface UserAvatarProps {
  userId: string;
  config?: AvatarConfig;
  size?: number;
  className?: string;
}

export default function UserAvatar({ userId, config, size = 32, className }: UserAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate default config from userId if no config provided
  const avatarConfig = useMemo(() => {
    if (config) return { ...config, size };
    
    // Generate deterministic config from userId
    const hash = userId ? userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
    const droidTypes = DROID_ELEMENTS.droidTypes;
    const accessories = DROID_ELEMENTS.accessories;
    const gadgets = DROID_ELEMENTS.gadgets;
    const backgrounds = DROID_ELEMENTS.backgrounds;
    
    return {
      droidType: droidTypes[hash % droidTypes.length].id,
      accessory: accessories[hash % accessories.length].id,
      gadget: gadgets[(hash + 1) % gadgets.length].id,
      background: backgrounds[(hash + 2) % backgrounds.length].id,
      primaryColor: TECHNO_COLORS[hash % TECHNO_COLORS.length],
      secondaryColor: TECHNO_COLORS[(hash + 1) % TECHNO_COLORS.length],
      accentColor: TECHNO_COLORS[(hash + 2) % TECHNO_COLORS.length],
      size: size
    };
  }, [config, userId, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Draw static avatar
    drawStaticAvatar(ctx, avatarConfig);
  }, [avatarConfig, size]);

  const drawStaticAvatar = (ctx: CanvasRenderingContext2D, config: AvatarConfig) => {
    const { size, primaryColor, secondaryColor, accentColor, droidType, accessory } = config;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Background circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, 2 * Math.PI);
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(1, secondaryColor);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Main head/face
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 3, 0, 2 * Math.PI);
    ctx.fillStyle = accentColor + '40'; // Semi-transparent
    ctx.fill();
    
    // Eyes
    const eyeSize = size / 12;
    ctx.beginPath();
    ctx.arc(size / 2 - size / 6, size / 2 - size / 8, eyeSize, 0, 2 * Math.PI);
    ctx.arc(size / 2 + size / 6, size / 2 - size / 8, eyeSize, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Pupils
    ctx.beginPath();
    ctx.arc(size / 2 - size / 6, size / 2 - size / 8, eyeSize / 2, 0, 2 * Math.PI);
    ctx.arc(size / 2 + size / 6, size / 2 - size / 8, eyeSize / 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#000000';
    ctx.fill();
    
    // Accessory based on type
    if (accessory === 'headphones') {
      // Headphones
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = size / 16;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2 - size / 4, size / 2.5, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      
      // Ear pieces
      ctx.beginPath();
      ctx.arc(size / 2 - size / 3, size / 2, size / 8, 0, 2 * Math.PI);
      ctx.arc(size / 2 + size / 3, size / 2, size / 8, 0, 2 * Math.PI);
      ctx.fillStyle = accentColor;
      ctx.fill();
    } else if (accessory === 'sunglasses') {
      // Sunglasses frame
      ctx.fillStyle = '#000000';
      ctx.fillRect(size / 2 - size / 3, size / 2 - size / 6, size / 1.5, size / 8);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(size / 2 - size / 3, size / 2 - size / 6, size / 1.5, size / 8);
    }
    
    // Music element indicator
    ctx.beginPath();
    ctx.arc(size - size / 6, size / 6, size / 12, 0, 2 * Math.PI);
    ctx.fillStyle = primaryColor;
    ctx.fill();
  };

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full"
        style={{ width: size, height: size }}
      />
    </div>
  );
}