import {
  Users,
  ThumbsUp,
  MessageCircle,
  TrendingUp,
  ArrowUpRight,
  Video,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { dashboardApi, DashboardDataResponse } from "../../services/dashboardApi";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useUser } from "../../contexts/UserContext";

// Custom Tooltip Component with glassmorphism
const CustomTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#121A18]/80 backdrop-blur-md border border-white/5 p-3 rounded-lg shadow-xl shadow-black/20">
        <p className="text-sm font-medium text-white mb-1">{data.name}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="text-xs text-gray-400">Value</span>
          </div>
          <span className="text-sm font-bold text-white">{payload[0].value}</span>
        </div>
        <div className="mt-2 text-xs text-emerald-400/80 font-medium">
          {((payload[0].value / total) * 100).toFixed(1)}% of total
        </div>
      </div>
    );
  }
  return null;
};

export default function Overview() {
  const [data, setData] = useState<DashboardDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await dashboardApi.getDashboardData();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4D50]" />
      </div>
    );
  }

  const totalContent = data.platformDistribution.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-3 h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold tracking-tight text-[#3A4D50]">Dashboard</h2>
        <p className="text-xs text-gray-500">Welcome back{user?.username ? `, ${user.username}` : ''}, here's what's happening with your content.</p>
      </motion.div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat, i) => {
          let IconComponent = Users;
          if (stat.iconType === 'Users') IconComponent = Users;
          if (stat.iconType === 'ThumbsUp') IconComponent = ThumbsUp;
          if (stat.iconType === 'TrendingUp') IconComponent = TrendingUp;
          if (stat.iconType === 'Video') IconComponent = Video;
          if (stat.iconType === 'MessageCircle') IconComponent = MessageCircle;

          return (
            <StatsCard
              key={i}
              title={stat.title}
              value={stat.value}
              icon={IconComponent}
              trend={stat.trend}
              trendUp={stat.trendUp}
              delay={stat.delay}
            />
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          className="col-span-4"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-sm font-semibold text-[#3A4D50] mb-3">Platform Distribution</h3>
            {data.platformDistribution && data.platformDistribution.length > 0 ? (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.platformDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                      style={{ outline: 'none' }}
                      onMouseEnter={(_, index) => {
                        // Hover effect handled by CSS
                      }}
                    >
                      {data.platformDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          style={{
                            outline: 'none',
                            transition: 'opacity 0.3s ease',
                            cursor: 'pointer'
                          }}
                          className="hover:opacity-80"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip total={totalContent} />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
                No active platforms connected. Link an account to see distribution.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="col-span-3"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-3 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-sm font-semibold text-[#3A4D50] mb-2">Recent AI-Generated Posts</h3>
            <div className="space-y-2">
              {data.recentPosts && data.recentPosts.length > 0 ? (
                data.recentPosts.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center p-2 rounded-xl hover:bg-white/50 transition-all cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#8FA58F]/20 to-[#3A4D50]/20 flex items-center justify-center text-[#3A4D50] font-bold text-xs border border-[#8FA58F]/20">
                      <Video size={16} />
                    </div>
                    <div className="ml-3 space-y-0.5 flex-1">
                      <p className="text-xs font-medium leading-none text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.status} • {item.time}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#8FA58F] to-[#7A9080] text-white shadow-sm">
                        Ready
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-gray-400">
                  No recent posts yet. Connect a platform to begin generating.
                </div>
              )}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full mt-1 text-xs py-1.5 h-auto text-[#3A4D50] border-[#8FA58F]/30 hover:bg-gradient-to-r hover:from-[#8FA58F] hover:to-[#7A9080] hover:text-white hover:border-transparent transition-all duration-300"
                >
                  View All Uploads
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, trendUp, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-4 hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="flex flex-row items-center justify-between space-y-0 pb-1">
        <h3 className="text-xs font-medium text-gray-500">
          {title}
        </h3>
        <motion.div
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#8FA58F]/20 to-[#3A4D50]/20 flex items-center justify-center border border-[#8FA58F]/20">
            <Icon className="h-4 w-4 text-[#3A4D50]" />
          </div>
        </motion.div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold text-[#3A4D50] tracking-tight">{value}</div>
        <motion.p
          className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-600'} flex items-center mt-1 font-medium`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.2 }}
        >
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : null}
          </motion.span>
          {trend} from last month
        </motion.p>
      </div>
    </motion.div>
  );
}