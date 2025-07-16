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
problemRouter.get('/daily/previous', userMiddleware, getPreviousChallenges);
problemRouter.delete('/daily/:id', coAdminMiddleware, deleteDailyChallenge);
module.exports = problemRouter;