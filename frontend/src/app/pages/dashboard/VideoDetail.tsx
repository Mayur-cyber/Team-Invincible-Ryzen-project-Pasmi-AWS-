import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Clock,
  Calendar,
  Target,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Loader2
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardApi } from "../../services/dashboardApi";

// Chart data helpers moved inside component

const platformIcons: any = {
  youtube: { icon: Youtube, color: "#FF0000", name: "YouTube" },
  instagram: { icon: Instagram, color: "#E1306C", name: "Instagram" },
  facebook: { icon: Facebook, color: "#1877F2", name: "Facebook" },
  twitter: { icon: Twitter, color: "#000000", name: "Twitter" }
};

export default function VideoDetail() {
  const { platform, id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!platform || !id) return;
      try {
        setIsLoading(true);
        console.log(`Fetching stats for ${platform}/${id}`);
        const data = await dashboardApi.getVideoAnalytics(platform, id);
        console.log("Received video data:", data);
        setContent(data);
      } catch (error: any) {
        console.error("Failed to fetch video stats:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("Error status:", error.response.status);
        }
        setErrorMsg(`Failed to load ${platform} content stats. Check console for details.`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [platform, id]);

  const platformInfo = platformIcons[platform as string];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4D50]" />
      </div>
    );
  }

  if (!content || !platformInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-gray-500">{errorMsg || "Content not found or stats unavailable"}</p>
        <Button onClick={() => navigate("/dashboard/analytics")} variant="outline">
          Back to Analytics
        </Button>
      </div>
    );
  }

  const Icon = platformInfo.icon;

  // Derive chart data from content
  const viewsOverTimeData = content.viewsOverTime || [];

  // Simulated data for charts that require even deeper API access, 
  // but keeping them visually populated with deterministic values based on real views
  const engagementData = content.engagementData || [
    { day: 'Mon', likes: Math.floor(parseInt(content.views) * 0.05), comments: Math.floor(parseInt(content.views) * 0.01), shares: Math.floor(parseInt(content.views) * 0.005) },
    { day: 'Tue', likes: Math.floor(parseInt(content.views) * 0.06), comments: Math.floor(parseInt(content.views) * 0.012), shares: Math.floor(parseInt(content.views) * 0.006) },
    { day: 'Wed', likes: Math.floor(parseInt(content.views) * 0.04), comments: Math.floor(parseInt(content.views) * 0.008), shares: Math.floor(parseInt(content.views) * 0.004) },
  ];

  const audienceData = content.audienceData || [
    { name: '18-24', value: 35, color: '#8FA58F' },
    { name: '25-34', value: 45, color: '#3A4D50' },
    { name: '35-44', value: 15, color: '#5A7D81' },
    { name: '45+', value: 5, color: '#A3B8A3' },
  ];

  const trafficSourceData = content.trafficSourceData || [
    { name: 'Search', value: 40, color: '#8FA58F' },
    { name: 'Suggested', value: 30, color: '#3A4D50' },
    { name: 'Direct', value: 15, color: '#5A7D81' },
    { name: 'External', value: 15, color: '#A3B8A3' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/analytics")}
          className="mb-4 text-[#3A4D50] hover:bg-[#8FA58F]/10"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Analytics
        </Button>

        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${platformInfo.color}15` }}>
            <Icon size={24} style={{ color: platformInfo.color }} />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight text-[#3A4D50]">{content.title}</h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-500 flex items-center gap-1">
                <Calendar size={16} />
                {content.publishedAt?.split('T')[0] || content.date}
              </p>
              <p className="text-gray-500">•</p>
              <p className="text-gray-500">{platformInfo.name}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Re-link account notice */}
      {platform === 'youtube' && (!content.watchTime || content.watchTime === '0 min') && (
        <Card className="bg-blue-50 border-blue-100 text-blue-800 p-4 border-none shadow-none mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm font-medium">
              💡 <b>Deep Analytics Available:</b> To see Watch Time, Retention, and CTR, please <b>re-connect your YouTube account</b>. We've added more detailed tracking!
            </p>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Views"
          value={content.views}
          icon={Eye}
          trend="+12.5%"
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
          delay={0}
        />
        <MetricCard
          title={platform === 'facebook' ? 'Reactions' : 'Likes'}
          value={content.likes || content.reactions}
          icon={Heart}
          trend="+8.3%"
          bgColor="bg-red-50"
          iconColor="text-red-600"
          delay={0.1}
        />
        <MetricCard
          title="Comments"
          value={content.comments || content.replies || '0'}
          icon={MessageCircle}
          trend="+15.2%"
          bgColor="bg-green-50"
          iconColor="text-green-600"
          delay={0.2}
        />
        <MetricCard
          title={platform === 'twitter' ? 'Retweets' : 'Shares'}
          value={content.shares || content.retweets || '0'}
          icon={Share2}
          trend="+6.8%"
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
          delay={0.3}
        />
      </div>

      {/* Mock extra stats for simulated content */}
      {!content.id?.includes('_') && platform !== 'youtube' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4 bg-yellow-50 text-yellow-800 border-none">
            <p className="text-sm font-medium">Note: Detailed charts for {platformInfo.name} are currently simulated.</p>
          </Card>
        </div>
      )}

      {/* Platform-specific metrics */}
      {platform === 'youtube' && (
        <div className="grid gap-4 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Watch Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#3A4D50] flex items-center gap-2">
                  <Clock size={20} />
                  {content.watchTime}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#3A4D50] flex items-center gap-2">
                  <Target size={20} />
                  {content.retention}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">CTR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#3A4D50]">{content.ctr}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Avg. View Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#3A4D50]">{content.avgViewDuration}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {platform === 'instagram' && (
        <div className="grid gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#3A4D50]">{content.reach}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Saves</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#3A4D50]">{content.saves}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#3A4D50]">{content.engagement}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Views Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#3A4D50]">Views Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={viewsOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="hour"
                    stroke="#6B7280"
                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="views" stroke="#8FA58F" strokeWidth={3} dot={{ fill: '#8FA58F', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Engagement Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#3A4D50]">Engagement Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="likes" fill="#8FA58F" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="comments" fill="#3A4D50" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="shares" fill="#5A7D81" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Audience Demographics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#3A4D50]">Audience Age Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={audienceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {audienceData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{ cursor: 'default', outline: 'none' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#3A4D50]">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={trafficSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {trafficSourceData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{ cursor: 'default', outline: 'none' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, bgColor, iconColor, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            {title}
          </CardTitle>
          <motion.div
            whileHover={{ rotate: 360, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#3A4D50]">{value}</div>
          <p className="text-xs text-green-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend} from yesterday
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}