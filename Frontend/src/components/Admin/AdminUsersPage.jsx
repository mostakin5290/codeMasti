import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import { FaTrash, FaCheckCircle, FaUserShield } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal'; // Reusing the modal
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

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Get theme from context
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    const fetchUsers = async () => {
        try {
            const { data } = await axiosClient.get('/admin/users');
            setUsers(data);
        } catch (error) {
            toast.error("Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await axiosClient.delete(`/admin/users/${userToDelete._id}`);
            toast.success('User deleted successfully!');
            fetchUsers(); // Refresh the list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user.');
        } finally {
            setShowConfirmModal(false);
            setUserToDelete(null);
        }
    };

    if (loading) {
        // Pass appTheme to LoadingSpinner
        return <LoadingSpinner message="Loading users..." appTheme={appTheme} />;
    }

    return (
        <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${appTheme.border}`}>
                <thead className={`${appTheme.cardBg}`}>
                    <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>User</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Role</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Problems Solved</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Joined</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${appTheme.cardText} uppercase tracking-wider`}>Actions</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${appTheme.border}`}>
                    {users.map(user => (
                        <tr key={user._id} className={`hover:${appTheme.cardBg}/50 transition-all duration-200`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 h-12 w-12">
                                        <img className={`h-12 w-12 rounded-full object-cover border-2 ${appTheme.primary.replace('bg-', 'border-')}/30`} src={user.avatar || '/default-avatar.png'} alt="User Avatar" />
                                    </div>
                                    <div>
                                        <div className={`font-bold ${appTheme.text}`}>{user.firstName} {user.lastName}</div>
                                        <div className={`text-sm ${appTheme.cardText} opacity-70`}>{user.emailId}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {user.role === 'admin' ? (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${appTheme.primary.replace('bg-', 'bg-')}/10 ${appTheme.primary} border ${appTheme.primary.replace('bg-', 'border-')}/30`}>
                                        <FaUserShield className="mr-1" /> Admin
                                    </span>
                                ) : (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${appTheme.cardBg}/50 ${appTheme.cardText} border ${appTheme.border}/50`}>User</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center font-semibold">
                                <FaCheckCircle className={`${appTheme.successColor} inline mr-2`} />
                                <span className={`${appTheme.text}`}>{user.problemsSolved}</span>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${appTheme.cardText}`}>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => handleDeleteClick(user)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border ${appTheme.errorColor.replace('text-', 'border-')}/50 ${appTheme.errorColor} hover:${appTheme.errorColor.replace('text-', 'bg-')}/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                                    disabled={user.role === 'admin'}
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmDelete}
                title="Delete User"
                appTheme={appTheme} // Pass appTheme to the modal
            >
                <p className={`${appTheme.cardText}`}>Are you sure you want to delete this user: <br /> <strong className={`${appTheme.primary.replace('bg-', 'text-')}`}>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?</p>
                <p className={`mt-2 text-sm ${appTheme.errorColor}`}>This action cannot be undone.</p>
            </ConfirmationModal>
        </div>
    );
};

export default AdminUsersPage;