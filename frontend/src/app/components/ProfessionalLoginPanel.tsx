import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../auth';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

export function ProfessionalLoginPanel() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const isFormValid = email.length > 0 && password.length > 0 && !isLoading;

    const handleLogin = async () => {
        if (!isFormValid) return;

        try {
            setError(null);
            setIsLoading(true);
            const { error: signInError } = await authClient.signIn.email({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message || 'Login failed. Please check your credentials.');
                return;
            }

            // Navigate immediately - the smarter DashboardLayout guard will now 
            // wait for UserContext to finish as long as it sees the token in localStorage
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (credentialResponse) => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/auth/google", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token: credentialResponse.access_token }),
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.detail || "Google authentication failed");
                }

                localStorage.setItem("token", data.access_token);
                window.dispatchEvent(new Event('auth-change'));

                navigate('/dashboard');
                toast.success('Successfully logged in with Google');
            } catch (err: any) {
                setError(err.message || "Google authentication failed");
                toast.error('Google login failed');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            setError("Google login was cancelled or failed.");
        }
    });

    const handleGoogleSignIn = () => {
        loginWithGoogle();
    };

    const handleFacebookSignIn = async () => {
        try {
            await authClient.signIn.social({
                provider: 'facebook',
                callbackURL: window.location.origin + '/dashboard',
            });
        } catch (err: any) {
            setError(err.message || 'Facebook sign-in failed.');
        }
    };

    return (
        <div
            className="min-h-full flex flex-col relative"
            style={{ background: '#3C4650' }}
        >
            <div className="flex flex-col px-8 lg:px-[60px] pt-4 pb-8 lg:pt-4 lg:pb-8">
                {/* Logo at top */}
                <div className="flex items-center gap-3 mb-1">
                    <div className="flex items-center gap-2 mb-3 mt-2">
                        <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
                        </div>
                        <span className="text-white font-bold text-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                            PASMI
                        </span>
                    </div>
                </div>

                {/* Welcome Section */}
                <div className="mb-4">
                    <h1
                        className="text-white font-bold text-[26px] mb-1"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Welcome!
                    </h1>
                    <p
                        className="text-[12px]"
                        style={{ fontFamily: 'Inter, sans-serif', color: '#92A68A' }}
                    >
                        Log in to PASMI to continue to your dashboard.
                    </p>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-2 mb-4">
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full h-10 rounded-lg flex items-center justify-center gap-3 text-white text-[12px] transition-all duration-200"
                        style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span style={{ fontFamily: 'Inter, sans-serif' }}>Log in with Google</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleFacebookSignIn}
                        className="w-full h-10 rounded-lg flex items-center justify-center gap-3 text-white text-[12px] transition-all duration-200"
                        style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill="#1877F2" />
                            <path d="M16.671 15.47L17.203 12h-3.328V9.75c0-.949.465-1.875 1.956-1.875h1.513V4.922s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669V12H7.078v3.47h3.047v8.385a12.09 12.09 0 003.75 0V15.47h2.796z" fill="#FFFFFF" />
                        </svg>
                        <span style={{ fontFamily: 'Inter, sans-serif' }}>Log in with Facebook</span>
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 h-[1px]" style={{ background: 'rgba(255, 255, 255, 0.12)' }} />
                    <span className="text-[12px]" style={{ fontFamily: 'Inter, sans-serif', color: '#92A68A' }}>OR</span>
                    <div className="flex-1 h-[1px]" style={{ background: 'rgba(255, 255, 255, 0.12)' }} />
                </div>

                {/* Email Field */}
                <div className="mb-2.5">
                    <label className="block text-[11px] mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#92A68A' }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Your email address"
                        className="w-full h-10 rounded-lg px-4 text-white placeholder:text-[#6B7280] focus:outline-none transition-all duration-200"
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: focusedField === 'email' ? '1px solid #92A68A' : '1px solid rgba(255, 255, 255, 0.12)',
                            boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(146, 166, 138, 0.15)' : 'none'
                        }}
                    />
                </div>

                {/* Password Field */}
                <div className="mb-1.5">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px]" style={{ fontFamily: 'Inter, sans-serif', color: '#92A68A' }}>
                            Password
                        </label>
                        <button className="text-[11px] hover:underline transition-colors" style={{ fontFamily: 'Inter, sans-serif', color: '#92A68A' }}>
                            Forget password?
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Your password"
                            className="w-full h-10 rounded-lg px-4 pr-12 text-white placeholder:text-[#6B7280] focus:outline-none transition-all duration-200"
                            style={{
                                fontFamily: 'Inter, sans-serif',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: focusedField === 'password' ? '1px solid #92A68A' : '1px solid rgba(255, 255, 255, 0.12)',
                                boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(146, 166, 138, 0.15)' : 'none'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#92A68A] hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="mb-2 p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {error}
                    </div>
                )}

                {/* Login Button */}
                <button
                    type="button"
                    onClick={handleLogin}
                    disabled={!isFormValid}
                    className={`w-full h-10 rounded-lg font-medium text-[12px] mt-3 transition-all duration-200 ${isFormValid ? 'text-white shadow-lg' : 'cursor-not-allowed'
                        }`}
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        background: isFormValid ? '#5F7563' : 'rgba(255, 255, 255, 0.08)',
                        color: isFormValid ? 'white' : 'rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => { if (isFormValid) e.currentTarget.style.background = '#4E6352'; }}
                    onMouseLeave={(e) => { if (isFormValid) e.currentTarget.style.background = '#5F7563'; }}
                >
                    {isLoading ? 'Logging in...' : 'Log in'}
                </button>

                {/* Bottom Text */}
                <div className="mt-5 text-center text-[12px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span style={{ color: '#92A68A' }}>Don't have an account? </span>
                    <Link to="/signup" className="text-white hover:underline font-medium" style={{ textDecoration: 'none' }}>
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
