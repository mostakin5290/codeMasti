import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt, FaClock, FaUsers, FaUserPlus,
    FaPlay, FaTrophy, FaEye, FaCheckCircle
} from 'react-icons/fa';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import axiosClient from '../api/axiosClient';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useSelector } from 'react-redux';

// Default theme (unchanged)
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

const ContestsPage = () => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...(appThemeFromContext) };
    const navigate = useNavigate();

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
            fetchContests();
        } catch (err) {
            console.error("Registration failed:", err);
            toast.error(err.response?.data?.error || 'Failed to register for contest. Please try again.');
        }
    };

    const renderActionButtons = (contest) => {
        const status = getContestStatus(contest.startTime, contest.endTime);

        const buttonBaseClasses = `flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors w-full`;
        const buttonPrimaryClasses = `${appTheme.buttonPrimary} ${appTheme.buttonText} hover:${appTheme.buttonPrimaryHover}`;
        const buttonSecondaryClasses = `${appTheme.buttonSecondary} ${appTheme.buttonText} hover:${appTheme.buttonSecondaryHover}`;
        const buttonTertiaryClasses = `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText} hover:${appTheme.cardBg.replace('bg-', 'bg-')}/80`;

        if (status === 'upcoming') {
            if (isAuthenticated) {
                if (contest.isRegistered) {
                    return (
                        <button
                            disabled
                            className={`${buttonBaseClasses} bg-gray-600 text-white opacity-70 cursor-not-allowed`}
                        >
                            <FaCheckCircle /> Registered
                        </button>
                    );
                } else {
                    return (
                        <button
                            onClick={() => handleRegister(contest._id)}
                            className={`${buttonBaseClasses} ${buttonPrimaryClasses}`}
                        >
                            <FaUserPlus /> Register
                        </button>
                    );
                }
            } else {
                return (
                    <Link
                        to="/login"
                        className={`${buttonBaseClasses} ${buttonPrimaryClasses}`}
                    >
                        <FaUserPlus /> Login to Register
                    </Link>
                );
            }
        } else if (status === 'ongoing') {
            if (isAuthenticated && contest.isRegistered) {
                return (
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Link
                            to={`/contests/${contest._id}/participate`}
                            className={`${buttonBaseClasses} ${buttonPrimaryClasses}`}
                        >
                            <FaPlay /> Participate
                        </Link>
                        <Link
                            to={`/contests/${contest._id}/leaderboard`}
                            className={`${buttonBaseClasses} ${buttonSecondaryClasses}`}
                        >
                            <FaTrophy /> Leaderboard
                        </Link>
                    </div>
                );
            } else {
                return (
                    <div className="flex flex-col sm:flex-row gap-2 w-full items-center">
                        <span className={`block w-full text-center py-2 ${appTheme.warningColor} font-medium text-sm`}>Registration Closed</span>
                        <Link
                            to={`/contests/${contest._id}/leaderboard`}
                            className={`${buttonBaseClasses} ${buttonSecondaryClasses}`}
                        >
                            <FaTrophy /> Leaderboard
                        </Link>
                        <Link
                            to={`/contests/${contest._id}`}
                            className={`${buttonBaseClasses} ${buttonTertiaryClasses}`}
                        >
                            <FaEye /> View Details
                        </Link>
                    </div>
                );
            }
        } else if (status === 'past') {
            return (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Link
                        to={`/contests/${contest._id}/leaderboard`}
                        className={`${buttonBaseClasses} ${buttonSecondaryClasses}`}
                    >
                        <FaTrophy /> Leaderboard
                    </Link>
                    <Link
                        to={`/contests/${contest._id}`}
                        className={`${buttonBaseClasses} ${buttonTertiaryClasses}`}
                    >
                        <FaEye /> View Details
                    </Link>
                </div>
            );
        }
        return null;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'upcoming':
                return `px-2 py-1 rounded-full text-xs ${appTheme.infoColor.replace('text-', 'bg-')} ${appTheme.buttonText}`;
            case 'ongoing':
                return `px-2 py-1 rounded-full text-xs ${appTheme.successColor.replace('text-', 'bg-')} ${appTheme.buttonText}`;
            case 'past':
                return `px-2 py-1 rounded-full text-xs ${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`;
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${appTheme.background}`}>
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <LoadingSpinner message="Loading contests..." />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col ${appTheme.background}`}>
            <Header />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className={`text-4xl font-extrabold mb-8 ${appTheme.text} text-center`}>
                    Competitive Programming Contests
                </h1>

                {/* Filter Tabs (unchanged) */}
                <div className={`flex justify-center mb-8 p-1 rounded-lg ${appTheme.cardBg}`}>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-6 py-3 rounded-md font-medium text-lg transition-colors duration-200
                            ${filter === 'upcoming' ? `${appTheme.buttonPrimary} ${appTheme.buttonText}` : `${appTheme.cardText} hover:${appTheme.cardBg.replace('bg-', 'bg-')}/70`}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('ongoing')}
                        className={`px-6 py-3 rounded-md font-medium text-lg transition-colors duration-200
                            ${filter === 'ongoing' ? `${appTheme.buttonPrimary} ${appTheme.buttonText}` : `${appTheme.cardText} hover:${appTheme.cardBg.replace('bg-', 'bg-')}/70`}`}
                    >
                        Ongoing
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-6 py-3 rounded-md font-medium text-lg transition-colors duration-200
                            ${filter === 'past' ? `${appTheme.buttonPrimary} ${appTheme.buttonText}` : `${appTheme.cardText} hover:${appTheme.cardBg.replace('bg-', 'bg-')}/70`}`}
                    >
                        Past
                    </button>
                </div>

                {error && <p className={`text-center ${appTheme.errorColor} mb-4`}>{error}</p>}

                {contests.length === 0 && !loading && (
                    <p className={`text-center text-xl ${appTheme.cardText}`}>
                        No {filter} contests available at the moment.
                    </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contests.map((contest) => {
                        const status = getContestStatus(contest.startTime, contest.endTime);
                        return (
                            <div
                                key={contest._id}
                                className={`p-6 rounded-xl border ${appTheme.border}/20 shadow-md transition-all duration-300 ${appTheme.cardBg} hover:shadow-lg`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className={`text-xl font-bold ${appTheme.highlight} flex items-center gap-2`}>
                                        {contest.title}
                                    </h2>
                                    <span className={getStatusBadge(status)}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>
                                </div>
                                <p className={`mb-4 ${appTheme.cardText} text-sm line-clamp-3`}>{contest.description}</p>

                                <div className={`grid grid-cols-2 gap-3 text-sm ${appTheme.cardText} mb-6`}>
                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt className={appTheme.highlight} />
                                        <span>Starts: {new Date(contest.startTime).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaClock className={appTheme.highlight} />
                                        <span>Duration: {contest.duration} mins</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt className={appTheme.highlight} />
                                        <span>Ends: {new Date(contest.endTime).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaUsers className={appTheme.highlight} />
                                        {/* Display participants count here */}
                                        <span>
                                            Participants:{" "}
                                            {contest.maxParticipants ? (
                                                `${contest.participantCount}/${contest.maxParticipants}`
                                            ) : (
                                                contest.participantCount
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {renderActionButtons(contest)}
                            </div>
                        );
                    })}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContestsPage;