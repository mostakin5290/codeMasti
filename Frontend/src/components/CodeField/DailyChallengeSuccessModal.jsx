// src/components/CodeField/DailyChallengeSuccessModal.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaCheckCircle, FaTimes, FaTrophy, FaStar } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

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

const ConfettiParticle = ({ delay = 0 }) => {
    const colors = ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    return (
        <motion.div
            className={`absolute w-2 h-2 ${randomColor} rounded-full`}
            initial={{ 
                opacity: 0, 
                scale: 0,
                x: Math.random() * 300 - 150,
                y: -20,
                rotate: 0
            }}
            animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1, 0],
                y: [0, 400],
                rotate: [0, 360],
                x: Math.random() * 100 - 50
            }}
            transition={{ 
                duration: 2,
                delay,
                ease: "easeOut"
            }}
        />
    );
};

const FloatingStars = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    initial={{ 
                        opacity: 0,
                        scale: 0,
                        x: Math.random() * 400,
                        y: Math.random() * 300,
                    }}
                    animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        rotate: [0, 180],
                    }}
                    transition={{ 
                        duration: 3,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 2
                    }}
                >
                    <FaStar className="text-yellow-400 text-lg" />
                </motion.div>
            ))}
        </div>
    );
};

const PulsingRing = ({ delay = 0, size = "w-32 h-32" }) => {
    return (
        <motion.div
            className={`absolute ${size} border-2 border-emerald-400/30 rounded-full`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
                scale: [0, 1, 1.5],
                opacity: [0, 0.6, 0]
            }}
            transition={{
                duration: 2,
                delay,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeOut"
            }}
        />
    );
};

const DailyChallengeSuccessModal = ({ streak, onClose }) => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultTheme, ...appThemeFromContext };
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // Start confetti animation after modal appears
        const timer = setTimeout(() => setShowConfetti(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const getStreakBadge = () => {
        if (streak >= 30) return { icon: FaTrophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
        if (streak >= 14) return { icon: FaFire, color: 'text-red-400', bg: 'bg-red-400/10' };
        if (streak >= 7) return { icon: FaFire, color: 'text-orange-400', bg: 'bg-orange-400/10' };
        return { icon: FaFire, color: 'text-orange-500', bg: 'bg-orange-500/10' };
    };

    const badge = getStreakBadge();
    const BadgeIcon = badge.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Floating Stars Background */}
                <FloatingStars />
                
                {/* Confetti */}
                {showConfetti && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <ConfettiParticle key={i} delay={i * 0.1} />
                        ))}
                    </div>
                )}

                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.8, rotateX: -15 }}
                    animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
                    exit={{ y: 100, opacity: 0, scale: 0.8, rotateX: -15 }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20,
                        duration: 0.6
                    }}
                    className={`${appTheme.cardBg} rounded-2xl shadow-2xl border ${appTheme.border}/30 w-full max-w-md relative overflow-hidden backdrop-blur-sm`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10" />
                    
                    {/* Close Button */}
                    <motion.button
                        onClick={onClose}
                        className={`absolute top-4 right-4 p-2 rounded-full ${appTheme.background}/80 ${appTheme.text} hover:${appTheme.background} transition-all duration-200 backdrop-blur-sm z-10`}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Close"
                    >
                        <FaTimes className="w-4 h-4" />
                    </motion.button>

                    <div className="relative p-8 flex flex-col items-center text-center">
                        {/* Success Icon with Pulsing Rings */}
                        <div className="relative flex items-center justify-center mb-6">
                            <PulsingRing delay={0} size="w-24 h-24" />
                            <PulsingRing delay={0.5} size="w-32 h-32" />
                            <PulsingRing delay={1} size="w-40 h-40" />
                            
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 200, 
                                    damping: 10,
                                    delay: 0.3
                                }}
                                className="relative z-10"
                            >
                                <FaCheckCircle className={`text-7xl ${appTheme.successColor} drop-shadow-lg`} />
                            </motion.div>
                        </div>

                        {/* Title with Stagger Animation */}
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className={`text-3xl font-bold ${appTheme.text} mb-2`}
                        >
                            Challenge Completed!
                        </motion.h2>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className={`text-lg ${appTheme.cardText} mb-8`}
                        >
                            Outstanding work! You've crushed today's challenge.
                        </motion.p>

                        {/* Enhanced Streak Card */}
                        <motion.div
                            initial={{ y: 30, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ delay: 1, duration: 0.6, type: "spring" }}
                            className={`relative p-6 rounded-xl ${appTheme.background} border ${appTheme.border}/50 w-full overflow-hidden`}
                        >
                            {/* Animated Background Gradient */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10"
                                animate={{ 
                                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                                }}
                                transition={{ 
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                            
                            <div className="relative flex items-center justify-center space-x-4">
                                <motion.div
                                    className={`p-3 rounded-full ${badge.bg} border-2 border-current`}
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    animate={{ 
                                        boxShadow: [
                                            "0 0 0 rgba(255,255,255,0)",
                                            "0 0 20px rgba(255,255,255,0.3)",
                                            "0 0 0 rgba(255,255,255,0)"
                                        ]
                                    }}
                                    transition={{ 
                                        boxShadow: { duration: 2, repeat: Infinity }
                                    }}
                                >
                                    <BadgeIcon className={`text-3xl ${badge.color}`} />
                                </motion.div>
                                
                                <div>
                                    <motion.p
                                        className={`text-2xl font-bold ${appTheme.text}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                                    >
                                        {streak} {streak === 1 ? 'Day' : 'Days'} Streak!
                                    </motion.p>
                                    <motion.p
                                        className={`text-sm ${appTheme.cardText} mt-1`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.4 }}
                                    >
                                        {streak >= 30 ? "Legendary coder! 🏆" :
                                         streak >= 14 ? "You're on fire! 🔥" :
                                         streak >= 7 ? "Building momentum! 💪" :
                                         "Keep it up! 🚀"}
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Enhanced Continue Button */}
                        <motion.button
                            onClick={onClose}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.6, duration: 0.5 }}
                            whileHover={{ 
                                scale: 1.05,
                                boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            className={`mt-8 w-full py-4 px-6 ${appTheme.buttonPrimary} ${appTheme.buttonText} rounded-xl font-semibold hover:${appTheme.buttonPrimaryHover} transition-all duration-200 shadow-lg relative overflow-hidden group`}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.6 }}
                            />
                            <span className="relative z-10">Continue Coding</span>
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DailyChallengeSuccessModal;