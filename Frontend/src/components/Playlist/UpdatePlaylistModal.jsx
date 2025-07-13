// components/modals/UpdatePlaylistModal.jsx
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTimes } from 'react-icons/fa';

const UpdatePlaylistModal = ({ isOpen, onClose, playlist, onUpdate, appTheme }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Populate form fields when the modal opens or playlist prop changes
    useEffect(() => {
        if (isOpen && playlist) {
            setName(playlist.name);
            setDescription(playlist.description);
            setLoading(false);
            setError(null);
        }
    }, [isOpen, playlist]);

    if (!isOpen || !playlist) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onUpdate(playlist._id, { name, description });
            onClose(); // Close modal on success
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper for applying theme colors
    const getAccentColorBase = () => {
        const accentColorClass = appTheme.accent || appTheme.buttonPrimary;
        const match = accentColorClass.match(/bg-(\w+)-\d+/);
        return match ? match[1] : 'blue';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
            <div className={`${appTheme.cardBg} rounded-xl shadow-2xl p-6 w-full max-w-md border ${appTheme.border}/30`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-2xl font-bold bg-gradient-to-r ${appTheme.primary} ${appTheme.highlight} bg-clip-text`}>
                        Edit Playlist: {playlist.name}
                    </h2>
                    <button onClick={onClose} className={`${appTheme.cardText} hover:${appTheme.highlightSecondary} transition-colors`}>
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>
                {error && <p className={`${appTheme.errorColor} text-sm mb-4`}>{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="playlistName" className={`block text-sm font-medium ${appTheme.text} mb-1`}>Playlist Name</label>
                        <input
                            type="text"
                            id="playlistName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full px-4 py-2 ${appTheme.background} ${appTheme.text} rounded-lg border ${appTheme.border}/50 focus:ring-2 focus:ring-${getAccentColorBase()}-500 focus:border-transparent transition-all duration-200`}
                            placeholder="e.g., Data Structures Basics"
                            required
                            maxLength={100}
                        />
                    </div>
                    <div>
                        <label htmlFor="playlistDescription" className={`block text-sm font-medium ${appTheme.text} mb-1`}>Description (Optional)</label>
                        <textarea
                            id="playlistDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className={`w-full px-4 py-2 ${appTheme.background} ${appTheme.text} rounded-lg border ${appTheme.border}/50 focus:ring-2 focus:ring-${getAccentColorBase()}-500 focus:border-transparent transition-all duration-200 resize-none`}
                            placeholder="A brief description of this playlist..."
                            maxLength={500}
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || name.trim() === ''}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 ${appTheme.buttonPrimary} hover:${appTheme.buttonPrimaryHover} ${appTheme.buttonText} rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <FaEdit className="w-4 h-4" />
                        )}
                        Update Playlist
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePlaylistModal;