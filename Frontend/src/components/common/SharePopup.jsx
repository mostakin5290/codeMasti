import { useState } from 'react';
import {
    FaLink,
    FaWhatsapp,
    FaFacebook,
    FaTwitter,
    FaEnvelope,
    FaCopy,
    FaTimes
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme hook

// Default theme for the app context. This will be merged with actual theme.
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

const SharePopup = ({ url, title, onClose }) => {
    const [copied, setCopied] = useState(false);
    const { theme: appThemeFromContext } = useTheme(); // Get app theme
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) }; // Merge with default

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: <FaWhatsapp size={24} className="text-green-500" />, // Keep branding color
            url: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
        },
        {
            name: 'Facebook',
            icon: <FaFacebook size={24} className="text-blue-600" />, // Keep branding color
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        },
        {
            name: 'Twitter',
            icon: <FaTwitter size={24} className="text-blue-400" />, // Keep branding color
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        },
        {
            name: 'Email',
            icon: <FaEnvelope size={24} className={appTheme.cardText} />, // Use themed gray
            url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`${appTheme.cardBg} rounded-xl p-6 w-full max-w-md border ${appTheme.border} shadow-2xl shadow-${appTheme.primary.split('-')[1]}-500/20`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-xl font-bold ${appTheme.text}`}>Share</h3>
                    <button onClick={onClose} className={`${appTheme.cardText} hover:${appTheme.text}`}>
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`flex-1 ${appTheme.background} rounded-lg p-3 flex items-center`}>
                            <FaLink className={`${appTheme.cardText}/80 mr-2`} />
                            <input
                                type="text"
                                value={url}
                                readOnly
                                className={`bg-transparent ${appTheme.text} flex-1 outline-none`}
                            />
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className={`${appTheme.primary} hover:${appTheme.primaryHover} ${appTheme.buttonText} px-4 py-3 rounded-lg flex items-center gap-2 w-23`}
                        >
                            <FaCopy />
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {shareOptions.map((option) => (
                            <a
                                key={option.name}
                                href={option.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex flex-col items-center ${appTheme.text} hover:${appTheme.highlight} transition-colors`}
                            >
                                {option.icon}
                                <span className="text-xs mt-2">{option.name}</span>
                            </a>
                        ))}
                    </div>
                </div>

                <div className={`border-t ${appTheme.border} pt-4`}>
                    <p className={`${appTheme.cardText} text-sm mb-2`}>Share via</p>
                    <div className="flex gap-2">
                        <button className={`${appTheme.background} hover:${appTheme.background}/80 ${appTheme.text} px-4 py-2 rounded-full text-sm`}>
                            Embed
                        </button>
                        <button className={`${appTheme.background} hover:${appTheme.background}/80 ${appTheme.text} px-4 py-2 rounded-full text-sm`}>
                            Telegram
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharePopup;