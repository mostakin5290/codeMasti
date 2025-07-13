import React from 'react';
import { Link } from 'react-router-dom';
import Countdown from './Countdown';
import { FaCalendarAlt, FaClock, FaUsers, FaTrophy } from 'react-icons/fa';
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

const FeaturedContestCard = ({ contest }) => {
    // Use the passed appTheme prop, or default to ensure theme consistency
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };

    if (!contest) return null;

    const formatDateTime = (date) => {
        return date.toLocaleString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className={`relative bg-gradient-to-br ${appTheme.primary.replace('bg-', 'from-')}/20 ${appTheme.secondary.replace('bg-', 'to-')}/20 rounded-2xl border ${appTheme.primary.replace('bg-', 'border-')}/50 p-8 shadow-2xl overflow-hidden mb-12`}>
            {/* Background Glow */}
            <div className={`absolute -top-1/4 -right-1/4 w-1/2 h-1/2 ${appTheme.primary.replace('bg-', 'bg-')}/30 rounded-full blur-3xl opacity-50 animate-pulse`}></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Side: Details */}
                <div>
                    <span className={`${appTheme.highlight} font-semibold uppercase tracking-wider`}>Next Up</span>
                    <h2 className={`text-4xl font-bold ${appTheme.text} mt-2 mb-4`}>{contest.title}</h2>
                    <p className={`${appTheme.cardText} mb-6 text-lg`}>
                        {contest.description || 'Get ready for the next challenge. Sharpen your skills and compete!'}
                    </p>
                    <div className={`grid grid-cols-2 gap-4 ${appTheme.cardText}`}>
                        <div className="flex items-center gap-3">
                            <FaCalendarAlt className={`${appTheme.highlightSecondary}`} />
                            <span>{formatDateTime(new Date(contest.startTime))}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FaClock className={`${appTheme.highlightSecondary}`} />
                            <span>{contest.duration} hours</span> {/* Assuming duration is in hours, added "hours" */}
                        </div>
                        <div className="flex items-center gap-3">
                            <FaTrophy className={`${appTheme.highlightSecondary}`} />
                            <span className="capitalize">{contest.type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FaUsers className={`${appTheme.highlightSecondary}`} />
                            <span>{contest.participants.toLocaleString()} Registered</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Countdown & Action */}
                <div className="text-center">
                    <h3 className={`text-2xl font-semibold ${appTheme.text} mb-3`}>Starts In</h3>
                    <Countdown targetDate={contest.startTime} appTheme={appTheme} /> {/* Pass appTheme to Countdown */}
                    <Link to={`/contests/${contest.slug}`} className={`px-6 py-3 rounded-lg ${appTheme.primary} ${appTheme.buttonText} hover:${appTheme.primaryHover} text-lg w-full max-w-xs mt-4`}>
                        Register Now & View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FeaturedContestCard;