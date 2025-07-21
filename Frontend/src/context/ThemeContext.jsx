import React, { createContext, useState, useContext, useEffect } from 'react';
import { THEMES } from '../themes';

const ThemeContext = createContext();


export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('app-theme');
            return savedTheme ? JSON.parse(savedTheme) : THEMES[0];
        } catch (error) {
            return THEMES[0];
        }
    });

    // Jab bhi theme badle, use localStorage mein save karein
    useEffect(() => {
        localStorage.setItem('app-theme', JSON.stringify(theme));
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// 3. Custom hook banayein taaki theme ko aasani se use kar sakein
export const useTheme = () => useContext(ThemeContext);