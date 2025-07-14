const express = require('express');
const discussRoute = express.Router();
const userMiddleware = require("../middleware/userMiddleware");

const {
    createPost,
    getAllPosts,
    getPostBySlug,
    addComment,
    updateComment,
    deleteComment,
    getPostsByUserId,
    deletePost,
    updatePost,
    togglePostLike,    
    toggleCommentLike 
} = require("../controllers/discussController");

// Post routes
discussRoute.post('/create', userMiddleware, createPost);
discussRoute.get('/post/:slug', userMiddleware, getPostBySlug);
discussRoute.get('/post', userMiddleware, getAllPosts);
discussRoute.delete('/:id', userMiddleware, deletePost);
discussRoute.put('/:id', userMiddleware, updatePost);
discussRoute.put('/post/:postId/like', userMiddleware, togglePostLike); 


// Comment routes
discussRoute.post('/:postId/comments', userMiddleware, addComment);
discussRoute.put('/:postId/comments/:commentId', userMiddleware, updateComment);
discussRoute.delete('/:postId/comments/:commentId', userMiddleware, deleteComment);
discussRoute.put('/:postId/comments/:commentId/like', userMiddleware, toggleCommentLike);


// User-specific posts
discussRoute.get('/user/:userId/posts', userMiddleware, getPostsByUserId);


module.exports = discussRoute;