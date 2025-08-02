import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../../api/axiosClient';
// import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';
import SharePopup from '../common/SharePopup';
import MonacoEditor from '@monaco-editor/react';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';
import {
    FaRegBookmark, FaBookmark, FaEdit, FaTrash, FaShare
} from 'react-icons/fa';
import {
    FiMessageCircle, FiThumbsUp, FiX
} from 'react-icons/fi';
import { BiCodeAlt } from 'react-icons/bi';
import { HiOutlineLightBulb } from 'react-icons/hi';



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

const PostDetailModal = ({
    isOpen,
    onClose,
    postSlug,
    appTheme,
    onPostUpdate // Callback to refresh main posts list
}) => {
    const { user: currentUser } = useSelector(state => state.auth);
    const navigate = useNavigate();

    // States
    const [selectedPost, setSelectedPost] = useState(null);
    const [loading, setLoading] = useState(false);
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
    const [isMobile, setIsMobile] = useState(false);

    const LoadingSpinner = () => {
        return (
            <div className="flex items-center justify-center h-32">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-${appTheme.highlightColor}-400`}></div>
            </div>
        )
    }
    // Check screen size for responsive design
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Sync Monaco theme based on app theme's background
    useEffect(() => {
        if (appTheme.background.includes('dark') || appTheme.background.includes('black') || appTheme.background.includes('zinc-9')) {
            setMonacoEditorTheme('vs-dark');
        } else {
            setMonacoEditorTheme('vs-light');
        }
    }, [appTheme.background]);

    // Fetch post details when modal opens
    useEffect(() => {
        if (isOpen && postSlug) {
            fetchPostDetail(postSlug);
        }
    }, [isOpen, postSlug]);

    const fetchPostDetail = async (slug) => {
        setLoading(true);
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
            setLoading(false);
        }
    };

    const handleClose = () => {
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
        onClose();
    };

    // Post handlers
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
        handleClose();
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

    // Comment handlers
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

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'post') {
            setIsOperating(true);
        } else if (deleteTarget.type === 'comment') {
            setOperatingCommentId(deleteTarget.commentId);
        }

        try {
            if (deleteTarget.type === 'post') {
                await axiosClient.delete(`/discuss/posts/${deleteTarget.id}`);
                toast.success("Post deleted successfully! 👋");
                handleClose();
                if (onPostUpdate) onPostUpdate(); // Refresh main posts list
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

    const hasCurrentUserLikedPost = currentUser && selectedPost?.likes?.includes(currentUser._id);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center overflow-hidden">
                {/* Mobile: Full screen container with proper scrolling */}
                <div className={`${isMobile ? 'w-full h-full' : 'w-full max-w-7xl h-[90vh] m-4'} ${appTheme.cardBg} ${isMobile ? '' : 'rounded-xl shadow-2xl'} flex flex-col`}>
                    {/* Header - Fixed */}
                    <div className={`flex-shrink-0 p-3 sm:p-4 border-b ${appTheme.border} flex items-center justify-between ${isMobile ? 'sticky top-0 z-10' : ''} ${appTheme.cardBg}`}>
                        <h2 className={`text-lg sm:text-xl font-bold ${appTheme.text}`}>Discussion Details</h2>
                        <button
                            onClick={handleClose}
                            className={`p-2 rounded-full ${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80 transition-colors`}
                        >
                            <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center w-full h-full">
                                <LoadingSpinner message="Loading post details..." appTheme={appTheme} />
                            </div>
                        ) : selectedPost ? (
                            <div className={`flex ${isMobile ? 'flex-col' : 'h-full'}`}>
                                {/* Post Content - Top on mobile, Left on desktop */}
                                <div className={`${isMobile ? 'flex-shrink-0 max-h-[50vh]' : 'flex-1'} overflow-y-auto ${isMobile ? 'border-b' : ''} ${appTheme.border}`}>
                                    <div className="p-4 sm:p-6">
                                        {/* Post Header */}
                                        <div className="mb-4 sm:mb-6">
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={selectedPost?.author?.avatar}
                                                        alt={selectedPost?.author?.username}
                                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${appTheme.border}`}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h2 className={`text-sm font-semibold ${appTheme.text}`}>{selectedPost?.author?.username}</h2>
                                                        <span className={`${appTheme.cardText} text-xs`}>•</span>
                                                        <time className={`${appTheme.cardText} text-xs`}>{formatDateTime(selectedPost.createdAt)}</time>
                                                    </div>

                                                    <h1 className={`text-xl sm:text-2xl font-bold ${appTheme.text} mb-3 leading-tight`}>{selectedPost.title}</h1>

                                                    <div className={`flex items-center gap-3 sm:gap-4 text-sm ${appTheme.cardText} mb-4`}>
                                                        <div className="flex items-center gap-1">
                                                            <FiMessageCircle className={`${appTheme.cardText}/80 text-xs sm:text-sm`} />
                                                            <span className="text-xs sm:text-sm">{comments.length} comments</span>
                                                        </div>
                                                        {selectedPost.problem && (
                                                            <Link
                                                                to={`/codefield/${selectedPost.problem._id}`}
                                                                className={`flex items-center gap-1 ${appTheme.highlight} hover:${appTheme.highlightSecondary} transition-colors`}
                                                                onClick={handleClose}
                                                            >
                                                                <HiOutlineLightBulb className="text-xs sm:text-sm" />
                                                                <span className="text-xs sm:text-sm">Related Problem</span>
                                                            </Link>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex items-center gap-2 mb-4 sm:mb-6 flex-wrap">
                                                        <button
                                                            onClick={handlePostLike}
                                                            disabled={isOperating}
                                                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm rounded-lg transition-all duration-200 ${hasCurrentUserLikedPost
                                                                ? `${appTheme.primary} ${appTheme.buttonText}`
                                                                : `${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80`
                                                                }`}
                                                        >
                                                            <FiThumbsUp className={`w-3 h-3 sm:w-4 sm:h-4 ${hasCurrentUserLikedPost ? 'fill-current' : ''}`} />
                                                            <span className="font-medium text-xs sm:text-sm">{selectedPost?.likes?.length || 0}</span>
                                                        </button>

                                                        <button
                                                            onClick={handleBookmarkToggle}
                                                            disabled={isOperating}
                                                            className={`p-2 rounded-lg ${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80 transition-colors`}
                                                            title={isBookmarked ? "Remove Bookmark" : "Bookmark Post"}
                                                        >
                                                            {isBookmarked ? <FaBookmark className="w-3 h-3 sm:w-4 sm:h-4" /> : <FaRegBookmark className="w-3 h-3 sm:w-4 sm:h-4" />}
                                                        </button>

                                                        <button
                                                            onClick={() => setShowSharePopup(true)}
                                                            className={`p-2 rounded-lg ${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.cardBg}/80 transition-colors`}
                                                            title="Share Post"
                                                        >
                                                            <FaShare className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        </button>

                                                        {currentUser?._id === selectedPost?.author?._id && (
                                                            <>
                                                                <button
                                                                    onClick={handleEditPost}
                                                                    disabled={isOperating}
                                                                    className={`p-2 rounded-lg ${appTheme.cardBg} ${appTheme.cardText} hover:${appTheme.highlight} transition-colors`}
                                                                    title="Edit Post"
                                                                >
                                                                    <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={handleDeletePost}
                                                                    disabled={isOperating}
                                                                    className={`p-2 rounded-lg ${appTheme.cardBg} ${appTheme.errorColor} hover:${appTheme.errorColor}/80 transition-colors`}
                                                                    title="Delete Post"
                                                                >
                                                                    <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Post Content */}
                                        <div className="space-y-4 sm:space-y-6">
                                            <div
                                                className={`prose prose-sm max-w-none ${isOverallThemeDark(appTheme) ? 'prose-invert' : ''} ${appTheme.cardText} leading-relaxed text-sm sm:text-base`}
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
                                                            height={isMobile ? "200px" : "400px"}
                                                            language={selectedPost.language}
                                                            theme={monacoEditorTheme}
                                                            value={selectedPost.code}
                                                            options={{
                                                                readOnly: true,
                                                                minimap: { enabled: !isMobile },
                                                                fontSize: isMobile ? 12 : 14,
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
                                                                <div className={`h-[${isMobile ? '200px' : '400px'}] flex items-center justify-center ${appTheme.background} ${appTheme.cardText}`}>
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

                                {/* Comments Section */}
                                <div className={`${isMobile ? 'flex-1 min-h-0' : 'w-1/2 border-l'} ${!isMobile ? appTheme.border : ''} flex flex-col`}>
                                    {/* Comments Header */}
                                    <div className={`flex-shrink-0 p-3 sm:p-4 ${isMobile ? 'sticky top-0 z-10 border-b' : 'border-b'} ${appTheme.border} ${appTheme.cardBg}`}>
                                        <h3 className={`text-base sm:text-lg font-bold ${appTheme.text}`}>
                                            Comments
                                            <span className={`text-sm font-normal ${appTheme.cardText} ml-2`}>
                                                ({comments.length})
                                            </span>
                                        </h3>
                                    </div>

                                    {/* Comments Content */}
                                    <div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-4' : ''}`} style={isMobile ? { maxHeight: 'calc(50vh - 60px)' } : {}}>
                                        <div className="p-3 sm:p-4">
                                            {/* Comment Form */}
                                            {currentUser ? (
                                                <div className={`mb-4 sm:mb-6 ${isMobile ? 'sticky top-0 z-10 pb-3' : ''} ${isMobile ? appTheme.cardBg : ''}`}>
                                                    <form onSubmit={handleCommentSubmit}>
                                                        <div className="flex gap-2 sm:gap-3">
                                                            <img
                                                                src={currentUser.avatar}
                                                                alt={currentUser.username}
                                                                className={`w-8 h-8 rounded-full border ${appTheme.border} flex-shrink-0`}
                                                            />
                                                            <div className="flex-1">
                                                                <textarea
                                                                    value={newComment}
                                                                    onChange={(e) => setNewComment(e.target.value)}
                                                                    className={`w-full ${appTheme.cardBg}/80 border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 sm:py-3 px-3 sm:px-4 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent transition-all duration-200 resize-none text-sm placeholder-${appTheme.cardText.split('-')[1]}-400`}
                                                                    placeholder="Share your thoughts..."
                                                                    disabled={operatingCommentId === 'new-comment'}
                                                                    rows={isMobile ? "2" : "3"}
                                                                />
                                                                <div className="flex justify-between items-center mt-2">
                                                                    <div className={`text-xs ${appTheme.cardText}`}>
                                                                        Be respectful 💙
                                                                    </div>
                                                                    <button
                                                                        type="submit"
                                                                        disabled={operatingCommentId === 'new-comment' || !newComment.trim()}
                                                                        className={`px-3 sm:px-4 py-1.5 sm:py-2 ${appTheme.primary} ${appTheme.buttonText} text-xs sm:text-sm font-medium rounded-lg hover:${appTheme.primaryHover} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                                                                    >
                                                                        {operatingCommentId === 'new-comment' ? 'Posting...' : 'Post Comment'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            ) : (
                                                <div className={`text-center py-6 sm:py-8 ${appTheme.cardBg}/20 rounded-lg mb-4 sm:mb-6`}>
                                                    <div className={`${appTheme.text} text-3xl sm:text-4xl mb-3`}>💬</div>
                                                    <p className={`${appTheme.cardText} mb-4 text-sm`}>Ready to join the discussion?</p>
                                                    <button
                                                        onClick={() => {
                                                            handleClose();
                                                            navigate('/login');
                                                        }}
                                                        className={`px-4 sm:px-6 py-2 ${appTheme.primary} ${appTheme.buttonText} text-sm font-medium rounded-lg hover:${appTheme.primaryHover} transition-all duration-200`}
                                                    >
                                                        Sign In to Comment
                                                    </button>
                                                </div>
                                            )}

                                            {/* Comments List */}
                                            {comments.length > 0 ? (
                                                <div className="space-y-3 sm:space-y-4">
                                                    {comments.map(comment => (
                                                        comment && comment._id && (
                                                            <div key={comment._id} className="group">
                                                                <div className="flex gap-2 sm:gap-3">
                                                                    <img
                                                                        src={comment?.author?.avatar}
                                                                        alt={comment?.author?.username}
                                                                        className={`w-8 h-8 rounded-full border ${appTheme.border} flex-shrink-0`}
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className={`${appTheme.cardBg}/50 rounded-lg p-3 sm:p-4`}>
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className={`font-medium ${appTheme.text} text-sm`}>
                                                                                        {comment?.author?.firstName}
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
                                                                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all duration-200 ${currentUser && comment.likes.includes(currentUser._id)
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
                                                                                        rows={isMobile ? "2" : "3"}
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
                                                <div className="text-center py-8 sm:py-12">
                                                    <div className={`text-4xl sm:text-5xl mb-3 ${appTheme.cardText}/50`}>💭</div>
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
        </>
    );
};

export default PostDetailModal;
