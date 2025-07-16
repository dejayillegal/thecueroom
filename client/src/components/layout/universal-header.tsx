import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AnimatedAvatarDisplay from "@/components/animated-avatar-display";
import { Badge } from "@/components/ui/badge";
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
import { apiRequest } from "@/lib/queryClient";
import { safeStorage } from "@/lib/safe-dom";
import {
  Home,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Shield,
  Laugh,
  Calendar,
  MapPin,
  Music,
  Users,
  MoreHorizontal,
  Menu,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { getBasePath } from "@/lib/router-config";

// Navigation categories
const categories = [
  { id: 'spotlight', label: 'Spotlight', icon: Home, description: 'Featured content from all categories', gradient: 'from-pink-500 to-purple-500', href: '/' },
  { id: 'community', label: 'Community Feed', icon: Users, description: 'Latest discussions, posts, and community interactions', gradient: 'from-yellow-400 to-yellow-600', href: '/community' },
  { id: 'memes', label: 'Memes', icon: Laugh, description: 'Create and browse underground techno memes', gradient: 'from-pink-500 to-purple-500', href: '/memes' },
  { id: 'music', label: 'Music', icon: Music, description: 'House & Techno releases, charts, and discoveries', gradient: 'from-blue-500 to-cyan-500', href: '/music' },
  { id: 'guides', label: 'Guides', icon: MapPin, description: 'Health, wellness, and travel guides for artists', gradient: 'from-green-500 to-emerald-500', href: '/guides' },
  { id: 'industry', label: 'Industry', icon: Settings, description: 'Production gear, interviews, and global news', gradient: 'from-orange-500 to-red-500', href: '/industry' },
  { id: 'gigs', label: 'Gigs', icon: Calendar, description: 'Events and gigs across India', gradient: 'from-indigo-500 to-purple-500', href: '/gigs' },
];

interface UniversalHeaderProps {
  className?: string;
}

export default function UniversalHeader({ className }: UniversalHeaderProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notifications] = useState(3); // example count
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Determine active category based on current location
  const getActiveCategory = () => {
    const cat = categories.find(c => c.href === location);
    return cat ? cat.id : 'spotlight';
  };
  const activeCategory = getActiveCategory();

  // Split header items (first three) and overflow
  const headerItems = categories.filter(cat => ['spotlight', 'community', 'music'].includes(cat.id));
  const navigationItems = categories.filter(cat => !['spotlight', 'community', 'music'].includes(cat.id));

  return (
    <header className={cn("w-full bg-background border-b border-border/40 sticky top-0 z-50", className)}>
      <div className="bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">

            {/* Logo Section */}
            <div className="flex-shrink-0 w-72">
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <Logo showText={false} className="w-8 h-8" animated animationType="glow" />
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

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right Side: headerItems, search, notifications, profile, overflow */}
            <div className="flex items-center space-x-4">

              {/* Spotlight, Community, Music */}
              {headerItems.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const isHovered = hoveredCategory === cat.id;
                return (
                  <Link key={cat.id} href={cat.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg transition-transform duration-300",
                        isActive
                          ? "bg-gradient-to-r text-transparent bg-clip-text " + cat.gradient
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        isHovered && !isActive && "scale-105"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{cat.label}</span>
                    </Button>
                  </Link>
                );
              })}

              {/* Search Icon */}
              <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:bg-gray-700">
                <Search className="w-5 h-5" />
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:bg-gray-700">
                  <Bell className="w-5 h-5" />
                </Button>
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1">{notifications}</Badge>
                )}
              </div>

              {/* Profile */}
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300">
                      {user?.avatarConfig ? (
                        <AnimatedAvatarDisplay config={user.avatarConfig as any} size={32} className="w-8 h-8 rounded-full" />
                      ) : (
                        <Avatar className="w-8 h-8"><AvatarFallback><User className="w-4 h-4 text-white" /></AvatarFallback></Avatar>
                      )}
                      <span className="font-medium text-sm">Profile</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-700">
                    <Link href="/profile"><DropdownMenuItem>View Profile</DropdownMenuItem></Link>
                    <DropdownMenuSeparator />
                    {user?.isAdmin && <Link href="/admin"><DropdownMenuItem>Admin Panel</DropdownMenuItem></Link>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await apiRequest('POST', '/api/auth/logout');
                          queryClient.setQueryData(['/api/auth/user'], null);
                          queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
                          safeStorage.removeItem('tcr-user');
                        } catch (error) {
                          console.error('Logout error:', error);
                          queryClient.setQueryData(['/api/auth/user'], null);
                          safeStorage.removeItem('tcr-user');
                        } finally {
                          window.location.href = getBasePath();
                        }
                      }}
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Overflow Navigation */}
              {navigationItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-700">
                    {navigationItems.map(cat => (
                      <DropdownMenuItem key={cat.id} onClick={() => window.location.href = getBasePath() + cat.href}>
                        <div className="flex items-center space-x-2">
                          <cat.icon className="w-5 h-5" />
                          <div className="flex flex-col">
                            <span className="font-medium">{cat.label}</span>
                            <span className="text-xs text-gray-500">{cat.description}</span>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

            </div>

            {/* Mobile Menu Trigger */}
            <div className="lg:hidden ml-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:bg-gray-700">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-gray-900 border-gray-700">
                  <div className="flex flex-col space-y-4 mt-8">
                    {categories.map(cat => (
                      <Link key={cat.id} href={cat.href}>
                        <div className={cn(
                          "flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg mx-2",
                          activeCategory === cat.id && "bg-gray-800 text-white"
                        )}>
                          <cat.icon className="w-5 h-5" />
                          <div className="flex flex-col">
                            <span className="font-medium">{cat.label}</span>
                            <span className="text-xs text-gray-500">{cat.description}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-gray-700 pt-4">
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
                        onClick={async () => {
                          try {
                            await apiRequest('POST', '/api/auth/logout');
                            queryClient.setQueryData(['/api/auth/user'], null);
                            queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
                            safeStorage.removeItem('tcr-user');
                          } catch (error) {
                            console.error('Logout error:', error);
                            queryClient.setQueryData(['/api/auth/user'], null);
                            safeStorage.removeItem('tcr-user');
                          } finally {
                          window.location.href = getBasePath();
                          }
                        }}
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
      </div>
      {/* Active Category Indicator Line */}
      <div className="relative h-px bg-border/20">
        <div
          className={cn(
            "absolute h-px bg-gradient-to-r transition-all duration-500 opacity-60",
            categories.find(cat => cat.id === activeCategory)?.gradient || "from-pink-500 to-purple-500"
          )}
          style={{
            width: `${(categories.findIndex(cat => cat.id === activeCategory) + 1) / categories.length * 100}%`,
            left: `${categories.findIndex(cat => cat.id === activeCategory) / categories.length * 100}%`,
          }}
        />
      </div>
    </header>
  );
}
