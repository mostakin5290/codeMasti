import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { FaCrown, FaCheckCircle, FaSpinner, FaRupeeSign } from 'react-icons/fa';
import { useSelector } from 'react-redux'; // Import useSelector

// Default theme for consistency (unchanged)
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

// --- Razorpay SDK Loader --- (unchanged)
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const SubscribePage = () => {
    const navigate = useNavigate();
    const { planType } = useParams();
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };
    const { user: currentUser } = useSelector(state => state.auth); // Get currentUser from Redux

    const [loadingRazorpay, setLoadingRazorpay] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);

    const pricingPlans = {
        monthly: { name: 'Monthly Premium', amount: 1.99, description: 'Perfect for short-term access and flexible learning.', features: [
            'Access to all Premium Problems', 'Unlimited Solutions & Explanations',
            'Exclusive Interview Roadmaps', 'Priority Community Support', 'Ad-free Experience',
        ]},
        yearly: { name: 'Yearly Premium', amount: 21.49, description: 'Best value for long-term commitment and maximum savings.', features: [
            'All Monthly Premium features', 'Save over 30% annually',
            'Early access to new features', 'Personalized Progress Reviews', 'Exclusive Beta Access',
        ]},
    };

    useEffect(() => {
        const loadScript = async () => {
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                toast.error('Razorpay SDK failed to load. Please check your internet connection.');
            }
            setLoadingRazorpay(false);
        };
        loadScript();

        if (planType && pricingPlans[planType]) {
            setCurrentPlan(pricingPlans[planType]);
        } else {
            toast.error('Invalid subscription plan selected. Redirecting to Premium page.');
            navigate('/premium');
        }
    }, [planType, navigate]);

    const handleSubscribe = async () => {
        if (loadingRazorpay || isProcessing || !currentPlan) {
            return;
        }

        // Basic check: user must be logged in to subscribe
        if (!currentUser) {
            toast.error('Please log in to subscribe.');
            navigate('/login');
            return;
        }

        setIsProcessing(true);
        toast.info('Initiating payment. Please wait...');

        try {
            const response = await axiosClient.post('/payment/create-order', {
                amount: currentPlan.amount,
                plan: planType
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to create payment order.');
            }

            const { orderId, amount, currency, receipt, key_id } = response.data;

            const options = {
                key: key_id,
                amount: amount,
                currency: currency,
                name: "CodeCrack Premium Subscription",
                description: currentPlan.name,
                order_id: orderId,
                receipt: receipt,
                handler: function (response) {
                    // This is for frontend confirmation. Backend webhook handles actual activation.
                    toast.success('Payment successful! Your subscription is being activated.');
                    navigate('/home?status=premium-activated');
                },
                prefill: {
                    name: currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}` : "CodeCrack User",
                    email: currentUser.email || "user@example.com",
                    contact: currentUser.phone || "" // Add user's phone number if available in your user model
                },
                notes: {
                    problem: "Premium Subscription" // This note will be visible in Razorpay dashboard
                },
                theme: {
                    color: appTheme.primary.replace('bg-', '#') 
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response) {
                console.error("Razorpay Payment Failed:", response.error);
                toast.error(`Payment Failed: ${response.error.description || 'An error occurred during payment.'}`);
                setIsProcessing(false);
            });

            rzp.open();

        } catch (error) {
            console.error('Error initiating payment:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate payment. Please try again.');
        } finally {
            // This 'finally' block ensures processing state is reset if an error occurs *before* Razorpay pop-up opens
            // Or if Razorpay.open() fails for some reason.
            // The actual payment.failed handler within Razorpay's options will also reset it.
            // Consider if a setTimeout is needed here if rzp.open() itself might cause issues but not immediately call on.payment.failed
            // For now, it's generally fine.
            if (!window.Razorpay) { // Only reset if Razorpay pop-up didn't open (e.g., SDK not loaded)
                setIsProcessing(false);
            }
        }
    };

    const getPrimaryGradient = () => `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')}`;
    const getPrimaryGradientHover = () => `hover:${appTheme.primaryHover.replace('bg-', 'from-')} hover:${appTheme.secondaryHover.replace('bg-', 'to-')}`;

    if (!currentPlan || loadingRazorpay) {
        return (
            <div className={`min-h-screen ${appTheme.background} ${appTheme.text} flex flex-col justify-center items-center`}>
                <FaSpinner className={`text-4xl animate-spin ${appTheme.highlight}`} />
                <p className="mt-4">Loading subscription details...</p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${appTheme.background} ${appTheme.text} font-sans overflow-x-hidden`}>
            <Header />
            <ToastContainer
                theme={appTheme.background.includes('dark') || appTheme.background.includes('black') || appTheme.background.includes('zinc-9') ? "dark" : "light"}
                position="top-right"
                toastStyle={{
                    background: `${appTheme.cardBg}/10`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${appTheme.border}/20`,
                    color: appTheme.text
                }}
            />

            <main className="py-20 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <section className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className={`relative ${appTheme.cardBg} rounded-xl shadow-lg border ${appTheme.border} p-8 flex flex-col items-center`}>
                        <FaCrown className={`text-6xl ${appTheme.highlight} mb-4`} />
                        <h2 className={`text-3xl font-bold mb-2 ${appTheme.text}`}>{currentPlan.name}</h2>
                        <div className="flex items-end mb-4">
                            <FaRupeeSign className={`text-3xl ${appTheme.text}`} />
                            <span className={`text-5xl font-extrabold ${appTheme.text}`}>{currentPlan.amount}</span>
                            <span className={`text-xl ${appTheme.cardText} ml-1`}>
                                {planType === 'monthly' ? '/month' : '/year'}
                            </span>
                        </div>
                        <p className={`mb-6 ${appTheme.cardText}`}>{currentPlan.description}</p>
                        
                        <ul className="space-y-3 mb-8 text-left w-full">
                            {currentPlan.features.map((feature, i) => (
                                <li key={i} className={`flex items-center gap-3 ${appTheme.cardText}`}>
                                    <FaCheckCircle className={`${appTheme.successColor} flex-shrink-0 text-lg`} />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={handleSubscribe}
                            disabled={isProcessing || loadingRazorpay}
                            className={`inline-flex items-center justify-center w-full px-8 py-3 rounded-lg ${getPrimaryGradient()} ${getPrimaryGradientHover()} ${appTheme.buttonText} font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isProcessing ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" /> Processing...
                                </>
                            ) : (
                                `Pay ₹${currentPlan.amount} ${planType === 'monthly' ? 'Monthly' : 'Yearly'}`
                            )}
                        </button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default SubscribePage;