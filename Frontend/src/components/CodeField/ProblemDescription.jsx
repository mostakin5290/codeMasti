import React, { useState, useEffect } from 'react'; // Added useEffect
import { FaTerminal } from 'react-icons/fa';
import { IoMdTime, IoMdTrophy, IoMdFlash, IoMdGitBranch } from 'react-icons/io';
import { HiOutlinePuzzle } from 'react-icons/hi';
import { RiTestTubeFill } from 'react-icons/ri';
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

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const getLanguageDisplayName = (lang) => {
    const languageDisplayNames = {
        'c++': 'C++', 'javascript': 'JavaScript', 'python': 'Python', 'java': 'Java', 'c': 'C',
        'typescript': 'TypeScript', 'go': 'Go', 'rust': 'Rust', 'php': 'PHP', 'swift': 'Swift',
        'kotlin': 'Kotlin', 'scala': 'Scala', 'ruby': 'Ruby', 'csharp': 'C#'
    };
    return languageDisplayNames[lang] || capitalizeFirstLetter(lang);
};


const isOverallThemeDark = (appTheme) => {
    const bgClass = appTheme.background;
    if (bgClass.includes('black') || bgClass.includes('zinc-9') || bgClass.includes('gray-9') ||
        bgClass.includes('slate-8') || bgClass.includes('slate-9') || bgClass.includes('purple-9') ||
        bgClass.includes('emerald-9') || bgClass.includes('indigo-9')
    ) {
        return true;
    }
    const match = bgClass.match(/-(\d{2,3})$/);
    if (match) {
        const shade = parseInt(match[1]);
        return shade >= 600;
    }
    return false;
};

