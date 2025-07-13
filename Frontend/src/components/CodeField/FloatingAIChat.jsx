import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    FaRobot, FaTrash, FaTimes,
    FaPaperPlane, FaLightbulb, FaCode, FaBug, FaQuestion, FaCopy,
    FaVolumeUp, FaVolumeMute, FaMicrophone, FaMicrophoneSlash,
    FaBookmark, FaHistory,FaGithub,FaStackOverflow,FaExpand,FaMinus,
    FaSearch,
    FaThumbsUp, FaThumbsDown,
    FaRedo, FaUndo, FaCog, FaUsers
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { BsStars, BsCodeSlash } from 'react-icons/bs';
import { MdAutoFixHigh, MdInsertDriveFile, MdSmartToy } from 'react-icons/md';
import axiosClient from '../../api/axiosClient';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula, prism } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Import both for flexibility
import { copyToClipboard } from '../../utils/clipboard';
// useTheme hook is not directly used here as theme is passed via prop for light theme consistency

// Fixed light theme for this specific component. It will NOT change with the app's theme.
// This is the base theme if no `appTheme` prop is passed, or if it's the controlling parent.
const lightThemeDefaults = {
    background: 'bg-gray-100',
    text: 'text-gray-900',
    cardBg: 'bg-white',
    cardText: 'text-gray-600',
    border: 'border-gray-200',
    primary: 'bg-blue-600', // Primary accent color
    primaryHover: 'bg-blue-700',
    secondary: 'bg-indigo-600', // Secondary accent color
    secondaryHover: 'bg-indigo-700',
    buttonText: 'text-white',
    highlight: 'text-blue-600',
    highlightSecondary: 'text-indigo-600',
    highlightTertiary: 'text-purple-600',
    iconBg: 'bg-blue-100', // Background for icons (e.g., FaLightbulb in prompts)
    gradientFrom: 'from-blue-600', // These are not used for solid color strategy
    gradientTo: 'to-indigo-600',   // but kept for compatibility with other components
    successColor: 'text-green-600',
    warningColor: 'text-amber-600',
    errorColor: 'text-red-600',
    infoColor: 'text-blue-600',
};

