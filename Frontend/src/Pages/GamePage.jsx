import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient'
import io from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { 
    FaTrophy, 
    FaCalendarAlt, 
    FaClock, 
    FaBolt, 
    FaHome, 
    FaDoorOpen,
    FaUser,
    FaGamepad,
    FaCog,
    FaSearch,
    FaPlus,
    FaSignInAlt,
    FaSpinner,
    FaUsers,
    FaChartLine
} from 'react-icons/fa';
import Header from '../components/layout/Header';

// Dynamic default theme that can be overridden
const defaultTheme = {
    background: 'bg-gray-900', 
    text: 'text-white', 
    primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', 
    secondary: 'bg-blue-600', 
    secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', 
    cardText: 'text-gray-300', 
    border: 'border-gray-700',
    buttonPrimary: 'bg-indigo-600',
    buttonPrimaryHover: 'bg-indigo-700',
    buttonText: 'text-white', 
    highlight: 'text-cyan-400', 
    highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', 
    iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', 
    gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    errorColor: 'text-red-400',
    warningColor: 'text-amber-400',
    infoColor: 'text-blue-400',
    accent: 'bg-cyan-500',
};

// Enhanced Loader component with dynamic theming
const Loader = ({ message = "Loading...", size = "md", appTheme }) => {
    const theme = { ...defaultTheme, ...appTheme };
    
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className="flex items-center justify-center space-x-2">
            <FaSpinner className={`${sizeClasses[size]} ${theme.highlight} animate-spin`} />
            {message && <span className={`text-sm ${theme.cardText}`}>{message}</span>}
        </div>
    );
};

// Dynamic Statistics Card Component
const StatCard = ({ icon: Icon, label, value, theme, delay = 0 }) => (
    <div 
        className={`${theme.cardBg} p-4 rounded-xl border ${theme.border} shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${theme.iconBg}`}>
                <Icon className={`w-5 h-5 ${theme.highlight}`} />
            </div>
            <div>
                <p className={`text-sm ${theme.cardText} font-medium`}>{label}</p>
                <p className={`text-lg font-bold ${theme.text}`}>{value}</p>
            </div>
        </div>
    </div>
);

// Dynamic Game Mode Card Component
const GameModeCard = ({ 
    icon: Icon, 
    title, 
    description, 
    children, 
    theme, 
    gradientColors = ["from-indigo-500", "to-purple-600"],
    isLoading = false,
    delay = 0 
}) => {
    const gradientClass = `${gradientColors[0]} ${gradientColors[1]}`;
    
    return (
        <div 
            className={`${theme.cardBg} rounded-2xl border ${theme.border} shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden group`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Dynamic background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
            
            {/* Content */}
            <div className="relative z-10 p-8">
                {/* Header */}
                <div className="flex items-start space-x-4 mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientClass} shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-xl font-bold ${theme.text} mb-2`}>{title}</h3>
                        <p className={`${theme.cardText} text-sm leading-relaxed`}>{description}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {children}
                </div>
            </div>

            {/* Loading overlay */}
            {isLoading && (
                <div className={`absolute inset-0 ${theme.cardBg}/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl`}>
                    <Loader message="Processing..." size="md" appTheme={theme} />
                </div>
            )}
        </div>
    );
};

// Dynamic Custom Select Component
const CustomSelect = ({ label, value, onChange, options, disabled, theme }) => {
    const getAccentColorBase = () => {
        const accentColorClass = theme.accent || theme.buttonPrimary;
        const match = accentColorClass.match(/bg-(\w+)-\d+/);
        return match ? match[1] : 'blue';
    };

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold ${theme.cardText}`}>
                {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full p-3 rounded-lg ${theme.cardBg} ${theme.text} border ${theme.border} focus:ring-2 focus:ring-${getAccentColorBase()}-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <FaCog className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.cardText} pointer-events-none w-4 h-4`} />
            </div>
        </div>
    );
};

