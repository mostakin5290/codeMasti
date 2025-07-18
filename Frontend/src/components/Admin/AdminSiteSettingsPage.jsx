import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';
import { useSelector } from 'react-redux'; // Make sure Redux is correctly set up for auth state

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
    const { user } = useSelector((state) => state.auth); // Get user from Redux state
    const [siteSettings, setSiteSettings] = useState(null);
    const [formData, setFormData] = useState({
        monthlyPlanPrice: '',
        yearlyPlanPrice: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessIcon, setShowSuccessIcon] = useState(false);

    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    useEffect(() => {
        fetchSiteSettings();
    }, []);

    const fetchSiteSettings = async () => {
        try {
            // Corrected endpoint name to /admin/premium-plan as per our new backend structure
            const response = await axiosClient.get('/admin/premium-plan');
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

        // Prevent submission if not an admin
        if (user?.role !== 'admin') {
            toast.error('You do not have permission to update these settings.');
            return;
        }

        setIsSubmitting(true);
        setShowSuccessIcon(false);

        try {
            const dataToSend = {
                monthlyPlanPrice: parseFloat(formData.monthlyPlanPrice),
                yearlyPlanPrice: parseFloat(formData.yearlyPlanPrice)
            };

            // Corrected endpoint name to /admin/premium-plan
            await axiosClient.put('/admin/premium-plan', dataToSend);
            toast.success('Site settings updated successfully');
            setShowSuccessIcon(true);
            setTimeout(() => setShowSuccessIcon(false), 3000);
            fetchSiteSettings();
        } catch (error) {
            console.error("Site settings update error:", error);
            toast.error(error.response?.data?.message || 'Operation failed');
            setShowSuccessIcon(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPrimaryButtonClasses = () =>
        `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')} hover:${appTheme.primaryHover.replace('bg-', 'from-')} hover:${appTheme.secondaryHover.replace('bg-', 'to-')} ${appTheme.buttonText}`;

    if (loading) {
        return <LoadingSpinner message="Loading site settings..." appTheme={appTheme} />;
    }

    // Determine if the form fields and button should be disabled
    // This will be true if:
    // 1. A submission is in progress (`isSubmitting`)
    // 2. The user is NOT an admin (`user?.role !== 'admin'`)
    const isFormDisabled = isSubmitting || user?.role !== 'admin';

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
                                    disabled={isFormDisabled}
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
                                    disabled={isFormDisabled}
                                />
                            </div>
                        </div>

                        {/* Only render the update button and feedback if the user is an admin */}
                        {(user?.role === 'admin') ? (
                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    className={`flex items-center justify-center gap-2 px-4 py-2 w-full md:w-auto ${appTheme.buttonPrimary} ${appTheme.buttonText} rounded-lg font-semibold hover:shadow-lg transition-all duration-300`}
                                    disabled={isFormDisabled}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FiLoader className="animate-spin" /> Updating...
                                        </>
                                    ) : (
                                        'Update Prices'
                                    )}
                                </button>
                                {showSuccessIcon && (
                                    <FiCheckCircle className={`${appTheme.successColor} text-3xl transition-all duration-300 transform scale-125`} />
                                )}
                            </div>
                        ) : (
                            // Optional: Message for non-admin users
                            <p className={`${appTheme.cardText} mt-4 text-lg font-semibold`}>
                                You do not have permission to update these settings.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminSiteSettingsPage;