import React, { useState, useEffect } from 'react';

// Default theme for the app context. This will be merged with actual theme.
// Note: This default theme is a fallback for the component itself.
// The main appTheme comes from the parent via props.
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

const calculateTimeLeft = (targetDate) => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    } else {
        timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return timeLeft;
};

const Countdown = ({ targetDate, appTheme: propAppTheme }) => {
    // Use the passed appTheme prop, or default to ensure theme consistency
    const appTheme = { ...defaultAppTheme, ...(propAppTheme || {}) };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    // Ensure all components (days, hours, minutes, seconds) are always rendered for consistent layout
    const units = ['days', 'hours', 'minutes', 'seconds'];
    const displayNames = {
        days: 'Days',
        hours: 'Hours',
        minutes: 'Minutes',
        seconds: 'Seconds'
    };

    units.forEach((unit) => {
        const value = timeLeft[unit];
        if (value !== undefined) {
            timerComponents.push(
                <div key={unit} className={`text-center ${appTheme.cardBg} rounded-xl p-4 md:p-6 border ${appTheme.border} shadow-lg transition-all duration-300 hover:scale-105`}>
                    <div className={`text-4xl md:text-5xl font-extrabold ${appTheme.text} mb-1`}>
                        {String(value).padStart(2, '0')}
                    </div>
                    <div className={`text-base md:text-lg ${appTheme.cardText} font-medium`}>
                        {displayNames[unit]}
                    </div>
                </div>
            );
        }
    });

    return (
        <div className="flex justify-center items-center space-x-3 md:space-x-5">
            {timerComponents.length ? timerComponents : (
                <div className="text-center">
                    <div className={`text-4xl md:text-5xl font-extrabold ${appTheme.text} mb-1`}>00</div>
                    <div className={`text-base md:text-lg ${appTheme.cardText} font-medium`}>Ended</div>
                </div>
            )}
        </div>
    );
};

export default Countdown;