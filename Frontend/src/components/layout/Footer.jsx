import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme hook

// Default theme to prevent errors if theme context fails or is incomplete
const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
};

const Footer = () => {
    // Get theme from context, merge with default to ensure all properties exist
    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };

    // Helper to extract base color from a Tailwind class (e.g., 'bg-blue-500' -> 'blue')

    return (
        <footer className={`${theme.cardBg}/30 backdrop-blur-lg border-t ${theme.border}/50`}>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className={`text-sm font-semibold ${theme.text} tracking-wider uppercase`}>
                            CodeMasti
                        </h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link
                                    to="/about"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/#"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/#"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className={`text-sm font-semibold ${theme.text} tracking-wider uppercase`}>
                            Product
                        </h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link
                                    to="/problems"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    Problems
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contests"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    Contests
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/discuss"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    Discuss
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/#"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    Interview Prep
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className={`text-sm font-semibold ${theme.text} tracking-wider uppercase`}>
                            Support
                        </h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link
                                    to="/help"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/help/faq"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className={`text-sm font-semibold ${theme.text} tracking-wider uppercase`}>
                            Legal
                        </h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link
                                    to="/privacy"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/cookies"
                                    className={`text-base ${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}
                                >
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className={`mt-12 border-t ${theme.border}/50 pt-8 flex flex-col md:flex-row justify-between items-center`}>
                    <p className={`text-base ${theme.cardText}`}>
                        © {new Date().getFullYear()} CodeMasti. All rights reserved. {/* Changed name for consistency */}
                    </p>
                    <div className="mt-4 md:mt-0 flex space-x-6">
                        <a href="/#" className={`${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}>
                            <span className="sr-only">Twitter</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                        </a>
                        <a href="/#" className={`${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}>
                            <span className="sr-only">GitHub</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <a href="/#" className={`${theme.cardText} hover:${theme.highlight} transition-colors duration-200`}>
                            <span className="sr-only">Discord</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" >
                                <path d="M20.317,4.369a2.032,2.032,0,0,0-1.88-1.465,11.432,11.432,0,0,0-4.546.625,12.564,12.564,0,0,0-5.782,0,11.45,11.45,0,0,0-4.546-.625,2.032,2.032,0,0,0-1.88,1.465,19.3,19.3,0,0,0-1.6,9.256,18.06,18.06,0,0,0,5.022,5.553,2.01,2.01,0,0,0,1.474.646,1,1,0,0,0,.6-.211,10.15,10.15,0,0,0,2.23-1.8,1.13,1.13,0,0,0-.142-1.692,8.1,8.1,0,0,1-1.35-1.428,1,1,0,0,1,.121-1.428,12.92,12.92,0,0,0,9.156,0,1,1,0,0,1,.121,1.428,8.1,8.1,0,0,1-1.35,1.428,1.13,1.13,0,0,0-.142,1.692,10.15,10.15,0,0,0,2.23,1.8,1,1,0,0,0,.6.211,2.01,2.01,0,0,0,1.474-.646A18.06,18.06,0,0,0,21.916,13.625,19.3,19.3,0,0,0,20.317,4.369ZM8.43,14.652a1.643,1.643,0,0,1-1.672-1.616,1.643,1.643,0,0,1,1.672-1.616,1.625,1.625,0,0,1,0,3.232Zm7.14,0a1.625,1.625,0,0,1,0-3.232,1.643,1.643,0,0,1,1.672,1.616A1.643,1.643,0,0,1,15.57,14.652Z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;