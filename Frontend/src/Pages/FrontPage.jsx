import React, { useState } from 'react';
import { FiSearch, FiTrendingUp, FiCode, FiAward, FiUsers, FiStar, FiZap, FiChevronRight } from 'react-icons/fi';
import SplashCursor from '../components/animation/SplashCursor'


const FrontPage = () => {
    const [disAnimation, setDisAnimation] = useState(true)
    const toggleAnimation = () => {
        setDisAnimation(!disAnimation);
    };
    const stats = [
        { value: '1500+', label: 'Problems', icon: <FiCode className="text-2xl" /> },
        { value: '5M+', label: 'Users', icon: <FiUsers className="text-2xl" /> },
        { value: '300+', label: 'Contests', icon: <FiAward className="text-2xl" /> },
        { value: '95%', label: 'Satisfaction', icon: <FiTrendingUp className="text-2xl" /> },
    ];

    const features = [
        {
            title: "Interactive Coding",
            description: "Write, run, and test code directly in our powerful browser IDE with real-time feedback.",
            icon: <FiCode className="text-primary" />
        },
        {
            title: "Company Questions",
            description: "Practice with actual interview questions from top tech companies like FAANG.",
            icon: <FiAward className="text-primary" />
        },
        {
            title: "Detailed Solutions",
            description: "Access comprehensive explanations and optimal solutions for every problem.",
            icon: <FiSearch className="text-primary" />
        },
        {
            title: "Progress Tracking",
            description: "Monitor your improvement with detailed statistics and personalized reports.",
            icon: <FiTrendingUp className="text-primary" />
        },
        {
            title: "Community Support",
            description: "Join discussions, get help, and learn from our community of developers.",
            icon: <FiUsers className="text-primary" />
        },
        {
            title: "Premium Content",
            description: "Unlock exclusive problems, video solutions, and interview strategies.",
            icon: <FiStar className="text-primary" />
        }
    ];

    const social = [
        {
            "name": 'YouTube',
            "link":'https://www.youtube.com/@CodeMasti-9'
        },
        {
            "name": 'GitHub',
            "link":"https://github.com/codemasti9/codeMasti"
        },
        {
            "name": 'LinkedIn',
            "link":"https://www.linkedin.com/company/107868597/admin/dashboard"
        },


    ]

    return (
        <div className="min-h-screen bg-gray-900 bg-[url('https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center bg-blend-overlay bg-gray-900/90">
            {/* Animated gradient background */}
            <div className="fixed inset-0 overflow-hidden opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '15s' }}></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent animate-pulse" style={{ animationDuration: '20s', animationDelay: '5s' }}></div>
            </div>
            <div className=' relative z-10'>
                {disAnimation && (<SplashCursor
                    SIM_RESOLUTION={48}             // Slightly higher for smoother fluid detail
                    DYE_RESOLUTION={384}            // Better color blending
                    CAPTURE_RESOLUTION={384}        // Better rendering while still fast
                    DENSITY_DISSIPATION={7.5}       // Smooth fade-out
                    VELOCITY_DISSIPATION={1.6}      // Smooth velocity decay
                    PRESSURE={0.05}                 // Soft fluid pressure
                    PRESSURE_ITERATIONS={12}        // Enough for smooth pressure but still fast
                    CURL={2.5}                      // Gentle swirls
                    SPLAT_RADIUS={0.18}             // Medium ripple size
                    SPLAT_FORCE={3000}              // Moderate force for a visible but calm splash
                    SHADING={true}                  // Keep shading for depth and realism
                    COLOR_UPDATE_SPEED={4}          // Medium speed color flow
                    BACK_COLOR={{ r: 0, g: 0, b: 0 }} // Black background (or customize)
                    TRANSPARENT={false}             // Solid background for better render performance
                />
                )}
            </div>
            <button
                onClick={toggleAnimation}
                className="fixed bottom-8 right-8 z-50 px-4 py-2 rounded-full 
                bg-gradient-to-r from-primary to-secondary
                text-white font-medium shadow-lg 
                hover:shadow-primary/30 transition-all duration-300
                transform hover:scale-105 flex items-center gap-2
                backdrop-blur-sm border border-white/20"
            >
                <FiZap className={`transition-transform duration-300 ${disAnimation ? 'rotate-0' : 'rotate-180'}`} />
                {disAnimation ? 'Animation Off' : 'Animation On'}
            </button>
            {/* Floating particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-gradient-to-br from-primary/20 to-secondary/20"
                        style={{
                            width: `${Math.random() * 8 + 2}px`,
                            height: `${Math.random() * 8 + 2}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `float ${Math.random() * 15 + 10}s linear infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: Math.random() * 0.5 + 0.1
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    {/* <button onClick={() => setDisAnimation(!disAnimation)} className='btn'>this is button</button> */}

                    <header className="flex justify-between items-center mb-14">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                <img src="https://res.cloudinary.com/dcmzfn5oq/image/upload/v1752819939/1000021846-removebg-preview_1_1_fn0ql9.png" alt="logo" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">
                                Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Masti</span>
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a href="/login" className="font-medium text-white/90 hover:text-white transition-colors hidden md:block px-4 py-2 rounded-lg hover:bg-white/5">
                                Login
                            </a>
                            <a
                                href="/signup"
                                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-[1.02]"
                            >
                                Sign Up
                            </a>
                        </div>
                    </header>

                    {/* Hero Section */}
                    <section className="mb-28">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="lg:w-1/2">
                                <div className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm backdrop-blur-sm">
                                    <FiTrendingUp className="mr-2" />
                                    Trusted by 5M+ developers worldwide
                                </div>
                                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                                    Master Coding Interviews with <span className="  bg-clip-text bg-gradient-to-r from-primary to-secondary">CodeMasti</span>
                                </h1>
                                <p className="text-xl text-white/80 mb-8">
                                    The most effective platform to prepare for technical interviews. Practice with real company questions and join our thriving developer community.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a
                                        href="/login"
                                        className="px-7 py-3.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center transform hover:scale-[1.02]"
                                    >
                                        Start Practicing <FiChevronRight className="ml-1.5" />
                                    </a>
                                    <a
                                        href="/help"
                                        className="px-7 py-3.5 rounded-lg bg-white/5 border border-white/20 text-white font-medium hover:bg-white/10 transition-all flex items-center justify-center transform hover:scale-[1.02]"
                                    >
                                        Learn More
                                    </a>
                                </div>
                            </div>
                            <div className="lg:w-1/2">
                                <div className="grid grid-cols-2 gap-6">
                                    {stats.map((stat, index) => (
                                        <div
                                            key={index}
                                            className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-primary/20"
                                        >
                                            <div className="text-primary mb-3">{stat.icon}</div>
                                            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                                            <p className="text-white/70">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Companies Section */}
                    <section className="mb-28">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl font-bold text-white mb-4">Practice with Real Interview Questions From</h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-primary to-secondary mx-auto mb-6 rounded-full"></div>
                            <p className="text-white/80 max-w-2xl mx-auto">
                                Our question bank includes actual problems asked by top tech companies during interviews
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-center">
                            {['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Netflix'].map((company, index) => (
                                <div key={index} className="flex justify-center">
                                    <div className="text-white text-2xl font-bold opacity-80 hover:opacity-100 transition-opacity hover:text-primary">
                                        {company}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="mb-28">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl font-bold text-white mb-4">Why Developers Choose CodeMasti</h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-primary to-secondary mx-auto mb-6 rounded-full"></div>
                            <p className="text-white/80 max-w-2xl mx-auto">
                                Everything you need to ace your technical interviews in one place
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-primary/20 group"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                                        {React.cloneElement(feature.icon, { className: `${feature.icon.props.className} group-hover:scale-110 transition-transform` })}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                                    <p className="text-white/70 group-hover:text-white/90 transition-colors">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                    {/* CTA Section */}
                    <section className="bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center relative overflow-hidden mb-28">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full filter blur-xl animate-pulse"></div>
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/10 rounded-full filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold text-white mb-6">Ready to Mukti the Code?</h2>
                            <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg">
                                Join millions of developers who have transformed their careers with CodeMasti.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/signup"
                                    className="px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-[1.02] flex items-center justify-center"
                                >
                                    Get Started for Free
                                </a>
                                <a
                                    href="/premium"
                                    className="px-8 py-4 rounded-lg bg-white/5 border border-white/20 text-white font-medium hover:bg-white/10 transition-all transform hover:scale-[1.02] flex items-center justify-center"
                                >
                                    Explore Premium <FiStar className="ml-2 text-yellow-400" />
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="mt-20 pt-12 border-t border-white/10">
                        <div className="grid md:grid-cols-5 gap-8 mb-12">
                            <div className="md:col-span-2">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                        <img src="https://res.cloudinary.com/dcmzfn5oq/image/upload/v1752819939/1000021846-removebg-preview_1_1_fn0ql9.png" alt="logo" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">CodeMasti</h3>
                                </div>
                                <p className="text-white/70 mb-4">
                                    The ultimate platform for technical interview preparation.
                                </p>
                                <div className="flex space-x-4">
                                    {social.map((social, index) => (
                                        <a key={index} href={social.link} className="text-white/70 hover:text-white transition-colors">
                                            {social.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-4 text-lg">Product</h4>
                                <ul className="space-y-3">
                                    <li><a href="/login" className="text-white/70 hover:text-white transition-colors hover:underline">Problems</a></li>
                                    <li><a href="/login" className="text-white/70 hover:text-white transition-colors hover:underline">Premium</a></li>
                                    <li><a href="/login" className="text-white/70 hover:text-white transition-colors hover:underline">Contests</a></li>
                                    <li><a href="/login" className="text-white/70 hover:text-white transition-colors hover:underline">Discuss</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-4 text-lg">Company</h4>
                                <ul className="space-y-3">
                                    <li><a href="/about" className="text-white/70 hover:text-white transition-colors hover:underline">About</a></li>
                                    <li><a href="/help/faq" className="text-white/70 hover:text-white transition-colors hover:underline">Careers</a></li>
                                    <li><a href="/contact" className="text-white/70 hover:text-white transition-colors hover:underline">Contact</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-4 text-lg">Resources</h4>
                                <ul className="space-y-3">
                                    <li><a href="/help" className="text-white/70 hover:text-white transition-colors hover:underline">Learning Paths</a></li>
                                    <li><a href="/help" className="text-white/70 hover:text-white transition-colors hover:underline">Interview Prep</a></li>
                                    <li><a href="/help" className="text-white/70 hover:text-white transition-colors hover:underline">Webinars</a></li>
                                    <li><a href="/help" className="text-white/70 hover:text-white transition-colors hover:underline">Help Center</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-white/60 text-sm">
                            <div className="mb-4 md:mb-0">
                                © {new Date().getFullYear()} CodeMasti. All rights reserved.
                            </div>
                            <div className="flex space-x-6">
                                <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                                <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                                <a href="/cookies" className="hover:text-white transition-colors">Cookies</a>
                            </div>
                        </div>
                    </footer>
                </div>

                {/* Global styles for animations */}
                <style jsx global>{`
                @keyframes float {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `}</style>
            </div>
            {/* <ToothedToggle isOn={isOn} toggle={toggle} /> */}
        </div>
    );
};

export default FrontPage;