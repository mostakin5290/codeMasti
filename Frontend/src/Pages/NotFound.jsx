import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import Ballpit from '../components/Games/Ballpit';

// Default theme to prevent errors if theme context fails or is incomplete
const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    // Ensure buttonPrimary and buttonPrimaryHover are defined in defaultTheme for consistency
    buttonPrimary: 'bg-indigo-600',
    buttonPrimaryHover: 'bg-indigo-700',
};

const NotFound = () => {
    // Get theme from context, merge with default
    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };

    // Ballpit controls - colors are still independent of the theme
    const [controls, setControls] = useState({
        count: 200,
        gravity: 0.5,
        friction: 0.9975,
        wallBounce: 0.95,
        followCursor: true,
        colors: ['#FF4081', '#448AFF', '#FFEE58', '#4CAF50', '#9C27B0', '#FF9800', '#00BCD4'],
        ambientColor: 0x444444,
        ambientIntensity: 1,
        lightIntensity: 200,
        minSize: 0.5,
        maxSize: 1,
        size0: 1,
        maxVelocity: 0.15,
        paused: false
    });

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Helper for solid primary button colors (using appTheme.buttonPrimary and appTheme.buttonPrimaryHover)
    const getSolidButtonClasses = () => `${theme.buttonPrimary} hover:${theme.buttonPrimaryHover}`;

    return (
        <div className={`min-h-screen ${theme.background} relative overflow-hidden`}>
            {/* Mouse follower - Use theme colors (solid) */}
            <div
                className={`fixed w-4 h-4 ${theme.primary} rounded-full pointer-events-none mix-blend-screen transition-transform duration-75 ease-out z-50`}
                style={{
                    left: mousePosition.x - 8,
                    top: mousePosition.y - 8,
                    transform: 'scale(1.2)'
                }}
            />

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header (Simplified for 404 page) */}
                <div className="flex-shrink-0 pt-12 pb-8">
                    <div className="max-w-6xl mx-auto px-6 text-center">
                        {/* 404 with glitch effect - Use theme colors (solid) */}
                        <div className="relative mb-8">
                            <h1 className={`text-8xl md:text-9xl font-black ${theme.highlight} bg-clip-text   animate-pulse select-none`}>
                                404
                            </h1>
                            <div className={`absolute inset-0 text-8xl md:text-9xl font-black ${theme.highlight}/20 animate-ping`}>
                                404
                            </div>
                        </div>

                        {/* Error message - Use theme colors */}
                        <div className="space-y-4 mb-8">
                            <h2 className={`text-3xl md:text-4xl font-bold ${theme.text} mb-4`}>
                                Page Not Found
                            </h2>
                            <p className={`text-lg md:text-xl ${theme.cardText} max-w-2xl mx-auto leading-relaxed`}>
                                The page you're looking for has drifted into the digital void. But don't worry—while you're here,
                                <span className={`${theme.highlight} font-semibold`}> play with our interactive physics simulation!</span> {/* Highlight as solid */}
                            </p>
                        </div>

                        {/* Action buttons - Use theme colors (solid) */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <button
                                onClick={() => window.history.back()}
                                className={`group relative px-8 py-4 ${getSolidButtonClasses()} rounded-full font-semibold ${theme.buttonText} overflow-hidden transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-${theme.primary.split('-')[1]}-500/25 active:scale-95`}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Go Back
                                </span>
                                {/* Removed inner gradient hover div, as solid is desired */}
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className={`group relative px-8 py-4 border-2 ${theme.border} rounded-full font-semibold ${theme.highlightSecondary} backdrop-blur-sm transition-all duration-300 hover:border-${theme.highlightSecondary.split('-')[1]}-400 hover:${theme.text} hover:${theme.highlightSecondary.replace('text-', 'bg-')}/10 active:scale-95`}
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Home
                                </span>
                            </button>

                        </div>
                    </div>
                </div>

                {/* Ballpit Container - Use theme colors for container, but fixed colors for balls */}
                <div className="flex-1 max-w-6xl mx-auto w-full px-6 pb-12">
                    <div className={`${theme.cardBg}/20 backdrop-blur-xl rounded-2xl p-4 border ${theme.border}/10 shadow-2xl`}>
                        <div className="h-96 md:h-[500px] rounded-xl overflow-hidden relative">
                            <Ballpit
                                count={controls.count}
                                gravity={controls.gravity}
                                friction={controls.friction}
                                wallBounce={controls.wallBounce}
                                followCursor={controls.followCursor}
                                colors={controls.colors} // Fixed vibrant colors
                                ambientColor={controls.ambientColor} // Fixed neutral ambient color
                                ambientIntensity={controls.ambientIntensity}
                                lightIntensity={controls.lightIntensity}
                                minSize={controls.minSize}
                                maxSize={controls.maxSize}
                                size0={controls.size0}
                                maxVelocity={controls.maxVelocity}
                                paused={controls.paused}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;