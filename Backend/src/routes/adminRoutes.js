const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
// const userMiddleware = require('../middleware/userMiddleware.js')
const {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    getPremiumPlan,
    updatePremiumPlan,
    createPremiumPlan
} = require('../controllers/adminController.js');
const userMiddleware = require('../middleware/userMiddleware.js');

// Admin-only dashboard/user routes
router.get('/stats', adminMiddleware, getDashboardStats);
router.get('/users', adminMiddleware, getAllUsers);
router.delete('/users/:id', adminMiddleware, deleteUser);

// NEW: Single endpoint for managing site-wide settings (including prices)
router.get('/premium-plan', getPremiumPlan);
router.put('/premium-plan', adminMiddleware, updatePremiumPlan);
router.post('/create-premium-plan', createPremiumPlan);

module.exports = router;