import React, { createContext, useState, useContext } from 'react';

const AnimationContext = createContext();

export const AnimationProvider = ({ children }) => {
    const [animationEnabled, setAnimationEnabled] = useState(true);

    const toggleAnimation = () => {
        setAnimationEnabled(prev => !prev);
    };

    return (
        <AnimationContext.Provider value={{ animationEnabled, toggleAnimation }}>
            {children}
        </AnimationContext.Provider>
    );
};

export const useAnimation = () => {
    return useContext(AnimationContext);
};