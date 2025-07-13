import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import {
    FaCheck, FaTimes, FaRegCopy, FaPlay, FaExpand, FaCompress,
    FaSyncAlt, FaHistory, FaBookmark, FaList, FaArrowLeft,
    FaCode, FaTerminal, FaEye, FaChevronDown, FaLightbulb
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
import * as themes from '../utils/themes';
import ProblemDescription from '../components/CodeField/ProblemDescription';
import SolutionsTab from '../components/CodeField/SolutionsTab'
import SubmissionsTab from '../components/CodeField/SubmissionsTab';
import FloatingAIChat from '../components/CodeField/FloatingAIChat';

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

const Loader = ({ message = "Loading...", size = "md" }) => (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="relative">
            <div className={`animate-spin rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 ${size === 'lg' ? 'h-20 w-20' : size === 'sm' ? 'h-10 w-10' : 'h-16 w-16'
                }`} style={{ clipPath: 'circle(50% at 50% 50%)' }}>
                <div className={`absolute inset-1 rounded-full bg-slate-900 ${size === 'lg' ? 'h-18 w-18' : size === 'sm' ? 'h-8 w-8' : 'h-14 w-14'
                    }`}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className={`rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse ${size === 'lg' ? 'h-4 w-4' : size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
                    }`}></div>
            </div>
        </div>
        <div className="text-center space-y-2">
            <p className="text-slate-300 font-medium animate-pulse">{message}</p>
            <div className="flex space-x-1 justify-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
        </div>
    </div>
);

const ProblemPanel = ({ problem, activeTab, setActiveTab, submissionHistory, testResults, setTestResults, panelWidth }) => {
    const difficultyColors = {
        easy: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-400/40',
        medium: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-400/40',
        hard: 'bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-300 border-rose-400/40'
    };

    const statusColors = {
        'Accepted': 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-400',
        'Wrong Answer': 'bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-400',
        'Runtime Error': 'bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-400',
        'Time Limit Exceeded': 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400',
        'Compilation Error': 'bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-400',
        'Memory Limit Exceeded': 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400',
        'Submission Error': 'bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-400'
    };

    const tabs = [
        { id: 'description', name: 'Description', icon: FaEye, gradient: 'from-blue-500 to-cyan-500' },
        { id: 'solutions', name: 'Solutions', icon: HiLightningBolt, gradient: 'from-purple-500 to-pink-500' },
        { id: 'submissions', name: 'Submissions', icon: FaHistory, gradient: 'from-orange-500 to-red-500' }
    ];

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700/50 overflow-hidden">
            <div className="p-4 bg-slate-800 border-b border-slate-700/50">
                <div className="flex space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/30">
                    {tabs.map(({ id, name, icon: Icon, gradient }) => (
                        <button
                            key={id}
                            className={`group flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden ${activeTab === id
                                ? 'text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                                }`}
                            onClick={() => setActiveTab(id)}
                        >
                            {activeTab === id && (
                                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-80 rounded-lg`}></div>
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
                    <ProblemDescription problem={problem} difficultyColors={difficultyColors} panelWidth={panelWidth} />
                )}
                {activeTab === 'solutions' && <SolutionsTab problem={problem} panelWidth={panelWidth} />}
                {activeTab === 'submissions' && (
                    <SubmissionsTab
                        testResults={testResults}
                        setTestResults={setTestResults}
                        submissionHistory={submissionHistory}
                        statusColors={statusColors}
                        panelWidth={panelWidth}
                    />
                )}
            </div>
        </div>
    );
};

const TerminalLine = ({ type, message }) => {
    const getPrompt = () => {
        switch (type) {
            case 'error': return <span className="text-red-500">❯</span>;
            case 'success': return <span className="text-emerald-500">❯</span>;
            case 'info': return <span className="text-blue-500">❯</span>;
            default: return <span className="text-slate-500">❯</span>;
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'error': return 'text-red-400';
            case 'success': return 'text-emerald-400';
            case 'info': return 'text-blue-400';
            default: return 'text-slate-300';
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

const Codefield = () => {
    const editorRef = useRef(null);
    const editorContainerRef = useRef(null);
    const panelRef = useRef(null);

    const { problemId } = useParams();
    const navigate = useNavigate();

    // UI State
    const [panelWidth, setPanelWidth] = useState(450);
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);
    const [consoleHeight, setConsoleHeight] = useState(220);
    const [isDraggingConsole, setIsDraggingConsole] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    // Editor Settings
    const [fontSize, setFontSize] = useState(15);
    const [theme, setTheme] = useState('vs-dark');

    // Problem State
    const [problem, setProblem] = useState(null);
    const [loadingProblem, setLoadingProblem] = useState(true);
    const [problemError, setProblemError] = useState(null);
    const [submissionHistory, setSubmissionHistory] = useState([]);

    // Code State
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [customInput, setCustomInput] = useState('');

    // Execution State
    const [consoleOutput, setConsoleOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testResults, setTestResults] = useState(null);

    // Tab State
    const [activeTab, setActiveTab] = useState('description');
    const [activeConsoleTab, setActiveConsoleTab] = useState('input');

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        
        // Register themes
        monaco.editor.defineTheme('monokai', themes.monokaiTheme);
        monaco.editor.defineTheme('dracula', themes.draculaTheme);
        monaco.editor.defineTheme('one-dark-pro', themes.oneDarkProTheme);
        monaco.editor.defineTheme('nord', themes.nordTheme);
        
        // Register C++ language configuration
        monaco.languages.register({ id: 'c++' });
        monaco.languages.setLanguageConfiguration('c++', {
            comments: {
                lineComment: '//',
                blockComment: ['/*', '*/']
            },
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ],
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ]
        });
        
        editor.focus();
    };

    // ... (keep all your existing useEffect hooks and data fetching logic)

    const handleRunCode = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setActiveConsoleTab('result');
        setConsoleOutput([{ type: 'info', message: '🚀 Running your code...' }]);
        
        try {
            const { data } = await axiosClient.post(`/submission/run/${problemId}`, {
                code,
                language,
                input: customInput
            });

            const output = [
                { type: 'info', message: `✨ Submission: ${data.status}` },
                { type: 'info', message: `⚡ Runtime: ${data.runtime || 'N/A'}` },
                { type: 'info', message: `💾 Memory: ${data.memory || 'N/A'}` },
            ];

            if (data.errorMessage) {
                output.push({ type: 'error', message: `Error:\n${data.errorMessage}` });
            }

            if (data.testCases) {
                data.testCases.forEach((testCase, index) => {
                    output.push({
                        type: testCase.passed ? 'success' : 'error',
                        message: `Test ${index + 1}: ${testCase.passed ? 'Passed' : 'Failed'}`
                    });
                    if (!testCase.passed) {
                        output.push({
                            type: 'info',
                            message: `Input: ${JSON.stringify(testCase.input)}`
                        });
                        output.push({
                            type: 'info',
                            message: `Expected: ${testCase.expected} | Got: ${testCase.actual}`
                        });
                    }
                });
            }

            setConsoleOutput(output);
        } catch (err) {
            setConsoleOutput([{ type: 'error', message: `Error: ${err.response?.data?.message || "An error occurred."}` }]);
        } finally {
            setIsRunning(false);
        }
    };

    // ... (keep all your other handler functions)

    // Loading and error states (keep these the same)

    return (
        <div className={`flex flex-col h-screen bg-slate-900`}>
            <main className={`flex flex-1 overflow-hidden`}>
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
                            />
                        </div>
                        <div
                            onMouseDown={handlePanelMouseDown}
                            className="w-1.5 bg-gradient-to-b from-slate-700 via-blue-500 to-slate-700 cursor-col-resize hover:from-blue-400 hover:via-purple-500 hover:to-blue-400 transition-all duration-300"
                        />
                    </>
                )}

                {/* Editor Area */}
                <div
                    ref={editorContainerRef}
                    className="flex flex-col flex-1 bg-slate-900 overflow-hidden"
                >
                    {/* Enhanced Editor Toolbar */}
                    <div className={`flex justify-between items-center p-4 bg-slate-800 border-b border-slate-700/50`}>
                        <div className="flex items-center gap-3">
                            {/* Language Selector */}
                            <div className="relative group">
                                <select
                                    className="appearance-none bg-slate-700 border border-slate-600/50 text-white px-4 py-2.5 pr-8 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent cursor-pointer hover:bg-slate-600 transition-all duration-300"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                >
                                    {problem?.starterCode?.map(sc => (
                                        <option key={sc.language} value={sc.language}>
                                            {getLanguageDisplayName(sc.language)}
                                        </option>
                                    ))}
                                </select>
                                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none w-3 h-3" />
                            </div>

                            {/* Settings Dropdown */}
                            <div className="dropdown dropdown-hover">
                                <button
                                    tabIndex={0}
                                    className="group btn btn-sm bg-slate-700 border-slate-600/50 hover:bg-slate-600 text-white transition-all duration-300"
                                    aria-label="Editor Settings"
                                >
                                    <IoMdSettings className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                </button>
                                <div tabIndex={0} className="dropdown-content z-50 p-4 shadow-2xl bg-slate-800 rounded-xl w-64 border border-slate-700/50 mt-2">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-200 mb-2">Theme</label>
                                            <select
                                                className="w-full bg-slate-700/50 border border-slate-600/50 text-white px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                value={theme}
                                                onChange={e => setTheme(e.target.value)}
                                            >
                                                <option value="vs-dark">VS Dark</option>
                                                <option value="light">VS Light</option>
                                                <option value="monokai">Monokai</option>
                                                <option value="dracula">Dracula</option>
                                                <option value="one-dark-pro">One Dark Pro</option>
                                                <option value="nord">Nord</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-200 mb-2">
                                                Font Size: {fontSize}px
                                            </label>
                                            <input
                                                type="range"
                                                min={12}
                                                max={28}
                                                value={fontSize}
                                                onChange={e => setFontSize(parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer slider"
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
                                className="group btn btn-sm bg-slate-700 border-slate-600/50 hover:bg-slate-600 text-white transition-all duration-300"
                                aria-label="Copy Code"
                            >
                                <FaRegCopy className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                            </button>
                            <button
                                onClick={handleResetCode}
                                className="group btn btn-sm bg-slate-700 border-slate-600/50 hover:bg-slate-600 text-white transition-all duration-300"
                                aria-label="Reset Code"
                            >
                                <IoMdRefresh className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="group btn btn-sm bg-slate-700 border-slate-600/50 hover:bg-slate-600 text-white transition-all duration-300"
                                aria-label="Toggle Fullscreen"
                            >
                                {isFullscreen ?
                                    <FaCompress className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" /> :
                                    <FaExpand className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                }
                            </button>
                            <button
                                onClick={() => setShowSidebar(!showSidebar)}
                                className="md:hidden group btn btn-sm bg-slate-700 border-slate-600/50 hover:bg-slate-600 text-white transition-all duration-300"
                                aria-label="Toggle Sidebar"
                            >
                                <FaList className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 overflow-hidden">
                        <MonacoEditor
                            height="100%"
                            language={language}
                            theme={theme}
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
                        />
                    </div>

                    {/* Console Resize Handle */}
                    <div
                        onMouseDown={handleConsoleMouseDown}
                        className="w-full h-1.5 bg-gradient-to-r from-slate-700 via-blue-500 to-slate-700 cursor-row-resize hover:from-blue-400 hover:via-purple-500 hover:to-blue-400 transition-all duration-300"
                    />

                    {/* Enhanced Console */}
                    <div
                        className="flex flex-col bg-slate-800 border-t border-slate-700/50"
                        style={{ height: `${consoleHeight}px` }}
                    >
                        {/* Console Header */}
                        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700/50">
                            <div className="flex space-x-1">
                                <button
                                    className={`group px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${activeConsoleTab === 'input'
                                        ? 'bg-slate-700 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                                        }`}
                                    onClick={() => setActiveConsoleTab('input')}
                                >
                                    <FaTerminal className="w-3 h-3 inline mr-2 group-hover:scale-110 transition-transform duration-300" />
                                    Input
                                </button>
                                <button
                                    className={`group px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${activeConsoleTab === 'result'
                                        ? 'bg-slate-700 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                                        }`}
                                    onClick={() => setActiveConsoleTab('result')}
                                >
                                    <IoMdFlash className="w-3 h-3 inline mr-2 group-hover:scale-110 transition-transform duration-300" />
                                    Result
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleRunCode}
                                    disabled={isSubmitting || isRunning}
                                    className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                                    className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-900/50">
                            {activeConsoleTab === 'input' && (
                                <textarea
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    className="w-full h-full p-4 bg-slate-900 text-white font-mono rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none placeholder-slate-500 text-sm"
                                    placeholder="Enter your custom test input here... (JSON format recommended)"
                                    spellCheck="false"
                                />
                            )}
                            {activeConsoleTab === 'result' && (
                                <div className="font-mono text-sm">
                                    {consoleOutput.length > 0 ? (
                                        <div className="space-y-3">
                                            {consoleOutput.map((line, i) => (
                                                <TerminalLine key={i} type={line.type} message={line.message} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700/40">
                                                <FaTerminal className="w-6 h-6 text-slate-500" />
                                            </div>
                                            <h4 className="text-base font-semibold text-slate-300 mb-2">Ready to Execute</h4>
                                            <p className="text-slate-500 text-sm max-w-md">Run your code to see the execution results here. The output will appear in a terminal-like format.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Custom Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(51, 65, 85, 0.4);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, rgba(100, 116, 139, 0.8), rgba(148, 163, 184, 0.6));
                    border-radius: 4px;
                    border: 1px solid rgba(71, 85, 105, 0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, rgba(148, 163, 184, 0.9), rgba(203, 213, 225, 0.7));
                }
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }
                .slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
                }
                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
                    cursor: pointer;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                }
                .slider::-moz-range-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
                }
            `}</style>
        </div>
    );
};

export default Codefield;