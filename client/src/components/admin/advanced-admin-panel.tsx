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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Star, Users, Settings, Music, MapPin, Calendar, 
  Eye, BarChart, RefreshCw, Trash2, Plus, Edit,
  Shield, Database, Globe, Palette, Code,
  Bell, Lock, Activity, TrendingUp, FileText,
  Zap, Target, Filter, Archive
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { feedService, type FeedSource } from "@/services/feedService";

interface AdminConfig {
  id: string;
  section: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  category: string;
}

interface FeedSettings {
  enabled: boolean;
  refreshInterval: number;
  maxItems: number;
  sources: string[];
  categories: string[];
  moderation: boolean;
}

export default function AdvancedAdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("spotlight");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");

  // Data queries
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: adminConfigs } = useQuery<AdminConfig[]>({
    queryKey: ['/api/admin/configs'],
  });

  const { data: systemStats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: feedSettings } = useQuery<Record<string, FeedSettings>>({
    queryKey: ['/api/admin/feed-settings'],
  });

  // Mutations
  const updateConfigMutation = useMutation({
    mutationFn: async ({ section, key, value }: { section: string; key: string; value: any }) => {
      return apiRequest('PUT', `/api/admin/configs/${section}/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/configs'] });
      toast({ title: "Configuration updated successfully" });
    },
  });

  const updateFeedSettingsMutation = useMutation({
    mutationFn: async ({ section, settings }: { section: string; settings: FeedSettings }) => {
      return apiRequest('PUT', `/api/admin/feed-settings/${section}`, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feed-settings'] });
      toast({ title: "Feed settings updated successfully" });
    },
  });

  const bulkUserActionMutation = useMutation({
    mutationFn: async ({ action, userIds }: { action: string; userIds: string[] }) => {
      return apiRequest('POST', '/api/admin/bulk-actions', { action, userIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setSelectedUsers([]);
      toast({ title: "Bulk action completed successfully" });
    },
  });

  const refreshDataMutation = useMutation({
    mutationFn: async (section: string) => {
      return apiRequest('POST', `/api/admin/refresh/${section}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({ title: "Data refreshed successfully" });
    },
  });

  // Helper functions
  const getSectionStats = (section: string) => {
    return systemStats?.[section] || {};
  };

  const getSectionConfig = (section: string) => {
    return adminConfigs?.filter(config => config.section === section) || [];
  };

  const getSectionFeedSettings = (section: string): FeedSettings => {
    return feedSettings?.[section] || {
      enabled: true,
      refreshInterval: 300,
      maxItems: section === 'spotlight' ? 8 : 50,
      sources: [],
      categories: [],
      moderation: true
    };
  };

  // Section configurations
  const adminSections = [
    {
      id: "spotlight",
      name: "Spotlight",
      icon: Star,
      color: "from-purple-500 to-pink-500",
      description: "Manage featured content and trending articles"
    },
    {
      id: "community",
      name: "Community",
      icon: Users,
      color: "from-green-500 to-emerald-500",
      description: "User management and community moderation"
    },
    {
      id: "music",
      name: "Music Feed",
      icon: Music,
      color: "from-blue-500 to-cyan-500",
      description: "Music news and artist content management"
    },
    {
      id: "guides",
      name: "Guides",
      icon: MapPin,
      color: "from-green-500 to-emerald-500",
      description: "Tutorial and guide content curation"
    },
    {
      id: "industry",
      name: "Industry",
      icon: Settings,
      color: "from-orange-500 to-red-500",
      description: "Industry news and professional content"
    },
    {
      id: "gigs",
      name: "Gigs",
      icon: Calendar,
      color: "from-indigo-500 to-purple-500",
      description: "Event management and gig curation"
    },
    {
      id: "system",
      name: "System",
      icon: Database,
      color: "from-gray-500 to-slate-500",
      description: "Core system settings and platform configuration"
    }
  ];

  // Component for section stats
  const SectionStats = ({ section }: { section: string }) => {
    const stats = getSectionStats(section);
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Views</p>
                <p className="text-lg font-semibold">{stats.views || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-lg font-semibold">{stats.active || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Trending</p>
                <p className="text-lg font-semibold">{stats.trending || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">{stats.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Component for feed settings
  const FeedSettingsPanel = ({ section }: { section: string }) => {
    const settings = getSectionFeedSettings(section);
    const [localSettings, setLocalSettings] = useState<FeedSettings>(settings);

    const handleSave = () => {
      updateFeedSettingsMutation.mutate({ section, settings: localSettings });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Feed Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Feed</Label>
              <p className="text-sm text-muted-foreground">
                Toggle this section's feed on/off
              </p>
            </div>
            <Switch
              checked={localSettings.enabled}
              onCheckedChange={(enabled) => 
                setLocalSettings(prev => ({ ...prev, enabled }))
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Refresh Interval (seconds)</Label>
            <Input
              type="number"
              value={localSettings.refreshInterval}
              onChange={(e) => 
                setLocalSettings(prev => ({ 
                  ...prev, 
                  refreshInterval: parseInt(e.target.value) || 300 
                }))
              }
              min="60"
              max="3600"
            />
          </div>

          <div className="space-y-2">
            <Label>Maximum Items</Label>
            <Input
              type="number"
              value={localSettings.maxItems}
              onChange={(e) =>
                setLocalSettings(prev => ({
                  ...prev,
                  maxItems: parseInt(e.target.value) || prev.maxItems
                }))
              }
              min={section === 'spotlight' ? 1 : 10}
              max={section === 'spotlight' ? 8 : 200}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Content Moderation</Label>
              <p className="text-sm text-muted-foreground">
                Enable AI-powered content filtering
              </p>
            </div>
            <Switch
              checked={localSettings.moderation}
              onCheckedChange={(moderation) => 
                setLocalSettings(prev => ({ ...prev, moderation }))
              }
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSave} className="flex-1">
              Save Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => refreshDataMutation.mutate(section)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Component for configuration settings
  const ConfigPanel = ({ section }: { section: string }) => {
    const configs = getSectionConfig(section);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Advanced Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configs.map((config) => (
              <div key={config.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{config.key.replace(/_/g, ' ').toUpperCase()}</Label>
                    <p className="text-xs text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                  <Badge variant="outline">{config.type}</Badge>
                </div>
                
                {config.type === 'boolean' ? (
                  <Switch
                    checked={config.value === 'true'}
                    onCheckedChange={(checked) => 
                      updateConfigMutation.mutate({
                        section,
                        key: config.key,
                        value: checked.toString()
                      })
                    }
                  />
                ) : config.type === 'number' ? (
                  <Input
                    type="number"
                    value={config.value}
                    onChange={(e) => 
                      updateConfigMutation.mutate({
                        section,
                        key: config.key,
                        value: e.target.value
                      })
                    }
                  />
                ) : (
                  <Input
                    value={config.value}
                    onChange={(e) => 
                      updateConfigMutation.mutate({
                        section,
                        key: config.key,
                        value: e.target.value
                      })
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const CustomFeedManager = ({ section }: { section: string }) => {
    const { data: feeds = [], refetch } = useQuery({
      queryKey: ['/api/admin/custom-feeds'],
    });
    const addFeedMutation = useMutation({
      mutationFn: async (feed: FeedSource) => {
        return apiRequest('POST', '/api/admin/custom-feeds', feed);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-feeds'] });
        feedService.refreshCustomSources();
        toast({ title: 'Feed added successfully' });
      }
    });
    const [newFeed, setNewFeed] = useState<FeedSource>({
      url: '',
      name: '',
      website: '',
      category: section as any,
      description: ''
    });

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Custom RSS Feeds</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input placeholder="Feed URL" value={newFeed.url} onChange={e => setNewFeed(prev => ({ ...prev, url: e.target.value }))} />
            <Input placeholder="Name" value={newFeed.name} onChange={e => setNewFeed(prev => ({ ...prev, name: e.target.value }))} />
            <Input placeholder="Website" value={newFeed.website} onChange={e => setNewFeed(prev => ({ ...prev, website: e.target.value }))} />
            <Textarea placeholder="Description" value={newFeed.description} onChange={e => setNewFeed(prev => ({ ...prev, description: e.target.value }))} />
          </div>
          <Button onClick={() => addFeedMutation.mutate(newFeed)}>Add Feed</Button>

          <Separator />

          <div className="space-y-1">
            {feeds.map((f: FeedSource, idx: number) => (
              <div key={idx} className="text-sm">{f.name} - {f.url}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Advanced Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Comprehensive platform management and configuration
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Backup
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
          {adminSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-transparent data-[state=active]:to-transparent data-[state=active]:text-foreground"
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{section.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Contents */}
        {adminSections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={cn(
                "p-3 rounded-lg bg-gradient-to-r",
                section.color
              )}>
                <section.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{section.name} Management</h2>
                <p className="text-muted-foreground">{section.description}</p>
              </div>
            </div>

            <SectionStats section={section.id} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FeedSettingsPanel section={section.id} />
              <ConfigPanel section={section.id} />
              <CustomFeedManager section={section.id} />
            </div>

            {section.id === 'community' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!bulkAction || selectedUsers.length === 0}
                        onClick={() =>
                          bulkUserActionMutation.mutate({
                            action: bulkAction,
                            userIds: selectedUsers,
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Bulk Actions
                      </Button>
                      <Select value={bulkAction} onValueChange={setBulkAction}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="suspend">Suspend Users</SelectItem>
                          <SelectItem value="activate">Activate Users</SelectItem>
                          <SelectItem value="delete">Delete Users</SelectItem>
                          <SelectItem value="verify">Verify Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Select</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.slice(0, 5).map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers(prev => [...prev, user.id]);
                                  } else {
                                    setSelectedUsers(prev => prev.filter(id => id !== user.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{user.username}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.isSuspended ? "destructive" : "default"}>
                                {user.isSuspended ? "Suspended" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {user.isAdmin ? "Admin" : "User"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
