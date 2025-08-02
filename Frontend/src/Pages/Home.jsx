import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ArrowRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FiStar, FiArrowRight, FiCode, FiZap, FiTrendingUp } from 'react-icons/fi';
import { fetchUser } from '../features/auth/authSlice';
import { useTheme } from '../context/ThemeContext';
import Lottie from 'lottie-react';
import animationData from '../assets/lotties/coding-animation.json';
import celebrationAnimation from '../assets/lotties/celebration.json';
import codingAnimation from '../assets/lotties/coding.json';
import ideaAnimation from '../assets/lotties/Idea.json';
import successAnimation from '../assets/lotties/success.json';
import Aurora from '../components/animation/Aurora';
import TextType from '../components/ui/TextType';
import SplitText from '../components/ui/SplitText'

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

const tailwindColorMap = {
    'gray-50': '#F9FAFB', 'gray-100': '#F3F4F6', 'gray-200': '#E5E7EB', 'gray-300': '#D1D5DB', 'gray-400': '#9CA3AF', 'gray-500': '#6B7280', 'gray-600': '#4B5563', 'gray-700': '#374151', 'gray-800': '#1F2937', 'gray-900': '#111827', 'gray-950': '#0A0A0A',
    'zinc-50': '#FAFAFA', 'zinc-100': '#F4F4F5', 'zinc-200': '#E4E4E7', 'zinc-300': '#D4D4D8', 'zinc-400': '#A1A1AA', 'zinc-500': '#71717A', 'zinc-600': '#52525B', 'zinc-700': '#3F3F46', 'zinc-800': '#27272A', 'zinc-900': '#18181B', 'zinc-950': '#09090B',
    'slate-50': '#F8FAFC', 'slate-100': '#F1F5F9', 'slate-200': '#E2E8F0', 'slate-300': '#CBD5E1', 'slate-400': '#94A3B8', 'slate-500': '#64748B', 'slate-600': '#475569', 'slate-700': '#334155', 'slate-800': '#1E293B', 'slate-900': '#0F172A', 'slate-950': '#020617',
    'neutral-50': '#FAFAFA', 'neutral-100': '#F5F5F5', 'neutral-200': '#E5E5E5', 'neutral-300': '#D4D4D4', 'neutral-400': '#A3A3A3', 'neutral-500': '#737373', 'neutral-600': '#525252', 'neutral-700': '#404040', 'neutral-800': '#262626', 'neutral-900': '#171717', 'neutral-950': '#0A0A0A',
    'stone-50': '#FAFAF9', 'stone-100': '#F5F5EE', 'stone-200': '#E7E5E4', 'stone-300': '#D6D3D1', 'stone-400': '#A8A29E', 'stone-500': '#78716C', 'stone-600': '#57534E', 'stone-700': '#44403C', 'stone-800': '#292524', 'stone-900': '#1C1917', 'stone-950': '#0C0A09',

    'red-50': '#FEF2F2', 'red-100': '#FEE2E2', 'red-200': '#FECACA', 'red-300': '#FCA5A5', 'red-400': '#F87171', 'red-500': '#EF4444', 'red-600': '#DC2626', 'red-700': '#B91C1C', 'red-800': '#991B1B', 'red-900': '#7F1D1D', 'red-950': '#450A0A',
    'rose-50': '#FFF1F2', 'rose-100': '#FFE4E6', 'rose-200': '#FECDD3', 'rose-300': '#FDA4AF', 'rose-400': '#FB7185', 'rose-500': '#F43F5E', 'rose-600': '#E11D48', 'rose-700': '#BE123C', 'rose-800': '#9F1239', 'rose-900': '#881337', 'rose-950': '#450A0A',
    'pink-50': '#FFF1F2', 'pink-100': '#FCE7F3', 'pink-200': '#FBCFE8', 'pink-300': '#F9A8D4', 'pink-400': '#F472B6', 'pink-500': '#EC4899', 'pink-600': '#DB2777', 'pink-700': '#BE185D', 'pink-800': '#9D174D', 'pink-900': '#831843', 'pink-950': '#450A0A',
    'fuchsia-50': '#FCF5FF', 'fuchsia-100': '#FBF0FE', 'fuchsia-200': '#F7E6FE', 'fuchsia-300': '#F0ABFC', 'fuchsia-400': '#E879F9', 'fuchsia-500': '#D946EF', 'fuchsia-600': '#C026D3', 'fuchsia-700': '#A21CAF', 'fuchsia-800': '#86198F', 'fuchsia-900': '#701A7B', 'fuchsia-950': '#3A0F48',

    // Oranges/Ambers/Yellows
    'orange-50': '#FFF7ED', 'orange-100': '#FFEDD5', 'orange-200': '#FDBA74', 'orange-300': '#FDBA74', 'orange-400': '#FB923C', 'orange-500': '#F97316', 'orange-600': '#EA580C', 'orange-700': '#C2410C', 'orange-800': '#9A3412', 'orange-900': '#7C2D12', 'orange-950': '#431407',
    'amber-50': '#FFFBEB', 'amber-100': '#FEF3C7', 'amber-200': '#FDE68A', 'amber-300': '#FCD34D', 'amber-400': '#FBBF24', 'amber-500': '#F59E0B', 'amber-600': '#D97706', 'amber-700': '#B45309', 'amber-800': '#92400E', 'amber-900': '#78350F', 'amber-950': '#451A03',
    'yellow-50': '#FFFDEB', 'yellow-100': '#FEF9C3', 'yellow-200': '#FEF08A', 'yellow-300': '#FDE047', 'yellow-400': '#FACC15', 'yellow-500': '#EAB308', 'yellow-600': '#CA8A04', 'yellow-700': '#A16207', 'yellow-800': '#854D09', 'yellow-900': '#713F12', 'yellow-950': '#422006',

    // Greens/Emeralds/Teals/Limes
    'green-50': '#F0FDF4', 'green-100': '#DCFCE7', 'green-200': '#BBF7D0', 'green-300': '#86EFAC', 'green-400': '#4ADE80', 'green-500': '#22C55E', 'green-600': '#16A34A', 'green-700': '#15803D', 'green-800': '#166534', 'green-900': '#14532D', 'green-950': '#052E16',
    'emerald-50': '#ECFDF5', 'emerald-100': '#D1FAE5', 'emerald-200': '#A7F3D0', 'emerald-300': '#6EE7B7', 'emerald-400': '#34D399', 'emerald-500': '#10B981', 'emerald-600': '#059669', 'emerald-700': '#047857', 'emerald-800': '#065F46', 'emerald-900': '#064E3B', 'emerald-950': '#022C22',
    'teal-50': '#F0FDFB', 'teal-100': '#CCFBF1', 'teal-200': '#99F6E4', 'teal-300': '#5EEAD4', 'teal-400': '#2DD4BF', 'teal-500': '#14B8A6', 'teal-600': '#0D9488', 'teal-700': '#0F766E', 'teal-800': '#115E59', 'teal-900': '#134E4A', 'teal-950': '#042F2E',
    'lime-50': '#F7FEE7', 'lime-100': '#EEFFDE', 'lime-200': '#E3FFB5', 'lime-300': '#CCF38F', 'lime-400': '#A3E635', 'lime-500': '#84CC16', 'lime-600': '#65A30D', 'lime-700': '#4D7C0F', 'lime-800': '#3F6212', 'lime-900': '#365314', 'lime-950': '#1A2E05',

    // Blues/Cyans/Skys/Indigos/Violets/Purples
    'blue-50': '#EFF6FF', 'blue-100': '#DBEAFE', 'blue-200': '#BFDBFE', 'blue-300': '#93C5FD', 'blue-400': '#60A5FA', 'blue-500': '#3B82F6', 'blue-600': '#2563EB', 'blue-700': '#1D4ED8', 'blue-800': '#1E40AF', 'blue-900': '#1E3A8A', 'blue-950': '#172554',
    'cyan-50': '#ECFEFF', 'cyan-100': '#CFFAFE', 'cyan-200': '#A7F3D0', 'cyan-300': '#67E8F9', 'cyan-400': '#22D3EE', 'cyan-500': '#06B6D4', 'cyan-600': '#0891B2', 'cyan-700': '#067482', 'cyan-800': '#0A7B90', 'cyan-900': '#0E7490', 'cyan-950': '#014A60',
    'sky-50': '#F0F9FF', 'sky-100': '#E0F2FE', 'sky-200': '#BAE6FD', 'sky-300': '#7DD3FC', 'sky-400': '#38BDF8', 'sky-500': '#0EA5E9', 'sky-600': '#0284C7', 'sky-700': '#0369A1', 'sky-800': '#075985', 'sky-900': '#0C4A6E', 'sky-950': '#082F49',
    'indigo-50': '#EEF2FF', 'indigo-100': '#E0E7FF', 'indigo-200': '#C7D2FE', 'indigo-300': '#A5B4FC', 'indigo-400': '#818CF8', 'indigo-500': '#6366F1', 'indigo-600': '#4F46E5', 'indigo-700': '#4338CA', 'indigo-800': '#3730A3', 'indigo-900': '#312E81', 'indigo-950': '#1E1B4B',
    'violet-50': '#F5F3FF', 'violet-100': '#EDE9FE', 'violet-200': '#DDD6FE', 'violet-300': '#C4B5FD', 'violet-400': '#A78BFA', 'violet-500': '#8B5CF6', 'violet-600': '#7C3AED', 'violet-700': '#6D28D9', 'violet-800': '#5B21B6', 'violet-900': '#4C1D95', 'violet-950': '#2E1065',
    'purple-50': '#FAFAFF', 'purple-100': '#F3E8FF', 'purple-200': '#E9D5FF', 'purple-300': '#DDAAFF', 'purple-400': '#C084FC', 'purple-500': '#A855F7', 'purple-600': '#9333EA', 'purple-700': '#7E22CE', 'purple-800': '#6B21A8', 'purple-900': '#581C87', 'purple-950': '#3B0764',

    // Special/Utility
    'black': '#000000',
    'white': '#FFFFFF',
};

const Home = () => {
    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const celebrationRef = useRef(null);

    const getHexColor = (tailwindClass) => {
        const parts = tailwindClass.split('-');
        if (parts.length < 2) return null;
        const colorKey = parts.slice(1).join('-');
        return tailwindColorMap[colorKey] || null;
    };

    const auroraColorStops = [
        getHexColor(theme.primary),
        getHexColor(theme.highlightSecondary),
        getHexColor(theme.highlight)
    ].filter(Boolean);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get('status');

        if (status === 'premium-activated') {
            if (celebrationRef.current) {
                celebrationRef.current.play();
            }

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

            dispatch(fetchUser());
            navigate(location.pathname, { replace: true });
        }
    }, [location, theme, dispatch, navigate]);

    const isUserPremium = user && user.isPremium;

    const Card3D = ({ children, className = '' }) => {
        return (
            <div className={`${className} transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl`}>
                <div className="group perspective">
                    <div className="relative preserve-3d group-hover:rotate-x-10 transition-all duration-500">
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    // Modern Animated Border Component
    const AnimatedBorderCard = ({ children, className = '' }) => {
        return (
            <div className={`relative ${className}`}>
                {/* Animated Border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl opacity-40 animate-pulse"></div>
                {/* Content */}
                <div className="relative bg-gray-900 rounded-xl">
                    {children}
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${theme.background} ${theme.text} font-sans scroll-smooth overflow-x-hidden`}>
            {/* Add custom CSS for animations */}
            <style jsx>{`
                @keyframes tilt {
                    0%, 50%, 100% {
                        transform: rotate(0deg);
                    }
                    25% {
                        transform: rotate(0.5deg);
                    }
                    75% {
                        transform: rotate(-0.5deg);
                    }
                }
                .animate-tilt {
                    animation: tilt 10s infinite linear;
                }
                @keyframes gradient-x {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
                .animate-gradient-x {
                    animation: gradient-x 15s ease infinite;
                    background-size: 400% 400%;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
                    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.4); }
                }
                .animate-glow {
                    animation: glow 2s ease-in-out infinite alternate;
                }
                @keyframes border-flow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-border-flow {
                    animation: border-flow 3s ease infinite;
                    background-size: 200% 200%;
                }
            `}</style>

            {/* Celebration animation (hidden until triggered) */}
            <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                <Lottie
                    lottieRef={celebrationRef}
                    animationData={celebrationAnimation}
                    loop={false}
                    style={{ width: '100%', height: '100%', opacity: 0 }}
                    className="transition-opacity duration-1000"
                    onDOMLoaded={() => {
                        if (celebrationRef.current) {
                            celebrationRef.current.setSpeed(0.8);
                        }
                    }}
                />
            </div>

            <Header />

            {/* Hero Section - Enhanced */}
            <section className="relative overflow-hidden py-15 md:py-28 lg:py-15 flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    {/* Enhanced floating elements */}
                    <div className={`absolute top-1/4 left-1/4 w-20 h-20 rounded-full ${theme.highlightSecondary.replace('text-', 'bg-')}/20 blur-xl animate-float`}></div>
                    <div className={`absolute top-1/3 right-1/4 w-32 h-32 rounded-full ${theme.highlightTertiary.replace('text-', 'bg-')}/20 blur-xl animate-float`} style={{ animationDelay: '2s' }}></div>
                    <div className={`absolute bottom-1/4 right-1/3 w-24 h-24 rounded-full ${theme.highlight.replace('text-', 'bg-')}/20 blur-xl animate-float`} style={{ animationDelay: '4s' }}></div>

                    {/* Gradient orbs */}
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-cyan-400/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>

                    {auroraColorStops.length >= 3 && (
                        <Aurora
                            colorStops={auroraColorStops}
                            amplitude={2}
                            blend={0}
                        />
                    )}
                </div>


                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left animate-fade-in-up">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                            <span className="block bg-gradient-to-r from-white to-gray-300 bg-clip-text ">Master Modern</span>
                            <span className={`block bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} bg-clip-text  mt-2 animate-gradient-x`}>
                                Coding Challenges
                            </span>
                        </h1>

                        <TextType
                            className={`text-l mt-10 mb-10 ${theme.text}`}
                            text={["Join our platform where developers sharpen their skills...",
                                "through interactive coding exercises, real-world projects...",
                                "and competitive programming..."]}
                            typingSpeed={100}
                            pauseDuration={1500}
                            showCursor={true}
                            cursorCharacter="|"
                            textColors={theme.text}
                        />

                        <Link to="/problems">
                            <div className={`group relative cursor-pointer p-2.5 w-40  ${theme.buttonPrimary} rounded-full overflow-hidden ${theme.buttonText}  text-center font-semibold`}>
                                <span className="translate-x-1 group-hover:translate-x-12 group-hover:opacity-0 transition-all duration-300 inline-block">
                                    Start Coding Now
                                </span>
                                <div className={`flex gap-2 ${theme.text} ${theme.secondary} z-10 items-center absolute top-0 h-full w-full justify-center translate-x-12 opacity-0 group-hover:-translate-x-1 group-hover:opacity-100 transition-all duration-600`}>
                                    <span>Start Coding</span>
                                    <ArrowRight />
                                </div>
                                <div className={`absolute top-[40%] bg-transparent left-[20%] h-2 w-2 group-hover:h-full group-hover:w-full rounded-lg  scale-[1]  group-hover:scale-[1.8] transition-all duration-300 group-hover:top-[0%] group-hover:left-[0%] `}></div>
                            </div>
                        </Link>
                    </div>
                    <div className="hidden lg:block animate-fade-in-up delay-300">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                            <Lottie
                                animationData={codingAnimation}
                                loop={true}
                                className="relative w-full h-full max-w-xl mx-auto transform hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section - Enhanced */}
            <section className="py-20 relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full ${theme.highlightSecondary.replace('text-', 'bg-')}/10 blur-3xl -mr-32 -mt-32`}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Why <span className={`${theme.highlight} bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} bg-clip-text `}>Choose Us</span>
                        </h2>
                        <p className={`mt-4 max-w-2xl mx-auto ${theme.cardText}`}>
                            Our platform offers unique features that set us apart from the competition
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 bg-transparent ">
                        {[
                            {
                                title: "AI-Powered Feedback",
                                description: "Get instant, personalized feedback on your code with our advanced AI analysis system.",
                                icon: <FiZap className="h-8 w-8" />,
                                iconColor: theme.highlight,
                                animation: ideaAnimation,
                                gradient: "from-yellow-400 to-orange-500"
                            },
                            {
                                title: "Real-World Projects",
                                description: "Work on projects that simulate actual industry challenges from top tech companies.",
                                icon: <FiCode className="h-8 w-8" />,
                                iconColor: theme.highlightSecondary,
                                animation: animationData,
                                gradient: "from-blue-400 to-purple-500"
                            },
                            {
                                title: "Personalized Learning Paths",
                                description: "Customized learning journeys based on your skill level and career goals.",
                                icon: <FiTrendingUp className="h-8 w-8" />,
                                iconColor: theme.highlightTertiary,
                                animation: successAnimation,
                                gradient: "from-green-400 to-cyan-500"
                            }
                        ].map((feature, i) => (
                            <Card3D key={i} className="group bg-transparent ">
                                <div className={`relative ${theme.cardBg} rounded-xl border ${theme.border} hover:shadow-xl overflow-hidden`}>
                                    {/* Animated border effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl`}></div>
                                    <div className={`absolute inset-[1px] ${theme.cardBg} rounded-xl`}></div>

                                    <div className="relative p-8 flex flex-col h-full">
                                        <div className="h-48 mb-6 overflow-hidden rounded-lg relative">
                                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-lg`}></div>
                                            <Lottie
                                                animationData={feature.animation}
                                                loop={true}
                                                className="w-full h-full relative z-10"
                                            />
                                        </div>
                                        <div className={`w-16 h-16 mx-auto ${theme.iconBg} rounded-full flex items-center justify-center ${feature.iconColor} mb-6 relative overflow-hidden group-hover:animate-glow`}>
                                            <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full`}></div>
                                            <span className="relative z-10">{feature.icon}</span>
                                        </div>
                                        <h3 className="mt-4 text-xl font-semibold text-center">{feature.title}</h3>
                                        <p className={`mt-2 ${theme.cardText} text-center flex-grow`}>{feature.description}</p>
                                        <div className="mt-6 text-center">
                                            <span className={`inline-flex items-center ${theme.highlight} group-hover:${theme.highlightSecondary} transition-colors duration-300`}>
                                                Learn more
                                                <FiArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card3D>
                        ))}
                    </div>
                </div>
            </section>

            {/* IDE Showcase Section - Enhanced with Animated Border */}
            <section className={`py-20 ${theme.cardBg}/30 relative`}>
                <div className="absolute inset-0">
                    <div className={`absolute top-1/3 left-1/4 w-32 h-32 rounded-full ${theme.highlight.replace('text-', 'bg-')}/10 blur-xl animate-pulse`}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            <span className={`bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} bg-clip-text `}>Modern</span> Development Environment
                        </h2>
                        <p className={`mt-4 max-w-2xl mx-auto ${theme.cardText}`}>
                            Experience cutting-edge coding with our advanced IDE featuring AI assistance and real-time collaboration
                        </p>
                    </div>

                    {/* Enhanced IDE Showcase with Animated Border */}
                    <div className="group">
                        <AnimatedBorderCard className="rounded-xl overflow-hidden shadow-2xl">
                            {/* IDE Header */}
                            <div className={`${theme.cardBg} p-4 flex items-center justify-between border-b ${theme.border}`}>
                                <div className="flex items-center space-x-4">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '1s' }}></div>
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
                                    <div className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r from-green-400 to-emerald-500 text-white font-medium animate-pulse`}>
                                        Live
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Code Editor */}
                            <div className="bg-gray-900 text-gray-100 relative">
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
                                            <div className="leading-6"><span className="text-purple-400">const</span> <span className="text-blue-300">welcome</span> = <span className="text-yellow-300">async</span> () <span className="text-purple-400">{`=>`} </span> {'{'}</div>
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

                            {/* Enhanced Terminal */}
                            <div className={`${theme.cardBg} border-t ${theme.border}`}>
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`text-sm font-medium ${theme.cardText} flex items-center gap-2`}>
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            Terminal
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 ${theme.successColor.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
                                            <span className={`text-xs ${theme.successColor}`}>Connected</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className={`text-xs ${theme.highlight} bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} bg-clip-text  font-semibold`}>Ready</div>
                                    </div>
                                </div>
                                <div className="px-4 pb-4">
                                    <div className="bg-black/90 rounded-lg p-4 font-mono text-sm border border-gray-700/50">
                                        <div className={`${theme.successColor} flex items-center gap-2`}>
                                            <span>$</span>
                                            <span className="animate-pulse">npm run dev</span>
                                        </div>
                                        <div className={`${theme.cardText} mt-1`}>✓ Code compiled successfully</div>
                                        <div className={`${theme.successColor} mt-1`}>✓ All tests passed</div>
                                        <div className={`mt-3 ${theme.infoColor} overflow-hidden whitespace-nowrap`}>
                                            <span className="animate-pulse">Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'Guest'}!</span>
                                        </div>
                                        <div className={`mt-2 ${theme.successColor} bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text `}>
                                            {`{ message: "Ready to tackle new challenges?", nextLevel: ${user ? 'true' : 'false'} }`}
                                        </div>
                                        <div className={`mt-2 ${theme.warningColor} flex items-center gap-2`}>
                                            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                                            Process completed in 1.2s
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedBorderCard>
                    </div>
                </div>
            </section>

            {/* Learning Paths Section - Enhanced */}
            <section className="py-20 relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full ${theme.highlightTertiary.replace('text-', 'bg-')}/10 blur-3xl -ml-32 -mb-32`}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Structured <span className={`bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} bg-clip-text `}>Learning Paths</span>
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
                                color: `from-cyan-400 to-blue-500`,
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
                                color: `from-purple-400 to-pink-500`,
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
                                color: `from-green-400 to-emerald-500`,
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                )
                            }
                        ].map((path, i) => (
                            <Card3D key={i} className="group">
                                <div className={`relative ${theme.cardBg} rounded-xl border ${theme.border} overflow-hidden hover:shadow-xl`}>
                                    {/* Animated progress bar at top */}
                                    <div className={`h-2 bg-gradient-to-r ${path.color} animate-border-flow`}></div>

                                    <div className="p-6">
                                        <div className={`w-12 h-12 ${theme.iconBg} rounded-lg flex items-center justify-center ${theme.highlight} mb-4 relative overflow-hidden group-hover:animate-glow`}>
                                            <div className={`absolute inset-0 bg-gradient-to-r ${path.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg`}></div>
                                            <span className="relative z-10">{path.icon}</span>
                                        </div>
                                        <h3 className="text-xl font-semibold">{path.title}</h3>
                                        <p className={`mt-2 ${theme.cardText}`}>{path.description}</p>
                                        <div className="mt-6">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Progress</span>
                                                <span className={`font-semibold bg-gradient-to-r ${path.color} bg-clip-text `}>{path.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-2 rounded-full bg-gradient-to-r ${path.color} transition-all duration-1000 ease-out`}
                                                    style={{ width: `${path.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/paths/${path.title.toLowerCase().replace(' ', '-')}`}
                                            className={`mt-6 inline-flex items-center justify-center w-full px-4 py-3 border-2 border-transparent bg-gradient-to-r ${path.color} p-[2px] rounded-lg transition-all duration-300 group-hover:scale-105`}
                                        >
                                            <div className={`${theme.cardBg} rounded-md px-4 py-2 w-full text-center group-hover:bg-transparent group-hover:text-white transition-all duration-300`}>
                                                <span className="flex items-center justify-center gap-2">
                                                    Explore Path
                                                    <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </Card3D>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enhanced CTA Section */}
            <section className={`py-20 bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo} relative overflow-hidden`}>
                <div className="absolute inset-0">
                    <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-x`}></div>
                    <div className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full ${theme.highlight.replace('text-', 'bg-')}/10 blur-xl animate-float`}></div>
                    <div className={`absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full ${theme.highlightTertiary.replace('text-', 'bg-')}/10 blur-xl animate-float`} style={{ animationDelay: '3s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to <span className={`bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text `}>Transform</span> Your Career?
                    </h2>
                    <p className={`text-xl ${theme.cardText} max-w-3xl mx-auto mb-10`}>
                        Join thousands of developers who've accelerated their careers with our platform.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        {user?.isPremium ? (
                            <Link
                                to="/explore-premium"
                                className={`group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-2xl text-white transform hover:scale-105 active:scale-95 relative overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                                <span className="relative flex items-center gap-2">
                                    Explore Premium <FiStar className="text-yellow-200" />
                                </span>
                            </Link>
                        ) : (
                            <Link
                                to="/premium"
                                className={`group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} rounded-xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-2xl ${theme.buttonText} transform hover:scale-105 active:scale-95 relative overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-blue-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <span className="relative">Upgrade to Premium</span>
                            </Link>
                        )}
                        <Link
                            to="https://youtu.be/mc6xfVDaLeE?si=yyaNJR4XFEQCEw_V"
                            target='_blank'
                            className={`group inline-flex items-center justify-center px-8 py-4 border-2 border-transparent bg-gradient-to-r from-cyan-400 to-purple-500 p-[2px] rounded-xl transition-all duration-300 font-semibold text-lg transform hover:scale-105 active:scale-95`}
                        >
                            <div className={`${theme.background} rounded-lg px-6 py-2 group-hover:bg-transparent group-hover:text-white transition-all duration-300`}>
                                <span className="flex items-center gap-2">
                                    Watch Demo
                                    <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
