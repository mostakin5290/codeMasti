// utils/clipboard.js

/**
 * Copies text to the clipboard
 * @param {string} text - The text to copy to clipboard
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export const copyToClipboard = (text) => {
    return new Promise((resolve) => {
        try {
            // Modern clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text)
                    .then(() => resolve(true))
                    .catch(() => {
                        // Fallback for when modern API fails
                        fallbackCopyToClipboard(text) ? resolve(true) : resolve(false);
                    });
            } else {
                // Legacy browser support
                fallbackCopyToClipboard(text) ? resolve(true) : resolve(false);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
            resolve(false);
        }
    });
};

/**
 * Fallback method for copying text to clipboard
 * @param {string} text - The text to copy
 * @returns {boolean} - Returns true if successful, false otherwise
 */
const fallbackCopyToClipboard = (text) => {
    try {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';  // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.select();

        // Try to copy
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);

        return successful;
    } catch (err) {
        console.error('Fallback copy failed: ', err);
        return false;
    }
};