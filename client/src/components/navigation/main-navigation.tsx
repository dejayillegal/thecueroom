import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  Music,
  MapPin,
  Settings,
  Calendar,
  Users,
  Laugh
} from "lucide-react";

const categories = [
  {
    id: 'spotlight' as const,
    label: 'Spotlight',
    icon: Home,
    description: 'Featured content from all categories',
    gradient: 'from-pink-500 to-purple-500',
    href: '/'
  },
  {
    id: 'community' as const,
    label: 'Community Feed',
    icon: Users,
    description: 'Latest discussions, posts, and community interactions',
    gradient: 'from-yellow-400 to-yellow-600',
    href: '/community'
  },
  {
    id: 'memes' as const,
    label: 'Memes',
    icon: Laugh,
    description: 'Create and browse underground techno memes',
    gradient: 'from-pink-500 to-purple-500',
    href: '/memes'
  },
  {
    id: 'music' as const,
    label: 'Music',
    icon: Music,
    description: 'House & Techno releases, charts, and discoveries',
    gradient: 'from-blue-500 to-cyan-500',
    href: '/music'
  },
  {
    id: 'guides' as const,
    label: 'Guides',
    icon: MapPin,
    description: 'Health, wellness, and travel guides for artists',
    gradient: 'from-green-500 to-emerald-500',
    href: '/guides'
  },
  {
    id: 'industry' as const,
    label: 'Industry',
    icon: Settings,
    description: 'Production gear, interviews, and global news',
    gradient: 'from-orange-500 to-red-500',
    href: '/industry'
  },
  {
    id: 'gigs' as const,
    label: 'Gigs',
    icon: Calendar,
    description: 'Events and gigs across India',
    gradient: 'from-indigo-500 to-purple-500',
    href: '/gigs'
  }
];

interface MainNavigationProps {
  className?: string;
}

export default function MainNavigation({ className }: MainNavigationProps) {
  const [location] = useLocation();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Determine active category based on current location
  const getActiveCategory = () => {
    if (location === '/') return 'spotlight';
    if (location === '/community') return 'community';
    if (location === '/memes') return 'memes';
    if (location === '/music') return 'music';
    if (location === '/guides') return 'guides';
    if (location === '/industry') return 'industry';
    if (location === '/gigs') return 'gigs';
    if (location === '/news' || location.startsWith('/news?category=')) {
      const urlParams = new URLSearchParams(location.split('?')[1] || '');
      const category = urlParams.get('category');
      return category || 'music';
    }
    return 'spotlight';
  };

  const activeCategory = getActiveCategory();

  return (
    <nav className={cn("w-full bg-background border-b border-border/40", className)}>
      {/* Main Navigation */}
      <div className="flex items-center space-x-1 px-6 py-4 overflow-x-auto scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          const isHovered = hoveredCategory === category.id;

          return (
            <Link key={category.id} href={category.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="lg"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={cn(
                  "relative flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 min-w-fit whitespace-nowrap bg-black",
                  isActive
                    ? "shadow-lg scale-105"
                    : "hover:scale-102 text-muted-foreground",
                  // Background hover - all buttons keep black background
                  !isActive && "hover:bg-black",
                  // Hover text color - all buttons get white text
                  !isActive && "hover:text-white",
                  // Active state styling
                  isActive && (category.id === 'home' || category.id === 'spotlight') && "text-transparent bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text",
                  isActive && category.id === 'community' && "text-[#06c23e]",
                  isActive && category.id === 'memes' && "text-transparent bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text",
                  isActive && category.id === 'music' && "text-transparent bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text",
                  isActive && category.id === 'guides' && "text-transparent bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text",
                  isActive && category.id === 'industry' && "text-transparent bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text",
                  isActive && category.id === 'gigs' && "text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text",
                  // Special hover override for spotlight when active
                  isActive && category.id === 'spotlight' && "hover:text-white hover:bg-black"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isHovered && !isActive && "scale-110",
                  isActive && (category.id === 'spotlight' || category.id === 'home') && "text-white"
                )} />
                <span className="font-semibold text-sm">
                  {category.label}
                </span>
                
                {/* Hover tooltip */}
                {isHovered && !isActive && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
                    <div className="bg-popover text-popover-foreground border border-border rounded-lg px-3 py-2 shadow-lg max-w-xs">
                      <p className="text-xs font-medium text-center">
                        {category.description}
                      </p>
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-popover border-l border-t border-border rotate-45"></div>
                    </div>
                  </div>
                )}
              </Button>
            </Link>
          );
        })}
      </div>
      {/* Gradient line under active category */}
      <div className="relative h-px bg-border/20">
        <div 
          className={cn(
            "absolute h-px bg-gradient-to-r transition-all duration-500",
            categories.find(cat => cat.id === activeCategory)?.gradient || "from-pink-500 to-purple-500"
          )}
          style={{
            width: `${100 / categories.length}%`,
            left: `${categories.findIndex(cat => cat.id === activeCategory) * (100 / categories.length)}%`
          }}
        />
      </div>
    </nav>
  );
}