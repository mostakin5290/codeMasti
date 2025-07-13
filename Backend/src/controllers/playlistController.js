// controllers/playlistController.js
const Playlist = require('../models/playlist');
const Problem = require('../models/problem');

// Middleware to check if the user is premium
const checkPremium = (req, res, next) => {
    // req.user is populated by your 'protect' auth middleware
    if (!req.user || !req.user.isPremium) {
        return res.status(403).json({ message: 'Access Denied: Only premium users can perform this action.' });
    }
    next();
};

// @desc    Create a new playlist
// @route   POST /api/playlist
// @access  Private (Premium Only)
const createPlaylist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user._id; // User ID from authenticated session

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Playlist name is required.' });
        }

        const newPlaylist = await Playlist.create({
            name,
            description,
            userId,
            problems: [] // New playlists start empty
        });

        res.status(201).json({ message: 'Playlist created successfully', playlist: newPlaylist });

    } catch (error) {
        console.error('Error creating playlist:', error);
        // Handle unique name constraint error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name && error.keyPattern.userId) {
            return res.status(409).json({ message: 'You already have a playlist with this name. Please choose a different one.' });
        }
        res.status(500).json({ message: 'Failed to create playlist', error: error.message });
    }
};

// @desc    Get all playlists for the authenticated user
// @route   GET /api/playlist/my
// @access  Private
const getPlaylistsByUserId = async (req, res) => {
    try {
        const userId = req.user._id;
        // Populate problems to get their titles and difficulties, but limit fields for performance
        const playlists = await Playlist.find({ userId })
            .populate('problems', 'title difficulty tags') // Add 'tags' if needed on frontend playlist view
            .sort({ createdAt: -1 }); // Sort by most recently created

        res.status(200).json(playlists);

    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ message: 'Failed to fetch playlists', error: error.message });
    }
};

// @desc    Get a single playlist by ID
// @route   GET /api/playlist/:id
// @access  Private (Owner or Public if implemented)
const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params; // Playlist ID
        const userId = req.user._id;

        const playlist = await Playlist.findById(id)
            .populate('problems', 'title difficulty tags');

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found.' });
        }

        // Only allow access if user owns the playlist or if it's public (if 'isPublic' is used)
        if (!playlist.userId.equals(userId) && !playlist.isPublic) {
            return res.status(403).json({ message: 'Access Denied: You do not have permission to view this playlist.' });
        }

        res.status(200).json(playlist);

    } catch (error) {
        console.error('Error fetching playlist by ID:', error);
        res.status(500).json({ message: 'Failed to fetch playlist', error: error.message });
    }
};

// @desc    Add a problem to a playlist
// @route   POST /api/playlist/:playlistId/add/:problemId
// @access  Private (Premium Only)
const addProblemToPlaylist = async (req, res) => {
    try {
        const { playlistId, problemId } = req.params;
        const userId = req.user._id;

        // Find the playlist and ensure it belongs to the authenticated user
        const playlist = await Playlist.findOne({ _id: playlistId, userId });
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or you do not own it.' });
        }

        // Validate problemId exists
        const problemExists = await Problem.findById(problemId);
        if (!problemExists) {
            return res.status(404).json({ message: 'Problem not found.' });
        }

        // Use $addToSet to add problemId to the problems array, which automatically prevents duplicates
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $addToSet: { problems: problemId } },
            { new: true } // Return the updated document
        );

        res.status(200).json({ message: 'Problem added to playlist successfully', playlist: updatedPlaylist });

    } catch (error) {
        console.error('Error adding problem to playlist:', error);
        res.status(500).json({ message: 'Failed to add problem to playlist', error: error.message });
    }
};

// @desc    Remove a problem from a playlist
// @route   DELETE /api/playlist/:playlistId/remove/:problemId
// @access  Private (Premium Only)
const removeProblemFromPlaylist = async (req, res) => {
    try {
        const { playlistId, problemId } = req.params;
        const userId = req.user._id;

        const playlist = await Playlist.findOne({ _id: playlistId, userId });
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or you do not own it.' });
        }

        // Use $pull to remove problemId from the problems array
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $pull: { problems: problemId } },
            { new: true }
        );

        res.status(200).json({ message: 'Problem removed from playlist successfully', playlist: updatedPlaylist });

    } catch (error) {
        console.error('Error removing problem from playlist:', error);
        res.status(500).json({ message: 'Failed to remove problem from playlist', error: error.message });
    }
};

// @desc    Update a playlist's name or description
// @route   PUT /api/playlist/:id
// @access  Private (Premium Only)
const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params; // playlist ID
        const { name, description, isPublic } = req.body; // Allow updating isPublic as well
        const userId = req.user._id;

        const playlist = await Playlist.findOne({ _id: id, userId });
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or you do not own it.' });
        }

        if (name !== undefined) playlist.name = name.trim(); // Ensure trim for updates too
        if (description !== undefined) playlist.description = description;
        if (isPublic !== undefined) playlist.isPublic = isPublic;

        await playlist.save(); // Use .save() to trigger schema validation if needed

        res.status(200).json({ message: 'Playlist updated successfully', playlist });

    } catch (error) {
        console.error('Error updating playlist:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name && error.keyPattern.userId) {
            return res.status(409).json({ message: 'You already have a playlist with this name. Please choose a different one.' });
        }
        res.status(500).json({ message: 'Failed to update playlist', error: error.message });
    }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlist/:id
// @access  Private (Premium Only)
const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params; // playlist ID
        const userId = req.user._id;

        // Find and delete the playlist, ensuring it belongs to the authenticated user
        const deletedPlaylist = await Playlist.findOneAndDelete({ _id: id, userId });

        if (!deletedPlaylist) {
            return res.status(404).json({ message: 'Playlist not found or you do not own it.' });
        }

        res.status(200).json({ message: 'Playlist deleted successfully', playlist: deletedPlaylist });

    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({ message: 'Failed to delete playlist', error: error.message });
    }
};

module.exports = {
    checkPremium,
    createPlaylist,
    getPlaylistsByUserId,
    getPlaylistById,
    addProblemToPlaylist,
    removeProblemFromPlaylist,
    updatePlaylist,
    deletePlaylist
};