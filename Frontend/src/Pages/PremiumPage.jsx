import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { FiCheckCircle, FiStar, FiZap, FiAward, FiBookOpen, FiClock, FiUsers } from 'react-icons/fi';
import { FaCrown, FaQuestionCircle } from 'react-icons/fa';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Default theme for the app context (unchanged)
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

const PremiumPage = () => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };

    const [monthlyPrice, setMonthlyPrice] = useState(null);
    const [yearlyPrice, setYearlyPrice] = useState(null);
    const [loadingPrices, setLoadingPrices] = useState(true);
    const [errorFetchingPrices, setErrorFetchingPrices] = useState(false);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                setLoadingPrices(true);
                setErrorFetchingPrices(false);
                const response = await axiosClient.get('/admin/premium-plan');
                console.log(response.data)
                setMonthlyPrice(response.data.monthlyPlanPrice);
                setYearlyPrice(response.data.yearlyPlanPrice);
            } catch (error) {
                console.error("Failed to fetch premium prices:", error);
                setErrorFetchingPrices(true);
                setMonthlyPrice(1.99);
                setYearlyPrice(21.49);
            } finally {
                setLoadingPrices(false);
            }
        };

        fetchPrices();
    }, []); // Empty dependency array means this runs once on component mount

    // Hardcoded features for the plans (as requested, these are not dynamic from DB)
    const monthlyFeatures = [
        'Access to all Premium Problems',
        'Unlimited Solutions & Explanations',
        '50+ Themes Access',
        'Priority Community Support',
        'Ad-free Experience',
    ];

    const yearlyFeatures = [
        'All Monthly Premium features',
        'Save over 10% annually',
        'Early access to new features',
        'Personalized Progress Reviews',
        'Exclusive Beta Access',
    ];

    // Dynamically construct pricingPlans using fetched prices
    const pricingPlans = [
        {
            name: 'Monthly Premium',
            // Display price or 'Loading...'/'Error' while fetching/if error
            price: monthlyPrice !== null ? monthlyPrice.toFixed(2) : '...',
            period: '/month',
            description: 'Perfect for short-term access and flexible learning.',
            features: monthlyFeatures,
            highlight: false,
            ctaText: 'Start Monthly',
            ctaLink: '/subscribe/monthly',
        },
        {
            name: 'Yearly Premium',
            price: yearlyPrice !== null ? yearlyPrice.toFixed(2) : '...',
            period: '/year',
            description: 'Best value for long-term commitment and maximum savings.',
            features: yearlyFeatures,
            highlight: true,
            ctaText: 'Go Yearly & Save',
            ctaLink: '/subscribe/yearly',
        },
    ];

    const premiumFeatures = [
        { icon: FiStar, title: 'Exclusive Problems', description: 'Unlock a curated library of advanced problems from top companies.' },
        { icon: FiBookOpen, title: 'Detailed Editorial Solutions', description: 'Dive deep into optimal solutions with step-by-step breakdowns and multiple approaches.' },
        { icon: FiAward, title: 'Premium Contests', description: 'Participate in members-only contests with higher stakes and exclusive prizes.' },
        { icon: FiClock, title: 'Unlimited Practice', description: 'No limits on submissions, test cases, or problem views.' },
        { icon: FiUsers, title: 'Priority Support', description: 'Get faster responses from our community and dedicated support team.' },
        { icon: FiZap, title: 'Ad-Free Experience', description: 'Enjoy an uninterrupted and focused coding journey.' },
    ];

    const faqs = [
        {
            question: 'What types of problems are exclusive to Premium?',
            answer: 'Premium problems include the latest interview questions from FAANG and other top tech companies, as well as advanced data structure and algorithm challenges, and system design questions.'
        },
        {
            question: 'Can I cancel my subscription anytime?',
            answer: 'Yes, you can cancel your subscription at any time. Your premium access will continue until the end of your current billing period.'
        },
        {
            question: 'Is there a free trial for Premium?',
            answer: 'Currently, we do not offer a free trial for Premium. However, our free tier provides a substantial number of problems and features to get you started.'
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, MasterCard, American Express), UPI, NetBanking, and Wallets through Razorpay.'
        }
    ];

    // Display loading spinner while prices are being fetched
    if (loadingPrices) {
        return (
            <div className={`min-h-screen ${appTheme.background}`}>
                <Header />
                <LoadingSpinner message="Loading premium prices..." appTheme={appTheme} />
                <Footer />
            </div>
        );
    }

    // Display generic error if fetching failed and fallback prices couldn't be used
    if (errorFetchingPrices && (monthlyPrice === null || yearlyPrice === null)) {
         return (
            <div className={`min-h-screen ${appTheme.background} ${appTheme.text} flex flex-col justify-center items-center`}>
                <Header />
                <div className="text-center p-8">
                    <h2 className="text-3xl font-bold mb-4">Error Loading Prices</h2>
                    <p className="text-xl">
                        Could not load premium prices. Displaying default values. Please refresh or try again later.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className={`mt-6 px-6 py-3 rounded ${appTheme.primary} ${appTheme.buttonText} font-medium`}
                    >
                        Retry
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${appTheme.background} ${appTheme.text} font-sans overflow-x-hidden`}>
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 text-center">
                    <div className="absolute inset-0 z-0">
                        <div className={`absolute inset-0 bg-gradient-to-t ${appTheme.gradientFrom} via-transparent ${appTheme.gradientTo}`}></div>
                        <div className={`absolute top-1/2 left-1/4 w-32 h-32 rounded-full ${appTheme.primary.replace('bg-', 'bg-')}/20 blur-xl animate-float-and-rotate`}></div>
                        <div className={`absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full ${appTheme.highlight.replace('text-', 'bg-')}/20 blur-xl animate-float-and-rotate animation-delay-2000`}></div>
                    </div>
                    <div className="max-w-4xl mx-auto px-4 relative z-10">
                        <h1 className={`text-5xl md:text-6xl font-extrabold mb-4 ${appTheme.text}`}>
                            Unlock Your Full <span className={appTheme.highlight}>Coding Potential</span>
                        </h1>
                        <p className={`text-xl md:text-2xl ${appTheme.cardText} max-w-3xl mx-auto mb-8`}>
                            Go beyond basics with CodeCrack Premium. Access exclusive content, advanced tools, and accelerate your journey to coding mastery.
                        </p>
                        <Link
                            to={pricingPlans[0].ctaLink}
                            className={`inline-flex items-center justify-center px-8 py-4 ${appTheme.primary} rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-2xl ${appTheme.buttonText} transform hover:scale-105`}
                        >
                            Get Premium Now <FaCrown className="ml-2" />
                        </Link>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className={`py-20 ${appTheme.cardBg}/50 backdrop-blur-md`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className={`text-3xl md:text-4xl font-bold ${appTheme.text}`}>
                                Simple, Transparent <span className={appTheme.highlightSecondary}>Pricing</span>
                            </h2>
                            <p className={`mt-4 max-w-2xl mx-auto ${appTheme.cardText}`}>
                                Choose the plan that best fits your learning style and budget.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                            {pricingPlans.map((plan, index) => (
                                <div
                                    key={index}
                                    className={`relative ${appTheme.cardBg} rounded-xl shadow-lg border ${appTheme.border} p-8 flex flex-col transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${plan.highlight ? `border-${appTheme.primary.split('-')[1]}-500/50 transform scale-[1.03] shadow-2xl` : ''}`}
                                >
                                    {plan.highlight && (
                                        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full ${appTheme.primary} ${appTheme.buttonText} text-xs font-semibold uppercase tracking-wider shadow-md`}>
                                            Most Popular
                                        </div>
                                    )}
                                    <h3 className={`text-2xl font-bold mb-4 ${plan.highlight ? appTheme.highlight : appTheme.text}`}>{plan.name}</h3>
                                    <div className="flex items-end mb-4">
                                        <span className={`text-5xl font-extrabold ${appTheme.text}`}>₹{plan.price}</span>
                                        <span className={`text-xl ${appTheme.cardText} ml-1`}>{plan.period}</span>
                                    </div>
                                    <p className={`mb-6 ${appTheme.cardText}`}>{plan.description}</p>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className={`flex items-center gap-3 ${appTheme.cardText}`}>
                                                <FiCheckCircle className={`${appTheme.successColor} flex-shrink-0 text-lg`} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        to={plan.ctaLink}
                                        className={`mt-auto inline-flex items-center justify-center w-full px-8 py-3 rounded-lg ${appTheme.primary} ${appTheme.buttonText} font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                                    >
                                        {plan.ctaText}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Key Premium Features Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className={`text-3xl md:text-4xl font-bold ${appTheme.text}`}>
                                Why <span className={appTheme.highlight}>Go Premium?</span>
                            </h2>
                            <p className={`mt-4 max-w-2xl mx-auto ${appTheme.cardText}`}>
                                Discover the powerful features that will accelerate your coding journey.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {premiumFeatures.map((feature, index) => (
                                <div key={index} className={`${appTheme.cardBg} p-8 rounded-xl border ${appTheme.border} text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
                                    <div className={`w-16 h-16 mx-auto ${appTheme.iconBg} rounded-full flex items-center justify-center ${appTheme.highlight} mb-6`}>
                                        {React.createElement(feature.icon, { className: 'w-8 h-8' })}
                                    </div>
                                    <h3 className={`text-xl font-semibold ${appTheme.text} mb-2`}>{feature.title}</h3>
                                    <p className={`${appTheme.cardText}`}>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className={`py-20 ${appTheme.cardBg}/50 backdrop-blur-md`}>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className={`text-3xl md:text-4xl font-bold ${appTheme.text}`}>
                                Frequently Asked <span className={appTheme.highlightTertiary}>Questions</span>
                            </h2>
                            <p className={`mt-4 max-w-2xl mx-auto ${appTheme.cardText}`}>
                                Find answers to the most common questions about our Premium subscription.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <details key={index} className={`bg-white/5 rounded-lg border ${appTheme.border}/20 shadow p-4 ${appTheme.cardText}`}>
                                    <summary className={`flex justify-between items-center cursor-pointer font-semibold ${appTheme.text} text-lg py-2`}>
                                        {faq.question}
                                        <FaQuestionCircle className={`${appTheme.highlightSecondary} flex-shrink-0 ml-2`} />
                                    </summary>
                                    <p className={`mt-2 ${appTheme.cardText} text-base leading-relaxed`}>
                                        {faq.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className={`py-20 text-center`}>
                    <div className="max-w-3xl mx-auto px-4">
                        <h2 className={`text-3xl md:text-4xl font-bold ${appTheme.text} mb-6`}>
                            Ready to <span className={appTheme.highlight}>Elevate</span> Your Skills?
                        </h2>
                        <p className={`text-xl ${appTheme.cardText} max-w-2xl mx-auto mb-8`}>
                            Join thousands of ambitious developers taking their coding to the next level.
                        </p>
                        <Link
                            to={pricingPlans[0].ctaLink}
                            className={`inline-flex items-center justify-center px-10 py-4 ${appTheme.primary} rounded-lg transition-all duration-300 font-semibold text-xl shadow-lg hover:shadow-2xl ${appTheme.buttonText} transform hover:scale-105`}
                        >
                            Choose Your Plan Today
                            <FaCrown className="ml-3 text-2xl" />
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default PremiumPage;