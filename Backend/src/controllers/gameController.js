const GameRoom = require('../models/gameRoomSchema');
const User = require('../models/user'); // Ensure User model is imported
const Problem = require('../models/problem');
const Submission = require('../models/submission');
const mongoose = require('mongoose');
const { submitCodeInternal } = require('./submitControllers');

// In-memory matching queue (simple, not scalable for production without Redis)
const matchingQueue = []; // { userId, socketId, difficulty, timeLimit, timestamp }

// Utility to generate a random alphanumeric room ID
const generateRoomId = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// Helper to select random problems - Now fetches 3 problems
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

// Helper function to end the game (moved from app.js for better organization)
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

    const initialStatus = gameRoom.status; // Store initial status to check if it was 'in-progress'
    gameRoom.status = 'completed';
    gameRoom.gameResults = {
        reason: reason,
        winner: winnerUserId,
        solvedOrder: [] // This will be populated below
    };
    gameRoom.endTime = new Date();

    const playersInRoom = gameRoom.players;
    const gameDifficulty = gameRoom.difficulty;

    // Determine winner based on solve order or default
    const playersSortedBySolvedTime = playersInRoom
        .filter(p => p.gameStats?.problemsSolvedCount > 0) // Filter by actually solved problems
        .sort((a, b) => a.gameStats.timeTakenToSolve - b.gameStats.timeTakenToSolve);

    let finalWinnerId = winnerUserId; // Start with explicit winner if provided
    if (!finalWinnerId && playersSortedBySolvedTime.length > 0) {
        finalWinnerId = playersSortedBySolvedTime[0].userId; // First to solve is winner
    } else if (!finalWinnerId && reason === 'Opponent Left' && playersInRoom.length > 0) {
        // If opponent left, and game was in progress, the remaining player is the winner.
        const remainingActivePlayers = playersInRoom.filter(p => p.status === 'playing' || p.status === 'ready' || p.status === 'solved');
        if (initialStatus === 'in-progress' && remainingActivePlayers.length === 1 && playersInRoom.length === 2) {
            finalWinnerId = remainingActivePlayers[0].userId;
        }
    } else if (!finalWinnerId && reason === 'Time Expired' && playersSortedBySolvedTime.length === 0) {
        // No one solved and time expired, no explicit winner
        finalWinnerId = null;
    } else if (!finalWinnerId && reason === 'All Players Disconnected' && playersInRoom.length === 2) {
        // If both disconnected and no winner was determined before, no winner.
        finalWinnerId = null;
    }

    gameRoom.gameResults.winner = finalWinnerId;

    // Create a temporary array to hold updated solvedOrder entries,
    // as we need to populate 'eloBeforeGame' and 'eloAfterGame' during the loop
    const updatedSolvedOrder = [];

    for (const player of playersInRoom) {
        const userProfile = await User.findById(player.userId);
        if (userProfile) {
            const initialElo = userProfile.stats.eloRating || 1000; // Store ELO before update

            userProfile.stats.gamesPlayed = (userProfile.stats.gamesPlayed || 0) + 1;

            let eloChange = 0;
            let outcome = 'draw/incomplete'; // default to draw, adjust later

            if (finalWinnerId && player.userId.toString() === finalWinnerId.toString()) {
                // Winner logic
                userProfile.stats.wins = (userProfile.stats.wins || 0) + 1;
                outcome = 'win';
                if (gameDifficulty === 'easy') eloChange = 10;
                else if (gameDifficulty === 'medium') eloChange = 20;
                else if (gameDifficulty === 'hard') eloChange = 30;
            } else if (finalWinnerId && player.userId.toString() !== finalWinnerId.toString()) {
                // Loser logic (if there was a clear winner)
                userProfile.stats.losses = (userProfile.stats.losses || 0) + 1;
                outcome = 'loss';
                if (gameDifficulty === 'easy') eloChange = -5;
                else if (gameDifficulty === 'medium') eloChange = -10;
                else if (gameDifficulty === 'hard') eloChange = -15;
            } else {
                // No clear winner (e.g., time expired and no one solved, or both disconnected)
                eloChange = 0; // No ELO change for a draw/incomplete
                outcome = 'draw/incomplete';
            }

            userProfile.stats.eloRating = (userProfile.stats.eloRating || 1000) + eloChange;
            // Ensure ELO doesn't go below a certain minimum (e.g., 100 to prevent negative ELO)
            if (userProfile.stats.eloRating < 100) userProfile.stats.eloRating = 100;

            console.log(`User ${userProfile.firstName}: Game ${outcome}, Difficulty ${gameDifficulty}, ELO Change ${eloChange}, New ELO ${userProfile.stats.eloRating}`);
            await userProfile.save();

            // Populate the new fields for gameResults.solvedOrder
            updatedSolvedOrder.push({
                userId: player.userId,
                timeTaken: player.gameStats.timeTakenToSolve || null,
                problemsSolvedCount: player.gameStats.problemsSolvedCount,
                eloBeforeGame: initialElo, // Store ELO before this game's calculation
                eloChange: eloChange,
                eloAfterGame: userProfile.stats.eloRating, // Store ELO after this game's calculation
                outcome: outcome
            });
        }
    }

    gameRoom.gameResults.solvedOrder = updatedSolvedOrder; // Assign the new array
    await gameRoom.save();

    // Populate after saving to ensure latest state is reflected
    await gameRoom.populate('players.userId', 'firstName lastName avatar');
    await gameRoom.populate('gameResults.winner', 'firstName lastName avatar');
    await gameRoom.populate('gameResults.solvedOrder.userId', 'firstName lastName avatar'); // Ensure this populates the solvedOrder user details
    await gameRoom.populate('problemIds', 'title difficulty');

    io.to(roomId).emit('gameEnd', {
        roomId,
        reason,
        winnerId: gameRoom.gameResults.winner,
        room: gameRoom,
        results: gameRoom.gameResults // This now contains the ELO info
    });

    console.log(`Game room ${roomId} ended. Reason: ${reason}. Winner: ${gameRoom.gameResults.winner?.firstName || 'N/A'}`);
}

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

            // --- CRUCIAL CHANGE HERE: Set status to 'in-progress' immediately ---
            const newGameRoom = await GameRoom.create({
                roomId,
                maxPlayers: 2,
                gameMode: '1v1-coding', // Quick matches are 1v1
                difficulty,
                timeLimit,
                problemIds: problemIds,
                players: [
                    {
                        userId: new mongoose.Types.ObjectId(currentUserId),
                        socketId: currentUserSocketId,
                        isCreator: true, // Assign creator to current user for consistency
                        status: 'playing', // Set to 'playing' directly
                        gameStats: { problemsSolvedCount: 0, totalSubmissions: 0, timeTakenToSolve: null, firstAcceptedSubmissionId: null },
                        problemsCompleted: []
                    },
                    {
                        userId: new mongoose.Types.ObjectId(matchedOpponent.userId),
                        socketId: matchedOpponent.socketId,
                        isCreator: false,
                        status: 'playing', // Set to 'playing' directly
                        gameStats: { problemsSolvedCount: 0, totalSubmissions: 0, timeTakenToSolve: null, firstAcceptedSubmissionId: null },
                        problemsCompleted: []
                    }
                ],
                status: 'in-progress', // Directly set game status to in-progress
                startTime: new Date(), // Set start time
                endTime: new Date(Date.now() + timeLimit * 60 * 1000), // Set end time
                currentProblemIndex: 0 // Start with the first problem
            });

            // Populate the room object to send back to frontend
            await newGameRoom.populate('players.userId', 'firstName lastName emailId avatar');
            await newGameRoom.populate('problemIds', 'title difficulty tags description starterCode visibleTestCases executionConfig');

            // --- Emit gameStart to both players directly from here ---
            // The 'problem' field in gameStart should be the first problem
            const firstProblem = newGameRoom.problemIds[newGameRoom.currentProblemIndex];

            // Use req.io to get the socket.io instance
            req.io.to(currentUserSocketId).emit('gameStart', {
                room: newGameRoom,
                message: `Quick Match found! Game starting now in room ${roomId}.`,
                problem: firstProblem
            });
            req.io.to(matchedOpponent.socketId).emit('gameStart', {
                room: newGameRoom,
                message: `Quick Match found! Game starting now in room ${roomId}.`,
                problem: firstProblem
            });

            console.log(`Quick match room ${roomId} created and gameStart emitted.`);

            // Return 200 OK for immediate match
            return res.status(200).json({
                message: "Match found and game started!",
                room: newGameRoom // Send the full room data with populated players/problems
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

            // Cleanup old queue entries (optional, but good practice)
            const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
            for (let i = matchingQueue.length - 1; i >= 0; i--) {
                if (matchingQueue[i].timestamp < thirtySecondsAgo) {
                    matchingQueue.splice(i, 1);
                }
            }

            return res.status(202).json({
                message: "No immediate match found. Added to queue. Please wait...",
                queueSize: matchingQueue.length
            });
        }

    } catch (error) {
        console.error("Error finding random opponent:", error);
        res.status(500).json({ message: "Server error while finding opponent", error: error.message });
    }
};

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

        console.log(`[Join Room] Received request to join roomId: '${roomId}', socketId: '${socketId}', userId: '${userId}'`); // DEBUG 1

        if (!roomId || !socketId) {
            return res.status(400).json({ message: "Room ID and Socket ID are required." });
        }

        // IMPORTANT: Ensure the roomId is consistently treated.
        // If your generateRoomId creates uppercase, let's make sure we query with uppercase too.
        // Frontend already sends uppercase, so just use it.
        const normalizedRoomId = roomId.toUpperCase(); // Ensure it's uppercase for query consistency
        console.log(`[Join Room] Normalized roomId for query: '${normalizedRoomId}'`); // DEBUG 2


        const gameRoom = await GameRoom.findOne({ roomId: normalizedRoomId }); // Use normalizedRoomId for query

        if (!gameRoom) {
            console.warn(`[Join Room] Game room '${normalizedRoomId}' not found in DB during join attempt.`); // DEBUG 3
            return res.status(404).json({ message: "Game room not found." });
        }

        console.log(`[Join Room] Found game room: ${gameRoom.roomId}. Status: ${gameRoom.status}`); // DEBUG 4

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

