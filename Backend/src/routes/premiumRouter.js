const express = require('express');
const premiumRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware'); // Assuming this path is correct
const { getPremiumDetails } = require('../controllers/premiumControllers');

// Route to get premium subscription details for the logged-in user
premiumRouter.get('/details', userMiddleware, getPremiumDetails);

module.exports = premiumRouter;