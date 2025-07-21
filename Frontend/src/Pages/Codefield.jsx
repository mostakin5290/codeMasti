import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import MonacoEditor from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserDailyChallenges } from '../features/auth/authSlice';

import {
    FaCheck, FaTimes, FaRegCopy, FaPlay, FaExpand, FaCompress,
    FaSyncAlt, FaHistory, FaBookmark, FaList, FaArrowLeft,
    FaCode, FaTerminal, FaEye, FaChevronDown, FaLightbulb, FaBookOpen
} from 'react-icons/fa';
import {
    IoMdSettings, IoMdRefresh, IoMdTime, IoMdTrophy,
    IoMdFlash, IoMdGitBranch, IoMdHelpCircle
} from 'react-icons/io';
import { HiSparkles, HiLightningBolt, HiOutlinePuzzle } from 'react-icons/hi';
import { RiTestTubeFill } from 'react-icons/ri';
import Header from '../components/layout/Header';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import *as monacoThemes from '../utils/theme';
import ProblemDescription from '../components/CodeField/ProblemDescription';
import SolutionsTab from '../components/CodeField/SolutionsTab';
import SubmissionsTab from '../components/CodeField/SubmissionsTab';
import FloatingAIChat from '../components/CodeField/FloatingAIChat';
import EditorialTab from '../components/CodeField/EditorialTab';
import DailyChallengeSuccessModal from '../components/CodeField/DailyChallengeSuccessModal';
import { useTheme } from '../context/ThemeContext';

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

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

const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonPrimary: 'bg-indigo-600',
    buttonPrimaryHover: 'bg-indigo-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

