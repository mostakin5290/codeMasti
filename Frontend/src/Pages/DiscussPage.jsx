import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
    FaThumbtack, FaCommentDots, FaUser, FaEye,
    FaFire, FaSearch, FaSort,
    FaLink, FaRegBookmark, FaBookmark, FaFilter,
    FaRegClock, FaChartLine, FaRegLightbulb
} from 'react-icons/fa';
import { FiChevronLeft, FiMessageCircle, FiThumbsUp } from 'react-icons/fi';
import { MdWhatshot, MdNewReleases, MdTrendingUp } from 'react-icons/md';
import { RiLiveLine } from 'react-icons/ri';
import { BiTrendingUp } from 'react-icons/bi';
import { useTheme } from '../context/ThemeContext'; // Import useTheme hook

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

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeFilter, setActiveFilter] = useState('all');
    const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
    const [popularDiscussions, setPopularDiscussions] = useState([]); // Dummy data used

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

            // Generate dummy popular discussions from the first 3 posts
            setPopularDiscussions(data.posts.slice(0, 3).map(post => ({
                ...post,
                upvoteCount: post.upvoteCount,
                commentCount: post.commentCount
            })));


            // Simulate bookmarks - in a real app, this would come from the API
            setBookmarkedPosts([]);

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

    const uniqueAuthors = [...new Set(posts.map(post => post.author._id))];
    const totalComments = posts.reduce((sum, post) => sum + (post.commentCount || 0), 0);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };


    const DiscussionListItem = ({ post }) => {
        return (
            <div className={`relative group ${appTheme.cardBg}/5 hover:${appTheme.cardBg}/10 backdrop-blur-sm p-5 rounded-xl border ${appTheme.border}/10 hover:border-${appTheme.primary.split('-')[1]}-500/50 transition-all duration-300 shadow-lg hover:shadow-${appTheme.primary.split('-')[1]}-500/10`}>
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
                        <Link to={`/discuss/${post.slug}`} className="block group">
                            <h3 className={`text-xl font-semibold ${appTheme.text} group-hover:${appTheme.primary} transition-colors mb-1`}>
                                {post.title}
                                {post.isLive && (
                                    <span className={`ml-2 inline-flex items-center gap-1 text-xs ${appTheme.errorColor.replace('text-', 'bg-')}/20 ${appTheme.errorColor} px-2 py-0.5 rounded-full`}>
                                        <RiLiveLine /> Live
                                    </span>
                                )}
                            </h3>
                            <p className={`text-sm ${appTheme.cardText}/70 line-clamp-2 mb-2`}>{post.description}</p>
                        </Link>

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
                                <Link
                                    to={`/codefield/${post.problem._id}`}
                                    className={`${appTheme.primary}/80 hover:underline flex items-center gap-1`}
                                >
                                    <FaLink size={10} />
                                    Related Problem
                                </Link>
                            )}

                        </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-3">
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1 ${appTheme.cardBg}/5 rounded-full hover:${appTheme.primary}/20 cursor-not-allowed transition-colors`}
                            title="Upvotes"
                        >
                            <FiThumbsUp />
                            <span className={`font-medium ${appTheme.text}`}>{post.upvoteCount}</span>
                        </div>
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1 ${appTheme.cardBg}/5 rounded-full hover:${appTheme.secondary}/20 cursor-not-allowed  transition-colors`}
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
                                                <Link
                                                    key={post._id}
                                                    to={`/discuss/${post.slug}`}
                                                    className={`block p-3 ${appTheme.cardBg}/5 rounded-lg hover:${appTheme.cardBg}/10 transition-colors`}
                                                >
                                                    <h3 className={`text-sm font-medium ${appTheme.text} line-clamp-1`}>{post.title}</h3>
                                                    <div className={`flex items-center justify-between mt-1 text-xs ${appTheme.cardText}/50`}>
                                                        <span>{post.author.username}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex items-center gap-1">
                                                                <FiThumbsUp size={10} /> {post.upvoteCount}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FaCommentDots size={10} /> {post.commentCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
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
                                    <h1 className={`text-3xl font-bold bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')} bg-clip-text  `}>
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
                                        <option value="upvotes">Most Upvoted</option>
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
                                        {/* Pinned posts first */}
                                        {posts.filter(p => p.isPinned).map(post => (
                                            <DiscussionListItem key={post._id} post={post} />
                                        ))}
                                        {/* Regular posts */}
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
        </div>
    );
};

export default DiscussPage;