import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { CheckCircle2, PlayCircle } from "lucide-react";

export function CTA() {
  return (
    <section className="bg-[#F0F2EB] py-32 relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-[#8FA58F]/10 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-block bg-[#8FA58F]/20 text-[#3A4D50] px-4 py-1 rounded-full text-sm font-semibold mb-8">
          Ready to Transform Your Social Media?
        </div>
        
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#3A4D50] mb-8 leading-tight">
          Start creating with <br />
          <span className="text-[#8FA58F]">AI today</span>
        </h2>
        
        <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-12">
          Join thousands of creators who have already revolutionized their content strategy with PASMI's AI-powered tools.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
          <Link to="/login">
            <Button size="lg" className="bg-[#8FA58F] hover:bg-[#7D917D] text-white px-8 h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              Get Started Free
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-gray-300 text-[#3A4D50] hover:bg-white px-8 h-14 text-lg rounded-xl flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            Watch Demo
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-[#8FA58F] w-5 h-5" />
            No credit card required
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-[#8FA58F] w-5 h-5" />
            Free 14-day trial
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-[#8FA58F] w-5 h-5" />
            Cancel anytime
          </div>
        </div>
      </div>
    </section>
  );
}