const Loader = ({ message = "Loading...", size = "md", appTheme }) => {
    const theme = { ...defaultTheme, ...appTheme };
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="relative">
                <div className={`animate-spin rounded-full border-4 border-transparent ${theme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${theme.highlight.replace('text-', 'via-')} ${theme.highlightSecondary.replace('text-', 'to-')} ${size === 'lg' ? 'h-20 w-20' : size === 'sm' ? 'h-10 w-10' : 'h-16 w-16'
                    }`} style={{ clipPath: 'circle(50% at 50% 50%)' }}>
                    <div className={`absolute inset-1 rounded-full ${theme.background} ${size === 'lg' ? 'h-18 w-18' : size === 'sm' ? 'h-8 w-8' : 'h-14 w-14'
                        }`}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`rounded-full ${theme.highlight.replace('text-', 'bg-gradient-to-r from-')} ${theme.highlightSecondary.replace('text-', 'to-')} animate-pulse ${size === 'lg' ? 'h-4 w-4' : size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
                        }`}></div>
                </div>
            </div>
            <div className="text-center space-y-2">
                <p className={`${theme.cardText} font-medium animate-pulse`}>{message}</p>
                <div className="flex space-x-1 justify-center">
                    <div className={`w-2 h-2 ${theme.primary.replace('bg-', 'bg-')} rounded-full animate-bounce`}></div>
                    <div className={`w-2 h-2 ${theme.highlight.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                    <div className={`w-2 h-2 ${theme.highlightSecondary.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
};

const ProblemPanel = ({ problem, activeTab, setActiveTab, submissionHistory, testResults, setTestResults, panelWidth, appTheme }) => {
    const theme = { ...defaultTheme, ...appTheme };

    const difficultyColors = {
        easy: `${theme.iconBg} ${theme.highlightSecondary} border ${theme.highlightSecondary.replace('text-', 'border-')}/40`,
        medium: `${theme.iconBg} ${theme.highlightTertiary} border ${theme.highlightTertiary.replace('text-', 'border-')}/40`,
        hard: `${theme.iconBg} ${theme.highlight} border ${theme.highlight.replace('text-', 'border-')}/40`
    };

    const statusColors = {
        'Accepted': `${theme.iconBg} ${theme.successColor}`,
        'Wrong Answer': `${theme.iconBg} ${theme.errorColor}`,
        'Runtime Error': `${theme.iconBg} ${theme.errorColor}`,
        'Time Limit Exceeded': `${theme.iconBg} ${theme.warningColor}`,
        'Compilation Error': `${theme.iconBg} ${theme.errorColor}`,
        'Memory Limit Exceeded': `${theme.iconBg} ${theme.warningColor}`,
        'Submission Error': `${theme.iconBg} ${theme.errorColor}`
    };

    const tabs = [
        { id: 'description', name: 'Description', icon: FaEye, gradientFrom: theme.primary, gradientTo: theme.secondary },
        { id: 'editorial', name: 'Editorial', icon: FaBookOpen, gradientFrom: theme.primary, gradientTo: theme.secondary },
        { id: 'solutions', name: 'Solutions', icon: HiLightningBolt, gradientFrom: theme.primary, gradientTo: theme.secondary },
        { id: 'submissions', name: 'Submissions', icon: FaHistory, gradientFrom: theme.primary, gradientTo: theme.secondary }
    ];

    return (
        <div className={`flex flex-col h-full ${theme.cardBg} border-r ${theme.border} overflow-hidden`}>
            <div className={`p-4 ${theme.cardBg} border-b ${theme.border}`}>
                <div className={`flex space-x-2 ${theme.background}/80 p-1.5 rounded-xl border ${theme.border}/30`}>
                    {tabs.map(({ id, name, icon: Icon, gradientFrom, gradientTo }) => (
                        <button
                            key={id}
                            className={`group flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden ${activeTab === id
                                ? `${theme.buttonPrimary} ${theme.buttonText}  shadow-lg`
                                : `${theme.text} hover:${theme.text} hover:${theme.cardBg} hover:shadow-md`
                                }`}
                            onClick={() => setActiveTab(id)}
                        >
                            {activeTab === id && (
                                <div className={`absolute inset-0 ${theme.buttonPrimary} `}></div>
                            )}
                            <div className="relative flex items-center gap-2">
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {panelWidth > 400 && <span>{name}</span>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'description' && (
                    <ProblemDescription problem={problem} difficultyColors={difficultyColors} panelWidth={panelWidth} appTheme={appTheme} />
                )}
                {activeTab === 'editorial' && <EditorialTab problem={problem} appTheme={appTheme} />}
                {activeTab === 'solutions' && <SolutionsTab problem={problem} panelWidth={panelWidth} appTheme={appTheme} />}
                {activeTab === 'submissions' && (
                    <SubmissionsTab
                        testResults={testResults}
                        setTestResults={setTestResults}
                        submissionHistory={submissionHistory}
                        statusColors={statusColors}
                        panelWidth={panelWidth}
                        appTheme={appTheme}
                    />
                )}
            </div>
        </div>
    );
};


const TerminalLine = ({ type, message, appTheme }) => {
    const theme = { ...defaultTheme, ...appTheme };

    const getPrompt = () => {
        switch (type) {
            case 'error': return <span className={theme.errorColor}>❯</span>;
            case 'success': return <span className={theme.successColor}>❯</span>;
            case 'info': return <span className={theme.infoColor}>❯</span>;
            default: return <span className={theme.cardText}>❯</span>;
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'error': return theme.errorColor;
            case 'success': return theme.successColor;
            case 'info': return theme.infoColor;
            default: return theme.text;
        }
    };

    return (
        <div className="flex items-start font-mono text-sm mb-2">
            <div className="mr-2 mt-0.5">{getPrompt()}</div>
            <div className={`${getTextColor()} flex-1`}>
                {message.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
            </div>
        </div>
    );
};


const safeDisplayValue = (value) => {
    if (typeof value === 'object' && value !== null) {
        try {
            return JSON.stringify(value);
        } catch (e) {
            return String(value);
        }
    }
    return String(value);
};


const Codefield = () => {
    const editorRef = useRef(null);
    const editorContainerRef = useRef(null);
    const panelRef = useRef(null);

    const { problemId } = useParams(); 
    const [searchParams] = useSearchParams(); 
    const contestId = searchParams.get('contestId'); 

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...appThemeFromContext };

    // UI State (unchanged)
    const [panelWidth, setPanelWidth] = useState(500);
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);
    const [consoleHeight, setConsoleHeight] = useState(220);
    const [isDraggingConsole, setIsDraggingConsole] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    const [fontSize, setFontSize] = useState(15);
    const [monacoEditorTheme, setMonacoEditorTheme] = useState('vs-dark');

    const [problem, setProblem] = useState(null);
    const [loadingProblem, setLoadingProblem] = useState(true);
    const [problemError, setProblemError] = useState(null);
    const [submissionHistory, setSubmissionHistory] = useState([]);

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [customInput, setCustomInput] = useState('');

    const [consoleOutput, setConsoleOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testResults, setTestResults] = useState(null);

    const [activeTab, setActiveTab] = useState('description');
    const [activeConsoleTab, setActiveConsoleTab] = useState('input');

    const [showDailyChallengeSuccessModal, setShowDailyChallengeSuccessModal] = useState(false);
    const [dailyChallengeStreakToShow, setDailyChallengeStreakToShow] = useState(0);


    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monaco.editor.defineTheme('monokai', monacoThemes.monokaiTheme);
        monaco.editor.defineTheme('dracula', monacoThemes.draculaTheme);
        monaco.editor.defineTheme('one-dark-pro', monacoThemes.oneDarkProTheme);
        monaco.editor.defineTheme('nord', monacoThemes.nordTheme);

        if (appTheme.background.includes('dark') || appTheme.background.includes('black') || appTheme.background.includes('zinc-9')) {
            setMonacoEditorTheme('vs-dark');
        } else {
            setMonacoEditorTheme('vs-light');
        }

        const commonLanguageConfig = {
            comments: { lineComment: '//', blockComment: ['/*', '*/'] },
            brackets: [['{', '}'], ['[', ']'], ['(', ')']],
            autoClosingPairs: [
                { open: '{', close: '}' }, { open: '[', close: ']' }, { open: '(', close: ')' },
                { open: '"', close: '"' }, { open: "'", close: "'" }, { open: '`', close: '`' }
            ],
            surroundingPairs: [
                { open: '{', close: '}' }, { open: '[', 'close': ']' }, { open: '(', close: ')' },
                { open: '"', close: '"' }, { open: "'", close: "'" }, { open: '`', close: '`' }
            ]
        };

        ['cpp', 'javascript', 'python', 'java', 'c', 'typescript', 'go', 'rust', 'php', 'swift', 'kotlin', 'scala', 'ruby', 'csharp'].forEach(lang => {
            monaco.languages.register({ id: lang });
            monaco.languages.setLanguageConfiguration(lang, commonLanguageConfig);
        });

        editor.focus();
    };

    useEffect(() => {
        if (!localStorage.getItem('monacoThemePref')) {
            if (appTheme.background.includes('dark') || appTheme.background.includes('black') || appTheme.background.includes('zinc-9')) {
                setMonacoEditorTheme('vs-dark');
            } else {
                setMonacoEditorTheme('vs-light');
            }
        }
    }, [appTheme.background]);


    useEffect(() => {
        const fetchProblem = async () => {
            if (!problemId) {
                setProblemError("No problem ID provided.");
                setLoadingProblem(false);
                return;
            }
            setLoadingProblem(true);
            try {
                const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);
                setProblem(data);

                const availableLanguages = data.starterCode?.map(sc => sc.language) || [];
                const defaultLang = availableLanguages.includes('cpp') ? 'cpp' : availableLanguages[0] || 'javascript'; // Fallback to 'javascript'
                setLanguage(defaultLang);

                const savedCode = localStorage.getItem(`code_${problemId}_${defaultLang}`);
                if (savedCode) {
                    setCode(savedCode);
                } else {
                    const starter = data.starterCode?.find(sc => sc.language === defaultLang);
                    setCode(starter?.code || `// ${getLanguageDisplayName(defaultLang)} code template not available.`);
                }
            } catch (err) {
                setProblemError(err.response?.data?.message || "Failed to load problem data.");
            } finally {
                setLoadingProblem(false);
            }
        };
        fetchProblem();
    }, [problemId]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!problemId) return;
            try {
                // Adjust this if you want contest-specific history
                const { data } = await axiosClient.get(`/submission/history/${problemId}`);
                setSubmissionHistory(data);
            } catch (err) {
                console.error("Failed to fetch submission history", err);
            }
        };
        fetchHistory();
    }, [problemId]);

    useEffect(() => {
        if (problem?.starterCode) {
            const starter = problem.starterCode.find(sc => sc.language === language);
            const saved = localStorage.getItem(`code_${problemId}_${language}`);
            setCode(saved || starter?.code || `// ${getLanguageDisplayName(language)} code template not available.`);
        }
    }, [language, problem, problemId]);

    useEffect(() => {
        if (problemId && language && code) {
            localStorage.setItem(`code_${problemId}_${language}`, code);
        }
    }, [code, language, problemId]);

    useEffect(() => {
        const savedMonacoTheme = localStorage.getItem('monacoThemePref');
        if (savedMonacoTheme) {
            setMonacoEditorTheme(savedMonacoTheme);
        }
    }, []);

    const handleMonacoThemeChange = (selectedTheme) => {
        setMonacoEditorTheme(selectedTheme);
        localStorage.setItem('monacoThemePref', selectedTheme);
    };

    const handlePanelMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsDraggingPanel(true);
    }, []);

    const handleConsoleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsDraggingConsole(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDraggingPanel(false);
        setIsDraggingConsole(false);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (isDraggingPanel && panelRef.current) {
            const newWidth = e.clientX;
            setPanelWidth(Math.max(350, Math.min(newWidth, window.innerWidth - 350)));
        }
        if (isDraggingConsole && editorContainerRef.current) {
            const rect = editorContainerRef.current.getBoundingClientRect();
            const height = rect.bottom - e.clientY;
            setConsoleHeight(Math.max(120, Math.min(height, rect.height - 120)));
        }
    }, [isDraggingPanel, isDraggingConsole]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


    const handleRunCode = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setActiveConsoleTab('result');
        setConsoleOutput([{ type: 'info', message: '🚀 Running your code...' }]);

        try {
            const { data } = await axiosClient.post(`/submission/run/${problemId}`, {
                code,
                language,
                customInput: customInput
            });

            const output = [
                { type: 'info', message: `✨ Run Result: ${data.status}` },
                { type: 'info', message: `⚡ Runtime: ${data.runtime || 'N/A'}` },
                { type: 'info', message: `💾 Memory: ${data.memory || 'N/A'}` },
            ];

            if (data.errorMessage) {
                output.push({ type: 'error', message: `Error:\n${data.errorMessage}` });
            }

            if (data.testCases && data.testCases.length > 0) {
                data.testCases.forEach((testCase, index) => {
                    output.push({
                        type: testCase.passed ? 'success' : 'error',
                        message: `Test ${index + 1}: ${testCase.passed ? 'Passed' : 'Failed'}`
                    });
                    output.push({
                        type: 'info',
                        message: `Input: ${safeDisplayValue(testCase.input)}`
                    });
                    output.push({
                        type: 'info',
                        message: `Expected: ${safeDisplayValue(testCase.expected)} | Got: ${safeDisplayValue(testCase.actual)}`
                    });
                    if (testCase.error && testCase.error !== 'Wrong Answer' && testCase.error !== 'Accepted') {
                         output.push({
                            type: 'error',
                            message: `Error Details: ${testCase.error}`
                        });
                    }
                });
            } else {
                output.push({ type: 'info', message: 'No specific test case results available.' });
            }

            setConsoleOutput(output);
        } catch (err) {
            console.error('Run Code Error:', err);
            setConsoleOutput([{ type: 'error', message: `Error: ${err.response?.data?.message || "An unexpected error occurred during run."}` }]);
        } finally {
            setIsRunning(false);
        }
    };


    const handleSubmitCode = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setConsoleOutput([]); 
        setTestResults(null); 
        setActiveTab('submissions');
        setActiveConsoleTab('result'); 

        try {
            const submitUrl = contestId
                ? `/submission/submit/${problemId}?contestId=${contestId}`
                : `/submission/submit/${problemId}`;

            const { data } = await axiosClient.post(submitUrl, { code, language });

            const output = [
                { type: 'info', message: `✨ Submission: ${data.status}` },
                { type: 'info', message: `⚡ Runtime: ${data.runtime || 'N/A'}` },
                { type: 'info', message: `💾 Memory: ${data.memory || 'N/A'}` },
            ];

            if (data.errorMessage) {
                output.push({ type: 'error', message: `❌ Error:\n${data.errorMessage}` });
            }

            if (data.testCases && data.testCases.length > 0) {
                data.testCases.forEach((testCase, index) => {
                    output.push({
                        type: testCase.passed ? 'success' : 'error',
                        message: `Test ${index + 1} (${testCase.passed ? 'Hidden' : 'Hidden'}): ${testCase.passed ? '✅ Passed' : '❌ Failed'}`
                    });
                    if (!testCase.passed) { 
                        output.push({
                            type: 'info',
                            message: `📥 Input: ${safeDisplayValue(testCase.input)}`
                        });
                        output.push({
                            type: 'info',
                            message: `📤 Expected: ${safeDisplayValue(testCase.expected)} | Got: ${safeDisplayValue(testCase.actual)}`
                        });
                        if (testCase.error && testCase.error !== 'Wrong Answer' && testCase.error !== 'Accepted') {
                            output.push({
                                type: 'error',
                                message: `Error Details: ${testCase.error}`
                            });
                        }
                    }
                });
            }

            setConsoleOutput(output);
            setTestResults(data);
            setSubmissionHistory(prev => [data, ...prev]); 
            if (data.status === 'Accepted') {
                if (problem?.isDailyChallenge  && data.userDailyChallenges) {
                    dispatch(updateUserDailyChallenges(data.userDailyChallenges));
                    setDailyChallengeStreakToShow(data.userDailyChallenges.currentStreak);
                    setShowDailyChallengeSuccessModal(true);
                } else if (contestId) {
                    toast.success('🎉 Accepted! Your solution has been recorded for the contest!');
                }
                else { 
                    toast.success('🎉 Accepted! Great job!');
                }
            } else {
                toast.error(`❌ ${data.status}`);
                
            }

        } catch (err) {
            console.error('Submission Error:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "An unexpected error occurred during submission.";
            setConsoleOutput([{ type: 'error', message: `❌ ${errorMsg}` }]);

            const errorResult = {
                status: 'Submission Error',
                errorMessage: errorMsg,
                passed: 0,
                total: 0,
                testCases: []
            };
            setTestResults(errorResult);
            toast.error(`❌ ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleResetCode = () => {
        const starter = problem?.starterCode.find(sc => sc.language === language)?.code;
        if (starter) {
            setCode(starter);
            toast.success('🔄 Code reset to default template');
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        toast.success('📋 Code copied to clipboard!');
    };

    // Loading and error states (unchanged)
    if (loadingProblem) return (
        <div className={`flex justify-center items-center h-screen ${appTheme.background}`}>
            <Loader message="Loading Problem..." size="lg" appTheme={appTheme} />
        </div>
    );

    if (problemError) return (
        <div className={`flex flex-col justify-center items-center h-screen ${appTheme.background} ${appTheme.text} text-center p-6`}>
            <div className="max-w-md space-y-6">
                <div className="relative">
                    <div className={`w-20 h-20 mx-auto rounded-full ${appTheme.errorColor.replace('text-', 'bg-')}/20 flex items-center justify-center border ${appTheme.errorColor.replace('text-', 'border-')}/30`}>
                        <FaTimes className={`w-8 h-8 ${appTheme.errorColor}`} />
                    </div>
                </div>
                <h1 className={`text-2xl font-bold bg-gradient-to-r ${appTheme.errorColor.replace('text-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')} bg-clip-text  `}>
                    Problem Not Found
                </h1>
                <p className={`${appTheme.errorColor} text-base leading-relaxed`}>{problemError}</p>
                <Link to="/problems" className={`group inline-flex items-center gap-3 px-6 py-3 ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${appTheme.secondary.replace('bg-', 'to-')} ${appTheme.buttonText} rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-base`}>
                    <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                    Back to Problems
                </Link>
            </div>
        </div>
    );

    if (!problem) return null;

    return (
        <div className={`flex flex-col h-screen ${appTheme.background}`}>
            {/* Header */}
            {!isFullscreen && <Header />}

            {/* Main Content */}
            <main className={`flex flex-1 overflow-hidden `}>
                {/* Left Panel */}
                {!isFullscreen && showSidebar && (
                    <>
                        <div
                            ref={panelRef}
                            className={`h-full flex-shrink-0 overflow-hidden`}
                            style={{ width: `${panelWidth}px` }}
                        >
                            <ProblemPanel
                                problem={problem}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                submissionHistory={submissionHistory}
                                testResults={testResults}
                                setTestResults={setTestResults}
                                panelWidth={panelWidth}
                                appTheme={appTheme}
                            />
                        </div>
                        <div
                            onMouseDown={handlePanelMouseDown}
                            className={`w-1.5 ${appTheme.border.replace('border-', 'bg-gradient-to-b from-')}/80 ${appTheme.highlightSecondary.replace('text-', 'via-')}/80 ${appTheme.border.replace('border-', 'to-')}/80 cursor-col-resize hover:${appTheme.highlightSecondary.replace('text-', 'from-')}/80 hover:${appTheme.highlight.replace('text-', 'via-')}/80 hover:${appTheme.highlightSecondary.replace('text-', 'to-')}/80 transition-all duration-300`}
                        />
                    </>
                )}

                {/* Editor Area */}
                <div
                    ref={editorContainerRef}
                    className={`flex flex-col flex-1 ${appTheme.background} overflow-hidden`}
                >
                    {/* NEW: Contest Context Banner */}
                    {contestId && (
                        <div className={`p-3 text-center ${appTheme.infoColor.replace('text-', 'bg-')}/10 ${appTheme.infoColor} font-semibold border-b ${appTheme.border}`}>
                            You are solving problem {problem.title} as part of a Contest. <Link to={`/contests/${contestId}/participate`} className="underline hover:no-underline ml-2">Go to Contest</Link>
                        </div>
                    )}
                    {/* Enhanced Editor Toolbar */}
                    <div className={`flex justify-between items-center p-4 ${appTheme.cardBg} border-b ${appTheme.border}`}>
                        <div className="flex items-center gap-3">
                            {/* Language Selector */}
                            <div className="relative group">
                                <select
                                    className={`appearance-none ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} px-4 py-2.5 pr-8 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50 focus:border-transparent cursor-pointer hover:${appTheme.cardBg}/80 transition-all duration-300`}
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                >
                                    {/* Ensure correct language values (e.g., 'cpp' not 'c++') */}
                                    {problem?.starterCode?.map(sc => (
                                        <option key={sc.language} value={sc.language}>
                                            {getLanguageDisplayName(sc.language)}
                                        </option>
                                    ))}
                                </select>
                                <FaChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${appTheme.cardText} pointer-events-none w-3 h-3`} />
                            </div>

                            {/* Settings Dropdown */}
                            <div className="dropdown dropdown-hover">
                                <button
                                    tabIndex={0}
                                    className={`group btn btn-sm ${appTheme.cardBg} border-${appTheme.border.split('-')[1]}-600/50 hover:${appTheme.cardBg}/80 ${appTheme.text} transition-all duration-300`}
                                    aria-label="Editor Settings"
                                >
                                    <IoMdSettings className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-500 ${appTheme.highlightSecondary}`} />
                                </button>
                                <div tabIndex={0} className={`dropdown-content z-50 p-4 shadow-2xl ${appTheme.cardBg} rounded-xl w-64 border ${appTheme.border}/50 mt-2`}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-semibold ${appTheme.text} mb-2`}>Theme</label>
                                            <select
                                                className={`w-full ${appTheme.background}/50 border ${appTheme.border}/50 ${appTheme.text} px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50`}
                                                value={monacoEditorTheme}
                                                onChange={e => handleMonacoThemeChange(e.target.value)}
                                            >
                                                <option value="vs-dark">VS Dark</option>
                                                <option value="vs-light">VS Light</option>
                                                <option value="monokai">Monokai</option>
                                                <option value="dracula">Dracula</option>
                                                <option value="one-dark-pro">One Dark Pro</option>
                                                <option value="nord">Nord</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-semibold ${appTheme.text} mb-2`}>
                                                Font Size: {fontSize}px
                                            </label>
                                            <input
                                                type="range"
                                                min={12}
                                                max={28}
                                                value={fontSize}
                                                onChange={e => setFontSize(parseInt(e.target.value))}
                                                className={`w-full h-2 ${appTheme.background}/50 rounded-lg appearance-none cursor-pointer slider`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopyCode}
                                className={`group btn btn-sm ${appTheme.cardBg} border-${appTheme.border.split('-')[1]}-600/50 hover:${appTheme.cardBg}/80 ${appTheme.text} transition-all duration-300`}
                                aria-label="Copy Code"
                            >
                                <FaRegCopy className={`w-4 h-4 group-hover:scale-110 transition-transform duration-300 ${appTheme.highlightTertiary}`} />
                            </button>
                            <button
                                onClick={handleResetCode}
                                className={`group btn btn-sm ${appTheme.cardBg} border-${appTheme.border.split('-')[1]}-600/50 hover:${appTheme.cardBg}/80 ${appTheme.text} transition-all duration-300`}
                                aria-label="Reset Code"
                            >
                                <IoMdRefresh className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-500 ${appTheme.highlightSecondary}`} />
                            </button>
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className={`group btn btn-sm ${appTheme.cardBg} border-${appTheme.border.split('-')[1]}-600/50 hover:${appTheme.cardBg}/80 ${appTheme.text} transition-all duration-300`}
                                aria-label="Toggle Fullscreen"
                            >
                                {isFullscreen ?
                                    <FaCompress className={`w-4 h-4 group-hover:scale-110 transition-transform duration-300 ${appTheme.highlight}`} /> :
                                    <FaExpand className={`w-4 h-4 group-hover:scale-110 transition-transform duration-300 ${appTheme.highlight}`} />
                                }
                            </button>
                            {/* Toggle Sidebar button for all screen sizes */}
                            <button
                                onClick={() => setShowSidebar(!showSidebar)}
                                className={`group btn btn-sm ${appTheme.cardBg} border-${appTheme.border.split('-')[1]}-600/50 hover:${appTheme.cardBg}/80 ${appTheme.text} transition-all duration-300`}
                                aria-label="Toggle Sidebar"
                            >
                                <FaList className={`w-4 h-4 group-hover:scale-110 transition-transform duration-300 ${appTheme.highlight}`} />
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 overflow-hidden">
                        <MonacoEditor
                            height="100%"
                            language={language}
                            theme={monacoEditorTheme}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            onMount={handleEditorDidMount}
                            options={{
                                minimap: { enabled: window.innerWidth > 1024 },
                                fontSize: fontSize,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                wordWrap: 'on',
                                lineNumbers: 'on',
                                renderLineHighlight: 'all',
                                cursorBlinking: 'smooth',
                                cursorSmoothCaretAnimation: true,
                                smoothScrolling: true,
                                fontLigatures: true,
                                fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
                                scrollbar: {
                                    verticalScrollbarSize: 8,
                                    horizontalScrollbarSize: 8,
                                },
                                padding: { top: 16, bottom: 16 }
                            }}
                        />

                        <FloatingAIChat
                            problem={problem}
                            currentCode={code}
                            language={language}
                            appTheme={appTheme}
                        />
                    </div>

                    {/* Console Resize Handle */}
                    <div
                        onMouseDown={handleConsoleMouseDown}
                        className={`w-full h-1.5 ${appTheme.border.replace('border-', 'bg-gradient-to-r from-')}/80 ${appTheme.highlightSecondary.replace('text-', 'via-')}/80 ${appTheme.border.replace('border-', 'to-')}/80 cursor-row-resize hover:${appTheme.highlightSecondary.replace('text-', 'from-')}/80 hover:${appTheme.highlight.replace('text-', 'via-')}/80 hover:${appTheme.highlightSecondary.replace('text-', 'to-')}/80 transition-all duration-300`}
                    />

                    {/* Enhanced Console */}
                    <div
                        className={`flex flex-col ${appTheme.cardBg} border-t ${appTheme.border}`}
                        style={{ height: `${consoleHeight}px` }}
                    >
                        {/* Console Header */}
                        <div className={`flex justify-between items-center px-4 py-3 border-b ${appTheme.border}`}>
                            <div className="flex space-x-1">
                                <button
                                    className={`group px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${activeConsoleTab === 'input'
                                        ? `${appTheme.buttonPrimary} ${appTheme.buttonText} shadow-lg`
                                        : `${appTheme.cardText} hover:${appTheme.text} hover:${appTheme.background}/40`
                                        }`}
                                    onClick={() => setActiveConsoleTab('input')}
                                >
                                    <FaTerminal className={`w-3 h-3 inline mr-2 group-hover:scale-110 transition-transform duration-300 `} />
                                    Input
                                </button>
                                <button
                                    className={`group px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${activeConsoleTab === 'result'
                                        ? `${appTheme.buttonPrimary} ${appTheme.buttonText} shadow-lg`
                                        : `${appTheme.cardText} hover:${appTheme.text} hover:${appTheme.background}/40`
                                        }`}
                                    onClick={() => setActiveConsoleTab('result')}
                                >
                                    <IoMdFlash className={`w-3 h-3 inline mr-2 group-hover:scale-110 transition-transform duration-300 `} />
                                    Result
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleRunCode}
                                    disabled={isSubmitting || isRunning}
                                    className={`group flex items-center gap-2 px-4 py-2 ${appTheme.primary} ${appTheme.buttonText} rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                                >
                                    {isRunning ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <FaPlay className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
                                    )}
                                    Run Code
                                </button>
                                <button
                                    onClick={handleSubmitCode}
                                    disabled={isRunning || isSubmitting}
                                    className={`group flex items-center gap-2 px-4 py-2 ${appTheme.secondary} ${appTheme.buttonText} rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <HiLightningBolt className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                    )}
                                    Submit
                                </button>
                            </div>
                        </div>

                        {/* Console Content */}
                        <div className={`flex-1 overflow-y-auto p-4 ${appTheme.background}/50`}>
                            {activeConsoleTab === 'input' && (
                                <textarea
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    className={`w-full h-full p-4 ${appTheme.background} ${appTheme.text} font-mono rounded-lg border ${appTheme.border}/50 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50 focus:border-transparent resize-none ${appTheme.cardText} text-sm`}
                                    placeholder="Enter your custom test input here (JSON format recommended: e.g., [1,2] for array, 5 for single, {'a':1} for object). This will be passed to your function as raw string."
                                    spellCheck="false"
                                />
                            )}
                            {activeConsoleTab === 'result' && (
                                <div className="font-mono text-sm">
                                    {consoleOutput.length > 0 ? (
                                        <div className="space-y-3">
                                            {consoleOutput.map((line, i) => (
                                                <TerminalLine key={i} type={line.type} message={line.message} appTheme={appTheme} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${appTheme.background} flex items-center justify-center border ${appTheme.border}/40`}>
                                                <FaTerminal className={`w-6 h-6 ${appTheme.cardText}`} />
                                            </div>
                                            <h4 className={`text-base font-semibold ${appTheme.text} mb-2`}>Ready to Execute</h4>
                                            <p className={`${appTheme.cardText} text-sm max-w-md`}>Run your code to see the execution results here. The output will appear in a terminal-like format.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Daily Challenge Success Modal */}
            {showDailyChallengeSuccessModal && (
                <DailyChallengeSuccessModal
                    streak={dailyChallengeStreakToShow}
                    onClose={() => setShowDailyChallengeSuccessModal(false)}
                />
            )}
        </div>
    );
};

export default Codefield;