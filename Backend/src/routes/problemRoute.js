// problemRouter.js
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
    // getPreviousChallenges, // <--- NOTE: If getPreviousChallenges is still intended for "past" problems NOT necessarily from DailyChallengeHistory, keep its route. Otherwise, it might be redundant with getAllScheduledAndHistoricalDailyChallenges.
    getAllScheduledAndHistoricalDailyChallenges,
    deleteDailyChallenge // This controller now expects history record ID
} = require('../controllers/problemControllers');
const coAdminMiddleware = require('../middleware/coAdminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');

// Admin-only problem management routes
problemRouter.post('/create', coAdminMiddleware, createProblem);
problemRouter.put('/update/:id', coAdminMiddleware, updateProblem);
problemRouter.delete('/delete/:id', coAdminMiddleware, deleteProblem);

// Problem access routes
problemRouter.get('/problemById/:id', userMiddleware, getProblemById);
problemRouter.get('/getAllProblem', userMiddleware, getAllProblem);
problemRouter.get('/problemByIdForAdmin/:id', coAdminMiddleware, getProblemByIdForAdmin);
problemRouter.get('/search', userMiddleware, searchProblems);

// Daily Challenge routes
problemRouter.get('/daily', userMiddleware, getTodayChallenge); // Get today's active challenge
problemRouter.get('/daily/streak', userMiddleware, getUserStreak); // Get user's streak
problemRouter.post('/daily/set', coAdminMiddleware, setDailyChallenge); // Set a new daily challenge (admin)

// NOTE: Please clarify the purpose of getPreviousChallenges if it differs from
// getAllScheduledAndHistoricalDailyChallenges. If it's meant to get historical
// daily challenges, you might want to adjust its controller to use the new
// DailyChallengeHistory model or remove this route if `daily/all` covers it.
// problemRouter.get('/daily/previous', userMiddleware, getPreviousChallenges);

// Admin-specific daily challenge management (using DailyChallengeHistory)
problemRouter.get('/daily/all', coAdminMiddleware, getAllScheduledAndHistoricalDailyChallenges); // Get all scheduled and historical challenges for admin
problemRouter.delete('/daily/history/:id', coAdminMiddleware, deleteDailyChallenge); // Delete a specific daily challenge history record

module.exports = problemRouter;