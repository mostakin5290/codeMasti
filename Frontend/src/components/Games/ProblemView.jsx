// src/components/ProblemView.jsx (Basic version, adapt to your needs)
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ProblemView = ({ problem }) => {
    const { theme } = useTheme();

    if (!problem) {
        return <div className={`${theme.text}`}>No problem selected for this game yet.</div>;
    }

    return (
        <div className={`${theme.cardBg} p-6 rounded-lg shadow-xl border ${theme.border}`}>
            <h3 className={`text-2xl font-bold mb-4 ${theme.highlight}`}>{problem.title}</h3>
            <p className={`text-md mb-2 ${theme.cardText}`}>Difficulty: <span className="capitalize">{problem.difficulty}</span></p>
            <div className={`prose ${theme.text} mb-4`}>
                <p>{problem.description}</p>
            </div>
            {/* You can add more details like tags, visible test cases etc. here */}
        </div>
    );
};

export default ProblemView;