// Helper function to process text content for simple markdown like bold
const processTextContent = (text) => {
    // Replace **text** with <strong>text</strong>
    // This is a basic markdown parser. For complex markdown, use a dedicated library.
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

const FloatingAIChat = ({ problem, currentCode, language, onCodeUpdate, appTheme: propAppTheme }) => {
    // Use the propAppTheme if provided (from AIChatPage), otherwise fallback to lightThemeDefaults
    // This allows the parent to control the exact theme if needed, otherwise it's light.
    const appTheme = { ...lightThemeDefaults, ...propAppTheme };

    // State management - removed isDarkMode state
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState(null);

    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            parts: [{
                type: 'text',
                content: `Hi! I'm your AI coding assistant. I'm here to help you solve "${problem?.title || 'this problem'}". Feel free to ask me about algorithms, debugging, or any coding concepts!`,
            }],
            timestamp: new Date(),
            id: Date.now()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const [showSettings, setShowSettings] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);
    const [messageCount, setMessageCount] = useState(1);
    const [lastActivity, setLastActivity] = useState(new Date());
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const recognition = useRef(null);
    const searchInputRef = useRef(null);

    // Configuration
    const MAX_INPUT_LENGTH = 2000;
    const MAX_UNDO_STACK = 20;

    const QUICK_PROMPTS = [
        { icon: FaLightbulb, text: "Hint", prompt: "Can you give me a hint about the approach for this problem without giving away the full solution?", category: "help" },
        { icon: FaCode, text: "Review", prompt: "Can you review my current code approach and suggest improvements?", category: "review" },
        { icon: FaBug, text: "Debug", prompt: "I'm getting an error in my code. Can you help me debug it?", category: "debug" },
        { icon: BsStars, text: "Optimize", prompt: "Can you suggest ways to optimize my current solution?", category: "optimize" },
        { icon: MdAutoFixHigh, text: "Fix Errors", prompt: "Can you help me fix any syntax or logical errors in my code?", category: "fix" },
        { icon: FaGithub, text: "Best Practices", prompt: "What are the best practices I should follow for this type of problem?", category: "practices" },
        { icon: FaStackOverflow, text: "Alternative", prompt: "Can you show me an alternative approach to solve this problem?", category: "alternative" },
        { icon: BsCodeSlash, text: "Add Comments", prompt: "Can you add detailed comments to explain my code?", category: "comments" }
    ];

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = 'en-US';

            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputMessage(prev => (prev ? prev.trim() + ' ' : '') + transcript.trim());
                setIsListening(false);
            };

            recognition.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
            recognition.current.onend = () => setIsListening(false);
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (messages.length > 1) {
                const currentChat = { id: Date.now(), title: problem?.title || 'Coding Session', messages: messages, timestamp: new Date(), messageCount: messages.length };
                setChatHistory(prev => [currentChat, ...prev.slice(0, 9)]);
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [messages, problem]);

    useEffect(() => {
        setLastActivity(new Date());
    }, [messages, inputMessage]);

    const scrollToBottom = useCallback(() => {
        if (autoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [autoScroll]);

    useEffect(() => {
        scrollToBottom();
        setMessageCount(messages.length);
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            if (showSearch) {
                searchInputRef.current?.focus();
            } else {
                inputRef.current?.focus();
            }
        }
    }, [isOpen, isMinimized, showSearch]);

    const handleToggleSpeak = (messageId, textContent) => {
        if (isMuted) {
            showNotification("Sound is muted. Unmute from the header to use.");
            return;
        }

        if (speakingMessageId === messageId) {
            speechSynthesis.cancel();
            setSpeakingMessageId(null);
        } else {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }

            const utterance = new SpeechSynthesisUtterance(textContent);
            utterance.rate = 0.9;
            utterance.pitch = 1;

            const voices = speechSynthesis.getVoices();
            const indianVoice = voices.find(v =>
                v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india')
            );

            if (indianVoice) {
                utterance.voice = indianVoice;
            } else {
                console.warn("Indian English voice not found. Using default.");
            }

            utterance.onend = () => setSpeakingMessageId(null);
            utterance.onerror = () => setSpeakingMessageId(null);

            setSpeakingMessageId(messageId);
            speechSynthesis.speak(utterance);
        }
    };

    const toggleVoiceInput = () => {
        if (!recognition.current) return;

        if (isListening) {
            recognition.current.stop();
        } else {
            speechSynthesis.cancel();
            setSpeakingMessageId(null);
            recognition.current.start();
        }
        setIsListening(prev => !prev);
    };

    const saveToUndoStack = () => {
        setUndoStack(prev => [...prev.slice(-MAX_UNDO_STACK + 1), { messages: [...messages] }]);
        setRedoStack([]);
    };

    const handleUndo = () => {
        if (undoStack.length > 0) {
            const lastState = undoStack[undoStack.length - 1];
            setRedoStack(prev => [...prev, { messages: [...messages] }]);
            setMessages(lastState.messages);
            setUndoStack(prev => prev.slice(0, -1));
        }
    };

    const handleRedo = () => {
        if (redoStack.length > 0) {
            const nextState = redoStack[redoStack.length - 1];
            setUndoStack(prev => [...prev, { messages: [...messages] }]);
            setMessages(nextState.messages);
            setRedoStack(prev => prev.slice(0, -1));
        }
    };

    const getAIResponse = async (userMessage, conversationHistory) => {
        if (!problem || !problem.title) {
            console.error("AI chat requires a problem context.");
            return [{ type: 'text', content: "I'm missing the context for this problem. Please reload the page." }];
        }

        const problemContext = {
            title: problem.title,
            description: problem.description,
            testCases: Array.isArray(problem.testCases) ? problem.testCases.join('\n') : problem.testCases,
            startCode: currentCode,
        };

        const historyForAPI = conversationHistory.slice(0, -1);
        const firstUserMessageIndex = historyForAPI.findIndex(msg => msg.role === 'user');
        const validHistorySlice = firstUserMessageIndex === -1 ? [] : historyForAPI.slice(firstUserMessageIndex);

        const formattedHistory = validHistorySlice.map(msg => {
            const role = msg.role === 'assistant' ? 'model' : 'user';
            const text = msg.parts ? msg.parts.map(p => p.content).join('\n') : (msg.content || '');
            return {
                role: role,
                parts: [{ text: text }]
            };
        });

        try {
            const { data } = await axiosClient.post('/ai/chat', {
                question: userMessage,
                history: formattedHistory,
                problemContext: problemContext,
            });

            const aiResponseText = data.response;

            const parts = aiResponseText.split(/(```[\s\S]*?```)/g).map(part => part.trim()).filter(Boolean);
            const processedParts = parts.map(part => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const codeBlock = part.substring(3, part.length - 3);
                    const [lang, ...codeLines] = codeBlock.split('\n');
                    const code = codeLines.join('\n').trim();
                    return { type: 'code', language: lang.trim() || language || 'javascript', content: code };
                }
                return { type: 'text', content: part };
            });

            return processedParts;

        } catch (error) {
            console.error('AI API Error:', error);
            const errorMessage = error.response?.data?.error || "I'm having trouble connecting to my brain right now. Please try again later.";
            return [{ type: 'text', content: errorMessage }];
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;
        saveToUndoStack();

        const userMessage = {
            role: 'user',
            parts: [{ type: 'text', content: inputMessage.trim() }],
            timestamp: new Date(),
            id: Date.now()
        };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInputMessage('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            const responseParts = await getAIResponse(userMessage.parts[0].content, updatedMessages);

            setIsTyping(false);
            const assistantMessage = {
                role: 'assistant',
                parts: [],
                timestamp: new Date(),
                id: Date.now() + 1
            };

            setMessages(prev => [...prev, assistantMessage]);

            const fullTextPart = responseParts.find(p => p.type === 'text');
            if (fullTextPart) {
                const fullText = fullTextPart.content;
                let index = 0;
                const typingSpeed = 20;

                const typingInterval = setInterval(() => {
                    index++;
                    const currentText = fullText.slice(0, index);
                    setMessages(prev => prev.map(msg => {
                        if (msg.id === assistantMessage.id) {
                            return {
                                ...msg,
                                parts: [{ type: 'text', content: currentText }]
                            };
                        }
                        return msg;
                    }));
                    if (index >= fullText.length) {
                        clearInterval(typingInterval);
                        const otherParts = responseParts.filter(p => p.type !== 'text');
                        if (otherParts.length > 0) {
                            setMessages(prev => prev.map(msg => {
                                if (msg.id === assistantMessage.id) {
                                    return {
                                        ...msg,
                                        parts: [{ type: 'text', content: fullText }, ...otherParts]
                                    };
                                }
                                return msg;
                            }));
                        }
                    }
                }, typingSpeed);
            } else {
                setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, parts: responseParts } : msg));
            }

        } catch (error) {
            setIsTyping(false);
            const errorMessage = { role: 'assistant', parts: [{ type: 'text', content: "Sorry, I encountered an error. Please try again." }], timestamp: new Date(), isError: true, id: Date.now() + 2 };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };


    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        } else if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'z': e.preventDefault(); e.shiftKey ? handleRedo() : handleUndo(); break;
                case 'k': case '/': e.preventDefault(); setShowSearch(prev => !prev); break;
                default: break;
            }
        }
    };

    const clearChat = () => {
        if (window.confirm('Are you sure you want to clear the chat history? This cannot be undone.')) {
            saveToUndoStack();
            setMessages([{ role: 'assistant', parts: [{ type: 'text', content: `Chat cleared. How can I help you with "${problem?.title || 'this problem'}"?` }], timestamp: new Date(), id: Date.now() }]);
        }
    };

    const showNotification = (text) => {
        const notification = document.createElement('div');
        notification.textContent = text;
        notification.className = `fixed top-5 right-5 ${appTheme.successColor.replace('text-', 'bg-')} ${appTheme.buttonText} px-4 py-2 rounded-lg shadow-lg z-[9999] animate-pulse`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    };

    const handleCopyCode = async (code) => {
        try {
            await copyToClipboard(code);
            showNotification('Code copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy code:', error);
            showNotification('Failed to copy code.');
        }
    };

    const exportChat = () => {
        const chatData = JSON.stringify({ title: problem?.title || 'Coding Session', timestamp: new Date().toISOString(), messages }, null, 2);
        const blob = new Blob([chatData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-session-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importChat = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const { messages: importedMessages } = JSON.parse(e.target.result);
                    if (Array.isArray(importedMessages)) {
                        saveToUndoStack();
                        const hydratedMessages = importedMessages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
                        setMessages(hydratedMessages);
                        showNotification('Chat imported successfully!');
                    } else { throw new Error('Invalid format'); }
                } catch { showNotification('Invalid chat file.'); }
            };
            reader.readAsText(file);
        }
    };

    const toggleFavorite = (messageId) => setFavorites(prev => prev.includes(messageId) ? prev.filter(id => id !== messageId) : [...prev, messageId]);
    const rateMessage = (messageId, rating) => setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, rating: msg.rating === rating ? null : rating } : msg));
    const insertCodeIntoEditor = (code) => {
        if (onCodeUpdate) {
            onCodeUpdate(code);
            showNotification('Code inserted into editor!');
        }
    };

    const filteredMessages = messages.filter(message => {
        if (!searchTerm) return true;
        const content = message.content || (message.parts?.map(p => p.content).join(' ') || '');
        return content.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Helper for solid button colors (use `appTheme.buttonPrimary` and `appTheme.buttonPrimaryHover`)
    const getSolidButtonClasses = () => `${appTheme.buttonPrimary} hover:${appTheme.buttonPrimaryHover}`;


    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button onClick={() => setIsOpen(true)} className={`w-16 h-16 ${getSolidButtonClasses()} hover:scale-110 ${appTheme.buttonText} rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group animate-pulse hover:animate-none`} aria-label="Open AI Chat">
                    <FaRobot className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
                    <div className={`absolute -top-1 -right-1 w-5 h-5 ${appTheme.highlight.replace('text-', 'bg-')} rounded-full flex items-center justify-center shadow-lg`}>
                        <HiSparkles className="w-3 h-3 text-white" />
                    </div>
                </button>
            </div>
        );
    }

    // Helper function to get text color for code highlighter based on appTheme's background
    const getHighlighterTheme = () => {
        const isAppThemeDark = appTheme.background.includes('dark') || appTheme.background.includes('black') || appTheme.background.includes('zinc-9');
        return isAppThemeDark ? dracula : prism;
    };


    // UI IMPROVEMENT: Helper functions for dynamic sizing
    const getChatHeight = () => (isExpanded ? 'calc(100vh - 4rem)' : isMinimized ? '3.5rem' : 'min(80vh, 700px)');
    const getChatWidth = () => (isExpanded ? 'calc(100vw - 4rem)' : isMinimized ? '350px' : '450px');

    return (
        <div
            ref={chatContainerRef}
            className={`fixed z-50 rounded-2xl shadow-2xl transition-all duration-500 ease-in-out flex flex-col ${appTheme.background} ${appTheme.text} ${isExpanded ? 'inset-2' : 'bottom-6 right-6'}`}
            style={{ width: getChatWidth(), height: getChatHeight(), backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `${appTheme.border}/50`, }} >
            {/* Header */}
            <div className={`flex items-center justify-between p-3 border-b shrink-0 ${appTheme.border}/50`}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-9 h-9 ${appTheme.buttonPrimary} rounded-full flex items-center justify-center`}>
                            <MdSmartToy className={appTheme.buttonText} />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${appTheme.successColor.replace('text-', 'bg-')} rounded-full border-2 ${appTheme.background} animate-pulse`}></div>
                    </div>
                    {!isMinimized && (
                        <div>
                            <h3 className={`font-bold text-base ${appTheme.text}`}>AI Assistant</h3>
                            <p className={`text-xs ${appTheme.cardText}`}>{isTyping ? 'Typing...' : `${messageCount} messages`}</p>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Removed Dark/Light Mode Toggle */}
                    <button onClick={() => setIsMuted(!isMuted)} className={`p-2 rounded-lg hover:${appTheme.background}/20 transition-colors ${appTheme.text}`} title={isMuted ? "Unmute Sound" : "Mute Sound"}>
                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>
                    <button onClick={() => setShowSearch(!showSearch)} className={`p-2 rounded-lg hover:${appTheme.background}/20 transition-colors ${appTheme.text}`} title="Search (Ctrl+K)">
                        <FaSearch />
                    </button>
                    <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg hover:${appTheme.background}/20 transition-colors ${appTheme.text}`} title="Settings">
                        <FaCog />
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className={`p-2 rounded-lg hover:${appTheme.background}/20 transition-colors ${appTheme.text}`} title={isExpanded ? "Restore" : "Expand"}>
                        {isExpanded ? <FaCompress /> : <FaExpand />}
                    </button>
                    <button onClick={() => setIsMinimized(!isMinimized)} className={`p-2 rounded-lg hover:${appTheme.background}/20 transition-colors ${appTheme.text}`} title={isMinimized ? "Restore" : "Minimize"}>
                        {isMinimized ? <FaExpandArrowsAlt /> : <FaMinus />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className={`p-2 rounded-lg hover:${appTheme.errorColor.replace('text-', 'bg-')}/20 ${appTheme.errorColor} hover:${appTheme.errorColor} transition-colors`} title="Close">
                        <FaTimes />
                    </button>
                </div>
            </div>
            {/* Body */}
            <div className={`flex-1 flex flex-col min-h-0 ${isMinimized && 'hidden'}`}>
                {/* Search & Settings */}
                {showSearch && (
                    <div className={`p-2 border-b ${appTheme.border}/30`}>
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search messages..."
                                className={`w-full border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 ${appTheme.cardBg} ${appTheme.border} ${appTheme.text} ring-${appTheme.primary.split('-')[1]}-500/50`}
                            />
                            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2"><FaTimes /></button>}
                        </div>
                    </div>
                )}
                {showSettings && (
                    <div className={`p-3 border-b ${appTheme.border}/30 space-y-3`}>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${appTheme.cardText}`}>Theme</label>
                                {/* Theme selection is now disabled and follows app theme */}
                                <select disabled value="auto" className={`w-full border rounded px-2 py-1 text-sm ${appTheme.cardBg} ${appTheme.border} ${appTheme.text}`}>
                                    <option value="auto">Auto (Sync with App Theme)</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${appTheme.cardText}`}>Font Size ({fontSize}px)</label>
                                <input type="range" min="12" max="18" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full slider" />
                            </div>
                        </div>
                        <div className={`flex items-center justify-between text-sm ${appTheme.cardText}`}>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} className="rounded" /> Auto-scroll
                            </label>
                            <div className="flex gap-2">
                                <button onClick={exportChat} className={`px-2 py-1 rounded text-xs ${appTheme.background}/20 hover:${appTheme.background}/30 ${appTheme.text}`}>Export</button>
                                <input type="file" accept=".json" onChange={importChat} id="import-chat-file" className="hidden" />
                                <label htmlFor="import-chat-file" className={`cursor-pointer px-2 py-1 rounded text-xs ${appTheme.background}/20 hover:${appTheme.background}/30 ${appTheme.text}`}>Import</label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {(undoStack.length > 0 || redoStack.length > 0) && (
                        <div className="flex justify-center gap-2 -mt-2 mb-2">
                            <button onClick={handleUndo} disabled={!undoStack.length} className={`px-2 py-0.5 rounded text-xs ${appTheme.background}/20 hover:${appTheme.background}/30 disabled:opacity-50 disabled:cursor-not-allowed ${appTheme.text}`}>
                                <FaUndo className="inline mr-1" />Undo
                            </button>
                            <button onClick={handleRedo} disabled={!redoStack.length} className={`px-2 py-0.5 rounded text-xs ${appTheme.background}/20 hover:${appTheme.background}/30 disabled:opacity-50 disabled:cursor-not-allowed ${appTheme.text}`}>
                                <FaRedo className="inline mr-1" />Redo
                            </button>
                        </div>
                    )}
                    {filteredMessages.map((message) => (
                        <div key={message.id} className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                            {message.role === 'assistant' && (
                                <div className={`w-7 h-7 ${appTheme.buttonPrimary} rounded-full flex items-center justify-center shrink-0`}>
                                    <MdSmartToy className={appTheme.buttonText} />
                                </div>
                            )}
                            <div className={`max-w-[90%] p-3 rounded-2xl relative ${message.role === 'user'
                                ? `${appTheme.buttonPrimary} ${appTheme.buttonText} rounded-br-lg`
                                : message.isError
                                    ? `${appTheme.errorColor.replace('text-', 'bg-')}/20 ${appTheme.errorColor} border ${appTheme.errorColor.replace('text-', 'border-')}/30 rounded-bl-lg`
                                    : `${appTheme.cardBg} rounded-bl-lg ${appTheme.text}`
                                }`} style={{ fontSize: `${fontSize}px` }}>
                                <div className={`absolute top-0 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center ${appTheme.cardBg}/50 backdrop-blur-sm rounded-full border ${appTheme.border}/50 shadow-md p-0.5 gap-1 ${appTheme.text}`}>
                                    {message.role === 'assistant' && (
                                        <button onClick={() => handleToggleSpeak(message.id, message.parts.filter(p => p.type === 'text').map(p => p.content).join(' '))} className={`p-1 rounded-full hover:${appTheme.background}/20`} title="Read aloud">
                                            {speakingMessageId === message.id ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
                                        </button>
                                    )}
                                    <button onClick={() => rateMessage(message.id, 'up')} className={`p-1 rounded-full hover:${appTheme.background}/20 ${message.rating === 'up' && `${appTheme.successColor.replace('text-', 'bg-')}/50`}`} title="Good">
                                        <FaThumbsUp size={12} />
                                    </button>
                                    <button onClick={() => rateMessage(message.id, 'down')} className={`p-1 rounded-full hover:${appTheme.background}/20 ${message.rating === 'down' && `${appTheme.errorColor.replace('text-', 'bg-')}/50`}`} title="Bad">
                                        <FaThumbsDown size={12} />
                                    </button>
                                    <button onClick={() => toggleFavorite(message.id)} className={`p-1 rounded-full hover:${appTheme.background}/20 ${favorites.includes(message.id) && appTheme.highlight}`} title="Bookmark">
                                        <FaBookmark size={12} />
                                    </button>
                                    <button onClick={() => copyToClipboard(message.content || message.parts.map(p => p.content).join('\n'))} className={`p-1 rounded-full hover:${appTheme.background}/20 ${appTheme.text}`} title="Copy">
                                        <FaCopy size={12} />
                                    </button>
                                </div>
                                {message.parts?.map((part, i) => (
                                    <div key={i} className="last:mb-0">
                                        {part.type === 'code' ? (
                                            <div className="relative my-2">
                                                <div className="absolute top-2 right-2 z-10 flex gap-1">
                                                    <button onClick={() => handleCopyCode(part.content)} className={`p-1.5 ${appTheme.cardBg}/50 rounded-md hover:${appTheme.cardBg}/80 transition-colors ${appTheme.text}`} title="Copy Code">
                                                        <FaCopy size={12} />
                                                    </button>
                                                    {onCodeUpdate && (
                                                        <button onClick={() => insertCodeIntoEditor(part.content)} className={`p-1.5 ${appTheme.cardBg}/50 rounded-md hover:${appTheme.cardBg}/80 transition-colors ${appTheme.text}`} title="Insert into Editor">
                                                            <MdInsertDriveFile size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                                <SyntaxHighlighter
                                                    language={part.language}
                                                    style={getHighlighterTheme()} // Use dynamic theme
                                                    customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: `${fontSize - 1}px` }}
                                                    codeTagProps={{ style: { fontFamily: '"Fira Code", monospace' } }}
                                                >
                                                    {part.content}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            // Process text content to replace markdown bold with <strong>
                                            <div className="leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: processTextContent(part.content) }}></div>
                                        )}
                                    </div>
                                ))}
                                <div className={`text-xs mt-2 opacity-60 ${appTheme.cardText}`}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            {message.role === 'user' && (
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${appTheme.cardBg} ${appTheme.text}`}>You</div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start items-end gap-2">
                            <div className={`w-7 h-7 ${appTheme.buttonPrimary} rounded-full flex items-center justify-center shrink-0`}>
                                <MdSmartToy className={appTheme.buttonText} />
                            </div>
                            <div className={`${appTheme.cardBg} p-3 rounded-2xl rounded-bl-lg`}>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className={`w-2 h-2 ${appTheme.cardText.replace('text-', 'bg-')} rounded-full animate-bounce`}></div>
                                        <div className={`w-2 h-2 ${appTheme.cardText.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                                        <div className={`w-2 h-2 ${appTheme.cardText.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {/* Footer */}
                <div className={`px-3 pt-2 border-t shrink-0 ${appTheme.border}/30`}>
                    <div className={`flex gap-2 overflow-x-auto pb-2 custom-scrollbar`}>
                        {QUICK_PROMPTS.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => { setInputMessage(p.prompt); inputRef.current?.focus(); }}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${appTheme.cardBg}/50 hover:${appTheme.cardBg}/80 ${appTheme.border}/50 ${appTheme.text}`}
                            >
                                <p.icon className={appTheme.highlightSecondary} />
                                {p.text}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={`p-3 border-t shrink-0 ${appTheme.border}/30`}>
                    <div className={`flex items-end gap-2 border rounded-xl transition-all duration-200 ${appTheme.cardBg} ${appTheme.border} focus-within:ring-2 focus-within:ring-${appTheme.primary.split('-')[1]}-500/50`}>
                        <textarea
                            ref={inputRef}
                            value={inputMessage}
                            onChange={(e) => e.target.value.length <= MAX_INPUT_LENGTH && setInputMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask me anything..."
                            className={`flex-1 bg-transparent pl-3 pr-2 py-2.5 focus:outline-none resize-none ${appTheme.text}`}
                            rows="1"
                            style={{ fontSize: `${fontSize}px`, minHeight: '46px', maxHeight: '150px' }}
                            onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`; }}
                            disabled={isLoading}
                        />
                        <div className="flex items-center p-1 gap-1">
                            {recognition.current &&
                                <button onClick={toggleVoiceInput} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors shrink-0 ${isListening ? `${appTheme.errorColor.replace('text-', 'bg-')} ${appTheme.buttonText} animate-pulse` : `hover:${appTheme.background}/20 ${appTheme.text}`}`} title={isListening ? "Stop listening" : "Voice input"}>
                                    {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
                                </button>
                            }
                            <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 shrink-0 ${appTheme.buttonPrimary} ${appTheme.buttonText} disabled:${appTheme.cardBg} disabled:cursor-not-allowed`} title="Send Message">
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <FaPaperPlane />}
                            </button>
                        </div>
                    </div>
                    <div className={`flex justify-between mt-1.5 text-xs ${appTheme.cardText}`}>
                        <span>Enter to send • Ctrl+K to search</span>
                        <span className={inputMessage.length > MAX_INPUT_LENGTH * 0.9 ? `${appTheme.errorColor}` : ''}>{inputMessage.length}/{MAX_INPUT_LENGTH}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default FloatingAIChat;