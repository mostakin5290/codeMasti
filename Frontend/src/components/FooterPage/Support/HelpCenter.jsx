import React, { useState } from 'react';
import Footer from '../../layout/Footer';
import Header from '../../layout/Header';
import { useTheme } from '../../../context/ThemeContext';
import { FiHelpCircle, FiSearch, FiCode, FiAward, FiUsers, FiBookOpen, FiStar, FiChevronRight, FiMail, FiMessageSquare } from 'react-icons/fi';
import { FaUserShield, FaTools, FaChalkboardTeacher, FaLightbulb } from 'react-icons/fa'; // More icons

const supportAppTheme = {
    background: 'bg-gray-50',
    text: 'text-gray-900',
    primary: 'bg-blue-600',
    primaryHover: 'bg-blue-700',
    secondary: 'bg-indigo-600',
    secondaryHover: 'bg-indigo-700',
    cardBg: 'bg-white',
    cardText: 'text-gray-700',
    border: 'border-gray-200',
    buttonText: 'text-white',
    highlight: 'text-blue-600',
    highlightSecondary: 'text-indigo-600',
    highlightTertiary: 'text-purple-600',
    iconBg: 'bg-blue-500/10',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-indigo-600',
    successColor: 'text-green-600',
    warningColor: 'text-amber-600',
    errorColor: 'text-red-600',
    infoColor: 'text-blue-600',
};
const HelpCenter = () => {
    // Get theme from context
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...supportAppTheme, ...appThemeFromContext };

    const [searchTerm, setSearchTerm] = useState('');

    // Helper functions for dynamic classes
    const getPrimaryGradientClasses = () => `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')}`;
    const getPrimaryHoverShadowClass = () => `hover:shadow-${appTheme.primary.split('-')[1]}-500/30`;
    const getHeadingColor = () => appTheme.highlight;
    const getSubHeadingColor = () => appTheme.highlightSecondary;

    const helpCategories = [
        { title: 'Getting Started', icon: FaChalkboardTeacher, description: 'Learn how to set up your account and start coding.' },
        { title: 'Problem Solving', icon: FiCode, description: 'Tips and tricks for tackling coding problems.' },
        { title: 'Contests & Rankings', icon: FiAward, description: 'Rules, scoring, and leaderboard information.' },
        { title: 'Account Management', icon: FaUserShield, description: 'Manage your profile, subscriptions, and settings.' },
        { title: 'Technical Issues', icon: FaTools, description: 'Troubleshooting common errors and bugs.' },
        { title: 'Community Guidelines', icon: FiUsers, description: 'Rules for respectful and helpful interactions.' },
    ];

    const featuredArticles = [
        { title: 'How to choose your first problem?', link: '/help/article/first-problem' },
        { title: 'Understanding submission results', link: '/help/article/submission-results' },
        { title: 'Participating in weekly contests', link: '/help/article/weekly-contests' },
        { title: 'Resetting your password', link: '/help/article/reset-password' },
        { title: 'Reporting a bug or issue', link: '/help/article/report-bug' },
    ];

    return (
        <div className={`min-h-screen flex flex-col ${appTheme.background} ${appTheme.text}`}>
            <div className='mb-10'>
                <Header />
            </div>

            <main className="flex-grow py-12">
                {/* Hero Section */}
                <section className="text-center max-w-4xl mx-auto px-4 mb-16">
                    <FiHelpCircle className={`${appTheme.highlight} text-6xl mx-auto mb-4`} />
                    <h1 className={`text-5xl font-extrabold ${appTheme.text} sm:text-6xl animate-fade-in-down`}>
                        <span className={`text-transparent bg-clip-text ${getPrimaryGradientClasses()}`}>
                            Help Center
                        </span>
                    </h1>
                    <p className={`mt-6 text-xl ${appTheme.cardText} animate-fade-in-down animate-delay-100`}>
                        Find answers to your questions, learn more about CodeMasti, and get the support you need.
                    </p>
                    <div className="mt-8 relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search our help articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full px-6 py-3 pr-12 rounded-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent transition-all duration-200`}
                        />
                        <FiSearch className={`absolute right-4 top-1/2 -translate-y-1/2 ${appTheme.cardText} text-xl`} />
                    </div>
                </section>

                {/* Categories Section */}
                <section className="max-w-7xl mx-auto px-4 mb-20">
                    <h2 className={`text-4xl font-bold text-center mb-12 ${appTheme.text}`}>Explore Topics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {helpCategories.map((category, index) => (
                            <a
                                href={`/help/chat`}
                                key={index}
                                className={`block ${appTheme.cardBg}/5 backdrop-blur-lg p-8 rounded-xl border ${appTheme.border}/20 text-center hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-lg`}
                            >
                                <category.icon className={`${appTheme.highlight} text-4xl mx-auto mb-4`} />
                                <h3 className={`text-2xl font-semibold ${appTheme.text} mb-2`}>{category.title}</h3>
                                <p className={`${appTheme.cardText}`}>{category.description}</p>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Featured Articles Section */}
                <section className="max-w-7xl mx-auto px-4 mb-20">
                    <h2 className={`text-4xl font-bold text-center mb-12 ${appTheme.text}`}>Featured Articles</h2>
                    <div className={`bg-white/5 backdrop-blur-lg rounded-xl border ${appTheme.border}/20 p-8 shadow-lg`}>
                        <ul className="space-y-4">
                            {featuredArticles.map((article, index) => (
                                <li key={index}>
                                    <a
                                        href={article.link}
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg ${appTheme.cardBg} hover:${appTheme.cardBg}/70 transition-colors duration-200`}
                                    >
                                        <span className={`text-lg font-medium ${appTheme.text} hover:${appTheme.highlight} transition-colors`}>
                                            {article.title}
                                        </span>
                                        <FiChevronRight className={`${appTheme.cardText} text-xl`} />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Quick Links / CTAs */}
                <section className="max-w-7xl mx-auto px-4 mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className={`bg-white/5 backdrop-blur-lg rounded-xl border ${appTheme.border}/20 p-8 text-center shadow-lg`}>
                            <FiMail className={`${appTheme.highlight} text-5xl mx-auto mb-4`} />
                            <h3 className={`text-2xl font-semibold ${appTheme.text} mb-2`}>Contact Our Team</h3>
                            <p className={`${appTheme.cardText} mb-4`}>
                                Can't find what you're looking for? Get in touch with our support specialists.
                            </p>
                            <a
                                href="/contact"
                                className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg ${getPrimaryGradientClasses()} ${appTheme.buttonText} font-medium hover:shadow-lg ${getPrimaryHoverShadowClass()} transition-all transform hover:scale-[1.02]`}
                            >
                                Send a Message <FiChevronRight />
                            </a>
                        </div>
                        <div className={`bg-white/5 backdrop-blur-lg rounded-xl border ${appTheme.border}/20 p-8 text-center shadow-lg`}>
                            <FiMessageSquare className={`${appTheme.highlightSecondary} text-5xl mx-auto mb-4`} />
                            <h3 className={`text-2xl font-semibold ${appTheme.text} mb-2`}>Community Forum</h3>
                            <p className={`${appTheme.cardText} mb-4`}>
                                Ask questions, share insights, and connect with other developers on our forum.
                            </p>
                            <a
                                href="/discuss"
                                className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} font-medium hover:${appTheme.cardBg}/80 transition-all transform hover:scale-[1.02]`}
                            >
                                Go to Forum <FiChevronRight />
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HelpCenter;