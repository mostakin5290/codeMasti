import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

import { FaShareAlt, FaUserCircle } from 'react-icons/fa'; // Import necessary icons for player slots

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
    accent: 'bg-cyan-500', // Added for consistency
};

const GameWaitingRoom = ({ roomInfo, socket, loading }) => {
    const navigate = useNavigate();
    const { theme: appThemeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...appThemeFromContext };
    const { user } = useSelector((state) => state.auth);

    // Classes for main content sections, consistent with ProblemPage example
    const sectionClasses = `backdrop-blur-xl border ${theme.border}/20 shadow-xl rounded-2xl`;
    
    // Helper for dynamic accent colors, similar to ProblemPage
    const getAccentColorBase = () => {
        const accentColorClass = theme.accent || theme.buttonPrimary;
        const match = accentColorClass.match(/bg-(\w+)-\d+/);
        return match ? match[1] : 'blue';
    };

    if (!roomInfo) {
        // This case should ideally be handled by GameRoomDetailsPage or a routing guard
        // but adding a simple fallback to prevent errors
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme.background} ${theme.text}`}>
                <p>No room data provided. Redirecting...</p>
            </div>
        );
    }

    const handleReady = () => {
        if (socket && user) {
            socket.emit('playerReady', { roomId: roomInfo.roomId, userId: user._id });
        } else {
            toast.error("Socket not connected or user not authenticated. Please refresh.");
        }
    };

    const isCurrentUserReady = roomInfo.players.some(p => p.userId._id === user._id && p.status === 'ready');
    const roomShareLink = `${window.location.origin}/game/room/${roomInfo.roomId}`; // Direct link to share

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomInfo.roomId);
        toast.info("Room ID copied to clipboard!");
    };

    const copyShareLink = () => {
        navigator.clipboard.writeText(roomShareLink);
        toast.info("Share link copied to clipboard!");
    };

    return (
        <div className={`min-h-screen relative overflow-hidden ${theme.text} bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo}`}>
            {/* Animated Background Elements - using similar pattern as ProblemPage */}
            <div className={`absolute top-0 left-0 w-80 h-80 ${theme.primary.replace('bg-', 'bg-')}/5 rounded-full blur-3xl translate-x-[-20%] translate-y-[-20%] animate-blob`}></div>
            <div className={`absolute bottom-0 right-0 w-96 h-96 ${theme.secondary.replace('bg-', 'bg-')}/5 rounded-full blur-3xl translate-x-[20%] translate-y-[20%] animate-blob animation-delay-2000`}></div>
            <div className={`absolute top-1/2 left-1/2 w-60 h-60 ${theme.highlight.replace('text-', 'bg-')}/5 rounded-full blur-3xl -translate-x-1/2 -translate-x-1/2 animate-blob animation-delay-4000`}></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className={`${sectionClasses} p-8 text-center`}>
                    <h2 className={`text-4xl font-extrabold mb-4 ${theme.highlight}`}>Waiting Room: {roomInfo.roomId}</h2>
                    <p className={`text-lg ${theme.cardText} mb-6`}>
                        Game Mode: {roomInfo.gameMode.toUpperCase()} | Difficulty: <span className={`font-semibold ${theme.highlightSecondary}`}>{roomInfo.difficulty.toUpperCase()}</span> | Time Limit: {roomInfo.timeLimit} minutes
                    </p>

                    <div className={`${theme.cardBg}/50 p-4 rounded-lg mb-6 border ${theme.border}/50`}>
                        <p className={`${theme.cardText} mb-3 flex items-center justify-center`}>
                            <FaShareAlt className="mr-2" /> Share this link with your friend:
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                            <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/game/room/${roomInfo.roomId}`}
                                className={`flex-grow p-2 rounded-md ${theme.background} ${theme.text} border ${theme.border} text-sm focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500/50 focus:border-transparent transition-all duration-300 shadow-inner`}
                            />
                            <button
                                onClick={copyShareLink}
                                className={`px-4 py-2 rounded-md ${theme.secondary} ${theme.buttonText} hover:${theme.secondaryHover} transition-colors shadow-md hover:shadow-lg`}
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <h3 className={`text-2xl font-bold mb-4 ${theme.text}`}>Players in Room ({roomInfo.players.length}/{roomInfo.maxPlayers})</h3>
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        {roomInfo.players.map(player => (
                            <div key={player.userId._id} className={`${theme.cardBg}/50 p-4 rounded-lg flex flex-col items-center w-36 border ${theme.border}/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
                                <img
                                    src={player.userId.avatar || '/default-avatar.png'}
                                    alt={player.userId.firstName}
                                    className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-transparent"
                                />
                                <p className={`font-semibold ${theme.text}`}>{player.userId.firstName}</p>
                                <p className={`text-xs ${theme.cardText}`}>{player.isCreator ? 'Host' : 'Player'}</p>
                                <span className={`mt-2 text-xs font-medium px-2 py-1 rounded-full ${player.status === 'ready' ? theme.successColor.replace('text-', 'bg-') + '/20' : theme.warningColor.replace('text-', 'bg-') + '/20'} ${player.status === 'ready' ? theme.successColor : theme.warningColor}`}>
                                    {player.status === 'ready' ? 'Ready' : 'Waiting...'}
                                </span>
                            </div>
                        ))}
                        {Array.from({ length: roomInfo.maxPlayers - roomInfo.players.length }).map((_, index) => (
                            <div key={`empty-${index}`} className={`${theme.cardBg}/50 p-4 rounded-lg flex flex-col items-center w-36 border ${theme.border}/50 border-dashed opacity-60`}>
                                <FaUserCircle className={`w-16 h-16 rounded-full object-cover mb-2 ${theme.cardText}/50`} />
                                <p className={`font-semibold ${theme.cardText}/50`}>Waiting...</p>
                                <p className={`text-xs ${theme.cardText}/50`}>Empty Slot</p>
                                <span className={`mt-2 text-xs font-medium px-2 py-1 rounded-full ${theme.cardText}/10 ${theme.cardText}/50`}>
                                    Empty
                                </span>
                            </div>
                        ))}
                    </div>

                    {roomInfo.players.length === roomInfo.maxPlayers ? (
                        <p className={`text-lg font-semibold ${theme.successColor} mb-4 animate-pulse`}>Room is full! Game is ready to start.</p>
                    ) : (
                        <p className={`text-lg font-semibold ${theme.highlightSecondary} mb-4`}>Waiting for {roomInfo.maxPlayers - roomInfo.players.length} more player(s)...</p>
                    )}

                    <button
                        onClick={handleReady}
                        disabled={isCurrentUserReady || loading || !socket || !socket.connected}
                        className={`w-full py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-300 ${isCurrentUserReady ? `bg-emerald-700 text-white cursor-not-allowed opacity-70` : `${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} shadow-lg hover:shadow-${getAccentColorBase()}-500/25`}`}
                    >
                        {isCurrentUserReady ? 'Ready!' : 'I\'m Ready!'}
                    </button>
                    <button
                        onClick={() => {
                            if (socket && user) {
                                socket.emit('leaveGameRoom', { roomId: roomInfo.roomId, userId: user._id }); // Emit leave event
                            }
                            // Navigation will be handled by roomDeleted/playerLeftRoom socket events in GameRoomDetailsPage
                            // For immediate feedback, you might navigate client-side first
                            navigate('/game');
                            toast.info("You left the waiting room.");
                        }}
                        className={`mt-4 w-full py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-300 bg-red-600 hover:bg-red-700 text-white shadow-lg`}
                    >
                        Leave Room
                    </button>
                </div>
            </div>

            {/* Global CSS for animations (re-added as part of the component for style jsx) */}
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

                /* Battle Animation Specific CSS (if any, though not strictly needed here) */
                /* @keyframes fade-in-fast etc. */
            `}</style>
        </div>
    );
};

export default GameWaitingRoom;