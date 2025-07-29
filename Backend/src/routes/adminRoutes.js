const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const coAdminMiddleware = require('../middleware/coAdminMiddleware.js')
const {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    getPremiumPlan,
    updatePremiumPlan,
    createPremiumPlan
} = require('../controllers/adminController.js');

router.get('/stats', coAdminMiddleware, getDashboardStats);
router.get('/users', coAdminMiddleware, getAllUsers);
router.delete('/users/:id', adminMiddleware, deleteUser);

router.get('/premium-plan', getPremiumPlan);
router.put('/premium-plan', adminMiddleware, updatePremiumPlan);
router.post('/create-premium-plan',adminMiddleware, createPremiumPlan);

module.exports = router;