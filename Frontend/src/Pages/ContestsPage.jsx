import React, { useState, useEffect } from 'react'; // Added useEffect for potential animations
import { Link, useLocation } from 'react-router-dom'; // Added useLocation for page title
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ContestOverview from '../components/Contest/ContestOverview';
import { useTheme } from '../context/ThemeContext';
import { FaTrophy,FaPlay,FaEye, FaGamepad, FaMicrophoneAlt, FaBars, FaTimes, FaFire } from 'react-icons/fa'; // Added FaBars, FaTimes, FaFire for consistency

// Default theme (unchanged - ensure consistency if context is not fully loaded)
const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white',
    accent: 'bg-indigo-600',
    accentHover: 'bg-indigo-700',
    secondaryAccent: 'bg-blue-600',
    secondaryAccentHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white',
    buttonPrimary: 'bg-indigo-600',
    buttonPrimaryHover: 'bg-indigo-700',
    buttonSecondary: 'bg-blue-600',
    buttonSecondaryHover: 'bg-blue-700',
    highlight: 'text-indigo-400',
    highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-cyan-400',
    iconBg: 'bg-indigo-600/10',
    gradientFrom: 'from-slate-900',
    gradientTo: 'to-slate-800',
    successColor: 'text-emerald-500',
    warningColor: 'text-amber-500',
    errorColor: 'text-red-500',
    infoColor: 'text-sky-500',
};

