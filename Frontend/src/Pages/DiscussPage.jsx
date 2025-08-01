import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmationModal from '../components/common/ConfirmationModal';
import SharePopup from '../components/common/SharePopup';
import MonacoEditor from '@monaco-editor/react';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';
import {
    FaThumbtack, FaCommentDots, FaUser, FaEye,
    FaFire, FaSearch, FaSort, FaLink, FaRegBookmark, 
    FaBookmark, FaFilter, FaRegClock, FaChartLine, 
    FaRegLightbulb, FaEdit, FaTrash, FaShare, FaTimes,
    FaExpandArrowsAlt, FaCompressArrowsAlt
} from 'react-icons/fa';
import { 
    FiChevronLeft, FiMessageCircle, FiThumbsUp, 
    FiChevronRight, FiX 
} from 'react-icons/fi';
import { MdWhatshot, MdNewReleases, MdTrendingUp } from 'react-icons/md';
import { RiLiveLine } from 'react-icons/ri';
import { BiTrendingUp, BiCodeAlt } from 'react-icons/bi';
import { HiOutlineLightBulb } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

// Default theme for the app context
const defaultAppTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

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

const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const isOverallThemeDark = (appTheme) => {
    const bgClass = appTheme.background;
    if (bgClass.includes('black') || bgClass.includes('zinc-9') || bgClass.includes('gray-9') ||
        bgClass.includes('slate-8') || bgClass.includes('slate-9') || appTheme.name === 'Modern Dark' ||
        appTheme.name === 'Galaxy Night' || appTheme.name === 'Volcano Ash' || appTheme.name === 'Graphite Slate'
    ) {
        return true;
    }
    const match = bgClass.match(/-(\d{2,3})$/);
    if (match) {
        const shade = parseInt(match[1]);
        return shade >= 600;
    }
    return false;
};

