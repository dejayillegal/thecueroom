import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  Menu, 
  User, 
  Settings, 
  LogOut,
  Shield,
  Home,
  Newspaper,
  Laugh,
  Calendar,
  ListMusic
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notifications] = useState(0); // Real notification count

  const navigationItems = [
    { href: "/", label: "Feed", icon: Home },
    { href: "/news", label: "News", icon: Newspaper },
    { href: "/memes", label: "Memes", icon: Laugh },
    { href: "/gigs", label: "Gigs", icon: Calendar },
    { href: "/playlists", label: "Playlists", icon: ListMusic },
  ];

  const NavLinks = ({ mobile = false }) => (
    <div className={`${mobile ? 'flex flex-col space-y-4' : 'hidden md:flex items-center space-x-6'}`}>
      {navigationItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <span className={`flex items-center space-x-2 text-sm transition-colors cursor-pointer ${
            location === item.href 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-primary'
          }`}>
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <nav className="bg-secondary border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/">
            <span className="cursor-pointer">
              <Logo />
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavLinks />

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => {
              // TODO: Implement search functionality
              toast({
                title: "Search Feature",
                description: "Search functionality will be available soon",
                variant: "default",
              });
            }}>
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>

            {/* User Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <div className="relative w-8 h-8">
                    {user?.avatar && user?.avatarConfig ? (
                      <div className="relative">
                        <AnimatedAvatarDisplay 
                          config={user.avatarConfig}
                          size={32}
                          className="w-8 h-8"
                        />
                        {user.avatarConfig?.animation !== 'none' && (
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        )}
                      </div>
                    ) : (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.profileImageUrl || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.username || "Artist"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/admin'} className="text-destructive">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    // Clear auth cache and redirect
                    queryClient.setQueryData(['/api/auth/user'], null);
                    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
                    window.location.href = '/'; // Force full page reload
                  } catch (error) {
                    console.error('Logout error:', error);
                    // Clear auth cache even on error
                    queryClient.setQueryData(['/api/auth/user'], null);
                    window.location.href = '/';
                  }
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-6 mt-6">
                  <NavLinks mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
