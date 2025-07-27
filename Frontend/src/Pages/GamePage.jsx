import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import io from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaTrophy, FaCalendarAlt, FaClock } from 'react-icons/fa'; // Import FaCalendarAlt, FaClock for consistency
import Header from '../components/layout/Header'; // Assuming Header is in '../components/layout/Header'

// Default theme and Loader (from your GamePage's start)
const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    buttonPrimary: 'bg-blue-600',
    buttonPrimaryHover: 'bg-blue-700',
    successColor: 'text-emerald-500',
    errorColor: 'text-red-500',
    warningColor: 'text-amber-500',
    infoColor: 'text-blue-500',
    accent: 'bg-cyan-500', // Added for consistency with ProblemPage
};

// Re-using the Loader component
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
                    <div className={`rounded-full ${theme.highlight.replace('text-', 'bg-')} ${theme.highlightSecondary.replace('text-', 'bg-')} rounded-full animate-pulse ${size === 'lg' ? 'h-4 w-4' : size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
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


const GamePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { theme: appThemeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...appThemeFromContext };

    const [loading, setLoading] = useState(false);
    const [searchingOpponent, setSearchingOpponent] = useState(false);
    const [searchTimer, setSearchTimer] = useState(0);
    const [showNoPlayerModal, setShowNoPlayerModal] = useState(false);

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

    // Safely get ELO rating, defaulting to a fallback if not available
    const userEloRating = user?.stats?.eloRating || 1000;
    const userFirstName = user?.firstName || 'Player';

    // Classes for main content sections, consistent with ProblemPage example
    const sectionClasses = `backdrop-blur-xl border ${theme.border}/20 shadow-xl rounded-2xl`;

    const getAccentColorBase = () => { // Helper for dynamic accent colors, similar to ProblemPage
        const accentColorClass = theme.accent || theme.buttonPrimary;
        const match = accentColorClass.match(/bg-(\w+)-\d+/);
        return match ? match[1] : 'blue';
    };


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
        setLoading(true); // Disable other buttons during search

        searchTimerRef.current = setInterval(() => {
            setSearchTimer(prev => {
                if (prev >= 19) { // 20 seconds total (0-19)
                    clearSearchTimer();
                    setSearchingOpponent(false);
                    setLoading(false); // Re-enable other buttons
                    setShowNoPlayerModal(true);
                    return 0;
                }
                return prev + 1;
            });
        }, 1000);
    }, [clearSearchTimer]);

    // Function to handle battle animation and direct navigation for quick match
    const startBattleAnimationAndNavigate = useCallback((roomData, currentUserProfile, opponentUserProfile) => {
        clearSearchTimer();
        setSearchingOpponent(false);
        setLoading(false);
        setShowNoPlayerModal(false);

        setMatchedUsers({ currentUser: currentUserProfile, opponent: opponentUserProfile });
        setShowBattleAnimation(true);
        toast.success(`Match found! Preparing for battle in Room: ${roomData.roomId}`);

        battleAnimationTimerRef.current = setTimeout(() => {
            setShowBattleAnimation(false);
            setMatchedUsers({ currentUser: null, opponent: null });
            navigate(`/game/room/${roomData.roomId}/play`);
        }, 5000); // 5 seconds for the animation
    }, [clearSearchTimer, navigate]);

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
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Disconnected from Socket.IO (Lobby):', reason);
            });

            // THIS IS THE NEW 'gameStart' event for queued quick matches
            newSocket.on('gameStart', (data) => {
                console.log('Game started via socket (queued quick match player):', data);
                // Ensure this event means the game is actually ready to start for this user
                if (data.room && data.room.status === 'in-progress' && data.room.players.length === data.room.maxPlayers) {
                    const currentPlayerProfile = data.room.players.find(p => p.userId._id === user._id)?.userId;
                    const opponentPlayerProfile = data.room.players.find(p => p.userId._id !== user._id)?.userId;

                    if (currentPlayerProfile && opponentPlayerProfile) {
                        startBattleAnimationAndNavigate(data.room, currentPlayerProfile, opponentPlayerProfile);
                    } else {
                        toast.success(data.message + " Redirecting...");
                        navigate(`/game/room/${data.room.roomId}/play`); // Direct navigation as fallback
                    }
                } else {
                    toast.info("Match found, but room state is not yet ready. Waiting for room details...");
                    // Potentially navigate to GameRoomDetailsPage if the state is not fully in-progress
                    // This is a fallback if backend doesn't send full gameStart for some reason
                    navigate(`/game/room/${data.room.roomId}`);
                }
            });

            newSocket.on('roomCreated', (data) => {
                toast.success(data.message);
                setLoading(false);
                navigate(`/game/room/${data.room.roomId}`); // Created rooms still go to GameRoomDetailsPage
            });

            newSocket.on('gameError', (data) => {
                toast.error(`Game Error (Lobby): ${data.message}`);
                console.error('Game Error (Lobby):', data.message);
                clearSearchTimer();
                setSearchingOpponent(false);
                setLoading(false);
                if (showBattleAnimation) { // Clear animation if an error occurs during it
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
        setLoading(true);
        try {
            if (!lobbySocketRef.current || !lobbySocketRef.current.connected) {
                toast.error("Not connected to game server. Please wait or refresh the page.");
                setLoading(false);
                return;
            }

            const response = await axios.post(`${VITE_API_URL}/game/find-opponent`,
                {
                    socketId: lobbySocketRef.current.id,
                    difficulty: quickMatchDifficulty,
                    timeLimit: quickMatchTime
                },
                { withCredentials: true }
            );

            if (response.status === 200) { // Match found immediately (gameStart already emitted by backend)
                const roomData = response.data.room;
                const currentPlayerProfile = roomData.players.find(p => p.userId._id === user._id)?.userId;
                const opponentPlayerProfile = roomData.players.find(p => p.userId._id !== user._id)?.userId;

                // Trigger battle animation and direct navigation for immediate quick match
                if (currentPlayerProfile && opponentPlayerProfile) {
                    startBattleAnimationAndNavigate(roomData, currentPlayerProfile, opponentPlayerProfile);
                } else {
                    toast.success(response.data.message + " Redirecting...");
                    navigate(`/game/room/${roomData.roomId}/play`); // Direct navigation as fallback
                }
            } else if (response.status === 202) { // Added to queue, wait for socket.on('gameStart')
                toast.info(response.data.message);
                startSearchTimer(); // Start the 20-second timer/UI
            }
        } catch (error) {
            console.error('Error finding random opponent:', error);
            toast.error(error.response?.data?.message || 'Failed to find random opponent.');
            setLoading(false);
            setSearchingOpponent(false);
            clearSearchTimer();
        }
    };

    const handleCreateRoom = async () => {
        setLoading(true);
        try {
            if (!lobbySocketRef.current || !lobbySocketRef.current.connected) {
                toast.error("Not connected to game server. Please wait or refresh the page.");
                setLoading(false);
                return;
            }
            const response = await axios.post(`${VITE_API_URL}/game/create-room`,
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
            navigate(`/game/room/${response.data.room.roomId}`); // Created rooms still go to GameRoomDetailsPage
        } catch (error) {
            console.error('Error creating room:', error);
            toast.error(error.response?.data?.message || 'Failed to create room.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async () => {
        setLoading(true);
        try {
            if (!lobbySocketRef.current || !lobbySocketRef.current.connected) {
                toast.error("Not connected to game server. Please wait or refresh the page.");
                setLoading(false);
                return;
            }
            if (!roomIdInput.trim()) {
                toast.error("Please enter a valid Room ID.");
                setLoading(false);
                return;
            }
            const roomIDToJoin = roomIdInput.trim().toUpperCase();
            const response = await axios.post(`${VITE_API_URL}/game/join-room`,
                { roomId: roomIDToJoin, socketId: lobbySocketRef.current.id },
                { withCredentials: true }
            );
            toast.success(response.data.message);
            navigate(`/game/room/${roomIDToJoin}`); // Navigate to GameRoomDetailsPage for joining private rooms
        } catch (error) {
            console.error('Error joining room:', error);
            toast.error(error.response?.data?.message || 'Failed to join room.');
            if (error.response?.status === 404) {
                toast.info("Room not found. Check the ID or create a new room.");
            } else if (error.response?.status === 400) {
                toast.info(error.response.data.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSearch = () => {
        clearSearchTimer();
        setSearchingOpponent(false);
        setLoading(false);
        toast.info("Search cancelled.");
        if (showBattleAnimation) { // Also clear battle animation if it was somehow active
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

    return (
        <div className={`min-h-screen relative overflow-hidden ${theme.text} bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo}`}>
            {/* Animated Background Elements - using similar pattern as ProblemPage */}
            <div className={`absolute top-0 left-0 w-80 h-80 ${theme.primary.replace('bg-', 'bg-')}/5 rounded-full blur-3xl translate-x-[-20%] translate-y-[-20%] animate-blob`}></div>
            <div className={`absolute bottom-0 right-0 w-96 h-96 ${theme.secondary.replace('bg-', 'bg-')}/5 rounded-full blur-3xl translate-x-[20%] translate-y-[20%] animate-blob animation-delay-2000`}></div>
            <div className={`absolute top-1/2 left-1/2 w-60 h-60 ${theme.highlight.replace('text-', 'bg-')}/5 rounded-full blur-3xl -translate-x-1/2 -translate-x-1/2 animate-blob animation-delay-4000`}></div>


            {/* Conditional rendering for Battle Animation vs Lobby Content */}
            {showBattleAnimation && matchedUsers.currentUser && matchedUsers.opponent ? (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in-fast">
                    <div className="text-center text-white space-y-8 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-96 h-96 border-8 border-purple-500 rounded-full animate-pulse-border opacity-70"></div>
                        </div>

                        <h2 className="text-6xl font-extrabold text-white animate-text-pop-in relative z-10">
                            BATTLE!
                        </h2>
                        <div className="flex items-center justify-center space-x-12 relative z-10">
                            <div className="flex flex-col items-center space-y-4 animate-slide-in-left-fast">
                                <img src={matchedUsers.currentUser.avatar || '/default-avatar.png'} alt="You" className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-lg animate-float" />
                                <p className="text-3xl font-bold text-blue-300">YOU</p>
                                <p className="text-xl font-medium">{matchedUsers.currentUser.firstName || 'Player'}</p>
                            </div>

                            <span className="text-8xl font-extrabold text-red-500 animate-vs-zoom relative z-10">VS</span>

                            <div className="flex flex-col items-center space-y-4 animate-slide-in-right-fast">
                                <img src={matchedUsers.opponent.avatar || '/default-avatar.png'} alt="Opponent" className="w-40 h-40 rounded-full object-cover border-4 border-pink-500 shadow-lg animate-float" />
                                <p className="text-3xl font-bold text-pink-300">OPPONENT</p>
                                <p className="text-xl font-medium">{matchedUsers.opponent.firstName || 'Opponent'}</p>
                            </div>
                        </div>
                        <p className="text-xl font-semibold text-gray-300 mt-8 animate-fade-in-slow relative z-10">
                            Get ready to code!
                        </p>
                    </div>
                </div>
            ) : (
                // Original lobby content wrapped in new UI structure
                <div className='w-screen'>
                    <Header />
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className={`${sectionClasses} p-8 text-center mb-12`}>
                            <h2 className={`text-5xl font-extrabold mb-4 ${theme.highlight} transform transition-all duration-500 hover:scale-105 animate-pulse-slow`}>
                                Welcome to CodeMasti Games!
                            </h2>
                            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full animate-shimmer"></div>

                            {/* Display User's ELO Rating */}
                            {isAuthenticated && user && (
                                <div className={`mt-6 p-4 rounded-lg inline-flex items-center space-x-3 ${theme.iconBg} border ${theme.border}`}>
                                    <FaTrophy className={`text-2xl ${theme.highlightSecondary}`} />
                                    <p className={`text-xl font-semibold ${theme.text}`}>
                                        Your ELO: <span className={`${theme.highlight}`}>{userEloRating}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Quick Match Card */}
                            <div className={`${sectionClasses} p-8 flex flex-col transform transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-slide-in-left relative overflow-hidden group`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 animate-bounce-slow">
                                            <span className="text-white font-bold text-xl">⚡</span>
                                        </div>
                                        <h3 className={`text-2xl font-bold ${theme.text}`}>Quick Match</h3>
                                    </div>

                                    <p className={`text-md ${theme.cardText} mb-6 flex-grow leading-relaxed`}>
                                        Find a random opponent and start an epic coding battle!
                                    </p>

                                    {searchingOpponent && (
                                        <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 animate-pulse">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-blue-400 font-semibold">Searching for opponent...</span>
                                                <span className="text-blue-400 font-mono">{20 - searchTimer}s</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 animate-shimmer"
                                                    style={{ width: `${(searchTimer / 20) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4 mb-6">
                                        <div className="transform transition-all duration-300 hover:scale-105">
                                            <label htmlFor="quickMatchDifficulty" className={`block text-sm font-semibold ${theme.cardText} mb-2`}>
                                                Difficulty Level:
                                            </label>
                                            <select
                                                id="quickMatchDifficulty"
                                                value={quickMatchDifficulty}
                                                onChange={(e) => setQuickMatchDifficulty(e.target.value)}
                                                className={`w-full p-3 rounded-xl ${theme.cardBg}/50 ${theme.text} border ${theme.border}/50 focus:ring-2 focus:ring-${getAccentColorBase()}-500/50 focus:border-transparent transition-all duration-300 shadow-inner appearance-none cursor-pointer`}
                                                disabled={searchingOpponent || loading || showBattleAnimation}
                                            >
                                                <option value="easy">🟢 Easy</option>
                                                <option value="medium">🟡 Medium</option>
                                                <option value="hard">🔴 Hard</option>
                                            </select>
                                        </div>

                                        <div className="transform transition-all duration-300 hover:scale-105">
                                            <label htmlFor="quickMatchTime" className={`block text-sm font-semibold ${theme.cardText} mb-2`}>
                                                Time Limit:
                                            </label>
                                            <select
                                                id="quickMatchTime"
                                                value={quickMatchTime}
                                                onChange={(e) => setQuickMatchTime(parseInt(e.target.value))}
                                                className={`w-full p-3 rounded-xl ${theme.cardBg}/50 ${theme.text} border ${theme.border}/50 focus:ring-2 focus:ring-${getAccentColorBase()}-500/50 focus:border-transparent transition-all duration-300 shadow-inner appearance-none cursor-pointer`}
                                                disabled={searchingOpponent || loading || showBattleAnimation}
                                            >
                                                <option value={5}>⏰ 5 minutes</option>
                                                <option value={10}>⏰ 10 minutes</option>
                                                <option value={15}>⏰ 15 minutes</option>
                                                <option value={20}>⏰ 20 minutes</option>
                                            </select>
                                        </div>
                                    </div>

                                    {!searchingOpponent ? (
                                        <button
                                            onClick={handleFindRandomOpponent}
                                            disabled={loading || !isAuthenticated || showBattleAnimation}
                                            className={`w-full py-4 px-6 rounded-xl text-lg font-bold ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <span className={`absolute inset-0 bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')}/80 ${theme.secondary.replace('bg-', 'to-')}/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></span>
                                            <span className="relative z-10 flex items-center justify-center">
                                                {loading ? <LoadingSpinner size="sm" color="white" /> : '🚀 Find Random Opponent'}
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleCancelSearch}
                                            className="w-full py-4 px-6 rounded-xl text-lg font-bold bg-red-500 hover:bg-red-600 text-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={loading || showBattleAnimation}
                                        >
                                            ❌ Cancel Search
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Create Private Room Card */}
                            <div className={`${sectionClasses} p-8 flex flex-col transform transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-slide-in-up relative overflow-hidden group`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 animate-bounce-slow">
                                            <span className="text-white font-bold text-xl">🏠</span>
                                        </div>
                                        <h3 className={`text-2xl font-bold ${theme.text}`}>Create Private Room</h3>
                                    </div>

                                    <p className={`text-md ${theme.cardText} mb-6 flex-grow leading-relaxed`}>
                                        Host a private coding arena for your friends to join!
                                    </p>

                                    <div className="space-y-4 mb-6">
                                        <div className="transform transition-all duration-300 hover:scale-105">
                                            <label htmlFor="createRoomDifficulty" className={`block text-sm font-semibold ${theme.cardText} mb-2`}>
                                                Difficulty Level:
                                            </label>
                                            <select
                                                id="createRoomDifficulty"
                                                value={createRoomDifficulty}
                                                onChange={(e) => setCreateRoomDifficulty(e.target.value)}
                                                className={`w-full p-3 rounded-xl ${theme.cardBg}/50 ${theme.text} border ${theme.border}/50 focus:ring-2 focus:ring-${getAccentColorBase()}-500/50 focus:border-transparent transition-all duration-300 shadow-inner appearance-none cursor-pointer`}
                                                disabled={loading || searchingOpponent || showBattleAnimation}
                                            >
                                                <option value="easy">🟢 Easy</option>
                                                <option value="medium">🟡 Medium</option>
                                                <option value="hard">🔴 Hard</option>
                                            </select>
                                        </div>

                                        <div className="transform transition-all duration-300 hover:scale-105">
                                            <label htmlFor="createRoomTime" className={`block text-sm font-semibold ${theme.cardText} mb-2`}>
                                                Time Limit:
                                            </label>
                                            <select
                                                id="createRoomTime"
                                                value={createRoomTime}
                                                onChange={(e) => setCreateRoomTime(parseInt(e.target.value))}
                                                className={`w-full p-3 rounded-xl ${theme.cardBg}/50 ${theme.text} border ${theme.border}/50 focus:ring-2 focus:ring-${getAccentColorBase()}-500/50 focus:border-transparent transition-all duration-300 shadow-inner appearance-none cursor-pointer`}
                                                disabled={loading || searchingOpponent || showBattleAnimation}
                                            >
                                                <option value={5}>⏰ 5 minutes</option>
                                                <option value={10}>⏰ 10 minutes</option>
                                                <option value={15}>⏰ 15 minutes</option>
                                                <option value={20}>⏰ 20 minutes</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCreateRoom}
                                        disabled={loading || !isAuthenticated || searchingOpponent || showBattleAnimation}
                                        className={`w-full py-4 px-6 rounded-xl text-lg font-bold ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <span className={`absolute inset-0 bg-gradient-to-r ${theme.successColor.replace('text-', 'from-')}/80 ${theme.infoColor.replace('text-', 'to-')}/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></span>
                                        <span className="relative z-10 flex items-center justify-center">
                                            {loading ? <LoadingSpinner size="sm" color="white" /> : '🏗️ Create Private Room'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Join Room Card */}
                            <div className={`${sectionClasses} p-8 flex flex-col transform transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-slide-in-right relative overflow-hidden group`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 animate-bounce-slow">
                                            <span className="text-white font-bold text-xl">🚪</span>
                                        </div>
                                        <h3 className={`text-2xl font-bold ${theme.text}`}>Join Room</h3>
                                    </div>

                                    <p className={`text-md ${theme.cardText} mb-6 flex-grow leading-relaxed`}>
                                        Enter a Room ID to join an existing coding battle!
                                    </p>

                                    <div className="mb-6 transform transition-all duration-300 hover:scale-105">
                                        <label className={`block text-sm font-semibold ${theme.cardText} mb-2`}>
                                            Room ID:
                                        </label>
                                        <input
                                            type="text"
                                            value={roomIdInput}
                                            onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                                            placeholder="Enter Room ID (e.g., ABC123)"
                                            className={`w-full p-4 rounded-xl ${theme.cardBg}/50 ${theme.text} border ${theme.border}/50 focus:ring-2 focus:ring-${getAccentColorBase()}-500/50 focus:border-transparent transition-all duration-300 font-mono text-center text-lg tracking-wider shadow-inner`}
                                            maxLength={6}
                                            disabled={loading || searchingOpponent || showBattleAnimation}
                                        />
                                    </div>

                                    <button
                                        onClick={handleJoinRoom}
                                        disabled={loading || !roomIdInput.trim() || !isAuthenticated || searchingOpponent || showBattleAnimation}
                                        className={`w-full py-4 px-6 rounded-xl text-lg font-bold ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group`}
                                    >
                                        <span className={`absolute inset-0 bg-gradient-to-r ${theme.highlightTertiary.replace('text-', 'from-')}/80 ${theme.primary.replace('bg-', 'to-')}/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></span>
                                        <span className="relative z-10 flex items-center justify-center">
                                            {loading ? <LoadingSpinner size="sm" color="white" /> : '🎯 Join Room'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showNoPlayerModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className={`${theme.cardBg} p-8 rounded-2xl shadow-2xl max-w-md mx-4 border ${theme.border} transform animate-scale-in`}>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <span className="text-white text-4xl">😔</span>
                            </div>
                            <h3 className={`text-2xl font-bold mb-4 ${theme.text}`}>No Player Found</h3>
                            <p className={`${theme.cardText} mb-6 leading-relaxed`}>
                                We couldn't find an opponent within 20 seconds. Would you like to try searching again?
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowNoPlayerModal(false)}
                                    className={`flex-1 py-3 px-6 rounded-xl font-semibold ${theme.cardBg}/50 ${theme.text} border ${theme.border}/50 hover:${theme.cardBg}/80 transition-all duration-300 shadow-md`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTryAgain}
                                    className={`flex-1 py-3 px-6 rounded-xl font-semibold ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} transition-all duration-300 shadow-lg`}
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global CSS for animations (already there) */}
            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                } 
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-in-left {
                    from { transform: translateX(-50px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slide-in-right {
                    from { transform: translateX(50px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slide-in-up {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.02); opacity: 0.95; }
                }
                
                .animate-blob { animation: blob 7s infinite; }
                .animate-shimmer { 
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out; }
                .animate-slide-in-left { animation: slide-in-left 0.6s ease-out; }
                .animate-slide-in-right { animation: slide-in-right 0.6s ease-out; }
                .animate-slide-in-up { animation: slide-in-up 0.6s ease-out; }
                .animate-scale-in { animation: scale-in 0.3s ease-out; }
                .animate-bounce-slow { animation: bounce-slow 3s infinite; }
                .animate-pulse-slow { animation: pulse-slow 3s infinite; }
                
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }

                /* Battle Animation Specific CSS */
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-left-fast { from { transform: translateX(-100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes slide-in-right-fast { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
                @keyframes text-pop-in { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                @keyframes vs-zoom { 0% { transform: scale(0.5) rotate(-10deg); opacity: 0; } 50% { transform: scale(1.2) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
                @keyframes pulse-border { 0% { border-color: rgba(168, 85, 247, 0.7); transform: scale(1); } 50% { border-color: rgba(236, 72, 153, 0.9); transform: scale(1.05); } 100% { border-color: rgba(168, 85, 247, 0.7); transform: scale(1); } }
                
                .animate-fade-in-fast { animation: fade-in-fast 0.5s ease-out forwards; }
                .animate-slide-in-left-fast { animation: slide-in-left-fast 0.6s ease-out forwards; animation-delay: 0.2s; }
                .animate-slide-in-right-fast { animation: slide-in-right-fast 0.6s ease-out forwards; animation-delay: 0.2s; }
                .animate-float { animation: float 3s ease-in-out infinite; }
                .animate-text-pop-in { animation: text-pop-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; }
                .animate-vs-zoom { animation: vs-zoom 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; animation-delay: 0.4s; }
                .animate-pulse-border { animation: pulse-border 2s infinite ease-in-out; }
                .animate-fade-in-slow { animation: fade-in-fast 1s ease-out forwards; animation-delay: 1.5s; }
            `}</style>
        </div>
    );
};

export default GamePage;