import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { FaUsers, FaListAlt, FaPaperPlane, FaCrown, FaUserShield, FaUserCog, FaUserAlt, FaCalendarPlus, FaChartLine } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

// Default theme for fallback (already provided, just ensuring it's here for reference)
const defaultAppTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};


const StatCard = ({ icon, title, value, gradientColorClass, iconColorClass, appTheme }) => {
    return (
        <div className={`bg-gradient-to-br ${gradientColorClass} p-6 rounded-xl border ${appTheme.border}/20 shadow-lg`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-lg font-medium ${appTheme.cardText}`}>{title}</p>
                    <p className={`text-4xl font-extrabold ${appTheme.text}`}>{value}</p>
                </div>
                <div className={`text-5xl ${iconColorClass}`}>{icon}</div>
            </div>
        </div>
    );
};

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };


    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axiosClient.get('/admin/stats');
                setStats(data);
                console.log("Fetched Stats:", data); // Log the new data
            } catch (error) {
                console.error("Failed to fetch stats:", error);
                // toast.error("Failed to fetch dashboard stats."); // Optionally show a toast
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <LoadingSpinner message="Loading dashboard..." appTheme={appTheme} />;
    }

    return (
        <div className={`min-h-screen ${appTheme.background} p-4 sm:p-6 lg:p-8`}>
            <h1 className={`text-3xl font-bold ${appTheme.highlight} mb-8`}>Admin Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {/* Main Stat Cards */}
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers ?? '0'}
                    icon={<FaUsers />}
                    gradientColorClass={`${appTheme.primary.replace('bg-', 'from-')}/30 ${appTheme.highlightSecondary.replace('text-', 'to-')}/30`}
                    iconColorClass={`${appTheme.highlightSecondary}`}
                    appTheme={appTheme}
                />
                <StatCard
                    title="Total Problems"
                    value={stats?.totalProblems ?? '0'}
                    icon={<FaListAlt />}
                    gradientColorClass={`${appTheme.secondary.replace('bg-', 'from-')}/30 ${appTheme.highlightTertiary.replace('text-', 'to-')}/30`}
                    iconColorClass={`${appTheme.highlightTertiary}`}
                    appTheme={appTheme}
                />
                <StatCard
                    title="Total Submissions"
                    value={stats?.totalSubmissions ?? '0'}
                    icon={<FaPaperPlane />}
                    gradientColorClass={`${appTheme.highlight.replace('text-', 'from-')}/30 ${appTheme.primary.replace('bg-', 'to-')}/30`}
                    iconColorClass={`${appTheme.highlight}`}
                    appTheme={appTheme}
                />
            </div>

            {/* Detailed User Stats */}
            <div className={`mb-10 p-6 rounded-xl border ${appTheme.border}/20 shadow-lg ${appTheme.cardBg}`}>
                <h2 className={`text-xl font-bold ${appTheme.highlightSecondary} mb-4`}>User Statistics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                        <FaCrown className={`text-3xl ${appTheme.highlightTertiary}`} />
                        <div>
                            <p className={`text-lg font-medium ${appTheme.cardText}`}>Premium Users</p>
                            <p className={`text-2xl font-bold ${appTheme.text}`}>{stats?.premiumUsers ?? '0'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <FaUserAlt className={`text-3xl ${appTheme.cardText}`} />
                        <div>
                            <p className={`text-lg font-medium ${appTheme.cardText}`}>Non-Premium Users</p>
                            <p className={`text-2xl font-bold ${appTheme.text}`}>{stats?.nonPremiumUsers ?? '0'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <FaCalendarPlus className={`text-3xl ${appTheme.infoColor}`} />
                        <div>
                            <p className={`text-lg font-medium ${appTheme.cardText}`}>New Users (Last 30 Days)</p>
                            <p className={`text-2xl font-bold ${appTheme.text}`}>{stats?.newUsersLast30Days ?? '0'}</p>
                        </div>
                    </div>
                </div>
                
                <h3 className={`text-lg font-semibold ${appTheme.highlightSecondary} mt-6 mb-3`}>Users by Role:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <FaUserShield className={`text-2xl ${appTheme.primary}`} />
                        <span className={`${appTheme.cardText}`}>Admins: </span>
                        <span className={`${appTheme.text} font-semibold`}>{stats?.usersByRole?.admin ?? '0'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaUserCog className={`text-2xl ${appTheme.secondary}`} />
                        <span className={`${appTheme.cardText}`}>Co-Admins: </span>
                        <span className={`${appTheme.text} font-semibold`}>{stats?.usersByRole?.['co-admin'] ?? '0'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaUserAlt className={`text-2xl ${appTheme.cardText}`} />
                        <span className={`${appTheme.cardText}`}>Regular Users: </span>
                        <span className={`${appTheme.text} font-semibold`}>{stats?.usersByRole?.user ?? '0'}</span>
                    </div>
                </div>
            </div>

            {/* Detailed Problem & Submission Stats */}
            <div className={`mb-10 p-6 rounded-xl border ${appTheme.border}/20 shadow-lg ${appTheme.cardBg}`}>
                <h2 className={`text-xl font-bold ${appTheme.highlightSecondary} mb-4`}>Content & Activity Statistics</h2>
                
                <h3 className={`text-lg font-semibold ${appTheme.highlightSecondary} mb-3`}>Problems by Difficulty:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <span className={`text-2xl ${appTheme.successColor}`}>●</span>
                        <span className={`${appTheme.cardText}`}>Easy: </span>
                        <span className={`${appTheme.text} font-semibold`}>{stats?.problemsByDifficulty?.Easy ?? '0'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-2xl ${appTheme.warningColor}`}>●</span>
                        <span className={`${appTheme.cardText}`}>Medium: </span>
                        <span className={`${appTheme.text} font-semibold`}>{stats?.problemsByDifficulty?.Medium ?? '0'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-2xl ${appTheme.errorColor}`}>●</span>
                        <span className={`${appTheme.cardText}`}>Hard: </span>
                        <span className={`${appTheme.text} font-semibold`}>{stats?.problemsByDifficulty?.Hard ?? '0'}</span>
                    </div>
                </div>

                <h3 className={`text-lg font-semibold ${appTheme.highlightSecondary} mt-6 mb-3`}>Submissions by Status:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(stats?.submissionsByStatus || {}).map(([status, count]) => (
                        <div key={status} className="flex items-center gap-3">
                            <span className={`${appTheme.cardText}`}>{status}: </span>
                            <span className={`${appTheme.text} font-semibold`}>{count}</span>
                        </div>
                    ))}
                    {Object.keys(stats?.submissionsByStatus || {}).length === 0 && (
                        <p className={`${appTheme.cardText} text-sm`}>No submissions recorded yet.</p>
                    )}
                </div>

                <h3 className={`text-lg font-semibold ${appTheme.highlightSecondary} mt-6 mb-3`}>Top 5 Most Solved Problems:</h3>
                {stats?.topSolvedProblems?.length > 0 ? (
                    <ul className="space-y-2">
                        {stats.topSolvedProblems.map((problem, index) => (
                            <li key={index} className="flex items-center justify-between">
                                <span className={`${appTheme.cardText}`}>{problem.title} 
                                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full 
                                        ${problem.difficulty === 'Easy' ? `bg-emerald-500/20 text-emerald-400` :
                                        problem.difficulty === 'Medium' ? `bg-amber-500/20 text-amber-400` :
                                        `bg-red-500/20 text-red-400`}`}>
                                        {problem.difficulty}
                                    </span>
                                </span>
                                <span className={`${appTheme.text} font-semibold`}>{problem.solvedCount} Solves</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={`${appTheme.cardText} text-sm`}>No problems have been solved yet.</p>
                )}
            </div>

            {/* General Welcome/Info Card */}
            <div className={`mt-10 p-6 ${appTheme.cardBg}/5 rounded-xl border ${appTheme.border}/20`}>
                <h2 className={`text-2xl font-bold ${appTheme.text}`}>Welcome, Admin!</h2>
                <p className={`${appTheme.cardText} mt-2`}>
                    This is your control center. From here you can manage users, add or edit coding problems, and update site content.
                </p>
                <div className="mt-4 flex items-center gap-2">
                    <FaChartLine className={`${appTheme.infoColor}`} />
                    <p className={`${appTheme.cardText} text-sm`}>
                        Future updates will include interactive charts and more detailed analytics.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;