const ProblemDescription = ({ problem }) => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };

    const difficultyColors = {
        easy: `${appTheme.iconBg} ${appTheme.highlightSecondary} border ${appTheme.highlightSecondary.replace('text-', 'border-')}/40`,
        medium: `${appTheme.iconBg} ${appTheme.highlightTertiary} border ${appTheme.highlightTertiary.replace('text-', 'border-')}/40`,
        hard: `${appTheme.iconBg} ${appTheme.highlight} border ${appTheme.highlight.replace('text-', 'border-')}/40`
    };

    const getAccentGradient = (fromThemeKey, toThemeKey) => `from-${appTheme[fromThemeKey].split('-')[1]}-500 to-${appTheme[toThemeKey].split('-')[1]}-500`;

    const titleGradientClass = isOverallThemeDark(appTheme)
        ? `from-${appTheme.highlightSecondary.split('-')[1]}-200 via-${appTheme.highlightTertiary.split('-')[1]}-100 to-${appTheme.highlight.split('-')[1]}-50`
        : `from-${appTheme.primary.split('-')[1]}-800 via-${appTheme.secondary.split('-')[1]}-900 to-${appTheme.highlight.split('-')[1]}-950`;

    // State for selected language to display its function signature
    const [selectedLangForSignature, setSelectedLangForSignature] = useState('javascript');

    // Effect to set initial selected language when problem data loads
    useEffect(() => {
        if (problem && problem.starterCode && problem.starterCode.length > 0) {
            setSelectedLangForSignature(problem.starterCode[0].language);
        }
    }, [problem]);

    const currentFunctionSignature = problem?.starterCode?.find(
        sc => sc.language === selectedLangForSignature
    )?.functionSignature || `// Function signature not available for ${getLanguageDisplayName(selectedLangForSignature)}`;

    // Helper to safely display JSON or string (copied from Codefield.jsx)
    const safeDisplayValue = (value) => {
        if (typeof value === 'object' && value !== null) {
            try {
                return JSON.stringify(value, null, 2); // Pretty print JSON
            } catch (e) {
                return String(value);
            }
        }
        return String(value);
    };


    return (
        <div className="p-6 space-y-8">
            {/* Enhanced Problem Header */}
            <div className="space-y-5">
                <div className={`${appTheme.cardBg} rounded-2xl p-6 border ${appTheme.border}/50`}>
                    <h1 className={`text-3xl font-bold bg-gradient-to-r ${titleGradientClass} bg-clip-text leading-tight mb-4`}>
                        {problem.title}
                    </h1>

                    <div className="flex items-center gap-4 flex-wrap">
                        <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${difficultyColors[problem.difficulty.toLowerCase()]}`}>
                            <span className="drop-shadow-sm">{capitalizeFirstLetter(problem.difficulty)}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${appTheme.cardText} text-sm ${appTheme.background}/80 px-3 py-1.5 rounded-full`}>
                            <IoMdGitBranch className={`w-4 h-4 ${appTheme.highlightSecondary}`} />
                            <span>ID: {problem._id}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${appTheme.cardText} text-sm ${appTheme.background}/80 px-3 py-1.5 rounded-full`}>
                            <IoMdTrophy className={`w-4 h-4 ${appTheme.highlight}`} />
                            <span>Acceptance: 45.2%</span> {/* This is a placeholder, needs to come from backend aggregation */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Problem Content */}
            <div className={`prose max-w-none ${isOverallThemeDark(appTheme) ? 'prose-invert' : ''}`}>
                <div className={`${appTheme.cardBg} rounded-xl p-6 border ${appTheme.border}/30`}>
                    <h3 className={`text-xl font-bold ${appTheme.text} flex items-center gap-3 mb-4`}>
                        <div className={`w-8 h-8 rounded-lg ${getAccentGradient('primary', 'secondary')} flex items-center justify-center`}>
                            <FaTerminal className={`w-4 h-4 ${appTheme.buttonText}`} />
                        </div>
                        Description
                    </h3>
                    <div
                        className={`${appTheme.cardText} leading-relaxed space-y-4 text-sm`}
                        dangerouslySetInnerHTML={{ __html: problem.description }}
                    />
                </div>

                {/* Function & Execution Details */}
                {problem.executionConfig && problem.executionConfig.inputOutputConfig && (
                    <div className="mt-8 space-y-4">
                        <h3 className={`text-xl font-bold ${appTheme.text} flex items-center gap-3`}>
                            <div className={`w-8 h-8 rounded-lg ${getAccentGradient('highlight', 'highlightTertiary')} flex items-center justify-center`}>
                                <IoMdFlash className={`w-4 h-4 ${appTheme.buttonText}`} />
                            </div>
                            Function & Execution Details
                        </h3>
                        <div className={`${appTheme.cardBg} rounded-xl p-6 border ${appTheme.border}/40 space-y-5`}>
                            {/* General Function Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`${appTheme.background}/50 rounded-lg p-3 border ${appTheme.border}/30`}>
                                    <label className={`text-xs font-semibold ${appTheme.cardText} mb-1 block`}>Function Name</label>
                                    <p className={`text-base font-mono ${appTheme.text}`}>{problem.executionConfig.inputOutputConfig.functionName}</p>
                                </div>
                                <div className={`${appTheme.background}/50 rounded-lg p-3 border ${appTheme.border}/30`}>
                                    <label className={`text-xs font-semibold ${appTheme.cardText} mb-1 block`}>Input Format</label>
                                    <p className={`text-base font-mono ${appTheme.text}`}>{capitalizeFirstLetter(problem.executionConfig.inputOutputConfig.inputFormat)}</p>
                                </div>
                                <div className={`${appTheme.background}/50 rounded-lg p-3 border ${appTheme.border}/30`}>
                                    <label className={`text-xs font-semibold ${appTheme.cardText} mb-1 block`}>Return Type</label>
                                    <p className={`text-base font-mono ${appTheme.text}`}>{capitalizeFirstLetter(problem.executionConfig.inputOutputConfig.returnType)}</p>
                                </div>
                                <div className={`${appTheme.background}/50 rounded-lg p-3 border ${appTheme.border}/30`}>
                                    <label className={`text-xs font-semibold ${appTheme.cardText} mb-1 block`}>Time Limit</label>
                                    <p className={`text-base font-mono ${appTheme.text}`}>{problem.executionConfig.timeout / 1000} seconds</p>
                                </div>
                                <div className={`${appTheme.background}/50 rounded-lg p-3 border ${appTheme.border}/30`}>
                                    <label className={`text-xs font-semibold ${appTheme.cardText} mb-1 block`}>Memory Limit</label>
                                    <p className={`text-base font-mono ${appTheme.text}`}>{problem.executionConfig.memoryLimit / 1024} MB</p>
                                </div>
                            </div>

                            {/* Function Parameters */}
                            {problem.executionConfig.inputOutputConfig.parameters?.length > 0 && (
                                <div className="mt-5 space-y-3">
                                    <h4 className={`text-md font-semibold ${appTheme.highlightSecondary}`}>Parameters:</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {problem.executionConfig.inputOutputConfig.parameters.map((param, index) => (
                                            <div key={index} className={`${appTheme.background}/50 rounded-lg p-3 border ${appTheme.border}/30 flex items-center gap-2`}>
                                                <span className={`text-sm font-semibold ${appTheme.text}`}>{param.name}:</span>
                                                <span className={`text-sm font-mono ${appTheme.highlightSecondary}`}>{capitalizeFirstLetter(param.type)}</span>
                                                {param.description && <span className={`text-xs ${appTheme.cardText}/80`}>- {param.description}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Function Signature */}
                            {problem.starterCode?.length > 0 && (
                                <div className="mt-5 space-y-3">
                                    <h4 className={`text-md font-semibold ${appTheme.highlightSecondary} mb-2`}>Function Signature:</h4>
                                    <div className="flex items-center gap-3 mb-3">
                                        <label htmlFor="langSignature" className={`text-sm font-medium ${appTheme.cardText}`}>Select Language:</label>
                                        <select
                                            id="langSignature"
                                            value={selectedLangForSignature}
                                            onChange={(e) => setSelectedLangForSignature(e.target.value)}
                                            className={`appearance-none ${appTheme.background} border ${appTheme.border} ${appTheme.text} px-3 py-1.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-${appTheme.primary.split('-')[1]}-500/50 cursor-pointer`}
                                        >
                                            {problem.starterCode.map(sc => (
                                                <option key={sc.language} value={sc.language}>
                                                    {getLanguageDisplayName(sc.language)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <pre className={`${appTheme.background} rounded-lg p-4 text-sm font-mono overflow-x-auto border ${appTheme.border}/40 ${appTheme.highlight}`}>
                                        <code>{currentFunctionSignature}</code>
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* Enhanced Examples Section */}
                {problem.visibleTestCases?.length > 0 && (
                    <div className="space-y-6 mt-8">
                        <h3 className={`text-xl font-bold ${appTheme.text} flex items-center gap-3`}>
                            <div className={`w-8 h-8 rounded-lg ${getAccentGradient('primary', 'secondary')} flex items-center justify-center`}>
                                <RiTestTubeFill className={`w-4 h-4 ${appTheme.buttonText}`} />
                            </div>
                            Examples
                        </h3>

                        <div className="space-y-6">
                            {problem.visibleTestCases.map((example, index) => (
                                <div key={index} className={`${appTheme.cardBg} rounded-xl p-5 border ${appTheme.border}/40`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAccentGradient('primary', 'secondary')} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                                            {index + 1}
                                        </div>
                                        <span className={`font-semibold ${appTheme.text} text-lg`}>Example {index + 1}</span>
                                    </div>

                                    <div className="grid gap-4">
                                        <div>
                                            <label className={`text-sm font-semibold ${appTheme.cardText} flex items-center gap-2 mb-2`}>
                                                <FaTerminal className={`w-3 h-3 ${appTheme.infoColor}`} />
                                                Input
                                            </label>
                                            <pre className={`${appTheme.background} rounded-lg p-4 text-sm font-mono overflow-x-auto border ${appTheme.border}/40 ${appTheme.infoColor}`}>
                                                {safeDisplayValue(example.input)}
                                            </pre>
                                        </div>

                                        <div>
                                            <label className={`text-sm font-semibold ${appTheme.cardText} flex items-center gap-2 mb-2`}>
                                                <IoMdFlash className={`w-3 h-3 ${appTheme.successColor}`} />
                                                Output
                                            </label>
                                            <pre className={`${appTheme.background} rounded-lg p-4 text-sm font-mono overflow-x-auto border ${appTheme.border}/40 ${appTheme.successColor}`}>
                                                {safeDisplayValue(example.output)}
                                            </pre>
                                        </div>

                                        {example.explanation && (
                                            <div>
                                                <label className={`text-sm font-semibold ${appTheme.cardText} mb-2 block`}>
                                                    Explanation
                                                </label>
                                                <p className={`${appTheme.background}/60 rounded-lg p-4 text-sm ${appTheme.cardText} border ${appTheme.border}/40`}>
                                                    {example.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Enhanced Constraints (assuming problem.constraints exists) */}
                {problem.constraints && ( // This block will only render if `problem.constraints` is present in your DB.
                    <div className="mt-8 space-y-4">
                        <h3 className={`text-xl font-bold ${appTheme.text} flex items-center gap-3`}>
                            <div className={`w-8 h-8 rounded-lg ${getAccentGradient('highlightTertiary', 'highlightSecondary')} flex items-center justify-center`}>
                                <IoMdTime className={`w-4 h-4 ${appTheme.buttonText}`} />
                            </div>
                            Constraints
                        </h3>
                        <div className={`${appTheme.cardBg} rounded-xl p-6 border ${appTheme.border}/40`}>
                            <ul className="space-y-3 text-sm">
                                {problem.constraints.map((constraint, index) => (
                                    <li key={index} className={`flex items-start gap-3 ${appTheme.cardText}`}>
                                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${getAccentGradient('primary', 'highlightSecondary')} mt-2 flex-shrink-0 shadow-sm`}></div>
                                        <span>{constraint}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Enhanced Tags */}
                {problem.tags?.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <h3 className={`text-xl font-bold ${appTheme.text} flex items-center gap-3`}>
                            <div className={`w-8 h-8 rounded-lg ${getAccentGradient('highlight', 'highlightTertiary')} flex items-center justify-center`}>
                                <HiOutlinePuzzle className={`w-4 h-4 ${appTheme.buttonText}`} />
                            </div>
                            Related Topics
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {problem.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className={`px-4 py-2 ${appTheme.cardBg} rounded-full text-sm ${appTheme.cardText} border ${appTheme.border}/40 hover:border-${appTheme.primary.split('-')[1]}-500/60 transition-all duration-300 cursor-pointer font-medium`}
                                >
                                    {capitalizeFirstLetter(tag)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProblemDescription;