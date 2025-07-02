import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Trash2, 
  Settings, 
  Clock, 
  Database, 
  HardDrive, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";

interface ContentSettings {
  autoDeleteEnabled: boolean;
  newsRetentionDays: number;
  postsRetentionDays: number;
  memesRetentionDays: number;
  imagesRetentionDays: number;
  lastCleanup: string | null;
  storageThresholdMB: number;
  autoCleanupEnabled: boolean;
}

interface StorageStats {
  totalUsed: number;
  newsCount: number;
  postsCount: number;
  memesCount: number;
  imagesCount: number;
  oldestContent: string;
}

export default function AdminContentManager() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/content-settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/content-settings');
      return await response.json();
    }
  });

  const { data: storageStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/admin/storage-stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/storage-stats');
      return await response.json();
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<ContentSettings>) => {
      const response = await apiRequest('PUT', '/api/admin/content-settings', newSettings);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-settings'] });
      toast({
        title: "Settings updated",
        description: "Content management settings have been saved"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const cleanupContentMutation = useMutation({
    mutationFn: async (options: { type: string; days?: number; force?: boolean }) => {
      setIsProcessing(true);
      const response = await apiRequest('POST', '/api/admin/cleanup-content', options);
      return await response.json();
    },
    onSuccess: (data) => {
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-settings'] });
      toast({
        title: "Cleanup completed",
        description: `Removed ${data.deleted} items, freed ${data.freedMB}MB of storage`
      });
      setIsProcessing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Cleanup failed",
        description: error.message,
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  });

  const handleSettingChange = (key: keyof ContentSettings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const runCleanup = (type: string, days?: number) => {
    cleanupContentMutation.mutate({ type, days });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageWarningLevel = (usedMB: number, thresholdMB: number) => {
    const percentage = (usedMB / thresholdMB) * 100;
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
        <span className="ml-2 text-white">Loading settings...</span>
      </div>
    );
  }

  const warningLevel = storageStats ? getStorageWarningLevel(storageStats.totalUsed, settings?.storageThresholdMB || 1000) : 'normal';

  return (
    <div className="space-y-6">
      
      {/* Storage Overview */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-400" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {storageStats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {formatFileSize(storageStats.totalUsed * 1024 * 1024)}
                  </div>
                  <div className="text-sm text-gray-400">Total Used</div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{storageStats.newsCount}</div>
                  <div className="text-sm text-gray-400">News Articles</div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{storageStats.postsCount}</div>
                  <div className="text-sm text-gray-400">Community Posts</div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{storageStats.memesCount}</div>
                  <div className="text-sm text-gray-400">Memes</div>
                </div>
              </div>

              {warningLevel !== 'normal' && (
                <div className={`p-4 rounded-lg border-l-4 ${
                  warningLevel === 'critical' 
                    ? 'bg-red-900/20 border-red-400' 
                    : 'bg-yellow-900/20 border-yellow-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-5 h-5 ${
                      warningLevel === 'critical' ? 'text-red-400' : 'text-yellow-400'
                    }`} />
                    <span className="text-white font-medium">
                      {warningLevel === 'critical' ? 'Critical Storage Warning' : 'Storage Warning'}
                    </span>
                  </div>
                  <p className="text-gray-300 mt-1">
                    Storage usage is high. Consider running cleanup or increasing retention settings.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Auto-Cleanup Settings */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Auto-Cleanup Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Master Switch */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <Label className="text-white font-medium">Enable Auto-Cleanup</Label>
              <p className="text-sm text-gray-400">Automatically delete old content to save storage</p>
            </div>
            <Switch
              checked={settings?.autoDeleteEnabled || false}
              onCheckedChange={(checked) => handleSettingChange('autoDeleteEnabled', checked)}
            />
          </div>

          {settings?.autoDeleteEnabled && (
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Retention Settings */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Retention Periods (Days)
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-white text-sm">News Articles</Label>
                    <Input
                      type="number"
                      value={settings?.newsRetentionDays || 30}
                      onChange={(e) => handleSettingChange('newsRetentionDays', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white mt-1"
                      min="1"
                      max="365"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white text-sm">Community Posts</Label>
                    <Input
                      type="number"
                      value={settings?.postsRetentionDays || 90}
                      onChange={(e) => handleSettingChange('postsRetentionDays', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white mt-1"
                      min="1"
                      max="365"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white text-sm">Memes</Label>
                    <Input
                      type="number"
                      value={settings?.memesRetentionDays || 60}
                      onChange={(e) => handleSettingChange('memesRetentionDays', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white mt-1"
                      min="1"
                      max="365"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white text-sm">Uploaded Images</Label>
                    <Input
                      type="number"
                      value={settings?.imagesRetentionDays || 120}
                      onChange={(e) => handleSettingChange('imagesRetentionDays', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white mt-1"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
              </div>

              {/* Storage Threshold */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-400" />
                  Storage Management
                </h4>
                
                <div>
                  <Label className="text-white text-sm">Storage Threshold (MB)</Label>
                  <Input
                    type="number"
                    value={settings?.storageThresholdMB || 1000}
                    onChange={(e) => handleSettingChange('storageThresholdMB', parseInt(e.target.value))}
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    min="100"
                    max="10000"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Trigger warnings when storage exceeds this limit
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <Label className="text-white text-sm">Auto-cleanup on threshold</Label>
                    <p className="text-xs text-gray-400">Automatically clean when threshold is reached</p>
                  </div>
                  <Switch
                    checked={settings?.autoCleanupEnabled || false}
                    onCheckedChange={(checked) => handleSettingChange('autoCleanupEnabled', checked)}
                  />
                </div>

                {settings?.lastCleanup && (
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Last cleanup: {new Date(settings.lastCleanup).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Cleanup Actions */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-400" />
            Manual Cleanup Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => runCleanup('news')}
              disabled={isProcessing}
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
            >
              {isProcessing ? 'Processing...' : 'Cleanup Old News'}
            </Button>
            
            <Button
              onClick={() => runCleanup('posts')}
              disabled={isProcessing}
              variant="outline"
              className="border-green-600 text-green-400 hover:bg-green-900/20"
            >
              {isProcessing ? 'Processing...' : 'Cleanup Old Posts'}
            </Button>
            
            <Button
              onClick={() => runCleanup('memes')}
              disabled={isProcessing}
              variant="outline"
              className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
            >
              {isProcessing ? 'Processing...' : 'Cleanup Old Memes'}
            </Button>
            
            <Button
              onClick={() => runCleanup('images')}
              disabled={isProcessing}
              variant="outline"
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
            >
              {isProcessing ? 'Processing...' : 'Cleanup Orphaned Images'}
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <Button
              onClick={() => runCleanup('all', undefined, true)}
              disabled={isProcessing}
              variant="destructive"
              className="w-full"
            >
              {isProcessing ? 'Processing Full Cleanup...' : 'Run Full Storage Cleanup'}
            </Button>
            <p className="text-xs text-gray-400 text-center mt-2">
              This will remove all content older than configured retention periods
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}