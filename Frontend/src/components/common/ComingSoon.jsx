import React, { useState, useEffect } from 'react';
import Header from './Header'; // Your existing Header
import Footer from './Footer'; // Your existing Footer
import { FiTerminal, FiClock, FiSend, FiCpu, FiZap, FiSettings } from 'react-icons/fi';

// IMPORTANT: Adjust these values if your Header/Footer are fixed/sticky
const HEADER_HEIGHT_APPROX = '80px'; // e.g., '4rem', '64px', etc. Set to '0px' if header is not fixed/sticky.
const FOOTER_HEIGHT_APPROX = '60px'; // e.g., '3rem', '50px', etc. Set to '0px' if footer is not fixed/sticky.

const ComingSoonPage = () => {
    const [email, setEmail] = useState('');
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isLaunched, setIsLaunched] = useState(false);

    const launchDate = new Date('2024-12-31T23:59:59').getTime();

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
            <span className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-secondary tracking-wider">
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-xs sm:text-sm text-white/60 uppercase tracking-wider mt-1">{label}</span>
        </div>
    );

    const projectStartTime = new Date(launchDate - (90 * 24 * 60 * 60 * 1000)).getTime();
    const totalDuration = launchDate - projectStartTime;
    const elapsedDuration = new Date().getTime() - projectStartTime;
    const progressPercentage = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100)) : 0;

    return (
        <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1672009190560-12e7bade8d09?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center text-white flex flex-col relative">
            {/* Header is rendered here. If it's fixed/sticky, its z-index will matter. */}
            <div className='mb-10'>
                <Header />
            </div>

            {/* Animated Blobs - Deep Background */}
            <div className="absolute inset-0 -z-20 overflow-hidden"> {/* Parent for blobs to contain them and set z-index context */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary rounded-full opacity-5 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-secondary rounded-full opacity-5 animate-blob animation-delay-4000"></div>
                <div className="absolute top-1/3 left-1/3 w-56 h-56 bg-accent rounded-full opacity-5 animate-blob"></div>
            </div>

            {/* Decorative floating code elements - Mid Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden"> {/* Parent for code snippets */}
                <div className="absolute top-1/4 left-10 text-primary/10 text-6xl opacity-30 animate-float-slow hidden lg:block">
                    {'{}'}
                </div>
                <div className="absolute bottom-1/4 right-10 text-secondary/10 text-5xl opacity-30 animate-float-slow-reverse hidden lg:block">
                    {'</>'}
                </div>
            </div>

            {/* Main Content Area - On Top */}
            <main
                className="flex-grow flex flex-col items-center justify-center px-4 py-12 sm:py-16 relative z-10 overflow-hidden"
                style={{
                    paddingTop: HEADER_HEIGHT_APPROX, // Adjust if header is fixed/sticky
                    paddingBottom: FOOTER_HEIGHT_APPROX, // Adjust if footer is fixed/sticky
                }}
            >
                <div className="w-full max-w-3xl" style={{ perspective: '1200px' }}>
                    <div
                        className="bg-white/5 backdrop-blur-2xl p-6 sm:p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl transform transition-all duration-700 ease-out hover:shadow-primary/20 overflow-hidden"
                    // Optional static tilt for 3D effect
                    // style={{ transform: 'rotateX(2deg) rotateY(-1deg)'}}
                    >
                        <div className="text-center relative">
                            <FiSettings className="mx-auto text-5xl md:text-6xl text-primary mb-4 animate-spin-slow opacity-80" />

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 animate-fade-in-down">
                                <span className="block">Code Systems</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                    Initializing...
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg md:text-xl text-white/70 mb-8 animate-fade-in-down animation-delay-100">
                                Our developers are compiling something truly epic.
                                Get ready for the next level of CodeCrack!
                            </p>

                            {isLaunched ? (
                                <div className="my-8 p-6 bg-black/40 rounded-xl border border-primary/30 shadow-xl animate-fade-in-up">
                                    <FiZap className="mx-auto text-5xl text-green-400 mb-3" />
                                    <h2 className="text-3xl font-bold text-green-400">We Are Live!</h2>
                                    <p className="text-white/80 mt-2">The wait is over. Explore the new CodeCrack now!</p>
                                </div>
                            ) : (
                                <div className="my-6 sm:my-8 p-4 sm:p-6 bg-black/20 rounded-xl border border-white/10 shadow-inner animate-fade-in-up animation-delay-200">
                                    <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-3 sm:mb-4 flex items-center justify-center">
                                        <FiClock className="mr-2 animate-ping-slow opacity-75" /> Launch ETA
                                    </h2>
                                    <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-4">
                                        <CountdownSegment value={timeLeft.days} label="Days" />
                                        <CountdownSegment value={timeLeft.hours} label="Hours" />
                                        <CountdownSegment value={timeLeft.minutes} label="Mins" />
                                        <CountdownSegment value={timeLeft.seconds} label="Secs" />
                                    </div>
                                    <div className="mt-4 sm:mt-6 w-full bg-white/10 rounded-full h-2.5 sm:h-3 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-linear"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-white/50 mt-2 text-right">System Build: {progressPercentage.toFixed(0)}% Complete</p>
                                </div>
                            )}

                            {!isLaunched && (
                                <div className="mt-8 sm:mt-10 animate-fade-in-up animation-delay-300">
                                    <h3 className="text-lg sm:text-xl font-semibold text-white/90 mb-3">
                                        Be First In Line for The Update!
                                    </h3>
                                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                        <div className="relative flex-grow">
                                            <FiTerminal className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/70 text-lg" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your_alias@dev.null"
                                                required
                                                className="w-full p-3 pl-10 bg-white/5 border border-white/15 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm text-sm placeholder-white/40 text-white transition-colors duration-300 focus:bg-white/10"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-6 py-3 text-base font-medium rounded-lg bg-gradient-to-r from-primary to-secondary border-none hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
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

            {/* Footer is rendered here. If it's fixed/sticky, its z-index will matter. */}
            <Footer />

            {/* Global styles for animations (if not in tailwind.config.js or global.css) */}
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