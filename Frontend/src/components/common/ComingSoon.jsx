import React, { useState, useEffect, useMemo } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { FiTerminal, FiClock, FiSend, FiCpu, FiZap, FiSettings, FiCheck, FiMail } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const HEADER_HEIGHT_APPROX = '80px';
const FOOTER_HEIGHT_APPROX = '60px';

const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonPrimary: 'bg-indigo-600', buttonPrimaryHover: 'bg-indigo-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
    accent: 'bg-cyan-500',
};

const ComingSoonPage = () => {
    const [email, setEmail] = useState('');
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isLaunched, setIsLaunched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    
    // Real-time status states
    const [currentStatus, setCurrentStatus] = useState("🔧 Initializing systems...");
    const [buildVersion, setBuildVersion] = useState("2.1.0");
    const [systemLoad, setSystemLoad] = useState(45);
    const [activeUsers, setActiveUsers] = useState(1247);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };

    const getBaseColorName = (tailwindClass) => {
        const match = tailwindClass.match(/bg-(\w+)-\d+/);
        return match ? match[1] : 'gray';
    };
    const primaryBaseColor = getBaseColorName(theme.primary);
    const secondaryBaseColor = getBaseColorName(theme.secondary);

    // FIXED: Set launch date to September 1, 2025 (fixed date that won't change on reload)
    const launchDate = useMemo(() => {
        return new Date('2025-09-01T00:00:00').getTime(); // September 1, 2025 midnight
    }, []);

    // Main countdown timer with realistic variations
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = launchDate - now;

            if (distance < 0) {
                clearInterval(timer);
                setIsLaunched(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                // Add small random variations to make it feel more realistic
                const randomOffset = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1 second variation
                const adjustedDistance = distance + (randomOffset * 1000);
                
                setTimeLeft({
                    days: Math.floor(adjustedDistance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((adjustedDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((adjustedDistance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((adjustedDistance % (1000 * 60)) / 1000),
                });
                
                // Update last update time
                setLastUpdate(new Date());
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [launchDate]);

    // Real-time status updates
    useEffect(() => {
        const statusUpdates = [
            "🔧 Compiling core modules...",
            "⚡ Optimizing database queries...", 
            "🔒 Running security checks...",
            "🚀 Deploying microservices...",
            "🔗 Testing API endpoints...",
            "⚙️ Syncing user preferences...",
            "🤖 Initializing AI components...",
            "✅ Validating system integrity...",
            "📁 Loading configuration files...",
            "🎯 Preparing launch sequence...",
            "🌐 Updating CDN cache...",
            "📊 Analyzing performance metrics...",
            "🔄 Synchronizing global servers...",
            "🛠️ Fine-tuning algorithms...",
            "📈 Optimizing user experience...",
            "🎨 Polishing UI components...",
            "🔐 Strengthening security layers...",
            "⚙️ Calibrating system parameters..."
        ];

        const statusTimer = setInterval(() => {
            const randomStatus = statusUpdates[Math.floor(Math.random() * statusUpdates.length)];
            setCurrentStatus(randomStatus);
            
            // Simulate version increments occasionally
            if (Math.random() < 0.05) { // 5% chance
                setBuildVersion(prev => {
                    const [major, minor, patch] = prev.split('.').map(Number);
                    return `${major}.${minor}.${patch + 1}`;
                });
            }
        }, 4000 + Math.random() * 3000); // Random interval between 4-7 seconds

        return () => clearInterval(statusTimer);
    }, []);

    // Real-time metrics simulation
    useEffect(() => {
        const metricsTimer = setInterval(() => {
            setSystemLoad(prev => {
                const change = (Math.random() - 0.5) * 6;
                return Math.max(30, Math.min(88, prev + change));
            });

            setActiveUsers(prev => {
                const change = Math.floor((Math.random() - 0.5) * 25);
                return Math.max(1150, Math.min(2300, prev + change));
            });
        }, 3000 + Math.random() * 2000);

        return () => clearInterval(metricsTimer);
    }, []);

    // Email submission handler with proper API call or mock
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter a valid email address');
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Mock API call - replace with your actual endpoint
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim() }),
            });

            if (response.ok) {
                setIsSubscribed(true);
                toast.success(`🎉 Thanks! We'll keep ${email} updated on our launch progress.`);
                setEmail('');
            } else {
                throw new Error('Subscription failed');
            }
        } catch (error) {
            // For demo purposes, we'll simulate success
            console.log('Email for notification:', email);
            setIsSubscribed(true);
            toast.success(`🎉 Thanks! We'll keep ${email} updated on our launch progress.`);
            setEmail('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const CountdownSegment = ({ value, label }) => (
        <div className="flex flex-col items-center p-3 md:p-4 group">
            <div className={`relative p-4 md:p-6 rounded-2xl ${theme.cardBg}/30 backdrop-blur-sm border ${theme.border}/30 group-hover:border-${primaryBaseColor}-400/50 transition-all duration-300 group-hover:scale-105`}>
                <span className={`text-2xl sm:text-3xl md:text-4xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-br ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} tracking-wider block text-center min-w-[60px]`}>
                    {value.toString().padStart(2, '0')}
                </span>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.primary}/5 ${theme.secondary}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
            <span className={`text-xs sm:text-sm ${theme.text}/60 uppercase tracking-wider mt-3 font-medium`}>{label}</span>
        </div>
    );

    // Calculate progress for the progress bar - FIXED: Based on fixed dates
    const projectStartTime = useMemo(() => {
        // Project started on January 1, 2025
        return new Date('2025-01-01T00:00:00').getTime();
    }, []);
    
    const totalDuration = launchDate - projectStartTime;
    const elapsedDuration = new Date().getTime() - projectStartTime;
    const progressPercentage = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100)) : 0;

    return (
        <div className={`min-h-screen ${theme.background} ${theme.text} flex flex-col relative overflow-hidden`}>
            <Header />

            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 -z-20 overflow-hidden">
                <div className={`absolute -top-32 -left-32 w-96 h-96 ${theme.primary} rounded-full opacity-10 animate-blob animation-delay-2000 blur-3xl`}></div>
                <div className={`absolute -bottom-32 -right-32 w-[400px] h-[400px] ${theme.secondary} rounded-full opacity-10 animate-blob animation-delay-4000 blur-3xl`}></div>
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${theme.accent} rounded-full opacity-5 animate-blob blur-3xl`}></div>
            </div>

            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 -z-15 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, ${theme.primary.replace('bg-', '')} 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            {/* Floating Code Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className={`absolute top-1/4 left-16 ${theme.primary}/20 text-4xl md:text-6xl opacity-40 animate-float-slow hidden lg:block font-mono`}>
                    {'{ }'}
                </div>
                <div className={`absolute bottom-1/4 right-16 ${theme.secondary}/20 text-3xl md:text-5xl opacity-40 animate-float-slow-reverse hidden lg:block font-mono`}>
                    {'</>'}
                </div>
                <div className={`absolute top-1/3 right-1/4 ${theme.accent}/20 text-2xl md:text-4xl opacity-30 animate-float-slow hidden md:block font-mono`}>
                    {'[ ]'}
                </div>
            </div>

            <main
                className="flex-grow flex flex-col items-center justify-center px-4 py-12 sm:py-16 relative z-10"
                style={{
                    paddingTop: HEADER_HEIGHT_APPROX,
                    paddingBottom: FOOTER_HEIGHT_APPROX,
                }}
            >
                <div className="w-full max-w-4xl">
                    <div className={`${theme.cardBg}/20 backdrop-blur-xl p-8 sm:p-12 md:p-16 rounded-3xl border ${theme.border}/20 shadow-2xl relative overflow-hidden`}>
                        {/* Glassmorphism overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary}/5 ${theme.secondary}/5 rounded-3xl`}></div>
                        
                        <div className="text-center relative z-10">
                            {/* Enhanced Icon Animation */}
                            <div className="relative mb-8">
                                <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${theme.primary}/20 ${theme.secondary}/20 blur-xl animate-pulse`}></div>
                                <FiSettings className={`relative mx-auto text-6xl md:text-7xl ${theme.primary.replace('bg-', 'text-')} animate-spin-slow opacity-90`} />
                            </div>

                            {/* Modern Typography */}
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 animate-fade-in-down">
                                <span className="block mb-2">CodeMasti</span>
                                <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} ${theme.highlightTertiary.replace('text-', 'via-')}`}>
                                    Revolution
                                </span>
                            </h1>

                            <p className={`text-lg sm:text-xl md:text-2xl ${theme.text}/80 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-down animation-delay-100`}>
                                Experience the future of competitive programming. 
                                <span className={`block mt-2 ${theme.highlight} font-semibold`}>
                                    Launching September 1, 2025
                                </span>
                            </p>

                            {/* Enhanced Launch Status */}
                            {isLaunched ? (
                                <div className={`my-12 p-8 ${theme.cardBg}/40 rounded-2xl border ${theme.successColor.replace('text-', 'border-')}/30 shadow-xl animate-fade-in-up relative overflow-hidden`}>
                                    <div className={`absolute inset-0 bg-gradient-to-r ${theme.successColor.replace('text-', 'from-green')}-400/10 ${theme.successColor.replace('text-', 'to-emerald')}-600/10`}></div>
                                    <FiZap className={`relative mx-auto text-6xl ${theme.successColor} mb-4 animate-bounce`} />
                                    <h2 className={`relative text-3xl md:text-4xl font-bold ${theme.successColor} mb-2`}>System Online!</h2>
                                    <p className={`relative ${theme.text}/90 text-lg`}>The wait is over. Welcome to the new CodeMasti experience!</p>
                                </div>
                            ) : (
                                <div className={`my-8 sm:my-12 p-6 sm:p-8 ${theme.cardBg}/30 rounded-2xl border ${theme.border}/20 shadow-inner animate-fade-in-up animation-delay-200 backdrop-blur-sm`}>
                                    
                                    {/* Real-time status bar */}
                                    <div className={`mb-6 p-4 ${theme.cardBg}/40 rounded-xl border ${theme.border}/30`}>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                                            <div className="flex items-center">
                                                <div className={`w-2 h-2 ${theme.successColor.replace('text-', 'bg-')} rounded-full animate-pulse mr-2`}></div>
                                                <span className={`text-sm ${theme.text}/90 font-mono`}>{currentStatus}</span>
                                            </div>
                                            <div className={`text-xs ${theme.text}/60 font-mono`}>
                                                Build: v{buildVersion}
                                            </div>
                                        </div>
                                        
                                        {/* Real-time metrics */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                            <div className={`${theme.text}/70`}>
                                                <span className="font-mono">CPU: {systemLoad.toFixed(1)}%</span>
                                            </div>
                                            <div className={`${theme.text}/70`}>
                                                <span className="font-mono">Users: {activeUsers.toLocaleString()}</span>
                                            </div>
                                            <div className={`${theme.text}/70 hidden sm:block`}>
                                                <span className="font-mono">
                                                    Updated: {lastUpdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <h2 className={`text-2xl sm:text-3xl font-bold ${theme.primary.replace('bg-', 'text-')} mb-6 flex items-center justify-center`}>
                                        <FiClock className="mr-3 animate-ping-slow opacity-75" /> 
                                        Official Launch Countdown
                                    </h2>
                                    
                                    {/* Modern Countdown */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <CountdownSegment value={timeLeft.days} label="Days" />
                                        <CountdownSegment value={timeLeft.hours} label="Hours" />
                                        <CountdownSegment value={timeLeft.minutes} label="Minutes" />
                                        <CountdownSegment value={timeLeft.seconds} label="Seconds" />
                                    </div>

                                    {/* Enhanced Progress Bar */}
                                    <div className="relative mb-4">
                                        <div className={`w-full ${theme.cardBg}/50 rounded-full h-4 overflow-hidden border ${theme.border}/30`}>
                                            <div
                                                className={`h-full bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} transition-all duration-1000 ease-out relative overflow-hidden`}
                                                style={{ width: `${progressPercentage}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className={`text-xs ${theme.text}/50`}>June 2025</span>
                                            <span className={`text-sm font-mono ${theme.highlight} font-bold`}>
                                                {progressPercentage.toFixed(1)}% Complete
                                            </span>
                                            <span className={`text-xs ${theme.text}/50`}>Sep 2025</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Email Subscription */}
                            {!isLaunched && (
                                <div className="mt-12 animate-fade-in-up animation-delay-300">
                                    <div className={`p-8 ${theme.cardBg}/20 rounded-2xl border ${theme.border}/20 backdrop-blur-sm`}>
                                        <div className="flex items-center justify-center mb-4">
                                            <FiMail className={`text-2xl ${theme.highlight} mr-3`} />
                                            <h3 className={`text-xl sm:text-2xl font-bold ${theme.text}`}>
                                                Join the Elite Beta List
                                            </h3>
                                        </div>
                                        <p className={`${theme.text}/70 mb-6 text-sm sm:text-base`}>
                                            Be among the first to experience the revolution. Get exclusive early access.
                                        </p>

                                        {isSubscribed ? (
                                            <div className={`p-6 ${theme.successColor.replace('text-', 'bg-')}/10 rounded-xl border ${theme.successColor.replace('text-', 'border-')}/30 animate-fade-in-up`}>
                                                <FiCheck className={`mx-auto text-3xl ${theme.successColor} mb-3`} />
                                                <h4 className={`text-lg font-semibold ${theme.successColor} mb-2`}>You're In!</h4>
                                                <p className={`${theme.text}/80 text-sm`}>We'll notify you the moment we launch on September 1st!</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                                                <div className="relative flex-grow group">
                                                    <FiTerminal className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.primary.replace('bg-', 'text-')}/70 text-lg transition-colors group-focus-within:${theme.primary.replace('bg-', 'text-')}`} />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="developer@codemasti.com"
                                                        required
                                                        disabled={isSubmitting}
                                                        className={`w-full p-4 pl-12 ${theme.cardBg}/50 border ${theme.border}/30 rounded-xl focus:ring-2 focus:ring-${primaryBaseColor}-400 focus:border-transparent outline-none shadow-sm text-sm placeholder-${theme.text.replace('text-', '')}/40 ${theme.text} transition-all duration-300 focus:${theme.cardBg}/70 backdrop-blur-sm disabled:opacity-50`}
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className={`px-6 py-4 text-base font-semibold rounded-xl bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} border-none hover:shadow-lg hover:shadow-${primaryBaseColor}-500/25 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-70 flex items-center justify-center group ${theme.buttonText} min-w-[140px]`}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                            Joining...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiSend className="mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                                                            Join Beta
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Feature Preview */}
                            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { icon: FiZap, title: "Lightning Fast", desc: "Optimized performance" },
                                    { icon: FiCpu, title: "AI Powered", desc: "Smart assistance" },
                                    { icon: FiSettings, title: "Customizable", desc: "Your way, your style" }
                                ].map((feature, index) => (
                                    <div key={index} className={`p-6 ${theme.cardBg}/20 rounded-xl border ${theme.border}/20 backdrop-blur-sm hover:${theme.cardBg}/30 transition-all duration-300 group animate-fade-in-up`} style={{animationDelay: `${0.4 + index * 0.1}s`}}>
                                        <feature.icon className={`text-3xl ${theme.primary.replace('bg-', 'text-')} mb-3 group-hover:scale-110 transition-transform duration-300`} />
                                        <h4 className={`font-semibold ${theme.text} mb-2`}>{feature.title}</h4>
                                        <p className={`text-sm ${theme.text}/70`}>{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <style jsx global>{`
                @keyframes float-slow {
                    0% { transform: translateY(0px) rotate(0deg) scale(1); }
                    50% { transform: translateY(-30px) rotate(5deg) scale(1.05); }
                    100% { transform: translateY(0px) rotate(0deg) scale(1); }
                }
                @keyframes float-slow-reverse {
                    0% { transform: translateY(0px) rotate(0deg) scale(1); }
                    50% { transform: translateY(30px) rotate(-5deg) scale(1.05); }
                    100% { transform: translateY(0px) rotate(0deg) scale(1); }
                }
                .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
                .animate-float-slow-reverse { animation: float-slow-reverse 14s ease-in-out infinite; }
                
                @keyframes spin-slow { to { transform: rotate(360deg); } }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }

                @keyframes ping-slow {
                    75%, 100% { transform: scale(1.3); opacity: 0; }
                }
                .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }

                @keyframes blob {
                    0% { transform: scale(1) translate(0px, 0px) rotate(0deg); }
                    33% { transform: scale(1.2) translate(40px, -60px) rotate(120deg); }
                    66% { transform: scale(0.8) translate(-30px, 30px) rotate(240deg); }
                    100% { transform: scale(1) translate(0px, 0px) rotate(360deg); }
                }
                .animate-blob { animation: blob 20s infinite ease-in-out; }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer { animation: shimmer 2s infinite; }

                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }

                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }

                .animation-delay-100 { animation-delay: 0.1s; }
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};

export default ComingSoonPage;