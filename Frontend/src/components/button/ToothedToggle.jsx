import React, { useState } from 'react';

const ToothedToggle = ({ isOn, toggle }) => {
    return (
        <div className="relative flex items-center justify-center">
            <input
                type="checkbox"
                id="btn"
                className="hidden"
                checked={isOn}
                onChange={toggle}
            />
            <label htmlFor="btn" className="relative w-24 h-8 bg-gray-600 rounded-full shadow-md cursor-pointer">
                <span className="absolute inset-0 rounded-full overflow-hidden bg-gray-900 shadow-inner">
                    <span className={`absolute w-full h-4 top-[-0.5rem] left-[-10%] flex justify-evenly opacity-85 transition-all duration-500 ${isOn ? 'rotate-[-5deg] origin-[78%_100%]' : 'rotate-[5deg] origin-[22%_100%]'}`}>
                        {[...Array(10)].map((_, i) => (
                            <span key={i} className="w-3 h-4 bg-gradient-to-b from-gray-200/80 to-gray-300 rounded-b-sm shadow-sm"></span>
                        ))}
                    </span>
                    <span className={`absolute w-full h-4 bottom-[-0.5rem] left-[-10%] flex justify-evenly opacity-85 transition-all duration-500 ${isOn ? 'rotate-[5deg] origin-[78%_100%]' : 'rotate-[-5deg] origin-[22%_100%]'}`}>
                        {[...Array(10)].map((_, i) => (
                            <span key={i} className="w-3 h-4 bg-gradient-to-t from-gray-200/80 to-gray-300 rounded-t-sm shadow-sm"></span>
                        ))}
                    </span>
                </span>
                <span className={`absolute w-7 h-7 rounded-full transition-all duration-500 ${isOn ? 'left-[calc(100%-1.75rem)] bg-green-500' : 'left-1 bg-red-500'}`}>
                    <span className="absolute bg-gray-700 w-1 h-5 rounded-full shadow-md left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                    <span className={`absolute inset-0 rounded-full ${isOn ? 'bg-gradient-to-br from-green-400/80 to-green-600' : 'bg-gradient-to-br from-red-400/80 to-red-600'}`}></span>
                </span>
            </label>
            <div className="absolute -top-8 left-0 right-0 flex justify-between px-4">
                <span className={`w-4 h-4 rounded-full ${isOn ? 'bg-gray-800 shadow-inner' : 'bg-red-500 shadow-lg shadow-red-500/30'}`}></span>
                <span className={`w-4 h-4 rounded-full ${isOn ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-gray-800 shadow-inner'}`}></span>
            </div>
        </div>
    );
};

export default ToothedToggle;