// Dynamic Action Button Component
const ActionButton = ({ 
    onClick, 
    disabled, 
    loading, 
    children, 
    variant = "primary", 
    icon: Icon,
    theme 
}) => {
    const variants = {
        primary: `${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText}`,
        secondary: `${theme.cardBg} ${theme.text} border ${theme.border} hover:${theme.cardBg}/80`,
        danger: `${theme.errorColor.replace('text-', 'bg-')}/20 ${theme.errorColor} hover:${theme.errorColor.replace('text-', 'bg-')}/30`
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 ${variants[variant]}`}
        >
            {loading ? (
                <Loader size="sm" appTheme={theme} />
            ) : (
                <>
                    {Icon && <Icon className="w-5 h-5" />}
                    <span>{children}</span>
                </>
            )}
        </button>
    );
};

const GamePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { theme: appThemeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...appThemeFromContext };

    // Dynamic helper function
    const getAccentColorBase = () => {
        const accentColorClass = theme.accent || theme.buttonPrimary;
        const match = accentColorClass.match(/bg-(\w+)-\d+/);
        return match ? match[1] : 'blue';
    };

    const sectionClasses = `backdrop-blur-xl border ${theme.border}/20 shadow-xl rounded-2xl`;

    // Loading states
    const [quickMatchLoading, setQuickMatchLoading] = useState(false);
    const [createRoomLoading, setCreateRoomLoading] = useState(false);
    const [joinRoomLoading, setJoinRoomLoading] = useState(false);

    // Game states
    const [searchingOpponent, setSearchingOpponent] = useState(false);
    const [searchTimer, setSearchTimer] = useState(0);
    const [showNoPlayerModal, setShowNoPlayerModal] = useState(false);

    // Form states
    const [roomIdInput, setRoomIdInput] = useState('');
    const [quickMatchDifficulty, setQuickMatchDifficulty] = useState('easy');
    const [quickMatchTime, setQuickMatchTime] = useState(10);
    const [createRoomDifficulty, setCreateRoomDifficulty] = useState('easy');
    const [createRoomTime, setCreateRoomTime] = useState(10);

    // Battle animation states
    const [showBattleAnimation, setShowBattleAnimation] = useState(false);
    const [matchedUsers, setMatchedUsers] = useState({ currentUser: null, opponent: null });
    const battleAnimationTimerRef = useRef(null);

    const VITE_API_URL = import.meta.env.VITE_API_URL;
    const lobbySocketRef = useRef(null);
    const searchTimerRef = useRef(null);

    const userEloRating = user?.stats?.eloRating || 1000;
    const userFirstName = user?.firstName || 'Player';
    const userStats = user?.stats || {};
    console.log(userStats)

    // Options for dropdowns
    const difficultyOptions = [
        { value: 'easy', label: 'Easy - Beginner Friendly' },
        { value: 'medium', label: 'Medium - Intermediate' },
        { value: 'hard', label: 'Hard - Expert Level' }
    ];

    const timeOptions = [
        { value: 5, label: '5 Minutes - Quick Battle' },
        { value: 10, label: '10 Minutes - Standard' },
        { value: 15, label: '15 Minutes - Extended' },
        { value: 20, label: '20 Minutes - Marathon' }
    ];

    const clearSearchTimer = useCallback(() => {
        if (searchTimerRef.current) {
            clearInterval(searchTimerRef.current);
            searchTimerRef.current = null;
        }
        setSearchTimer(0);
    }, []);

    const startSearchTimer = useCallback(() => {
        setSearchTimer(0);
        setSearchingOpponent(true);
        setQuickMatchLoading(true);

        searchTimerRef.current = setInterval(() => {
            setSearchTimer(prev => {
                if (prev >= 19) {
                    clearSearchTimer();
                    setSearchingOpponent(false);
                    setQuickMatchLoading(false);
                    setShowNoPlayerModal(true);
                    return 0;
                }
                return prev + 1;
            });
        }, 1000);
    }, [clearSearchTimer]);

    const startBattleAnimationAndNavigate = useCallback((roomData, currentUserProfile, opponentUserProfile) => {
        clearSearchTimer();
        setSearchingOpponent(false);
        setQuickMatchLoading(false);
        setShowNoPlayerModal(false);

        setMatchedUsers({ currentUser: currentUserProfile, opponent: opponentUserProfile });
        setShowBattleAnimation(true);
        toast.success(`Match found! Preparing for battle in Room: ${roomData.roomId}`);

        battleAnimationTimerRef.current = setTimeout(() => {
            setShowBattleAnimation(false);
            setMatchedUsers({ currentUser: null, opponent: null });
            navigate(`/game/room/${roomData.roomId}/play`);
        }, 5000);
    }, [clearSearchTimer, navigate]);

    // Socket effect
    useEffect(() => {
        if (!isAuthenticated || !user) {
            return;
        }

        if (!lobbySocketRef.current) {
            const newSocket = io(VITE_API_URL, {
                withCredentials: true,
                query: { userId: user._id }
            });
            lobbySocketRef.current = newSocket;

            newSocket.on('connect', () => {
                console.log('Connected to Socket.IO from GamePage (Lobby):', newSocket.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error("Socket.IO connection error (Lobby):", err);
                toast.error("Failed to connect to game server. Please try again.");
                setQuickMatchLoading(false);
                setCreateRoomLoading(false);
                setJoinRoomLoading(false);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Disconnected from Socket.IO (Lobby):', reason);
                setQuickMatchLoading(false);
                setCreateRoomLoading(false);
                setJoinRoomLoading(false);
            });

            newSocket.on('gameStart', (data) => {
                console.log('Game started via socket (queued quick match player):', data);
                if (data.room && data.room.status === 'in-progress' && data.room.players.length === data.room.maxPlayers) {
                    const currentPlayerProfile = data.room.players.find(p => p.userId._id === user._id)?.userId;
                    const opponentPlayerProfile = data.room.players.find(p => p.userId._id !== user._id)?.userId;

                    if (currentPlayerProfile && opponentPlayerProfile) {
                        startBattleAnimationAndNavigate(data.room, currentPlayerProfile, opponentPlayerProfile);
                    } else {
                        toast.success(data.message + " Redirecting...");
                        navigate(`/game/room/${data.room.roomId}/play`);
                    }
                } else {
                    toast.info("Match found, but room state is not yet ready. Waiting for room details...");
                    navigate(`/game/room/${data.room.roomId}`);
                }
                setQuickMatchLoading(false);
            });

            newSocket.on('roomCreated', (data) => {
                toast.success(data.message);
                setCreateRoomLoading(false);
                navigate(`/game/room/${data.room.roomId}`);
            });

            newSocket.on('gameError', (data) => {
                toast.error(`Game Error (Lobby): ${data.message}`);
                console.error('Game Error (Lobby):', data.message);
                clearSearchTimer();
                setSearchingOpponent(false);
                setQuickMatchLoading(false);
                setCreateRoomLoading(false);
                setJoinRoomLoading(false);

                if (showBattleAnimation) {
                    setShowBattleAnimation(false);
                    setMatchedUsers({ currentUser: null, opponent: null });
                    if (battleAnimationTimerRef.current) {
                        clearTimeout(battleAnimationTimerRef.current);
                        battleAnimationTimerRef.current = null;
                    }
                }
            });
        }

        return () => {
            if (lobbySocketRef.current) {
                console.log('Disconnecting lobby socket.');
                lobbySocketRef.current.disconnect();
                lobbySocketRef.current = null;
            }
            clearSearchTimer();
            if (battleAnimationTimerRef.current) {
                clearTimeout(battleAnimationTimerRef.current);
                battleAnimationTimerRef.current = null;
            }
        };
    }, [isAuthenticated, user, VITE_API_URL, navigate, clearSearchTimer, startBattleAnimationAndNavigate, showBattleAnimation]);

    if (!isAuthenticated) {
        useEffect(() => {
            toast.info("Please log in to access the game section.");
            navigate('/login');
        }, [navigate]);
        return null;
    }

    const handleFindRandomOpponent = async () => {
        setQuickMatchLoading(true);
        setSearchingOpponent(true);
        try {
            if (!lobbySocketRef.current || !lobbySocketRef.current.connected) {
                toast.error("Not connected to game server. Please wait or refresh the page.");
                setQuickMatchLoading(false);
                setSearchingOpponent(false);
                return;
            }

            const response = await axiosClient.post(`/game/find-opponent`,
                {
                    socketId: lobbySocketRef.current.id,
                    difficulty: quickMatchDifficulty,
                    timeLimit: quickMatchTime
                },
                { withCredentials: true }
            );

            if (response.status === 200) {
                const roomData = response.data.room;
                const currentPlayerProfile = roomData.players.find(p => p.userId._id === user._id)?.userId;
                const opponentPlayerProfile = roomData.players.find(p => p.userId._id !== user._id)?.userId;

                if (currentPlayerProfile && opponentPlayerProfile) {
                    startBattleAnimationAndNavigate(roomData, currentPlayerProfile, opponentUserProfile);
                } else {
                    toast.success(response.data.message + " Redirecting...");
                    navigate(`/game/room/${roomData.roomId}/play`);
                }
            } else if (response.status === 202) {
                toast.info(response.data.message);
                startSearchTimer();
            }
        } catch (error) {
            console.error('Error finding random opponent:', error);
            toast.error(error.response?.data?.message || 'Failed to find random opponent.');
            setQuickMatchLoading(false);
            setSearchingOpponent(false);
            clearSearchTimer();
        }
    };

    const handleCreateRoom = async () => {
        setCreateRoomLoading(true);
        try {
            if (!lobbySocketRef.current || !lobbySocketRef.current.connected) {
                toast.error("Not connected to game server. Please wait or refresh the page.");
                setCreateRoomLoading(false);
                return;
            }
            const response = await axiosClient.post(`/game/create-room`,
                {
                    maxPlayers: 2,
                    gameMode: '1v1-coding',
                    socketId: lobbySocketRef.current.id,
                    difficulty: createRoomDifficulty,
                    timeLimit: createRoomTime
                },
                { withCredentials: true }
            );
            toast.success(response.data.message);
            navigate(`/game/room/${response.data.room.roomId}`);
        } catch (error) {
            console.error('Error creating room:', error);
            toast.error(error.response?.data?.message || 'Failed to create room.');
        } finally {
            setCreateRoomLoading(false);
        }
    };

    const handleJoinRoom = async () => {
        setJoinRoomLoading(true);
        try {
            if (!lobbySocketRef.current || !lobbySocketRef.current.connected) {
                toast.error("Not connected to game server. Please wait or refresh the page.");
                setJoinRoomLoading(false);
                return;
            }
            if (!roomIdInput.trim()) {
                toast.error("Please enter a valid Room ID.");
                setJoinRoomLoading(false);
                return;
            }
            const roomIDToJoin = roomIdInput.trim().toUpperCase();
            const response = await axiosClient.post(`/game/join-room`,
                { roomId: roomIDToJoin, socketId: lobbySocketRef.current.id },
                { withCredentials: true }
            );
            toast.success(response.data.message);
            navigate(`/game/room/${roomIDToJoin}`);
        } catch (error) {
            console.error('Error joining room:', error);
            toast.error(error.response?.data?.message || 'Failed to join room.');
            if (error.response?.status === 404) {
                toast.info("Room not found. Check the ID or create a new room.");
            } else if (error.response?.status === 400) {
                toast.info(error.response.data.message);
            }
        } finally {
            setJoinRoomLoading(false);
        }
    };

    const handleCancelSearch = () => {
        clearSearchTimer();
        setSearchingOpponent(false);
        setQuickMatchLoading(false);
        toast.info("Search cancelled.");
        if (showBattleAnimation) {
            setShowBattleAnimation(false);
            setMatchedUsers({ currentUser: null, opponent: null });
            if (battleAnimationTimerRef.current) {
                clearTimeout(battleAnimationTimerRef.current);
                battleAnimationTimerRef.current = null;
            }
        }
    };

    const handleTryAgain = () => {
        setShowNoPlayerModal(false);
        handleFindRandomOpponent();
    };

    const anyOperationInProgress = searchingOpponent || showBattleAnimation || quickMatchLoading || createRoomLoading || joinRoomLoading;

    return (
        <div className={`min-h-screen relative overflow-hidden ${theme.text} bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo}`}>
            {/* Dynamic Animated Background Elements */}
            <div className={`absolute top-0 left-0 w-80 h-80 ${theme.primary.replace('bg-', 'bg-')}/5 rounded-full blur-3xl translate-x-[-20%] translate-y-[-20%] animate-blob`}></div>
            <div className={`absolute bottom-0 right-0 w-96 h-96 ${theme.secondary.replace('bg-', 'bg-')}/5 rounded-full blur-3xl translate-x-[20%] translate-y-[20%] animate-blob animation-delay-2000`}></div>
            <div className={`absolute top-1/2 left-1/2 w-60 h-60 ${theme.highlight.replace('text-', 'bg-')}/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000`}></div>
            
            <Header />
            
            {/* Battle Animation */}
            {showBattleAnimation && matchedUsers.currentUser && matchedUsers.opponent ? (
                <div className={`fixed inset-0 bg-gradient-to-br ${theme.gradientFrom} via-purple-900 ${theme.gradientTo} flex items-center justify-center z-50`}>
                    <div className="text-center text-white space-y-12 relative max-w-4xl mx-auto px-4">
                        {/* Animated rings with dynamic colors */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-96 h-96 border-4 border-white/20 rounded-full animate-ping`}></div>
                            <div className={`absolute w-80 h-80 border-4 ${theme.highlight.replace('text-', 'border-')}/30 rounded-full animate-pulse`}></div>
                        </div>

                        <div className="relative z-10">
                            <h2 className={`text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} via-pink-500 ${theme.secondary.replace('bg-', 'to-')} animate-pulse`}>
                                BATTLE ARENA
                            </h2>
                            <p className="text-xl text-white/80 mt-4">Match Found! Prepare for Combat</p>
                        </div>

                        <div className="flex items-center justify-center space-x-16 relative z-10">
                            {/* Current User */}
                            <div className="flex flex-col items-center space-y-6 transform hover:scale-105 transition-transform">
                                <div className="relative">
                                    <img 
                                        src={matchedUsers.currentUser.avatar || '/default-avatar.png'} 
                                        alt="You" 
                                        className={`w-32 h-32 rounded-full object-cover border-4 ${theme.primary.replace('bg-', 'border-')} shadow-2xl animate-bounce`} 
                                    />
                                    <div className={`absolute -bottom-2 -right-2 ${theme.primary} text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold`}>
                                        YOU
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className={`text-2xl font-bold ${theme.highlight}`}>
                                        {matchedUsers.currentUser.firstName || 'Player'}
                                    </p>
                                    <p className={`text-sm ${theme.cardText}`}>Ready to Code</p>
                                </div>
                            </div>

                            {/* VS Text */}
                            <div className="relative">
                                <span className="text-6xl font-black text-white animate-pulse">VS</span>
                                <div className={`absolute inset-0 text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.errorColor.replace('text-', 'from-')} to-pink-600 animate-ping`}>
                                    VS
                                </div>
                            </div>

                            {/* Opponent */}
                            <div className="flex flex-col items-center space-y-6 transform hover:scale-105 transition-transform">
                                <div className="relative">
                                    <img 
                                        src={matchedUsers.opponent.avatar || '/default-avatar.png'} 
                                        alt="Opponent" 
                                        className={`w-32 h-32 rounded-full object-cover border-4 ${theme.secondary.replace('bg-', 'border-')} shadow-2xl animate-bounce`}
                                        style={{ animationDelay: '0.5s' }}
                                    />
                                    <div className={`absolute -bottom-2 -right-2 ${theme.secondary} text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold`}>
                                        OPP
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className={`text-2xl font-bold ${theme.highlightSecondary}`}>
                                        {matchedUsers.opponent.firstName || 'Opponent'}
                                    </p>
                                    <p className={`text-sm ${theme.cardText}`}>Challenge Accepted</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-2xl font-semibold text-white/90 animate-pulse">
                                Starting in moments...
                            </p>
                            <div className="flex justify-center mt-4">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Main Content */
                <div className="relative">
                    {/* Hero Section with Dynamic Colors */}
                    <div className={`relative bg-gradient-to-br ${theme.gradientFrom}  ${theme.gradientTo} py-16`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <div className="flex items-center justify-center mb-6">
                                    <div className={`p-4 bg-gradient-to-br ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} rounded-2xl shadow-lg`}>
                                        <FaGamepad className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                <h1 className={`text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} via-purple-600 ${theme.secondary.replace('bg-', 'to-')} mb-4`}>
                                    CodeMasti Arena
                                </h1>
                                <p className={`text-xl ${theme.cardText} mb-8 max-w-3xl mx-auto leading-relaxed`}>
                                    Welcome back, <span className={`font-bold ${theme.highlight}`}>{userFirstName}</span>! 
                                    Challenge developers worldwide in epic coding battles and climb the ranks.
                                </p>

                                {/* User Stats with Dynamic Colors */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                                    <StatCard 
                                        icon={FaTrophy} 
                                        label="ELO Rating" 
                                        value={userEloRating.toLocaleString()} 
                                        theme={theme}
                                        delay={0}
                                    />
                                    <StatCard 
                                        icon={FaGamepad} 
                                        label="Games Played" 
                                        value={userStats.gamesPlayed || 0} 
                                        theme={theme}
                                        delay={100}
                                    />
                                    <StatCard 
                                        icon={FaUsers} 
                                        label="Win Rate" 
                                        value={`${(((userStats?.wins) / (userStats?.gamesPlayed)) * 100).toFixed(1) || 0}%`} 
                                        theme={theme}
                                        delay={200}
                                    />
                                    <StatCard 
                                        icon={FaChartLine} 
                                        label="Win" 
                                        value={userStats?.wins || 0} 
                                        theme={theme}
                                        delay={300}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Game Modes Section with Dynamic Colors */}
                    <div className={`py-16 ${theme.background}`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <h2 className={`text-3xl font-bold ${theme.text} mb-4`}>Choose Your Battle Mode</h2>
                                <p className={`text-lg ${theme.cardText} max-w-2xl mx-auto`}>
                                    Select your preferred way to compete and show off your coding skills
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Quick Match with Dynamic Colors */}
                                <GameModeCard
                                    icon={FaBolt}
                                    title="Quick Match"
                                    description="Get matched with a random opponent instantly. Perfect for quick skill tests and ELO climbing."
                                    gradientColors={[theme.primary.replace('bg-', 'from-'), theme.secondary.replace('bg-', 'to-')]}
                                    theme={theme}
                                    isLoading={quickMatchLoading}
                                    delay={0}
                                >
                                    {searchingOpponent && (
                                        <div className={`mb-6 p-4 ${theme.iconBg} rounded-xl border ${theme.border}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`${theme.highlight} font-semibold flex items-center`}>
                                                    <FaSearch className="w-4 h-4 mr-2 animate-spin" />
                                                    Finding worthy opponent...
                                                </span>
                                                <span className={`${theme.highlight} font-mono font-bold`}>
                                                    {20 - searchTimer}s
                                                </span>
                                            </div>
                                            <div className={`w-full ${theme.cardBg} rounded-full h-2 overflow-hidden`}>
                                                <div
                                                    className={`h-full bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} transition-all duration-1000`}
                                                    style={{ width: `${(searchTimer / 20) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <CustomSelect
                                            label="Difficulty Level"
                                            value={quickMatchDifficulty}
                                            onChange={(e) => setQuickMatchDifficulty(e.target.value)}
                                            options={difficultyOptions}
                                            disabled={anyOperationInProgress}
                                            theme={theme}
                                        />

                                        <CustomSelect
                                            label="Time Limit"
                                            value={quickMatchTime}
                                            onChange={(e) => setQuickMatchTime(parseInt(e.target.value))}
                                            options={timeOptions}
                                            disabled={anyOperationInProgress}
                                            theme={theme}
                                        />
                                    </div>

                                    <div className="pt-4">
                                        {!searchingOpponent ? (
                                            <ActionButton
                                                onClick={handleFindRandomOpponent}
                                                disabled={anyOperationInProgress || !isAuthenticated}
                                                loading={quickMatchLoading}
                                                icon={FaSearch}
                                                theme={theme}
                                            >
                                                Find Opponent
                                            </ActionButton>
                                        ) : (
                                            <ActionButton
                                                onClick={handleCancelSearch}
                                                disabled={showBattleAnimation}
                                                variant="danger"
                                                theme={theme}
                                            >
                                                Cancel Search
                                            </ActionButton>
                                        )}
                                    </div>
                                </GameModeCard>

                                {/* Create Room with Dynamic Colors */}
                                <GameModeCard
                                    icon={FaHome}
                                    title="Create Private Room"
                                    description="Host your own coding arena and invite friends. Perfect for team practice sessions and tournaments."
                                    gradientColors={[theme.successColor.replace('text-', 'from-'), theme.infoColor.replace('text-', 'to-')]}
                                    theme={theme}
                                    isLoading={createRoomLoading}
                                    delay={200}
                                >
                                    <div className="space-y-4">
                                        <CustomSelect
                                            label="Difficulty Level"
                                            value={createRoomDifficulty}
                                            onChange={(e) => setCreateRoomDifficulty(e.target.value)}
                                            options={difficultyOptions}
                                            disabled={anyOperationInProgress}
                                            theme={theme}
                                        />

                                        <CustomSelect
                                            label="Time Limit"
                                            value={createRoomTime}
                                            onChange={(e) => setCreateRoomTime(parseInt(e.target.value))}
                                            options={timeOptions}
                                            disabled={anyOperationInProgress}
                                            theme={theme}
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <ActionButton
                                            onClick={handleCreateRoom}
                                            disabled={anyOperationInProgress || !isAuthenticated}
                                            loading={createRoomLoading}
                                            icon={FaPlus}
                                            theme={theme}
                                        >
                                            Create Room
                                        </ActionButton>
                                    </div>
                                </GameModeCard>

                                {/* Join Room with Dynamic Colors */}
                                <GameModeCard
                                    icon={FaDoorOpen}
                                    title="Join Room"
                                    description="Enter an existing room using a Room ID. Join ongoing tournaments or friend matches."
                                    gradientColors={[theme.highlightTertiary.replace('text-', 'from-'), 'to-pink-600']}
                                    theme={theme}
                                    isLoading={joinRoomLoading}
                                    delay={400}
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className={`block text-sm font-semibold ${theme.cardText}`}>
                                                Room ID
                                            </label>
                                            <input
                                                type="text"
                                                value={roomIdInput}
                                                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                                                placeholder="Enter 6-character Room ID"
                                                className={`w-full p-4 rounded-lg ${theme.cardBg} ${theme.text} border ${theme.border} focus:ring-2 focus:ring-${getAccentColorBase()}-500 focus:border-transparent transition-all duration-300 font-mono text-center text-lg tracking-wider shadow-sm`}
                                                maxLength={6}
                                                disabled={anyOperationInProgress}
                                            />
                                            <p className={`text-xs ${theme.cardText} text-center`}>
                                                Room IDs are case-insensitive
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <ActionButton
                                            onClick={handleJoinRoom}
                                            disabled={anyOperationInProgress || !roomIdInput.trim() || !isAuthenticated}
                                            loading={joinRoomLoading}
                                            icon={FaSignInAlt}
                                            theme={theme}
                                        >
                                            Join Room
                                        </ActionButton>
                                    </div>
                                </GameModeCard>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No Player Found Modal with Dynamic Colors */}
            {showNoPlayerModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`${theme.cardBg} rounded-2xl shadow-2xl max-w-md w-full border ${theme.border} transform scale-100 animate-in`}>
                        <div className="p-8 text-center">
                            <div className={`w-20 h-20 bg-gradient-to-br ${theme.warningColor.replace('text-', 'from-')} ${theme.errorColor.replace('text-', 'to-')} rounded-full flex items-center justify-center mx-auto mb-6`}>
                                <FaUsers className="w-10 h-10 text-white" />
                            </div>
                            <h3 className={`text-2xl font-bold mb-4 ${theme.text}`}>No Opponents Available</h3>
                            <p className={`${theme.cardText} mb-8 leading-relaxed`}>
                                We couldn't find a suitable opponent within 20 seconds. This might happen during off-peak hours. 
                                Would you like to try again or create a private room instead?
                            </p>
                            <div className="flex space-x-3">
                                <ActionButton
                                    onClick={() => setShowNoPlayerModal(false)}
                                    variant="secondary"
                                    theme={theme}
                                >
                                    Cancel
                                </ActionButton>
                                <ActionButton
                                    onClick={handleTryAgain}
                                    icon={FaSearch}
                                    theme={theme}
                                >
                                    Try Again
                                </ActionButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Animations CSS */}
            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes animate-in {
                    from { 
                        opacity: 0; 
                        transform: scale(0.95) translateY(10px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1) translateY(0); 
                    }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animate-in { animation: animate-in 0.2s ease-out; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};

export default GamePage;
