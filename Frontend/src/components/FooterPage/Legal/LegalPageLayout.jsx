// src/components/layout/LegalPageLayout.js
import React from 'react';
import Header from '../../layout/Header'; // Adjust path as necessary
import Footer from '../../layout/Footer'; 
import { useTheme } from '../../../context/ThemeContext'; // Adjust path as necessary

// Default theme for fallback
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

const LegalPageLayout = ({ title, children }) => {
    // Get theme from context
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    // Helper for main background gradient
    const getMainBackgroundGradient = () => `bg-gradient-to-br ${appTheme.gradientFrom} ${appTheme.gradientTo}`;
    // Helper for primary text gradient
    const getPrimaryTextGradient = () => `bg-clip-text  bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')}`;


    return (
        <div className={`min-h-screen flex flex-col ${getMainBackgroundGradient()} ${appTheme.text}`}>
            <div className='mb-10'>
                <Header />
            </div>

            <main className="flex-grow max-w-4xl mx-auto px-4 py-8">
                <div className={`bg-white/10 backdrop-blur-lg rounded-xl border ${appTheme.border}/20 p-8 shadow-2xl`}>
                    <h1 className={`text-4xl font-bold mb-8 text-center ${getPrimaryTextGradient()}`}>
                        {title}
                    </h1>
                    <div className={`prose max-w-none ${appTheme.text}`} style={{ color: appTheme.text }}> {/* Apply text color to prose */}
                        {/* Custom styles for headings, paragraphs, and lists within the children */}
                        {/* These styles will be overridden by Tailwind classes from LegalPage.js */}
                        {children}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LegalPageLayout;