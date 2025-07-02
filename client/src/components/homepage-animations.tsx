import { useEffect, useState } from "react";
import { Music, Disc3, Headphones, Zap, Volume2, Radio } from "lucide-react";

interface FloatingElement {
  id: number;
  icon: JSX.Element;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export default function HomepageAnimations() {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    try {
      const musicIcons = [
        <Music key="music" className="w-6 h-6 text-purple-400" />,
        <Disc3 key="disc" className="w-6 h-6 text-cyan-400" />,
        <Headphones key="headphones" className="w-6 h-6 text-green-400" />,
        <Zap key="zap" className="w-6 h-6 text-yellow-400" />,
        <Volume2 key="volume" className="w-6 h-6 text-pink-400" />,
        <Radio key="radio" className="w-6 h-6 text-blue-400" />
      ];

      const generateElements = () => {
        try {
          const newElements: FloatingElement[] = [];
          for (let i = 0; i < 8; i++) {
            newElements.push({
              id: i,
              icon: musicIcons[Math.floor(Math.random() * musicIcons.length)],
              x: Math.random() * 100,
              y: Math.random() * 100,
              delay: Math.random() * 5,
              duration: 8 + Math.random() * 4
            });
          }
          setElements(newElements);
        } catch (error) {
          console.error('Failed to generate animation elements:', error);
        }
      };

      generateElements();
      interval = setInterval(generateElements, 12000);
    } catch (error) {
      console.error('Animation initialization failed:', error);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute opacity-20 animate-float"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            animationDelay: `${element.delay}s`,
            animationDuration: `${element.duration}s`
          }}
        >
          {element.icon}
        </div>
      ))}
      
      {/* Bass wave animation */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-purple-600/20 animate-pulse" />
      
      {/* Corner accents */}
      <div className="absolute top-4 right-4 w-16 h-16 border-2 border-purple-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-cyan-400/20 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
    </div>
  );
}

// CSS animations to add to index.css
export const animationStyles = `
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.2;
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
    opacity: 0.3;
  }
  75% {
    transform: translateY(-30px) rotate(270deg);
    opacity: 0.5;
  }
}

.animate-float {
  animation: float linear infinite;
}

/* Button hover animations */
.btn-hover {
  transition: all 0.2s ease-in-out;
}

.btn-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-hover:active {
  transform: translateY(0px);
  transform: scale(0.98);
}

/* Underground-themed hover effects */
.underground-hover {
  position: relative;
  overflow: hidden;
}

.underground-hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2), transparent);
  transition: left 0.5s;
}

.underground-hover:hover::before {
  left: 100%;
}
`;