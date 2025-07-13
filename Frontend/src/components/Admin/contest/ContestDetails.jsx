import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft, FaEdit, FaTrash, FaCalendarAlt,
    FaClock,FaTimes,FaUsers,FaTrophy,FaList
} from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import axiosClient from '../../../api/axiosClient';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../common/LoadingSpinner';

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


const ContestDetails = () => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...appThemeFromContext };
    const { id } = useParams();
    const navigate = useNavigate();

    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [participations, setParticipations] = useState([]);
    const [activeTab, setActiveTab] = useState('problems');

    useEffect(() => {
        const fetchContest = async () => {
            try {
                const { data } = await axiosClient.get(`/contests/${id}`);
                setContest(data);

                // Fetch participations if needed
                if (activeTab === 'participants') {
                    const { data: parts } = await axiosClient.get(`/contests/${id}/participations`);
                    setParticipations(parts);
                }
            } catch (error) {
                toast.error('Failed to fetch contest data');
                navigate('/admin/contests');
            } finally {
                setLoading(false);
            }
        };
        fetchContest();
    }, [id, activeTab, navigate]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this contest?')) {
            try {
                await axiosClient.delete(`/contests/${id}`);
                toast.success('Contest deleted successfully');
                navigate('/admin/contests');
            } catch (error) {
                toast.error('Failed to delete contest');
            }
        }
    };

    const getStatusBadge = () => {
        if (!contest) return null;
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

    if (loading) return <LoadingSpinner message="Loading contest details..." />;
    if (!contest) return <div className={`text-center ${appTheme.text}`}>Contest not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/contests')}
                    className={`flex items-center gap-2 px-4 py-2 ${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText} rounded-lg hover:${appTheme.cardBg.replace('bg-', 'bg-')}/80 transition-colors`}
                >
                    <FaArrowLeft /> Back to Contests
                </button>

                <div className="flex gap-2">
                    <Link
                        to={`/admin/contests/${id}/edit`}
                        className={`flex items-center gap-2 px-4 py-2 ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${appTheme.highlight.replace('text-', 'to-')} ${appTheme.buttonText} rounded-lg font-semibold hover:shadow-lg transition-all duration-300`}
                    >
                        <FaEdit /> Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        className={`flex items-center gap-2 px-4 py-2 ${appTheme.errorColor.replace('text-', 'bg-')} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300`}
                    >
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>

            {/* Contest Header */}
            <div className={`p-6 ${appTheme.cardBg.replace('bg-', 'bg-')}/10 rounded-xl border ${appTheme.border}/20`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className={`text-2xl font-bold ${appTheme.text} flex items-center gap-3`}>
                            {contest.title}
                            {getStatusBadge()}
                        </h2>
                        <p className={`mt-1 ${appTheme.cardText}`}>{contest.description}</p>
                    </div>

                    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 text-center ${appTheme.cardText}`}>
                        <div>
                            <div className="text-sm">Start Time</div>
                            <div className="font-medium flex items-center justify-center gap-1">
                                <FaCalendarAlt />
                                {new Date(contest.startTime).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm">Duration</div>
                            <div className="font-medium flex items-center justify-center gap-1">
                                <FaClock />
                                {contest.duration} mins
                            </div>
                        </div>
                        <div>
                            <div className="text-sm">Participants</div>
                            <div className="font-medium flex items-center justify-center gap-1">
                                <FaUsers />
                                {contest.participants || 0}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('problems')}
                    className={`px-4 py-2 font-medium ${activeTab === 'problems' ? `${appTheme.text} border-b-2 ${appTheme.primary.replace('bg-', 'border-')}` : appTheme.cardText}`}
                >
                    <FaList className="inline mr-2" /> Problems
                </button>
                <button
                    onClick={() => setActiveTab('participants')}
                    className={`px-4 py-2 font-medium ${activeTab === 'participants' ? `${appTheme.text} border-b-2 ${appTheme.primary.replace('bg-', 'border-')}` : appTheme.cardText}`}
                >
                    <FaUsers className="inline mr-2" /> Participants
                </button>
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-4 py-2 font-medium ${activeTab === 'leaderboard' ? `${appTheme.text} border-b-2 ${appTheme.primary.replace('bg-', 'border-')}` : appTheme.cardText}`}
                >
                    <FaTrophy className="inline mr-2" /> Leaderboard
                </button>
            </div>

            {/* Tab Content */}
            <div className={`p-6 ${appTheme.cardBg.replace('bg-', 'bg-')}/10 rounded-xl border ${appTheme.border}/20`}>
                {activeTab === 'problems' && (
                    <div className="space-y-4">
                        <h3 className={`text-xl font-bold ${appTheme.text}`}>Contest Problems</h3>
                        {contest.problems.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50`}>
                                        <tr>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>#</th>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>Title</th>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>Difficulty</th>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>Points</th>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contest.problems.map((problem, index) => (
                                            <tr key={problem._id} className="border-t border-gray-200 dark:border-gray-700">
                                                <td className={`px-4 py-2 ${appTheme.text}`}>{index + 1}</td>
                                                <td className={`px-4 py-2 ${appTheme.text}`}>
                                                    <Link
                                                        to={`/problem/${problem.problemId}`}
                                                        className="hover:underline"
                                                        target="_blank"
                                                    >
                                                        {problem.title || 'Loading...'}
                                                    </Link>
                                                </td>
                                                <td className={`px-4 py-2 ${appTheme.cardText}`}>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                            problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {problem.difficulty}
                                                    </span>
                                                </td>
                                                <td className={`px-4 py-2 ${appTheme.cardText}`}>{problem.points}</td>
                                                <td className={`px-4 py-2 ${appTheme.cardText}`}>
                                                    <button
                                                        onClick={() => {
                                                            // Implement remove problem functionality
                                                            toast.info('Remove functionality would be implemented here');
                                                        }}
                                                        className={`p-1 ${appTheme.errorColor.replace('text-', 'text-')} hover:${appTheme.errorColor.replace('text-', 'bg-')}/10 rounded-full`}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={`text-center ${appTheme.cardText}`}>No problems added to this contest yet</div>
                        )}
                    </div>
                )}

                {activeTab === 'participants' && (
                    <div className="space-y-4">
                        <h3 className={`text-xl font-bold ${appTheme.text}`}>Participants</h3>
                        {participations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50`}>
                                        <tr>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>User</th>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>Joined At</th>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>Submissions</th>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participations.map(participation => (
                                            <tr key={participation._id} className="border-t border-gray-200 dark:border-gray-700">
                                                <td className={`px-4 py-2 ${appTheme.text}`}>
                                                    <Link
                                                        to={`/admin/users/${participation.userId._id}`}
                                                        className="hover:underline"
                                                    >
                                                        {participation.userId.username}
                                                    </Link>
                                                </td>
                                                <td className={`px-4 py-2 ${appTheme.cardText}`}>
                                                    {new Date(participation.startTime).toLocaleString()}
                                                </td>
                                                <td className={`px-4 py-2 ${appTheme.cardText}`}>
                                                    {participation.submissions.length}
                                                </td>
                                                <td className={`px-4 py-2 ${appTheme.cardText}`}>
                                                    {participation.totalPoints || 0}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={`text-center ${appTheme.cardText}`}>No participants yet</div>
                        )}
                    </div>
                )}

                {activeTab === 'leaderboard' && (
                    <div className="space-y-4">
                        <h3 className={`text-xl font-bold ${appTheme.text}`}>Leaderboard</h3>
                        {participations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50`}>
                                        <tr>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>Rank</th>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>User</th>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>Points</th>
                                            <th className={`px-4 py-2 text-left ${appTheme.text}`}>Time Taken</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participations
                                            .sort((a, b) => b.totalPoints - a.totalPoints || a.timeTaken - b.timeTaken)
                                            .map((participation, index) => (
                                                <tr key={participation._id} className="border-t border-gray-200 dark:border-gray-700">
                                                    <td className={`px-4 py-2 ${appTheme.text}`}>
                                                        {index + 1}
                                                        {index < 3 && (
                                                            <span className="ml-1">
                                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={`px-4 py-2 ${appTheme.text}`}>
                                                        <Link
                                                            to={`/admin/users/${participation.userId._id}`}
                                                            className="hover:underline"
                                                        >
                                                            {participation.userId.username}
                                                        </Link>
                                                    </td>
                                                    <td className={`px-4 py-2 ${appTheme.cardText}`}>
                                                        {participation.totalPoints || 0}
                                                    </td>
                                                    <td className={`px-4 py-2 ${appTheme.cardText}`}>
                                                        {participation.timeTaken || '--'} mins
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={`text-center ${appTheme.cardText}`}>No leaderboard data yet</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestDetails;