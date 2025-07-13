const crypto = require('crypto');
const createRazorpayInstance = require('../utils/razorpay');
const Subscription = require('../models/subscription');
const User = require('../models/user');
const schedule = require('node-schedule');

schedule.scheduleJob('*/5 * * * *', async () => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const result = await Subscription.deleteMany({
            status: 'pending',
            createdAt: { $lte: fiveMinutesAgo }
        });

        if (result.deletedCount > 0) {
            console.log(`Cleaned up ${result.deletedCount} pending subscriptions`);
        }
    } catch (error) {
        console.error('Error cleaning up pending subscriptions:', error);
    }
});

const calculateEndDate = (plan) => {
    const now = new Date();
    if (plan === 'monthly') {
        now.setMonth(now.getMonth() + 1);
    } else if (plan === 'yearly') {
        now.setFullYear(now.getFullYear() + 1);
    }
    return now;
};

const createOrder = async (req, res) => {
    try {
        const razorpay = createRazorpayInstance();
        const userId = req.user._id;

        // Enhanced input validation
        const { amount, plan } = req.body;
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid positive amount is required."
            });
        }

        if (!plan || !['monthly', 'yearly'].includes(plan)) {
            return res.status(400).json({
                success: false,
                message: "Valid subscription plan (monthly/yearly) is required."
            });
        }

        // Check existing subscriptions with better error messaging
        const existingSubscription = await Subscription.findOne({
            userId: userId,
            status: { $in: ['active', 'pending'] }
        }).lean();

        if (existingSubscription) {
            const message = existingSubscription.status === 'active'
                ? "You already have an active subscription."
                : "You have a pending subscription. Please complete that payment first.";

            return res.status(409).json({
                success: false,
                message,
                existingSubscriptionId: existingSubscription._id
            });
        }

        // Generate receipt ID with additional validation
        const timestampSec = Math.floor(Date.now() / 1000);
        if (!userId || typeof userId.toString !== 'function') {
            throw new Error("Invalid user ID format");
        }
        const receiptId = `sub_${userId.toString()}_${timestampSec}`;

        // Validate Razorpay instance
        if (!razorpay || typeof razorpay.orders.create !== 'function') {
            throw new Error("Razorpay instance not properly initialized");
        }

        // Create Razorpay order with timeout
        const options = {
            amount: Math.round(amount * 100), // Ensure integer value
            currency: "INR",
            receipt: receiptId,
            notes: {
                userId: userId.toString(),
                plan: plan,
            }
        };

        const order = await Promise.race([
            razorpay.orders.create(options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Razorpay order creation timeout")), 10000)
            )
        ]);

        // Create subscription record with additional validation
        const subscriptionData = {
            userId: userId,
            plan: plan,
            amount: amount,
            currency: "INR",
            startDate: new Date(),
            endDate: calculateEndDate(plan),
            razorpayOrderId: order.id,
            status: 'pending',
            paymentAttempts: 1
        };

        const newSubscription = await Subscription.create(subscriptionData);

        return res.status(201).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
            subscriptionId: newSubscription._id
        });

    } catch (error) {
        console.error("Error in createOrder:", {
            error: error.message,
            stack: error.stack,
            requestBody: req.body,
            userId: req.user?._id
        });

        // Specific error messages for common cases
        let userMessage = "Something went wrong while creating the order.";
        if (error.message.includes("currency")) {
            userMessage = "Invalid currency specified";
        } else if (error.message.includes("amount")) {
            userMessage = "Invalid amount specified";
        } else if (error.message.includes("timeout")) {
            userMessage = "Payment service timeout. Please try again.";
        }

        res.status(500).json({
            success: false,
            message: userMessage,
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                type: error.constructor.name
            } : undefined
        });
    }
};


const verifyPaymentAndSubscription = async (req, res) => {
    try {

        // Verify signature
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(req.rawBody);
        const digest = shasum.digest('hex');

        if (digest !== req.headers['x-razorpay-signature']) {
            console.warn("Signature verification FAILED!");
            return res.status(400).json({ status: "error", message: "Invalid signature" });
        }

        // Process the event
        const { event, payload } = req.body;

        switch (event) {
            case 'payment.captured': {
                const payment = payload.payment.entity;

                // 1. Find the subscription by order ID
                const subscription = await Subscription.findOne({
                    razorpayOrderId: payment.order_id
                });

                if (!subscription) {
                    console.error("Subscription not found for order:", payment.order_id);
                    return res.status(404).json({ status: "error", message: "Subscription not found" });
                }

                // 2. Update the subscription
                const updatedSubscription = await Subscription.findByIdAndUpdate(
                    subscription._id,
                    {
                        status: 'active',
                        razorpayPaymentId: payment.id,
                        paymentDate: new Date(),
                        $inc: { paymentAttempts: 1 }
                    },
                    { new: true }
                );

                // 3. Update the user's premium status
                await User.findByIdAndUpdate(
                    subscription.userId,
                    {
                        isPremium: true,
                        activeSubscription: subscription._id
                    }
                );

                break;
            }

            case 'payment.failed': {
                const payment = payload.payment.entity;

                await Subscription.findOneAndUpdate(
                    { razorpayOrderId: payment.order_id },
                    {
                        status: 'failed',
                        $inc: { paymentAttempts: 1 }
                    }
                );
                break;
            }

            default:
                return res.status(400).json({ status: "error", message: "Unhandled event type" });
        }

        return res.status(200).json({ status: "ok" });

    } catch (error) {
        console.error("Webhook processing error:", error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};


module.exports = { createOrder, verifyPaymentAndSubscription };