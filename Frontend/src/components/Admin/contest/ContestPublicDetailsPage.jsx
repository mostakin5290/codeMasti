import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft, FaCalendarAlt, FaClock, FaUsers,
    FaList, FaTrophy, FaEye
} from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import axiosClient from '../../../api/axiosClient';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';

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

const ContestPublicDetailsPage = () => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...appThemeFromContext };
    const { id } = useParams();
    const navigate = useNavigate();

    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchContest = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Reusing the GetContestDetails endpoint
            const { data } = await axiosClient.get(`/contests/${id}`);
            setContest(data);
        } catch (err) {
            console.error("Failed to fetch contest details:", err);
            const errorMessage = err.response?.data?.error || "Failed to load contest details.";
            setError(errorMessage);
            toast.error(errorMessage);
            navigate('/contests'); // Redirect to contests list on error
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchContest();
    }, [fetchContest]);

    const getStatusBadge = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        let statusText = 'Unknown';
        let statusClass = appTheme.cardBg.replace('bg-', 'bg-') + ' ' + appTheme.cardText; // Default neutral

        if (start > now) {
            statusText = 'Upcoming';
            statusClass = `${appTheme.infoColor.replace('text-', 'bg-')} ${appTheme.buttonText}`;
        } else if (end < now) {
            statusText = 'Completed';
            statusClass = `${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText}`;
        } else {
            statusText = 'Ongoing';
            statusClass = `${appTheme.successColor.replace('text-', 'bg-')} ${appTheme.buttonText}`;
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                {statusText}
            </span>
        );
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${appTheme.background}`}>
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <LoadingSpinner message="Loading contest details..." />
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
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                    <button
                        onClick={() => navigate('/contests')}
                        className={`flex items-center gap-2 px-4 py-2 ${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText} rounded-lg hover:${appTheme.cardBg.replace('bg-', 'bg-')}/80 transition-colors`}
                    >
                        <FaArrowLeft /> Back to Contests
                    </button>
                    <h1 className={`text-3xl font-bold ${appTheme.text} flex items-center gap-3 text-center sm:text-left`}>
                        {contest.title}
                        {getStatusBadge(contest.startTime, contest.endTime)}
                    </h1>
                    <Link
                        to={`/contests/${id}/leaderboard`}
                        className={`flex items-center gap-2 px-4 py-2 ${appTheme.buttonPrimary} ${appTheme.buttonText} rounded-lg font-semibold hover:${appTheme.buttonPrimaryHover} transition-all duration-300`}
                    >
                        <FaTrophy /> View Leaderboard
                    </Link>
                </div>

                {/* Contest Details */}
                <div className={`p-6 rounded-xl border ${appTheme.border}/20 shadow-md ${appTheme.cardBg} mb-6`}>
                    <h2 className={`text-2xl font-bold mb-4 ${appTheme.text}`}>Contest Information</h2>
                    <p className={`mb-4 ${appTheme.cardText}`}>{contest.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50 p-3 rounded-lg border ${appTheme.border}/30 flex items-center gap-2`}>
                            <FaCalendarAlt className={appTheme.highlight} />
                            <div>
                                <div className={`${appTheme.cardText} text-xs`}>Start Time</div>
                                <div className={`${appTheme.text} font-medium`}>{new Date(contest.startTime).toLocaleString()}</div>
                            </div>
                        </div>
                        <div className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50 p-3 rounded-lg border ${appTheme.border}/30 flex items-center gap-2`}>
                            <FaClock className={appTheme.highlight} />
                            <div>
                                <div className={`${appTheme.cardText} text-xs`}>Duration</div>
                                <div className={`${appTheme.text} font-medium`}>{contest.duration} mins</div>
                            </div>
                        </div>
                        <div className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50 p-3 rounded-lg border ${appTheme.border}/30 flex items-center gap-2`}>
                            <FaCalendarAlt className={appTheme.highlight} />
                            <div>
                                <div className={`${appTheme.cardText} text-xs`}>End Time</div>
                                <div className={`${appTheme.text} font-medium`}>{new Date(contest.endTime).toLocaleString()}</div>
                            </div>
                        </div>
                        <div className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50 p-3 rounded-lg border ${appTheme.border}/30 flex items-center gap-2`}>
                            <FaUsers className={appTheme.highlight} />
                            <div>
                                <div className={`${appTheme.cardText} text-xs`}>Max Participants</div>
                                <div className={`${appTheme.text} font-medium`}>{contest.maxParticipants || 'Unlimited'}</div>
                            </div>
                        </div>
                        <div className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50 p-3 rounded-lg border ${appTheme.border}/30 flex items-center gap-2`}>
                            <FaEye className={appTheme.highlight} />
                            <div>
                                <div className={`${appTheme.cardText} text-xs`}>Visibility</div>
                                <div className={`${appTheme.text} font-medium`}>{contest.isPublic ? 'Public' : 'Private'}</div>
                            </div>
                        </div>
                        <div className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50 p-3 rounded-lg border ${appTheme.border}/30 flex items-center gap-2`}>
                            <FaUsers className={appTheme.highlight} />
                            <div>
                                <div className={`${appTheme.cardText} text-xs`}>Created By</div>
                                <div className={`${appTheme.text} font-medium`}>{contest.createdBy?.username || 'Admin'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Problems List */}
                <div className={`p-6 rounded-xl border ${appTheme.border}/20 shadow-md ${appTheme.cardBg}`}>
                    <h2 className={`text-2xl font-bold mb-6 ${appTheme.text}`}>Contest Problems</h2>
                    {contest.problems.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50`}>
                                    <tr>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>#</th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Title</th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Difficulty</th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Points</th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>View</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {contest.problems.map((prob, index) => (
                                        <tr key={prob._id || prob.problemId._id}>
                                            <td className={`px-6 py-4 whitespace-nowrap ${appTheme.text}`}>{index + 1}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap ${appTheme.highlight}`}>
                                                {/* Link to general problem details page */}
                                                <Link to={`/problems/${prob.problemId._id}`} className="hover:underline">
                                                    {prob.problemId?.title || 'Unknown Problem'}
                                                </Link>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap`}>
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    prob.problemId?.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                    prob.problemId?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {prob.problemId?.difficulty || 'N/A'}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap ${appTheme.cardText}`}>{prob.points}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    to={`/codefield/${prob.problemId._id}`} // Link to the problem's own page (not contest-specific solving)
                                                    className={`px-3 py-1 ${appTheme.buttonSecondary} ${appTheme.buttonText} rounded-lg text-sm hover:${appTheme.buttonSecondaryHover} transition-colors`}
                                                >
                                                    View Problem
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className={`text-center ${appTheme.cardText}`}>No problems added to this contest yet.</p>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContestPublicDetailsPage;