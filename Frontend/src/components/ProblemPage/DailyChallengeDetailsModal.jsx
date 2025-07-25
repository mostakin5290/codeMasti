// components/Modals/DailyChallengeDetailsModal.jsx (create this file)
import React from 'react';
import { Link } from 'react-router-dom';
import { FaExternalLinkAlt, FaTag, FaInfoCircle, FaCalendarDay } from 'react-icons/fa';

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const DailyChallengeDetailsModal = ({ isOpen, onClose, challengeDetails, appTheme, updateRecentlyViewed }) => {
    if (!isOpen || !challengeDetails || !challengeDetails.problemId) return null;

    const problem = challengeDetails.problemId;
    const challengeDate = new Date(challengeDetails.dailyChallengeDate);

    const difficultyPill = (difficulty) => {
        const colors = {
            easy: `${appTheme.iconBg} ${appTheme.highlightSecondary} border ${appTheme.highlightSecondary.replace('text-', 'border-')}/40`,
            medium: `${appTheme.iconBg} ${appTheme.highlightTertiary} border ${appTheme.highlightTertiary.replace('text-', 'border-')}/40`,
            hard: `${appTheme.iconBg} ${appTheme.highlight} border ${appTheme.highlight.replace('text-', 'border-')}/40`,
        };
        const defaultColor = `bg-gray-700 text-gray-300 border border-gray-600`;

        return (
            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${colors[difficulty.toLowerCase()] || defaultColor}`}>
                {capitalizeFirstLetter(difficulty)}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm px-4">
            <div className={`${appTheme.cardBg} rounded-xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border ${appTheme.border}/30 relative`}>
                <h2 className={`text-2xl font-bold ${appTheme.text} mb-4 flex items-center gap-2`}>
                    <FaCalendarDay className={`h-6 w-6 ${appTheme.highlight}`} />
                    Daily Challenge Details
                </h2>

                <p className={`${appTheme.cardText} mb-4 text-sm`}>
                    <span className="font-semibold">Date:</span> {challengeDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <div className="mb-6 space-y-3">
                    <h3 className={`text-xl font-semibold ${appTheme.highlightSecondary}`}>{problem.title}</h3>
                    <div className="flex items-center gap-3">
                        {difficultyPill(problem.difficulty)}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {problem.tags?.map(tag => (
                            <span
                                key={tag}
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${appTheme.iconBg} ${appTheme.highlightSecondary} border ${appTheme.accent.replace('bg-', 'border-')}/20`}
                            >
                                <FaTag className="w-3 h-3 mr-1" />
                                {capitalizeFirstLetter(tag)}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className={`px-5 py-2 ${appTheme.cardBg}/50 border ${appTheme.border}/50 ${appTheme.cardText} rounded-lg hover:${appTheme.cardBg}/80 transition-all duration-200 font-medium`}
                    >
                        Close
                    </button>
                    <Link
                        to={`/codefield/${problem._id}`}
                        onClick={() => {
                            updateRecentlyViewed(problem._id);
                            onClose();
                        }}
                        className={`inline-flex items-center px-6 py-2 ${appTheme.buttonPrimary} hover:${appTheme.buttonPrimaryHover} ${appTheme.buttonText} rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-${appTheme.accent.replace('bg-', '')}-500 focus:ring-opacity-50`}
                    >
                        <FaExternalLinkAlt className="mr-2 h-4 w-4" />
                        Go to Problem
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DailyChallengeDetailsModal;