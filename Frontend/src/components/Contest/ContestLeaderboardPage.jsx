import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaTrophy, FaArrowLeft, FaUsers } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// Use the same default theme as other contest-related pages
const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonPrimary: 'bg-indigo-600',
    buttonPrimaryHover: 'bg-indigo-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

const ContestLeaderboardPage = () => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...appThemeFromContext };
    const { id } = useParams(); // contest ID
    const navigate = useNavigate();

    const [contest, setContest] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaderboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch contest details (for title etc.)
            const { data: contestData } = await axiosClient.get(`/contests/${id}`);
            setContest(contestData);

            // Fetch leaderboard
            const { data: leaderboardData } = await axiosClient.get(`/contests/${id}/leaderboard`);
            setLeaderboard(leaderboardData);

        } catch (err) {
            console.error("Error fetching leaderboard data:", err);
            const errorMessage = err.response?.data?.error || "Failed to load leaderboard.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchLeaderboardData();
    }, [fetchLeaderboardData]);

    if (loading) {
        return (
            <div className={`min-h-screen ${appTheme.background}`}>
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <LoadingSpinner message="Loading leaderboard..." />
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${appTheme.background}`}>
                <Header />
                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center ${appTheme.text}`}>
                    <p className={`${appTheme.errorColor} mb-4`}>{error}</p>
                    <button
                        onClick={() => navigate('/contests')}
                        className={`px-4 py-2 ${appTheme.buttonPrimary} ${appTheme.buttonText} rounded-lg hover:${appTheme.buttonPrimaryHover}`}
                    >
                        Go to Contests List
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    if (!contest) {
        return (
            <div className={`min-h-screen ${appTheme.background}`}>
                <Header />
                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center ${appTheme.text}`}>
                    <p className={`${appTheme.errorColor} mb-4`}>Contest not found.</p>
                    <button
                        onClick={() => navigate('/contests')}
                        className={`px-4 py-2 ${appTheme.buttonPrimary} ${appTheme.buttonText} rounded-lg hover:${appTheme.buttonPrimaryHover}`}
                    >
                        Go to Contests List
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col ${appTheme.background}`}>
            <Header />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/contests')}
                        className={`flex items-center gap-2 px-4 py-2 ${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText} rounded-lg hover:${appTheme.cardBg.replace('bg-', 'bg-')}/80 transition-colors`}
                    >
                        <FaArrowLeft /> Back to Contests
                    </button>
                    <h1 className={`text-3xl font-bold ${appTheme.text} flex items-center gap-3`}>
                        <FaTrophy className={appTheme.highlight} /> {contest.title} Leaderboard
                    </h1>
                </div>

                <div className={`p-6 rounded-xl border ${appTheme.border}/20 shadow-md ${appTheme.cardBg}`}>
                    {leaderboard.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50`}>
                                    <tr>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Rank</th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>User</th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Total Points</th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Time Taken (mins)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {leaderboard.map((entry, index) => (
                                        <tr key={entry._id} className={`${index % 2 === 0 ? appTheme.cardBg : `${appTheme.cardBg.replace('bg-', 'bg-')}/80`}`}>
                                            <td className={`px-6 py-4 whitespace-nowrap ${appTheme.text}`}>
                                                {index + 1}
                                                {index === 0 && <span className="ml-2">🥇</span>}
                                                {index === 1 && <span className="ml-2">🥈</span>}
                                                {index === 2 && <span className="ml-2">🥉</span>}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap ${appTheme.highlight}`}>
                                                {/* Link to user profile if available */}
                                                <Link to={`/users/${entry.userId._id}`} className="hover:underline">
                                                    {entry.userId.username}
                                                </Link>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap ${appTheme.text}`}>{entry.totalPoints || 0}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap ${appTheme.text}`}>{entry.timeTaken || '--'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className={`text-center ${appTheme.cardText}`}>No participants have submitted solutions yet, or leaderboard data is not available.</p>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContestLeaderboardPage;