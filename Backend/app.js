const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const main = require('./src/config/db'); // Your database connection function
const cookieParser = require('cookie-parser');
const redisClient = require('./src/config/redis'); // Your Redis client instance
const cors = require('cors');
const mongoose = require('mongoose');
const { createAdapter } = require("@socket.io/redis-adapter"); // Import the adapter

const app = express();
const server = http.createServer(app); // Create HTTP server for both Express and Socket.IO

// --- IMPORTANT: Connect Redis clients for Socket.IO Adapter first ---
let pubClient;
let subClient;

const setupRedisAdapter = async () => {
    try {
        // Ensure redisClient is an ioredis client or similar that can be duplicated
        if (!redisClient || typeof redisClient.duplicate !== 'function') {
            console.error("Redis client is not properly initialized or does not have a 'duplicate' method.");
            throw new Error("Invalid Redis client for Socket.IO adapter.");
        }
        
        pubClient = redisClient.duplicate();
        subClient = redisClient; // Using the main redisClient for subscription

        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        console.log("Socket.IO Redis adapter connected successfully.");
    } catch (err) {
        console.error("Failed to connect Socket.IO Redis adapter:", err);
        // Depending on criticality, you might want to exit process or degrade gracefully
    }
};

// --- Socket.IO Server Configuration ---
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL, // Ensure this matches exactly "https://codemasti.vercel.app"
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    },
    transports: ['polling', 'websocket'], // Prioritize polling for Vercel
    pingInterval: 25000,
    pingTimeout: 60000 
});

app.set('socketio', io); // Make io instance available via `req.app.get('socketio')`

// --- Express CORS Middleware ---
// This must be placed *before* any routes that need CORS.
app.use(cors({
    origin: process.env.FRONTEND_URL, // Ensure this matches exactly "https://codemasti.vercel.app"
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS for preflight
    credentials: true,
    exposedHeaders: ['set-cookie']
}));

// Your raw body parser for payment webhook (keep its original position)
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

// Other Express Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Route Imports (Make sure these are defined after all middlewares)
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

// Database/Model/Controller Imports (can be here or at top)
const GameRoom = require('./src/models/gameRoomSchema');
const Problem = require('./src/models/problem');
const User = require('./src/models/user');
const { submitCodeInternal, runCodeInternal } = require('./src/controllers/submitControllers');
const { endGame } = require('./src/controllers/gameController');

