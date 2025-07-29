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
        status: {
            type: String,
            enum: ['pending', 'ready', 'playing', 'disconnected', 'solved', 'finished'], // 'solved' for problem, 'finished' for game
            default: 'pending'
        },
        gameStats: { 
            problemsSolvedCount: { type: Number, default: 0 },
            totalSubmissions: { type: Number, default: 0 },
            timeTakenToSolve: { type: Number, default: null },
            firstAcceptedSubmissionId: { type: Schema.Types.ObjectId, ref: 'Submission', default: null }
        },
        problemsCompleted: [{ 
            problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
            acceptedAt: { type: Date, default: Date.now },
            timeTaken: Number, 
            submissionsCount: Number, 
            isAccepted: { type: Boolean, default: false }
        }]
    }],
    problemIds: [{ 
        type: Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    currentProblemIndex: { 
        type: Number,
        default: 0
    },
    status: { 
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
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    timeLimit: {
        type: Number,
        min: 1,
        max: 60,
        default: 10
    },
    startTime: { 
        type: Date
    },
    endTime: { 
        type: Date
    },
    gameData: { 
        type: Schema.Types.Mixed
    },
    gameResults: {
        winner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        reason: {
            type: String,
            enum: [
                'Problem Solved',
                'Time Expired',
                'Opponent Left',
                'All Solved',
                'All Players Disconnected' 
            ],
            default: null
        },
        solvedOrder: [{ 
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            timeTaken: Number, 
            problemsSolvedCount: Number, 
            eloBeforeGame: { type: Number, default: null },
            eloChange: { type: Number, default: null },
            eloAfterGame: { type: Number, default: null },
            outcome: { type: String, enum: ['win', 'loss', 'draw/incomplete'], default: null } // Store outcome for clarity
        }]
    }
}, { timestamps: true });

gameRoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600, partialFilterExpression: { status: 'waiting' } });

const GameRoom = mongoose.model('GameRoom', gameRoomSchema);
module.exports = GameRoom;