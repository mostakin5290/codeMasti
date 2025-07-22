import React, { useState } from 'react';
import { FaCode, FaLightbulb } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Language display names mapping
const languageDisplayNames = {
    'c++': 'C++', 'javascript': 'JavaScript', 'python': 'Python', 'java': 'Java',
    'c': 'C', 'typescript': 'TypeScript', 'go': 'Go', 'rust': 'Rust', 'php': 'PHP',
    'swift': 'Swift', 'kotlin': 'Kotlin', 'scala': 'Scala', 'ruby': 'Ruby', 'csharp': 'C#'
};

const getLanguageDisplayName = (lang) => {
    return languageDisplayNames[lang] || capitalizeFirstLetter(lang);
};

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

const SolutionsTab = ({ problem }) => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const isPremiumUser = user?.isPremium; // Assuming user.isPremium is a boolean

    const handleUpgradeClick = () => {
        navigate('/premium');
    };

    return (
        <div className="p-6 space-y-8">
            {problem?.referenceSolution?.length > 0 ? (
                problem.referenceSolution.map((solution, index) => (
                    <div key={index} className={`${appTheme.cardBg} rounded-xl p-6 border ${appTheme.border}/40 relative overflow-hidden`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <FaCode className={`w-5 h-5 ${appTheme.highlightSecondary}`} />
                                <span className={`font-semibold ${appTheme.text} text-lg`}>{getLanguageDisplayName(solution?.language)}</span>
                            </div>
                            <span className={`px-3 py-1.5 ${appTheme.successColor.replace('text-', 'bg-gradient-to-r from-')}/20 to-${appTheme.successColor.split('-')[1]}-500/20 ${appTheme.successColor} rounded-full text-sm font-medium border border-${appTheme.successColor.split('-')[1]}-500/30`}>
                                Official Solution
                            </span>
                        </div>

                        {/* Solution Code - Blurred if not premium */}
                        <div className={`${isPremiumUser ? '' : 'filter blur-sm pointer-events-none select-none'}`}>
                            <pre className={`${appTheme.background} rounded-lg p-4 text-sm font-mono overflow-x-auto border ${appTheme.border}/40 ${appTheme.cardText}`}>
                                {solution?.completeCode}
                            </pre>
                        </div>

                        {/* Premium Overlay */}
                        {!isPremiumUser && (
                            <div className={`absolute inset-0 flex flex-col items-center justify-center ${appTheme.background}/90 backdrop-blur-md z-10 p-4 rounded-xl`}>
                                <HiSparkles className={`w-12 h-12 ${appTheme.highlight} mb-4`} />
                                <h3 className={`text-xl font-bold ${appTheme.text} mb-2 text-center`}>
                                    Unlock Solutions with Premium
                                </h3>
                                <p className={`text-sm ${appTheme.cardText} text-center mb-6`}>
                                    Upgrade to a Premium account to view all official solutions and much more.
                                </p>
                                <button
                                    onClick={handleUpgradeClick}
                                    className={`px-6 py-3 rounded-full font-semibold text-lg ${appTheme.buttonText} bg-gradient-to-r ${appTheme.primary} ${appTheme.secondary} hover:from-${appTheme.primary.split('-')[1]}-600 hover:to-${appTheme.secondary.split('-')[1]}-700 transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl`}
                                >
                                    Upgrade to Premium
                                </button>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className={`p-8 text-center ${appTheme.cardBg} rounded-xl border ${appTheme.border}/40`}>
                    <FaLightbulb className={`w-10 h-10 mx-auto mb-4 ${appTheme.highlightSecondary}`} />
                    <p className={`text-lg ${appTheme.cardText}`}>No reference solutions available for this problem yet.</p>
                </div>
            )}
        </div>
    );
};

export default SolutionsTab;