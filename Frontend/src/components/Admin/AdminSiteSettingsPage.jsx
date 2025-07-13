import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

// Default theme for fallback
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
    const [aboutContent, setAboutContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Get theme from context
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const { data } = await axiosClient.get('/admin/site-content/about');
                setAboutContent(data.content);
            } catch (error) {
                toast.error("Could not fetch site content.");
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axiosClient.put('/admin/site-content/about', { content: aboutContent });
            toast.success("About page content updated successfully!");
        } catch (error) {
            toast.error("Failed to save content.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        // Pass appTheme to LoadingSpinner
        return <LoadingSpinner message="Loading settings..." appTheme={appTheme} />;
    }

    // Helper for primary button gradient
    const getPrimaryButtonClasses = () =>
        `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')} hover:${appTheme.primaryHover.replace('bg-', 'from-')} hover:${appTheme.secondaryHover.replace('bg-', 'to-')} ${appTheme.buttonText}`;

    return (
        <div>
            <h2 className={`text-2xl font-bold ${appTheme.text} mb-4`}>About Page Content</h2>
            <p className={`${appTheme.cardText} mb-6`}>
                Edit the content for the public "About Us" page. You can use Markdown for formatting.
            </p>
            <div className="form-control">
                <textarea
                    className={`textarea textarea-bordered h-96 ${appTheme.cardBg} ${appTheme.text} font-mono text-base rounded-lg border ${appTheme.border} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent transition-all duration-200`}
                    value={aboutContent}
                    onChange={(e) => setAboutContent(e.target.value)}
                    placeholder="Enter About Us content here..."
                ></textarea>
            </div>
            <div className="mt-6">
                <button
                    onClick={handleSave}
                    className={`px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${getPrimaryButtonClasses()}`}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <span className={`w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin ${appTheme.buttonText}`} /> // Dynamic spinner
                    ) : (
                        'Save Content'
                    )}
                </button>
            </div>
        </div>
    );
};

export default AdminSiteSettingsPage;