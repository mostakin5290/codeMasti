const DiscussionPost = require('../models/DiscussionPost');
const mongoose = require('mongoose');


const createPost = async (req, res) => {
    const { title, description, code, language, problemId } = req.body;
    const authorId = req.user.id; // Assuming `userMiddleware` adds user to req

    if (!title || !description || !problemId) {
        return res.status(400).json({ message: 'Title, description, and a linked problem are required.' });
    }

    try {
        const newPost = new DiscussionPost({
            title,
            description,
            code,
            language,
            problem: problemId,
            author: authorId,
        });

        const savedPost = await newPost.save();
        await savedPost.populate('author', 'firstName lastName avatar');
        res.status(201).json(savedPost);
    } catch (error) {
        console.error(error);
        if (error.code === 11000) { // Handle duplicate slug error
            return res.status(409).json({ message: 'A post with a similar title already exists. Please choose a different title.' });
        }
        res.status(500).json({ message: 'Server error while creating post.' });
    }
};

const getAllPosts = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'latest', search = '' } = req.query;

    try {
        const query = search ? { title: { $regex: search, $options: 'i' } } : {};

        let sortOption = { createdAt: -1 };
        if (sortBy === 'upvotes') sortOption = { upvoteCount: -1, createdAt: -1 };

        const posts = await DiscussionPost.aggregate([
            { $match: query },
            // Safely handle missing arrays
            {
                $addFields: {
                    comments: { $ifNull: ["$comments", []] },
                    upvotes: { $ifNull: ["$upvotes", []] }
                }
            },
            // Now calculate counts safely
            {
                $addFields: {
                    upvoteCount: { $size: "$upvotes" },
                    commentCount: { $size: "$comments" }
                }
            },
            { $sort: sortOption },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authorInfo'
                }
            },
            { $unwind: '$authorInfo' },
            {
                $project: {
                    title: 1,
                    slug: 1,
                    upvoteCount: 1,
                    commentCount: 1,
                    createdAt: 1,
                    comments: 1, // Include if needed
                    author: {
                        _id: '$authorInfo._id',
                        username: { $concat: ['$authorInfo.firstName', ' ', '$authorInfo.lastName'] },
                        avatar: '$authorInfo.avatar'
                    }
                }
            }
        ]);

        const totalPosts = await DiscussionPost.countDocuments(query);

        res.json({
            posts,
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching posts.' });
    }
};

const getPostBySlug = async (req, res) => {
    try {
        const post = await DiscussionPost.findOne({ slug: req.params.slug })
            .populate('author', 'firstName lastName avatar')
            .populate('problem', 'title _id');

        console.log(post)
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const toggleUpvote = async (req, res) => {
    try {
        const postId = req.params._id;
        const post = await DiscussionPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userId = req.user.id;
        const upvoteIndex = post.upvotes.findIndex(
            (upvotedUserId) => upvotedUserId.toString() === userId
        );

        if (upvoteIndex === -1) {
            post.upvotes.push(userId);
        } else {
            post.upvotes.splice(upvoteIndex, 1);
        }

        await post.save();
        res.json({
            success: true,
            upvotes: post.upvotes,
            upvoteCount: post.upvotes.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const post = await DiscussionPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if the current user is the author of the post
        // if (post.author != userId) {
        //     return res.status(403).json({
        //         message: 'Unauthorized. You can only delete your own posts.'
        //     });
        // }

        await DiscussionPost.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Post deleted successfully.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting post.'
        });
    }
};

const updatePost = async (req, res) => {
    const { title, description, code, language } = req.body;
    const postId = req.params._id;
    const userId = req.user._id;
    console.log(`post id: ${postId} user id: ${userId}`)

    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required.' });
    }

    try {
        const post = await DiscussionPost.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        console.log(post.author._id.toString() == userId)

        // Check if the current user is the author of the post
        if (post.author._id.toString() != userId) {
            return res.status(403).json({
                message: 'Unauthorized. You can only update your own posts.'
            });
        }

        // Update post fields
        post.title = title;
        post.description = description;
        post.code = code || null;  // Set to null if code is removed
        post.language = code ? language : null; // Only set language if code exists
        post.isEdited = true;  // Mark as edited
        post.editedAt = new Date();

        const updatedPost = await post.save();
        await updatedPost.populate('author', 'firstName lastName avatar');
        await updatedPost.populate('problem', 'title _id');

        res.json({
            success: true,
            post: updatedPost,
            message: 'Post updated successfully.'
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) { // Handle duplicate slug error (if title change generates duplicate slug)
            return res.status(409).json({
                message: 'A post with this title already exists. Please choose a different title.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while updating post.'
        });
    }
};

const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.postId;
        const userId = req.user.id;

        if (!content) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const post = await DiscussionPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            content,
            author: userId,
            upvotes: []
        };

        post.comments.push(newComment);
        await post.save();

        // Populate author info in the newly added comment
        const populatedPost = await DiscussionPost.findById(postId)
            .populate('comments.author', 'firstName lastName avatar');

        const addedComment = populatedPost.comments[post.comments.length - 1];

        res.status(201).json({
            success: true,
            comment: addedComment
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding comment'
        });
    }
};

const updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { postId, commentId } = req.params;
        const userId = req.user.id;

        if (!content) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const post = await DiscussionPost.findOneAndUpdate(
            {
                _id: postId,
                'comments._id': commentId,
                'comments.author': userId // Ensure only author can update
            },
            {
                $set: {
                    'comments.$.content': content,
                    'comments.$.isEdited': true
                }
            },
            { new: true }
        ).populate('comments.author', 'firstName lastName avatar');

        if (!post) {
            return res.status(404).json({ message: 'Comment not found or unauthorized' });
        }

        const updatedComment = post.comments.id(commentId);

        res.json({
            success: true,
            comment: updatedComment
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating comment'
        });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user.id;

        const post = await DiscussionPost.findOneAndUpdate(
            {
                _id: postId,
                'comments._id': commentId,
                'comments.author': userId // Ensure only author can delete
            },
            { $pull: { comments: { _id: commentId } } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Comment not found or unauthorized' });
        }

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting comment'
        });
    }
};

const toggleCommentUpvote = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user.id;

        const post = await DiscussionPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const upvoteIndex = comment.upvotes.indexOf(userId);

        if (upvoteIndex === -1) {
            comment.upvotes.push(userId);
        } else {
            comment.upvotes.splice(upvoteIndex, 1);
        }

        await post.save();

        res.json({
            success: true,
            upvotes: comment.upvotes,
            upvoteCount: comment.upvotes.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating comment vote'
        });
    }
};

const getPostsByUserId = async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const query = { author: userId };

        const posts = await DiscussionPost.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('author', 'firstName lastName avatar')
            .populate('problem', 'title _id');

        const totalPosts = await DiscussionPost.countDocuments(query);

        res.json({
            posts,
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching user posts' });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getPostBySlug,
    toggleUpvote,
    addComment,
    updateComment,
    deleteComment,
    toggleCommentUpvote,
    getPostsByUserId,
    deletePost,
    updatePost
};
