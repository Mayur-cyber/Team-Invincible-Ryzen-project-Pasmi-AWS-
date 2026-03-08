import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#3A4D50] text-white shadow-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-3xl font-script text-[#E0E5D0]">
          Pasmi
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-200 hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-gray-200 hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#testimonials" className="text-sm text-gray-200 hover:text-white transition-colors">
            Testimonials
          </a>
          <a href="#" className="text-sm text-gray-200 hover:text-white transition-colors">
            Pricing
          </a>
        </nav>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-200 hidden sm:inline">Welcome, UMAIR</span>
          <Link to="/login">
            <Button 
              size="sm" 
              className="bg-[#8FA58F] hover:bg-[#7A907A] text-white rounded-full px-6"
            >
              U
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
