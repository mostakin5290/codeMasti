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

playlistRouter.use(userMiddleware);

playlistRouter.post('/', checkPremium, createPlaylist); 
playlistRouter.put('/:id', checkPremium, updatePlaylist); 
playlistRouter.delete('/:id', checkPremium, deletePlaylist); 
playlistRouter.post('/:playlistId/add/:problemId', checkPremium, addProblemToPlaylist); 
playlistRouter.delete('/:playlistId/remove/:problemId', checkPremium, removeProblemFromPlaylist); 


playlistRouter.get('/my', getPlaylistsByUserId); 
playlistRouter.get('/:id', getPlaylistById); 

module.exports = playlistRouter;