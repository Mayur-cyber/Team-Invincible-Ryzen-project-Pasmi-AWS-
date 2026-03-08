import { ProfessionalLoginPanel } from '../components/ProfessionalLoginPanel';
import { ProfessionalHeroSection } from '../components/ProfessionalHeroSection';
import { LoginFooter } from '../components/LoginFooter';
import { useEffect, useState } from 'react';

export function LoginPage() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    return (
        <div className="app-container">
            <div className="main-content">
                {/* Right Panel - Hero Section */}
                <div className="hero-panel">
                    <ProfessionalHeroSection />
                </div>

                {/* Left Panel - Login Form */}
                <div className="login-panel">
                    <ProfessionalLoginPanel />
                </div>
            </div>

            {/* Footer - Only visible on mobile */}
            <LoginFooter />
        </div>
    );
}
