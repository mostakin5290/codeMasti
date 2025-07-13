import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    FaArrowUp, FaArrowDown, FaCommentDots, FaSearch, FaSort,
    FaUser, FaLink, FaFire, FaEdit, FaTrash, FaEllipsisV
} from 'react-icons/fa';
import { FiChevronLeft } from 'react-icons/fi';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/common/ConfirmModal';

const formatRelativeTime = (date) => {
    const now = new Date();
    const seconds = Math.round((now - new Date(date)) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const DiscussPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const navigate = useNavigate();
    const { user: currentUser } = useSelector(state => state.auth);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosClient.get('/discuss/post', {
                params: {
                    page: currentPage,
                    limit: 10,
                    sortBy,
                    search: searchTerm
                }
            });
            setPosts(data.posts);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Failed to fetch discussions. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortBy, searchTerm]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleDeletePost = async (postId) => {
        try {
            await axiosClient.delete(`/discuss/post/${postId}`);
            toast.success('Post deleted successfully');
            setPosts(posts.filter(post => post._id !== postId));
            setShowDeleteModal(false);
        } catch (err) {
            toast.error('Failed to delete post');
            console.error(err);
        }
    };

    const handleEditPost = (postId) => {
        navigate(`/discuss/edit/${postId}`);
    };

    const DiscussionListItem = ({ post }) => {
        const [voteStatus, setVoteStatus] = useState(0);
        const [currentScore, setCurrentScore] = useState(post.upvoteCount || 0);
        const [showOptions, setShowOptions] = useState(false);

        const handleVote = async (direction) => {
            // ... existing vote implementation ...
        };

        const isAuthor = currentUser && post.author._id === currentUser._id;
        const isAdmin = currentUser?.role === 'admin';

        return (
            <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm p-5 rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/10 relative">
                {/* Options dropdown (only visible to author/admin) */}
                {(isAuthor || isAdmin) && (
                    <div className="absolute top-3 right-3">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-1 text-white/50 hover:text-white"
                        >
                            <FaEllipsisV />
                        </button>
                        {showOptions && (
                            <div className="absolute right-0 mt-1 w-40 bg-gray-800 rounded-md shadow-lg z-10 border border-white/10">
                                {isAuthor && (
                                    <button
                                        onClick={() => handleEditPost(post._id)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10"
                                    >
                                        <FaEdit className="mr-2" /> Edit
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setPostToDelete(post._id);
                                        setShowDeleteModal(true);
                                        setShowOptions(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                                >
                                    <FaTrash className="mr-2" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-4 items-start">
                    {/* Voting buttons */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                        <button
                            onClick={() => handleVote(1)}
                            className={`p-2 rounded-full ${voteStatus === 1 ? 'text-primary bg-primary/20' : 'text-white/70 hover:text-primary hover:bg-white/10'}`}
                        >
                            <FaArrowUp />
                        </button>
                        <span className={`font-medium text-sm ${currentScore > 0 ? 'text-primary' : currentScore < 0 ? 'text-red-400' : 'text-white/70'}`}>
                            {currentScore}
                        </span>
                        <button
                            onClick={() => handleVote(-1)}
                            className={`p-2 rounded-full ${voteStatus === -1 ? 'text-red-400 bg-red-400/20' : 'text-white/70 hover:text-red-400 hover:bg-white/10'}`}
                        >
                            <FaArrowDown />
                        </button>
                    </div>

                    {/* Post content */}
                    <div className="flex-grow">
                        <Link to={`/discuss/${post.slug}`} className="block group">
                            <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors mb-1">
                                {post.title}
                                {post.isPinned && (
                                    <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                                        <FaThumbtack className="inline mr-1" /> Pinned
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-white/70 line-clamp-2 mb-2">{post.description}</p>
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60">
                            <span className="flex items-center gap-1">
                                <FaUser className="text-primary/80" />
                                {post.author.username}
                                {post.author.role === 'admin' && (
                                    <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full text-xs ml-1">
                                        Admin
                                    </span>
                                )}
                            </span>
                            <span>{formatRelativeTime(post.createdAt)}</span>
                            {post.updatedAt && post.updatedAt !== post.createdAt && (
                                <span title={`Last updated ${formatRelativeTime(post.updatedAt)}`}>
                                    (edited)
                                </span>
                            )}
                            {post.problem && (
                                <Link
                                    to={`/codefield/${post.problem._id}`}
                                    className="text-primary/80 hover:underline flex items-center gap-1"
                                >
                                    <FaLink size={10} />
                                    Related Problem
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Comment count */}
                    <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full" title="Comments">
                        <FaCommentDots className="text-secondary" />
                        <span className="font-medium">{post.commentCount || 0}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* ... existing header and search/filter code ... */}

                {/* Main content */}
                <div className="space-y-4">
                    {loading ? (
                        <LoadingSpinner message="Loading discussions..." />
                    ) : error ? (
                        <div className="text-center py-10 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
                            {error}
                        </div>
                    ) : posts.length > 0 ? (
                        <>
                            {/* Pinned posts first */}
                            {posts.filter(p => p.isPinned).length > 0 && (
                                <div className="space-y-4 mb-8">
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <FaThumbtack className="text-yellow-400" />
                                        Pinned Discussions
                                    </h2>
                                    {posts.filter(p => p.isPinned).map(post => (
                                        <DiscussionListItem key={post._id} post={post} />
                                    ))}
                                </div>
                            )}

                            {/* Regular posts */}
                            <div className="space-y-4">
                                {posts.filter(p => !p.isPinned).map(post => (
                                    <DiscussionListItem key={post._id} post={post} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-16 bg-white/5 rounded-xl border border-dashed border-white/10">
                            <h3 className="text-xl font-medium text-white mb-2">No discussions found</h3>
                            <p className="text-white/60 mb-4">Be the first to start a conversation!</p>
                            <Link
                                to="/discuss/new"
                                className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none btn-sm"
                            >
                                Create Post
                            </Link>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="join">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="join-item btn btn-ghost border-white/10"
                            >
                                Previous
                            </button>
                            <button className="join-item btn bg-white/10 border-white/10 pointer-events-none">
                                Page {currentPage} of {totalPages}
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="join-item btn btn-ghost border-white/10"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete confirmation modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => handleDeletePost(postToDelete)}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                confirmColor="error"
            />

            <Footer />
        </div>
    );
};

export default DiscussPage;




