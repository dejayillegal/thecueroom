
interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  animationType?: 'glow' | 'spin' | 'pulse';
}

export function Logo({ 
  className = "", 
  showText = true, 
  size = 'md',
  animated = false,
  animationType = 'glow'
}: LogoProps) {
  const getLogoSrc = () => {
    const basePath = (import.meta.env.VITE_BASE_PATH || '/') as string;
    const prefix = basePath.endsWith('/') ? basePath : `${basePath}/`;
    switch (size) {
      case 'sm':
        return `${prefix}images/img-logo128x128_1751081882323.png`;
      case 'lg':
        return `${prefix}images/img-logo512x512_1751081882323.png`;
      default:
        return `${prefix}images/img-logo256x256_1751081882323.png`;
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  const getAnimationClass = () => {
    if (!animated) return "";
    switch (animationType) {
      case 'spin': return 'logo-spin';
      case 'pulse': return 'logo-pulse';
      default: return 'logo-animated';
    }
  };

  if (!showText) {
    return (
      <img 
        src={getLogoSrc()} 
        alt="TheCueRoom Logo" 
        className={`${sizeClasses[size]} ${getAnimationClass()} ${className}`}
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img 
        src={getLogoSrc()} 
        alt="TheCueRoom Logo" 
        className={`${sizeClasses[size]} ${getAnimationClass()}`}
      />
      <div className="flex flex-col justify-center">
        <span className="font-bold cue-text-gradient-primary text-2xl leading-none">TheCueRoom</span>
        <span className="text-sm text-muted-foreground leading-none mt-1">Underground Music Community</span>
      </div>
    </div>
  );
}
