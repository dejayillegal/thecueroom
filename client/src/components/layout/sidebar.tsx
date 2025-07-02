import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Laugh, 
  UserCog, 
  Calendar, 
  Mail, 
  Users,
  Bot,
  Shield,
  BarChart,
  Eye,
  CalendarPlus,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@/types";

export default function Sidebar() {
  const { user } = useAuth();

  // Get actual users data for admins only
  const { data: users } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const QuickActions = () => (
    <Card className="bg-secondary border-border">
      <CardHeader>
        <CardTitle className="text-primary">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start border-accent hover:bg-primary hover:text-primary-foreground"
        >
          <Laugh className="mr-3 h-4 w-4" />
          Generate AI Meme
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start border-accent hover:bg-primary hover:text-primary-foreground"
        >
          <UserCog className="mr-3 h-4 w-4" />
          Customize Avatar
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start border-accent hover:bg-primary hover:text-primary-foreground"
        >
          <Calendar className="mr-3 h-4 w-4" />
          View Gigs
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start border-accent hover:bg-primary hover:text-primary-foreground"
        >
          <Mail className="mr-3 h-4 w-4" />
          Newsletter Settings
        </Button>
      </CardContent>
    </Card>
  );

  const CommunityStats = () => (
    <Card className="bg-secondary border-border">
      <CardHeader>
        <CardTitle className="text-primary">Community Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Artists</span>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {users?.length || 0}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Verified Artists</span>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {users?.filter(u => u.isVerified).length || 0}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Platform Scope</span>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            India-wide
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const AdminPanel = () => {
    if (!user?.isAdmin) return null;

    return (
      <Card className="bg-gradient-to-br from-destructive/10 to-secondary border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Admin Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Users className="mr-3 h-4 w-4" />
            User Management
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Eye className="mr-3 h-4 w-4" />
            Content Moderation
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <CalendarPlus className="mr-3 h-4 w-4" />
            Manage Gigs
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <BarChart className="mr-3 h-4 w-4" />
            Analytics
          </Button>
        </CardContent>
      </Card>
    );
  };

  const BotStatus = () => (
    <Card className="bg-secondary border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center text-sm">
          <Bot className="mr-2 h-4 w-4" />
          TheCueRoom Bot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">Online</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Monitoring content • Auto-moderation active
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <QuickActions />
      <CommunityStats />
      <AdminPanel />
      <BotStatus />
    </div>
  );
}
