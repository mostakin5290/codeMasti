import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import MonacoEditor from '@monaco-editor/react';
import DOMPurify from 'dompurify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
    FaBookmark,
    FaEdit,
    FaTrash,
    FaReply,
    FaRegBookmark,
    FaEye,
    FaShare,
    FaComments,
    FaExpandArrowsAlt,
    FaCompressArrowsAlt,
} from 'react-icons/fa';
import { FiChevronLeft, FiMessageCircle, FiThumbsUp, FiChevronRight, FiChevronLeft as FiChevronLeftLarge } from 'react-icons/fi';
import { BiCodeAlt } from 'react-icons/bi';
import { HiOutlineLightBulb } from 'react-icons/hi';
import SharePopup from '../../components/common/SharePopup';
import { useTheme } from '../../context/ThemeContext';

// Default theme for the app context. This will be merged with actual theme.
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

const DiscussPostDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useSelector(state => state.auth);

    const { theme: appThemeFromContext } = useTheme(); // Get app theme
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) }; // Merge with default

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpvoted, setIsUpvoted] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [upvoteCount, setUpvoteCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState('');
    const [isOperating, setIsOperating] = useState(false);
    const [operatingCommentId, setOperatingCommentId] = useState(null);

    const [showCommentsPanel, setShowCommentsPanel] = useState(true); // State to toggle comments panel

    // Monaco editor theme state
    const [monacoEditorTheme, setMonacoEditorTheme] = useState('vs-dark');

    // Sync Monaco theme based on app theme's background
    useEffect(() => {
        if (appTheme.background.includes('dark') || appTheme.background.includes('black') || appTheme.background.includes('zinc-9')) {
            setMonacoEditorTheme('vs-dark');
        } else {
            setMonacoEditorTheme('vs-light');
        }
    }, [appTheme.background]);


    const fetchPost = useCallback(async () => {
        try {
            const { data } = await axiosClient.get(`/discuss/post/${slug}`);
            console.log(data); // Inspect this data structure to confirm upvotes types
            setPost(data);
            setUpvoteCount(data.upvotes.length);

            const processedComments = data.comments?.map(comment => ({
                ...comment,
                _id: comment._id || `temp_${Math.random().toString(36).substring(2, 11)}`,
                upvotes: comment.upvotes || []
            })) || [];

            setComments(processedComments);

            if (currentUser) {
                // Convert each ObjectId in data.upvotes to string for comparison with currentUser._id
                setIsUpvoted(data.upvotes.map(id => id.toString()).includes(currentUser._id));
                setIsBookmarked(data.bookmarks?.map(id => id.toString()).includes(currentUser._id) || false);
            }
        } catch (err) {
            setError("Hmm, this post seems to have vanished into the digital void 🤔");
            toast.error("Couldn't load the post");
        } finally {
            setLoading(false);
        }
    }, [slug, currentUser]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

const handleUpvote = async () => {
    if (!currentUser) {
        toast.error("Join us to show some love! 💙");
        return navigate('/login');
    }
    if (isOperating) return;

    setIsOperating(true);
    try {
        // Optimistic update (frontend side for immediate feedback)
        const newIsUpvotedOptimistic = !isUpvoted;
        setIsUpvoted(newIsUpvotedOptimistic);
        setUpvoteCount(prev => newIsUpvotedOptimistic ? prev + 1 : prev - 1);

        await axiosClient.patch(`/discuss/up/${post._id}`);

        // Re-fetch post to ensure counts are accurate after the operation
        // This is a good fallback, as the backend is now fixed to return correct state.
        const { data } = await axiosClient.get(`/discuss/post/${slug}`);
        setPost(data); // Update the entire post object
        setUpvoteCount(data.upvotes.length); // Get actual count from fresh data
        // Update isUpvoted based on actual fetched data
        setIsUpvoted(data.upvotes.map(id => id.toString()).includes(currentUser._id));
    } catch (err) {
        // Revert optimistic update on error
        setIsUpvoted(prev => !prev);
        setUpvoteCount(prev => isUpvoted ? prev - 1 : prev + 1);
        toast.error("Oops! Something went wrong");
    } finally {
        setIsOperating(false);
    }
};

    // Function to handle editing the main post
    const handleEditPost = () => {
        if (!currentUser || currentUser._id !== post.author._id) {
            toast.error("You are not authorized to edit this post.");
            return;
        }
        // Navigate to the create/edit post page, passing current post data
        navigate(`/discuss/edit/${post.slug}`, { state: { post } });
    };

    // Function to handle deleting the main post
    const handleDeletePost = async () => {
        if (!currentUser || currentUser._id !== post.author._id) {
            toast.error("You are not authorized to delete this post.");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            return;
        }

        setIsOperating(true);
        try {
            console.log("Deleting post:", post._id);
            await axiosClient.delete(`/discuss/${post._id}`);
            toast.success("Post deleted successfully! 👋");
            navigate('/discuss'); // Redirect to discussions list after deletion
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete post.");
        } finally {
            setIsOperating(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || operatingCommentId) return;
        if (!currentUser) {
            toast.error("Please login to join the conversation! 💬");
            return navigate('/login');
        }

        setOperatingCommentId('new-comment'); // Indicate operation in progress
        try {
            const { data } = await axiosClient.post(`/discuss/${post._id}/comments`, {
                content: newComment
            });
            setComments([{ ...data, upvotes: data.upvotes || [] }, ...comments]); // Add new comment to top
            setNewComment('');
            toast.success("Your thoughts have been shared! 🎉");
        } catch (err) {
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
        if (!editCommentContent.trim() || operatingCommentId) return;
        setOperatingCommentId(commentId); // Indicate operation in progress

        try {
            const { data } = await axiosClient.put(`/discuss/${post._id}/comments/${commentId}`, {
                content: editCommentContent
            });
            setComments(comments.map(comment =>
                comment._id === commentId ? { ...data, upvotes: data.upvotes || [] } : comment
            ));
            setEditingCommentId(null); // Exit editing mode
            toast.success("Comment updated! ✨");
        } catch (err) {
            toast.error("Failed to update comment");
        } finally {
            setOperatingCommentId(null);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (operatingCommentId || !window.confirm("Are you sure you want to delete this comment?")) return;
        setOperatingCommentId(commentId); // Indicate operation in progress

        try {
            await axiosClient.delete(`/discuss/${post._id}/comments/${commentId}`);
            setComments(comments.filter(comment => comment._id !== commentId));
            toast.success("Comment deleted");
        } catch (err) {
            toast.error("Failed to delete comment");
        } finally {
            setOperatingCommentId(null);
        }
    };

    const handleCommentUpvote = async (commentId) => {
        if (!currentUser || operatingCommentId) {
            if (!currentUser) toast.error("Login to show appreciation! 👍");
            return;
        }
        setOperatingCommentId(commentId); // Indicate operation in progress

        try {
            // Optimistic update for comment upvote
            setComments(comments.map(comment => {
                if (comment._id === commentId) {
                    const newUpvotes = comment.upvotes.includes(currentUser._id)
                        ? comment.upvotes.filter(id => id !== currentUser._id)
                        : [...comment.upvotes, currentUser._id];
                    return { ...comment, upvotes: newUpvotes };
                }
                return comment;
            }));

            await axiosClient.patch(`/discuss/${post._id}/comments/${commentId}/upvote`);
        } catch (err) {
            // Revert optimistic update on error
            setComments(comments.map(comment => {
                if (comment._id === commentId) {
                    const originalUpvotes = comment.upvotes.includes(currentUser._id)
                        ? comment.upvotes.filter(id => id !== currentUser._id)
                        : [...comment.upvotes, currentUser._id];
                    return { ...comment, upvotes: originalUpvotes };
                }
                return comment;
            }));
            toast.error("Failed to update vote");
        } finally {
            setOperatingCommentId(null);
        }
    };

    // Helper to determine if the theme's background is generally dark for prose styling
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
            return shade >= 600; // Shades 600 and above are typically dark
        }
        return false; // Assume light otherwise
    };


    if (loading) return (
        <div className={`min-h-screen ${appTheme.background} flex items-center justify-center`}>
            <LoadingSpinner message="Loading amazing content..." appTheme={appTheme} />
        </div>
    );

    if (error) return (
        <div className={`min-h-screen ${appTheme.background} flex items-center justify-center`}>
            <div className={`text-center p-8 ${appTheme.cardBg} rounded-xl border ${appTheme.border}`}>
                <div className={`${appTheme.text} text-6xl mb-4`}>🔍</div>
                <div className={`${appTheme.cardText} text-xl mb-4`}>{error}</div>
                <button
                    onClick={() => navigate('/discuss')}
                    className={`px-6 py-3 ${appTheme.primary} ${appTheme.buttonText} rounded-full hover:${appTheme.primaryHover} transition-colors`}
                >
                    Browse Other Discussions
                </button>
            </div>
        </div>
    );

    // Dynamic classes for post content column
    const postColumnClasses = `lg:order-1 ${showCommentsPanel ? 'lg:col-span-1' : 'lg:col-span-full'}`;
    // Dynamic classes for comments panel column
    const commentsColumnClasses = `lg:order-2 lg:col-span-1 lg:sticky lg:top-28 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto custom-scrollbar ${showCommentsPanel ? 'lg:block' : 'lg:hidden'} transition-all duration-300 ease-in-out`;


    return (
        <div className={`min-h-screen ${appTheme.background}`}>
            <Header />

            <main className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 ${showCommentsPanel ? 'lg:grid lg:grid-cols-2 lg:gap-8' : ''}`}>
                {/* Left Column: Main Post Card */}
                <div className={postColumnClasses}>
                    {/* Back Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className={`flex items-center gap-1 ${appTheme.cardText} hover:${appTheme.highlight} text-sm transition-colors duration-200 group`}
                        >
                            <FiChevronLeft className="text-base group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Discussions</span>
                        </button>
                    </div>

                    <article className={`${appTheme.cardBg} rounded-lg shadow border ${appTheme.border} overflow-hidden mb-6`}>
                        {/* Post Header */}
                        <div className={`p-4 sm:p-6 border-b ${appTheme.border}`}>
                            <div className="flex items-start gap-4">
                                {/* Author Avatar */}
                                {post?.author?._id !== currentUser._id ? (
                                    <Link to={`/profile/${post?.author?._id}`} className="flex-shrink-0">
                                        <img
                                            src={post?.author?.avatar}
                                            alt={post?.author?.username}
                                            className={`w-10 h-10 rounded-full border-2 ${appTheme.border}`}
                                        />
                                    </Link>
                                ) : (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={post?.author?.avatar}
                                            alt={post?.author?.username}
                                            className={`w-10 h-10 rounded-full border-2 ${appTheme.border}`}
                                        />
                                    </div>
                                )}


                                {/* Post Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className={`text-sm font-semibold ${appTheme.text}`}>{post?.author?.username}</h2>
                                        <span className={`${appTheme.cardText} text-xs`}>•</span>
                                        <time className={`${appTheme.cardText} text-xs`}>{formatDateTime(post.createdAt)}</time>
                                    </div>

                                    <h1 className={`text-xl font-bold ${appTheme.text} mb-2 leading-tight`}>{post.title}</h1>

                                    {/* Post Stats */}
                                    <div className={`flex items-center gap-4 text-xs ${appTheme.cardText}`}>
                                        <div className="flex items-center gap-1">
                                            <FiMessageCircle className={`${appTheme.cardText}/80`} />
                                            <span>{comments.length} comments</span>
                                        </div>
                                        {post.problem && (
                                            <Link
                                                to={`/codefield/${post.problem._id}`}
                                                className={`flex items-center gap-1 ${appTheme.highlight} hover:${appTheme.highlightSecondary} transition-colors text-xs`}
                                            >
                                                <HiOutlineLightBulb className="text-sm" />
                                                <span>Related Problem</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 relative">
                                    <button
                                        onClick={handleUpvote}
                                        disabled={isOperating}
                                        className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-all duration-200 
                                            ${isUpvoted ? `${appTheme.primary.replace('bg-', 'bg-')}/20 ${appTheme.highlight} fill-current` : `${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80`}
                                        `}
                                    >
                                        <FiThumbsUp className={`${isUpvoted ? 'fill-current w-5 h-5' : 'w-5 h-5'}`} /> {/* Bigger Icon */}
                                        <span className="font-medium">{upvoteCount}</span>
                                    </button>

                                    <button
                                        onClick={() => setShowSharePopup(true)}
                                        className={`p-2 rounded-full ${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80 transition-colors`}
                                    >
                                        <FaShare className="w-5 h-5" /> {/* Bigger Icon */}
                                    </button>

                                    {/* Edit/Delete Buttons (visible only for author) */}
                                    {currentUser?._id === post?.author?._id && (
                                        <>
                                            <button
                                                onClick={handleEditPost}
                                                disabled={isOperating}
                                                className={`p-2 rounded-full ${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.highlight} hover:${appTheme.cardBg}/80 transition-colors`}
                                                title="Edit Post"
                                            >
                                                <FaEdit className="w-5 h-5" /> {/* Bigger Icon */}
                                            </button>
                                            <button
                                                onClick={handleDeletePost}
                                                disabled={isOperating}
                                                className={`p-2 rounded-full ${appTheme.cardBg} ${appTheme.errorColor} hover:${appTheme.errorColor}/80 hover:${appTheme.cardBg}/80 transition-colors`}
                                                title="Delete Post"
                                            >
                                                <FaTrash className="w-5 h-5" /> {/* Bigger Icon */}
                                            </button>
                                        </>
                                    )}

                                    {/* Toggle Comments Panel Button (for desktop views) */}
                                    <button
                                        onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                                        className={`hidden lg:flex items-center justify-center p-2 rounded-full transition-all duration-200 
                                            ${showCommentsPanel ? `${appTheme.primary.replace('bg-', 'bg-')}/20 ${appTheme.highlight}` : `${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80`}
                                        `}
                                        title={showCommentsPanel ? "Hide Comments" : "Show Comments"}
                                    >
                                        {showCommentsPanel ? <FaComments className="w-5 h-5" /> : <FiChevronRight className="w-6 h-6" />} {/* Bigger Icon */}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="p-4 sm:p-6">
                            <div
                                className={`prose prose-sm max-w-none ${isOverallThemeDark(appTheme) ? 'prose-invert' : ''} ${appTheme.cardText} leading-relaxed`}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.description) }}
                            />

                            {post.code && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`flex items-center gap-1 text-sm font-semibold ${appTheme.text}`}>
                                            <BiCodeAlt className={`${appTheme.infoColor}`} />
                                            <span>Code Solution</span>
                                        </div>
                                        <span className={`px-2 py-0.5 ${appTheme.infoColor.replace('text-', 'bg-')}/20 ${appTheme.infoColor} text-xs font-medium rounded-full`}>
                                            {post.language}
                                        </span>
                                    </div>
                                    <div className={`rounded-lg overflow-hidden border ${appTheme.border}`}>
                                        <MonacoEditor
                                            height="300px" // Default height
                                            // Dynamic height based on fullscreenPost status
                                            style={{ minHeight: showCommentsPanel ? '300px' : 'calc(100vh - 300px)' }} // Adjust based on comments panel
                                            language={post.language}
                                            theme={monacoEditorTheme} // Use dynamic theme
                                            value={post.code}
                                            options={{
                                                readOnly: true,
                                                minimap: { enabled: false },
                                                fontSize: 13,
                                                lineNumbers: 'on',
                                                scrollBeyondLastLine: false,
                                                renderWhitespace: 'none',
                                                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                                lineDecorationsWidth: 10,
                                                lineNumbersMinChars: 3,
                                                padding: { top: 8, bottom: 8 },
                                                overviewRulerBorder: false
                                            }}
                                            loading={
                                                <div className={`h-[300px] flex items-center justify-center ${appTheme.background} ${appTheme.cardText}`}>
                                                    Loading code...
                                                </div>
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>
                </div>

                {/* Right Column: Comments Section */}
                <div className={commentsColumnClasses}>
                    <section id="comments" className={`${appTheme.cardBg} rounded-lg shadow border ${appTheme.border} overflow-hidden`}>
                        <div className={`p-4 sm:p-6 border-b ${appTheme.border}`}>
                            <h3 className={`text-lg font-bold ${appTheme.text} mb-4`}>
                                Comments
                                <span className={`text-sm font-normal ${appTheme.cardText} ml-2`}>
                                    ({comments.length})
                                </span>
                            </h3>

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
                                                className={`w-full ${appTheme.cardBg}/80 border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent transition-all duration-200 resize-none text-sm placeholder-${appTheme.cardText.split('-')[1]}-400`}
                                                placeholder="Share your thoughts..."
                                                rows="3"
                                                disabled={isOperating}
                                            />
                                            <div className="flex justify-between items-center mt-2">
                                                <div className={`text-xs ${appTheme.cardText}`}>
                                                    Be respectful 💙
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isOperating || !newComment.trim()}
                                                    className={`px-4 py-1.5 ${appTheme.primary} ${appTheme.buttonText} text-sm font-medium rounded-full hover:${appTheme.primaryHover} transition-all duration-200 ${(isOperating || !newComment.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                >
                                                    {isOperating ? 'Posting...' : 'Post'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className={`text-center py-6 ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')}/50 ${appTheme.secondary.replace('bg-', 'to-')}/50 rounded-lg mb-6`}>
                                    <div className={`${appTheme.text} text-3xl mb-2`}>💬</div>
                                    <p className={`${appTheme.cardText} mb-3 text-sm`}>Ready to join the discussion?</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className={`px-6 py-2 ${appTheme.primary} ${appTheme.buttonText} text-sm font-medium rounded-full hover:${appTheme.primaryHover} transition-all duration-200`}
                                    >
                                        Sign In to Comment
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Comments List */}
                        <div className="p-4 sm:p-6">
                            {comments.length > 0 ? (
                                <div className="space-y-4">
                                    {comments.map(comment => (
                                        comment && comment._id && (
                                            <div key={comment._id} className="group">
                                                <div className="flex gap-3">
                                                    <img
                                                        src={comment?.author?.avatar}
                                                        alt={comment?.author?.username}
                                                        className={`w-7 h-7 rounded-full border ${appTheme.border} flex-shrink-0`}

                                                    />

                                                    <div className="flex-1">
                                                        <div className={`${appTheme.cardBg} rounded-lg p-3`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`font-medium ${appTheme.text} text-sm`}>
                                                                        {comment?.author?.username}
                                                                    </span>
                                                                    <time className={`${appTheme.cardText} text-xs`}>
                                                                        {formatDateTime(comment?.createdAt)}
                                                                    </time>
                                                                    {comment.isEdited && (
                                                                        <span className={`text-xs ${appTheme.cardText} ${appTheme.background} px-1.5 py-0.5 rounded-full`}>
                                                                            edited
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => handleCommentUpvote(comment._id)}
                                                                        disabled={operatingCommentId === comment._id}
                                                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-200 
                                                                            ${comment.upvotes.includes(currentUser?._id) ? `${appTheme.primary.replace('bg-', 'bg-')}/20 ${appTheme.highlight} fill-current` : `${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80`}
                                                                        `}
                                                                    >
                                                                        <FiThumbsUp className={`${comment.upvotes.includes(currentUser?._id) ? 'fill-current w-3 h-3' : 'w-3 h-3'}`} />
                                                                        <span className="font-medium">{comment.upvotes.length}</span>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {editingCommentId === comment._id ? (
                                                                <div className="space-y-2">
                                                                    <textarea
                                                                        value={editCommentContent}
                                                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                                                        className={`w-full ${appTheme.cardBg}/80 border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent transition-all duration-200 text-sm`}
                                                                        rows="2"
                                                                        disabled={operatingCommentId === comment._id}
                                                                    />
                                                                    <div className="flex justify-end gap-1">
                                                                        <button
                                                                            onClick={() => setEditingCommentId(null)}
                                                                            disabled={operatingCommentId === comment._id}
                                                                            className={`px-3 py-1 ${appTheme.cardBg}/80 hover:${appTheme.cardBg}/60 ${appTheme.cardText} text-xs rounded-full transition-colors duration-200`}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateComment(comment._id)}
                                                                            disabled={operatingCommentId === comment._id}
                                                                            className={`px-3 py-1 ${appTheme.primary} ${appTheme.buttonText} hover:${appTheme.primaryHover} text-xs rounded-full transition-colors duration-200`}
                                                                        >
                                                                            {operatingCommentId === comment._id ? 'Updating...' : 'Save'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <p className={`${appTheme.cardText} text-sm leading-relaxed whitespace-pre-wrap mb-2`}>
                                                                        {comment?.content}
                                                                    </p>

                                                                    <div className={`flex items-center gap-3 text-xs ${appTheme.cardText}`}>
                                                                        {currentUser?._id === comment?.author?._id && (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => handleEditComment(comment)}
                                                                                    disabled={isOperating}
                                                                                    className={`hover:${appTheme.highlight} flex items-center gap-0.5 transition-colors duration-200`}
                                                                                >
                                                                                    <FaEdit size={10} /> Edit
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteComment(comment._id)}
                                                                                    disabled={isOperating}
                                                                                    className={`hover:${appTheme.errorColor} flex items-center gap-0.5 transition-colors duration-200`}
                                                                                >
                                                                                    <FaTrash size={10} /> Delete
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
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
                                <div className="text-center py-8">
                                    <div className={`text-4xl mb-2 ${appTheme.cardText}`}>💭</div>
                                    <div className={`${appTheme.cardText} text-sm mb-1`}>No comments yet!</div>
                                    <div className={`${appTheme.cardText}/80 text-xs`}>Be the first to comment</div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />

            {showSharePopup && (
                <SharePopup
                    url={`${window.location.origin}/discuss/${post.slug}`}
                    title={post.title}
                    onClose={() => setShowSharePopup(false)}
                />
            )}
        </div>
    );
};

export default DiscussPostDetail;