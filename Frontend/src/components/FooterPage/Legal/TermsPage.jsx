import React from 'react';
import LegalPageLayout from './LegalPageLayout';
import { useTheme } from '../../../context/ThemeContext';

const defaultAppTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400', warningColor: 'text-amber-400',
    errorColor: 'text-red-400', infoColor: 'text-blue-400',
};

const TermsPage = () => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    const getHeadingColor = () => appTheme.highlight;

    return (
        <LegalPageLayout title="Terms and Conditions">
            <div className={`${appTheme.cardText} space-y-6`}>
                <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>General Terms</h2>
                <p>
                    By using our platform or making any purchase, you agree to our terms of service. Content may change without notice. We don’t guarantee completeness, accuracy, or performance of any information.
                </p>

                <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>User Conduct</h2>
                <p>
                    You agree not to misuse the platform, submit plagiarized content, or disrupt services. We reserve the right to suspend your account if terms are violated.
                </p>

                <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>Intellectual Property</h2>
                <p>
                    All materials (design, text, images) are owned or licensed by us. Unauthorized use may lead to legal action.
                </p>

                <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>External Links</h2>
                <p>
                    Our site may include links for informational purposes. Linking to our site requires prior written permission.
                </p>

                <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>Governing Law</h2>
                <p>
                    Any disputes will be governed by the laws of India.
                </p>

                <h2 className={`text-2xl font-bold mb-4 ${getHeadingColor()}`}>Cancellation & Refund</h2>
                <p className="italic text-sm mb-2">Last updated on Jul 5 2025</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Cancellation requests accepted within 2-3 days of order unless shipped.</li>
                    <li>No cancellations for perishable items. Refunds possible for quality issues.</li>
                    <li>Report damaged/defective items within 2-3 days of receipt.</li>
                    <li>Refunds (if approved) are processed within 3-4 business days.</li>
                </ul>
                <p className="mt-4">
                    For full policy, visit: <br />
                    <a 
                        href="https://merchant.razorpay.com/policy/QpG6qfwRHONpPX/refund" 
                        className={`${appTheme.highlight} hover:underline`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        https://merchant.razorpay.com/policy/QpG6qfwRHONpPX/refund
                    </a>
                </p>
            </div>
        </LegalPageLayout>
    );
};

export default TermsPage;
