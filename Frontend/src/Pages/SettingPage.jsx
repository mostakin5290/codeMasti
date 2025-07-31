import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import { THEMES } from '../themes';
import axiosClient from '../api/axiosClient';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { logoutUser } from '../features/auth/authSlice';

const defaultAppTheme = {
    background: 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900',
    text: 'text-white',
    primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600',
    secondary: 'bg-blue-600',
    secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800/50 backdrop-blur-xl',
    cardText: 'text-gray-300',
    border: 'border-gray-700/50',
    buttonText: 'text-white',
    highlight: 'text-cyan-400',
    highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400',
    iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900',
    gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
    focusRing: 'focus:ring-cyan-500/50',
};

// Enhanced Icons with better styling
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

const SettingsIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.570.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
    </svg>
);

const LogoutIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

const SearchIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
    </svg>
);

const StarIcon = ({ className, filled = false }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const SettingPage = () => {
    const { theme, setTheme } = useTheme();
    const appTheme = { ...defaultAppTheme, ...theme };

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user: loggedInUser } = useSelector((state) => state.auth);

    const currentUser = loggedInUser || {
        firstName: 'Guest',
        lastName: 'User',
        emailId: 'guest@example.com',
        role: 'Guest',
        isPremium: false,
        avatar: '/path/to/default/avatar.png',
        joinedDate: '2024-01-01'
    };

    // State management
    const [activeSettingTab, setActiveSettingTab] = useState('profile');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [themeFilter, setThemeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Enhanced theme selection handler
    const handleThemeSelect = (t) => {
        if (t.isPremium && !currentUser?.isPremium) {
            toast.info(
                <div className="flex items-center">
                    <LockIcon className="w-5 h-5 mr-2" />
                    Premium theme! Upgrade to unlock. 
                    <Link to="/premium" className="ml-2 font-bold underline hover:text-amber-300">
                        Go Premium
                    </Link>
                </div>,
                { 
                    autoClose: 5000, 
                    position: 'bottom-center',
                    className: 'bg-gradient-to-r from-amber-500 to-orange-500'
                }
            );
            return;
        }
        setTheme(t);
        toast.success(`Theme changed to ${t.name}!`, {
            position: 'bottom-right',
            autoClose: 2000
        });
    };

    // Enhanced password change handler
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error("New passwords do not match!");
            return;
        }
        if (passwordData.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long!");
            return;
        }

        setIsChangingPassword(true);
        try {
            await axiosClient.put('/user/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmNewPassword
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

    // Enhanced theme filtering
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

    // Navigation items with enhanced styling
    const navigationItems = [
        {
            id: 'profile',
            name: 'Profile',
            icon: UserIcon,
            color: 'text-blue-400',
            description: 'Personal information and preferences'
        },
        {
            id: 'theme',
            name: 'Themes',
            icon: PaletteIcon,
            color: 'text-purple-400',
            description: 'Customize your visual experience'
        },
        {
            id: 'account',
            name: 'Account',
            icon: SettingsIcon,
            color: 'text-green-400',
            description: 'Security and account management'
        }
    ];

    return (
        <>
            <Header />
            <div className={`min-h-screen ${appTheme.background} ${appTheme.text} relative overflow-hidden`}>
                {/* Enhanced Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
                    {/* Enhanced Left Sidebar */}
                    <aside className={`w-full lg:w-80 xl:w-96 py-8 px-6 border-r ${appTheme.border} ${appTheme.cardBg} backdrop-blur-xl transition-all duration-300 ease-in-out shadow-2xl`}>
                        <div className="flex flex-col h-full">
                            {/* Enhanced Profile Section */}
                            <div className="text-center mb-8">
                                <div className="relative inline-block group">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                                    <img
                                        src={currentUser?.avatar || 'https://via.placeholder.com/100/1f2937/ffffff?text=U'}
                                        alt="User Avatar"
                                        className="relative w-24 h-24 rounded-full border-4 border-white/20 shadow-2xl object-cover"
                                    />
                                    {currentUser?.isPremium && (
                                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                            <StarIcon className="w-4 h-4 text-white" filled />
                                        </div>
                                    )}
                                </div>
                                
                                <h3 className={`mt-4 font-bold text-xl ${appTheme.text} tracking-wide`}>
                                    {currentUser?.firstName} {currentUser?.lastName}
                                </h3>
                                <p className={`text-sm ${appTheme.cardText} mb-2`}>
                                    {currentUser?.emailId}
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className={`text-xs px-3 py-1 rounded-full ${appTheme.cardBg} border ${appTheme.border}`}>
                                        {currentUser?.role || 'User'}
                                    </span>
                                    {currentUser?.isPremium && (
                                        <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30">
                                            Premium
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Enhanced Navigation */}
                            <nav className="flex-1 space-y-3">
                                {navigationItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSettingTab(item.id)}
                                        className={`w-full flex items-center px-6 py-4 rounded-xl transition-all duration-300 text-left group relative overflow-hidden ${
                                            activeSettingTab === item.id
                                                ? `bg-gradient-to-r from-cyan-500/20 to-purple-500/20 ${appTheme.highlight} shadow-lg border border-cyan-500/30`
                                                : `${appTheme.text} hover:bg-gray-700/30 hover:${item.color} border border-transparent hover:border-gray-600/50`
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
                                            activeSettingTab === item.id 
                                                ? 'bg-cyan-500/20' 
                                                : 'bg-gray-700/30 group-hover:bg-gray-600/50'
                                        }`}>
                                            <item.icon className={`w-5 h-5 ${
                                                activeSettingTab === item.id ? appTheme.highlight : item.color
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-base">{item.name}</div>
                                            <div className={`text-xs ${appTheme.cardText} opacity-70 group-hover:opacity-100 transition-opacity duration-300`}>
                                                {item.description}
                                            </div>
                                        </div>
                                        {activeSettingTab === item.id && (
                                            <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full"></div>
                                        )}
                                    </button>
                                ))}
                            </nav>

                            {/* Enhanced Logout Button */}
                            <div className="mt-8 pt-6 border-t border-gray-700/50">
                                <button
                                    onClick={() => {
                                        dispatch(logoutUser());
                                        navigate('/login');
                                    }}
                                    className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500/50 group`}
                                >
                                    <LogoutIcon className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Enhanced Main Content Area */}
                    <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                        {/* Profile Tab */}
                        {activeSettingTab === 'profile' && (
                            <div className="max-w-4xl mx-auto space-y-8">
                                {/* Header */}
                                <div className="text-center lg:text-left">
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                        Profile Details
                                    </h1>
                                    <p className={`text-lg ${appTheme.cardText}`}>
                                        Manage your personal information and account preferences
                                    </p>
                                </div>

                                {/* Profile Cards */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Personal Information Card */}
                                    <section className={`${appTheme.cardBg} rounded-2xl border ${appTheme.border} p-8 shadow-2xl backdrop-blur-xl hover:shadow-cyan-500/10 transition-all duration-300`}>
                                        <div className="flex items-center mb-6">
                                            <div className="p-3 rounded-xl bg-blue-500/20">
                                                <UserIcon className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <h2 className="text-2xl font-bold ml-4">Personal Information</h2>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="group">
                                                    <label className={`block text-sm font-semibold ${appTheme.cardText} mb-2 group-hover:text-cyan-400 transition-colors duration-200`}>
                                                        First Name
                                                    </label>
                                                    <div className={`p-4 rounded-xl border ${appTheme.border} bg-gray-800/30 ${appTheme.text} font-medium hover:border-cyan-500/50 transition-all duration-200`}>
                                                        {currentUser?.firstName}
                                                    </div>
                                                </div>
                                                <div className="group">
                                                    <label className={`block text-sm font-semibold ${appTheme.cardText} mb-2 group-hover:text-cyan-400 transition-colors duration-200`}>
                                                        Last Name
                                                    </label>
                                                    <div className={`p-4 rounded-xl border ${appTheme.border} bg-gray-800/30 ${appTheme.text} font-medium hover:border-cyan-500/50 transition-all duration-200`}>
                                                        {currentUser?.lastName || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="group">
                                                <label className={`block text-sm font-semibold ${appTheme.cardText} mb-2 group-hover:text-cyan-400 transition-colors duration-200`}>
                                                    Email Address
                                                </label>
                                                <div className={`p-4 rounded-xl border ${appTheme.border} bg-gray-800/30 ${appTheme.text} font-medium hover:border-cyan-500/50 transition-all duration-200`}>
                                                    {currentUser?.emailId}
                                                </div>
                                            </div>
                                            
                                            <div className="group">
                                                <label className={`block text-sm font-semibold ${appTheme.cardText} mb-2 group-hover:text-cyan-400 transition-colors duration-200`}>
                                                    Role
                                                </label>
                                                <div className={`p-4 rounded-xl border ${appTheme.border} bg-gray-800/30 ${appTheme.text} font-medium hover:border-cyan-500/50 transition-all duration-200`}>
                                                    {currentUser?.role}
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            to="/profile/edit"
                                            className="mt-8 w-full inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        >
                                            Edit Profile
                                        </Link>
                                    </section>

                                    {/* Account Stats Card */}
                                    <section className={`${appTheme.cardBg} rounded-2xl border ${appTheme.border} p-8 shadow-2xl backdrop-blur-xl hover:shadow-purple-500/10 transition-all duration-300`}>
                                        <div className="flex items-center mb-6">
                                            <div className="p-3 rounded-xl bg-purple-500/20">
                                                <StarIcon className="w-6 h-6 text-purple-400" filled />
                                            </div>
                                            <h2 className="text-2xl font-bold ml-4">Account Status</h2>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                                <span className={`font-medium ${appTheme.cardText}`}>Membership Type</span>
                                                <span className={`px-4 py-2 rounded-full font-bold ${
                                                    currentUser?.isPremium 
                                                        ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30'
                                                        : 'bg-gray-700/50 text-gray-300 border border-gray-600/50'
                                                }`}>
                                                    {currentUser?.isPremium ? 'Premium' : 'Free'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                                <span className={`font-medium ${appTheme.cardText}`}>Member Since</span>
                                                <span className={`font-bold ${appTheme.text}`}>
                                                    {new Date(currentUser?.joinedDate || '2024-01-01').toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                                <span className={`font-medium ${appTheme.cardText}`}>Account Status</span>
                                                <span className="px-4 py-2 rounded-full font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                                                    Active
                                                </span>
                                            </div>
                                        </div>

                                        {!currentUser?.isPremium && (
                                            <Link
                                                to="/premium"
                                                className="mt-8 w-full inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-amber-500/25 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            >
                                                <StarIcon className="w-5 h-5 mr-2" filled />
                                                Upgrade to Premium
                                            </Link>
                                        )}
                                    </section>
                                </div>
                            </div>
                        )}

                        {/* Theme Tab */}
                        {activeSettingTab === 'theme' && (
                            <div className="max-w-7xl mx-auto space-y-8">
                                {/* Header */}
                                <div className="text-center lg:text-left">
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                                        Theme Preferences
                                    </h1>
                                    <p className={`text-lg ${appTheme.cardText}`}>
                                        Customize your visual experience with beautiful themes
                                    </p>
                                </div>

                                {/* Enhanced Search and Filter Section */}
                                <section className={`${appTheme.cardBg} rounded-2xl border ${appTheme.border} p-8 shadow-2xl backdrop-blur-xl`}>
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Search Bar */}
                                        <div className="flex-1 relative group">
                                            <SearchIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${appTheme.cardText} group-focus-within:text-cyan-400 transition-colors duration-200`} />
                                            <input
                                                type="text"
                                                placeholder="Search themes by name or description..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className={`w-full pl-12 pr-4 py-4 rounded-xl border ${appTheme.border} bg-gray-800/50 ${appTheme.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200`}
                                            />
                                        </div>

                                        {/* Filter Buttons */}
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-semibold ${appTheme.cardText} hidden sm:block`}>Filter:</span>
                                            {[
                                                { key: 'all', label: 'All Themes', icon: '🎨' },
                                                { key: 'free', label: 'Free', icon: '🆓' },
                                                { key: 'premium', label: 'Premium', icon: '⭐' }
                                            ].map((filter) => (
                                                <button
                                                    key={filter.key}
                                                    onClick={() => setThemeFilter(filter.key)}
                                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                                                        themeFilter === filter.key
                                                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                                                            : `${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} hover:border-cyan-500/50 hover:bg-gray-700/50`
                                                    }`}
                                                >
                                                    <span className="mr-2">{filter.icon}</span>
                                                    {filter.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Results Counter */}
                                    <div className="mt-6 pt-6 border-t border-gray-700/50">
                                        <p className={`text-sm ${appTheme.cardText}`}>
                                            <span className="font-semibold text-cyan-400">{filteredThemes.length}</span> 
                                            {' '}{filteredThemes.length === 1 ? 'theme' : 'themes'} found
                                            {searchQuery && ` matching "${searchQuery}"`}
                                            {themeFilter !== 'all' && ` in ${themeFilter} category`}
                                        </p>
                                    </div>
                                </section>

                                {/* Enhanced Theme Grid */}
                                {filteredThemes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                        {filteredThemes.map((t) => (
                                            <div
                                                key={t.name}
                                                className={`group relative rounded-2xl border-2 transition-all duration-500 cursor-pointer overflow-hidden ${
                                                    theme.name === t.name 
                                                        ? `border-cyan-400 scale-105 shadow-2xl shadow-cyan-500/25 ring-4 ring-cyan-500/20` 
                                                        : `${t.border} hover:border-cyan-500/50 hover:scale-102 hover:shadow-xl`
                                                } ${t.cardBg} backdrop-blur-xl ${
                                                    t.isPremium && !currentUser?.isPremium ? 'opacity-75' : ''
                                                }`}
                                                onClick={() => handleThemeSelect(t)}
                                            >
                                                {/* Premium Overlay */}
                                                {t.isPremium && !currentUser?.isPremium && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20 p-6 text-center">
                                                        <div className="p-4 rounded-full bg-amber-500/20 mb-4">
                                                            <LockIcon className="w-8 h-8 text-amber-400" />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-amber-400 mb-2">Premium Theme</h3>
                                                        <p className="text-gray-300 text-sm mb-4">Unlock with Premium membership</p>
                                                        <Link
                                                            to="/premium"
                                                            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Upgrade Now
                                                        </Link>
                                                    </div>
                                                )}

                                                {/* Theme Preview */}
                                                <div className={`p-6 ${t.background} ${t.text} relative`}>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="font-bold text-xl mb-1">{t.name}</h3>
                                                            {t.description && (
                                                                <p className={`text-sm ${t.cardText} opacity-80`}>
                                                                    {t.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            {theme.name === t.name && (
                                                                <div className="p-2 rounded-full bg-green-500/20">
                                                                    <CheckIcon className="w-5 h-5 text-green-400" />
                                                                </div>
                                                            )}
                                                            {t.isPremium && (
                                                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                                    Premium
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Sample Content */}
                                                    <div className={`p-4 rounded-xl border ${t.border} ${t.cardBg} ${t.cardText} mb-4`}>
                                                        <h4 className={`font-semibold ${t.highlight} mb-2`}>Sample Content</h4>
                                                        <p className="text-sm opacity-80 mb-3">
                                                            This is how your content will look with this theme.
                                                        </p>
                                                        <button className={`w-full py-2 rounded-lg text-sm font-medium ${t.primary} ${t.buttonText} hover:opacity-90 transition-opacity`}>
                                                            Primary Button
                                                        </button>
                                                    </div>

                                                    {/* Color Palette */}
                                                    <div>
                                                        <p className={`text-sm font-semibold mb-3 ${t.cardText}`}>
                                                            Color Palette
                                                        </p>
                                                        <div className="flex items-center justify-center space-x-3">
                                                            <div 
                                                                title="Background" 
                                                                className={`w-8 h-8 rounded-full ${t.background} border-2 ${t.border} shadow-lg`}
                                                            />
                                                            <div 
                                                                title="Card Background" 
                                                                className={`w-8 h-8 rounded-full ${t.cardBg} border-2 ${t.border} shadow-lg`}
                                                            />
                                                            <div 
                                                                title="Primary Color" 
                                                                className={`w-8 h-8 rounded-full ${t.primary} border-2 border-white/20 shadow-lg`}
                                                            />
                                                            <div 
                                                                title="Highlight Color" 
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${t.cardBg} border-2 ${t.border} shadow-lg`}
                                                            >
                                                                <span className={`text-xs font-bold ${t.highlight}`}>H</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Theme Actions */}
                                                <div className="p-4 border-t border-gray-700/30">
                                                    <button
                                                        onClick={() => handleThemeSelect(t)}
                                                        disabled={t.isPremium && !currentUser?.isPremium}
                                                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                                                            theme.name === t.name
                                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                : t.isPremium && !currentUser?.isPremium
                                                                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white border border-gray-600/50 hover:border-gray-500/50'
                                                        }`}
                                                    >
                                                        {theme.name === t.name ? 'Active Theme' : 'Apply Theme'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`text-center py-16 ${appTheme.cardBg} rounded-2xl border ${appTheme.border} backdrop-blur-xl`}>
                                        <div className="p-4 rounded-full bg-gray-700/30 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                                            <SearchIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">No themes found</h3>
                                        <p className={`${appTheme.cardText} mb-6`}>
                                            Try adjusting your search query or filter settings
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setThemeFilter('all');
                                            }}
                                            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 transition-all duration-300"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Account Tab */}
                        {activeSettingTab === 'account' && (
                            <div className="max-w-4xl mx-auto space-y-8">
                                {/* Header */}
                                <div className="text-center lg:text-left">
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
                                        Account Settings
                                    </h1>
                                    <p className={`text-lg ${appTheme.cardText}`}>
                                        Manage your security settings and account preferences
                                    </p>
                                </div>

                                {/* Change Password Section */}
                                <section className={`${appTheme.cardBg} rounded-2xl border ${appTheme.border} p-8 shadow-2xl backdrop-blur-xl`}>
                                    <div className="flex items-center mb-8">
                                        <div className="p-3 rounded-xl bg-blue-500/20">
                                            <LockIcon className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold ml-4">Change Password</h2>
                                    </div>

                                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                        <div className="group">
                                            <label className={`block text-sm font-semibold ${appTheme.cardText} mb-2 group-focus-within:text-cyan-400 transition-colors duration-200`}>
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                className={`w-full px-4 py-4 rounded-xl border ${appTheme.border} bg-gray-800/50 ${appTheme.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200`}
                                                placeholder="Enter your current password"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="group">
                                                <label className={`block text-sm font-semibold ${appTheme.cardText} mb-2 group-focus-within:text-cyan-400 transition-colors duration-200`}>
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className={`w-full px-4 py-4 rounded-xl border ${appTheme.border} bg-gray-800/50 ${appTheme.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200`}
                                                    placeholder="Enter new password"
                                                    required
                                                />
                                            </div>

                                            <div className="group">
                                                <label className={`block text-sm font-semibold ${appTheme.cardText} mb-2 group-focus-within:text-cyan-400 transition-colors duration-200`}>
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="confirmNewPassword"
                                                    value={passwordData.confirmNewPassword}
                                                    onChange={handlePasswordChange}
                                                    className={`w-full px-4 py-4 rounded-xl border ${appTheme.border} bg-gray-800/50 ${appTheme.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200`}
                                                    placeholder="Confirm new password"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isChangingPassword}
                                            className={`w-full px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isChangingPassword ? (
                                                <div className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Updating Password...
                                                </div>
                                            ) : (
                                                'Update Password'
                                            )}
                                        </button>
                                    </form>
                                </section>

                                {/* Danger Zone */}
                                <section className={`bg-red-500/10 rounded-2xl border border-red-500/30 p-8 shadow-2xl backdrop-blur-xl`}>
                                    <div className="flex items-center mb-6">
                                        <div className="p-3 rounded-xl bg-red-500/20">
                                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.766 0L3.048 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold ml-4 text-red-400">Danger Zone</h2>
                                    </div>

                                    <div className="bg-red-500/5 rounded-xl p-6 border border-red-500/20 mb-6">
                                        <h3 className="text-xl font-bold text-red-400 mb-2">Delete Account</h3>
                                        <p className="text-red-300/80 text-sm leading-relaxed mb-4">
                                            Once you delete your account, there is no going back. This action cannot be undone.
                                            All your data, including your profile, settings, and any associated content will be 
                                            permanently removed from our servers.
                                        </p>
                                        <ul className="text-red-300/70 text-sm space-y-1 mb-6">
                                            <li>• All personal information will be deleted</li>
                                            <li>• Premium subscriptions will be canceled</li>
                                            <li>• Theme preferences will be lost</li>
                                            <li>• This action is irreversible</li>
                                        </ul>
                                    </div>

                                    <button
                                        onClick={openDeleteModal}
                                        className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    >
                                        Delete My Account Permanently
                                    </button>
                                </section>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Enhanced Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className={`${appTheme.cardBg} rounded-2xl border border-red-500/30 w-full max-w-md shadow-2xl backdrop-blur-xl`}>
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <div className="p-4 rounded-full bg-red-500/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.766 0L3.048 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-red-400 mb-2">Delete Account</h2>
                                <p className={`${appTheme.cardText} text-sm leading-relaxed`}>
                                    This action cannot be undone. All your data will be permanently deleted.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="group">
                                    <label className={`block text-sm font-semibold ${appTheme.cardText} mb-2 group-focus-within:text-red-400 transition-colors duration-200`}>
                                        Enter your password to continue
                                    </label>
                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className={`w-full px-4 py-4 rounded-xl border ${appTheme.border} bg-gray-800/50 ${appTheme.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200`}
                                        placeholder="Enter your password"
                                    />
                                </div>

                                <div className="group">
                                    <label className={`block text-sm font-semibold ${appTheme.cardText} mb-2 group-focus-within:text-red-400 transition-colors duration-200`}>
                                        Type <span className="font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded">delete my account</span> to confirm
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        className={`w-full px-4 py-4 rounded-xl border ${appTheme.border} bg-gray-800/50 ${appTheme.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200`}
                                        placeholder="delete my account"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={closeDeleteModal}
                                    className={`flex-1 px-6 py-4 rounded-xl font-semibold border ${appTheme.border} ${appTheme.cardText} hover:bg-gray-700/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50`}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex-1 px-6 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Deleting...
                                        </div>
                                    ) : (
                                        'Delete Forever'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default SettingPage;
