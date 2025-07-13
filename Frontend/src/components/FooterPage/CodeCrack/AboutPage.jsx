import React from 'react';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import { FiTarget, FiCode, FiUsers, FiAward, FiChevronRight, FiEye, FiZap, FiStar, FiGitBranch } from 'react-icons/fi'; // Added more icons
import { FaUsersCog, FaBullseye, FaLightbulb, FaTools } from 'react-icons/fa'; // Added more icons
import { useTheme } from '../../../context/ThemeContext'; // Import useTheme

// Default theme for fallback
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

const AboutPage = () => {
    // Get theme from context
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    // Helper for primary gradient (for text and progress bar)
    const getPrimaryGradientClasses = () => `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')}`;
    const getPrimaryHoverShadowClass = () => `hover:shadow-${appTheme.primary.split('-')[1]}-500/30`;


    const teamMembers = [
        { name: 'Mostakin Mondal', role: 'Founder & Lead Administrator', description: "As the visionary behind CodeMasti, Mostakin drives the platform's strategic direction and maintains the core technical infrastructure. His expertise ensures a smooth and secure experience for all users, and he oversees all administrative functions.", avatar: 'https://lh3.googleusercontent.com/a/ACg8ocJmr8450ANDLe6pBxVwtq0AA8rFpBZ8DvEt1RdGwTVpIRPW8gE=s96-c' }
        // If you add more team members later, change the 'Meet the Founder' heading back to 'Meet the Team'
        // and adjust the outer div to use grid classes (e.g., 'grid grid-cols-1 sm:grid-cols-2 ...')
    ];

    return (
        <div className={`min-h-screen ${appTheme.background} bg-[url('https://images.unsplash.com/photo-1672009190560-12e7bade8d09?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center bg-blend-overlay ${appTheme.background}/70 ${appTheme.text}`}>
            <div className='mb-10'>
                <Header />
            </div>

            <main className="py-20">
                {/* Hero Section */}
                <div className="text-center max-w-4xl mx-auto px-4">
                    <h1 className={`text-5xl font-extrabold ${appTheme.text} sm:text-6xl animate-fade-in-down`}>
                        <span className={`text-transparent bg-clip-text ${getPrimaryGradientClasses()}`}>
                            CodeMasti:
                        </span>
                        <span> Sharpening the World's Coders</span>
                    </h1>
                    <p className={`mt-6 text-xl ${appTheme.cardText} animate-fade-in-down animate-delay-100`}>
                        We are a passionate team dedicated to building the best platform for developers to hone their skills, prepare for interviews, and connect with a global community.
                    </p>
                </div>

                {/* Mission Section */}
                <div className="max-w-5xl mx-auto mt-20 px-4">
                    <div className={`${appTheme.cardBg}/5 backdrop-blur-lg rounded-xl border ${appTheme.border}/20 p-12 text-center shadow-lg`}>
                        <FiTarget className={`${appTheme.highlight} text-5xl mx-auto mb-4`} />
                        <h2 className={`text-3xl font-bold ${appTheme.text} mb-4`}>Our Mission</h2>
                        <p className={`text-lg ${appTheme.cardText}`}>
                            Our mission is to create a comprehensive and accessible ecosystem for learning, practice, and competition. We believe that anyone with a passion for coding should have the tools to succeed and reach their full potential, regardless of their background.
                        </p>
                    </div>
                </div>

                {/* Our Values Section (New) */}
                <div className="max-w-7xl mx-auto mt-20 px-4">
                    <h2 className={`text-4xl font-bold ${appTheme.text} text-center mb-12`}>Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className={`${appTheme.cardBg}/5 backdrop-blur-lg p-8 rounded-xl border ${appTheme.border}/20 text-center hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-lg`}>
                            <FaLightbulb className={`${appTheme.highlightSecondary} text-4xl mx-auto mb-4`} />
                            <h3 className={`text-2xl font-semibold ${appTheme.text} mb-2`}>Innovation</h3>
                            <p className={`${appTheme.cardText}`}>Constantly evolving with new features and learning methodologies to keep you ahead.</p>
                        </div>
                        <div className={`${appTheme.cardBg}/5 backdrop-blur-lg p-8 rounded-xl border ${appTheme.border}/20 text-center hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-lg`}>
                            <FiUsers className={`${appTheme.highlightTertiary} text-4xl mx-auto mb-4`} />
                            <h3 className={`text-2xl font-semibold ${appTheme.text} mb-2`}>Community</h3>
                            <p className={`${appTheme.cardText}`}>Fostering a supportive and collaborative environment where every coder can thrive.</p>
                        </div>
                        <div className={`${appTheme.cardBg}/5 backdrop-blur-lg p-8 rounded-xl border ${appTheme.border}/20 text-center hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-lg`}>
                            <FiZap className={`${appTheme.highlight} text-4xl mx-auto mb-4`} />
                            <h3 className={`text-2xl font-semibold ${appTheme.text} mb-2`}>Excellence</h3>
                            <p className={`${appTheme.cardText}`}>Committed to providing high-quality content and a seamless user experience.</p>
                        </div>
                        <div className={`${appTheme.cardBg}/5 backdrop-blur-lg p-8 rounded-xl border ${appTheme.border}/20 text-center hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-lg`}>
                            <FaTools className={`${appTheme.highlightSecondary} text-4xl mx-auto mb-4`} />
                            <h3 className={`text-2xl font-semibold ${appTheme.text} mb-2`}>Accessibility</h3>
                            <p className={`${appTheme.cardText}`}>Making world-class coding education available to everyone, everywhere.</p>
                        </div>
                    </div>
                </div>

                {/* Our Vision Section (New) */}
                <div className="max-w-5xl mx-auto mt-20 px-4">
                    <div className={`${appTheme.cardBg}/5 backdrop-blur-lg rounded-xl border ${appTheme.border}/20 p-12 text-center shadow-lg`}>
                        <FiEye className={`${appTheme.highlight} text-5xl mx-auto mb-4`} />
                        <h2 className={`text-3xl font-bold ${appTheme.text} mb-4`}>Our Vision for the Future</h2>
                        <p className={`text-lg ${appTheme.cardText}`}>
                            We envision a world where talented individuals can easily bridge the gap between learning to code and landing their dream job. CodeMasti will be at the forefront, continually integrating cutting-edge technologies and pedagogies to make coding mastery achievable for all.
                        </p>
                    </div>
                </div>

                {/* Features Section */}
                <div className="max-w-7xl mx-auto mt-20 px-4">
                    <h2 className={`text-4xl font-bold ${appTheme.text} text-center mb-12`}>What We Offer</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className={`${appTheme.cardBg}/5 backdrop-blur-lg p-8 rounded-xl border ${appTheme.border}/20 text-center hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-lg`}>
                            <FiCode className={`${appTheme.highlight} text-4xl mx-auto mb-4`} />
                            <h3 className={`text-2xl font-semibold ${appTheme.text} mb-2`}>Vast Problem Library</h3>
                            <p className={`${appTheme.cardText}`}>Access thousands of problems curated from real-world interviews at top tech companies, spanning all major topics and difficulty levels.</p>
                        </div>
                        <div className={`${appTheme.cardBg}/5 backdrop-blur-lg p-8 rounded-xl border ${appTheme.border}/20 text-center hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-lg`}>
                            <FiAward className={`${appTheme.highlight} text-4xl mx-auto mb-4`} />
                            <h3 className="text-2xl font-semibold mb-2">Live Contests</h3>
                            <p className={`${appTheme.cardText}`}>Compete in regular contests to benchmark your skills against others, improve your speed, and earn recognition in the community.</p>
                        </div>
                        <div className={`${appTheme.cardBg}/5 backdrop-blur-lg p-8 rounded-xl border ${appTheme.border}/20 text-center hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-lg`}>
                            <FiUsers className={`${appTheme.highlight} text-4xl mx-auto mb-4`} />
                            <h3 className="text-2xl font-semibold mb-2">Thriving Community</h3>
                            <p className={`${appTheme.cardText}`}>Join discussions, share solutions, and learn from millions of other developers in our active community forums.</p>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="max-w-7xl mx-auto mt-20 px-4">
                    <h2 className={`text-4xl font-bold ${appTheme.text} text-center mb-12`}>Meet the Founder</h2> {/* Changed heading */}
                    <div className="flex items-center justify-center"> {/* Changed from grid to flex and added justify-center */}
                        {teamMembers.map(member => (
                            <div key={member.name} className={`flex flex-col ${appTheme.cardBg}/5 backdrop-blur-lg p-8 rounded-xl border ${appTheme.border}/20 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-2 max-w-md`}> {/* Added max-w-md for single card */}
                                <div className="relative mx-auto mb-4">
                                    <img src={member.avatar} alt={member.name} className={`w-32 h-32 object-cover rounded-full mx-auto border-4 ${appTheme.highlight.replace('text-', 'border-')}`} /> {/* Themed border */}
                                    <FaUsersCog className={`absolute bottom-0 right-0 ${appTheme.highlight} text-3xl p-1 rounded-full ${appTheme.cardBg}`} /> {/* Admin icon */}
                                </div>
                                <h3 className={`text-xl font-bold ${appTheme.text}`}>{member.name}</h3>
                                <p className={`${appTheme.highlight} mb-2`}>{member.role}</p> {/* Role highlight */}
                                <p className={`${appTheme.cardText} text-sm`}>{member.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Join Us Section (New) */}
                <div className="max-w-5xl mx-auto mt-20 px-4">
                    <div className={`${appTheme.cardBg}/5 backdrop-blur-lg rounded-xl border ${appTheme.border}/20 p-12 text-center shadow-lg`}>
                        <h2 className={`text-3xl font-bold ${appTheme.text} mb-4`}>Join Our Journey</h2>
                        <p className={`text-lg ${appTheme.cardText} mb-6`}>
                            Be a part of a dynamic community that’s shaping the future of competitive programming and technical interview preparation.
                        </p>
                        <a
                            href="/register"
                            className={`px-8 py-4 rounded-lg ${getPrimaryGradientClasses()} ${appTheme.buttonText} font-medium hover:shadow-lg ${getPrimaryHoverShadowClass()} transition-all transform hover:scale-[1.02] inline-flex items-center justify-center`}
                        >
                            Start Your Coding Journey <FiChevronRight className="ml-2" />
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;