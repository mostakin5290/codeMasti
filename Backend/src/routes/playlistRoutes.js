// routes/playlistRoutes.js
const express = require('express');
const userMiddleware = require('../middleware/userMiddleware')
const {
    checkPremium,
    createPlaylist,
    getPlaylistsByUserId,
    getPlaylistById,
    addProblemToPlaylist,
    removeProblemFromPlaylist,
    updatePlaylist,
    deletePlaylist
} = require('../controllers/playlistController');

const playlistRouter = express.Router();

// All playlist routes should be protected to ensure a user is logged in
playlistRouter.use(userMiddleware);

// Premium specific routes - these require the user to be premium
playlistRouter.post('/', checkPremium, createPlaylist); // Create playlist
playlistRouter.put('/:id', checkPremium, updatePlaylist); // Update playlist by ID
playlistRouter.delete('/:id', checkPremium, deletePlaylist); // Delete playlist by ID
playlistRouter.post('/:playlistId/add/:problemId', checkPremium, addProblemToPlaylist); // Add problem to playlist
playlistRouter.delete('/:playlistId/remove/:problemId', checkPremium, removeProblemFromPlaylist); // Remove problem from playlist

// General access routes for logged-in users (don't need additional checkPremium as they are read-only)
playlistRouter.get('/my', getPlaylistsByUserId); // Get all playlists of the current user
playlistRouter.get('/:id', getPlaylistById); // Get a specific playlist by ID

module.exports = playlistRouter;