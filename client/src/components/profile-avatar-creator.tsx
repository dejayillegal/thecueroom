import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  User,
  Palette, 
  Zap, 
  Download,
  Check
} from "lucide-react";
import { safeCanvas, safeDownload } from "@/lib/safe-dom";

interface AvatarConfig {
  droidType: string;
  accessory: string;
  gadget: string;
  background: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  size: number;
  animation: string;
  animationSpeed: number;
}

interface AvatarData {
  imageData: string;
  config: AvatarConfig;
}

const DROID_ELEMENTS = {
  droidTypes: [
    { id: 'dj', name: 'Mixbot Supreme', description: 'Spinning decks & nodding head' },
    { id: 'producer', name: 'Beatforge X1', description: 'Waveform brain & piano keys' },
    { id: 'hardcore', name: 'Bassquake 9000', description: 'Lightning bolts & power core' },
    { id: 'raver', name: 'Soundwave Slayer', description: 'Pulsing speakers & bass waves' },
    { id: 'turntablist', name: 'Scratchzilla', description: 'Spinning vinyls & crossfader' },
    { id: 'boombox', name: 'Retro Thumper', description: 'Bouncing antenna & tape deck' },
    { id: 'synthwave', name: 'Neon Prophet', description: 'RGB lights & synthesizer' },
    { id: 'drummer', name: 'Rhythm Destroyer', description: 'Rotating drum pads & sticks' },
    { id: 'laser', name: 'Lightshow Madness', description: 'Sweeping laser beams' },
    { id: 'vinyl', name: 'Wax Warrior', description: 'Spinning record collection' },
    { id: 'cyborg', name: 'Bass Cyborg 2077', description: 'Glitching circuits & neon' },
    { id: 'glitch', name: 'Error 404 Beats', description: 'Digital artifacts & pixels' },
    { id: 'shuffle_dancer', name: 'Shuffle Master 3000', description: 'Melbourne shuffle moves' },
    { id: 'skanking_robot', name: 'Skank-Bot Deluxe', description: 'Reggae-techno hybrid moves' },
    { id: 'stomping_raver', name: 'Stomp Commander', description: 'Heavy gabber stomping' },
    { id: 'liquid_dancer', name: 'Flow State Alpha', description: 'Liquid DnB movements' },
    { id: 'jumpstyle_bot', name: 'Jump Protocol X', description: 'Hardstyle jumping machine' },
    { id: 'breakdancer', name: 'Spin Cycle 9000', description: 'B-boy breakbeat spins' },
    { id: 'popping_bot', name: 'Pop-Lock Matrix', description: 'Robotic popping isolations' },
    { id: 'hardstyle_kicker', name: 'Kick Samurai', description: 'Hardstyle reverse bass kicks' }
  ],
  accessories: [
    { id: 'none', name: 'Clean', description: 'Minimal look' },
    { id: 'eyepatch', name: 'Eye Patch', description: 'Pirate vibes' },
    { id: 'headphones', name: 'Headphones', description: 'Always listening' },
    { id: 'visor', name: 'LED Visor', description: 'Cyber style' },
    { id: 'antenna', name: 'Antenna', description: 'Signal receiver' },
    { id: 'goggles', name: 'Goggles', description: 'Lab protection' }
  ],
  gadgets: [
    { id: 'none', name: 'Empty Hands', description: 'Clean and simple' },
    { id: 'controller', name: 'DJ Controller', description: 'Mix master' },
    { id: 'knife', name: 'Knife', description: 'Cutting beats' },
    { id: 'synthesizer', name: 'Mini Synth', description: 'Sound maker' },
    { id: 'vinyl', name: 'Vinyl Record', description: 'Classic medium' },
    { id: 'sampler', name: 'Beat Pad', description: 'Sample trigger' }
  ],
  backgrounds: [
    { id: 'dark', name: 'Dark', color: '#0a0a0a', description: 'Underground' },
    { id: 'purple', name: 'Purple', color: '#2d1b69', description: 'Techno vibe' },
    { id: 'blue', name: 'Blue', color: '#1e3a8a', description: 'Deep house' },
    { id: 'green', name: 'Green', color: '#166534', description: 'Acid' },
    { id: 'red', name: 'Red', color: '#7f1d1d', description: 'Industrial' },
    { id: 'gradient', name: 'Gradient', color: 'gradient', description: 'Multi-color' }
  ],
  animations: [
    { id: 'none', name: 'Static', description: 'No animation' },
    { id: 'pulse', name: 'Bass Pulse', description: 'Rhythmic pulsing to the beat' },
    { id: 'headbang', name: 'Headbang', description: 'Metal head banging' },
    { id: 'disco_spin', name: 'Disco Spin', description: 'Smooth 360° rotation' },
    { id: 'bass_drop', name: 'Bass Drop', description: 'Sudden scale changes' },
    { id: 'rave_bounce', name: 'Rave Bounce', description: 'Hyperactive bouncing' },
    { id: 'glitch_shake', name: 'Glitch Shake', description: 'Digital malfunction vibes' },
    { id: 'laser_sweep', name: 'Laser Sweep', description: 'Sweeping light effects' },
    { id: 'vinyl_spin', name: 'Vinyl Spin', description: 'Record spinning motion' },
    { id: 'drum_hit', name: 'Drum Hit', description: 'Punchy drum impacts' },
    { id: 'synthesizer', name: 'Synth Wave', description: 'Waveform oscillation' },
    { id: 'strobe_flash', name: 'Strobe Flash', description: 'Rapid flash effects' },
    { id: 'robot_dance', name: 'Robot Dance', description: 'Mechanical dance moves' },
    { id: 'electric_surge', name: 'Electric Surge', description: 'Lightning bolt pulses' },
    { id: 'matrix_rain', name: 'Matrix Rain', description: 'Digital code falling effect' },
    { id: 'techno_tilt', name: 'Techno Tilt', description: 'Rhythmic side-to-side tilt' },
    { id: 'speaker_thump', name: 'Speaker Thump', description: 'Bass-driven expansion' },
    { id: 'vinyl_scratch', name: 'Vinyl Scratch', description: 'DJ scratching motion' },
    { id: 'led_cascade', name: 'LED Cascade', description: 'Cascading light strips' },
    { id: 'beat_drop_shake', name: 'Beat Drop Shake', description: 'Intense drop reaction' },
    { id: 'neon_flicker', name: 'Neon Flicker', description: 'Neon sign flickering' },
    { id: 'cyber_glitch', name: 'Cyber Glitch', description: 'Cyberpunk data corruption' }
  ]
};

