// models/playlist.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const playlistSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Playlist name is required'],
        trim: true,
        maxlength: [100, 'Playlist name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Playlist description cannot exceed 500 characters'],
        default: '' // Allow empty description
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
        index: true // Index for efficient lookup by user
    },
    problems: [{
        type: Schema.Types.ObjectId,
        ref: 'Problem' // Reference to the Problem model
    }],
    isPublic: { // Optional: for future sharing features (e.g., public playlists)
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Ensure a user cannot have two playlists with the exact same name
// This creates a compound unique index on 'name' and 'userId'
playlistSchema.index({ name: 1, userId: 1 }, { unique: true });

const Playlist = mongoose.model('Playlist', playlistSchema);
module.exports = Playlist;