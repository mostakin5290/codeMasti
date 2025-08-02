import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import CreatePlaylistModal from '../components/Playlist/CreatePlaylistModal';
import AddProblemToPlaylistModal from '../components/Playlist/AddProblemToPlaylistModal';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/common/ConfirmationModal';
import UpdatePlaylistModal from '../components/Playlist/UpdatePlaylistModal';

import {
    FaCheck, FaPen, FaUndo, FaSearch, FaFilter, FaCalendarAlt, FaClock,
    FaFire, FaRandom, FaSortUp, FaSort, FaRocket, FaLock, FaThLarge,
    FaList, FaHistory, FaSortDown, FaPlus, FaFolderOpen, FaStar,
    FaEllipsisV, FaEdit, FaTrash, FaChevronLeft, FaChevronRight,
    FaChartLine, FaBullseye, FaBolt, FaEye
} from 'react-icons/fa';

import { LuDot } from "react-icons/lu";
import { HiSparkles } from "react-icons/hi";
import { BiTrendingUp } from "react-icons/bi";

import DailyChallengeDetailsModal from '../components/ProblemPage/DailyChallengeDetailsModal';

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

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

// Calendar Helper Functions
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const getMonthName = (date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const ProblemPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [tagFilter, setTagFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 16;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Daily Challenge States
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [isDailyChallengeLoading, setIsDailyChallengeLoading] = useState(true);
    const [alreadySolvedToday, setAlreadySolvedToday] = useState(false);
    const [userCurrentStreak, setUserCurrentStreak] = useState(0);

    // Daily Challenge Calendar States
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [dailyChallengeCalendarData, setDailyChallengeCalendarData] = useState([]);
    const [isLoadingDailyChallengeHistory, setIsLoadingDailyChallengeHistory] = useState(true);
    const [showDailyChallengeDetailsModal, setShowDailyChallengeDetailsModal] = useState(false);
    const [selectedDailyChallengeProblem, setSelectedDailyChallengeProblem] = useState(null);

    // Playlist States
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
    const [showAddProblemToPlaylistModal, setShowAddProblemToPlaylistModal] = useState(false);
    const [selectedProblemForPlaylist, setSelectedProblemForPlaylist] = useState(null);
    const [showUpdatePlaylistModal, setShowUpdatePlaylistModal] = useState(false);
    const [selectedPlaylistToManage, setSelectedPlaylistToManage] = useState(null);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [playlistToDeleteId, setPlaylistToDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Get theme from context
    const { theme } = useTheme();

    // Extract base colors for consistent styling
    const getBaseColor = (colorClass) => {
        if (!colorClass) return 'gray';
        const match = colorClass.match(/(?:bg-|text-|border-)(\w+)-?\d*/);
        return match ? match[1] : 'gray';
    };

    const primaryColor = getBaseColor(theme.primary);
    const highlightColor = getBaseColor(theme.highlight);
    const secondaryColor = getBaseColor(theme.secondary);

    const sectionClasses = `backdrop-blur-xl border ${theme.border} shadow-2xl rounded-2xl`;

    // Memoize all tags for filter dropdown
    const allTags = useMemo(() => {
        const tags = new Set();
        problems.forEach(problem => {
            problem.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [problems]);

    // Memoize filtered and sorted problems
    const filteredProblems = useMemo(() => {
        let filtered = problems.filter(problem =>
            (difficultyFilter === 'All' || problem.difficulty?.toLowerCase() === difficultyFilter.toLowerCase()) &&
            (statusFilter === 'All' ||
                (statusFilter === 'none' ? !problem.status : problem.status?.toLowerCase() === statusFilter.toLowerCase())) &&
            (tagFilter === 'All' || problem.tags?.includes(tagFilter)) &&
            (problem.title?.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        filtered.sort((a, b) => {
            let aVal, bVal;
            switch (sortBy) {
                case 'title':
                    aVal = a.title?.toLowerCase() || '';
                    bVal = b.title?.toLowerCase() || '';
                    break;
                case 'difficulty':
                    {
                        const diffOrder = { easy: 1, medium: 2, hard: 3 };
                        aVal = diffOrder[a.difficulty?.toLowerCase()] || 0;
                        bVal = diffOrder[b.difficulty?.toLowerCase()] || 0;
                        break;
                    }
                default:
                    return 0;
            }
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }, [problems, searchTerm, difficultyFilter, statusFilter, tagFilter, sortBy, sortOrder]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);
    const currentProblems = filteredProblems.slice((currentPage - 1) * problemsPerPage, currentPage * problemsPerPage);
    const pageNumbers = getPaginationNumbers(currentPage, totalPages);

    // Refs to track fetching
    const problemsFetchedOnce = useRef(false);
    const dailyChallengeFetchedForUser = useRef(null);
    const dailyCalendarFetchedForUser = useRef(null);
    const userPlaylistsFetchedForUser = useRef(null);

    // Fetch all problems
    useEffect(() => {
        if (!problemsFetchedOnce.current) {
            const fetchProblems = async () => {
                setLoading(true);
                try {
                    const { data } = await axiosClient.get('/problem/getAllProblem');
                    const enhancedData = (data || []).map(problem => ({
                        ...problem
                    }));
                    setProblems(enhancedData);
                    const recent = localStorage.getItem('recentlyViewedProblems');
                    if (recent) {
                        const parsedRecent = JSON.parse(recent);
                        const validRecentProblems = parsedRecent.map(id => enhancedData.find(p => p._id === id)).filter(Boolean);
                        setRecentlyViewed(validRecentProblems.slice(0, 3));
                    } else {
                        setRecentlyViewed(enhancedData.slice(0, 3));
                    }
                    problemsFetchedOnce.current = true;
                } catch (err) {
                    console.error("Error fetching problems:", err);
                    setProblems([]);
                    setRecentlyViewed([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchProblems();
        }
    }, []);

    const updateRecentlyViewed = useCallback((problemId) => {
        const currentRecent = JSON.parse(localStorage.getItem('recentlyViewedProblems') || '[]');
        const newRecent = [problemId, ...currentRecent.filter(id => id !== problemId)].slice(0, 5);
        localStorage.setItem('recentlyViewedProblems', JSON.stringify(newRecent));

        setRecentlyViewed(prev => {
            const problemToAdd = problems.find(p => p._id === problemId);
            if (!problemToAdd) return prev;
            return [problemToAdd, ...prev.filter(p => p._id !== problemId)].slice(0, 3);
        });
    }, [problems]);

    // Fetch Daily Challenge
    useEffect(() => {
        if (user && dailyChallengeFetchedForUser.current !== user._id) {
            const fetchDailyChallenge = async () => {
                setIsDailyChallengeLoading(true);
                try {
                    const res = await axiosClient.get('/problem/daily');
                    setDailyChallenge(res.data.challenge);
                    setAlreadySolvedToday(res.data.alreadySolved);
                    setUserCurrentStreak(res.data.streak);
                    dailyChallengeFetchedForUser.current = user._id;
                } catch (err) {
                    console.error("Error fetching daily challenge:", err);
                    setDailyChallenge(null);
                    setAlreadySolvedToday(false);
                    setUserCurrentStreak(0);
                } finally {
                    setIsDailyChallengeLoading(false);
                }
            };
            fetchDailyChallenge();
        } else if (!user) {
            setDailyChallenge(null);
            setAlreadySolvedToday(false);
            setUserCurrentStreak(0);
            dailyChallengeFetchedForUser.current = null;
            setIsDailyChallengeLoading(false);
        }
    }, [user]);

    // Fetch daily challenges for calendar
    useEffect(() => {
        if (user && dailyCalendarFetchedForUser.current !== user._id) {
            const fetchDailyChallengeData = async () => {
                setIsLoadingDailyChallengeHistory(true);
                try {
                    const { data } = await axiosClient.get('/problem/daily/calendar');
                    setDailyChallengeCalendarData(data);
                    dailyCalendarFetchedForUser.current = user._id;
                } catch (err) {
                    console.error("Error fetching daily challenge calendar data:", err);
                    setDailyChallengeCalendarData([]);
                } finally {
                    setIsLoadingDailyChallengeHistory(false);
                }
            };
            fetchDailyChallengeData();
        } else if (!user) {
            setDailyChallengeCalendarData([]);
            dailyCalendarFetchedForUser.current = null;
            setIsLoadingDailyChallengeHistory(false);
        }
    }, [user]);

    // Fetch User Playlists
    const fetchUserPlaylists = useCallback(async () => {
        if (!user) {
            setUserPlaylists([]);
            setLoadingPlaylists(false);
            return;
        }
        setLoadingPlaylists(true);
        try {
            const { data } = await axiosClient.get('/playlist/my');
            setUserPlaylists(data);
        } catch (err) {
            console.error("Error fetching user playlists:", err);
            toast.error("Failed to load your playlists.");
            setUserPlaylists([]);
        } finally {
            setLoadingPlaylists(false);
        }
    }, [user]);

    useEffect(() => {
        if (user && userPlaylistsFetchedForUser.current !== user._id) {
            fetchUserPlaylists();
            userPlaylistsFetchedForUser.current = user._id;
        } else if (!user) {
            setUserPlaylists([]);
            userPlaylistsFetchedForUser.current = null;
        }
    }, [user, fetchUserPlaylists]);

    // Playlist handlers
    const handleCreatePlaylist = async ({ name, description }) => {
        try {
            await axiosClient.post('/playlist', { name, description });
            toast.success('Playlist created successfully!');
            fetchUserPlaylists();
            return true;
        } catch (err) {
            console.error('Error creating playlist:', err);
            throw err.response?.data?.message ? new Error(err.response.data.message) : new Error('Failed to create playlist');
        }
    };

    const handleAddProblemToPlaylist = async (playlistId, problemId) => {
        try {
            await axiosClient.post(`/playlist/${playlistId}/add/${problemId}`);
            toast.success('Problem added to playlist!');
            fetchUserPlaylists();
        } catch (err) {
            console.error('Error adding problem to playlist:', err);
            toast.error(err.response?.data?.message || 'Failed to add problem to playlist.');
            throw err.response?.data?.message ? new Error(err.response.data.message) : new Error('Failed to add problem to playlist');
        }
    };

    const handleUpdatePlaylist = async (playlistId, { name, description }) => {
        try {
            await axiosClient.put(`/playlist/${playlistId}`, { name, description });
            toast.success('Playlist updated successfully!');
            fetchUserPlaylists();
            return true;
        } catch (err) {
            console.error('Error updating playlist:', err);
            throw err.response?.data?.message ? new Error(err.response.data.message) : new Error('Failed to update playlist');
        }
    };

    const handleDeletePlaylistClick = (playlistId) => {
        setPlaylistToDeleteId(playlistId);
        setShowConfirmDeleteModal(true);
    };

    const confirmDeletePlaylist = async () => {
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/playlist/${playlistToDeleteId}`);
            toast.success('Playlist deleted successfully!');
            fetchUserPlaylists();
            setShowConfirmDeleteModal(false);
            setPlaylistToDeleteId(null);
        } catch (err) {
            console.error('Error deleting playlist:', err);
            toast.error(err.response?.data?.message || 'Failed to delete playlist.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Reset current page when filters/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, difficultyFilter, statusFilter, tagFilter]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setDifficultyFilter('All');
        setStatusFilter('All');
        setTagFilter('All');
        setCurrentPage(1);
        setSortBy('title');
        setSortOrder('asc');
    };

    const getRandomProblem = () => {
        if (filteredProblems.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredProblems.length);
            const randomProblem = filteredProblems[randomIndex];
            updateRecentlyViewed(randomProblem._id);
            window.open(`/codefield/${randomProblem._id}`, '_blank');
        } else {
            toast.info("No problems to pick from.");
        }
    };

    const difficultyPill = (difficulty) => {
        const difficultyStyles = {
            easy: `bg-${theme.successColor.replace('text-', '').replace('-400', '-500/20')} ${theme.text} border border-${theme.successColor.replace('text-', '').replace('-400', '-500/40')}`,
            medium: `bg-${theme.warningColor.replace('text-', '').replace('-400', '-500/20')} ${theme.text} border border-${theme.warningColor.replace('text-', '').replace('-400', '-500/40')}`,
            hard: `bg-${theme.errorColor.replace('text-', '').replace('-400', '-500/20')} ${theme.text} border border-${theme.errorColor.replace('text-', '').replace('-400', '-500/40')}`,
        };

        const defaultStyle = `${theme.cardBg} ${theme.cardText} border ${theme.border}`;

        return (
            <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${difficultyStyles[difficulty.toLowerCase()] || defaultStyle} transition-all duration-200 hover:scale-105`}>
                {capitalizeFirstLetter(difficulty)}
            </span>
        );
    };

    const statusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'solved': return <FaCheck className={`h-4 w-4 ${theme.successColor} animate-pulse`} title="Solved" />;
            case 'attempted': return <FaPen className={`h-4 w-4 ${theme.warningColor}`} title="Attempted" />;
            default: return <span className={`invisible group-hover:visible ${theme.cardText}`}>-</span>;
        }
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return <FaSort className={`h-3 w-3 ${theme.cardText}`} />;
        return sortOrder === 'asc' ?
            <FaSortUp className={`h-3 w-3 ${theme.highlight}`} /> :
            <FaSortDown className={`h-3 w-3 ${theme.highlight}`} />;
    };

    const renderProblemCard = (problem) => (
        <div key={problem._id} className={`${theme.cardBg} rounded-2xl shadow-2xl hover:shadow-${highlightColor}-500/10 transition-all duration-500 border ${theme.border} overflow-hidden group transform hover:scale-[1.02] hover:-translate-y-1`}>
            <div className="p-6 relative">
                {/* Animated background glow - theme aware */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${highlightColor}-500/5 via-transparent to-${secondaryColor}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {statusIcon(problem.status)}
                            <Link
                                to={`/codefield/${problem._id}`}
                                onClick={() => updateRecentlyViewed(problem._id)}
                                className={`text-lg font-bold ${theme.text} hover:${theme.highlightSecondary} transition-colors duration-300 line-clamp-2`}
                            >
                                {problem.title}
                            </Link>
                            {problem.premium && (
                                <div className="flex items-center gap-1">
                                    <FaLock className={`h-3 w-3 ${theme.warningColor}`} />
                                    <span className={`text-xs bg-${theme.warningColor.replace('text-', '').replace('-400', '-500/20')} ${theme.warningColor} px-2 py-1 rounded-full font-semibold`}>
                                        Pro
                                    </span>
                                </div>
                            )}
                        </div>
                        {user?.isPremium && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProblemForPlaylist(problem);
                                    setShowAddProblemToPlaylistModal(true);
                                }}
                                className={`p-2.5 rounded-xl ${theme.cardBg}/80 border ${theme.border} ${theme.cardText} hover:${theme.cardBg} hover:${theme.highlight} hover:border-${highlightColor}-500/50 transition-all duration-300 hover:scale-110`}
                                title="Add to Playlist"
                            >
                                <FaPlus className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {problem.tags?.slice(0, 3).map(tag => (
                            <span
                                key={tag}
                                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${theme.iconBg} ${theme.highlightSecondary} border border-${highlightColor}-500/20 hover:border-${highlightColor}-500/40 transition-all duration-200 hover:scale-105`}
                            >
                                {capitalizeFirstLetter(tag)}
                            </span>
                        ))}
                        {problem.tags?.length > 3 && (
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${theme.cardBg}/80 ${theme.cardText} border ${theme.border}`}>
                                +{problem.tags.length - 3}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        {difficultyPill(problem.difficulty)}
                        <div className={`flex items-center gap-2 text-xs ${theme.cardText}`}>
                            <FaEye className="w-3 h-3" />
                            <span>View Problem</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Enhanced calendar data with theme-aware styling
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const numDays = getDaysInMonth(year, month);
        const firstDayIndex = getFirstDayOfMonth(year, month);

        const daysArray = [];
        for (let i = 0; i < firstDayIndex; i++) {
            daysArray.push(null);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const challengeMap = new Map();
        dailyChallengeCalendarData.forEach(challenge => {
            const challengeDate = new Date(challenge.dailyChallengeDate);
            challengeDate.setHours(0, 0, 0, 0);
            challengeMap.set(challengeDate.toISOString(), challenge);
        });

        for (let i = 1; i <= numDays; i++) {
            const date = new Date(year, month, i);
            date.setHours(0, 0, 0, 0);
            const dateKey = date.toISOString();
            const challengeForDay = challengeMap.get(dateKey);

            daysArray.push({
                date,
                isCurrentDay: date.getTime() === today.getTime(),
                hasChallenge: !!challengeForDay,
                challengeDetails: challengeForDay,
                isSolvedByUser: challengeForDay ? challengeForDay.isSolved : false,
                isFuture: date.getTime() > today.getTime()
            });
        }

        const totalCells = daysArray.length;
        const remainingCells = 42 - totalCells;
        for (let i = 0; i < remainingCells; i++) {
            daysArray.push(null);
        }

        return daysArray;
    }, [currentMonth, dailyChallengeCalendarData]);

    const goToPreviousMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleDateClick = (dayData) => {
        if (dayData && dayData.hasChallenge && !dayData.isFuture || dayData?.isCurrentDay && dayData?.hasChallenge) {
            setSelectedDailyChallengeProblem(dayData.challengeDetails);
            setShowDailyChallengeDetailsModal(true);
        }
    };

    // Calculate problem statistics
    const problemStats = useMemo(() => {
        const total = problems.length;
        const solved = problems.filter(p => p.status === 'solved').length;
        const attempted = problems.filter(p => p.status === 'attempted').length;
        const easy = problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
        const medium = problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
        const hard = problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;

        return { total, solved, attempted, easy, medium, hard };
    }, [problems]);

    return (
        <div className={`min-h-screen relative overflow-hidden ${theme.text} bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo}`}>
            {/* Enhanced Background Effects - Theme Aware */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-0 left-1/4 w-96 h-96 bg-${highlightColor}-500/10 rounded-full blur-3xl animate-pulse`}></div>
                <div className={`absolute bottom-0 right-1/4 w-96 h-96 bg-${secondaryColor}-500/10 rounded-full blur-3xl animate-pulse delay-1000`}></div>
                <div className={`absolute top-1/2 left-0 w-64 h-64 bg-${primaryColor}-500/5 rounded-full blur-2xl animate-pulse delay-2000`}></div>
                <div className={`absolute top-1/3 right-0 w-80 h-80 bg-${theme.highlightTertiary.replace('text-', '').replace('-400', '')}-500/5 rounded-full blur-3xl animate-pulse delay-3000`}></div>
            </div>

            <Header />

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Enhanced Left Sidebar */}
                    <div className={`xl:w-96 flex-shrink-0 transition-all duration-500 ${sidebarOpen ? 'block' : 'hidden'} xl:block`}>
                        <div className="space-y-8">
                            {/* Enhanced Daily Challenge Section */}
                            <div className={`${sectionClasses} p-8 relative overflow-hidden group`}>
                                {/* Animated background gradient - Theme Aware */}
                                <div className={`absolute inset-0 bg-gradient-to-br from-${highlightColor}-500/5 via-${primaryColor}-500/5 to-${secondaryColor}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-${highlightColor}-500/10 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2`}></div>

                                <div className="relative z-10">
                                    {isDailyChallengeLoading ? (
                                        <div className="text-center py-8">
                                            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${highlightColor}-400 mx-auto`}></div>
                                            <p className={`${theme.cardText} mt-4 font-medium`}>Loading today's challenge...</p>
                                        </div>
                                    ) : dailyChallenge ? (
                                        <>
                                            <div className="flex items-center mb-6 gap-3">
                                                <div className={`p-3 rounded-xl bg-gradient-to-br from-${highlightColor}-500/20 to-${primaryColor}-500/20`}>
                                                    <FaCalendarAlt className={`h-6 w-6 ${theme.highlight}`} />
                                                </div>
                                                <div>
                                                    <h2 className={`text-2xl font-bold bg-gradient-to-r from-${highlightColor}-400 to-${primaryColor}-400 bg-clip-text`}>
                                                        Today's Challenge
                                                    </h2>
                                                    <p className={`text-sm ${theme.cardText}`}>
                                                        {new Date().toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <h3 className={`text-xl font-bold ${theme.text} mb-3 line-clamp-2`}>
                                                    {dailyChallenge.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mb-4">
                                                    {difficultyPill(dailyChallenge.difficulty)}
                                                    <span className={`text-xs ${theme.cardBg} ${theme.cardText} px-2 py-1 rounded-full`}>
                                                        Problem #{dailyChallenge.id || 'Daily'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {dailyChallenge.tags?.slice(0, 3).map(tag => (
                                                        <span
                                                            key={tag}
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${theme.iconBg} ${theme.highlight} border border-${highlightColor}-500/20`}
                                                        >
                                                            {capitalizeFirstLetter(tag)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {user && (
                                                <div className={`mb-6 p-4 rounded-xl ${theme.cardBg}/30 border ${theme.border}`}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="flex items-center gap-2 text-sm font-semibold">
                                                            <FaFire className={theme.warningColor} />
                                                            Current Streak
                                                        </span>
                                                        <span className={`text-2xl font-bold ${theme.warningColor}`}>
                                                            {userCurrentStreak}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {alreadySolvedToday ? (
                                                            <div className={`flex items-center gap-2 ${theme.successColor}`}>
                                                                <FaCheck className="animate-pulse" />
                                                                <span className="font-semibold">Completed Today!</span>
                                                            </div>
                                                        ) : (
                                                            <div className={`flex items-center gap-2 ${theme.warningColor}`}>
                                                                <FaClock className="animate-pulse" />
                                                                <span className="font-semibold">Ready to Solve</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <Link
                                                to={`/codefield/${dailyChallenge._id}`}
                                                onClick={() => updateRecentlyViewed(dailyChallenge._id)}
                                                className={`inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-${highlightColor}-500 to-${primaryColor}-600 hover:from-${highlightColor}-600 hover:to-${primaryColor}-700 text-white rounded-xl transition-all duration-300 font-bold shadow-xl hover:shadow-${highlightColor}-500/25 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-${highlightColor}-500/50`}
                                            >
                                                <FaRocket className="mr-3 h-5 w-5" />
                                                Start Challenge
                                                <HiSparkles className="ml-2 h-5 w-5" />
                                            </Link>
                                        </>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className={`p-4 rounded-full ${theme.cardBg}/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                                                <FaCalendarAlt className={`h-8 w-8 ${theme.cardText}`} />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">No Challenge Today</h3>
                                            <p className={`${theme.cardText} text-sm`}>Check back tomorrow for a new challenge!</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Enhanced Progress Stats */}
                            {user && (
                                <div className={`${sectionClasses} p-6`}>
                                    <h3 className={`font-bold text-lg mb-4 flex items-center gap-2`}>
                                        <FaChartLine className={`h-5 w-5 ${theme.infoColor}`} />
                                        Your Progress
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={`bg-${highlightColor}-500/10 rounded-xl p-4 border border-${highlightColor}-500/20`}>
                                            <div className={`text-2xl font-bold ${theme.highlight}`}>{problemStats.solved}</div>
                                            <div className={`text-sm ${theme.highlight.replace('-400', '-300')}`}>Solved</div>
                                        </div>
                
                                        <div className={`bg-${highlightColor}-500/10 rounded-xl p-4 border border-${highlightColor}-500/20`}>
                                            <div className={`text-2xl font-bold ${theme.highlight}`}>{problemStats.attempted}</div>
                                            <div className={`text-sm ${theme.highlight.replace('-400', '-300')}`}>Attempted</div>
                                        </div>
                                        
                                        <div className={`bg-${highlightColor}-500/10 rounded-xl p-4 border border-${highlightColor}-500/20`}>
                                            <div className={`text-2xl font-bold ${theme.highlight}`}>{userCurrentStreak}</div>
                                            <div className={`text-sm ${theme.highlight.replace('-400', '-300')}`}>Day Streak</div>
                                        </div>
                                        <div className={`bg-${secondaryColor}-500/10 rounded-xl p-4 border border-${secondaryColor}-500/20`}>
                                            <div className={`text-2xl font-bold ${theme.highlightTertiary}`}>
                                                {Math.round((problemStats.solved / problemStats.total) * 100) || 0}%
                                            </div>
                                            <div className={`text-sm ${theme.highlightTertiary.replace('-400', '-300')}`}>Complete</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Daily Challenge Calendar */}
                            {user && (
                                <div className={`${sectionClasses} p-6`}>
                                    <h3 className={`font-bold text-lg mb-4 flex items-center gap-2`}>
                                        <FaCalendarAlt className={`h-5 w-5 ${theme.highlightTertiary}`} />
                                        Challenge Calendar
                                    </h3>

                                    {isLoadingDailyChallengeHistory ? (
                                        <div className="text-center py-8">
                                            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-${theme.highlightTertiary.replace('text-', '').replace('-400', '-400')} mx-auto`}></div>
                                            <p className={`${theme.cardText} mt-3 text-sm`}>Loading calendar...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center justify-between w-full mb-6">
                                                <button
                                                    onClick={goToPreviousMonth}
                                                    className={`p-3 rounded-xl ${theme.cardBg}/50 ${theme.cardText} hover:${theme.cardBg} hover:${theme.text} transition-all duration-200`}
                                                >
                                                    <FaChevronLeft className="w-4 h-4" />
                                                </button>
                                                <span className={`text-xl font-bold bg-gradient-to-r from-${theme.highlightTertiary.replace('text-', '').replace('-400', '-400')} to-${theme.highlightSecondary.replace('text-', '').replace('-400', '-400')} bg-clip-text `}>
                                                    {getMonthName(currentMonth)}
                                                </span>
                                                <button
                                                    onClick={goToNextMonth}
                                                    className={`p-3 rounded-xl ${theme.cardBg}/50 ${theme.cardText} hover:${theme.cardBg} hover:${theme.text} transition-all duration-200`}
                                                >
                                                    <FaChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-7 gap-2 w-full">
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                                    <div key={day} className={`font-bold text-center ${theme.cardText} text-sm py-2`}>
                                                        {day}
                                                    </div>
                                                ))}
                                                {calendarDays.map((dayData, index) => {
                                                    let dayClasses = "relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 text-sm font-semibold";
                                                    let isDayClickable = false;

                                                    if (!dayData) {
                                                        dayClasses += " opacity-30 pointer-events-none";
                                                    } else if (dayData.isCurrentDay) {
                                                        if (dayData.hasChallenge) {
                                                            dayClasses += " bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg";
                                                            isDayClickable = true;
                                                        } else {
                                                            dayClasses += " bg-gray-700/50 text-gray-400 opacity-50 pointer-events-none";
                                                        }
                                                    } else if (dayData.hasChallenge && dayData.isSolvedByUser) {
                                                        dayClasses += " bg-gradient-to-br from-emerald-800/80 to-green-500/80 text-white shadow-lg";
                                                        isDayClickable = true;
                                                    } else if (dayData.hasChallenge && !dayData.isFuture) {
                                                        dayClasses += " bg-gray-700/80 text-gray-300 hover:bg-gray-600/80";
                                                        isDayClickable = true;
                                                    } else {
                                                        dayClasses += " bg-gray-800/30 text-gray-500 pointer-events-none opacity-50";
                                                    }

                                                    if (isDayClickable) {
                                                        dayClasses += " cursor-pointer hover:scale-110 transform";
                                                    }

                                                    return (
                                                        <div
                                                            key={index}
                                                            className={dayClasses}
                                                            onClick={() => handleDateClick(dayData)}
                                                        >
                                                            {dayData ? (
                                                                <>
                                                                    {dayData.hasChallenge && dayData.isSolvedByUser && (
                                                                        <FaFire className="absolute inset-0 m-auto text-2xl opacity-80 text-red-500" />
                                                                    )}
                                                                    <span className="relative z-10">{dayData.date.getDate()}</span>
                                                                    {dayData.hasChallenge && !dayData.isFuture && !dayData.isSolvedByUser && (
                                                                        <div className="absolute -bottom-1 -right-1">
                                                                            <LuDot className="text-red-400 text-xl" title="Not Solved" />
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                ''
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Enhanced My Playlists Section */}
                            {user && (
                                <div className={`${sectionClasses} p-6`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`font-bold text-lg flex items-center gap-2`}>
                                            <FaFolderOpen className={`h-5 w-5 ${theme.warningColor}`} />
                                            My Playlists
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {user?.isPremium && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold bg-${theme.warningColor.replace('text-', '').replace('-400', '-500/20')} ${theme.text} ${theme.warningColor} flex items-center gap-1`}>
                                                    <FaStar className="w-3 h-3" />
                                                    Pro
                                                </span>
                                            )}
                                            <span className={`${theme.iconBg} ${theme.highlight} px-2 py-1 rounded-full text-xs font-bold`}>
                                                {userPlaylists.length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="min-h-[200px]">
                                        {user?.isPremium ? (
                                            <>
                                                <button
                                                    onClick={() => setShowCreatePlaylistModal(true)}
                                                    className={`w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-${highlightColor}-500/20 to-${primaryColor}-500/20 border border-${highlightColor}-500/30 ${theme.highlight} rounded-xl hover:from-${highlightColor}-500/30 hover:to-${primaryColor}-500/30 hover:border-${highlightColor}-500/50 transition-all duration-300 font-semibold shadow-lg hover:shadow-${highlightColor}-500/10 mb-4`}
                                                >
                                                    <FaPlus className="h-4 w-4" />
                                                    Create New Playlist
                                                </button>
                                                {loadingPlaylists ? (
                                                    <div className="flex items-center justify-center h-32">
                                                        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-${highlightColor}-400`}></div>
                                                    </div>
                                                ) : userPlaylists.length > 0 ? (
                                                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                                        {userPlaylists.map(playlist => (
                                                            <div key={playlist._id} className={`flex items-center justify-between px-4 py-3 ${theme.cardBg}/50 hover:${theme.cardBg} rounded-xl border ${theme.border} hover:border-${theme.cardText.replace('text-', '').replace('-300', '-600/50')} transition-all duration-300 shadow-sm hover:shadow-md`}>
                                                                <Link
                                                                    to={`/playlist/${playlist._id}`}
                                                                    className={`${theme.text} font-semibold hover:${theme.highlight} transition-colors duration-200 flex-1 truncate`}
                                                                >
                                                                    {playlist.name}
                                                                    <span className={`text-xs ${theme.cardText} ml-2`}>
                                                                        ({playlist.problems.length} problems)
                                                                    </span>
                                                                </Link>
                                                                <div className="dropdown dropdown-end relative">
                                                                    <button
                                                                        tabIndex={0}
                                                                        className={`${theme.cardText} hover:${theme.highlight} p-2 rounded-lg hover:${theme.cardBg}/50 transition-all duration-200`}
                                                                        title="Manage Playlist"
                                                                    >
                                                                        <FaEllipsisV className="w-4 h-4" />
                                                                    </button>
                                                                    <ul tabIndex={0} className={`dropdown-content z-[100] menu p-2 shadow-2xl ${theme.cardBg} rounded-xl w-40 border ${theme.border} absolute top-full right-0 mt-1`}>
                                                                        <li>
                                                                            <a
                                                                                onClick={() => {
                                                                                    setSelectedPlaylistToManage(playlist);
                                                                                    setShowUpdatePlaylistModal(true);
                                                                                }}
                                                                                className={`${theme.text} hover:${theme.infoColor} hover:bg-${theme.infoColor.replace('text-', '').replace('-400', '-500/10')}`}
                                                                            >
                                                                                <FaEdit className="w-4 h-4" /> Edit
                                                                            </a>
                                                                        </li>
                                                                        <li>
                                                                            <a
                                                                                onClick={() => handleDeletePlaylistClick(playlist._id)}
                                                                                className={`${theme.errorColor} hover:${theme.errorColor.replace('-400', '-300')} hover:bg-${theme.errorColor.replace('text-', '').replace('-400', '-500/10')}`}
                                                                            >
                                                                                <FaTrash className="w-4 h-4" /> Delete
                                                                            </a>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center h-32 text-center">
                                                        <div>
                                                            <FaFolderOpen className={`h-12 w-12 ${theme.cardText} mx-auto mb-3`} />
                                                            <p className={`${theme.cardText} text-sm`}>No playlists yet</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-40 text-center gap-4">
                                                <div className={`p-4 rounded-full bg-${theme.warningColor.replace('text-', '').replace('-400', '-500/10')}`}>
                                                    <FaLock className={`h-8 w-8 ${theme.warningColor}`} />
                                                </div>
                                                <div>
                                                    <h4 className={`font-semibold ${theme.text} mb-2`}>Unlock Premium Playlists</h4>
                                                    <p className={`${theme.cardText} text-sm mb-4`}>
                                                        Create custom playlists and organize your practice sessions
                                                    </p>
                                                </div>
                                                <Link
                                                    to="/premium"
                                                    className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-${theme.warningColor.replace('text-', '').replace('-400', '-500')} to-${theme.warningColor.replace('text-', '').replace('-400', '-600')} hover:from-${theme.warningColor.replace('text-', '').replace('-400', '-600')} hover:to-${theme.warningColor.replace('text-', '').replace('-400', '-700')} text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-${theme.warningColor.replace('text-', '').replace('-400', '-500/25')}`}
                                                >
                                                    <FaStar className="mr-2 h-4 w-4" />
                                                    Go Premium
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Recently Viewed Problems */}
                            <div className={`${sectionClasses} p-6`}>
                                <h3 className={`font-bold text-lg mb-4 flex items-center gap-2`}>
                                    <FaHistory className={`h-5 w-5 ${theme.successColor}`} />
                                    Recently Viewed
                                </h3>
                                <div className="space-y-3">
                                    {recentlyViewed.length > 0 ? (
                                        recentlyViewed.map(problem => (
                                            <Link
                                                key={problem._id}
                                                to={`/codefield/${problem._id}`}
                                                onClick={() => updateRecentlyViewed(problem._id)}
                                                className={`block px-4 py-3 ${theme.cardBg}/50 hover:${theme.cardBg} rounded-xl border ${theme.border} hover:border-${theme.cardText.replace('text-', '').replace('-300', '-600/50')} transition-all duration-300 shadow-sm hover:shadow-md group`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`${theme.text} font-medium truncate group-hover:${theme.highlight} transition-colors duration-200`}>
                                                        {problem.title}
                                                    </span>
                                                    {difficultyPill(problem.difficulty)}
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-24 text-center">
                                            <div>
                                                <FaHistory className={`h-8 w-8 ${theme.cardText} mx-auto mb-2`} />
                                                <p className={`${theme.cardText} text-sm`}>No recently viewed problems</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Main Content */}
                    <div className="flex-1">
                        {/* Enhanced Header Section */}
                        <div className={`mb-8 ${sectionClasses} p-8`}>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div>
                                    <h1 className={`text-4xl font-bold bg-gradient-to-r from-${highlightColor}-400 via-${primaryColor}-400 to-${theme.highlightTertiary.replace('text-', '').replace('-400', '-400')} bg-clip-text mb-2`}>
                                        Problem Archive
                                    </h1>
                                    <div className={`flex items-center gap-4 text-sm ${theme.cardText}`}>
                                        <span className="flex items-center gap-1">
                                            <FaBullseye className={`w-4 h-4 ${theme.highlight}`} />
                                            <span className={`font-semibold ${theme.text}`}>{filteredProblems.length}</span> problems
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <BiTrendingUp className={`w-4 h-4 ${theme.successColor}`} />
                                            <span className={`font-semibold ${theme.text}`}>{problemStats.solved}</span> solved
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FaBolt className={`w-4 h-4 ${theme.warningColor}`} />
                                            <span className={`font-semibold ${theme.text}`}>{userCurrentStreak}</span> day streak
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={getRandomProblem}
                                        className={`px-6 py-3 bg-gradient-to-r from-${theme.highlightTertiary.replace('text-', '').replace('-400', '-500')} to-${theme.highlightSecondary.replace('text-', '').replace('-400', '-600')} hover:from-${theme.highlightTertiary.replace('text-', '').replace('-400', '-600')} hover:to-${theme.highlightSecondary.replace('text-', '').replace('-400', '-700')} text-white rounded-xl transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-${theme.highlightTertiary.replace('text-', '').replace('-400', '-500/25')} transform hover:scale-105`}
                                        title="Random Problem"
                                    >
                                        <FaRandom className="h-4 w-4" />
                                        Random
                                    </button>
                                    <div className={`flex items-center ${theme.cardBg}/50 rounded-xl p-1 border ${theme.border}`}>
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`p-3 rounded-lg transition-all duration-200 ${viewMode === 'table'
                                                ? `${theme.iconBg} ${theme.highlight} shadow-sm`
                                                : `${theme.cardText} hover:${theme.highlight} hover:${theme.cardBg}/50`
                                                }`}
                                            title="Table View"
                                        >
                                            <FaList className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('card')}
                                            className={`p-3 rounded-lg transition-all duration-200 ${viewMode === 'card'
                                                ? `${theme.iconBg} ${theme.highlight} shadow-sm`
                                                : `${theme.cardText} hover:${theme.highlight} hover:${theme.cardBg}/50`
                                                }`}
                                            title="Card View"
                                        >
                                            <FaThLarge className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                        className={`xl:hidden p-3 ${theme.cardBg}/50 ${theme.cardText} rounded-xl hover:${theme.cardBg} hover:${theme.text} transition-all duration-200 border ${theme.border}`}
                                        title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Filters Section */}
                        <div className={`mb-8 ${sectionClasses} p-6`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className={`font-bold text-lg flex items-center gap-2`}>
                                    <FaFilter className={`h-5 w-5 ${theme.infoColor}`} />
                                    Filters & Search
                                </h3>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`${theme.highlight} hover:${theme.highlight.replace('-400', '-300')} font-semibold transition-colors duration-200 flex items-center gap-2`}
                                >
                                    {showFilters ? 'Hide' : 'Show'} Filters
                                    <FaFilter className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Enhanced Search Bar */}
                            <div className="relative mb-6 group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaSearch className={`${theme.cardText} group-focus-within:${theme.highlight} transition-colors duration-200`} />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`block w-full pl-12 pr-4 py-4 ${theme.cardBg}/50 border ${theme.border} ${theme.text} rounded-2xl focus:outline-none focus:ring-2 focus:ring-${highlightColor}-500/50 focus:border-${highlightColor}-500/50 transition-all duration-300 shadow-inner placeholder-${theme.cardText.replace('text-', '').replace('-300', '-400')}`}
                                    placeholder="Search problems by title, tags, or description..."
                                />
                            </div>

                            {/* Enhanced Filter Controls */}
                            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'} transition-all duration-300`}>
                                <select
                                    value={difficultyFilter}
                                    onChange={(e) => setDifficultyFilter(e.target.value)}
                                    className={`px-4 py-3 ${theme.cardBg}/50 border ${theme.border} ${theme.text} rounded-xl focus:outline-none focus:ring-2 focus:ring-${highlightColor}-500/50 focus:border-${highlightColor}-500/50 transition-all duration-200 appearance-none cursor-pointer`}
                                >
                                    <option value="All">All Difficulties</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className={`px-4 py-3 ${theme.cardBg}/50 border ${theme.border} ${theme.text} rounded-xl focus:outline-none focus:ring-2 focus:ring-${highlightColor}-500/50 focus:border-${highlightColor}-500/50 transition-all duration-200 appearance-none cursor-pointer`}
                                >
                                    <option value="All">All Status</option>
                                    <option value="solved">Solved</option>
                                    <option value="attempted">Attempted</option>
                                    <option value="none">Not Attempted</option>
                                </select>

                                <select
                                    value={tagFilter}
                                    onChange={(e) => setTagFilter(e.target.value)}
                                    className={`px-4 py-3 ${theme.cardBg}/50 border ${theme.border} ${theme.text} rounded-xl focus:outline-none focus:ring-2 focus:ring-${highlightColor}-500/50 focus:border-${highlightColor}-500/50 transition-all duration-200 appearance-none cursor-pointer`}
                                >
                                    <option value="All">All Tags</option>
                                    {allTags.map(tag => (
                                        <option key={tag} value={tag}>{capitalizeFirstLetter(tag)}</option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleResetFilters}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 ${theme.cardBg}/50 border ${theme.border} ${theme.cardText} rounded-xl hover:${theme.cardBg} hover:${theme.text} hover:border-${theme.cardText.replace('text-', '').replace('-300', '-600/50')} transition-all duration-200 font-semibold`}
                                >
                                    <FaUndo className="h-4 w-4" />
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Enhanced Problem Display */}
                        {viewMode === 'table' ? (
                            <div className={`${sectionClasses} overflow-hidden`}>
                                <div className="overflow-x-auto">
                                    <table className={`min-w-full divide-y divide-${theme.border.replace('border-', '').replace('-700', '-700/50')}`}>
                                        <thead className={`${theme.cardBg}/30`}>
                                            <tr>
                                                <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${theme.cardText} uppercase tracking-wider`}>
                                                    Status
                                                </th>
                                                <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${theme.cardText} uppercase tracking-wider`}>
                                                    <button
                                                        onClick={() => handleSort('title')}
                                                        className={`flex items-center gap-2 hover:${theme.highlight} transition-colors duration-200`}
                                                    >
                                                        Title {getSortIcon('title')}
                                                    </button>
                                                </th>
                                                <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${theme.cardText} uppercase tracking-wider`}>
                                                    Tags
                                                </th>
                                                <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${theme.cardText} uppercase tracking-wider`}>
                                                    <button
                                                        onClick={() => handleSort('difficulty')}
                                                        className={`flex items-center gap-2 hover:${theme.highlight} transition-colors duration-200`}
                                                    >
                                                        Difficulty {getSortIcon('difficulty')}
                                                    </button>
                                                </th>
                                                {user?.isPremium && (
                                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${theme.cardText} uppercase tracking-wider`}>
                                                        Actions
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y divide-${theme.border.replace('border-', '').replace('-700', '-700/30')}`}>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={user?.isPremium ? "5" : "4"} className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${highlightColor}-400`}></div>
                                                            <p className={`mt-4 ${theme.cardText}`}>Loading problems...</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : currentProblems.length > 0 ? (
                                                currentProblems.map((problem) => (
                                                    <tr key={problem._id} className={`hover:${theme.cardBg}/30 transition-all duration-200 group`}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            {statusIcon(problem.status)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <Link
                                                                    to={`/codefield/${problem._id}`}
                                                                    onClick={() => updateRecentlyViewed(problem._id)}
                                                                    className={`${theme.highlight} hover:${theme.highlight.replace('-400', '-300')} transition-colors duration-200 font-semibold`}
                                                                >
                                                                    {problem.title}
                                                                </Link>
                                                                {problem.premium && (
                                                                    <div className="flex items-center gap-1">
                                                                        <FaLock className={`h-3 w-3 ${theme.warningColor}`} />
                                                                        <span className={`text-xs bg-${theme.warningColor.replace('text-', '').replace('-400', '-500/20')} ${theme.warningColor} px-2 py-1 rounded-full font-semibold`}>
                                                                            Pro
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                {problem.tags?.slice(0, 2).map(tag => (
                                                                    <span
                                                                        key={tag}
                                                                        className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${theme.iconBg} ${theme.highlight} border border-${highlightColor}-500/20`}
                                                                    >
                                                                        {capitalizeFirstLetter(tag)}
                                                                    </span>
                                                                ))}
                                                                {problem.tags?.length > 2 && (
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${theme.cardBg}/50 ${theme.cardText} border ${theme.border}`}>
                                                                        +{problem.tags.length - 2}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {difficultyPill(problem.difficulty)}
                                                        </td>
                                                        {user?.isPremium && (
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedProblemForPlaylist(problem);
                                                                        setShowAddProblemToPlaylistModal(true);
                                                                    }}
                                                                    className={`p-2 rounded-xl ${theme.cardBg}/50 border ${theme.border} ${theme.cardText} hover:${theme.cardBg} hover:${theme.highlight} hover:border-${highlightColor}-500/50 transition-all duration-200`}
                                                                    title="Add to Playlist"
                                                                >
                                                                    <FaPlus className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={user?.isPremium ? "5" : "4"} className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <FaSearch className={`h-16 w-16 ${theme.cardText}`} />
                                                            <div className="text-center">
                                                                <p className={`text-lg font-semibold ${theme.cardText} mb-2`}>No problems found</p>
                                                                <p className={theme.cardText}>Try adjusting your search criteria</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {loading ? (
                                    <div className="col-span-full flex justify-center py-12">
                                        <div className="flex flex-col items-center">
                                            <div className={`animate-spin rounded-full h-16 w-16 border-b-2 border-${highlightColor}-400`}></div>
                                            <p className={`mt-4 ${theme.cardText} text-lg`}>Loading problems...</p>
                                        </div>
                                    </div>
                                ) : currentProblems.length > 0 ? (
                                    currentProblems.map(renderProblemCard)
                                ) : (
                                    <div className="col-span-full flex flex-col items-center gap-6 py-16">
                                        <FaSearch className={`h-20 w-20 ${theme.cardText}`} />
                                        <div className="text-center">
                                            <p className={`text-2xl font-bold ${theme.cardText} mb-2`}>No problems found</p>
                                            <p className={`${theme.cardText} text-lg`}>Try adjusting your search criteria</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Enhanced Pagination */}
                        {totalPages > 1 && (
                            <div className={`mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${sectionClasses} p-6`}>
                                <div className={theme.cardText}>
                                    Page <span className={`font-bold ${theme.text}`}>{(currentPage)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 ${theme.cardBg}/50 border ${theme.border} rounded-xl ${theme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${theme.cardBg} hover:${theme.text} hover:border-${theme.cardText.replace('text-', '').replace('-300', '-600/50')} transition-all duration-200 font-semibold`}
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {pageNumbers.map((page, index) => (
                                            page === '...' ? (
                                                <span key={`ellipsis-${index}`} className={`px-3 py-2 ${theme.cardText}`}>...</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${currentPage === page
                                                        ? `bg-gradient-to-r from-${highlightColor}-500 to-${primaryColor}-600 text-white shadow-lg`
                                                        : `${theme.cardBg}/50 ${theme.cardText} hover:${theme.cardBg} hover:${theme.text} border ${theme.border} hover:border-${theme.cardText.replace('text-', '').replace('-300', '-600/50')}`
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 ${theme.cardBg}/50 border ${theme.border} rounded-xl ${theme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${theme.cardBg} hover:${theme.text} hover:border-${theme.cardText.replace('text-', '').replace('-300', '-600/50')} transition-all duration-200 font-semibold`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreatePlaylistModal
                isOpen={showCreatePlaylistModal}
                onClose={() => setShowCreatePlaylistModal(false)}
                onCreate={handleCreatePlaylist}
                appTheme={theme}
            />
            <AddProblemToPlaylistModal
                isOpen={showAddProblemToPlaylistModal}
                onClose={() => setShowAddProblemToPlaylistModal(false)}
                problem={selectedProblemForPlaylist}
                userPlaylists={userPlaylists}
                onCreatePlaylist={() => setShowCreatePlaylistModal(true)}
                onAddProblem={handleAddProblemToPlaylist}
                appTheme={theme}
            />
            <UpdatePlaylistModal
                isOpen={showUpdatePlaylistModal}
                onClose={() => setShowUpdatePlaylistModal(false)}
                playlist={selectedPlaylistToManage}
                onUpdate={handleUpdatePlaylist}
                appTheme={theme}
            />
            <ConfirmationModal
                isOpen={showConfirmDeleteModal}
                onClose={() => setShowConfirmDeleteModal(false)}
                onConfirm={confirmDeletePlaylist}
                title="Confirm Playlist Deletion"
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                appTheme={theme}
            >
                <p>Are you sure you want to delete this playlist? This action cannot be undone, and all problems in this playlist will be removed from it.</p>
            </ConfirmationModal>
            <DailyChallengeDetailsModal
                isOpen={showDailyChallengeDetailsModal}
                onClose={() => setShowDailyChallengeDetailsModal(false)}
                challengeDetails={selectedDailyChallengeProblem}
                appTheme={theme}
                updateRecentlyViewed={updateRecentlyViewed}
            />
        </div>
    );
};

export default ProblemPage;
