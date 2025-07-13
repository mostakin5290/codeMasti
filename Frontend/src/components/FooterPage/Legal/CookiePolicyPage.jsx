import React from 'react';
import LegalPageLayout from './LegalPageLayout'; // Adjust path if necessary
import { useTheme } from '../../../context/ThemeContext'; // Import useTheme

// Default theme for fallback (optional here, as LegalPageLayout provides it)
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

const CookiePolicyPage = () => {
    // Get theme from context
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    // Helper for heading text color
    const getHeadingColor = () => appTheme.highlight; // Consistent with TermsPage

    return (
        <LegalPageLayout title="Cookie Policy">
            <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>What Are Cookies?</h2>
            <p className={`mb-4 ${appTheme.cardText}`}>
                As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies.
            </p>

            <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>How We Use Cookies</h2>
            <p className={`mb-4 ${appTheme.cardText}`}>
                We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.
            </p>
            <ul className={`list-disc list-inside space-y-2 mb-4 ${appTheme.cardText}`}>
                <li>
                    <strong className={`${appTheme.text}`}>Account related cookies:</strong> If you create an account with us then we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out however in some cases they may remain afterwards to remember your site preferences when logged out.
                </li>
                <li>
                    <strong className={`${appTheme.text}`}>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.
                </li>
            </ul>

            <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>Disabling Cookies</h2>
            <p className={`mb-4 ${appTheme.cardText}`}>
                You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site.
            </p>
        </LegalPageLayout>
    );
};

export default CookiePolicyPage;