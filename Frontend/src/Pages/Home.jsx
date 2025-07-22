import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FiStar } from 'react-icons/fi';
import { fetchUser } from '../features/auth/authSlice'; // IMPORTANT: Make sure this is correctly imported

import { useTheme } from '../context/ThemeContext';

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

const Home = () => {
    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get('status');

        if (status === 'premium-activated') {
            toast.success('🎉 Congratulations! Your Premium subscription is now active!', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: theme.name && theme.name.toLowerCase().includes('dark') ? 'dark' : 'light',
                style: {
                    background: `${theme.successColor.replace('text-', 'bg-')}/30`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.successColor.replace('text-', 'border-')}/50`,
                    color: theme.text.replace('text-', '')
                }
            });

            // --- FIX HERE ---
            dispatch(fetchUser()); // Correctly dispatch the fetchUser thunk
            // --- END FIX ---

            // Remove the query parameter from URL to prevent showing toast on refresh
            navigate(location.pathname, { replace: true });
        }
    }, [location, theme, dispatch, navigate]);

    // ... (rest of the Home component remains unchanged) ...
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

    const isUserPremium = user && user.isPremium;

    return (
        <div className={`min-h-screen ${theme.background} ${theme.text} font-sans overflow-x-hidden`}>
            <Header />

            <section className="relative overflow-hidden py-20 md:py-32 lg:py-40 flex items-center justify-center">
                <div className="absolute inset-0 z-1">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                    <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradientFrom} via-transparent ${theme.gradientTo}`}></div>

                    <div className={`absolute top-1/4 left-1/4 w-16 h-16 rounded-full ${theme.highlightSecondary.replace('text-', 'bg-')}/20 blur-xl animate-float-and-rotate`}></div>
                    <div className={`absolute top-1/3 right-1/4 w-24 h-24 rounded-full ${theme.highlightTertiary.replace('text-', 'bg-')}/20 blur-xl animate-float-and-rotate animation-delay-2000`}></div>
                    <div className={`absolute bottom-1/4 right-1/3 w-20 h-20 rounded-full ${theme.highlight.replace('text-', 'bg-')}/20 blur-xl animate-float-and-rotate animation-delay-4000`}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight animate-fade-in-up">
                        <span className="block">Master Modern</span>
                        <span className={`block ${getPrimaryGradient()} bg-clip-text   mt-2`}>
                            Coding Challenges
                        </span>
                    </h1>
                    <p className={`mt-6 max-w-3xl mx-auto text-lg md:text-xl ${theme.cardText} animate-fade-in-up delay-200`}>
                        Join our platform where developers sharpen their skills through interactive coding exercises,
                        real-world projects, and competitive programming.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up delay-400">
                        <Link
                            to="/problems"
                            className={`px-8 py-3 rounded-lg ${getSolidPrimaryButtonClasses()}`}
                        >
                            Start Coding Now
                        </Link>
                        {isUserPremium ? (
                            <Link
                                to="/profile" 
                                className={`px-8 py-3 rounded-lg border-2 ${theme.border} hover:border-${theme.highlight.split('-')[1]}-400 hover:${theme.highlight} transition-all duration-300 font-semibold bg-transparent transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${theme.highlight.replace('text-', 'focus:ring-')}`}
                            >
                                Manage Premium
                            </Link>
                        ) : (
                            <Link
                                to="/contests"
                                className={`px-8 py-3 rounded-lg border-2 ${theme.border} hover:border-${theme.highlight.split('-')[1]}-400 hover:${theme.highlight} transition-all duration-300 font-semibold bg-transparent transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${theme.highlight.replace('text-', 'focus:ring-')}`}
                            >
                                Join a Contest
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <section className={`py-16 ${theme.cardBg}/50 backdrop-blur-md`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '15,000+', label: 'Active Developers', color: theme.highlight },
                            { value: '1,200+', label: 'Coding Problems', color: theme.highlightSecondary },
                            { value: '80+', label: 'Weekly Contests', color: theme.highlightTertiary },
                            { value: '150+', label: 'Tech Companies', color: theme.highlight }
                        ].map((stat, i) => (
                            <div key={i} className={`p-6 rounded-xl ${theme.cardBg} border ${theme.border} transform transition-all duration-500 hover:scale-105 hover:shadow-lg group`}>
                                <div className={`text-3xl font-bold ${stat.color} group-hover:animate-pulse`}>{stat.value}</div>
                                <div className={`mt-2 ${theme.cardText}`}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Why <span className={theme.highlight}>Choose Us</span>
                        </h2>
                        <p className={`mt-4 max-w-2xl mx-auto ${theme.cardText}`}>
                            Our platform offers unique features that set us apart from the competition
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "AI-Powered Feedback",
                                description: "Get instant, personalized feedback on your code with our advanced AI analysis system.",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                ),
                                iconColor: theme.highlight
                            },
                            {
                                title: "Real-World Projects",
                                description: "Work on projects that simulate actual industry challenges from top tech companies.",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                ),
                                iconColor: theme.highlightSecondary
                            },
                            {
                                title: "Personalized Learning Paths",
                                description: "Customized learning journeys based on your skill level and career goals.",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                ),
                                iconColor: theme.highlightTertiary
                            }
                        ].map((feature, i) => (
                            <div key={i} className={`${theme.cardBg} p-8 rounded-xl border ${theme.border} transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
                                <div className={`w-16 h-16 mx-auto ${theme.iconBg} rounded-full flex items-center justify-center ${feature.iconColor} mb-6`}>
                                    {feature.icon}
                                </div>
                                <h3 className="mt-4 text-xl font-semibold text-center">{feature.title}</h3>
                                <p className={`mt-2 ${theme.cardText} text-center`}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-20 ${theme.cardBg}/30`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            <span className={theme.highlight}>Modern</span> Development Environment
                        </h2>
                        <p className={`mt-4 max-w-2xl mx-auto ${theme.cardText}`}>
                            Experience cutting-edge coding with our advanced IDE featuring AI assistance and real-time collaboration
                        </p>
                    </div>

                    <div className={`rounded-xl overflow-hidden border ${theme.border} shadow-2xl `}>
                        <div className={`${theme.cardBg} p-4 flex items-center justify-between border-b ${theme.border}`}>
                            <div className="flex items-center space-x-4">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 630 630">
                                        <rect width="630" height="630" fill="#f7df1e" />
                                        <path d="m423.2 492.19c12.69 20.72 29.2 35.95 58.4 35.95 24.53 0 40.2-12.26 40.2-29.2 0-20.3-16.1-27.49-43.1-39.3l-14.8-6.35c-42.72-18.2-71.1-41-71.1-89.2 0-44.4 33.83-78.2 86.7-78.2 37.64 0 64.7 13.1 84.2 47.4l-46.1 29.6c-10.15-18.2-21.1-25.37-38.1-25.37-17.34 0-28.33 11-28.33 25.37 0 17.76 11 24.95 36.4 35.95l14.8 6.34c50.3 21.57 78.7 43.56 78.7 93 0 53.3-41.87 82.5-98.1 82.5-54.98 0-90.5-26.2-107.88-60.54zm-209.13 5.13c9.3 16.5 17.76 30.45 38.1 30.45 19.45 0 31.72-7.61 31.72-37.2v-201.3h59.2v202.1c0 61.3-35.94 89.2-88.4 89.2-47.4 0-74.85-24.53-88.81-54.075z" />
                                    </svg>
                                    <span className={`text-sm font-medium ${theme.cardText}`}>welcome.js</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`px-2 py-1 rounded text-xs bg-green-500/10 text-green-500 font-medium`}>
                                    Live
                                </div>
                            </div>
                        </div>

                        <div className={`bg-gray-900 text-gray-100 relative`}>
                            <div className="p-6 font-mono text-sm overflow-x-auto">
                                <div className="flex">
                                    <div className="text-gray-500 mr-6 select-none text-right" style={{ minWidth: '2rem' }}>
                                        {Array.from({ length: 15 }, (_, i) => <div key={i} className="leading-6">{i + 1}</div>)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="leading-6"><span className="text-gray-500">/**</span></div>
                                        <div className="leading-6"><span className="text-gray-500"> * Welcome to CodeMaster Platform</span></div>
                                        <div className="leading-6"><span className="text-gray-500"> * Your journey to coding excellence starts here!</span></div>
                                        <div className="leading-6"><span className="text-gray-500"> */</span></div>
                                        <div className="leading-6"></div>
                                        <div className="leading-6"><span className="text-purple-400">const</span> <span className="text-blue-300">welcome</span> = <span className="text-yellow-300">async</span> () <span className="text-purple-400"></span> {'{'}</div>
                                        <div className="leading-6 ml-4"><span className="text-purple-400">const</span> user = <span className="text-purple-400">await</span> <span className="text-blue-300">getCurrentUser</span>();</div>
                                        <div className="leading-6 ml-4"><span className="text-purple-400">const</span> achievements = <span className="text-purple-400">await</span> <span className="text-blue-300">getUserAchievements</span>(user.id);</div>
                                        <div className="leading-6 ml-4"></div>
                                        <div className="leading-6 ml-4"><span className="text-blue-300">console</span>.<span className="text-yellow-300">log</span>(<span className="text-green-400">`Welcome back, </span><span className="text-orange-400">${user ? user.firstName : 'Guest'} {user ? user.lastName : ''}</span><span className="text-green-400">!`</span>);</div>
                                        <div className="leading-6 ml-4"></div>
                                        <div className="leading-6 ml-4"><span className="text-purple-400">return</span> {'{'}</div>
                                        <div className="leading-6 ml-8">message: <span className="text-green-400">"Ready to tackle new challenges?"</span>,</div>
                                        <div className="leading-6 ml-8">nextLevel: <span className="text-blue-300">calculateNextLevel</span>(achievements)</div>
                                        <div className="leading-6 ml-4">{'}'}</div>
                                        <div className="leading-6">{'}'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`${theme.cardBg} border-t ${theme.border}`}>
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`text-sm font-medium ${theme.cardText}`}>Terminal</div>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 ${theme.successColor.replace('text-', 'bg-')} rounded-full`}></div>
                                        <span className={`text-xs ${theme.successColor}`}>Connected</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className={`text-xs ${theme.highlight}`}>Ready</div>
                                </div>
                            </div>
                            <div className="px-4 pb-4">
                                <div className={`bg-black/80 rounded p-3 font-mono text-sm`}>
                                    <div className={`${theme.successColor}`}>$ npm run dev</div>
                                    <div className={`${theme.cardText}`}>✓ Code compiled successfully</div>
                                    <div className={`${theme.successColor}`}>✓ All tests passed</div>
                                    <div className={`mt-2 ${theme.infoColor} animate-typing overflow-hidden whitespace-nowrap border-r-2 ${theme.infoColor.replace('text-', 'border-r-')} pr-2`}>
                                        Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'Guest'}!
                                    </div>
                                    <div className={`mt-1 ${theme.successColor} `}>
                                        {`{ message: "Ready to tackle new challenges?", nextLevel: ${user ? 'true' : 'false'} }`}
                                    </div>
                                    <div className={`mt-2 ${theme.warningColor} `}>
                                        Process completed in 1.2s
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Structured <span className={theme.highlightSecondary}>Learning Paths</span>
                        </h2>
                        <p className={`mt-4 max-w-2xl mx-auto ${theme.cardText}`}>
                            Follow our expert-curated paths to master specific skills and technologies
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Frontend Mastery",
                                description: "Master modern frontend development with React, Vue, and state management",
                                progress: 65,
                                color: `${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')}`,
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                )
                            },
                            {
                                title: "Backend Expertise",
                                description: "Build scalable backend systems with Node.js, Django, and database design",
                                progress: 40,
                                color: `${theme.highlightTertiary.replace('text-', 'from-')} ${theme.highlight.replace('text-', 'to-')}`,
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                    </svg>
                                )
                            },
                            {
                                title: "Data Structures & Algorithms",
                                description: "Master the fundamentals to ace technical interviews at top companies",
                                progress: 85,
                                color: `${theme.successColor.replace('text-', 'from-')} ${theme.highlightSecondary.replace('text-', 'to-')}`,
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                )
                            }
                        ].map((path, i) => (
                            <div key={i} className={`${theme.cardBg} rounded-xl border ${theme.border} overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
                                <div className={`h-2 bg-gradient-to-r ${path.color}`}></div>
                                <div className="p-6">
                                    <div className={`w-12 h-12 ${theme.iconBg} rounded-lg flex items-center justify-center ${theme.highlight} mb-4`}>
                                        {path.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold">{path.title}</h3>
                                    <p className={`mt-2 ${theme.cardText}`}>{path.description}</p>
                                    <div className="mt-6">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Progress</span>
                                            <span>{path.progress}%</span>
                                        </div>
                                        <div className="w-full ${theme.border.replace('border-', 'bg-')} rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full bg-gradient-to-r ${path.color}`}
                                                style={{ width: `${path.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/paths/${path.title.toLowerCase().replace(' ', '-')}`}
                                        className={`mt-6 inline-flex items-center justify-center w-full px-4 py-2 border-2 ${theme.border} rounded-lg hover:border-${theme.highlight.split('-')[1]}-400 hover:${theme.highlight} transition-colors duration-300`}
                                    >
                                        Explore Path
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-20 ${theme.cardBg}/30`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Success <span className={theme.highlightTertiary}>Stories</span>
                        </h2>
                        <p className={`mt-4 max-w-2xl mx-auto ${theme.cardText}`}>
                            Hear from developers who transformed their careers with our platform
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Sarah Johnson",
                                role: "Frontend Developer @ Google",
                                quote: "This platform helped me land my dream job at Google. The interview preparation resources were invaluable.",
                                avatar: "https://randomuser.me/api/portraits/women/44.jpg"
                            },
                            {
                                name: "Michael Chen",
                                role: "Software Engineer @ Amazon",
                                quote: "The system design challenges perfectly prepared me for my Amazon interviews. Highly recommended!",
                                avatar: "https://randomuser.me/api/portraits/men/32.jpg"
                            },
                            {
                                name: "David Rodriguez",
                                role: "Backend Engineer @ Stripe",
                                quote: "I went from beginner to professional thanks to the structured learning paths and mentorship.",
                                avatar: "https://randomuser.me/api/portraits/men/75.jpg"
                            }
                        ].map((testimonial, i) => (
                            <div key={i} className={`${theme.cardBg} p-8 rounded-xl border ${theme.border} transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
                                <div className="flex items-center">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className={`w-12 h-12 rounded-full object-cover border-2 ${theme.highlightSecondary.replace('text-', 'border-')}/50`}
                                    />
                                    <div className="ml-4">
                                        <h4 className="font-semibold">{testimonial.name}</h4>
                                        <p className={`text-sm ${theme.cardText}`}>{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className={`mt-6 italic ${theme.cardText}`}>"{testimonial.quote}"</p>
                                <div className="mt-6 flex ${theme.warningColor}">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`py-20 bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to <span className={theme.highlight}>Transform</span> Your Career?
                    </h2>
                    <p className={`text-xl ${theme.cardText} max-w-3xl mx-auto mb-10`}>
                        Join thousands of developers who've accelerated their careers with our platform.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">

                        {user?.isPremium ? (
                            <Link
                                to="/explore-premium"
                                className={`inline-flex items-center justify-center px-8 py-4 ${getPrimaryGradient()} ${getPrimaryGradientHover()} rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-2xl ${theme.buttonText} transform hover:scale-105`}
                            >
                                Explore Premium <FiStar className="ml-2 text-yellow-400" />
                            </Link>
                        ) : (
                            <Link to="/premium" className={`inline-flex items-center justify-center px-8 py-4 ${getPrimaryGradient()} ${getPrimaryGradientHover()} rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-2xl ${theme.buttonText} transform hover:scale-105`}>
                                Update to Premium
                            </Link>
                        )}

                        <Link
                            to="/demo"
                            className={`inline-flex items-center justify-center px-8 py-4 border-2 ${theme.border} rounded-lg hover:border-${theme.highlight.split('-')[1]}-400 hover:${theme.highlight} transition-colors duration-300 font-semibold text-lg bg-transparent`}
                        >
                            Watch Demo
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;