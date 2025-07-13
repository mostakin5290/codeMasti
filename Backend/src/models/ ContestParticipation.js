const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ContestParticipationSchema = new mongoose.Schema({
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, default: Date.now },
    submissions: [{
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
        submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
        timestamp: { type: Date, default: Date.now },
        points: { type: Number }
    }],
    totalPoints: { type: Number, default: 0 },
    timeTaken: { type: Number } // in minutes
});

module.exports = mongoose.model('ContestParticipation', ContestParticipationSchema);