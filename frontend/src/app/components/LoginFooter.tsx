import { Share2, Linkedin, Youtube } from 'lucide-react';

export function LoginFooter() {
    return (
        <footer className="footer-section">
            <div className="footer-content">
                {/* Left - Brand */}
                <div className="footer-brand">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
                            <div className="w-3.5 h-3.5 border-2 border-white rotate-45"></div>
                        </div>
                        <span className="text-white font-semibold text-base">PASMI</span>
                    </div>
                    <p className="text-[#C4CEC7] text-[13px] leading-relaxed max-w-xs">
                        AI-powered social media management that helps creators and businesses grow faster.
                    </p>
                </div>

                {/* Product */}
                <div className="footer-column">
                    <h3 className="footer-heading">Product</h3>
                    <ul className="footer-links">
                        <li><a href="#features">Features</a></li>
                        <li><a href="#pricing">Pricing</a></li>
                        <li><a href="#integrations">Integrations</a></li>
                        <li><a href="#api">API</a></li>
                    </ul>
                </div>

                {/* Company */}
                <div className="footer-column">
                    <h3 className="footer-heading">Company</h3>
                    <ul className="footer-links">
                        <li><a href="#about">About Us</a></li>
                        <li><a href="#blog">Blog</a></li>
                        <li><a href="#careers">Careers</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>

                {/* Legal */}
                <div className="footer-column">
                    <h3 className="footer-heading">Legal</h3>
                    <ul className="footer-links">
                        <li><a href="#privacy">Privacy Policy</a></li>
                        <li><a href="#terms">Terms of Service</a></li>
                        <li><a href="#cookie">Cookie Policy</a></li>
                        <li><a href="#gdpr">GDPR</a></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-8 mt-12 pt-8 border-t border-white/10">
                <p className="text-[#C4CEC7] text-[13px]">
                    © 2024 PASMI. All rights reserved.
                </p>
                <div className="flex gap-4">
                    <a href="#share" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#C4CEC7] hover:text-white transition-all" aria-label="Share">
                        <Share2 size={16} />
                    </a>
                    <a href="#linkedin" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#C4CEC7] hover:text-white transition-all" aria-label="LinkedIn">
                        <Linkedin size={16} />
                    </a>
                    <a href="#youtube" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#C4CEC7] hover:text-white transition-all" aria-label="YouTube">
                        <Youtube size={16} />
                    </a>
                </div>
            </div>
        </footer>
    );
}
