// src/pages/AIChatPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHelpCircle } from 'react-icons/fi';
import AIChatPageContent from './AIChatPageContent'; // Adjust path
import { useTheme } from '../../../context/ThemeContext'; // Adjust path

// Modern, professional light theme specifically for this page (or as a strong base)
const supportAppTheme = {
    background: 'bg-gray-50',
    text: 'text-gray-900',
    primary: 'bg-blue-600',
    primaryHover: 'bg-blue-700',
    secondary: 'bg-indigo-600',
    secondaryHover: 'bg-indigo-700',
    cardBg: 'bg-white',
    cardText: 'text-gray-700',
    border: 'border-gray-200',
    buttonText: 'text-white',
    highlight: 'text-blue-600',
    highlightSecondary: 'text-indigo-600',
    highlightTertiary: 'text-purple-600',
    iconBg: 'bg-blue-500/10',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-indigo-600',
    successColor: 'text-green-600',
    warningColor: 'text-amber-600',
    errorColor: 'text-red-600',
    infoColor: 'text-blue-600',
};

const AIChatPage = () => {
    const navigate = useNavigate();
    // Merge supportAppTheme with global appTheme.
    // This makes supportAppTheme the base, but global theme changes can still override specific parts.
    const { theme: globalAppTheme } = useTheme();
    const appTheme = { ...supportAppTheme, ...globalAppTheme }; 

    // Helper for primary text gradient (for headings)
    const getPrimaryTextGradient = () => `bg-clip-text text-transparent bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')}`;


    return (
        <div className={`min-h-screen flex flex-col ${appTheme.background} ${appTheme.text}`}>
            {/* Modern header with back button and title */}
            <div className={`sticky top-0 z-10 ${appTheme.cardBg} shadow-sm`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:${appTheme.background} transition-colors ${appTheme.text}`}
                        >
                            <FiArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back</span>
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <FiHelpCircle className={`w-5 h-5 ${appTheme.highlight}`} />
                            <h1 className={`text-xl font-semibold ${appTheme.text}`}>AI Support Assistant</h1>
                        </div>
                        
                        <div className="w-24"></div> {/* Spacer for balance */}
                    </div>
                </div>
            </div>

            {/* Main chat content */}
            <main className="flex-grow flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8">
                <div className={`w-full max-w-4xl flex-grow h-[calc(100vh-120px)] rounded-xl shadow-lg overflow-hidden ${appTheme.cardBg}`}> {/* Use appTheme.cardBg here */}
                    <AIChatPageContent /> {/* This component is already themed */}
                </div>
            </main>
        </div>
    );
};

export default AIChatPage;