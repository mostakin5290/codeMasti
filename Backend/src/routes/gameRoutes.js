
const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const {
    findRandomOpponent,
    createGameRoom,
    joinGameRoom,
    getGameRoomDetails,
    getMyActiveGameRoom 
} = require('../controllers/gameController');

const router = express.Router();

const attachIo = (req, res, next) => {
    req.io = req.app.get('socketio');
    next();
};

// Existing Routes
router.post('/find-opponent', userMiddleware, attachIo, findRandomOpponent);
router.post('/create-room', userMiddleware, attachIo, createGameRoom);
router.post('/join-room', userMiddleware, attachIo, joinGameRoom);
router.get('/room/:roomId', userMiddleware, getGameRoomDetails);

// --CHECKING ACTIVE GAME
router.get('/my-active-room', userMiddleware, getMyActiveGameRoom); // <-- ADD THIS LINE

module.exports = router;