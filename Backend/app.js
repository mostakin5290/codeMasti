const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./src/config/db');
const cookieParser = require('cookie-parser');
const redisClient = require('./src/config/redis');
const cors = require('cors');

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST','PUT', 'DELETE'],
    credentials: true,
    exposedHeaders: ['set-cookie']
}));

// Remove ALL other body-parsing middleware and replace with this:

// First: Raw body capture for webhook verification ONLY
app.use((req, res, next) => {
    if (req.originalUrl === '/payment/verify-payment') {
        let rawBody = '';
        req.setEncoding('utf8');
        req.on('data', (chunk) => { rawBody += chunk; });
        req.on('end', () => {
            req.rawBody = rawBody;
            // Manually parse JSON body since we're bypassing body-parser
            try {
                req.body = JSON.parse(rawBody);
            } catch (e) {
                console.error('Error parsing webhook JSON:', e);
                return res.status(400).send('Invalid JSON');
            }
            next();
        });
    } else {
        next();
    }
});

// Then add standard body parsers for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const userRouter = require('./src/routes/userRoute');
const problemRouter = require('./src/routes/problemRoute');
const submitRoute = require('./src/routes/submitRoutes');
const discussRoute = require('./src/routes/discussRoutes');
const aiRouter = require('./src/routes/aiRoutes');
const videoRouter = require('./src/routes/videoRoute');
const imageRoutes = require('./src/routes/imageRoutes');
const payRouter = require('./src/routes/razorpayRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const contestRoute = require('./src/routes/contestRoutes')
const playlistRouter = require('./src/routes/playlistRoutes')
const premiumRouter = require('./src/routes/premiumRouter');

app.use('/user', userRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRoute);
app.use('/admin', adminRoutes);
app.use('/discuss', discussRoute);
app.use('/contests', contestRoute);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);
app.use('/images', imageRoutes);
app.use('/payment', payRouter);
app.use('/playlist',playlistRouter);
app.use('/premium', premiumRouter);

const InitalizeConnection = async () => {
    try {
        await Promise.all([
            main(),
            redisClient.connect()
        ]);
        console.log('db Connected');
        app.listen(process.env.PORT, () => {
            console.log('Server started at port:' + process.env.PORT);
        }
    );
    } catch (err) {
        console.error("Error during server initialization:", err);
        process.exit(1);
    }
};

InitalizeConnection();