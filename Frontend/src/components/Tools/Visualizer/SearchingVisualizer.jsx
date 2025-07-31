// components/Tools/Visualizer/SearchingVisualizer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaStop, FaRandom, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

const SearchingVisualizer = ({ algorithm, theme, isPlaying, speed, onPlayPause }) => {
    const [array, setArray] = useState([]);
    const [arraySize, setArraySize] = useState(10);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [foundIndex, setFoundIndex] = useState(-1);
    const [searchValue, setSearchValue] = useState(42);
    const [isSearching, setIsSearching] = useState(false);
    const [steps, setSteps] = useState(0);
    const [comparisons, setComparisons] = useState(0);
    const [animationSpeed, setAnimationSpeed] = useState(500);
    const [searchRange, setSearchRange] = useState({ low: -1, high: -1 });
    const [searchLog, setSearchLog] = useState([]);
    const [isCustomInput, setIsCustomInput] = useState(false);
    const [customArrayInput, setCustomArrayInput] = useState('');
    const intervalRef = useRef(null);
    
    // Add ref for the search log container
    const searchLogRef = useRef(null);
    // Add ref for the main visualization area to prevent auto-scroll
    const visualizationRef = useRef(null);

    // Initialize array when component mounts or algorithm changes
    useEffect(() => {
        generateArray();
    }, [arraySize, algorithm.name]);

    // Control animation speed
    useEffect(() => {
        setAnimationSpeed(1100 - speed * 10);
    }, [speed]);

    // Auto-scroll to bottom when search log updates (only for search log)
    useEffect(() => {
        if (searchLogRef.current && searchLog.length > 0) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                searchLogRef.current.scrollTo({
                    top: searchLogRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }, [searchLog]);

    const generateArray = () => {
        const newArray = [];
        
        for (let i = 0; i < arraySize; i++) {
            newArray.push(Math.floor(Math.random() * 99) + 1);
        }
        
        // Sort array for Binary Search
        if (algorithm.name === 'Binary Search') {
            newArray.sort((a, b) => a - b);
        }
        
        setArray(newArray);
        setCustomArrayInput(newArray.join(', '));
        reset();
    };

    const handleCustomArrayInput = () => {
        try {
            const inputValues = customArrayInput
                .split(',')
                .map(val => parseInt(val.trim()))
                .filter(val => !isNaN(val));

            if (inputValues.length === 0) {
                alert('Please enter valid numbers separated by commas');
                return;
            }

            let newArray = [...inputValues];
            
            // Sort array for Binary Search
            if (algorithm.name === 'Binary Search') {
                newArray.sort((a, b) => a - b);
            }
            
            setArray(newArray);
            setArraySize(newArray.length);
            setIsCustomInput(false);
            reset();
        } catch (error) {
            alert('Invalid input format. Please enter numbers separated by commas (e.g., 1, 5, 3, 8, 2)');
        }
    };

    const reset = () => {
        setCurrentIndex(-1);
        setFoundIndex(-1);
        setIsSearching(false);
        setSteps(0);
        setComparisons(0);
        setSearchRange({ low: -1, high: -1 });
        setSearchLog([]);
        if (intervalRef.current) {
            clearTimeout(intervalRef.current);
        }
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const addLog = (message, index = null, action = 'info') => {
        setSearchLog(prev => [...prev, {
            step: prev.length + 1,
            message,
            index,
            action,
            timestamp: Date.now()
        }]);
    };

    const linearSearch = async () => {
        addLog(`Starting Linear Search for value: ${searchValue}`, null, 'start');
        
        for (let i = 0; i < array.length; i++) {
            setCurrentIndex(i);
            setSteps(i + 1);
            setComparisons(i + 1);
            addLog(`Checking index ${i}: array[${i}] = ${array[i]}`, i, 'compare');

            await sleep(animationSpeed);

            if (array[i] === searchValue) {
                setFoundIndex(i);
                addLog(`Found ${searchValue} at index ${i}!`, i, 'found');
                setIsSearching(false);
                return;
            }
        }
        
        addLog(`Value ${searchValue} not found in array`, null, 'notfound');
        setIsSearching(false);
    };

    const binarySearch = async () => {
        addLog(`Starting Binary Search for value: ${searchValue} (Array is sorted)`, null, 'start');
        let low = 0;
        let high = array.length - 1;
        let stepCount = 0;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            setCurrentIndex(mid);
            setSearchRange({ low, high });
            stepCount++;
            setSteps(stepCount);
            setComparisons(stepCount);
            
            addLog(`Checking middle element: array[${mid}] = ${array[mid]} (range: ${low}-${high})`, mid, 'compare');

            await sleep(animationSpeed);

            if (array[mid] === searchValue) {
                setFoundIndex(mid);
                addLog(`Found ${searchValue} at index ${mid}!`, mid, 'found');
                setIsSearching(false);
                return;
            } else if (array[mid] < searchValue) {
                low = mid + 1;
                addLog(`${array[mid]} < ${searchValue}, searching right half`, mid, 'info');
            } else {
                high = mid - 1;
                addLog(`${array[mid]} > ${searchValue}, searching left half`, mid, 'info');
            }
        }

        addLog(`Value ${searchValue} not found in array`, null, 'notfound');
        setIsSearching(false);
    };

    const startSearch = async () => {
        // Check if array is sorted for Binary Search
        if (algorithm.name === 'Binary Search') {
            const isSorted = array.every((val, i) => i === 0 || array[i - 1] <= val);
            if (!isSorted) {
                addLog(`Array is not sorted! Sorting array for Binary Search`, null, 'error');
                const sortedArray = [...array].sort((a, b) => a - b);
                setArray(sortedArray);
                setCustomArrayInput(sortedArray.join(', '));
                setTimeout(() => startSearch(), 500);
                return;
            }
        }
        
        reset();
        setIsSearching(true);
        
        try {
            switch (algorithm.name) {
                case 'Linear Search':
                    await linearSearch();
                    break;
                case 'Binary Search':
                    await binarySearch();
                    break;
                default:
                    await linearSearch();
            }
        } catch (error) {
            console.error('Search error:', error);
            setIsSearching(false);
            addLog(`Error occurred: ${error.message}`, null, 'error');
        }
    };

    const getCellColor = (index) => {
        if (foundIndex === index) {
            return 'bg-green-500 text-white animate-pulse border-green-400';
        }
        
        if (currentIndex === index) {
            return 'bg-yellow-500 text-black animate-bounce border-yellow-400';
        }
        
        if (searchRange.low !== -1 && searchRange.high !== -1 && 
            index >= searchRange.low && index <= searchRange.high) {
            return 'bg-blue-500/30 text-white border-blue-400';
        }
        
        return `${theme.cardBg} ${theme.cardText} hover:bg-gray-600/50 border-gray-600`;
    };

    const getLogColor = (action) => {
        switch (action) {
            case 'start': return 'text-cyan-400';
            case 'found': return 'text-green-400';
            case 'notfound': return 'text-red-400';
            case 'compare': return 'text-yellow-400';
            case 'info': return 'text-blue-400';
            case 'error': return 'text-red-500';
            default: return theme.cardText;
        }
    };

    const requiresSortedArray = algorithm.name === 'Binary Search';

    return (
        <div className="h-full flex gap-6 overflow-hidden">
            {/* Main Visualization Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Controls - Fixed */}
                <div className={`${theme.cardBg} rounded-lg p-6 mb-6 border ${theme.border} flex-shrink-0`}>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        {!isCustomInput ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <label className={`${theme.cardText} text-sm`}>Array Size:</label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="20"
                                        value={arraySize}
                                        onChange={(e) => setArraySize(Math.max(5, Math.min(20, parseInt(e.target.value) || 5)))}
                                        className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-20`}
                                        disabled={isSearching}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={generateArray}
                                        disabled={isSearching}
                                        className={`px-4 py-2 rounded bg-purple-600 ${theme.buttonText} hover:bg-purple-700 flex items-center gap-2`}
                                    >
                                        <FaRandom className="text-sm" />
                                        Generate Random
                                    </button>
                                    
                                    <button
                                        onClick={() => setIsCustomInput(true)}
                                        disabled={isSearching}
                                        className={`px-4 py-2 rounded bg-orange-600 ${theme.buttonText} hover:bg-orange-700 flex items-center gap-2`}
                                    >
                                        <FaEdit className="text-sm" />
                                        Custom Input
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 w-full">
                                <label className={`${theme.cardText} text-sm whitespace-nowrap`}>Custom Array:</label>
                                <input
                                    type="text"
                                    value={customArrayInput}
                                    onChange={(e) => setCustomArrayInput(e.target.value)}
                                    placeholder="Enter numbers separated by commas (e.g., 1, 5, 3, 8, 2)"
                                    className={`flex-1 px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border}`}
                                />
                                <button
                                    onClick={handleCustomArrayInput}
                                    className={`px-3 py-2 rounded bg-green-600 ${theme.buttonText} hover:bg-green-700 flex items-center gap-2`}
                                >
                                    <FaCheck className="text-sm" />
                                    Apply
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCustomInput(false);
                                        setCustomArrayInput(array.join(', '));
                                    }}
                                    className={`px-3 py-2 rounded bg-gray-600 ${theme.buttonText} hover:bg-gray-700 flex items-center gap-2`}
                                >
                                    <FaTimes className="text-sm" />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {!isCustomInput && (
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <label className={`${theme.cardText} text-sm`}>Search for:</label>
                                <input
                                    type="number"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(parseInt(e.target.value) || 0)}
                                    className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-20`}
                                    disabled={isSearching}
                                />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={startSearch}
                                    disabled={isSearching}
                                    className={`px-4 py-2 rounded ${theme.buttonPrimary} ${theme.buttonText} hover:${theme.buttonPrimaryHover} disabled:opacity-50 flex items-center gap-2`}
                                >
                                    <FaPlay className="text-sm" />
                                    Start Search
                                </button>
                                
                                <button
                                    onClick={reset}
                                    className={`px-4 py-2 rounded bg-gray-600 ${theme.buttonText} hover:bg-gray-700 flex items-center gap-2`}
                                >
                                    <FaStop className="text-sm" />
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}

                    {!isCustomInput && (
                        <div className="flex items-center gap-6 text-sm">
                            <span className={`${theme.cardText}`}>
                                Array Length: <span className={`${theme.highlight} font-bold`}>{array.length}</span>
                            </span>
                            <span className={`${theme.cardText}`}>
                                Steps: <span className={`${theme.highlight} font-bold`}>{steps}</span>
                            </span>
                            <span className={`${theme.cardText}`}>
                                Comparisons: <span className={`${theme.highlight} font-bold`}>{comparisons}</span>
                            </span>
                            <span className={`${theme.cardText}`}>
                                Status: <span className={`${foundIndex !== -1 ? theme.successColor : theme.infoColor} font-bold`}>
                                    {foundIndex !== -1 ? 'Found!' : isSearching ? 'Searching...' : 'Ready'}
                                </span>
                            </span>
                            {requiresSortedArray && (
                                <span className={`${theme.cardText}`}>
                                    Array: <span className={`${theme.infoColor} font-bold`}>Sorted</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Array Visualization - Fixed Position, No Auto Scroll */}
                <div 
                    ref={visualizationRef}
                    className="flex-1 flex flex-col items-center justify-center overflow-hidden"
                >
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <h3 className={`${theme.highlight} text-xl font-semibold mb-6`}>
                            {algorithm.name} - Array Visualization
                        </h3>
                        
                        {/* Current Array Display */}
                        <div className={`mb-4 text-sm ${theme.cardText}`}>
                            Current Array: [{array.join(', ')}]
                        </div>
                        
                        {/* Array Elements - Fixed Center Position */}
                        <div className="flex gap-1 mb-4 flex-wrap justify-center items-center px-4">
                            {array.map((value, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <div
                                        className={`
                                            w-16 h-16 flex items-center justify-center rounded-lg border-2
                                            font-bold text-lg transition-all duration-300 transform hover:scale-105
                                            ${getCellColor(index)}
                                        `}
                                    >
                                        {value}
                                    </div>
                                    <div className={`mt-2 text-xs ${theme.cardText} font-mono`}>
                                        [{index}]
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Algorithm Info */}
                        <div className={`${theme.cardBg} rounded-lg p-4 border ${theme.border} w-full max-w-2xl`}>
                            <h3 className={`${theme.highlight} font-semibold mb-2`}>{algorithm.name}</h3>
                            <p className={`${theme.cardText} text-sm mb-2`}>
                                Time Complexity: <span className={`${theme.infoColor} font-mono`}>{algorithm.complexity}</span>
                            </p>
                            <p className={`${theme.cardText} text-sm mb-2`}>
                                Requires Sorted Array: <span className={`${requiresSortedArray ? theme.successColor : theme.cardText} font-mono`}>
                                    {requiresSortedArray ? 'Yes' : 'No'}
                                </span>
                            </p>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                    <span className={theme.cardText}>Current</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                    <span className={theme.cardText}>Found</span>
                                </div>
                                {requiresSortedArray && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-blue-500/30 rounded"></div>
                                        <span className={theme.cardText}>Search Range</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Log Sidebar - FIXED HEIGHT */}
            <div className={`w-80 ${theme.cardBg} rounded-lg border ${theme.border} flex flex-col flex-shrink-0 h-full`}>
                {/* Fixed Header */}
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                    <h3 className={`${theme.highlight} font-semibold`}>
                        Search Log
                    </h3>
                </div>
                
                {/* Fixed Height Scrollable Content */}
                <div 
                    ref={searchLogRef}
                    className="flex-1 overflow-y-auto overflow-x-hidden p-4"
                    style={{ 
                        scrollBehavior: 'smooth',
                        maxHeight: 'calc(100vh - 200px)', // Prevent growing beyond screen
                        minHeight: '400px' // Minimum height
                    }}
                >
                    <div className="space-y-2">
                        {searchLog.length === 0 ? (
                            <div className={`text-center ${theme.cardText} text-sm py-8`}>
                                No search performed yet. <br />
                                Click "Start Search" to begin!
                            </div>
                        ) : (
                            searchLog.map((log, index) => (
                                <div 
                                    key={index} 
                                    className={`text-sm p-2 rounded border-l-4 transition-all duration-300 flex-shrink-0 ${
                                        log.action === 'found' ? 'border-green-500 bg-green-500/10' :
                                        log.action === 'notfound' ? 'border-red-500 bg-red-500/10' :
                                        log.action === 'compare' ? 'border-yellow-500 bg-yellow-500/10' :
                                        log.action === 'start' ? 'border-cyan-500 bg-cyan-500/10' :
                                        log.action === 'error' ? 'border-red-600 bg-red-600/10' :
                                        'border-gray-500 bg-gray-500/10'
                                    }`}
                                >
                                    <div className={`font-mono text-xs ${getLogColor(log.action)}`}>
                                        Step {log.step}
                                    </div>
                                    <div className={`${theme.cardText} text-xs mt-1`}>
                                        {log.message}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchingVisualizer;