// Socket.IO Connection Logic
const gameTimers = new Map();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    const userId = socket.handshake.query.userId;

    // Your existing socket.io event handlers go here:
    if (userId) {
        GameRoom.findOne({ 'players.userId': userId })
            .then(async (room) => {
                if (room) {
                    const player = room.players.find(p => p.userId && p.userId.toString() === userId);
                    if (player && player.socketId !== socket.id) {
                        player.socketId = socket.id;
                        await room.save();
                        console.log(`Updated socketId for user ${userId} in room ${room.roomId}`);

                        if (room.status === 'in-progress' && player.status === 'disconnected') {
                            player.status = 'playing';
                            await room.save();
                            io.to(room.roomId).emit('playerStatusUpdate', { userId, status: 'playing', message: `${player.userId.firstName} reconnected.` });

                            await room.populate('problemIds', 'title difficulty tags description starterCode visibleTestCases executionConfig');
                            io.to(socket.id).emit('reconnectedToGame', { room: room, problem: room.problemIds[room.currentProblemIndex] });
                        }
                    }
                }
            }).catch(err => console.error("Error updating user socket ID on reconnect:", err));
    }

    socket.on('joinGameRoom', async ({ roomId, userId }) => {
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

            if (player.socketId !== socket.id) {
                player.socketId = socket.id;
                await gameRoom.save();
            }

            socket.join(roomId);
            console.log(`User ${userId} (${socket.id}) joined Socket.IO room: ${roomId}`);

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
            console.error('Error handling joinGameRoom socket event:', error);
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
                }, gameRoom.timeLimit * 60 * 1000 + 5000);
                gameTimers.set(roomId, timerId);

                io.to(roomId).emit('gameStart', {
                    room: gameRoom,
                    message: 'Game starting now!',
                    problem: gameRoom.problemIds[gameRoom.currentProblemIndex]
                });
                console.log(`Game ${roomId} started with time limit: ${gameRoom.timeLimit} minutes.`);
            }

        } catch (error) {
            console.error('Error handling playerReady:', error);
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
            console.error('Error handling gameRunCode:', error);
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
            console.error('Error handling gameCodeSubmission:', error);
            io.to(socket.id).emit('gameError', { message: 'Error processing submission.' });
            io.to(socket.id).emit('codeResult', { status: 'Error', message: `Internal server error during submission: ${error.message}` });
        }
    });

    socket.on('leaveGameRoom', async ({ roomId, userId }) => {
        try {
            const gameRoom = await GameRoom.findOne({ roomId });
            if (!gameRoom) {
                console.warn(`Attempted to leave non-existent room ${roomId}`);
                return;
            }

            const playerIndex = gameRoom.players.findIndex(p => p.userId?.toString() === userId);
            if (playerIndex === -1) {
                console.warn(`User ${userId} not found in room ${roomId} to leave.`);
                return;
            }

            const leftPlayer = gameRoom.players[playerIndex];
            const leftUserName = (await User.findById(userId))?.firstName || 'A player';


            gameRoom.players.splice(playerIndex, 1);
            await gameRoom.save();


            console.log(`User ${userId} explicitly left room ${roomId}.`);
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
                    console.log(`In-progress room ${gameRoom.roomId} cancelled due to all players disconnecting.`);
                    setTimeout(async () => {
                        await GameRoom.findByIdAndDelete(gameRoom._id);
                        console.log(`Cancelled room ${gameRoom.roomId} deleted after cleanup timeout.`);
                    }, 5 * 60 * 1000);
                }
            } else if (gameRoom.status === 'waiting') {
                if (activePlayers.length === 0) {
                    console.log(`Waiting room ${gameRoom.roomId} is now empty. Scheduling for deletion in 1 minute.`);
                    setTimeout(async () => {
                        const latestRoomState = await GameRoom.findById(gameRoom._id);
                        if (latestRoomState && latestRoomState.players.every(p => p.status === 'disconnected')) {
                             if (gameTimers.has(latestRoomState.roomId)) {
                                clearTimeout(gameTimers.get(latestRoomState.roomId));
                                gameTimers.delete(latestRoomState.roomId);
                            }
                            await GameRoom.findByIdAndDelete(latestRoomState._id);
                            console.log(`Empty waiting room ${latestRoomState.roomId} deleted after grace period.`);
                            io.to(latestRoomState.roomId).emit('roomDeleted', { roomId: latestRoomState.roomId, message: "Room is empty and has been deleted." });
                        } else if (latestRoomState) {
                            console.log(`Room ${latestRoomState.roomId} re-populated during grace period. Not deleting.`);
                        }
                    }, 60 * 1000);
                } else {
                    io.to(gameRoom.roomId).emit('roomStatusChange', { roomId: gameRoom.roomId, newStatus: 'waiting', message: 'A player disconnected. Waiting for new player.' });
                }
            }

        } catch (error) {
            console.error('Error handling leaveGameRoom:', error);
            if (error.name === 'ValidationError') {
                console.error('Validation error on leaveGameRoom:', error.errors);
            }
        }
    });


    socket.on('disconnect', async () => {
        try {
            console.log(`User disconnected: ${socket.id}`);
            const gameRoom = await GameRoom.findOne({ 'players.socketId': socket.id });

            if (gameRoom) {
                const player = gameRoom.players.find(p => p.socketId === socket.id);
                if (player) {
                    player.status = 'disconnected';
                    await gameRoom.save();

                    const playerName = (await User.findById(player.userId))?.firstName || 'A player';
                    console.log(`${playerName} (${socket.id}) disconnected from room ${gameRoom.roomId}.`);

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
                            console.log(`In-progress room ${gameRoom.roomId} cancelled due to all players disconnecting.`);
                            setTimeout(async () => {
                                await GameRoom.findByIdAndDelete(gameRoom._id);
                                console.log(`Cancelled room ${gameRoom.roomId} deleted after cleanup timeout.`);
                            }, 5 * 60 * 1000);
                        }
                    } else if (gameRoom.status === 'waiting') {
                        if (activePlayers.length === 0) {
                            console.log(`Waiting room ${gameRoom.roomId} is now empty. Scheduling for deletion in 1 minute.`);
                            setTimeout(async () => {
                                const latestRoomState = await GameRoom.findById(gameRoom._id);
                                if (latestRoomState && latestRoomState.players.every(p => p.status === 'disconnected')) {
                                     if (gameTimers.has(latestRoomState.roomId)) {
                                        clearTimeout(gameTimers.get(latestRoomState.roomId));
                                        gameTimers.delete(latestRoomState.roomId);
                                    }
                                    await GameRoom.findByIdAndDelete(latestRoomState._id);
                                    console.log(`Empty waiting room ${latestRoomState.roomId} deleted after grace period.`);
                                    io.to(latestRoomState.roomId).emit('roomDeleted', { roomId: latestRoomState.roomId, message: "Room is empty and has been deleted." });
                                } else if (latestRoomState) {
                                    console.log(`Room ${latestRoomState.roomId} re-populated during grace period. Not deleting.`);
                                }
                            }, 60 * 1000);
                        } else {
                            io.to(gameRoom.roomId).emit('roomStatusChange', { roomId: gameRoom.roomId, newStatus: 'waiting', message: 'A player disconnected. Waiting for new player.' });
                        }
                    }
                } else {
                    console.log(`Disconnected socket ${socket.id} not found in any game room.`);
                }
            }} catch (error) {
                console.error('Error handling disconnect:', error);
                if (error.name === 'ValidationError') {
                    console.error('Validation error on disconnect:', error.errors);
                }
            }
        }
    ); // Corrected: This is the end of socket.on('disconnect', async () => { ... });

}); // This is the end of io.on('connection', (socket) => { ... });


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const InitalizeConnection = async () => {
    try {
        await Promise.all([
            main(),
            redisClient.connect()
        ]);
        console.log('DB and Redis Connected');
        server.listen(process.env.PORT, () => {
            console.log('Server started at port:' + process.env.PORT);
        });
    } catch (err) {
        console.error("Error during server initialization:", err);
        process.exit(1);
    }
};

InitalizeConnection();