import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaList, FaPlus, FaUsers, FaCog, FaBars, FaTimes } from 'react-icons/fa';
import {FireOutlined} from '@ant-design/icons'
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext'; // Import useTheme

// Default theme for fallback
const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    // New button primary default colors
    buttonPrimary: 'bg-indigo-600', // Default solid primary button color
    buttonPrimaryHover: 'bg-indigo-700', // Default solid primary button hover color
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    // Add status colors to default theme for consistency, though not directly used here
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0); // Kept, though not actively used in dynamic blur anymore
    const location = useLocation();

    // Get theme from context
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...appThemeFromContext };

    const getPrimaryGradient = () => `bg-gradient-to-r ${appTheme.buttonPrimary}`;

    const getMainBackgroundGradient = () => `bg-gradient-to-br ${appTheme.gradientFrom} ${appTheme.gradientTo}`;

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Dynamic link classes
    const linkClasses = `group flex items-center px-4 py-3 ${appTheme.cardText} rounded-xl hover:${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')}/20 hover:${appTheme.highlight.replace('text-', 'to-')}/20 transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden`;
    const activeLinkClasses = `${getPrimaryGradient()} ${appTheme.buttonText} shadow-xl transform scale-105`; // Direct application of primary gradient


    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/admin/users')) return "User Management";
        if (path.includes('/admin/problems/create')) return "Create New Problem";
        if (path.includes('/admin/problems/edit')) return "Edit Problem";
        if (path.includes('/admin/problems')) return "Problems Dashboard";
        if (path.includes('/admin/contests')) return "Contest Management";
        if (path.includes('/admin/settings')) return "Premium Plan";
        if (path.includes('admin/daily-challenges')) return "Daily Challenges";

        return "Admin Dashboard";
    };

    const getPageIcon = () => {
        const path = location.pathname;
        const iconClass = "mr-3 text-2xl"; // Common icon class
        if (path.includes('/admin/users')) return <FaUsers className={`${iconClass} ${appTheme.highlightSecondary}`} />;
        if (path.includes('/admin/problems')) return <FaList className={`${iconClass} ${appTheme.highlightTertiary}`} />;
        if (path.includes('/admin/contests')) return <FaPlus className={`${iconClass} ${appTheme.highlight}`} />;
        if (path.includes('/admin/settings')) return <FaCog className={`${iconClass} ${appTheme.highlightSecondary}`} />;
        if (path.includes('admin/daily-challenges')) return <FireOutlined className={`${iconClass} ${appTheme.highlightTertiary}`} />;
        return <FaTachometerAlt className={`${iconClass} ${appTheme.highlight}`} />;
    };

    // Nav items with theme-derived colors for background hover gradients
    const navItems = [
        { to: "/admin", end: true, icon: FaTachometerAlt, label: "Dashboard", color: `${appTheme.highlightTertiary.replace('text-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')}` },
        { to: "/admin/users", icon: FaUsers, label: "Users", color: `${appTheme.highlightTertiary.replace('text-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')}` },
        { to: "/admin/problems", icon: FaList, label: "Problems List", color: `${appTheme.highlightTertiary.replace('text-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')}` },
        { to: "/admin/contests", icon: FaPlus, label: "Contest Management", color: `${appTheme.highlightTertiary.replace('text-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')}` },
        { to: "/admin/settings", icon: FaCog, label: "Premium Plan", color: `${appTheme.highlightTertiary.replace('text-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')}` },
        { to: "/admin/daily-challenges", icon: FireOutlined, label: "Daily Challenges",color: `${appTheme.highlightTertiary.replace('text-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')}` }
    ];

    return (
        <div className={`min-h-screen ${getMainBackgroundGradient()} ${appTheme.text} relative overflow-hidden`}>
            {/* Animated background elements (themed) */}
            <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute -top-40 -right-40 w-80 h-80 ${appTheme.primary.replace('bg-', 'bg-')} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow`}></div>
                <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${appTheme.highlightSecondary.replace('text-', 'bg-')} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-2000`}></div>
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${appTheme.highlightTertiary.replace('text-', 'bg-')} rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow animation-delay-4000`}></div>
            </div>

            {/* Floating particles (themed) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-2 h-2 ${appTheme.text.replace('text-', 'bg-')} rounded-full opacity-10 animate-float-and-rotate`} // Renamed animation class
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className='mb-20 relative z-100'>
                <Header />
            </div>

            {/* Mobile sidebar toggle (themed) */}
            <button
                className={`lg:hidden fixed top-24 left-4 z-50 p-3 ${getPrimaryGradient()} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${appTheme.buttonText}`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            <div className=" mx-auto px-4 py-8 gap-8 flex relative z-10">
                {/* Sidebar (themed) */}
                <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-80 flex-shrink-0 transition-transform duration-300 ease-in-out lg:block`}>
                    <div className={`p-8 ${appTheme.cardBg}/10 backdrop-blur-2xl rounded-2xl border ${appTheme.border}/20 h-full sticky top-24 shadow-2xl`}>
                        {/* Sidebar header with gradient (themed) */}
                        <div className="relative mb-8">
                            <div className={`absolute inset-0 ${getPrimaryGradient()} rounded-xl blur opacity-20`}></div>
                            <div className={`relative ${getPrimaryGradient().replace('bg-gradient-to-r', 'bg-gradient-to-r from-')}/20 ${appTheme.highlight.replace('text-', 'to-')}/20 p-4 rounded-xl border ${appTheme.border}/10`}>
                                <h2 className={`text-2xl font-bold ${appTheme.text} flex items-center`}>
                                    <span className={`mr-3 text-3xl ${appTheme.highlight}`}>⚡</span>
                                    Admin Panel
                                </h2>
                                <p className={`${appTheme.cardText} text-sm mt-1`}>Manage your platform</p>
                            </div>
                        </div>

                        <nav className="space-y-3">
                            {navItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        {/* Dynamic background for hover/active state */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}>
                                        </div>
                                        <Icon className={`mr-4 text-lg z-10 relative group-hover:animate-bounce ${item.color.includes('from-blue') ? appTheme.highlightSecondary : item.color.includes('from-green') ? appTheme.highlightTertiary : item.color.includes('from-purple') ? appTheme.highlight : appTheme.text}`} />
                                        <span className="font-medium z-10 relative">{item.label}</span>
                                        <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className={`w-2 h-2 ${appTheme.text.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
                                        </div>
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Overlay for mobile (themed) */}
                {sidebarOpen && (
                    <div
                        className={`lg:hidden  fixed inset-0 ${appTheme.background}/50 backdrop-blur-sm z-30`}
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content (themed) */}
                <main className="flex-1 lg:ml-0">
                    {/* Page header with enhanced styling (themed) */}
                    <div className="mb-8">
                        <div className={`${appTheme.cardBg}/10 backdrop-blur-2xl p-6 rounded-2xl border ${appTheme.border}/20 shadow-2xl`}>
                            <div className="flex items-center">
                                <div className={`p-3  rounded-xl mr-4 shadow-lg`}>
                                    {getPageIcon()}
                                </div>
                                <div>
                                    <h1 className={`text-4xl font-bold bg-gradient-to-r ${appTheme.text.replace('text-', 'from-')} ${appTheme.cardText.replace('text-', 'to-')} bg-clip-text`}>
                                        {getPageTitle()}
                                    </h1>
                                    <p className={`${appTheme.cardText} mt-1`}>Welcome back, Administrator</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content area (themed) */}
                    <div className={`${appTheme.cardBg}/10 backdrop-blur-2xl p-8 rounded-2xl border ${appTheme.border}/20 min-h-[75vh] shadow-2xl relative overflow-hidden`}>
                        {/* Content background pattern (themed) */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, ${appTheme.text.replace('text-', '')} 1px, transparent 0)`, // Use theme text color for pattern
                                backgroundSize: '20px 20px'
                            }}></div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            <Outlet />
                        </div>

                        {/* Decorative elements (themed) */}
                        <div className={`absolute top-4 right-4 w-20 h-20 ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')}/20 ${appTheme.highlight.replace('text-', 'to-')}/20 rounded-full blur-xl`}></div>
                        <div className={`absolute bottom-4 left-4 w-16 h-16 ${appTheme.highlightSecondary.replace('text-', 'bg-gradient-to-r from-')}/20 ${appTheme.highlightTertiary.replace('text-', 'to-')}/20 rounded-full blur-xl`}></div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default AdminLayout;