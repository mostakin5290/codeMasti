// models/Contest.js (Example)
const mongoose = require('mongoose');
const slugify = require('slugify'); // You'll need this package!

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
    slug: { // <--- THIS IS THE FIELD CAUSING THE ERROR
        type: String,
        unique: true, // <--- This unique constraint is the culprit
        // required: true, // You might need to make it required to prevent nulls if not pre-saving
        index: true, // Ensures quick lookups
    },
    // ... other fields like participants, status, etc.
}, { timestamps: true });


// Pre-save hook to generate slug
contestSchema.pre('save', function(next) {
    if (this.isModified('title') || this.isNew) {
        this.slug = slugify(this.title, { lower: true, strict: true, trim: true });
        // Optionally, add a number to the slug if it already exists
        // This makes sure it's unique even for identical titles
        // For simplicity, we'll assume titles are unique enough for now,
        // or rely on MongoDB's error handling for retries.
        // For robust slug generation, you might query the DB here
        // to check for existing slugs and append a counter.
    }
    next();
});

module.exports = mongoose.model('Contest', contestSchema);