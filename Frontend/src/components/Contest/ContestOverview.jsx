import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    FaCalendarAlt, FaClock, FaUsers, FaUserPlus,
    FaPlay, FaTrophy, FaEye, FaCheckCircle, FaHourglassHalf, FaRegCalendarCheck, FaExclamationCircle
} from 'react-icons/fa'; // Added FaExclamationCircle for error/empty state
import axiosClient from '../../api/axiosClient';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import { useSelector } from 'react-redux';

// Default theme (unchanged - ensures consistency if context is not fully loaded)
const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white',
    accent: 'bg-indigo-600',
    accentHover: 'bg-indigo-700',
    secondaryAccent: 'bg-blue-600',
    secondaryAccentHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white',
    buttonPrimary: 'bg-indigo-600',
    buttonPrimaryHover: 'bg-indigo-700',
    buttonSecondary: 'bg-blue-600',
    buttonSecondaryHover: 'bg-blue-700',
    highlight: 'text-indigo-400',
    highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-cyan-400',
    iconBg: 'bg-indigo-600/10',
    gradientFrom: 'from-slate-900',
    gradientTo: 'to-slate-800',
    successColor: 'text-emerald-500',
    warningColor: 'text-amber-500',
    errorColor: 'text-red-500',
    infoColor: 'text-sky-500',
};

const ContestOverview = () => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...(appThemeFromContext) };

    const { isAuthenticated } = useSelector(state => state.auth);

    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('upcoming');

    const getContestStatus = useCallback((startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start > now) {
            return 'upcoming';
        } else if (end < now) {
            return 'past';
        } else {
            return 'ongoing';
        }
    }, []);

    const fetchContests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosClient.get(`/contests?filter=${filter}`);
            setContests(data);
        } catch (err) {
            console.error("Failed to fetch contests:", err);
            setError(err.response?.data?.error || "Failed to load contests.");
            toast.error(err.response?.data?.error || "Failed to load contests.");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchContests();
    }, [fetchContests]);

    const handleRegister = async (contestId) => {
        try {
            await axiosClient.post(`/contests/${contestId}/register`);
            toast.success('Successfully registered for the contest!');
            fetchContests(); // Re-fetch contests to update registration status
        } catch (err) {
            console.error("Registration failed:", err);
            toast.error(err.response?.data?.error || 'Failed to register for contest. Please try again.');
        }
    };

    const renderActionButtons = (contest) => {
        const status = getContestStatus(contest.startTime, contest.endTime);

        // Define consistent button classes for better UI
        const baseButtonClasses = `flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 w-full group`;
        const primaryButtonClasses = `bg-gradient-to-r from-${appTheme.buttonPrimary.replace('bg-', '')} to-${appTheme.buttonSecondary.replace('bg-', '')} ${appTheme.buttonText} shadow-md hover:shadow-lg hover:scale-[1.01] transform`;
        const secondaryButtonClasses = `bg-gray-700/60 text-gray-200 hover:bg-gray-600 border border-gray-600 hover:border-gray-500`;
        const disabledButtonClasses = `bg-gray-600/50 text-gray-400 cursor-not-allowed opacity-80`;

        if (status === 'upcoming') {
            if (isAuthenticated) {
                if (contest.isRegistered) {
                    return (
                        <button
                            disabled
                            className={`${baseButtonClasses} ${disabledButtonClasses}`}
                        >
                            <FaCheckCircle className="group-hover:animate-none" /> Registered
                        </button>
                    );
                } else {
                    return (
                        <button
                            onClick={() => handleRegister(contest._id)}
                            className={`${baseButtonClasses} ${primaryButtonClasses}`}
                        >
                            <FaUserPlus className="group-hover:scale-110 group-hover:rotate-6 transition-transform" /> Register
                        </button>
                    );
                }
            } else {
                return (
                    <Link
                        to="/login"
                        className={`${baseButtonClasses} ${primaryButtonClasses} text-center`}
                    >
                        <FaUserPlus className="group-hover:scale-110 group-hover:rotate-6 transition-transform" /> Login to Register
                    </Link>
                );
            }
        } else if (status === 'ongoing') {
            if (isAuthenticated && contest.isRegistered) {
                return (
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Link
                            to={`/contests/${contest._id}/participate`}
                            className={`${baseButtonClasses} ${primaryButtonClasses}`}
                        >
                            <FaPlay className="group-hover:scale-110 transition-transform" /> Participate
                        </Link>
                        <Link
                            to={`/contests/${contest._id}/leaderboard`}
                            className={`${baseButtonClasses} ${secondaryButtonClasses}`}
                        >
                            <FaTrophy className="group-hover:scale-110 transition-transform" /> Leaderboard
                        </Link>
                    </div>
                );
            } else {
                return (
                    <div className="flex flex-col sm:flex-row gap-3 w-full items-center">
                        <span className={`block w-full text-center py-2 ${appTheme.warningColor} font-medium text-sm`}>Registration Closed</span>
                        <Link
                            to={`/contests/${contest._id}/leaderboard`}
                            className={`${baseButtonClasses} ${secondaryButtonClasses}`}
                        >
                            <FaTrophy className="group-hover:scale-110 transition-transform" /> Leaderboard
                        </Link>
                        <Link
                            to={`/contests/${contest._id}`}
                            className={`${baseButtonClasses} ${secondaryButtonClasses}`}
                        >
                            <FaEye className="group-hover:scale-110 transition-transform" /> View Details
                        </Link>
                    </div>
                );
            }
        } else if (status === 'past') {
            return (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Link
                        to={`/contests/${contest._id}/leaderboard`}
                        className={`${baseButtonClasses} ${secondaryButtonClasses}`}
                    >
                        <FaTrophy className="group-hover:scale-110 transition-transform" /> Leaderboard
                    </Link>
                    <Link
                        to={`/contests/${contest._id}`}
                        className={`${baseButtonClasses} ${secondaryButtonClasses}`}
                    >
                        <FaEye className="group-hover:scale-110 transition-transform" /> View Details
                    </Link>
                </div>
            );
        }
        return null;
    };

    const getStatusBadge = (status) => {
        const baseBadgeClasses = `px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap`;
        switch (status) {
            case 'upcoming':
                return `${baseBadgeClasses} bg-blue-500/20 text-blue-300 border border-blue-500/50`;
            case 'ongoing':
                return `${baseBadgeClasses} bg-emerald-500/20 text-emerald-300 border border-emerald-500/50`;
            case 'past':
                return `${baseBadgeClasses} bg-gray-700/50 text-gray-400 border border-gray-600/50`;
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20 flex flex-col items-center justify-center">
                <LoadingSpinner message="Fetching the latest contests..." />
                <p className={`mt-4 text-lg ${appTheme.cardText}`}>Please wait a moment.</p>
            </div>
        );
    }

    return (
        <div className="flex-grow">
            <h1 className={`text-4xl font-extrabold mb-8 ${appTheme.text} text-center drop-shadow-lg`}>
                Competitive Programming Contests
            </h1>

            {/* Filter Tabs */}
            <div className={`flex justify-center mb-10 p-1.5 rounded-xl ${appTheme.cardBg}/50 backdrop-blur-md border ${appTheme.border}/50 shadow-inner`}>
                <button
                    onClick={() => setFilter('upcoming')}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300
                        ${filter === 'upcoming'
                            ? `bg-gradient-to-r from-${appTheme.buttonPrimary.replace('bg-', '')} to-${appTheme.buttonSecondary.replace('bg-', '')} ${appTheme.buttonText} shadow-lg scale-105`
                            : `${appTheme.cardText} hover:${appTheme.cardBg.replace('bg-', 'bg-')}/70 hover:text-white`
                        }`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setFilter('ongoing')}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300
                        ${filter === 'ongoing'
                            ? `bg-gradient-to-r from-${appTheme.buttonPrimary.replace('bg-', '')} to-${appTheme.buttonSecondary.replace('bg-', '')} ${appTheme.buttonText} shadow-lg scale-105`
                            : `${appTheme.cardText} hover:${appTheme.cardBg.replace('bg-', 'bg-')}/70 hover:text-white`
                        }`}
                >
                    Ongoing
                </button>
                <button
                    onClick={() => setFilter('past')}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300
                        ${filter === 'past'
                            ? `bg-gradient-to-r from-${appTheme.buttonPrimary.replace('bg-', '')} to-${appTheme.buttonSecondary.replace('bg-', '')} ${appTheme.buttonText} shadow-lg scale-105`
                            : `${appTheme.cardText} hover:${appTheme.cardBg.replace('bg-', 'bg-')}/70 hover:text-white`
                        }`}
                >
                    Past
                </button>
            </div>

            {error && (
                <div className={`text-center py-10 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border}/20 flex flex-col items-center justify-center`}>
                    <FaExclamationCircle className={`text-6xl mb-4 ${appTheme.errorColor}`} />
                    <p className={`text-2xl font-semibold ${appTheme.errorColor} mb-2`}>Error Loading Contests</p>
                    <p className={`text-lg ${appTheme.cardText}`}>{error}</p>
                    <button
                        onClick={fetchContests}
                        className={`mt-6 ${appTheme.buttonPrimary} hover:${appTheme.buttonPrimaryHover} ${appTheme.buttonText} px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md`}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {contests.length === 0 && !loading && !error && (
                <div className={`text-center py-10 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border}/20 flex flex-col items-center justify-center`}>
                    <FaTrophy className={`text-6xl mb-4 ${appTheme.highlight}`} />
                    <p className={`text-2xl font-semibold ${appTheme.cardText}`}>
                        No {filter} contests available at the moment.
                    </p>
                    <p className={`mt-2 text-md ${appTheme.cardText}/80`}>
                        Check back later or try a different filter!
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {contests.map((contest, index) => {
                    const status = getContestStatus(contest.startTime, contest.endTime);
                    const startDate = new Date(contest.startTime);
                    const endDate = new Date(contest.endTime);

                    return (
                        <div
                            key={contest._id}
                            className={`p-7 w-100 rounded-2xl border ${appTheme.border}/30 shadow-xl transition-all duration-300 ${appTheme.cardBg} hover:shadow-2xl hover:scale-[1.02] transform hover:-translate-y-1 relative group
                                animate-in fade-in-0 slide-in-from-bottom-2 duration-500`} // Added entrance animation for each card
                            style={{ animationDelay: `${index * 0.08}s` }} // Staggered animation
                        >
                            {/* Hover border effect */}
                            <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-${appTheme.highlight.replace('text-', '')} transition-colors duration-300 -m-0.5`}></div>

                            <div className="flex justify-between items-start mb-5 relative z-10">
                                <h2 className={`text-xl md:text-2xl font-bold ${appTheme.highlight} flex items-center gap-3`}>
                                    <FaTrophy className={`text-xl ${appTheme.highlightSecondary} group-hover:scale-110 transition-transform`} />
                                    {contest.title}
                                </h2>
                                <span className={getStatusBadge(status)}>
                                    {status === 'upcoming' && <FaRegCalendarCheck />}
                                    {status === 'ongoing' && <FaHourglassHalf />}
                                    {status === 'past' && <FaCheckCircle />}
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                            </div>
                            <p className={`mb-5 ${appTheme.cardText} text-sm leading-relaxed line-clamp-3 relative z-10`}>{contest.description}</p>

                            <div className={`space-y-3 text-sm ${appTheme.cardText} mb-7 relative z-10`}>
                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className={`${appTheme.highlight} text-md`} />
                                    <span>Starts: <span className={`${appTheme.text} font-medium`}>{startDate.toLocaleString()}</span></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaClock className={`${appTheme.highlight} text-md`} />
                                    <span>Duration: <span className={`${appTheme.text} font-medium`}>{contest.duration} mins</span></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaRegCalendarCheck className={`${appTheme.highlight} text-md`} />
                                    <span>Ends: <span className={`${appTheme.text} font-medium`}>{endDate.toLocaleString()}</span></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaUsers className={`${appTheme.highlight} text-md`} />
                                    <span>
                                        Participants:{" "}
                                        {contest.maxParticipants ? (
                                            <span className={`${appTheme.text} font-semibold`}>{contest.participantCount} / {contest.maxParticipants}</span>
                                        ) : (
                                            <span className={`${appTheme.text} font-semibold`}>{contest.participantCount}</span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="relative z-10"> {/* Wrap buttons to ensure z-index */}
                                {renderActionButtons(contest)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ContestOverview;