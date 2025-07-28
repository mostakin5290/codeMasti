import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = ({ theme }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [cursorVariant, setCursorVariant] = useState('default');

    useEffect(() => {
        const mouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', mouseMove);

        // Hide default cursor
        document.body.style.cursor = 'none';

        return () => {
            window.removeEventListener('mousemove', mouseMove);
            document.body.style.cursor = 'auto'; // Restore default cursor on unmount
        };
    }, []);

    const variants = {
        default: {
            x: mousePosition.x - 8,
            y: mousePosition.y - 8,
            backgroundColor: 'rgba(var(--highlight-rgb), 0.8)', // Use theme highlight
            width: 16,
            height: 16,
            mixBlendMode: 'normal',
            transition: { type: 'spring', stiffness: 500, damping: 25 },
        },
        pointer: {
            x: mousePosition.x - 16,
            y: mousePosition.y - 16,
            backgroundColor: 'rgba(var(--highlight-secondary-rgb), 0.9)', // Use secondary highlight
            width: 32,
            height: 32,
            mixBlendMode: 'difference', // Blends nicely with background
            transition: { type: 'spring', stiffness: 500, damping: 25 },
        },
        text: {
            x: mousePosition.x - 24,
            y: mousePosition.y - 24,
            backgroundColor: 'rgba(var(--highlight-tertiary-rgb), 0.7)',
            width: 48,
            height: 48,
            mixBlendMode: 'difference',
            transition: { type: 'spring', stiffness: 500, damping: 25 },
        },
    };

    const textEnter = () => setCursorVariant('text');
    const textLeave = () => setCursorVariant('default');
    const pointerEnter = () => setCursorVariant('pointer');
    const pointerLeave = () => setCursorVariant('default');

    useEffect(() => {
        const textElements = document.querySelectorAll('h1, h2, h3, p, a, button, input, textarea, .cursor-text');
        const pointerElements = document.querySelectorAll('a, button, input, textarea, .cursor-pointer');

        textElements.forEach(el => el.addEventListener('mouseenter', textEnter));
        textElements.forEach(el => el.addEventListener('mouseleave', textLeave));
        pointerElements.forEach(el => el.addEventListener('mouseenter', pointerEnter));
        pointerElements.forEach(el => el.addEventListener('mouseleave', pointerLeave));

        return () => {
            textElements.forEach(el => el.removeEventListener('mouseenter', textEnter));
            textElements.forEach(el => el.removeEventListener('mouseleave', textLeave));
            pointerElements.forEach(el => el.removeEventListener('mouseenter', pointerEnter));
            pointerElements.forEach(el => el.removeEventListener('mouseleave', pointerLeave));
        };
    }, [cursorVariant]); // Re-run effect if cursorVariant changes to update event listeners

    // Helper to get RGB from Tailwind classes
    const getRgbFromTailwindColor = (colorClass, defaultRgb = '255 255 255') => {
        if (!colorClass) return defaultRgb;
        if (colorClass.includes('gray-900')) return '17 24 39';
        if (colorClass.includes('gray-800')) return '31 41 55';
        if (colorClass.includes('cyan-400')) return '34 211 238';
        if (colorClass.includes('cyan-500')) return '14 165 233';
        if (colorClass.includes('blue-400')) return '96 165 250';
        if (colorClass.includes('purple-400')) return '192 132 252';
        if (colorClass.includes('emerald-400')) return '52 211 153';
        if (colorClass.includes('amber-400')) return '251 191 36';
        if (colorClass.includes('red-400')) return '248 113 113';
        if (colorClass.includes('indigo-600')) return '79 70 229';
        if (colorClass.includes('indigo-700')) return '67 56 202';
        return defaultRgb;
    };

    const highlightRgb = getRgbFromTailwindColor(theme.highlight, '34 211 238');
    const highlightSecondaryRgb = getRgbFromTailwindColor(theme.highlightSecondary, '96 165 250');
    const highlightTertiaryRgb = getRgbFromTailwindColor(theme.highlightTertiary, '192 132 252');

    return (
        <motion.div
            className="custom-cursor fixed top-0 left-0 rounded-full pointer-events-none z-[9999] opacity-0" // Initially hidden, framer-motion will animate opacity
            variants={variants}
            animate={cursorVariant}
            style={{
                '--highlight-rgb': highlightRgb,
                '--highlight-secondary-rgb': highlightSecondaryRgb,
                '--highlight-tertiary-rgb': highlightTertiaryRgb,
                opacity: mousePosition.x !== 0 || mousePosition.y !== 0 ? 1 : 0 // Show cursor once mouse moves
            }}
        />
    );
};

export default CustomCursor;