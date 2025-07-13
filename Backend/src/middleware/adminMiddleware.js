// Path: backend/middleware/adminMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const adminMiddleware = async(req, res, next) => {
    try {
        // You are correctly reading the token from cookies
        const { token } = req.cookies; 
        
        if (!token) {
            // Be explicit about missing token
            return res.status(401).json({ message: 'Authentication required: Please log in to access this resource.' });
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        
        // Ensure payload has _id and check the role
        if (!payload || !payload._id) {
            return res.status(401).json({ message: 'Authentication failed: Invalid token payload.' });
        }

        const user = await User.findById(payload._id); // Renamed adminUser to user for consistency
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed: User not found.' });
        }

        // IMPORTANT: Check if the user actually has the 'admin' role from the database
        // This is more reliable than just trusting the JWT payload for role,
        // as roles can change, or the JWT might not contain a fresh role.
        if (user.role !== 'admin') { 
            return res.status(403).json({ message: 'Forbidden: Only administrators are authorized to perform this action.' });
        }

        // CRITICAL FIX: Assign the user object to `req.user`
        req.user = user; 
        next(); // Proceed to the next middleware/route handler

    } catch(err) {
        console.error("Admin Middleware Error:", err); // Log the actual error for debugging
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Authentication failed: Token has expired.' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Authentication failed: Invalid token.' });
        }
        // Catch any other unexpected errors
        res.status(500).json({ message: err.message || 'An unexpected server error occurred during authentication.' });
    }
};

module.exports = adminMiddleware;