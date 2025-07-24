import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // useLocation to check query params
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { FiCheckCircle, FiStar, FiZap, FiAward, FiBookOpen, FiClock, FiUsers, FiCode, FiMessageSquare } from 'react-icons/fi';
import { FaCrown,FaCode, FaDollarSign, FaRocket, FaHandshake, FaHeadset } from 'react-icons/fa'; // Added more relevant icons
import { toast } from 'react-toastify'; // For notifications

// Default theme for the app context
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

const PremiumWelcomePage = () => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };
    const location = useLocation();

    const getPrimaryGradient = () => `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')}`;
    const getPrimaryGradientHover = () => `hover:${appTheme.primaryHover.replace('bg-', 'from-')} hover:${appTheme.secondaryHover.replace('bg-', 'to-')}`;

    // Show a toast notification if coming from a successful subscription activation
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('status') === 'premium-activated') {
            toast.success('🎉 Welcome to CodeCrack Premium! Your subscription is now active.', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: appTheme.background.includes('dark') ? "dark" : "light",
            });
            // Optionally remove the query param to prevent toast on refresh
            // window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location.search, appTheme.background]);

    const premiumBenefits = [
        {
            icon: FiStar,
            title: 'Exclusive Problem Sets',
            description: 'Tackle a curated collection of advanced problems and company-specific challenges.',
            color: appTheme.highlight,
        },
        {
            icon: FiBookOpen,
            title: 'In-Depth Editorials',
            description: 'Access comprehensive explanations, multiple solutions, and video walkthroughs.',
            color: appTheme.highlightSecondary,
        },
        {
            icon: FiAward,
            title: 'Premium Contests',
            description: 'Compete in members-only contests for exclusive prizes and bragging rights.',
            color: appTheme.highlightTertiary,
        },
        {
            icon: FaHandshake,
            title: 'Priority Support',
            description: 'Get faster assistance from our dedicated support team and community experts.',
            color: appTheme.infoColor,
        },
        {
            icon: FiZap,
            title: 'Ad-Free Experience',
            description: 'Enjoy a seamless and distraction-free learning environment.',
            color: appTheme.warningColor,
        },
        {
            icon: FaCode,
            title: 'Advanced IDE Features',
            description: 'Unlock powerful debugger tools, custom themes, and enhanced editor capabilities.',
            color: appTheme.successColor,
        },
    ];

    const premiumActions = [
        { icon: FiStar, title: 'Explore Premium Problems', link: '/problems?premium=true' },
        { icon: FiAward, title: 'Join Exclusive Contests', link: '/contests?type=premium' },
        { icon: FiBookOpen, title: 'Access Interview Roadmaps', link: '/learn/interview-roadmaps' },
        { icon: FaHeadset, title: 'Contact Priority Support', link: '/contact?priority=true' },
    ];

    return (
        <div className={`min-h-screen ${appTheme.background} ${appTheme.text} font-sans overflow-x-hidden`}>
            <Header />

            <main className="py-20">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 text-center">
                    <div className="absolute inset-0 z-0">
                        <div className={`absolute inset-0 bg-gradient-to-t ${appTheme.gradientFrom} via-transparent ${appTheme.gradientTo}`}></div>
                        <div className={`absolute top-1/2 left-1/4 w-32 h-32 rounded-full ${appTheme.primary.replace('bg-', 'bg-')}/20 blur-xl animate-float-and-rotate`}></div>
                        <div className={`absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full ${appTheme.highlight.replace('text-', 'bg-')}/20 blur-xl animate-float-and-rotate animation-delay-2000`}></div>
                    </div>
                    <div className="max-w-4xl mx-auto px-4 relative z-10">
                        <FaCrown className={`text-7xl ${appTheme.highlight} mx-auto mb-6 animate-pulse-slow`} />
                        <h1 className={`text-5xl md:text-6xl font-extrabold mb-4 ${appTheme.text}`}>
                            Congratulations! <span className={appTheme.highlightSecondary}>Welcome</span>
                        </h1>
                        <h2 className={`text-4xl md:text-5xl font-extrabold mb-8 ${appTheme.text}`}>
                            to <span className={appTheme.highlight}>CodeCrack Premium</span>
                        </h2>
                        <p className={`text-xl md:text-2xl ${appTheme.cardText} max-w-3xl mx-auto mb-8`}>
                            You've just unlocked a world of advanced coding resources, personalized tools, and exclusive features designed to accelerate your mastery.
                        </p>
                        <Link
                            to="/problems"
                            className={`inline-flex items-center justify-center px-8 py-4 ${getPrimaryGradient()} ${getPrimaryGradientHover()} rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-2xl ${appTheme.buttonText} transform hover:scale-105`}
                        >
                            Start Your Premium Journey <FaRocket className="ml-2" />
                        </Link>
                    </div>
                </section>

                {/* Premium Benefits Grid */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className={`text-3xl md:text-4xl font-bold ${appTheme.text}`}>
                                What You've <span className={appTheme.highlight}>Unlocked</span>
                            </h2>
                            <p className={`mt-4 max-w-2xl mx-auto ${appTheme.cardText}`}>
                                A suite of powerful features at your fingertips to supercharge your coding skills.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {premiumBenefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className={`${appTheme.cardBg} p-8 rounded-xl border ${appTheme.border} text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                                >
                                    <div className={`w-16 h-16 mx-auto ${appTheme.iconBg} rounded-full flex items-center justify-center ${benefit.color} mb-6`}>
                                        {React.createElement(benefit.icon, { className: 'w-8 h-8' })}
                                    </div>
                                    <h3 className={`text-xl font-semibold ${appTheme.text} mb-2`}>{benefit.title}</h3>
                                    <p className={`${appTheme.cardText}`}>{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Quick Actions / Jump In Section */}
                <section className={`py-20 ${appTheme.cardBg}/50 backdrop-blur-md`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className={`text-3xl md:text-4xl font-bold ${appTheme.text}`}>
                                Jump Right <span className={appTheme.highlightTertiary}>In!</span>
                            </h2>
                            <p className={`mt-4 max-w-2xl mx-auto ${appTheme.cardText}`}>
                                Start leveraging your new Premium benefits instantly.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {premiumActions.map((action, index) => (
                                <Link
                                    key={index}
                                    to={action.link}
                                    className={`flex flex-col items-center justify-center p-6 rounded-xl border ${appTheme.border} ${appTheme.cardBg} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-${appTheme.highlightSecondary.split('-')[1]}-500/50`}
                                >
                                    {React.createElement(action.icon, { className: `text-4xl mb-3 ${appTheme.highlightSecondary}` })}
                                    <h3 className={`text-lg font-semibold ${appTheme.text} text-center`}>{action.title}</h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Support & Community */}
                <section className="py-20 text-center">
                    <div className="max-w-3xl mx-auto px-4">
                        <h2 className={`text-3xl md:text-4xl font-bold ${appTheme.text} mb-6`}>
                            Need a Hand? We're <span className={appTheme.highlight}>Here to Help.</span>
                        </h2>
                        <p className={`text-xl ${appTheme.cardText} max-w-2xl mx-auto mb-8`}>
                            As a Premium member, you receive priority support and exclusive access to our thriving community.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                to="/contact?priority=true"
                                className={`inline-flex items-center justify-center px-8 py-4 ${getPrimaryGradient()} ${getPrimaryGradientHover()} rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-2xl ${appTheme.buttonText} transform hover:scale-105`}
                            >
                                Contact Priority Support <FaHeadset className="ml-2" />
                            </Link>
                            <Link
                                to="/discuss"
                                className={`inline-flex items-center justify-center px-8 py-4 border-2 ${appTheme.border} rounded-lg hover:border-${appTheme.highlight.split('-')[1]}-400 hover:${appTheme.highlight} transition-colors duration-300 font-semibold text-lg bg-transparent`}
                            >
                                Visit Community Forum <FiMessageSquare className="ml-2" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default PremiumWelcomePage;