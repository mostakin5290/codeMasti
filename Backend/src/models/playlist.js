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
        default: ''
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true 
    },
    problems: [{
        type: Schema.Types.ObjectId,
        ref: 'Problem' 
    }],
    isPublic: { 
        type: Boolean,
        default: false
    }
}, {
    timestamps: true 
});

playlistSchema.index({ name: 1, userId: 1 }, { unique: true });

const Playlist = mongoose.model('Playlist', playlistSchema);
module.exports = Playlist;