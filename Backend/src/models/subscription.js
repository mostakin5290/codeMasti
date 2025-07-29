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
        unique: true,
        sparse: true 
    },
    razorpayPaymentId: {
        type: String,
        required: false,
        unique: true, 
        sparse: true 
    },
    razorpaySignature: {
        type: String,
        required: false,
        
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