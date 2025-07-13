// components/modals/AddProblemToPlaylistModal.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaCheck, FaFolderPlus } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner'; // Assuming you have this
import { toast } from 'react-toastify'; // For notifications

const AddProblemToPlaylistModal = ({ isOpen, onClose, problem, userPlaylists, onCreatePlaylist, onAddProblem, appTheme }) => {
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper for applying theme colors
    const getAccentColorBase = () => {
        const accentColorClass = appTheme.accent || appTheme.buttonPrimary;
        const match = accentColorClass.match(/bg-(\w+)-\d+/);
        return match ? match[1] : 'blue';
    };

    // Reset state when modal opens or userPlaylists change
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setLoading(false);
            if (userPlaylists && userPlaylists.length > 0) {
                // Pre-select the first playlist if available
                setSelectedPlaylistId(userPlaylists[0]._id);
            } else {
                setSelectedPlaylistId(''); // No playlists to select
            }
        }
    }, [isOpen, userPlaylists]);

    if (!isOpen || !problem) return null; // Don't render if not open or no problem selected

    const handleAdd = async () => {
        if (!selectedPlaylistId) {
            setError('Please select a playlist or create a new one.');
            return;
        }

        const selectedPlaylist = userPlaylists.find(p => p._id === selectedPlaylistId);
        // Check if the problem is already in the selected playlist
        if (selectedPlaylist && selectedPlaylist.problems.some(p => p._id === problem._id)) {
            setError('This problem is already in the selected playlist.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await onAddProblem(selectedPlaylistId, problem._id); // Call the prop function
            onClose(); // Close modal on success
        } catch (err) {
            setError(err.message); // Error message from ProblemPage handler
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
            <div className={`${appTheme.cardBg} rounded-xl shadow-2xl p-6 w-full max-w-md border ${appTheme.border}/30`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-2xl font-bold bg-gradient-to-r ${appTheme.primary} ${appTheme.highlight} bg-clip-text`}>
                        Add '{problem.title}' to Playlist
                    </h2>
                    <button onClick={onClose} className={`${appTheme.cardText} hover:${appTheme.highlightSecondary} transition-colors`}>
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>
                {error && <p className={`${appTheme.errorColor} text-sm mb-4`}>{error}</p>}

                {userPlaylists.length === 0 ? (
                    <div className="text-center py-6">
                        <p className={`${appTheme.cardText} mb-4`}>You don't have any playlists yet.</p>
                        <button
                            // This button both triggers create playlist modal AND closes this one
                            onClick={() => { onCreatePlaylist(); onClose(); }}
                            className={`flex items-center justify-center gap-2 px-6 py-3 ${appTheme.buttonPrimary} hover:${appTheme.buttonPrimaryHover} ${appTheme.buttonText} rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500 focus:ring-opacity-50`}
                        >
                            <FaFolderPlus className="w-4 h-4" /> Create First Playlist
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="selectPlaylist" className={`block text-sm font-medium ${appTheme.text} mb-1`}>Select Playlist</label>
                            <select
                                id="selectPlaylist"
                                value={selectedPlaylistId}
                                onChange={(e) => setSelectedPlaylistId(e.target.value)}
                                className={`w-full px-4 py-2 ${appTheme.background} ${appTheme.text} rounded-lg border ${appTheme.border}/50 focus:ring-2 focus:ring-${getAccentColorBase()}-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer`}
                            >
                                {userPlaylists.map(playlist => (
                                    <option key={playlist._id} value={playlist._id}>
                                        {playlist.name} ({playlist.problems.length} problems)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleAdd}
                                disabled={loading || !selectedPlaylistId}
                                className={`flex-1 flex text-sm items-center justify-center gap-2 px-6 py-3 ${appTheme.buttonPrimary} hover:${appTheme.buttonPrimaryHover} ${appTheme.buttonText} rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <FaPlus className="w-4 h-4" />
                                )}
                                Add to Selected
                            </button>
                            <button
                                // This button both triggers create playlist modal AND closes this one
                                onClick={() => { onCreatePlaylist(); onClose(); }}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 ${appTheme.cardBg}/50 border ${appTheme.border}/50 ${appTheme.text} rounded-lg hover:${appTheme.cardBg}/80 hover:${appTheme.highlight} transition-all duration-200 font-medium shadow-md hover:shadow-lg`}
                            >
                                <FaFolderPlus className="w-4 h-4" /> Create New
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddProblemToPlaylistModal;