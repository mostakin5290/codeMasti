import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaClock,FaCheckCircle, FaCalendarAlt, FaPlayCircle, FaListAlt, FaTimes } from 'react-icons/fa';
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

const ContestParticipationPage = () => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...appThemeFromContext };
    const { id } = useParams(); // contest ID
    const navigate = useNavigate();

    const [contest, setContest] = useState(null);
    const [participation, setParticipation] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0); // in minutes initially, then seconds
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchContestData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosClient.get(`/contests/${id}/participate`);
            setContest(data.contest);
            setParticipation(data.participation);
            setTimeLeft(data.timeLeft * 60); // Convert minutes to seconds for countdown
        } catch (err) {
            console.error("Error fetching participation data:", err);
            const errorMessage = err.response?.data?.error || "Failed to load contest participation details.";
            setError(errorMessage);
            toast.error(errorMessage);
            // Navigate away if the contest is not active or user is not registered
            if (err.response?.status === 400 || err.response?.status === 403 || err.response?.status === 404) {
                navigate('/contests'); // Redirect to contests list
            }
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchContestData();
    }, [fetchContestData]);

    useEffect(() => {
        if (timeLeft <= 0 || !contest || new Date() > new Date(contest.endTime)) {
            // Contest ended or not started yet based on local time
            if (!loading && contest && new Date() > new Date(contest.endTime)) {
                toast.info("This contest has ended!");
                navigate(`/contests/${id}/leaderboard`); // Redirect to leaderboard if ended
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) { // When it hits 0 or less
                    clearInterval(timer);
                    toast.info("The contest has ended!");
                    navigate(`/contests/${id}/leaderboard`); // Redirect
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000); // Update every second

        return () => clearInterval(timer); // Cleanup on unmount
    }, [timeLeft, contest, id, loading, navigate]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0) // Hide hours if 0
            .join(":");
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${appTheme.background}`}>
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <LoadingSpinner message="Loading contest..." />
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

    if (!contest || !participation) {
        return (
            <div className={`min-h-screen ${appTheme.background}`}>
                <Header />
                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center ${appTheme.text}`}>
                    <p className={`${appTheme.errorColor} mb-4`}>Contest or participation data not found.</p>
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

    // Check if contest is truly ongoing based on the fetched data and current time
    const now = new Date();
    const isContestActive = now >= new Date(contest.startTime) && now <= new Date(contest.endTime);

    if (!isContestActive) {
        // If the contest is no longer active (might have just ended or was already past)
        toast.info("This contest is not currently active.");
        navigate(`/contests/${id}/leaderboard`); // Redirect to leaderboard
        return null; // Don't render anything while redirecting
    }

    return (
        <div className={`min-h-screen flex flex-col ${appTheme.background}`}>
            <Header />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Contest Header */}
                <div className={`p-6 rounded-xl border ${appTheme.border}/20 shadow-md ${appTheme.cardBg} mb-6`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className={`text-3xl font-bold ${appTheme.text}`}>{contest.title}</h1>
                            <p className={`mt-2 ${appTheme.cardText}`}>{contest.description}</p>
                        </div>
                        <div className="flex items-center gap-4 text-center">
                            <div className={`p-3 rounded-lg ${appTheme.iconBg} ${appTheme.highlight}`}>
                                <FaClock className="text-2xl" />
                            </div>
                            <div>
                                <div className={`text-xl font-bold ${appTheme.text}`}>
                                    {formatTime(timeLeft)}
                                </div>
                                <div className={`text-sm ${appTheme.cardText}`}>Time Left</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Problems List */}
                <div className={`p-6 rounded-xl border ${appTheme.border}/20 shadow-md ${appTheme.cardBg}`}>
                    <h2 className={`text-2xl font-bold mb-6 ${appTheme.text}`}>Problems</h2>
                    {contest.problems.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className={`${appTheme.cardBg.replace('bg-', 'bg-')}/50`}>
                                    <tr>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>#</th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Title</th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Difficulty</th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Points</th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Status</th> {/* e.g., Solved, Attempted */}
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {contest.problems.map((prob, index) => {
                                        // Find user's last submission for this problem in this contest
                                        // This is a simplified check. A real system would check for 'Accepted' status.
                                        const userSubmissions = participation.submissions.filter(
                                            s => s.problemId.toString() === prob.problemId._id.toString()
                                        );
                                        const isSolved = userSubmissions.some(s => s.points > 0); // Assuming points > 0 means solved/accepted

                                        return (
                                            <tr key={prob.problemId._id}>
                                                <td className={`px-6 py-4 whitespace-nowrap ${appTheme.text}`}>{index + 1}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap ${appTheme.highlight}`}>{prob.problemId.title}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap`}>
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${prob.problemId.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                        prob.problemId.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {prob.problemId.difficulty}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap ${appTheme.cardText}`}>{prob.points}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap ${appTheme.cardText}`}>
                                                    {isSolved ? (
                                                        <span className={`${appTheme.successColor} flex items-center gap-1`}>
                                                            <FaCheckCircle /> Solved
                                                        </span>
                                                    ) : (
                                                        <span className={`${appTheme.warningColor} flex items-center gap-1`}>
                                                            <FaTimes /> Unattempted
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        // This link should now point to your Codefield page
                                                        // It needs both problemId (from params) and contestId (as query param)
                                                        to={`/codefield/${prob.problemId._id}?contestId=${contest._id}`} // <-- FIX THIS LINE
                                                        className={`px-4 py-2 ${appTheme.buttonPrimary} ${appTheme.buttonText} rounded-lg hover:${appTheme.buttonPrimaryHover} transition-colors`}
                                                    >
                                                        Solve
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className={`text-center ${appTheme.cardText}`}>No problems available for this contest yet.</p>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContestParticipationPage;