import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import UniversalHeader from "@/components/layout/universal-header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Shield, CheckCircle, Edit3, Lock, Eye, EyeOff, Check } from "lucide-react";
import ProfileAvatarCreator from "@/components/profile-avatar-creator";
import AnimatedAvatarDisplay from "@/components/animated-avatar-display";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile editing form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    stageName: '',
    bio: '',
    email: '',
    genres: '',
    subgenres: '',
    avatar: '',
    avatarConfig: null as any
  });
  
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        stageName: user.stageName || '',
        bio: user.bio || '',
        email: user.email || '',
        genres: user.genres || '',
        subgenres: user.subgenres || '',
        avatar: user.avatar || '',
        avatarConfig: user.avatarConfig || null
      });
    }
  }, [user]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: typeof profileForm) => {
      const response = await apiRequest('PUT', '/api/auth/profile', profileData);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['/api/auth/user'], updatedUser);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: typeof passwordForm) => {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("New passwords do not match");
      }
      if (passwordData.newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long");
      }
      const response = await apiRequest('PUT', '/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      return response.json();
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim() || !profileForm.stageName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate(passwordForm);
  };

  const handleAvatarSave = (avatarData: any) => {
    setProfileForm(prev => ({
      ...prev,
      avatar: avatarData.imageData,
      avatarConfig: avatarData.config
    }));
    setShowAvatarCreator(false);
    toast({
      title: "Avatar Created",
      description: "Your animated avatar is ready! Don't forget to save your profile.",
    });
  };

  const resetProfileForm = () => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        stageName: user.stageName || '',
        bio: user.bio || '',
        email: user.email || '',
        genres: user.genres || '',
        subgenres: user.subgenres || '',
        avatar: user.avatar || '',
        avatarConfig: user.avatarConfig || null
      });
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UniversalHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="cue-card">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {user?.avatar && user?.avatarConfig ? (
                    <div className="relative">
                      <AnimatedAvatarDisplay 
                        config={user.avatarConfig}
                        size={80}
                        className="w-20 h-20"
                      />
                      {user.avatarConfig?.animation !== 'none' && (
                        <div className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full">
                          Live
                        </div>
                      )}
                    </div>
                  ) : user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                  {user?.isVerified && (
                    <CheckCircle className="absolute -bottom-1 -right-1 h-6 w-6 text-primary bg-background rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{user?.stageName || user?.username || "Artist"}</CardTitle>
                  <p className="text-muted-foreground">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {user?.isVerified && (
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Artist
                      </Badge>
                    )}
                    {user?.isAdmin && (
                      <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {user?.bio || "Underground electronic music artist from India."}
              </p>
            </CardContent>
          </Card>

          {/* Verification Links */}
          {user?.verificationLinks && typeof user.verificationLinks === 'object' && 
           Object.keys(user.verificationLinks).length > 0 && (
            <Card className="cue-card">
              <CardHeader>
                <CardTitle>Verification Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(user.verificationLinks as Record<string, string>).map(([platform, url]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <span className="capitalize font-medium">{platform}</span>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Editing */}
          <Card className="cue-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditing ? resetProfileForm() : setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="stageName">Stage/Artist Name *</Label>
                    <Input
                      id="stageName"
                      value={profileForm.stageName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, stageName: e.target.value }))}
                      placeholder="Your DJ/artist name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Your email address"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed for security reasons</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about your music style, influences, and journey..."
                      rows={4}
                    />
                  </div>

                  {/* Avatar Creation Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Profile Avatar</Label>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/20">
                      <div className="flex items-center gap-4">
                        {profileForm.avatar && profileForm.avatarConfig ? (
                          <div className="relative">
                            <AnimatedAvatarDisplay 
                              config={profileForm.avatarConfig}
                              size={64}
                              className="w-16 h-16"
                            />
                            {profileForm.avatarConfig?.animation !== 'none' && (
                              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full">
                                Animated
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {profileForm.avatar ? 'Custom Animated Avatar' : 'No avatar set'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {profileForm.avatar ? 'Click "Create New" to change' : 'Create a unique animated profile avatar'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAvatarCreator(true)}
                        className="shrink-0"
                      >
                        {profileForm.avatar ? 'Create New' : 'Create Avatar'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="genres">Music Genres</Label>
                      <Input
                        id="genres"
                        value={profileForm.genres}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, genres: e.target.value }))}
                        placeholder="e.g., Techno, House, Minimal, Acid"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Separate multiple genres with commas</p>
                    </div>
                    <div>
                      <Label htmlFor="subgenres">Subgenres/Styles</Label>
                      <Input
                        id="subgenres"
                        value={profileForm.subgenres}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, subgenres: e.target.value }))}
                        placeholder="e.g., Deep House, Progressive Techno, Melodic Minimal"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Your specific style and subgenres</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="flex-1"
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetProfileForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">First Name</Label>
                      <p className="text-sm text-muted-foreground">{user?.firstName || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Name</Label>
                      <p className="text-sm text-muted-foreground">{user?.lastName || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Stage/Artist Name</Label>
                    <p className="text-sm text-muted-foreground">{user?.stageName || 'Not set'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Username</Label>
                    <p className="text-sm text-muted-foreground">@{user?.username}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Bio</Label>
                    <p className="text-sm text-muted-foreground">{user?.bio || 'No bio provided'}</p>
                  </div>

                  {/* Avatar Display */}
                  {user?.avatar && user?.avatarConfig && (
                    <div>
                      <Label className="text-sm font-medium">Profile Avatar</Label>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="relative">
                          <AnimatedAvatarDisplay 
                            config={user.avatarConfig}
                            size={64}
                            className="w-16 h-16"
                          />
                          {user.avatarConfig?.animation !== 'none' && (
                            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full">
                              Animated
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Custom animated avatar</p>
                      </div>
                    </div>
                  )}

                  {/* Music Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Music Genres</Label>
                      <p className="text-sm text-muted-foreground">{user?.genres || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Subgenres/Styles</Label>
                      <p className="text-sm text-muted-foreground">{user?.subgenres || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Verification Status</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        {user?.isVerified ? (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Verified Artist</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not verified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email Status</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        {user?.emailVerified ? (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Email verified</span>
                          </>
                        ) : (
                          <span className="text-sm text-orange-600">Email not verified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Member Since</Label>
                      <p className="text-sm text-muted-foreground">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Updated</Label>
                      <p className="text-sm text-muted-foreground">
                        {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>

                  {/* Music Platform Links */}
                  {(user?.spotifyUrl || user?.soundcloudUrl || user?.mixcloudUrl || user?.youtubeUrl || user?.beatportUrl || user?.bandcampUrl || user?.residentAdvisorUrl || user?.instagramUrl) && (
                    <div>
                      <Label className="text-sm font-medium">Music Platform Links</Label>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {user?.spotifyUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(user.spotifyUrl, '_blank')}
                          >
                            Spotify
                          </Button>
                        )}
                        {user?.soundcloudUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(user.soundcloudUrl, '_blank')}
                          >
                            SoundCloud
                          </Button>
                        )}
                        {user?.mixcloudUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(user.mixcloudUrl, '_blank')}
                          >
                            Mixcloud
                          </Button>
                        )}
                        {user?.youtubeUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(user.youtubeUrl, '_blank')}
                          >
                            YouTube
                          </Button>
                        )}
                        {user?.beatportUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(user.beatportUrl, '_blank')}
                          >
                            Beatport
                          </Button>
                        )}
                        {user?.bandcampUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(user.bandcampUrl, '_blank')}
                          >
                            Bandcamp
                          </Button>
                        )}
                        {user?.residentAdvisorUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(user.residentAdvisorUrl, '_blank')}
                          >
                            Resident Advisor
                          </Button>
                        )}
                        {user?.instagramUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(user.instagramUrl, '_blank')}
                          >
                            Instagram
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="cue-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Change Password</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsChangingPassword(!isChangingPassword);
                    if (isChangingPassword) {
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }
                  }}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {isChangingPassword ? 'Cancel' : 'Change Password'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isChangingPassword ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password *</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter your current password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword">New Password *</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password (min 8 characters)"
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your new password"
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordForm.newPassword && passwordForm.confirmPassword && 
                     passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      type="submit" 
                      disabled={changePasswordMutation.isPending || 
                               passwordForm.newPassword !== passwordForm.confirmPassword ||
                               passwordForm.newPassword.length < 8}
                      className="flex-1"
                    >
                      {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Keep your account secure by using a strong password and changing it regularly.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="cue-card">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  try {
                    await apiRequest('POST', '/api/auth/logout');
                  } finally {
                    window.location.href = '/';
                  }
                }}
              >
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />

      {/* Avatar Creator Modal */}
      <Dialog open={showAvatarCreator} onOpenChange={setShowAvatarCreator}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Create Your Animated Avatar</DialogTitle>
          </DialogHeader>
          <ProfileAvatarCreator onAvatarSave={handleAvatarSave} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
