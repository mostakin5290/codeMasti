// pages/PlaylistDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
// Corrected import path for UpdatePlaylistModal
import UpdatePlaylistModal from '../components/Playlist/UpdatePlaylistModal'; 
import { toast } from 'react-toastify';

// NEW: Import ConfirmationModal
import ConfirmationModal from '../components/common/ConfirmationModal';

import {
    FaFolderOpen, FaEdit, FaTrash, FaArrowLeft, FaLock, // For general playlist
    FaCheck, FaPen, FaStar, FaTimesCircle, FaPlus, // For problems within playlist
    FaQuestionCircle // For empty states or general info
} from 'react-icons/fa';

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonPrimary: 'bg-indigo-600', buttonPrimaryHover: 'bg-indigo-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
    accent: 'bg-cyan-500',
};

const PlaylistPage = () => {
    const { playlistId } = useParams(); // Get playlist ID from URL
    const navigate = useNavigate(); // For redirection after delete
    const { user } = useSelector((state) => state.auth);

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUpdatePlaylistModal, setShowUpdatePlaylistModal] = useState(false);

    // NEW: Confirmation Modal States
    const [showConfirmDeletePlaylistModal, setShowConfirmDeletePlaylistModal] = useState(false);
    const [showConfirmRemoveProblemModal, setShowConfirmRemoveProblemModal] = useState(false);
    const [problemToRemoveId, setProblemToRemoveId] = useState(null);
    const [isConfirmingAction, setIsConfirmingAction] = useState(false); // Shared loading state for both confirmation modals


    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };

    const getAccentColorBase = () => {
        const accentColorClass = theme.accent || theme.buttonPrimary;
        const match = accentColorClass.match(/bg-(\w+)-\d+/);
        return match ? match[1] : 'blue';
    };

    const sectionClasses = `backdrop-blur-xl border ${theme.border}/20 shadow-xl rounded-xl`;

    // Fetch Playlist details
    const fetchPlaylist = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // FIX: Correct API endpoint path
            const { data } = await axiosClient.get(`/playlist/${playlistId}`);
            setPlaylist(data);
        } catch (err) {
            console.error('Error fetching playlist:', err);
            setError(err.response?.data?.message || 'Failed to load playlist.');
            setPlaylist(null); // Clear playlist data on error
            if (err.response?.status === 403 || err.response?.status === 404) {
                toast.error(err.response?.data?.message || 'Playlist not found or you do not have permission to view it.');
                // Redirect after a short delay if it's an access error
                setTimeout(() => navigate('/problems'), 2000);
            }
        } finally {
            setLoading(false);
        }
    }, [playlistId, navigate]);

    useEffect(() => {
        fetchPlaylist();
    }, [fetchPlaylist]);

    // Handlers for playlist management
    const handleUpdatePlaylist = async (id, { name, description }) => {
        try {
            // FIX: Correct API endpoint path
            await axiosClient.put(`/playlist/${id}`, { name, description });
            toast.success('Playlist updated successfully!');
            fetchPlaylist(); // Re-fetch the updated playlist details
            return true;
        } catch (err) {
            console.error('Error updating playlist:', err);
            throw err.response?.data?.message ? new Error(err.response.data.message) : new Error('Failed to update playlist');
        }
    };

    // NEW: Function to trigger playlist deletion confirmation modal
    const handleDeletePlaylistClick = () => {
        setShowConfirmDeletePlaylistModal(true);
    };

    // NEW: Function to execute playlist deletion after confirmation
    const confirmDeletePlaylist = async () => {
        setIsConfirmingAction(true); // Set loading state for the confirmation modal button
        try {
            // FIX: Correct API endpoint path
            await axiosClient.delete(`/playlist/${playlistId}`);
            toast.success('Playlist deleted successfully!');
            setShowConfirmDeletePlaylistModal(false); // Close the modal
            navigate('/problems'); // Redirect back to problems page after deletion
        } catch (err) {
            console.error('Error deleting playlist:', err);
            toast.error(err.response?.data?.message || 'Failed to delete playlist.');
        } finally {
            setIsConfirmingAction(false); // Reset loading state
        }
    };

    // NEW: Function to trigger problem removal confirmation modal
    const handleRemoveProblemClick = (problemId) => {
        setProblemToRemoveId(problemId);
        setShowConfirmRemoveProblemModal(true);
    };

    // NEW: Function to execute problem removal after confirmation
    const confirmRemoveProblem = async () => {
        setIsConfirmingAction(true); // Set loading state for the confirmation modal button
        try {
            // FIX: Correct API endpoint path
            await axiosClient.delete(`/playlist/${playlistId}/remove/${problemToRemoveId}`);
            toast.success('Problem removed from playlist!');
            setShowConfirmRemoveProblemModal(false); // Close the modal
            setProblemToRemoveId(null); // Clear the ID
            // Optimistically update UI (remove problem from current playlist state)
            setPlaylist(prev => ({
                ...prev,
                problems: prev.problems.filter(p => p._id !== problemToRemoveId)
            }));
        } catch (err) {
            console.error('Error removing problem from playlist:', err);
            toast.error(err.response?.data?.message || 'Failed to remove problem.');
        } finally {
            setIsConfirmingAction(false); // Reset loading state
        }
    };

    // Helper functions for UI
    const difficultyPill = (difficulty) => {
        const colors = {
            easy: `${theme.iconBg} ${theme.highlightSecondary} border ${theme.highlightSecondary.replace('text-', 'border-')}/40`,
            medium: `${theme.iconBg} ${theme.highlightTertiary} border ${theme.highlightTertiary.replace('text-', 'border-')}/40`,
            hard: `${theme.iconBg} ${theme.highlight} border ${theme.highlight.replace('text-', 'border-')}/40`,
        };
        const defaultColor = `bg-gray-700 text-gray-300 border border-gray-600`;

        return (
            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${colors[difficulty?.toLowerCase()] || defaultColor}`}>
                {capitalizeFirstLetter(difficulty || 'Unknown')}
            </span>
        );
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex flex-col ${theme.background}`}>
                <Header />
                <div className="flex-1 flex justify-center items-center">
                    <LoadingSpinner message="Loading playlist..." size="lg" appTheme={theme} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex flex-col ${theme.background}`}>
                <Header />
                <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
                    <FaTimesCircle className={`w-20 h-20 mb-6 ${theme.errorColor}`} />
                    <h1 className={`text-3xl font-bold ${theme.errorColor} mb-4`}>Error</h1>
                    <p className={`${theme.cardText} text-lg mb-6`}>{error}</p>
                    <Link
                        to="/problems"
                        className={`inline-flex items-center px-6 py-3 ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} rounded-lg transition-all duration-200 font-medium`}
                    >
                        <FaArrowLeft className="mr-2" /> Back to Problems
                    </Link>
                </div>
            </div>
        );
    }

    if (!playlist) { // Should be caught by error handling, but a final fallback
        return (
            <div className={`min-h-screen flex flex-col ${theme.background}`}>
                <Header />
                <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
                    <FaQuestionCircle className={`w-20 h-20 mb-6 ${theme.cardText}`} />
                    <h1 className={`text-3xl font-bold ${theme.text} mb-4`}>Playlist Not Found</h1>
                    <p className={`${theme.cardText} text-lg mb-6`}>The playlist you are looking for does not exist.</p>
                    <Link
                        to="/problems"
                        className={`inline-flex items-center px-6 py-3 ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} rounded-lg transition-all duration-200 font-medium`}
                    >
                        <FaArrowLeft className="mr-2" /> Back to Problems
                    </Link>
                </div>
            </div>
        );
    }

    // Check if the current user is the owner of the playlist
    // FIX: Compare user._id with playlist.userId._id (if populated) or playlist.userId (if not populated string)
    const isPlaylistOwner = user && playlist.userId && (user._id === (playlist.userId._id || playlist.userId));
    // Check if the user is premium (required for any management actions)
    const isPremiumUser = user?.isPremium;

    return (
        <div className={`min-h-screen relative overflow-hidden ${theme.text} bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo}`}>
            {/* Background decorative elements */}
            <div className={`absolute top-0 left-0 w-80 h-80 ${theme.primary.replace('bg-', 'bg-')}/5 rounded-full blur-3xl translate-x-[-20%] translate-y-[-20%] animate-blob`}></div>
            <div className={`absolute bottom-0 right-0 w-96 h-96 ${theme.secondary.replace('bg-', 'bg-')}/5 rounded-full blur-3xl translate-x-[20%] translate-y-[20%] animate-blob animation-delay-2000`}></div>
            <div className={`absolute top-1/2 left-1/2 w-60 h-60 ${theme.highlight.replace('text-', 'bg-')}/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000`}></div>

            <Header />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/problems"
                        className={`inline-flex items-center px-4 py-2 ${theme.cardBg}/50 border ${theme.border}/50 ${theme.text} rounded-lg hover:${theme.cardBg}/80 hover:${theme.highlight} transition-all duration-200 font-medium shadow-md hover:shadow-lg`}
                    >
                        <FaArrowLeft className="mr-2" /> Back to Problems
                    </Link>
                    <h1 className={`text-4xl font-bold bg-gradient-to-r ${theme.primary} ${theme.highlight} bg-clip-text`}>
                        {playlist.name}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Playlist Details & Actions Card */}
                    <div className={`lg:col-span-1 ${sectionClasses} p-6`}>
                        <div className="flex items-center mb-4 gap-2">
                            <FaFolderOpen className={`h-6 w-6 ${theme.highlight}`} />
                            <h2 className={`text-xl font-bold ${theme.text}`}>Playlist Details</h2>
                            {isPlaylistOwner && !isPremiumUser && (
                                <FaStar className={`ml-auto h-5 w-5 ${theme.warningColor}`} title="Premium needed to manage" />
                            )}
                        </div>
                        <p className={`${theme.cardText} text-sm mb-4`}>
                            {playlist.description || 'No description provided.'}
                        </p>
                        <p className={`${theme.cardText} text-sm mb-2`}>
                            Total Problems: <span className={`${theme.text} font-semibold`}>{playlist.problems.length}</span>
                        </p>
                        <p className={`${theme.cardText} text-sm mb-4`}>
                            Created On: <span className={`${theme.text} font-semibold`}>{new Date(playlist.createdAt).toLocaleDateString()}</span>
                        </p>

                        {/* Management Buttons */}
                        {isPlaylistOwner && isPremiumUser ? (
                            <div className="flex flex-col gap-3 mt-6">
                                <button
                                    onClick={() => setShowUpdatePlaylistModal(true)}
                                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} rounded-lg font-semibold transition-all duration-200 shadow-md`}
                                >
                                    <FaEdit className="w-4 h-4" /> Edit Playlist
                                </button>
                                <button
                                    // Call the new trigger function for deletion
                                    onClick={handleDeletePlaylistClick}
                                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 ${theme.errorColor.replace('text-', 'bg-')}/20 ${theme.errorColor} rounded-lg font-semibold hover:${theme.errorColor.replace('text-', 'bg-')}/30 transition-all duration-200 shadow-md`}
                                >
                                    <FaTrash className="w-4 h-4" /> Delete Playlist
                                </button>
                            </div>
                        ) : (
                            user && ( // Only show "Go Premium" if user is logged in but not premium
                                <div className="text-center py-6 mt-4">
                                    <FaStar className={`w-12 h-12 mx-auto mb-4 ${theme.warningColor}`} />
                                    <p className={`${theme.cardText} mb-4`}>Unlock playlist management features by going Premium!</p>
                                    <Link
                                        to="/go-premium" // Link to your premium upgrade page
                                        className={`inline-flex items-center px-6 py-3 ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500 focus:ring-opacity-50`}
                                    >
                                        Go Premium
                                    </Link>
                                </div>
                            )
                        )}
                    </div>

                    {/* Problems in Playlist List */}
                    <div className={`lg:col-span-2 ${sectionClasses} p-6`}>
                        <h2 className={`text-xl font-bold ${theme.text} mb-4 flex items-center gap-2`}>
                            <FaQuestionCircle className={`h-6 w-6 ${theme.highlightSecondary}`} />
                            Problems ({playlist.problems.length})
                        </h2>

                        {playlist.problems.length > 0 ? (
                            <div className="space-y-3">
                                {playlist.problems.map(problem => (
                                    <div
                                        key={problem._id}
                                        className={`flex items-center justify-between px-4 py-3 ${theme.cardBg}/50 hover:${theme.cardBg}/80 rounded-lg border ${theme.border}/50 transition-colors duration-200 shadow-sm hover:shadow-md`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Link
                                                to={`/codefield/${problem._id}`}
                                                className={`${theme.text} hover:${theme.highlightSecondary} font-medium truncate`}
                                            >
                                                {problem.title}
                                            </Link>
                                            {problem.premium && <FaLock className={`h-4 w-4 ${theme.warningColor}`} title="Premium Problem" />}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {difficultyPill(problem.difficulty)}
                                            {isPlaylistOwner && isPremiumUser && (
                                                <button
                                                    // Call the new trigger function for problem removal
                                                    onClick={() => handleRemoveProblemClick(problem._id)}
                                                    className={`p-2 rounded-lg ${theme.errorColor.replace('text-', 'bg-')}/20 ${theme.errorColor} hover:${theme.errorColor.replace('text-', 'bg-')}/30 transition-all duration-200`}
                                                    title="Remove from playlist"
                                                >
                                                    <FaTimesCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FaPlus className={`w-16 h-16 mx-auto mb-4 ${theme.cardText}/40`} />
                                <p className={`${theme.cardText} text-lg font-medium mb-2`}>No problems in this playlist yet.</p>
                                {isPlaylistOwner && isPremiumUser ? (
                                    <p className={`${theme.cardText} text-sm`}>Go to the <Link to="/problems" className={`${theme.highlight} hover:${theme.highlightSecondary} underline`}>problems page</Link> to add problems.</p>
                                ) : (
                                    <p className={`${theme.cardText} text-sm`}>Problems will appear here once added.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <UpdatePlaylistModal
                isOpen={showUpdatePlaylistModal}
                onClose={() => setShowUpdatePlaylistModal(false)}
                playlist={playlist} // Pass the current playlist to the modal for pre-population
                onUpdate={handleUpdatePlaylist}
                appTheme={theme}
            />

            {/* NEW: Confirmation Modal for Delete Playlist */}
            <ConfirmationModal
                isOpen={showConfirmDeletePlaylistModal}
                onClose={() => setShowConfirmDeletePlaylistModal(false)}
                onConfirm={confirmDeletePlaylist}
                title="Confirm Playlist Deletion"
                confirmText="Delete Playlist"
                cancelText="Cancel"
                isLoading={isConfirmingAction} // Use a shared loading state for both confirmation modals
                appTheme={theme}
            >
                <p>Are you sure you want to delete the playlist "<strong>{playlist?.name}</strong>"? This action cannot be undone, and all problems in this playlist will be removed from it.</p>
            </ConfirmationModal>

            {/* NEW: Confirmation Modal for Remove Problem from Playlist */}
            <ConfirmationModal
                isOpen={showConfirmRemoveProblemModal}
                onClose={() => setShowConfirmRemoveProblemModal(false)}
                onConfirm={confirmRemoveProblem}
                title="Confirm Problem Removal"
                confirmText="Remove Problem"
                cancelText="Cancel"
                isLoading={isConfirmingAction}
                appTheme={theme}
            >
                <p>Are you sure you want to remove this problem from the playlist?</p>
            </ConfirmationModal>
        </div>
    );
};

export default PlaylistPage;