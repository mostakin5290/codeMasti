// src/components/CodeField/DailyChallengeSuccessModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext'; // Adjust path as necessary

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

const DailyChallengeSuccessModal = ({ streak, onClose }) => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...appThemeFromContext };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                onClick={onClose} // Close on backdrop click
            >
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={`${appTheme.cardBg} rounded-xl shadow-2xl border ${appTheme.border}/50 w-full max-w-md p-6 relative`}
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className={`absolute top-3 right-3 p-2 rounded-full ${appTheme.background} ${appTheme.text} hover:opacity-80 transition-opacity`}
                        aria-label="Close"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <FaCheckCircle className={`text-6xl ${appTheme.successColor} mb-4`} />
                        <h2 className={`text-3xl font-bold ${appTheme.text} mb-2`}>Challenge Completed!</h2>
                        <p className={`text-lg ${appTheme.cardText} mb-6`}>You've successfully solved today's Daily Challenge.</p>

                        <div className={`p-4 rounded-xl ${appTheme.background} border ${appTheme.border}/50 w-full flex items-center justify-center space-x-3`}>
                            <FaFire className="text-orange-500 text-4xl" />
                            <div>
                                <p className={`text-xl font-bold ${appTheme.text}`}>Current Streak: {streak} {streak === 1 ? 'Day' : 'Days'}</p>
                                <p className={`text-sm ${appTheme.cardText} mt-1`}>Keep up the great work!</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className={`mt-6 w-full py-3 ${appTheme.buttonPrimary} ${appTheme.buttonText} rounded-lg font-semibold hover:${appTheme.buttonPrimaryHover} transition-colors shadow-md`}
                        >
                            Continue
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DailyChallengeSuccessModal;