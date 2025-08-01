import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaShareAlt, FaUserCircle, FaSpinner, FaCrown, FaTimesCircle, FaCheckCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa'; // Import FaArrowUp, FaArrowDown
import { IoTimerOutline } from 'react-icons/io5';

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

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
};

const GameRoomDetailsPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameStarted, setGameStarted] = useState(false); // Indicates if game is officially started (via gameStart event)
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentProblem, setCurrentProblem] = useState(null);
    const [gameEnded, setGameEnded] = useState(false);
    const [gameResults, setGameResults] = useState(null);

    // New states for battle animation on this page
    const [showBattleAnimation, setShowBattleAnimation] = useState(false);
    const [matchedUsers, setMatchedUsers] = useState({ currentUser: null, opponent: null });
    const battleAnimationTimerRef = useRef(null); // Timer for the 5-second animation

    const gameRoomSocketRef = useRef(null);
    const timerIntervalRef = useRef(null);

    const VITE_API_URL = import.meta.env.VITE_API_URL;

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
                // Ensure gameEnd is processed if timer hits zero here
                // Note: Backend should also emit gameEnd when time truly expires
                if (!gameEnded) { // Prevent redundant calls
                    // This local check is for UI update. Backend handles official end.
                    // If the backend doesn't respond fast enough, this can show "Game Over".
                    // However, the official results and ELO update come from backend.
                }
            }
        }, 1000);
    }, [gameEnded]); // Added gameEnded to dependencies

    // Handles the battle animation and subsequent navigation
    const startBattleAnimationAndNavigate = useCallback((roomData, currentUserProfile, opponentUserProfile) => {
        setMatchedUsers({ currentUser: currentUserProfile, opponent: opponentUserProfile });
        setShowBattleAnimation(true); // Show the animation

        battleAnimationTimerRef.current = setTimeout(() => {
            setShowBattleAnimation(false); // Hide the animation
            setMatchedUsers({ currentUser: null, opponent: null }); // Clear matched users state
            navigate(`/game/room/${roomData.roomId}/play`); // Navigate DIRECTLY to coding environment
        }, 5000); // 5 seconds for the animation
    }, [navigate]);

    // Main useEffect for fetching data and socket setup
    useEffect(() => {
        if (!isAuthenticated || !user) {
            toast.info("Please log in to access game rooms.");
            navigate('/login');
            return;
        }

        let isMounted = true; // Flag to track if component is mounted

        const initializeSocket = () => {
            if (gameRoomSocketRef.current) {
                // Socket already exists, do not re-initialize
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

                    // This block handles updates if the game starts or ends while player is on this page
                    if (data.room.status === 'in-progress' && !gameStarted) {
                        // Game just started from a 'waiting' state
                        setGameStarted(true);
                        const endTime = new Date(data.room.endTime).getTime();
                        startCountdown(endTime);
                        setCurrentProblem(data.room.problemIds[data.room.currentProblemIndex]);

                        // THIS IS NOW THE CENTRAL NAVIGATION POINT FOR GAME START
                        // Trigger the battle animation here before navigating to play page
                        const currentPlayerProfile = data.room.players.find(p => p.userId._id === user._id)?.userId;
                        const opponentPlayerProfile = data.room.players.find(p => p.userId._id !== user._id)?.userId;
                        if (currentPlayerProfile && opponentPlayerProfile) {
                            startBattleAnimationAndNavigate(data.room, currentPlayerProfile, opponentPlayerProfile);
                        } else {
                            // Fallback direct navigate if profiles are not immediately populated
                            navigate(`/game/room/${roomId}/play`);
                        }
                    } else if (data.room.status === 'completed' && !gameEnded) {
                        setGameEnded(true);
                        setGameResults(data.room.gameResults); // Ensure gameResults is correctly set from data.room
                        setGameStarted(false);
                        clearInterval(timerIntervalRef.current);
                        toast.info(`Game ${data.room.roomId} is ${data.room.status}. Displaying results.`);
                        // No automatic navigation to /game/room/:roomId/results here if results are shown on THIS page.
                        // setTimeout(() => navigate(`/game/room/${roomId}/results`), 3000); // Remove or adjust this if showing results on this page.
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
                    if (data.room.players.length === 0 && data.room.status !== 'in-progress') { // Only navigate if not in-progress (game might still continue)
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

            // THIS IS THE PRIMARY GAME START SIGNAL.
            newSocket.on('gameStart', (data) => {
                if (isMounted && !gameStarted) { // Only process if game hasn't been marked as started yet
                    console.log("[Socket Event] gameStart received:", data);
                    toast.success(data.message || "Game started!");
                    setRoom(data.room);
                    setCurrentProblem(data.problem);
                    setGameStarted(true);
                    setGameEnded(false);

                    const gameEndTime = new Date(data.room.endTime).getTime();
                    startCountdown(gameEndTime);

                    // CENTRAL NAVIGATION POINT: Trigger battle animation before going to play
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
                    setGameResults(data.results); // Ensure gameResults is correctly set from event
                    setGameStarted(false); // Game is no longer in progress

                    if (timerIntervalRef.current) {
                        clearInterval(timerIntervalRef.current);
                        timerIntervalRef.current = null;
                    }
                    // No automatic navigation to /game/room/:roomId/results here, as it's handled above in roomUpdate
                    // or in the initial fetch. User sees results on this page.
                }
            });

            newSocket.on('gameError', (data) => {
                if (isMounted) {
                    toast.error(`Game Error: ${data.message}`);
                    console.error("Game Error:", data);
                    // Clear animation if error during transition
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
                    // On reconnect, always go directly to play page
                    navigate(`/game/room/${roomId}/play`);
                }
            });

            return newSocket; // Return the new socket instance
        };

        const fetchAndConnect = async () => {
            setLoading(true); // Start loading
            try {
                const response = await axiosClient.get(`/game/room/${roomId}`, { withCredentials: true });
                const fetchedRoom = response.data.room;

                if (!isMounted) return; // Prevent state updates if component unmounted

                setRoom(fetchedRoom);
                setLoading(false); // End loading after fetch
                console.log(`[Initial Fetch] Room State: Status=${fetchedRoom.status}, Players=${fetchedRoom.players.length}, MaxPlayers=${fetchedRoom.maxPlayers}`);

                // Initialize socket ONLY AFTER fetching initial room state
                const socketInstance = initializeSocket();

                // Handle initial room status based on REST API fetch
                if (fetchedRoom.status === 'in-progress') {
                    setGameStarted(true);
                    const endTime = new Date(fetchedRoom.endTime).getTime();
                    startCountdown(endTime);
                    setCurrentProblem(fetchedRoom.problemIds[fetchedRoom.currentProblemIndex]);
                    // If page loaded directly into in-progress game, go to play page
                    // No animation here, as the start signal should have already happened.
                    if (!window.location.pathname.endsWith('/play')) {
                        navigate(`/game/room/${roomId}/play`);
                    }
                } else if (fetchedRoom.status === 'completed') {
                    setGameEnded(true);
                    setGameResults(fetchedRoom.gameResults);
                    setGameStarted(false);
                } else if (fetchedRoom.status === 'cancelled') {
                    toast.warn(`Game ${roomId} was cancelled.`);
                    navigate('/game'); // Redirect if cancelled on load
                }

            } catch (err) {
                if (isMounted) {
                    console.error("Error fetching room details:", err);
                    setError(err.response?.data?.message || 'Failed to fetch game room details.');
                    setLoading(false);
                    toast.error(err.response?.data?.message || 'Failed to join room.');
                    navigate('/game'); // Redirect to lobby on fetch error
                }
            }
        };

        fetchAndConnect();

        // Cleanup function for useEffect
        return () => {
            isMounted = false; // Set flag to false on unmount
            if (gameRoomSocketRef.current) {
                console.log('Disconnecting game room socket.');
                gameRoomSocketRef.current.disconnect();
                gameRoomSocketRef.current = null;
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            // Clear battle animation timeout on component unmount
            if (battleAnimationTimerRef.current) {
                clearTimeout(battleAnimationTimerRef.current);
                battleAnimationTimerRef.current = null;
            }
        };
    }, [roomId, isAuthenticated, user, navigate, VITE_API_URL, startCountdown, startBattleAnimationAndNavigate]); // Added `startBattleAnimationAndNavigate` to dependencies

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
            navigate('/game'); // Navigate after signalling leave
        } else {
            navigate('/game'); // Just navigate if socket is not connected
        }
    };

    const handleCopyRoomLink = () => {
        const roomLink = `${window.location.origin}/game/room/${roomId}`;
        navigator.clipboard.writeText(roomLink);
        toast.success('Room link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
                <LoadingSpinner size="lg" color={theme.primary.split('-')[1]} />
                <p className={`ml-4 ${theme.text}`}>Loading room...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${theme.background} ${theme.errorColor}`}>
                <FaTimesCircle className="text-6xl mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error</h2>
                <p className="text-lg text-center">{error}</p>
                <button
                    onClick={() => navigate('/game')}
                    className={`mt-6 px-6 py-3 rounded-md ${theme.buttonPrimary} ${theme.buttonText} hover:${theme.buttonPrimaryHover}`}
                >
                    Back to Game Lobby
                </button>
            </div>
        );
    }

    if (!room) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme.background} ${theme.text}`}>
                <p>No room data available. Please try joining again.</p>
                <button
                    onClick={() => navigate('/game')}
                    className={`mt-6 px-6 py-3 rounded-md ${theme.buttonPrimary} ${theme.buttonText} hover:${theme.buttonPrimaryHover}`}
                >
                    Back to Game Lobby
                </button>
            </div>
        );
    }

    const currentPlayer = room.players.find(p => p.userId?._id === user._id); // Optional chaining for userId
    const currentPlayerStatus = currentPlayer?.status;
    const isRoomFull = room.players.length === room.maxPlayers;
    const showReadyButton = currentPlayerStatus !== 'ready' && isRoomFull && !gameStarted && !gameEnded;


    return (
        <div className={`min-h-screen p-8 ${theme.background} ${theme.text} flex flex-col items-center justify-center`}>
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
                // Original room details content
                <div className={`${theme.cardBg} p-8 rounded-lg shadow-xl max-w-3xl w-full border ${theme.border} text-center`}>
                    {/* Lobby/Waiting State */}
                    {!gameStarted && !gameEnded && (
                        <>
                            <h2 className={`text-4xl font-extrabold mb-4 ${theme.highlight}`}>
                                Waiting Room: {room.roomId}
                            </h2>
                            <p className={`text-lg ${theme.cardText} mb-6`}>
                                Game Mode: {room.gameMode.toUpperCase()} | Difficulty: <span className={`font-semibold ${theme.highlightSecondary}`}>{room.difficulty.toUpperCase()}</span> | Time Limit: {room.timeLimit} minutes
                            </p>

                            <div className={`bg-gray-700/30 p-4 rounded-lg mb-6 border ${theme.border}/50`}>
                                <p className={`${theme.cardText} mb-3 flex items-center justify-center`}>
                                    <FaShareAlt className="mr-2" /> Share this link with your friend:
                                </p>
                                <div className="flex items-center justify-center space-x-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${window.location.origin}/game/room/${room.roomId}`}
                                        className={`flex-grow p-2 rounded-md ${theme.background} ${theme.text} border ${theme.border} text-sm focus:outline-none`}
                                    />
                                    <button
                                        onClick={handleCopyRoomLink}
                                        className={`px-4 py-2 rounded-md ${theme.secondary} ${theme.buttonText} hover:${theme.secondaryHover} transition-colors`}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <h3 className={`text-2xl font-bold mb-4 ${theme.text}`}>Players in Room ({room.players.length}/{room.maxPlayers})</h3>
                            <div className="flex flex-wrap justify-center gap-4 mb-8">
                                {room.players.map(player => (
                                    <div key={player.userId?._id || player.socketId} className={`${theme.background}/50 p-4 rounded-lg flex flex-col items-center w-36 border ${theme.border}/50`}>
                                        <img
                                            src={player.userId?.avatar || '/default-avatar.png'}
                                            alt={player.userId?.firstName || 'Player'}
                                            className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-transparent"
                                        />
                                        <p className={`font-semibold ${theme.text}`}>{player.userId?.firstName || 'Connecting...'}</p>
                                        <p className={`text-xs ${theme.cardText}`}>{player.isCreator ? 'Host' : 'Player'}</p>
                                        <span className={`mt-2 text-xs font-medium px-2 py-1 rounded-full ${player.status === 'ready' ? theme.successColor.replace('text-', 'bg-') + '/20' : theme.warningColor.replace('text-', 'bg-') + '/20'} ${player.status === 'ready' ? theme.successColor : theme.warningColor}`}>
                                            {player.status === 'ready' ? 'Ready' : 'Waiting...'}
                                        </span>
                                    </div>
                                ))}
                                {Array.from({ length: room.maxPlayers - room.players.length }).map((_, index) => (
                                    <div key={`empty-${index}`} className={`${theme.background}/50 p-4 rounded-lg flex flex-col items-center w-36 border ${theme.border}/50 border-dashed`}>
                                        <FaUserCircle className={`w-16 h-16 rounded-full object-cover mb-2 ${theme.cardText}/50`} />
                                        <p className={`font-semibold ${theme.cardText}/50`}>Waiting...</p>
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
                                    className={`w-full py-3 px-6 rounded-xl text-lg font-semibold ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} transition-all duration-300 shadow-lg`}
                                >
                                    {loading ? <LoadingSpinner size="sm" color="white" /> : 'I\'m Ready!'}
                                </button>
                            )}
                            {!showReadyButton && isRoomFull && currentPlayerStatus === 'ready' && (
                                <p className={`${theme.infoColor} mt-4 text-lg font-semibold`}>Waiting for game to start...</p>
                            )}
                            {!showReadyButton && !isRoomFull && (
                                <p className={`${theme.cardText} mt-4 text-lg font-semibold`}>Waiting for more players to join...</p>
                            )}


                            <button
                                onClick={handleLeaveRoom}
                                className={`w-full py-3 px-6 rounded-xl text-lg font-semibold bg-red-600 hover:bg-red-700 ${theme.buttonText} transition-all duration-300 shadow-lg mt-4`}
                            >
                                Leave Room
                            </button>
                        </>
                    )}

                    {/* Game Started (Briefly shown before redirect, when not showing battle animation) */}
                    {gameStarted && !gameEnded && !showBattleAnimation && ( // Added !showBattleAnimation
                        <div className="flex flex-col items-center justify-center">
                            <h2 className={`text-4xl font-extrabold mb-4 ${theme.highlight}`}>Game in Progress!</h2>
                            <div className={`flex items-center space-x-2 text-2xl font-bold mb-6 ${theme.infoColor}`}>
                                <IoTimerOutline /> <span>Time Left: {formatTime(timeLeft)}</span>
                            </div>
                            {currentProblem && (
                                <div className={`${theme.background}/50 p-6 rounded-lg mb-6 w-full max-w-lg`}>
                                    <h3 className={`text-3xl font-bold mb-3 ${theme.text}`}>Current Problem:</h3>
                                    <p className={`text-xl font-semibold ${theme.highlightSecondary}`}>{currentProblem.title}</p>
                                    <p className={`${theme.cardText}`}>Difficulty: {currentProblem.difficulty}</p>
                                </div>
                            )}
                            <p className={`${theme.cardText} mb-8`}>Redirecting you to the coding environment...</p>
                            <LoadingSpinner size="lg" color={theme.primary.split('-')[1]} />
                        </div>
                    )}

                    {/* Game Ended State */}
                    {gameEnded && (
                        <div className="flex flex-col items-center justify-center">
                            <h2 className={`text-4xl font-extrabold mb-4 ${theme.highlight}`}>Game Over!</h2>
                            <p className={`text-lg ${theme.cardText} mb-6`}>Reason: {gameResults?.reason || 'Unknown'}</p>

                            {gameResults?.winner && (
                                <div className={`${theme.background}/50 p-6 rounded-lg mb-6 w-full max-w-md border ${theme.border}`}>
                                    <h3 className={`text-3xl font-bold mb-3 ${theme.successColor}`}>Winner!</h3>
                                    <div className="flex flex-col items-center">
                                        <img
                                            src={gameResults.winner.avatar || '/default-avatar.png'}
                                            alt={gameResults.winner.firstName}
                                            className="w-20 h-20 rounded-full object-cover mb-2 border-4 border-yellow-400"
                                        />
                                        <p className={`text-2xl font-semibold ${theme.text}`}>{gameResults.winner.firstName}</p>
                                        {/* Display ELO or other stats if available in gameResults for winner */}
                                        <p className={`${theme.cardText}`}>Solved first in {formatTime(gameResults.solvedOrder.find(p => p.userId._id === gameResults.winner._id)?.timeTaken || 0)}</p>
                                    </div>
                                </div>
                            )}

                            <h3 className={`text-2xl font-bold mb-4 ${theme.text}`}>Leaderboard</h3>
                            <div className="w-full max-w-xl mx-auto">
                                {gameResults?.solvedOrder?.length > 0 ? (
                                    <ol className="list-decimal list-inside space-y-3">
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
                                                    <p className={`${theme.cardText} text-sm flex items-center justify-end`}>
                                                        ELO: {entry.eloBeforeGame} <span className={`${eloChangeColor} ml-1`}>({eloChangeSign}{entry.eloChange})</span> = {entry.eloAfterGame} {eloChangeIcon}
                                                    </p>
                                                );
                                            }

                                            return (
                                                <li key={entry.userId._id} className={`${theme.background}/50 p-4 rounded-lg flex items-center justify-between border ${theme.border}`}>
                                                    <div className="flex items-center space-x-3">
                                                        <span className={`text-lg font-bold ${playerIsWinner ? theme.successColor : theme.infoColor}`}>
                                                            {index + 1}.
                                                        </span>
                                                        <img
                                                            src={entry.userId.avatar || '/default-avatar.png'}
                                                            alt={entry.userId.firstName}
                                                            className="w-10 h-10 rounded-full object-cover border-2"
                                                        />
                                                        <p className={`font-semibold ${theme.text}`}>
                                                            {entry.userId.firstName} {entry.userId.lastName}
                                                            {playerIsWinner && <FaCrown className="inline-block ml-2 text-yellow-400" title="Winner!" />}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        {solvedAnyProblems ? (
                                                            <>
                                                                <p className={`${theme.highlightSecondary} font-bold`}>{entry.problemsSolvedCount} problem{entry.problemsSolvedCount !== 1 ? 's' : ''} solved</p>
                                                                <p className={`${theme.cardText} text-sm`}>Time: {formatTime(entry.timeTaken)}</p>
                                                            </>
                                                        ) : (
                                                            <p className={`${theme.errorColor} font-bold`}>Not Completed</p>
                                                        )}
                                                        {eloDisplay}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                ) : (
                                    <p className={`${theme.cardText}`}>No problems were solved in this game.</p>
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/game')}
                                className={`mt-8 px-6 py-3 rounded-xl text-lg font-semibold ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} transition-all duration-300 shadow-lg`}
                            >
                                Play Again!
                            </button>
                            <button
                                onClick={handleLeaveRoom}
                                className={`w-full py-3 px-6 rounded-xl text-lg font-semibold bg-red-600 hover:bg-red-700 ${theme.buttonText} transition-all duration-300 shadow-lg mt-4`}
                            >
                                Back to Lobby
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                /* Your existing CSS animations */
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

export default GameRoomDetailsPage;