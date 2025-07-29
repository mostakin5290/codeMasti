// models/Contest.js (Example)
const mongoose = require('mongoose');
const slugify = require('slugify');

const contestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    duration: { // in minutes
        type: Number,
        required: true,
        min: 1,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    maxParticipants: {
        type: Number,
        min: 0, // 0 for unlimited, or a positive number
        default: null, // Allow null for unlimited participants
    },
    problems: [
        {
            problemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Problem',
            },
            points: {
                type: Number,
                required: true,
                min: 0,
            },
        },
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        index: true, 
    },
    // ... other fields like participants, status, etc.
}, { timestamps: true });


contestSchema.pre('save', function(next) {
    if (this.isModified('title') || this.isNew) {
        this.slug = slugify(this.title, { lower: true, strict: true, trim: true });
    }
    next();
});

module.exports = mongoose.model('Contest', contestSchema);