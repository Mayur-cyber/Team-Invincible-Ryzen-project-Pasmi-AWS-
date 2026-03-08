import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { authClient } from '../auth';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

export function ProfessionalSignUpPanel() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const isFormValid =
        fullName.length > 0 &&
        email.length > 0 &&
        password.length > 0 &&
        confirmPassword.length > 0 &&
        password === confirmPassword &&
        !isLoading;

    const handleSignup = async () => {
        if (!isFormValid) return;

        try {
            setError(null);
            setIsLoading(true);

            const { error: signUpError } = await authClient.signUp.email({
                email,
                password,
                name: fullName,
            });

            if (signUpError) {
                setError(signUpError.message || 'Signup failed. Please try again.');
                return;
            }

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
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
                toast.success('Successfully signed up with Google');
            } catch (err: any) {
                setError(err.message || "Google authentication failed");
                toast.error('Google sign-up failed');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            setError("Google sign-up was cancelled or failed.");
        }
    });

    const handleGoogleSignUp = () => {
        loginWithGoogle();
    };

    const handleFacebookSignUp = async () => {
        try {
            await authClient.signIn.social({
                provider: 'facebook',
                callbackURL: window.location.origin + '/dashboard',
            });
        } catch (err: any) {
            setError(err.message || 'Facebook sign-up failed.');
        }
    };

    return (
        <div
            className="h-full flex flex-col relative overflow-y-auto"
            style={{ background: '#3C4650' }}
        >
            <div className="flex flex-col px-8 lg:px-[60px] pt-4 pb-8 lg:pt-4 lg:pb-8">
                {/* Logo at top */}
                <div className="flex items-center gap-2 mb-3 mt-2">
                    <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white rotate-45"></div>
                    </div>
                    <span className="text-white font-bold text-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                        PASMI
                    </span>
                </div>

                {/* Welcome Section */}
                <div className="mb-3">
                    <h1 className="text-white font-bold text-[22px] mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Create Account
                    </h1>
                    <p className="text-[11px]" style={{ fontFamily: 'Inter, sans-serif', color: '#92A68A' }}>
                        Sign up to get started with PASMI.
                    </p>
                </div>

                {/* Social Sign Up Buttons */}
                <div className="space-y-2 mb-3">
                    <button
                        type="button"
                        onClick={handleGoogleSignUp}
                        className="w-full h-9 rounded-lg flex items-center justify-center gap-2.5 text-white text-[11px] transition-all duration-200"
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
                        <span style={{ fontFamily: 'Inter, sans-serif' }}>Sign up with Google</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleFacebookSignUp}
                        className="w-full h-9 rounded-lg flex items-center justify-center gap-2.5 text-white text-[11px] transition-all duration-200"
                        style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill="#1877F2" />
                            <path d="M16.671 15.47L17.203 12h-3.328V9.75c0-.949.465-1.875 1.956-1.875h1.513V4.922s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669V12H7.078v3.47h3.047v8.385a12.09 12.09 0 003.75 0V15.47h2.796z" fill="#FFFFFF" />
                        </svg>
                        <span style={{ fontFamily: 'Inter, sans-serif' }}>Sign up with Facebook</span>
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3.5 mb-3">
                    <div className="flex-1 h-[1px]" style={{ background: 'rgba(255, 255, 255, 0.12)' }} />
                    <span className="text-[11px]" style={{ fontFamily: 'Inter, sans-serif', color: '#92A68A' }}>OR</span>
                    <div className="flex-1 h-[1px]" style={{ background: 'rgba(255, 255, 255, 0.12)' }} />
                </div>

                {/* Full Name Field */}
                <div className="mb-2.5">
                    <label className="block text-[10.5px] mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#92A68A' }}>
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onFocus={() => setFocusedField('fullName')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Your full name"
                        className="w-full h-9 rounded-lg px-3.5 text-white placeholder:text-[#6B7280] focus:outline-none transition-all duration-200 text-[11px]"
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: focusedField === 'fullName' ? '1px solid #92A68A' : '1px solid rgba(255, 255, 255, 0.12)',
                            boxShadow: focusedField === 'fullName' ? '0 0 0 2px rgba(146, 166, 138, 0.15)' : 'none'
                        }}
                    />
                </div>

                {/* Email Field */}
                <div className="mb-2.5">
                    <label className="block text-[10.5px] mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#92A68A' }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Your email address"
                        className="w-full h-9 rounded-lg px-3.5 text-white placeholder:text-[#6B7280] focus:outline-none transition-all duration-200 text-[11px]"
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: focusedField === 'email' ? '1px solid #92A68A' : '1px solid rgba(255, 255, 255, 0.12)',
                            boxShadow: focusedField === 'email' ? '0 0 0 2px rgba(146, 166, 138, 0.15)' : 'none'
                        }}
                    />
                </div>

                {/* Password Fields Row */}
                <div className="grid grid-cols-2 gap-3 mb-1.5">
                    <div>
                        <label className="block text-[10.5px] mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#92A68A' }}>
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Password"
                                className="w-full h-9 rounded-lg px-3.5 pr-9 text-white placeholder:text-[#6B7280] focus:outline-none transition-all duration-200 text-[11px]"
                                style={{
                                    fontFamily: 'Inter, sans-serif',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: focusedField === 'password' ? '1px solid #92A68A' : '1px solid rgba(255, 255, 255, 0.12)',
                                    boxShadow: focusedField === 'password' ? '0 0 0 2px rgba(146, 166, 138, 0.15)' : 'none'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#92A68A] hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10.5px] mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#92A68A' }}>
                            Confirm
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onFocus={() => setFocusedField('confirmPassword')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Confirm"
                                className="w-full h-9 rounded-lg px-3.5 pr-9 text-white placeholder:text-[#6B7280] focus:outline-none transition-all duration-200 text-[11px]"
                                style={{
                                    fontFamily: 'Inter, sans-serif',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: focusedField === 'confirmPassword' ? '1px solid #92A68A' : '1px solid rgba(255, 255, 255, 0.12)',
                                    boxShadow: focusedField === 'confirmPassword' ? '0 0 0 2px rgba(146, 166, 138, 0.15)' : 'none'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#92A68A] hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] text-red-400 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Passwords do not match
                    </p>
                )}

                {/* Error Message Display */}
                {error && (
                    <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {error}
                    </div>
                )}

                {/* Sign Up Button */}
                <button
                    onClick={handleSignup}
                    type="button"
                    disabled={!isFormValid}
                    className={`w-full h-9 rounded-lg font-medium text-[11px] mt-4 transition-all duration-200 ${isFormValid ? 'text-white shadow-lg' : 'cursor-not-allowed'
                        }`}
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        background: isFormValid ? '#5F7563' : 'rgba(255, 255, 255, 0.08)',
                        color: isFormValid ? 'white' : 'rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => { if (isFormValid) e.currentTarget.style.background = '#4E6352'; }}
                    onMouseLeave={(e) => { if (isFormValid) e.currentTarget.style.background = '#5F7563'; }}
                >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Bottom Text */}
                <div className="mt-4 text-center text-[11px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span style={{ color: '#92A68A' }}>Already have an account? </span>
                    <Link to="/login" className="text-white hover:underline font-medium" style={{ textDecoration: 'none' }}>
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
