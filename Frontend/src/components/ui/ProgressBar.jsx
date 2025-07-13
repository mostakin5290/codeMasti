import React from 'react';

const ProgressBar = ({ percentage, color = 'primary' }) => {
    const colorClasses = {
        primary: 'bg-primary',
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
    };

    return (
        <div className="w-full bg-gray-700 rounded-full h-2">
            <div
                className={`h-2 rounded-full ${colorClasses[color]}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;