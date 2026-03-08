import { useState } from "react";
import { motion } from "motion/react";
import { Camera, User, Mail, Lock, Bell, CreditCard } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { useUser } from "../../contexts/UserContext";
import { toast } from "sonner";

export default function Settings() {
  const { user, updateUser } = useUser();
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [profileImage, setProfileImage] = useState(user.profileImage);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        updateUser({ profileImage: reader.result as string });
        toast.success("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    updateUser({ username, email });
    toast.success("Profile information saved successfully!");
  };

  const handleResetImage = () => {
    const defaultImage = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";
    setProfileImage(defaultImage);
    updateUser({ profileImage: defaultImage });
    toast.success("Profile picture reset!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold tracking-tight text-[#3A4D50]">Settings</h2>
        <p className="text-gray-500">Manage your account preferences and profile.</p>
      </motion.div>

      {/* Profile Picture Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#3A4D50] flex items-center gap-2">
              <User size={20} />
              Profile Picture
            </CardTitle>
            <CardDescription>Update your profile photo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={profileImage} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-[#8FA58F] to-[#7A9080] text-white text-2xl">
                    SJ
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="profile-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="text-white" size={24} />
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#3A4D50] mb-1">{username}</h3>
                <p className="text-sm text-gray-500 mb-3">Click on the avatar to upload a new photo</p>
                <div className="flex gap-2">
                  <label htmlFor="profile-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#8FA58F] text-[#8FA58F] hover:bg-[#8FA58F] hover:text-white cursor-pointer"
                      onClick={() => document.getElementById('profile-upload')?.click()}
                    >
                      Upload Photo
                    </Button>
                  </label>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-100"
                    onClick={handleResetImage}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/70 backdrop-blur-xl">
            <TabsTrigger value="account" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8FA58F] data-[state=active]:to-[#7A9080] data-[state=active]:text-white">
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8FA58F] data-[state=active]:to-[#7A9080] data-[state=active]:text-white">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8FA58F] data-[state=active]:to-[#7A9080] data-[state=active]:text-white">
              Billing
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-[#3A4D50] flex items-center gap-2">
                    <User size={20} />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="text-[#3A4D50]">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-white/50 border-gray-200 focus:border-[#8FA58F] focus:ring-[#8FA58F]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-[#3A4D50] flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/50 border-gray-200 focus:border-[#8FA58F] focus:ring-[#8FA58F]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-[#3A4D50] flex items-center gap-2">
                      <Lock size={16} />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/50 border-gray-200 focus:border-[#8FA58F] focus:ring-[#8FA58F]"
                    />
                  </div>
                  <Button className="mt-4 bg-gradient-to-r from-[#8FA58F] to-[#7A9080] text-white hover:shadow-lg transition-all" onClick={handleSaveChanges}>
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-[#3A4D50] flex items-center gap-2">
                    <Bell size={20} />
                    Notifications
                  </CardTitle>
                  <CardDescription>Choose what you want to be notified about.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="email-notif" className="text-[#3A4D50] font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-500 mt-1">Receive email updates about your account</p>
                    </div>
                    <Switch id="email-notif" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="push-notif" className="text-[#3A4D50] font-medium">Push Notifications</Label>
                      <p className="text-sm text-gray-500 mt-1">Get real-time updates in your browser</p>
                    </div>
                    <Switch id="push-notif" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="post-notif" className="text-[#3A4D50] font-medium">Post Notifications</Label>
                      <p className="text-sm text-gray-500 mt-1">Get notified when posts go live</p>
                    </div>
                    <Switch id="post-notif" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="analytics-notif" className="text-[#3A4D50] font-medium">Analytics Updates</Label>
                      <p className="text-sm text-gray-500 mt-1">Weekly performance summaries</p>
                    </div>
                    <Switch id="analytics-notif" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="billing">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-[#3A4D50] flex items-center gap-2">
                    <CreditCard size={20} />
                    Billing
                  </CardTitle>
                  <CardDescription>Manage your subscription and payment methods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 border-2 border-[#8FA58F] rounded-lg bg-gradient-to-br from-[#8FA58F]/10 to-[#7A9080]/10">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="font-semibold text-[#3A4D50] text-lg">Pro Plan</span>
                        <span className="ml-2 px-2 py-1 bg-gradient-to-r from-[#8FA58F] to-[#7A9080] text-white text-xs rounded-full">Active</span>
                      </div>
                      <span className="text-green-600 font-bold text-2xl">$29/mo</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Next billing date: March 28, 2026</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>✓ Unlimited posts across all platforms</p>
                      <p>✓ AI-powered content optimization</p>
                      <p>✓ Advanced analytics & insights</p>
                      <p>✓ Priority customer support</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-[#8FA58F] text-[#8FA58F] hover:bg-[#8FA58F] hover:text-white"
                    >
                      Update Payment Method
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      View Invoices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}