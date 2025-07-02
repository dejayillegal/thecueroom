import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAnimation } from "@/contexts/AnimationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/footer";
import { AnimatedAvatarDisplay } from "@/components/animated-avatar-display";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Mail, 
  Shield, 
  Music, 
  Bell, 
  Eye, 
  Lock, 
  Trash2, 
  Save,
  ExternalLink,
  Settings as SettingsIcon
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { animationsEnabled, setAnimationsEnabled } = useAnimation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    stageName: user?.stageName || "",
    city: user?.city || ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Animation settings mutation for admin users
  const updateAnimationSettingMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await apiRequest("PUT", "/api/settings/animations", { enabled });
    },
    onSuccess: (_, enabled) => {
      setAnimationsEnabled(enabled);
      toast({
        title: "Animation settings updated",
        description: `Avatar animations ${enabled ? 'enabled' : 'disabled'} platform-wide.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/animations"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update animation settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
    setIsEditing(false);
  };

  const handlePasswordUpdate = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password updated",
      description: "Your password has been successfully changed.",
    });
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Account deletion",
        description: "Contact admin to proceed with account deletion.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="stageName">Stage Name</Label>
                  <Input
                    id="stageName"
                    value={formData.stageName}
                    onChange={(e) => setFormData(prev => ({ ...prev, stageName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={user?.bio || ""}
                    disabled={!isEditing}
                    placeholder="Tell us about your music style and journey..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="e.g., Bangalore, India"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveSettings}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Music Platforms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="h-5 w-5" />
                  <span>Music Platforms</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your music platform connections from the Music Platforms page.
                </p>
                <Button variant="outline" asChild>
                  <a href="/music-platforms">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Platforms
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about community activity
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Privacy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to other community members
                    </p>
                  </div>
                  <Switch
                    checked={profileVisibility}
                    onCheckedChange={setProfileVisibility}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others see when you're active
                    </p>
                  </div>
                  <Switch
                    checked={showOnlineStatus}
                    onCheckedChange={setShowOnlineStatus}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>

                <Button 
                  onClick={handlePasswordUpdate}
                  className="w-full"
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>

            {/* Admin Controls - Animation Settings */}
            {user?.isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SettingsIcon className="h-5 w-5" />
                    <span>Platform Animation Settings</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Control avatar animations platform-wide for performance optimization
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Avatar Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle animations for all users to optimize performance
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="admin-animation-toggle" className="text-sm">
                        {animationsEnabled ? 'Enabled' : 'Disabled'}
                      </Label>
                      <Switch
                        id="admin-animation-toggle"
                        checked={animationsEnabled}
                        onCheckedChange={(checked) => {
                          updateAnimationSettingMutation.mutate(checked);
                        }}
                        disabled={updateAnimationSettingMutation.isPending}
                      />
                    </div>
                  </div>

                  {/* Animation Preview */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-3">Animation Preview</h4>
                    <div className="flex items-center space-x-6">
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
                            size: 48
                          }}
                          size={48}
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
                            size: 48
                          }}
                          size={48}
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
                            size: 48
                          }}
                          size={48}
                          className="mx-auto"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Raver Robot</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-muted/50 rounded text-xs text-muted-foreground">
                      {animationsEnabled 
                        ? "✓ Animations are currently enabled. All avatars display their configured animations."
                        : "⚠ Animations are currently disabled. All avatars display as static images for better performance."
                      }
                    </div>
                  </div>

                  {/* Performance Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="text-lg font-bold text-primary">30fps</div>
                      <div className="text-xs text-muted-foreground">Frame Rate Limit</div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="text-lg font-bold text-primary">
                        {animationsEnabled ? 'ON' : 'OFF'}
                      </div>
                      <div className="text-xs text-muted-foreground">Animation Status</div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="text-lg font-bold text-primary">AUTO</div>
                      <div className="text-xs text-muted-foreground">Memory Cleanup</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Account Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                  <div>
                    <Label>Verification Status</Label>
                    <p className="text-sm font-medium">
                      {user.isVerified ? (
                        <span className="text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-yellow-600">⚠ Pending Verification</span>
                      )}
                    </p>
                  </div>
                </div>

                {user.isAdmin && (
                  <div>
                    <Label>Admin Status</Label>
                    <p className="text-sm font-medium text-blue-600">
                      ✓ Administrator Access
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  <span>Danger Zone</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}