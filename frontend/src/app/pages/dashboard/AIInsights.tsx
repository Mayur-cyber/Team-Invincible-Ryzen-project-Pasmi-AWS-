import { motion } from "motion/react";
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Users, 
  Target,
  Lightbulb,
  Calendar,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function AIInsights() {
  const insights = [
    {
      type: "success",
      icon: TrendingUp,
      title: "Optimal Posting Time Detected",
      description: "Your audience is most active on weekdays between 6-8 PM. Consider scheduling posts during this window for maximum engagement.",
      impact: "+32% engagement potential",
      color: "from-green-500 to-emerald-600"
    },
    {
      type: "warning",
      icon: Clock,
      title: "Posting Frequency Alert",
      description: "You've been posting less frequently this month. Maintaining consistent content flow can help retain audience attention.",
      impact: "3 posts this week vs 7 last week",
      color: "from-amber-500 to-orange-600"
    },
    {
      type: "info",
      icon: Users,
      title: "Audience Growth Pattern",
      description: "Your Instagram followers show strong engagement with tutorial content. Consider creating more educational videos.",
      impact: "+18% follower retention",
      color: "from-blue-500 to-cyan-600"
    },
    {
      type: "success",
      icon: Target,
      title: "Hashtag Performance",
      description: "Posts with #automation and #productivity hashtags perform 42% better than average. Keep using trending tech tags.",
      impact: "+42% reach",
      color: "from-purple-500 to-pink-600"
    }
  ];

  const recommendations = [
    {
      title: "Create Tutorial Series",
      description: "Based on engagement patterns, tutorial videos receive 2.3x more watch time",
      priority: "High",
      icon: Lightbulb
    },
    {
      title: "Optimize Video Length",
      description: "Your best performing videos average 8-12 minutes. Consider this duration for future content.",
      priority: "Medium",
      icon: Clock
    },
    {
      title: "Cross-Platform Strategy",
      description: "YouTube content performs well when repurposed for Instagram Reels within 24 hours",
      priority: "High",
      icon: Zap
    },
    {
      title: "Engagement Window",
      description: "Respond to comments within first 2 hours of posting to boost algorithm visibility",
      priority: "Medium",
      icon: Calendar
    }
  ];

  const contentSuggestions = [
    {
      topic: "Social Media Automation Tools 2026",
      trend: "Rising",
      searchVolume: "24.5K",
      difficulty: "Medium"
    },
    {
      topic: "AI Content Creation Best Practices",
      trend: "Stable",
      searchVolume: "18.2K",
      difficulty: "Low"
    },
    {
      topic: "Influencer Marketing Strategies",
      trend: "Rising",
      searchVolume: "32.1K",
      difficulty: "High"
    },
    {
      topic: "YouTube Growth Hacks 2026",
      trend: "Rising",
      searchVolume: "41.3K",
      difficulty: "Medium"
    }
  ];

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold tracking-tight text-[#3A4D50]">AI-Powered Insights</h2>
        <p className="text-sm text-gray-500">Intelligent recommendations to boost your content performance</p>
      </motion.div>

      {/* AI Insights Cards */}
      <div className="grid gap-3 md:grid-cols-2">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-4 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-start gap-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className={`h-10 w-10 rounded-xl bg-gradient-to-br ${insight.color} flex items-center justify-center text-white shrink-0`}
              >
                <insight.icon className="h-5 w-5" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#3A4D50] mb-1">{insight.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">{insight.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    insight.type === 'success' ? 'bg-green-100 text-green-700' :
                    insight.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {insight.impact}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 hover:shadow-2xl transition-all duration-300"
        >
          <h3 className="text-base font-semibold text-[#3A4D50] mb-3 flex items-center gap-2">
            <Brain size={18} className="text-[#8FA58F]" />
            Smart Recommendations
          </h3>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-[#8FA58F]/10 hover:to-[#3A4D50]/5 border border-gray-200/50 hover:border-[#8FA58F]/30 transition-all cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#8FA58F]/20 to-[#3A4D50]/20 flex items-center justify-center shrink-0">
                  <rec.icon size={16} className="text-[#3A4D50]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-semibold text-[#3A4D50]">{rec.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      rec.priority === 'High' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{rec.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trending Content Ideas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 hover:shadow-2xl transition-all duration-300"
        >
          <h3 className="text-base font-semibold text-[#3A4D50] mb-3 flex items-center gap-2">
            <Zap size={18} className="text-[#8FA58F]" />
            Trending Content Ideas
          </h3>
          <div className="space-y-2">
            {contentSuggestions.map((content, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-[#8FA58F]/10 hover:to-[#3A4D50]/5 border border-gray-200/50 hover:border-[#8FA58F]/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-[#3A4D50] flex-1">{content.topic}</h4>
                  <div className="flex items-center gap-1">
                    {content.trend === "Rising" ? (
                      <ArrowUpRight size={14} className="text-green-600" />
                    ) : (
                      <ArrowDownRight size={14} className="text-gray-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      content.trend === "Rising" ? "text-green-600" : "text-gray-500"
                    }`}>
                      {content.trend}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {content.searchVolume}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className={`font-medium ${
                    content.difficulty === 'Low' ? 'text-green-600' :
                    content.difficulty === 'Medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {content.difficulty}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-3"
          >
            <Button 
              variant="outline" 
              className="w-full text-xs text-[#3A4D50] border-[#8FA58F]/30 hover:bg-gradient-to-r hover:from-[#8FA58F] hover:to-[#7A9080] hover:text-white hover:border-transparent transition-all duration-300"
            >
              Generate More Ideas
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Performance Prediction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-gradient-to-br from-[#3A4D50] to-[#2F3E40] text-white shadow-2xl rounded-2xl p-4 backdrop-blur-xl border border-white/10"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
              <Target size={18} />
              Next Post Performance Prediction
            </h3>
            <p className="text-xs text-gray-300">AI-powered forecast based on your posting history and trends</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Expected Views", value: "24.5K", change: "+15%" },
            { label: "Engagement Rate", value: "8.7%", change: "+2.3%" },
            { label: "New Followers", value: "340", change: "+22%" },
            { label: "Share Potential", value: "High", change: "92%" }
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:border-[#8FA58F]/50 transition-all"
            >
              <p className="text-xs text-gray-300 mb-1">{metric.label}</p>
              <p className="text-lg font-bold text-white">{metric.value}</p>
              <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                <ArrowUpRight size={12} />
                {metric.change}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
