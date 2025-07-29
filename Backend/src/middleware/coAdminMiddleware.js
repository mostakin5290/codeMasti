const jwt = require('jsonwebtoken');
const User = require('../models/user');

const coAdminMiddleware = async (req, res, next) => {
    try {

        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: 'Authentication required: Please log in to access this resource.' });
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);

        if (!payload || !payload._id) {
            return res.status(401).json({ message: 'Authentication failed: Invalid token payload.' });
        }

        const user = await User.findById(payload._id);
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed: User not found.' });
        }


        if (user.role !== 'admin' && user.role !== 'co-admin') {
            return res.status(403).json({ message: 'Forbidden: Only administrators are authorized to perform this action.' });
        }

        req.user = user;
        next();

    } catch (err) {
        console.error("Co Admin Middleware Error:", err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Authentication failed: Token has expired.' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Authentication failed: Invalid token.' });
        }
        res.status(500).json({ message: err.message || 'An unexpected server error occurred during authentication.' });
    }
};

module.exports = coAdminMiddleware;