'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  RefreshCw, 
  Shield, 
  Bell, 
  Globe,
  Lock,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
  Check
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Navbar from '@/components/navbar';

// Available chat background images from public folder
const CHAT_BACKGROUNDS = [
  { id: 'none', name: 'No Background', path: '' },
  { id: 'gradient1', name: 'Blue Gradient', path: '/bg1.jpg' },
  { id: 'gradient2', name: 'Purple Gradient', path: '/bg2.jpg' },
  { id: 'abstract1', name: 'Abstract 1', path: '/bg3.jpg' },
  { id: 'abstract2', name: 'Abstract 2', path: '/bg4.jpg' },
//   { id: 'geometric', name: 'Geometric', path: '/public/geometric.jpg' },
//   { id: 'nature', name: 'Nature', path: '/public/nature.jpg' },
//   { id: 'stars', name: 'Stars', path: '/backgrounds/stars.jpg' },
//   { id: 'waves', name: 'Waves', path: '/backgrounds/waves.jpg' },
];

// Available theme colors
const THEME_COLORS = [
  { id: 'blue', name: 'Blue', value: '#3b82f6', darkValue: '#1d4ed8' },
  { id: 'green', name: 'Green', value: '#10b981', darkValue: '#047857' },
  { id: 'purple', name: 'Purple', value: '#8b5cf6', darkValue: '#7c3aed' },
  { id: 'red', name: 'Red', value: '#ef4444', darkValue: '#dc2626' },
  { id: 'orange', name: 'Orange', value: '#f97316', darkValue: '#ea580c' },
  { id: 'pink', name: 'Pink', value: '#ec4899', darkValue: '#db2777' },
  { id: 'indigo', name: 'Indigo', value: '#6366f1', darkValue: '#4f46e5' },
];

