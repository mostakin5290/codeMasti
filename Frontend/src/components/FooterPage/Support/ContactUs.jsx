import React, { useState } from 'react';
import Footer from '../../layout/Footer';
import Header from '../../layout/Header';
import { useTheme } from '../../../context/ThemeContext';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageSquare } from 'react-icons/fi';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

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

const ContactUs = () => {
    // Get theme from context
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the form data to your backend
        console.log('Form submitted:', formData);
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
    };

    // Helper functions for dynamic classes
    const getPrimaryGradientClasses = () => `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')}`;
    const getPrimaryHoverShadowClass = () => `hover:shadow-${appTheme.primary.split('-')[1]}-500/30`;
    const getHeadingColor = () => appTheme.highlight;
    const getSubHeadingColor = () => appTheme.highlightSecondary;

    return (
        <div className={`min-h-screen flex flex-col ${appTheme.background} ${appTheme.text}`}>
            <div className='mb-10'>
                <Header />
            </div>

            <main className="flex-grow py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <section className="text-center max-w-4xl mx-auto mb-16">
                    <FiMail className={`${appTheme.highlight} text-6xl mx-auto mb-4`} />
                    <h1 className={`text-5xl font-extrabold ${appTheme.text} sm:text-6xl animate-fade-in-down`}>
                        <span className={` bg-clip-text ${getPrimaryGradientClasses()}`}>
                            Contact Us
                        </span>
                    </h1>
                    <p className={`mt-6 text-xl ${appTheme.cardText} animate-fade-in-down animate-delay-100`}>
                        We're here to help! Reach out to us with any questions, feedback, or support inquiries.
                    </p>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Contact Form */}
                    <div className={`${appTheme.cardBg}/5 backdrop-blur-lg rounded-xl border ${appTheme.border}/20 p-8 shadow-lg`}>
                        <h2 className={`text-3xl font-bold mb-6 ${appTheme.text}`}>Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className={`block text-sm font-medium ${appTheme.cardText} mb-2`}>Your Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent transition-all duration-200`}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className={`block text-sm font-medium ${appTheme.cardText} mb-2`}>Your Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent transition-all duration-200`}
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className={`block text-sm font-medium ${appTheme.cardText} mb-2`}>Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent transition-all duration-200`}
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className={`block text-sm font-medium ${appTheme.cardText} mb-2`}>Your Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent transition-all duration-200 resize-y`}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className={`w-full flex items-center justify-center gap-2 px-8 py-3 rounded-lg ${appTheme.buttonPrimary} ${appTheme.buttonText} font-medium hover:shadow-lg  transition-all transform hover:scale-[1.02]`}
                            >
                                Send Message <FiSend className="ml-2" />
                            </button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div className={`${appTheme.cardBg}/5 backdrop-blur-lg rounded-xl border ${appTheme.border}/20 p-8 shadow-lg text-center`}>
                            <FaEnvelope className={`${appTheme.highlight} text-5xl mx-auto mb-4`} />
                            <h3 className={`text-2xl font-semibold ${appTheme.text} mb-2`}>Email Us</h3>
                            <p className={`${appTheme.cardText}`}>We'll respond to your email as quickly as possible.</p>
                            <p className={`mt-4 text-lg ${appTheme.highlight}`}>
                                <a href="mailto:m.codemasti@gmail.com" className="hover:underline">m.codemasti@gmail.com</a>
                            </p>
                        </div>

                        <div className={`${appTheme.cardBg}/5 backdrop-blur-lg rounded-xl border ${appTheme.border}/20 p-8 shadow-lg text-center`}>
                            <FaPhoneAlt className={`${appTheme.highlightSecondary} text-5xl mx-auto mb-4`} />
                            <h3 className={`text-2xl font-semibold ${appTheme.text} mb-2`}>Call Us</h3>
                            <p className={`${appTheme.cardText}`}>For urgent inquiries, feel free to give us a call.</p>
                            <p className={`mt-4 text-lg ${appTheme.highlightSecondary}`}>
                                <a href="tel:#" className="hover:underline">#</a>
                            </p>
                        </div>

                        <div className={`${appTheme.cardBg}/5 backdrop-blur-lg rounded-xl border ${appTheme.border}/20 p-8 shadow-lg text-center`}>
                            <FaMapMarkerAlt className={`${appTheme.highlightTertiary} text-5xl mx-auto mb-4`} />
                            <h3 className={`text-2xl font-semibold ${appTheme.text} mb-2`}>Our Office</h3>
                            <p className={`${appTheme.cardText}`}>Visit us during business hours by appointment.</p>
                            <p className={`mt-4 text-lg ${appTheme.highlightTertiary}`}>
                                Not Avaliable
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactUs;