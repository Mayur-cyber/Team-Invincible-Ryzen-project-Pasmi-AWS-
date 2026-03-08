import { Youtube, Instagram, Twitter, Facebook, Linkedin, Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function IntegrationsAndTestimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator • 500K followers",
      content: "PASMI cut my content creation time by 80%. The AI is incredibly accurate and understands my brand voice perfectly.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    },
    {
      name: "Marcus Rodriguez",
      role: "Marketing Director • Tech Startup",
      content: "Our engagement increased 300% in just 2 months. This tool is a complete game-changer for our social strategy.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    },
    {
      name: "Emily Watson",
      role: "Social Media Manager • Agency",
      content: "The thumbnail generator alone is worth the subscription. Incredible results and saves us hours every week.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    }
  ];

  return (
    <section className="bg-[#3A4D50] text-white py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute right-0 top-0 w-96 h-96 bg-white rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute left-0 bottom-0 w-96 h-96 bg-[#8FA58F] rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Integrations */}
        <div className="text-center mb-24">
          <div className="inline-block border border-white/20 px-4 py-1 rounded-full text-sm font-medium mb-6 text-gray-300">
            Integrations
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            Works with all your favorite platforms
          </h2>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            Seamlessly publish to multiple social networks with one click
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <PlatformCard icon={<Youtube size={32} className="text-red-500" />} name="YouTube" />
            <PlatformCard icon={<Instagram size={32} className="text-pink-500" />} name="Instagram" />
            <PlatformCard icon={<Twitter size={32} className="text-white" />} name="X (Twitter)" />
            <PlatformCard icon={<Facebook size={32} className="text-blue-500" />} name="Facebook" />
            <PlatformCard icon={<Linkedin size={32} className="text-blue-400" />} name="LinkedIn" />
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-16">
          <div className="inline-block border border-white/20 px-4 py-1 rounded-full text-sm font-medium mb-6 text-gray-300">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            Loved by creators just like you
          </h2>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            See what our community has to say about transforming their social media presence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-12 w-12 border-2 border-[#8FA58F]">
                  <AvatarImage src={t.image} alt={t.name} />
                  <AvatarFallback>{t.name[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
              
              <div className="flex gap-1 mb-4 text-[#8FA58F]">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed italic">
                "{t.content}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformCard({ icon, name }: { icon: React.ReactNode, name: string }) {
  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-all group-hover:scale-105">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{name}</span>
    </div>
  );
}
