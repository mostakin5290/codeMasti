import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaShareAlt,FaShare, FaUserCircle, FaSpinner, FaCrown, FaTimesCircle, FaCheckCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { IoTimerOutline } from 'react-icons/io5';
import SharePopup from '../components/common/SharePopup';

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Dynamic default theme that matches your other pages
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
    buttonText: 'text-white',
    highlight: 'text-cyan-400',
    highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400',
    iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900',
    gradientTo: 'to-gray-800',
    buttonPrimary: 'bg-blue-600',
    buttonPrimaryHover: 'bg-blue-700',
    successColor: 'text-emerald-400',
    errorColor: 'text-red-400',
    warningColor: 'text-amber-400',
    infoColor: 'text-blue-400',
    accent: 'bg-cyan-500',
};

const GameRoomDetailsPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };

    // Responsive state
    const [isMobile, setIsMobile] = useState(false);

    // Dynamic helper functions
    const getAccentColorBase = () => {
        const accentColorClass = theme.accent || theme.buttonPrimary;
        const match = accentColorClass.match(/bg-(\w+)-\d+/);
        return match ? match[1] : 'blue';
    };

    const sectionClasses = `backdrop-blur-xl border ${theme.border}/20 shadow-xl rounded-2xl`;

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);

    const [timeLeft, setTimeLeft] = useState(0);
    const [currentProblem, setCurrentProblem] = useState(null);
    const [gameEnded, setGameEnded] = useState(false);
    const [gameResults, setGameResults] = useState(null);

    // Battle animation states
    const [showBattleAnimation, setShowBattleAnimation] = useState(false);
    const [matchedUsers, setMatchedUsers] = useState({ currentUser: null, opponent: null });
    const battleAnimationTimerRef = useRef(null);

    const gameRoomSocketRef = useRef(null);
    const timerIntervalRef = useRef(null);

    const VITE_API_URL = import.meta.env.VITE_API_URL;

    // Check screen size for responsive design
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Helper to start the countdown timer
    const startCountdown = useCallback((endTimeMs) => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        console.log(`[Timer] Starting countdown. End time (MS): ${endTimeMs}, Readable: ${new Date(endTimeMs).toLocaleString()}`);

        timerIntervalRef.current = setInterval(() => {
            const now = new Date().getTime();
            const remaining = Math.max(0, Math.floor((endTimeMs - now) / 1000));
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
                console.log("[Timer] Countdown finished.");
                if (!gameEnded) {
                    // This local check is for UI update. Backend handles official end.
                }
            }
        }, 1000);
    }, [gameEnded]);

    // Handles the battle animation and subsequent navigation
    const startBattleAnimationAndNavigate = useCallback((roomData, currentUserProfile, opponentUserProfile) => {
        setMatchedUsers({ currentUser: currentUserProfile, opponent: opponentUserProfile });
        setShowBattleAnimation(true);
        battleAnimationTimerRef.current = setTimeout(() => {
            setShowBattleAnimation(false);
            setMatchedUsers({ currentUser: null, opponent: null });
            navigate(`/game/room/${roomData.roomId}/play`);
        }, 5000);
    }, [navigate]);

    // Main useEffect for fetching data and socket setup
    useEffect(() => {
        if (!isAuthenticated || !user) {
            toast.info("Please log in to access game rooms.");
            navigate('/login');
            return;
        }

        let isMounted = true;

        const initializeSocket = () => {
            if (gameRoomSocketRef.current) {
                return gameRoomSocketRef.current;
            }

            const newSocket = io(VITE_API_URL, {
                withCredentials: true,
                query: { userId: user._id }
            });
            gameRoomSocketRef.current = newSocket;

            newSocket.on('connect', () => {
                console.log('Connected to Socket.IO from GameRoomDetails:', newSocket.id);
                newSocket.emit('joinGameRoom', { roomId, userId: user._id });
            });

            newSocket.on('connect_error', (err) => {
                console.error("Socket.IO connection error (Game Room):", err);
                if (isMounted) {
                    toast.error("Failed to connect to game server. Please try again.");
                    navigate('/game');
                }
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Disconnected from Socket.IO (Game Room):', reason);
                if (isMounted) {
                    toast.info("Disconnected from game room.");
                }
            });

            newSocket.on('roomUpdate', (data) => {
                if (isMounted) {
                    console.log("Room updated:", data);
                    setRoom(data.room);
                    console.log(`[Room Update] Players: ${data.room.players.length}, Max Players: ${data.room.maxPlayers}`);
                    toast.info(data.message || "Room state updated.");

                    if (data.room.status === 'in-progress' && !gameStarted) {
                        setGameStarted(true);
                        const endTime = new Date(data.room.endTime).getTime();
                        startCountdown(endTime);
                        setCurrentProblem(data.room.problemIds[data.room.currentProblemIndex]);

                        const currentPlayerProfile = data.room.players.find(p => p.userId._id === user._id)?.userId;
                        const opponentPlayerProfile = data.room.players.find(p => p.userId._id !== user._id)?.userId;
                        if (currentPlayerProfile && opponentPlayerProfile) {
                            startBattleAnimationAndNavigate(data.room, currentPlayerProfile, opponentPlayerProfile);
                        } else {
                            navigate(`/game/room/${roomId}/play`);
                        }
                    } else if (data.room.status === 'completed' && !gameEnded) {
                        setGameEnded(true);
                        setGameResults(data.room.gameResults);
                        setGameStarted(false);
                        clearInterval(timerIntervalRef.current);
                        toast.info(`Game ${data.room.roomId} is ${data.room.status}. Displaying results.`);
                    } else if (data.room.status === 'cancelled') {
                        clearInterval(timerIntervalRef.current);
                        toast.warn(`Game ${data.room.roomId} was cancelled.`);
                        setTimeout(() => navigate('/game'), 3000);
                    }
                }
            });

            newSocket.on('playerJoinedRoom', (data) => {
                if (isMounted) {
                    console.log("Player joined room:", data);
                    setRoom(data.room);
                    console.log(`[Player Joined] Players: ${data.room.players.length}, Max Players: ${data.room.maxPlayers}`);
                    toast.info(data.message);
                }
            });

            newSocket.on('playerLeftRoom', (data) => {
                if (isMounted) {
                    console.log("Player left room:", data);
                    setRoom(data.room);
                    toast.warn(data.message);
                    if (data.room.players.length === 0 && data.room.status !== 'in-progress') {
                        toast.info("Room is empty. Redirecting to game lobby.");
                        navigate('/game');
                    }
                }
            });

            newSocket.on('playerStatusUpdate', (data) => {
                if (isMounted) {
                    console.log("Player status update:", data);
                    setRoom(data.room);
                    toast.info(data.message);
                }
            });

            newSocket.on('gameStart', (data) => {
                if (isMounted && !gameStarted) {
                    console.log("[Socket Event] gameStart received:", data);
                    toast.success(data.message || "Game started!");
                    setRoom(data.room);
                    setCurrentProblem(data.problem);
                    setGameStarted(true);
                    setGameEnded(false);

                    const gameEndTime = new Date(data.room.endTime).getTime();
                    startCountdown(gameEndTime);

                    const currentPlayerProfile = data.room.players.find(p => p.userId._id === user._id)?.userId;
                    const opponentPlayerProfile = data.room.players.find(p => p.userId._id !== user._id)?.userId;
                    if (currentPlayerProfile && opponentPlayerProfile) {
                        startBattleAnimationAndNavigate(data.room, currentPlayerProfile, opponentPlayerProfile);
                    } else {
                        navigate(`/game/room/${roomId}/play`);
                    }
                }
            });

            newSocket.on('gameEnd', (data) => {
                if (isMounted) {
                    console.log("[Socket Event] gameEnd received:", data);
                    toast.info(data.message || `Game ended: ${data.reason}`);
                    setRoom(data.room);
                    setGameEnded(true);
                    setGameResults(data.results);
                    setGameStarted(false);

                    if (timerIntervalRef.current) {
                        clearInterval(timerIntervalRef.current);
                        timerIntervalRef.current = null;
                    }
                }
            });

            newSocket.on('gameError', (data) => {
                if (isMounted) {
                    toast.error(`Game Error: ${data.message}`);
                    console.error("Game Error:", data);
                    if (showBattleAnimation) {
                        setShowBattleAnimation(false);
                        setMatchedUsers({ currentUser: null, opponent: null });
                        if (battleAnimationTimerRef.current) {
                            clearTimeout(battleAnimationTimerRef.current);
                            battleAnimationTimerRef.current = null;
                        }
                    }
                    if (data.message.includes('not found') || data.message.includes('full') || data.message.includes('not active')) {
                        navigate('/game');
                    }
                }
            });

            newSocket.on('reconnectedToGame', (data) => {
                if (isMounted) {
                    console.log("[Socket Event] reconnectedToGame received:", data);
                    toast.success("Reconnected to your game!");
                    setRoom(data.room);
                    setCurrentProblem(data.problem);
                    setGameStarted(true);
                    setGameEnded(false);

                    const gameEndTime = new Date(data.room.endTime).getTime();
                    startCountdown(gameEndTime);
                    navigate(`/game/room/${roomId}/play`);
                }
            });

            return newSocket;
        };

        const fetchAndConnect = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/game/room/${roomId}`, { withCredentials: true });
                const fetchedRoom = response.data.room;

                if (!isMounted) return;

                setRoom(fetchedRoom);
                setLoading(false);
                console.log(`[Initial Fetch] Room State: Status=${fetchedRoom.status}, Players=${fetchedRoom.players.length}, MaxPlayers=${fetchedRoom.maxPlayers}`);

                const socketInstance = initializeSocket();

                if (fetchedRoom.status === 'in-progress') {
                    setGameStarted(true);
                    const endTime = new Date(fetchedRoom.endTime).getTime();
                    startCountdown(endTime);
                    setCurrentProblem(fetchedRoom.problemIds[fetchedRoom.currentProblemIndex]);
                    if (!window.location.pathname.endsWith('/play')) {
                        navigate(`/game/room/${roomId}/play`);
                    }
                } else if (fetchedRoom.status === 'completed') {
                    setGameEnded(true);
                    setGameResults(fetchedRoom.gameResults);
                    setGameStarted(false);
                } else if (fetchedRoom.status === 'cancelled') {
                    toast.warn(`Game ${roomId} was cancelled.`);
                    navigate('/game');
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Error fetching room details:", err);
                    setError(err.response?.data?.message || 'Failed to fetch game room details.');
                    setLoading(false);
                    toast.error(err.response?.data?.message || 'Failed to join room.');
                    navigate('/game');
                }
            }
        };

        fetchAndConnect();

        return () => {
            isMounted = false;
            if (gameRoomSocketRef.current) {
                console.log('Disconnecting game room socket.');
                gameRoomSocketRef.current.disconnect();
                gameRoomSocketRef.current = null;
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            if (battleAnimationTimerRef.current) {
                clearTimeout(battleAnimationTimerRef.current);
                battleAnimationTimerRef.current = null;
            }
        };
    }, [roomId, isAuthenticated, user, navigate, VITE_API_URL, startCountdown, startBattleAnimationAndNavigate]);

    const handlePlayerReady = () => {
        if (room?.players.length === room.maxPlayers && !room.players.some(p => p.userId?._id === user._id && p.status === 'ready')) {
            if (gameRoomSocketRef.current && gameRoomSocketRef.current.connected) {
                gameRoomSocketRef.current.emit('playerReady', { roomId, userId: user._id });
                toast.info("You are marked as ready! Waiting for other players...");
            } else {
                toast.error("Not connected to game server. Please refresh.");
            }
        } else {
            toast.warn("Cannot set ready status. Room might not be full or you are already ready.");
        }
    };

    const handleLeaveRoom = () => {
        if (gameRoomSocketRef.current && gameRoomSocketRef.current.connected) {
            gameRoomSocketRef.current.emit('leaveGameRoom', { roomId, userId: user._id });
            navigate('/game');
        } else {
            navigate('/game');
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
                <LoadingSpinner size="lg" color={getAccentColorBase()} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${theme.background} ${theme.errorColor} px-4`}>
                <FaTimesCircle className="text-4xl sm:text-6xl mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">Error</h2>
                <p className="text-base sm:text-lg text-center mb-4">{error}</p>
                <button
                    onClick={() => navigate('/game')}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md ${theme.buttonPrimary} ${theme.buttonText} hover:${theme.buttonPrimaryHover} transition-colors duration-200 text-sm sm:text-base`}
                >
                    Back to Game Lobby
                </button>
            </div>
        );
    }

    if (!room) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${theme.background} ${theme.text} px-4 text-center`}>
                <p className="mb-4 text-sm sm:text-base">No room data available. Please try joining again.</p>
                <button
                    onClick={() => navigate('/game')}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md ${theme.buttonPrimary} ${theme.buttonText} hover:${theme.buttonPrimaryHover} transition-colors duration-200 text-sm sm:text-base`}
                >
                    Back to Game Lobby
                </button>
            </div>
        );
    }

    const currentPlayer = room.players.find(p => p.userId?._id === user._id);
    const currentPlayerStatus = currentPlayer?.status;
    const isRoomFull = room.players.length === room.maxPlayers;
    const showReadyButton = currentPlayerStatus !== 'ready' && isRoomFull && !gameStarted && !gameEnded;

    return (
        <div className={`min-h-screen relative overflow-hidden ${theme.text} bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo}`}>
            {/* Dynamic Animated Background Elements - Responsive */}
            <div className={`absolute top-0 left-0 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 ${theme.primary.replace('bg-', 'bg-')}/5 rounded-full blur-3xl translate-x-[-20%] translate-y-[-20%] animate-blob`}></div>
            <div className={`absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 ${theme.secondary.replace('bg-', 'bg-')}/5 rounded-full blur-3xl translate-x-[20%] translate-y-[20%] animate-blob animation-delay-2000`}></div>
            <div className={`absolute top-1/2 left-1/2 w-30 h-30 sm:w-45 sm:h-45 lg:w-60 lg:h-60 ${theme.highlight.replace('text-', 'bg-')}/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000`}></div>

            <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-screen">
                {showBattleAnimation && matchedUsers.currentUser && matchedUsers.opponent ? (
                    <div className={`fixed inset-0 bg-gradient-to-br ${theme.gradientFrom} via-purple-900 ${theme.gradientTo} backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in-fast px-4`}>
                        <div className="text-center text-white space-y-4 sm:space-y-6 lg:space-y-8 relative w-full max-w-4xl">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 border-4 sm:border-8 ${theme.highlight.replace('text-', 'border-')} rounded-full animate-pulse-border opacity-70`}></div>
                            </div>

                            <h2 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} via-pink-500 ${theme.secondary.replace('bg-', 'to-')} animate-text-pop-in relative z-10`}>
                                BATTLE!
                            </h2>
                            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center ${isMobile ? 'space-y-6' : 'space-x-8 lg:space-x-12'} relative z-10`}>
                                <div className="flex flex-col items-center space-y-2 sm:space-y-4 animate-slide-in-left-fast">
                                    <img
                                        src={matchedUsers.currentUser.avatar || '/default-avatar.png'}
                                        alt="You"
                                        className={`w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full object-cover border-2 sm:border-4 ${theme.primary.replace('bg-', 'border-')} shadow-lg animate-float`}
                                    />
                                    <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${theme.highlight}`}>YOU</p>
                                    <p className="text-sm sm:text-lg lg:text-xl font-medium text-center max-w-32 sm:max-w-none truncate">{matchedUsers.currentUser.firstName || 'Player'}</p>
                                </div>

                                <span className={`text-4xl sm:text-6xl lg:text-8xl font-extrabold ${theme.errorColor} animate-vs-zoom relative z-10 ${isMobile ? 'order-first mb-4' : ''}`}>VS</span>

                                <div className="flex flex-col items-center space-y-2 sm:space-y-4 animate-slide-in-right-fast">
                                    <img
                                        src={matchedUsers.opponent.avatar || '/default-avatar.png'}
                                        alt="Opponent"
                                        className={`w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full object-cover border-2 sm:border-4 ${theme.secondary.replace('bg-', 'border-')} shadow-lg animate-float`}
                                    />
                                    <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${theme.highlightSecondary}`}>OPPONENT</p>
                                    <p className="text-sm sm:text-lg lg:text-xl font-medium text-center max-w-32 sm:max-w-none truncate">{matchedUsers.opponent.firstName || 'Opponent'}</p>
                                </div>
                            </div>
                            <p className={`text-base sm:text-xl font-semibold ${theme.cardText} mt-4 sm:mt-8 animate-fade-in-slow relative z-10`}>
                                Get ready to code!
                            </p>
                        </div>
                    </div>
                ) : (
                    // Original room details content with responsive design
                    <div className={`${sectionClasses} ${theme.cardBg} p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-2xl lg:max-w-3xl w-full text-center`}>
                        {/* Lobby/Waiting State */}
                        {!gameStarted && !gameEnded && (
                            <>
                                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-4 ${theme.highlight}`}>
                                    Waiting Room: {room.roomId}
                                </h2>
                                <p className={`text-sm sm:text-base lg:text-lg ${theme.cardText} mb-4 sm:mb-6`}>
                                    Game Mode: {room.gameMode.toUpperCase()} | Difficulty: <span className={`font-semibold ${theme.highlightSecondary}`}>{room.difficulty.toUpperCase()}</span> | Time Limit: {room.timeLimit} minutes
                                </p>

                                <div className={`${theme.iconBg} p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border ${theme.border}/50`}>
                                    <p className={`${theme.cardText} mb-2 sm:mb-3 flex items-center justify-center text-sm sm:text-base`}>
                                        <FaShareAlt className="mr-2" /> Share this link with your friend:
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${window.location.origin}/game/room/${room.roomId}`}
                                            className={`w-full sm:flex-grow p-2 rounded-md ${theme.background} ${theme.text} border ${theme.border} text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500`}
                                        />
                                        <button
                                            onClick={() => setShowSharePopup(true)}
                                            className={`w-full sm:w-auto p-2 rounded-lg ${theme.cardBg} ${theme.cardText} hover:${theme.cardBg}/80 transition-colors text-sm sm:text-base`}
                                            title="Share Post"
                                        >
                                            <FaShare className="w-3 h-3 sm:w-4 sm:h-4 mx-auto sm:mx-0" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${theme.text}`}>Players in Room ({room.players.length}/{room.maxPlayers})</h3>
                                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-3 sm:gap-4 mb-6 sm:mb-8`}>
                                    {room.players.map(player => (
                                        <div key={player.userId?._id || player.socketId} className={`${theme.background}/50 p-3 sm:p-4 rounded-lg flex flex-col items-center ${isMobile ? 'w-full' : 'w-32 sm:w-36'} border ${theme.border}/50`}>
                                            <img
                                                src={player.userId?.avatar || '/default-avatar.png'}
                                                alt={player.userId?.firstName || 'Player'}
                                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mb-2 border-2 border-transparent"
                                            />
                                            <p className={`font-semibold ${theme.text} text-sm sm:text-base text-center truncate w-full`}>{player.userId?.firstName || 'Connecting...'}</p>
                                            <p className={`text-xs ${theme.cardText}`}>{player.isCreator ? 'Host' : 'Player'}</p>
                                            <span className={`mt-2 text-xs font-medium px-2 py-1 rounded-full ${player.status === 'ready' ? theme.successColor.replace('text-', 'bg-') + '/20' : theme.warningColor.replace('text-', 'bg-') + '/20'} ${player.status === 'ready' ? theme.successColor : theme.warningColor}`}>
                                                {player.status === 'ready' ? 'Ready' : 'Waiting...'}
                                            </span>
                                        </div>
                                    ))}
                                    {Array.from({ length: room.maxPlayers - room.players.length }).map((_, index) => (
                                        <div key={`empty-${index}`} className={`${theme.background}/50 p-3 sm:p-4 rounded-lg flex flex-col items-center ${isMobile ? 'w-full' : 'w-32 sm:w-36'} border ${theme.border}/50 border-dashed`}>
                                            <FaUserCircle className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mb-2 ${theme.cardText}/50`} />
                                            <p className={`font-semibold ${theme.cardText}/50 text-sm sm:text-base`}>Waiting...</p>
                                            <p className={`text-xs ${theme.cardText}/50`}>Empty Slot</p>
                                            <span className={`mt-2 text-xs font-medium px-2 py-1 rounded-full ${theme.cardText}/10 ${theme.cardText}/50`}>
                                                Empty
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {showReadyButton && (
                                    <button
                                        onClick={handlePlayerReady}
                                        disabled={loading}
                                        className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-xl text-base sm:text-lg font-semibold ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} transition-all duration-300 shadow-lg disabled:opacity-50`}
                                    >
                                        {loading ? <LoadingSpinner size="sm" color="white" /> : 'I\'m Ready!'}
                                    </button>
                                )}
                                {!showReadyButton && isRoomFull && currentPlayerStatus === 'ready' && (
                                    <p className={`${theme.infoColor} mt-4 text-base sm:text-lg font-semibold`}>Waiting for game to start...</p>
                                )}
                                {!showReadyButton && !isRoomFull && (
                                    <p className={`${theme.cardText} mt-4 text-base sm:text-lg font-semibold`}>Waiting for more players to join...</p>
                                )}

                                <button
                                    onClick={handleLeaveRoom}
                                    className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-xl text-base sm:text-lg font-semibold ${theme.errorColor.replace('text-', 'bg-')}/20 ${theme.errorColor} hover:${theme.errorColor.replace('text-', 'bg-')}/30 transition-all duration-300 shadow-lg mt-4`}
                                >
                                    Leave Room
                                </button>
                            </>
                        )}

                        {/* Game Started State */}
                        {gameStarted && !gameEnded && !showBattleAnimation && (
                            <div className="flex flex-col items-center justify-center">
                                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-4 ${theme.highlight}`}>Game in Progress!</h2>
                                <div className={`flex items-center space-x-2 text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme.infoColor}`}>
                                    <IoTimerOutline /> <span>Time Left: {formatTime(timeLeft)}</span>
                                </div>
                                {currentProblem && (
                                    <div className={`${theme.background}/50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 w-full max-w-lg border ${theme.border}/50`}>
                                        <h3 className={`text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 ${theme.text}`}>Current Problem:</h3>
                                        <p className={`text-lg sm:text-xl font-semibold ${theme.highlightSecondary}`}>{currentProblem.title}</p>
                                        <p className={`${theme.cardText} text-sm sm:text-base`}>Difficulty: {currentProblem.difficulty}</p>
                                    </div>
                                )}
                                <p className={`${theme.cardText} mb-6 sm:mb-8 text-sm sm:text-base`}>Redirecting you to the coding environment...</p>
                                <LoadingSpinner size="lg" color={getAccentColorBase()} />
                            </div>
                        )}

                        {/* Game Ended State */}
                        {gameEnded && (
                            <div className="flex flex-col items-center justify-center">
                                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-4 ${theme.highlight}`}>Game Over!</h2>
                                <p className={`text-base sm:text-lg ${theme.cardText} mb-4 sm:mb-6`}>Reason: {gameResults?.reason || 'Unknown'}</p>

                                {gameResults?.winner && (
                                    <div className={`${theme.background}/50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 w-full max-w-md border ${theme.border}`}>
                                        <h3 className={`text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 ${theme.successColor}`}>Winner!</h3>
                                        <div className="flex flex-col items-center">
                                            <img
                                                src={gameResults.winner.avatar || '/default-avatar.png'}
                                                alt={gameResults.winner.firstName}
                                                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mb-2 border-2 sm:border-4 ${theme.warningColor.replace('text-', 'border-')}`}
                                            />
                                            <p className={`text-xl sm:text-2xl font-semibold ${theme.text}`}>{gameResults.winner.firstName}</p>
                                            <p className={`${theme.cardText} text-sm sm:text-base`}>Solved first in {formatTime(gameResults.solvedOrder.find(p => p.userId._id === gameResults.winner._id)?.timeTaken || 0)}</p>
                                        </div>
                                    </div>
                                )}

                                <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${theme.text}`}>Leaderboard</h3>
                                <div className="w-full max-w-xl mx-auto">
                                    {gameResults?.solvedOrder?.length > 0 ? (
                                        <ol className="list-decimal list-inside space-y-2 sm:space-y-3">
                                            {gameResults.solvedOrder.map((entry, index) => {
                                                const playerIsWinner = gameResults.winner && entry.userId._id === gameResults.winner._id;
                                                const solvedAnyProblems = entry.problemsSolvedCount > 0;

                                                // Determine ELO display
                                                let eloDisplay = null;
                                                if (entry.eloBeforeGame !== null && entry.eloChange !== null && entry.eloAfterGame !== null) {
                                                    const eloChangeSign = entry.eloChange >= 0 ? '+' : '';
                                                    const eloChangeColor = entry.eloChange > 0 ? theme.successColor : entry.eloChange < 0 ? theme.errorColor : theme.cardText;
                                                    const eloChangeIcon = entry.eloChange > 0 ? <FaArrowUp className="inline-block ml-1" /> : entry.eloChange < 0 ? <FaArrowDown className="inline-block ml-1" /> : null;

                                                    eloDisplay = (
                                                        <p className={`${theme.cardText} text-xs sm:text-sm flex items-center justify-end mt-1`}>
                                                            ELO: {entry.eloBeforeGame} <span className={`${eloChangeColor} ml-1`}>({eloChangeSign}{entry.eloChange})</span> = {entry.eloAfterGame} {eloChangeIcon}
                                                        </p>
                                                    );
                                                }

                                                return (
                                                    <li key={entry.userId._id} className={`${theme.background}/50 p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between border ${theme.border}`}>
                                                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
                                                            <span className={`text-base sm:text-lg font-bold ${playerIsWinner ? theme.successColor : theme.infoColor}`}>
                                                                {index + 1}.
                                                            </span>
                                                            <img
                                                                src={entry.userId.avatar || '/default-avatar.png'}
                                                                alt={entry.userId.firstName}
                                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2"
                                                            />
                                                            <p className={`font-semibold ${theme.text} text-sm sm:text-base`}>
                                                                {entry.userId.firstName} {entry.userId.lastName}
                                                                {playerIsWinner && <FaCrown className={`inline-block ml-2 ${theme.warningColor}`} title="Winner!" />}
                                                            </p>
                                                        </div>
                                                        <div className="text-left sm:text-right w-full sm:w-auto">
                                                            {solvedAnyProblems ? (
                                                                <>
                                                                    <p className={`${theme.highlightSecondary} font-bold text-sm sm:text-base`}>{entry.problemsSolvedCount} problem{entry.problemsSolvedCount !== 1 ? 's' : ''} solved</p>
                                                                    <p className={`${theme.cardText} text-xs sm:text-sm`}>Time: {formatTime(entry.timeTaken)}</p>
                                                                </>
                                                            ) : (
                                                                <p className={`${theme.errorColor} font-bold text-sm sm:text-base`}>Not Completed</p>
                                                            )}
                                                            {eloDisplay}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    ) : (
                                        <p className={`${theme.cardText} text-sm sm:text-base`}>No problems were solved in this game.</p>
                                    )}
                                </div>

                                <button
                                    onClick={() => navigate('/game')}
                                    className={`mt-6 sm:mt-8 px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-semibold ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} transition-all duration-300 shadow-lg w-full sm:w-auto`}
                                >
                                    Play Again!
                                </button>
                                <button
                                    onClick={handleLeaveRoom}
                                    className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-xl text-base sm:text-lg font-semibold ${theme.errorColor.replace('text-', 'bg-')}/20 ${theme.errorColor} hover:${theme.errorColor.replace('text-', 'bg-')}/30 transition-all duration-300 shadow-lg mt-4`}
                                >
                                    Back to Lobby
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showSharePopup && (
                <SharePopup
                    url={`${window.location.origin}/game/room/${room.roomId}`}
                    title="Share to your Friend"
                    onClose={() => setShowSharePopup(false)}
                />
            )}

            {/* Dynamic Animations CSS */}
            <style jsx>{`
                /* Existing animations with dynamic color support */
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
                .animate-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }
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
                @keyframes pulse-border { 
                    0% { 
                        border-color: var(--theme-highlight, rgba(168, 85, 247, 0.7)); 
                        transform: scale(1); 
                    } 
                    50% { 
                        border-color: var(--theme-secondary, rgba(236, 72, 153, 0.9)); 
                        transform: scale(1.05); 
                    } 
                    100% { 
                        border-color: var(--theme-highlight, rgba(168, 85, 247, 0.7)); 
                        transform: scale(1); 
                    } 
                }
                
                .animate-fade-in-fast { animation: fade-in-fast 0.5s ease-out forwards; }
                .animate-slide-in-left-fast { animation: slide-in-left-fast 0.6s ease-out forwards; animation-delay: 0.2s; }
                .animate-slide-in-right-fast { animation: slide-in-right-fast 0.6s ease-out forwards; animation-delay: 0.2s; }
                .animate-float { animation: float 3s ease-in-out infinite; }
                .animate-text-pop-in { animation: text-pop-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; }
                .animate-vs-zoom { animation: vs-zoom 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; animation-delay: 0.4s; }
                .animate-pulse-border { animation: pulse-border 2s infinite ease-in-out; }
                .animate-fade-in-slow { animation: fade-in-fast 1s ease-out forwards; animation-delay: 1.5s; }

                /* Responsive utilities */
                @media (max-width: 640px) {
                    .max-w-32 { max-width: 8rem; }
                }
            `}</style>
        </div>
    );
};

export default GameRoomDetailsPage;
