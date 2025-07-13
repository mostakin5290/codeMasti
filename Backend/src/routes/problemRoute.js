const express = require('express');
const problemRouter = express.Router();
const {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblem,
    getProblemByIdForAdmin,
    searchProblems,
    getTodayChallenge,
    getUserStreak,
    setDailyChallenge,
    getPreviousChallenges,
    deleteDailyChallenge
} = require('../controllers/problemControllers');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');

// Admin-only problem management routes
problemRouter.post('/create', adminMiddleware, createProblem);
problemRouter.put('/update/:id', adminMiddleware, updateProblem);
problemRouter.delete('/delete/:id', adminMiddleware, deleteProblem);

// Problem access routes
problemRouter.get('/problemById/:id', userMiddleware, getProblemById);
problemRouter.get('/getAllProblem', userMiddleware, getAllProblem);
problemRouter.get('/problemByIdForAdmin/:id', adminMiddleware, getProblemByIdForAdmin);
problemRouter.get('/search', userMiddleware, searchProblems);

// Daily Challenge routes
problemRouter.get('/daily', userMiddleware, getTodayChallenge);
problemRouter.get('/daily/streak', userMiddleware, getUserStreak);
problemRouter.post('/daily/set', adminMiddleware, setDailyChallenge);
problemRouter.get('/daily/previous', userMiddleware, getPreviousChallenges);
problemRouter.delete('/daily/:id', adminMiddleware, deleteDailyChallenge);
module.exports = problemRouter;