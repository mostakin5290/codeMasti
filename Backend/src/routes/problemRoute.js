// problemRouter.js
const express = require('express');
const problemRouter = express.Router();
const {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblem,
    getProblemByIdForAdmin,
    searchProblems,
    getTodayChallenge,
    getUserStreak,
    setDailyChallenge,
    getDailyChallengeCalendarData,
    getAllScheduledAndHistoricalDailyChallenges,
    deleteDailyChallenge 
} = require('../controllers/problemControllers');
const coAdminMiddleware = require('../middleware/coAdminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');

// Import the daily challenge scheduler for management endpoints
const dailyChallengeScheduler = require('../utils/dailyChallengeScheduler');

// Admin-only problem management routes
problemRouter.post('/create', coAdminMiddleware, createProblem);
problemRouter.put('/update/:id', coAdminMiddleware, updateProblem);
problemRouter.delete('/delete/:id', coAdminMiddleware, deleteProblem);

// Problem access routes
problemRouter.get('/problemById/:id', userMiddleware, getProblemById);
problemRouter.get('/getAllProblem', userMiddleware, getAllProblem);
problemRouter.get('/problemByIdForAdmin/:id', coAdminMiddleware, getProblemByIdForAdmin);
problemRouter.get('/search', userMiddleware, searchProblems);

// Daily Challenge routes
problemRouter.get('/daily', userMiddleware, getTodayChallenge); 
problemRouter.get('/daily/streak', userMiddleware, getUserStreak);
problemRouter.post('/daily/set', coAdminMiddleware, setDailyChallenge);

// Admin-specific daily challenge management (using DailyChallengeHistory)
problemRouter.get('/daily/all', coAdminMiddleware, getAllScheduledAndHistoricalDailyChallenges);
problemRouter.delete('/daily/history/:id', coAdminMiddleware, deleteDailyChallenge); 
problemRouter.get('/daily/calendar', userMiddleware, getDailyChallengeCalendarData);

// =====================================================
// DAILY CHALLENGE SCHEDULER MANAGEMENT ROUTES
// =====================================================

// Get scheduler status - Admin only
problemRouter.get('/daily/scheduler/status', coAdminMiddleware, (req, res) => {
    try {
        const status = dailyChallengeScheduler.getStatus();
        res.status(200).json({
            success: true,
            message: 'Daily challenge scheduler status retrieved',
            data: {
                running: status.running,
                nextRun: status.nextRun ? status.nextRun.toString() : null,
                timezone: 'UTC',
                cronPattern: '0 0 * * *', // Every day at 12:00 AM UTC
                lastChecked: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error getting scheduler status:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving scheduler status',
            error: error.message
        });
    }
});

// Manually trigger daily challenge setup - Admin only
problemRouter.post('/daily/scheduler/trigger', coAdminMiddleware, async (req, res) => {
    try {
        console.log(`🔄 Manual trigger requested by admin: ${req.user?.emailId || 'Unknown'}`);
        
        await dailyChallengeScheduler.triggerManually();
        
        res.status(200).json({ 
            success: true,
            message: 'Daily challenge setup triggered manually',
            timestamp: new Date().toISOString(),
            triggeredBy: req.user?.emailId || 'Unknown admin'
        });
    } catch (error) {
        console.error('Error manually triggering daily challenge setup:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error triggering daily challenge setup', 
            error: error.message 
        });
    }
});

// Restart the scheduler - Admin only (useful for maintenance)
problemRouter.post('/daily/scheduler/restart', coAdminMiddleware, (req, res) => {
    try {
        console.log(`🔄 Scheduler restart requested by admin: ${req.user?.emailId || 'Unknown'}`);
        
        dailyChallengeScheduler.stop();
        dailyChallengeScheduler.start();
        
        const status = dailyChallengeScheduler.getStatus();
        
        res.status(200).json({ 
            success: true,
            message: 'Daily challenge scheduler restarted successfully',
            data: {
                running: status.running,
                nextRun: status.nextRun ? status.nextRun.toString() : null,
                restartedBy: req.user?.emailId || 'Unknown admin',
                restartedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error restarting scheduler:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error restarting scheduler', 
            error: error.message 
        });
    }
});

// Stop the scheduler - Admin only (emergency stop)
problemRouter.post('/daily/scheduler/stop', coAdminMiddleware, (req, res) => {
    try {
        console.log(`⏹️ Scheduler stop requested by admin: ${req.user?.emailId || 'Unknown'}`);
        
        dailyChallengeScheduler.stop();
        
        res.status(200).json({ 
            success: true,
            message: 'Daily challenge scheduler stopped successfully',
            stoppedBy: req.user?.emailId || 'Unknown admin',
            stoppedAt: new Date().toISOString(),
            warning: 'Daily challenges will not be automatically set until scheduler is restarted'
        });
    } catch (error) {
        console.error('Error stopping scheduler:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error stopping scheduler', 
            error: error.message 
        });
    }
});

// Start the scheduler - Admin only (after emergency stop)
problemRouter.post('/daily/scheduler/start', coAdminMiddleware, (req, res) => {
    try {
        console.log(`▶️ Scheduler start requested by admin: ${req.user?.emailId || 'Unknown'}`);
        
        dailyChallengeScheduler.start();
        
        const status = dailyChallengeScheduler.getStatus();
        
        res.status(200).json({ 
            success: true,
            message: 'Daily challenge scheduler started successfully',
            data: {
                running: status.running,
                nextRun: status.nextRun ? status.nextRun.toString() : null,
                startedBy: req.user?.emailId || 'Unknown admin',
                startedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error starting scheduler:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error starting scheduler', 
            error: error.message 
        });
    }
});

// Get detailed scheduler configuration - Admin only
problemRouter.get('/daily/scheduler/config', coAdminMiddleware, (req, res) => {
    try {
        const status = dailyChallengeScheduler.getStatus();
        
        res.status(200).json({
            success: true,
            message: 'Scheduler configuration retrieved',
            data: {
                status: status.running ? 'running' : 'stopped',
                nextRun: status.nextRun ? status.nextRun.toString() : null,
                configuration: {
                    cronPattern: '0 0 * * *',
                    timezone: 'UTC',
                    description: 'Runs every day at 12:00 AM UTC',
                    lookbackDays: 30,
                    difficultyDistribution: {
                        sunday: 'easy',
                        monday: 'medium', 
                        tuesday: 'hard',
                        wednesday: 'medium',
                        thursday: 'hard',
                        friday: 'medium',
                        saturday: 'easy'
                    }
                },
                systemInfo: {
                    serverTime: new Date().toISOString(),
                    uptime: process.uptime(),
                    nodeVersion: process.version
                }
            }
        });
    } catch (error) {
        console.error('Error getting scheduler config:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving scheduler configuration',
            error: error.message
        });
    }
});

module.exports = problemRouter;
