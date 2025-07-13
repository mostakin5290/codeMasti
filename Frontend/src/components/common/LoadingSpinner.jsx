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

// Animated Logo Component (themed) - REVERTED TO PREVIOUS STATE
const AnimatedLogo = ({ appTheme }) => { // Receives appTheme
    return (
        <div className="flex-shrink-0">
            <div
                className={`flex items-center text-2xl font-bold ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:ring-offset-2 focus:ring-offset-transparent rounded`}
            >
                <span className={`${appTheme.highlight}`}>Code</span><span className={`${appTheme.text}`}>Crack</span> {/* Themed text */}
            </div>
        </div>
    );
};

const LoadingSpinner = ({ message = 'Loading...', appTheme: propAppTheme }) => {
    // Use the passed appTheme prop, or default to ensure theme consistency
    const appTheme = { ...defaultAppTheme, ...(propAppTheme || {}) };

    return (
        <div
            // Background now matches the app's current theme
            className={`flex flex-col justify-center items-center h-full w-full p-4 space-y-6 ${appTheme.background} ${appTheme.text}`}
            aria-label="Loading content"
        >
            <div className="relative">
                {/* Sun-like spinner with warm gradients - REVERTED TO PREVIOUS STATE */}
                <div className={`animate-spin rounded-full border-4 border-transparent ${appTheme.warningColor.replace('text-', 'bg-gradient-to-r from-')} ${appTheme.highlight.replace('text-', 'via-')} ${appTheme.warningColor.replace('text-', 'to-')} h-20 w-20 shadow-lg`}
                    style={{
                        animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', // More natural spin
                        // Keep borderImage inline style as it was for this specific effect
                        borderImage: `linear-gradient(to right, ${appTheme.warningColor.split('-')[1]}, ${appTheme.highlight.split('-')[1]}) 1`,
                        borderImageSlice: 1
                    }}
                >
                    {/* Inner glowing effect */}
                    <div className={`absolute inset-2 rounded-full ${appTheme.warningColor.replace('text-', 'bg-')}/30 animate-pulse`}></div>
                </div>
                {/* Center dot */}
                <div className={`absolute inset-0 flex items-center justify-center`}>
                    {/* Uses ping-slow from previous state */}
                    <div className={`rounded-full ${appTheme.highlight.replace('text-', 'bg-gradient-to-r from-')} ${appTheme.warningColor.replace('text-', 'to-')} h-4 w-4 animate-ping-slow`}></div>
                </div>
            </div>

            {/* AnimatedLogo is included again as requested */}
            <AnimatedLogo appTheme={appTheme} />

            {/* Message text also uses themed color */}
            <p className={`${appTheme.cardText} animate-pulse tracking-widest`}>
                {message}
            </p>
        </div>
    );
};

export default LoadingSpinner;