export default function SettingsPage() {
  const user = useSelector((state: RootState) => state.user.user);
  const [profile, setProfile] = useState({
    displayName: '',
    username: '',
    bio: '',
    photoURL: '',
    chatBackground: '',
    themeColor: 'blue',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Settings states
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    showOnlineStatus: true,
    darkMode: false,
  });

  useEffect(() => {
    if (user?.uid) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const userProfile = await getUserProfile(user!.uid);
      if (userProfile) {
        setProfile({
          displayName: userProfile.displayName || '',
          username: userProfile.username || '',
          bio: userProfile.bio || '',
          photoURL: userProfile.photoURL || '',
          chatBackground: userProfile.chatBackground || '',
          themeColor: userProfile.themeColor || 'blue',
        });
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateUserProfile(user.uid, {
        displayName: profile.displayName || undefined,
        username: profile.username || undefined,
        bio: profile.bio || undefined,
        photoURL: profile.photoURL || undefined,
        chatBackground: profile.chatBackground || undefined,
        themeColor: profile.themeColor || undefined,
      });
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      // Apply theme color to root CSS variables
      applyThemeColor(profile.themeColor);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const applyThemeColor = (themeId: string) => {
    const theme = THEME_COLORS.find(t => t.id === themeId) || THEME_COLORS[0];
    document.documentElement.style.setProperty('--primary', theme.value);
    document.documentElement.style.setProperty('--primary-dark', theme.darkValue);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockURL = URL.createObjectURL(file);
      setProfile({ ...profile, photoURL: mockURL });
    }
  };

  const handleChatBackgroundSelect = (backgroundId: string) => {
    setProfile({ ...profile, chatBackground: backgroundId });
  };

  const handleThemeColorSelect = (themeId: string) => {
    setProfile({ ...profile, themeColor: themeId });
    // Preview the theme color
    applyThemeColor(themeId);
  };

  const getInitials = (name: string, email?: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || 'U';
  };

  const getSelectedBackground = () => {
    return CHAT_BACKGROUNDS.find(bg => bg.id === profile.chatBackground);
  };

  if (loading) {
    return (
    //   <div className="flex justify-center items-center min-h-[60vh]">
    //     <div className="text-center">
    //       <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
    //       <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
    //     </div>
    //   </div>
    <div className="flex min-h-[60vh] items-center justify-center">
  <div className="flex flex-col items-center gap-4">
    <div className="relative">
      <div className="h-14 w-14 rounded-full border-4 border-muted border-t-primary animate-spin" />
    </div>

    <div className="text-center space-y-1">
      <p className="text-sm font-medium text-foreground">
        Loading your profile
      </p>
      <p className="text-xs text-muted-foreground">
        Please wait a moment
      </p>
    </div>
  </div>
</div>

    );
  }

  const handleLogout = async () => {
    // Implement logout logic
    console.log('Logout clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar
        user={user ? {
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar: user.photoURL,
          role: 'User',
        } : undefined}
        onLogout={handleLogout}
        darkMode={settings.darkMode}
        onToggleDarkMode={() => {
          setSettings({ ...settings, darkMode: !settings.darkMode });
          document.documentElement.classList.toggle('dark');
        }}
      />
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-6xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm md:shadow-lg dark:shadow-gray-900/20">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 md:border-4 border-gray-100 dark:border-gray-800">
                    <AvatarImage src={profile.photoURL} alt={profile.displayName} />
                    <AvatarFallback className="text-xl md:text-2xl bg-gradient-to-br from-primary to-primary-dark text-white">
                      {getInitials(profile.displayName, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 p-1.5 md:p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary-dark transition-all shadow-md">
                    <Camera className="w-4 h-4 md:w-5 md:h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
                
                <div className="text-center w-full">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {profile.displayName || 'Anonymous User'}
                  </h2>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 md:gap-2 mb-3">
                    <Mail className="w-3 h-3 md:w-4 md:h-4" />
                    {user?.email}
                  </p>
                  
                  {profile.username && (
                    <Badge variant="outline" className="mb-4 text-xs md:text-sm">
                      @{profile.username}
                    </Badge>
                  )}
                  
                  {profile.bio && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings Forms */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4 md:mb-6 w-full">
              <TabsTrigger value="appearance" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Palette className="w-3 h-3 md:w-4 md:h-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <User className="w-3 h-3 md:w-4 md:h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Bell className="w-3 h-3 md:w-4 md:h-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Shield className="w-3 h-3 md:w-4 md:h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4 md:space-y-6">
              {/* Theme Color Selection */}
              <Card>
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Palette className="w-4 h-4 md:w-5 md:h-5" />
                    Theme Color
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Choose your primary theme color
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleThemeColorSelect(color.id)}
                        className={`
                          relative group flex flex-col items-center justify-center p-3 md:p-4 rounded-lg border-2
                          transition-all hover:scale-105 hover:shadow-md
                          ${profile.themeColor === color.id 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }
                        `}
                      >
                        <div 
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full mb-2 shadow-inner"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {color.name}
                        </span>
                        {profile.themeColor === color.id && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Background Selection */}
              <Card>
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                    Chat Background
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Choose a background for your chat conversations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={profile.chatBackground} 
                    onValueChange={handleChatBackgroundSelect}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {CHAT_BACKGROUNDS.map((background) => (
                      <div key={background.id} className="relative">
                        <RadioGroupItem 
                          value={background.id} 
                          id={`bg-${background.id}`}
                          className="sr-only peer"
                        />
                        <label
                          htmlFor={`bg-${background.id}`}
                          className={`
                            relative flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
                            transition-all hover:scale-[1.02] hover:shadow-md
                            ${profile.chatBackground === background.id 
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }
                          `}
                        >
                          <div className="w-full h-32 md:h-40 rounded-md mb-3 overflow-hidden">
                            {background.id === 'none' ? (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                  No Background
                                </span>
                              </div>
                            ) : (
                              <div 
                                className="w-full h-full bg-cover bg-center"
                                style={{ 
                                  backgroundImage: background.path 
                                    ? `url(${background.path})` 
                                    : undefined,
                                  backgroundColor: '#f3f4f6' // fallback color
                                }}
                              />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {background.name}
                          </span>
                          
                          {profile.chatBackground === background.id && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Dark Mode Toggle */}
              <Card>
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    {settings.darkMode ? (
                      <Moon className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <Sun className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                    Theme Mode
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Choose between light and dark mode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Dark Mode</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Switch between light and dark theme
                      </p>
                    </div>
                    <Switch
                      checked={settings.darkMode}
                      onCheckedChange={(checked) => {
                        setSettings({ ...settings, darkMode: checked });
                        // Apply dark mode
                        document.documentElement.classList.toggle('dark', checked);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab (existing content) */}
            <TabsContent value="profile" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-sm">
                        Display Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="displayName"
                          value={profile.displayName}
                          onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                          placeholder="Enter your display name"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm">
                        Username
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                        <Input
                          id="username"
                          value={profile.username}
                          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                          placeholder="username"
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm">
                      Bio
                    </Label>
                    <textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us about yourself"
                      className="w-full min-h-[100px] md:min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photoURL" className="text-sm">
                      Profile Picture URL
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="photoURL"
                        value={profile.photoURL}
                        onChange={(e) => setProfile({ ...profile, photoURL: e.target.value })}
                        placeholder="https://example.com/photo.jpg"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab (existing content) */}
            <TabsContent value="preferences" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Control how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Push Notifications</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive push notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, pushNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Show Online Status</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Let others see when you are online
                      </p>
                    </div>
                    <Switch
                      checked={settings.showOnlineStatus}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, showOnlineStatus: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab (existing content) */}
            <TabsContent value="security" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Shield className="w-4 h-4 md:w-5 md:h-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                          Account Security
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          Your account is secured with email verification
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Email Address</Label>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{user?.email}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Status Messages and Save Button */}
          <div className="mt-6 space-y-4">
            {error && (
              <div className="p-3 md:p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="p-3 md:p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                </div>
              </div>
            )}

            <Button 
              onClick={handleSave} 
              disabled={saving} 
              className="w-full md:w-auto min-w-[140px]"
              size="lg"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}