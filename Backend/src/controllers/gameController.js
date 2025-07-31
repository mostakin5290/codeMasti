const GameRoom = require('../models/gameRoomSchema');
const User = require('../models/user');
const Problem = require('../models/problem');
const Submission = require('../models/submission');
const mongoose = require('mongoose');
const { submitCodeInternal } = require('./submitControllers');

const matchingQueue = [];

const generateRoomId = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

async function getRandomProblems(difficulty, count = 3) {
    try {
        const problems = await Problem.aggregate([
            { $match: { difficulty: difficulty } },
            { $sample: { size: count } }
        ]);
        return problems.map(p => p._id);
    } catch (error) {
        console.error("Error getting random problems:", error);
        return [];
    }
}

// [Keep your existing endGame function - no changes needed]
async function endGame(io, roomId, reason, winnerUserId = null) {
    const gameRoom = await GameRoom.findOne({ roomId });
    if (!gameRoom) {
        console.log(`Game room ${roomId} not found for ending.`);
        return;
    }

    if (gameRoom.status === 'completed' || gameRoom.status === 'cancelled') {
        console.log(`Game room ${roomId} already ${gameRoom.status}. Not re-ending.`);
        return;
    }

    const initialStatus = gameRoom.status;
    gameRoom.status = 'completed';
    gameRoom.gameResults = {
        reason: reason,
        winner: winnerUserId,
        solvedOrder: []
    };
    gameRoom.endTime = new Date();

    const playersInRoom = gameRoom.players;
    const gameDifficulty = gameRoom.difficulty;

    const playersSortedBySolvedTime = playersInRoom
        .filter(p => p.gameStats?.problemsSolvedCount > 0)
        .sort((a, b) => a.gameStats.timeTakenToSolve - b.gameStats.timeTakenToSolve);

    let finalWinnerId = winnerUserId;
    if (!finalWinnerId && playersSortedBySolvedTime.length > 0) {
        finalWinnerId = playersSortedBySolvedTime[0].userId;
    } else if (!finalWinnerId && reason === 'Opponent Left' && playersInRoom.length > 0) {
        const remainingActivePlayers = playersInRoom.filter(p => p.status === 'playing' || p.status === 'ready' || p.status === 'solved');
        if (initialStatus === 'in-progress' && remainingActivePlayers.length === 1 && playersInRoom.length === 2) {
            finalWinnerId = remainingActivePlayers[0].userId;
        }
    } else if (!finalWinnerId && reason === 'Time Expired' && playersSortedBySolvedTime.length === 0) {
        finalWinnerId = null;
    } else if (!finalWinnerId && reason === 'All Players Disconnected' && playersInRoom.length === 2) {
        finalWinnerId = null;
    }

    gameRoom.gameResults.winner = finalWinnerId;

    const updatedSolvedOrder = [];

    for (const player of playersInRoom) {
        const userProfile = await User.findById(player.userId);
        if (userProfile) {
            const initialElo = userProfile.stats.eloRating || 1000;

            userProfile.stats.gamesPlayed = (userProfile.stats.gamesPlayed || 0) + 1;

            let eloChange = 0;
            let outcome = 'draw/incomplete';

            if (finalWinnerId && player.userId.toString() === finalWinnerId.toString()) {
                userProfile.stats.wins = (userProfile.stats.wins || 0) + 1;
                outcome = 'win';
                if (gameDifficulty === 'easy') eloChange = 10;
                else if (gameDifficulty === 'medium') eloChange = 20;
                else if (gameDifficulty === 'hard') eloChange = 30;
            } else if (finalWinnerId && player.userId.toString() !== finalWinnerId.toString()) {
                userProfile.stats.losses = (userProfile.stats.losses || 0) + 1;
                outcome = 'loss';
                if (gameDifficulty === 'easy') eloChange = -5;
                else if (gameDifficulty === 'medium') eloChange = -10;
                else if (gameDifficulty === 'hard') eloChange = -15;
            } else {
                eloChange = 0;
                outcome = 'draw/incomplete';
            }

            userProfile.stats.eloRating = (userProfile.stats.eloRating || 1000) + eloChange;
            if (userProfile.stats.eloRating < 100) userProfile.stats.eloRating = 100;

            console.log(`User ${userProfile.firstName}: Game ${outcome}, Difficulty ${gameDifficulty}, ELO Change ${eloChange}, New ELO ${userProfile.stats.eloRating}`);
            await userProfile.save();

            updatedSolvedOrder.push({
                userId: player.userId,
                timeTaken: player.gameStats.timeTakenToSolve || null,
                problemsSolvedCount: player.gameStats.problemsSolvedCount,
                eloBeforeGame: initialElo,
                eloChange: eloChange,
                eloAfterGame: userProfile.stats.eloRating,
                outcome: outcome
            });
        }
    }

    gameRoom.gameResults.solvedOrder = updatedSolvedOrder;
    await gameRoom.save();

    await gameRoom.populate('players.userId', 'firstName lastName avatar');
    await gameRoom.populate('gameResults.winner', 'firstName lastName avatar');
    await gameRoom.populate('gameResults.solvedOrder.userId', 'firstName lastName avatar');
    await gameRoom.populate('problemIds', 'title difficulty');

    io.to(roomId).emit('gameEnd', {
        roomId,
        reason,
        winnerId: gameRoom.gameResults.winner,
        room: gameRoom,
        results: gameRoom.gameResults
    });

    console.log(`Game room ${roomId} ended. Reason: ${reason}. Winner: ${gameRoom.gameResults.winner?.firstName || 'N/A'}`);
}

// FIXED findRandomOpponent function
const findRandomOpponent = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const currentUserSocketId = req.body.socketId;
        const { difficulty, timeLimit } = req.body;

        if (!currentUserSocketId || !difficulty || !timeLimit) {
            return res.status(400).json({ message: "Socket ID, difficulty, and time limit are required for quick match." });
        }

        // Remove existing queue entry for current user if they are re-requesting
        const existingQueueEntryIndex = matchingQueue.findIndex(e => e.userId.toString() === currentUserId.toString());
        if (existingQueueEntryIndex !== -1) {
            matchingQueue.splice(existingQueueEntryIndex, 1);
        }

        // Try to find a matched opponent
        const matchedIndex = matchingQueue.findIndex(entry =>
            entry.difficulty === difficulty &&
            entry.timeLimit === timeLimit &&
            entry.userId.toString() !== currentUserId.toString()
        );

        if (matchedIndex !== -1) {
            // Match found!
            const matchedOpponent = matchingQueue.splice(matchedIndex, 1)[0];

            let roomId;
            let roomExists = true;
            while (roomExists) {
                roomId = generateRoomId();
                const existingRoom = await GameRoom.findOne({ roomId });
                if (!existingRoom) {
                    roomExists = false;
                }
            }

            const problemIds = await getRandomProblems(difficulty, 3);
            if (problemIds.length === 0) {
                return res.status(500).json({ message: "No problems found for the selected difficulty." });
            }

            // Create game room with both players
            const newGameRoom = await GameRoom.create({
                roomId,
                maxPlayers: 2,
                gameMode: '1v1-coding',
                difficulty,
                timeLimit,
                problemIds: problemIds,
                players: [
                    {
                        userId: new mongoose.Types.ObjectId(currentUserId),
                        socketId: currentUserSocketId,
                        isCreator: true,
                        status: 'playing',
                        gameStats: { problemsSolvedCount: 0, totalSubmissions: 0, timeTakenToSolve: null, firstAcceptedSubmissionId: null },
                        problemsCompleted: []
                    },
                    {
                        userId: new mongoose.Types.ObjectId(matchedOpponent.userId),
                        socketId: matchedOpponent.socketId,
                        isCreator: false,
                        status: 'playing',
                        gameStats: { problemsSolvedCount: 0, totalSubmissions: 0, timeTakenToSolve: null, firstAcceptedSubmissionId: null },
                        problemsCompleted: []
                    }
                ],
                status: 'in-progress',
                startTime: new Date(),
                endTime: new Date(Date.now() + timeLimit * 60 * 1000),
                currentProblemIndex: 0
            });

            // Populate the room data
            await newGameRoom.populate('players.userId', 'firstName lastName emailId avatar');
            await newGameRoom.populate('problemIds', 'title difficulty tags description starterCode visibleTestCases executionConfig');

            const firstProblem = newGameRoom.problemIds[newGameRoom.currentProblemIndex];

            // **KEY FIX: Emit gameStart to BOTH players from the controller**
            // This ensures both players receive the event and can navigate to the game
            console.log(`🎮 Emitting gameStart to both players for room ${roomId}`);
            console.log(`📡 Current user socket: ${currentUserSocketId}`);
            console.log(`📡 Matched opponent socket: ${matchedOpponent.socketId}`);

            // Emit to current user (who just made the request)
            req.io.to(currentUserSocketId).emit('gameStart', {
                room: newGameRoom,
                message: `Quick Match found! Game starting now in room ${roomId}.`,
                problem: firstProblem
            });

            // Emit to matched opponent (who was waiting in queue)
            req.io.to(matchedOpponent.socketId).emit('gameStart', {
                room: newGameRoom,
                message: `Quick Match found! Game starting now in room ${roomId}.`,
                problem: firstProblem
            });

            console.log(`✅ Quick match room ${roomId} created and gameStart emitted to both players.`);

            // Return success response for the current user
            return res.status(200).json({
                message: "Match found and game started!",
                room: newGameRoom
            });

        } else {
            // No immediate match, add to queue
            matchingQueue.push({
                userId: currentUserId,
                socketId: currentUserSocketId,
                difficulty,
                timeLimit,
                timestamp: new Date()
            });

            console.log(`🔍 User ${currentUserId} added to matchmaking queue. Queue size: ${matchingQueue.length}`);

            // Cleanup old queue entries (older than 30 seconds)
            const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
            for (let i = matchingQueue.length - 1; i >= 0; i--) {
                if (matchingQueue[i].timestamp < thirtySecondsAgo) {
                    console.log(`🧹 Removing expired queue entry for user ${matchingQueue[i].userId}`);
                    matchingQueue.splice(i, 1);
                }
            }

            return res.status(202).json({
                message: "No immediate match found. Added to queue. Please wait...",
                queueSize: matchingQueue.length
            });
        }

    } catch (error) {
        console.error("❌ Error finding random opponent:", error);
        res.status(500).json({ message: "Server error while finding opponent", error: error.message });
    }
};

// [Keep all other functions unchanged]
const createGameRoom = async (req, res) => {
    try {
        const { maxPlayers = 2, gameMode = '1v1-coding', difficulty, timeLimit } = req.body;
        const userId = req.user._id;
        const userSocketId = req.body.socketId;

        if (!userSocketId || !difficulty || !timeLimit) {
            return res.status(400).json({ message: "Socket ID, difficulty, and time limit are required to create a room." });
        }

        let roomId;
        let roomExists = true;
        while (roomExists) {
            roomId = generateRoomId();
            const existingRoom = await GameRoom.findOne({ roomId });
            if (!existingRoom) {
                roomExists = false;
            }
        }

        const problemIds = await getRandomProblems(difficulty, 3);
        if (problemIds.length === 0) {
            return res.status(500).json({ message: "No problems found for the selected difficulty." });
        }

        const newGameRoom = await GameRoom.create({
            roomId,
            maxPlayers,
            gameMode,
            difficulty,
            timeLimit,
            problemIds: problemIds,
            players: [{
                userId: new mongoose.Types.ObjectId(userId),
                socketId: userSocketId,
                isCreator: true,
                status: 'ready',
                gameStats: { problemsSolvedCount: 0, totalSubmissions: 0, timeTakenToSolve: null, firstAcceptedSubmissionId: null },
                problemsCompleted: []
            }],
            status: 'waiting'
        });

        await newGameRoom.populate('players.userId', 'firstName lastName emailId avatar');
        await newGameRoom.populate('problemIds', 'title difficulty');

        req.io.to(userSocketId).emit('roomCreated', { room: newGameRoom, message: "Room created successfully!" });

        res.status(201).json({
            message: 'Game room created successfully',
            room: newGameRoom
        });

    } catch (err) {
        console.error("Error creating game room:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation failed", error: err.message });
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: "A room with this ID already exists. Please try again.", error: err.message });
        }
        res.status(500).json({ message: "Error creating game room", error: err.message });
    }
};

const joinGameRoom = async (req, res) => {
    try {
        const { roomId, socketId } = req.body;
        const userId = req.user._id;

        console.log(`[Join Room] Received request to join roomId: '${roomId}', socketId: '${socketId}', userId: '${userId}'`);

        if (!roomId || !socketId) {
            return res.status(400).json({ message: "Room ID and Socket ID are required." });
        }

        const normalizedRoomId = roomId.toUpperCase();
        console.log(`[Join Room] Normalized roomId for query: '${normalizedRoomId}'`);

        const gameRoom = await GameRoom.findOne({ roomId: normalizedRoomId });

        if (!gameRoom) {
            console.warn(`[Join Room] Game room '${normalizedRoomId}' not found in DB during join attempt.`);
            return res.status(404).json({ message: "Game room not found." });
        }

        console.log(`[Join Room] Found game room: ${gameRoom.roomId}. Status: ${gameRoom.status}`);

        if (gameRoom.status !== 'waiting') {
            return res.status(400).json({ message: `Cannot join room. Game is already ${gameRoom.status}.` });
        }
        if (gameRoom.players.length >= gameRoom.maxPlayers) {
            return res.status(400).json({ message: "Game room is full." });
        }

        const existingPlayer = gameRoom.players.find(p => p.userId.toString() === userId.toString());
        if (existingPlayer) {
            if (existingPlayer.socketId !== socketId) {
                existingPlayer.socketId = socketId;
                await gameRoom.save();
                await gameRoom.populate('players.userId', 'firstName lastName emailId avatar');
                await gameRoom.populate('problemIds', 'title difficulty');
                req.io.to(socketId).emit('roomUpdate', { room: gameRoom, message: "You rejoined the room." });
                return res.status(200).json({ message: "Already in room, socket updated", room: gameRoom });
            } else {
                await gameRoom.populate('players.userId', 'firstName lastName emailId avatar');
                await gameRoom.populate('problemIds', 'title difficulty');
                req.io.to(socketId).emit('roomUpdate', { room: gameRoom, message: "You are already in this room." });
                return res.status(200).json({ message: "Already in room", room: gameRoom });
            }
        }

        gameRoom.players.push({
            userId: new mongoose.Types.ObjectId(userId),
            socketId: socketId,
            isCreator: false,
            status: 'pending',
            gameStats: { problemsSolvedCount: 0, totalSubmissions: 0, timeTakenToSolve: null, firstAcceptedSubmissionId: null },
            problemsCompleted: []
        });

        await gameRoom.save();
        await gameRoom.populate('players.userId', 'firstName lastName emailId avatar');
        await gameRoom.populate('problemIds', 'title difficulty');

        req.io.to(roomId).emit('playerJoinedRoom', { room: gameRoom, newPlayer: req.user, message: `${req.user.firstName} joined the room!` });

        res.status(200).json({
            message: 'Successfully joined game room',
            room: gameRoom
        });

    } catch (err) {
        console.error("Error joining game room:", err);
        res.status(500).json({ message: "Error joining game room", error: err.message });
    }
};

const getGameRoomDetails = async (req, res) => {
    try {
        const { roomId } = req.params;
        console.log(`Attempting to fetch room details for roomId: ${roomId}`);

        const gameRoom = await GameRoom.findOne({ roomId: roomId })
            .populate('players.userId', 'firstName lastName emailId avatar')
            .populate('problemIds', 'title difficulty tags description starterCode visibleTestCases executionConfig')
            .populate('gameResults.winner', 'firstName lastName avatar')
            .populate('gameResults.solvedOrder.userId', 'firstName lastName avatar');

        if (!gameRoom) {
            console.warn(`Game room ${roomId} not found in DB.`);
            return res.status(404).json({ message: "Game room not found." });
        }

        console.log(`Found game room: ${gameRoom.roomId}`);
        res.status(200).json({
            message: "Game room details fetched successfully",
            room: gameRoom
        });
    } catch (error) {
        console.error("Error fetching game room details:", error);
        res.status(500).json({ message: "Error fetching game room details", error: error.message });
    }
};

const getMyActiveGameRoom = async (req, res) => {
    try {
        const userId = req.user._id;

        const activeRoom = await GameRoom.findOne({
            'players.userId': userId,
            status: 'in-progress'
        })
        .select('roomId maxPlayers gameMode difficulty timeLimit startTime endTime problemIds currentProblemIndex')
        .populate('players.userId', 'firstName lastName avatar')
        .lean();

        if (activeRoom) {
            return res.status(200).json({
                message: "User is in an active game.",
                room: activeRoom
            });
        } else {
            return res.status(204).json({ message: "User is not in an active game." });
        }
    } catch (error) {
        console.error("Error getting user's active game room:", error);
        res.status(500).json({ message: "Server error checking active game room", error: error.message });
    }
};

module.exports = {
    findRandomOpponent,
    createGameRoom,
    joinGameRoom,
    getGameRoomDetails,
    endGame,
    getMyActiveGameRoom
};
