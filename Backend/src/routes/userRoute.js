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
    toggleUserPremiumStatus


} = require('../controllers/AuthControllers');
const userMiddleware = require('../middleware/userMiddleware');
const coAdminMiddleware = require('../middleware/coAdminMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware.js')

// Local authentication routes
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.put('/password', userMiddleware, changePassword);

// otp routes
authRouter.post('/send-otp', sendOTP);
authRouter.post('/verify-otp', verifyOTP);

// Google OAuth routes
authRouter.get('/google', googleLogin);

// GitHub OAuth routes
authRouter.get('/github', initiateGithubLogin);
authRouter.get('/github/callback', handleGithubCallback);

// LinkedIn OAuth routes
// authRouter.get('/linkedin', initiateLinkedinLogin); // Initiate LinkedIn login
// authRouter.get('/linkedin/callback', handleLinkedinCallback); // Handle LinkedIn callback

// Profile management routes
authRouter.get('/profile', userMiddleware, getUserProfile);
authRouter.put('/profile', userMiddleware, updateUserProfile);
authRouter.delete('/account', userMiddleware, deleteUserAccount);
authRouter.get('/allDetails/:userId', getFullUserProfile);


authRouter.get('/', coAdminMiddleware, getAllUsersForAdmin); // New: Get all users for admin
authRouter.put('/:userId/role', coAdminMiddleware, updateUserRole); // New: Update user role
authRouter.delete('/:userId', adminMiddleware, adminDeleteUser); // New: Admin delete user
authRouter.put('/:userId/premium', coAdminMiddleware, toggleUserPremiumStatus); 


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