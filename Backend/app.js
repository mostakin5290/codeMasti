const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const main = require('./src/config/db'); 
const cookieParser = require('cookie-parser');
const redisClient = require('./src/config/redis'); 
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

const frontendUrl = process.env.FRONTEND_URL;

const allowedOrigins = [
    frontendUrl,
    "http://localhost:5173", 
];


const keepAlive = async () => {
    try {
        await axios.get('https://keepalive404.netlify.app/.netlify/functions/keepalive');

        await axios.get(`https://codemasti.onrender.com/keep-alive`);

    } catch (err) {
        console.error('Keep-alive failed:', err.message);
    }
};

setInterval(keepAlive, 14 * 60 * 1000);


const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    },
    transports: ['polling', 'websocket'],
});

app.set('socketio', io);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            console.error('Express CORS Blocked:', msg, 'Origin:', origin);
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    exposedHeaders: ['set-cookie']
}));

// Raw body capture for webhook verification ONLY
app.use((req, res, next) => {
    if (req.originalUrl === '/payment/verify-payment') {
        let rawBody = '';
        req.setEncoding('utf8');
        req.on('data', (chunk) => { rawBody += chunk; });
        req.on('end', () => {
            req.rawBody = rawBody;
            try {
                req.body = JSON.parse(rawBody);
            } catch (e) {
                console.error('Error parsing webhook JSON:', e);
                return res.status(400).send('Invalid JSON');
            }
            next();
        });
    } else {
        next();
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const GameRoom = require('./src/models/gameRoomSchema');
const Problem = require('./src/models/problem');
const User = require('./src/models/user');
const { submitCodeInternal, runCodeInternal } = require('./src/controllers/submitControllers');
const { endGame } = require('./src/controllers/gameController');

const userRouter = require('./src/routes/userRoute');
const problemRouter = require('./src/routes/problemRoute');
const submitRoute = require('./src/routes/submitRoutes');
const discussRoute = require('./src/routes/discussRoutes');
const aiRouter = require('./src/routes/aiRoutes');
const videoRouter = require('./src/routes/videoRoute');
const imageRoutes = require('./src/routes/imageRoutes');
const payRouter = require('./src/routes/razorpayRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const contestRoute = require('./src/routes/contestRoutes');
const playlistRouter = require('./src/routes/playlistRoutes');
const premiumRouter = require('./src/routes/premiumRouter');
const gameRoutes = require('./src/routes/gameRoutes');

app.use('/user', userRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRoute);
app.use('/admin', adminRoutes);
app.use('/discuss', discussRoute);
app.use('/contests', contestRoute);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);
app.use('/images', imageRoutes);
app.use('/payment', payRouter);
app.use('/playlist', playlistRouter);
app.use('/premium', premiumRouter);
app.use('/game', gameRoutes); 

const gameTimers = new Map();

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
        GameRoom.findOne({ 'players.userId': userId })
            .then(async (room) => {
                if (room) {
                    const player = room.players.find(p => p.userId && p.userId.toString() === userId);
                    if (player && player.socketId !== socket.id) {
                        player.socketId = socket.id;
                        await room.save();

                        if (room.status === 'in-progress' && player.status === 'disconnected') {
                            player.status = 'playing';
                            await room.save();
                            io.to(room.roomId).emit('playerStatusUpdate', { userId, status: 'playing', message: `${player.userId.firstName} reconnected.` });

                            await room.populate('problemIds', 'title difficulty tags description starterCode visibleTestCases executionConfig');
                            io.to(socket.id).emit('reconnectedToGame', { room: room, problem: room.problemIds[room.currentProblemIndex] });
                        }
                    }
                }
            }).catch(err => console.error("Socket.IO: Error updating user socket ID on reconnect:", err));
    }

    socket.on('joinGameRoom', async ({ roomId, userId }) => {
        try {
            const gameRoom = await GameRoom.findOne({ roomId });

            if (!gameRoom) {
                console.warn(`Socket.IO: Room ${roomId} not found for joinGameRoom from ${userId}`);
                socket.emit('gameError', { message: 'Room not found.' });
                return;
            }

            const player = gameRoom.players.find(p => p.userId?.toString() === userId);
            if (!player) {
                console.warn(`Socket.IO: User ${userId} not a player in room ${roomId}.`);
                socket.emit('gameError', { message: 'You are not a player in this room.' });
                return;
            }

            if (player.socketId !== socket.id) {
                player.socketId = socket.id;
                await gameRoom.save();
            }

            socket.join(roomId);

            await gameRoom.populate('players.userId', 'firstName lastName emailId avatar');
            await gameRoom.populate('problemIds', 'title difficulty tags description starterCode visibleTestCases executionConfig');

            io.to(socket.id).emit('roomUpdate', { room: gameRoom, message: 'Welcome to the room!' });

            if (gameRoom.status === 'in-progress') {
                io.to(socket.id).emit('gameStart', {
                    room: gameRoom,
                    message: 'Game is already in progress. Resuming...',
                    problem: gameRoom.problemIds[gameRoom.currentProblemIndex]
                });
            }

        } catch (error) {
            console.error('Socket.IO: Error handling joinGameRoom socket event:', error);
            if (error.name === 'ValidationError') {
                socket.emit('gameError', { message: `Validation failed: ${error.message}` });
            } else {
                socket.emit('gameError', { message: 'Error joining room.' });
            }
        }
    });

    socket.on('playerReady', async ({ roomId, userId }) => {
        try {
            const gameRoom = await GameRoom.findOne({ roomId });
            if (!gameRoom) {
                socket.emit('gameError', { message: 'Room not found.' });
                return;
            }

            const player = gameRoom.players.find(p => p.userId?.toString() === userId);
            if (!player) {
                socket.emit('gameError', { message: 'You are not a player in this room.' });
                return;
            }

            player.status = 'ready';
            await gameRoom.save();

            await gameRoom.populate('players.userId', 'firstName lastName emailId avatar');
            io.to(roomId).emit('playerStatusUpdate', { userId, status: 'ready', room: gameRoom, message: `${player.userId.firstName} is ready!` });

            const allPlayersReady = gameRoom.players.every(p => p.status === 'ready');
            if (gameRoom.players.length === gameRoom.maxPlayers && allPlayersReady && gameRoom.status === 'waiting') {
                gameRoom.status = 'in-progress';
                gameRoom.startTime = new Date();
                gameRoom.endTime = new Date(gameRoom.startTime.getTime() + gameRoom.timeLimit * 60 * 1000);
                gameRoom.currentProblemIndex = 0;

                await gameRoom.populate('problemIds', 'title difficulty tags description starterCode visibleTestCases executionConfig');
                await gameRoom.save();

                const timerId = setTimeout(() => {
                    endGame(io, roomId, 'Time Expired');
                }, gameRoom.timeLimit * 60 * 1000 + 5000); // Give a small buffer
                gameTimers.set(roomId, timerId);

                io.to(roomId).emit('gameStart', {
                    room: gameRoom,
                    message: 'Game starting now!',
                    problem: gameRoom.problemIds[gameRoom.currentProblemIndex]
                });
            }

        } catch (error) {
            console.error('Socket.IO: Error handling playerReady:', error);
            if (error.name === 'ValidationError') {
                socket.emit('gameError', { message: `Validation failed: ${error.message}` });
            } else {
                socket.emit('gameError', { message: 'Error updating ready status.' });
            }
        }
    });

    socket.on('gameRunCode', async ({ roomId, userId, problemId, code, language, customInput }) => {
        try {
            const gameRoom = await GameRoom.findOne({ roomId });
            if (!gameRoom || gameRoom.status !== 'in-progress') {
                io.to(socket.id).emit('gameError', { message: 'Game not in progress, or room not found for running code.' });
                return;
            }

            const currentPlayer = gameRoom.players.find(p => p.userId?.toString() === userId);
            if (!currentPlayer) {
                io.to(socket.id).emit('gameError', { message: 'You are not a player in this room.' });
                return;
            }

            const runResult = await runCodeInternal({
                userId: new mongoose.Types.ObjectId(userId),
                problemId: new mongoose.Types.ObjectId(problemId),
                code,
                language,
                customInput
            });

            io.to(socket.id).emit('codeResult', runResult);

        } catch (error) {
            console.error('Socket.IO: Error handling gameRunCode:', error);
            io.to(socket.id).emit('gameError', { message: 'Error processing run code request.' });
            io.to(socket.id).emit('codeResult', { status: 'Error', message: `Internal server error during code run: ${error.message}` });
        }
    });

    socket.on('gameCodeSubmission', async ({ roomId, userId, problemId, code, language }) => {
        try {
            const gameRoom = await GameRoom.findOne({ roomId });
            if (!gameRoom || gameRoom.status !== 'in-progress') {
                io.to(socket.id).emit('gameError', { message: 'Game not in progress, or room not found.' });
                return;
            }

            const currentProblem = gameRoom.problemIds[gameRoom.currentProblemIndex];
            if (!currentProblem || currentProblem.toString() !== problemId) {
                io.to(socket.id).emit('gameError', { message: 'Submitted problem is not the current active problem for this game.' });
                return;
            }

            const currentPlayer = gameRoom.players.find(p => p.userId?.toString() === userId);
            if (!currentPlayer) {
                io.to(socket.id).emit('gameError', { message: 'You are not a player in this room.' });
                return;
            }

            currentPlayer.gameStats.totalSubmissions = (currentPlayer.gameStats.totalSubmissions || 0) + 1;

            const submissionResult = await submitCodeInternal({
                userId: new mongoose.Types.ObjectId(userId),
                problemId: new mongoose.Types.ObjectId(problemId),
                code,
                language,
            });

            if (!submissionResult) {
                io.to(socket.id).emit('codeResult', { status: 'Error', message: 'Internal submission error.' });
                return;
            }

            io.to(socket.id).emit('codeResult', { ...submissionResult, userId });

            if (submissionResult.status === 'Accepted') {
                const problemAlreadyCompleted = currentPlayer.problemsCompleted.some(pc => pc.problemId?.toString() === problemId.toString());

                if (!problemAlreadyCompleted) {
                    currentPlayer.problemsCompleted.push({
                        problemId: new mongoose.Types.ObjectId(problemId),
                        acceptedAt: new Date(),
                        timeTaken: Math.floor((new Date() - gameRoom.startTime) / 1000),
                        submissionsCount: currentPlayer.gameStats.totalSubmissions,
                        isAccepted: true
                    });
                    currentPlayer.gameStats.problemsSolvedCount = (currentPlayer.gameStats.problemsSolvedCount || 0) + 1;

                    if (!currentPlayer.gameStats.firstAcceptedSubmissionId) {
                        currentPlayer.gameStats.firstAcceptedSubmissionId = submissionResult.submissionId;
                        currentPlayer.gameStats.timeTakenToSolve = Math.floor((new Date() - gameRoom.startTime) / 1000);
                    }

                    currentPlayer.status = 'solved';

                    io.to(roomId).emit('playerSolvedProblem', {
                        userId,
                        problemId,
                        room: gameRoom,
                        message: `${(await User.findById(userId))?.firstName || 'A player'} solved a problem!`
                    });

                    await gameRoom.save();

                    if (gameRoom.gameMode === '1v1-coding') {
                        await endGame(io, roomId, 'Problem Solved', userId);
                    } else if (currentPlayer.problemsCompleted.length === gameRoom.problemIds.length) {
                        await endGame(io, roomId, 'All Solved', userId);
                    }

                } else {
                    await gameRoom.save();
                }
            } else {
                await gameRoom.save();
            }

        } catch (error) {
            console.error('Socket.IO: Error handling gameCodeSubmission:', error);
            io.to(socket.id).emit('gameError', { message: 'Error processing submission.' });
            io.to(socket.id).emit('codeResult', { status: 'Error', message: `Internal server error during submission: ${error.message}` });
        }
    });

    socket.on('leaveGameRoom', async ({ roomId, userId }) => {
        try {
            const gameRoom = await GameRoom.findOne({ roomId });
            if (!gameRoom) {
                console.warn(`Socket.IO: Attempted to leave non-existent room ${roomId}`);
                return;
            }

            const playerIndex = gameRoom.players.findIndex(p => p.userId?.toString() === userId);
            if (playerIndex === -1) {
                console.warn(`Socket.IO: User ${userId} not found in room ${roomId} to leave.`);
                return;
            }

            const leftPlayer = gameRoom.players[playerIndex];
            const leftUserName = (await User.findById(userId))?.firstName || 'A player';


            gameRoom.players.splice(playerIndex, 1);
            await gameRoom.save();


            io.to(roomId).emit('playerLeftRoom', { room: gameRoom, leftPlayerId: userId, message: `${leftUserName} left the room.` });

            const activePlayers = gameRoom.players.filter(p => p.status !== 'disconnected');

            if (gameRoom.status === 'in-progress') {
                if (activePlayers.length === 1 && gameRoom.maxPlayers === 2) {
                    await endGame(io, gameRoom.roomId, 'Opponent Left', activePlayers[0]?.userId);
                } else if (activePlayers.length === 0) {
                    if (gameTimers.has(gameRoom.roomId)) {
                        clearTimeout(gameTimers.get(gameRoom.roomId));
                        gameTimers.delete(gameRoom.roomId);
                    }
                    gameRoom.status = 'cancelled';
                    await gameRoom.save();
                    io.to(gameRoom.roomId).emit('gameEnd', {
                        roomId: gameRoom.roomId,
                        reason: 'All Players Disconnected',
                        winnerId: null,
                        room: gameRoom
                    });
                    setTimeout(async () => {
                        await GameRoom.findByIdAndDelete(gameRoom._id);
                    }, 5 * 60 * 1000);
                }
            } else if (gameRoom.status === 'waiting') {
                if (activePlayers.length === 0) {
                    setTimeout(async () => {
                        const latestRoomState = await GameRoom.findById(gameRoom._id);
                        if (latestRoomState && latestRoomState.players.every(p => p.status === 'disconnected')) {
                            if (gameTimers.has(latestRoomState.roomId)) {
                                clearTimeout(gameTimers.get(latestRoomState.roomId));
                                gameTimers.delete(latestRoomState.roomId);
                            }
                            await GameRoom.findByIdAndDelete(latestRoomState._id);
                            io.to(latestRoomState.roomId).emit('roomDeleted', { roomId: latestRoomState.roomId, message: "Room is empty and has been deleted." });
                        } else if (latestRoomState) {
                        }
                    }, 60 * 1000);
                } else {
                    io.to(gameRoom.roomId).emit('roomStatusChange', { roomId: gameRoom.roomId, newStatus: 'waiting', message: 'A player left. Waiting for new player.' });
                }
            }

        } catch (error) {
            console.error('Socket.IO: Error handling leaveGameRoom:', error);
            if (error.name === 'ValidationError') {
                console.error('Socket.IO: Validation error on leaveGameRoom:', error.errors);
            }
        }
    });


    socket.on('disconnect', async (reason) => {
        try {
            const gameRoom = await GameRoom.findOne({ 'players.socketId': socket.id });

            if (gameRoom) {
                const player = gameRoom.players.find(p => p.socketId === socket.id);
                if (player) {
                    player.status = 'disconnected';
                    await gameRoom.save();

                    const playerName = (await User.findById(player.userId))?.firstName || 'A player';

                    io.to(gameRoom.roomId).emit('playerStatusUpdate', {
                        userId: player.userId,
                        status: 'disconnected',
                        room: gameRoom,
                        message: `${playerName} disconnected.`
                    });

                    const activePlayers = gameRoom.players.filter(p => p.status !== 'disconnected');

                    if (gameRoom.status === 'in-progress') {
                        if (activePlayers.length === 1 && gameRoom.maxPlayers === 2) {
                            await endGame(io, gameRoom.roomId, 'Opponent Left', activePlayers[0]?.userId);
                        } else if (activePlayers.length === 0) {
                            if (gameTimers.has(gameRoom.roomId)) {
                                clearTimeout(gameTimers.get(gameRoom.roomId));
                                gameTimers.delete(gameRoom.roomId);
                            }
                            gameRoom.status = 'cancelled';
                            await gameRoom.save();
                            io.to(gameRoom.roomId).emit('gameEnd', {
                                roomId: gameRoom.roomId,
                                reason: 'All Players Disconnected',
                                winnerId: null,
                                room: gameRoom
                            });
                            setTimeout(async () => {
                                await GameRoom.findByIdAndDelete(gameRoom._id);
                            }, 5 * 60 * 1000);
                        }
                    } else if (gameRoom.status === 'waiting') {
                        if (activePlayers.length === 0) {
                            setTimeout(async () => {
                                const latestRoomState = await GameRoom.findById(gameRoom._id);
                                if (latestRoomState && latestRoomState.players.every(p => p.status === 'disconnected')) {
                                    if (gameTimers.has(latestRoomState.roomId)) {
                                        clearTimeout(gameTimers.get(latestRoomState.roomId));
                                        gameTimers.delete(latestRoomState.roomId);
                                    }
                                    await GameRoom.findByIdAndDelete(latestRoomState._id);
                                    io.to(latestRoomState.roomId).emit('roomDeleted', { roomId: latestRoomState.roomId, message: "Room is empty and has been deleted." });
                                } else if (latestRoomState) {
                                    console.lg(`Socket.IO: Room ${latestRoomState.roomId} re-populated during grace period. Not deleting.`);
                                }
                            }, 60 * 1000);
                        } else {
                            io.to(gameRoom.roomId).emit('roomStatusChange', { roomId: gameRoom.roomId, newStatus: 'waiting', message: 'A player disconnected. Waiting for new player.' });
                        }
                    }
                } else {
                }
            }
        } catch (error) {
            console.error('Socket.IO: Error handling disconnect:', error);
            if (error.name === 'ValidationError') {
                console.error('Socket.IO: Validation error on disconnect:', error.errors);
            }
        }
    });
});

app.use((err, req, res, next) => {
    console.error('Express App Error:', err.stack);
    res.status(500).send('Something broke!');
});

const InitalizeConnection = async () => {
    try {
        await Promise.all([
            main(),
            redisClient.connect()
        ]);
        server.listen(process.env.PORT, () => {
            console.log("server start")
        });
    } catch (err) {
        console.error("Error during server initialization:", err);
        process.exit(1);
    }
};

InitalizeConnection();