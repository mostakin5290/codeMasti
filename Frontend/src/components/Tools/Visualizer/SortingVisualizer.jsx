// components/Tools/Visualizer/SortingVisualizer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaRandom, FaTachometerAlt } from 'react-icons/fa';

const SortingVisualizer = ({ algorithm, theme, speed = 50 }) => {
    const [array, setArray] = useState([]);
    const [arraySize, setArraySize] = useState(12);
    const [comparing, setComparing] = useState([]);
    const [swapping, setSwapping] = useState([]);
    const [sorted, setSorted] = useState([]);
    const [pivot, setPivot] = useState(-1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [comparisons, setComparisons] = useState(0);
    const [swaps, setSwaps] = useState(0);
    const [animationSpeed, setAnimationSpeed] = useState(500);
    const [speedControl, setSpeedControl] = useState(50);
    const [logs, setLogs] = useState([]);
    const animationRef = useRef(null);
    const pauseRef = useRef(false);
    const logsEndRef = useRef(null);

    useEffect(() => {
        generateArray();
    }, [arraySize]);

    useEffect(() => {
        // Convert speed (1-100) to delay (10ms-2000ms)
        const delay = 2010 - (speedControl * 20);
        setAnimationSpeed(delay);
    }, [speedControl]);

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
        }
    }, [logs]);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => {
            const newLogs = [...prev, { 
                id: Date.now() + Math.random(), 
                message, 
                type, 
                timestamp,
                step: currentStep 
            }];
            return newLogs.slice(-100);
        });
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const generateArray = () => {
        const newArray = [];
        
        for (let i = 0; i < arraySize; i++) {
            newArray.push({
                value: Math.floor(Math.random() * 95) + 5,
                id: i + Date.now() + Math.random()
            });
        }
        
        setArray(newArray);
        reset();
        addLog(`Generated new array of size ${arraySize}: [${newArray.map(item => item.value).join(', ')}]`, 'success');
    };

    const reset = () => {
        setComparing([]);
        setSwapping([]);
        setSorted([]);
        setPivot(-1);
        setIsAnimating(false);
        setIsPaused(false);
        setCurrentStep(0);
        setComparisons(0);
        setSwaps(0);
        pauseRef.current = false;
        if (animationRef.current) {
            clearTimeout(animationRef.current);
        }
        addLog('Algorithm reset', 'info');
    };

    const sleep = (ms) => {
        return new Promise(resolve => {
            const checkPause = () => {
                if (pauseRef.current) {
                    setTimeout(checkPause, 100);
                } else {
                    setTimeout(resolve, ms);
                }
            };
            checkPause();
        });
    };

    const togglePlayPause = () => {
        if (!isAnimating) {
            startSort();
        } else {
            setIsPaused(!isPaused);
            pauseRef.current = !pauseRef.current;
            addLog(isPaused ? 'Algorithm resumed' : 'Algorithm paused', 'warning');
        }
    };

    // Bubble Sort Animation
    const bubbleSort = async () => {
        const arr = [...array];
        const n = arr.length;
        let comparisons = 0;
        let swaps = 0;

        addLog('Starting Bubble Sort algorithm', 'start');

        for (let i = 0; i < n - 1; i++) {
            addLog(`Pass ${i + 1}: Finding largest element in remaining portion`, 'info');
            
            for (let j = 0; j < n - i - 1; j++) {
                if (pauseRef.current) await sleep(0);
                
                setComparing([j, j + 1]);
                setCurrentStep(prev => prev + 1);
                comparisons++;
                setComparisons(comparisons);
                
                addLog(`Compare: arr[${j}] = ${arr[j].value} vs arr[${j + 1}] = ${arr[j + 1].value}`, 'compare');
                
                await sleep(animationSpeed);
                
                if (arr[j].value > arr[j + 1].value) {
                    setSwapping([j, j + 1]);
                    addLog(`Swap: ${arr[j].value} ↔ ${arr[j + 1].value} (${arr[j].value} > ${arr[j + 1].value})`, 'swap');
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    setArray([...arr]);
                    swaps++;
                    setSwaps(swaps);
                    
                    await sleep(animationSpeed);
                } else {
                    addLog(`No swap needed (${arr[j].value} ≤ ${arr[j + 1].value})`, 'compare');
                }
                
                setSwapping([]);
            }
            setSorted(prev => [...prev, n - 1 - i]);
            addLog(`Element ${arr[n - 1 - i].value} is now in correct position`, 'found');
        }
        
        setSorted(prev => [...prev, 0]);
        setComparing([]);
        setIsAnimating(false);
        setIsPaused(false);
        pauseRef.current = false;
        addLog(`Bubble Sort completed! Comparisons: ${comparisons}, Swaps: ${swaps}`, 'found');
    };

    // Quick Sort Animation
    const quickSort = async () => {
        const arr = [...array];
        let comparisons = 0;
        let swaps = 0;

        addLog('Starting Quick Sort algorithm', 'start');

        const partition = async (low, high) => {
            const pivot = arr[high].value;
            setPivot(high);
            addLog(`Partitioning: pivot = ${pivot} at position ${high}`, 'info');
            let i = low - 1;

            for (let j = low; j < high; j++) {
                if (pauseRef.current) await sleep(0);
                
                setComparing([j, high]);
                comparisons++;
                setComparisons(comparisons);
                addLog(`Compare: ${arr[j].value} vs pivot ${pivot}`, 'compare');
                await sleep(animationSpeed);

                if (arr[j].value < pivot) {
                    i++;
                    if (i !== j) {
                        setSwapping([i, j]);
                        addLog(`Move to left partition: swap ${arr[j].value} ↔ ${arr[i].value}`, 'swap');
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                        setArray([...arr]);
                        swaps++;
                        setSwaps(swaps);
                        await sleep(animationSpeed);
                        setSwapping([]);
                    }
                } else {
                    addLog(`${arr[j].value} stays in right partition`, 'compare');
                }
            }

            setSwapping([i + 1, high]);
            addLog(`Place pivot ${pivot} at correct position ${i + 1}`, 'swap');
            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
            setArray([...arr]);
            swaps++;
            setSwaps(swaps);
            await sleep(animationSpeed);
            setSwapping([]);
            setPivot(-1);

            return i + 1;
        };

        const quickSortHelper = async (low, high) => {
            if (low < high) {
                addLog(`Sorting subarray from ${low} to ${high}`, 'info');
                const pi = await partition(low, high);
                setSorted(prev => [...prev, pi]);
                addLog(`Pivot at position ${pi} is now sorted`, 'found');
                
                await quickSortHelper(low, pi - 1);
                await quickSortHelper(pi + 1, high);
            } else if (low === high) {
                setSorted(prev => [...prev, low]);
                addLog(`Single element at position ${low} is sorted`, 'found');
            }
        };

        await quickSortHelper(0, arr.length - 1);
        setComparing([]);
        setIsAnimating(false);
        setIsPaused(false);
        pauseRef.current = false;
        addLog(`Quick Sort completed! Comparisons: ${comparisons}, Swaps: ${swaps}`, 'found');
    };

    const startSort = async () => {
        reset();
        clearLogs();
        setIsAnimating(true);
        setIsPaused(false);
        pauseRef.current = false;
        
        const algorithmName = algorithm?.name || 'Bubble Sort';
        addLog(`Initializing ${algorithmName} algorithm`, 'start');
        
        switch (algorithmName) {
            case 'Bubble Sort':
                await bubbleSort();
                break;
            case 'Quick Sort':
                await quickSort();
                break;
            default:
                await bubbleSort();
        }
    };

    const getBarColor = (index) => {
        if (sorted.includes(index)) {
            return 'bg-green-500 shadow-lg shadow-green-500/50 border-green-400';
        }
        if (swapping.includes(index)) {
            return 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50 border-red-400';
        }
        if (comparing.includes(index)) {
            return 'bg-yellow-400 shadow-lg shadow-yellow-400/50 border-yellow-400';
        }
        if (pivot === index) {
            return 'bg-purple-500 shadow-lg shadow-purple-500/50 border-purple-400';
        }
        return 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg shadow-blue-500/30 border-blue-400';
    };

    const getLogColor = (type) => {
        switch (type) {
            case 'start': return 'text-cyan-400';
            case 'found': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'compare': return 'text-yellow-400';
            case 'swap': return 'text-orange-400';
            case 'warning': return 'text-orange-400';
            default: return theme.cardText;
        }
    };

    const getSpeedLabel = (speed) => {
        if (speed <= 20) return 'Very Slow';
        if (speed <= 40) return 'Slow';
        if (speed <= 60) return 'Normal';
        if (speed <= 80) return 'Fast';
        return 'Very Fast';
    };

    const setSpeedPreset = (preset) => {
        setSpeedControl(preset);
        addLog(`Speed changed to ${getSpeedLabel(preset)}`, 'info');
    };

    const maxValue = array.length > 0 ? Math.max(...array.map(item => item.value)) : 100;

    return (
        <div className="h-full flex gap-6">
            {/* Main Visualization Area */}
            <div className="flex-1 flex flex-col">
                {/* Controls */}
                <div className={`${theme.cardBg} rounded-lg p-6 mb-6 border ${theme.border}`}>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <label className={`${theme.cardText} text-sm`}>Array Size:</label>
                            <input
                                type="number"
                                min="5"
                                max="20"
                                value={arraySize}
                                onChange={(e) => setArraySize(Math.max(5, Math.min(20, parseInt(e.target.value) || 5)))}
                                className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-20`}
                                disabled={isAnimating}
                            />
                        </div>

                        <button
                            onClick={generateArray}
                            disabled={isAnimating}
                            className={`px-4 py-2 rounded bg-purple-600 ${theme.buttonText} hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50`}
                        >
                            <FaRandom className="text-sm" />
                            Generate Random
                        </button>

                        <div className="flex items-center gap-2">
                            {!isAnimating ? (
                                <button
                                    onClick={togglePlayPause}
                                    className={`px-4 py-2 rounded ${theme.buttonPrimary} ${theme.buttonText} hover:${theme.buttonPrimaryHover} flex items-center gap-2`}
                                >
                                    <FaPlay className="text-sm" />
                                    Start Sort
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={togglePlayPause}
                                        className={`px-4 py-2 rounded ${isPaused ? theme.buttonPrimary : 'bg-orange-600'} ${theme.buttonText} hover:${isPaused ? theme.buttonPrimaryHover : 'bg-orange-700'} flex items-center gap-2`}
                                    >
                                        {isPaused ? <FaPlay className="text-sm" /> : <FaPause className="text-sm" />}
                                        {isPaused ? 'Resume' : 'Pause'}
                                    </button>
                                </>
                            )}
                            
                            <button
                                onClick={reset}
                                className={`px-4 py-2 rounded bg-gray-600 ${theme.buttonText} hover:bg-gray-700 flex items-center gap-2`}
                            >
                                <FaStop className="text-sm" />
                                Reset
                            </button>
                            
                            <button
                                onClick={clearLogs}
                                className={`px-4 py-2 rounded bg-red-600 ${theme.buttonText} hover:bg-red-700`}
                            >
                                Clear Logs
                            </button>
                        </div>
                    </div>

                    {/* Speed Control Section */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 p-4 rounded-lg bg-gray-700/30">
                        <div className="flex items-center gap-3">
                            <FaTachometerAlt className={`${theme.highlight} text-lg`} />
                            <label className={`${theme.cardText} text-sm font-medium`}>Animation Speed:</label>
                        </div>
                        
                        {/* Speed Slider */}
                        <div className="flex items-center gap-3">
                            <span className={`${theme.cardText} text-xs`}>Slow</span>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={speedControl}
                                onChange={(e) => setSpeedControl(parseInt(e.target.value))}
                                className={`w-32 h-2 rounded-lg appearance-none cursor-pointer bg-gray-600
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:cursor-pointer
                                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                                    [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none`}
                                disabled={isAnimating && !isPaused}
                            />
                            <span className={`${theme.cardText} text-xs`}>Fast</span>
                        </div>

                        {/* Speed Display */}
                        <div className="flex items-center gap-2">
                            <span className={`${theme.infoColor} text-sm font-medium`}>
                                {getSpeedLabel(speedControl)} ({speedControl}%)
                            </span>
                            <span className={`${theme.cardText} text-xs`}>
                                ({animationSpeed}ms delay)
                            </span>
                        </div>

                        {/* Speed Presets */}
                        <div className="flex items-center gap-2">
                            <span className={`${theme.cardText} text-xs`}>Quick:</span>
                            {[
                                { label: 'Slow', value: 25 },
                                { label: 'Normal', value: 50 },
                                { label: 'Fast', value: 75 },
                                { label: 'Max', value: 100 }
                            ].map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => setSpeedPreset(preset.value)}
                                    disabled={isAnimating && !isPaused}
                                    className={`px-2 py-1 rounded text-xs transition-all duration-200 ${
                                        speedControl === preset.value
                                            ? `${theme.buttonPrimary} ${theme.buttonText}`
                                            : `bg-gray-600 ${theme.buttonText} hover:bg-gray-700`
                                    } disabled:opacity-50`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                        <span className={`${theme.cardText}`}>
                            Algorithm: <span className={`${theme.highlight} font-bold`}>{algorithm?.name || 'Bubble Sort'}</span>
                        </span>
                        <span className={`${theme.cardText}`}>
                            Array Length: <span className={`${theme.highlight} font-bold`}>{array.length}</span>
                        </span>
                        <span className={`${theme.cardText}`}>
                            Comparisons: <span className={`${theme.highlight} font-bold`}>{comparisons}</span>
                        </span>
                        <span className={`${theme.cardText}`}>
                            Swaps: <span className={`${theme.highlight} font-bold`}>{swaps}</span>
                        </span>
                        <span className={`${theme.cardText}`}>
                            Status: <span className={`${sorted.length === array.length && array.length > 0 ? theme.successColor : isAnimating ? (isPaused ? 'text-orange-400' : theme.infoColor) : theme.cardText} font-bold`}>
                                {sorted.length === array.length && array.length > 0 ? 'Sorted!' : isAnimating ? (isPaused ? 'Paused' : 'Sorting...') : 'Ready'}
                            </span>
                        </span>
                    </div>

                    {/* Pause/Resume Instructions */}
                    {(isAnimating || isPaused) && (
                        <div className={`mt-3 p-2 rounded bg-blue-500/10 border border-blue-500/30`}>
                            <p className="text-xs text-blue-400">
                                {isPaused ? 
                                    '⏸️ Sorting is paused. Use "Resume" to continue or adjust speed settings.' :
                                    '▶️ Sorting is running. Click "Pause" to stop and examine the current state.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Bar Chart Visualization */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h3 className={`${theme.highlight} text-xl font-semibold mb-6`}>
                        {algorithm?.name || 'Bubble Sort'} - Visualization
                        {isPaused && <span className="text-orange-400 ml-2">(PAUSED)</span>}
                    </h3>
                    
                    {/* Current Array Display */}
                    <div className={`mb-4 text-sm ${theme.cardText}`}>
                        Current Array: [{array.map(item => item.value).join(', ')}]
                    </div>
                    
                    {/* Bar Chart */}
                    <div className="flex items-end gap-1 justify-center mb-6 overflow-x-auto p-4">
                        {array.map((item, index) => {
                            const barWidth = Math.max(30, Math.min(60, 500 / arraySize));
                            const barHeight = Math.max(40, (item.value / maxValue) * 300);
                            
                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col items-center justify-end"
                                    style={{ width: `${barWidth}px` }}
                                >
                                    {/* Value above bar */}
                                    <div className={`text-white text-xs font-bold mb-2 px-1 py-0.5 rounded ${theme.cardBg}`}>
                                        {item.value}
                                    </div>
                                    
                                    {/* Bar */}
                                    <div
                                        className={`
                                            transition-all duration-300 rounded-t-lg border-2 relative cursor-pointer
                                            ${getBarColor(index)}
                                            hover:scale-105 transform flex items-end justify-center
                                        `}
                                        style={{
                                            height: `${barHeight}px`,
                                            width: `${barWidth - 4}px`,
                                            minHeight: '40px'
                                        }}
                                    >
                                        {/* Value inside bar for larger bars */}
                                        {barHeight > 60 && (
                                            <div className="text-white text-sm font-bold drop-shadow-lg pb-2">
                                                {item.value}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Index below bar */}
                                    <div className={`text-gray-300 text-xs mt-2 font-semibold px-1 py-0.5 rounded ${theme.cardBg}`}>
                                        [{index}]
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Algorithm Info */}
                    <div className={`${theme.cardBg} rounded-lg p-4 border ${theme.border} w-full max-w-2xl`}>
                        <h3 className={`${theme.highlight} font-semibold mb-2`}>{algorithm?.name || 'Bubble Sort'}</h3>
                        <p className={`${theme.cardText} text-sm mb-2`}>
                            Time Complexity: <span className={`${theme.infoColor} font-mono`}>{algorithm?.complexity || 'O(n²)'}</span>
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gradient-to-t from-blue-600 to-blue-400 rounded border border-blue-400"></div>
                                <span className={theme.cardText}>Unsorted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-400 rounded border border-yellow-400"></div>
                                <span className={theme.cardText}>Comparing</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded border border-red-400"></div>
                                <span className={theme.cardText}>Swapping</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-purple-500 rounded border border-purple-400"></div>
                                <span className={theme.cardText}>Pivot</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded border border-green-400"></div>
                                <span className={theme.cardText}>Sorted</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Sidebar */}
            <div className={`w-80 ${theme.cardBg} rounded-lg border ${theme.border} flex flex-col`}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className={`${theme.highlight} font-semibold`}>
                        Execution Log
                        {isPaused && <span className="text-orange-400 text-sm ml-2">(Paused)</span>}
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4" ref={logsEndRef}>
                    <div className="space-y-2">
                        {logs.length === 0 ? (
                            <div className={`text-center ${theme.cardText} text-sm py-8`}>
                                No sorting performed yet. <br />
                                Click "Start Sort" to begin!
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div 
                                    key={log.id} 
                                    className={`text-sm p-2 rounded border-l-4 ${
                                        log.type === 'found' ? 'border-green-500 bg-green-500/10' :
                                        log.type === 'error' ? 'border-red-500 bg-red-500/10' :
                                        log.type === 'compare' ? 'border-yellow-500 bg-yellow-500/10' :
                                        log.type === 'swap' ? 'border-orange-500 bg-orange-500/10' :
                                        log.type === 'start' ? 'border-cyan-500 bg-cyan-500/10' :
                                        log.type === 'warning' ? 'border-orange-600 bg-orange-600/10' :
                                        'border-gray-500 bg-gray-500/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-gray-500 text-xs">{log.timestamp}</span>
                                        <span className="bg-gray-700 px-1 rounded text-xs">#{log.step}</span>
                                    </div>
                                    <div className={`${getLogColor(log.type)} text-xs`}>
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

export default SortingVisualizer;
