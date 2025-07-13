import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaPlus, FaEdit, FaTrash, FaClock, FaUserFriends,
    FaCalendarAlt, FaTrophy, FaSearch
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';


const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    // New button primary default colors
    buttonPrimary: 'bg-indigo-600', // Default solid primary button color
    buttonPrimaryHover: 'bg-indigo-700', // Default solid primary button hover color
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    // Add status colors to default theme for consistency, though not directly used here
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

const ContestManagement = () => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...appThemeFromContext };
    const navigate = useNavigate();

    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const contestsPerPage = 10;

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const { data } = await axiosClient.get('/contests');
                setContests(data);
            } catch (error) {
                toast.error('Failed to fetch contests');
            } finally {
                setLoading(false);
            }
        };
        fetchContests();
    }, []);

    const handleDelete = async (contestId) => {
        if (window.confirm('Are you sure you want to delete this contest?')) {
            try {
                await axiosClient.delete(`/contests/${contestId}`);
                setContests(contests.filter(c => c._id !== contestId));
                toast.success('Contest deleted successfully');
            } catch (error) {
                toast.error('Failed to delete contest');
            }
        }
    };

    const filteredContests = contests.filter(contest => {
        const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase());
        const now = new Date();

        if (filter === 'upcoming') return matchesSearch && new Date(contest.startTime) > now;
        if (filter === 'ongoing') {
            return matchesSearch &&
                new Date(contest.startTime) <= now &&
                new Date(contest.endTime) >= now;
        }
        if (filter === 'past') return matchesSearch && new Date(contest.endTime) < now;
        return matchesSearch;
    });

    // Pagination logic
    const indexOfLastContest = currentPage * contestsPerPage;
    const indexOfFirstContest = indexOfLastContest - contestsPerPage;
    const currentContests = filteredContests.slice(indexOfFirstContest, indexOfLastContest);
    const totalPages = Math.ceil(filteredContests.length / contestsPerPage);

    const getStatusBadge = (contest) => {
        const now = new Date();
        if (new Date(contest.startTime) > now) {
            return (
                <span className={`px-2 py-1 rounded-full text-xs ${appTheme.primary.replace('bg-', 'bg-')} ${appTheme.buttonText}`}>
                    Upcoming
                </span>
            );
        } else if (new Date(contest.endTime) < now) {
            return (
                <span className={`px-2 py-1 rounded-full text-xs ${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`}>
                    Completed
                </span>
            );
        } else {
            return (
                <span className={`px-2 py-1 rounded-full text-xs ${appTheme.highlight.replace('text-', 'bg-')} ${appTheme.buttonText}`}>
                    Ongoing
                </span>
            );
        }
    };

    if (loading) return <LoadingSpinner message="Loading contests..." />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className={`text-2xl font-bold ${appTheme.text}`}>Manage Contests</h2>
                <Link
                    to="/admin/contests/create"
                    className={`flex items-center gap-2 px-4 py-2 ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${appTheme.highlight.replace('text-', 'to-')} ${appTheme.buttonText} rounded-lg font-semibold hover:shadow-lg transition-all duration-300`}
                >
                    <FaPlus /> Create New Contest
                </Link>
            </div>

            {/* Filters and Search */}
            <div className={`p-4 ${appTheme.cardBg.replace('bg-', 'bg-')}/20 rounded-xl border ${appTheme.border}/20`}>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1">
                        <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${appTheme.cardText}`} />
                        <input
                            type="text"
                            placeholder="Search contests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 ${appTheme.background.replace('bg-', 'bg-')} ${appTheme.text} rounded-lg border ${appTheme.border}/50 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50`}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded-lg ${filter === 'all' ? `${appTheme.primary.replace('bg-', 'bg-')} ${appTheme.buttonText}` : `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('upcoming')}
                            className={`px-3 py-1 rounded-lg flex items-center gap-1 ${filter === 'upcoming' ? `${appTheme.primary.replace('bg-', 'bg-')} ${appTheme.buttonText}` : `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`}`}
                        >
                            <FaClock /> Upcoming
                        </button>
                        <button
                            onClick={() => setFilter('ongoing')}
                            className={`px-3 py-1 rounded-lg flex items-center gap-1 ${filter === 'ongoing' ? `${appTheme.highlight.replace('text-', 'bg-')} ${appTheme.buttonText}` : `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`}`}
                        >
                            <FaTrophy /> Ongoing
                        </button>
                        <button
                            onClick={() => setFilter('past')}
                            className={`px-3 py-1 rounded-lg flex items-center gap-1 ${filter === 'past' ? `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.text}` : `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`}`}
                        >
                            <FaCalendarAlt /> Past
                        </button>
                    </div>
                </div>
            </div>

            {/* Contests Table */}
            <div className={`overflow-hidden rounded-xl border ${appTheme.border}/20`}>
                <table className="w-full">
                    <thead className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50`}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${appTheme.text} uppercase tracking-wider`}>Title</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${appTheme.text} uppercase tracking-wider`}>Status</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${appTheme.text} uppercase tracking-wider`}>Date</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${appTheme.text} uppercase tracking-wider`}>Duration</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${appTheme.text} uppercase tracking-wider`}>Problems</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${appTheme.text} uppercase tracking-wider`}>Participants</th>
                            <th className={`px-6 py-3 text-right text-xs font-medium ${appTheme.text} uppercase tracking-wider`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentContests.length > 0 ? (
                            currentContests.map(contest => (
                                <tr key={contest._id} className={`hover:${appTheme.cardBg.replace('bg-', 'bg-')}/10`}>
                                    <td className={`px-6 py-4 whitespace-nowrap ${appTheme.text} font-medium`}>
                                        <Link
                                            to={`/admin/contests/${contest._id}`}
                                            className="hover:underline"
                                        >
                                            {contest.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(contest)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${appTheme.cardText}`}>
                                        <div className="flex items-center gap-1">
                                            <FaCalendarAlt className="text-sm" />
                                            {new Date(contest.startTime).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs">
                                            {new Date(contest.startTime).toLocaleTimeString()} - {new Date(contest.endTime).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${appTheme.cardText}`}>
                                        <div className="flex items-center gap-1">
                                            <FaClock className="text-sm" />
                                            {contest.duration} mins
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${appTheme.cardText}`}>
                                        {contest.problems.length} problems
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${appTheme.cardText}`}>
                                        <div className="flex items-center gap-1">
                                            <FaUserFriends className="text-sm" />
                                            {contest.participants || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                to={`/admin/contests/${contest._id}/edit`}
                                                className={`p-2 ${appTheme.cardBg.replace('bg-', 'bg-')} rounded-lg ${appTheme.cardText} hover:${appTheme.primary.replace('bg-', 'bg-')} hover:${appTheme.buttonText} transition-colors`}
                                            >
                                                <FaEdit />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(contest._id)}
                                                className={`p-2 ${appTheme.cardBg.replace('bg-', 'bg-')} rounded-lg ${appTheme.cardText} hover:${appTheme.errorColor.replace('text-', 'bg-')} hover:text-white transition-colors`}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className={`px-6 py-4 text-center ${appTheme.cardText}`}>
                                    No contests found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-lg ${currentPage === 1 ? `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText} opacity-50` : `${appTheme.primary.replace('bg-', 'bg-')} ${appTheme.buttonText}`}`}
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg ${currentPage === page ? `${appTheme.primary.replace('bg-', 'bg-')} ${appTheme.buttonText}` : `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`}`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-lg ${currentPage === totalPages ? `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText} opacity-50` : `${appTheme.primary.replace('bg-', 'bg-')} ${appTheme.buttonText}`}`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ContestManagement;