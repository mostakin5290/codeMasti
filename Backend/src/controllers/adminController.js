const User = require('../models/user.js');
const Problem = require('../models/problem.js');
const Submission = require('../models/submission.js');
const PremiumPlan = require('../models/PaymentPlan.js'); 

const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalProblems, totalSubmissions] = await Promise.all([
            User.countDocuments(),
            Problem.countDocuments(),
            Submission.countDocuments()
        ]);
        
        const usersByRole = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);
        const roleCounts = usersByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, { user: 0, admin: 0, 'co-admin': 0 }); 

        // Premium User Counts
        const premiumUsers = await User.countDocuments({ isPremium: true });
        const nonPremiumUsers = totalUsers - premiumUsers;

        // Recently Registered Users (e.g., last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsersLast30Days = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        // Problem Difficulty Counts
        const problemsByDifficulty = await Problem.aggregate([
            { $group: { _id: "$difficulty", count: { $sum: 1 } } }
        ]);
        const difficultyCounts = problemsByDifficulty.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, { Easy: 0, Medium: 0, Hard: 0 }); 

        // Submission Status Counts
        const submissionsByStatus = await Submission.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const statusCounts = submissionsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}); 

        // Top 5 Most Solved Problems
        const topSolvedProblems = await Submission.aggregate([
            { $match: { status: 'Accepted' } }, 
            { $group: { _id: "$problemId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'problems', 
                    localField: '_id',
                    foreignField: '_id',
                    as: 'problemDetails'
                }
            },
            { $unwind: '$problemDetails' }, 
            {
                $project: {
                    _id: 0,
                    title: '$problemDetails.title',
                    difficulty: '$problemDetails.difficulty',
                    solvedCount: '$count'
                }
            }
        ]);

        res.json({
            totalUsers,
            totalProblems,
            totalSubmissions,
            usersByRole: roleCounts,
            premiumUsers,
            nonPremiumUsers,
            newUsersLast30Days,
            problemsByDifficulty: difficultyCounts,
            submissionsByStatus: statusCounts,
            topSolvedProblems,
        });
    } catch (error) {
        console.error("Error in getDashboardStats:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });

        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const solvedCount = await Submission.countDocuments({
                    userId: user._id,
                    status: 'Accepted'
                });
                return { ...user.toObject(), problemsSolved: solvedCount };
            })
        );

        res.json(usersWithStats);
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userToDeleteId = req.params.id;
        const performingUser = req.user;

        if (performingUser._id.toString() === userToDeleteId) {
            return res.status(403).json({ message: 'You cannot delete your own account using this administrative route.' });
        }

        const userToDelete = await User.findById(userToDeleteId);

        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }
        // --- Permission Logic for Deletion ---
        if (userToDelete.role === 'admin' && performingUser.role === 'co-admin') {
            return res.status(403).json({
                message: 'Co-administrators are not authorized to delete admin accounts.'
            });
        }

        const adminCount = await User.countDocuments({ role: 'admin' });
        if (userToDelete.role === 'admin' && adminCount === 1) {
            return res.status(403).json({
                message: 'The last remaining admin account cannot be deleted via this route. Please ensure another admin account exists or reassign the role.'
            });
        }

        await User.deleteOne({ _id: userToDelete._id });
        res.json({ message: 'User removed successfully.' });
    } catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};

// Get the single site settings document
const getPremiumPlan = async (req, res) => {
    try {
        // Find the single settings document. If it doesn't exist, create it with default values.
        let settings = await PremiumPlan.findById('PremiumPlanSingleton');
        if (!settings) {
            settings = new PremiumPlan({ _id: 'PremiumPlanSingleton' });
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        console.error("Error in getPremiumPlan:", error);
        res.status(500).json({ message: "Server Error: Failed to fetch site settings." });
    }
};

// Update the single site settings document
const updatePremiumPlan = async (req, res) => {
    try {
        const { monthlyPlanPrice, yearlyPlanPrice } = req.body;

        if (monthlyPlanPrice !== undefined && (typeof monthlyPlanPrice !== 'number' || monthlyPlanPrice < 0)) {
            return res.status(400).json({ message: 'Monthly plan price must be a non-negative number.' });
        }
        if (yearlyPlanPrice !== undefined && (typeof yearlyPlanPrice !== 'number' || yearlyPlanPrice < 0)) {
            return res.status(400).json({ message: 'Yearly plan price must be a non-negative number.' });
        }

        const updateData = {};
        if (monthlyPlanPrice !== undefined) updateData.monthlyPlanPrice = monthlyPlanPrice;
        if (yearlyPlanPrice !== undefined) updateData.yearlyPlanPrice = yearlyPlanPrice;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        const updatedSettings = await PremiumPlan.findOneAndUpdate(
            { _id: 'PremiumPlanSingleton' },
            { $set: updateData },   
            { new: true, upsert: true, runValidators: true }
        );

        res.json(updatedSettings);
    } catch (error) {
        console.error("Error in updatePremiumPlan:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error updating site settings' });
    }
};

const createPremiumPlan = async (req, res) => {
    try {
        // Check if the singleton plan already exists
        const existingPlan = await PremiumPlan.findById('premiumPlanSingleton');
        if (existingPlan) {
            return res.status(400).json({ message: 'Premium plan already exists' });
        }

        // Create new plan using defaults or provided body
        const newPlan = new PremiumPlan({
            _id: 'premiumPlanSingleton',
            monthlyPlanPrice: req.body.monthlyPlanPrice,
            yearlyPlanPrice: req.body.yearlyPlanPrice,
        });

        await newPlan.save();
        res.status(201).json({ message: 'Premium plan created successfully', plan: newPlan });
    } catch (error) {
        console.error('Error creating premium plan:', error);
        res.status(500).json({ message: 'Server error' });
    }
};




module.exports = {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    getPremiumPlan,  
    updatePremiumPlan,
    createPremiumPlan 
};