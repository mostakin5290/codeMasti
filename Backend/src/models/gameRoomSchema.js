const mongoose = require('mongoose');
const { Schema } = mongoose;

const gameRoomSchema = new Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    players: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        socketId: {
            type: String,
            required: true
        },
        isCreator: {
            type: Boolean,
            default: false
        },
        status: { // Player's status within the room
            type: String,
            enum: ['pending', 'ready', 'playing', 'disconnected', 'solved', 'finished'], // 'solved' for problem, 'finished' for game
            default: 'pending'
        },
        // Changed to be an object to store cumulative stats for the current game session
        gameStats: { // New field for player-specific game stats
            problemsSolvedCount: { type: Number, default: 0 },
            totalSubmissions: { type: Number, default: 0 },
            timeTakenToSolve: { type: Number, default: null }, // In seconds for the first accepted problem
            firstAcceptedSubmissionId: { type: Schema.Types.ObjectId, ref: 'Submission', default: null }
        },
        // Track which problems this player solved in this specific game session
        // This is important if a game has multiple problems (e.g., all 3)
        problemsCompleted: [{ // Changed name from problemsSolved to avoid confusion with user profile
            problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
            acceptedAt: { type: Date, default: Date.now }, // Timestamp of first acceptance
            timeTaken: Number, // In seconds from game start
            submissionsCount: Number, // Number of submissions for this problem
            isAccepted: { type: Boolean, default: false }
        }]
    }],
    problemIds: [{ // Store multiple problem IDs if you want 3 problems
        type: Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    currentProblemIndex: { // If multiple problems in one game
        type: Number,
        default: 0
    },
    status: { // Room/Game status
        type: String,
        enum: ['waiting', 'in-progress', 'completed', 'cancelled'],
        default: 'waiting'
    },
    maxPlayers: {
        type: Number,
        default: 2
    },
    gameMode: {
        type: String,
        enum: ['1v1-coding', 'battle-royale'],
        default: '1v1-coding'
    },
    // NEW: Game settings from lobby
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true // Required for matching
    },
    timeLimit: { // Per game, in minutes
        type: Number,
        min: 1,
        max: 60,
        default: 10
    },
    startTime: { // When the game actually starts
        type: Date
    },
    endTime: { // Calculated based on startTime and timeLimit
        type: Date
    },
    gameData: { // Flexible field for dynamic game state, e.g., winner, reason for end
        type: Schema.Types.Mixed
    },
    // NEW: Stores final results when game is completed
    gameResults: {
        winner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        reason: {
            type: String,
            // --- UPDATED ENUM VALUES HERE ---
            enum: [
                'Problem Solved',
                'Time Expired',
                'Opponent Left',
                'All Solved',
                'All Players Disconnected' // <-- ADDED THIS VALUE
            ],
            default: null
        },
        solvedOrder: [{ // Order in which players solved the problem(s)
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            timeTaken: Number, // Time taken to solve the *first* assigned problem in seconds (or average)
            problemsSolvedCount: Number, // How many problems they solved out of total
            // --- NEW FIELDS FOR ELO ---
            eloBeforeGame: { type: Number, default: null },
            eloChange: { type: Number, default: null },
            eloAfterGame: { type: Number, default: null },
            outcome: { type: String, enum: ['win', 'loss', 'draw/incomplete'], default: null } // Store outcome for clarity
        }]
    }
}, { timestamps: true });

// TTL index for 'waiting' rooms - good for cleanup
gameRoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600, partialFilterExpression: { status: 'waiting' } });

const GameRoom = mongoose.model('GameRoom', gameRoomSchema);
module.exports = GameRoom;