// Endpoint to get details of a specific game room
const getGameRoomDetails = async (req, res) => {
    try {
        const { roomId } = req.params;
        console.log(`Attempting to fetch room details for roomId: ${roomId}`); // Debug log

        // IMPORTANT: Ensure roomId from req.params matches the type/case in DB
        // If your generateRoomId creates uppercase, make sure the query matches.
        // It's already defined as unique:true, trim:true.
        const gameRoom = await GameRoom.findOne({ roomId: roomId })
            .populate('players.userId', 'firstName lastName emailId avatar')
            .populate('problemIds', 'title difficulty tags description starterCode visibleTestCases executionConfig')
            .populate('gameResults.winner', 'firstName lastName avatar')
            .populate('gameResults.solvedOrder.userId', 'firstName lastName avatar'); // Ensure userId is populated here

        if (!gameRoom) {
            console.warn(`Game room ${roomId} not found in DB.`); // Debug log
            return res.status(404).json({ message: "Game room not found." });
        }

        console.log(`Found game room: ${gameRoom.roomId}`); // Debug log
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
        const userId = req.user._id; // Authenticated user ID

        // Find an 'in-progress' game room where the user is a player
        const activeRoom = await GameRoom.findOne({
            'players.userId': userId,
            status: 'in-progress'
        })
        .select('roomId maxPlayers gameMode difficulty timeLimit startTime endTime problemIds currentProblemIndex') // Select only necessary fields
        .populate('players.userId', 'firstName lastName avatar') // Populate player profiles
        .lean(); // Return plain JS object for performance

        if (activeRoom) {
            return res.status(200).json({
                message: "User is in an active game.",
                room: activeRoom
            });
        } else {
            return res.status(204).json({ message: "User is not in an active game." }); // 204 No Content
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