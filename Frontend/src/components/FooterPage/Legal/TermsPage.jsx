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

const TermsPage = () => {
    // Get theme from context (optional, but good practice if child elements need theme)
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    // Helper for heading text color
    const getHeadingColor = () => appTheme.highlight; // Or appTheme.text if you prefer less emphasis

    return (
        <LegalPageLayout title="Terms of Service">
            <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>1. Acceptance of Terms</h2>
            <p className={`mb-4 ${appTheme.cardText}`}>
                By accessing and using CodeMasti ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                In addition, when using this Service's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>

            <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>2. User Conduct and Responsibilities</h2>
            <p className={`mb-4 ${appTheme.cardText}`}>
                You are responsible for all activity that occurs under your account. You agree not to use the Service for any purpose that is illegal or prohibited by these Terms.
            </p>
            <ul className={`list-disc list-inside space-y-2 mb-4 ${appTheme.cardText}`}>
                <li>You agree not to post content that is harassing, defamatory, or obscene.</li>
                <li>You agree not to submit plagiarized solutions during contests or for problem submissions.</li>
                <li>You agree not to disrupt or interfere with the security of, or otherwise abuse, the Service.</li>
            </ul>

            <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>3. Intellectual Property</h2>
            <p className={`mb-4 ${appTheme.cardText}`}>
                The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of CodeMasti and its licensors.
                User-submitted solutions and discussion posts remain the intellectual property of the user, but you grant CodeMasti a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content in connection with the Service.
            </p>

            <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>4. Termination</h2>
            <p className={`mb-4 ${appTheme.cardText}`}>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
        </LegalPageLayout>
    );
};

export default TermsPage;