import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext'; // Assuming this path
import { THEMES } from '../themes'; // Assuming this path
import axiosClient from '../api/axiosClient'; // Assuming this path
import Header from '../components/layout/Header'; // Assuming this path
import Footer from '../components/layout/Footer'; // Assuming this path
import LoadingSpinner from '../components/common/LoadingSpinner'; // Assuming this path, though not used directly in final provided code
import { logoutUser } from '../features/auth/authSlice'; // Import your logout action

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

// Icons (re-included for completeness)
const CheckIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
);

const LockIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3V12.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm-3.75 8.25v-3a3.75 3.75 0 117.5 0v3h-7.5z" clipRule="evenodd" />
    </svg>
);

const UserIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const PaletteIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M20.599 1.5c-.376 0-.743.111-1.055.32l-5.08 3.385a18.747 18.747 0 00-3.471 2.987 10.04 10.04 0 014.815 4.815 18.748 18.748 0 002.987-3.472l3.386-5.079A1.902 1.902 0 0020.599 1.5zm-8.3 14.025a18.76 18.76 0 001.896-1.207 8.026 8.026 0 00-4.513-4.513A18.75 18.75 0 008.475 11.7l-.278.5a5.26 5.26 0 013.601 3.602l.502-.278zM6.75 13.5A3.75 3.75 0 003 17.25a1.5 1.5 0 01-1.601 1.497.75.75 0 00-.7 1.123 5.25 5.25 0 009.8-2.62 3.75 3.75 0 00-3.75-3.75z" clipRule="evenodd" />
    </svg>
);

