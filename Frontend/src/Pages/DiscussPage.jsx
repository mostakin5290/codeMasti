import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PostDetailModal from '../components/discuss/PostDetailModal'; // Import the new component
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
    
    // Modal state - simplified
    const [showPostDetail, setShowPostDetail] = useState(false);
    const [selectedPostSlug, setSelectedPostSlug] = useState(null);

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

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Simplified post click handler
    const handlePostClick = (post) => {
        setSelectedPostSlug(post.slug);
        setShowPostDetail(true);
    };

    // Close modal handler
    const handleCloseModal = () => {
        setShowPostDetail(false);
        setSelectedPostSlug(null);
    };

    // Refresh posts after post operations
    const handlePostUpdate = () => {
        fetchPosts();
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
                className={`relative group ${appTheme.cardBg}/5 hover:${appTheme.cardBg}/10 backdrop-blur-sm p-3 sm:p-5 rounded-xl border ${appTheme.border}/10 hover:border-${appTheme.primary.split('-')[1]}-500/50 transition-all duration-300 shadow-lg hover:shadow-${appTheme.primary.split('-')[1]}-500/10 cursor-pointer`}
                onClick={() => handlePostClick(post)}
            >
                {post.isPinned && (
                    <div className={`absolute top-2 sm:top-3 left-2 sm:left-3 ${appTheme.highlight}`}>
                        <FaThumbtack className="rotate-45 text-sm sm:text-base" />
                    </div>
                )}

                <div className="flex gap-3 sm:gap-4 items-start">
                    <div className="flex-shrink-0">
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full ${appTheme.primary.replace('bg-', 'bg-gradient-to-br from-')}/20 ${appTheme.secondary.replace('bg-', 'to-')}/20 border ${appTheme.border}/10 flex items-center justify-center overflow-hidden`}>
                            <img
                                src={post.author.avatar}
                                alt={post.author.username}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex-grow min-w-0">
                        <div className="block group">
                            <h3 className={`text-lg sm:text-xl font-semibold ${appTheme.text} group-hover:${appTheme.primary} transition-colors mb-1 line-clamp-2`}>
                                {post.title}
                                {post.isLive && (
                                    <span className={`ml-2 inline-flex items-center gap-1 text-xs ${appTheme.errorColor.replace('text-', 'bg-')}/20 ${appTheme.errorColor} px-2 py-0.5 rounded-full`}>
                                        <RiLiveLine /> Live
                                    </span>
                                )}
                            </h3>
                            <p className={`text-sm ${appTheme.cardText}/70 line-clamp-2 mb-2`}>{post.description}</p>
                        </div>

                        <div className={`flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs ${appTheme.cardText}/60`}>
                            <span className="flex items-center gap-1">
                                <FaUser className={`${appTheme.primary}/80 text-xs`} />
                                <span className="truncate max-w-24 sm:max-w-none">{post.author.username}</span>
                                {post.author.isVerified && (
                                    <span className={`${appTheme.infoColor}`} title="Verified User">
                                        ✓
                                    </span>
                                )}
                            </span>
                            <span className="flex items-center gap-1">
                                <FaRegClock className="text-xs" />
                                {formatRelativeTime(post.createdAt)}
                            </span>
                            {post.problem && (
                                <span className={`${appTheme.primary}/80 flex items-center gap-1`}>
                                    <FaLink size={10} />
                                    <span className="hidden sm:inline">Related Problem</span>
                                    <span className="sm:hidden">Problem</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                        <div
                            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 ${appTheme.cardBg}/5 rounded-full transition-colors`}
                            title="likes"
                        >
                            <FiThumbsUp className="text-xs sm:text-sm" />
                            <span className={`font-medium ${appTheme.text} text-xs sm:text-sm`}>{post.likeCount}</span>
                        </div>
                        <div
                            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 ${appTheme.cardBg}/5 rounded-full transition-colors`}
                            title="Comments"
                        >
                            <FaCommentDots className="text-xs sm:text-sm" />
                            <span className={`font-medium ${appTheme.text} text-xs sm:text-sm`}>{post.commentCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${appTheme.gradientFrom} ${appTheme.gradientTo} flex flex-col`}>
            <div className='mb-6 sm:mb-10'>
                <Header />
            </div>

            <div className="flex-1">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
                    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                        {/* Sidebar - Hidden on mobile */}
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
                        <div className="lg:w-3/4 space-y-4 sm:space-y-6">
                            {/* Header and Create Button */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')} bg-clip-text`}>
                                        Community Hub
                                    </h1>
                                    <p className={`${appTheme.cardText} text-sm sm:text-base`}>Connect, share, and learn with fellow developers</p>
                                </div>
                                <Link
                                    to="/discuss/new"
                                    className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg ${appTheme.primary} ${appTheme.buttonText} hover:${appTheme.primaryHover} shadow-lg hover:shadow-${appTheme.primary.split('-')[1]}-500/30 transition-all flex items-center justify-center gap-2 text-sm sm:text-base`}
                                >
                                    <FaRegLightbulb /> New Discussion
                                </Link>
                            </div>

                            {/* Mobile Community Stats */}
                            <div className={`lg:hidden ${appTheme.cardBg}/5 backdrop-blur-sm p-4 rounded-xl border ${appTheme.border}/10 mb-4`}>
                                <h2 className={`text-lg font-bold ${appTheme.text} mb-3 flex items-center gap-2`}>
                                    <BiTrendingUp className={`${appTheme.successColor}`} />
                                    Stats
                                </h2>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <div className={`font-bold ${appTheme.text}`}>{posts.length}</div>
                                        <div className={`text-xs ${appTheme.cardText}`}>Discussions</div>
                                    </div>
                                    <div>
                                        <div className={`font-bold ${appTheme.text}`}>{uniqueAuthors.length}</div>
                                        <div className={`text-xs ${appTheme.cardText}`}>Members</div>
                                    </div>
                                    <div>
                                        <div className={`font-bold ${appTheme.highlightTertiary}`}>{totalComments}</div>
                                        <div className={`text-xs ${appTheme.cardText}`}>Comments</div>
                                    </div>
                                </div>
                            </div>

                            {/* Search and Filter */}
                            <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className={`${appTheme.cardText}/50 text-sm`} />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className={`w-full pl-10 pr-4 ${appTheme.cardBg}/10 border-${appTheme.border.split('-')[1]}-200 text-${appTheme.text} rounded-xl shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent text-sm sm:text-base`}
                                        placeholder="Search discussions..."
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <select
                                        value={sortBy}
                                        onChange={handleSortChange}
                                        className={`col-span-2 pl-3 pr-8 ${appTheme.cardBg}/10 border-${appTheme.border.split('-')[1]}-200 text-${appTheme.text} rounded-xl shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent appearance-none text-sm sm:text-base`}
                                    >
                                        <option value="latest">Latest</option>
                                        <option value="likes">Most liked</option>
                                        <option value="comments">Most Comments</option>
                                        <option value="views">Most Viewed</option>
                                    </select>
                                    <button
                                        className={`${appTheme.cardBg}/10 hover:${appTheme.cardBg}/20 border-${appTheme.border.split('-')[1]}-200 ${appTheme.text} rounded-xl shadow-sm py-2 px-2 sm:px-4 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm`}
                                        onClick={() => {
                                            setActiveFilter(prev => prev === 'unanswered' ? 'all' : 'unanswered');
                                        }}
                                    >
                                        <FaFilter size={12} />
                                        <span className="hidden sm:inline">
                                            {activeFilter === 'unanswered' ? 'Unanswered' : 'Filter'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Discussion List */}
                            <div className="space-y-3 sm:space-y-4">
                                {loading ? (
                                    <div className="flex justify-center py-8 sm:py-12">
                                        <LoadingSpinner message="Loading discussions..." appTheme={appTheme} />
                                    </div>
                                ) : error ? (
                                    <div className={`text-center py-6 sm:py-10 ${appTheme.errorColor.replace('text-', 'bg-')}/10 rounded-xl ${appTheme.errorColor} border border-${appTheme.errorColor.split('-')[1]}-500/20`}>
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
                                    <div className={`text-center py-12 sm:py-16 ${appTheme.cardBg}/5 rounded-xl border border-dashed ${appTheme.border}/10`}>
                                        <h3 className={`text-lg sm:text-xl font-medium ${appTheme.text} mb-2`}>No discussions found</h3>
                                        <p className={`${appTheme.cardText} mb-4 text-sm sm:text-base`}>Be the first to start a conversation!</p>
                                        <Link
                                            to="/discuss/new"
                                            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg ${appTheme.primary} ${appTheme.buttonText} hover:${appTheme.primaryHover} text-sm`}
                                        >
                                            Create Post
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-6 sm:mt-8">
                                    <div className="join flex">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className={`px-3 sm:px-4 py-2 rounded-l-lg ${appTheme.cardBg}/10 ${appTheme.text} border ${appTheme.border}/10 hover:${appTheme.cardBg}/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                                        >
                                            <span className="hidden sm:inline">Previous</span>
                                            <span className="sm:hidden">Prev</span>
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
                                                    className={`px-3 sm:px-4 py-2 ${currentPage === pageNum ? `${appTheme.primary}/20 ${appTheme.primary}` : `${appTheme.cardBg}/5 hover:${appTheme.cardBg}/10`} ${appTheme.text} border ${appTheme.border}/10 text-sm`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 sm:px-4 py-2 rounded-r-lg ${appTheme.cardBg}/10 ${appTheme.text} border ${appTheme.border}/10 hover:${appTheme.cardBg}/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                                        >
                                            <span className="hidden sm:inline">Next</span>
                                            <span className="sm:hidden">Next</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Post Detail Modal - Now as separate component */}
            <PostDetailModal
                isOpen={showPostDetail}
                onClose={handleCloseModal}
                postSlug={selectedPostSlug}
                appTheme={appTheme}
                onPostUpdate={handlePostUpdate}
            />
        </div>
    );
};

export default DiscussPage;
