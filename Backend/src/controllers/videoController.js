const cloudinary = require('cloudinary').v2;
const Problem = require("../models/problem");
const User = require("../models/user"); // Not directly used here, but good to have if needed elsewhere
const SolutionVideo = require("../models/video");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateUploadSignature = async (req, res) => {
    try {
        const { problemId } = req.params;

        // --- FIX HERE: Change req.result._id to req.admin._id ---
        const userId = req.admin._id;
        // --- End FIX ---

        // Verify problem exists
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Generate unique public_id for the video
        const timestamp = Math.round(new Date().getTime() / 1000);
        const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;

        // Upload parameters
        const uploadParams = {
            timestamp: timestamp,
            public_id: publicId,
        };

        // Generate signature
        const signature = cloudinary.utils.api_sign_request(
            uploadParams,
            process.env.CLOUDINARY_API_SECRET
        );

        res.json({
            signature,
            timestamp,
            public_id: publicId,
            api_key: process.env.CLOUDINARY_API_KEY,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
        });

    } catch (error) {
        console.error('Error generating upload signature:', error);
        res.status(500).json({ error: 'Failed to generate upload credentials' });
    }
};


const saveVideoMetadata = async (req, res) => {
    try {
        const {
            problemId,
            cloudinaryPublicId,
            secureUrl,
            duration,
        } = req.body;

        // --- FIX HERE: Change req.result._id to req.admin._id ---
        const userId = req.admin._id;
        // --- End FIX ---

        // Verify the upload with Cloudinary
        const cloudinaryResource = await cloudinary.api.resource(
            cloudinaryPublicId,
            { resource_type: 'video' }
        );

        if (!cloudinaryResource) {
            return res.status(400).json({ error: 'Video not found on Cloudinary' });
        }

        // Check if video already exists for this problem and user
        // Note: cloudinaryPublicId is unique, so checking just that might be enough
        const existingVideo = await SolutionVideo.findOne({
            cloudinaryPublicId // This field is unique by schema definition
            // problemId, // You might remove these if cloudinaryPublicId is globally unique per asset
            // userId,    // You might remove these if cloudinaryPublicId is globally unique per asset
        });

        if (existingVideo) {
            // If the same video was uploaded again (same publicId), it's a conflict
            return res.status(409).json({ error: 'This specific video asset (public ID) has already been saved.' });
        }

        // Generate a new thumbnail URL (updated for clarity, it uses the public_id from CloudinaryResource)
        const thumbnailUrl = cloudinary.url(cloudinaryResource.public_id, {
            resource_type: 'image',
            transformation: [
                { width: 400, height: 225, crop: 'fill' },
                { quality: 'auto' },
                { start_offset: 'auto' } // Use an auto start offset for thumbnails
            ],
            format: 'jpg'
        });

        // Create video solution record
        const videoSolution = await SolutionVideo.create({
            problemId,
            userId,
            cloudinaryPublicId,
            secureUrl,
            duration: cloudinaryResource.duration || duration, // Prioritize Cloudinary's duration
            thumbnailUrl
        });

        res.status(201).json({
            message: 'Video solution saved successfully',
            videoSolution: {
                id: videoSolution._id,
                thumbnailUrl: videoSolution.thumbnailUrl,
                duration: videoSolution.duration,
                uploadedAt: videoSolution.createdAt,
                problemId: videoSolution.problemId, // Include problemId for frontend state update
                cloudinaryPublicId: videoSolution.cloudinaryPublicId, // Include for consistency
                secureUrl: videoSolution.secureUrl // Include for consistency
            }
        });

    } catch (error) {
        console.error('Error saving video metadata:', error);
        // Handle specific Mongoose duplicate key error if you want to be more precise
        if (error.code === 11000) { // Duplicate key error code for MongoDB
            return res.status(409).json({ error: 'A video with this public ID already exists in the database.' });
        }
        res.status(500).json({ error: 'Failed to save video metadata' });
    }
};


const deleteVideo = async (req, res) => {
    try {
        const { videoId } = req.params; // Changed to videoId
        // --- FIX HERE: Change req.result._id to req.admin._id ---
        const userId = req.admin._id; // Admin's ID
        // --- End FIX ---

        // Find and delete the video document by its _id.
        // For security, you might also want to ensure the deleting admin
        // has permission (e.g., if only the uploader can delete, or if a super-admin role is needed).
        // For simplicity with adminMiddleware, we'll assume any admin can delete any video.
        const video = await SolutionVideo.findOneAndDelete({ _id: videoId });

        if (!video) {
            return res.status(404).json({ error: 'Video not found or you do not have permission to delete it.' });
        }

        await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video', invalidate: true });

        res.json({ message: 'Video deleted successfully' });

    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
};

module.exports = { generateUploadSignature, saveVideoMetadata, deleteVideo };