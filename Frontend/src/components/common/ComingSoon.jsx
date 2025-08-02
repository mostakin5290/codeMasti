import React, { useState, useEffect, useMemo } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { FiTerminal, FiClock, FiSend, FiCpu, FiZap, FiSettings } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext'; 

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
    accent: 'bg-cyan-500', // Assuming accent is used for highlights and rings
};


const ComingSoonPage = () => {
    const [email, setEmail] = useState('');
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isLaunched, setIsLaunched] = useState(false);

    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext }; 

    const getBaseColorName = (tailwindClass) => {
        const match = tailwindClass.match(/bg-(\w+)-\d+/);
        return match ? match[1] : 'gray'; 
    };
    const primaryBaseColor = getBaseColorName(theme.primary);
    const secondaryBaseColor = getBaseColorName(theme.secondary);


    const launchDate = useMemo(() => new Date('2024-12-31T23:59:59').getTime(), []); // Memoize launch date

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = launchDate - now;

            if (distance < 0) {
                clearInterval(timer);
                setIsLaunched(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [launchDate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Email for notification:', email);
        alert(`Thanks! We'll keep ${email} updated on our launch progress.`);
        setEmail('');
    };

    const CountdownSegment = ({ value, label }) => (
        <div className="flex flex-col items-center p-2 md:p-3">
            <span className={`text-3xl sm:text-4xl md:text-5xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-br ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} tracking-wider`}>
                {value.toString().padStart(2, '0')}
            </span>
            <span className={`text-xs sm:text-sm ${theme.text}/60 uppercase tracking-wider mt-1`}>{label}</span>
        </div>
    );

    // Calculate progress for the progress bar
    const projectStartTime = useMemo(() => new Date(launchDate - (90 * 24 * 60 * 60 * 1000)).getTime(), [launchDate]);
    const totalDuration = launchDate - projectStartTime;
    const elapsedDuration = new Date().getTime() - projectStartTime;
    const progressPercentage = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100)) : 0;

    return (
        <div className={`min-h-screen ${theme.background} bg-cover bg-center ${theme.text} flex flex-col relative`}>
                <Header />
            

            <div className="absolute inset-0 -z-20 overflow-hidden">
                <div className={`absolute -top-20 -left-20 w-64 h-64 ${theme.primary} rounded-full opacity-5 animate-blob animation-delay-2000`}></div>
                <div className={`absolute -bottom-20 -right-20 w-72 h-72 ${theme.secondary} rounded-full opacity-5 animate-blob animation-delay-4000`}></div>
                <div className={`absolute top-1/3 left-1/3 w-56 h-56 ${theme.accent} rounded-full opacity-5 animate-blob`}></div>
            </div>

            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className={`absolute top-1/4 left-10 ${theme.primary}/10 text-6xl opacity-30 animate-float-slow hidden lg:block`}>
                    {'{}'}
                </div>
                <div className={`absolute bottom-1/4 right-10 ${theme.secondary}/10 text-5xl opacity-30 animate-float-slow-reverse hidden lg:block`}>
                    {'</>'}
                </div>
            </div>

            <main
                className="flex-grow flex flex-col items-center justify-center px-4 py-12 sm:py-16 relative z-10 overflow-hidden"
                style={{
                    paddingTop: HEADER_HEIGHT_APPROX,
                    paddingBottom: FOOTER_HEIGHT_APPROX,
                }}
            >
                <div className="w-full max-w-3xl" style={{ perspective: '1200px' }}>
                    <div
                        className={`${theme.text}/5 backdrop-blur-2xl p-6 sm:p-8 md:p-12 rounded-2xl border ${theme.text}/10 shadow-2xl transform transition-all duration-700 ease-out hover:shadow-${primaryBaseColor}/20 overflow-hidden`}
                    >
                        <div className="text-center relative">
                            <FiSettings className={`mx-auto text-5xl md:text-6xl ${theme.primary.replace('bg-', 'text-')} mb-4 animate-spin-slow opacity-80`} />

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 animate-fade-in-down">
                                <span className="block">CodeMasti Systems</span> {/* Changed "CodeCrack" to "CodeMasti" */}
                                <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')}`}>
                                    Initializing...
                                </span>
                            </h1>

                            <p className={`text-base sm:text-lg md:text-xl ${theme.text}/70 mb-8 animate-fade-in-down animation-delay-100`}>
                                Our developers are compiling something truly epic.
                                Get ready for the next level of CodeMasti! {/* Changed "CodeCrack" to "CodeMasti" */}
                            </p>

                            {isLaunched ? (
                                <div className={`my-8 p-6 ${theme.cardBg}/40 rounded-xl border ${theme.primary}/30 shadow-xl animate-fade-in-up`}>
                                    <FiZap className={`mx-auto text-5xl ${theme.successColor} mb-3`} />
                                    <h2 className={`text-3xl font-bold ${theme.successColor}`}>We Are Live!</h2>
                                    <p className={`${theme.text}/80 mt-2`}>The wait is over. Explore the new CodeMasti now!</p> {/* Changed "CodeCrack" to "CodeMasti" */}
                                </div>
                            ) : (
                                <div className={`my-6 sm:my-8 p-4 sm:p-6 ${theme.cardBg}/20 rounded-xl border ${theme.text}/10 shadow-inner animate-fade-in-up animation-delay-200`}>
                                    <h2 className={`text-xl sm:text-2xl font-semibold ${theme.primary.replace('bg-', 'text-')} mb-3 sm:mb-4 flex items-center justify-center`}>
                                        <FiClock className="mr-2 animate-ping-slow opacity-75" /> Launch ETA
                                    </h2>
                                    <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-4">
                                        <CountdownSegment value={timeLeft.days} label="Days" />
                                        <CountdownSegment value={timeLeft.hours} label="Hours" />
                                        <CountdownSegment value={timeLeft.minutes} label="Mins" />
                                        <CountdownSegment value={timeLeft.seconds} label="Secs" />
                                    </div>
                                    <div className={`mt-4 sm:mt-6 w-full ${theme.text}/10 rounded-full h-2.5 sm:h-3 overflow-hidden`}>
                                        <div
                                            className={`h-full bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} transition-all duration-1000 ease-linear`}
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    <p className={`text-xs ${theme.text}/50 mt-2 text-right`}>System Build: {progressPercentage.toFixed(0)}% Complete</p>
                                </div>
                            )}

                            {!isLaunched && (
                                <div className="mt-8 sm:mt-10 animate-fade-in-up animation-delay-300">
                                    <h3 className={`text-lg sm:text-xl font-semibold ${theme.text}/90 mb-3`}>
                                        Be First In Line for The Update!
                                    </h3>
                                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                        <div className="relative flex-grow">
                                            <FiTerminal className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.primary.replace('bg-', 'text-')}/70 text-lg`} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your_alias@dev.null"
                                                required
                                                className={`w-full p-3 pl-10 ${theme.text}/5 border ${theme.text}/15 rounded-lg focus:ring-2 focus:ring-${primaryBaseColor} focus:border-transparent outline-none shadow-sm text-sm placeholder-${theme.text.replace('text-', '')}/40 ${theme.text} transition-colors duration-300 focus:${theme.text}/10`}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className={`btn px-6 py-3 text-base font-medium rounded-lg bg-gradient-to-r ${theme.primary.replace('bg-', 'from-')} ${theme.secondary.replace('bg-', 'to-')} border-none hover:${theme.primary.replace('bg-', 'from-')}/90 hover:${theme.secondary.replace('bg-', 'to-')}/90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center group ${theme.buttonText}`}
                                        >
                                            <FiSend className="mr-2 transition-transform duration-300 group-hover:rotate-45" /> Notify Me
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <style jsx global>{`
                /* Ensure body/html have height for min-h-screen on root div to work with flex-col if needed */
                /* html, body, #root { height: 100%; } */

                @keyframes float-slow {
                    0% { transform: translateY(0px) rotate(0deg) scale(1); }
                    50% { transform: translateY(-25px) rotate(3deg) scale(1.05); }
                    100% { transform: translateY(0px) rotate(0deg) scale(1); }
                }
                @keyframes float-slow-reverse {
                    0% { transform: translateY(0px) rotate(0deg) scale(1); }
                    50% { transform: translateY(25px) rotate(-3deg) scale(1.05); }
                    100% { transform: translateY(0px) rotate(0deg) scale(1); }
                }
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-float-slow-reverse { animation: float-slow-reverse 9s ease-in-out infinite; }
                
                @keyframes spin-slow { to { transform: rotate(360deg); } }
                .animate-spin-slow { animation: spin-slow 15s linear infinite; }

                @keyframes ping-slow {
                    75%, 100% { transform: scale(1.2); opacity: 0; }
                }
                .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }

                @keyframes blob {
                    0% { transform: scale(1) translate(0px, 0px); }
                    33% { transform: scale(1.1) translate(30px, -50px); }
                    66% { transform: scale(0.9) translate(-20px, 20px); }
                    100% { transform: scale(1) translate(0px, 0px); }
                }
                .animate-blob { animation: blob 15s infinite ease-in-out; }

                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.6s ease-out forwards; }

                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }

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