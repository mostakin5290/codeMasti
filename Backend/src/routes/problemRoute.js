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
    getDailyChallengeCalendarData,
    getAllScheduledAndHistoricalDailyChallenges,
    deleteDailyChallenge 
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
problemRouter.get('/daily', userMiddleware, getTodayChallenge); 
problemRouter.get('/daily/streak', userMiddleware, getUserStreak);
problemRouter.post('/daily/set', coAdminMiddleware, setDailyChallenge);

// NOTE: Please clarify the purpose of getPreviousChallenges if it differs from
// getAllScheduledAndHistoricalDailyChallenges. If it's meant to get historical
// daily challenges, you might want to adjust its controller to use the new
// DailyChallengeHistory model or remove this route if `daily/all` covers it.
// problemRouter.get('/daily/previous', userMiddleware, getPreviousChallenges);

// Admin-specific daily challenge management (using DailyChallengeHistory)
problemRouter.get('/daily/all', coAdminMiddleware, getAllScheduledAndHistoricalDailyChallenges);
problemRouter.delete('/daily/history/:id', coAdminMiddleware, deleteDailyChallenge); 
problemRouter.get('/daily/calendar', userMiddleware, getDailyChallengeCalendarData);

module.exports = problemRouter;