// backend/routes/imageRoutes.js
const express = require('express');
const imageRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware'); // Assuming this exists for authenticated users
const {
    generateImageUploadSignature, // Now actively used
    deleteImage
} = require('../controllers/imageUploadController');

// Route to generate a signed upload signature
imageRouter.get('/signature', userMiddleware, generateImageUploadSignature);

// Route to delete an image from Cloudinary
imageRouter.post('/delete', userMiddleware, deleteImage);

module.exports = imageRouter;