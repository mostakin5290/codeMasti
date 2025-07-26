// Backend/routes/AuthRoutes.js

const express = require('express');
const authRouter = express.Router();
const {
    register,
    sendOTP,
    login,
    verifyOTP,
    logout,
    getFullUserProfile,
    deleteUserAccount,
    updateUserProfile,
    getUserProfile,
    googleLogin,
    initiateGithubLogin,
    handleGithubCallback,
    changePassword,
    getAllUsersForAdmin,
    updateUserRole,
    adminDeleteUser,
    toggleUserPremiumStatus,
    forgotPassword,
    resetPassword ,
    getUserRank,
    getTotalRank
} = require('../controllers/AuthControllers');
const userMiddleware = require('../middleware/userMiddleware');
const coAdminMiddleware = require('../middleware/coAdminMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware.js')

// Local authentication routes
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.put('/password', userMiddleware, changePassword);

// OTP routes
authRouter.post('/send-otp', sendOTP);
authRouter.post('/verify-otp', verifyOTP);

// NEW: Forgot Password / Reset Password Routes
authRouter.post('/forgot-password', forgotPassword); // Route to send OTP for password reset
authRouter.post('/reset-password', resetPassword);   // Route to reset password with OTP

// Google OAuth routes
authRouter.get('/google', googleLogin);

// GitHub OAuth routes
authRouter.get('/github', initiateGithubLogin);
authRouter.get('/github/callback', handleGithubCallback);

// LinkedIn OAuth routes (commented out as per your original code)
// authRouter.get('/linkedin', initiateLinkedinLogin);
// authRouter.get('/linkedin/callback', handleLinkedinCallback);

// Profile management routes
authRouter.get('/profile', userMiddleware, getUserProfile);
authRouter.put('/profile', userMiddleware, updateUserProfile);
authRouter.delete('/account', userMiddleware, deleteUserAccount);
authRouter.get('/allDetails/:userId', getFullUserProfile);

// Admin routes (require coAdminMiddleware or adminMiddleware)
authRouter.get('/', coAdminMiddleware, getAllUsersForAdmin);         // Get all users for admin
authRouter.put('/:userId/role', coAdminMiddleware, updateUserRole);  // Update user role
authRouter.delete('/:userId', adminMiddleware, adminDeleteUser);     // Admin delete user
authRouter.put('/:userId/premium', coAdminMiddleware, toggleUserPremiumStatus); // Toggle premium status
// Route to get user rank
authRouter.get('/rank/:userId', userMiddleware, getUserRank);
authRouter.get('/total-rank',userMiddleware,getTotalRank);
// Authentication check route
authRouter.get('/check', userMiddleware, (req, res) => {
    const reply = {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        emailId: req.user.emailId,
        avatar: req.user.avatar,
        _id: req.user._id,
        role: req.user.role,
        isPremium: req.user.isPremium,
        provider: req.user.provider
    };

    res.status(200).json({
        user: reply,
        message: "Valid User"
    });
});

module.exports = authRouter;