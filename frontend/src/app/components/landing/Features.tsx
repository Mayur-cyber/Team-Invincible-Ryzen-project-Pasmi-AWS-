import { Zap, BarChart3, TrendingUp, Image as ImageIcon, ArrowRight, UserCheck, CheckCircle, Star } from "lucide-react";
import { Button } from "../ui/button";

export function Features() {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "Automation",
      badge: "10x faster",
      description: "AI automates your entire content workflow from creation to publishing",
      bg: "bg-[#8FA58F]",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      title: "Analytics",
      badge: "99% accuracy",
      description: "Deep insights into performance metrics and audience engagement",
      bg: "bg-[#3A4D50]",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      title: "Growth",
      badge: "300% growth",
      description: "Scale your social presence with AI-powered growth strategies",
      bg: "bg-[#8FA58F]",
    },
    {
      icon: <ImageIcon className="w-8 h-8 text-white" />,
      title: "Thumbnails",
      badge: "85% CTR boost",
      description: "Generate eye-catching thumbnails that maximize click-through rates",
      bg: "bg-[#8FA58F]", // Using consistent green for accent except maybe one
    }
  ];

  return (
    <section id="features" className="py-20 bg-[#F8F9F5]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block bg-[#8FA58F]/20 text-[#3A4D50] px-4 py-1 rounded-full text-sm font-semibold mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3A4D50] mb-4">
            Everything you need to <br />
            <span className="text-[#8FA58F]">dominate social media</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI-powered tools that transform your content strategy and drive real results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center`}>
                  {feature.icon}
                </div>
                <span className="bg-[#8FA58F] text-white text-xs font-bold px-3 py-1 rounded-full">
                  {feature.badge}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-[#3A4D50] mb-3">{feature.title}</h3>
              <p className="text-gray-500 text-sm mb-6 flex-grow">{feature.description}</p>
              
              <a href="#" className="flex items-center text-[#3A4D50] font-semibold text-sm hover:text-[#8FA58F] transition-colors group">
                Learn more <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-[#8FA58F]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#3A4D50]">
              <UserCheck />
            </div>
            <h4 className="text-3xl font-bold text-[#3A4D50] mb-1">10K+</h4>
            <p className="text-gray-500 text-sm">Active Users</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
             <div className="w-12 h-12 bg-[#8FA58F]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#3A4D50]">
              <CheckCircle />
            </div>
            <h4 className="text-3xl font-bold text-[#3A4D50] mb-1">1M+</h4>
            <p className="text-gray-500 text-sm">Posts Generated</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
             <div className="w-12 h-12 bg-[#8FA58F]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#3A4D50]">
              <Star />
            </div>
            <h4 className="text-3xl font-bold text-[#3A4D50] mb-1">4.9/5</h4>
            <p className="text-gray-500 text-sm">User Rating</p>
          </div>
        </div>
      </div>
    </section>
  );
}
