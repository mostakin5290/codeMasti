import React, { useEffect } from 'react'; // <-- Import useEffect
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminRoute = () => {

    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
    useEffect(() => {
        // This useEffect runs after render. If a user is not authorized,
        // and not currently loading, and is authenticated, show a toast.
        // The condition logic here needs the same fix as the main if statement.
        if (!loading && isAuthenticated && !['admin', 'co-admin'].includes(user?.role)) {
            toast.error("Access Forbidden: Admin privileges required.", { toastId: 'admin-auth-error' });
        }
    }, [loading, isAuthenticated, user]);


    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!['admin', 'co-admin'].includes(user?.role)) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;