import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { FiCheckCircle, FiLoader } from 'react-icons/fi'; // Import icons for feedback

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

const AdminSiteSettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [siteSettings, setSiteSettings] = useState(null);
    const [formData, setFormData] = useState({
        monthlyPlanPrice: '',
        yearlyPlanPrice: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false); // NEW: State for submission status
    const [showSuccessIcon, setShowSuccessIcon] = useState(false); // NEW: State for temporary success icon

    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    useEffect(() => {
        fetchSiteSettings();
    }, []);

    const fetchSiteSettings = async () => {
        try {
            const response = await axiosClient.get('/admin/site-settings'); // Corrected endpoint name
            setSiteSettings(response.data);
            setFormData({
                monthlyPlanPrice: response.data.monthlyPlanPrice,
                yearlyPlanPrice: response.data.yearlyPlanPrice
            });
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch site settings');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Set submitting state to true
        setShowSuccessIcon(false); // Hide success icon if visible from a previous submission

        try {
            const dataToSend = {
                monthlyPlanPrice: parseFloat(formData.monthlyPlanPrice),
                yearlyPlanPrice: parseFloat(formData.yearlyPlanPrice)
            };

            await axiosClient.put('/admin/site-settings', dataToSend); // Corrected endpoint name
            toast.success('Site settings updated successfully');
            setShowSuccessIcon(true); // Show success icon
            setTimeout(() => setShowSuccessIcon(false), 3000); // Hide after 3 seconds
            fetchSiteSettings(); // Re-fetch to ensure UI reflects the latest data
        } catch (error) {
            console.error("Site settings update error:", error);
            toast.error(error.response?.data?.message || 'Operation failed');
            setShowSuccessIcon(false); // Ensure icon is hidden on error
        } finally {
            setIsSubmitting(false); // Reset submitting state
        }
    };

    const getPrimaryButtonClasses = () =>
        `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')} hover:${appTheme.primaryHover.replace('bg-', 'from-')} hover:${appTheme.secondaryHover.replace('bg-', 'to-')} ${appTheme.buttonText}`;

    if (loading) {
        return <LoadingSpinner message="Loading site settings..." appTheme={appTheme} />;
    }

    return (
        <div className={`min-h-screen ${appTheme.background} ${appTheme.text} p-6`}>
            <div className="max-w-4xl mx-auto">
                <h1 className={`text-3xl font-bold mb-8 ${appTheme.highlight}`}>Site Settings</h1>

                {/* Single Form for Price Updates */}
                <div className={`mb-8 p-6 rounded-lg ${appTheme.cardBg} ${appTheme.border} border`}>
                    <h2 className={`text-xl font-semibold mb-4 ${appTheme.highlightSecondary}`}>
                        Update Premium Plan Prices
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className={`block mb-2 ${appTheme.cardText}`}>Monthly Plan Price (₹)</label>
                                <input
                                    type="number"
                                    name="monthlyPlanPrice"
                                    value={formData.monthlyPlanPrice}
                                    onChange={handleInputChange}
                                    className={`w-full p-3 rounded ${appTheme.cardBg} ${appTheme.border} border ${appTheme.cardText}`}
                                    placeholder="e.g. 1.99"
                                    min="0"
                                    step="0.01"
                                    required
                                    disabled={isSubmitting} // Disable input during submission
                                />
                            </div>

                            <div>
                                <label className={`block mb-2 ${appTheme.cardText}`}>Yearly Plan Price (₹)</label>
                                <input
                                    type="number"
                                    name="yearlyPlanPrice"
                                    value={formData.yearlyPlanPrice}
                                    onChange={handleInputChange}
                                    className={`w-full p-3 rounded ${appTheme.cardBg} ${appTheme.border} border ${appTheme.cardText}`}
                                    placeholder="e.g. 21.49"
                                    min="0"
                                    step="0.01"
                                    required
                                    disabled={isSubmitting} // Disable input during submission
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4"> {/* NEW: Container for button and feedback */}
                            <button
                                type="submit"
                                className={`px-6 py-3 rounded ${getPrimaryButtonClasses()} font-medium flex items-center justify-center gap-2`}
                                disabled={isSubmitting} // Disable button during submission
                            >
                                {isSubmitting ? (
                                    <>
                                        <FiLoader className="animate-spin" /> Updating...
                                    </>
                                ) : (
                                    'Update Prices'
                                )}
                            </button>
                            {showSuccessIcon && ( // NEW: Display success icon conditionally
                                <FiCheckCircle className={`${appTheme.successColor} text-3xl transition-all duration-300 transform scale-125`} />
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminSiteSettingsPage;