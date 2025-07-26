// pages/RankPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import LoadingSpinner from '../common/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import {
    FaRankingStar, FaCode, FaUser, FaCrown, FaChevronLeft, FaChevronRight,
    FaMedal, FaStar, FaAward // Added FaMedal, FaStar, FaAward for podium
} from 'react-icons/fa6'; // Using fa6 for new icons and old ones from fa

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const defaultAppTheme = {
    background: 'bg-gray-900', text: 'text-white',
    accent: 'bg-indigo-600', accentHover: 'bg-indigo-700',
    primary: 'bg-cyan-500', // Added primary back for gradients
    secondary: 'bg-blue-600', // Added secondary back for gradients
    secondaryAccent: 'bg-blue-600', secondaryAccentHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white',
    buttonPrimary: 'bg-indigo-600', buttonPrimaryHover: 'bg-indigo-700',
    buttonSecondary: 'bg-blue-600', buttonSecondaryHover: 'bg-blue-700',
    highlight: 'text-indigo-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-cyan-400', iconBg: 'bg-indigo-600/10',
    gradientFrom: 'from-slate-900', gradientTo: 'to-slate-800',
    successColor: 'text-emerald-500',
    warningColor: 'text-amber-500',
    errorColor: 'text-red-500',
    infoColor: 'text-sky-500',
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


const RankPage = () => {
    const [ranks, setRanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 15;

    const { theme: appThemeFromContext } = useTheme();
    const appTheme = useMemo(
        () => ({ ...defaultAppTheme, ...(appThemeFromContext) }),
        [appThemeFromContext]
    );

    useEffect(() => {
        const fetchRanks = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosClient.get('/user/total-rank');
                if (response.data.success) {
                    setRanks(response.data.ranks);
                } else {
                    setError(response.data.message || 'Failed to fetch ranks.');
                    toast.error(response.data.message || 'Failed to fetch ranks.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred while fetching ranks.');
                toast.error(err.response?.data?.message || 'An error occurred while fetching ranks.');
            } finally {
                setLoading(false);
            }
        };

        fetchRanks();
    }, []);

    const top3Users = useMemo(() => ranks.slice(0, 3), [ranks]);

    const totalPages = Math.ceil(ranks.length / usersPerPage);
    const currentUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        return ranks.slice(startIndex, endIndex);
    }, [ranks, currentPage, usersPerPage]);

    const pageNumbers = getPaginationNumbers(currentPage, totalPages);

    const RankCard = ({ user, place }) => {
        const isTop1 = place === 1;
        const isTop2 = place === 2;
        const isTop3 = place === 3;

        const crownColor = isTop1 ? 'text-yellow-500' : isTop2 ? 'text-gray-400' : 'text-orange-500';
        const borderColor = isTop1 ? 'border-yellow-500' : isTop2 ? 'border-gray-400' : 'border-orange-500';
        const bgColor = isTop1 ? 'bg-yellow-600/10' : isTop2 ? 'bg-gray-400/10' : 'bg-orange-600/10';
        const textColor = isTop1 ? 'text-yellow-400' : isTop2 ? 'text-gray-300' : 'text-orange-400';

        return (
            <motion.div
                className={`relative flex flex-col items-center p-4 sm:p-6 rounded-2xl ${appTheme.cardBg} border-2 ${borderColor}/50 shadow-lg ${bgColor} backdrop-blur-sm`}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: place * 0.1 }}
                whileHover={{ scale: 1.05, boxShadow: `0 10px 20px rgba(var(--color-${borderColor.split('-')[1]})-500 / 0.2)` }}
            >
                {isTop1 && <FaCrown className={`absolute -top-6 ${crownColor} text-5xl sm:text-6xl -rotate-12 transform opacity-90`} />}
                {isTop2 && <FaMedal className={`absolute -top-4 ${crownColor} text-4xl sm:text-5xl opacity-90`} />}
                {isTop3 && <FaStar className={`absolute -top-4 ${crownColor} text-4xl sm:text-5xl opacity-90`} />}

                <img
                    src={user.avatar || 'https://via.placeholder.com/60'}
                    alt={user.firstName}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 ${borderColor} ${isTop1 ? 'mt-4' : 'mt-0'} shadow-md`}
                />
                <Link to={`/profile/${user._id}`} className={`mt-3 font-bold text-xl sm:text-2xl ${appTheme.text} hover:${textColor} transition-colors text-center`}>
                    {user.firstName} {user.lastName}
                </Link>

                <div className={`mt-4 px-4 py-2 rounded-full ${appTheme.iconBg} ${textColor} text-base font-semibold flex items-center`}>
                    <FaCode className="mr-2" /> {user.problemsSolvedCount} Solved
                </div>
                <div className={`mt-2 text-sm ${appTheme.cardText} flex items-center`}>
                    <FaRankingStar className="mr-2" /> Rank #{user.rank}
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${appTheme.background} flex justify-center items-center`}>
                <LoadingSpinner message="Loading global ranks..." appTheme={appTheme} />
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

    return (
        <div className={`min-h-screen ${appTheme.background} ${appTheme.text}`}>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className={`p-6 rounded-2xl ${appTheme.cardBg}/50 border ${appTheme.border}/20 shadow-xl backdrop-blur-xl mb-8`}>
                    <div className="flex items-center mb-4">
                        <FaRankingStar className={`text-3xl mr-3 ${appTheme.highlight}`} />
                        <h1 className={`text-3xl font-bold bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')} bg-clip-text`}>
                            Global Leaderboard
                        </h1>
                    </div>
                    <p className={`${appTheme.cardText} mt-2`}>
                        Compete and see where you stand among all users based on problems solved.
                    </p>
                </div>

                {/* Top 3 Board */}
                {top3Users.length > 0 && (
                    <div className={`relative p-8 rounded-2xl ${appTheme.cardBg}/30 border ${appTheme.border}/20 shadow-xl backdrop-blur-xl mb-8 overflow-hidden`}>
                        {/* Background subtle gradient/texture */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${appTheme.primary.replace('bg-', 'from-')}/5 ${appTheme.secondary.replace('bg-', 'to-')}/5 z-0 rounded-2xl`}></div>
                        <div className={`absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgY2xhc3M9Im9wYWNpdHktMjAiPgo8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMCAwSDEwMFYxMDBIMFYwWiIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMjUiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPg==')] bg-repeat bg-center opacity-5`}></div>

                        <h2 className={`text-2xl font-bold ${appTheme.text} mb-8 text-center relative z-10`}>
                            Top Coders!
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center items-end gap-6 relative z-10">
                            {/* Second Place */}
                            {top3Users[1] && (
                                <RankCard user={top3Users[1]} place={2} />
                            )}
                            {/* First Place */}
                            {top3Users[0] && (
                                <RankCard user={top3Users[0]} place={1} />
                            )}
                            {/* Third Place */}
                            {top3Users[2] && (
                                <RankCard user={top3Users[2]} place={3} />
                            )}
                        </div>
                        {top3Users.length > 0 && ( // Display link to view all ranks only if there are more than 3
                             <div className="text-center mt-8 relative z-10">
                                <Link
                                    to="#full-leaderboard" // Scroll to the main leaderboard table
                                    onClick={() => setCurrentPage(1)} // Reset pagination if needed
                                    className={`inline-flex items-center px-6 py-3 ${appTheme.buttonSecondary} hover:${appTheme.buttonSecondaryHover} ${appTheme.buttonText} rounded-lg transition-all duration-200 font-medium transform shadow-md hover:shadow-lg`}
                                >
                                    View Full Leaderboard <FaChevronRight className="ml-2" />
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {ranks.length === 0 ? (
                    <div className={`p-6 rounded-2xl ${appTheme.cardBg}/50 border ${appTheme.border}/20 shadow-xl text-center py-12`}>
                        <div className={`text-6xl mb-4 ${appTheme.cardText}/70`}>🤷‍♀️</div>
                        <h3 className={`text-2xl font-bold ${appTheme.text} mb-2`}>No Ranks Yet</h3>
                        <p className={`${appTheme.cardText}`}>Start solving problems to appear on the leaderboard!</p>
                        <Link
                            to="/problems"
                            className={`mt-6 inline-flex items-center px-6 py-3 ${appTheme.buttonPrimary} hover:${appTheme.buttonPrimaryHover} ${appTheme.buttonText} rounded-lg transition-all duration-200 font-medium transform shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-${appTheme.accent.replace('bg-', '')}-500 focus:ring-opacity-50`}
                        >
                            <FaCode className="mr-2" /> Browse Problems
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Main Leaderboard Table */}
                        <div id="full-leaderboard" className={`p-6 rounded-2xl ${appTheme.cardBg}/50 border ${appTheme.border}/20 shadow-xl overflow-hidden`}>
                            <h2 className={`text-xl font-bold ${appTheme.text} mb-4`}>All Ranks</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] text-left">
                                    <thead className={`${appTheme.cardBg}/10`}>
                                        <tr>
                                            <th className={`p-4 font-semibold ${appTheme.cardText}`}>Rank</th>
                                            <th className={`p-4 font-semibold ${appTheme.cardText}`}>User</th>
                                            <th className={`p-4 font-semibold ${appTheme.cardText}`}>Problems Solved</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.map((user, index) => (
                                            <motion.tr
                                                key={user._id}
                                                className={`border-t ${appTheme.border}/10 hover:${appTheme.cardBg}/5 transition-colors duration-200 group
                                                    ${user.rank === 1 ? 'bg-yellow-600/5' : ''}
                                                    ${user.rank === 2 ? 'bg-gray-400/5' : ''}
                                                    ${user.rank === 3 ? 'bg-orange-600/5' : ''}
                                                `}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center font-bold text-lg">
                                                        {user.rank === 1 && <FaCrown className={`text-yellow-500 mr-2`} />}
                                                        {user.rank === 2 && <FaCrown className={`text-gray-400 mr-2`} />}
                                                        {user.rank === 3 && <FaCrown className={`text-orange-500 mr-2`} />}
                                                        <span className={user.rank <= 3 ? `text-xl ${appTheme.highlight}` : `${appTheme.text}`}>{user.rank}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Link to={`/profile/${user._id}`} className="flex items-center group">
                                                        <img
                                                            src={user.avatar || 'https://via.placeholder.com/40'}
                                                            alt={user.firstName}
                                                            className="w-10 h-10 rounded-full object-cover mr-3 border border-transparent group-hover:border-primary transition-colors"
                                                        />
                                                        <div>
                                                            <div className={`font-semibold ${appTheme.text} group-hover:${appTheme.highlight} transition-colors`}>
                                                                {user.firstName} {user.lastName}
                                                            </div>
                                                            <div className={`text-sm ${appTheme.cardText}`}>{user.emailId}</div>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="p-4">
                                                    <div className={`flex items-center font-bold ${appTheme.successColor}`}>
                                                        <FaCode className="mr-2" /> {user.problemsSolvedCount}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={`mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${appTheme.cardBg}/50 border ${appTheme.border}/20 rounded-2xl shadow-sm p-6`}>
                                <div className={`text-sm ${appTheme.cardText}`}>
                                    Page <span className={`font-semibold ${appTheme.text}`}>{currentPage}</span> of{' '}
                                    <span className={`font-semibold ${appTheme.text}`}>{totalPages}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 ${appTheme.cardBg}/20 border ${appTheme.border}/30 rounded-lg ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/50 transition-all duration-200 font-medium`}
                                    >
                                        <FaChevronLeft />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {pageNumbers.map((page, index) => (
                                            page === '...' ? (
                                                <span key={`ellipsis-${index}`} className={`px-3 py-2 ${appTheme.cardText}`}>...</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentPage === page
                                                        ? `${appTheme.accent} ${appTheme.buttonText} shadow-md`
                                                        : `${appTheme.cardBg}/20 ${appTheme.cardText} hover:${appTheme.cardBg}/50 border ${appTheme.border}/30`
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
                                        className={`px-4 py-2 ${appTheme.cardBg}/20 border ${appTheme.border}/30 rounded-lg ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/50 transition-all duration-200 font-medium`}
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default RankPage;