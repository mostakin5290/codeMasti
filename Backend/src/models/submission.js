const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['javascript', 'python', 'java', 'c', 'cpp']
    },
    status: {
        type: String,
        enum: [
            'Pending',
            'Accepted',
            'Wrong Answer',
            'Time Limit Exceeded',
            'Compilation Error',
            'Runtime Error',
            'Memory Limit Exceeded',
            'NZEC'
        ],
        default: 'Pending'
    },
    runtime: {
        type: Number,
        default: 0
    },
    memory: {
        type: Number,
        default: 0
    },
    errorMessage: {
        type: String,
        default: ''
    },
    testCasesPassed: {
        type: Number,
        default: 0
    },
    testCasesTotal: {
        type: Number,
        default: 0
    },
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        default: null 
    },
    testCaseResults: [{
        input: {
            type: Schema.Types.Mixed,
            required: true
        },
        expected: {
            type: Schema.Types.Mixed,
            required: true
        },
        actual: {
            type: Schema.Types.Mixed,
            required: false
        },
        passed: {
            type: Boolean,
            default: false
        },
        runtime: {
            type: Number,
            default: 0
        },
        memory: {
            type: Number,
            default: 0
        },
        error: {
            type: String,
            trim: true
        }
    }]
}, {
    timestamps: true
});

submissionSchema.index({ userId: 1, problemId: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;