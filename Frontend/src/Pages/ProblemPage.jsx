import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
    FaFire, FaRandom, FaSortUp, FaSort,
    FaRocket, FaLock, FaThLarge, FaList, FaHistory,
    FaSortDown, FaPlus, FaFolderOpen, FaStar,
    FaEllipsisV, FaEdit, FaTrash, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

// Corrected import path for DailyChallengeDetailsModal
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

const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonPrimary: 'bg-indigo-600', buttonPrimaryHover: 'bg-indigo-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
    accent: 'bg-cyan-500',
};

// Calendar Helper Functions
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday
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
    const problemsPerPage = 12;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Daily Challenge States (for the currently active challenge)
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [isDailyChallengeLoading, setIsDailyChallengeLoading] = useState(true);
    const [alreadySolvedToday, setAlreadySolvedToday] = useState(false);
    const [userCurrentStreak, setUserCurrentStreak] = useState(0);

    // NEW Daily Challenge Calendar States
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

    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };

    const getAccentColorBase = () => {
        const accentColorClass = theme.accent || theme.buttonPrimary;
        const match = accentColorClass.match(/bg-(\w+)-\d+/);
        return match ? match[1] : 'blue';
    };

    const sectionClasses = `backdrop-blur-xl border ${theme.border}/20 shadow-xl rounded-xl`;

    // Fetch all problems
    useEffect(() => {
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
            } catch (err) {
                console.error("Error fetching problems:", err);
                setProblems([]);
                setRecentlyViewed([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, [user]);

    // Update recently viewed when navigating to a problem
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


    // Fetch Daily Challenge (Current Day)
    useEffect(() => {
        const fetchDailyChallenge = async () => {
            if (!user) {
                setIsDailyChallengeLoading(false);
                return;
            }
            setIsDailyChallengeLoading(true);
            try {
                const res = await axiosClient.get('/problem/daily');
                setDailyChallenge(res.data.challenge);
                setAlreadySolvedToday(res.data.alreadySolved);
                setUserCurrentStreak(res.data.streak);
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
    }, [user]);

    // NEW: Fetch all daily challenges for calendar (from the new endpoint)
    useEffect(() => {
        const fetchDailyChallengeData = async () => {
            if (!user) {
                setIsLoadingDailyChallengeHistory(false);
                setDailyChallengeCalendarData([]);
                return;
            }
            setIsLoadingDailyChallengeHistory(true);
            try {
                const { data } = await axiosClient.get('/problem/daily/calendar'); // Call the new endpoint
                setDailyChallengeCalendarData(data);
            } catch (err) {
                console.error("Error fetching daily challenge calendar data:", err);
                setDailyChallengeCalendarData([]);
            } finally {
                setIsLoadingDailyChallengeHistory(false);
            }
        };
        fetchDailyChallengeData();
    }, [user]); // Rerun when user changes


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
        fetchUserPlaylists();
    }, [fetchUserPlaylists]);


    // Handle Create Playlist
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

    // Handle Add Problem to Playlist
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

    // NEW: Handle Update Playlist
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
        const colors = {
            easy: `${theme.iconBg} ${theme.highlightSecondary} border ${theme.highlightSecondary.replace('text-', 'border-')}/40`,
            medium: `${theme.iconBg} ${theme.highlightTertiary} border ${theme.highlightTertiary.replace('text-', 'border-')}/40`,
            hard: `${theme.iconBg} ${theme.highlight} border ${theme.highlight.replace('text-', 'border-')}/40`,
        };
        const defaultColor = `bg-gray-700 text-gray-300 border border-gray-600`;

        return (
            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${colors[difficulty.toLowerCase()] || defaultColor}`}>
                {capitalizeFirstLetter(difficulty)}
            </span>
        );
    };

    const statusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'solved': return <FaCheck className={`h-4 w-4 ${theme.successColor}`} title="Solved" />;
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
        <div key={problem._id} className={`${theme.cardBg} rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border ${theme.border}/30 overflow-hidden group transform hover:scale-[1.01]`}>
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {statusIcon(problem.status)}
                        <Link
                            to={`/codefield/${problem._id}`}
                            onClick={() => updateRecentlyViewed(problem._id)}
                            className={`text-lg font-semibold ${theme.text} hover:${theme.highlightSecondary} transition-colors duration-200`}
                        >
                            {problem.title}
                        </Link>
                        {problem.premium && <FaLock className={`h-4 w-4 ${theme.warningColor}`} title="Premium" />}
                    </div>
                    {user?.isPremium && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProblemForPlaylist(problem);
                                setShowAddProblemToPlaylistModal(true);
                            }}
                            className={`p-2 rounded-lg ${theme.cardBg}/50 border ${theme.border}/50 ${theme.cardText} hover:${theme.cardBg}/80 hover:${theme.highlight} transition-colors duration-200`}
                            title="Add to Playlist"
                        >
                            <FaPlus className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {problem.tags?.slice(0, 4).map(tag => (
                        <span
                            key={tag}
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${theme.iconBg} ${theme.highlightSecondary} border ${getAccentColorBase().replace('bg-', 'border-')}-500/20`}
                        >
                            {capitalizeFirstLetter(tag)}
                        </span>
                    ))}
                    {problem.tags?.length > 4 && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${theme.cardBg} ${theme.cardText} border ${theme.border}`}>
                            +{problem.tags.length - 4}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    {difficultyPill(problem.difficulty)}
                </div>
            </div>
        </div>
    );

    // Memoize the calendar data for the current month
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const numDays = getDaysInMonth(year, month);
        const firstDayIndex = getFirstDayOfMonth(year, month); // 0 = Sunday, 1 = Monday

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
                isSolvedByUser: challengeForDay ? challengeForDay.isSolved : false, // IsSolved specifically by THIS user
                isFuture: date.getTime() > today.getTime()
            });
        }

        // Add trailing nulls to fill the grid (e.g., to 6 rows = 42 cells)
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
        // and is clickable (i.e., not a future date that's not today)
        if (dayData && dayData.hasChallenge && !dayData.isFuture || dayData?.isCurrentDay) {
            setSelectedDailyChallengeProblem(dayData.challengeDetails);
            setShowDailyChallengeDetailsModal(true);
        }
    };


    return (
        <div className={`min-h-screen relative overflow-hidden ${theme.text} bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo}`}>
            <div className={`absolute top-0 left-0 w-80 h-80 ${theme.primary.replace('bg-', 'bg-')}/5 rounded-full blur-3xl translate-x-[-20%] translate-y-[-20%] animate-blob`}></div>
            <div className={`absolute bottom-0 right-0 w-96 h-96 ${theme.secondary.replace('bg-', 'bg-')}/5 rounded-full blur-3xl translate-x-[20%] translate-y-[20%] animate-blob animation-delay-2000`}></div>
            <div className={`absolute top-1/2 left-1/2 w-60 h-60 ${theme.highlight.replace('text-', 'bg-')}/5 rounded-full blur-3xl -translate-x-1/2 -translate-x-1/2 animate-blob animation-delay-4000`}></div>


            <Header />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className={`lg:w-80 flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
                        <div className="space-y-6">
                            {/* Daily Challenge Section - Current Day */}
                            <div className={`${sectionClasses} p-6 relative overflow-hidden`}>
                                {isDailyChallengeLoading ? (
                                    <div className="text-center">
                                        <LoadingSpinner />
                                        <p className={`${theme.cardText} mt-4`}>Loading today's challenge...</p>
                                    </div>
                                ) : dailyChallenge ? (
                                    <>
                                        <div className={`absolute top-0 left-0 w-24 h-24 ${theme.highlight.replace('text-', 'bg-')}/10 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2`}></div>
                                        <div className={`absolute bottom-0 right-0 w-32 h-32 ${theme.highlightSecondary.replace('text-', 'bg-')}/10 rounded-full blur-xl translate-x-1/2 -translate-y-1/2`}></div>

                                        <div className="relative z-10">
                                            <div className="flex items-center mb-4 gap-2">
                                                <FaCalendarAlt className={`h-6 w-6 ${theme.highlightTertiary}`} />
                                                <h2 className={`text-xl font-bold bg-gradient-to-r ${theme.primary} ${theme.highlight} bg-clip-text text-transparent`}>
                                                    Today's Challenge
                                                </h2>
                                            </div>

                                            <div className="mb-4">
                                                <h3 className={`text-lg font-semibold ${theme.text} mb-2`}>
                                                    {dailyChallenge.title}
                                                </h3>
                                                {difficultyPill(dailyChallenge.difficulty)}
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {dailyChallenge.tags?.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${theme.iconBg} ${theme.highlightSecondary} border ${getAccentColorBase()}-500/20`}
                                                        >
                                                            {capitalizeFirstLetter(tag)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {user && (
                                                <div className="flex flex-col items-start mb-4 gap-2">
                                                    <span className={`${theme.cardText} text-sm flex items-center gap-1`}>
                                                        <FaFire className="text-orange-500" /> Current Streak: <span className={`${theme.highlight} font-bold`}>{userCurrentStreak} {userCurrentStreak === 1 ? 'day' : 'days'}</span>
                                                    </span>
                                                    {alreadySolvedToday ? (
                                                        <span className={`${theme.successColor} flex items-center gap-1`}>
                                                            <FaCheck /> Solved Today!
                                                        </span>
                                                    ) : (
                                                        <span className={`${theme.warningColor} flex items-center gap-1`}>
                                                            <FaClock /> Not Solved Yet
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <Link
                                                to={`/codefield/${dailyChallenge._id}`}
                                                onClick={() => updateRecentlyViewed(dailyChallenge._id)}
                                                className={`inline-flex items-center px-6 py-3 ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} rounded-lg transition-all duration-200 font-medium transform shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500 focus:ring-opacity-50`}
                                            >
                                                <FaRocket className="mr-2 h-4 w-4" />
                                                Go to Challenge
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <p className={`${theme.cardText}`}>No daily challenge available for today. Check back tomorrow!</p>
                                    </div>
                                )}
                            </div>

                            {/* Daily Challenge Calendar Section */}
                            {user && (
                                <div className={`${sectionClasses} p-6`}>
                                    <h3 className={`font-semibold text-lg mb-4 ${theme.text} flex items-center gap-2`}>
                                        <FaCalendarAlt className={`h-5 w-5 ${theme.highlightTertiary}`} />
                                        Daily Challenge Calendar
                                    </h3>

                                    {isLoadingDailyChallengeHistory ? (
                                        <div className="text-center py-6">
                                            <LoadingSpinner />
                                            <p className={`${theme.cardText} mt-2`}>Loading calendar...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center justify-between w-full mb-4">
                                                <button onClick={goToPreviousMonth} className={`p-2 rounded-full ${theme.cardBg}/50 ${theme.text} hover:${theme.cardBg}/80 transition-colors`}>
                                                    <FaChevronLeft />
                                                </button>
                                                <span className={`text-xl font-semibold ${theme.highlight}`}>{getMonthName(currentMonth)}</span>
                                                <button onClick={goToNextMonth} className={`p-2 rounded-full ${theme.cardBg}/50 ${theme.text} hover:${theme.cardBg}/80 transition-colors`}>
                                                    <FaChevronRight />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-7 gap-1 text-center w-full max-w-sm">
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                                    <div key={day} className={`font-semibold ${theme.cardText} text-sm py-2`}>{day}</div>
                                                ))}
                                                {calendarDays.map((dayData, index) => {
                                                    let dayClasses = `relative w-9 h-9 sm:w-10 sm:h-10 flex flex-col items-center justify-center rounded-lg transition-colors duration-200 group overflow-hidden`;
                                                    let isDayClickable = false; // Flag to control cursor and hover

                                                    if (!dayData) {
                                                        dayClasses += ' opacity-30 pointer-events-none'; // Empty cells
                                                    } else if (dayData.isCurrentDay) {
                                                        // Today's challenge - always highlighted if it exists
                                                        dayClasses += ` ${theme.successColor.replace('text-', 'bg-')} ${theme.buttonText} font-bold`;
                                                        isDayClickable = true;
                                                    } else if (dayData.hasChallenge && dayData.isSolvedByUser) {
                                                        // Past challenge solved by the user
                                                        dayClasses += `  border-orange-500/50 ${theme.text}`;
                                                        isDayClickable = true;
                                                    } else if (dayData.hasChallenge && !dayData.isFuture) {
                                                        // Past challenge NOT solved by user (still clickable to view details)
                                                        dayClasses += ` ${theme.cardBg}/30 ${theme.cardText}`; // Default look, no highlight
                                                        isDayClickable = true;
                                                    } else {
                                                        // Any other day: no special highlight, not clickable. This includes:
                                                        // - Future challenges (whether set by admin or not)
                                                        // - Past/current dates with no challenge ever set
                                                        dayClasses += ` ${theme.cardBg}/30 ${theme.cardText} pointer-events-none opacity-50`;
                                                    }

                                                    // Apply clickable styles only if determined to be clickable
                                                    if (isDayClickable) {
                                                        dayClasses += ` cursor-pointer hover:${theme.cardBg}/50`;
                                                    }

                                                    return (
                                                        <div
                                                            key={index}
                                                            className={dayClasses}
                                                            onClick={() => handleDateClick(dayData)}
                                                        >
                                                            {dayData ? (
                                                                <>
                                                                    {/* Background Icon: Only show for dates that are solved by the user or is today's challenge */}
                                                                    {(dayData.isSolvedByUser) && (
                                                                        <FaFire className={`absolute inset-1 m-auto text-4xl opacity-50 text-orange-500`} />

                                                                    )}

                                                                    <span className="relative z-10 text-sm">{dayData.date.getDate()}</span>

                                                                    {/* Small dot for past unsolved challenges that *had* a challenge */}
                                                                    {dayData.hasChallenge  && (
                                                                        <div className="absolute bottom-1 right-1 text-xs">
                                                                            <span className={`w-1.5 h-1.5 rounded-full ${theme.errorColor.replace('text-', 'bg-')}`} title="Not Solved"></span>
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

                            {/* My Playlists Section */}
                            {user && (
                                <div className={`${sectionClasses} p-6`}>
                                    <h3 className={`font-semibold text-lg mb-4 ${theme.text} flex items-center gap-2`}>
                                        <FaFolderOpen className={`h-5 w-5 ${theme.highlight}`} />
                                        My Playlists
                                        {user?.isPremium && (
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${theme.successColor.replace('text-', 'bg-')}/20 ${theme.successColor} flex items-center gap-1`} title="Premium Feature Unlocked">
                                                <FaStar className="w-3 h-3" /> Premium
                                            </span>
                                        )}
                                        <span className={`ml-auto ${theme.iconBg} ${theme.highlight} px-2 py-0.5 rounded-full text-xs font-bold`}>
                                            {userPlaylists.length}
                                        </span>
                                    </h3>

                                    <div className="min-h-[250px]">
                                        {user?.isPremium ? (
                                            <>
                                                <button
                                                    onClick={() => setShowCreatePlaylistModal(true)}
                                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 ${theme.cardBg}/50 border ${theme.border}/50 ${theme.text} rounded-lg hover:${theme.cardBg}/80 hover:${theme.highlight} transition-all duration-200 font-medium shadow-md hover:shadow-lg mb-4`}
                                                >
                                                    <FaPlus className="h-4 w-4" /> Create New Playlist
                                                </button>
                                                {loadingPlaylists ? (
                                                    <div className="flex items-center justify-center h-32">
                                                        <LoadingSpinner />
                                                    </div>
                                                ) : userPlaylists.length > 0 ? (
                                                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                                        {userPlaylists.map(playlist => (
                                                            <div key={playlist._id} className={`flex items-center justify-between px-4 py-3 ${theme.cardBg}/50 hover:${theme.cardBg}/80 rounded-lg border ${theme.border}/50 transition-colors duration-200 shadow-sm hover:shadow-md`}>
                                                                <Link
                                                                    to={`/playlist/${playlist._id}`}
                                                                    className={`${theme.text} truncate font-medium`}
                                                                >
                                                                    {playlist.name} ({playlist.problems.length})
                                                                </Link>
                                                                <div className="dropdown dropdown-end relative z-100">
                                                                    <button
                                                                        tabIndex={0}
                                                                        className={`${theme.cardText} hover:${theme.highlight} p-1 rounded-full`}
                                                                        title="Manage Playlist"
                                                                    >
                                                                        <FaEllipsisV className="w-4 h-4" />
                                                                    </button>
                                                                    <ul tabIndex={0} className={`dropdown-content z-[100] menu p-2 shadow-lg ${theme.cardBg} rounded-box w-40 border ${theme.border}/50 absolute top-full right-0 mt-1`}>
                                                                        <li>
                                                                            <a
                                                                                onClick={() => {
                                                                                    setSelectedPlaylistToManage(playlist);
                                                                                    setShowUpdatePlaylistModal(true);
                                                                                }}
                                                                                className={`${theme.text} hover:${theme.highlightSecondary}`}
                                                                            >
                                                                                <FaEdit className="w-4 h-4" /> Edit
                                                                            </a>
                                                                        </li>
                                                                        <li>
                                                                            <a
                                                                                onClick={() => handleDeletePlaylistClick(playlist._id)}
                                                                                className={`${theme.errorColor} hover:${theme.errorColor.replace('text-', 'bg-')}/20`}
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
                                                    <div className="flex items-center justify-center h-32">
                                                        <p className={`${theme.cardText} text-sm`}>You don't have any playlists yet.</p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-30 gap-4">
                                                <div className={`flex flex-col items-center mt-15 ${theme.text}`}>
                                                    <FaLock className={`h-30 w-14 ${theme.warningColor}`} />
                                                    <p className={`${theme.cardText} text-center`}>Unlock custom playlists and more premium features!</p>
                                                </div>
                                                <Link
                                                    to="/premium"
                                                    className={`inline-flex items-center px-6 py-3 ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500 focus:ring-opacity-50`}
                                                >
                                                    Go Premium
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* Recently Viewed Problems (unchanged) */}
                            <div className={`${sectionClasses} p-6`}>
                                <h3 className={`font-semibold text-lg mb-4 ${theme.text} flex items-center gap-2`}>
                                    <FaHistory className={`h-5 w-5 ${theme.highlightSecondary}`} />
                                    Recently Viewed
                                </h3>
                                <div className="space-y-3">
                                    {recentlyViewed.length > 0 ? (
                                        recentlyViewed.map(problem => (
                                            <Link
                                                key={problem._id}
                                                to={`/codefield/${problem._id}`}
                                                onClick={() => updateRecentlyViewed(problem._id)}
                                                className={`block px-4 py-3 ${theme.cardBg}/50 hover:${theme.cardBg}/80 rounded-lg border ${theme.border}/50 transition-colors duration-200 shadow-sm hover:shadow-md`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`${theme.text} truncate`}>{problem.title}</span>
                                                    {difficultyPill(problem.difficulty)}
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className={`${theme.cardText} text-sm`}>No recently viewed problems</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className={`mb-8 ${sectionClasses} p-6`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className={`text-3xl font-bold bg-gradient-to-r ${theme.primary} ${theme.highlight} bg-clip-text text-transparent `}>
                                        Problems
                                    </h1>
                                    <p className={`mt-1 ${theme.cardText}`}>
                                        Practice coding problems to improve your skills • <span className="font-semibold">{filteredProblems.length}</span> problems
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={getRandomProblem}
                                        className={`p-3 ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 hover:scale-[1.02] transform shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500 focus:ring-opacity-50`}
                                        title="Random Problem"
                                    >
                                        <FaRandom className="h-4 w-4" />
                                    </button>
                                    <div className={`${theme.cardBg}/50 rounded-lg p-1 border ${theme.border}/50 shadow-inner`}>
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'table'
                                                ? `${theme.primary}/20 ${theme.highlight} shadow-sm`
                                                : `${theme.cardText} hover:${theme.highlight} hover:${theme.iconBg}`
                                                }`}
                                            title="Table View"
                                        >
                                            <FaList className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('card')}
                                            className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'card'
                                                ? `${theme.primary}/20 ${theme.highlight} shadow-sm`
                                                : `${theme.cardText} hover:${theme.highlight} hover:${theme.iconBg}`
                                                }`}
                                            title="Card View"
                                        >
                                            <FaThLarge className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                        className={`lg:hidden p-2 ${theme.cardBg}/50 ${theme.cardText} rounded-lg hover:${theme.cardBg}/80 transition-colors duration-200 border ${theme.border}/50 hover:border-${getAccentColorBase()}-500/50`}
                                        title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={`mb-8 ${sectionClasses} p-6`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`font-semibold text-lg ${theme.text} flex items-center gap-2`}>
                                    <FaFilter className={`h-5 w-5 ${theme.highlight}`} />
                                    Filters & Search
                                </h3>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`${theme.highlight} hover:${theme.highlightSecondary} font-medium transition-colors duration-200`}
                                >
                                    {showFilters ? 'Hide' : 'Show'} Filters
                                </button>
                            </div>

                            <div className="relative mb-4">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaSearch className={`${theme.cardText}`} />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`block w-full pl-11 pr-4 py-3 ${theme.cardBg}/50 border ${theme.border}/50 ${theme.text} rounded-xl focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500/50 focus:border-transparent transition-all duration-200 shadow-inner`}
                                    placeholder="Search problems by title..."
                                />
                            </div>

                            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'} transition-all duration-300 ease-in-out`}>
                                <select
                                    value={difficultyFilter}
                                    onChange={(e) => setDifficultyFilter(e.target.value)}
                                    className={`block w-full px-4 py-3 ${theme.cardBg}/50 border ${theme.border}/50 ${theme.text} rounded-xl focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500/50 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer shadow-inner`}
                                >
                                    <option value="All">All Difficulty</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className={`block w-full px-4 py-3 ${theme.cardBg}/50 border ${theme.border}/50 ${theme.text} rounded-xl focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500/50 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer shadow-inner`}
                                >
                                    <option value="All">All Status</option>
                                    <option value="solved">Solved</option>
                                    <option value="attempted">Attempted</option>
                                    <option value="none">Not Attempted</option>
                                </select>

                                <select
                                    value={tagFilter}
                                    onChange={(e) => setTagFilter(e.target.value)}
                                    className={`block w-full px-4 py-3 ${theme.cardBg}/50 border ${theme.border}/50 ${theme.text} rounded-xl focus:outline-none focus:ring-2 focus:ring-${getAccentColorBase()}-500/50 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer shadow-inner`}
                                >
                                    <option value="All">All Tags</option>
                                    {allTags.map(tag => (
                                        <option key={tag} value={tag}>{capitalizeFirstLetter(tag)}</option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleResetFilters}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 ${theme.cardBg}/50 border ${theme.border}/50 ${theme.text} rounded-xl hover:${theme.cardBg}/80 hover:${theme.highlight} transition-all duration-200 font-medium shadow-md hover:shadow-lg`}
                                >
                                    <FaUndo className="h-4 w-4" /> Reset
                                </button>
                            </div>
                        </div>

                        {viewMode === 'table' ? (
                            <div className={`${sectionClasses} overflow-hidden`}>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y ${theme.border}/20">
                                        <thead className={`${theme.cardBg}/50`}>
                                            <tr>
                                                <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold ${theme.cardText} uppercase tracking-wider`}>
                                                    Status
                                                </th>
                                                <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold ${theme.cardText} uppercase tracking-wider`}>
                                                    <button
                                                        onClick={() => handleSort('title')}
                                                        className={`flex items-center gap-2 hover:${theme.highlight} transition-colors duration-200`}
                                                    >
                                                        Title {getSortIcon('title')}
                                                    </button>
                                                </th>
                                                <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold ${theme.cardText} uppercase tracking-wider`}>
                                                    Tags
                                                </th>
                                                <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold ${theme.cardText} uppercase tracking-wider`}>
                                                    <button
                                                        onClick={() => handleSort('difficulty')}
                                                        className={`flex items-center gap-2 hover:${theme.highlight} transition-colors duration-200`}
                                                    >
                                                        Difficulty {getSortIcon('difficulty')}
                                                    </button>
                                                </th>
                                                {user?.isPremium && (
                                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold ${theme.cardText} uppercase tracking-wider`}>
                                                        Add
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${theme.border}/20`}>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={user?.isPremium ? "5" : "4"} className="px-6 py-12 text-center">
                                                        <LoadingSpinner />
                                                    </td>
                                                </tr>
                                            ) : currentProblems.length > 0 ? (
                                                currentProblems.map((problem) => (
                                                    <tr key={problem._id} className={`hover:${theme.cardBg}/30 transition-all duration-200 group`}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            {statusIcon(problem.status)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    to={`/codefield/${problem._id}`}
                                                                    className={`${theme.highlightSecondary} hover:${theme.highlight} transition-colors duration-200 font-medium`}
                                                                >
                                                                    {problem.title}
                                                                </Link>
                                                                {problem.premium && <FaLock className={`h-3 w-3 ${theme.warningColor}`} />}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                {problem.tags?.slice(0, 2).map(tag => (
                                                                    <span
                                                                        key={tag}
                                                                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${theme.iconBg} ${theme.highlightSecondary} border ${getAccentColorBase()}-500/20`}
                                                                    >
                                                                        {capitalizeFirstLetter(tag)}
                                                                    </span>
                                                                ))}
                                                                {problem.tags?.length > 2 && (
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${theme.cardBg}/50 ${theme.cardText} border ${theme.border}/50`}>
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
                                                                    className={`p-2 rounded-lg ${theme.cardBg}/50 border ${theme.border}/50 ${theme.cardText} hover:${theme.cardBg}/80 hover:${theme.highlight} transition-colors duration-200`}
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
                                                            <FaSearch className={`h-12 w-12 ${theme.cardText}/40`} />
                                                            <div className={`text-center ${theme.cardText}`}>
                                                                <p className="font-medium">No problems found</p>
                                                                <p className="text-sm">Try adjusting your search criteria</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {loading ? (
                                    <div className="col-span-full flex justify-center py-12">
                                        <LoadingSpinner />
                                    </div>
                                ) : currentProblems.length > 0 ? (
                                    currentProblems.map(renderProblemCard)
                                ) : (
                                    <div className="col-span-full flex flex-col items-center gap-4 py-12">
                                        <FaSearch className={`h-16 w-16 ${theme.cardText}/40`} />
                                        <div className={`text-center ${theme.cardText}`}>
                                            <p className="text-lg font-medium">No problems found</p>
                                            <p>Try adjusting your search criteria</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className={`mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${sectionClasses} p-6`}>
                                <div className={`text-sm ${theme.cardText}`}>
                                    Page <span className={`font-semibold ${theme.text}`}>{currentPage}</span> of{' '}
                                    <span className={`font-semibold ${theme.text}`}>{totalPages}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 ${theme.cardBg}/50 border ${theme.border}/50 rounded-lg ${theme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${theme.cardBg}/80 transition-all duration-200 font-medium shadow-sm hover:shadow-md`}
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
                                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md ${currentPage === page
                                                        ? `${theme.buttonPrimary} ${theme.buttonText}`
                                                        : `${theme.cardBg}/50 ${theme.cardText} hover:${theme.cardBg}/80 border ${theme.border}/50`
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
                                        className={`px-4 py-2 ${theme.cardBg}/50 border ${theme.border}/50 rounded-lg ${theme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${theme.cardBg}/80 transition-all duration-200 font-medium shadow-sm hover:shadow-md`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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

            {/* Daily Challenge Details Modal */}
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