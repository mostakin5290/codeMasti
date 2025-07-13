import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCalendarAlt, FaEdit, FaClock, FaUsers, FaPlus, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import axiosClient from '../../../api/axiosClient';
import { toast } from 'react-toastify';
import ProblemSelector from './ProblemSelector';

const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonPrimary: 'bg-indigo-600',
    buttonPrimaryHover: 'bg-indigo-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

// Helper function to format Date objects for datetime-local input (YYYY-MM-DDTHH:MM)
const formatDateTimeLocal = (dateString) => {
    if (!dateString) return ''; // Handle empty or null date strings
    const date = new Date(dateString);
    // Check if the date is invalid (e.g., from new Date('') or malformed string)
    if (isNaN(date.getTime())) return ''; 
    
    // Use 'sv-SE' locale for YYYY-MM-DD HH:MM format, then replace space with 'T'
    return date.toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Use 24-hour format
    }).replace(' ', 'T');
};


const ContestForm = ({ isEdit = false }) => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...appThemeFromContext };
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '', // Stores the local datetime string (for input display)
        endTime: '',   // Stores the UTC ISO string (for backend submission and calculations)
        duration: 60,
        isPublic: true,
        maxParticipants: '',
        problems: []
    });

    const [loading, setLoading] = useState(false);
    const [problemsList, setProblemsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isEdit) {
            const fetchContest = async () => {
                try {
                    const { data } = await axiosClient.get(`/contests/${id}`);
                    setFormData({
                        title: data.title,
                        description: data.description,
                        // Convert backend's UTC startTime to local datetime string for input
                        startTime: formatDateTimeLocal(data.startTime),
                        // Store backend's UTC endTime as full ISO string for internal logic
                        endTime: new Date(data.endTime).toISOString(),
                        duration: data.duration,
                        isPublic: data.isPublic,
                        maxParticipants: data.maxParticipants || '',
                        problems: data.problems
                    });
                } catch (error) {
                    toast.error('Failed to load contest data');
                    navigate('/admin/contests');
                }
            };
            fetchContest();
        }

        const fetchProblems = async () => {
            try {
                const { data } = await axiosClient.get('/problem/getAllProblem');
                setProblemsList(data);
            } catch (error) {
                toast.error('Failed to fetch problems');
            }
        };
        fetchProblems();
    }, [id, isEdit, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDurationChange = (e) => {
        const duration = parseInt(e.target.value);
        if (!isNaN(duration) && duration >= 1) { // Ensure duration is a valid positive number
            setFormData(prev => {
                // Parse the local startTime string from input. If empty, it will be "Invalid Date"
                const currentStartTime = new Date(prev.startTime);
                let newCalculatedEndTime = '';

                // Only calculate endTime if startTime is a valid date
                if (!isNaN(currentStartTime.getTime())) {
                    const tempEndTime = new Date(currentStartTime.getTime() + duration * 60000);
                    newCalculatedEndTime = tempEndTime.toISOString(); // Store full UTC ISO string
                }

                return {
                    ...prev,
                    duration,
                    endTime: newCalculatedEndTime // Will be "" or the UTC ISO string
                };
            });
        } else if (isNaN(duration) || duration < 1) { // Handle invalid or empty duration
            setFormData(prev => ({
                ...prev,
                duration: duration, // Keep the invalid input value for the user to correct
                endTime: '' // Clear end time if duration is invalid
            }));
        }
    };

    const handleStartTimeChange = (e) => {
        const startTimeValue = e.target.value; // This is the local datetime string from the input (e.g., '2023-10-27T20:00')
        setFormData(prev => {
            // Create a Date object from the local string. This Date object will represent the local time.
            const newStartTime = new Date(startTimeValue);
            let newCalculatedEndTime = '';

            // Only calculate endTime if newStartTime is a valid date
            if (!isNaN(newStartTime.getTime())) {
                 const tempEndTime = new Date(newStartTime.getTime() + prev.duration * 60000);
                 newCalculatedEndTime = tempEndTime.toISOString(); // Store full UTC ISO string
            }

            return {
                ...prev,
                startTime: startTimeValue, // Keep the local string for the input display
                endTime: newCalculatedEndTime // Will be "" or the UTC ISO string
            };
        });
    };

    const handleAddProblem = (problemId, points) => {
        if (!problemId || !points || isNaN(points)) return;

        if (formData.problems.some(p => p.problemId === problemId)) {
            toast.warning('Problem already added to contest');
            return;
        }

        setFormData(prev => ({
            ...prev,
            problems: [...prev.problems, { problemId, points: parseInt(points) }]
        }));
    };

    const handleRemoveProblem = (problemId) => {
        setFormData(prev => ({
            ...prev,
            problems: prev.problems.filter(p => p.problemId !== problemId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation before sending to backend (optional, but good practice)
        if (!formData.title || !formData.description || !formData.startTime || !formData.endTime || formData.duration < 1) {
            setLoading(false);
            return toast.error("Please fill all required fields correctly (Title, Description, Start Time, Duration).");
        }

        // Prepare data to send to backend:
        // startTime: Convert the local datetime string from formData.startTime to a UTC ISO string.
        // endTime: formData.endTime should already be a full UTC ISO string (from handleStartTimeChange/handleDurationChange).
        const dataToSend = {
            ...formData,
            startTime: new Date(formData.startTime).toISOString(),
            endTime: formData.endTime, // This is already the correct full UTC ISO string
            maxParticipants: formData.maxParticipants === '' ? undefined : parseInt(formData.maxParticipants)
        };

        console.log("Payload being sent from frontend:", dataToSend); // Keep this for verification

        try {
            if (isEdit) {
                await axiosClient.put(`/contests/${id}`, dataToSend);
                toast.success('Contest updated successfully');
            } else {
                await axiosClient.post('/contests', dataToSend);
                toast.success('Contest created successfully');
            }
            navigate('/admin/contests');
        } catch (error) {
            console.error("Contest creation error:", error);
            console.error("Backend error response data:", error.response?.data);
            toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to save contest');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`p-6 ${appTheme.cardBg.replace('bg-', 'bg-')}/10 rounded-xl border ${appTheme.border}/20`}>
            <h2 className={`text-2xl font-bold mb-6 ${appTheme.text}`}>
                {isEdit ? 'Edit Contest' : 'Create New Contest'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div>
                        <label className={`block text-sm font-medium ${appTheme.text} mb-1`}>
                            Contest Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 ${appTheme.background.replace('bg-', 'bg-')} ${appTheme.text} rounded-lg border ${appTheme.border}/50 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50`}
                        />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className={`block text-sm font-medium ${appTheme.text} mb-1`}>
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={3}
                            className={`w-full px-3 py-2 ${appTheme.background.replace('bg-', 'bg-')} ${appTheme.text} rounded-lg border ${appTheme.border}/50 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50`}
                        />
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className={`block text-sm font-medium ${appTheme.text} mb-1`}>
                            <FaCalendarAlt className="inline mr-1" /> Start Time
                        </label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime} // formData.startTime holds the local datetime string
                            onChange={handleStartTimeChange}
                            required
                            min={formatDateTimeLocal(new Date().toISOString())} // Generate min attribute in local datetime-local format
                            className={`w-full px-3 py-2 ${appTheme.background.replace('bg-', 'bg-')} ${appTheme.text} rounded-lg border ${appTheme.border}/50 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50`}
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <label className={`block text-sm font-medium ${appTheme.text} mb-1`}>
                            <FaClock className="inline mr-1" /> Duration (minutes)
                        </label>
                        <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleDurationChange}
                            required
                            min={1}
                            className={`w-full px-3 py-2 ${appTheme.background.replace('bg-', 'bg-')} ${appTheme.text} rounded-lg border ${appTheme.border}/50 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50`}
                        />
                    </div>

                    {/* End Time (readonly) */}
                    <div>
                        <label className={`block text-sm font-medium ${appTheme.text} mb-1`}>
                            <FaCalendarAlt className="inline mr-1" /> End Time
                        </label>
                        <input
                            type="datetime-local"
                            // Pass the full UTC ISO string to the helper to format it for datetime-local input
                            value={formatDateTimeLocal(formData.endTime)}
                            readOnly
                            className={`w-full px-3 py-2 ${appTheme.background.replace('bg-', 'bg-')} ${appTheme.text} rounded-lg border ${appTheme.border}/50 opacity-70`}
                        />
                    </div>

                    {/* Max Participants */}
                    <div>
                        <label className={`block text-sm font-medium ${appTheme.text} mb-1`}>
                            <FaUsers className="inline mr-1" /> Max Participants (optional)
                        </label>
                        <input
                            type="number"
                            name="maxParticipants"
                            value={formData.maxParticipants}
                            onChange={handleChange}
                            min={1}
                            className={`w-full px-3 py-2 ${appTheme.background.replace('bg-', 'bg-')} ${appTheme.text} rounded-lg border ${appTheme.border}/50 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500/50`}
                        />
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isPublic"
                            name="isPublic"
                            checked={formData.isPublic}
                            onChange={handleChange}
                            className={`h-4 w-4 ${appTheme.primary.replace('bg-', 'text-')} focus:ring-${appTheme.primary.split('-')[1]}-500 border-${appTheme.border.split('-')[1]}-300 rounded`}
                        />
                        <label htmlFor="isPublic" className={`ml-2 block text-sm ${appTheme.text}`}>
                            Public Contest (visible to all users)
                        </label>
                    </div>
                </div>

                {/* Problems Section */}
                <div className="mt-8">
                    <h3 className={`text-lg font-medium ${appTheme.text} mb-4`}>
                        Contest Problems
                    </h3>

                    <ProblemSelector
                        problems={problemsList}
                        selectedProblems={formData.problems}
                        onAddProblem={handleAddProblem}
                        onRemoveProblem={handleRemoveProblem}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        appTheme={appTheme}
                    />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/contests')}
                        className={`px-4 py-2 ${appTheme.cardBg.replace('bg-', 'bg-')} ${appTheme.cardText} rounded-lg font-medium hover:${appTheme.cardBg.replace('bg-', 'bg-')}/80 transition-colors`}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${appTheme.highlight.replace('text-', 'to-')} ${appTheme.buttonText} rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2`}
                    >
                        {loading ? (
                            <span className="animate-spin">↻</span>
                        ) : isEdit ? (
                            <>
                                <FaEdit /> Update Contest
                            </>
                        ) : (
                            <>
                                <FaPlus /> Create Contest
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContestForm;