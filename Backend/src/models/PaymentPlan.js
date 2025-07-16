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
        min: 0,
    },
    yearlyPlanPrice: {
        type: Number,
        required: true,
        min: 0,
    },
}, { timestamps: true });

const PremiumPlan = mongoose.model('premiumPlan', premiumPlanSchema);
module.exports = PremiumPlan;