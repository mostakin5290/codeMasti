import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import { FaTrash, FaCheckCircle, FaUserShield, FaCrown, FaSearch, FaFilter, FaUserCog, FaUserAlt } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom'; // Import Link from react-router-dom

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

const AdminUsersPage = () => {
    const { user: currentUser } = useSelector(state => state.auth);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [modalIsLoading, setModalIsLoading] = useState(false);

    // NEW STATES for Premium Duration
    const [selectedPremiumDuration, setSelectedPremiumDuration] = useState('1month');
    const [customMonthsInput, setCustomMonthsInput] = useState('');

    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };


    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get('user', {
                params: {
                    search: searchTerm,
                    filter: filterBy
                }
            });
            setUsers(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch users.");
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterBy]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- Modal Confirmation Handlers ---
    const openConfirmModal = (actionType, user, newRole = null, newPremiumStatus = null) => {
        setModalAction({
            type: actionType,
            user,
            newRole,
            newPremiumStatus
        });
        // Reset premium duration selection when opening modal for *granting* premium
        if (actionType === 'togglePremium' && newPremiumStatus) {
            setSelectedPremiumDuration('1month'); // Default to 1 month
            setCustomMonthsInput('');
        }
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        if (!modalAction) return;

        // Frontend check: If co-admin tries to delete, prevent API call
        if (currentUser.role === 'co-admin' && modalAction.type === 'delete') {
            toast.error("You are not authorized to delete user accounts.");
            setShowConfirmModal(false);
            setModalAction(null);
            return;
        }

        // Frontend validation for premium grant (only when granting, not revoking)
        if (modalAction.type === 'togglePremium' && modalAction.newPremiumStatus) {
            if (selectedPremiumDuration === 'custom') {
                const months = parseInt(customMonthsInput, 10);
                if (isNaN(months) || months <= 0) {
                    toast.error('Please enter a valid positive number of months for custom duration.');
                    return;
                }
            }
        }

        setModalIsLoading(true);

        try {
            const { type, user, newRole, newPremiumStatus } = modalAction;
            let successMessage = '';
            let endpoint = '';
            let payload = {};

            if (type === 'delete') {
                endpoint = `/user/${user._id}`;
                successMessage = 'User deleted successfully!';
            } else if (type === 'toggleRole') {
                endpoint = `/user/${user._id}/role`;
                payload = { role: newRole };
                successMessage = `User role updated to ${newRole} successfully!`;
            } else if (type === 'togglePremium') {
                endpoint = `/user/${user._id}/premium`;
                payload = { isPremium: newPremiumStatus };
                if (newPremiumStatus) { // If granting premium, include duration info
                    payload.duration = selectedPremiumDuration;
                    if (selectedPremiumDuration === 'custom') {
                        payload.customMonths = parseInt(customMonthsInput, 10);
                    }
                    successMessage = `User premium access granted for ${selectedPremiumDuration === 'custom' ? customMonthsInput + ' months' : selectedPremiumDuration.replace('month', ' Month').replace('year', ' Year')}!`;
                } else { // If revoking premium
                    successMessage = `User premium status revoked!`;
                }
            }

            if (type === 'delete') {
                await axiosClient.delete(endpoint);
            } else {
                await axiosClient.put(endpoint, payload);
            }

            toast.success(successMessage);
            fetchUsers(); // Refresh the user list
        } catch (err) {
            console.error('Admin action error:', err);
            toast.error(err.response?.data?.message || 'An error occurred.');
        } finally {
            setModalIsLoading(false);
            setShowConfirmModal(false);
            setModalAction(null);
            // Reset premium selection states after action or cancel
            setSelectedPremiumDuration('1month');
            setCustomMonthsInput('');
        }
    };

    const handleCancelAction = () => {
        setShowConfirmModal(false);
        setModalAction(null);
        // Reset premium selection states on cancel
        setSelectedPremiumDuration('1month');
        setCustomMonthsInput('');
    };

    // --- Search and Filter Handlers ---
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterBy(e.target.value);
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${appTheme.background} flex items-center justify-center`}>
                <LoadingSpinner message="Loading users..." appTheme={appTheme} />
            </div>
        );
    }

    // Determine if the "Confirm" button in the modal should be disabled
    const disableConfirmButtonInModal = modalIsLoading ||
                                       (modalAction?.type === 'delete' && currentUser.role === 'co-admin') ||
                                       (modalAction?.type === 'togglePremium' && modalAction.newPremiumStatus && selectedPremiumDuration === 'custom' && (isNaN(parseInt(customMonthsInput, 10)) || parseInt(customMonthsInput, 10) <= 0));


    return (
        <div className={`min-h-screen ${appTheme.background} p-4 sm:p-6 lg:p-8`}>
            <h1 className={`text-2xl sm:text-3xl font-bold ${appTheme.text} mb-6`}>Admin Panel - Manage Users</h1>

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className={`${appTheme.cardText}/50`} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={`w-full pl-10 ${appTheme.cardBg}/10 border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent`}
                        placeholder="Search by name or email..."
                    />
                </div>
                <select
                    value={filterBy}
                    onChange={handleFilterChange}
                    className={`w-full sm:w-1/4 ${appTheme.cardBg}/10 border ${appTheme.border} ${appTheme.text} rounded-lg shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent appearance-none`}
                >
                    <option value="all">All Users</option>
                    <option value="all_admins">All Admin Roles</option>
                    <option value="admin">Admins</option>
                    <option value="co-admin">Co-Admins</option>
                    <option value="user">Regular Users</option>
                    <option value="premium">Premium Users</option>
                    <option value="normal">Non-Premium Users</option>
                </select>
            </div>

            <div className="overflow-x-auto rounded-lg shadow-xl">
                <table className={`min-w-full divide-y ${appTheme.border}`}>
                    <thead className={`${appTheme.cardBg}`}>
                        <tr>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider sm:px-6 sm:py-3`}>User</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider sm:px-6 sm:py-3`}>Role</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider sm:px-6 sm:py-3`}>Premium</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider sm:px-6 sm:py-3`}>Problems Solved</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider sm:px-6 sm:py-3`}>Joined</th>
                            <th className={`px-3 py-2 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider sm:px-6 sm:py-3`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${appTheme.border}`}>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="6" className={`px-3 py-8 text-center ${appTheme.cardText} sm:px-6`}>
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            users.map(user => {
                                const isCurrentUser = currentUser && currentUser._id === user._id;

                                // canModifyTarget: User cannot modify themselves.
                                const canModifyTarget = !isCurrentUser;

                                return (
                                    <tr key={user._id} className={`hover:${appTheme.cardBg}/50 transition-all duration-200`}>
                                        <td className="px-3 py-4 sm:px-6 sm:py-4">
                                            <Link to={`/profile/${user._id}`} className="flex items-center gap-2 sm:gap-3 group">
                                                <div className="flex-shrink-0 h-10 w-10 md:h-12 md:w-12">
                                                    <img className={`h-full w-full rounded-full object-cover border-2 ${appTheme.primary.replace('bg-', 'border-')}/30`} src={user.avatar || 'https://uxwing.com/wp-content/themes/uxwing/download/business-professional-services/business-professional-icon.png'} alt="User Avatar" />
                                                </div>
                                                <div>
                                                    <div className={`font-bold ${appTheme.text} text-sm sm:text-base group-hover:${appTheme.highlight} transition-colors`}>{user.firstName} {user.lastName}</div>
                                                </div>
                                            </Link>
                                        </td>
                                        {/* Role Column - Updated for admin, co-admin, user display and actions */}
                                        <td className="px-3 py-4 sm:px-6 sm:py-4">
                                            <div className='flex flex-col items-start'>
                                                {user.role === 'admin' && (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${appTheme.primary.replace('bg-', 'bg-')} ${appTheme.primary} border ${appTheme.primary.replace('bg-', 'border-')}`}>
                                                        <FaUserShield className="mr-1" />Admin
                                                    </span>
                                                )}
                                                {user.role === 'co-admin' && (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${appTheme.secondary.replace('bg-', 'bg-')}/10 ${appTheme.secondary} border ${appTheme.secondary.replace('bg-', 'border-')}/30`}>
                                                        <FaUserCog className="mr-1" />Co-Admin
                                                    </span>
                                                )}
                                                {user.role === 'user' && (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${appTheme.cardBg}/50 ${appTheme.cardText} border ${appTheme.border}/50`}>
                                                        <FaUserAlt className="mr-1" />User
                                                    </span>
                                                )}

                                                {/* Action Buttons for Role Change */}
                                                {canModifyTarget && (
                                                    <>
                                                        {(currentUser.role === 'admin' || currentUser.role === 'co-admin') && user.role === 'user' && (
                                                            <button
                                                                onClick={() => openConfirmModal('toggleRole', user, 'co-admin')}
                                                                className={`mt-1 px-2 py-1 rounded-md text-xs transition-colors duration-200
                                                                ${appTheme.cardBg}/50 ${appTheme.text} hover:${appTheme.cardBg}/70
                                                                text-${appTheme.secondary.split('-')[1]}-500
                                                                `}
                                                                title="Promote to Co-Admin"
                                                                disabled={modalIsLoading}
                                                            >
                                                                Promote
                                                            </button>
                                                        )}

                                                        {currentUser.role === 'admin' && (user.role === 'admin' || user.role === 'co-admin') && (
                                                            <button
                                                                onClick={() => openConfirmModal('toggleRole', user, 'user')}
                                                                className={`mt-1 px-2 py-1 rounded-md text-xs transition-colors duration-200
                                                                ${appTheme.cardBg}/50 ${appTheme.text} hover:${appTheme.cardBg}/70
                                                                text-${appTheme.errorColor.split('-')[1]}-500
                                                                `}
                                                                title="Demote to User"
                                                                disabled={modalIsLoading}
                                                            >
                                                                Demote
                                                            </button>
                                                        )}

                                                        {currentUser.role === 'co-admin' && user.role === 'co-admin' && (
                                                            <button
                                                                onClick={() => openConfirmModal('toggleRole', user, 'user')}
                                                                className={`mt-1 px-2 py-1 rounded-md text-xs transition-colors duration-200
                                                                ${appTheme.cardBg}/50 ${appTheme.text} hover:${appTheme.cardBg}/70
                                                                text-${appTheme.errorColor.split('-')[1]}-500
                                                                `}
                                                                title="Demote to User"
                                                                disabled={modalIsLoading}
                                                            >
                                                                Demote to User
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                                {/* Message for current logged-in user (no action) */}
                                                {!canModifyTarget && (
                                                    <p className={`mt-1 text-xs ${appTheme.cardText}/70`}></p>
                                                )}
                                            </div>
                                        </td>
                                        {/* Premium Column */}
                                        <td className="px-3 py-4 sm:px-6 sm:py-4">
                                            <div className='flex flex-col justify-center items-center'>
                                                {user.isPremium ? (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${appTheme.highlightTertiary.replace('text-', 'bg-')}/10 ${appTheme.highlightTertiary} border ${appTheme.highlightTertiary.replace('text-', 'border-')}/30`}>
                                                        <FaCrown className="mr-1" /> Premium
                                                    </span>
                                                ) : (
                                                    <>Normal</>
                                                )}
                                                {canModifyTarget && (
                                                    <button
                                                        onClick={() => openConfirmModal('togglePremium', user, null, !user.isPremium)}
                                                        className={`mt-1 px-2 py-1 rounded-md text-xs transition-colors duration-200
                                                        ${appTheme.cardBg}/50 ${appTheme.cardText} hover:${appTheme.cardBg}/70
                                                        ${user.isPremium ? `text-${appTheme.errorColor.split('-')[1]}-500` : `text-${appTheme.successColor.split('-')[1]}-500`}
                                                        `}
                                                        title={user.isPremium ? "Revoke Premium" : "Grant Premium"}
                                                        disabled={modalIsLoading}
                                                    >
                                                        {user.isPremium ? 'Revoke' : 'Grant'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-center font-semibold sm:px-6 sm:py-4">
                                            <FaCheckCircle className={`${appTheme.successColor} inline mr-1 text-sm sm:mr-2`} />
                                            <span className={`${appTheme.text} text-sm sm:text-base`}>{user.problemsSolved?.length || 0}</span>
                                        </td>
                                        <td className={`px-3 py-4 whitespace-nowrap ${appTheme.cardText} text-xs sm:text-sm sm:px-6 sm:py-4`}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-3 py-4 whitespace-nowrap sm:px-6 sm:py-4">
                                            <button
                                                onClick={() => openConfirmModal('delete', user)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${appTheme.errorColor.replace('text-', 'border-')}/50 ${appTheme.errorColor} hover:${appTheme.errorColor.replace('text-', 'bg-')}/10 transition-all duration-200`}
                                                title="Delete User"
                                                disabled={modalIsLoading || isCurrentUser || user.role === 'admin'}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Modal Render */}
            {showConfirmModal && modalAction && (
                <ConfirmationModal
                    isOpen={showConfirmModal}
                    onClose={handleCancelAction}
                    onConfirm={handleConfirmAction}
                    isLoading={modalIsLoading}
                    // Pass disableConfirm to the modal
                    disableConfirm={disableConfirmButtonInModal}
                    title={
                        modalAction.type === 'delete' ? 'Delete User?' :
                            modalAction.type === 'toggleRole' ? `Change ${modalAction.user.firstName}'s Role?` :
                                modalAction.type === 'togglePremium' ? `Change ${modalAction.user.firstName}'s Premium Status?` :
                                    'Confirm Action'
                    }
                    confirmText={
                        modalAction.type === 'delete' ? (currentUser.role === 'co-admin' ? 'Not Authorized' : 'Delete Permanently') :
                            modalAction.type === 'toggleRole' ? `Confirm ${modalAction.newRole === 'co-admin' ? 'Promotion' : 'Demotion'}` :
                                modalAction.type === 'togglePremium' ? `Confirm ${modalAction.newPremiumStatus ? 'Grant Premium' : 'Revoke Premium'}` :
                                    'Confirm'
                    }
                    cancelText="Cancel"
                    appTheme={appTheme}
                >
                    {modalAction.type === 'delete' && (
                        <>
                            {currentUser.role === 'co-admin' ? (
                                <p className={`mt-2 text-sm ${appTheme.errorColor} font-bold`}>
                                    <FaUserShield className="inline mr-1" /> As a Co-administrator, you are not authorized to delete user accounts. Only an Administrator can perform this action.
                                </p>
                            ) : (
                                <>
                                    <p className={`${appTheme.cardText}`}>Are you sure you want to permanently delete user: <br /> <strong className={`${appTheme.primary.replace('bg-', 'text-')}`}>{modalAction.user.firstName} {modalAction.user.lastName}</strong> ({modalAction.user.emailId})?</p>
                                    <p className={`mt-2 text-sm ${appTheme.errorColor}`}>This action cannot be undone and will remove all their associated data (posts, comments, etc.).</p>
                                    {modalAction.user.role === 'admin' && (
                                        <p className={`mt-2 text-sm ${appTheme.warningColor} font-bold`}>WARNING: This user has 'admin' role. Deleting an admin is typically not allowed directly. Backend may prevent this.</p>
                                    )}
                                </>
                            )}
                        </>
                    )}
                    {modalAction.type === 'toggleRole' && (
                        <>
                            <p className={`${appTheme.cardText}`}>You are about to change the role of <strong className={`${appTheme.primary.replace('bg-', 'text-')}`}>{modalAction.user.firstName} {modalAction.user.lastName}</strong> from <span className="font-semibold">{modalAction.user.role}</span> to <span className="font-semibold">{modalAction.newRole}</span>.</p>
                            <p className={`mt-2 text-sm ${appTheme.warningColor}`}>Proceed with caution as this affects user permissions.</p>
                        </>
                    )}
                    {modalAction.type === 'togglePremium' && (
                        <>
                            <p className={`${appTheme.cardText}`}>You are about to {modalAction.newPremiumStatus ? 'grant' : 'revoke'} premium access for <strong className={`${appTheme.primary.replace('bg-', 'text-')}`}>{modalAction.user.firstName} {modalAction.user.lastName}</strong>.</p>

                            {modalAction.newPremiumStatus && ( // Show duration options only when granting premium
                                <div className="mt-4">
                                    <label className={`block mb-2 text-sm font-medium ${appTheme.text}`}>Select Premium Duration:</label>
                                    <div className="flex flex-wrap gap-3">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className={`form-radio h-4 w-4 ${appTheme.primary.replace('bg-', 'text-')}`}
                                                name="premiumDuration"
                                                value="1month"
                                                checked={selectedPremiumDuration === '1month'}
                                                onChange={(e) => { setSelectedPremiumDuration(e.target.value); setCustomMonthsInput(''); }}
                                            />
                                            <span className={`ml-2 text-sm ${appTheme.cardText}`}>1 Month</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className={`form-radio h-4 w-4 ${appTheme.primary.replace('bg-', 'text-')}`}
                                                name="premiumDuration"
                                                value="2month"
                                                checked={selectedPremiumDuration === '2month'}
                                                onChange={(e) => { setSelectedPremiumDuration(e.target.value); setCustomMonthsInput(''); }}
                                            />
                                            <span className={`ml-2 text-sm ${appTheme.cardText}`}>2 Months</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className={`form-radio h-4 w-4 ${appTheme.primary.replace('bg-', 'text-')}`}
                                                name="premiumDuration"
                                                value="3month"
                                                checked={selectedPremiumDuration === '3month'}
                                                onChange={(e) => { setSelectedPremiumDuration(e.target.value); setCustomMonthsInput(''); }}
                                            />
                                            <span className={`ml-2 text-sm ${appTheme.cardText}`}>3 Months</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className={`form-radio h-4 w-4 ${appTheme.primary.replace('bg-', 'text-')}`}
                                                name="premiumDuration"
                                                value="1year"
                                                checked={selectedPremiumDuration === '1year'}
                                                onChange={(e) => { setSelectedPremiumDuration(e.target.value); setCustomMonthsInput(''); }}
                                            />
                                            <span className={`ml-2 text-sm ${appTheme.cardText}`}>1 Year</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className={`form-radio h-4 w-4 ${appTheme.primary.replace('bg-', 'text-')}`}
                                                name="premiumDuration"
                                                value="custom"
                                                checked={selectedPremiumDuration === 'custom'}
                                                onChange={(e) => setSelectedPremiumDuration(e.target.value)}
                                            />
                                            <span className={`ml-2 text-sm ${appTheme.cardText}`}>Custom (Months)</span>
                                        </label>
                                    </div>
                                    {selectedPremiumDuration === 'custom' && (
                                        <input
                                            type="number"
                                            value={customMonthsInput}
                                            onChange={(e) => setCustomMonthsInput(e.target.value)}
                                            placeholder="Enter months (e.g., 6)"
                                            className={`mt-3 w-full p-2 rounded ${appTheme.cardBg} ${appTheme.border} border ${appTheme.text}`}
                                            min="1"
                                        />
                                    )}
                                </div>
                            )}
                            <p className={`mt-2 text-sm ${appTheme.infoColor}`}>This will update their premium status immediately.</p>
                        </>
                    )}
                </ConfirmationModal>
            )}
        </div>
    );
};

export default AdminUsersPage;