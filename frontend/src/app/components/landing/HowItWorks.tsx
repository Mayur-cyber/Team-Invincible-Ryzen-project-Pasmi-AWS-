import { UploadCloud, Sparkles, TrendingUp, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      id: "01",
      icon: <UploadCloud className="w-8 h-8 text-white" />,
      title: "Upload your content",
      description: "Drag and drop your video, image, or text content. Supports all major formats including MP4, JPG, PNG, and more.",
      bg: "bg-[#8FA58F]" // Sage Green
    },
    {
      id: "02",
      icon: <Sparkles className="w-8 h-8 text-white" />,
      title: "AI generates everything",
      description: "Our advanced AI analyzes your content and creates optimized titles, captions, thumbnails, and hashtags in seconds.",
      bg: "bg-[#8FA58F]" 
    },
    {
      id: "03",
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      title: "Publish & grow",
      description: "Review, customize, and publish to all your social channels instantly. Track performance in real-time.",
      bg: "bg-[#3A4D50]" // Dark
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#F0F2EB]">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-20">
           <div className="inline-block bg-[#8FA58F]/20 text-[#3A4D50] px-4 py-1 rounded-full text-sm font-semibold mb-6">
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3A4D50] mb-6">
            From upload to viral in 3 steps
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pasmi simplifies your social media workflow so you can focus on creating great content.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-dashed border-t-2 border-gray-300 -z-10"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className={`w-24 h-24 ${step.bg} rounded-2xl flex items-center justify-center shadow-lg mb-8 transform transition-transform group-hover:scale-110 relative z-10`}>
                {step.icon}
                <div className="absolute -top-3 -right-3 bg-white text-[#3A4D50] font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-md border border-gray-100">
                  {step.id}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-[#3A4D50] mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed px-4 text-sm">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <a href="#" className="inline-flex items-center text-[#3A4D50] font-semibold hover:text-[#8FA58F] transition-colors border-b-2 border-[#3A4D50] hover:border-[#8FA58F] pb-1">
            See it in action <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
