import React from 'react';
import { FaCode, FaLightbulb } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

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

    return (
        <div className="p-6 space-y-8">
            <div className="text-center py-12">
                <div className="relative mb-6">
                    <div className={`w-20 h-20 mx-auto rounded-full ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')}/20 via-${appTheme.highlightSecondary.split('-')[1]}-500/20 to-${appTheme.highlightTertiary.split('-')[1]}-500/20 flex items-center justify-center border ${appTheme.border}/40`}>
                        <FaLightbulb className={`w-8 h-8 ${appTheme.highlightSecondary}`} />
                    </div>
                </div>
                <h3 className={`text-2xl font-bold bg-gradient-to-r ${appTheme.highlightSecondary.replace('text-', 'from-')} to-${appTheme.highlight.replace('text-', 'to-')} bg-clip-text text-transparent mb-3`}>
                    Premium Solutions
                </h3>
                <p className={`${appTheme.cardText} text-base mb-8 max-w-md mx-auto leading-relaxed`}>
                    Unlock detailed explanations, optimal solutions, and step-by-step walkthroughs
                </p>
                <button className={`group relative px-8 py-3 ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${appTheme.secondary.replace('bg-', 'via-')} ${appTheme.highlight.replace('text-', 'to-')} ${appTheme.buttonText} rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-base`}>
                    <span className="relative flex items-center gap-2">
                        <HiSparkles className="w-5 h-5" />
                        Upgrade to Premium
                    </span>
                </button>
            </div>

            {problem?.referenceSolution?.map((solution, index) => (
                <div key={index} className={`${appTheme.cardBg} rounded-xl p-6 border ${appTheme.border}/40`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <FaCode className={`w-5 h-5 ${appTheme.highlightSecondary}`} />
                            <span className={`font-semibold ${appTheme.text} text-lg`}>{getLanguageDisplayName(solution?.language)}</span>
                        </div>
                        <span className={`px-3 py-1.5 ${appTheme.successColor.replace('text-', 'bg-gradient-to-r from-')}/20 to-${appTheme.successColor.split('-')[1]}-500/20 ${appTheme.successColor} rounded-full text-sm font-medium border border-${appTheme.successColor.split('-')[1]}-500/30`}>
                            Official Solution
                        </span>
                    </div>
                    <pre className={`${appTheme.background} rounded-lg p-4 text-sm font-mono overflow-x-auto border ${appTheme.border}/40 ${appTheme.cardText}`}>
                        {solution?.completeCode}
                    </pre>
                </div>
            ))}
        </div>
    );
};

export default SolutionsTab;