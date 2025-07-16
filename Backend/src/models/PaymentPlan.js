const mongoose = require('mongoose');

const premiumPlanSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'premiumPlanSingleton', 
        required: true,
    },
    monthlyPlanPrice: {
        type: Number,
        required: true,
        default: 1.99,
        min: 0,
    },
    yearlyPlanPrice: {
        type: Number,
        required: true,
        default: 21.49,
        min: 0,
    },
}, { timestamps: true });

const PremiumPlan = mongoose.model('premiumPlan', premiumPlanSchema);
module.exports = PremiumPlan;