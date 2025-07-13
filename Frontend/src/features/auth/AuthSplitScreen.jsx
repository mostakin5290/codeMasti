import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../../api/axiosClient';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, googleLoginUser, sendOTP, verifyOTP } from '../../features/auth/authSlice';
import {
    FiMail, FiLock, FiEye, FiCode, FiEyeOff, FiZap, FiArrowRight,
    FiGithub, FiUser, FiArrowLeft, FiRefreshCw
} from 'react-icons/fi';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import SplashCursor from '../../components/animation/SplashCursor';
import '../style/AuthSplitScreen.css';

// Zod Schemas (unchanged)
const loginSchema = z.object({
    email: z.string()
        .min(1, { message: "Email is required" })
        .email({ message: "Invalid email address" }),
    password: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: "Password must contain at least one uppercase, lowercase, number, and special character"
        })
});

const signUpSchema = z.object({
    firstName: z.string()
        .min(1, { message: "First name is required" })
        .min(3, { message: "First name must be at least 3 characters" }),
    lastName: z.string().optional(),
    email: z.string()
        .min(1, { message: "Email is required" })
        .email({ message: "Invalid email address" }),
    password: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: "Password must contain at least one uppercase, lowercase, number, and special character"
        }),
    confirmPassword: z.string()
        .min(1, { message: "Please confirm your password" }),
    terms: z.literal(true, {
        errorMap: () => ({ message: "You must accept the terms and conditions" }),
    })
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

