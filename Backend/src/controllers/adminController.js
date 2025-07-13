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
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot delete an admin account.' });
            }
            await User.deleteOne({ _id: user._id });
            // Optional: Also delete user's submissions
            // await Submission.deleteMany({ userId: user._id });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
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

// @desc    Update site content
// @route   PUT /api/admin/site-content/:key
// @access  Private/Admin
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
    updateSiteContent
};