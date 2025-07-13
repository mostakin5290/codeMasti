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

        const { amount, plan } = req.body;

        if (!amount || !plan) {
            return res.status(400).json({ success: false, message: "Amount and plan are required." });
        }
        if (!['monthly', 'yearly'].includes(plan)) {
            return res.status(400).json({ success: false, message: "Invalid subscription plan." });
        }

        // Check if the user already has an active or pending subscription
        const existingSubscription = await Subscription.findOne({
            userId: userId,
            status: { $in: ['active', 'pending'] }
        });

        if (existingSubscription) {
            return res.status(409).json({
                success: false,
                message: `You already have an ${existingSubscription.status} subscription. Please complete the payment or manage your existing subscription.`,
            });
        }

        // --- FIX IS HERE ---
        // Generate a shorter, unique receipt ID using Unix timestamp (seconds)
        const receiptId = `sub_${userId}_${Math.floor(Date.now() / 1000)}`;

        // New Length Calculation: 4 (sub_) + 24 (userId) + 1 (_) + 10 (timestamp) = 39 characters. This is valid.

        // Create the Razorpay order
        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: receiptId, // Use the new shorter receiptId
            notes: {
                userId: userId.toString(),
                plan: plan,
            }
        };

        const order = await razorpay.orders.create(options);

        // Create a 'pending' subscription record in the database
        await Subscription.create({
            userId: userId,
            plan: plan,
            amount: amount,
            currency: "INR",
            startDate: new Date(),
            endDate: calculateEndDate(plan),
            razorpayOrderId: order.id,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        // This is where your error was being caught
        console.error("Error creating payment order:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while creating the order.",
            // It's good practice to not expose the raw error object to the client in production
            error: process.env.NODE_ENV === 'development' ? error : 'Internal Server Error'
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