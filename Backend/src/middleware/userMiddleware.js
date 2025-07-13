const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const userMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        
        if (!token)
            return res.status(401).send('Token not present');

        const payload = jwt.verify(token, process.env.JWT_KEY);
        
        if (!payload || !payload._id) 
            return res.status(401).send('Invalid token');

        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) 
            return res.status(401).send('Session expired - please login again');

        const user = await User.findById(payload._id);
        if (!user)
            return res.status(404).send('User account not found');

        req.user = user;
        next();

    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError)
            return res.status(401).send('Invalid token');
        
        if (err instanceof jwt.TokenExpiredError)
            return res.status(401).send('Token expired');

        res.status(500).send('user not login');
    }
};

module.exports = userMiddleware;