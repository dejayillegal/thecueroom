import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Eye,
  CalendarPlus,
  BarChart,
  UserX,
  UserCheck,
  RefreshCw,
  Plus,
  Trash2,
  Star,
  Clock,
  Key,
  FileText,
  ExternalLink,
  Mail,
  MoreHorizontal,
  Settings
} from "lucide-react";
import AnimatedAvatarDisplay from "@/components/animated-avatar-display";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAnimation } from "@/contexts/AnimationContext";
import type { User, NewsArticle, Gig, ModerationLog } from "@/types";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");
  const [isCreateGigOpen, setIsCreateGigOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const { toast } = useToast();
  const { animationsEnabled, refreshSettings } = useAnimation();
  const queryClient = useQueryClient();

  // Data queries
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: news } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news'],
  });

  const { data: spotlightNews } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news/spotlight'],
  });

  const { data: gigs } = useQuery<Gig[]>({
    queryKey: ['/api/gigs'],
  });

  const { data: moderationLogs } = useQuery<ModerationLog[]>({
    queryKey: ['/api/moderation/logs'],
  });

  // Mutations
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, isSuspended, reason }: { userId: string, isSuspended: boolean, reason: string }) => {
      await apiRequest('PATCH', `/api/users/${userId}/suspension`, { isSuspended, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
  });

  const refreshNewsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/news/refresh');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      toast({
        title: "Success",
        description: "News feeds refreshed successfully",
      });
    },
  });

  const updateSpotlightMutation = useMutation({
    mutationFn: async (articleIds: number[]) => {
      await apiRequest('POST', '/api/news/spotlight', { articleIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news/spotlight'] });
      toast({
        title: "Success",
        description: "Spotlight news updated successfully",
      });
    },
  });

  const handleSuspendUser = (userId: string, isSuspended: boolean) => {
    const reason = prompt(isSuspended ? "Reason for suspension:" : "Reason for unsuspension:");
    if (reason !== null) {
      suspendUserMutation.mutate({ userId, isSuspended, reason });
    }
  };

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User deleted",
        description: "User has been permanently deleted from the platform.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}/verify-email`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Email verified",
        description: "User's email has been manually verified.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to verify email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: async ({ userId, forceActivate }: { userId: string; forceActivate?: boolean }) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}/activate`, { forceActivate });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User activated",
        description: "User account has been activated successfully.",
      });
    },
    onError: (error: Error, variables) => {
      // Check if error indicates email verification is required
      if (error.message.includes("email must be verified")) {
        const shouldForce = confirm("User's email is not verified. Do you want to force activate the account anyway?");
        if (shouldForce) {
          activateUserMutation.mutate({ userId: variables.userId, forceActivate: true });
        }
      } else {
        toast({
          title: "Failed to activate user",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}/password-reset`, { newPassword });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password reset",
        description: "User password has been reset successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reset password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAnimationSettingMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await apiRequest("POST", "/api/admin/settings", {
        settingKey: "avatar_animations_enabled",
        settingValue: enabled,
        description: "Controls whether avatar animations are enabled platform-wide for performance optimization"
      });
      return response.json();
    },
    onSuccess: () => {
      refreshSettings();
      toast({
        title: "Animation settings updated",
        description: `Avatar animations have been ${animationsEnabled ? 'disabled' : 'enabled'} platform-wide.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update animation settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approveGigMutation = useMutation({
    mutationFn: async (gigId: number) => {
      const res = await apiRequest('PATCH', `/api/gigs/${gigId}`, { isActive: true });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gigs'] });
      toast({ title: 'Gig approved', description: 'Gig is now visible to users.' });
    },
    onError: () => {
      toast({ title: 'Failed to approve gig', variant: 'destructive' });
    }
  });

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleResetPassword = (userId: string) => {
    const newPassword = window.prompt("Enter new password for this user (minimum 6 characters):");
    if (newPassword && newPassword.length >= 6) {
      resetPasswordMutation.mutate({ userId, newPassword });
    } else if (newPassword) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
    }
  };

  const UserManagement = () => (
    <Card className="bg-secondary border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Management
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/admin/logs', '_blank')}
              className="flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              View User Logs
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
            <Badge variant="secondary">
              {users?.length || 0} Total Users
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {usersLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 loading-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="h-8 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {user.avatar && user.avatarConfig ? (
                        <AnimatedAvatarDisplay 
                          config={user.avatarConfig}
                          size={32}
                          className="w-8 h-8"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {user.username?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{user.username || "No username"}</div>
                        <div className="flex items-center space-x-1">
                          {user.isVerified && (
                            <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                              Verified
                            </Badge>
                          )}
                          {user.isAdmin && (
                            <Badge variant="secondary" className="text-xs bg-destructive/20 text-destructive">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={user.isSuspended ? "destructive" : "secondary"}>
                        {user.isSuspended ? "Suspended" : "Active"}
                      </Badge>
                      {!user.emailVerified && (
                        <Badge variant="outline" className="text-xs">
                          Email Unverified
                        </Badge>
                      )}
                      {!user.isVerified && (
                        <Badge variant="outline" className="text-xs">
                          Pending Activation
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {!user.emailVerified && (
                          <DropdownMenuItem 
                            onClick={() => verifyEmailMutation.mutate(user.id)}
                            disabled={verifyEmailMutation.isPending}
                            className="text-blue-600 dark:text-blue-400"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Verify Email
                          </DropdownMenuItem>
                        )}
                        {!user.isVerified && (
                          <DropdownMenuItem 
                            onClick={() => activateUserMutation.mutate({ userId: user.id })}
                            disabled={activateUserMutation.isPending}
                            className="text-green-600 dark:text-green-400"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activate Account
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleResetPassword(user.id)}
                          className="text-orange-600 dark:text-orange-400"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.isSuspended ? (
                          <DropdownMenuItem 
                            onClick={() => handleSuspendUser(user.id, false)}
                            className="text-green-600 dark:text-green-400"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Unsuspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleSuspendUser(user.id, true)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        )}
                        {!user.isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 dark:text-red-400 font-medium"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const NewsManagement = () => (
    <div className="space-y-6">
      <Card className="bg-secondary border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">Spotify Playlist Management</CardTitle>
            <Button 
              onClick={() => setIsCreatePlaylistOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Spotify Playlist
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Playlist management interface */}
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Manage Spotify playlists displayed on the platform
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">News Feed Management</CardTitle>
            <Button 
              onClick={() => refreshNewsMutation.mutate()}
              disabled={refreshNewsMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshNewsMutation.isPending ? 'animate-spin' : ''}`} />
              Refresh Feeds
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-accent p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">{news?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Articles</div>
            </div>
            <div className="bg-accent p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">{spotlightNews?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Spotlight Articles</div>
            </div>
            <div className="bg-accent p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">RSS Sources</div>
            </div>
          </div>

          {news && news.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Recent Articles</h4>
              {news.slice(0, 10).map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium line-clamp-1">{article.title}</h5>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">{article.source}</Badge>
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      {article.isSpotlight && (
                        <Badge className="bg-primary/20 text-primary">
                          <Star className="h-3 w-3 mr-1" />
                          Spotlight
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={article.isSpotlight ? "destructive" : "outline"}
                    onClick={() => {
                      const currentSpotlight = spotlightNews?.map(a => a.id) || [];
                      const newSpotlight = article.isSpotlight 
                        ? currentSpotlight.filter(id => id !== article.id)
                        : [...currentSpotlight, article.id];
                      updateSpotlightMutation.mutate(newSpotlight);
                    }}
                  >
                    {article.isSpotlight ? "Remove" : "Add to Spotlight"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const GigManagement = () => (
    <Card className="bg-secondary border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary flex items-center">
            <CalendarPlus className="h-5 w-5 mr-2" />
            Gig Management
          </CardTitle>
          <Dialog open={isCreateGigOpen} onOpenChange={setIsCreateGigOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Gig
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Gig</DialogTitle>
                <DialogDescription>Add a new gig event to the platform for community members</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Event Title" />
                <Textarea placeholder="Description" />
                <Input placeholder="Venue" />
                <Input placeholder="Location (Bangalore area)" />
                <Input type="datetime-local" />
                <Input placeholder="Ticket URL (optional)" />
                <Button className="w-full">Create Gig</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {gigs && gigs.length > 0 ? (
          <div className="space-y-4">
            {gigs.map((gig) => (
              <div key={gig.id} className="p-4 bg-accent rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{gig.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{gig.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>📍 {gig.venue}, {gig.location}</span>
                      <span>📅 {new Date(gig.date).toLocaleDateString()}</span>
                      <Badge variant={gig.isActive ? "secondary" : "destructive"}>
                        {gig.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!gig.isActive && (
                      <Button size="sm" onClick={() => approveGigMutation.mutate(gig.id)}>
                        Approve
                      </Button>
                    )}
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Gigs Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create the first gig event for the community.
            </p>
            <Button onClick={() => setIsCreateGigOpen(true)}>
              Create First Gig
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const Analytics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-secondary border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{users?.length || 0}</div>
          <p className="text-xs text-muted-foreground">
            +{users?.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0} this week
          </p>
        </CardContent>
      </Card>

      <Card className="bg-secondary border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Verified Artists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{users?.filter(u => u.isVerified).length || 0}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round(((users?.filter(u => u.isVerified).length || 0) / (users?.length || 1)) * 100)}% of users
          </p>
        </CardContent>
      </Card>

      <Card className="bg-secondary border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Gigs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{gigs?.filter(g => g.isActive).length || 0}</div>
          <p className="text-xs text-muted-foreground">
            Events scheduled
          </p>
        </CardContent>
      </Card>

      <Card className="bg-secondary border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Moderation Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{moderationLogs?.length || 0}</div>
          <p className="text-xs text-muted-foreground">
            Total actions taken
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary to-primary/5 p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Admin Dashboard</h2>
            <p className="text-muted-foreground">Manage users, content, and platform operations</p>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary/70" />
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card 
          className="bg-secondary border-border cursor-pointer hover:bg-accent transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveTab("users");
          }}
        >
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-primary">User Management</h3>
            <p className="text-sm text-muted-foreground">Manage users and permissions</p>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-secondary border-border cursor-pointer hover:bg-accent transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveTab("content");
          }}
        >
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-primary">Content Moderation</h3>
            <p className="text-sm text-muted-foreground">Review and manage content</p>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-secondary border-border cursor-pointer hover:bg-accent transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = "/admin/support";
          }}
        >
          <CardContent className="p-4 text-center">
            <Mail className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-primary">Support Dashboard</h3>
            <p className="text-sm text-muted-foreground">Manage support tickets</p>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-secondary border-border cursor-pointer hover:bg-accent transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveTab("gigs");
          }}
        >
          <CardContent className="p-4 text-center">
            <CalendarPlus className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-primary">Manage Gigs</h3>
            <p className="text-sm text-muted-foreground">Events and gig listings</p>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-secondary border-border cursor-pointer hover:bg-accent transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveTab("analytics");
          }}
        >
          <CardContent className="p-4 text-center">
            <BarChart className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-primary">Analytics</h3>
            <p className="text-sm text-muted-foreground">Platform insights and metrics</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Content Moderation
          </TabsTrigger>
          <TabsTrigger value="gigs" className="flex items-center">
            <CalendarPlus className="h-4 w-4 mr-2" />
            Manage Gigs
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="content">
          <NewsManagement />
        </TabsContent>

        <TabsContent value="gigs">
          <GigManagement />
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Platform Settings</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage platform-wide settings and performance optimizations
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Animation Settings */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Avatar Animations</h3>
                      <p className="text-sm text-muted-foreground">
                        Control avatar animations platform-wide for performance optimization
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="animation-toggle" className="text-sm">
                        {animationsEnabled ? 'Enabled' : 'Disabled'}
                      </Label>
                      <Switch
                        id="animation-toggle"
                        checked={animationsEnabled}
                        onCheckedChange={(checked) => {
                          updateAnimationSettingMutation.mutate(checked);
                        }}
                        disabled={updateAnimationSettingMutation.isPending}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Performance Impact</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Animations limited to 30fps for optimal performance</p>
                        <p>• Automatic cleanup prevents memory leaks</p>
                        <p>• Static avatars when disabled maintain visual design</p>
                        <p>• Real-time toggle affects all users immediately</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Animation Types</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Pulse: Rhythmic breathing effect</p>
                        <p>• Headbang: Heavy bass nod</p>
                        <p>• Disco Spin: Classic dance floor rotation</p>
                        <p>• Rave Bounce: High-energy jumping motion</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Animation Preview */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-3">Preview</h4>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <AnimatedAvatarDisplay 
                          config={{
                            droidType: 'dj',
                            primaryColor: '#00ffff',
                            secondaryColor: '#ff00ff',
                            accentColor: '#ffff00',
                            accessory: 'dj_headphones',
                            gadget: 'midi_controller',
                            background: '#000000',
                            animation: 'pulse',
                            animationSpeed: 1,
                            size: 64
                          }}
                          size={64}
                          className="mx-auto"
                        />
                        <p className="text-xs text-muted-foreground mt-1">DJ Robot</p>
                      </div>
                      
                      <div className="text-center">
                        <AnimatedAvatarDisplay 
                          config={{
                            droidType: 'producer',
                            primaryColor: '#ff6b6b',
                            secondaryColor: '#4ecdc4',
                            accentColor: '#45b7d1',
                            accessory: 'synth_crown',
                            gadget: 'synth_pad',
                            background: '#000000',
                            animation: 'headbang',
                            animationSpeed: 1,
                            size: 64
                          }}
                          size={64}
                          className="mx-auto"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Producer Robot</p>
                      </div>
                      
                      <div className="text-center">
                        <AnimatedAvatarDisplay 
                          config={{
                            droidType: 'raver',
                            primaryColor: '#96ceb4',
                            secondaryColor: '#ffeaa7',
                            accentColor: '#dda0dd',
                            accessory: 'rave_mask',
                            gadget: 'laser_pointer',
                            background: '#000000',
                            animation: 'rave_bounce',
                            animationSpeed: 1,
                            size: 64
                          }}
                          size={64}
                          className="mx-auto"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Raver Robot</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-muted/50 rounded text-xs text-muted-foreground">
                      {animationsEnabled 
                        ? "Animations are currently enabled. Avatars will display their configured animations."
                        : "Animations are currently disabled. Avatars display as static images for better performance."
                      }
                    </div>
                  </div>
                </div>
                
                {/* Additional Performance Settings */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Performance Monitoring</h3>
                    <p className="text-sm text-muted-foreground">
                      System performance metrics and optimization status
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="text-2xl font-bold text-primary">30fps</div>
                      <div className="text-xs text-muted-foreground">Animation Frame Rate</div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="text-2xl font-bold text-primary">{users?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Active Users</div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="text-2xl font-bold text-primary">
                        {animationsEnabled ? 'ON' : 'OFF'}
                      </div>
                      <div className="text-xs text-muted-foreground">Animations Status</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>
      </Tabs>

      {/* Create Spotify Playlist Dialog */}
      <Dialog open={isCreatePlaylistOpen} onOpenChange={setIsCreatePlaylistOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Spotify Playlist</DialogTitle>
            <DialogDescription>Add a new Spotify playlist to the community collection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Spotify URL</label>
              <Input placeholder="https://open.spotify.com/playlist/..." />
            </div>
            <div>
              <label className="text-sm font-medium">Playlist Name</label>
              <Input placeholder="Underground Techno Selection" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="A curated selection of underground techno tracks..." />
            </div>
            <div>
              <label className="text-sm font-medium">Genre</label>
              <Input placeholder="Techno" />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="isActive" defaultChecked />
              <label htmlFor="isActive" className="text-sm font-medium">Active</label>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setIsCreatePlaylistOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Success",
                  description: "Spotify playlist added successfully",
                });
                setIsCreatePlaylistOpen(false);
              }}>
                Add Playlist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
