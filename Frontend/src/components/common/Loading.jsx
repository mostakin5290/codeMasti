import React from 'react';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

// Default theme for fallback
const defaultAppTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400', // for green checkmarks, etc.
    warningColor: 'text-amber-400',  // for warnings, etc.
    errorColor: 'text-red-400',    // for errors, etc.
    infoColor: 'text-blue-400',      // for info messages, etc.
};

const Loading = () => {
    // Get theme from context
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    // Helper for main background gradient
    const getMainBackgroundGradient = () => `bg-gradient-to-br ${appTheme.gradientFrom} ${appTheme.gradientTo}`;
    // Helper for primary gradient (for text and progress bar)
    const getPrimaryGradient = () => `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')}`;

    return (
        <div className={`min-h-screen flex items-center justify-center ${getMainBackgroundGradient()} ${appTheme.text} relative overflow-hidden`}>
            {/* Animated background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-blue-900/5 to-purple-900/5 animate-pulse"></div>
            
            {/* Floating orbs */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/5 rounded-full animate-ping"></div>
            <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-500/5 rounded-full animate-ping animation-delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-purple-500/5 rounded-full animate-ping animation-delay-2000"></div>
            
            {/* Main loading content */}
            <div className="relative z-10 text-center space-y-8">
                {/* Multi-layered animated spinner */}
                <div className="relative w-28 h-28 mx-auto">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-blue-500 animate-spin-slow"></div>
                    {/* Middle ring */}
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-cyan-400 border-l-blue-400 animate-spin-slow-reverse"></div>
                    {/* Inner ring */}
                    <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-500 border-r-emerald-500 animate-spin-medium"></div>
                    
                    {/* Center icon */}
                    <div className="absolute inset-6 flex items-center justify-center">
                        <svg
                            className={`w-12 h-12 ${appTheme.highlight} animate-pulse`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Pulsing dots indicator */}
                <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce animation-delay-400"></div>
                </div>

                {/* Loading text with animated dots */}
                <div className="space-y-3">
                    <h3 className={`text-3xl font-bold bg-clip-text text-transparent ${getPrimaryGradient()}`}>
                        Authenticating
                        <span className="inline-block ml-1">
                            <span className="animate-fade-in-out">.</span>
                            <span className="animate-fade-in-out animation-delay-200">.</span>
                            <span className="animate-fade-in-out animation-delay-400">.</span>
                        </span>
                    </h3>
                    <p className={`${appTheme.cardText} text-base`}>Securely connecting to your account</p>
                </div>

                {/* Enhanced progress bar */}
                <div className={`w-80 h-2 ${appTheme.cardBg}/50 rounded-full overflow-hidden mx-auto`}>
                    <div className={`h-full ${getPrimaryGradient()} animate-progress shadow-lg`}></div>
                </div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute top-10 left-10 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
            <div className="absolute top-20 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping animation-delay-1000"></div>
            <div className="absolute bottom-20 left-20 w-1 h-1 bg-purple-400 rounded-full animate-ping animation-delay-2000"></div>
            <div className="absolute bottom-10 right-10 w-1 h-1 bg-emerald-400 rounded-full animate-ping animation-delay-3000"></div>
            
            <style jsx>{`
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-400 { animation-delay: 0.4s; }
                .animation-delay-1000 { animation-delay: 1s; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-3000 { animation-delay: 3s; }
                
                .animate-spin-slow { animation: spin 3s linear infinite; }
                .animate-spin-slow-reverse { animation: spin 3s linear infinite reverse; }
                .animate-spin-medium { animation: spin 2s linear infinite; }
                
                .animate-progress {
                    animation: progress 2s ease-in-out infinite;
                }
                
                .animate-fade-in-out {
                    animation: fadeInOut 1.5s ease-in-out infinite;
                }
                
                @keyframes progress {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }
                
                @keyframes fadeInOut {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Loading;