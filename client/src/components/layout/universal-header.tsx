/**
 * Universal Header Component with Professional Navigation Layout
 * Features smart overflow system with primary items (4) and overflow dropdown
 * Fixed-width logo section for professional spacing, mobile hamburger menu
 * Profile always visible on right side with user avatar and menu
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import AnimatedAvatarDisplay from "@/components/animated-avatar-display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { 
  Music, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Shield,
  Home,
  Newspaper,
  Laugh,
  Calendar,
  ListMusic,
  MapPin,
  Star,
  BookOpen,
  Building,
  MicIcon,
  Users,
  MoreHorizontal,
  Menu
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

// Navigation categories
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

interface UniversalHeaderProps {
  className?: string;
}

export default function UniversalHeader({ className }: UniversalHeaderProps) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notifications] = useState(0);
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

  // Header items: Spotlight, Community Feed, Music (specific items)
  const headerItems = categories.filter(cat => 
    ['spotlight', 'community', 'music'].includes(cat.id)
  );
  
  // Navigation items: remaining items go to overflow dropdown
  const navigationItems = categories.filter(cat => 
    !['spotlight', 'community', 'music'].includes(cat.id)
  );

  return (
    <header className={cn("w-full bg-background border-b border-border/40 sticky top-0 z-50", className)}>
      {/* Integrated Header with Navigation */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo Section - Fixed Width for Better Spacing */}
            <div className="flex-shrink-0 w-72">
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <Logo showText={false} className="w-8 h-8" animated={true} animationType="glow" />
                  <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-white group-hover:scale-105 transition-transform duration-300">
                      TheCueRoom
                    </h1>
                    <p className="text-xs text-gray-300 -mt-1 hidden sm:block">
                      Underground Music Community
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Header Navigation Menu - Spotlight, Community Feed, Music */}
            <nav className="hidden lg:flex items-center space-x-3 flex-1 justify-center px-12 ml-[60px] mr-[60px]">
              {headerItems.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                const isHovered = hoveredCategory === category.id;

                return (
                  <Link key={category.id} href={category.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onMouseEnter={() => setHoveredCategory(category.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={cn(
                        "relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 min-w-fit whitespace-nowrap",
                        isActive
                          ? "bg-black shadow-lg scale-105"
                          : "hover:scale-102 text-gray-300 hover:bg-gray-700 hover:text-white",
                        // Active state styling
                        isActive && category.id === 'spotlight' && "text-transparent bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text",
                        isActive && category.id === 'community' && "text-[#06c23e]",
                        isActive && category.id === 'memes' && "text-transparent bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text",
                        isActive && category.id === 'music' && "text-transparent bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        isHovered && !isActive && "scale-110",
                        isActive && category.id === 'spotlight' && "text-white"
                      )} />
                      <span className="font-medium text-sm">
                        {category.label}
                      </span>
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Navigation - User Profile + Overflow Dropdown */}
            <div className="flex items-center space-x-3 flex-1 justify-end">
              {/* User Profile Navigation Item */}
              <div className="hidden lg:flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 hover:text-white text-gray-300"
                    >
                      <div className="relative w-8 h-8">
                        {user?.avatar && user?.avatarConfig && 
                         typeof user.avatarConfig === 'object' && 
                         'droidType' in user.avatarConfig ? (
                          <div className="relative">
                            <AnimatedAvatarDisplay 
                              config={user.avatarConfig as any}
                              size={32}
                              className="w-8 h-8"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-sm hidden xl:block">Profile</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-700">
                    <Link href="/profile">
                      <DropdownMenuItem className="flex items-center space-x-3 p-3 hover:bg-gray-800 text-gray-300 hover:text-white">
                        <User className="w-5 h-5" />
                        <div className="flex flex-col">
                          <span className="font-medium">View Profile</span>
                          <span className="text-xs text-gray-500">Manage your account</span>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    {user?.isAdmin && (
                      <>
                        <Link href="/admin">
                          <DropdownMenuItem className="flex items-center space-x-3 p-3 hover:bg-gray-800 text-gray-300 hover:text-white">
                            <Shield className="w-5 h-5" />
                            <div className="flex flex-col">
                              <span className="font-medium">Admin Panel</span>
                              <span className="text-xs text-gray-500">Platform management</span>
                            </div>
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator className="bg-gray-700" />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => window.location.href = '/api/auth/logout'}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-800 text-gray-300 hover:text-white"
                    >
                      <LogOut className="w-5 h-5" />
                      <div className="flex flex-col">
                        <span className="font-medium">Sign Out</span>
                        <span className="text-xs text-gray-500">End your session</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Navigation Dropdown - Memes, Guides, Industry, Gigs */}
              {navigationItems.length > 0 && (
                <div className="hidden lg:flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-700 hover:text-white text-gray-300 border border-gray-600"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="font-medium text-sm">Navigation</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-700">
                      {navigationItems.map((category) => {
                        const Icon = category.icon;
                        const isActive = activeCategory === category.id;
                        
                        return (
                          <DropdownMenuItem 
                            key={category.id}
                            onClick={() => window.location.href = category.href}
                            className={cn(
                              "flex items-center space-x-3 p-3 hover:bg-gray-800 text-gray-300 hover:text-white",
                              isActive && "bg-gray-800 text-white"
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <div className="flex flex-col">
                              <span className="font-medium">{category.label}</span>
                              <span className="text-xs text-gray-500">{category.description}</span>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Mobile Navigation Menu */}
            <div className="lg:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center p-2 hover:bg-gray-700 hover:text-white text-gray-300"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-gray-900 border-gray-700">
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <h3 className="text-lg font-semibold text-white">Navigation</h3>
                    </div>
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isActive = activeCategory === category.id;
                      
                      return (
                        <Link key={category.id} href={category.href}>
                          <div
                            className={cn(
                              "flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg mx-2",
                              isActive && "bg-gray-800 text-white"
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <div className="flex flex-col">
                              <span className="font-medium">{category.label}</span>
                              <span className="text-xs text-gray-500">{category.description}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    
                    {/* User Profile Section in Mobile */}
                    <div className="border-t border-gray-700 pt-4">
                      <div className="px-4 py-2">
                        <h4 className="text-md font-semibold text-white">Profile</h4>
                      </div>
                      <Link href="/profile">
                        <div className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg mx-2">
                          <User className="w-5 h-5" />
                          <div className="flex flex-col">
                            <span className="font-medium">View Profile</span>
                            <span className="text-xs text-gray-500">Manage your account</span>
                          </div>
                        </div>
                      </Link>
                      {user?.isAdmin && (
                        <Link href="/admin">
                          <div className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg mx-2">
                            <Shield className="w-5 h-5" />
                            <div className="flex flex-col">
                              <span className="font-medium">Admin Panel</span>
                              <span className="text-xs text-gray-500">Platform management</span>
                            </div>
                          </div>
                        </Link>
                      )}
                      <div
                        onClick={() => window.location.href = '/api/auth/logout'}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg mx-2 cursor-pointer"
                      >
                        <LogOut className="w-5 h-5" />
                        <div className="flex flex-col">
                          <span className="font-medium">Sign Out</span>
                          <span className="text-xs text-gray-500">End your session</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>


          </div>
        </div>

        {/* Active Category Indicator Line */}
        <div className="relative h-px bg-border/20">
          <div 
            className={cn(
              "absolute h-px bg-gradient-to-r transition-all duration-500 opacity-60",
              categories.find(cat => cat.id === activeCategory)?.gradient || "from-pink-500 to-purple-500"
            )}
            style={{
              width: '100%',
              left: '0%'
            }}
          />
        </div>
      </div>
    </header>
  );
}

export { UniversalHeader };