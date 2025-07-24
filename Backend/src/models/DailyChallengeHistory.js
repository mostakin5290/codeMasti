const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dailyChallengeHistorySchema = new Schema({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    challengeDate: {
        type: Date,
        required: true,
        unique: true, 
        index: true   
    },
    title: { 
        type: String,
        required: true
    },
    difficulty: { 
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
}, { timestamps: true }); 

const DailyChallengeHistory = mongoose.model('DailyChallengeHistory', dailyChallengeHistorySchema);

module.exports = DailyChallengeHistory;