const TECHNO_COLORS = [
  '#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff0080', '#80ff00', '#0080ff',
  '#ff4000', '#40ff80', '#8040ff', '#ff8040', '#40ffff', '#ff4080', '#80ff40',
  '#4080ff', '#ff0040', '#00ff80', '#8000ff', '#ff8000', '#0040ff', '#ff0000',
  '#00d9a5', '#3d3d56', '#ff6b35', '#7209b7', '#f72585', '#4361ee', '#4cc9f0'
];

export default function ProfileAvatarCreator({ onAvatarSave }: { onAvatarSave?: (avatarData: AvatarData) => void }) {
  const [config, setConfig] = useState<AvatarConfig>({
    droidType: 'dj',
    accessory: 'none',
    gadget: 'none',
    background: 'dark',
    primaryColor: '#00d9a5',
    secondaryColor: '#3d3d56',
    accentColor: '#ffffff',
    size: 160,
    animation: 'pulse',
    animationSpeed: 1
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Animation system using requestAnimationFrame
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  const [animationTime, setAnimationTime] = useState(0);

  // Enhanced animation function with creative effects
  const applyAnimation = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    if (config.animation === 'none') return;

    const time = animationTime;
    const safeAmplitude = 3; // Reduced to stay within canvas bounds

    switch (config.animation) {
      case 'pulse':
        // Bass pulse - rhythmic scaling
        const scale = 1 + Math.sin(time * 4) * 0.08;
        ctx.scale(scale, scale);
        break;
        
      case 'headbang':
        // Metal headbanging motion
        const headbangY = Math.sin(time * 6) * safeAmplitude;
        const headbangTilt = Math.sin(time * 6) * 0.1;
        ctx.translate(0, headbangY);
        ctx.rotate(headbangTilt);
        break;
        
      case 'disco_spin':
        // Smooth 360° rotation
        ctx.rotate(time * 0.3);
        break;
        
      case 'bass_drop':
        // Sudden scale changes like bass drops
        const dropScale = 1 + Math.sin(time * 2) * 0.15;
        const suddenDrop = Math.floor(time * 2) % 2 === 0 ? dropScale : 1;
        ctx.scale(suddenDrop, suddenDrop);
        break;
        
      case 'rave_bounce':
        // Hyperactive bouncing
        const bounceY = Math.sin(time * 8) * safeAmplitude;
        const bounceX = Math.cos(time * 7) * (safeAmplitude * 0.5);
        ctx.translate(bounceX, bounceY);
        break;
        
      case 'glitch_shake':
        // Digital malfunction vibes
        const glitchX = (Math.random() - 0.5) * 2;
        const glitchY = (Math.random() - 0.5) * 2;
        const glitchIntensity = Math.sin(time * 15) > 0.7 ? 1 : 0;
        ctx.translate(glitchX * glitchIntensity, glitchY * glitchIntensity);
        break;
        
      case 'laser_sweep':
        // Sweeping motion with opacity changes
        const sweepX = Math.sin(time * 1.5) * safeAmplitude;
        const laserAlpha = 0.7 + Math.sin(time * 3) * 0.3;
        ctx.translate(sweepX, 0);
        ctx.globalAlpha = laserAlpha;
        break;
        
      case 'vinyl_spin':
        // Record spinning motion with slight wobble
        const spinAngle = time * 2;
        const wobble = Math.sin(time * 0.5) * 0.02;
        ctx.rotate(spinAngle + wobble);
        break;
        
      case 'drum_hit':
        // Punchy drum impacts
        const hitScale = 1 + (Math.sin(time * 5) > 0.8 ? 0.1 : 0);
        ctx.scale(hitScale, hitScale);
        break;
        
      case 'synthesizer':
        // Waveform oscillation
        const waveX = Math.sin(time * 3) * safeAmplitude;
        const waveY = Math.sin(time * 4 + Math.PI/2) * (safeAmplitude * 0.5);
        ctx.translate(waveX, waveY);
        break;
        
      case 'strobe_flash':
        // Rapid flash effects
        const strobeAlpha = Math.sin(time * 12) > 0 ? 1 : 0.3;
        ctx.globalAlpha = strobeAlpha;
        break;
        
      case 'robot_dance':
        // Mechanical dance moves
        const danceX = Math.sin(time * 2) * (safeAmplitude * 0.6);
        const danceY = Math.abs(Math.sin(time * 4)) * (safeAmplitude * 0.3);
        const danceRotate = Math.sin(time * 3) * 0.15;
        ctx.translate(danceX, danceY);
        ctx.rotate(danceRotate);
        break;
        
      case 'electric_surge':
        // Lightning bolt pulses
        const surgeScale = 1 + Math.sin(time * 8) * 0.1;
        const surgeFlicker = Math.random() > 0.8 ? 0.8 : 1;
        ctx.scale(surgeScale, surgeScale);
        ctx.globalAlpha = surgeFlicker;
        break;
        
      case 'matrix_rain':
        // Digital code falling effect
        const matrixY = Math.sin(time * 3) * safeAmplitude;
        const matrixGlitch = Math.sin(time * 10) > 0.5 ? 1 : 0.9;
        ctx.translate(0, matrixY);
        ctx.globalAlpha = matrixGlitch;
        break;
        
      case 'techno_tilt':
        // Rhythmic side-to-side tilt
        const tiltAngle = Math.sin(time * 3) * 0.2;
        const tiltX = Math.sin(time * 2) * (safeAmplitude * 0.4);
        ctx.translate(tiltX, 0);
        ctx.rotate(tiltAngle);
        break;
        
      case 'speaker_thump':
        // Bass-driven expansion
        const thumpScale = 1 + (Math.sin(time * 3) > 0.7 ? 0.15 : 0);
        const thumpY = Math.sin(time * 3) * (safeAmplitude * 0.2);
        ctx.translate(0, thumpY);
        ctx.scale(thumpScale, thumpScale);
        break;
        
      case 'vinyl_scratch':
        // DJ scratching motion
        const scratchAngle = Math.sin(time * 8) * 0.3;
        const scratchX = Math.sin(time * 6) * (safeAmplitude * 0.3);
        ctx.translate(scratchX, 0);
        ctx.rotate(scratchAngle);
        break;
        
      case 'led_cascade':
        // Cascading light strips
        const cascadeY = Math.sin(time * 4) * (safeAmplitude * 0.5);
        const cascadeAlpha = 0.6 + Math.sin(time * 5) * 0.4;
        const cascadeScale = 1 + Math.sin(time * 6) * 0.05;
        ctx.translate(0, cascadeY);
        ctx.scale(cascadeScale, cascadeScale);
        ctx.globalAlpha = cascadeAlpha;
        break;
        
      case 'beat_drop_shake':
        // Intense drop reaction
        const dropShakeX = (Math.random() - 0.5) * 4;
        const dropShakeY = (Math.random() - 0.5) * 4;
        const dropIntensity = Math.sin(time * 12) > 0.5 ? 1 : 0;
        const shakeScale = 1 + dropIntensity * 0.2;
        ctx.translate(dropShakeX * dropIntensity, dropShakeY * dropIntensity);
        ctx.scale(shakeScale, shakeScale);
        break;
        
      case 'neon_flicker':
        // Neon sign flickering
        const flickerAlpha = Math.random() > 0.15 ? 1 : 0.2;
        const flickerScale = flickerAlpha > 0.5 ? 1.02 : 1;
        ctx.globalAlpha = flickerAlpha;
        ctx.scale(flickerScale, flickerScale);
        break;
        
      case 'cyber_glitch':
        // Cyberpunk data corruption
        const glitchFrame = Math.floor(time * 15) % 10;
        const cyberX = glitchFrame < 2 ? (Math.random() - 0.5) * 3 : 0;
        const cyberY = glitchFrame < 2 ? (Math.random() - 0.5) * 3 : 0;
        const cyberAlpha = glitchFrame < 2 ? 0.7 : 1;
        const cyberScale = glitchFrame < 2 ? 1.05 : 1;
        ctx.translate(cyberX, cyberY);
        ctx.scale(cyberScale, cyberScale);
        ctx.globalAlpha = cyberAlpha;
        break;
        
      default:
        break;
    }
  };

  // Robot drawing function
  const drawRobot = (ctx: CanvasRenderingContext2D, droidType: string, x: number, y: number, size: number) => {
    const scale = size / 200; // Scale factor based on canvas size
    const robotColor = config.primaryColor;
    const accentColor = config.accentColor;
    const darkColor = config.secondaryColor;

    ctx.fillStyle = robotColor;
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2 * scale;

    switch (droidType) {
      case 'dj':
        // Large DJ Robot with turntable
        const djRadius = 70 * scale;
        
        // Main circular body
        ctx.beginPath();
        ctx.arc(x, y, djRadius, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Turntable deck
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.arc(x, y, djRadius*0.8, 0, 2*Math.PI);
        ctx.fill();
        
        // Vinyl record
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(x, y, djRadius*0.6, 0, 2*Math.PI);
        ctx.fill();
        
        // Record center
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(x, y, djRadius*0.1, 0, 2*Math.PI);
        ctx.fill();
        
        // Spinning vinyl with animation-responsive rotation
        if (config.animation !== 'none') {
          const recordAngle = animationTime * 3; // Spinning record
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(recordAngle);
          
          // Record grooves
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1 * scale;
          for(let i = 3; i <= 6; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, djRadius*0.1*i, 0, 2*Math.PI);
            ctx.stroke();
          }
          ctx.restore();
        }
        
        // Tonearm with slight bobbing motion
        const tonearmY = config.animation !== 'none' ? Math.sin(animationTime * 2) * 2 * scale : 0;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(x + djRadius*0.5, y - djRadius*0.3 + tonearmY);
        ctx.lineTo(x + djRadius*0.3, y + djRadius*0.3);
        ctx.stroke();
        
        // Tonearm needle
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(x + djRadius*0.3, y + djRadius*0.3, djRadius*0.05, 0, 2*Math.PI);
        ctx.fill();
        
        // Headphones
        ctx.strokeStyle = robotColor;
        ctx.lineWidth = 6 * scale;
        ctx.beginPath();
        ctx.arc(x, y - djRadius*1.3, djRadius*0.6, 0.3, Math.PI - 0.3);
        ctx.stroke();
        
        // Headphone cups
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.arc(x - djRadius*0.5, y - djRadius*1.1, djRadius*0.15, 0, 2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + djRadius*0.5, y - djRadius*1.1, djRadius*0.15, 0, 2*Math.PI);
        ctx.fill();
        
        // Animated control knobs
        const knobs = [-0.6, -0.2, 0.2, 0.6];
        knobs.forEach((offset, index) => {
          const knobRotation = config.animation !== 'none' ? Math.sin(animationTime * 2 + index) * 0.3 : 0;
          ctx.save();
          ctx.translate(x + offset*djRadius, y - djRadius*1.5);
          ctx.rotate(knobRotation);
          
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(0, 0, djRadius*0.08, 0, 2*Math.PI);
          ctx.fill();
          
          // Knob indicator line
          ctx.strokeStyle = darkColor;
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.moveTo(0, -djRadius*0.06);
          ctx.lineTo(0, -djRadius*0.04);
          ctx.stroke();
          
          ctx.restore();
        });
        break;
        
      case 'producer':
        // Beatforge X1 - Producer Robot with animated waveforms and piano keys
        const prodRadius = 70 * scale;
        
        // Hexagonal main body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        for(let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const hexX = x + prodRadius * Math.cos(angle);
          const hexY = y + prodRadius * Math.sin(angle);
          if (i === 0) ctx.moveTo(hexX, hexY);
          else ctx.lineTo(hexX, hexY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Animated waveform brain display
        if (config.animation !== 'none') {
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          for(let i = 0; i < 20; i++) {
            const waveX = x - prodRadius*0.5 + (i * prodRadius/10);
            const waveY = y - prodRadius*0.3 + Math.sin(animationTime * 4 + i * 0.3) * 15 * scale;
            if (i === 0) ctx.moveTo(waveX, waveY);
            else ctx.lineTo(waveX, waveY);
          }
          ctx.stroke();
        }
        
        // Piano keyboard at bottom
        const keyWidth = prodRadius * 0.1;
        const keyHeight = prodRadius * 0.3;
        for(let i = 0; i < 8; i++) {
          const keyX = x - prodRadius*0.5 + i * keyWidth;
          const keyPressed = config.animation !== 'none' && Math.sin(animationTime * 3 + i) > 0.5;
          
          ctx.fillStyle = keyPressed ? accentColor : '#fff';
          ctx.beginPath();
          ctx.roundRect(keyX, y + prodRadius*0.4, keyWidth - 1*scale, keyHeight, 2*scale);
          ctx.fill();
          ctx.strokeStyle = darkColor;
          ctx.lineWidth = 1 * scale;
          ctx.stroke();
        }
        
        // Synthesizer knobs with rotation
        const synthKnobs = [
          {x: -0.4, y: -0.6}, {x: 0, y: -0.6}, {x: 0.4, y: -0.6},
          {x: -0.4, y: -0.2}, {x: 0, y: -0.2}, {x: 0.4, y: -0.2}
        ];
        
        synthKnobs.forEach((knob, index) => {
          const knobRotation = config.animation !== 'none' ? animationTime * 1.5 + index : 0;
          ctx.save();
          ctx.translate(x + knob.x*prodRadius, y + knob.y*prodRadius);
          ctx.rotate(knobRotation);
          
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(0, 0, prodRadius*0.06, 0, 2*Math.PI);
          ctx.fill();
          
          // Knob indicator
          ctx.strokeStyle = darkColor;
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.moveTo(0, -prodRadius*0.04);
          ctx.lineTo(0, -prodRadius*0.02);
          ctx.stroke();
          
          ctx.restore();
        });
        break;
        
      case 'synthwave':
        // Neon Prophet - Synthwave Robot with RGB lights and synthesizer
        const synthRadius = 70 * scale;
        
        // Triangular futuristic body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.moveTo(x, y - synthRadius*0.8);
        ctx.lineTo(x - synthRadius*0.7, y + synthRadius*0.6);
        ctx.lineTo(x + synthRadius*0.7, y + synthRadius*0.6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Animated RGB light strips
        if (config.animation !== 'none') {
          const colors = ['#ff0080', '#00ff80', '#0080ff'];
          for(let i = 0; i < 3; i++) {
            const stripY = y - synthRadius*0.4 + i * synthRadius*0.3;
            const alpha = 0.5 + Math.sin(animationTime * 4 + i * 2) * 0.5;
            
            ctx.strokeStyle = colors[i];
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 6 * scale;
            ctx.beginPath();
            ctx.moveTo(x - synthRadius*0.5, stripY);
            ctx.lineTo(x + synthRadius*0.5, stripY);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
        
        // Synthesizer grid
        for(let row = 0; row < 3; row++) {
          for(let col = 0; col < 4; col++) {
            const gridX = x - synthRadius*0.4 + col * synthRadius*0.25;
            const gridY = y - synthRadius*0.2 + row * synthRadius*0.2;
            const active = config.animation !== 'none' && Math.sin(animationTime * 3 + row + col) > 0.3;
            
            ctx.fillStyle = active ? accentColor : darkColor;
            ctx.beginPath();
            ctx.roundRect(gridX, gridY, synthRadius*0.08, synthRadius*0.08, 2*scale);
            ctx.fill();
          }
        }
        break;
        
      case 'drummer':
        // Rhythm Destroyer - Drummer Robot with rotating drum pads
        const drumRadius = 70 * scale;
        
        // Cylindrical body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - drumRadius*0.8, y - drumRadius*0.6, drumRadius*1.6, drumRadius*1.2, 15*scale);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Rotating drum pads
        const drumPads = [
          {x: -0.5, y: -0.3, size: 0.2},
          {x: 0.5, y: -0.3, size: 0.2},
          {x: -0.3, y: 0.1, size: 0.15},
          {x: 0.3, y: 0.1, size: 0.15},
          {x: 0, y: -0.1, size: 0.25}
        ];
        
        drumPads.forEach((pad, index) => {
          const hit = config.animation !== 'none' && Math.sin(animationTime * 6 + index * 1.5) > 0.6;
          const padScale = hit ? 1.2 : 1;
          
          ctx.save();
          ctx.translate(x + pad.x*drumRadius, y + pad.y*drumRadius);
          ctx.scale(padScale, padScale);
          
          ctx.fillStyle = hit ? accentColor : darkColor;
          ctx.beginPath();
          ctx.arc(0, 0, pad.size*drumRadius, 0, 2*Math.PI);
          ctx.fill();
          ctx.strokeStyle = robotColor;
          ctx.lineWidth = 2 * scale;
          ctx.stroke();
          
          ctx.restore();
        });
        
        // Animated drumsticks
        if (config.animation !== 'none') {
          const stickAngle = Math.sin(animationTime * 8) * 0.5;
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 4 * scale;
          
          // Left stick
          ctx.save();
          ctx.translate(x - drumRadius*0.5, y - drumRadius*0.8);
          ctx.rotate(stickAngle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, drumRadius*0.4);
          ctx.stroke();
          ctx.restore();
          
          // Right stick
          ctx.save();
          ctx.translate(x + drumRadius*0.5, y - drumRadius*0.8);
          ctx.rotate(-stickAngle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, drumRadius*0.4);
          ctx.stroke();
          ctx.restore();
        }
        break;
        
      case 'laser':
        // Lightshow Madness - Laser Robot with sweeping beam effects
        const laserRadius = 70 * scale;
        
        // Diamond-shaped body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.moveTo(x, y - laserRadius*0.8);
        ctx.lineTo(x + laserRadius*0.6, y);
        ctx.lineTo(x, y + laserRadius*0.8);
        ctx.lineTo(x - laserRadius*0.6, y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Animated laser beams
        if (config.animation !== 'none') {
          const beamColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
          for(let i = 0; i < 5; i++) {
            const angle = (animationTime * 2 + i * Math.PI/2.5) % (Math.PI * 2);
            const beamLength = laserRadius * 0.7;
            
            ctx.strokeStyle = beamColors[i];
            ctx.lineWidth = 3 * scale;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * beamLength, y + Math.sin(angle) * beamLength);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
        
        // Central laser projector
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(x, y, laserRadius*0.2, 0, 2*Math.PI);
        ctx.fill();
        break;
        
      case 'vinyl':
        // Wax Warrior - Vinyl Robot with spinning record collection
        const vinylRadius = 70 * scale;
        
        // Rectangular body like a record crate
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - vinylRadius*0.8, y - vinylRadius*0.6, vinylRadius*1.6, vinylRadius*1.2, 10*scale);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Multiple spinning vinyl records
        const records = [
          {x: -0.4, y: -0.2, size: 0.25},
          {x: 0.4, y: -0.2, size: 0.25},
          {x: -0.4, y: 0.3, size: 0.25},
          {x: 0.4, y: 0.3, size: 0.25},
          {x: 0, y: 0.05, size: 0.3}
        ];
        
        records.forEach((record, index) => {
          const recordAngle = config.animation !== 'none' ? animationTime * (2 + index * 0.5) : 0;
          
          ctx.save();
          ctx.translate(x + record.x*vinylRadius, y + record.y*vinylRadius);
          ctx.rotate(recordAngle);
          
          // Record disc
          ctx.fillStyle = '#1a1a1a';
          ctx.beginPath();
          ctx.arc(0, 0, record.size*vinylRadius, 0, 2*Math.PI);
          ctx.fill();
          
          // Record grooves
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1 * scale;
          for(let i = 3; i <= 6; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, record.size*vinylRadius*0.2*i, 0, 2*Math.PI);
            ctx.stroke();
          }
          
          // Center label
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(0, 0, record.size*vinylRadius*0.15, 0, 2*Math.PI);
          ctx.fill();
          
          ctx.restore();
        });
        break;
        
      case 'cyborg':
        // Bass Cyborg 2077 - Futuristic robot with glitching circuits
        const cyborgRadius = 70 * scale;
        
        // Angular cyberpunk body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.moveTo(x - cyborgRadius*0.5, y - cyborgRadius*0.8);
        ctx.lineTo(x + cyborgRadius*0.5, y - cyborgRadius*0.8);
        ctx.lineTo(x + cyborgRadius*0.8, y - cyborgRadius*0.2);
        ctx.lineTo(x + cyborgRadius*0.6, y + cyborgRadius*0.8);
        ctx.lineTo(x - cyborgRadius*0.6, y + cyborgRadius*0.8);
        ctx.lineTo(x - cyborgRadius*0.8, y - cyborgRadius*0.2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Animated circuit patterns
        if (config.animation !== 'none') {
          const circuitLines = [
            {start: {x: -0.4, y: -0.5}, end: {x: 0.4, y: -0.5}},
            {start: {x: -0.6, y: 0}, end: {x: 0.6, y: 0}},
            {start: {x: -0.3, y: 0.4}, end: {x: 0.3, y: 0.4}},
            {start: {x: 0, y: -0.7}, end: {x: 0, y: 0.7}}
          ];
          
          circuitLines.forEach((line, index) => {
            const pulse = Math.sin(animationTime * 5 + index) > 0.5;
            ctx.strokeStyle = pulse ? '#00ffff' : accentColor;
            ctx.lineWidth = pulse ? 4 * scale : 2 * scale;
            ctx.globalAlpha = pulse ? 1 : 0.6;
            
            ctx.beginPath();
            ctx.moveTo(x + line.start.x*cyborgRadius, y + line.start.y*cyborgRadius);
            ctx.lineTo(x + line.end.x*cyborgRadius, y + line.end.y*cyborgRadius);
            ctx.stroke();
            ctx.globalAlpha = 1;
          });
        }
        
        // Glowing core
        const coreGlow = config.animation !== 'none' ? 0.5 + Math.sin(animationTime * 3) * 0.3 : 0.8;
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = coreGlow;
        ctx.beginPath();
        ctx.arc(x, y, cyborgRadius*0.15, 0, 2*Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
        break;
        
      case 'glitch':
        // Error 404 Beats - Glitchy robot with digital artifacts
        const glitchRadius = 70 * scale;
        
        // Base body (sometimes displaced)
        const glitchOffsetX = config.animation !== 'none' && Math.sin(animationTime * 10) > 0.8 ? (Math.random() - 0.5) * 10 * scale : 0;
        const glitchOffsetY = config.animation !== 'none' && Math.sin(animationTime * 12) > 0.8 ? (Math.random() - 0.5) * 10 * scale : 0;
        
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - glitchRadius*0.7 + glitchOffsetX, y - glitchRadius*0.7 + glitchOffsetY, 
                     glitchRadius*1.4, glitchRadius*1.4, 15*scale);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Digital artifact blocks
        if (config.animation !== 'none') {
          for(let i = 0; i < 8; i++) {
            if (Math.sin(animationTime * 8 + i) > 0.6) {
              const blockX = x + (Math.random() - 0.5) * glitchRadius*1.2;
              const blockY = y + (Math.random() - 0.5) * glitchRadius*1.2;
              const blockSize = Math.random() * 15 * scale + 5 * scale;
              
              ctx.fillStyle = ['#ff0080', '#00ff80', '#0080ff'][Math.floor(Math.random() * 3)];
              ctx.globalAlpha = 0.7;
              ctx.beginPath();
              ctx.roundRect(blockX, blockY, blockSize, blockSize, 2*scale);
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        }
        
        // Error text effect
        ctx.fillStyle = '#ff0000';
        ctx.font = `${12 * scale}px monospace`;
        ctx.textAlign = 'center';
        const errorAlpha = config.animation !== 'none' ? Math.sin(animationTime * 6) * 0.5 + 0.5 : 1;
        ctx.globalAlpha = errorAlpha;
        ctx.fillText('404', x, y);
        ctx.globalAlpha = 1;
        break;
        
      case 'hardcore':
        // Large Hardcore Robot with octagonal aggressive design
        const hcRadius = 70 * scale;
        
        // Octagonal spiked body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        for(let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const radius = (i % 2 === 0) ? hcRadius : hcRadius * 1.2; // Alternating spikes
          const octX = x + radius * Math.cos(angle);
          const octY = y + radius * Math.sin(angle);
          if(i === 0) ctx.moveTo(octX, octY);
          else ctx.lineTo(octX, octY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 4 * scale;
        ctx.stroke();
        
        // Central hardcore emblem
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.arc(x, y, hcRadius*0.4, 0, 2*Math.PI);
        ctx.fill();
        
        // Lightning bolt design
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.moveTo(x - hcRadius*0.15, y - hcRadius*0.3);
        ctx.lineTo(x + hcRadius*0.1, y - hcRadius*0.05);
        ctx.lineTo(x - hcRadius*0.05, y);
        ctx.lineTo(x + hcRadius*0.15, y + hcRadius*0.3);
        ctx.lineTo(x - hcRadius*0.1, y + hcRadius*0.05);
        ctx.lineTo(x + hcRadius*0.05, y);
        ctx.closePath();
        ctx.fill();
        
        // Animated power core with lightning effects
        if (config.animation !== 'none') {
          const powerPulse = 0.8 + Math.sin(animationTime * 6) * 0.2;
          ctx.fillStyle = accentColor;
          ctx.globalAlpha = powerPulse;
          ctx.beginPath();
          ctx.arc(x, y, hcRadius*0.2, 0, 2*Math.PI);
          ctx.fill();
          ctx.globalAlpha = 1;
          
          // Lightning bolt animation
          const boltOffset = Math.sin(animationTime * 8) * 5 * scale;
          ctx.fillStyle = '#ffff00';
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.moveTo(x - hcRadius*0.15 + boltOffset, y - hcRadius*0.3);
          ctx.lineTo(x + hcRadius*0.1 + boltOffset, y - hcRadius*0.05);
          ctx.lineTo(x - hcRadius*0.05 + boltOffset, y);
          ctx.lineTo(x + hcRadius*0.15 + boltOffset, y + hcRadius*0.3);
          ctx.lineTo(x - hcRadius*0.1 + boltOffset, y + hcRadius*0.05);
          ctx.lineTo(x + hcRadius*0.05 + boltOffset, y);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        break;
        
      case 'raver':
        // Soundwave Slayer - Raver Robot with pulsing speakers
        const raverRadius = 70 * scale;
        
        // Rectangular speaker body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - raverRadius*0.8, y - raverRadius*0.7, raverRadius*1.6, raverRadius*1.4, 10*scale);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Multiple pulsing speakers
        const speakers = [
          {x: -0.4, y: -0.3, size: 0.25},
          {x: 0.4, y: -0.3, size: 0.25},
          {x: -0.4, y: 0.3, size: 0.25},
          {x: 0.4, y: 0.3, size: 0.25},
          {x: 0, y: 0, size: 0.35}
        ];
        
        speakers.forEach((speaker, index) => {
          const pulse = config.animation !== 'none' ? 1 + Math.sin(animationTime * 4 + index) * 0.2 : 1;
          
          ctx.save();
          ctx.translate(x + speaker.x*raverRadius, y + speaker.y*raverRadius);
          ctx.scale(pulse, pulse);
          
          // Speaker cone
          ctx.fillStyle = darkColor;
          ctx.beginPath();
          ctx.arc(0, 0, speaker.size*raverRadius, 0, 2*Math.PI);
          ctx.fill();
          
          // Speaker rings
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 2 * scale;
          for(let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, speaker.size*raverRadius*0.3*i, 0, 2*Math.PI);
            ctx.stroke();
          }
          
          ctx.restore();
        });
        
        // Animated bass waves
        if (config.animation !== 'none') {
          for(let i = 0; i < 4; i++) {
            const waveRadius = raverRadius * (1 + i * 0.3);
            const alpha = 0.3 - i * 0.07;
            const waveScale = 1 + Math.sin(animationTime * 3 - i * 0.5) * 0.1;
            
            ctx.strokeStyle = accentColor;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 3 * scale;
            ctx.beginPath();
            ctx.arc(x, y, waveRadius * waveScale, 0, 2*Math.PI);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
        break;
        
      case 'turntablist':
        // Scratchzilla - Turntablist Robot with dual turntables
        const ttRadius = 70 * scale;
        
        // Wide DJ booth body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - ttRadius*0.9, y - ttRadius*0.5, ttRadius*1.8, ttRadius*1.0, 15*scale);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Dual turntables
        const turntables = [
          {x: -0.5, y: 0, direction: 1},
          {x: 0.5, y: 0, direction: -1}
        ];
        
        turntables.forEach((table, index) => {
          const scratchAngle = config.animation !== 'none' ? 
            Math.sin(animationTime * 6 + index * Math.PI) * 0.8 : 0;
          
          ctx.save();
          ctx.translate(x + table.x*ttRadius, y + table.y*ttRadius);
          ctx.rotate(scratchAngle * table.direction);
          
          // Turntable platter
          ctx.fillStyle = darkColor;
          ctx.beginPath();
          ctx.arc(0, 0, ttRadius*0.3, 0, 2*Math.PI);
          ctx.fill();
          
          // Vinyl record
          ctx.fillStyle = '#1a1a1a';
          ctx.beginPath();
          ctx.arc(0, 0, ttRadius*0.25, 0, 2*Math.PI);
          ctx.fill();
          
          // Record label
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(0, 0, ttRadius*0.08, 0, 2*Math.PI);
          ctx.fill();
          
          // Tone arm
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 3 * scale;
          ctx.beginPath();
          ctx.moveTo(ttRadius*0.2, -ttRadius*0.1);
          ctx.lineTo(ttRadius*0.15, ttRadius*0.15);
          ctx.stroke();
          
          ctx.restore();
        });
        
        // Crossfader
        const faderX = config.animation !== 'none' ? 
          Math.sin(animationTime * 4) * ttRadius*0.3 : 0;
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.roundRect(x + faderX - ttRadius*0.05, y + ttRadius*0.4, ttRadius*0.1, ttRadius*0.2, 5*scale);
        ctx.fill();
        break;
        
      case 'boombox':
        // Retro Thumper - Boombox Robot with cassette and antenna
        const bbRadius = 70 * scale;
        
        // Rectangular boombox body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - bbRadius*0.9, y - bbRadius*0.6, bbRadius*1.8, bbRadius*1.2, 12*scale);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Cassette deck
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.roundRect(x - bbRadius*0.4, y - bbRadius*0.3, bbRadius*0.8, bbRadius*0.3, 5*scale);
        ctx.fill();
        
        // Animated cassette reels
        if (config.animation !== 'none') {
          const reelAngle = animationTime * 5;
          
          [-0.25, 0.25].forEach(offsetX => {
            ctx.save();
            ctx.translate(x + offsetX*bbRadius, y - bbRadius*0.15);
            ctx.rotate(reelAngle);
            
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.arc(0, 0, bbRadius*0.08, 0, 2*Math.PI);
            ctx.fill();
            
            // Reel spokes
            for(let i = 0; i < 6; i++) {
              const spokeAngle = (i * Math.PI) / 3;
              ctx.strokeStyle = darkColor;
              ctx.lineWidth = 2 * scale;
              ctx.beginPath();
              ctx.moveTo(Math.cos(spokeAngle) * bbRadius*0.03, Math.sin(spokeAngle) * bbRadius*0.03);
              ctx.lineTo(Math.cos(spokeAngle) * bbRadius*0.06, Math.sin(spokeAngle) * bbRadius*0.06);
              ctx.stroke();
            }
            
            ctx.restore();
          });
        }
        
        // Bouncing antenna
        const antennaY = config.animation !== 'none' ? 
          Math.sin(animationTime * 3) * 10 * scale : 0;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(x - bbRadius*0.6, y - bbRadius*0.6);
        ctx.lineTo(x - bbRadius*0.6, y - bbRadius*0.9 + antennaY);
        ctx.stroke();
        
        // Antenna tip
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(x - bbRadius*0.6, y - bbRadius*0.9 + antennaY, bbRadius*0.05, 0, 2*Math.PI);
        ctx.fill();
        break;
        
      case 'shuffle_dancer':
        // Melbourne shuffle dancer robot
        const shuffleRadius = 65 * scale;
        
        // Main body with shuffling motion
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.ellipse(x, y, shuffleRadius*0.8, shuffleRadius*1.1, 0, 0, 2*Math.PI);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Shuffling feet (animated)
        const shuffleOffset = config.animation !== 'none' ? 
          Math.sin(animationTime * 6) * 15 * scale : 0;
        
        // Left foot
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.ellipse(x - shuffleRadius*0.4 + shuffleOffset, y + shuffleRadius*0.8, 
          shuffleRadius*0.25, shuffleRadius*0.15, 0, 0, 2*Math.PI);
        ctx.fill();
        
        // Right foot  
        ctx.beginPath();
        ctx.ellipse(x + shuffleRadius*0.4 - shuffleOffset, y + shuffleRadius*0.8, 
          shuffleRadius*0.25, shuffleRadius*0.15, 0, 0, 2*Math.PI);
        ctx.fill();
        break;
        
      case 'skanking_robot':
        // Reggae-techno hybrid moves
        const skankRadius = 70 * scale;
        
        // Tilted rectangular body
        ctx.save();
        if (config.animation !== 'none') {
          const skankTilt = Math.sin(animationTime * 2) * 0.2;
          ctx.rotate(skankTilt);
        }
        
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - skankRadius*0.6, y - skankRadius*0.8, 
          skankRadius*1.2, skankRadius*1.6, 10*scale);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Dreadlock-style cables
        for(let i = 0; i < 5; i++) {
          const cableX = x - skankRadius*0.4 + i * skankRadius*0.2;
          const cableWave = Math.sin(animationTime * 3 + i) * 5 * scale;
          
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.moveTo(cableX, y - skankRadius*0.8);
          ctx.quadraticCurveTo(cableX + cableWave, y - skankRadius*0.4, 
            cableX, y - skankRadius*0.1);
          ctx.stroke();
        }
        
        ctx.restore();
        break;
        
      case 'stomping_raver':
        // Heavy gabber stomping
        const stompRadius = 75 * scale;
        
        // Heavy rectangular body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - stompRadius*0.7, y - stompRadius*0.6, 
          stompRadius*1.4, stompRadius*1.2, 8*scale);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 4 * scale;
        ctx.stroke();
        
        // Stomping effect
        const stompY = config.animation !== 'none' ? 
          Math.abs(Math.sin(animationTime * 4)) * 8 * scale : 0;
        
        // Heavy boots
        ctx.fillStyle = darkColor;
        [-0.5, 0.5].forEach(side => {
          ctx.beginPath();
          ctx.roundRect(x + side*stompRadius*0.6, y + stompRadius*0.4 + stompY, 
            stompRadius*0.3, stompRadius*0.4, 5*scale);
          ctx.fill();
        });
        
        // Impact lines when stomping
        if (config.animation !== 'none' && stompY > 5) {
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 2 * scale;
          for(let i = 0; i < 6; i++) {
            const lineAngle = (i * Math.PI) / 3;
            const lineLength = 20 * scale;
            ctx.beginPath();
            ctx.moveTo(x, y + stompRadius*0.8);
            ctx.lineTo(x + Math.cos(lineAngle) * lineLength, 
              y + stompRadius*0.8 + Math.sin(lineAngle) * lineLength);
            ctx.stroke();
          }
        }
        break;
        
      case 'liquid_dancer':
        // Liquid DnB movements  
        const liquidRadius = 60 * scale;
        
        // Flowing, organic shape
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        
        const liquidWave = config.animation !== 'none' ? 
          Math.sin(animationTime * 2) * 0.3 : 0;
        
        // Create wavy, liquid-like outline
        for(let angle = 0; angle < 2*Math.PI; angle += 0.1) {
          const radius = liquidRadius * (1 + Math.sin(angle * 5 + animationTime * 3) * 0.1);
          const px = x + Math.cos(angle) * radius;
          const py = y + Math.sin(angle) * radius;
          
          if (angle === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
        break;
        
      case 'jumpstyle_bot':
        // Hardstyle jumping machine
        const jumpRadius = 65 * scale;
        
        // Jumping motion
        const jumpHeight = config.animation !== 'none' ? 
          Math.abs(Math.sin(animationTime * 3)) * 20 * scale : 0;
        
        // Main body (elevated when jumping)
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - jumpRadius*0.6, y - jumpRadius*0.8 - jumpHeight, 
          jumpRadius*1.2, jumpRadius*1.4, 10*scale);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Extended legs when jumping
        ctx.fillStyle = accentColor;
        [-0.3, 0.3].forEach(side => {
          ctx.beginPath();
          ctx.roundRect(x + side*jumpRadius, y + jumpRadius*0.2, 
            jumpRadius*0.15, jumpRadius*0.6 + jumpHeight*0.5, 3*scale);
          ctx.fill();
        });
        break;
        
      case 'breakdancer':
        // B-boy breakbeat spins
        const breakRadius = 70 * scale;
        
        // Spinning body
        ctx.save();
        if (config.animation !== 'none') {
          ctx.rotate(animationTime * 4);
        }
        
        // Cardboard-like flat body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(-breakRadius*0.8, -breakRadius*0.4, 
          breakRadius*1.6, breakRadius*0.8, 15*scale);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Spinning motion lines
        if (config.animation !== 'none') {
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 2 * scale;
          for(let i = 0; i < 4; i++) {
            const lineAngle = (i * Math.PI) / 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(lineAngle) * breakRadius*1.2, 
              Math.sin(lineAngle) * breakRadius*1.2);
            ctx.stroke();
          }
        }
        
        ctx.restore();
        break;
        
      case 'popping_bot':
        // Robotic popping isolations
        const popRadius = 65 * scale;
        
        // Segmented body parts
        const popOffset = config.animation !== 'none' ? 
          Math.sin(animationTime * 8) * 5 * scale : 0;
        
        // Main torso
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - popRadius*0.5, y - popRadius*0.6 + popOffset, 
          popRadius, popRadius*0.8, 8*scale);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Popping shoulder segments
        [-1, 1].forEach(side => {
          const shoulderPop = config.animation !== 'none' ? 
            Math.sin(animationTime * 8 + side) * 3 * scale : 0;
          
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.roundRect(x + side*popRadius*0.7 + shoulderPop, y - popRadius*0.4, 
            popRadius*0.25, popRadius*0.5, 5*scale);
          ctx.fill();
        });
        break;
        
      case 'hardstyle_kicker':
        // Hardstyle reverse bass kicks
        const kickRadius = 70 * scale;
        
        // Main body with kick motion
        const kickPulse = config.animation !== 'none' ? 
          Math.sin(animationTime * 6) * 0.15 + 1 : 1;
        
        ctx.save();
        ctx.scale(kickPulse, kickPulse);
        
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x/kickPulse - kickRadius*0.7, y/kickPulse - kickRadius*0.7, 
          kickRadius*1.4, kickRadius*1.4, 12*scale);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        // Bass kick visual effect
        if (config.animation !== 'none') {
          const kickIntensity = Math.sin(animationTime * 6) > 0.8 ? 1 : 0;
          if (kickIntensity > 0) {
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 4 * scale;
            ctx.globalAlpha = 0.7;
            
            for(let ring = 1; ring <= 3; ring++) {
              ctx.beginPath();
              ctx.arc(x/kickPulse, y/kickPulse, kickRadius * ring * 0.4, 0, 2*Math.PI);
              ctx.stroke();
            }
            ctx.globalAlpha = 1;
          }
        }
        
        ctx.restore();
        break;
        
      default:
        // Default robot if type not found
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.arc(x, y, 60 * scale, 0, 2*Math.PI);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        break;
    }
    
    // Reset styles
    ctx.fillStyle = robotColor;
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2 * scale;
    ctx.globalAlpha = 1.0;
  };

  // Main drawing function with useCallback
  const drawAvatar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = config.size || 200;
      
      // Set canvas dimensions properly
      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size;
        canvas.height = size;
      }

      const centerX = size / 2;
      const centerY = size / 2;

      // Clear canvas
      ctx.clearRect(0, 0, size, size);
      
      // Draw background - always black to match web app style
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, size);

      // Save initial state
      ctx.save();

      // Apply animation transformations
      ctx.translate(centerX, centerY);
      applyAnimation(ctx, centerX, centerY);
      ctx.translate(-centerX, -centerY);

      // Draw the robot
      drawRobot(ctx, config.droidType, centerX, centerY, size);

      // Restore state
      ctx.restore();
    } catch (error) {
      console.error('Canvas drawing error:', error);
    }
  }, [config, animationTime]);

  // Animation effect
  useEffect(() => {
    if (config.animation === 'none') {
      drawAvatar();
      return;
    }

    let frameId: number;
    const animate = (currentTime: number) => {
      setAnimationTime(currentTime * config.animationSpeed * 0.001);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [config.animation, config.animationSpeed]);

  // Draw effect triggered by config or animation time changes
  useEffect(() => {
    drawAvatar();
  }, [config, animationTime]);

  const generateRandomAvatar = () => {
    setIsGenerating(true);
    
    const randomConfig: AvatarConfig = {
      droidType: DROID_ELEMENTS.droidTypes[Math.floor(Math.random() * DROID_ELEMENTS.droidTypes.length)].id,
      accessory: DROID_ELEMENTS.accessories[Math.floor(Math.random() * DROID_ELEMENTS.accessories.length)].id,
      gadget: DROID_ELEMENTS.gadgets[Math.floor(Math.random() * DROID_ELEMENTS.gadgets.length)].id,
      background: DROID_ELEMENTS.backgrounds[Math.floor(Math.random() * DROID_ELEMENTS.backgrounds.length)].id,
      primaryColor: TECHNO_COLORS[Math.floor(Math.random() * TECHNO_COLORS.length)],
      secondaryColor: TECHNO_COLORS[Math.floor(Math.random() * TECHNO_COLORS.length)],
      accentColor: TECHNO_COLORS[Math.floor(Math.random() * TECHNO_COLORS.length)],
      animation: DROID_ELEMENTS.animations[Math.floor(Math.random() * DROID_ELEMENTS.animations.length)].id,
      animationSpeed: 0.5 + Math.random() * 2,
      size: 200
    };
    
    setConfig(randomConfig);
    setTimeout(() => setIsGenerating(false), 500);
  };

  const saveAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const imageData = canvas.toDataURL('image/png');
      if (!imageData) {
        toast({
          title: "Error",
          description: "Failed to generate avatar image",
          variant: "destructive",
        });
        return;
      }

      const avatarData: AvatarData = {
        imageData,
        config
      };

      if (onAvatarSave) {
        onAvatarSave(avatarData);
      }

      // Download the avatar
      const link = document.createElement('a');
      link.download = `thecueroom-avatar-${config.droidType}.png`;
      link.href = imageData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      toast({
        title: "Avatar Saved!",
        description: "Your underground robot avatar has been created and downloaded.",
      });

    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        title: "Error",
        description: "Failed to save avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const setAsProfile = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const imageData = canvas.toDataURL('image/png');
      if (!imageData) {
        toast({
          title: "Error",
          description: "Failed to generate avatar image",
          variant: "destructive",
        });
        return;
      }

      const avatarData: AvatarData = {
        imageData,
        config
      };

      if (onAvatarSave) {
        onAvatarSave(avatarData);
      }

      toast({
        title: "Profile Avatar Set!",
        description: "Your robot avatar has been set as your profile picture.",
      });

    } catch (error) {
      console.error('Error setting profile avatar:', error);
      toast({
        title: "Error",
        description: "Failed to set profile avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-green-400 text-lg">
            <User className="h-5 w-5" />
            Robot Avatar Creator
          </CardTitle>
          <p className="text-gray-400 text-xs">
            Create your unique animated avatar
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Canvas Preview */}
          <div className="flex justify-center">
            <div className="bg-black rounded-lg p-3 border border-gray-700">
              <canvas
                ref={canvasRef}
                width={160}
                height={160}
                className="border border-gray-600 rounded"
              />
            </div>
          </div>

          {/* Robot Type & Animation Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-green-400 font-medium text-sm">Robot Type</Label>
              <Select value={config.droidType} onValueChange={(value) => setConfig({...config, droidType: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-300 h-9">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {DROID_ELEMENTS.droidTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="text-gray-300 hover:bg-gray-700">
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-green-400 font-medium text-sm">Animation</Label>
              <Select value={config.animation} onValueChange={(value) => setConfig({...config, animation: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-300 h-9">
                  <SelectValue placeholder="Select animation" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                  {DROID_ELEMENTS.animations.map((animation) => (
                    <SelectItem key={animation.id} value={animation.id} className="text-gray-300 hover:bg-gray-700">
                      {animation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color Customization */}
          <div className="space-y-2">
            <Label className="text-green-400 font-medium text-sm">Primary Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {TECHNO_COLORS.slice(0, 12).map((color) => (
                <button
                  key={color}
                  onClick={() => setConfig({...config, primaryColor: color})}
                  className={`w-full h-7 rounded border-2 ${
                    config.primaryColor === color ? 'border-white' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={generateRandomAvatar}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {isGenerating ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
              {isGenerating ? 'Creating...' : 'Random'}
            </Button>
            
            <Button
              onClick={setAsProfile}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <User className="h-3 w-3 mr-1" />
              Set Profile
            </Button>
            
            <Button
              onClick={saveAvatar}
              variant="outline"
              size="sm"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {showSuccess ? <Check className="h-3 w-3 mr-1" /> : <Download className="h-3 w-3 mr-1" />}
              {showSuccess ? 'Saved!' : 'Download'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}