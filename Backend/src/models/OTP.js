const mongoose = require('mongoose');
const { Schema } = mongoose;

const otpSchema = new Schema({
    emailId: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
    },
    otp: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
    },
    lastName: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 300 }
    }
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema);