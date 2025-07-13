const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({ // Renamed 'submission' to 'submissionSchema' for clarity
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
        enum: ['javascript', 'python', 'java', 'c', 'cpp'] // Changed from 'c++' to 'cpp' to match problem schema and common usage
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
    // NEW FIELD: To store detailed results for each test case
    testCaseResults: [{
        input: {
            type: Schema.Types.Mixed, // Original input as stored in problem
            required: true
        },
        expected: {
            type: Schema.Types.Mixed, // Original expected output as stored in problem
            required: true
        },
        actual: {
            type: Schema.Types.Mixed, // Judge0's stdout or stderr
            required: false // Not always present (e.g., compile error)
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
        error: { // Specific error description if not 'Accepted'
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