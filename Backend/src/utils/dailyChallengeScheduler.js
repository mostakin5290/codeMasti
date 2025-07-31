const cron = require('node-cron');
const Problem = require('../models/problem');
const DailyChallengeHistory = require('../models/DailyChallengeHistory');

class DailyChallengeScheduler {
    constructor() {
        this.isRunning = false;
        this.cronJob = null; // Initialize as null
    }

    // Start the automated scheduler
    start() {
        if (this.isRunning) {
            console.log('Daily challenge scheduler is already running');
            return;
        }

        // Schedule to run every day at 12:00 AM (00:00)
        this.cronJob = cron.schedule('0 0 * * *', async () => {
            console.log('🕛 Running daily challenge scheduler at:', new Date().toISOString());
            await this.setTodayChallenge();
        }, {
            scheduled: true,
            timezone: "UTC" // Use UTC to ensure consistency
        });

        this.isRunning = true;
        console.log('✅ Daily challenge scheduler started - will run every day at 12:00 AM UTC');

        // Also run immediately on startup to ensure today has a challenge
        this.setTodayChallenge();
    }

    // Stop the scheduler
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null; // Reset to null
            this.isRunning = false;
            console.log('⏹️ Daily challenge scheduler stopped');
        }
    }

    // Main function to set today's challenge
    async setTodayChallenge() {
        try {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            console.log(`🎯 Setting daily challenge for: ${today.toISOString().split('T')[0]}`);

            // Check if today already has a challenge
            const existingChallenge = await DailyChallengeHistory.findOne({ 
                challengeDate: today 
            });

            if (existingChallenge) {
                console.log(`✅ Daily challenge already exists for today: ${existingChallenge.title}`);
                await this.ensureProblemFlags(existingChallenge.problemId, today);
                return;
            }

            // Get a suitable problem for today's challenge
            const selectedProblem = await this.selectDailyChallengeQuestion();

            if (!selectedProblem) {
                console.error('❌ No suitable problem found for daily challenge');
                return;
            }

            // Create history entry
            const historyEntry = await DailyChallengeHistory.create({
                problemId: selectedProblem._id,
                challengeDate: today,
                title: selectedProblem.title,
                difficulty: selectedProblem.difficulty
            });

            // Update the problem flags
            await this.ensureProblemFlags(selectedProblem._id, today);

            console.log(`🎉 Daily challenge set successfully: ${selectedProblem.title} (${selectedProblem.difficulty})`);

        } catch (error) {
            console.error('❌ Error setting daily challenge:', error);
        }
    }

    // Ensure the problem has correct daily challenge flags
    async ensureProblemFlags(problemId, challengeDate) {
        try {
            // Clear previous daily challenge flags
            await Problem.updateMany(
                { isDailyChallenge: true, _id: { $ne: problemId } },
                { $set: { isDailyChallenge: false, dailyChallengeDate: null } }
            );

            // Set current problem as daily challenge
            await Problem.findByIdAndUpdate(problemId, {
                $set: { 
                    isDailyChallenge: true, 
                    dailyChallengeDate: challengeDate 
                }
            });

        } catch (error) {
            console.error('Error updating problem flags:', error);
        }
    }

    // Smart algorithm to select daily challenge question
    async selectDailyChallengeQuestion() {
        try {
            const today = new Date();
            const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

            // Get recently used problems to avoid repetition
            const recentChallenges = await DailyChallengeHistory.find({
                challengeDate: { $gte: thirtyDaysAgo }
            }).distinct('problemId');

            // Define difficulty distribution
            const difficultyDistribution = this.getDifficultyForToday();

            // Find suitable problems excluding recent ones
            const candidateProblems = await Problem.find({
                _id: { $nin: recentChallenges },
                difficulty: difficultyDistribution,
                $expr: {
                    $gt: [
                        { $add: [{ $size: "$visibleTestCases" }, { $size: "$hiddenTestCases" }] },
                        0
                    ]
                }
            });

            if (candidateProblems.length === 0) {
                // If no candidates, fall back to any available problem
                console.log('⚠️ No unused problems found, selecting from all available problems');
                const fallbackProblems = await Problem.find({
                    difficulty: difficultyDistribution,
                    $expr: {
                        $gt: [
                            { $add: [{ $size: "$visibleTestCases" }, { $size: "$hiddenTestCases" }] },
                            0
                        ]
                    }
                });
                return this.selectRandomProblem(fallbackProblems);
            }

            return this.selectRandomProblem(candidateProblems);

        } catch (error) {
            console.error('Error selecting daily challenge question:', error);
            return null;
        }
    }

    // Determine difficulty based on day of week
    getDifficultyForToday() {
        const today = new Date();
        const dayOfWeek = today.getUTCDay(); // 0 = Sunday, 6 = Saturday

        switch (dayOfWeek) {
            case 0: // Sunday - Easy start to the week
            case 6: // Saturday - Weekend easy
                return 'easy';
            case 1: // Monday - Medium
            case 3: // Wednesday - Medium
            case 5: // Friday - Medium
                return 'medium';
            case 2: // Tuesday - Hard
            case 4: // Thursday - Hard
                return 'hard';
            default:
                return 'medium';
        }
    }

    // Select random problem from candidates
    selectRandomProblem(problems) {
        if (problems.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * problems.length);
        return problems[randomIndex];
    }

    // Method to manually trigger today's challenge
    async triggerManually() {
        console.log('🔄 Manually triggering daily challenge setup...');
        await this.setTodayChallenge();
    }

    // Get scheduler status - FIXED METHOD
    getStatus() {
        try {
            let nextRun = null;
            
            // Check if cronJob exists and has the nextDates method
            if (this.cronJob && typeof this.cronJob.nextDates === 'function') {
                const nextDates = this.cronJob.nextDates(1); // Get next 1 execution
                if (nextDates && nextDates.length > 0) {
                    nextRun = nextDates[0];
                }
            }
            
            return {
                running: this.isRunning,
                nextRun: nextRun,
                cronPattern: '0 0 * * *',
                timezone: 'UTC',
                lastChecked: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting scheduler status:', error);
            return {
                running: this.isRunning,
                nextRun: null,
                error: error.message
            };
        }
    }
}

module.exports = new DailyChallengeScheduler();
