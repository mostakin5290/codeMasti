const express = require('express');
const aiRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const {solveDoubt,analyzeCode,help } = require('../controllers/aiControllers');


aiRouter.post('/chat', userMiddleware, solveDoubt);
aiRouter.post('/analysis', userMiddleware, analyzeCode);
aiRouter.post('/help', userMiddleware, help);

module.exports = aiRouter;