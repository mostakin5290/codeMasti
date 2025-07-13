import React, { useEffect } from 'react'; // <-- Import useEffect
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../components/common/LoadingSpinner';

const AdminRoute = () => {

    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
    useEffect(() => {
        if (!loading && isAuthenticated && user?.role !== 'admin') {
            toast.error("Access Forbidden: Admin privileges required.", { toastId: 'admin-auth-error' });
        }
    }, [loading, isAuthenticated, user]);


    if (loading) {
        return <Loading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;