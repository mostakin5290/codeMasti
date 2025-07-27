
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom'; // Import useNavigate for redirection
import { useSelector } from 'react-redux';
import {
    FaUser, FaMapMarkerAlt, FaGithub, FaLinkedin, FaTwitter, FaGlobe,
    FaTrophy, FaCode, FaClipboardList, FaCheck, FaCalendarAlt, FaStar,
    FaChevronRight, FaMedal, FaChartLine, FaLayerGroup, FaAward, FaCrown,
    FaArrowLeft, FaArrowRight, FaCommentAlt, FaArrowUp, FaRegUser,
    FaFire // FaFire is typically in 'react-icons/fa'
} from 'react-icons/fa';
import { FaRankingStar } from 'react-icons/fa6'; // Correct import for FaRankingStar
import { RiSwordFill, RiGitRepositoryLine } from 'react-icons/ri';
import { SiLeetcode } from 'react-icons/si';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import axiosClient from '../api/axiosClient';
import { format, eachDayOfInterval, formatISO, getDay, getYear } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';

// Default theme for the app context. This will be merged with actual theme.
const defaultAppTheme = {
    background: 'bg-gray-900', text: 'text-white',
    accent: 'bg-indigo-600', accentHover: 'bg-indigo-700',
    secondaryAccent: 'bg-blue-600', secondaryAccentHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white',
    buttonPrimary: 'bg-indigo-600', buttonPrimaryHover: 'bg-indigo-700',
    buttonSecondary: 'bg-blue-600', buttonSecondaryHover: 'bg-blue-700',
    highlight: 'text-indigo-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-cyan-400', iconBg: 'bg-indigo-600/10',
    gradientFrom: 'from-slate-900', gradientTo: 'to-slate-800', // For background overlay effect
    successColor: 'text-emerald-500',
    warningColor: 'text-amber-500',
    errorColor: 'text-red-500',
    infoColor: 'text-sky-500',
};

