import React, { useState } from 'react';

import { FaCheck, FaTimes, FaHistory, FaArrowLeft, FaCode, FaInfoCircle, FaChartLine } from 'react-icons/fa';
import { IoMdTime, IoMdFlash } from 'react-icons/io';
import { RiTestTubeFill } from 'react-icons/ri';
import { MdMemory } from 'react-icons/md';
import axiosClient from '../../api/axiosClient';
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

// Language display names mapping
const languageDisplayNames = {
    'c++': 'C++',
    'javascript': 'JavaScript',
    'python': 'Python',
    'java': 'Java',
    'c': 'C',
    'typescript': 'TypeScript',
    'go': 'Go',
    'rust': 'Rust',
    'php': 'PHP',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'scala': 'Scala',
    'ruby': 'Ruby',
    'csharp': 'C#'
};

const getLanguageDisplayName = (lang) => {
    return languageDisplayNames[lang] || capitalizeFirstLetter(lang);
};



// --- ComplexityAnalysis Component (Themed) ---
const ComplexityAnalysis = ({ analysis, loading, appTheme }) => {
    const theme = { ...defaultAppTheme, ...appTheme }; // Merge with default

    if (loading) {
        return (
            <div className={`p-4 ${theme.cardBg}/50 rounded-lg border ${theme.border}/40`}>
                <div className="flex justify-center items-center py-4">
                    <div className={`w-6 h-6 border-2 ${theme.highlightSecondary}/30 border-t-${theme.highlightSecondary.split('-')[1]}-400 rounded-full animate-spin`}></div>
                </div>
            </div>
        );
    }

    if (!analysis) return null;

    const parsedAnalysis = analysis.parsed || analysis; // Ensure parsed data is used

    return (
        <div className={`${theme.cardBg}/50 rounded-lg border ${theme.border}/40 overflow-hidden`}>
            <div className={`flex items-center gap-3 px-5 py-4 border-b ${theme.border}/40`}>
                <FaChartLine className={`w-5 h-5 ${theme.highlight}`} />
                <h4 className={`font-semibold ${theme.text} text-lg`}>Complexity Analysis</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <IoMdTime className={`w-5 h-5 ${theme.infoColor}`} />
                        <h5 className={`font-medium ${theme.cardText}`}>Time Complexity</h5>
                    </div>
                    <div className="pl-8">
                        <div className={`text-2xl font-bold ${theme.text}`}>
                            {parsedAnalysis?.tc || parsedAnalysis?.['t.c'] || 'N/A'}
                        </div>
                        {parsedAnalysis?.tc?.details && (
                            <p className={`mt-2 text-sm ${theme.cardText}`}>{parsedAnalysis.tc.details}</p>
                        )}
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <MdMemory className={`w-5 h-5 ${theme.successColor}`} />
                        <h5 className={`font-medium ${theme.cardText}`}>Space Complexity</h5>
                    </div>
                    <div className="pl-8">
                        <div className={`text-2xl font-bold ${theme.text}`}>
                            {parsedAnalysis?.sc || parsedAnalysis?.['s.c'] || 'N/A'}
                        </div>
                        {(parsedAnalysis?.sc?.details || parsedAnalysis?.['sc.details']) && (
                            <p className={`mt-2 text-sm ${theme.cardText}`}>
                                {parsedAnalysis.sc?.details || parsedAnalysis['sc.details']}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            {parsedAnalysis.optimization && (
                <div className={`p-5 border-t ${theme.border}/40 ${theme.background}/30`}>
                    <div className="flex items-center gap-3 mb-3">
                        <FaInfoCircle className={`w-5 h-5 ${theme.warningColor}`} />
                        <h5 className={`font-medium ${theme.cardText}`}>Optimization Tips</h5>
                    </div>
                    <p className={`text-sm ${theme.cardText} pl-8`}>{parsedAnalysis.optimization}</p>
                </div>
            )}
        </div>
    );
};

// --- SubmissionDetails Component (Themed) ---
const SubmissionDetails = ({ testResults, setTestResults, appTheme }) => {
    const theme = { ...defaultAppTheme, ...appTheme }; // Merge with default
    // console.log(testResults);
    const statusColors = {
        'Accepted': theme.successColor,
        'Wrong Answer': theme.errorColor,
        'Runtime Error': theme.errorColor,
        'Time Limit Exceeded': theme.warningColor,
        'Compilation Error': theme.errorColor,
        'Memory Limit Exceeded': theme.warningColor,
        'Submission Error': theme.errorColor
    };

    const [showAnalysis, setShowAnalysis] = useState(false);
    const [complexityAnalysis, setComplexityAnalysis] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);

    const handleAnalysisClick = async () => {
        if (complexityAnalysis) {
            setShowAnalysis(prev => !prev);
            return;
        }

        try {
            setLoadingAnalysis(true);
            setAnalysisError(null);

            const response = await axiosClient.post('/ai/analysis', {
                code: testResults.code // Use the code from the submission
            });

            setComplexityAnalysis(response.data.analysis);
            setShowAnalysis(true);
        } catch (err) {
            console.error("Complexity analysis error:", err);
            setAnalysisError(err.response?.data?.error || "Failed to analyze code complexity.");
        } finally {
            setLoadingAnalysis(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Enhanced Header */}
            <div className="flex justify-between items-start">
                <button
                    onClick={() => setTestResults(null)}
                    className={`group flex items-center gap-2 px-4 py-2 ${theme.cardText} hover:${theme.text} transition-all duration-300 rounded-lg hover:${theme.cardBg}/50 text-sm font-medium`}
                >
                    <FaArrowLeft className={`w-3 h-3 group-hover:-translate-x-1 transition-transform duration-300 ${theme.highlightSecondary}`} />
                    Back to History
                </button>

                <div className={`text-right space-y-1 ${theme.cardBg}/80 rounded-lg px-3 py-2`}>
                    <div className={`text-sm ${theme.cardText}`}>
                        {new Date(testResults.createdAt).toLocaleString()}
                    </div>
                    <div className={`text-sm font-semibold ${theme.text}`}>
                        {getLanguageDisplayName(testResults.language)}
                    </div>
                </div>
            </div>

            {/* Enhanced Result Summary */}
            <div className={`relative overflow-hidden rounded-2xl p-6 ${testResults.status === "Accepted"
                ? `${theme.successColor.replace('text-', 'bg-gradient-to-br from-')}/10 via-${theme.successColor.split('-')[1]}-500/10 to-${theme.successColor.split('-')[1]}-500/10 border border-${theme.successColor.split('-')[1]}-500/30`
                : `${theme.errorColor.replace('text-', 'bg-gradient-to-br from-')}/10 via-${theme.errorColor.split('-')[1]}-500/10 to-${theme.errorColor.split('-')[1]}-500/10 border border-${theme.errorColor.split('-')[1]}-500/30`
                }`}>
                <div className="relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                {testResults.status === 'Accepted' ? (
                                    <div className={`w-12 h-12 rounded-full ${theme.successColor.replace('text-', 'bg-gradient-to-r from-')} ${theme.successColor.replace('text-', 'to-')} flex items-center justify-center shadow-lg`}>
                                        <FaCheck className={`w-5 h-5 ${theme.buttonText}`} />
                                    </div>
                                ) : (
                                    <div className={`w-12 h-12 rounded-full ${theme.errorColor.replace('text-', 'bg-gradient-to-r from-')} ${theme.errorColor.replace('text-', 'to-')} flex items-center justify-center shadow-lg`}>
                                        <FaTimes className={`w-5 h-5 ${theme.buttonText}`} />
                                    </div>
                                )}
                                <h3 className={`text-2xl font-bold ${statusColors[testResults.status] || theme.text}`}>
                                    {testResults.status}
                                </h3>
                            </div>
                            {testResults.total > 0 && (
                                <p className={`${theme.cardText} text-base`}>
                                    {testResults.passed} / {testResults.total} test cases passed
                                </p>
                            )}
                        </div>

                        <div className={`text-right space-y-2 ${theme.cardBg}/80 rounded-lg px-4 py-3`}>
                            {testResults.runtime && (
                                <div className="flex items-center gap-2 text-sm">
                                    <IoMdTime className={`w-4 h-4 ${theme.cardText}`} />
                                    <span className={`${theme.cardText}`}>Runtime:</span>
                                    <span className={`font-semibold ${theme.text}`}>{testResults.runtime}</span>
                                </div>
                            )}
                            {testResults.memory && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MdMemory className={`w-4 h-4 ${theme.cardText}`} />
                                    <span className={`${theme.cardText}`}>Memory:</span>
                                    <span className={`font-semibold ${theme.text}`}>{testResults.memory}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Error Message */}
                    {testResults.errorMessage && (
                        <div className={`mt-4 p-4 ${theme.errorColor.replace('text-', 'bg-gradient-to-r from-')}/10 to-${theme.errorColor.split('-')[1]}-500/10 border border-${theme.errorColor.split('-')[1]}-500/30 rounded-xl`}>
                            <h4 className={`font-semibold ${theme.errorColor} mb-2 text-base`}>Error Details</h4>
                            <pre className={`text-sm font-mono ${theme.errorColor} whitespace-pre-wrap overflow-x-auto`}>
                                {testResults.errorMessage}
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            {/* Analysis Button */}
            {testResults.status === 'Accepted' ? (
                <button
                    onClick={handleAnalysisClick}
                    disabled={loadingAnalysis}
                    className={`flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${showAnalysis
                        ? `${theme.infoColor.replace('text-', 'bg-')}/20 ${theme.infoColor} border border-${theme.infoColor.split('-')[1]}-500/30`
                        : `${theme.cardBg}/50 ${theme.cardText} hover:${theme.cardBg}/70 hover:${theme.text} border ${theme.border}/40`
                        }`}
                >
                    <FaChartLine className={`w-4 h-4 ${showAnalysis ? theme.infoColor : theme.highlightSecondary}`} />
                    {loadingAnalysis ? 'Analyzing...' : showAnalysis ? 'Hide Analysis' : 'Analyze Time & Space Complexity'}
                </button>
            ) : (
                <></>
            )
            }
            {analysisError && (
                <div className={`p-4 ${theme.errorColor.replace('text-', 'bg-gradient-to-r from-')}/10 to-${theme.errorColor.split('-')[1]}-500/10 border border-${theme.errorColor.split('-')[1]}-500/30 rounded-xl ${theme.errorColor} text-sm`}>
                    {analysisError}
                </div>
            )}

            {/* Complexity Analysis Section */}
            {showAnalysis && (
                <ComplexityAnalysis analysis={complexityAnalysis} loading={loadingAnalysis} appTheme={appTheme} />
            )}

            {/* Enhanced Code Display */}
            <div className={`${theme.cardBg} rounded-xl border ${theme.border}/40 overflow-hidden`}>
                <div className={`flex items-center gap-3 px-6 py-4 border-b ${theme.border}/40 ${theme.cardBg}`}>
                    <FaCode className={`w-4 h-4 ${theme.highlightSecondary}`} />
                    <h4 className={`font-semibold ${theme.text} text-base`}>Your Solution</h4>
                </div>
                <pre className={`p-6 text-sm font-mono overflow-x-auto ${theme.background}`}>
                    <code className={`${theme.cardText}`}>{testResults?.code}</code>
                </pre>
            </div>
        </div>
    );
};

// --- Main SubmissionsTab Component (Themed) ---
const SubmissionsTab = ({ submissionHistory, testResults, setTestResults }) => { // Removed statusColors prop as it's now derived
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };

    const [loadingId, setLoadingId] = useState(null);
    const [error, setError] = useState(null);

    // Dynamic status colors for history list
    const statusColorsHistory = {
        'Accepted': appTheme.successColor,
        'Wrong Answer': appTheme.errorColor,
        'Runtime Error': appTheme.errorColor,
        'Time Limit Exceeded': appTheme.warningColor,
        'Compilation Error': appTheme.errorColor,
        'Memory Limit Exceeded': appTheme.warningColor,
        'Submission Error': appTheme.errorColor
    };

    const handleSubmissionClick = async (submission) => {
        try {
            setLoadingId(submission._id);
            setError(null);

            const response = await axiosClient.get(`/submission/details/${submission._id}`);
            console.log("Submission details response:", response.data); // Debugging log
            const formattedResult = {
                ...response.data, // response.data already contains all fields including testCases, code, language
                createdAt: submission.createdAt // Re-add createdAt from history list
            };

            setTestResults(formattedResult);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load submission details");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="p-6">
            {testResults ? (
                <SubmissionDetails testResults={testResults} setTestResults={setTestResults} appTheme={appTheme} />
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${appTheme.secondary.replace('bg-', 'to-')} flex items-center justify-center`}>
                            <FaHistory className={`w-4 h-4 ${appTheme.buttonText}`} />
                        </div>
                        <h3 className={`text-xl font-bold ${appTheme.text}`}>Submission History</h3>
                    </div>

                    {error && (
                        <div className={`p-4 ${appTheme.errorColor.replace('text-', 'bg-gradient-to-r from-')}/10 to-${appTheme.errorColor.split('-')[1]}-500/10 border border-${appTheme.errorColor.split('-')[1]}-500/30 rounded-xl ${appTheme.errorColor} text-sm`}>
                            {error}
                        </div>
                    )}

                    {submissionHistory.length > 0 ? (
                        <div className="space-y-3">
                            {submissionHistory.map((submission) => (
                                <div
                                    key={submission._id}
                                    className={`group relative cursor-pointer transition-all duration-300 ${loadingId === submission._id ? 'opacity-70' : ''
                                        }`}
                                    onClick={() => handleSubmissionClick(submission)}
                                >
                                    <div className={`${appTheme.cardBg} p-4 rounded-xl border ${appTheme.border}/40 group-hover:border-${appTheme.primary.split('-')[1]}-600/60 transition-all duration-300`}>
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    {submission.status === 'Accepted' ? (
                                                        <div className={`w-6 h-6 rounded-full ${appTheme.successColor.replace('text-', 'bg-gradient-to-r from-')} ${appTheme.successColor.replace('text-', 'to-')} flex items-center justify-center`}>
                                                            <FaCheck className={`w-3 h-3 ${appTheme.buttonText}`} />
                                                        </div>
                                                    ) : (
                                                        <div className={`w-6 h-6 rounded-full ${appTheme.errorColor.replace('text-', 'bg-gradient-to-r from-')} ${appTheme.errorColor.replace('text-', 'to-')} flex items-center justify-center`}>
                                                            <FaTimes className={`w-3 h-3 ${appTheme.buttonText}`} />
                                                        </div>
                                                    )}
                                                    <span className={`text-base font-semibold ${statusColorsHistory[submission.status] || appTheme.cardText}`}>
                                                        {submission.status}
                                                    </span>
                                                    {loadingId === submission._id && (
                                                        <div className={`w-4 h-4 border-2 ${appTheme.highlightSecondary}/30 border-t-${appTheme.highlightSecondary.split('-')[1]}-400 rounded-full animate-spin`}></div>
                                                    )}
                                                </div>
                                                <div className={`text-sm ${appTheme.cardText}`}>
                                                    {new Date(submission.createdAt).toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="text-right space-y-1">
                                                <div className={`text-sm font-semibold ${appTheme.text}`}>
                                                    {getLanguageDisplayName(submission.language)}
                                                </div>
                                                {submission.runtime && (
                                                    <div className={`text-sm ${appTheme.cardText} space-x-2`}>
                                                        <span>{submission.runtime}</span>
                                                        <span>·</span>
                                                        <span>{submission.memory}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${appTheme.cardBg} flex items-center justify-center border ${appTheme.border}/40`}>
                                <FaHistory className={`w-8 h-8 ${appTheme.cardText}/60`} />
                            </div>
                            <h4 className={`text-lg font-semibold ${appTheme.text} mb-2`}>No submissions yet</h4>
                            <p className={`${appTheme.cardText} text-base`}>Start coding to see your submission history!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubmissionsTab;