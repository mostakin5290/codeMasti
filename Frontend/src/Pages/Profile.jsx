import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    FaUser, FaMapMarkerAlt, FaGithub, FaLinkedin, FaTwitter, FaGlobe,
    FaTrophy, FaCode, FaClipboardList, FaCheck, FaStar,
    FaChevronRight, FaMedal, FaChartLine, FaCrown,
    FaArrowLeft, FaArrowRight, FaFire, FaEdit, FaShare,
    FaDownload, FaCog, FaBell, FaHeart, FaEye, FaCalendarAlt
} from 'react-icons/fa';
import { BsGraphUpArrow, BsLightning, BsShield } from "react-icons/bs";
import { FaRankingStar } from 'react-icons/fa6';
import { RiSwordFill, RiGitRepositoryLine } from 'react-icons/ri';
import { SiLeetcode } from 'react-icons/si';
import { HiSparkles, HiTrendingUp } from 'react-icons/hi';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PostDetailModal from '../components/discuss/PostDetailModal'; // Your modal component
import axiosClient from '../api/axiosClient';
import { format, eachDayOfInterval, formatISO, getDay, getYear } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

// Default theme matching your Premium page structure
const defaultAppTheme = {
    background: 'bg-gray-900',
    text: 'text-white',
    primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600',
    secondary: 'bg-blue-600',
    secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800',
    cardText: 'text-gray-300',
    border: 'border-gray-700',
    buttonText: 'text-white',
    highlight: 'text-cyan-400',
    highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400',
    iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900',
    gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

// LoadingSpinner component
const LoadingSpinner = ({ message, appTheme }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${appTheme.primary.split('-')[1]}-500 mb-4`}></div>
            {message && <p className={`${appTheme.cardText} text-sm`}>{message}</p>}
        </div>
    );
};

// Helper for pagination
const getPaginationNumbers = (currentPage, totalPages) => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage > totalPages - 4) {
        return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

function ProfilePage() {
    const { userId: routeUserId } = useParams();
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };

    // FIXED: Add ref to control fetch behavior
    const dataFetchedRef = useRef(false);
    const postsDataFetchedRef = useRef(false);

    const [profile, setProfile] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [userRank, setUserRank] = useState(null);
    const [totalUsersForRank, setTotalUsersForRank] = useState(0);
    const [activityCurrentPage, setActivityCurrentPage] = useState(1);
    const submissionsPerPage = 10;
    const [solutionPosts, setSolutionPosts] = useState([]);
    const [postsCurrentPage, setPostsCurrentPage] = useState(1);
    const postsPerPage = 10;
    const [totalPosts, setTotalPosts] = useState(0);

    // POST DETAIL MODAL STATES
    const [showPostDetail, setShowPostDetail] = useState(false);
    const [selectedPostSlug, setSelectedPostSlug] = useState(null);

    const [showAchievements, setShowAchievements] = useState(false);
    const [profileViews, setProfileViews] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);

    const userIdToFetch = routeUserId || loggedInUser?._id;

    // POST DETAIL MODAL HANDLERS
    const handlePostClick = (post) => {
        setSelectedPostSlug(post.slug);
        setShowPostDetail(true);
    };

    const handleCloseModal = () => {
        setShowPostDetail(false);
        setSelectedPostSlug(null);
    };

    // Refresh posts after post operations
    const handlePostUpdate = () => {
        // Re-fetch posts data
        fetchPostsData(postsCurrentPage);
    };

    // Create a separate posts fetching function
    const fetchPostsData = useCallback(async (page = 1) => {
        if (!userIdToFetch || postsLoading) return;

        setPostsLoading(true);
        try {
            console.log('Fetching posts for user:', userIdToFetch, 'page:', page);
            const postsResponse = await axiosClient.get(`/discuss/user/${userIdToFetch}/posts`, {
                params: {
                    page: page,
                    limit: postsPerPage
                }
            });

            console.log('Posts API Response:', postsResponse.data);

            // Handle different possible response structures
            let postsData = [];
            let postsTotal = 0;
            
            if (postsResponse.data.success) {
                postsData = postsResponse.data.posts || postsResponse.data.data || [];
                postsTotal = postsResponse.data.totalPosts || postsResponse.data.total || 0;
            } else {
                postsData = postsResponse.data.posts || postsResponse.data.data || postsResponse.data || [];
                postsTotal = postsResponse.data.totalPosts || postsResponse.data.total || postsData.length;
            }

            console.log('Processed posts data:', postsData);
            console.log('Total posts:', postsTotal);

            // FIXED: Better state setting with validation
            setSolutionPosts(Array.isArray(postsData) ? postsData : []);
            setTotalPosts(postsTotal);

        } catch (err) {
            console.error("Error fetching solution posts:", err.response?.data || err.message);
            setSolutionPosts([]);
            setTotalPosts(0);
        } finally {
            setPostsLoading(false);
        }
    }, [userIdToFetch, postsLoading, postsPerPage]);

    // FIXED: Initial data fetch - runs only once
    useEffect(() => {
        if (!userIdToFetch || dataFetchedRef.current) {
            return;
        }

        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);
            try {
                const profileResponse = await axiosClient.get(`/user/allDetails/${userIdToFetch}`);

                let submissionsData = [];
                try {
                    const submissionsResponse = await axiosClient.get(`/submission/getAll`, {
                        params: { userId: userIdToFetch }
                    });
                    submissionsData = submissionsResponse.data.results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];
                } catch (err) {
                    console.log("No submissions found for user, using empty array.", err);
                }

                // Rest of your existing rank fetching logic...
                let fetchedRank = null;
                let fetchedTotalUsers = 0;
                if (userIdToFetch) {
                    try {
                        const rankResponse = await axiosClient.get(`/user/rank/${userIdToFetch}`);
                        if (rankResponse.data.success) {
                            fetchedRank = rankResponse.data.rank;
                            fetchedTotalUsers = rankResponse.data.totalUsers;
                        }
                    } catch (err) {
                        console.log("Could not fetch user rank:", err.response?.data?.message || err.message);
                        if (err.response?.status === 404 && err.response?.data?.message === "User not found or has no solved problems.") {
                            fetchedRank = 0;
                            const totalUsersResponse = await axiosClient.get(`/user/total-rank`);
                            if (totalUsersResponse.data.success) {
                                fetchedTotalUsers = totalUsersResponse.data.totalUsers;
                            }
                        }
                    }
                }

                if (profileResponse.data.success) {
                    setProfile(profileResponse.data.profile);
                    setSubmissions(submissionsData);
                    setUserRank(fetchedRank);
                    setTotalUsersForRank(fetchedTotalUsers);
                    setProfileViews(Math.floor(Math.random() * 1000) + 100);
                    
                    // Mark as fetched to prevent re-renders
                    dataFetchedRef.current = true;
                } else {
                    setError("Failed to load profile data.");
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
                setError(err.response?.data?.message || "An error occurred while fetching the profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [userIdToFetch]); // Only userIdToFetch dependency

    // FIXED: Only fetch posts when posts tab becomes active
    useEffect(() => {
        if (activeTab === 'solutionPosts' && !postsDataFetchedRef.current && userIdToFetch) {
            fetchPostsData(postsCurrentPage);
            postsDataFetchedRef.current = true;
        }
    }, [activeTab, userIdToFetch, fetchPostsData, postsCurrentPage]);

    // FIXED: Handle posts pagination without refetching everything
    const handlePostsPageChange = useCallback((newPage) => {
        setPostsCurrentPage(newPage);
        fetchPostsData(newPage);
    }, [fetchPostsData]);

    // Enhanced Modern Stat Card with dynamic theming
    const ModernStatCard = useCallback(({ title, value, icon, subtext, trend }) => (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className={`group relative p-6 rounded-xl ${appTheme.cardBg} border ${appTheme.border} shadow-lg hover:shadow-2xl transition-all duration-500`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Background glow effect */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${appTheme.primary.replace('bg-', 'from-')}/5 ${appTheme.secondary.replace('bg-', 'to-')}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative flex items-start space-x-4">
                <div className={`text-2xl p-4 rounded-xl ${appTheme.iconBg} ${appTheme.highlight} group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${appTheme.cardText}`}>{title}</p>
                        {trend && (
                            <div className={`flex items-center text-xs ${trend > 0 ? appTheme.successColor : appTheme.errorColor}`}>
                                {trend > 0 ? <HiTrendingUp /> : <FaArrowLeft />}
                                <span className="ml-1">{Math.abs(trend)}%</span>
                            </div>
                        )}
                    </div>
                    <p className={`text-3xl font-bold ${appTheme.text} mt-2 group-hover:${appTheme.highlight} transition-colors duration-300`}>
                        {value}
                    </p>
                    {subtext && (
                        <p className={`text-xs ${appTheme.cardText} mt-2 flex items-center`}>
                            {typeof subtext === 'string' ? subtext : subtext}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    ), [appTheme]);

    // Enhanced Achievement Badge Component with dynamic theming
    const AchievementBadge = useCallback(({ icon, title, description, rarity, unlocked = true }) => (
        <motion.div
            className={`relative p-4 rounded-xl ${unlocked ? appTheme.cardBg : `${appTheme.cardBg}/20`} border ${unlocked ? appTheme.border : `${appTheme.border}/20`} transition-all duration-300`}
            whileHover={unlocked ? { scale: 1.05, y: -5 } : {}}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {unlocked && rarity === 'legendary' && (
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${appTheme.warningColor.replace('text-', 'from-')}/20 ${appTheme.primary.replace('bg-', 'to-')}/20 animate-pulse`} />
            )}

            <div className={`text-2xl mb-2 ${unlocked ? appTheme.warningColor : appTheme.cardText}`}>
                {icon}
            </div>
            <h4 className={`font-semibold ${unlocked ? appTheme.text : appTheme.cardText} text-sm`}>
                {title}
            </h4>
            <p className={`text-xs ${unlocked ? appTheme.cardText : `${appTheme.cardText}/50`} mt-1`}>
                {description}
            </p>
            {rarity && unlocked && (
                <div className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${rarity === 'legendary' ? `${appTheme.warningColor.replace('text-', 'bg-')}/20 ${appTheme.warningColor}` :
                    rarity === 'rare' ? `${appTheme.highlightTertiary.replace('text-', 'bg-')}/20 ${appTheme.highlightTertiary}` :
                        `${appTheme.highlightSecondary.replace('text-', 'bg-')}/20 ${appTheme.highlightSecondary}`
                    }`}>
                    {rarity}
                </div>
            )}
        </motion.div>
    ), [appTheme]);

    // Enhanced Profile Header with dynamic theming
    const ProfileHeader = useCallback(() => (
        <div className="relative pt-8 pb-20 overflow-hidden">
            {/* Enhanced background with dynamic colors */}
            <div className={`absolute inset-0 bg-gradient-to-br ${appTheme.primary.replace('bg-', 'from-')}/20 via-transparent ${appTheme.secondary.replace('bg-', 'to-')}/20`} />
            <div className={`absolute inset-0 bg-gradient-to-t ${appTheme.gradientFrom} via-transparent ${appTheme.gradientTo}`} />

            {/* Animated particles with dynamic colors */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-1 h-1 ${appTheme.highlight.replace('text-', 'bg-')}/20 rounded-full animate-pulse`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                    {/* Enhanced Profile Picture */}
                    <div className="relative group">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            {/* Dynamic glowing ring effect */}
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${appTheme.primary} ${appTheme.secondary} ${appTheme.highlightTertiary.replace('text-', 'to-')} p-1 animate-pulse`}>
                                <div className={`w-full h-full rounded-full ${appTheme.background}`} />
                            </div>

                            <img
                                src={profile.avatar}
                                alt={`${profile.firstName}'s avatar`}
                                className="relative w-40 h-40 rounded-full object-cover shadow-2xl border-4 border-white/10 group-hover:scale-105 transition-transform duration-300"
                            />

                            {/* Status indicator */}
                            <div className={`absolute bottom-2 right-2 w-6 h-6 ${appTheme.successColor.replace('text-', 'bg-')} rounded-full border-4 ${appTheme.background.replace('bg-', 'border-')} flex items-center justify-center`}>
                                <div className={`w-2 h-2 ${appTheme.successColor.replace('text-', 'bg-')} rounded-full animate-pulse`} />
                            </div>

                            {/* Edit button for own profile */}
                            {loggedInUser?._id === profile._id && (
                                <Link
                                    to="/profile/edit"
                                    className={`absolute -bottom-2 -right-2 ${appTheme.primary} hover:${appTheme.primaryHover} ${appTheme.buttonText} p-3 rounded-full shadow-lg transition-all duration-300 transform group-hover:scale-110`}
                                >
                                    <FaEdit className="w-4 h-4" />
                                </Link>
                            )}
                        </motion.div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4">
                                <h1 className={`text-5xl font-bold ${appTheme.text}`}>
                                    {profile.firstName} {profile.lastName}
                                </h1>

                                {/* Premium Badge */}
                                <div className="flex items-center space-x-3 mt-2 lg:mt-0">
                                    {loggedInUser?.isPremium ? (
                                        <div className={`flex items-center ${appTheme.warningColor.replace('text-', 'bg-')}/20 px-4 py-2 rounded-full border ${appTheme.warningColor.replace('text-', 'border-')}/30`}>
                                            <FaCrown className={`${appTheme.warningColor} mr-2`} />
                                            <span className={`${appTheme.warningColor} font-semibold`}>Premium</span>
                                        </div>
                                    ) : (
                                        <Link
                                            to="/premium"
                                            className={`flex items-center ${appTheme.primary.replace('bg-', 'bg-')}/20 hover:${appTheme.primary.replace('bg-', 'bg-')}/30 px-4 py-2 rounded-full border ${appTheme.primary.replace('bg-', 'border-')}/30 transition-all duration-300`}
                                        >
                                            <HiSparkles className={`${appTheme.highlight} mr-2`} />
                                            <span className={`${appTheme.highlight} font-semibold`}>Get Premium</span>
                                        </Link>
                                    )}

                                    {/* Verification Badge */}
                                    <div className={`flex items-center ${appTheme.highlightSecondary.replace('text-', 'bg-')}/20 px-3 py-1 rounded-full border ${appTheme.highlightSecondary.replace('text-', 'border-')}/30`}>
                                        <BsShield className={`${appTheme.highlightSecondary} mr-1`} />
                                        <span className={`${appTheme.highlightSecondary} text-sm`}>Verified</span>
                                    </div>
                                </div>
                            </div>

                            <p className={`text-xl ${appTheme.highlight} mt-3 font-medium`}>
                                {profile.headline || 'Passionate about solving problems with code'}
                            </p>

                            {/* Stats Row */}
                            <div className="flex flex-wrap justify-center lg:justify-start items-center mt-6 space-x-6 text-sm">
                                <div className="flex items-center">
                                    <FaMapMarkerAlt className={`mr-2 ${appTheme.successColor}`} />
                                    <span className={appTheme.cardText}>{profile.location || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center">
                                    <FaCalendarAlt className={`mr-2 ${appTheme.infoColor}`} />
                                    <span className={appTheme.cardText}>
                                        Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <FaEye className={`mr-2 ${appTheme.highlightTertiary}`} />
                                    <span className={appTheme.cardText}>{profileViews} profile views</span>
                                </div>
                                {userRank !== null && (
                                    <Link to="/world-rank" className={`flex items-center hover:${appTheme.highlight} transition-colors`}>
                                        <FaRankingStar className={`mr-2 ${appTheme.highlightTertiary}`} />
                                        <span className={appTheme.cardText}>
                                            Rank #{userRank} {totalUsersForRank > 0 ? `/ ${totalUsersForRank}` : ''}
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3"
                    >
                        {loggedInUser?._id !== profile._id && (
                            <>
                                <button
                                    onClick={() => setIsFollowing(!isFollowing)}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${isFollowing
                                        ? `${appTheme.cardBg} hover:${appTheme.cardBg}/80 ${appTheme.text}`
                                        : `${appTheme.primary} hover:${appTheme.primaryHover} ${appTheme.buttonText} shadow-lg hover:shadow-xl`
                                        }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                                <button className={`px-6 py-3 rounded-xl font-semibold ${appTheme.cardBg}/50 border ${appTheme.border} ${appTheme.text} hover:${appTheme.cardBg}/80 transition-all duration-300`}>
                                    Message
                                </button>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    ), [profile, appTheme, loggedInUser, userRank, totalUsersForRank, profileViews, isFollowing]);

    // Enhanced Activity Heatmap with dynamic theming
    function SubmissionHeatmap({ submissions = [], userCreatedAt }) {
        const currentYear = new Date().getFullYear();
        const [displayYear, setDisplayYear] = useState(currentYear);

        useEffect(() => {
            if (userCreatedAt) {
                const userCreatedYear = getYear(new Date(userCreatedAt));
                if (userCreatedYear > currentYear) {
                    setDisplayYear(userCreatedYear);
                }
            }
        }, [userCreatedAt, currentYear]);

        const yearStart = new Date(displayYear, 0, 1);
        const yearEnd = new Date(displayYear, 11, 31);

        const submissionsInYear = submissions.filter(sub => getYear(new Date(sub.createdAt)) === displayYear);

        const submissionCounts = submissionsInYear.reduce((acc, sub) => {
            const date = formatISO(new Date(sub.createdAt), { representation: 'date' });
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const daysGroupedByMonth = eachDayOfInterval({ start: yearStart, end: yearEnd }).reduce((acc, day) => {
            const month = format(day, 'MMM yyyy');
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(day);
            return acc;
        }, {});

        const getColor = (count) => {
            if (count > 8) return `bg-green-400 shadow-lg`;
            if (count > 5) return `bg-green-500 shadow-md`;
            if (count > 2) return `bg-green-600 shadow-sm`;
            if (count > 0) return `bg-green-700`;
            return `${appTheme.cardBg}/30 border ${appTheme.border}/20`;
        };

        const totalSubmissionsInYear = submissionsInYear.length;
        const userCreatedYearNum = userCreatedAt ? getYear(new Date(userCreatedAt)) : currentYear;
        const canGoToPreviousYear = displayYear > userCreatedYearNum;
        const canGoToNextYear = displayYear < currentYear;

        return (
            <motion.div
                className={`p-8 rounded-xl ${appTheme.cardBg} border ${appTheme.border} shadow-xl`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold ${appTheme.text} flex items-center`}>
                        <FaChartLine className={`mr-3 ${appTheme.successColor}`} />
                        Coding Activity
                        <div className={`ml-3 px-3 py-1 rounded-full ${appTheme.successColor.replace('text-', 'bg-')}/20 ${appTheme.successColor} text-sm font-medium`}>
                            {totalSubmissionsInYear} submissions
                        </div>
                    </h3>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setDisplayYear(displayYear - 1)}
                            disabled={!canGoToPreviousYear}
                            className={`p-2 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border} ${!canGoToPreviousYear ? appTheme.cardText + '/50 cursor-not-allowed' : `${appTheme.text} hover:${appTheme.cardBg}/80`} transition-all duration-300`}
                        >
                            <FaArrowLeft />
                        </button>
                        <span className={`text-xl font-bold ${appTheme.text} px-4`}>{displayYear}</span>
                        <button
                            onClick={() => setDisplayYear(displayYear + 1)}
                            disabled={!canGoToNextYear}
                            className={`p-2 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border} ${!canGoToNextYear ? appTheme.cardText + '/50 cursor-not-allowed' : `${appTheme.text} hover:${appTheme.cardBg}/80`} transition-all duration-300`}
                        >
                            <FaArrowRight />
                        </button>
                    </div>
                </div>

                {totalSubmissionsInYear === 0 ? (
                    <div className="text-center py-12">
                        <div className={`${appTheme.cardText}/50 mb-4`}>
                            <FaCode className="inline-block text-6xl" />
                        </div>
                        <h4 className={`${appTheme.text} font-semibold text-lg`}>No activity in {displayYear}</h4>
                        <p className={`${appTheme.cardText} mt-2`}>Start solving problems to see your coding journey!</p>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-x-2 justify-center overflow-x-auto pb-4">
                            {Object.entries(daysGroupedByMonth).map(([month, daysInMonth]) => {
                                const firstDayOfMonth = daysInMonth[0];
                                const firstDayOffset = getDay(firstDayOfMonth);
                                const numWeeks = Math.ceil((daysInMonth.length + firstDayOffset) / 7);

                                return (
                                    <div key={month} className="flex flex-col items-center flex-shrink-0">
                                        <div className={`text-xs ${appTheme.cardText} mb-3 h-4 text-center font-medium`}>
                                            {month.split(' ')[0]}
                                        </div>
                                        <div
                                            className="grid grid-flow-col gap-1"
                                            style={{
                                                gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
                                                gridTemplateColumns: `repeat(${numWeeks}, minmax(0, 1fr))`
                                            }}
                                        >
                                            {Array.from({ length: firstDayOffset }).map((_, index) => (
                                                <div key={`empty-${month}-${index}`} className="w-3 h-3" />
                                            ))}
                                            {daysInMonth.map(day => {
                                                const dateString = formatISO(day, { representation: 'date' });
                                                const count = submissionCounts[dateString] || 0;
                                                return (
                                                    <motion.div
                                                        key={dateString}
                                                        className={`w-3 h-3 rounded-sm ${getColor(count)}`}
                                                        title={`${count} submission${count !== 1 ? 's' : ''} on ${format(day, 'MMM d, yyyy')}`}
                                                        whileHover={{ scale: 1.5, zIndex: 10 }}
                                                        transition={{ duration: 0.1 }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Enhanced Legend */}
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700/30">
                            <span className={`text-xs ${appTheme.cardText}`}>Less</span>
                            <div className="flex space-x-1">
                                <div className={`w-3 h-3 rounded-sm ${appTheme.cardBg}/30`} />
                                <div className={`w-3 h-3 rounded-sm bg-green-700`} />
                                <div className={`w-3 h-3 rounded-sm bg-green-600 `} />
                                <div className={`w-3 h-3 rounded-sm bg-green-500 `} />
                                <div className={`w-3 h-3 rounded-sm bg-green-400 `} />
                            </div>
                            <span className={`text-xs ${appTheme.cardText}`}>More</span>
                        </div>
                    </>
                )}
            </motion.div>
        );
    }

    // Activity Item with dynamic theming
    const ActivityItem = useCallback(({ submission }) => (
        <motion.div
            whileHover={{ x: 5, scale: 1.01 }}
            className={`flex justify-between items-center p-5 ${appTheme.cardBg} rounded-xl hover:shadow-lg transition-all duration-300 group border ${appTheme.border}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${submission.status === 'Accepted' ? `${appTheme.successColor.replace('text-', 'bg-')}/20 ${appTheme.successColor}` : `${appTheme.errorColor.replace('text-', 'bg-')}/20 ${appTheme.errorColor}`} group-hover:scale-110 transition-transform duration-300`}>
                    {submission.status === 'Accepted' ? <FaCheck /> : <FaCode />}
                </div>
                <div>
                    <Link
                        to={`/codefield/${submission.problemId}`}
                        className={`font-semibold ${appTheme.text} group-hover:${appTheme.highlight} transition-colors`}
                    >
                        {submission?.title}
                    </Link>
                    <p className={`text-xs ${appTheme.cardText} mt-1`}>
                        {submission.language} • {format(new Date(submission.createdAt), 'MMM d, yyyy - h:mm a')}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 text-xs rounded-full font-medium ${submission.status === 'Accepted' ? `${appTheme.successColor.replace('text-', 'bg-')}/20 ${appTheme.successColor}` : `${appTheme.errorColor.replace('text-', 'bg-')}/20 ${appTheme.errorColor}`}`}>
                    {submission.status}
                </span>
                <FaChevronRight className={`${appTheme.cardText} group-hover:${appTheme.highlight} transition-colors`} />
            </div>
        </motion.div>
    ), [appTheme]);

    if (loading) {
        return (
            <div className={`min-h-screen ${appTheme.background} flex justify-center items-center`}>
                <LoadingSpinner message="Loading profile..." appTheme={appTheme} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${appTheme.background} flex justify-center items-center`}>
                <motion.div
                    className={`${appTheme.errorColor.replace('text-', 'bg-')}/10 p-8 rounded-xl border ${appTheme.errorColor.replace('text-', 'border-')}/30 max-w-md text-center ${appTheme.cardBg}/50`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <h2 className={`text-2xl font-bold ${appTheme.errorColor} mb-4`}>Error</h2>
                    <p className={`${appTheme.cardText} mb-6`}>{error}</p>
                    <Link
                        to="/"
                        className={`inline-block px-6 py-3 ${appTheme.errorColor.replace('text-', 'bg-')}/20 hover:${appTheme.errorColor.replace('text-', 'bg-')}/30 ${appTheme.errorColor} rounded-xl transition-colors border ${appTheme.errorColor.replace('text-', 'border-')}/30`}
                    >
                        Return Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={`min-h-screen ${appTheme.background} flex justify-center items-center`}>
                <motion.div
                    className={`${appTheme.warningColor.replace('text-', 'bg-')}/10 p-8 rounded-xl border ${appTheme.warningColor.replace('text-', 'border-')}/30 max-w-md text-center ${appTheme.cardBg}/50`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <h2 className={`text-2xl font-bold ${appTheme.warningColor} mb-4`}>Profile Not Found</h2>
                    <p className={`${appTheme.cardText} mb-6`}>The requested profile could not be found.</p>
                    <Link
                        to="/"
                        className={`inline-block px-6 py-3 ${appTheme.warningColor.replace('text-', 'bg-')}/20 hover:${appTheme.warningColor.replace('text-', 'bg-')}/30 ${appTheme.warningColor} rounded-xl transition-colors border ${appTheme.warningColor.replace('text-', 'border-')}/30`}
                    >
                        Return Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted');
    const totalSubmissions = submissions.length;
    const uniqueAcceptedProblems = new Set(acceptedSubmissions.map(sub => sub.problemId).filter(Boolean)).size;
    const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100) : 0;
    const currentStreak = profile.dailyChallenges?.currentStreak || 0;
    const longestStreak = profile.dailyChallenges?.longestStreak || 0;

    // Get current submissions for pagination
    const currentActivitySubmissions = submissions.slice(
        (activityCurrentPage - 1) * submissionsPerPage,
        activityCurrentPage * submissionsPerPage
    );
    const activityTotalPages = Math.ceil(submissions.length / submissionsPerPage);
    const activityPageNumbers = getPaginationNumbers(activityCurrentPage, activityTotalPages);

    const postsTotalPages = Math.ceil(totalPosts / postsPerPage);
    const postsPageNumbers = getPaginationNumbers(postsCurrentPage, postsTotalPages);

    // FIXED: Updated SolutionPostCard to handle clicks instead of navigation
    const SolutionPostCard = ({ post }) => {
        if (!post) {
            return null;
        }

        return (
            <motion.div
                className={`p-5 rounded-xl ${appTheme.cardBg} border ${appTheme.border} hover:shadow-lg transition-all duration-300 group cursor-pointer`}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => handlePostClick(post)} // CLICK HANDLER INSTEAD OF NAVIGATION
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1 mr-4">
                        <h4 className={`font-semibold ${appTheme.text} mb-2 group-hover:${appTheme.highlight} transition-colors line-clamp-2`}>
                            {post.title || 'Untitled Post'}
                        </h4>
                        {post.description && (
                            <p className={`text-sm ${appTheme.cardText} mb-2 line-clamp-2`}>
                                {post.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                            </p>
                        )}
                        <div className="flex items-center space-x-4 text-xs">
                            <div className={`flex items-center ${appTheme.cardText}`}>
                                <FaCalendarAlt className="mr-1" />
                                <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                            {post.likeCount !== undefined && (
                                <div className={`flex items-center ${appTheme.successColor}`}>
                                    <FaHeart className="mr-1" />
                                    <span>{post.likeCount} likes</span>
                                </div>
                            )}
                            {post.commentCount !== undefined && (
                                <div className={`flex items-center ${appTheme.infoColor}`}>
                                    <FaCode className="mr-1" />
                                    <span>{post.commentCount} comments</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <FaChevronRight className={`${appTheme.cardText} group-hover:${appTheme.highlight} transition-colors flex-shrink-0`} />
                </div>
            </motion.div>
        );
    };

    return (
        <div className={`min-h-screen ${appTheme.background} relative`}>
            {/* Background Effects with dynamic colors */}
            <div className={`fixed inset-0 bg-gradient-to-br ${appTheme.primary.replace('bg-', 'from-')}/5 via-transparent ${appTheme.secondary.replace('bg-', 'to-')}/5 pointer-events-none`} />
            <div className={`fixed inset-0 bg-gradient-to-t ${appTheme.gradientFrom} via-transparent ${appTheme.gradientTo} pointer-events-none`} />

            <Header />

            {/* Enhanced Profile Header */}
            <ProfileHeader />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Enhanced Left Sidebar */}
                    <div className="xl:col-span-1 space-y-6">
                        {/* About Card */}
                        <motion.div
                            className={`p-6 rounded-xl ${appTheme.cardBg} border ${appTheme.border} shadow-xl`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3 className={`text-lg font-bold ${appTheme.text} mb-4 flex items-center`}>
                                <FaUser className={`mr-3 ${appTheme.highlightSecondary}`} />
                                About
                            </h3>
                            {profile.bio ? (
                                <p className={`${appTheme.cardText} leading-relaxed`}>{profile.bio}</p>
                            ) : (
                                <p className={`${appTheme.cardText}/70 italic`}>No bio yet</p>
                            )}

                            {/* Enhanced Social Links */}
                            {(profile.socialLinks && Object.values(profile.socialLinks).some(link => link)) && (
                                <>
                                    <h4 className={`text-md font-semibold ${appTheme.text} mt-6 mb-4 flex items-center`}>
                                        <FaGlobe className={`mr-2 ${appTheme.highlight}`} />
                                        Connect
                                    </h4>
                                    <div className="flex items-center space-x-4">
                                        {profile.socialLinks.github && (
                                            <motion.a
                                                href={profile.socialLinks.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border} ${appTheme.cardText} hover:${appTheme.text} hover:scale-110 transition-all duration-300`}
                                                whileHover={{ y: -3 }}
                                            >
                                                <FaGithub className="text-xl" />
                                            </motion.a>
                                        )}
                                        {profile.socialLinks.linkedin && (
                                            <motion.a
                                                href={profile.socialLinks.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border} ${appTheme.cardText} hover:${appTheme.highlightSecondary} hover:scale-110 transition-all duration-300`}
                                                whileHover={{ y: -3 }}
                                            >
                                                <FaLinkedin className="text-xl" />
                                            </motion.a>
                                        )}
                                        {profile.socialLinks.twitter && (
                                            <motion.a
                                                href={profile.socialLinks.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border} ${appTheme.cardText} hover:${appTheme.infoColor} hover:scale-110 transition-all duration-300`}
                                                whileHover={{ y: -3 }}
                                            >
                                                <FaTwitter className="text-xl" />
                                            </motion.a>
                                        )}
                                        {profile.socialLinks.website && (
                                            <motion.a
                                                href={profile.socialLinks.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border} ${appTheme.cardText} hover:${appTheme.highlightTertiary} hover:scale-110 transition-all duration-300`}
                                                whileHover={{ y: -3 }}
                                            >
                                                <FaGlobe className="text-xl" />
                                            </motion.a>
                                        )}
                                        {profile.socialLinks.leetcode && (
                                            <motion.a
                                                href={profile.socialLinks.leetcode}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border} ${appTheme.cardText} hover:${appTheme.highlight} hover:scale-110 transition-all duration-300`}
                                                whileHover={{ y: -3 }}
                                            >
                                                <SiLeetcode className="text-xl" />
                                            </motion.a>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>

                        {/* Enhanced Quick Stats */}
                        <motion.div
                            className={`p-6 rounded-xl ${appTheme.cardBg} border ${appTheme.border} shadow-xl`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className={`text-lg font-bold ${appTheme.text} mb-4 flex items-center`}>
                                <BsLightning className={`mr-3 ${appTheme.highlight}`} />
                                Quick Stats
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className={`${appTheme.cardText} font-medium`}>ELO Rating</span>
                                    <span className={`${appTheme.text} font-bold`}>{profile.stats?.eloRating || 1000}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={`${appTheme.cardText} font-medium`}>Win Rate</span>
                                    <span className={`${appTheme.successColor} font-bold`}>
                                        {(((profile.stats?.wins) / (profile.stats?.gamesPlayed)) * 100).toFixed(1) || 0}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={`${appTheme.cardText} font-medium`}>Games Played</span>
                                    <span className={`${appTheme.text} font-bold`}>{profile.stats?.gamesPlayed || 0}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Achievements Section */}
                        <motion.div
                            className={`p-6 rounded-xl ${appTheme.cardBg} border ${appTheme.border} shadow-xl`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`text-lg font-bold ${appTheme.text} flex items-center`}>
                                    <FaTrophy className={`mr-3 ${appTheme.warningColor}`} />
                                    Achievements
                                </h3>
                                <button
                                    onClick={() => setShowAchievements(!showAchievements)}
                                    className={`text-sm ${appTheme.highlight} hover:underline`}
                                >
                                    {showAchievements ? 'Show less' : 'View all'}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <AchievementBadge
                                    icon={<FaMedal />}
                                    title="First Solve"
                                    description="Solved first problem"
                                    rarity="common"
                                    unlocked={uniqueAcceptedProblems > 0}
                                />
                                <AchievementBadge
                                    icon={<FaFire />}
                                    title="Streak Master"
                                    description="7-day streak"
                                    rarity="rare"
                                    unlocked={longestStreak >= 7}
                                />
                                {showAchievements && (
                                    <>
                                        <AchievementBadge
                                            icon={<FaCrown />}
                                            title="Century Club"
                                            description="100 problems solved"
                                            rarity="legendary"
                                            unlocked={uniqueAcceptedProblems >= 100}
                                        />
                                        <AchievementBadge
                                            icon={<FaStar />}
                                            title="Consistency"
                                            description="High accuracy rate"
                                            rarity="rare"
                                            unlocked={acceptanceRate >= 80}
                                        />
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content Area */}
                    <div className="xl:col-span-3 space-y-8">
                        {/* Enhanced Modern Tabs */}
                        <motion.div
                            className={`flex ${appTheme.cardBg}/50 rounded-xl border ${appTheme.border} p-2`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {[
                                { id: 'overview', label: 'Overview', icon: <FaUser /> },
                                { id: 'activity', label: 'Activity', icon: <FaChartLine /> },
                                { id: 'solutionPosts', label: 'Posts', icon: <FaCode /> }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center px-6 py-3 font-medium text-sm rounded-xl transition-all duration-300 ${activeTab === tab.id
                                        ? `${appTheme.primary} ${appTheme.buttonText} shadow-lg`
                                        : `${appTheme.cardText} hover:${appTheme.text} hover:${appTheme.cardBg}/50`
                                        }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            className={`absolute inset-0 rounded-xl bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')}/20 ${appTheme.secondary.replace('bg-', 'to-')}/20`}
                                            layoutId="activeTab"
                                        />
                                    )}
                                </button>
                            ))}
                        </motion.div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-8"
                                >
                                    {/* Enhanced Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <ModernStatCard
                                            title="Problems Solved"
                                            value={uniqueAcceptedProblems}
                                            icon={<FaCheck />}
                                            subtext={`${acceptedSubmissions.length} total submissions`}
                                            trend={Math.random() > 0.5 ? Math.floor(Math.random() * 20) : -Math.floor(Math.random() * 10)}
                                        />
                                        <ModernStatCard
                                            title="Current Streak"
                                            value={currentStreak}
                                            icon={<FaFire />}
                                            subtext={`Max: ${longestStreak} days`}
                                            trend={currentStreak > 0 ? Math.floor(Math.random() * 15) : 0}
                                        />
                                        <ModernStatCard
                                            title="Solution Posts"
                                            value={totalPosts}
                                            icon={<FaStar />}
                                            subtext={
                                                <Link to="/discuss/new" className={`font-semibold ${appTheme.highlight} hover:${appTheme.highlightSecondary} transition-colors`}>
                                                    Create Post
                                                </Link>
                                            }
                                        />
                                    </div>

                                    {/* Enhanced Activity Heatmap */}
                                    <SubmissionHeatmap submissions={submissions} userCreatedAt={profile.createdAt} />

                                    {/* Recent Activity with enhanced design */}
                                    <motion.div
                                        className={`p-8 rounded-xl ${appTheme.cardBg} border ${appTheme.border} shadow-xl`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className={`text-xl font-bold ${appTheme.text} flex items-center`}>
                                                <RiSwordFill className={`mr-3 ${appTheme.highlight}`} />
                                                Recent Activity
                                            </h3>
                                            <button
                                                onClick={() => setActiveTab('activity')}
                                                className={`${appTheme.successColor} flex items-center hover:underline font-medium`}
                                            >
                                                View all activity
                                                <FaChevronRight className="ml-2 text-xs" />
                                            </button>
                                        </div>

                                        {submissions.length > 0 ? (
                                            <div className="space-y-4">
                                                {submissions.slice(0, 5).map(sub => (
                                                    <ActivityItem key={sub._id} submission={sub} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className={`${appTheme.cardText}/50 mb-4`}>
                                                    <FaClipboardList className="inline-block text-6xl" />
                                                </div>
                                                <h4 className={`${appTheme.text} font-semibold text-lg mb-2`}>No activity yet</h4>
                                                <p className={`${appTheme.cardText} mb-6`}>Start solving problems to see your activity here</p>
                                                <Link
                                                    to="/problems"
                                                    className={`inline-block px-8 py-3 ${appTheme.successColor.replace('text-', 'bg-')} hover:${appTheme.successColor.replace('text-', 'bg-')}/80 ${appTheme.buttonText} rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl`}
                                                >
                                                    Browse Problems
                                                </Link>
                                            </div>
                                        )}
                                    </motion.div>
                                </motion.div>
                            )}

                            {activeTab === 'activity' && (
                                <motion.div
                                    key="activity"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={`p-8 rounded-xl ${appTheme.cardBg} border ${appTheme.border} shadow-xl`}>
                                        <h3 className={`text-xl font-bold ${appTheme.text} mb-6 flex items-center`}>
                                            <FaChartLine className={`mr-3 ${appTheme.infoColor}`} />
                                            Full Activity History
                                        </h3>

                                        {submissions.length > 0 ? (
                                            <>
                                                <div className="space-y-4 mb-8">
                                                    {currentActivitySubmissions.map(sub => (
                                                        <ActivityItem key={sub._id} submission={sub} />
                                                    ))}
                                                </div>

                                                {activityTotalPages > 1 && (
                                                    <div className="flex justify-between items-center">
                                                        <button
                                                            onClick={() => setActivityCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            disabled={activityCurrentPage === 1}
                                                            className={`px-6 py-3 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border} ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/80 transition-all duration-300 font-medium`}
                                                        >
                                                            Previous
                                                        </button>

                                                        <div className="flex items-center space-x-2">
                                                            {activityPageNumbers.map((page, index) => (
                                                                page === '...' ? (
                                                                    <span key={`ellipsis-${index}`} className={`px-3 py-2 ${appTheme.cardText}`}>...</span>
                                                                ) : (
                                                                    <button
                                                                        key={page}
                                                                        onClick={() => setActivityCurrentPage(page)}
                                                                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${activityCurrentPage === page
                                                                            ? `${appTheme.primary} ${appTheme.buttonText} shadow-lg`
                                                                            : `${appTheme.cardBg}/50 ${appTheme.cardText} hover:${appTheme.cardBg}/80 border ${appTheme.border}`
                                                                            }`}
                                                                    >
                                                                        {page}
                                                                    </button>
                                                                )
                                                            ))}
                                                        </div>

                                                        <button
                                                            onClick={() => setActivityCurrentPage(prev => Math.min(prev + 1, activityTotalPages))}
                                                            disabled={activityCurrentPage === activityTotalPages}
                                                            className={`px-6 py-3 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border} ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/80 transition-all duration-300 font-medium`}
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-16">
                                                <div className={`${appTheme.cardText}/50 mb-4`}>
                                                    <FaClipboardList className="inline-block text-8xl" />
                                                </div>
                                                <h4 className={`${appTheme.text} font-semibold text-xl mb-2`}>No activity yet</h4>
                                                <p className={`${appTheme.cardText} text-lg`}>Your solved problems will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'solutionPosts' && (
                                <motion.div
                                    key="solutionPosts"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={`p-8 rounded-xl ${appTheme.cardBg} border ${appTheme.border} shadow-xl`}>
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className={`text-xl font-bold ${appTheme.text} flex items-center`}>
                                                <FaCode className={`mr-3 ${appTheme.highlight}`} />
                                                Solution Posts
                                                <span className={`ml-3 px-3 py-1 rounded-full ${appTheme.primary}/20 ${appTheme.primary} text-sm font-medium`}>
                                                    {totalPosts}
                                                </span>
                                            </h3>
                                            <Link
                                                to="/discuss/new"
                                                className={`px-4 py-2 ${appTheme.primary} hover:${appTheme.primaryHover} ${appTheme.buttonText} rounded-lg transition-all duration-300 text-sm font-medium`}
                                            >
                                                <FaCode className="mr-2 inline" />
                                                New Post
                                            </Link>
                                        </div>

                                        {/* Loading State */}
                                        {postsLoading && (
                                            <div className="text-center py-8">
                                                <LoadingSpinner message="Loading posts..." appTheme={appTheme} />
                                            </div>
                                        )}

                                        {!postsLoading && (
                                            <>
                                                {totalPosts > 0 && solutionPosts?.length > 0 ? (
                                                    <>
                                                        <div className="space-y-4 mb-8">
                                                            {solutionPosts.map((post, index) => (
                                                                <div key={post._id || post.id || index}>
                                                                    <SolutionPostCard post={post} />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {postsTotalPages > 1 && (
                                                            <div className="flex justify-between items-center">
                                                                <button
                                                                    onClick={() => handlePostsPageChange(Math.max(postsCurrentPage - 1, 1))}
                                                                    disabled={postsCurrentPage === 1}
                                                                    className={`px-6 py-3 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border} ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/80 transition-all duration-300 font-medium`}
                                                                >
                                                                    Previous
                                                                </button>

                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`${appTheme.cardText} text-sm`}>
                                                                        Page {postsCurrentPage} of {postsTotalPages}
                                                                    </span>
                                                                </div>

                                                                <button
                                                                    onClick={() => handlePostsPageChange(Math.min(postsCurrentPage + 1, postsTotalPages))}
                                                                    disabled={postsCurrentPage === postsTotalPages}
                                                                    className={`px-6 py-3 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border} ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/80 transition-all duration-300 font-medium`}
                                                                >
                                                                    Next
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="text-center py-16">
                                                        <div className={`${appTheme.cardText}/50 mb-6`}>
                                                            <FaCode className="inline-block text-8xl" />
                                                        </div>
                                                        <h4 className={`${appTheme.text} font-semibold text-xl mb-3`}>
                                                            No solution posts yet
                                                        </h4>
                                                        <p className={`${appTheme.cardText} text-lg mb-8`}>
                                                            Share your coding insights and solutions with the community!
                                                        </p>
                                                        <Link
                                                            to="/discuss/new"
                                                            className={`inline-block px-8 py-4 ${appTheme.primary} hover:${appTheme.primaryHover} ${appTheme.buttonText} rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
                                                        >
                                                            Create Your First Post
                                                        </Link>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <Footer />

            {/* POST DETAIL MODAL - Using your existing component */}
            <PostDetailModal
                isOpen={showPostDetail}
                onClose={handleCloseModal}
                postSlug={selectedPostSlug}
                appTheme={appTheme}
                onPostUpdate={handlePostUpdate}
            />
        </div>
    );
}

export default ProfilePage;
