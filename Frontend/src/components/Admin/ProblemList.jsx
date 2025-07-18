import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../api/axiosClient';
import { FaEdit, FaTrash, FaPlus, FaCode, FaSearch, FaFilter, FaTags, FaUpload, FaVideoSlash } from 'react-icons/fa';
import { MdOutlineVideocam } from 'react-icons/md';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';
import VideoUploadModal from './problems/components/VideoUploadModal';
import { useTheme } from '../../context/ThemeContext';

// Default theme for fallback (as in your original code)
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

// Helper function for pagination numbers (copied from your ProblemPage)
const getPaginationNumbers = (currentPage, totalPages) => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage > totalPages - 4) {
        return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};


const ProblemList = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Problem Delete Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [problemToDelete, setProblemToDelete] = useState(null);

    // Video Upload Modal State
    const [showVideoUploadModal, setShowVideoUploadModal] = useState(false);
    const [selectedProblemForVideo, setSelectedProblemForVideo] = useState(null);

    // Video Delete Modal State
    const [showVideoDeleteConfirmModal, setShowVideoDeleteConfirmModal] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState(null); // Stores the video object to delete

    // Filter and Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 10; // As requested, 10 problems per page

    // Get theme from context
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    // Fetch problems on component mount
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await axiosClient.get('/problem/getAllProblem');
                setProblems(response.data);
            } catch (err) {
                setError('Failed to fetch problems. Please try again later.');
                toast.error('Failed to fetch problems.');
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    // Filter problems based on search and difficulty, and reset page
    const filteredProblems = useMemo(() => {
        let filtered = problems;

        if (searchTerm) {
            filtered = filtered.filter(problem =>
                problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedDifficulty) {
            filtered = filtered.filter(problem => problem.difficulty === selectedDifficulty);
        }

        return filtered;
    }, [problems, searchTerm, selectedDifficulty]);

    // Reset currentPage to 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedDifficulty]);


    // Pagination calculations
    const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);
    const currentProblems = useMemo(() => {
        const startIndex = (currentPage - 1) * problemsPerPage;
        const endIndex = startIndex + problemsPerPage;
        return filteredProblems.slice(startIndex, endIndex);
    }, [filteredProblems, currentPage, problemsPerPage]);

    const pageNumbers = getPaginationNumbers(currentPage, totalPages);


    // --- Problem Deletion Handlers ---
    const handleDeleteClick = (problem) => {
        setProblemToDelete(problem);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!problemToDelete) return;
        try {
            await axiosClient.delete(`/problem/delete/${problemToDelete._id}`);
            // Remove from problems list
            setProblems(prev => prev.filter(p => p._id !== problemToDelete._id));
            toast.success('Problem deleted successfully!', {
                style: {
                    background: `${appTheme.successColor.replace('text-', 'bg-')}/30`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${appTheme.successColor.replace('text-', 'border-')}/50`,
                    color: appTheme.text.replace('text-', '')
                }
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete problem.', {
                style: {
                    background: `${appTheme.errorColor.replace('text-', 'bg-')}/30`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${appTheme.errorColor.replace('text-', 'border-')}/50`,
                    color: appTheme.text.replace('text-', '')
                }
            });
        } finally {
            setShowConfirmModal(false);
            setProblemToDelete(null);
        }
    };

    // --- Video Upload Handlers ---
    const handleUploadVideoClick = (problem) => {
        setSelectedProblemForVideo(problem);
        setShowVideoUploadModal(true);
    };

    const handleVideoUploadedSuccessfully = (uploadedVideoData) => {
        // Update the specific problem in 'problems' state with the new solutionVideo data
        setProblems(prevProblems => prevProblems.map(p =>
            p._id === uploadedVideoData.problemId
                ? { ...p, solutionVideo: uploadedVideoData }
                : p
        ));
        setShowVideoUploadModal(false); // Close the modal
        setSelectedProblemForVideo(null); // Clear selected problem
    };

    // --- Video Delete Handlers ---
    const handleDeleteVideoClick = (problem) => {
        // Here, problem.solutionVideo contains the _id of the video document
        if (problem.solutionVideo && problem.solutionVideo._id) {
            setVideoToDelete(problem.solutionVideo);
            // It's good practice to also pass the problem title for the confirmation modal
            setProblemToDelete({ title: problem.title, _id: problem._id });
            setShowVideoDeleteConfirmModal(true);
        } else {
            toast.error("No video found to delete for this problem.");
        }
    };

    const handleConfirmDeleteVideo = async () => {
        if (!videoToDelete) return;
        try {
            // Send the video's _id to the backend for deletion
            await axiosClient.delete(`/video/delete/${videoToDelete._id}`);

            // Update state: remove solutionVideo from the problem object
            setProblems(prevProblems => prevProblems.map(p =>
                p._id === videoToDelete.problemId // videoToDelete also has problemId
                    ? { ...p, solutionVideo: null } // Set solutionVideo to null or undefined
                    : p
            ));
            toast.success('Video deleted successfully!', {
                style: {
                    background: `${appTheme.successColor.replace('text-', 'bg-')}/30`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${appTheme.successColor.replace('text-', 'border-')}/50`,
                    color: appTheme.text.replace('text-', '')
                }
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete video.', {
                style: {
                    background: `${appTheme.errorColor.replace('text-', 'bg-')}/30`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${appTheme.errorColor.replace('text-', 'border-')}/50`,
                    color: appTheme.text.replace('text-', '')
                }
            });
        } finally {
            setShowVideoDeleteConfirmModal(false);
            setVideoToDelete(null);
            setProblemToDelete(null); // Clear problemToDelete after video delete too
        }
    };

    // --- UI Helpers (unchanged) ---
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return `${appTheme.highlightSecondary.replace('text-', 'from-')} ${appTheme.highlightTertiary.replace('text-', 'to-')}`;
            case 'medium': return `${appTheme.highlightTertiary.replace('text-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')}`;
            case 'hard': return `${appTheme.highlight.replace('text-', 'from-')} ${appTheme.primary.replace('bg-', 'to-')}`;
            default: return `${appTheme.cardText.replace('text-', 'from-')} ${appTheme.cardText.replace('text-', 'to-')}`;
        }
    };

    const getDifficultyIcon = (difficulty) => {
        switch (difficulty) {
            case 'easy': return '🟢';
            case 'medium': return '🟡';
            case 'hard': return '🔴';
            default: return '⚪';
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading problems..." appTheme={appTheme} />;
    }
    if (error) return (
        <div className="text-center p-8">
            <div className={`${appTheme.errorColor.replace('text-', 'bg-')}/20 backdrop-blur-xl rounded-2xl p-6 border ${appTheme.errorColor.replace('text-', 'border-')}/30`}>
                <div className={`${appTheme.errorColor} text-6xl mb-4`}>⚠️</div>
                <p className={`${appTheme.errorColor} text-lg`}>{error}</p>
            </div>
        </div>
    );

    const getPrimaryButtonClasses = () =>
        `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')} hover:${appTheme.primaryHover.replace('bg-', 'from-')} hover:${appTheme.secondaryHover.replace('bg-', 'to-')} ${appTheme.buttonText}`;

    const getIconButtonClasses = (colorClass) =>
        `group/btn p-3 bg-gradient-to-r ${colorClass.replace('text-', 'from-')} ${colorClass.replace('text-', 'to-')} hover:${colorClass.replace('text-', 'from-')} hover:${colorClass.replace('text-', 'to-')} rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg`;


    return (
        <div className="space-y-6">
            <ToastContainer
                theme={appTheme.background.includes('dark') || appTheme.background.includes('black') || appTheme.background.includes('zinc-9') ? "dark" : "light"}
                position="top-right"
                toastStyle={{
                    background: `${appTheme.cardBg}/10`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${appTheme.border}/20`,
                    color: appTheme.text // Use the text class directly from appTheme
                }}
            />

            {/* Header Section */}
            <div className={`${appTheme.cardBg}/10 backdrop-blur-xl p-6 rounded-2xl border ${appTheme.border}/20 shadow-xl`}>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center">
                        <div className={`p-3 bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')} rounded-xl mr-4 shadow-lg`}>
                            <FaCode className={`text-2xl ${appTheme.text}`} />
                        </div>
                        <div>
                            <h1 className={`text-3xl font-bold bg-gradient-to-r ${appTheme.text.replace('text-', 'from-')} ${appTheme.cardText.replace('text-', 'to-')} bg-clip-text `}>
                                Problem Management
                            </h1>
                            <p className={`${appTheme.cardText} mt-1`}>Manage and organize coding problems</p>
                        </div>
                    </div>

                    <Link
                        to="/admin/problems/create"
                        className={`group ${getPrimaryButtonClasses()} px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center`}
                    >
                        <FaPlus className="mr-2 group-hover:animate-bounce" />
                        Create New Problem
                    </Link>
                </div>
            </div>

            {/* Filters Section */}
            <div className={`${appTheme.cardBg}/5 backdrop-blur-xl p-6 rounded-2xl border ${appTheme.border}/20 shadow-xl`}>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${appTheme.cardText}`} />
                        <input
                            type="text"
                            placeholder="Search problems by title or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 ${appTheme.cardBg}/10 backdrop-blur-xl border ${appTheme.border}/20 rounded-xl ${appTheme.text} placeholder-${appTheme.cardText.split('-')[1]}-400 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50 focus:border-${appTheme.primary.split('-')[1]}-500/50 transition-all duration-300`}
                        />
                    </div>

                    <div className="relative">
                        <FaFilter className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${appTheme.cardText}`} />
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className={`pl-12 pr-8 py-3 ${appTheme.cardBg}/10 backdrop-blur-xl border ${appTheme.border}/20 rounded-xl ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50 focus:border-${appTheme.primary.split('-')[1]}-500/50 transition-all duration-300 appearance-none cursor-pointer`}
                        >
                            <option value="" className={`${appTheme.cardBg}`}>All Difficulties</option>
                            <option value="easy" className={`${appTheme.cardBg}`}>Easy</option>
                            <option value="medium" className={`${appTheme.cardBg}`}>Medium</option>
                            <option value="hard" className={`${appTheme.cardBg}`}>Hard</option>
                        </select>
                    </div>
                </div>

                <div className={`mt-4 flex flex-wrap gap-4 text-sm ${appTheme.cardText}`}>
                    <div className="flex items-center">
                        <span className="mr-2">📊</span>
                        Total: <span className={`ml-1 font-semibold ${appTheme.text}`}>{problems.length}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-2">🔍</span>
                        Filtered: <span className={`ml-1 font-semibold ${appTheme.text}`}>{filteredProblems.length}</span>
                    </div>
                </div>
            </div>

            {/* Problems Grid/Table */}
            <div className={`${appTheme.cardBg}/5 backdrop-blur-xl rounded-2xl border ${appTheme.border}/20 shadow-xl overflow-hidden`}>
                {currentProblems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={`${appTheme.cardBg}/10`}>
                                <tr>
                                    <th className={`text-left p-6 ${appTheme.cardText} font-semibold`}>Problem</th>
                                    <th className={`text-left p-6 ${appTheme.cardText} font-semibold`}>Difficulty</th>
                                    <th className={`text-left p-6 ${appTheme.cardText} font-semibold`}>Tags</th>
                                    <th className={`text-center p-6 ${appTheme.cardText} font-semibold`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProblems.map((problem, index) => (
                                    <tr
                                        key={problem._id}
                                        className={`border-t ${appTheme.border}/10 hover:${appTheme.cardBg}/5 transition-all duration-300 group`}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td className="p-6">
                                            <div className="flex items-center">
                                                <div className={`w-2 h-12 bg-gradient-to-b ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')} rounded-full mr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                                <div>
                                                    <h3 className={`font-bold ${appTheme.text} text-lg group-hover:${appTheme.highlight} transition-colors duration-300`}>
                                                        {problem.title}
                                                    </h3>
                                                    <p className={`${appTheme.cardText} text-sm mt-1`}>ID: {problem._id.slice(-8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className={`inline-flex items-center px-3 py-1 rounded-xl bg-gradient-to-r ${getDifficultyColor(problem.difficulty)} ${appTheme.text} font-semibold text-sm shadow-lg`}>
                                                <span className="mr-2">{getDifficultyIcon(problem.difficulty)}</span>
                                                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-wrap gap-2">
                                                {problem.tags.slice(0, 3).map((tag, tagIndex) => (
                                                    <span
                                                        key={tagIndex}
                                                        className={`px-3 py-1 ${appTheme.cardBg}/10 ${appTheme.cardText} rounded-lg text-sm border ${appTheme.border}/20 flex items-center`}
                                                    >
                                                        <FaTags className={`mr-1 text-xs ${appTheme.highlightSecondary}`} />
                                                        {tag}
                                                    </span>
                                                ))}
                                                {problem.tags.length > 3 && (
                                                    <span className={`px-3 py-1 ${appTheme.cardBg}/5 ${appTheme.cardText} rounded-lg text-sm border ${appTheme.border}/10`}>
                                                        +{problem.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-center gap-3">
                                                {/* Edit Problem Button */}
                                                <Link
                                                    to={`/admin/problems/edit/${problem._id}`}
                                                    className={getIconButtonClasses(appTheme.highlightSecondary)}
                                                    aria-label="Edit Problem"
                                                >
                                                    <FaEdit className={`${appTheme.text} group-hover/btn:animate-pulse`} />
                                                </Link>

                                                {/* Video Upload/Delete Button */}
                                                {problem.solutionVideo ? (
                                                    <button
                                                        onClick={() => handleDeleteVideoClick(problem)}
                                                        className={getIconButtonClasses(appTheme.errorColor)}
                                                        aria-label="Delete Solution Video"
                                                    >
                                                        <FaVideoSlash className={`${appTheme.text} group-hover/btn:animate-pulse`} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUploadVideoClick(problem)}
                                                        className={getIconButtonClasses(appTheme.infoColor)}
                                                        aria-label="Upload Solution Video"
                                                    >
                                                        <FaUpload className={`${appTheme.text} group-hover/btn:animate-pulse`} />
                                                    </button>
                                                )}

                                                {/* Delete Problem Button */}
                                                <button
                                                    onClick={() => handleDeleteClick(problem)}
                                                    className={getIconButtonClasses(appTheme.errorColor)}
                                                    aria-label="Delete Problem"
                                                >
                                                    <FaTrash className={`${appTheme.text} group-hover/btn:animate-pulse`} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className={`text-6xl mb-4 ${appTheme.cardText}`}>🔍</div>
                        <h3 className={`text-2xl font-bold ${appTheme.text} mb-2`}>No Problems Found</h3>
                        <p className={`${appTheme.cardText} mb-6`}>
                            {searchTerm || selectedDifficulty
                                ? "Try adjusting your search criteria"
                                : "Get started by creating your first problem"
                            }
                        </p>
                        {!searchTerm && !selectedDifficulty && (
                            <Link
                                to="/admin/problems/create"
                                className={`inline-flex items-center ${getPrimaryButtonClasses()} px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                            >
                                <FaPlus className="mr-2" />
                                Create First Problem
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={`mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${appTheme.cardBg}/5 backdrop-blur-xl rounded-2xl shadow-sm border ${appTheme.border}/20 p-6`}>
                    <div className={`text-sm ${appTheme.cardText}`}>
                        Showing <span className={`font-semibold ${appTheme.text}`}>{(currentPage - 1) * problemsPerPage + 1}</span> to{' '}
                        <span className={`font-semibold ${appTheme.text}`}>{(currentPage - 1) * problemsPerPage + currentProblems.length}</span> of{' '}
                        <span className={`font-semibold ${appTheme.text}`}>{filteredProblems.length}</span> results
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 ${appTheme.cardBg}/20 border ${appTheme.border}/30 rounded-lg ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/50 transition-all duration-200 font-medium`}
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {pageNumbers.map((page, index) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className={`px-3 py-2 ${appTheme.cardText}`}>...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentPage === page
                                            ? `${appTheme.primary} ${appTheme.buttonText} shadow-md` // Use primary for active button
                                            : `${appTheme.cardBg}/20 ${appTheme.cardText} hover:${appTheme.cardBg}/50 border ${appTheme.border}/30`
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 ${appTheme.cardBg}/20 border ${appTheme.border}/30 rounded-lg ${appTheme.cardText} disabled:opacity-50 disabled:cursor-not-allowed hover:${appTheme.cardBg}/50 transition-all duration-200 font-medium`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}


            {/* Problem Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Problem"
                appTheme={appTheme}
            >
                <div className="text-center">
                    <div className={`text-6xl mb-4 ${appTheme.cardText}`}>🗑️</div>
                    <p className={`text-lg mb-2 ${appTheme.cardText}`}>Are you sure you want to delete:</p>
                    <div className={`${appTheme.cardBg}/10 p-4 rounded-xl border ${appTheme.border}/20 mb-4`}>
                        <h3 className={`font-bold text-xl ${appTheme.primary.replace('bg-', 'text-')}`}>{problemToDelete?.title}</h3>
                        <p className={`${appTheme.cardText} text-sm mt-1`}>ID: {problemToDelete?._id?.slice(-8)}</p>
                    </div>
                    <p className={`${appTheme.errorColor} font-semibold`}>⚠️ This action cannot be undone</p>
                </div>
            </ConfirmationModal>

            {/* Video Upload Modal */}
            {showVideoUploadModal && selectedProblemForVideo && (
                <VideoUploadModal
                    isOpen={showVideoUploadModal}
                    onClose={() => setShowVideoUploadModal(false)}
                    problemId={selectedProblemForVideo._id}
                    onVideoUploaded={handleVideoUploadedSuccessfully}
                    appTheme={appTheme}
                />
            )}

            {/* Video Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showVideoDeleteConfirmModal}
                onClose={() => setShowVideoDeleteConfirmModal(false)}
                onConfirm={handleConfirmDeleteVideo}
                title="Delete Video Solution"
                appTheme={appTheme}
            >
                <div className="text-center">
                    <div className={`text-6xl mb-4 ${appTheme.cardText}`}>🗑️</div>
                    <p className={`text-lg mb-2 ${appTheme.cardText}`}>Are you sure you want to delete the video for:</p>
                    <div className={`${appTheme.cardBg}/10 p-4 rounded-xl border ${appTheme.border}/20 mb-4`}>
                        {/* Use problemToDelete for title, as videoToDelete doesn't always have it */}
                        <h3 className={`font-bold text-xl ${appTheme.primary.replace('bg-', 'text-')}`}>{problemToDelete?.title}</h3>
                        <p className={`${appTheme.cardText} text-sm mt-1`}>Video ID: {videoToDelete?._id?.slice(-8)}</p>
                    </div>
                    <p className={`${appTheme.errorColor} font-semibold`}>⚠️ This action cannot be undone and will permanently remove the video.</p>
                </div>
            </ConfirmationModal>
        </div>
    );
};

export default ProblemList;