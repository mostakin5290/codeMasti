import React from 'react';

import { useTheme } from '../../../context/ThemeContext';
import { FiHelpCircle, FiSearch } from 'react-icons/fi'; // Icons for hero/search
import Footer from '../../layout/Footer';
import Header from '../../layout/Header';

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

const FAQsPage = () => {
    // Get theme from context
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    // Helper functions for dynamic classes
    const getPrimaryGradientClasses = () => `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')}`;
    const getHeadingColor = () => appTheme.highlight;
    const getSubHeadingColor = () => appTheme.highlightSecondary;

    // FAQs data
    const faqs = [
        { question: 'What is CodeMasti?', answer: 'CodeMasti is a premier online platform designed to help developers enhance their coding skills, prepare for technical interviews, and compete in programming contests. We offer a vast library of problems, detailed solutions, and a thriving community.' },
        { question: 'How do I create an account?', answer: 'You can create a free account by clicking on the "Sign Up" button in the top right corner of the page and following the registration steps. It\'s quick and easy!' },
        { question: 'Is CodeMasti free to use?', answer: 'Yes, CodeMasti offers a substantial amount of free content including many coding problems, community discussions, and basic contest participation. We also offer a Premium subscription for exclusive content, advanced features, and more in-depth preparation materials.' },
        { question: 'What programming languages are supported?', answer: 'We support a wide range of popular programming languages including C++, Java, Python, JavaScript, C#, Go, Rust, Ruby, and more. You can choose your preferred language in the code editor.' },
        { question: 'How do I solve a problem on CodeMasti?', answer: 'Navigate to the Problems section, select a problem, read its description and constraints, write your code in our integrated IDE, and then run tests or submit your solution. You\'ll receive instant feedback on your code.' },
        { question: 'What if my code doesn\'t pass the tests?', answer: 'Our system provides detailed feedback, including which test cases failed and the expected output versus your actual output. You can use this information to debug your code, review hints, or look at community solutions.' },
        { question: 'How do I join a coding contest?', answer: 'Visit the Contests page to see upcoming competitions. Simply register for a contest before its start time. Once it begins, you can access the problems and start coding.' },
        { question: 'What are the rules for contests?', answer: 'Contest rules vary slightly but generally involve solving problems within a time limit. Submissions are ranked based on correctness and speed. Specific rules for each contest are provided on its detail page.' },
        { question: 'I forgot my password. How can I reset it?', answer: 'On the Login page, click on the "Forgot Password?" link. Enter your registered email address, and we\'ll send you instructions to reset your password.' },
        { question: 'My page is not loading correctly. What should I do?', answer: 'First, try clearing your browser\'s cache and cookies or using a different browser. If the issue persists, please contact our support team through the "Contact Us" link in the footer with details about the problem and your browser information.' },
    ];

    // Group FAQs by category for better readability (optional, but good practice)
    const faqCategories = {
        'General Questions': faqs.slice(0, 3), // First 3
        'Problems & Coding': faqs.slice(3, 6), // Next 3
        'Contests & Competitions': faqs.slice(6, 8), // Next 2
        'Account & Technical Support': faqs.slice(8), // Remaining
    };

    return (
        <div className={`min-h-screen flex flex-col ${appTheme.background} ${appTheme.text}`}>
            <div className='mb-10'>
                <Header/>
            </div>

            <main className="flex-grow py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Title & Intro */}
                <section className="text-center max-w-4xl mx-auto mb-16">
                    <FiHelpCircle className={`${appTheme.highlight} text-6xl mx-auto mb-4`} />
                    <h1 className={`text-5xl font-extrabold ${appTheme.text} sm:text-6xl animate-fade-in-down`}>
                        <span className={`text-transparent bg-clip-text ${getPrimaryGradientClasses()}`}>
                            Frequently Asked Questions
                        </span>
                    </h1>
                    <p className={`mt-6 text-xl ${appTheme.cardText} animate-fade-in-down animate-delay-100`}>
                        Find answers to common questions about CodeMasti, our services, and how you can make the most of your coding journey with us.
                    </p>
                </section>

                {/* FAQs Content */}
                <section className={`bg-white/5 backdrop-blur-lg rounded-xl border ${appTheme.border}/20 p-8 shadow-lg`}>
                    <div className="space-y-10"> {/* Spacing between main categories */}
                        {Object.entries(faqCategories).map(([category, faqsInCategory], categoryIndex) => (
                            <div key={categoryIndex}>
                                <h2 className={`text-3xl font-bold mb-6 ${getHeadingColor()}`}>{category}</h2>
                                <div className="space-y-6"> {/* Spacing between individual FAQs */}
                                    {faqsInCategory.map((faq, faqIndex) => (
                                        <div key={faqIndex}>
                                            <h3 className={`text-xl font-semibold mb-2 ${getSubHeadingColor()}`}>{faq.question}</h3>
                                            <p className={`${appTheme.cardText}`}>{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer/>
        </div>
    );
};

export default FAQsPage;