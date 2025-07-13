const express = require('express');
const discussRoute = express.Router();
const userMiddleware = require("../middleware/userMiddleware");

const { 
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
} = require("../controllers/discussController");

// Post routes
discussRoute.post('/create', userMiddleware, createPost);
discussRoute.get('/post/:slug', userMiddleware, getPostBySlug);
discussRoute.get('/post', userMiddleware, getAllPosts);
discussRoute.patch('/up/:_id', userMiddleware, toggleUpvote);
discussRoute.delete('/:id', userMiddleware, deletePost);
discussRoute.put('/:id', userMiddleware, updatePost);

// Comment routes
discussRoute.post('/:postId/comments', userMiddleware, addComment);
discussRoute.put('/:postId/comments/:commentId', userMiddleware, updateComment);
discussRoute.delete('/:postId/comments/:commentId', userMiddleware, deleteComment);
discussRoute.patch('/:postId/comments/:commentId/upvote', userMiddleware, toggleCommentUpvote);
discussRoute.get('/user/:userId/posts', userMiddleware, getPostsByUserId);

module.exports = discussRoute;