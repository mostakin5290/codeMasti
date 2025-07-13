import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { FaUsers, FaListAlt, FaPaperPlane } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

// Default theme for fallback
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
    // StatCard now takes dynamic gradientColorClass and iconColorClass
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

    // Get theme from context
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };


    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axiosClient.get('/admin/stats');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        // Pass appTheme to LoadingSpinner as well
        return <LoadingSpinner message="Loading dashboard..." appTheme={appTheme} />;
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers ?? '0'}
                    icon={<FaUsers />}
                    gradientColorClass={`${appTheme.primary.replace('bg-', 'from-')}/30 ${appTheme.highlightSecondary.replace('text-', 'to-')}/30`} // Dynamic gradient
                    iconColorClass={`${appTheme.highlightSecondary}/30`} // Dynamic icon color
                    appTheme={appTheme} // Pass appTheme to StatCard
                />
                <StatCard
                    title="Total Problems"
                    value={stats?.totalProblems ?? '0'}
                    icon={<FaListAlt />}
                    gradientColorClass={`${appTheme.secondary.replace('bg-', 'from-')}/30 ${appTheme.highlightTertiary.replace('text-', 'to-')}/30`}
                    iconColorClass={`${appTheme.highlightTertiary}/30`}
                    appTheme={appTheme}
                />
                <StatCard
                    title="Total Submissions"
                    value={stats?.totalSubmissions ?? '0'}
                    icon={<FaPaperPlane />}
                    gradientColorClass={`${appTheme.highlight.replace('text-', 'from-')}/30 ${appTheme.primary.replace('bg-', 'to-')}/30`}
                    iconColorClass={`${appTheme.highlight}/30`}
                    appTheme={appTheme}
                />
            </div>
            <div className={`mt-10 p-6 ${appTheme.cardBg}/5 rounded-xl border ${appTheme.border}/20`}>
                <h2 className={`text-2xl font-bold ${appTheme.text}`}>Welcome, Admin!</h2>
                <p className={`${appTheme.cardText} mt-2`}>
                    This is your control center. From here you can manage users, add or edit coding problems, and update site content.
                </p>
            </div>
        </div>
    );
};

export default AdminDashboardPage;