import React, { useState } from 'react';
import { FaPlus, FaTimes, FaSearch } from 'react-icons/fa';



const ProblemSelector = ({
    problems,
    selectedProblems,
    onAddProblem,
    onRemoveProblem,
    searchTerm,
    onSearchChange,
    appTheme
}) => {
    const [selectedProblemId, setSelectedProblemId] = useState('');
    const [points, setPoints] = useState(100);

    const filteredProblems = problems.filter(problem =>
        !selectedProblems.some(p => p.problemId === problem._id) &&
        problem.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        if (selectedProblemId && points) {
            onAddProblem(selectedProblemId, points);
            setSelectedProblemId('');
            setPoints(100);
        }
    };

    return (
        <div className="space-y-4">
            {/* Selected Problems */}
            {selectedProblems.length > 0 ? (
                <div className={`p-4 ${appTheme.cardBg.replace('bg-', 'bg-')}/10 rounded-lg border ${appTheme.border}/20`}>
                    <h4 className={`text-sm font-medium ${appTheme.text} mb-2`}>Selected Problems</h4>
                    <div className="space-y-2">
                        {selectedProblems.map(({ problemId, points }, index) => {
                            const problem = problems.find(p => p._id === problemId);
                            return (
                                <div key={problemId} className={`flex justify-between items-center p-3 ${appTheme.cardBg.replace('bg-', 'bg-')}/20 rounded-lg`}>
                                    <div>
                                        <span className={`font-medium ${appTheme.text}`}>{index + 1}. {problem?.title || 'Loading...'}</span>
                                        <span className={`ml-2 text-xs ${appTheme.cardText}`}>({points} points)</span>
                                    </div>
                                    <button
                                        onClick={() => onRemoveProblem(problemId)}
                                        className={`p-1 ${appTheme.errorColor.replace('text-', 'text-')} hover:${appTheme.errorColor.replace('text-', 'bg-')}/10 rounded-full`}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className={`p-4 ${appTheme.cardBg.replace('bg-', 'bg-')}/10 rounded-lg border ${appTheme.border}/20 text-center ${appTheme.cardText}`}>
                    No problems selected yet
                </div>
            )}

            {/* Add Problem Form */}
            <div className={`p-4 ${appTheme.cardBg.replace('bg-', 'bg-')}/10 rounded-lg border ${appTheme.border}/20`}>
                <h4 className={`text-sm font-medium ${appTheme.text} mb-3`}>Add Problem</h4>

                {/* Search */}
                <div className="relative mb-4">
                    <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${appTheme.cardText}`} />
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 ${appTheme.background.replace('bg-', 'bg-')} ${appTheme.text} rounded-lg border ${appTheme.border}/50 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50`}
                    />
                </div>

                {/* Problem Selector */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className={`block text-sm font-medium ${appTheme.text} mb-1`}>Problem</label>
                        <select
                            value={selectedProblemId}
                            onChange={(e) => setSelectedProblemId(e.target.value)}
                            className={`w-full px-3 py-2 ${appTheme.background.replace('bg-', 'bg-')} ${appTheme.text} rounded-lg border ${appTheme.border}/50 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50`}
                        >
                            <option value="">Select a problem</option>
                            {filteredProblems.map(problem => (
                                <option key={problem._id} value={problem._id}>
                                    {problem.title} ({problem.difficulty})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${appTheme.text} mb-1`}>Points</label>
                        <input
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                            min="1"
                            className={`w-full px-3 py-2 ${appTheme.background.replace('bg-', 'bg-')} ${appTheme.text} rounded-lg border ${appTheme.border}/50 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50`}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!selectedProblemId}
                    className={`mt-4 px-4 py-2 ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${appTheme.highlight.replace('text-', 'to-')} ${appTheme.buttonText} rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2`}
                >
                    <FaPlus /> Add Problem
                </button>
            </div>
        </div>
    );
};

export default ProblemSelector;