// Helper for pagination numbers (re-used from ProblemPage)
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
    const appTheme = React.useMemo(
        () => ({ ...defaultAppTheme, ...(appThemeFromContext) }),
        [appThemeFromContext]
    );

    const [profile, setProfile] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const [userRank, setUserRank] = useState(null); // State for user rank
    const [totalUsersForRank, setTotalUsersForRank] = useState(0); // State for total users in ranking

    // Pagination state for Activity tab
    const [activityCurrentPage, setActivityCurrentPage] = useState(1);
    const submissionsPerPage = 10; // 10 submissions per page

    // State for Solution Posts
    const [solutionPosts, setSolutionPosts] = useState([]);
    const [postsCurrentPage, setPostsCurrentPage] = useState(1);
    const postsPerPage = 10; // 10 posts per page
    const [totalPosts, setTotalPosts] = useState(0);


    const userIdToFetch = routeUserId || loggedInUser?._id;

    useEffect(() => {
        if (!userIdToFetch) {
            setLoading(false);
            setError("No user to display. Please log in or provide a user ID.");
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

                // Fetch user's posts
                let postsData = [];
                let postsTotal = 0;
                try {
                    const postsResponse = await axiosClient.get(`/discuss/user/${userIdToFetch}/posts?page=${postsCurrentPage}&limit=${postsPerPage}`);
                    postsData = postsResponse?.data?.posts;
                    postsTotal = postsResponse?.data?.totalPosts || 0; // Use totalPosts from backend if available
                } catch (err) {
                    console.log("No solution posts found for user, using empty array.", err);
                }

                // Fetch user's rank
                let fetchedRank = null;
                let fetchedTotalUsers = 0;
                // Only fetch rank if there's a logged-in user and it's their own profile
                // Or if you want to show rank for public profiles too (backend getUserRank allows it)
                if (userIdToFetch) { // Ensure userIdToFetch is valid for the rank API call
                    try {
                        const rankResponse = await axiosClient.get(`/user/rank/${userIdToFetch}`);
                        if (rankResponse.data.success) {
                            fetchedRank = rankResponse.data.rank;
                            fetchedTotalUsers = rankResponse.data.totalUsers;
                        }
                    } catch (err) {
                        console.log("Could not fetch user rank (may have no solved problems):", err.response?.data?.message || err.message);
                        // If user has 0 problems, backend returns N/A for rank, set it to 0 or leave null if N/A
                        if (err.response?.status === 404 && err.response?.data?.message === "User not found or has no solved problems.") {
                            fetchedRank = 0; // Display 0 problems solved
                            // Fetch total users explicitly if the user has no rank
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
                    setSolutionPosts(postsData);
                    setTotalPosts(postsTotal); // Set total posts count
                    setUserRank(fetchedRank); // Set user rank
                    setTotalUsersForRank(fetchedTotalUsers); // Set total users for rank context
                } else {
                    setError("Failed to load profile data.");
                }
            } catch (err) {
                setError(err.response?.data?.message || "An error occurred while fetching the profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [userIdToFetch, postsCurrentPage]); // Re-fetch posts when postsCurrentPage changes, and fetch rank with profile


    // Themed Stat Card (remains unchanged)
    const StatCard = useCallback(({ title, value, icon, subtext, color }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-6 rounded-2xl ${appTheme.cardBg}/50 ${appTheme.cardText} border ${appTheme.border}/50 shadow-lg backdrop-blur-sm`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-start space-x-4">
                <div className={`text-2xl p-3 rounded-full ${color.iconBg} ${color.iconText}`}>
                    {icon}
                </div>
                <div>
                    <p className={`text-sm font-medium ${appTheme.cardText}/80`}>{title}</p>
                    <p className={`text-2xl font-bold ${appTheme.text} mt-1`}>{value}</p>
                    {subtext && <p className={`text-xs ${appTheme.cardText}/70 mt-1`}>{subtext}</p>}
                </div>
            </div>
        </motion.div>
    ), [appTheme]);


    // Themed Submission Heatmap (converted to a component to allow hooks)
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
            const baseColor = appTheme.successColor.split('-')[1];
            if (count > 8) return `bg-${baseColor}-700`;
            if (count > 5) return `bg-${baseColor}-600`;
            if (count > 2) return `bg-${baseColor}-500`;
            if (count > 0) return `bg-${baseColor}-400`;
            return `${appTheme.cardBg}/30 border ${appTheme.border}/20`;
        };

        const totalSubmissionsInYear = submissionsInYear.length;

        const userCreatedYearNum = userCreatedAt ? getYear(new Date(userCreatedAt)) : currentYear;
        const canGoToPreviousYear = displayYear > userCreatedYearNum;
        const canGoToNextYear = displayYear < currentYear;

        return (
            <div className={`p-6 rounded-2xl ${appTheme.cardBg}/50 ${appTheme.cardText} border ${appTheme.border}/50 shadow-lg backdrop-blur-sm`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${appTheme.text} flex items-center`}>
                        <FaChartLine className={`inline mr-2 ${appTheme.successColor}`} />
                        Coding Activity
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setDisplayYear(displayYear - 1)}
                            disabled={!canGoToPreviousYear}
                            className={`p-1 rounded ${appTheme.cardBg}/50 ${!canGoToPreviousYear ? 'text-gray-400 cursor-not-allowed' : `${appTheme.text} hover:${appTheme.cardBg}/80 cursor-pointer`}`}
                        >
                            <FaArrowLeft />
                        </button>
                        <span className={`text-lg font-bold ${appTheme.text}`}>{displayYear}</span>
                        <button
                            onClick={() => setDisplayYear(displayYear + 1)}
                            disabled={!canGoToNextYear}
                            className={`p-1 rounded ${appTheme.cardBg}/50 ${!canGoToNextYear ? 'text-gray-400 cursor-not-allowed' : `${appTheme.text} hover:${appTheme.cardBg}/80 cursor-pointer`}`}
                        >
                            <FaArrowRight />
                        </button>
                    </div>
                </div>
                {totalSubmissionsInYear === 0 && (
                    <div className={`text-center py-8 ${appTheme.cardText}/70`}>
                        No activity found for {displayYear}.
                    </div>
                )}
                <div className="flex gap-x-3 overflow-x-auto pb-4 custom-scrollbar">
                    {Object.entries(daysGroupedByMonth).map(([month, daysInMonth]) => {
                        const firstDayOfMonth = daysInMonth[0];
                        const firstDayOffset = getDay(firstDayOfMonth);

                        return (
                            <div key={month} className="flex flex-col">
                                <div className={`text-xs ${appTheme.cardText}/80 mb-2 h-4 text-center w-12`}>{month.split(' ')[0]}</div>
                                <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ minWidth: '12px' }}>
                                    {Array.from({ length: firstDayOffset }).map((_, index) => (
                                        <div key={`empty-${month}-${index}`} className="w-3 h-3 rounded-sm" />
                                    ))}
                                    {daysInMonth.map(day => {
                                        const dateString = formatISO(day, { representation: 'date' });
                                        const count = submissionCounts[dateString] || 0;
                                        return (
                                            <motion.div
                                                key={dateString}
                                                className={`w-3 h-3 rounded-sm ${getColor(count)}`}
                                                title={`${count} submission${count !== 1 ? 's' : ''} on ${format(day, 'MMM d, yyyy')}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className={`flex justify-between mt-4 text-xs ${appTheme.cardText}/80`}>
                    <span>Less</span>
                    <div className="flex space-x-1">
                        <div className={`w-3 h-3 rounded-sm ${appTheme.background}/50 border ${appTheme.border}/20`}></div>
                        <div className={`w-3 h-3 rounded-sm bg-${appTheme.successColor.split('-')[1]}-400`}></div>
                        <div className={`w-3 h-3 rounded-sm bg-${appTheme.successColor.split('-')[1]}-500`}></div>
                        <div className={`w-3 h-3 rounded-sm bg-${appTheme.successColor.split('-')[1]}-600`}></div>
                        <div className={`w-3 h-3 rounded-sm bg-${appTheme.successColor.split('-')[1]}-700`}></div>
                    </div>
                    <span>More</span>
                </div>
            </div>
        );
    }

    // Themed Activity Item (remains unchanged)
    const ActivityItem = useCallback(({ submission }) => (
        <motion.div
            whileHover={{ x: 5 }}
            className={`flex justify-between items-center p-4 ${appTheme.cardBg}/30 rounded-xl hover:${appTheme.cardBg}/50 transition-all duration-300 group border ${appTheme.border}/30`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${submission.status === 'Accepted' ? `${appTheme.successColor.replace('text-', 'bg-')}/20 ${appTheme.successColor}` : `${appTheme.errorColor.replace('text-', 'bg-')}/20 ${appTheme.errorColor}`}`}>
                    {submission.status === 'Accepted' ? <FaCheck /> : <FaCode />}
                </div>
                <div>
                    <Link
                        to={`/codefield/${submission.problemId}`}
                        className={`font-medium ${appTheme.text} group-hover:${appTheme.highlight} transition-colors`}
                    >
                        {submission?.title}
                    </Link>
                    <p className={`text-xs ${appTheme.cardText} mt-1`}>
                        {submission.language} • {format(new Date(submission.createdAt), 'MMM d, yyyy - h:mm a')}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-xs rounded-full ${submission.status === 'Accepted' ? `${appTheme.successColor.replace('text-', 'bg-')}/20 ${appTheme.successColor}` : `${appTheme.errorColor.replace('text-', 'bg-')}/20 ${appTheme.errorColor}`}`}>
                    {submission.status}
                </span>
                <FaChevronRight className={`${appTheme.cardText}/80 group-hover:${appTheme.highlight} transition-colors`} />
            </div>
        </motion.div>
    ), [appTheme]);

    // Themed Badge (Achievements) (remains unchanged)
    const Badge = useCallback(({ icon, title, description, color }) => (
        <motion.div
            className={`flex items-start space-x-4 p-4 ${appTheme.cardBg}/30 rounded-xl border ${appTheme.border}/30 backdrop-blur-sm`}
            whileHover={{ y: -3 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className={`p-3 rounded-lg ${color.bg} ${color.text} text-xl`}>
                {icon}
            </div>
            <div>
                <h4 className={`font-semibold ${appTheme.text}`}>{title}</h4>
                <p className={`text-sm ${appTheme.cardText} mt-1`}>{description}</p>
            </div>
        </motion.div>
    ), [appTheme]);

    // Themed Skill Pill (remains unchanged)
    const SkillPill = useCallback(({ name, level }) => (
        <div className="relative group">
            <div className={`absolute inset-0 ${appTheme.highlight.replace('text-', 'bg-')}/10 to-${appTheme.highlight.split('-')[1]}-600/10 rounded-full blur-sm group-hover:blur-md transition-all duration-300`}></div>
            <div className={`relative px-4 py-2 ${appTheme.cardBg}/50 rounded-full border ${appTheme.border}/50 group-hover:border-${appTheme.highlight.split('-')[1]}-500/30 transition-all`}>
                <span className={`${appTheme.text}`}>{name}</span>
                <span className={`ml-2 ${appTheme.highlight}`}>{level}%</span>
            </div>
        </div>
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
                    className={`${appTheme.errorColor.replace('text-', 'bg-')}/20 p-8 rounded-xl border ${appTheme.errorColor.replace('text-', 'border-')}/50 max-w-md text-center backdrop-blur-sm`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <h2 className={`text-2xl font-bold ${appTheme.errorColor} mb-2`}>Error</h2>
                    <p className={`${appTheme.cardText}`}>{error}</p>
                    <Link
                        to="/"
                        className={`mt-4 inline-block px-6 py-2 ${appTheme.errorColor.replace('text-', 'bg-')}/30 hover:${appTheme.errorColor.replace('text-', 'bg-')}/50 ${appTheme.buttonText} rounded-lg transition-colors border ${appTheme.errorColor.replace('text-', 'border-')}/50`}
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
                    className={`${appTheme.warningColor.replace('text-', 'bg-')}/20 p-8 rounded-xl border ${appTheme.warningColor.replace('text-', 'border-')}/50 max-w-md text-center backdrop-blur-sm`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <h2 className={`text-2xl font-bold ${appTheme.warningColor} mb-2`}>Profile Not Found</h2>
                    <p className={`${appTheme.cardText}`}>The requested profile could not be found.</p>
                    <Link
                        to="/"
                        className={`mt-4 inline-block px-6 py-2 ${appTheme.warningColor.replace('text-', 'bg-')}/30 hover:${appTheme.warningColor.replace('text-', 'bg-')}/50 ${appTheme.buttonText} rounded-lg transition-colors border ${appTheme.warningColor.replace('text-', 'border-')}/50`}
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
    const joinedYear = getYear(new Date(profile.createdAt));
    const currentYear = new Date().getFullYear();
    const activationYears = Math.max(0, currentYear - joinedYear);
    const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100) : 0;

    // Daily Challenge streak values
    const currentStreak = profile.dailyChallenges?.currentStreak || 0;
    const longestStreak = profile.dailyChallenges?.longestStreak || 0;


    // Badges data with themed color schemes
    const badges = [
        {
            icon: <FaMedal />,
            title: "First Problem Solved",
            description: "Solved your first coding problem",
            color: { bg: `${appTheme.infoColor.replace('text-', 'bg-')}/20`, text: appTheme.infoColor }
        },
        {
            icon: <RiSwordFill />,
            title: "5-Day Streak",
            description: "Solved problems for 5 consecutive days",
            color: { bg: `${appTheme.highlightTertiary.replace('text-', 'bg-')}/20`, text: appTheme.highlightTertiary }
        },
        {
            icon: <FaStar />,
            title: "Advanced Solver",
            description: "Solved 10+ medium difficulty problems",
            color: { bg: `${appTheme.warningColor.replace('text-', 'bg-')}/20`, text: appTheme.warningColor }
        },
    ];


    // Stat card colors
    const statColors = [
        { iconBg: `${appTheme.successColor.replace('text-', 'bg-')}/20`, iconText: appTheme.successColor },
        // Updated color for Streak card (using orange/fire theme)
        { iconBg: `bg-orange-500/20`, iconText: `text-orange-500` },
        { iconBg: `${appTheme.highlight.replace('text-', 'bg-')}/20`, iconText: appTheme.highlight },
        { iconBg: `${appTheme.infoColor.replace('text-', 'bg-')}/20`, iconText: appTheme.infoColor } // Color for rank stat card
    ];

    // Get current submissions for the active Activity tab page
    const currentActivitySubmissions = submissions.slice(
        (activityCurrentPage - 1) * submissionsPerPage,
        activityCurrentPage * submissionsPerPage
    );
    const activityTotalPages = Math.ceil(submissions.length / submissionsPerPage);
    const activityPageNumbers = getPaginationNumbers(activityCurrentPage, activityTotalPages);

    // Pagination for Solution Posts tab
    const postsTotalPages = Math.ceil(totalPosts / postsPerPage);
    const postsPageNumbers = getPaginationNumbers(postsCurrentPage, postsTotalPages);

    // Component for a single solution post
    const SolutionPostCard = ({ post }) => (
        <motion.div
            className={`p-4 rounded-xl ${appTheme.cardBg}/30 border ${appTheme.border}/30 hover:${appTheme.cardBg}/50 transition-all duration-300 group`}
            whileHover={{ y: -3 }}
        >
            <Link to={`/discuss/${post.slug}`} className="block">
                <div className='flex items-center  justify-between '>
                    <h4 className={`font-semibold ${appTheme.text} mb-2 group-hover:${appTheme.highlight} transition-colors`}>{post.title}</h4>
                    <div className={`flex items-center justify-between text-xs ${appTheme.cardText}/80`}>
                        <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );


    return (
        <div className={`min-h-screen ${appTheme.background}`}>
            <Header />

            {/* Profile Header */}
            <div className="relative pt-5 pb-16 overflow-hidden">
                <div className={`absolute inset-0 ${appTheme.background} opacity-30`}></div>
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent from-0% to-${appTheme.background.split('-')[1]}-900/80 to-70%`}></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="relative group">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <img
                                    src={profile.avatar}
                                    alt={`${profile.firstName}'s avatar`}
                                    className={`w-32 h-32 rounded-full border-4 ${appTheme.border}/10 shadow-2xl object-cover group-hover:border-${appTheme.highlight.split('-')[1]}-500/50 transition-all duration-300`}
                                />
                                <div className={`absolute inset-0 rounded-full border-4 border-transparent group-hover:border-${appTheme.highlight.split('-')[1]}-500/30 transition-all duration-300 pointer-events-none`}></div>
                            </motion.div>
                            {loggedInUser?._id === profile._id && (
                                <Link
                                    to="/profile/edit"
                                    className={`absolute -bottom-2 -right-2 ${appTheme.highlight.replace('text-', 'bg-')} hover:${appTheme.highlight.replace('text-', 'bg-')}/80 ${appTheme.buttonText} p-2 rounded-full shadow-lg transition-all duration-300 transform group-hover:scale-110 flex items-center justify-center`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </Link>
                            )}
                        </div>
                        <div className="mt-6 md:mt-0 md:ml-8 text-center md:text-left">
                            <motion.h1
                                className={`text-4xl font-bold ${appTheme.text}`}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                {profile.firstName} {profile.lastName}
                                <span className={`ml-3 ${appTheme.warningColor} text-lg cursor-pointer align-middle inline-flex items-center ${appTheme.warningColor.replace('text-', 'bg-')}/20 px-3 py-1 rounded-full border border-${appTheme.warningColor.split('-')[1]}-700/30`}>
                                    {loggedInUser?.isPremium ? (
                                        <><FaCrown className="mr-1" />Premium</>
                                    ) : (
                                        <Link to="/premium" className={`text-sm font-semibold cursor-pointer hover:${appTheme.warningColor.replace('text-', 'bg-')}/30 transition-colors`}>
                                            Get Premium
                                        </Link>
                                    )}
                                </span>
                            </motion.h1>
                            <motion.p
                                className={`${appTheme.highlight} mt-2 font-medium text-xl`}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {profile.headline || 'Passionate about solving problems with code'}
                            </motion.p>
                            <motion.div
                                className={`flex flex-wrap justify-center md:justify-start items-center mt-4 space-x-4 ${appTheme.cardText}`}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {/* Order: Location, Member Since (Joined Year), Rank */}
                                <div className="flex items-center">
                                    <FaMapMarkerAlt className={`mr-2 ${appTheme.successColor}`} />
                                    <span>{profile.location || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center">
                                    <FaUser className={`mr-2 ${appTheme.infoColor}`} />
                                    <span>Member since {format(new Date(profile.createdAt), 'MMMM yyyy')}</span>
                                </div>
                                {/* Rank Information */}
                                {userRank !== null && (
                                    <Link to="/world-rank" className="flex items-center">
                                        <FaRankingStar className={`mr-2 ${appTheme.highlightTertiary}`} /> {/* Using highlightTertiary for rank icon */}
                                        <span>Rank: #{userRank} {totalUsersForRank > 0 ? `/ ${totalUsersForRank}` : ''}</span>
                                    </Link>
                                )}
                            </motion.div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* About Card */}
                        <motion.div
                            className={`p-6 rounded-2xl ${appTheme.cardBg}/50 ${appTheme.cardText} border ${appTheme.border}/50 shadow-lg backdrop-blur-sm`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3 className={`text-lg font-semibold ${appTheme.text} mb-4 flex items-center`}>
                                <FaUser className={`mr-2 ${appTheme.highlightSecondary}`} />
                                About
                            </h3>
                            {profile.bio ? (
                                <p className={`${appTheme.cardText}`}>{profile.bio}</p>
                            ) : (
                                <p className={`${appTheme.cardText}/70 italic`}>No bio yet</p>
                            )}
                            {/* Social Links */}
                            {(profile.socialLinks && Object.values(profile.socialLinks).some(link => link)) && (
                                <>
                                    <h4 className={`text-md font-semibold ${appTheme.text} mt-6 mb-3 flex items-center`}>
                                        <FaGlobe className={`mr-2 ${appTheme.highlight}`} />
                                        Connect
                                    </h4>
                                    <div className="flex items-center space-x-4 text-2xl">
                                        {profile.socialLinks.github && (
                                            <motion.a
                                                href={profile.socialLinks.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${appTheme.cardText} hover:${appTheme.text} transition-colors duration-200`}
                                                title="GitHub"
                                                whileHover={{ y: -3 }}
                                            >
                                                <FaGithub />
                                            </motion.a>
                                        )}
                                        {profile.socialLinks.linkedin && (
                                            <motion.a
                                                href={profile.socialLinks.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${appTheme.cardText} hover:${appTheme.infoColor} transition-colors duration-200`}
                                                title="LinkedIn"
                                                whileHover={{ y: -3 }}
                                            >
                                                <FaLinkedin />
                                            </motion.a>
                                        )}
                                        {profile.socialLinks.twitter && (
                                            <motion.a
                                                href={profile.socialLinks.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${appTheme.cardText} hover:${appTheme.highlightSecondary} transition-colors duration-200`}
                                                title="Twitter"
                                                whileHover={{ y: -3 }}
                                            >
                                                <FaTwitter />
                                            </motion.a>
                                        )}
                                        {profile.socialLinks.website && (
                                            <motion.a
                                                href={profile.socialLinks.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${appTheme.cardText} hover:${appTheme.highlightTertiary} transition-colors duration-200`}
                                                title="Website"
                                                whileHover={{ y: -3 }}
                                            >
                                                <FaGlobe />
                                            </motion.a>
                                        )}
                                        {profile.socialLinks.leetcode && (
                                            <motion.a
                                                href={profile.socialLinks.leetcode}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${appTheme.cardText} hover:${appTheme.highlight} transition-colors duration-200`}
                                                title="LeetCode"
                                                whileHover={{ y: -3 }}
                                            >
                                                <SiLeetcode />
                                            </motion.a>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>

                        {/* Badges */}
                        <motion.div
                            className={`p-6 rounded-2xl ${appTheme.cardBg}/50 ${appTheme.cardText} border ${appTheme.border}/50 shadow-lg backdrop-blur-sm`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className={`text-lg font-semibold ${appTheme.text} mb-4 flex items-center`}>
                                <FaMedal className={`mr-2 ${appTheme.warningColor}`} />
                                Achievements
                            </h3>
                            <div className="space-y-3">
                                {badges.map((badge, index) => (
                                    <Badge
                                        key={index}
                                        icon={badge.icon}
                                        title={badge.title}
                                        description={badge.description}
                                        color={badge.color}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Tabs */}
                        <motion.div
                            className={`flex border-b ${appTheme.border}/50`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-6 py-3 font-medium text-sm relative ${activeTab === 'overview' ? appTheme.successColor : `${appTheme.cardText} hover:${appTheme.text}`}`}
                            >
                                Overview
                                {activeTab === 'overview' && (
                                    <motion.div
                                        className={`absolute bottom-0 left-0 right-0 h-0.5 ${appTheme.successColor.replace('text-', 'bg-')}`}
                                        layoutId="tabUnderline"
                                    />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('activity')}
                                className={`px-6 py-3 font-medium text-sm relative ${activeTab === 'activity' ? appTheme.successColor : `${appTheme.cardText} hover:${appTheme.text}`}`}
                            >
                                Activity
                                {activeTab === 'activity' && (
                                    <motion.div
                                        className={`absolute bottom-0 left-0 right-0 h-0.5 ${appTheme.successColor.replace('text-', 'bg-')}`}
                                        layoutId="tabUnderline"
                                    />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('solutionPosts')}
                                className={`px-6 py-3 font-medium text-sm relative ${activeTab === 'solutionPosts' ? appTheme.successColor : `${appTheme.cardText} hover:${appTheme.text}`}`}
                            >
                                Solution Posts {/* Changed tab name */}
                                {activeTab === 'solutionPosts' && (
                                    <motion.div
                                        className={`absolute bottom-0 left-0 right-0 h-0.5 ${appTheme.successColor.replace('text-', 'bg-')}`}
                                        layoutId="tabUnderline"
                                    />
                                )}
                            </button>
                            {/* Removed Repositories tab, can be added back if needed */}
                        </motion.div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-8"
                                >
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <StatCard
                                            title="Problems Solved"
                                            value={uniqueAcceptedProblems}
                                            icon={<FaCheck />}
                                            subtext={`${acceptedSubmissions.length} submissions`}
                                            color={statColors[0]}
                                        />
                                        {/* UPDATED: Daily Challenge Streak StatCard */}
                                        <StatCard
                                            title="Current Streak"
                                            value={currentStreak}
                                            icon={<FaFire />}
                                            subtext={`Max Streak: ${longestStreak} days`}
                                            color={statColors[1]}
                                        />
                                        <StatCard
                                            title="Solution Posts"
                                            value={totalPosts}
                                            icon={<FaStar />}
                                            subtext={(<p><Link to={`/discuss/new`} className="font-semibold">create Post</Link></p>)}
                                            color={statColors[2]}
                                        />

                                        <StatCard
                                            title="ELO Rating"
                                            value={profile.stats?.eloRating || 1000} // Display ELO, default to 1000
                                            icon={<FaTrophy />} // Use FaTrophy for ELO
                                            subtext="Ranked Game Score"
                                            color={{ iconBg: `${appTheme.highlightTertiary.replace('text-', 'bg-')}/20`, iconText: appTheme.highlightTertiary }} // Use highlightTertiary colors
                                        />
                                    </div>

                                    {/* Heatmap */}
                                    <SubmissionHeatmap submissions={submissions} userCreatedAt={profile.createdAt} />

                                    {/* Recent Problems Solved */}
                                    <div className={`p-6 rounded-2xl ${appTheme.cardBg}/50 ${appTheme.cardText} border ${appTheme.border}/50 shadow-lg backdrop-blur-sm`}>
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className={`text-lg font-semibold ${appTheme.text} flex items-center`}>
                                                <RiSwordFill className={`mr-2 ${appTheme.highlight}`} />
                                                Recent Activity
                                            </h3>
                                            <span onClick={() => setActiveTab('activity')} className={`${appTheme.successColor} flex items-center cursor-pointer hover:underline`}>
                                                View all activity <FaChevronRight className="ml-1 text-xs" />
                                            </span>
                                        </div>
                                        {submissions.length > 0 ? (
                                            <div className="space-y-3">
                                                {submissions
                                                    .slice(0, 5) // Display only first 5 recent submissions
                                                    .map(sub => (
                                                        <ActivityItem
                                                            key={sub._id}
                                                            submission={sub}
                                                        />
                                                    ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className={`${appTheme.cardText}/70 mb-4`}>
                                                    <FaClipboardList className="inline-block text-4xl" />
                                                </div>
                                                <h4 className={`${appTheme.cardText} font-medium`}>No activity yet</h4>
                                                <p className={`${appTheme.cardText}/70 mt-1`}>Start solving problems to see your activity here</p>
                                                <Link
                                                    to="/problems"
                                                    className={`mt-4 inline-block px-6 py-2 ${appTheme.successColor.replace('text-', 'bg-')}/10 hover:${appTheme.successColor.replace('text-', 'bg-')}/20 ${appTheme.successColor} rounded-lg border border-${appTheme.successColor.split('-')[1]}-600/30 transition-colors`}
                                                >
                                                    Browse Problems
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Activity Tab */}
                            {activeTab === 'activity' && (
                                <motion.div
                                    key="activity"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className={`p-6 rounded-2xl ${appTheme.cardBg}/50 ${appTheme.cardText} border ${appTheme.border}/50 shadow-lg backdrop-blur-sm`}>
                                        <h3 className={`text-lg font-semibold ${appTheme.text} mb-6 flex items-center`}>
                                            <FaChartLine className={`mr-2 ${appTheme.infoColor}`} />
                                            Full Activity History
                                        </h3>
                                        {submissions.length > 0 ? (
                                            <>
                                                <div className="space-y-3 mb-6">
                                                    {currentActivitySubmissions.map(sub => (
                                                        <ActivityItem key={sub._id} submission={sub} />
                                                    ))}
                                                </div>
                                                {activityTotalPages > 1 && (
                                                    <div className="flex justify-between items-center">
                                                        <button
                                                            onClick={() => setActivityCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            disabled={activityCurrentPage === 1}
                                                            className={`px-4 py-2 ${appTheme.cardBg}/50 border ${appTheme.border}/30 rounded-lg ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/80 transition-all duration-200 font-medium`}
                                                        >
                                                            Previous
                                                        </button>
                                                        <div className="flex items-center space-x-1">
                                                            {activityPageNumbers.map((page, index) => (
                                                                page === '...' ? (
                                                                    <span key={`ellipsis-${index}`} className={`px-3 py-2 ${appTheme.cardText}`}>...</span>
                                                                ) : (
                                                                    <button
                                                                        key={page}
                                                                        onClick={() => setActivityCurrentPage(page)}
                                                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activityCurrentPage === page
                                                                            ? `${appTheme.accent} ${appTheme.buttonText} shadow-md`
                                                                            : `${appTheme.cardBg}/50 ${appTheme.cardText} hover:${appTheme.cardBg}/80 border ${appTheme.border}/30`
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
                                                            className={`px-4 py-2 ${appTheme.cardBg}/50 border ${appTheme.border}/30 rounded-lg ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/80 transition-all duration-200 font-medium`}
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className={`${appTheme.cardText}/70 mb-4`}>
                                                    <FaClipboardList className="inline-block text-4xl" />
                                                </div>
                                                <h4 className={`${appTheme.cardText} font-medium`}>No activity yet</h4>
                                                <p className={`${appTheme.cardText}/70 mt-1`}>Your solved problems will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Solution Posts Tab (UPDATED) */}
                            {activeTab === 'solutionPosts' && (
                                <motion.div
                                    key="solutionPosts"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className={`p-6 rounded-2xl ${appTheme.cardBg}/50 ${appTheme.cardText} border ${appTheme.border}/50 shadow-lg backdrop-blur-sm`}>
                                        <h3 className={`text-lg font-semibold ${appTheme.text} mb-6 flex items-center`}>
                                            <FaCode className={`mr-2 ${appTheme.highlight}`} /> {/* Using highlight for icon */}
                                            My Solution Posts
                                        </h3>
                                        {totalPosts > 0 ? (
                                            <>
                                                <div className="space-y-3 mb-6">
                                                    {solutionPosts.map(post => (
                                                        <SolutionPostCard key={post._id} post={post} />
                                                    ))}
                                                </div>
                                                {postsTotalPages > 1 && (
                                                    <div className="flex justify-between items-center">
                                                        <button
                                                            onClick={() => setPostsCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            disabled={postsCurrentPage === 1}
                                                            className={`px-4 py-2 ${appTheme.cardBg}/50 border ${appTheme.border}/30 rounded-lg ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/80 transition-all duration-200 font-medium`}
                                                        >
                                                            Previous
                                                        </button>
                                                        <div className="flex items-center space-x-1">
                                                            {postsPageNumbers.map((page, index) => (
                                                                page === '...' ? (
                                                                    <span key={`ellipsis-${index}`} className={`px-3 py-2 ${appTheme.cardText}`}>...</span>
                                                                ) : (
                                                                    <button
                                                                        key={page}
                                                                        onClick={() => setPostsCurrentPage(page)}
                                                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${postsCurrentPage === page
                                                                            ? `${appTheme.accent} ${appTheme.buttonText} shadow-md`
                                                                            : `${appTheme.cardBg}/50 ${appTheme.cardText} hover:${appTheme.cardBg}/80 border ${appTheme.border}/30`
                                                                            }`}
                                                                    >
                                                                        {page}
                                                                    </button>
                                                                )
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => setPostsCurrentPage(prev => Math.min(prev + 1, postsTotalPages))}
                                                            disabled={postsCurrentPage === postsTotalPages}
                                                            className={`px-4 py-2 ${appTheme.cardBg}/50 border ${appTheme.border}/30 rounded-lg ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/80 transition-all duration-200 font-medium`}
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className={`${appTheme.cardText}/70 mb-4`}>
                                                    <FaClipboardList className="inline-block text-4xl" />
                                                </div>
                                                <h4 className={`${appTheme.cardText} font-medium`}>No solution posts yet</h4>
                                                <p className={`${appTheme.cardText}/70 mt-1`}>Share your coding insights and solutions with the community!</p>
                                                <Link
                                                    to="/discuss/new"
                                                    className={`mt-4 inline-block px-6 py-2 ${appTheme.highlight.replace('text-', 'bg-')}/10 hover:${appTheme.highlight.replace('text-', 'bg-')}/20 ${appTheme.highlight} rounded-lg border border-${appTheme.highlight.split('-')[1]}-600/30 transition-colors`}
                                                >
                                                    Create a Post
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Repositories Tab (remains unchanged) */}
                            {activeTab === 'repositories' && (
                                <motion.div
                                    key="repositories"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className={`p-6 rounded-2xl ${appTheme.cardBg}/50 ${appTheme.cardText} border ${appTheme.border}/50 shadow-lg backdrop-blur-sm`}>
                                        <h3 className={`text-lg font-semibold ${appTheme.text} mb-6 flex items-center`}>
                                            <RiGitRepositoryLine className={`mr-2 ${appTheme.highlightTertiary}`} />
                                            Code Repositories
                                        </h3>
                                        <div className="text-center py-12">
                                            <div className={`${appTheme.cardText}/70 mb-4`}>
                                                <RiGitRepositoryLine className="inline-block text-4xl" />
                                            </div>
                                            <h4 className={`${appTheme.cardText} font-medium`}>No repositories linked yet</h4>
                                            <p className={`${appTheme.cardText}/70 mt-1`}>Connect your GitHub account to showcase your projects</p>
                                            <button className={`mt-4 px-6 py-2 ${appTheme.highlightTertiary.replace('text-', 'bg-')}/10 hover:${appTheme.highlightTertiary.replace('text-', 'bg-')}/20 ${appTheme.highlightTertiary} rounded-lg border border-${appTheme.highlightTertiary.split('-')[1]}-600/30 transition-colors flex items-center mx-auto`}>
                                                <FaGithub className="mr-2" /> Connect GitHub
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ProfilePage;