const AuthSplitScreen = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, loading, error, otpSent, emailForOTP, otpLoading } = useSelector((state) => state.auth);

    const [isRegisterMode, setIsRegisterMode] = useState(location.pathname === '/signup');
    const [isAnimating, setIsAnimating] = useState(false);
    const [showPasswordLogin, setShowPasswordLogin] = useState(false);
    const [showPasswordRegister, setShowPasswordRegister] = useState(false);
    const [showConfirmPasswordRegister, setShowConfirmPasswordRegister] = useState(false);
    const [showOTPForm, setShowOTPForm] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(300);
    const [canResend, setCanResend] = useState(false);
    const [disAnimation, setDisAnimation] = useState(true);
    
    const otpInputRefs = useRef([]);

    const toggleAnimation = () => {
        setDisAnimation(!disAnimation);
    };

    // React Hook Form instances
    const loginMethods = useForm({ resolver: zodResolver(loginSchema) });
    const registerMethods = useForm({ resolver: zodResolver(signUpSchema) });

    const {
        register: registerLogin,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors },
        reset: resetLoginForm
    } = loginMethods;

    const {
        register: registerSignup,
        handleSubmit: handleSignupSubmit,
        formState: { errors: signupErrors },
        getValues: getSignupValues,
        reset: resetSignupForm
    } = registerMethods;

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        setIsRegisterMode(location.pathname === '/signup');
        resetLoginForm();
        resetSignupForm();
    }, [location.pathname, resetLoginForm, resetSignupForm]);

    useEffect(() => {
        if (otpSent && isRegisterMode) {
            setShowOTPForm(true);
            setTimer(300);
            setCanResend(false);
            toast.success('OTP sent to your email!');
        }
    }, [otpSent, isRegisterMode]);

    useEffect(() => {
        if (showOTPForm && timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [showOTPForm, timer]);

    const onLoginSubmit = async (data) => {
        setIsAnimating(true);
        const backendData = {
            emailId: data.email,
            password: data.password
        };
        try {
            await dispatch(loginUser(backendData)).unwrap();
            navigate('/home');
        } catch (e) {
            console.error("Login submission error:", e);
        } finally {
            setIsAnimating(false);
        }
    };

    const onSignupSubmit = (data) => {
        setIsAnimating(true);
        const backendData = {
            firstName: data.firstName,
            lastName: data.lastName,
            emailId: data.email,
            password: data.password
        };
        dispatch(sendOTP(backendData)).finally(() => {
            setIsAnimating(false);
        });
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            toast.error('Please enter all 6 digits');
            return;
        }
        try {
            await dispatch(verifyOTP({ emailId: emailForOTP, otp: otpString })).unwrap();
            navigate('/home');
        } catch (err) {
            console.error("OTP verification error:", err);
        }
    };

    const handleResendOtp = () => {
        if (!canResend) return;

        const userData = getSignupValues();
        const backendData = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            emailId: userData.email,
            password: userData.password
        };

        dispatch(sendOTP(backendData)).then((result) => {
            if (result.type === 'auth/sendOTP/fulfilled') {
                setTimer(300);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
                toast.success('OTP resent successfully!');
            }
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleGoBack = () => {
        setShowOTPForm(false);
        setOtp(['', '', '', '', '', '']);
    };

    const togglePasswordVisibilityLogin = () => { setShowPasswordLogin(!showPasswordLogin); };
    const togglePasswordVisibilityRegister = () => { setShowPasswordRegister(!showPasswordRegister); };
    const toggleConfirmPasswordVisibilityRegister = () => { setShowConfirmPasswordRegister(!showConfirmPasswordRegister); };

    const handleGoogleSuccess = async (codeResponse) => {
        if (!codeResponse.code) return;
        try {
            await dispatch(googleLoginUser(codeResponse.code)).unwrap();
            navigate('/home');
        } catch (err) {
            toast.error(err);
            console.error("Google login error after dispatch:", err);
        }
    };

    const handleGoogleError = (error) => {
        toast.error("Google login was cancelled or failed.");
    };

    const initiateGoogleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: handleGoogleError,
        flow: 'auth-code',
    });

    const handleGithubLogin = async () => {
        try {
            setIsAnimating(true);
            const response = await axiosClient.get('/user/github');
            if (response.data.success && response.data.url) {
                window.location.href = response.data.url;
            } else {
                toast.error(response.data.message || 'Failed to initiate GitHub login');
            }
        } catch (error) {
            console.error('GitHub login initiation error:', error);
            toast.error(error.response?.data?.message || 'Failed to connect to authentication service');
        } finally {
            setIsAnimating(false);
        }
    };

    if (showOTPForm) {
        return (
            <div className="min-h-screen bg-gray-900 bg-[url('https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center bg-blend-overlay">
                <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="w-full max-w-md">
                            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
                                <button
                                    onClick={handleGoBack}
                                    className="flex items-center text-white/70 hover:text-white mb-6 transition-colors"
                                >
                                    <FiArrowLeft className="mr-2" />
                                    Back to Sign Up
                                </button>

                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiMail className="text-white text-2xl" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
                                    <p className="text-white/70">
                                        We've sent a 6-digit code to
                                    </p>
                                    <p className="text-primary font-medium">
                                        {emailForOTP}
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleVerifyOTP} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-4 text-center">
                                            Enter verification code
                                        </label>
                                        <div className="flex justify-center space-x-3">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => otpInputRefs.current[index] = el}
                                                    type="text"
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                    className="w-12 h-12 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                                                    placeholder="0"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || otp.join('').length !== 6}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Complete Registration'}
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    {!canResend ? (
                                        <p className="text-white/60 text-sm">
                                            Resend code in {formatTime(timer)}
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleResendOtp}
                                            disabled={otpLoading}
                                            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors flex items-center justify-center mx-auto"
                                        >
                                            <FiRefreshCw className={`mr-1 ${otpLoading ? 'animate-spin' : ''}`} />
                                            {otpLoading ? 'Sending...' : 'Resend Code'}
                                        </button>
                                    )}
                                </div>

                                <div className="mt-6 text-center text-sm text-white/60">
                                    Didn't receive the code? Check your spam folder or{' '}
                                    <button
                                        onClick={handleGoBack}
                                        className="text-primary hover:text-primary/80 transition-colors"
                                    >
                                        try a different email
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 bg-[url('https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center bg-blend-overlay bg-gray-900/90">
            {/* Animated gradient background */}
            <div className="fixed inset-0 overflow-hidden opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '15s' }}></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent animate-pulse" style={{ animationDuration: '20s', animationDelay: '5s' }}></div>
            </div>

            <div className='relative z-10'>
                {disAnimation && (<SplashCursor
                    SIM_RESOLUTION={48}
                    DYE_RESOLUTION={384}
                    CAPTURE_RESOLUTION={384}
                    DENSITY_DISSIPATION={7.5}
                    VELOCITY_DISSIPATION={1.6}
                    PRESSURE={0.05}
                    PRESSURE_ITERATIONS={12}
                    CURL={2.5}
                    SPLAT_RADIUS={0.18}
                    SPLAT_FORCE={3000}
                    SHADING={true}
                    COLOR_UPDATE_SPEED={4}
                    BACK_COLOR={{ r: 0, g: 0, b: 0 }}
                    TRANSPARENT={false}
                />
                )}
            </div>
            <button
                onClick={toggleAnimation}
                className="fixed bottom-8 right-8 z-50 px-4 py-2 rounded-full
                bg-gradient-to-r from-primary to-secondary
                text-white font-medium shadow-lg
                hover:shadow-primary/30 transition-all duration-300
                transform hover:scale-105 flex items-center gap-2
                backdrop-blur-sm border border-white/20"
            >
                <FiZap className={`transition-transform duration-300 ${disAnimation ? 'rotate-0' : 'rotate-180'}`} />
                {disAnimation ? 'Animation Off' : 'Animation On'}
            </button>

            {/* Floating particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-gradient-to-br from-primary/20 to-secondary/20"
                        style={{
                            width: `${Math.random() * 8 + 2}px`,
                            height: `${Math.random() * 8 + 2}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `float ${Math.random() * 15 + 10}s linear infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: Math.random() * 0.5 + 0.1
                        }}
                    />
                ))}
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen relative z-10 px-4 sm:px-6 lg:px-8">
                <div className={`auth-container ${isRegisterMode ? 'active' : ''}`}>
                    {/* Login Form */}
                    <div className="auth-form-box login">
                        <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="w-full max-w-sm space-y-6">
                            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                            <p className="text-white/70 mb-8">Sign in to continue your coding journey</p>

                            <div className="flex justify-center gap-4 mb-6">
                                <button type="button" onClick={initiateGoogleLogin} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all hover:border-primary/50" disabled={isAnimating}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C34.2 33.3 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.3 6.2 28.9 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
                                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.3 16.2 18.8 13 24 13c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.3 6.2 28.9 4 24 4 15.5 4 8.4 9.1 6.3 14.7z" />
                                        <path fill="#4CAF50" d="M24 44c5.3 0 10.2-1.8 14-4.9l-6.5-5.3C29.5 35.2 26.9 36 24 36c-5.6 0-10.2-3.6-11.8-8.5l-6.6 5.1C9.9 39.5 16.4 44 24 44z" />
                                        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.4-4.2 6-7.7 7.1l.1.1 6.5 5.3c-.5.3 9.8-6.9 9.8-20z" />
                                    </svg>
                                </button>
                                <button type="button" onClick={handleGithubLogin} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all hover:border-primary/50" disabled={isAnimating}>
                                    <FiGithub className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-transparent text-white/60">or continue with</span>
                                </div>
                            </div>

                            {error && error !== 'An authentication error occurred.' &&
                                (
                                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4 flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span>{typeof error === 'string' ? error : 'Login failed. Please try again.'}</span>
                                    </div>
                                )}

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Email address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiMail className="h-5 w-5 text-white/50" /></div>
                                    <input type="email" {...registerLogin('email')} className={`bg-white/5 border ${loginErrors.email ? 'border-red-500/50' : 'border-white/10'} focus:ring-2 focus:ring-primary/50 focus:border-primary/50 block w-full pl-10 pr-3 py-3 rounded-lg text-white placeholder-white/30 shadow-sm transition-all duration-200`} placeholder="your@email.com" />
                                </div>
                                {loginErrors.email && (<p className="mt-1 text-sm text-red-400">{loginErrors.email.message}</p>)}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiLock className="h-5 w-5 text-white/50" /></div>
                                    <input type={showPasswordLogin ? "text" : "password"} {...registerLogin('password')} className={`bg-white/5 border ${loginErrors.password ? 'border-red-500/50' : 'border-white/10'} focus:ring-2 focus:ring-primary/50 focus:border-primary/50 block w-full pl-10 pr-10 py-3 rounded-lg text-white placeholder-white/30 shadow-sm transition-all duration-200`} placeholder="••••••••" />
                                    <button type="button" onClick={togglePasswordVisibilityLogin} className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors">
                                        {showPasswordLogin ? (<FiEyeOff className="h-5 w-5" />) : (<FiEye className="h-5 w-5" />)}
                                    </button>
                                </div>
                                {loginErrors.password && (<p className="mt-1 text-sm text-red-400">{loginErrors.password.message}</p>)}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 bg-white/5 border-white/10 rounded focus:ring-primary/50 text-primary" />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-white/80">Remember me</label>
                                </div>
                                <div className="text-sm">
                                    <a href="/forgot-password" className="font-medium text-primary hover:text-primary/80 transition-colors">Forgot your password?</a>
                                </div>
                            </div>

                            <div>
                                <button type="submit" className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all duration-200 ${isAnimating ? 'animate-pulse' : ''}`} disabled={loading || isAnimating}>
                                    {loading ? 'Signing in...' : (<><p>Sign in</p> <FiArrowRight className="ml-2 h-4 w-4" /></>)}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Register Form */}
                    <div className="auth-form-box register">
                        <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="w-full max-w-sm space-y-6">
                            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                            <p className="text-white/70 mb-8">Join our amazing community</p>

                            <div className="flex justify-center gap-4 mb-6">
                                <button type="button" onClick={initiateGoogleLogin} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all hover:border-primary/50" disabled={isAnimating}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C34.2 33.3 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.3 6.2 28.9 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
                                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.3 16.2 18.8 13 24 13c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.3 6.2 28.9 4 24 4 15.5 4 8.4 9.1 6.3 14.7z" />
                                        <path fill="#4CAF50" d="M24 44c5.3 0 10.2-1.8 14-4.9l-6.5-5.3C29.5 35.2 26.9 36 24 36c-5.6 0-10.2-3.6-11.8-8.5l-6.6 5.1C9.9 39.5 16.4 44 24 44z" />
                                        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.4-4.2 6-7.7 7.1l.1.1 6.5 5.3c-.5.3 9.8-6.9 9.8-20z" />
                                    </svg>
                                </button>
                                <button type="button" onClick={handleGithubLogin} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all hover:border-primary/50" disabled={isAnimating}>
                                    <FiGithub className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-transparent text-white/60">or sign up with email</span>
                                </div>
                            </div>

                            {error && error !== 'An authentication error occurred.' && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4 flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>{typeof error === 'string' ? error : 'Registration failed. Please try again.'}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1">First Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiUser className="h-5 w-5 text-white/50" /></div>
                                        <input type="text" {...registerSignup('firstName')} className={`bg-white/5 border ${signupErrors.firstName ? 'border-red-500/50' : 'border-white/10'} focus:ring-2 focus:ring-primary/50 focus:border-primary/50 block w-full pl-10 pr-3 py-3 rounded-lg text-white placeholder-white/30 shadow-sm transition-all duration-200`} placeholder="John" />
                                    </div>
                                    {signupErrors.firstName && (<p className="mt-1 text-sm text-red-400">{signupErrors.firstName.message}</p>)}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1">Last Name (Optional)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiUser className="h-5 w-5 text-white/50" /></div>
                                        <input type="text" {...registerSignup('lastName')} className={`bg-white/5 border ${signupErrors.lastName ? 'border-red-500/50' : 'border-white/10'} focus:ring-2 focus:ring-primary/50 focus:border-primary/50 block w-full pl-10 pr-3 py-3 rounded-lg text-white placeholder-white/30 shadow-sm transition-all duration-200`} placeholder="Doe" />
                                    </div>
                                    {signupErrors.lastName && (<p className="mt-1 text-sm text-red-400">{signupErrors.lastName.message}</p>)}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Email address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiMail className="h-5 w-5 text-white/50" /></div>
                                    <input type="email" {...registerSignup('email')} className={`bg-white/5 border ${signupErrors.email ? 'border-red-500/50' : 'border-white/10'} focus:ring-2 focus:ring-primary/50 focus:border-primary/50 block w-full pl-10 pr-3 py-3 rounded-lg text-white placeholder-white/30 shadow-sm transition-all duration-200`} placeholder="your@email.com" />
                                </div>
                                {signupErrors.email && (<p className="mt-1 text-sm text-red-400">{signupErrors.email.message}</p>)}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiLock className="h-5 w-5 text-white/50" /></div>
                                    <input type={showPasswordRegister ? "text" : "password"} {...registerSignup('password')} className={`bg-white/5 border ${signupErrors.password ? 'border-red-500/50' : 'border-white/10'} focus:ring-2 focus:ring-primary/50 focus:border-primary/50 block w-full pl-10 pr-10 py-3 rounded-lg text-white placeholder-white/30 shadow-sm transition-all duration-200`} placeholder="••••••••" />
                                    <button type="button" onClick={togglePasswordVisibilityRegister} className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors">
                                        {showPasswordRegister ? (<FiEyeOff className="h-5 w-5" />) : (<FiEye className="h-5 w-5" />)}
                                    </button>
                                </div>
                                {signupErrors.password && (<p className="mt-1 text-sm text-red-400">{signupErrors.password.message}</p>)}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiLock className="h-5 w-5 text-white/50" /></div>
                                    <input type={showConfirmPasswordRegister ? "text" : "password"} {...registerSignup('confirmPassword')} className={`bg-white/5 border ${signupErrors.confirmPassword ? 'border-red-500/50' : 'border-white/10'} focus:ring-2 focus:ring-primary/50 focus:border-primary/50 block w-full pl-10 pr-10 py-3 rounded-lg text-white placeholder-white/30 shadow-sm transition-all duration-200`} placeholder="••••••••" />
                                    <button type="button" onClick={toggleConfirmPasswordVisibilityRegister} className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors">
                                        {showConfirmPasswordRegister ? (<FiEyeOff className="h-5 w-5" />) : (<FiEye className="h-5 w-5" />)}
                                    </button>
                                </div>
                                {signupErrors.confirmPassword && (<p className="mt-1 text-sm text-red-400">{signupErrors.confirmPassword.message}</p>)}
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="terms" type="checkbox" {...registerSignup('terms')} className="h-4 w-4 bg-white/5 border-white/10 rounded focus:ring-primary/50 text-primary" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="text-white/80">I agree to the{' '}
                                        <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">terms and conditions</a>
                                    </label>
                                    {signupErrors.terms && (<p className="mt-1 text-sm text-red-400">{signupErrors.terms.message}</p>)}
                                </div>
                            </div>

                            <div>
                                <button type="submit" className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all duration-200 ${isAnimating ? 'animate-pulse' : ''}`} disabled={loading || isAnimating}>
                                    {loading ? 'Creating account...' : (<><p>Sign Up</p> <FiArrowRight className="ml-2 h-4 w-4" /></>)}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Toggle Box (Animated Background) */}
                    <div className="auth-toggle-box">
                        {/* Toggle Panels */}
                        <div className="auth-toggle-panel left">
                            <h1 className="text-3xl font-bold text-white mb-2">Hello, Welcome!</h1>
                            <p className="text-white/70 mb-4">Do you have an account?</p>
                            <button className="btn" onClick={() => setIsRegisterMode(true)}>Register</button>
                        </div>

                        <div className="auth-toggle-panel right">
                            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
                            <p className="text-white/70 mb-4">Already have an account?</p>
                            <button className="btn" onClick={() => setIsRegisterMode(false)}>Login</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthSplitScreen;