const Playlist = require('../models/playlist');
const Problem = require('../models/problem');

const checkPremium = (req, res, next) => {
    if (!req.user || !req.user.isPremium) {
        return res.status(403).json({ message: 'Access Denied: Only premium users can perform this action.' });
    }
    next();
};

const createPlaylist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user._id; 

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Playlist name is required.' });
        }

        const newPlaylist = await Playlist.create({
            name,
            description,
            userId,
            problems: [] 
        });

        res.status(201).json({ message: 'Playlist created successfully', playlist: newPlaylist });

    } catch (error) {
        console.error('Error creating playlist:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name && error.keyPattern.userId) {
            return res.status(409).json({ message: 'You already have a playlist with this name. Please choose a different one.' });
        }
        res.status(500).json({ message: 'Failed to create playlist', error: error.message });
    }
};

const getPlaylistsByUserId = async (req, res) => {
    try {
        const userId = req.user._id;
        const playlists = await Playlist.find({ userId })
            .populate('problems', 'title difficulty tags') 
            .sort({ createdAt: -1 }); 

        res.status(200).json(playlists);

    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ message: 'Failed to fetch playlists', error: error.message });
    }
};

const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user._id;

        const playlist = await Playlist.findById(id)
            .populate('problems', 'title difficulty tags');

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found.' });
        }

        if (!playlist.userId.equals(userId) && !playlist.isPublic) {
            return res.status(403).json({ message: 'Access Denied: You do not have permission to view this playlist.' });
        }

        res.status(200).json(playlist);

    } catch (error) {
        console.error('Error fetching playlist by ID:', error);
        res.status(500).json({ message: 'Failed to fetch playlist', error: error.message });
    }
};

const addProblemToPlaylist = async (req, res) => {
    try {
        const { playlistId, problemId } = req.params;
        const userId = req.user._id;

        const playlist = await Playlist.findOne({ _id: playlistId, userId });
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or you do not own it.' });
        }

        const problemExists = await Problem.findById(problemId);
        if (!problemExists) {
            return res.status(404).json({ message: 'Problem not found.' });
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $addToSet: { problems: problemId } },
            { new: true } 
        );

        res.status(200).json({ message: 'Problem added to playlist successfully', playlist: updatedPlaylist });

    } catch (error) {
        console.error('Error adding problem to playlist:', error);
        res.status(500).json({ message: 'Failed to add problem to playlist', error: error.message });
    }
};

const removeProblemFromPlaylist = async (req, res) => {
    try {
        const { playlistId, problemId } = req.params;
        const userId = req.user._id;

        const playlist = await Playlist.findOne({ _id: playlistId, userId });
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or you do not own it.' });
        }

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

const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params; 
        const { name, description, isPublic } = req.body; 
        const userId = req.user._id;

        const playlist = await Playlist.findOne({ _id: id, userId });
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or you do not own it.' });
        }

        if (name !== undefined) playlist.name = name.trim(); 
        if (description !== undefined) playlist.description = description;
        if (isPublic !== undefined) playlist.isPublic = isPublic;

        await playlist.save(); 

        res.status(200).json({ message: 'Playlist updated successfully', playlist });

    } catch (error) {
        console.error('Error updating playlist:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name && error.keyPattern.userId) {
            return res.status(409).json({ message: 'You already have a playlist with this name. Please choose a different one.' });
        }
        res.status(500).json({ message: 'Failed to update playlist', error: error.message });
    }
};

const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user._id;

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