const SettingPage = () => {
    const { theme, setTheme } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(theme) }; // Merge with default

    const dispatch = useDispatch();
    const navigate = useNavigate();
    // Use a default user object if Redux user is null, for development/display purposes
    const { user: loggedInUser } = useSelector((state) => state.auth);

    // Provide a dummy user if Redux user is not loaded for initial render/testing
    const currentUser = loggedInUser || {
        firstName: 'Guest',
        lastName: 'User',
        emailId: 'guest@example.com',
        role: 'Guest',
        isPremium: false, // Default to false for guest
        avatar: '/path/to/default/avatar.png'
    };

    // State for navigation tabs
    const [activeSettingTab, setActiveSettingTab] = useState('profile');

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Account deletion state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Theme filter and search state
    const [themeFilter, setThemeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Handler for theme selection
    const handleThemeSelect = (t) => {
        // Use currentUser.isPremium for consistent check
        if (t.isPremium && !currentUser?.isPremium) {
            toast.info(
                <div className="flex items-center">
                    <LockIcon className="w-5 h-5 mr-2" />
                    Premium theme! Upgrade to unlock. <Link to="/premium" className="ml-2 font-bold underline">Go Premium</Link>
                </div>,
                { autoClose: 5000, position: 'bottom-center' }
            );
            return;
        }
        setTheme(t);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error("New passwords do not match!"); // More specific error message
            return;
        }

        setIsChangingPassword(true);
        try {
            await axiosClient.put('/user/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmNewPassword // <-- ADD THIS LINE
            });
            toast.success('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const openDeleteModal = () => {
        setShowDeleteModal(true);
        setDeletePassword('');
        setDeleteConfirmation('');
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletePassword('');
        setDeleteConfirmation('');
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'delete my account') {
            toast.error("Please type 'delete my account' to confirm");
            return;
        }

        setIsDeleting(true);
        try {
            await axiosClient.delete('/user/account', { data: { password: deletePassword } });
            toast.success('Account deleted successfully');
            dispatch(logoutUser());
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete account.');
        } finally {
            setIsDeleting(false);
            closeDeleteModal();
        }
    };

    // Filter themes based on themeFilter and searchQuery
    const filteredThemes = THEMES.filter(t => {
        const matchesFilter =
            themeFilter === 'all' ||
            (themeFilter === 'free' && !t.isPremium) ||
            (themeFilter === 'premium' && t.isPremium);

        const matchesSearch =
            searchQuery === '' ||
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesFilter && matchesSearch;
    });

    return (
        <>
            <Header />
            <div className={`min-h-screen ${theme.background} ${theme.text} flex flex-col lg:flex-row`}>
                {/* Left Sidebar */}
                <aside className={`w-full lg:w-64 xl:w-72 py-6 px-4 lg:px-6 lg:py-8 border-r ${theme.border}/50 ${theme.cardBg}/50 backdrop-blur-sm transition-all duration-300 ease-in-out`}>
                    <div className="flex flex-col justify-between h-full">
                        {/* Profile Summary */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group">
                                <img
                                    src={currentUser?.avatar || 'https://via.placeholder.com/80/cccccc/ffffff?text=U'} // Use currentUser's avatar or a placeholder
                                    alt="User Avatar"
                                    className={`w-20 h-20 rounded-full border-4 ${theme.border}/30 shadow-lg object-cover`}
                                />
                            </div>
                            <h3 className={`mt-3 font-semibold text-lg ${theme.text}`}>{currentUser?.firstName} {currentUser?.lastName}</h3>
                            <p className={`text-sm ${theme.cardText}/80`}>{currentUser?.role || 'User'}</p>
                            {currentUser?.isPremium && (
                                <span className={`mt-1 px-3 py-1 text-xs font-semibold rounded-full ${theme.warningColor.replace('text-', 'bg-')}/20 ${theme.warningColor} border ${theme.warningColor.split('-')[1]}-700/30`}>
                                    Premium Member
                                </span>
                            )}
                        </div>

                        <nav className="flex flex-col space-y-3">
                            <button
                                onClick={() => setActiveSettingTab('profile')}
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-left ${activeSettingTab === 'profile'
                                    ? `${theme.primary} ${theme.buttonText} shadow-lg`
                                    : `${theme.text} hover:${theme.primary}/20 hover:${theme.highlight} focus:outline-none focus:ring-2 ${theme.focusRing}`
                                    }`}
                            >
                                <UserIcon className={`w-5 h-5 mr-3 ${activeSettingTab === 'profile' ? theme.buttonText : theme.highlight}`} />
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveSettingTab('theme')}
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-left ${activeSettingTab === 'theme'
                                    ? `${theme.primary} ${theme.buttonText} shadow-lg`
                                    : `${theme.text} hover:${theme.primary}/20 hover:${theme.highlightTertiary} focus:outline-none focus:ring-2 ${theme.focusRing}`
                                    }`}
                            >
                                <PaletteIcon className={`w-5 h-5 mr-3 ${activeSettingTab === 'theme' ? theme.buttonText : theme.highlightTertiary}`} />
                                Themes
                            </button>
                            <button
                                onClick={() => setActiveSettingTab('account')}
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-left ${activeSettingTab === 'account'
                                    ? `${theme.primary} ${theme.buttonText} shadow-lg`
                                    : `${theme.text} hover:${theme.primary}/20 hover:${theme.highlightSecondary} focus:outline-none focus:ring-2 ${theme.focusRing}`
                                    }`}
                            >
                                <LockIcon className={`w-5 h-5 mr-3 ${activeSettingTab === 'account' ? theme.buttonText : theme.highlightSecondary}`} />
                                Account
                            </button>
                        </nav>

                        {/* Logout Button */}
                        <div className="mt-auto pt-8">
                            <button
                                onClick={() => {
                                    dispatch(logoutUser());
                                    navigate('/login');
                                }}
                                className={`${theme.secondary} ${theme.buttonText} px-6 py-3 rounded-lg font-medium hover:${theme.secondaryHover} transition-all duration-300 w-full focus:outline-none focus:ring-2 ${theme.focusRing}`}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className={`flex-1 p-6 lg:p-8 ${theme.background}`}>
                    {activeSettingTab === 'profile' && (
                        <section className={`${theme.cardBg} rounded-xl border ${theme.border} p-6 shadow-lg`}>
                            <div className="flex items-center mb-6">
                                <UserIcon className={`w-6 h-6 ${theme.highlightSecondary} mr-3`} />
                                <h2 className="text-2xl font-semibold">Profile Details</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium ${theme.cardText} mb-1`}>First Name</label>
                                    <p className={`font-medium ${theme.text}`}>{currentUser?.firstName}</p>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${theme.cardText} mb-1`}>Last Name</label>
                                    <p className={`font-medium ${theme.text}`}>{currentUser?.lastName || '-'}</p>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${theme.cardText} mb-1`}>Email</label>
                                    <p className={`font-medium ${theme.text}`}>{currentUser?.emailId}</p>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${theme.cardText} mb-1`}>Role</label>
                                    <p className={`font-medium ${theme.text}`}>{currentUser?.role}</p>
                                </div>
                                {/* Add other profile details if needed */}
                            </div>
                            <Link to="/profile/edit" className={`mt-6 inline-block px-6 py-3 rounded-lg font-medium text-sm ${theme.primary} ${theme.buttonText} hover:${theme.primaryHover} transition-all duration-300 shadow-md focus:outline-none focus:ring-2 ${theme.focusRing}`}>
                                Edit Profile
                            </Link>
                        </section>
                    )}

                    {activeSettingTab === 'theme' && (
                        <section className={`${theme.cardBg} rounded-xl border ${theme.border} p-6 shadow-lg`}>
                            <div className="flex items-center mb-6">
                                <PaletteIcon className={`w-6 h-6 ${theme.highlight} mr-3`} />
                                <h2 className="text-2xl font-semibold">Theme Preferences</h2>
                            </div>
                            <p className="mb-6 opacity-80">Choose a theme that fits your style and enhances your experience.</p>

                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search themes..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`w-full ${theme.cardBg}/80 border ${theme.border} rounded-lg px-4 py-2 pl-10 ${theme.text} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                                    />
                                    <svg
                                        className={`absolute left-3 top-2.5 h-5 w-5 ${theme.cardText}/70`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`text-sm ${theme.cardText}`}>Filter:</span>
                                    <button
                                        onClick={() => setThemeFilter('all')}
                                        className={`px-3 py-1 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 ${theme.focusRing} ${themeFilter === 'all' ? `${theme.primary} ${theme.buttonText}` : `${theme.cardBg} border ${theme.border} ${theme.text} hover:${theme.primary}/20 hover:${theme.highlight}`}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setThemeFilter('free')}
                                        className={`px-3 py-1 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 ${theme.focusRing} ${themeFilter === 'free' ? `${theme.primary} ${theme.buttonText}` : `${theme.cardBg} border ${theme.border} ${theme.text} hover:${theme.primary}/20 hover:${theme.highlight}`}`}
                                    >
                                        Free
                                    </button>
                                    <button
                                        onClick={() => setThemeFilter('premium')}
                                        className={`px-3 py-1 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 ${theme.focusRing} ${themeFilter === 'premium' ? `${theme.primary} ${theme.buttonText}` : `${theme.cardBg} border ${theme.border} ${theme.text} hover:${theme.primary}/20 hover:${theme.highlight}`}`}
                                    >
                                        Premium
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className={`text-sm ${theme.cardText}`}>
                                    Showing {filteredThemes.length} {filteredThemes.length === 1 ? 'theme' : 'themes'}
                                    {searchQuery && ` matching "${searchQuery}"`}
                                    {themeFilter !== 'all' && ` (${themeFilter})`}
                                </p>
                            </div>

                            {filteredThemes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredThemes.map((t) => (
                                        <div
                                            key={t.name}
                                            className={`rounded-xl border-2 transition-all duration-300 relative overflow-hidden group
                            ${theme.name === t.name ? `${t.highlight.replace('text-', 'border-')} scale-105 shadow-2xl` : `${t.border} hover:shadow-lg`}
                            ${t.cardBg}
                            ${t.isPremium && !currentUser?.isPremium ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                                            onClick={() => handleThemeSelect(t)}
                                        >
                                            {/* Premium Overlay - Visible ONLY if theme is premium AND user is NOT premium */}
                                            {t.isPremium && !currentUser?.isPremium && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl pointer-events-auto z-10 p-4 text-center">
                                                    <LockIcon className={`w-10 h-10 ${theme.warningColor} mb-2`} />
                                                    <span className={`text-lg font-bold ${theme.warningColor}`}>PREMIUM</span>
                                                    <Link
                                                        to="/premium"
                                                        className={`mt-4 px-6 py-2 rounded-lg font-bold
                                        ${theme.warningColor.replace('text-', 'bg-')} ${theme.buttonText}
                                        hover:${theme.warningColor.replace('text-', 'bg-')}/80 transition-colors duration-200 shadow-lg`}
                                                        onClick={(e) => e.stopPropagation()} // Prevent parent onClick
                                                    >
                                                        Upgrade to Premium
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Live Preview Section */}
                                            <div className={`p-4 rounded-t-lg ${t.background} ${t.text} relative z-0`}>
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-bold text-lg">{t.name}</h3>
                                                    {theme.name === t.name && <CheckIcon className={`w-6 h-6 ${t.highlight}`} />}
                                                    {/* Display Premium tag if it's a premium theme */}
                                                    {t.isPremium && (
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border
                                        ${currentUser?.isPremium // Using currentUser for consistency
                                                                ? `${t.warningColor.replace('text-', 'bg-')}/20 ${t.warningColor} border-${t.warningColor.split('-')[1]}-700/30`
                                                                : `${t.errorColor.replace('text-', 'bg-')}/20 ${t.errorColor} border-${t.errorColor.split('-')[1]}-700/30`
                                                            }`}>
                                                            Premium
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`p-3 rounded-lg border ${t.border} ${t.cardBg} ${t.cardText}`}>
                                                    <h4 className={`font-semibold ${t.highlight} mb-1`}>Sample Card</h4>
                                                    <p className="text-sm opacity-80 mb-3">This is how content looks in this theme.</p>
                                                    <button className={`w-full py-2 rounded-md text-sm font-medium ${t.primary} ${t.buttonText} hover:opacity-90 transition-opacity`}>
                                                        Primary Button
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Color Palette Section */}
                                            <div className="p-4 rounded-b-lg">
                                                <p className={`text-sm font-medium mb-3 ${t.cardText}`}>Color Palette</p>
                                                <div className="flex items-center space-x-2">
                                                    <div title="Background" className={`w-6 h-6 rounded-full ${t.background} border-2 ${t.border}`}></div>
                                                    <div title="Text" className={`w-6 h-6 rounded-full flex items-center justify-center ${t.cardBg} border-2 ${t.border}`}>
                                                        <span className={`text-xs font-bold ${t.text}`}>Aa</span>
                                                    </div>
                                                    <div title="Primary" className={`w-6 h-6 rounded-full ${t.primary} border border-gray-300`}></div>
                                                    <div title="Highlight" className={`w-6 h-6 rounded-full flex items-center justify-center ${t.cardBg} border-2 ${t.border}`}>
                                                        <span className={`text-xs font-bold ${t.highlight}`}>H</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`text-center py-12 ${theme.cardText}/70`}>
                                    <svg
                                        className="mx-auto h-12 w-12 mb-4 opacity-50"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-lg font-medium mb-2">No themes found</h3>
                                    <p>Try adjusting your search or filter criteria.</p>
                                </div>
                            )}
                        </section>
                    )}

                    {activeSettingTab === 'account' && (
                        <section className={`${theme.cardBg} rounded-xl border ${theme.border} p-6 shadow-lg`}>
                            <div className="flex items-center mb-6">
                                <LockIcon className={`w-6 h-6 ${theme.highlight} mr-3`} />
                                <h2 className="text-2xl font-semibold">Account Settings</h2>
                            </div>

                            {/* Change Password Section */}
                            <form onSubmit={handlePasswordSubmit} className={`${appTheme.cardBg} p-6 sm:p-8 rounded-xl border ${appTheme.border} mb-8 shadow-lg`}>
                                <h2 className={`text-2xl font-semibold ${appTheme.text} mb-6`}>Change Password</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Current Password</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                            placeholder="Enter your current password"
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                            placeholder="Enter your new password"
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmNewPassword"
                                            value={passwordData.confirmNewPassword}
                                            onChange={handlePasswordChange}
                                            className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                            placeholder="Confirm your new password"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isChangingPassword}
                                            className={`${appTheme.background} hover:${appTheme.background}/80 border ${appTheme.border} ${appTheme.text} font-medium py-2.5 px-6 rounded-lg transition-colors duration-300`}
                                        >
                                            {isChangingPassword ? 'Updating...' : 'Change Password'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Delete Account Section */}
                            <div className={`${appTheme.errorColor.replace('text-', 'bg-')}/10 p-6 sm:p-8 rounded-xl border ${appTheme.errorColor.replace('text-', 'border-')}/30 shadow-lg`}>
                                <h2 className={`text-2xl font-semibold ${appTheme.errorColor} mb-4`}>Delete Account</h2>
                                <p className={`text-sm ${appTheme.errorColor}/80 mb-6`}>
                                    Once you delete your account, this action cannot be undone. All your data will be permanently removed. Please be certain.
                                </p>
                                <button
                                    onClick={openDeleteModal}
                                    className={`${appTheme.errorColor.replace('text-', 'bg-')} hover:${appTheme.errorColor.replace('text-', 'bg-')}/80 ${appTheme.buttonText} font-medium py-2.5 px-6 rounded-lg transition-colors duration-300`}
                                >
                                    Delete My Account
                                </button>
                            </div>

                            {showDeleteModal && (
                                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className={`${appTheme.cardBg} rounded-xl border ${appTheme.errorColor.replace('text-', 'border-')}/30 w-full max-w-md`}>
                                        <div className="p-6">
                                            <h2 className={`text-2xl font-bold ${appTheme.errorColor} mb-2`}>Delete Account</h2>
                                            <p className={`${appTheme.cardText} mb-4`}>
                                                This action is irreversible. All your data will be permanently deleted. To confirm, please enter your password and type "delete my account" below.
                                            </p>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Password</label>
                                                    <input
                                                        type="password"
                                                        value={deletePassword}
                                                        onChange={(e) => setDeletePassword(e.target.value)}
                                                        className={`w-full ${appTheme.cardBg}/80 border ${appTheme.border} rounded-lg px-3 py-2 ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.errorColor.split('-')[1]}-500`}
                                                        placeholder="Enter your password"
                                                    />
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>
                                                        Type <span className={`font-mono ${appTheme.errorColor}`}>delete my account</span> to confirm
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={deleteConfirmation}
                                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                        className={`w-full ${appTheme.cardBg}/80 border ${appTheme.border} rounded-lg px-3 py-2 ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.errorColor.split('-')[1]}-500`}
                                                        placeholder="delete my account"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-3 mt-6">
                                                <button
                                                    onClick={closeDeleteModal}
                                                    className={`px-4 py-2 rounded-lg border ${appTheme.border} ${appTheme.cardText} hover:${appTheme.cardBg}/80 transition-colors`}
                                                    disabled={isDeleting}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    className={`px-4 py-2 rounded-lg ${appTheme.errorColor.replace('text-', 'bg-')} ${appTheme.buttonText} hover:${appTheme.errorColor.replace('text-', 'bg-')}/80 transition-colors flex items-center`}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting && (
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    )}
                                                    {isDeleting ? 'Deleting...' : 'Delete Account Permanently'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </main>
            </div>
            <Footer />

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className={`${theme.cardBg} rounded-xl border border-red-300 dark:border-red-700 w-full max-w-md`}>
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Delete Account</h2>
                            <p className={`${theme.cardText} mb-4`}>
                                This action is irreversible. All your data will be permanently deleted. To confirm, please enter your password and type "delete my account" below.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="delete-password" className={`block text-sm font-medium ${theme.cardText} mb-1`}>Password</label>
                                    <input
                                        id="delete-password"
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className={`w-full ${theme.cardBg}/80 border ${theme.border} rounded-lg px-3 py-2 ${theme.text} focus:outline-none focus:ring-2 focus:ring-red-500`}
                                        placeholder="Enter your password"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="delete-confirmation" className={`block text-sm font-medium ${theme.cardText} mb-1`}>
                                        Type <span className="font-mono text-red-600 dark:text-red-400">delete my account</span> to confirm
                                    </label>
                                    <input
                                        id="delete-confirmation"
                                        type="text"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        className={`w-full ${theme.cardBg}/80 border ${theme.border} rounded-lg px-3 py-2 ${theme.text} focus:outline-none focus:ring-2 focus:ring-red-500`}
                                        placeholder="delete my account"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={closeDeleteModal}
                                    className={`px-4 py-2 rounded-lg border ${theme.border} ${theme.cardText} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 ${theme.focusRing}`}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-red-500"
                                    disabled={isDeleting}
                                >
                                    {isDeleting && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {isDeleting ? 'Deleting...' : 'Delete Account Permanently'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingPage;