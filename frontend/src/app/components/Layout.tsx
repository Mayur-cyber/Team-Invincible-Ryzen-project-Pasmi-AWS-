import { Link, Outlet, useLocation } from "react-router-dom";
import { User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2EB] flex flex-col font-sans text-gray-800">
      <header className="sticky top-0 z-50 bg-[#3A4D50] text-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-4xl font-script text-[#E0E5D0]">
            Pasmi
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            <a href="#features" className="hover:text-[#8FA58F] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#8FA58F] transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-[#8FA58F] transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-[#8FA58F] transition-colors">Pricing</a>
          </nav>

          {/* User Profile / Login */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm font-medium">Welcome, UMAIR</span>
            <div className="w-8 h-8 rounded-full bg-[#5D7070] flex items-center justify-center text-white font-bold border border-[#8FA58F]">
              U
            </div>
            {/* Alternatively, if not logged in: */}
            {/* <Link to="/login">
              <Button variant="outline" className="text-white border-white hover:bg-white/10">Login</Button>
            </Link> */}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#2F3E40] border-t border-[#4A5D60]">
            <div className="flex flex-col p-4 space-y-4">
              <a href="#features" className="text-white hover:text-[#8FA58F]" onClick={() => setIsMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-white hover:text-[#8FA58F]" onClick={() => setIsMenuOpen(false)}>How It Works</a>
              <a href="#testimonials" className="text-white hover:text-[#8FA58F]" onClick={() => setIsMenuOpen(false)}>Testimonials</a>
              <a href="#pricing" className="text-white hover:text-[#8FA58F]" onClick={() => setIsMenuOpen(false)}>Pricing</a>
              <div className="pt-4 border-t border-[#4A5D60] flex items-center space-x-3">
                 <div className="w-8 h-8 rounded-full bg-[#5D7070] flex items-center justify-center text-white font-bold border border-[#8FA58F]">
                  U
                </div>
                <span className="text-white text-sm">Welcome, UMAIR</span>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-[#3A4D50] text-white py-12 border-t border-[#4A5D60]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1">
              <Link to="/" className="text-4xl font-script text-[#E0E5D0] mb-4 block">
                Pasmi
              </Link>
              <p className="text-gray-300 text-sm max-w-xs">
                AI-powered social media management that helps creators and businesses grow faster.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-[#E0E5D0]">Product</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-[#E0E5D0]">Company</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-[#E0E5D0]">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#4A5D60] flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">© 2026 PASMI. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {/* Social Icons would go here */}
              <div className="w-8 h-8 rounded-full bg-[#4A5D60] flex items-center justify-center hover:bg-[#5D7070] cursor-pointer transition-colors">
                <span className="sr-only">Social</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.53c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
