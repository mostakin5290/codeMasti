import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaPlus, FaEdit, FaTrash, FaClock, FaUserFriends,
    FaCalendarAlt, FaTrophy, FaSearch
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal'; // Import ConfirmationModal

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

    // State for Confirmation Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contestToDeleteId, setContestToDeleteId] = useState(null);
    const [modalIsLoading, setModalIsLoading] = useState(false);


    const fetchContests = useCallback(async () => {
        try {
            const { data } = await axiosClient.get('/contests');
            setContests(data);
        } catch (error) {
            toast.error('Failed to fetch contests');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContests();
    }, [fetchContests]);

    // Function to open the confirmation modal
    const handleDeleteClick = (contestId) => {
        setContestToDeleteId(contestId);
        setShowDeleteModal(true);
    };

    // Function to handle the actual deletion after confirmation
    const confirmDelete = async () => {
        if (!contestToDeleteId) return;

        setModalIsLoading(true);
        try {
            await axiosClient.delete(`/contests/${contestToDeleteId}`);
            setContests(contests.filter(c => c._id !== contestToDeleteId));
            toast.success('Contest deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete contest');
        } finally {
            setModalIsLoading(false);
            setShowDeleteModal(false);
            setContestToDeleteId(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setContestToDeleteId(null);
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

    if (loading) return <LoadingSpinner message="Loading contests..." appTheme={appTheme} />;

    const contestTitleToDelete = contestToDeleteId ? contests.find(c => c._id === contestToDeleteId)?.title : '';

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className={`text-xl sm:text-2xl font-bold ${appTheme.text}`}>Manage Contests</h2>
                <Link
                    to="/admin/contests/create"
                    className={`flex items-center justify-center gap-2 px-4 py-2 w-full md:w-auto ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${appTheme.highlight.replace('text-', 'to-')} ${appTheme.buttonText} rounded-lg font-semibold hover:shadow-lg transition-all duration-300`}
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

                    <div className="flex flex-wrap justify-center gap-2 mt-2 md:mt-0">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-sm transition-colors duration-200 ${filter === 'all' ? `${appTheme.primary.replace('bg-', 'bg-')} ${appTheme.buttonText}` : `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('upcoming')}
                            className={`px-2 py-1 sm:px-3 sm:py-1 rounded-lg flex items-center gap-1 text-sm transition-colors duration-200 ${filter === 'upcoming' ? `${appTheme.primary.replace('bg-', 'bg-')} ${appTheme.buttonText}` : `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`}`}
                        >
                            <FaClock /> Upcoming
                        </button>
                        <button
                            onClick={() => setFilter('ongoing')}
                            className={`px-2 py-1 sm:px-3 sm:py-1 rounded-lg flex items-center gap-1 text-sm transition-colors duration-200 ${filter === 'ongoing' ? `${appTheme.highlight.replace('text-', 'bg-')} ${appTheme.buttonText}` : `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`}`}
                        >
                            <FaTrophy /> Ongoing
                        </button>
                        <button
                            onClick={() => setFilter('past')}
                            className={`px-2 py-1 sm:px-3 sm:py-1 rounded-lg flex items-center gap-1 text-sm transition-colors duration-200 ${filter === 'past' ? `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.text}` : `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`}`}
                        >
                            <FaCalendarAlt /> Past
                        </button>
                    </div>
                </div>
            </div>

            {/* Contests Table */}
            <div className={`overflow-x-auto rounded-xl border ${appTheme.border}/20`}>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50`}>
                        <tr>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${appTheme.text} uppercase tracking-wider sm:px-6 sm:py-3`}>Title</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${appTheme.text} uppercase tracking-wider sm:px-6 sm:py-3`}>Status</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${appTheme.text} uppercase tracking-wider sm:px-6 sm:py-3`}>Date</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${appTheme.text} uppercase tracking-wider sm:px-6 sm:py-3`}>Duration</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${appTheme.text} uppercase tracking-wider sm:px-6 sm:py-3`}>Problems</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${appTheme.text} uppercase tracking-wider sm:px-6 sm:py-3`}>Participants</th>
                            <th className={`px-3 py-2 text-right text-xs font-medium ${appTheme.text} uppercase tracking-wider sm:px-6 sm:py-3`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentContests.length > 0 ? (
                            currentContests.map(contest => (
                                <tr key={contest._id} className={`hover:${appTheme.cardBg.replace('bg-', 'bg-')}/10`}>
                                    <td className={`px-3 py-3 sm:px-6 sm:py-4 ${appTheme.text} font-medium text-sm`}>
                                        <Link
                                            to={`/admin/contests/${contest._id}`}
                                            className="hover:underline"
                                        >
                                            {contest.title}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                                        {getStatusBadge(contest)}
                                    </td>
                                    <td className={`px-3 py-3 sm:px-6 sm:py-4 ${appTheme.cardText} text-sm`}>
                                        <div className="flex items-center gap-1">
                                            <FaCalendarAlt className="text-sm" />
                                            {new Date(contest.startTime).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs">
                                            {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(contest.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className={`px-3 py-3 sm:px-6 sm:py-4 ${appTheme.cardText} text-sm`}>
                                        <div className="flex items-center gap-1">
                                            <FaClock className="text-sm" />
                                            {contest.duration} mins
                                        </div>
                                    </td>
                                    <td className={`px-3 py-3 sm:px-6 sm:py-4 ${appTheme.cardText} text-sm`}>
                                        {contest.problems.length} problems
                                    </td>
                                    <td className={`px-3 py-3 sm:px-6 sm:py-4 ${appTheme.cardText} text-sm`}>
                                        <div className="flex items-center gap-1">
                                            <FaUserFriends className="text-sm" />
                                            {contest.participants || 0}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 sm:px-6 sm:py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-1 sm:gap-2">
                                            <Link
                                                to={`/admin/contests/${contest._id}/edit`}
                                                className={`p-1.5 sm:p-2 ${appTheme.cardBg.replace('bg-', 'bg-')} rounded-lg ${appTheme.cardText} hover:${appTheme.primary.replace('bg-', 'bg-')} hover:${appTheme.buttonText} transition-colors text-base`}
                                            >
                                                <FaEdit />
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(contest._id)} // Changed to open modal
                                                className={`p-1.5 sm:p-2 ${appTheme.cardBg.replace('bg-', 'bg-')} rounded-lg ${appTheme.cardText} hover:${appTheme.errorColor.replace('text-', 'bg-')} hover:text-white transition-colors text-base`}
                                                disabled={modalIsLoading} // Disable button when modal is loading
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className={`px-3 py-4 text-center ${appTheme.cardText} sm:px-6`}>
                                    No contests found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 sm:gap-2 mt-4">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 rounded-lg text-sm ${currentPage === 1 ? `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText} opacity-50` : `${appTheme.primary.replace('bg-', 'bg-')} ${appTheme.buttonText}`} transition-all duration-200`}
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm ${currentPage === page ? `${appTheme.primary.replace('bg-', 'bg-')} ${appTheme.buttonText}` : `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`} transition-all duration-200`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-2 py-1 rounded-lg text-sm ${currentPage === totalPages ? `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText} opacity-50` : `${appTheme.primary.replace('bg-', 'bg-')} ${appTheme.buttonText}`} transition-all duration-200`}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            {showDeleteModal && (
                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={handleCancelDelete}
                    onConfirm={confirmDelete}
                    isLoading={modalIsLoading}
                    title="Delete Contest?"
                    confirmText="Delete Contest"
                    appTheme={appTheme}
                >
                    <p className={`${appTheme.cardText}`}>
                        Are you sure you want to permanently delete the contest:<br />
                        <strong className={`${appTheme.primary.replace('bg-', 'text-')}`}>"{contestTitleToDelete}"</strong>?
                    </p>
                    <p className={`mt-2 text-sm ${appTheme.errorColor}`}>
                        This action cannot be undone and will remove all associated data (problems, participant records, etc.).
                    </p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default ContestManagement;