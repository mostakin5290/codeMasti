const cloudinary = require('cloudinary').v2;
const User = require("../models/user");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateImageUploadSignature = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const timestamp = Math.round(new Date().getTime() / 1000);
        const publicId = `codemasti/avatars/${userId}_${timestamp}`;
        
        // Define transformations as a string in Cloudinary format
        const transformationString = "c_fill,g_face,w_200,h_200,q_auto:low";
        
        // Prepare upload parameters in EXACT order required for signing
        const paramsToSign = {
            eager: transformationString,
            public_id: publicId,
            timestamp: timestamp,
            transformation: transformationString
        };

        // Generate signature - IMPORTANT: Must use the exact same parameter order
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        // Return response with all needed parameters
        res.status(200).json({
            success: true,
            signature,
            timestamp,
            public_id: publicId,
            api_key: process.env.CLOUDINARY_API_KEY,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
            transformation: transformationString,
            eager: transformationString
        });

    } catch (error) {
        console.error('Error generating image upload signature:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate image upload credentials',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const deleteImage = async (req, res) => {
    try {
        const { publicId } = req.body;
        const userId = req.user._id;

        if (!publicId) {
            return res.status(400).json({ 
                success: false,
                error: 'Public ID is required for image deletion' 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        // Only allow deletion if the publicId matches the user's current avatarPublicId
        if (user.avatarPublicId !== publicId) {
            return res.status(403).json({ 
                success: false,
                error: 'Unauthorized: This image does not belong to your profile' 
            });
        }

        const result = await cloudinary.uploader.destroy(publicId, { 
            resource_type: 'image', 
            invalidate: true 
        });

        if (result.result !== 'ok') {
            return res.status(404).json({ 
                success: false,
                error: 'Image not found on Cloudinary' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Image deleted successfully',
            data: result
        });

    } catch (error) {
        console.error('Error deleting image:', error);
        
        let status = 500;
        let errorMessage = 'Failed to delete image';
        
        if (error.http_code === 404) {
            status = 404;
            errorMessage = 'Image not found on Cloudinary';
        }

        res.status(status).json({ 
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    generateImageUploadSignature,
    deleteImage
};