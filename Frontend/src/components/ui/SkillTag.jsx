import React from 'react';

const SkillTag = ({ name, level }) => {
    const getLevelColor = () => {
        if (level >= 80) return 'bg-green-500';
        if (level >= 60) return 'bg-blue-500';
        if (level >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>{name}</span>
                <span>{level}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                    className={`h-2 rounded-full ${getLevelColor()}`}
                    style={{ width: `${level}%` }}
                ></div>
            </div>
        </div>
    );
};

export default SkillTag;