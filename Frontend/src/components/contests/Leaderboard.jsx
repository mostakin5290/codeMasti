import React from 'react';
import { FaTrophy, FaUserCircle } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

// Default theme for the app context. This will be merged with actual theme.
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

const Leaderboard = ({ rankings, appTheme: propAppTheme }) => {
    // Use the passed appTheme prop, or default to ensure theme consistency
    const appTheme = { ...defaultAppTheme, ...(propAppTheme || {}) };

    if (!rankings || rankings.length === 0) {
        return <div className={`text-center p-8 ${appTheme.cardText}`}>Leaderboard data is not available.</div>;
    }

    const rankColor = (rank) => {
        if (rank === 1) return appTheme.highlight; // Primary highlight for 1st place
        if (rank === 2) return appTheme.highlightSecondary; // Secondary highlight for 2nd place
        if (rank === 3) return appTheme.highlightTertiary; // Tertiary highlight for 3rd place
        return appTheme.cardText; // Muted text for others
    };

    return (
        <div className={`overflow-x-auto ${appTheme.cardBg}/5 rounded-xl border ${appTheme.border}/20 p-4`}>
            <table className="table w-full">
                {/* head */}
                <thead>
                    <tr>
                        <th className={`${appTheme.cardText}`}>Rank</th>
                        <th className={`${appTheme.cardText}`}>User</th>
                        <th className={`${appTheme.cardText}`}>Score</th>
                        <th className={`${appTheme.cardText}`}>Finish Time</th>
                    </tr>
                </thead>
                <tbody>
                    {rankings.map((entry) => (
                        <tr key={entry.rank} className={`hover:${appTheme.cardBg}/10 transition-colors`}>
                            <td className={`font-bold text-lg ${rankColor(entry.rank)}`}>
                                {entry.rank <= 3 ? <FaTrophy className="inline mr-2" /> : ''}
                                {entry.rank}
                            </td>
                            <td>
                                <div className="flex items-center gap-3">
                                    <FaUserCircle className={`text-2xl ${appTheme.primary}`} />
                                    <span className={`font-medium ${appTheme.text}`}>{entry.user}</span>
                                </div>
                            </td>
                            <td className={`font-mono ${appTheme.cardText}`}>{entry.score}</td>
                            <td className={`font-mono ${appTheme.cardText}`}>{entry.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;