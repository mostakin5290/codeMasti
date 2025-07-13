const mongoose = require('mongoose');
const { Schema } = mongoose;

const subscriptionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    plan: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
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
        required: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String,
        unique: true,
        sparse: true // Allows nulls, but unique if not null
    },
    razorpaySignature: {
        type: String,
        sparse: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'expired', 'cancelled', 'failed'],
        default: 'pending'
    },
}, {
    timestamps: true // Adds createdAt and updatedAt
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;