import React, { useEffect, useRef } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme hook

// Default theme for fallback (should match your main app default theme)
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

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    appTheme: propAppTheme // Accept appTheme as a prop
}) => {
    const modalRef = useRef(null);

    // Get theme from context, merge with default and prop (if provided)
    const { theme: appThemeFromContext } = useTheme();
    // Prioritize propAppTheme if passed, otherwise use context theme
    const appTheme = { ...defaultAppTheme, ...(propAppTheme || appThemeFromContext) };

    // Effect for handling the 'Escape' key to close the modal
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Effect for trapping focus within the modal for accessibility
    useEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        firstElement?.focus();
        modalRef.current.addEventListener('keydown', handleTabKey);

        return () => {
            modalRef.current?.removeEventListener('keydown', handleTabKey);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Helper for themed button styles
    // IMPORTANT: Adjusted the gradient on confirm button to use actual theme colors, not just errorColor
    const getConfirmButtonClasses = () =>
        `px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
        ${appTheme.errorColor.replace('text-', 'bg-')} ${appTheme.buttonText}`; // Use errorColor as solid background for confirm

    const getCancelButtonClasses = () =>
        `px-6 py-3 rounded-lg font-semibold border ${appTheme.border} ${appTheme.cardText} hover:${appTheme.cardBg}/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`;


    return (
        // The modal overlay with a fade-in animation
        <div
            // Fix 1: Make overlay bg-black stronger
            className={`fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* The modal panel with a scale-up animation */}
            <div
                ref={modalRef}
                // Fix 2: Remove transparency from cardBg or reduce it significantly
                // Use a solid color or much higher opacity for the actual modal background
                className={`${appTheme.cardBg} rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border ${appTheme.border}/20 animate-scale-up`}
            >
                <div className="flex items-start">
                    {/* Icon section (themed) */}
                    <div
                        // Fix 3: Make icon background stronger
                        className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${appTheme.errorColor.replace('text-', 'bg-')}/30 sm:mx-0 sm:h-10 sm:w-10`}> {/* Adjusted to /30 for slight transparency but still visible */}
                        <FaExclamationTriangle className={`h-6 w-6 ${appTheme.errorColor}`} aria-hidden="true" />
                    </div>
                    {/* Text content section (themed) */}
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className={`text-xl font-bold ${appTheme.text} mb-2`} id="modal-title">
                            {title}
                        </h3>
                        <div className={`${appTheme.cardText} text-sm`}>
                            {children}
                        </div>
                    </div>
                </div>

                {/* Action Buttons (themed) */}
                <div className="mt-6 sm:mt-8 sm:flex sm:flex-row-reverse gap-3">
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={getConfirmButtonClasses()}
                    >
                        {isLoading ? (
                            <span className={`w-5 h-5 border-2 border-${appTheme.buttonText.replace('text-', '')}/50 border-t-${appTheme.buttonText.replace('text-', '')} rounded-full animate-spin`} />
                        ) : (
                            confirmText
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className={`${getCancelButtonClasses()} mt-3 sm:mt-0`}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;