'use client';
import React, { useReducer, useEffect, useCallback, useRef } from 'react';

const rippleReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_RIPPLE':
            return [...state, action.payload].slice(-(action.payload.maxRipples || 30));
        case 'REMOVE_RIPPLE':
            return state.filter((ripple) => ripple.id !== action.payload);
        case 'CLEANUP':
            return [];
        default:
            return state;
    }
};

const RippleCursor = ({
    size = 20,
    minSize = 10,
    maxSize = 40,
    duration = 1000,
    blur = 0,
    color = 'rgba(0, 150, 255, 0.5)',
    opacity = 0.5,
    maxRipples = 30,
    throttleTime = 50,
    scaleOnClick = true,
    clickEffectDuration = 300,
}) => {
    const [ripples, dispatch] = useReducer(rippleReducer, []);
    const lastMoveTime = useRef(0);
    const clickStartTime = useRef(0);
    const isClicking = useRef(false);

    const handleMouseMove = useCallback((e) => {
        const now = Date.now();
        if (now - lastMoveTime.current < throttleTime) return;
        lastMoveTime.current = now;

        const randomSize = Math.random() * (maxSize - minSize) + minSize;
        const ripple = {
            id: `${now}-${Math.random().toString(36).substr(2, 9)}`,
            x: e.clientX - randomSize / 2,
            y: e.clientY - randomSize / 2,
            size: randomSize,
            opacity: opacity,
            maxRipples: maxRipples,
        };

        dispatch({ type: 'ADD_RIPPLE', payload: ripple });

        setTimeout(() => {
            dispatch({ type: 'REMOVE_RIPPLE', payload: ripple.id });
        }, duration);
    }, [duration, maxSize, minSize, opacity, throttleTime, maxRipples]);

    const handleMouseDown = useCallback(() => {
        if (!scaleOnClick) return;
        isClicking.current = true;
        clickStartTime.current = Date.now();
    }, [scaleOnClick]);

    const handleMouseUp = useCallback(() => {
        if (!scaleOnClick) return;
        isClicking.current = false;
    }, [scaleOnClick]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            dispatch({ type: 'CLEANUP' });
        };
    }, [handleMouseMove, handleMouseDown, handleMouseUp]);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
      @keyframes ripple {
        0% {
          transform: scale(0.2);
          opacity: ${opacity};
        }
        70% {
          opacity: ${opacity * 0.7};
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }
    `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, [opacity]);

    return (
        <div className="fixed top-0 left-0 w-screen h-screen pointer-events-none overflow-hidden z-[9999]">
            {ripples.map((ripple) => {
                const clickScale = isClicking.current
                    ? 1 + (1 - (Date.now() - clickStartTime.current) / clickEffectDuration) * 0.5
                    : 1;

                return (
                    <div
                        key={ripple.id}
                        className="absolute rounded-full animate-ripple"
                        style={{
                            left: `${ripple.x}px`,
                            top: `${ripple.y}px`,
                            width: `${ripple.size}px`,
                            height: `${ripple.size}px`,
                            backgroundColor: color,
                            opacity: ripple.opacity,
                            animationDuration: `${duration}ms`,
                            filter: blur ? `blur(${blur}px)` : 'none',
                            transform: `scale(${clickScale})`,
                            transition: isClicking.current
                                ? `transform ${clickEffectDuration}ms ease-out`
                                : 'none',
                            willChange: 'transform, opacity',
                        }}
                    />
                );
            })}
        </div>
    );
};

export default RippleCursor;