import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Youtube, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { Button } from "../ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 bg-[#F0F2EB]">
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(#3A4D50 1px, transparent 1px), linear-gradient(90deg, #3A4D50 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}
      />

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        
        {/* Sphere Animation Placeholder */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-br from-[#8FA58F]/20 to-[#3A4D50]/5 blur-3xl -z-10" />
        
        <div className="relative w-full max-w-4xl mx-auto h-[500px] flex items-center justify-center">
          
          {/* Central Sphere Graphic (Simulated) */}
          <div className="w-64 h-64 md:w-96 md:h-96 rounded-full border border-[#8FA58F]/30 bg-[#8FA58F]/10 backdrop-blur-sm relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 animate-spin-slow"></div>
            <div className="absolute w-full h-full rounded-full border-[0.5px] border-[#8FA58F]/20 scale-125"></div>
            <div className="absolute w-full h-full rounded-full border-[0.5px] border-[#8FA58F]/20 scale-75"></div>
            <div className="absolute w-full h-full rounded-full border-[0.5px] border-[#8FA58F]/20 scale-50"></div>
          </div>

          {/* Floating Icons */}
          <FloatingIcon 
            icon={<Youtube size={32} className="text-red-600" />} 
            delay={0} 
            x={-150} y={-120} 
            className="top-10 left-10 md:top-20 md:left-20"
          />
          <FloatingIcon 
            icon={<Instagram size={32} className="text-pink-600" />} 
            delay={1} 
            x={180} y={-100} 
            className="top-16 right-12 md:top-24 md:right-32"
          />
          <FloatingIcon 
            icon={<Facebook size={32} className="text-blue-600" />} 
            delay={2} 
            x={160} y={140} 
            className="bottom-20 right-16 md:bottom-32 md:right-24"
          />
          <FloatingIcon 
            icon={<Linkedin size={32} className="text-blue-700" />} 
            delay={1.5} 
            x={-170} y={130} 
            className="bottom-16 left-12 md:bottom-24 md:left-24"
          />

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute top-20 left-4 md:left-0 bg-white p-3 rounded-lg shadow-lg flex items-center gap-3 border border-gray-100"
          >
            <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">10K+</div>
            <span className="text-sm font-semibold text-[#3A4D50]">Active Users</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="absolute top-32 right-0 md:-right-10 bg-white p-3 rounded-lg shadow-lg flex items-center gap-3 border border-gray-100"
          >
            <div className="bg-[#3A4D50] text-white text-xs font-bold px-2 py-1 rounded">98%</div>
            <span className="text-sm font-semibold text-[#3A4D50]">Satisfaction Rate</span>
          </motion.div>

           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="absolute bottom-10 md:bottom-20 right-1/4 bg-white p-3 rounded-lg shadow-lg flex items-center gap-3 border border-gray-100"
          >
            <div className="bg-[#8FA58F] text-white text-xs font-bold px-2 py-1 rounded">500M+</div>
            <span className="text-sm font-semibold text-[#3A4D50]">Posts Generated</span>
          </motion.div>
        </div>

        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="text-[#8FA58F] font-medium mb-4">Click the sphere to reveal</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#3A4D50] mb-6 leading-tight">
             Automate Your Social Growth
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Pasmi connects all your social handles. Upload one video, and our AI generates thumbnails, titles, and hashtags tailored for every platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="bg-[#3A4D50] hover:bg-[#2F3E40] text-white px-8">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-[#3A4D50] text-[#3A4D50] hover:bg-[#3A4D50] hover:text-white px-8">
              View Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingIcon({ icon, delay, className, x, y }: { icon: React.ReactNode, delay: number, className?: string, x: number, y: number }) {
  return (
    <motion.div
      className={`absolute w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -15, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
        rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: delay + 1 }
      }}
    >
      {icon}
    </motion.div>
  );
}