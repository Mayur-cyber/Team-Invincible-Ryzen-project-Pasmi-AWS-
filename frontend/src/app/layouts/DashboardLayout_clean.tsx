import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  PlusSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Share2,
  BarChart3,
  User,
  Bell,
  Brain,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Video,
  Clock,
  MessageCircle,
  Send,
  Minimize2,
  Bot,
  Twitter,
  Instagram,
  Facebook
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { useUser } from "../contexts/UserContext";


export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; text: string; sender: 'user' | 'bot'; timestamp: string }>>([
    {
      id: 1,
      text: "Hi! I'm Pasmi AI Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useUser();

  // Protect dashboard route
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Only redirect if we ARE NOT loading AND (we have no user AND no token)
    if (!isLoading && !user && !token) {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);



  // Get page title based on current route
  const getPageTitle = () => {
    const currentNav = navItems.find(item =>
      item.path === location.pathname ||
      (item.path !== "/dashboard" && location.pathname.startsWith(item.path))
    );
    return currentNav?.name || "Dashboard";
  };

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: CheckCircle,
      title: "Post Published Successfully",
      message: "Your video 'Social Media Automation Guide' is now live on all platforms!",
      time: "5 min ago",
      type: "success",
      unread: true
    },
    {
      id: 2,
      icon: TrendingUp,
      title: "Engagement Milestone",
      message: "Your Instagram post reached 10K likes! Keep up the great work.",
      time: "2 hours ago",
      type: "info",
      unread: true
    },
    {
      id: 3,
      icon: Video,
      title: "Content Ready for Review",
      message: "AI has finished generating thumbnails and titles for your latest video.",
      time: "4 hours ago",
      type: "info",
      unread: false
    },
    {
      id: 4,
      icon: AlertCircle,
      title: "Posting Schedule Alert",
      message: "You haven't posted on YouTube in 3 days. Keep your audience engaged!",
      time: "1 day ago",
      type: "warning",
      unread: false
    },
    {
      id: 5,
      icon: Clock,
      title: "Optimal Posting Time",
      message: "Your audience is most active right now. Perfect time to post!",
      time: "2 days ago",
      type: "info",
      unread: false
    }
  ]);

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Create Post", icon: PlusSquare, path: "/dashboard/create" },
    { name: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
    { name: "AI Insights", icon: Brain, path: "/dashboard/ai-insights" },
    { name: "Connected Accounts", icon: Share2, path: "/dashboard/connected-accounts" },
  ];

  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm here to help you with PASMI. Ask me anything about posting content, analytics, or AI insights!";
    } else if (lowerMessage.includes('post') || lowerMessage.includes('publish') || lowerMessage.includes('upload')) {
      return "To create a post, navigate to the 'Create Post' section. You can upload videos, add captions, generate AI thumbnails and titles, and publish to multiple platforms at once!";
    } else if (lowerMessage.includes('analytic') || lowerMessage.includes('stats') || lowerMessage.includes('performance')) {
      return "Check out the Analytics page to see detailed performance metrics across all your connected platforms. You'll find engagement rates, follower growth, and platform-specific insights!";
    } else if (lowerMessage.includes('ai') || lowerMessage.includes('insight') || lowerMessage.includes('recommendation')) {
      return "Our AI Insights feature provides smart recommendations based on your content performance, optimal posting times, trending topics, and performance predictions. Visit the AI Insights page to learn more!";
    } else if (lowerMessage.includes('connect') || lowerMessage.includes('account') || lowerMessage.includes('platform')) {
      return "You can connect your social media accounts (YouTube, Instagram, Facebook, Twitter) in the Connected Accounts section. This allows you to post to all platforms simultaneously!";
    } else if (lowerMessage.includes('thumbnail') || lowerMessage.includes('title') || lowerMessage.includes('hashtag')) {
      return "PASMI's AI automatically generates engaging thumbnails, compelling titles, and relevant hashtags based on your video content. You can find these features in the Create Post section!";
    } else if (lowerMessage.includes('schedule') || lowerMessage.includes('time') || lowerMessage.includes('when')) {
      return "Our AI analyzes when your audience is most active and suggests optimal posting times. Check the AI Insights page for personalized scheduling recommendations!";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "I can help you with: Creating posts, Understanding analytics, AI insights & recommendations, Connecting social accounts, Scheduling content, and General platform features. What would you like to know more about?";
    } else {
      return "I'm here to assist you with PASMI! You can ask me about creating posts, viewing analytics, AI insights, connecting accounts, or any other features. What would you like to know?";
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: chatMessages.length + 1,
      text: inputMessage,
      sender: 'user' as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        text: getBotResponse(inputMessage),
        sender: 'bot' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8EDE3] via-[#F0F2EB] to-[#DDE5D5] flex flex-col font-sans text-gray-800 relative">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-[#8FA58F]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#3A4D50]/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content Row - Sidebar and Pages - This is one element */}
      <div className="flex flex-1 min-h-screen relative z-10">
        {/* Sidebar - Desktop */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarCollapsed ? 80 : 256 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="hidden md:flex md:flex-col shrink-0"
        >
          <div className="h-full bg-gradient-to-b from-[#2F3E41] to-[#3A4D50] backdrop-blur-xl shadow-2xl border-r border-white/10">
            <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
              <motion.button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {!isSidebarCollapsed ? (
                    <motion.span
                      key="full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-4xl font-script text-[#E0E5D0] hover:text-[#8FA58F] transition-colors block"
                    >
                      Pasmi
                    </motion.span>
                  ) : (
                    <motion.div
                      key="icon"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8FA58F] to-[#5C6F5C] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        P
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className="block"
                      title={isSidebarCollapsed ? item.name : undefined}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, x: isSidebarCollapsed ? 0 : 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all duration-200
                          ${isActive
                            ? "bg-gradient-to-r from-[#8FA58F] to-[#7A9080] text-white font-medium shadow-lg shadow-[#8FA58F]/30"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }
                        `}
                      >
                        <item.icon size={20} />
                        {!isSidebarCollapsed && <span>{item.name}</span>}
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-4 border-t border-white/10">
              <Link
                to="/"
                className="block"
                title={isSidebarCollapsed ? "Sign Out" : undefined}
              >
                <motion.div
                  whileHover={{ scale: 1.02, x: isSidebarCollapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all`}
                >
                  <LogOut size={20} />
                  {!isSidebarCollapsed && <span>Sign Out</span>}
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.aside>

        {/* Mobile Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            x: isSidebarOpen ? 0 : "-100%"
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
        >
          <div className="h-full bg-gradient-to-b from-[#2F3E41] to-[#3A4D50] backdrop-blur-xl shadow-2xl border-r border-white/10">
            <div className="p-6 flex items-center justify-between">
              <Link to="/" className="text-4xl font-script text-[#E0E5D0] hover:text-[#8FA58F] transition-colors">
                Pasmi
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-gray-300 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className="block"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                          ${isActive
                            ? "bg-gradient-to-r from-[#8FA58F] to-[#7A9080] text-white font-medium shadow-lg shadow-[#8FA58F]/30"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }
                        `}
                      >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-4 border-t border-white/10">
              <Link
                to="/"
                className="block"
              >
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen w-full">
          {/* Glass Header */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/60 backdrop-blur-xl shadow-lg border-b border-white/20 h-16 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0"
          >
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Menu size={24} />
              </motion.button>
              <motion.h1
                key={location.pathname}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xl font-bold text-[#3A4D50]"
              >
                {getPageTitle()}
              </motion.h1>
            </div>

            {/* Right side: Chat, Notifications, Profile */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* AI Chat Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(143, 165, 143, 0.6)',
                      '0 0 40px rgba(143, 165, 143, 0.8)',
                      '0 0 20px rgba(143, 165, 143, 0.6)',
                    ],
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 0.2 },
                    rotate: { duration: 0.5 }
                  }}
                  onClick={() => {
                    setIsChatOpen(!isChatOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className="relative p-3 text-white bg-gradient-to-br from-[#8FA58F] via-[#7A9080] to-[#8FA58F] rounded-2xl transition-all shadow-lg hover:shadow-2xl overflow-hidden"
                  style={{
                    boxShadow: '0 0 25px rgba(143, 165, 143, 0.7), 0 4px 15px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Rotating border glow */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{
                      background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)',
                    }}
                  />

                  <Bot size={22} className="relative z-10 drop-shadow-lg" />

                  {/* Outer glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-white/30"
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.button>

                <AnimatePresence>
                  {isChatOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-50"
                    >
                      {/* Chat Header */}
                      <div className="bg-gradient-to-r from-[#8FA58F] to-[#7A9080] px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-sm">Pasmi AI Assistant</h3>
                            <p className="text-xs text-white/80">Online</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setIsChatOpen(false)}
                          className="text-white/80 hover:text-white"
                        >
                          <X size={18} />
                        </motion.button>
                      </div>

                      {/* Chat Messages */}
                      <div className="h-96 overflow-y-auto p-4 space-y-3">
                        {chatMessages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                              <div className={`rounded-2xl px-4 py-2 ${msg.sender === 'user'
                                ? 'bg-gradient-to-r from-[#8FA58F] to-[#7A9080] text-white'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                <p className="text-sm">{msg.text}</p>
                              </div>
                              <p className="text-xs text-gray-400 mt-1 px-2">{msg.timestamp}</p>
                            </div>
                          </motion.div>
                        ))}
                        {isTyping && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                          >
                            <div className="bg-gray-100 rounded-2xl px-4 py-3">
                              <div className="flex gap-1">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                  className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                  className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                  className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Chat Input */}
                      <div className="border-t border-gray-200 p-3 bg-white/50">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8FA58F] focus:border-transparent"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendMessage}
                            className="p-2 bg-gradient-to-r from-[#8FA58F] to-[#7A9080] text-white rounded-xl hover:shadow-lg transition-all"
                          >
                            <Send size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notifications Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(143, 165, 143, 0.6)',
                      '0 0 40px rgba(143, 165, 143, 0.8)',
                      '0 0 20px rgba(143, 165, 143, 0.6)',
                    ],
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 0.2 },
                    rotate: { duration: 0.5 }
                  }}
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsChatOpen(false);
                  }}
                  className="relative p-3 text-white bg-gradient-to-br from-[#8FA58F] via-[#7A9080] to-[#8FA58F] rounded-2xl transition-all shadow-lg hover:shadow-2xl overflow-hidden"
                  style={{
                    boxShadow: '0 0 25px rgba(143, 165, 143, 0.7), 0 4px 15px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Rotating border glow */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{
                      background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)',
                    }}
                  />

                  <Bell size={22} className="relative z-10 drop-shadow-lg" />

                  {/* Unread indicator */}
                  {notifications.some(n => n.unread) && (
                    <motion.span
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.8, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg"
                    />
                  )}

                  {/* Outer glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-white/30"
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-80 md:w-96 max-h-[32rem] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50"
                    >
                      <div className="sticky top-0 bg-white/95 backdrop-blur-xl px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={18} />
                        </motion.button>
                      </div>

                      <div className="p-2">
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => markNotificationAsRead(notification.id)}
                            className={`p-3 rounded-xl mb-2 cursor-pointer transition-all hover:bg-gray-50 ${notification.unread ? 'bg-[#8FA58F]/5' : ''
                              }`}
                          >
                            <div className="flex gap-3">
                              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                <notification.icon size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-semibold text-sm text-gray-800 truncate">{notification.title}</h4>
                                  {notification.unread && (
                                    <span className="shrink-0 w-2 h-2 bg-[#8FA58F] rounded-full mt-1"></span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/dashboard/settings")}
                className="flex items-center gap-2 hover:bg-white/50 rounded-full px-2 py-1 transition-colors"
              >
                <Avatar className="h-8 w-8 border-2 border-white shadow-md">
                  <AvatarImage src={user?.profileImage} alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-[#8FA58F] to-[#7A9080] text-white text-xs">
                    {user?.username ? user.username.split(' ').map((n: string) => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-gray-700">{user?.username}</span>
              </motion.button>
            </div>
          </motion.header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-3 md:p-4 min-h-[calc(100vh-4rem)]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>

      {/* Footer - Separate element at the bottom */}
      <footer className="bg-gradient-to-r from-[#3A4D50] to-[#2F3E41] text-white relative z-10 shrink-0 mt-auto">
        <div className="max-w-full px-6 md:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl font-script text-[#E0E5D0] hover:text-[#8FA58F] transition-colors cursor-default">
                  Pasmi
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed max-w-xs">
                AI-powered social media management that helps creators grow faster.
              </p>
            </div>

            {/* Product Section */}
            <div>
              <h3 className="font-semibold text-white mb-2 text-xs">Product</h3>
              <ul className="space-y-1.5">
                <li>
                  <a href="#" className="text-xs text-gray-300 hover:text-[#8FA58F] transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-gray-300 hover:text-[#8FA58F] transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-gray-300 hover:text-[#8FA58F] transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-gray-300 hover:text-[#8FA58F] transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Section */}
            <div>
              <h3 className="font-semibold text-white mb-2 text-xs">Company</h3>
              <ul className="space-y-1.5">
                <li>
                  <a href="#" className="text-xs text-gray-300 hover:text-[#8FA58F] transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-gray-300 hover:text-[#8FA58F] transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-gray-300 hover:text-[#8FA58F] transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-gray-300 hover:text-[#8FA58F] transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Section */}
            <div>
              <h3 className="font-semibold text-white mb-2 text-xs">Legal</h3>
              <ul className="space-y-1.5">
                <li>
                  <a href="#" className="text-xs text-gray-300 hover:text-[#8FA58F] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-gray-300 hover:text-[#8FA58F] transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-gray-300 hover:text-[#8FA58F] transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-gray-300 hover:text-[#8FA58F] transition-colors">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-400">
              © 2024 PASMI. All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="w-7 h-7 bg-white/10 hover:bg-[#8FA58F] text-white rounded-full flex items-center justify-center transition-all"
              >
                <Twitter size={13} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="w-7 h-7 bg-white/10 hover:bg-[#8FA58F] text-white rounded-full flex items-center justify-center transition-all"
              >
                <Instagram size={13} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="w-7 h-7 bg-white/10 hover:bg-[#8FA58F] text-white rounded-full flex items-center justify-center transition-all"
              >
                <Facebook size={13} />
              </motion.a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}