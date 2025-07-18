// models/Subscription.js
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
        enum: ['monthly', 'yearly', 'custom_duration'],
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
        required: false,
        unique: true,  // <--- UNCOMMENT AND ADD THIS
        sparse: true   // <--- UNCOMMENT AND ADD THIS (Crucial for allowing multiple nulls)
    },
    razorpayPaymentId: {
        type: String,
        required: false,
        unique: true,  // <--- UNCOMMENT AND ADD THIS (Same logic as razorpayOrderId)
        sparse: true   // <--- UNCOMMENT AND ADD THIS
    },
    razorpaySignature: {
        type: String,
        required: false,
        // sparse: true // Generally no need for unique here, so no unique or sparse
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'expired', 'cancelled', 'failed'],
        default: 'pending'
    },
    source: {
        type: String,
        enum: ['razorpay', 'admin_grant'],
        default: 'razorpay'
    }
}, {
    timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;