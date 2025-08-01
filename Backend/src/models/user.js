
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minLength: 3,
        maxLength: 30
    },
    lastName: {
        type: String,
        trim: true,
    },
    emailId: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true,
        immutable: true
    },
    age: {
        type: Number,
        min: 6,
        max: 80
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'co-admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: true
    },

    headline: {
        type: String,
        trim: true,
        maxLength: 100,
        default: 'Aspiring Coder'
    },
    bio: {
        type: String,
        maxLength: 500
    },
    location: {
        type: String,
        trim: true,
        maxLength: 100
    },
    avatar: { 
        type: String,
        default: 'https://res.cloudinary.com/dcmzfn5oq/image/upload/v1752850490/man-avatar-profile-picture-isolated-background-avatar-profile-picture-man_1293239-4841_gbmgeo.avif'
    },
    avatarPublicId: { 
        type: String,
        sparse: true, 
        unique: true, 
    },
    socialLinks: {
        github: String,
        linkedin: String,
        twitter: String,
        website: String
    },

    problemsSolved: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Problem'
        }],
        default: []
    },
    stats: {
        problemsSolvedCount: {
            easy: { type: Number, default: 0 },
            medium: { type: Number, default: 0 },
            hard: { type: Number, default: 0 },
        },
        totalSubmissions: { type: Number, default: 0 },
        eloRating: { type: Number, default: 1000 },
        gamesPlayed: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
    },
    preferences: {
        language: {
            type: String,
            enum: ['javascript', 'python', 'java', 'c++'],
            default: 'javascript'
        },
        theme: {
            type: String,
            default: 'vs-dark'
        }
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    activeSubscription: {
        type: Schema.Types.ObjectId,
        ref: 'Subscription',
        default: null,
    },
    dailyChallenges: {
        completed: [{
            challengeId: {
                type: Schema.Types.ObjectId,
                ref: 'Problem'
            },
            date: Date,
            streak: Number
        }],
        currentStreak: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        }
    },
    currentGameRoom: { type: Schema.Types.ObjectId, ref: 'GameRoom' }
}, { timestamps: true });


const User = mongoose.model('User', userSchema);
module.exports = User;