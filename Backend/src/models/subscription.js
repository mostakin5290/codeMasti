// models/Subscription.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const subscriptionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    plan: { // This refers to the specific plan like 'monthly', 'yearly', or 'custom' for admin grants
        type: String,
        enum: ['monthly', 'yearly', 'custom_duration'], // Added 'custom_duration'
        required: true
    },
    amount: { // For admin grants, can be 0 or a dummy value
        type: Number,
        required: true
    },
    currency: { // For admin grants, can be 'N/A' or 'INR'
        type: String,
        default: 'INR',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: false, // Made optional
        // unique: true,
        // sparse: true 
    },
    razorpayPaymentId: {
        type: String,
        required: false,
        // unique: true,
        // sparse: true
    },
    razorpaySignature: {
        type: String,
        required: false, // Made optional
        // sparse: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'expired', 'cancelled', 'failed'],
        default: 'pending'
    },
    source: { // NEW FIELD: To differentiate between Razorpay and Admin grants
        type: String,
        enum: ['razorpay', 'admin_grant'],
        default: 'razorpay'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;