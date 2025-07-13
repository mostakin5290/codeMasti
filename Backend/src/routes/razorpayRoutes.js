const express = require('express');
const payRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { createOrder, verifyPaymentAndSubscription } = require('../controllers/rezorpayController'); 

payRouter.post('/create-order', userMiddleware, createOrder);
payRouter.post('/verify-payment', verifyPaymentAndSubscription);
module.exports = payRouter;