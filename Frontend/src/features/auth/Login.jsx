import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../../api/axiosClient';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { loginUser, googleLoginUser } from '../../features/auth/authSlice';
import { FiMail, FiLock, FiEye, FiCode, FiEyeOff, FiZap, FiArrowRight, FiGithub, FiTwitter, FiFacebook } from 'react-icons/fi';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import SplashCursor from '../../components/animation/SplashCursor';
import { useAnimation } from '../../context/AnimationContext';


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

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
    const { animationEnabled, toggleAnimation } = useAnimation();
    const [showPassword, setShowPassword] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);


    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema)
    });


    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data) => {
        setIsAnimating(true);
        const backendData = {
            emailId: data.email,
            password: data.password
        };
        try {
            // Use unwrap to handle success/error directly
            await dispatch(loginUser(backendData)).unwrap();
            navigate('/home');
        } catch {
            return;
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleSuccess = async (codeResponse) => {
        // The `codeResponse` object contains the authorization code
        if (!codeResponse.code) {
            return;
        }

        try {
            await dispatch(googleLoginUser(codeResponse.code)).unwrap();
            navigate('/home');
        }

        catch (err) {
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
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('GitHub login initiation error:', error);
            toast.error(error.response?.data?.message);
        } finally {
            setIsAnimating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 bg-[url('https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center bg-blend-overlay bg-gray-900/90">
            {/* Animated gradient background */}
            <div className="fixed inset-0 overflow-hidden opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '15s' }}></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent animate-pulse" style={{ animationDuration: '20s', animationDelay: '5s' }}></div>
            </div>

            <div className=' relative z-10'>
                {animationEnabled && (<SplashCursor
                    SIM_RESOLUTION={48}             // Slightly higher for smoother fluid detail
                    DYE_RESOLUTION={384}            // Better color blending
                    CAPTURE_RESOLUTION={384}        // Better rendering while still fast
                    DENSITY_DISSIPATION={7.5}       // Smooth fade-out
                    VELOCITY_DISSIPATION={1.6}      // Smooth velocity decay
                    PRESSURE={0.05}                 // Soft fluid pressure
                    PRESSURE_ITERATIONS={12}        // Enough for smooth pressure but still fast
                    CURL={2.5}                      // Gentle swirls
                    SPLAT_RADIUS={0.18}             // Medium ripple size
                    SPLAT_FORCE={3000}              // Moderate force for a visible but calm splash
                    SHADING={true}                  // Keep shading for depth and realism
                    COLOR_UPDATE_SPEED={4}          // Medium speed color flow
                    BACK_COLOR={{ r: 0, g: 0, b: 0 }} // Black background (or customize)
                    TRANSPARENT={false}             // Solid background for better render performance
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
                <FiZap className={`transition-transform duration-300 ${animationEnabled ? 'rotate-0' : 'rotate-180'}`} />
                {animationEnabled ? 'Animation Off' : 'Animation On'}
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

            <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                            <img src="https://res.cloudinary.com/dcmzfn5oq/image/upload/v1752819939/1000021846-removebg-preview_1_1_fn0ql9.png" alt="logo" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">
                            Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Masti</span>
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/signup"
                            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-[1.02]"
                        >
                            Sign Up
                        </Link>
                    </div>
                </header>

                <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="w-full max-w-md">
                        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-primary/20">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                                <p className="text-white/70">
                                    Sign in to continue your coding journey
                                </p>
                            </div>

                            {/* Social Login Buttons */}
                            <div className="flex justify-center gap-4 mb-6">
                                <button onClick={initiateGoogleLogin} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all hover:border-primary/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C34.2 33.3 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.3 6.2 28.9 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
                                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.3 16.2 18.8 13 24 13c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.3 6.2 28.9 4 24 4 15.5 4 8.4 9.1 6.3 14.7z" />
                                        <path fill="#4CAF50" d="M24 44c5.3 0 10.2-1.8 14-4.9l-6.5-5.3C29.5 35.2 26.9 36 24 36c-5.6 0-10.2-3.6-11.8-8.5l-6.6 5.1C9.9 39.5 16.4 44 24 44z" />
                                        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.4-4.2 6-7.7 7.1l.1.1 6.5 5.3c-.5.3 9.8-6.9 9.8-20z" />
                                    </svg>
                                </button>
                                <button onClick={handleGithubLogin} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all hover:border-primary/50">
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

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                    <label className="block text-sm font-medium text-white/80 mb-1">
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiMail className="h-5 w-5 text-white/50" />
                                        </div>
                                        <input
                                            type="email"
                                            {...register('email')}
                                            className={`bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} focus:ring-2 focus:ring-primary/50 focus:border-primary/50 block w-full pl-10 pr-3 py-3 rounded-lg text-white placeholder-white/30 shadow-sm transition-all duration-200`}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5 text-white/50" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register('password')}
                                            className={`bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} focus:ring-2 focus:ring-primary/50 focus:border-primary/50 block w-full pl-10 pr-10 py-3 rounded-lg text-white placeholder-white/30 shadow-sm transition-all duration-200`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors"
                                        >
                                            {showPassword ? (
                                                <FiEyeOff className="h-5 w-5" />
                                            ) : (
                                                <FiEye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 bg-white/5 border-white/10 rounded focus:ring-primary/50 text-primary"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-white/80">
                                            Remember me
                                        </label>
                                    </div>

                                    <div className="text-sm">
                                        <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                            Forgot your password?
                                        </Link>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all duration-200 ${isAnimating ? 'animate-pulse' : ''}`}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            'Signing in...'
                                        ) : (
                                            <>
                                                Sign in
                                                <FiArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 text-center text-sm text-white/60">
                                Don't have an account?{' '}
                                <Link to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;