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
    FaMedal, FaStar, FaAward, FaTrophy
} from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const defaultAppTheme = {
    background: 'bg-gray-900', text: 'text-white',
    accent: 'bg-indigo-600', accentHover: 'bg-indigo-700',
    primary: 'bg-cyan-500',
    secondary: 'bg-blue-600',
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

        const getCardStyles = () => {
            if (isTop1) {
                return {
                    cardSize: 'w-48 sm:w-52',
                    avatarSize: 'w-16 h-16 sm:w-18 sm:h-18',
                    textSize: 'text-lg sm:text-xl',
                    padding: 'p-4 sm:p-5',
                    crown: 'text-2xl sm:text-3xl',
                    crownPos: '-top-3 sm:-top-4',
                    borderColor: 'border-yellow-400',
                    bgGradient: 'bg-gradient-to-br from-yellow-400/10 to-amber-600/10',
                    textColor: 'text-yellow-400',
                    badgeColor: 'bg-yellow-500/20 text-yellow-400',
                    shadowColor: 'shadow-yellow-500/20',
                    elevation: 'transform sm:-translate-y-3'
                };
            } else if (isTop2) {
                return {
                    cardSize: 'w-44 sm:w-48',
                    avatarSize: 'w-14 h-14 sm:w-16 sm:h-16',
                    textSize: 'text-base sm:text-lg',
                    padding: 'p-3 sm:p-4',
                    crown: 'text-xl sm:text-2xl',
                    crownPos: '-top-2 sm:-top-3',
                    borderColor: 'border-gray-300',
                    bgGradient: 'bg-gradient-to-br from-gray-300/10 to-slate-500/10',
                    textColor: 'text-gray-300',
                    badgeColor: 'bg-gray-400/20 text-gray-300',
                    shadowColor: 'shadow-gray-400/20',
                    elevation: 'transform translate-y-1 sm:translate-y-0'
                };
            } else {
                return {
                    cardSize: 'w-44 sm:w-48',
                    avatarSize: 'w-14 h-14 sm:w-16 sm:h-16',
                    textSize: 'text-base sm:text-lg',
                    padding: 'p-3 sm:p-4',
                    crown: 'text-xl sm:text-2xl',
                    crownPos: '-top-2 sm:-top-3',
                    borderColor: 'border-orange-400',
                    bgGradient: 'bg-gradient-to-br from-orange-400/10 to-orange-600/10',
                    textColor: 'text-orange-400',
                    badgeColor: 'bg-orange-500/20 text-orange-400',
                    shadowColor: 'shadow-orange-500/20',
                    elevation: 'transform translate-y-1 sm:translate-y-0'
                };
            }
        };

        const styles = getCardStyles();

        return (
            <motion.div
                className={`relative flex flex-col items-center rounded-xl ${appTheme.cardBg} border-2 ${styles.borderColor} ${styles.bgGradient} ${styles.shadowColor} shadow-lg backdrop-blur-sm ${styles.cardSize} ${styles.padding} ${styles.elevation} mx-auto`}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                    duration: 0.6, 
                    delay: place * 0.15,
                    type: "spring",
                    stiffness: 120
                }}
                whileHover={{ 
                    scale: isTop1 ? 1.03 : 1.02,
                    y: isTop1 ? -4 : -2
                }}
            >
                {/* Crown/Medal/Trophy Icons - Smaller */}
                {isTop1 && (
                    <motion.div
                        className={`absolute ${styles.crownPos} ${styles.textColor}`}
                        animate={{ 
                            rotate: [-8, -4, -8],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                            duration: 2.5,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    >
                        <FaCrown className={`${styles.crown} filter drop-shadow-md`} />
                    </motion.div>
                )}
                {isTop2 && (
                    <motion.div
                        className={`absolute ${styles.crownPos} ${styles.textColor}`}
                        animate={{ 
                            rotate: [0, 3, 0],
                            scale: [1, 1.03, 1]
                        }}
                        transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    >
                        <FaMedal className={`${styles.crown} filter drop-shadow-md`} />
                    </motion.div>
                )}
                {isTop3 && (
                    <motion.div
                        className={`absolute ${styles.crownPos} ${styles.textColor}`}
                        animate={{ 
                            rotate: [0, -3, 0],
                            scale: [1, 1.03, 1]
                        }}
                        transition={{ 
                            duration: 1.8,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    >
                        <FaTrophy className={`${styles.crown} filter drop-shadow-md`} />
                    </motion.div>
                )}

                {/* Rank Badge - Smaller */}
                <div className={`absolute top-1 right-1 sm:top-2 sm:right-2 px-2 py-0.5 rounded-full ${styles.badgeColor} font-semibold text-xs`}>
                    #{place}
                </div>

                {/* Avatar - Standard Size */}
                <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                >
                    <img
                        src={user.avatar || 'https://via.placeholder.com/80'}
                        alt={user.firstName}
                        className={`${styles.avatarSize} rounded-full object-cover border-2 ${styles.borderColor} shadow-md ${isTop1 ? 'mt-4' : 'mt-2'}`}
                    />
                </motion.div>

                {/* User Name - Compact */}
                <Link 
                    to={`/profile/${user._id}`} 
                    className={`mt-2 font-bold ${styles.textSize} ${appTheme.text} hover:${styles.textColor} transition-all duration-300 text-center line-clamp-1 px-1`}
                >
                    {user.firstName} {user.lastName}
                </Link>

                {/* Problems Solved Badge - Compact */}
                <motion.div 
                    className={`mt-2 px-3 py-1 rounded-full ${styles.badgeColor} text-sm font-semibold flex items-center backdrop-blur-sm`}
                    whileHover={{ scale: 1.02 }}
                >
                    <FaCode className="mr-1 text-xs" /> 
                    {user.problemsSolvedCount}
                </motion.div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${appTheme.background} flex flex-col justify-center items-center`}>
                <Header/>
                <LoadingSpinner message="Loading global ranks..." appTheme={appTheme} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${appTheme.background} flex flex-col justify-center items-center px-4`}>
                <Header/>
                <motion.div
                    className={`${appTheme.errorColor.replace('text-', 'bg-')}/20 p-6 sm:p-8 rounded-xl border ${appTheme.errorColor.replace('text-', 'border-')}/50 max-w-md text-center backdrop-blur-sm`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <h2 className={`text-xl sm:text-2xl font-bold ${appTheme.errorColor} mb-2`}>Error</h2>
                    <p className={`${appTheme.cardText}`}>{error}</p>
                    <Link
                        to="/"
                        className={`mt-4 inline-block px-4 py-2 sm:px-6 sm:py-2 ${appTheme.errorColor.replace('text-', 'bg-')}/30 hover:${appTheme.errorColor.replace('text-', 'bg-')}/50 ${appTheme.buttonText} rounded-lg transition-colors border ${appTheme.errorColor.replace('text-', 'border-')}/50 text-sm sm:text-base`}
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
            
            {/* Subtle Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-20 left-20 w-32 h-32 ${appTheme.primary}/5 rounded-full blur-2xl`} />
                <div className={`absolute bottom-20 right-20 w-40 h-40 ${appTheme.secondary}/5 rounded-full blur-2xl`} />
            </div>

            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Compact Header Section */}
                <motion.div 
                    className={`p-4 sm:p-6 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border}/20 shadow-lg backdrop-blur-xl mb-6 sm:mb-8 text-center`}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center justify-center mb-3">
                        <FaRankingStar className={`text-2xl sm:text-3xl mr-3 ${appTheme.highlight}`} />
                        <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')} bg-clip-text `}>
                            Global Leaderboard
                        </h1>
                    </div>
                    <p className={`${appTheme.cardText} text-sm sm:text-base`}>
                        Compete and see where you stand among all users based on problems solved.
                    </p>
                </motion.div>

                {/* Compact Top 3 Podium */}
                {top3Users.length > 0 && (
                    <motion.div 
                        className={`relative p-4 sm:p-6 rounded-xl ${appTheme.cardBg}/30 border ${appTheme.border}/20 shadow-lg backdrop-blur-xl mb-6 sm:mb-8 overflow-hidden`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        {/* Background Effects - Subtle */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${appTheme.primary.replace('bg-', 'from-')}/3 ${appTheme.secondary.replace('bg-', 'to-')}/3 z-0 rounded-xl`} />

                        <motion.h2 
                            className={`text-xl sm:text-2xl font-bold ${appTheme.text} mb-6 sm:mb-8 text-center relative z-10`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            🏆 Top Champions
                        </motion.h2>

                        {/* Responsive Podium Layout - Compact */}
                        <div className="relative z-10">
                            {/* Mobile Layout - Vertical Stack */}
                            <div className="flex flex-col items-center gap-4 sm:hidden">
                                {top3Users[0] && <RankCard user={top3Users[0]} place={1} />}
                                {top3Users[1] && <RankCard user={top3Users[1]} place={2} />}
                                {top3Users[2] && <RankCard user={top3Users[2]} place={3} />}
                            </div>

                            {/* Desktop Layout - Podium Style - Compact */}
                            <div className="hidden sm:flex justify-center items-end gap-4 lg:gap-6">
                                {/* Second Place - Left */}
                                <div className="flex flex-col items-center">
                                    {top3Users[1] && (
                                        <>
                                            <RankCard user={top3Users[1]} place={2} />
                                            {/* Smaller Podium Base */}
                                            <motion.div 
                                                className="w-16 sm:w-20 h-8 sm:h-10 bg-gradient-to-t from-gray-400/20 to-gray-300/10 rounded-t-md border border-gray-300/20 mt-2 flex items-center justify-center"
                                                initial={{ height: 0 }}
                                                animate={{ height: "auto" }}
                                                transition={{ delay: 1.2, duration: 0.5 }}
                                            >
                                                <span className="text-gray-300 font-bold text-sm">2</span>
                                            </motion.div>
                                        </>
                                    )}
                                </div>

                                {/* First Place - Center (Slightly Elevated) */}
                                <div className="flex flex-col items-center">
                                    {top3Users[0] && (
                                        <>
                                            <RankCard user={top3Users[0]} place={1} />
                                            {/* Taller Podium Base */}
                                            <motion.div 
                                                className="w-20 sm:w-24 h-10 sm:h-12 bg-gradient-to-t from-yellow-500/20 to-yellow-400/10 rounded-t-md border border-yellow-400/20 mt-2 flex items-center justify-center"
                                                initial={{ height: 0 }}
                                                animate={{ height: "auto" }}
                                                transition={{ delay: 1, duration: 0.5 }}
                                            >
                                                <span className="text-yellow-400 font-bold text-base">1</span>
                                            </motion.div>
                                        </>
                                    )}
                                </div>

                                {/* Third Place - Right */}
                                <div className="flex flex-col items-center">
                                    {top3Users[2] && (
                                        <>
                                            <RankCard user={top3Users[2]} place={3} />
                                            {/* Smaller Podium Base */}
                                            <motion.div 
                                                className="w-16 sm:w-20 h-6 sm:h-8 bg-gradient-to-t from-orange-500/20 to-orange-400/10 rounded-t-md border border-orange-400/20 mt-2 flex items-center justify-center"
                                                initial={{ height: 0 }}
                                                animate={{ height: "auto" }}
                                                transition={{ delay: 1.4, duration: 0.5 }}
                                            >
                                                <span className="text-orange-400 font-bold text-sm">3</span>
                                            </motion.div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Compact View Full Leaderboard Button */}
                        {top3Users.length > 0 && (
                            <motion.div 
                                className="text-center mt-6 sm:mt-8 relative z-10"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.6 }}
                            >
                                <Link
                                    to="#full-leaderboard"
                                    onClick={() => setCurrentPage(1)}
                                    className={`inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 ${appTheme.buttonSecondary} hover:${appTheme.buttonSecondaryHover} ${appTheme.buttonText} rounded-lg transition-all duration-300 font-medium text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105`}
                                >
                                    View Full Leaderboard 
                                    <FaChevronRight className="ml-2 text-xs" />
                                </Link>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {ranks.length === 0 ? (
                    <motion.div 
                        className={`p-6 sm:p-8 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border}/20 shadow-lg text-center`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className={`text-4xl sm:text-5xl mb-4 ${appTheme.cardText}/70`}>🤷‍♀️</div>
                        <h3 className={`text-lg sm:text-xl font-bold ${appTheme.text} mb-2`}>No Ranks Yet</h3>
                        <p className={`${appTheme.cardText} mb-4`}>Start solving problems to appear on the leaderboard!</p>
                        <Link
                            to="/problems"
                            className={`inline-flex items-center px-6 py-3 ${appTheme.buttonPrimary} hover:${appTheme.buttonPrimaryHover} ${appTheme.buttonText} rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105`}
                        >
                            <FaCode className="mr-2" /> Browse Problems
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {/* Compact Main Leaderboard Table */}
                        <motion.div 
                            id="full-leaderboard" 
                            className={`p-4 sm:p-6 rounded-xl ${appTheme.cardBg}/50 border ${appTheme.border}/20 shadow-lg overflow-hidden backdrop-blur-xl`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <h2 className={`text-lg sm:text-xl font-bold ${appTheme.text} mb-4 text-center sm:text-left`}>
                                Complete Rankings
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] text-left">
                                    <thead className={`${appTheme.cardBg}/10`}>
                                        <tr>
                                            <th className={`p-3 sm:p-4 font-semibold ${appTheme.cardText} text-sm sm:text-base`}>Rank</th>
                                            <th className={`p-3 sm:p-4 font-semibold ${appTheme.cardText} text-sm sm:text-base`}>User</th>
                                            <th className={`p-3 sm:p-4 font-semibold ${appTheme.cardText} text-sm sm:text-base`}>Problems Solved</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.map((user, index) => (
                                            <motion.tr
                                                key={user._id}
                                                className={`border-t ${appTheme.border}/10 hover:${appTheme.cardBg}/5 transition-all duration-200 group
                                                    ${user.rank === 1 ? 'bg-yellow-600/5' : ''}
                                                    ${user.rank === 2 ? 'bg-gray-400/5' : ''}
                                                    ${user.rank === 3 ? 'bg-orange-600/5' : ''}
                                                `}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                            >
                                                <td className="p-3 sm:p-4">
                                                    <div className="flex items-center font-bold text-base sm:text-lg">
                                                        {user.rank === 1 && <FaCrown className="text-yellow-500 mr-2 text-lg" />}
                                                        {user.rank === 2 && <FaMedal className="text-gray-400 mr-2 text-lg" />}
                                                        {user.rank === 3 && <FaTrophy className="text-orange-500 mr-2 text-lg" />}
                                                        <span className={user.rank <= 3 ? `text-lg ${appTheme.highlight}` : `${appTheme.text}`}>
                                                            {user.rank}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3 sm:p-4">
                                                    <Link to={`/profile/${user._id}`} className="flex items-center group">
                                                        <img
                                                            src={user.avatar || 'https://via.placeholder.com/40'}
                                                            alt={user.firstName}
                                                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mr-3 border border-transparent group-hover:border-primary transition-all duration-300"
                                                        />
                                                        <div className="min-w-0">
                                                            <div className={`font-semibold ${appTheme.text} group-hover:${appTheme.highlight} transition-colors text-sm sm:text-base truncate`}>
                                                                {user.firstName} {user.lastName}
                                                            </div>
                                                            <div className={`text-xs sm:text-sm ${appTheme.cardText} truncate`}>
                                                                {user.emailId}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="p-3 sm:p-4">
                                                    <div className={`flex items-center font-semibold ${appTheme.successColor} text-sm sm:text-base`}>
                                                        <FaCode className="mr-2" /> 
                                                        <span>{user.problemsSolvedCount}</span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        {/* Compact Pagination */}
                        {totalPages > 1 && (
                            <motion.div 
                                className={`mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 ${appTheme.cardBg}/50 border ${appTheme.border}/20 rounded-xl shadow-sm p-4`}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                <div className={`text-xs sm:text-sm ${appTheme.cardText}`}>
                                    Page <span className={`font-semibold ${appTheme.text}`}>{currentPage}</span> of{' '}
                                    <span className={`font-semibold ${appTheme.text}`}>{totalPages}</span>
                                </div>

                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`p-2 ${appTheme.cardBg}/20 border ${appTheme.border}/30 rounded-lg ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/50 transition-all duration-200 font-medium text-sm`}
                                    >
                                        <FaChevronLeft className="text-xs" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {pageNumbers.map((page, index) => (
                                            page === '...' ? (
                                                <span key={`ellipsis-${index}`} className={`px-2 py-1 ${appTheme.cardText} text-sm`}>
                                                    ...
                                                </span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                                                        currentPage === page
                                                            ? `${appTheme.accent} ${appTheme.buttonText} shadow-sm`
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
                                        className={`p-2 ${appTheme.cardBg}/20 border ${appTheme.border}/30 rounded-lg ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/50 transition-all duration-200 font-medium text-sm`}
                                    >
                                        <FaChevronRight className="text-xs" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default RankPage;
