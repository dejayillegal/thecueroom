import { useRef, useEffect, useCallback, useMemo } from "react";
import { useAnimation } from "@/contexts/AnimationContext";

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

interface AnimatedAvatarDisplayProps {
  config?: AvatarConfig;
  userId?: string;
  className?: string;
  size?: number;
}

// Simplified version of the avatar drawing logic from ProfileAvatarCreator
const TECHNO_COLORS = [
  '#00ffff', '#ff00ff', '#ffff00', '#00ff00', // Neon colors
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
  '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f',
  '#bb8fce', '#85c1e9', '#f8c471', '#82e0aa'
];

const DROID_ELEMENTS = {
  droidTypes: [
    { id: 'dj_booth', name: 'DJ Booth', description: 'Professional mixing station' },
    { id: 'synth_master', name: 'Synth Master', description: 'Analog synthesizer expert' },
    { id: 'bass_cannon', name: 'Bass Cannon', description: 'Heavy sub-bass specialist' },
    { id: 'light_show', name: 'Light Show', description: 'Visual effects controller' },
    { id: 'sound_engineer', name: 'Sound Engineer', description: 'Audio mixing professional' },
    { id: 'vinyl_spinner', name: 'Vinyl Spinner', description: 'Classic turntable master' },
    { id: 'digital_dj', name: 'Digital DJ', description: 'Modern controller expert' },
    { id: 'fx_processor', name: 'FX Processor', description: 'Effects and filters specialist' },
    { id: 'beat_maker', name: 'Beat Maker', description: 'Rhythm and percussion' },
    { id: 'sample_slicer', name: 'Sample Slicer', description: 'Sample manipulation' },
    { id: 'loop_station', name: 'Loop Station', description: 'Live looping expert' },
    { id: 'acid_machine', name: 'Acid Machine', description: '303-style acid lines' },
    { id: 'rave_master', name: 'Rave Master', description: 'High-energy party controller' },
    { id: 'boombox_bot', name: 'Boombox Bot', description: 'Retro portable sound system' },
    { id: 'shuffle_dancer', name: 'Shuffle Dancer', description: 'Melbourne shuffle moves' },
    { id: 'skanking_robot', name: 'Skanking Robot', description: 'Reggae-techno hybrid' },
    { id: 'stomping_raver', name: 'Stomping Raver', description: 'Heavy gabber stomps' },
    { id: 'liquid_dancer', name: 'Liquid Dancer', description: 'Flowing DnB movements' },
    { id: 'jumpstyle_bot', name: 'Jumpstyle Bot', description: 'Hardstyle jumping' },
    { id: 'breakdancer', name: 'Breakdancer', description: 'B-boy spinning moves' },
    { id: 'popping_bot', name: 'Popping Bot', description: 'Robotic isolations' },
    { id: 'hardstyle_kicker', name: 'Hardstyle Kicker', description: 'Reverse bass kicks' }
  ],
  accessories: [
    { id: 'headphones', name: 'Headphones', description: 'Professional monitor headphones' },
    { id: 'sunglasses', name: 'Sunglasses', description: 'Cool underground shades' },
    { id: 'cap_backwards', name: 'Backwards Cap', description: 'Street style cap' },
    { id: 'bandana', name: 'Bandana', description: 'Underground culture bandana' },
    { id: 'goggles', name: 'Goggles', description: 'Futuristic eye protection' },
    { id: 'beanie', name: 'Beanie', description: 'Casual underground beanie' }
  ],
  gadgets: [
    { id: 'mixer', name: 'DJ Mixer', description: 'Professional mixing console' },
    { id: 'microphone', name: 'Microphone', description: 'MC vocal microphone' },
    { id: 'controller', name: 'MIDI Controller', description: 'Digital control surface' },
    { id: 'turntable', name: 'Turntable', description: 'Vinyl record player' },
    { id: 'synthesizer', name: 'Synthesizer', description: 'Electronic sound generator' },
    { id: 'drum_machine', name: 'Drum Machine', description: 'Beat production device' }
  ],
  backgrounds: [
    { id: 'neon_grid', name: 'Neon Grid', description: 'Cyberpunk grid pattern' },
    { id: 'laser_beams', name: 'Laser Beams', description: 'Concert laser light show' },
    { id: 'vinyl_records', name: 'Vinyl Records', description: 'Classic record collection' },
    { id: 'sound_waves', name: 'Sound Waves', description: 'Audio waveform pattern' },
    { id: 'circuit_board', name: 'Circuit Board', description: 'Electronic circuit pattern' },
    { id: 'rave_lights', name: 'Rave Lights', description: 'Party strobe lighting' }
  ]
};

export default function AnimatedAvatarDisplay({ config, userId, className = "", size = 80 }: AnimatedAvatarDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(0);
  const { animationsEnabled } = useAnimation();

  // Generate default config from userId if no config provided
  const avatarConfig = useMemo(() => {
    if (config) return config;
    
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
      size: size,
      animation: 'pulse',
      animationSpeed: 1
    };
  }, [config, userId, size]);

  // Performance optimization: determine effective animation setting
  const effectiveAnimation = useMemo(() => {
    return animationsEnabled && avatarConfig.animation !== 'none' ? avatarConfig.animation : 'none';
  }, [animationsEnabled, avatarConfig.animation]);

  const drawRobot = useCallback((ctx: CanvasRenderingContext2D, droidType: string, x: number, y: number, canvasSize: number) => {
    const scale = canvasSize / 200; // Scale based on canvas size
    const robotColor = avatarConfig.primaryColor || TECHNO_COLORS[0];
    const accentColor = avatarConfig.accentColor || TECHNO_COLORS[2];
    const darkColor = avatarConfig.secondaryColor || '#333';
    const animationTime = Date.now() * 0.001 * (avatarConfig.animationSpeed || 1);

    ctx.fillStyle = robotColor;
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2 * scale;

    switch (droidType) {
      case 'dj':
        // Large DJ Robot with turntable
        const djRadius = 60 * scale;
        
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
        
        // Spinning vinyl grooves
        if (config.animation !== 'none') {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(animationTime * 3);
          
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1 * scale;
          for(let i = 3; i <= 6; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, djRadius*0.1*i, 0, 2*Math.PI);
            ctx.stroke();
          }
          ctx.restore();
        }
        
        // Tonearm
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(x + djRadius*0.5, y - djRadius*0.3);
        ctx.lineTo(x + djRadius*0.3, y + djRadius*0.3);
        ctx.stroke();
        break;

      case 'producer':
        // Hexagonal synthesizer robot
        const prodRadius = 60 * scale;
        
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
        ctx.stroke();
        
        // Animated waveform
        if (config.animation !== 'none') {
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          for(let i = 0; i < 15; i++) {
            const waveX = x - prodRadius*0.4 + (i * prodRadius*0.8/14);
            const waveY = y - prodRadius*0.2 + Math.sin(animationTime * 4 + i * 0.3) * 10 * scale;
            if (i === 0) ctx.moveTo(waveX, waveY);
            else ctx.lineTo(waveX, waveY);
          }
          ctx.stroke();
        }
        
        // Piano keys
        const keyWidth = prodRadius * 0.08;
        const keyHeight = prodRadius * 0.25;
        for(let i = 0; i < 8; i++) {
          const keyX = x - prodRadius*0.32 + i * keyWidth;
          const keyPressed = config.animation !== 'none' && Math.sin(animationTime * 3 + i) > 0.5;
          
          ctx.fillStyle = keyPressed ? accentColor : '#fff';
          ctx.beginPath();
          ctx.roundRect(keyX, y + prodRadius*0.3, keyWidth*0.8, keyHeight, 1*scale);
          ctx.fill();
        }
        break;

      case 'hardcore':
      case 'drummer':
        // Rectangular drummer robot
        const drumRadius = 60 * scale;
        
        // Rectangular body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - drumRadius*0.8, y - drumRadius*0.6, drumRadius*1.6, drumRadius*1.2, 10*scale);
        ctx.fill();
        ctx.stroke();
        
        // Drum pads
        const drumPads = [
          {x: -0.4, y: -0.2, size: 0.15},
          {x: 0.4, y: -0.2, size: 0.15},
          {x: 0, y: 0.1, size: 0.2}
        ];
        
        drumPads.forEach((pad, index) => {
          const hit = config.animation !== 'none' && Math.sin(animationTime * 6 + index * 1.5) > 0.6;
          ctx.fillStyle = hit ? accentColor : darkColor;
          ctx.beginPath();
          ctx.arc(x + pad.x*drumRadius, y + pad.y*drumRadius, pad.size*drumRadius, 0, 2*Math.PI);
          ctx.fill();
        });
        break;

      case 'laser':
        // Diamond laser robot
        const laserRadius = 60 * scale;
        
        // Diamond body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.moveTo(x, y - laserRadius*0.8);
        ctx.lineTo(x + laserRadius*0.6, y);
        ctx.lineTo(x, y + laserRadius*0.8);
        ctx.lineTo(x - laserRadius*0.6, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Animated laser beams
        if (config.animation !== 'none') {
          const beamColors = ['#ff0000', '#00ff00', '#0000ff'];
          for(let i = 0; i < 3; i++) {
            const angle = (animationTime * 2 + i * Math.PI*2/3) % (Math.PI * 2);
            const beamLength = laserRadius * 0.5;
            
            ctx.strokeStyle = beamColors[i];
            ctx.lineWidth = 2 * scale;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * beamLength, y + Math.sin(angle) * beamLength);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
        
        // Central projector
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(x, y, laserRadius*0.15, 0, 2*Math.PI);
        ctx.fill();
        break;

      case 'vinyl':
        // Record crate robot
        const vinylRadius = 60 * scale;
        
        // Rectangular crate body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - vinylRadius*0.8, y - vinylRadius*0.6, vinylRadius*1.6, vinylRadius*1.2, 8*scale);
        ctx.fill();
        ctx.stroke();
        
        // Spinning records
        const records = [
          {x: -0.3, y: -0.1, size: 0.2},
          {x: 0.3, y: -0.1, size: 0.2},
          {x: 0, y: 0.2, size: 0.25}
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
          
          // Center label
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(0, 0, record.size*vinylRadius*0.2, 0, 2*Math.PI);
          ctx.fill();
          
          ctx.restore();
        });
        break;

      case 'raver':
        // Rectangular speaker robot
        const raverRadius = 60 * scale;
        
        // Rectangular speaker body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - raverRadius*0.8, y - raverRadius*0.7, raverRadius*1.6, raverRadius*1.4, 10*scale);
        ctx.fill();
        ctx.stroke();
        
        // Multiple pulsing speakers
        const speakers = [
          {x: -0.4, y: -0.3, size: 0.2},
          {x: 0.4, y: -0.3, size: 0.2},
          {x: 0, y: 0.1, size: 0.25}
        ];
        
        speakers.forEach((speaker, index) => {
          const pulse = avatarConfig.animation !== 'none' && Math.sin(animationTime * 5 + index * 2) > 0.3;
          const speakerScale = pulse ? 1.1 : 1;
          
          ctx.save();
          ctx.translate(x + speaker.x*raverRadius, y + speaker.y*raverRadius);
          ctx.scale(speakerScale, speakerScale);
          
          ctx.fillStyle = pulse ? accentColor : darkColor;
          ctx.beginPath();
          ctx.arc(0, 0, speaker.size*raverRadius, 0, 2*Math.PI);
          ctx.fill();
          
          // Speaker cone
          ctx.fillStyle = robotColor;
          ctx.beginPath();
          ctx.arc(0, 0, speaker.size*raverRadius*0.5, 0, 2*Math.PI);
          ctx.fill();
          
          ctx.restore();
        });
        break;

      case 'turntablist':
        // Twin turntable robot
        const ttRadius = 60 * scale;
        
        // Rectangular base
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - ttRadius*0.9, y - ttRadius*0.4, ttRadius*1.8, ttRadius*0.8, 8*scale);
        ctx.fill();
        ctx.stroke();
        
        // Twin turntables
        [-0.4, 0.4].forEach((side, index) => {
          const recordAngle = config.animation !== 'none' ? animationTime * (3 + index) : 0;
          
          ctx.save();
          ctx.translate(x + side*ttRadius, y);
          
          // Turntable base
          ctx.fillStyle = darkColor;
          ctx.beginPath();
          ctx.arc(0, 0, ttRadius*0.3, 0, 2*Math.PI);
          ctx.fill();
          
          // Spinning record
          ctx.rotate(recordAngle);
          ctx.fillStyle = '#1a1a1a';
          ctx.beginPath();
          ctx.arc(0, 0, ttRadius*0.25, 0, 2*Math.PI);
          ctx.fill();
          
          // Record center
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(0, 0, ttRadius*0.05, 0, 2*Math.PI);
          ctx.fill();
          
          ctx.restore();
        });
        break;

      case 'boombox':
        // Retro boombox robot
        const boomRadius = 60 * scale;
        
        // Rectangular boombox body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - boomRadius*0.9, y - boomRadius*0.5, boomRadius*1.8, boomRadius, 12*scale);
        ctx.fill();
        ctx.stroke();
        
        // Twin speakers
        [-0.3, 0.3].forEach(side => {
          ctx.fillStyle = darkColor;
          ctx.beginPath();
          ctx.arc(x + side*boomRadius, y, boomRadius*0.2, 0, 2*Math.PI);
          ctx.fill();
          
          // Speaker grille lines
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1 * scale;
          for(let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(x + side*boomRadius - boomRadius*0.15, y + i*boomRadius*0.05);
            ctx.lineTo(x + side*boomRadius + boomRadius*0.15, y + i*boomRadius*0.05);
            ctx.stroke();
          }
        });
        
        // Antenna with bouncing motion
        const antennaY = config.animation !== 'none' ? Math.sin(animationTime * 3) * 5 * scale : 0;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(x - boomRadius*0.7, y - boomRadius*0.4);
        ctx.lineTo(x - boomRadius*0.7, y - boomRadius*0.8 + antennaY);
        ctx.stroke();
        break;

      case 'synthwave':
        // Neon synthwave robot
        const synthRadius = 60 * scale;
        
        // Triangular futuristic body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.moveTo(x, y - synthRadius*0.8);
        ctx.lineTo(x - synthRadius*0.7, y + synthRadius*0.6);
        ctx.lineTo(x + synthRadius*0.7, y + synthRadius*0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Animated RGB light strips
        if (avatarConfig.animation !== 'none') {
          const colors = ['#ff0080', '#00ff80', '#0080ff'];
          for(let i = 0; i < 3; i++) {
            const stripY = y - synthRadius*0.4 + i * synthRadius*0.3;
            const alpha = 0.5 + Math.sin(animationTime * 4 + i * 2) * 0.5;
            
            ctx.strokeStyle = colors[i];
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 4 * scale;
            ctx.beginPath();
            ctx.moveTo(x - synthRadius*0.5, stripY);
            ctx.lineTo(x + synthRadius*0.5, stripY);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
        break;

      case 'cyborg':
        // Futuristic cyborg robot
        const cyborgRadius = 60 * scale;
        
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
        ctx.stroke();
        
        // Glowing circuit lines
        if (avatarConfig.animation !== 'none') {
          const circuitLines = [
            {start: {x: -0.4, y: -0.5}, end: {x: 0.4, y: -0.5}},
            {start: {x: -0.6, y: 0}, end: {x: 0.6, y: 0}},
            {start: {x: 0, y: -0.7}, end: {x: 0, y: 0.7}}
          ];
          
          circuitLines.forEach((line, index) => {
            const pulse = Math.sin(animationTime * 5 + index) > 0.5;
            ctx.strokeStyle = pulse ? '#00ffff' : accentColor;
            ctx.lineWidth = 2 * scale;
            ctx.globalAlpha = pulse ? 1 : 0.6;
            
            ctx.beginPath();
            ctx.moveTo(x + line.start.x*cyborgRadius, y + line.start.y*cyborgRadius);
            ctx.lineTo(x + line.end.x*cyborgRadius, y + line.end.y*cyborgRadius);
            ctx.stroke();
            ctx.globalAlpha = 1;
          });
        }
        break;

      case 'glitch':
        // Glitchy error robot
        const glitchRadius = 60 * scale;
        
        // Base body with potential displacement
        const glitchOffsetX = config.animation !== 'none' && Math.sin(animationTime * 10) > 0.8 ? (Math.random() - 0.5) * 8 * scale : 0;
        const glitchOffsetY = config.animation !== 'none' && Math.sin(animationTime * 12) > 0.8 ? (Math.random() - 0.5) * 8 * scale : 0;
        
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        ctx.roundRect(x - glitchRadius*0.7 + glitchOffsetX, y - glitchRadius*0.7 + glitchOffsetY, 
                     glitchRadius*1.4, glitchRadius*1.4, 12*scale);
        ctx.fill();
        ctx.stroke();
        
        // Digital artifact blocks
        if (avatarConfig.animation !== 'none') {
          for(let i = 0; i < 5; i++) {
            if (Math.sin(animationTime * 8 + i) > 0.6) {
              const blockX = x + (Math.random() - 0.5) * glitchRadius;
              const blockY = y + (Math.random() - 0.5) * glitchRadius;
              const blockSize = Math.random() * 8 * scale + 3 * scale;
              
              ctx.fillStyle = ['#ff0080', '#00ff80', '#0080ff'][Math.floor(Math.random() * 3)];
              ctx.globalAlpha = 0.7;
              ctx.beginPath();
              ctx.roundRect(blockX, blockY, blockSize, blockSize, 1*scale);
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        }
        break;

      default:
        // Default hexagonal robot - no more circles!
        const defaultRadius = 50 * scale;
        
        // Hexagonal body
        ctx.fillStyle = robotColor;
        ctx.beginPath();
        for(let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const hexX = x + defaultRadius * Math.cos(angle);
          const hexY = y + defaultRadius * Math.sin(angle);
          if (i === 0) ctx.moveTo(hexX, hexY);
          else ctx.lineTo(hexX, hexY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Central core
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(x, y, defaultRadius*0.25, 0, 2*Math.PI);
        ctx.fill();
        
        // Corner lights
        for(let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const lightX = x + defaultRadius * 0.7 * Math.cos(angle);
          const lightY = y + defaultRadius * 0.7 * Math.sin(angle);
          
          ctx.fillStyle = avatarConfig.animation !== 'none' && Math.sin(animationTime * 4 + i) > 0.5 ? accentColor : darkColor;
          ctx.beginPath();
          ctx.arc(lightX, lightY, defaultRadius*0.08, 0, 2*Math.PI);
          ctx.fill();
        }
        break;
    }
  }, [avatarConfig]);

  const applyAnimation = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    if (avatarConfig.animation === 'none') return;

    const safeAmplitude = 3; // Keep animations small for profile display

    switch (avatarConfig.animation) {
      case 'pulse':
        const scale = 1 + Math.sin(time * 4) * 0.05;
        ctx.scale(scale, scale);
        break;
        
      case 'headbang':
        const headbangY = Math.sin(time * 6) * safeAmplitude;
        ctx.translate(0, headbangY);
        break;
        
      case 'disco_spin':
        ctx.rotate(time * 0.2);
        break;
        
      case 'rave_bounce':
        const bounceY = Math.sin(time * 8) * safeAmplitude;
        ctx.translate(0, bounceY);
        break;
        
      default:
        // Default pulse for unknown animations
        const defaultScale = 1 + Math.sin(time * 3) * 0.04;
        ctx.scale(defaultScale, defaultScale);
        break;
    }
  }, [avatarConfig.animation]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Performance optimization: limit frame rate to 30fps for better performance
    const now = Date.now();
    const frameInterval = 1000 / 30; // 30fps
    if (now - lastUpdateTimeRef.current < frameInterval) {
      if (effectiveAnimation !== 'none') {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
      return;
    }
    lastUpdateTimeRef.current = now;

    const centerX = size / 2;
    const centerY = size / 2;
    const time = now * 0.001 * (avatarConfig.animationSpeed || 1);

    // Clear canvas with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    // Save context
    ctx.save();

    // Apply animation transformations only if animations are enabled
    ctx.translate(centerX, centerY);
    if (effectiveAnimation !== 'none') {
      applyAnimation(ctx, time);
    }
    ctx.translate(-centerX, -centerY);

    // Draw the robot
    drawRobot(ctx, avatarConfig.droidType, centerX, centerY, size);

    // Restore context
    ctx.restore();

    // Continue animation only if enabled and not 'none'
    if (effectiveAnimation !== 'none') {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [avatarConfig, size, drawRobot, applyAnimation, effectiveAnimation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Start animation
    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  );
}

export { AnimatedAvatarDisplay };