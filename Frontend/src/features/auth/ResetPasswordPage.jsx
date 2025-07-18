import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../../api/axiosClient';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCode, FiArrowRight, FiZap } from 'react-icons/fi';
import { toast } from 'react-toastify';
import SplashCursor from '../../components/animation/SplashCursor'; // Assuming this component exists


const resetPasswordSchema = z.object({
    email: z.string()
        .min(1, { message: "Email is required" })
        .email({ message: "Invalid email address" })
        .transform(val => val.trim().toLowerCase()), // Add trim and toLowerCase
    otp: z.string()
        .min(6, { message: "OTP must be 6 digits" })
        .max(6, { message: "OTP must be 6 digits" })
        .regex(/^\d+$/, { message: "OTP must contain only digits" })
        .transform(val => val.trim()), // Add trim here
    newPassword: z.string()
        .min(8, { message: "New password must be at least 8 characters" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: "Password must contain at least one uppercase, lowercase, number, and special character"
        }),
    confirmNewPassword: z.string()
        .min(1, { message: "Confirm password is required" })
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
});

// ... rest of the component

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [disAnimation, setDisAnimation] = useState(true);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: location.state?.email || '', // Pre-fill email if passed from ForgotPasswordPage
        }
    });

    // If email is passed via state, ensure the form field is updated
    useEffect(() => {
        if (location.state?.email) {
            setValue('email', location.state.email);
        }
    }, [location.state, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await axiosClient.post('/user/reset-password', {
                emailId: data.email,
                otp: data.otp,
                newPassword: data.newPassword,
                confirmNewPassword: data.confirmNewPassword
            });
            toast.success(response.data.message || "Your password has been reset successfully!");
            navigate('/login'); // Redirect to login page
        } catch (err) {
            console.error('Reset password error:', err);
            const errorMessage = err.response?.data?.message || "Failed to reset password. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleAnimation = () => {
        setDisAnimation(!disAnimation);
    };

    return (
        <div className="min-h-screen bg-gray-900 bg-[url('https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center bg-blend-overlay bg-gray-900/90">
            {/* Animated gradient background */}
            <div className="fixed inset-0 overflow-hidden opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '15s' }}></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent animate-pulse" style={{ animationDuration: '20s', animationDelay: '5s' }}></div>
            </div>

            <div className=' relative z-10'>
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

            <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                            <FiCode className="text-white text-xl" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">
                            Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Masti</span>
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-[1.02]"
                        >
                            Log In
                        </Link>
                    </div>
                </header>

                <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="w-full max-w-md">
                        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-primary/20">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">Reset Your Password</h1>
                                <p className="text-white/70">
                                    Enter the code sent to your email and your new password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                            readOnly // Email should generally be read-only here
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
                                        Verification Code (OTP)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiCode className="h-5 w-5 text-white/50" />
                                        </div>
                                        <input
                                            type="text"
                                            {...register('otp')}
                                            className={`bg-white/5 border ${errors.otp ? 'border-red-500/50' : 'border-white/10'} focus:ring-2 focus:ring-primary/50 focus:border-primary/50 block w-full pl-10 pr-3 py-3 rounded-lg text-white placeholder-white/30 shadow-sm transition-all duration-200`}
                                            placeholder="e.g., 123456"
                                            maxLength={6}
                                        />
                                    </div>
                                    {errors.otp && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {errors.otp.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5 text-white/50" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register('newPassword')}
                                            className={`bg-white/5 border ${errors.newPassword ? 'border-red-500/50' : 'border-white/10'} focus:ring-2 focus:ring-primary/50 focus:border-primary/50 block w-full pl-10 pr-10 py-3 rounded-lg text-white placeholder-white/30 shadow-sm transition-all duration-200`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors"
                                        >
                                            {showPassword ? (
                                                <FiEyeOff className="h-5 w-5" />
                                            ) : (
                                                <FiEye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.newPassword && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {errors.newPassword.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5 text-white/50" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            {...register('confirmNewPassword')}
                                            className={`bg-white/5 border ${errors.confirmNewPassword ? 'border-red-500/50' : 'border-white/10'} focus:ring-2 focus:ring-primary/50 focus:border-primary/50 block w-full pl-10 pr-10 py-3 rounded-lg text-white placeholder-white/30 shadow-sm transition-all duration-200`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <FiEyeOff className="h-5 w-5" />
                                            ) : (
                                                <FiEye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmNewPassword && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {errors.confirmNewPassword.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed animate-pulse' : ''}`}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            'Resetting Password...'
                                        ) : (
                                            <>
                                                Reset Password
                                                <FiArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 text-center text-sm text-white/60">
                                Remember your password?{' '}
                                <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                    Log in
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;