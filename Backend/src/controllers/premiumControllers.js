const Subscription = require('../models/subscription');
const User = require('../models/user'); 

// Define a threshold for renewal alert (e.g., 5 days)
const RENEWAL_ALERT_THRESHOLD_DAYS = 5;

const getPremiumDetails = async (req, res) => {
    try {
        const userId = req.user._id; // `userMiddleware` should attach user info to req.user

        // Find the user to ensure they exist and have a premium subscription linked
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Check if the user is marked as premium and has an active subscription ID
        if (!user.isPremium || !user.activeSubscription) {
            return res.status(200).json({
                success: true,
                message: "User does not have an active premium subscription.",
                premiumDetails: {
                    isPremium: false // Explicitly state not premium
                }
            });
        }

        // Fetch the active subscription details using the ID from the user model
        const subscription = await Subscription.findById(user.activeSubscription);

        if (!subscription) {
            // This case might occur if activeSubscription ID is set but the subscription doc is deleted
            console.warn(`User ${userId} has activeSubscription ID but no matching subscription found.`);
            // Optionally, you might want to clean up user.activeSubscription and user.isPremium here
            return res.status(404).json({ success: false, message: "Active subscription record not found." });
        }

        // Calculate remaining time
        const now = new Date();
        const endDate = new Date(subscription.endDate); // Ensure endDate is a Date object

        let status = subscription.status; // Get status from DB
        let daysRemaining = 0;
        let hoursRemaining = 0;
        let minutesRemaining = 0;
        let needsRenewalAlert = false;
        let alertMessage = '';

        if (endDate <= now) {
            // Subscription has expired
            status = 'expired';
            // Optionally, you might want to automatically update user.isPremium to false here
            // and update subscription.status to 'expired' if it's not already
            // This is better handled by a cron job or a more robust expiry check process
            alertMessage = "Your premium subscription has expired.";
        } else {
            const diffMs = endDate.getTime() - now.getTime(); // Difference in milliseconds

            daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            secondsRemaining = Math.floor((diffMs % (1000 * 60)) / 1000);

            if (daysRemaining <= RENEWAL_ALERT_THRESHOLD_DAYS) {
                needsRenewalAlert = true;
                alertMessage = `Your premium subscription is ending in ${daysRemaining} days! Renew now to continue uninterrupted access.`;
            }
        }

        res.status(200).json({
            success: true,
            message: "Premium details fetched successfully.",
            premiumDetails: {
                isPremium: user.isPremium,
                plan: subscription.plan,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                currentStatus: status, // Status as per DB
                calculatedStatus: endDate <= now ? 'expired' : 'active', // Status based on real-time calculation
                daysRemaining,
                hoursRemaining,
                needsRenewalAlert,
                alertMessage
            }
        });

    } catch (error) {
        console.error("Error fetching premium details:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching premium details.",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
        });
    }
};

module.exports = { getPremiumDetails };