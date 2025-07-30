import React from 'react';
import { useTheme } from '../../context/ThemeContext';

// Default theme for the app context
const defaultAppTheme = {
    background: 'bg-gray-900', 
    text: 'text-white', 
    primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', 
    secondary: 'bg-blue-600', 
    secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', 
    cardText: 'text-gray-300', 
    border: 'border-gray-700',
    buttonText: 'text-white', 
    highlight: 'text-cyan-400', 
    highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', 
    iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', 
    gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

// Enhanced Animated Logo Component
const AnimatedLogo = ({ appTheme }) => {
    return (
        <div className="flex-shrink-0">
            <div className={`flex items-center text-4xl font-bold ${appTheme.text} focus:outline-none rounded-lg transition-all duration-500 hover:scale-105`}>
                <div className="relative">
                    {/* Enhanced animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-30 blur-md animate-pulse rounded-lg transform scale-110"></div>
                    
                    {/* Multiple glow layers for depth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-40 blur-lg rounded-lg animate-ping"></div>
                    
                    <span 
                        className="relative bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-extrabold tracking-wider"
                        style={{
                            animation: 'logoGlow 3s ease-in-out infinite alternate, textShimmer 2s linear infinite'
                        }}
                    >
                        Code
                    </span>
                </div>
                <span className={`${appTheme.text} ml-2 transition-all duration-500 hover:text-cyan-400`}>
                    Masti
                </span>
            </div>
        </div>
    );
};

// Enhanced Particle System
const ParticleRing = ({ size, delay, speed = 3 }) => {
    return (
        <div 
            className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                animation: `particleRing ${speed}s ease-in-out infinite ${delay}s`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                filter: 'blur(0.5px)'
            }}
        />
    );
};

// Enhanced Floating Dots with better physics
const FloatingDots = ({ appTheme }) => {
    const dots = Array.from({ length: 8 }, (_, i) => i);
    
    return (
        <div className="absolute inset-0">
            {dots.map((dot, index) => (
                <div
                    key={index}
                    className="absolute w-3 h-3 rounded-full shadow-lg"
                    style={{
                        background: `linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6)`,
                        animation: `floatingDot ${2 + index * 0.2}s ease-in-out infinite ${index * 0.25}s`,
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${index * 45}deg) translateY(-50px)`,
                        boxShadow: '0 0 15px rgba(6, 182, 212, 0.6)',
                        filter: 'blur(0.5px)'
                    }}
                />
            ))}
        </div>
    );
};

// Enhanced Progress Bar with segments
const ProgressBar = ({ appTheme }) => {
    return (
        <div className="w-80 h-2 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-600/50">
            <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full relative"
                style={{
                    animation: 'progressBar 3s ease-in-out infinite'
                }}
            >
                {/* Glow effect on progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-50 blur-sm rounded-full"></div>
            </div>
        </div>
    );
};

// New Orbital Rings Component
const OrbitalRings = () => {
    return (
        <div className="absolute inset-0">
            {[100, 130, 160].map((size, index) => (
                <div
                    key={index}
                    className="absolute border border-cyan-400/20 rounded-full"
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        animation: `orbit ${4 + index}s linear infinite ${index * 0.5}s`
                    }}
                >
                    <div
                        className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full absolute"
                        style={{
                            top: '-1px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            boxShadow: '0 0 10px rgba(6, 182, 212, 0.8)'
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

const LoadingSpinner = ({ message = 'Loading...', appTheme: propAppTheme }) => {
    const { theme: contextTheme } = useTheme() || {};
    const appTheme = { ...defaultAppTheme, ...contextTheme, ...(propAppTheme || {}) };

    return (
        <>
            {/* Enhanced CSS animations */}
            <style jsx>{`
                @keyframes modernSpin {
                    0% { transform: rotate(0deg) scale(1); }
                    25% { transform: rotate(90deg) scale(1.05); }
                    50% { transform: rotate(180deg) scale(1.1); }
                    75% { transform: rotate(270deg) scale(1.05); }
                    100% { transform: rotate(360deg) scale(1); }
                }
                
                @keyframes logoGlow {
                    0% { 
                        text-shadow: 
                            0 0 5px rgba(6, 182, 212, 0.5),
                            0 0 10px rgba(6, 182, 212, 0.3),
                            0 0 15px rgba(6, 182, 212, 0.1);
                    }
                    100% { 
                        text-shadow: 
                            0 0 20px rgba(6, 182, 212, 0.8),
                            0 0 30px rgba(6, 182, 212, 0.6),
                            0 0 40px rgba(6, 182, 212, 0.4);
                    }
                }
                
                @keyframes textShimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                
                @keyframes particleRing {
                    0% { 
                        transform: translate(-50%, -50%) scale(0.3) rotate(0deg); 
                        opacity: 1; 
                        border-color: rgba(6, 182, 212, 0.6);
                    }
                    50% { 
                        transform: translate(-50%, -50%) scale(0.8) rotate(180deg); 
                        opacity: 0.8; 
                        border-color: rgba(59, 130, 246, 0.6);
                    }
                    100% { 
                        transform: translate(-50%, -50%) scale(1.2) rotate(360deg); 
                        opacity: 0; 
                        border-color: rgba(139, 92, 246, 0.3);
                    }
                }
                
                @keyframes floatingDot {
                    0%, 100% { 
                        transform: translate(-50%, -50%) rotate(var(--rotate, 0deg)) translateY(-50px) scale(0.6); 
                        opacity: 0.4; 
                    }
                    25% { 
                        transform: translate(-50%, -50%) rotate(calc(var(--rotate, 0deg) + 90deg)) translateY(-70px) scale(1); 
                        opacity: 0.8; 
                    }
                    50% { 
                        transform: translate(-50%, -50%) rotate(calc(var(--rotate, 0deg) + 180deg)) translateY(-80px) scale(1.2); 
                        opacity: 1; 
                    }
                    75% { 
                        transform: translate(-50%, -50%) rotate(calc(var(--rotate, 0deg) + 270deg)) translateY(-70px) scale(1); 
                        opacity: 0.8; 
                    }
                }
                
                @keyframes progressBar {
                    0% { transform: translateX(-120%); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateX(120%); opacity: 0; }
                }
                
                @keyframes breathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                }
                
                @keyframes shimmer {
                    0% { background-position: -400% 0; }
                    100% { background-position: 400% 0; }
                }
                
                @keyframes orbit {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
                
                @keyframes wave {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>

            <div
                className={`flex flex-col justify-center items-center h-full w-full p-8 space-y-10 ${appTheme.background} ${appTheme.text} relative overflow-hidden`}
                aria-label="Loading content"
            >
                {/* Enhanced animated background */}
                <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                        background: `
                            radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)
                        `,
                        animation: 'shimmer 6s ease-in-out infinite'
                    }}
                />

                {/* Main spinner container with enhanced effects */}
                <div className="relative">
                    {/* Outer rotating ring with gradient */}
                    <div 
                        className="w-28 h-28 rounded-full relative"
                        style={{
                            background: `conic-gradient(from 0deg, transparent 0deg, #06b6d4 30deg, #3b82f6 180deg, #8b5cf6 270deg, transparent 360deg)`,
                            animation: 'modernSpin 2.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
                            filter: 'blur(0.5px)'
                        }}
                    >
                        {/* Inner shadow ring */}
                        <div className="absolute inset-1 rounded-full bg-gray-900/80 backdrop-blur-sm"></div>
                    </div>

                    {/* Enhanced particle rings */}
                    <ParticleRing size={140} delay={0} speed={3} />
                    <ParticleRing size={170} delay={0.8} speed={4} />
                    <ParticleRing size={200} delay={1.6} speed={5} />

                    {/* Orbital rings */}
                    <OrbitalRings />

                    {/* Enhanced floating dots */}
                    <FloatingDots appTheme={appTheme} />

                    {/* Enhanced center pulse with multiple layers */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            {/* Outer glow */}
                            <div 
                                className="absolute w-12 h-12 rounded-full -top-3 -left-3"
                                style={{
                                    background: `radial-gradient(circle, rgba(6, 182, 212, 0.3), transparent 70%)`,
                                    animation: 'breathe 2s ease-in-out infinite'
                                }}
                            />
                            {/* Main center dot */}
                            <div 
                                className="w-6 h-6 rounded-full relative z-10"
                                style={{
                                    background: `linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6)`,
                                    animation: 'breathe 1.8s ease-in-out infinite',
                                    boxShadow: `
                                        0 0 20px rgba(6, 182, 212, 0.6),
                                        0 0 40px rgba(6, 182, 212, 0.3),
                                        inset 0 0 10px rgba(255, 255, 255, 0.2)
                                    `
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Enhanced Animated Logo */}
                <div 
                    className="transform transition-all duration-500 hover:scale-110"
                    style={{ animation: 'breathe 4s ease-in-out infinite' }}
                >
                    <AnimatedLogo appTheme={appTheme} />
                </div>

                {/* Enhanced progress bar */}
                <div className="flex flex-col items-center space-y-3">
                    <ProgressBar appTheme={appTheme} />
                    
                    {/* Progress percentage simulation */}
                    <div className="text-xs text-gray-400 font-mono tracking-wider">
                        <span style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                            Initializing...
                        </span>
                    </div>
                </div>

                {/* Enhanced loading message */}
                <div className="text-center space-y-4">
                    <p 
                        className={`text-xl font-semibold tracking-wide ${appTheme.text} transition-all duration-500`}
                        style={{
                            animation: 'logoGlow 4s ease-in-out infinite alternate',
                            textShadow: `0 0 15px rgba(6, 182, 212, 0.4)`
                        }}
                    >
                        {message}
                    </p>
                    
                    {/* Enhanced animated dots */}
                    <div className="flex justify-center space-x-2">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-2 h-2 rounded-full"
                                style={{
                                    background: `linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6)`,
                                    animation: `wave 1.5s ease-in-out infinite ${i * 0.2}s`,
                                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
                                }}
                            />
                        ))}
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                        <div 
                            className="w-2 h-2 bg-green-400 rounded-full"
                            style={{ animation: 'pulse 1s ease-in-out infinite' }}
                        />
                        <span>System Ready</span>
                    </div>
                </div>

                {/* Enhanced bottom accent with wave effect */}
                <div className="absolute bottom-0 left-0 w-full h-2 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40"
                        style={{
                            animation: 'shimmer 3s ease-in-out infinite',
                            backgroundSize: '200% 100%'
                        }}
                    />
                </div>
            </div>
        </>
    );
};

export default LoadingSpinner;
