const crypto = require('crypto');
const createRazorpayInstance = require('../utils/razorpay');
const Subscription = require('../models/subscription');
const User = require('../models/user');
const schedule = require('node-schedule');
const sendEmail = require('../utils/emailSender'); 


schedule.scheduleJob('*/5 * * * *', async () => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const result = await Subscription.deleteMany({
            status: 'pending',
            createdAt: { $lte: fiveMinutesAgo }
        });
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

        const receiptId = `sub_${userId}_${Math.floor(Date.now() / 1000)}`;

        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: receiptId,
            notes: {
                userId: userId.toString(),
                plan: plan,
            }
        };

        const order = await razorpay.orders.create(options);

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
        console.error("Error creating payment order:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while creating the order.",
            error: process.env.NODE_ENV === 'development' ? error : 'Internal Server Error'
        });
    }
};


const verifyPaymentAndSubscription = async (req, res) => {
    try {

        // Verify signature
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(req.rawBody); // Ensure req.rawBody is available
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

                // Find the subscription by order ID
                const subscription = await Subscription.findOne({
                    razorpayOrderId: payment.order_id
                });

                if (!subscription) {
                    console.error("Subscription not found for order:", payment.order_id);
                    return res.status(404).json({ status: "error", message: "Subscription not found" });
                }

                // Fetch user details for email
                const user = await User.findById(subscription.userId);
                if (!user) {
                    console.error("User not found for subscription:", subscription._id);
                    // Still proceed with subscription update, but log user not found for email
                }

                //Update the subscription
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

                // Update the user's premium status
                await User.findByIdAndUpdate(
                    subscription.userId,
                    {
                        isPremium: true,
                        activeSubscription: subscription._id
                    }
                );

                // Send success email
                if (user && user.emailId) {
                    const subject = `${process.env.APP_NAME} - Your Subscription Payment Was Successful! 🎉`;
                    const htmlContent = `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>${process.env.APP_NAME} - Payment Successful</title>
                            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
                        </head>
                        <body style="margin: 0; padding: 0; background-color: #f5f5ed; font-family: 'Poppins', Arial, sans-serif;">
                            <div style="min-height: 100vh; padding: 40px 20px; display: flex; align-items: center; justify-content: center;">
                                <div style="
                                    background: rgba(255, 255, 255, 0.95);
                                    border-radius: 20px;
                                    box-shadow: 
                                        0 25px 50px rgba(0, 0, 0, 0.15),
                                        0 0 0 1px rgba(255, 255, 255, 0.2);
                                    max-width: 600px;
                                    width: 100%;
                                    overflow: hidden;
                                ">
                                    <!-- Header with CodeMasti branding -->
                                    <div style="
                                        background: linear-gradient(135deg, #FF6F61 0%, #8A2BE2 100%); /* CodeMasti gradient */
                                        padding: 40px 30px;
                                        text-align: center;
                                        position: relative;
                                        overflow: hidden;
                                    ">
                                        <img src="../img/icon.png" alt="${process.env.APP_NAME} Logo" style="max-width: 120px; height: auto; display: block; margin: 0 auto 20px;">
                                        <h1 style="
                                            color: white;
                                            margin: 0;
                                            font-size: 30px;
                                            font-weight: 700;
                                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                                            letter-spacing: -0.5px;
                                        ">Payment Successful!</h1>
                                        <p style="
                                            color: rgba(255, 255, 255, 0.85);
                                            margin: 8px 0 0;
                                            font-size: 16px;
                                            font-weight: 300;
                                        ">Your subscription is now active.</p>
                                    </div>
                                    
                                    <!-- Main content -->
                                    <div style="padding: 40px 30px;">
                                        <p style="
                                            color: #4a5568;
                                            font-size: 16px;
                                            line-height: 1.6;
                                            margin: 0 0 25px;
                                        ">
                                            Dear ${user.firstName || 'Valued Customer'},
                                        </p>
                                        <p style="
                                            color: #4a5568;
                                            font-size: 16px;
                                            line-height: 1.6;
                                            margin: 0 0 30px;
                                        ">
                                            Thank you for your recent payment to ${process.env.APP_NAME}. We're excited to have you on board!
                                        </p>

                                        <h3 style="
                                            color: #2d3748;
                                            margin: 0 0 15px;
                                            font-size: 20px;
                                            font-weight: 600;
                                            border-bottom: 1px solid #eee;
                                            padding-bottom: 10px;
                                        ">Payment Details</h3>
                                        <ul style="list-style-type: none; padding: 0; margin: 0 0 30px;">
                                            <li style="margin-bottom: 10px; color: #555;"><strong>Payment ID:</strong> <span style="color: #333;">${payment.id}</span></li>
                                            <li style="margin-bottom: 10px; color: #555;"><strong>Order ID:</strong> <span style="color: #333;">${payment.order_id}</span></li>
                                            <li style="margin-bottom: 10px; color: #555;"><strong>Amount Paid:</strong> <span style="color: #333;">INR ${subscription.amount.toFixed(2)}</span></li>
                                            <li style="margin-bottom: 10px; color: #555;"><strong>Payment Date:</strong> <span style="color: #333;">${new Date(payment.created_at * 1000).toLocaleString()}</span></li>
                                            <li style="color: #555;"><strong>Payment Method:</strong> <span style="color: #333;">${payment.method} (${payment.card ? payment.card.type : 'N/A'})</span></li>
                                        </ul>

                                        <h3 style="
                                            color: #2d3748;
                                            margin: 0 0 15px;
                                            font-size: 20px;
                                            font-weight: 600;
                                            border-bottom: 1px solid #eee;
                                            padding-bottom: 10px;
                                        ">Subscription Details</h3>
                                        <ul style="list-style-type: none; padding: 0; margin: 0 0 30px;">
                                            <li style="margin-bottom: 10px; color: #555;"><strong>Plan:</strong> <span style="color: #333;">${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}</span></li>
                                            <li style="margin-bottom: 10px; color: #555;"><strong>Status:</strong> <span style="color: #333; font-weight: 600; color: #28a745;">Active</span></li>
                                            <li style="margin-bottom: 10px; color: #555;"><strong>Start Date:</strong> <span style="color: #333;">${new Date(updatedSubscription.startDate).toLocaleDateString()}</span></li>
                                            <li style="color: #555;"><strong>End Date:</strong> <span style="color: #333;">${new Date(updatedSubscription.endDate).toLocaleDateString()}</span></li>
                                        </ul>

                                        <p style="text-align: center; margin-top: 30px;">
                                            <a href="${process.env.APP_URL}/dashboard/subscriptions" style="
                                                display: inline-block;
                                                padding: 12px 25px;
                                                background: linear-gradient(135deg, #FF6F61, #8A2BE2); /* CodeMasti gradient for button */
                                                color: #ffffff;
                                                text-decoration: none;
                                                border-radius: 8px;
                                                font-weight: 600;
                                                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                                            ">Manage Your Subscription</a>
                                        </p>

                                        <p style="color: #4a5568; margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                                    </div>
                                    
                                    <!-- Footer -->
                                    <div style="
                                        background: linear-gradient(135deg, #f7fafc, #edf2f7); /* Soft light gradient */
                                        padding: 25px 30px;
                                        text-align: center;
                                        border-top: 1px solid #e2e8f0;
                                    ">
                                        <p style="
                                            color: #718096;
                                            font-size: 13px;
                                            margin: 0 0 10px;
                                            line-height: 1.5;
                                        ">
                                            Thank you,<br>The ${process.env.APP_NAME} Team
                                        </p>
                                        <div style="
                                            background: linear-gradient(135deg, #FF6F61, #8A2BE2); /* CodeMasti gradient for text */
                                            -webkit-background-clip: text;
                                            -webkit-text-fill-color: transparent;
                                            background-clip: text;
                                            font-size: 14px;
                                            font-weight: 700;
                                            margin: 0;
                                        ">
                                            © ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                    `;
                    await sendEmail(user.emailId, subject, htmlContent);
                }

                break;
            }

            case 'payment.failed': {
                const payment = payload.payment.entity;

                const subscription = await Subscription.findOneAndUpdate(
                    { razorpayOrderId: payment.order_id },
                    {
                        status: 'failed',
                        $inc: { paymentAttempts: 1 }
                    },
                    { new: true } 
                );

                let user = null;
                if (subscription) {
                    user = await User.findById(subscription.userId);
                }

                // Send failure email
                if (user && user.emailId) {
                    const subject = `${process.env.APP_NAME} - Your Payment Has Failed 😢`;
                    const htmlContent = `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>${process.env.APP_NAME} - Payment Failed</title>
                            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
                        </head>
                        <body style="margin: 0; padding: 0; background-color: #f5f5ed; font-family: 'Poppins', Arial, sans-serif;">
                            <div style="min-height: 100vh; padding: 40px 20px; display: flex; align-items: center; justify-content: center;">
                                <div style="
                                    background: rgba(255, 255, 255, 0.95);
                                    border-radius: 20px;
                                    box-shadow: 
                                        0 25px 50px rgba(0, 0, 0, 0.15),
                                        0 0 0 1px rgba(255, 255, 255, 0.2);
                                    max-width: 600px;
                                    width: 100%;
                                    overflow: hidden;
                                ">
                                    <!-- Header with CodeMasti branding -->
                                    <div style="
                                        background: linear-gradient(135deg, #FF6F61 0%, #8A2BE2 100%); /* CodeMasti gradient */
                                        padding: 40px 30px;
                                        text-align: center;
                                        position: relative;
                                        overflow: hidden;
                                    ">
                                        <img src="${process.env.APP_LOGO_URL}" alt="${process.env.APP_NAME} Logo" style="max-width: 120px; height: auto; display: block; margin: 0 auto 20px;">
                                        <h1 style="
                                            color: white;
                                            margin: 0;
                                            font-size: 30px;
                                            font-weight: 700;
                                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                                            letter-spacing: -0.5px;
                                        ">Payment Failed</h1>
                                        <p style="
                                            color: rgba(255, 255, 255, 0.85);
                                            margin: 8px 0 0;
                                            font-size: 16px;
                                            font-weight: 300;
                                        ">There was an issue processing your payment.</p>
                                    </div>
                                    
                                    <!-- Main content -->
                                    <div style="padding: 40px 30px;">
                                        <p style="
                                            color: #4a5568;
                                            font-size: 16px;
                                            line-height: 1.6;
                                            margin: 0 0 25px;
                                        ">
                                            Dear ${user.firstName || 'Valued Customer'},
                                        </p>
                                        <p style="
                                            color: #4a5568;
                                            font-size: 16px;
                                            line-height: 1.6;
                                            margin: 0 0 30px;
                                        ">
                                            We regret to inform you that your recent payment for your ${process.env.APP_NAME} subscription could not be processed.
                                        </p>

                                        <h3 style="
                                            color: #2d3748;
                                            margin: 0 0 15px;
                                            font-size: 20px;
                                            font-weight: 600;
                                            border-bottom: 1px solid #eee;
                                            padding-bottom: 10px;
                                        ">Payment Attempt Details</h3>
                                        <ul style="list-style-type: none; padding: 0; margin: 0 0 30px;">
                                            <li style="margin-bottom: 10px; color: #555;"><strong>Order ID:</strong> <span style="color: #333;">${payment.order_id}</span></li>
                                            <li style="margin-bottom: 10px; color: #555;"><strong>Amount Attempted:</strong> <span style="color: #333;">INR ${subscription ? subscription.amount.toFixed(2) : (payment.amount / 100).toFixed(2)}</span></li>
                                            <li style="margin-bottom: 10px; color: #555;"><strong>Failure Reason:</strong> <span style="color: #dc3545; font-weight: 600;">${payment.error_description || 'Unknown'}</span></li>
                                            <li style="color: #555;"><strong>Payment Date:</strong> <span style="color: #333;">${new Date(payment.created_at * 1000).toLocaleString()}</span></li>
                                        </ul>

                                        <p style="
                                            color: #4a5568;
                                            font-size: 16px;
                                            line-height: 1.6;
                                            margin: 0 0 25px;
                                            text-align: center;
                                        ">
                                            This could be due to various reasons (e.g., incorrect card details, insufficient funds, or bank issues).
                                        </p>
                                        <p style="text-align: center; margin-top: 30px;">
                                            <a href="${process.env.APP_URL}/checkout/retry/${payment.order_id}" style="
                                                display: inline-block;
                                                padding: 12px 25px;
                                                background: linear-gradient(135deg, #FF6F61, #8A2BE2); /* CodeMasti gradient for button */
                                                color: #ffffff;
                                                text-decoration: none;
                                                border-radius: 8px;
                                                font-weight: 600;
                                                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                                            ">Retry Payment</a>
                                        </p>
                                        <p style="color: #4a5568; margin-top: 25px; text-align: center;">
                                            Please log in to your account or try updating your payment method to reactivate your subscription.
                                        </p>
                                        <p style="color: #4a5568; margin-top: 30px;">If you need assistance, please contact our support team.</p>
                                    </div>
                                    
                                    <!-- Footer -->
                                    <div style="
                                        background: linear-gradient(135deg, #f7fafc, #edf2f7); /* Soft light gradient */
                                        padding: 25px 30px;
                                        text-align: center;
                                        border-top: 1px solid #e2e8f0;
                                    ">
                                        <p style="
                                            color: #718096;
                                            font-size: 13px;
                                            margin: 0 0 10px;
                                            line-height: 1.5;
                                        ">
                                            Thank you,<br>The ${process.env.APP_NAME} Team
                                        </p>
                                        <div style="
                                            background: linear-gradient(135deg, #FF6F61, #8A2BE2); /* CodeMasti gradient for text */
                                            -webkit-background-clip: text;
                                            -webkit-text-fill-color: transparent;
                                            background-clip: text;
                                            font-size: 14px;
                                            font-weight: 700;
                                            margin: 0;
                                        ">
                                            © ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                    `;
                    await sendEmail(user.emailId, subject, htmlContent);
                }

                break;
            }

            default:
                return res.status(200).json({ status: "ok", message: "Unhandled event type" });
        }

        return res.status(200).json({ status: "ok" });

    } catch (error) {
        console.error("Webhook processing error:", error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

module.exports = { createOrder, verifyPaymentAndSubscription };