import { useState, useEffect } from "react";
import {
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  Loader2,
  Linkedin
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { dashboardApi } from "../../services/dashboardApi";
import { toast } from "sonner";

export default function Analytics() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("youtube");
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [platformData, setPlatformData] = useState<any>({});
  const [aggregateMetrics, setAggregateMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await dashboardApi.getAnalyticsData();
        if (isMounted) {
          setWeeklyData(res.weeklyData);
          setPlatformData(res.platformData);
          setAggregateMetrics(res.aggregateMetrics);

          // Select default platform if available
          const availablePlatforms = Object.keys(res.platformData);
          if (availablePlatforms.length > 0) {
            setSelectedPlatform(availablePlatforms[0]);
          } else {
            setSelectedPlatform("none");
          }
        }
      } catch (error) {
        console.error("Failed to load analytics: ", error);
        toast.error("Failed to load analytics data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchAnalytics();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold tracking-tight text-[#3A4D50]">Analytics</h2>
        <p className="text-gray-500">Track your performance across all platforms.</p>
      </motion.div>

      {/* Overview Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-4 flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-[#3A4D50]" />
          </div>
        ) : (
          <>
            <MetricCard
              title="Total Followers"
              value={aggregateMetrics?.totalFollowers || "0"}
              icon={Users}
              trend="+12.5%"
              bgColor="bg-purple-50"
              iconColor="text-purple-600"
              delay={0}
            />
            <MetricCard
              title="Total Reach"
              value={aggregateMetrics?.totalViews || "0"}
              icon={Eye}
              trend="+18.2%"
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
              delay={0.1}
            />
            <MetricCard
              title="Avg. Engagement"
              value={aggregateMetrics?.avgEngagement || "0%"}
              icon={Heart}
              trend="+2.4%"
              bgColor="bg-red-50"
              iconColor="text-red-600"
              delay={0.2}
            />
            <MetricCard
              title="Content Posted"
              value={aggregateMetrics?.contentPosted || "0"}
              icon={Share2}
              trend="+8"
              bgColor="bg-green-50"
              iconColor="text-green-600"
              delay={0.3}
            />
          </>
        )}
      </div>

      {/* Weekly Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#3A4D50]">Weekly Performance by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="youtube" stroke="#FF0000" strokeWidth={2} dot={{ fill: '#FF0000' }} />
                <Line type="monotone" dataKey="linkedin" stroke="#0A66C2" strokeWidth={2} dot={{ fill: '#0A66C2' }} />
                <Line type="monotone" dataKey="instagram" stroke="#E1306C" strokeWidth={2} dot={{ fill: '#E1306C' }} />
                <Line type="monotone" dataKey="facebook" stroke="#1877F2" strokeWidth={2} dot={{ fill: '#1877F2' }} />
                <Line type="monotone" dataKey="twitter" stroke="#000000" strokeWidth={2} dot={{ fill: '#000000' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Platform-Specific Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#3A4D50]">Platform Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!isLoading && Object.keys(platformData).length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p>No platforms currently connected.</p>
                <p className="text-sm mt-1">Navigate to "Connected Accounts" to link your social profiles and view simulated timeline stats.</p>
              </div>
            ) : (
              <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  {Object.keys(platformData).map((key) => {
                    const iconMap: Record<string, any> = {
                      youtube: Youtube,
                      linkedin: Linkedin,
                      instagram: Instagram,
                      facebook: Facebook,
                      twitter: Twitter
                    };
                    const IconComponent = iconMap[key];
                    return (
                      <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                        {IconComponent && <IconComponent size={16} />}
                        <span className="hidden sm:inline capitalize">{key}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {Object.entries(platformData).map(([key, data]: [string, any]) => (
                  <TabsContent key={key} value={key} className="space-y-6">
                    {/* Platform Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.keys(data.stats).length === 0 || (Object.keys(data.stats).length === 1 && data.stats.info) ? (
                        <div className={`col-span-4 p-4 rounded-lg ${data.bgColor} flex items-center gap-3`}>
                          <span className="text-2xl">⚠️</span>
                          <div>
                            <p className={`font-semibold ${data.textColor}`}>Analytics Unavailable</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {data.stats.info || "Could not fetch data. Please reconnect your account in Connected Accounts."}
                            </p>
                          </div>
                        </div>
                      ) : (
                        Object.entries(data.stats).map(([statKey, statValue]: [string, any]) => (
                          <div key={statKey} className={`p-4 rounded-lg ${data.bgColor}`}>
                            <p className="text-xs text-gray-600 capitalize mb-1">
                              {statKey.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className={`text-2xl font-bold ${data.textColor}`}>{statValue}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Recent Content */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-[#3A4D50] mb-4">Recent Content</h4>
                      <div className="space-y-4">
                        {data.recentContent?.map((content: any, index: number) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              const videoId = content.id || index;
                              console.log(`Navigating to ${key}/${videoId}`);
                              navigate(`/dashboard/analytics/${key}/${videoId}`);
                            }}
                            className="flex items-start justify-between bg-white p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm text-[#3A4D50]">{content.title || content.caption || content.text}</p>
                              <p className="text-xs text-gray-500 mt-1">{content.date}</p>
                            </div>
                            <div className="flex gap-4 ml-4">
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Views</p>
                                <p className="text-sm font-bold text-[#3A4D50]">{content.views || '0'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Likes</p>
                                <p className="text-sm font-bold text-[#3A4D50]">{content.likes || '0'}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </motion.div>
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
            {trend} from last month
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}