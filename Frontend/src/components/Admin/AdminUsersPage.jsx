import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
// Added FaUserCog for co-admin, FaUserAlt for regular user
import { FaTrash, FaCheckCircle, FaUserShield, FaCrown, FaSearch, FaFilter, FaUserCog, FaUserAlt } from 'react-icons/fa'; 
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';

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
    const { user: currentUser } = useSelector(state => state.auth); // Get current logged-in user
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for Search and Filter
    const [searchTerm, setSearchTerm] = useState('');
    // Updated filter options to include 'co-admin' and 'all_admins'
    const [filterBy, setFilterBy] = useState('all'); 

    // State for Confirmation Modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalAction, setModalAction] = useState(null); 
    const [modalIsLoading, setModalIsLoading] = useState(false); 

    // Get theme from context
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
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        if (!modalAction) return;

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
                successMessage = `User premium status updated to ${newPremiumStatus ? 'Premium' : 'Normal'} successfully!`;
            }

            if (type === 'delete') {
                await axiosClient.delete(endpoint);
            } else {
                await axiosClient.put(endpoint, payload);
            }

            toast.success(successMessage);
            fetchUsers(); 
        } catch (err) {
            console.error('Admin action error:', err);
            toast.error(err.response?.data?.message || 'An error occurred.');
        } finally {
            setModalIsLoading(false); 
            setShowConfirmModal(false); 
            setModalAction(null); 
        }
    };

    const handleCancelAction = () => {
        setShowConfirmModal(false);
        setModalAction(null);
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
                    <option value="all_admins">All Admin Roles</option> {/* New filter option */}
                    <option value="admin">Admins</option>
                    <option value="co-admin">Co-Admins</option> {/* New filter option */}
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

                                // `canModifyTarget` means the target user is NOT the current logged-in user.
                                // Further specific checks are needed for role-based permissions.
                                const canModifyTarget = !isCurrentUser; 

                                return (
                                    <tr key={user._id} className={`hover:${appTheme.cardBg}/50 transition-all duration-200`}>
                                        <td className="px-3 py-4 sm:px-6 sm:py-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="flex-shrink-0 h-10 w-10 md:h-12 md:w-12">
                                                    <img className={`h-full w-full rounded-full object-cover border-2 ${appTheme.primary.replace('bg-', 'border-')}/30`} src={user.avatar || 'https://uxwing.com/wp-content/themes/uxwing/download/business-professional-services/business-professional-icon.png'} alt="User Avatar" />
                                                </div>
                                                <div>
                                                    <div className={`font-bold ${appTheme.text} text-sm sm:text-base`}>{user.firstName} {user.lastName}</div>
                                                    <div className={`text-xs ${appTheme.cardText} opacity-70 sm:text-sm`}>{user.emailId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Role Column - Updated for admin, co-admin, user display and actions */}
                                        <td className="px-3 py-4 sm:px-6 sm:py-4">
                                            <div className='flex flex-col items-start'> 
                                                {user.role === 'admin' && (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${appTheme.primary.replace('bg-', 'bg-')}/10 ${appTheme.primary} border ${appTheme.primary.replace('bg-', 'border-')}/30`}>
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
                                                        {/* Promote to Admin (Only if current user is admin, and target is not already admin) */}
                                                        {currentUser.role === 'admin' && user.role !== 'admin' && (
                                                            <button
                                                                onClick={() => openConfirmModal('toggleRole', user, 'admin')}
                                                                className={`mt-1 px-2 py-1 rounded-md text-xs transition-colors duration-200
                                                                ${appTheme.cardBg}/50 ${appTheme.text} hover:${appTheme.cardBg}/70
                                                                text-${appTheme.primary.split('-')[1]}-500
                                                                `}
                                                                title="Promote to Admin"
                                                                disabled={modalIsLoading}
                                                            >
                                                                Promote to Admin
                                                            </button>
                                                        )}

                                                        {/* Promote to Co-Admin (If current user is admin or co-admin, and target is user) */}
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
                                                                Promote to Co-Admin
                                                            </button>
                                                        )}

                                                        {/* Demote to User (If current user is admin, and target is admin or co-admin) */}
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
                                                                Demote to User
                                                            </button>
                                                        )}

                                                        {/* Demote to User (If current user is co-admin, and target is co-admin) */}
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
                                                        
                                                        {/* Message for Co-admin trying to modify Admin */}
                                                        {currentUser.role === 'co-admin' && user.role === 'admin' && (
                                                            <p className={`mt-1 text-xs ${appTheme.warningColor}`}>Co-admin cannot change admin role</p>
                                                        )}
                                                    </>
                                                )}
                                                {/* Message for current logged-in user */}
                                                {!canModifyTarget && ( 
                                                    <p className={`mt-1 text-xs ${appTheme.cardText}/70`}>Cannot modify self</p>
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
                                                // Disable if: modal is loading, it's the current user, or the target user has 'admin' role
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
                    title={
                        modalAction.type === 'delete' ? 'Delete User?' :
                            modalAction.type === 'toggleRole' ? `Change ${modalAction.user.firstName}'s Role?` :
                                modalAction.type === 'togglePremium' ? `Change ${modalAction.user.firstName}'s Premium Status?` :
                                    'Confirm Action'
                    }
                    confirmText={
                        modalAction.type === 'delete' ? 'Delete Permanently' :
                            modalAction.type === 'toggleRole' ? `Confirm ${modalAction.newRole === 'admin' ? 'Promotion' : 'Demotion'}` :
                                modalAction.type === 'togglePremium' ? `Confirm ${modalAction.newPremiumStatus ? 'Grant' : 'Revoke'}` :
                                    'Confirm'
                    }
                    cancelText="Cancel"
                    appTheme={appTheme}
                >
                    {modalAction.type === 'delete' && (
                        <>
                            <p className={`${appTheme.cardText}`}>Are you sure you want to permanently delete user: <br /> <strong className={`${appTheme.primary.replace('bg-', 'text-')}`}>{modalAction.user.firstName} {modalAction.user.lastName}</strong> ({modalAction.user.emailId})?</p>
                            <p className={`mt-2 text-sm ${appTheme.errorColor}`}>This action cannot be undone and will remove all their associated data (posts, comments, etc.).</p>
                            {/* This warning is mostly for a disabled button scenario; it shouldn't typically be reachable */}
                            {modalAction.user.role === 'admin' && ( 
                                <p className={`mt-2 text-sm ${appTheme.warningColor} font-bold`}>WARNING: This user has 'admin' role. Deleting an admin is typically not allowed directly. Backend may prevent this.</p>
                            )}
                        </>
                    )}
                    {modalAction.type === 'toggleRole' && (
                        <>
                            <p className={`${appTheme.cardText}`}>You are about to change the role of <strong className={`${appTheme.primary.replace('bg-', 'text-')}`}>{modalAction.user.firstName} {modalAction.user.lastName}</strong> from <span className="font-semibold">{modalAction.user.role}</span> to <span className="font-semibold">{modalAction.newRole}</span>.</p>
                            <p className={`mt-2 text-sm ${appTheme.warningColor}`}>Proceed with caution as this affects user permissions.</p>
                            {/* Message for Admin promoting to Admin */}
                            {modalAction.newRole === 'admin' && currentUser.role === 'admin' && ( 
                                <p className={`mt-2 text-sm ${appTheme.infoColor} font-bold`}>
                                    Note: To ensure only one primary admin, your current admin role might be demoted to a regular user upon this promotion.
                                </p>
                            )}
                            {/* Message for Co-admin attempting to promote to Admin (should be disabled but as fallback) */}
                            {modalAction.newRole === 'admin' && currentUser.role === 'co-admin' && ( 
                                <p className={`mt-2 text-sm ${appTheme.errorColor} font-bold`}>
                                    ERROR: As a Co-administrator, you are not authorized to promote users to 'admin' role.
                                </p>
                            )}
                            {/* Message for Co-admin attempting to demote Admin (should be disabled but as fallback) */}
                            {modalAction.user.role === 'admin' && modalAction.newRole !== 'admin' && currentUser.role === 'co-admin' && (
                                <p className={`mt-2 text-sm ${appTheme.errorColor} font-bold`}>
                                    ERROR: As a Co-administrator, you are not authorized to demote 'admin' role users.
                                </p>
                            )}
                        </>
                    )}
                    {modalAction.type === 'togglePremium' && (
                        <>
                            <p className={`${appTheme.cardText}`}>You are about to {modalAction.newPremiumStatus ? 'grant' : 'revoke'} premium access for <strong className={`${appTheme.primary.replace('bg-', 'text-')}`}>{modalAction.user.firstName} {modalAction.user.lastName}</strong>.</p>
                            <p className={`mt-2 text-sm ${appTheme.infoColor}`}>This will update their premium status immediately.</p>
                        </>
                    )}
                </ConfirmationModal>
            )}
        </div>
    );
};

export default AdminUsersPage;