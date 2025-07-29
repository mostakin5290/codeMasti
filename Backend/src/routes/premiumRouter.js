const express = require('express');
const premiumRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware'); // Assuming this path is correct
const { getPremiumDetails } = require('../controllers/premiumControllers');

premiumRouter.get('/details', userMiddleware, getPremiumDetails);

module.exports = premiumRouter;