const ContestsPage = () => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...(appThemeFromContext) };
    const location = useLocation(); // To dynamically set the page title

    const [activeSection, setActiveSection] = useState('contests'); // 'contests', 'game', 'interview'
    const [sidebarOpen, setSidebarOpen] = useState(false); // State for mobile sidebar

    // This function will generate the main background gradient
    const getMainBackgroundGradient = () => `bg-gradient-to-br ${appTheme.gradientFrom} ${appTheme.gradientTo}`;
    // This function will generate the primary gradient for active elements
    const getPrimaryGradient = () => `bg-gradient-to-r ${appTheme.buttonPrimary.replace('bg-', 'from-')} ${appTheme.buttonSecondary.replace('bg-', 'to-')}`;

    // Dynamic link classes for sidebar navigation
    const getLinkClasses = (section) =>
        `flex items-center w-full px-5 py-3 rounded-lg text-lg font-medium transition-all duration-300 ease-in-out group relative overflow-hidden`;

    const getNavLinkActiveClasses = (section) =>
        `${getPrimaryGradient()} ${appTheme.buttonText} shadow-lg scale-[1.02]`;

    const getNavLinkInactiveClasses = (section) =>
        `${appTheme.cardText} hover:${appTheme.cardBg.replace('bg-', 'bg-')}/70 hover:scale-[1.01]`;

    // Function to get the current page title based on activeSection
    const getPageTitle = () => {
        switch (activeSection) {
            case 'contests':
                return "Competitive Contests";
            case 'game':
                return "Battle/Game Arena";
            case 'interview':
                return "Interview Preparation";
            default:
                return "Contests & Challenges";
        }
    };

    // Function to get the current page icon
    const getPageIcon = () => {
        const iconClass = "mr-3 text-2xl";
        switch (activeSection) {
            case 'contests':
                return <FaTrophy className={`${iconClass} ${appTheme.highlight}`} />;
            case 'game':
                return <FaGamepad className={`${iconClass} ${appTheme.highlightSecondary}`} />;
            case 'interview':
                return <FaMicrophoneAlt className={`${iconClass} ${appTheme.highlightTertiary}`} />;
            default:
                return <FaFire className={`${iconClass} ${appTheme.highlight}`} />; // Default icon
        }
    };


    // Sidebar navigation items
    const navItems = [
        { id: 'contests', icon: FaTrophy, label: "Contests", color: `${appTheme.highlightTertiary.replace('text-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')}` },
        { id: 'game', icon: FaGamepad, label: "Battle/Game", color: `${appTheme.highlightTertiary.replace('text-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')}` },
        { id: 'interview', icon: FaMicrophoneAlt, label: "Interview", color: `${appTheme.highlightTertiary.replace('text-', 'from-')} ${appTheme.highlight.replace('text-', 'to-')}` },
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
                        className={`absolute w-2 h-2 ${appTheme.text.replace('text-', 'bg-')} rounded-full opacity-10 animate-float-and-rotate`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className='mb-20 relative z-10'> {/* Increased z-index to ensure header is on top */}
                <Header />
            </div>

            {/* Mobile sidebar toggle (themed) */}
            <button
                className={`lg:hidden fixed top-24 left-4 z-50 p-3 ${getPrimaryGradient()} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${appTheme.buttonText}`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 py-8 gap-8 relative z-9">
                {/* Sidebar (themed) */}
                <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-80 flex-shrink-0 transition-transform duration-300 ease-in-out lg:block`}>
                    <div className={`p-8 ${appTheme.cardBg}/10 backdrop-blur-2xl rounded-2xl border ${appTheme.border}/20 h-full sticky top-24 shadow-2xl`}>
                        {/* Sidebar header with gradient (themed) */}
                        <div className="relative mb-8">
                            <div className={`absolute inset-0 ${getPrimaryGradient()} rounded-xl blur opacity-20`}></div>
                            <div className={`relative ${getPrimaryGradient().replace('bg-gradient-to-r', 'bg-gradient-to-r from-')}/20 ${appTheme.highlight.replace('text-', 'to-')}/20 p-4 rounded-xl border ${appTheme.border}/10`}>
                                <h2 className={`text-2xl font-bold ${appTheme.text} flex items-center`}>
                                    <span className={`mr-3 text-3xl ${appTheme.highlight}`}>✨</span> {/* Changed icon for a different feel */}
                                    Challenges
                                </h2>
                                <p className={`${appTheme.cardText} text-sm mt-1`}>Explore coding disciplines</p>
                            </div>
                        </div>

                        <nav className="space-y-3">
                            {navItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                                        className={`${getLinkClasses(item.id)} ${activeSection === item.id ? getNavLinkActiveClasses(item.id) : getNavLinkInactiveClasses(item.id)}`}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        {/* Dynamic background for hover/active state */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg`}>
                                        </div>
                                        <Icon className={`mr-4 text-lg z-10 relative group-hover:animate-bounce ${activeSection === item.id ? appTheme.buttonText : item.color.includes('from-blue') ? appTheme.highlightSecondary : item.color.includes('from-green') ? appTheme.highlightTertiary : item.color.includes('from-purple') ? appTheme.highlight : appTheme.text}`} />
                                        <span className="font-medium z-10 relative">{item.label}</span>
                                        <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className={`w-2 h-2 ${appTheme.text.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Overlay for mobile (themed) */}
                {sidebarOpen && (
                    <div
                        className={`lg:hidden fixed inset-0 ${appTheme.background}/50 backdrop-blur-sm z-30`}
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content (themed) */}
                <main className="flex-1 lg:ml-0">
                    {/* Page header with enhanced styling (themed) */}
                    <div className="mb-8">
                        <div className={`${appTheme.cardBg}/10 backdrop-blur-2xl p-6 rounded-2xl border ${appTheme.border}/20 shadow-2xl`}>
                            <div className="flex items-center">
                                <div className={`p-3 rounded-xl mr-4 shadow-lg ${getPrimaryGradient()} text-white`}> {/* Changed icon background for consistency */}
                                    {getPageIcon()}
                                </div>
                                <div>
                                    <h1 className={`text-4xl font-bold bg-gradient-to-r ${appTheme.text.replace('text-', 'from-')} ${appTheme.cardText.replace('text-', 'to-')} bg-clip-text `}> 
                                        {getPageTitle()}
                                    </h1>
                                    <p className={`${appTheme.cardText} mt-1`}>Explore different coding challenges</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content area (themed) */}
                    <div className={`${appTheme.cardBg}/10 backdrop-blur-2xl p-8 rounded-2xl border ${appTheme.border}/20 min-h-[75vh] shadow-2xl relative overflow-hidden`}>
                        {/* Content background pattern (themed) */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, ${appTheme.text.replace('text-', '#') /* Ensure hex color */ } 1px, transparent 0)`,
                                backgroundSize: '20px 20px'
                            }}></div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            {activeSection === 'contests' && <ContestOverview />}
                            {activeSection === 'game' && (
                                <div className={`p-10 rounded-2xl ${appTheme.cardBg} border ${appTheme.border}/30 shadow-xl text-center ${appTheme.text} animate-in fade-in-0 slide-in-from-bottom-4 duration-500`}>
                                    <FaGamepad className={`mx-auto text-6xl mb-6 ${appTheme.highlightSecondary}`} />
                                    <h2 className="text-4xl font-bold mb-4">Battle/Game Section</h2>
                                    <p className="text-lg mb-6 max-w-2xl mx-auto">This section is currently under active development. Get ready to challenge your coding skills in exciting battles and interactive games!</p>
                                    <Link to="/game" className={`inline-flex items-center gap-2 ${appTheme.buttonPrimary} hover:${appTheme.buttonPrimaryHover} ${appTheme.buttonText} px-8 py-3 rounded-lg mt-6 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300`}>
                                        <FaPlay /> Explore Game Arena
                                    </Link>
                                </div>
                            )}
                            {activeSection === 'interview' && (
                                <div className={`p-10 rounded-2xl ${appTheme.cardBg} border ${appTheme.border}/30 shadow-xl text-center ${appTheme.text} animate-in fade-in-0 slide-in-from-bottom-4 duration-500`}>
                                    <FaMicrophoneAlt className={`mx-auto text-6xl mb-6 ${appTheme.highlightTertiary}`} />
                                    <h2 className="text-4xl font-bold mb-4">Interview Preparation</h2>
                                    <p className="text-lg mb-6 max-w-2xl mx-auto">Elevate your technical interview skills with a comprehensive collection of curated problems, essential concepts, and mock interview tools designed for success.</p>
                                    <Link to="/interview-prep" className={`inline-flex items-center gap-2 ${appTheme.buttonPrimary} hover:${appTheme.buttonPrimaryHover} ${appTheme.buttonText} px-8 py-3 rounded-lg mt-6 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300`}>
                                        <FaEye /> Start Interview Prep
                                    </Link>
                                </div>
                            )}
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

export default ContestsPage;