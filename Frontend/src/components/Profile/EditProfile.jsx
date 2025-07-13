import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, setUser } from '../../features/auth/authSlice';
import Header from "../layout/Header";
import Footer from "../layout/Footer"; // Assuming you want footer here
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme hook

// Default theme for the app context. This will be merged with actual theme.
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

const EditProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { theme: appThemeFromContext } = useTheme(); // Get app theme
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) }; // Merge with default

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        headline: '',
        bio: '',
        location: '',
        avatar: '',
        github: '',
        linkedin: '',
        twitter: '',
        website: '',
        language: 'javascript',
        theme: 'vs-dark' // Default editor theme
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    // Delete account modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    // Loading states
    const [isUpdating, setIsUpdating] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Initialize form data
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                headline: user.headline || '',
                bio: user.bio || '',
                location: user.location || '',
                avatar: user.avatar || '',
                github: user.socialLinks?.github || '',
                linkedin: user.socialLinks?.linkedin || '',
                twitter: user.socialLinks?.twitter || '',
                website: user.socialLinks?.website || '',
                language: user.preferences?.language || 'javascript',
                theme: user.preferences?.theme || 'vs-dark'
            });
        }
    }, [user]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    // Form submission handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            // Prepare data for backend
            const dataToSend = {
                ...formData,
                socialLinks: {
                    github: formData.github,
                    linkedin: formData.linkedin,
                    twitter: formData.twitter,
                    website: formData.website
                },
                preferences: {
                    language: formData.language,
                    theme: formData.theme
                }
            };

            const { data } = await axiosClient.put('/user/profile', dataToSend);
            dispatch(setUser(data.user));
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error("Passwords don't match!");
            return;
        }

        setIsChangingPassword(true);
        try {
            await axiosClient.put('/user/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password.');
        } finally {
            setIsChangingPassword(false);
        }
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

    if (!user) {
        return (
            <div className={`min-h-screen ${appTheme.background} flex items-center justify-center`}>
                <span className={`loading loading-spinner text-${appTheme.primary.split('-')[1]} loading-lg`}></span> {/* Themed spinner */}
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${appTheme.background} ${appTheme.text}`}>
            <div className='mb-10'>
                <Header />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-10">
                    <h1 className={`text-3xl font-bold ${appTheme.text} mb-2`}>Edit Profile</h1>
                    <p className={`text-lg ${appTheme.cardText} mt-1`}>Manage your account and profile information.</p>
                </header>

                {/* Profile Information Form */}
                <form onSubmit={handleSubmit} className={`${appTheme.cardBg} p-6 sm:p-8 rounded-xl border ${appTheme.border} mb-8 shadow-lg`}>
                    <h2 className={`text-2xl font-semibold ${appTheme.text} mb-6`}>Profile Information</h2>

                    <div className="space-y-6">
                        {/* Avatar */}
                        <div className="flex items-center space-x-4">
                            <img
                                src={formData.avatar || 'https://via.placeholder.com/150'}
                                alt="User Avatar"
                                className={`w-20 h-20 rounded-full border-2 ${appTheme.primary} ${appTheme.cardBg}`}
                            />
                            <div className="flex-1">
                                <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Avatar URL</label>
                                <input
                                    type="text"
                                    name="avatar"
                                    value={formData.avatar}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                    placeholder="URL to your avatar image"
                                />
                            </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                    placeholder="Your first name"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                    placeholder="Your last name"
                                />
                            </div>
                        </div>

                        {/* Email (readonly) */}
                        <div>
                            <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Email</label>
                            <input
                                type="email"
                                value={user.emailId}
                                readOnly
                                className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.cardText} rounded-lg shadow-sm py-2 px-3 sm:text-sm cursor-not-allowed`}
                            />
                        </div>

                        {/* Headline */}
                        <div>
                            <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Headline</label>
                            <input
                                type="text"
                                name="headline"
                                value={formData.headline}
                                onChange={handleChange}
                                className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                placeholder="e.g., Full-Stack Developer"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Bio</label>
                            <textarea
                                name="bio"
                                rows={3}
                                value={formData.bio}
                                onChange={handleChange}
                                className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                placeholder="Tell us a little about yourself..."
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                placeholder="e.g., San Francisco, CA"
                            />
                        </div>

                        {/* Social Links */}
                        <h3 className={`text-xl font-semibold ${appTheme.text} pt-4 border-t ${appTheme.border}`}>Social Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>GitHub</label>
                                <input
                                    type="text"
                                    name="github"
                                    value={formData.github}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                    placeholder="github.com/your-username"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>LinkedIn</label>
                                <input
                                    type="text"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                    placeholder="linkedin.com/in/your-profile"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Twitter</label>
                                <input
                                    type="text"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                    placeholder="twitter.com/your-handle"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Website</label>
                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                    placeholder="your-domain.com"
                                />
                            </div>
                        </div>

                        {/* Preferences */}
                        <h3 className={`text-xl font-semibold ${appTheme.text} pt-4 border-t ${appTheme.border}`}>Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Default Language</label>
                                <select
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="c++">C++</option>
                                    <option value="go">Go</option>
                                    <option value="rust">Rust</option>
                                    <option value="typescript">TypeScript</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>Editor Theme</label>
                                <select
                                    name="theme"
                                    value={formData.theme}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent sm:text-sm`}
                                >
                                    <option value="vs-dark">VS Dark</option>
                                    <option value="light">Light</option> {/* This should map to vs-light if you use Monaco */}
                                    <option value="monokai">Monokai</option>
                                    <option value="solarized-dark">Solarized Dark</option>
                                    <option value="solarized-light">Solarized Light</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className={`pt-4 border-t ${appTheme.border}`}>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className={`${appTheme.primary} hover:${appTheme.primaryHover} ${appTheme.buttonText} font-medium py-2.5 px-6 rounded-lg transition-colors duration-300`}
                            >
                                {isUpdating ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Change Password Form */}
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
            </div>

            {/* Delete Account Modal */}
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
            <Footer /> {/* Footer added */}
        </div>
    );
};

export default EditProfile;