const DiscussPage = () => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };
    const { user: currentUser } = useSelector(state => state.auth);
    const navigate = useNavigate();

    // Main page state
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeFilter, setActiveFilter] = useState('all');
    const [popularDiscussions, setPopularDiscussions] = useState([]);

    // Post detail popup state
    const [selectedPost, setSelectedPost] = useState(null);
    const [showPostDetail, setShowPostDetail] = useState(false);
    const [postDetailLoading, setPostDetailLoading] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState('');
    const [isOperating, setIsOperating] = useState(false);
    const [operatingCommentId, setOperatingCommentId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [monacoEditorTheme, setMonacoEditorTheme] = useState('vs-dark');
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Sync Monaco theme based on app theme's background
    useEffect(() => {
        if (appTheme.background.includes('dark') || appTheme.background.includes('black') || appTheme.background.includes('zinc-9')) {
            setMonacoEditorTheme('vs-dark');
        } else {
            setMonacoEditorTheme('vs-light');
        }
    }, [appTheme.background]);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosClient.get('/discuss/post', {
                params: {
                    page: currentPage,
                    limit: 10,
                    sortBy,
                    search: searchTerm,
                    filter: activeFilter
                }
            });
            setPosts(data.posts);
            setTotalPages(data.totalPages);

            setPopularDiscussions(data.posts.slice(0, 3).map(post => ({
                ...post,
                likeCount: post.likeCount,
                commentCount: post.commentCount
            })));

        } catch (err) {
            setError('Failed to fetch discussions. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortBy, searchTerm, activeFilter]);

    const fetchPostDetail = async (slug) => {
        setPostDetailLoading(true);
        try {
            const { data } = await axiosClient.get(`/discuss/post/${slug}`);
            const processedPost = {
                ...data,
                likes: data.likes || []
            };
            const processedComments = data.comments?.map(comment => ({
                ...comment,
                _id: comment._id || `temp_${Math.random().toString(36).substring(2, 11)}`,
                likes: comment.likes || []
            })) || [];

            setSelectedPost(processedPost);
            setComments(processedComments);

            if (currentUser) {
                setIsBookmarked(data.bookmarks?.map(id => id.toString()).includes(currentUser._id) || false);
            }
        } catch (err) {
            console.error("Fetch post error:", err);
            toast.error("Couldn't load the post");
        } finally {
            setPostDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handlePostClick = async (post) => {
        setShowPostDetail(true);
        await fetchPostDetail(post.slug);
    };

    const closePostDetail = () => {
        setShowPostDetail(false);
        setSelectedPost(null);
        setComments([]);
        setNewComment('');
        setEditingCommentId(null);
        setEditCommentContent('');
        setIsOperating(false);
        setOperatingCommentId(null);
        setShowDeleteModal(false);
        setDeleteTarget(null);
        setShowSharePopup(false);
        setIsBookmarked(false);
    };

    // Post detail handlers
    const handleBookmarkToggle = async () => {
        if (!currentUser) {
            toast.error("Please login to bookmark posts! 🔖");
            return navigate('/login');
        }
        if (isOperating) return;
        setIsOperating(true);

        try {
            const { data } = await axiosClient.put(`/discuss/post/${selectedPost._id}/bookmark`);
            setIsBookmarked(!isBookmarked);
            toast.success(data.message);
        } catch (err) {
            console.error("Bookmark error:", err);
            toast.error("Failed to toggle bookmark");
        } finally {
            setIsOperating(false);
        }
    };

    const handleEditPost = () => {
        if (!currentUser || currentUser._id !== selectedPost.author._id) {
            toast.error("You are not authorized to edit this post.");
            return;
        }
        closePostDetail();
        navigate(`/discuss/edit/${selectedPost.slug}`, { state: { post: selectedPost } });
    };

    const handleDeletePost = () => {
        if (!currentUser || currentUser._id !== selectedPost.author._id) {
            toast.error("You are not authorized to delete this post.");
            return;
        }
        setDeleteTarget({ type: 'post', id: selectedPost._id });
        setShowDeleteModal(true);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || operatingCommentId) return;
        if (!currentUser) {
            toast.error("Please login to join the conversation! 💬");
            return navigate('/login');
        }

        setOperatingCommentId('new-comment');
        try {
            const { data } = await axiosClient.post(`/discuss/${selectedPost._id}/comments`, {
                content: newComment
            });
            setComments(prevComments => [...prevComments, data.comment]);
            setNewComment('');
            toast.success("Your thoughts have been shared! 🎉");
        } catch (err) {
            console.error("Add comment error:", err);
            toast.error("Failed to add comment");
        } finally {
            setOperatingCommentId(null);
        }
    };

    const handleEditComment = (comment) => {
        setEditingCommentId(comment._id);
        setEditCommentContent(comment.content);
    };

    const handleUpdateComment = async (commentId) => {
        if (!editCommentContent.trim() || operatingCommentId === commentId) return;
        setOperatingCommentId(commentId);

        try {
            const { data } = await axiosClient.put(`/discuss/${selectedPost._id}/comments/${commentId}`, {
                content: editCommentContent
            });
            setComments(comments.map(comment =>
                comment._id === commentId ? { ...data.comment, likes: comment.likes } : comment
            ));
            setEditingCommentId(null);
            toast.success("Comment updated! ✨");
        } catch (err) {
            console.error("Update comment error:", err);
            toast.error(err.response?.data?.message || "Failed to update comment");
        } finally {
            setOperatingCommentId(null);
        }
    };

    const handleDeleteComment = (commentId) => {
        if (operatingCommentId === commentId) return;
        setDeleteTarget({ type: 'comment', postId: selectedPost._id, commentId: commentId });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'post') {
            setIsOperating(true);
        } else if (deleteTarget.type === 'comment') {
            setOperatingCommentId(deleteTarget.commentId);
        }

        try {
            if (deleteTarget.type === 'post') {
                await axiosClient.delete(`/discuss/${deleteTarget.id}`);
                toast.success("Post deleted successfully! 👋");
                closePostDetail();
                fetchPosts(); // Refresh the posts list
            } else if (deleteTarget.type === 'comment') {
                await axiosClient.delete(`/discuss/${deleteTarget.postId}/comments/${deleteTarget.commentId}`);
                setComments(comments.filter(comment => comment._id !== deleteTarget.commentId));
                toast.success("Comment deleted");
            }
        } catch (err) {
            console.error(`Delete ${deleteTarget.type} error:`, err);
            toast.error(err.response?.data?.message || `Failed to delete ${deleteTarget.type}.`);
        } finally {
            setShowDeleteModal(false);
            setDeleteTarget(null);
            setIsOperating(false);
            setOperatingCommentId(null);
        }
    };

    const handlePostLike = async () => {
        if (!currentUser) {
            toast.error("Please login to like posts! ❤️");
            return navigate('/login');
        }
        if (isOperating) return;
        setIsOperating(true);

        try {
            const { data } = await axiosClient.put(`/discuss/post/${selectedPost._id}/like`);
            setSelectedPost(prevPost => {
                const currentLikes = prevPost.likes || [];
                const updatedLikes = data.isLiked
                    ? [...currentLikes, currentUser._id]
                    : currentLikes.filter(id => id.toString() !== currentUser._id.toString());
                return { ...prevPost, likes: updatedLikes };
            });
            toast.success(data.message);
        } catch (err) {
            console.error("Post like error:", err);
            toast.error(err.response?.data?.message || "Failed to toggle post like.");
        } finally {
            setIsOperating(false);
        }
    };

    const handleCommentLike = async (commentId) => {
        if (!currentUser) {
            toast.error("Please login to like comments! ❤️");
            return navigate('/login');
        }
        if (operatingCommentId === commentId) return;

        setOperatingCommentId(commentId);

        try {
            const { data } = await axiosClient.put(`/discuss/${selectedPost._id}/comments/${commentId}/like`);
            setComments(prevComments => prevComments.map(comment => {
                if (comment._id === commentId) {
                    const currentLikes = comment.likes || [];
                    const updatedLikes = data.isLiked
                        ? [...currentLikes, currentUser._id]
                        : currentLikes.filter(id => id.toString() !== currentUser._id.toString());
                    return { ...comment, likes: updatedLikes };
                }
                return comment;
            }));
            toast.success(data.message);
        } catch (err) {
            console.error("Comment like error:", err);
            toast.error(err.response?.data?.message || "Failed to toggle comment like.");
        } finally {
            setOperatingCommentId(null);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    // Calculate unique authors and total comments
    const uniqueAuthors = [...new Set(posts.map(post => post.author._id))];
    const totalComments = posts.reduce((sum, post) => sum + (post.commentCount || 0), 0);

    const DiscussionListItem = ({ post }) => {
        return (
            <div 
                className={`relative group ${appTheme.cardBg}/5 hover:${appTheme.cardBg}/10 backdrop-blur-sm p-5 rounded-xl border ${appTheme.border}/10 hover:border-${appTheme.primary.split('-')[1]}-500/50 transition-all duration-300 shadow-lg hover:shadow-${appTheme.primary.split('-')[1]}-500/10 cursor-pointer`}
                onClick={() => handlePostClick(post)}
            >
                {post.isPinned && (
                    <div className={`absolute top-3 left-3 ${appTheme.highlight}`}>
                        <FaThumbtack className="rotate-45" />
                    </div>
                )}

                <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0">
                        <div className={`h-12 w-12 rounded-full ${appTheme.primary.replace('bg-', 'bg-gradient-to-br from-')}/20 ${appTheme.secondary.replace('bg-', 'to-')}/20 border ${appTheme.border}/10 flex items-center justify-center overflow-hidden`}>
                            <img
                                src={post.author.avatar}
                                alt={post.author.username}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex-grow">
                        <div className="block group">
                            <h3 className={`text-xl font-semibold ${appTheme.text} group-hover:${appTheme.primary} transition-colors mb-1`}>
                                {post.title}
                                {post.isLive && (
                                    <span className={`ml-2 inline-flex items-center gap-1 text-xs ${appTheme.errorColor.replace('text-', 'bg-')}/20 ${appTheme.errorColor} px-2 py-0.5 rounded-full`}>
                                        <RiLiveLine /> Live
                                    </span>
                                )}
                            </h3>
                            <p className={`text-sm ${appTheme.cardText}/70 line-clamp-2 mb-2`}>{post.description}</p>
                        </div>

                        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${appTheme.cardText}/60`}>
                            <span className="flex items-center gap-1">
                                <FaUser className={`${appTheme.primary}/80`} />
                                {post.author.username}
                                {post.author.isVerified && (
                                    <span className={`${appTheme.infoColor}`} title="Verified User">
                                        ✓
                                    </span>
                                )}
                            </span>
                            <span className="flex items-center gap-1">
                                <FaRegClock />
                                {formatRelativeTime(post.createdAt)}
                            </span>
                            {post.problem && (
                                <span className={`${appTheme.primary}/80 flex items-center gap-1`}>
                                    <FaLink size={10} />
                                    Related Problem
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-3">
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1 ${appTheme.cardBg}/5 rounded-full transition-colors`}
                            title="likes"
                        >
                            <FiThumbsUp />
                            <span className={`font-medium ${appTheme.text}`}>{post.likeCount}</span>
                        </div>
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1 ${appTheme.cardBg}/5 rounded-full transition-colors`}
                            title="Comments"
                        >
                            <FaCommentDots />
                            <span className={`font-medium ${appTheme.text}`}>{post.commentCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const hasCurrentUserLikedPost = currentUser && selectedPost?.likes?.includes(currentUser._id);

    return (
        <div className={`min-h-screen bg-gradient-to-br ${appTheme.gradientFrom} ${appTheme.gradientTo} flex flex-col`}>
            <div className='mb-10'>
                <Header />
            </div>

            <div className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="lg:w-1/3 hidden lg:block">
                            <div className="sticky top-24 h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar pr-2">
                                {/* Community Stats */}
                                <div className={`${appTheme.cardBg}/5 backdrop-blur-sm p-6 rounded-xl border ${appTheme.border}/10`}>
                                    <h2 className={`text-xl font-bold ${appTheme.text} mb-4 flex items-center gap-2`}>
                                        <BiTrendingUp className={`${appTheme.successColor}`} />
                                        Community Stats
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className={`${appTheme.cardText}`}>Total Discussions</span>
                                            <span className={`font-bold`}>{posts.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={`${appTheme.cardText}`}>Active Members</span>
                                            <span className={`font-bold`}>{uniqueAuthors.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={`${appTheme.cardText}`}>Total Comments</span>
                                            <span className={`font-bold ${appTheme.highlightTertiary}`}>{totalComments}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Popular Discussions */}
                                {popularDiscussions.length > 0 && (
                                    <div className={`bg-gradient-to-br ${appTheme.cardBg}/5 to-${appTheme.cardBg.split('-')[1]}/3 backdrop-blur-sm p-6 rounded-xl border ${appTheme.border}/10 mt-6`}>
                                        <h2 className={`text-xl font-bold ${appTheme.text} mb-4 flex items-center gap-2`}>
                                            <FaChartLine className={`${appTheme.infoColor}`} />
                                            Hot Discussions
                                        </h2>
                                        <div className="space-y-3">
                                            {popularDiscussions.slice(0, 3).map(post => (
                                                <div
                                                    key={post._id}
                                                    onClick={() => handlePostClick(post)}
                                                    className={`block p-3 ${appTheme.cardBg}/5 rounded-lg hover:${appTheme.cardBg}/10 transition-colors cursor-pointer`}
                                                >
                                                    <h3 className={`text-sm font-medium ${appTheme.text} line-clamp-1`}>{post.title}</h3>
                                                    <div className={`flex items-center justify-between mt-1 text-xs ${appTheme.cardText}/50`}>
                                                        <span>{post.author.username}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex items-center gap-1">
                                                                <FiThumbsUp size={10} /> {post.likeCount}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FaCommentDots size={10} /> {post.commentCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:w-3/4 space-y-6">
                            {/* Header and Create Button */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className={`text-3xl font-bold bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')} bg-clip-text`}>
                                        Community Hub
                                    </h1>
                                    <p className={`${appTheme.cardText}`}>Connect, share, and learn with fellow developers</p>
                                </div>
                                <Link
                                    to="/discuss/new"
                                    className={`px-6 py-3 rounded-lg ${appTheme.primary} ${appTheme.buttonText} hover:${appTheme.primaryHover} shadow-lg hover:shadow-${appTheme.primary.split('-')[1]}-500/30 transition-all flex items-center gap-2`}
                                >
                                    <FaRegLightbulb /> New Discussion
                                </Link>
                            </div>

                            {/* Search and Filter */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className={`${appTheme.cardText}/50`} />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className={`w-full pl-10 ${appTheme.cardBg}/10 border-${appTheme.border.split('-')[1]}-200 text-${appTheme.text} rounded-xl shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent`}
                                        placeholder="Search discussions, tags, or users..."
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <select
                                        value={sortBy}
                                        onChange={handleSortChange}
                                        className={`col-span-2 pl-3 ${appTheme.cardBg}/10 border-${appTheme.border.split('-')[1]}-200 text-${appTheme.text} rounded-xl shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent appearance-none`}
                                    >
                                        <option value="latest">Latest</option>
                                        <option value="likes">Most liked</option>
                                        <option value="comments">Most Comments</option>
                                        <option value="views">Most Viewed</option>
                                    </select>
                                    <button
                                        className={`${appTheme.cardBg}/10 hover:${appTheme.cardBg}/20 border-${appTheme.border.split('-')[1]}-200 ${appTheme.text} rounded-xl shadow-sm py-2 px-4 transition-colors flex items-center justify-center gap-2`}
                                        onClick={() => {
                                            setActiveFilter(prev => prev === 'unanswered' ? 'all' : 'unanswered');
                                        }}
                                    >
                                        <FaFilter size={14} />
                                        {activeFilter === 'unanswered' ? 'Unanswered' : 'Filter'}
                                    </button>
                                </div>
                            </div>

                            {/* Discussion List */}
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <LoadingSpinner message="Loading discussions..." appTheme={appTheme} />
                                    </div>
                                ) : error ? (
                                    <div className={`text-center py-10 ${appTheme.errorColor.replace('text-', 'bg-')}/10 rounded-xl ${appTheme.errorColor} border border-${appTheme.errorColor.split('-')[1]}-500/20`}>
                                        {error}
                                    </div>
                                ) : posts.length > 0 ? (
                                    <>
                                        {posts.filter(p => p.isPinned).map(post => (
                                            <DiscussionListItem key={post._id} post={post} />
                                        ))}
                                        {posts.filter(p => !p.isPinned).map(post => (
                                            <DiscussionListItem key={post._id} post={post} />
                                        ))}
                                    </>
                                ) : (
                                    <div className={`text-center py-16 ${appTheme.cardBg}/5 rounded-xl border border-dashed ${appTheme.border}/10`}>
                                        <h3 className={`text-xl font-medium ${appTheme.text} mb-2`}>No discussions found</h3>
                                        <p className={`${appTheme.cardText} mb-4`}>Be the first to start a conversation!</p>
                                        <Link
                                            to="/discuss/new"
                                            className={`px-6 py-3 rounded-lg ${appTheme.primary} ${appTheme.buttonText} hover:${appTheme.primaryHover} text-sm`}
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
                                            className={`join-item px-4 py-2 rounded-l-lg ${appTheme.cardBg}/10 ${appTheme.text} border ${appTheme.border}/10 hover:${appTheme.cardBg}/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`join-item px-4 py-2 ${currentPage === pageNum ? `${appTheme.primary}/20 ${appTheme.primary}` : `${appTheme.cardBg}/5 hover:${appTheme.cardBg}/10`} ${appTheme.text} border ${appTheme.border}/10`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`join-item px-4 py-2 rounded-r-lg ${appTheme.cardBg}/10 ${appTheme.text} border ${appTheme.border}/10 hover:${appTheme.cardBg}/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Post Detail Popup - UPDATED with better scrolling */}
            {showPostDetail && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
                    <div className={`${appTheme.cardBg} rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col`}>
                        {/* Header - Fixed */}
                        <div className={`flex-shrink-0 p-4 border-b ${appTheme.border} flex items-center justify-between`}>
                            <h2 className={`text-xl font-bold ${appTheme.text}`}>Discussion Details</h2>
                            <button
                                onClick={closePostDetail}
                                className={`p-2 rounded-full ${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80 transition-colors`}
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-hidden">
                            {postDetailLoading ? (
                                <div className="flex items-center justify-center w-full h-full">
                                    <LoadingSpinner message="Loading post details..." appTheme={appTheme} />
                                </div>
                            ) : selectedPost ? (
                                <div className="flex h-full">
                                    {/* Post Content - Left Side - Scrollable */}
                                    <div className="flex-1 overflow-y-auto">
                                        <div className="p-6">
                                            {/* Post Header */}
                                            <div className="mb-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0">
                                                        <img
                                                            src={selectedPost?.author?.avatar}
                                                            alt={selectedPost?.author?.username}
                                                            className={`w-12 h-12 rounded-full border-2 ${appTheme.border}`}
                                                        />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h2 className={`text-sm font-semibold ${appTheme.text}`}>{selectedPost?.author?.username}</h2>
                                                            <span className={`${appTheme.cardText} text-xs`}>•</span>
                                                            <time className={`${appTheme.cardText} text-xs`}>{formatDateTime(selectedPost.createdAt)}</time>
                                                        </div>

                                                        <h1 className={`text-2xl font-bold ${appTheme.text} mb-3 leading-tight`}>{selectedPost.title}</h1>

                                                        <div className={`flex items-center gap-4 text-sm ${appTheme.cardText} mb-4`}>
                                                            <div className="flex items-center gap-1">
                                                                <FiMessageCircle className={`${appTheme.cardText}/80`} />
                                                                <span>{comments.length} comments</span>
                                                            </div>
                                                            {selectedPost.problem && (
                                                                <Link
                                                                    to={`/codefield/${selectedPost.problem._id}`}
                                                                    className={`flex items-center gap-1 ${appTheme.highlight} hover:${appTheme.highlightSecondary} transition-colors`}
                                                                    onClick={closePostDetail}
                                                                >
                                                                    <HiOutlineLightBulb className="text-sm" />
                                                                    <span>Related Problem</span>
                                                                </Link>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex items-center gap-2 mb-6">
                                                            <button
                                                                onClick={handlePostLike}
                                                                disabled={isOperating}
                                                                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                                                                    hasCurrentUserLikedPost
                                                                        ? `${appTheme.primary} ${appTheme.buttonText}`
                                                                        : `${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80`
                                                                }`}
                                                            >
                                                                <FiThumbsUp className={`w-4 h-4 ${hasCurrentUserLikedPost ? 'fill-current' : ''}`} />
                                                                <span className="font-medium">{selectedPost?.likes?.length || 0}</span>
                                                            </button>

                                                            <button
                                                                onClick={handleBookmarkToggle}
                                                                disabled={isOperating}
                                                                className={`p-2 rounded-lg ${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80 transition-colors`}
                                                                title={isBookmarked ? "Remove Bookmark" : "Bookmark Post"}
                                                            >
                                                                {isBookmarked ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
                                                            </button>

                                                            <button
                                                                onClick={() => setShowSharePopup(true)}
                                                                className={`p-2 rounded-lg ${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80 transition-colors`}
                                                                title="Share Post"
                                                            >
                                                                <FaShare className="w-4 h-4" />
                                                            </button>

                                                            {currentUser?._id === selectedPost?.author?._id && (
                                                                <>
                                                                    <button
                                                                        onClick={handleEditPost}
                                                                        disabled={isOperating}
                                                                        className={`p-2 rounded-lg ${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.highlight} transition-colors`}
                                                                        title="Edit Post"
                                                                    >
                                                                        <FaEdit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={handleDeletePost}
                                                                        disabled={isOperating}
                                                                        className={`p-2 rounded-lg ${appTheme.cardBg} ${appTheme.errorColor} hover:${appTheme.errorColor}/80 transition-colors`}
                                                                        title="Delete Post"
                                                                    >
                                                                        <FaTrash className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Post Content */}
                                            <div className="space-y-6">
                                                <div
                                                    className={`prose prose-sm max-w-none ${isOverallThemeDark(appTheme) ? 'prose-invert' : ''} ${appTheme.cardText} leading-relaxed`}
                                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedPost.description) }}
                                                />

                                                {selectedPost.code && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className={`flex items-center gap-1 text-sm font-semibold ${appTheme.text}`}>
                                                                <BiCodeAlt className={`${appTheme.infoColor}`} />
                                                                <span>Code Solution</span>
                                                            </div>
                                                            <span className={`px-2 py-1 ${appTheme.infoColor.replace('text-', 'bg-')}/20 ${appTheme.infoColor} text-xs font-medium rounded-full`}>
                                                                {selectedPost.language}
                                                            </span>
                                                        </div>
                                                        <div className={`rounded-lg overflow-hidden border ${appTheme.border}`}>
                                                            <MonacoEditor
                                                                height="400px"
                                                                language={selectedPost.language}
                                                                theme={monacoEditorTheme}
                                                                value={selectedPost.code}
                                                                options={{
                                                                    readOnly: true,
                                                                    minimap: { enabled: false },
                                                                    fontSize: 14,
                                                                    lineNumbers: 'on',
                                                                    scrollBeyondLastLine: false,
                                                                    renderWhitespace: 'none',
                                                                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                                                    lineDecorationsWidth: 10,
                                                                    lineNumbersMinChars: 3,
                                                                    padding: { top: 12, bottom: 12 },
                                                                    overviewRulerBorder: false,
                                                                    folding: true,
                                                                    automaticLayout: true
                                                                }}
                                                                loading={
                                                                    <div className={`h-[400px] flex items-center justify-center ${appTheme.background} ${appTheme.cardText}`}>
                                                                        <div className="text-center">
                                                                            <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full mx-auto mb-2"></div>
                                                                            Loading code...
                                                                        </div>
                                                                    </div>
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments - Right Side - Scrollable */}
                                    <div className={`w-1/2 border-l ${appTheme.border} flex flex-col`}>
                                        {/* Comments Header - Fixed */}
                                        <div className={`flex-shrink-0 p-4 border-b ${appTheme.border}`}>
                                            <h3 className={`text-lg font-bold ${appTheme.text}`}>
                                                Comments
                                                <span className={`text-sm font-normal ${appTheme.cardText} ml-2`}>
                                                    ({comments.length})
                                                </span>
                                            </h3>
                                        </div>

                                        {/* Comments Content - Scrollable */}
                                        <div className="flex-1 overflow-y-auto">
                                            <div className="p-4">
                                                {/* Comment Form */}
                                                {currentUser ? (
                                                    <form onSubmit={handleCommentSubmit} className="mb-6">
                                                        <div className="flex gap-3">
                                                            <img
                                                                src={currentUser.avatar}
                                                                alt={currentUser.username}
                                                                className={`w-8 h-8 rounded-full border ${appTheme.border} flex-shrink-0`}
                                                            />
                                                            <div className="flex-1">
                                                                <textarea
                                                                    value={newComment}
                                                                    onChange={(e) => setNewComment(e.target.value)}
                                                                    className={`w-full ${appTheme.cardBg}/80 border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent transition-all duration-200 resize-none text-sm placeholder-${appTheme.cardText.split('-')[1]}-400`}
                                                                    placeholder="Share your thoughts..."
                                                                    disabled={operatingCommentId === 'new-comment'}
                                                                    rows="3"
                                                                />
                                                                <div className="flex justify-between items-center mt-2">
                                                                    <div className={`text-xs ${appTheme.cardText}`}>
                                                                        Be respectful 💙
                                                                    </div>
                                                                    <button
                                                                        type="submit"
                                                                        disabled={operatingCommentId === 'new-comment' || !newComment.trim()}
                                                                        className={`px-4 py-2 ${appTheme.primary} ${appTheme.buttonText} text-sm font-medium rounded-lg hover:${appTheme.primaryHover} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                                                                    >
                                                                        {operatingCommentId === 'new-comment' ? 'Posting...' : 'Post Comment'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <div className={`text-center py-8 ${appTheme.cardBg}/20 rounded-lg mb-6`}>
                                                        <div className={`${appTheme.text} text-4xl mb-3`}>💬</div>
                                                        <p className={`${appTheme.cardText} mb-4 text-sm`}>Ready to join the discussion?</p>
                                                        <button
                                                            onClick={() => {
                                                                closePostDetail();
                                                                navigate('/login');
                                                            }}
                                                            className={`px-6 py-2 ${appTheme.primary} ${appTheme.buttonText} text-sm font-medium rounded-lg hover:${appTheme.primaryHover} transition-all duration-200`}
                                                        >
                                                            Sign In to Comment
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Comments List */}
                                                {comments.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {comments.map(comment => (
                                                            comment && comment._id && (
                                                                <div key={comment._id} className="group">
                                                                    <div className="flex gap-3">
                                                                        <img 
                                                                            src={comment?.author?.avatar} 
                                                                            alt={comment?.author?.username} 
                                                                            className={`w-8 h-8 rounded-full border ${appTheme.border} flex-shrink-0`}
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className={`${appTheme.cardBg}/50 rounded-lg p-4`}>
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className={`font-medium ${appTheme.text} text-sm`}>
                                                                                            {comment?.author?.firstName}
                                                                                            {console.log(comment)}
                                                                                        </span>
                                                                                        <time className={`${appTheme.cardText} text-xs`}>
                                                                                            {formatDateTime(comment?.createdAt)}
                                                                                        </time>
                                                                                        {comment.isEdited && (
                                                                                            <span className={`text-xs ${appTheme.cardText} bg-gray-500/20 px-2 py-0.5 rounded-full`}>
                                                                                                edited
                                                                                            </span>
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="flex items-center gap-1">
                                                                                        <button
                                                                                            onClick={() => handleCommentLike(comment._id)}
                                                                                            disabled={operatingCommentId === comment._id}
                                                                                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all duration-200 ${
                                                                                                currentUser && comment.likes.includes(currentUser._id)
                                                                                                    ? `${appTheme.primary} ${appTheme.buttonText}`
                                                                                                    : `${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80`
                                                                                            }`}
                                                                                        >
                                                                                            <FiThumbsUp className={`w-3 h-3 ${currentUser && comment.likes.includes(currentUser._id) ? 'fill-current' : ''}`} />
                                                                                            <span className="font-medium">{comment.likes.length || 0}</span>
                                                                                        </button>
                                                                                    </div>
                                                                                </div>

                                                                                {editingCommentId === comment._id ? (
                                                                                    <div className="space-y-3">
                                                                                        <textarea
                                                                                            value={editCommentContent}
                                                                                            onChange={(e) => setEditCommentContent(e.target.value)}
                                                                                            className={`w-full ${appTheme.cardBg}/80 border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent transition-all duration-200 text-sm resize-none`}
                                                                                            rows="3"
                                                                                            disabled={operatingCommentId === comment._id}
                                                                                        />
                                                                                        <div className="flex justify-end gap-2">
                                                                                            <button
                                                                                                onClick={() => setEditingCommentId(null)}
                                                                                                disabled={operatingCommentId === comment._id}
                                                                                                className={`px-3 py-1 ${appTheme.cardBg}/80 hover:${appTheme.cardBg}/60 ${appTheme.cardText} text-xs rounded-lg transition-colors duration-200`}
                                                                                            >
                                                                                                Cancel
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleUpdateComment(comment._id)}
                                                                                                disabled={operatingCommentId === comment._id}
                                                                                                className={`px-3 py-1 ${appTheme.primary} ${appTheme.buttonText} hover:${appTheme.primaryHover} text-xs rounded-lg transition-colors duration-200`}
                                                                                            >
                                                                                                {operatingCommentId === comment._id ? 'Updating...' : 'Save'}
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <>
                                                                                        <p className={`${appTheme.cardText} text-sm leading-relaxed whitespace-pre-wrap mb-3`}>
                                                                                            {comment?.content}
                                                                                        </p>

                                                                                        {currentUser?._id === comment?.author?._id && (
                                                                                            <div className={`flex items-center gap-3 text-xs ${appTheme.cardText}/80`}>
                                                                                                <button
                                                                                                    onClick={() => handleEditComment(comment)}
                                                                                                    disabled={operatingCommentId === comment._id}
                                                                                                    className={`hover:${appTheme.highlight} flex items-center gap-1 transition-colors duration-200`}
                                                                                                >
                                                                                                    <FaEdit size={10} /> Edit
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => handleDeleteComment(comment._id)}
                                                                                                    disabled={operatingCommentId === comment._id}
                                                                                                    className={`hover:${appTheme.errorColor} flex items-center gap-1 transition-colors duration-200`}
                                                                                                >
                                                                                                    <FaTrash size={10} /> Delete
                                                                                                </button>
                                                                                            </div>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <div className={`text-5xl mb-3 ${appTheme.cardText}/50`}>💭</div>
                                                        <div className={`${appTheme.cardText} text-sm mb-1`}>No comments yet!</div>
                                                        <div className={`${appTheme.cardText}/60 text-xs`}>Be the first to share your thoughts</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Share Popup */}
            {showSharePopup && selectedPost && (
                <SharePopup
                    url={`${window.location.origin}/discuss/${selectedPost.slug}`}
                    title={selectedPost.title}
                    onClose={() => setShowSharePopup(false)}
                />
            )}

            {/* Confirmation Modal */}
            {showDeleteModal && deleteTarget && (
                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                    onConfirm={confirmDelete}
                    isLoading={
                        deleteTarget.type === 'post' ? isOperating :
                        (deleteTarget.type === 'comment' && operatingCommentId === deleteTarget.commentId)
                    }
                    title={deleteTarget.type === 'post' ? 'Delete Discussion Post?' : 'Delete Comment?'}
                    confirmText={deleteTarget.type === 'post' ? 'Delete Post' : 'Delete Comment'}
                    appTheme={appTheme}
                >
                    {deleteTarget.type === 'post' ? (
                        <p>Are you sure you want to permanently delete this discussion post? This action cannot be undone.</p>
                    ) : (
                        <p>Are you sure you want to permanently delete this comment? This action cannot be undone.</p>
                    )}
                </ConfirmationModal>
            )}
        </div>
    );
};

export default DiscussPage;