const Submission = require('../models/submission');
const User = require('../models/user');

const trackDailyChallenge = async (req, res, next) => {
    try {
        const submission = req.submission; // Assuming you attach this in submission controller
        
        if (submission.status !== 'Accepted') {
            return next();
        }

        const problem = await Problem.findById(submission.problemId);
        if (!problem?.isDailyChallenge) {
            return next();
        }

        const user = await User.findById(submission.userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastCompletion = user.dailyChallenges.completed.slice(-1)[0];
        const isConsecutive = lastCompletion && 
            new Date(lastCompletion.date).getTime() === today.getTime() - 86400000;

        // Update streak
        const newStreak = isConsecutive ? user.dailyChallenges.currentStreak + 1 : 1;
        
        await User.findByIdAndUpdate(submission.userId, {
            $push: {
                'dailyChallenges.completed': {
                    challengeId: submission.problemId,
                    date: today,
                    streak: newStreak
                }
            },
            $set: {
                'dailyChallenges.currentStreak': newStreak,
                'dailyChallenges.longestStreak': Math.max(
                    user.dailyChallenges.longestStreak,
                    newStreak
                )
            }
        });

        next();
    } catch (err) {
        console.error('Daily challenge tracking error:', err);
        next();
    }
};

module.exports = { trackDailyChallenge };