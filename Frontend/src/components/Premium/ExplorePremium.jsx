import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axiosClient from "../../api/axiosClient"; // IMPORTANT: Ensure this path is correct

import { useTheme } from '../../context/ThemeContext';
import {
    FiStar, FiBookOpen, FiAward, FiClock, FiUsers, FiZap,
    FiCpu, FiGitBranch, FiMessageCircle, FiTrendingUp, FiCheckCircle
} from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

// Default theme for consistency across pages
const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonPrimary: 'bg-indigo-600',
    buttonPrimaryHover: 'bg-indigo-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

const ExplorePremium = () => {
    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };

    // Get user and token from Redux state for authentication
    // Destructure `token` here because it's a critical dependency for the API call.
    const { user, token } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [premiumInfo, setPremiumInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper functions for consistent button styling (unchanged)
    const getPrimaryGradient = () => `bg-gradient-to-r ${theme.buttonPrimary}`;
    const getPrimaryGradientHover = () => `hover:${theme.buttonPrimaryHover.replace('bg-', 'from-')} hover:${theme.buttonPrimaryHover.replace('bg-', 'to-')}`;
    const getSolidPrimaryButtonClasses = () => `
        ${theme.buttonPrimary}
        hover:${theme.buttonPrimaryHover}
        transition-all duration-300
        font-semibold shadow-lg hover:shadow-xl
        ${theme.buttonText}
        transform hover:scale-105
        focus:outline-none focus:ring-4 focus:ring-opacity-50
        ${theme.buttonPrimary.replace('bg-', 'focus:ring-')}
    `;

    // Detailed features list (unchanged)
    const premiumFeaturesDetailed = [
        {
            icon: FiStar,
            title: 'Elite Problem Set',
            description: 'Gain exclusive access to a continuously updated library of over 500 premium coding challenges, including real interview questions from FAANG and other top tech companies. Master advanced data structures, algorithms, and system design scenarios.',
            color: theme.highlight
        },
        {
            icon: FiBookOpen,
            title: 'In-Depth Editorial Solutions',
            description: 'Understand every nuance with our comprehensive editorial solutions. Each problem includes multiple approaches (optimal, alternative), detailed explanations, time/space complexity analysis, and illustrative diagrams to solidify your understanding.',
            color: theme.highlightSecondary
        },
        {
            icon: FiAward,
            title: 'Exclusive Premium Contests',
            description: 'Test your skills against a global community in private, members-only contests. Compete for exclusive prizes, badges, and recognition on the leaderboard. These contests often feature advanced problems and unique formats.',
            color: theme.highlightTertiary
        },
        {
            icon: FiCpu,
            title: 'AI-Powered Code Review',
            description: 'Get intelligent, real-time feedback on your code. Our AI-powered assistant analyzes your solutions, suggests optimizations, identifies common pitfalls, and helps you write cleaner, more efficient code.',
            color: theme.successColor
        },
        {
            icon: FiGitBranch,
            title: 'Personalized Learning Paths',
            description: 'Unlock custom learning roadmaps tailored to your career goals and skill level. Our algorithm recommends problems and resources to help you bridge gaps and excel in specific domains like web development, machine learning, or mobile.',
            color: theme.infoColor
        },
        {
            icon: FiMessageCircle,
            title: 'Interactive Mock Interviews',
            description: 'Simulate real interview scenarios with interactive mock interviews. Practice whiteboarding, behavioral questions, and coding challenges with AI or peer feedback to refine your communication and problem-solving under pressure.',
            color: theme.warningColor
        },
        {
            icon: FiClock,
            title: 'Unlimited Practice & Submissions',
            description: 'Break free from limits. Premium membership offers unlimited problem attempts, submissions, and test case runs. Practice as much as you need to perfect your solutions without any restrictions.',
            color: theme.highlight
        },
        {
            icon: FiUsers,
            title: 'Priority Community Support',
            description: 'Get your questions answered faster. Premium members receive priority support in our community forums, with dedicated moderators and expert developers on hand to provide quick and comprehensive assistance.',
            color: theme.highlightSecondary
        },
        {
            icon: FiZap,
            title: 'Ad-Free Experience',
            description: 'Maximize your focus and minimize distractions. Enjoy an entirely ad-free platform experience across all problems, contests, and learning paths, allowing for uninterrupted learning and coding sessions.',
            color: theme.highlightTertiary
        },
    ];

    useEffect(() => {
        let isMounted = true; // Flag to track component mount status

        const fetchPremiumDetails = async () => {
            if (!user) {
                if (isMounted) {
                    setLoading(false);
                    setPremiumInfo(null);
                    setError("Please log in to view premium details.");
                }
                return;
            }

            if (!user.isPremium) {
                if (isMounted) {
                    setLoading(false);
                    setPremiumInfo({ isPremium: false });
                    setError("You do not have an active premium subscription.");
                    toast.info("You do not have an active premium subscription. Explore our plans!", {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: theme.name?.toLowerCase().includes('dark') ? 'dark' : 'light',
                    });
                }
                return;
            }

            try {
                if (isMounted) setLoading(true);

                const { data } = await axiosClient.get('/premium/details');

                if (isMounted) {
                    if (data.success) {
                        setPremiumInfo(data.premiumDetails);
                        if (data.premiumDetails.needsRenewalAlert) {
                            toast.warn(data.premiumDetails.alertMessage, {
                                position: "top-center",
                                autoClose: false,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: theme.name?.toLowerCase().includes('dark') ? 'dark' : 'light',
                            });
                        }
                    } else {
                        setError(data.message || "Failed to fetch premium details.");
                        setPremiumInfo({ isPremium: false });
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.error("API call error:", err);
                    const errorMessage = err.response?.data?.message || err.message || "Could not connect to the server.";
                    setError(errorMessage);
                    setPremiumInfo({ isPremium: false });
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPremiumDetails();

        return () => {
            isMounted = false; // Cleanup function to prevent state updates after unmount
        };
    }, [user, token]); // Simplified dependencies
    return (
        <div className={`min-h-screen ${theme.background} ${theme.text} font-sans overflow-x-hidden`}>
            <Header />

            <main>
                {/* Hero Section (unchanged) */}
                <section className="relative overflow-hidden py-20 md:py-32 lg:py-40 text-center">
                    <div className="absolute inset-0 z-0">
                        <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradientFrom} via-transparent ${theme.gradientTo}`}></div>
                        <div className={`absolute top-1/4 left-1/4 w-24 h-24 rounded-full ${theme.primary.replace('bg-', 'bg-')}/20 blur-xl animate-float-and-rotate`}></div>
                        <div className={`absolute bottom-1/4 right-1/3 w-36 h-36 rounded-full ${theme.highlight.replace('text-', 'bg-')}/20 blur-xl animate-float-and-rotate animation-delay-2000`}></div>
                    </div>
                    <div className="max-w-4xl mx-auto px-4 relative z-10">
                        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 animate-fade-in-up`}>
                            Your <span className={theme.highlight}>CodeMaster Premium</span>
                        </h1>
                        <p className={`text-lg md:text-xl ${theme.cardText} max-w-3xl mx-auto mb-10 animate-fade-in-up delay-200`}>
                            Discover the exclusive features and benefits designed to accelerate your journey to coding mastery.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up delay-400">
                            {user?.isPremium ? (
                                <div className={`px-8 py-3 rounded-lg ${getSolidPrimaryButtonClasses()} flex items-center justify-center cursor-default opacity-90`}>
                                    Your Premium is Active <FiStar className="ml-2 text-yellow-400" />
                                </div>
                            ) : (
                                <Link
                                    to="/premium"
                                    className={`px-8 py-3 rounded-lg ${getSolidPrimaryButtonClasses()} flex items-center justify-center`}
                                >
                                    Get Premium Now <FaCrown className="ml-2" />
                                </Link>
                            )}
                            <Link
                                to="/problems"
                                className={`px-8 py-3 rounded-lg border-2 ${theme.border} hover:border-${theme.highlight.split('-')[1]}-400 hover:${theme.highlight} transition-all duration-300 font-semibold bg-transparent transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${theme.highlight.replace('text-', 'focus:ring-')}`}
                            >
                                Start Coding
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Premium Status Section */}
                <section className={`py-16 ${theme.cardBg}/50 backdrop-blur-md`}>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className={`text-3xl md:text-4xl font-bold ${theme.text} mb-8`}>
                            Your Current Subscription
                        </h2>
                        {/* Conditional rendering for loading, error, and premium info */}
                        {loading && (
                            <div className={`p-8 rounded-xl ${theme.cardBg} border ${theme.border} shadow-lg`}>
                                <p className={theme.cardText}>Loading your premium details...</p>
                            </div>
                        )}
                        {error && !loading && (
                            <div className={`p-8 rounded-xl ${theme.cardBg} border ${theme.border} shadow-lg`}>
                                <p className={`${theme.errorColor}`}>Error: {error}</p>
                                {/* If there's an error and user isn't premium, offer to explore plans */}
                                {(!user || !user.isPremium) && (
                                    <Link
                                        to="/premium"
                                        className={`mt-6 inline-flex items-center justify-center px-8 py-3 rounded-lg ${getSolidPrimaryButtonClasses()} flex items-center justify-center`}
                                    >
                                        Explore Premium Plans <FaCrown className="ml-2" />
                                    </Link>
                                )}
                            </div>
                        )}

                        {premiumInfo && !loading && (
                            <div className={`${theme.cardBg} p-8 rounded-xl border ${theme.border} shadow-lg`}>
                                {/* Check `premiumInfo.isPremium` from API response, not just Redux `user.isPremium` */}
                                {premiumInfo.isPremium ? (
                                    <>
                                        <p className={`text-lg mb-2 ${theme.cardText}`}>
                                            You are subscribed to the <span className={theme.highlight}>{premiumInfo.plan.charAt(0).toUpperCase() + premiumInfo.plan.slice(1)}</span> plan.
                                        </p>
                                        <p className={`text-xl font-semibold mb-4 ${theme.text}`}>
                                            Status: <span className={premiumInfo.calculatedStatus === 'active' ? theme.successColor : theme.errorColor}>
                                                {premiumInfo.calculatedStatus.charAt(0).toUpperCase() + premiumInfo.calculatedStatus.slice(1)}
                                            </span>
                                        </p>
                                        {premiumInfo.calculatedStatus === 'active' ? (
                                            <>
                                                <p className={`${theme.cardText} mb-2`}>
                                                    Subscription Ends: <span className={theme.highlight}>{new Date(premiumInfo.endDate).toLocaleDateString()}</span>
                                                </p>
                                                <p className={`text-2xl font-bold mb-6 ${premiumInfo.needsRenewalAlert ? theme.warningColor : theme.highlightSecondary}`}>
                                                    Time Left: {premiumInfo.daysRemaining}d {premiumInfo.hoursRemaining}h
                                                </p>
                                                {premiumInfo.needsRenewalAlert && (
                                                    <div className="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/50 text-orange-400">
                                                        <p className="font-semibold">{premiumInfo.alertMessage}</p>
                                                        <Link
                                                            to="/premium" // Link to your pricing/subscription page for renewal
                                                            className={`mt-4 inline-flex items-center justify-center px-6 py-2 rounded-lg ${getSolidPrimaryButtonClasses()}`}
                                                        >
                                                            Renew Now
                                                        </Link>
                                                    </div>
                                                )}
                                                <Link
                                                    to="/profile" // Or a dedicated premium management page
                                                    className={`inline-flex items-center justify-center w-full sm:w-auto px-6 py-2 border-2 ${theme.border} rounded-lg hover:border-${theme.highlight.split('-')[1]}-400 hover:${theme.highlight} transition-colors duration-300 font-semibold bg-transparent`}
                                                >
                                                    Manage Subscription
                                                </Link>
                                            </>
                                        ) : (
                                            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
                                                <p className="font-semibold">{premiumInfo.alertMessage || "Your premium subscription has expired. Please reactivate to regain access."}</p>
                                                <Link
                                                    to="/premium"
                                                    className={`mt-4 inline-flex items-center justify-center px-6 py-2 rounded-lg ${getSolidPrimaryButtonClasses()}`}
                                                >
                                                    Reactivate Premium
                                                </Link>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    // Render for non-premium users who somehow landed here or whose premium fetch failed
                                    <>
                                        <p className={`text-lg mb-4 ${theme.cardText}`}>
                                            You do not currently have an active premium subscription.
                                            Unlock exclusive features and accelerate your coding journey!
                                        </p>
                                        <Link
                                            to="/premium"
                                            className={`inline-flex items-center justify-center px-8 py-3 rounded-lg ${getSolidPrimaryButtonClasses()} flex items-center justify-center`}
                                        >
                                            Get Premium Now <FaCrown className="ml-2" />
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Detailed Features Section (unchanged) */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>
                                What Your <span className={theme.highlight}>Premium</span> Includes
                            </h2>
                            <p className={`mt-4 max-w-2xl mx-auto ${theme.cardText}`}>
                                Experience a truly enhanced coding journey with features designed for serious growth.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {premiumFeaturesDetailed.map((feature, index) => (
                                <div key={index} className={`${theme.cardBg} p-8 rounded-xl border ${theme.border} text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}>
                                    <div className={`w-16 h-16 mx-auto ${theme.iconBg} rounded-full flex items-center justify-center ${feature.color} mb-6 group-hover:animate-pulse`}>
                                        {React.createElement(feature.icon, { className: 'w-8 h-8' })}
                                    </div>
                                    <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>{feature.title}</h3>
                                    <p className={`${theme.cardText}`}>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How Premium Accelerates Your Goals (Use Cases) (unchanged) */}
                <section className={`py-20 ${theme.cardBg}/30`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>
                                How Premium <span className={theme.highlightSecondary}>Accelerates Your Goals</span>
                            </h2>
                            <p className={`mt-4 max-w-2xl mx-auto ${theme.cardText}`}>
                                Whether you're job hunting, mastering new tech, or aiming for competitive programming excellence, Premium has you covered.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Ace Technical Interviews",
                                    description: "Practice with actual interview questions from leading companies, utilize our mock interview simulator, and get AI-powered feedback to perfect your responses.",
                                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm3-6h.01M15 15h.01" />
                                    </svg>,
                                    color: theme.infoColor
                                },
                                {
                                    title: "Master Advanced Concepts",
                                    description: "Dive deep into complex topics like dynamic programming, graph algorithms, and system design with curated paths, exclusive problems, and expert explanations.",
                                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>,
                                    color: theme.warningColor
                                },
                                {
                                    title: "Boost Your Career Growth",
                                    description: "Stay ahead with early access to new technologies, real-world project challenges, and features that help you build a standout portfolio and resume.",
                                    icon: <FiTrendingUp className="h-8 w-8" />,
                                    color: theme.successColor
                                }
                            ].map((goal, i) => (
                                <div key={i} className={`${theme.cardBg} p-8 rounded-xl border ${theme.border} transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
                                    <div className={`w-16 h-16 mx-auto ${theme.iconBg} rounded-full flex items-center justify-center ${goal.color} mb-6`}>
                                        {goal.icon}
                                    </div>
                                    <h3 className="mt-4 text-xl font-semibold text-center">{goal.title}</h3>
                                    <p className={`mt-2 ${theme.cardText} text-center`}>{goal.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final Call to Action Section (unchanged logic) */}
                <section className={`py-20 bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to <span className={theme.highlight}>Maximize</span> Your Potential?
                        </h2>
                        <p className={`text-xl ${theme.cardText} max-w-3xl mx-auto mb-10`}>
                            Continue your journey with CodeMaster Premium – the ultimate tool for coding excellence.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            {user?.isPremium && premiumInfo?.calculatedStatus === 'active' ? (
                                premiumInfo.needsRenewalAlert ? (
                                    <Link to="/premium" className={`inline-flex items-center justify-center px-8 py-4 ${getSolidPrimaryButtonClasses()} text-lg`}>
                                        Renew Your Premium Now
                                        <FiCheckCircle className="ml-3 text-2xl" />
                                    </Link>
                                ) : (
                                    <div className="px-8 py-4 rounded-lg bg-white/5 border border-white/20 text-white font-medium flex items-center justify-center cursor-default">
                                        Your Premium is Active!
                                        <FiStar className="ml-2 text-yellow-400" />
                                    </div>
                                )
                            ) : (
                                <Link to="/premium" className={`inline-flex items-center justify-center px-8 py-4 ${getSolidPrimaryButtonClasses()} text-lg`}>
                                    Get Premium Today
                                    <FaCrown className="ml-3 text-2xl" />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ExplorePremium;