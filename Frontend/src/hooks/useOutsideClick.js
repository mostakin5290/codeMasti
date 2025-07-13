// src/hooks/useOutsideClick.js
import { useEffect, useRef } from 'react';

/**
 * A custom hook that triggers a callback when a click is detected outside of the referenced element.
 * @param {Function} callback The function to call on an outside click.
 * @returns {React.RefObject} A ref object to be attached to the element to monitor.
 */
export const useOutsideClick = (callback) => {
    const ref = useRef();

    useEffect(() => {
        const handleClick = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        // Use mousedown to catch the click before it can trigger other events
        document.addEventListener('mousedown', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, [ref, callback]); // Re-run effect only if callback changes

    return ref;
};