import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, checkAuth } from '../../features/auth/authSlice';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme hook
import { FiCode } from 'react-icons/fi'; // Import FiCode icon for logo
import { FaCrown, FaUserShield, FaUserCog, FaUserAlt } from 'react-icons/fa'; // Import FaCrown, and new Fa icons for roles
import { FaRankingStar } from 'react-icons/fa6';
// Default theme to prevent errors if theme context fails or is incomplete
const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    // NEW: Solid button colors for default fallback
    buttonPrimary: 'bg-blue-600',
    buttonPrimaryHover: 'bg-blue-700',
    // For notification dot and specific icon colors
    successColor: 'text-emerald-500',
    errorColor: 'text-red-500',
};

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Get theme from context, merge with default to ensure all properties exist
    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };

    // Helper for primary gradient (still used for logo icon box)
    const getPrimaryGradientClasses = () => `bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')}`;

    // Check auth status on component mount
    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    // Handle scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate('/');
            closeAllMenus();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (!isMobileMenuOpen) setIsProfileMenuOpen(false);
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    const closeAllMenus = () => {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
    };

    // Header background is solid and responsive to scroll
    const headerBackground = scrolled
        ? `${theme.background} shadow-2xl border-b ${theme.border}`
        : `${theme.background} border-b ${theme.border}`;

    // Enhanced navigation link styles (now solid background for active/hover)
    const navLinkBase = "relative px-5 py-2.5 text-sm font-semibold transition-all duration-300 group overflow-hidden rounded-xl";
    // Inactive link hover: background will be a lighter shade of the main background
    const navLinkInactive = `${theme.cardText} hover:${theme.text} hover:${theme.background.replace('bg-', 'bg-')}/50`;
    // Active state uses primary color as solid background
    const navLinkActive = `${theme.buttonText} ${theme.primary} shadow-lg`;

    const getNavLinkClass = ({ isActive }) =>
        `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`;

    // Mobile navigation with enhanced styling (solid colors)
    const mobileNavLinkBase = "block px-6 py-4 text-base font-medium transition-all duration-300 rounded-xl mx-2 my-1";
    const getMobileNavLinkClass = ({ isActive }) =>
        `${mobileNavLinkBase} ${isActive ? `${theme.text} ${theme.primary} border ${theme.primary.replace('bg-', 'border-')}/50` : `${theme.cardText} hover:${theme.text} hover:${theme.cardBg}/60`}`;

    // Premium user menu styles (solid colors)
    const userMenuItem = `block px-4 py-3 text-sm transition-all duration-300 hover:${theme.cardBg}/50 rounded-lg mx-2 my-1`;

    return (
        <>
            <header className={`fixed w-full top-0 z-50 ${headerBackground} transition-all duration-700 ease-out`}>
                {/* Subtle top accent line - now solid border */}
                <div className={`absolute top-0 left-0 right-0 h-px border-t ${theme.border}`}></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo and Desktop Navigation */}
                        <div className="flex items-center space-x-12">
                            <Link
                                to="/home"
                                className="flex items-center group"
                                onClick={closeAllMenus}
                            >
                                <div className="flex items-center space-x-3">

                                    <h1 className={`text-3xl font-bold ${theme.text}`}>
                                        Code<span className={`${theme.highlight}`}>Masti</span>
                                    </h1>
                                </div>
                            </Link>

                            {/* Enhanced Desktop Navigation */}
                            <nav className="hidden lg:flex items-center space-x-2">
                                <NavLink to="/home" className={getNavLinkClass} onClick={closeAllMenus}>
                                    <span className="relative z-10 flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                        </svg>
                                        <span>Home</span>
                                    </span>
                                </NavLink>
                                <NavLink to="/problems" className={getNavLinkClass} onClick={closeAllMenus}>
                                    <span className="relative z-10 flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span>Problems</span>
                                    </span>
                                </NavLink>
                                <NavLink to="/contests" className={getNavLinkClass} onClick={closeAllMenus}>
                                    <span className="relative z-10 flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Contests</span>
                                    </span>
                                </NavLink>
                                <NavLink to="/discuss" className={getNavLinkClass} onClick={closeAllMenus}>
                                    <span className="relative z-10 flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                        </svg>
                                        <span>Discuss</span>
                                    </span>
                                </NavLink>
                                {/* NEW: Rank Link */}
                                <NavLink to="/world-rank" className={getNavLinkClass} onClick={closeAllMenus}>
                                    <span className="relative z-10 flex items-center space-x-2">
                                        <FaRankingStar className="w-4 h-4" /> {/* FaRankingStar imported from 'fa' or 'fa6' */}
                                        <span>Ranks</span>
                                    </span>
                                </NavLink>
                            </nav>
                        </div>

                        {/* Premium User Actions */}
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="relative">
                                        <button
                                            onClick={toggleProfileMenu}
                                            className={`flex items-center space-x-3 p-2 rounded-2xl ${theme.cardBg} border ${theme.border} hover:${theme.primary.replace('bg-', 'border-')}/50 transition-all duration-300 group shadow-lg hover:shadow-${theme.primary.split('-')[1]}-500/10`}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={user?.avatar || '/default-avatar.png'}
                                                    alt="User avatar"
                                                    className={`h-10 w-10 rounded-xl object-cover border-2 border-transparent group-hover:${theme.primary.replace('bg-', 'border-')}/50 transition-all duration-300`}
                                                />
                                            </div>
                                            <div className="hidden lg:flex flex-col items-start">
                                                <span className={`text-sm font-semibold ${theme.text} group-hover:${theme.highlight} transition-colors duration-300`}>
                                                    {user?.firstName || 'User'}
                                                </span>
                                                {user?.isPremium ? (
                                                    <span className={`text-xs font-bold text-yellow-500 group-hover:${theme.cardText} transition-colors duration-300`}>Premium</span>
                                                ) : (
                                                    <span className={`text-xs ${theme.cardText} group-hover:${theme.cardText} transition-colors duration-300`}>online</span>
                                                )}
                                            </div>
                                            <svg className={`hidden lg:block h-4 w-4 ${theme.cardText} group-hover:${theme.highlight} transition-colors duration-300`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {/* Ultra-modern Dropdown Menu (solid colors) */}
                                        {isProfileMenuOpen && (
                                            <div className={`origin-top-right absolute right-0 mt-3 w-72 rounded-3xl shadow-2xl ${theme.cardBg} border ${theme.border}/50 py-3 z-50 animate-in slide-in-from-top-2 duration-300`}>
                                                {/* User Info Header */}
                                                <div className={`px-6 py-4 border-b ${theme.border}/50`}>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="relative">
                                                            <img
                                                                src={user?.avatar || '/default-avatar.png'}
                                                                alt="User avatar"
                                                                className={`h-12 w-12 rounded-xl object-cover border-2 ${theme.primary.replace('bg-', 'border-')}/30`}
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className={`text-base font-semibold ${theme.text}`}>{user?.firstName} {user?.lastName}</p>
                                                            {user.role === 'admin' && (
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${theme.primary.replace('bg-', 'bg-')}/10 ${theme.primary} border ${theme.primary.replace('bg-', 'border-')} mt-1`}>
                                                                    <FaUserShield className="mr-1" /> Admin
                                                                </span>
                                                            )}
                                                            {user.role === 'co-admin' && (
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${theme.secondary.replace('bg-', 'bg-')}/10 ${theme.secondary} border ${theme.secondary.replace('bg-', 'border-')}/30 mt-1`}>
                                                                    <FaUserCog className="mr-1" /> Co-Admin
                                                                </span>
                                                            )}
                                                            {user.role === 'user' && (
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${theme.cardBg}/50 ${theme.cardText} border ${theme.border}/50 mt-1`}>
                                                                    <FaUserAlt className="mr-1" /> User
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="py-2">
                                                    <NavLink
                                                        to="/profile"
                                                        className={`${userMenuItem} ${theme.cardText} hover:${theme.text}`}
                                                        onClick={closeAllMenus}
                                                    >
                                                        <div className="flex items-center">
                                                            <svg className={`mr-3 h-5 w-5 ${theme.highlightSecondary}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>Your Profile</span>
                                                        </div >
                                                    </NavLink>
                                                    {(user.role === 'admin'||user.role === 'co-admin') && (
                                                        <NavLink to="/admin" className={`${userMenuItem} ${theme.cardText} hover:${theme.text}`} onClick={closeAllMenus}>
                                                            <div className="flex items-center">
                                                                <svg className={`mr-3 h-5 w-5 ${theme.highlightTertiary}`} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 2a1 1 0 00-.555.168l-6 4A1 1 0 003 7v4c0 3.418 2.95 6.582 6.445 7.852a1 1 0 00.71 0C14.05 17.582 17 14.418 17 11V7a1 1 0 00-.445-.832l-6-4A1 1 0 0010 2zm3.707 6.293a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414L9 12.999l4.707-4.706z" clipRule="evenodd" />
                                                                </svg>
                                                                <span>Admin Panel</span>
                                                            </div>
                                                        </NavLink>
                                                    )}
                                                    
                                                    <NavLink
                                                        to="/settings"
                                                        className={`${userMenuItem} ${theme.cardText} hover:${theme.text}`}
                                                        onClick={closeAllMenus}
                                                    >
                                                        <div className="flex items-center">
                                                            <svg className={`mr-3 h-5 w-5 ${theme.highlight}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>Settings</span>
                                                        </div>
                                                    </NavLink>

                                                    <div className={`border-t ${theme.border}/50 mt-2 pt-2`}>
                                                        <button
                                                            onClick={handleLogout}
                                                            className={`${userMenuItem} w-full text-left text-red-300 hover:text-red-200 hover:bg-red-500/10`}
                                                        >
                                                            <div className="flex items-center">
                                                                <svg className="mr-3 h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                                                </svg>
                                                                <span>Sign out</span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="hidden md:flex items-center space-x-4">
                                    <NavLink
                                        to="/login"
                                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold ${theme.cardText} hover:${theme.text} ${theme.cardBg}/50 transition-all duration-300 border ${theme.border}/50 hover:${theme.border}`}
                                        onClick={closeAllMenus}
                                    >
                                        Log in
                                    </NavLink>
                                    <NavLink
                                        to="/signup"
                                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-center ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} transition-all duration-300 shadow-lg hover:shadow-${theme.primary.split('-')[1]}-500/25 border ${theme.primary.replace('bg-', 'border-')}/30 hover:${theme.primary.replace('bg-', 'border-')}/50`}
                                        onClick={closeAllMenus}
                                    >
                                        Sign up
                                    </NavLink>
                                </div>
                            )}

                            {/* Ultra-modern Mobile Menu Button */}
                            <button
                                onClick={toggleMobileMenu}
                                className={`lg:hidden p-3 rounded-2xl ${theme.cardBg} ${theme.text} hover:${theme.highlight} hover:${theme.cardBg}/80 transition-all duration-300 border ${theme.border} hover:${theme.primary.replace('bg-', 'border-')}/50`}
                            >
                                <span className="sr-only">Open menu</span>
                                <div className="relative w-6 h-6">
                                    <span className={`absolute left-0 top-1 w-6 h-0.5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                    <span className={`absolute left-0 top-3 w-6 h-0.5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                                    <span className={`absolute left-0 top-5 w-6 h-0.5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Premium Mobile Menu */}
                <div className={`lg:hidden ${theme.background} shadow-2xl transition-all duration-500 overflow-hidden border-t ${theme.border} ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        <NavLink
                            to="/home"
                            className={getMobileNavLinkClass}
                            onClick={closeAllMenus}
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                                <span>Home</span>
                            </div>
                        </NavLink>
                        <NavLink
                            to="/problems"
                            className={getMobileNavLinkClass}
                            onClick={closeAllMenus}
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>Problems</span>
                            </div>
                        </NavLink>
                        <NavLink
                            to="/contests"
                            className={getMobileNavLinkClass}
                            onClick={closeAllMenus}
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Contests</span>
                            </div>
                        </NavLink>
                        <NavLink
                            to="/discuss"
                            className={getMobileNavLinkClass}
                            onClick={closeAllMenus}
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                                <span>Discuss</span>
                            </div>
                        </NavLink>
                        {/* NEW: Rank Link in Mobile dropdown */}
                        <NavLink to="/world-rank" className={getMobileNavLinkClass} onClick={closeAllMenus}>
                            <div className="flex items-center space-x-3">
                                <FaRankingStar className="w-5 h-5" />
                                <span>Ranks</span>
                            </div>
                        </NavLink>
                    </div>

                    {isAuthenticated ? (
                        <div className={`pt-6 pb-6 border-t ${theme.border} ${theme.background} px-4 space-y-3`}>
                            <NavLink
                                to="/profile"
                                className={getMobileNavLinkClass}
                                onClick={closeAllMenus}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <span>Your Profile</span>
                                </div>
                            </NavLink>
                            {(user.role === 'admin'||user.role === 'co-admin') && (
                                <NavLink
                                    to="/admin"
                                    className={getMobileNavLinkClass}
                                    onClick={closeAllMenus}
                                >
                                    <div className="flex items-center">
                                        <svg className={`mr-3 h-5 w-5 ${theme.highlightTertiary}`} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 2a1 1 0 00-.555.168l-6 4A1 1 0 003 7v4c0 3.418 2.95 6.582 6.445 7.852a1 1 0 00.71 0C14.05 17.582 17 14.418 17 11V7a1 1 0 00-.445-.832l-6-4A1 1 0 0010 2zm3.707 6.293a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414L9 12.999l4.707-4.706z" clipRule="evenodd" />
                                        </svg>
                                        <span>Admin Panel</span>
                                    </div>
                                </NavLink>
                            )}
                            <NavLink
                                to="/settings"
                                className={getMobileNavLinkClass}
                                onClick={closeAllMenus}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className={`w-5 h-5 ${theme.highlight}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                    <span>Settings</span>
                                </div>
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className={`${getMobileNavLinkClass({ isActive: false })} w-full text-left text-red-300 hover:text-red-200 hover:bg-red-500/10`}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>Sign out</span>
                                </div>
                            </button>
                        </div>

                    ) : (
                        <div className={`pt-6 pb-6 border-t ${theme.border} ${theme.background} px-4 space-y-3`}>
                            <NavLink
                                to="/login"
                                className={`block w-full px-6 py-4 text-base font-semibold text-center ${theme.cardText} hover:${theme.text} ${theme.cardBg}/50 hover:${theme.cardBg}/60 rounded-xl transition-all duration-300 border ${theme.border}/50 hover:${theme.border}/70`}
                                onClick={closeAllMenus}
                            >
                                Log in
                            </NavLink>
                            <NavLink
                                to="/signup"
                                className={`block w-full px-6 py-4 text-base font-semibold text-center ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} transition-all duration-300 shadow-lg hover:shadow-${theme.primary.split('-')[1]}-500/25 border ${theme.primary.replace('bg-', 'border-')}/30 hover:${theme.primary.replace('bg-', 'border-')}/50`}
                                onClick={closeAllMenus}
                            >
                                Sign up
                            </NavLink>
                        </div>
                    )}
                </div>
            </header>
            <div className={`pb-20 ${theme.background}`}></div>
        </>
    );
};

export default Header;