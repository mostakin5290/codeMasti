const User = require('../models/user.js');
const Problem = require('../models/problem.js');
const Submission = require('../models/submission.js');
const SiteContent = require('../models/siteContentModel.js');

const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalProblems, totalSubmissions] = await Promise.all([
            User.countDocuments(),
            Problem.countDocuments(),
            Submission.countDocuments()
        ]);
        res.json({ totalUsers, totalProblems, totalSubmissions });
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
        // --- Permission Logic for Deletion (Same as adminDeleteUser) ---
        // 1. Co-admin CANNOT delete an admin.
        if (userToDelete.role === 'admin' && performingUser.role === 'co-admin') {
            return res.status(403).json({
                message: 'Co-administrators are not authorized to delete admin accounts.'
            });
        }

        // 2. The primary (and only) admin cannot be deleted via this route.
        if (userToDelete.role === 'admin' && performingUser.role === 'admin') {
            return res.status(403).json({
                message: 'The primary admin account cannot be deleted via this route. Please reassign the admin role first if needed.'
            });
        }

        await User.deleteOne({ _id: userToDelete._id });
        res.json({ message: 'User removed successfully.' });
    } catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};

const getSiteContent = async (req, res) => {
    try {
        const content = await SiteContent.findOne({ key: req.params.key });
        if (content) {
            res.json(content);
        } else {
            res.json({ key: req.params.key, content: `Welcome to the ${req.params.key} page! Please add your content.` });
        }
    } catch (error) {
        console.error("Error in getSiteContent:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const updateSiteContent = async (req, res) => {
    try {
        const { content } = req.body;
        const updatedContent = await SiteContent.findOneAndUpdate(
            { key: req.params.key },
            { content },
            { new: true, upsert: true }
        );
        res.json(updatedContent);
    } catch (error) {
        console.error("Error in updateSiteContent:", error);
        res.status(500).json({ message: 'Error updating content' });
    }
};


module.exports = {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    getSiteContent,
    updateSiteContent,

};