import React from 'react';
import { useTheme } from '../../context/ThemeContext';

// Default theme for the app context. This will be merged with actual theme.
const defaultAppTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

// Modern Animated Logo Component
const AnimatedLogo = ({ appTheme }) => {
    return (
        <div className="flex-shrink-0">
            <div className={`flex items-center text-3xl font-bold ${appTheme.text} focus:outline-none rounded-lg transition-all duration-300`}>
                <div className="relative">
                    {/* Animated background for "Code" */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-20 blur-sm animate-pulse rounded-lg"></div>
                    <span 
                        className={`relative bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse`}
                        style={{
                            animation: 'glow 2s ease-in-out infinite alternate'
                        }}
                    >
                        Code
                    </span>
                </div>
                <span className={`${appTheme.text} ml-1 transition-colors duration-300`}>Masti</span>
            </div>
        </div>
    );
};

// Modern Particle Animation
const ParticleRing = ({ size, delay }) => {
    return (
        <div 
            className="absolute inset-0 rounded-full border-2 border-cyan-400/20"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                animation: `particleRing 3s ease-in-out infinite ${delay}s`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }}
        />
    );
};

// Floating Dots Animation
const FloatingDots = ({ appTheme }) => {
    const dots = Array.from({ length: 6 }, (_, i) => i);
    
    return (
        <div className="absolute inset-0">
            {dots.map((dot, index) => (
                <div
                    key={index}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        background: `linear-gradient(45deg, ${appTheme.highlight.includes('cyan') ? '#06b6d4' : '#3b82f6'}, ${appTheme.highlightSecondary.includes('blue') ? '#3b82f6' : '#8b5cf6'})`,
                        animation: `floatingDot 2s ease-in-out infinite ${index * 0.3}s`,
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${index * 60}deg) translateY(-40px)`
                    }}
                />
            ))}
        </div>
    );
};

// Modern Progress Bar
const ProgressBar = ({ appTheme }) => {
    return (
        <div className="w-64 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
                style={{
                    animation: 'progressBar 2s ease-in-out infinite'
                }}
            />
        </div>
    );
};

const LoadingSpinner = ({ message = 'Loading...', appTheme: propAppTheme }) => {
    const { theme: contextTheme } = useTheme() || {};
    // Properly merge themes: default -> context -> prop
    const appTheme = { ...defaultAppTheme, ...contextTheme, ...(propAppTheme || {}) };

    return (
        <>
            {/* Add custom CSS animations */}
            <style jsx>{`
                @keyframes modernSpin {
                    0% { transform: rotate(0deg) scale(1); }
                    50% { transform: rotate(180deg) scale(1.1); }
                    100% { transform: rotate(360deg) scale(1); }
                }
                
                @keyframes glow {
                    0% { text-shadow: 0 0 5px rgba(6, 182, 212, 0.5); }
                    100% { text-shadow: 0 0 20px rgba(6, 182, 212, 0.8), 0 0 30px rgba(6, 182, 212, 0.6); }
                }
                
                @keyframes particleRing {
                    0% { transform: translate(-50%, -50%) scale(0.5) rotate(0deg); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1) rotate(180deg); opacity: 0.7; }
                    100% { transform: translate(-50%, -50%) scale(1.5) rotate(360deg); opacity: 0; }
                }
                
                @keyframes floatingDot {
                    0%, 100% { transform: translate(-50%, -50%) rotate(var(--rotate)) translateY(-40px) scale(0.8); opacity: 0.6; }
                    50% { transform: translate(-50%, -50%) rotate(calc(var(--rotate) + 180deg)) translateY(-60px) scale(1.2); opacity: 1; }
                }
                
                @keyframes progressBar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                }
                
                @keyframes breathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            <div
                className={`flex flex-col justify-center items-center h-full w-full p-8 space-y-8 ${appTheme.background} ${appTheme.text} relative overflow-hidden`}
                aria-label="Loading content"
            >
                {/* Animated background gradient */}
                <div 
                    className="absolute inset-0 opacity-5"
                    style={{
                        background: `linear-gradient(45deg, ${appTheme.highlight.includes('cyan') ? '#06b6d4' : '#3b82f6'}, ${appTheme.highlightSecondary.includes('blue') ? '#3b82f6' : '#8b5cf6'}, ${appTheme.highlightTertiary.includes('purple') ? '#8b5cf6' : '#06b6d4'})`,
                        backgroundSize: '400% 400%',
                        animation: 'shimmer 4s ease-in-out infinite'
                    }}
                />

                {/* Main spinner container */}
                <div className="relative">
                    {/* Outer rotating ring */}
                    <div 
                        className="w-24 h-24 rounded-full border-4 border-transparent relative"
                        style={{
                            background: `conic-gradient(from 0deg, transparent, ${appTheme.highlight.includes('cyan') ? '#06b6d4' : '#3b82f6'}, transparent)`,
                            animation: 'modernSpin 2s linear infinite'
                        }}
                    >
                        {/* Inner glow effect */}
                        <div 
                            className="absolute inset-2 rounded-full blur-sm"
                            style={{
                                background: `radial-gradient(circle, ${appTheme.highlight.includes('cyan') ? '#06b6d4' : '#3b82f6'}20, transparent 70%)`,
                                animation: 'breathe 2s ease-in-out infinite'
                            }}
                        />
                    </div>

                    {/* Particle rings */}
                    <ParticleRing size={120} delay={0} />
                    <ParticleRing size={140} delay={0.5} />
                    <ParticleRing size={160} delay={1} />

                    {/* Floating dots */}
                    <FloatingDots appTheme={appTheme} />

                    {/* Center pulse */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                            className="w-6 h-6 rounded-full"
                            style={{
                                background: `linear-gradient(45deg, ${appTheme.highlight.includes('cyan') ? '#06b6d4' : '#3b82f6'}, ${appTheme.highlightSecondary.includes('blue') ? '#3b82f6' : '#8b5cf6'})`,
                                animation: 'breathe 1.5s ease-in-out infinite',
                                boxShadow: `0 0 20px ${appTheme.highlight.includes('cyan') ? '#06b6d4' : '#3b82f6'}40`
                            }}
                        />
                    </div>
                </div>

                {/* Animated Logo */}
                <div style={{ animation: 'breathe 3s ease-in-out infinite' }}>
                    <AnimatedLogo appTheme={appTheme} />
                </div>

                {/* Progress bar */}
                <ProgressBar appTheme={appTheme} />

                {/* Loading message with enhanced styling */}
                <div className="text-center space-y-2">
                    <p 
                        className={`text-lg font-medium tracking-wide ${appTheme.text} transition-all duration-300`}
                        style={{
                            animation: 'glow 3s ease-in-out infinite alternate',
                            textShadow: `0 0 10px ${appTheme.highlight.includes('cyan') ? '#06b6d4' : '#3b82f6'}30`
                        }}
                    >
                        {message}
                    </p>
                    
                    {/* Animated dots */}
                    <div className="flex justify-center space-x-1">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-2 h-2 rounded-full"
                                style={{
                                    background: `linear-gradient(45deg, ${appTheme.highlight.includes('cyan') ? '#06b6d4' : '#3b82f6'}, ${appTheme.highlightSecondary.includes('blue') ? '#3b82f6' : '#8b5cf6'})`,
                                    animation: `breathe 1s ease-in-out infinite ${i * 0.2}s`
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30" />
            </div>
        </>
    );
};

export default LoadingSpinner;