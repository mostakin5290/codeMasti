import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FaPlay, FaPause, FaRedoAlt, FaRandom, FaSortAlphaDown,
    FaRegWindowMaximize, FaSearch // Removed FaStepForward, FaStepBackward, FaChartBar, FaCog for cleaner imports
} from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md'; // For speed icon (assuming you have this installed)
import { toast } from 'react-toastify';

// --- Color Scheme (Derived from reference image) ---
const visualizerColors = {
    backgroundPrimary: '#1a1a2e',
    backgroundSecondary: '#1F2837',
    backgroundTertiary: '#283648',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0AEC0',
    accentBlue: '#537BF9',
    accentGreen: '#48BB78',
    accentRed: '#FC5C65',
    accentOrange: '#F6AD55',
    accentGrayHover: '#334155',
    borderDark: '#3A4B60',
    borderLight: '#4F617C',
    shadowDark: 'rgba(0,0,0,0.4)',
    shadowLight: 'rgba(255,255,255,0.05)',
};

// --- Sorting Algorithms (Logic remains the same as previous corrected version) ---
const bubbleSort = async (arr, visualize, delay, stopFlagRef) => {
    const n = arr.length;
    const newArr = [...arr];
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (stopFlagRef.current) return;
            await visualize([...newArr], [j, j + 1], [], 'comparing'); // comparing type
            await new Promise(resolve => setTimeout(resolve, delay));
            if (newArr[j] > newArr[j + 1]) {
                [newArr[j], newArr[j + 1]] = [newArr[j + 1], newArr[j]];
                if (stopFlagRef.current) return;
                await visualize([...newArr], [j, j + 1], [], 'swapping'); // swapping type
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        if (stopFlagRef.current) return;
        await visualize([...newArr], [], [n - 1 - i], 'sorted'); // sorted type
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    await visualize([...newArr], [], Array.from({length: n}, (_, i) => i), 'complete');
};

const selectionSort = async (arr, visualize, delay, stopFlagRef) => {
    const n = arr.length;
    const newArr = [...arr];
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (stopFlagRef.current) return;
            await visualize([...newArr], [minIdx, j], [], 'comparing');
            await new Promise(resolve => setTimeout(resolve, delay));
            if (newArr[j] < newArr[minIdx]) {
                minIdx = j;
            }
        }
        if (stopFlagRef.current) return;
        if (minIdx !== i) {
            [newArr[i], newArr[minIdx]] = [newArr[minIdx], newArr[i]];
            await visualize([...newArr], [i, minIdx], [], 'swapping');
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        await visualize([...newArr], [], [i], 'sorted');
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    await visualize([...newArr], [], Array.from({length: n}, (_, i) => i), 'complete');
};

const insertionSort = async (arr, visualize, delay, stopFlagRef) => {
    const n = arr.length;
    const newArr = [...arr];
    for (let i = 1; i < n; i++) {
        const key = newArr[i];
        let j = i - 1;
        if (stopFlagRef.current) return;
        await visualize([...newArr], [i], [], 'selecting'); // Highlight element being inserted
        await new Promise(resolve => setTimeout(resolve, delay));
        while (j >= 0 && newArr[j] > key) {
            if (stopFlagRef.current) return;
            await visualize([...newArr], [j, j + 1], [], 'comparing');
            await new Promise(resolve => setTimeout(resolve, delay));
            newArr[j + 1] = newArr[j];
            j--;
            if (stopFlagRef.current) return;
            await visualize([...newArr], [j + 2], [], 'shifting'); // Indicate shift
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        newArr[j + 1] = key;
        if (stopFlagRef.current) return;
        await visualize([...newArr], [j + 1], Array.from({length: i + 1}, (_, k) => k), 'placed'); // Mark placed
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    await visualize([...newArr], [], Array.from({length: n}, (_, i) => i), 'complete');
};

const mergeSort = async (arr, visualize, delay, stopFlagRef) => {
    const newArr = [...arr];
    const merge = async (left, mid, right) => {
        const leftArr = newArr.slice(left, mid + 1);
        const rightArr = newArr.slice(mid + 1, right + 1);
        let i = 0, j = 0, k = left;
        while (i < leftArr.length && j < rightArr.length) {
            if (stopFlagRef.current) return;
            await visualize([...newArr], [left + i, mid + 1 + j], [], 'comparing');
            await new Promise(resolve => setTimeout(resolve, delay));
            if (leftArr[i] <= rightArr[j]) {
                newArr[k] = leftArr[i];
                i++;
            } else {
                newArr[k] = rightArr[j];
                j++;
            }
            k++;
            if (stopFlagRef.current) return;
            await visualize([...newArr], [k - 1], [], 'merging'); // Highlight element being placed
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        while (i < leftArr.length) {
            if (stopFlagRef.current) return;
            newArr[k] = leftArr[i];
            i++;
            k++;
            await visualize([...newArr], [k - 1], [], 'merging');
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        while (j < rightArr.length) {
            if (stopFlagRef.current) return;
            newArr[k] = rightArr[j];
            j++;
            k++;
            await visualize([...newArr], [k - 1], [], 'merging');
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    };
    const mergeSortHelper = async (left, right) => {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            await mergeSortHelper(left, mid);
            if (stopFlagRef.current) return;
            await mergeSortHelper(mid + 1, right);
            if (stopFlagRef.current) return;
            await merge(left, mid, right);
            if (stopFlagRef.current) return;
        }
    };
    await mergeSortHelper(0, arr.length - 1);
    if (!stopFlagRef.current) {
        await visualize([...newArr], [], Array.from({length: arr.length}, (_, i) => i), 'complete');
    }
};

const quickSort = async (arr, visualize, delay, stopFlagRef) => {
    const newArr = [...arr];
    const partition = async (low, high) => {
        const pivot = newArr[high];
        let i = low - 1;
        if (stopFlagRef.current) throw new Error("Sorting stopped");
        await visualize([...newArr], [high], [], 'pivot'); // Highlight pivot
        await new Promise(resolve => setTimeout(resolve, delay));
        for (let j = low; j < high; j++) {
            if (stopFlagRef.current) throw new Error("Sorting stopped");
            await visualize([...newArr], [j, high], [], 'comparing');
            await new Promise(resolve => setTimeout(resolve, delay));
            if (newArr[j] < pivot) {
                i++;
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
                if (stopFlagRef.current) throw new Error("Sorting stopped");
                await visualize([...newArr], [i, j], [], 'swapping');
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        [newArr[i + 1], newArr[high]] = [newArr[high], newArr[i + 1]];
        if (stopFlagRef.current) throw new Error("Sorting stopped");
        await visualize([...newArr], [i + 1], [], 'pivot_placed'); // Highlight pivot in final spot
        await new Promise(resolve => setTimeout(resolve, delay));
        return i + 1;
    };
    const quickSortHelper = async (low, high) => {
        if (low < high) {
            let pi;
            try {
                pi = await partition(low, high);
            } catch (e) {
                if (e.message === "Sorting stopped") throw e;
            }
            if (stopFlagRef.current || pi === undefined) return;
            await quickSortHelper(low, pi - 1);
            if (stopFlagRef.current) return;
            await quickSortHelper(pi + 1, high);
        }
    };
    try {
        await quickSortHelper(0, arr.length - 1);
        if (!stopFlagRef.current) {
            await visualize([...newArr], [], Array.from({length: arr.length}, (_, i) => i), 'complete');
        }
    } catch (e) {
        if (e.message !== "Sorting stopped") { // Only re-throw if not our custom stop error
            throw e;
        }
    }
};

const algorithms = {
    'bubble': { name: 'Bubble Sort', func: bubbleSort, complexity: 'O(n²)' },
    'selection': { name: 'Selection Sort', func: selectionSort, complexity: 'O(n²)' },
    'insertion': { name: 'Insertion Sort', func: insertionSort, complexity: 'O(n²)' },
    'merge': { name: 'Merge Sort', func: mergeSort, complexity: 'O(n log n)' },
    'quick': { name: 'Quick Sort', func: quickSort, complexity: 'O(n log n)' }
};

const categories = {
    sorting: {
        name: 'Sorting',
        algorithms: ['bubble', 'selection', 'insertion', 'merge', 'quick']
    },
    searching: {
        name: 'Searching',
        algorithms: ['linear', 'binary'] // Placeholder for future
    },
    graph: {
        name: 'Graph',
        algorithms: ['bfs', 'dfs', 'dijkstra', 'prim'] // Placeholder for future
    }
};


const EnhancedSortingVisualizer = () => {
    const [array, setArray] = useState([]);
    const [originalArray, setOriginalArray] = useState([]);
    const [arraySize, setArraySize] = useState(36); // Matching reference image
    const [speedPercentage, setSpeedPercentage] = useState(50); // 1-100%
    const [selectedCategory, setSelectedCategory] = useState('sorting');
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubble'); // Initial algorithm
    const [isAnimating, setIsAnimating] = useState(false);
    const [compareIndices, setCompareIndices] = useState([]);
    const [sortedIndices, setSortedIndices] = useState([]);
    const [highlightIndices, setHighlightIndices] = useState([]); // For custom highlights (pivot, selected, etc.)
    const [currentStep, setCurrentStep] = useState('');
    const [stats, setStats] = useState({ comparisons: 0, swaps: 0, time: 0 });
    const [customArrayInput, setCustomArrayInput] = useState('');

    const stopFlag = useRef(false); // Flag for immediate stopping of algorithm execution
    const startTimeRef = useRef(0);
    const statsRef = useRef({ comparisons: 0, swaps: 0 });
    const animationDelayRef = useRef(0); // Actual ms delay passed to algorithms

    // Calculate actual delay based on speed percentage
    useEffect(() => {
        // Range: 10ms (fastest, 100%) to ~200ms (slowest, 1%)
        animationDelayRef.current = 10 + (200 * (100 - speedPercentage) / 100);
    }, [speedPercentage]);

    // Function to determine bar color based on state
    const getBarColor = useCallback((index) => {
        if (sortedIndices.includes(index)) return visualizerColors.accentGreen;
        if (compareIndices.includes(index)) return visualizerColors.accentOrange;
        if (highlightIndices.includes(index)) return visualizerColors.accentRed; // Example for pivot/selected
        return visualizerColors.accentBlue; // Default bar color
    }, [compareIndices, sortedIndices, highlightIndices]);


    const generateArray = useCallback(() => {
        // Immediately signal any running sort to stop
        stopFlag.current = true;
        setIsAnimating(false); // Ensure sorting state is false

        // Give a brief moment for algorithm to acknowledge stop flag before resetting/generating
        // This helps prevent visual glitches if a sort is actively running
        setTimeout(() => {
            const newArray = Array.from({ length: arraySize }, () =>
                Math.floor(Math.random() * 250) + 10 // Values between 10 and 260
            );
            setArray(newArray);
            setOriginalArray([...newArray]);
            setCompareIndices([]);
            setSortedIndices([]);
            setHighlightIndices([]);
            setCurrentStep('');
            statsRef.current = { comparisons: 0, swaps: 0 };
            setStats({ comparisons: 0, swaps: 0, time: 0 });
            stopFlag.current = false; // Reset flag for potential new sort
        }, 50); // Small delay to allow stopFlag to propagate
    }, [arraySize, isAnimating]); // isAnimating dependency added for conditional delay logic


    const applyCustomArray = useCallback(() => {
        const parsedArray = customArrayInput.split(',').map(Number).filter(n => !isNaN(n) && n > 0 && n <= 300);
        if (parsedArray.length === 0) {
            toast.error("Please enter a valid comma-separated array of numbers (1-300).");
            return;
        }
        if (parsedArray.length > 100) {
            toast.error("Array size cannot exceed 100 for visualization.");
            return;
        }

        // Similar stop logic for custom array
        stopFlag.current = true;
        setIsAnimating(false);
        setTimeout(() => { // Delay to allow current animation to stop
            setArray(parsedArray);
            setOriginalArray([...parsedArray]);
            setArraySize(parsedArray.length); // Update array size to match custom input
            setCompareIndices([]);
            setSortedIndices([]);
            setHighlightIndices([]);
            setCurrentStep('');
            statsRef.current = { comparisons: 0, swaps: 0 };
            setStats({ comparisons: 0, swaps: 0, time: 0 });
            stopFlag.current = false;
        }, 50);
    }, [customArrayInput, isAnimating]);


    const resetArrayVisuals = useCallback(() => {
        // Similar stop logic for resetting
        stopFlag.current = true;
        setIsAnimating(false);
        setTimeout(() => {
            setArray([...originalArray]);
            setCompareIndices([]);
            setSortedIndices([]);
            setHighlightIndices([]);
            setCurrentStep('');
            statsRef.current = { comparisons: 0, swaps: 0 };
            setStats({ comparisons: 0, swaps: 0, time: 0 });
            stopFlag.current = false;
        }, 50);
    }, [originalArray, isAnimating]);

    // This is the core visualization step called by algorithms
    // It now expects `highlightIdx` for a third color state
    const visualizeStep = useCallback(async (newArr, compIdx = [], highIdx = [], step = '', type = '') => {
        // Throw error to immediately break algorithm execution if stopFlag is true
        if (stopFlag.current) {
            throw new Error("Sorting stopped");
        }

        // Update state to reflect the current step of the algorithm
        setArray([...newArr]);
        setCompareIndices(compIdx);
        setHighlightIndices(highIdx); // Update highlight indices for specific actions
        setCurrentStep(step);

        // Update stats progressively based on the action type
        if (type === 'comparing') statsRef.current.comparisons++;
        if (type === 'swapping') statsRef.current.swaps++;

        // Special handling for `sorted` type to accumulate sorted elements
        if (type === 'sorted' || type === 'placed' || type === 'merging' || type === 'pivot_placed') {
            setSortedIndices(prev => {
                const newSorted = [...prev];
                highIdx.forEach(idx => { // `highIdx` contains the newly sorted/placed element(s)
                    if (idx !== null && !newSorted.includes(idx)) { // Check for null/undefined idx and avoid duplicates
                        newSorted.push(idx);
                    }
                });
                return newSorted;
            });
        }

        // For `complete` type, mark all elements as sorted and finalize animation
        if (type === 'complete') {
            setSortedIndices(Array.from({length: newArr.length}, (_, i) => i)); // Mark all
            setCurrentStep('Sorting Complete!');
            setIsAnimating(false);
            const endTime = Date.now();
            setStats(prev => ({
                comparisons: statsRef.current.comparisons,
                swaps: statsRef.current.swaps,
                time: endTime - startTimeRef.current
            }));
            stopFlag.current = false; // Reset stop flag on completion
            return; // Exit here, no timeout needed after 'complete'
        }

        // Update stats displayed in the UI (for comparisons, swaps, time)
        setStats(prev => ({
            comparisons: statsRef.current.comparisons,
            swaps: statsRef.current.swaps,
            time: Date.now() - startTimeRef.current
        }));
    }, []); // Removed `animationDelay` from dependencies as it's not directly used in this function's logic


    const startSorting = async () => {
        if (isAnimating) { // If animating, clicking again should stop/pause
            stopFlag.current = true; // Signal algorithm to stop
            setIsAnimating(false);
            toast.info("Sorting paused.");
            return;
        }

        // Prepare for a new animation cycle
        setIsAnimating(true);
        stopFlag.current = false; // Reset stop flag for current run
        startTimeRef.current = Date.now(); // Record start time
        statsRef.current = { comparisons: 0, swaps: 0 }; // Reset stats counters

        // If the array is already sorted (e.g., from a previous run), reset it visually
        if (sortedIndices.length === array.length && array.length > 0) {
            setArray([...originalArray]); // Reset actual array for algorithm
            setCompareIndices([]);
            setSortedIndices([]);
            setHighlightIndices([]);
            // Give a very short delay for React to render the reset state before starting
            await new Promise(res => setTimeout(res, 50));
        } else if (array.length === 0) { // Handle empty array scenario
            toast.error("Array is empty. Please generate or enter an array.");
            setIsAnimating(false);
            return;
        }

        toast.success("Sorting started!");
        try {
            const algorithmFunc = algorithms[selectedAlgorithm].func;
            if (algorithmFunc) {
                // Call the selected algorithm, passing necessary state and refs
                await algorithmFunc([...array], visualizeStep, animationDelayRef.current, stopFlag);
            } else {
                toast.error("Algorithm not found or not yet implemented!");
                setIsAnimating(false);
            }
        } catch (error) {
            // Catch the custom "Sorting stopped" error or any other algorithm errors
            if (error.message === "Sorting stopped") {
                console.log("Sorting execution aborted by user or state change.");
            } else {
                console.error("Algorithm execution error:", error);
                toast.error("An unexpected error occurred during sorting.");
            }
        } finally {
            // Final cleanup regardless of how the sorting ends
            setIsAnimating(false); // Ensure animating state is false
            setCompareIndices([]); // Clear any remaining comparison highlights
            setHighlightIndices([]); // Clear any remaining specific highlights
            stopFlag.current = false; // Always reset stop flag for next interaction
        }
    };

    // Initial array generation on mount
    useEffect(() => {
        generateArray();
    }, [generateArray]);

    return (
        <div className={`min-h-screen ${visualizerColors.backgroundPrimary} flex flex-col`}>
            {/* Main Container mirroring reference's structure */}
            <div className="max-w-screen-2xl mx-auto flex flex-grow w-full">
                {/* Left Sidebar (Algorithm Categories & Selection) */}
                <aside className={`w-72 flex-shrink-0 border-r border-${visualizerColors.borderDark} p-6 ${visualizerColors.backgroundSecondary} hidden md:block`}>
                    <div className="mb-8">
                        <div className={`flex items-center ${visualizerColors.textPrimary} text-3xl font-bold`}>
                            <span className="mr-2">DSA</span>Trek
                        </div>
                        <p className={`${visualizerColors.textSecondary} text-sm mt-1`}>Feel the heartbeat of Visualize DSA</p>
                    </div>

                    {Object.entries(categories).map(([key, category]) => (
                        <div key={key} className="mb-6">
                            <h3 className={`${visualizerColors.textSecondary} font-semibold mb-3 uppercase text-sm tracking-wider`}>
                                {category.name}
                            </h3>
                            <nav className="space-y-2">
                                {category.algorithms.map(algoKey => {
                                    const algo = algorithms[algoKey];
                                    if (!algo) return null;
                                    return (
                                        <button
                                            key={algoKey}
                                            onClick={() => {
                                                setSelectedAlgorithm(algoKey);
                                                setSelectedCategory(key);
                                                resetArrayVisuals(); // Reset visuals on algo change
                                            }}
                                            disabled={isAnimating}
                                            className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors duration-200
                                                ${selectedAlgorithm === algoKey
                                                    ? `${visualizerColors.accentBlue} ${visualizerColors.textPrimary} shadow-md`
                                                    : `${visualizerColors.backgroundSecondary} ${visualizerColors.textSecondary} hover:${visualizerColors.accentGrayHover}`
                                                }`}
                                        >
                                            <span className="font-medium">{algo.name}</span>
                                            <span className="text-xs opacity-70">{algo.complexity}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </aside>

                {/* Main Visualization Area */}
                <div className="flex-grow p-6 flex flex-col">
                    {/* Top Bar: Algorithm Title, Array Size, Custom Array Input, Sorting Order, Speed */}
                    <div className={`mb-6 p-4 rounded-lg border border-${visualizerColors.borderDark} ${visualizerColors.backgroundSecondary} shadow-lg`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-2xl font-bold ${visualizerColors.textPrimary}`}>
                                {algorithms[selectedAlgorithm]?.name || 'Select Algorithm'}
                            </h2>
                            <div className="relative">
                                {/* Search algorithms - placeholder */}
                                <input
                                    type="text"
                                    placeholder="Search algorithms..."
                                    className={`pl-10 pr-4 py-2 rounded-lg ${visualizerColors.backgroundTertiary} border border-${visualizerColors.borderDark} text-${visualizerColors.textPrimary} placeholder-${visualizerColors.textSecondary} focus:outline-none focus:ring-2 focus:ring-${visualizerColors.accentBlue}`}
                                />
                                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${visualizerColors.textSecondary}`} />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className={`${visualizerColors.textSecondary}`}>Size:</span>
                                <input
                                    type="number"
                                    min="10" max="100"
                                    value={arraySize}
                                    onChange={(e) => setArraySize(Number(e.target.value))}
                                    disabled={isAnimating}
                                    className={`w-20 p-2 rounded-lg ${visualizerColors.backgroundTertiary} border border-${visualizerColors.borderDark} text-${visualizerColors.textPrimary} focus:outline-none focus:ring-2 focus:ring-${visualizerColors.accentBlue}`}
                                />
                                <button
                                    onClick={generateArray}
                                    disabled={isAnimating}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${visualizerColors.accentBlue} hover:${visualizerColors.secondary} text-white disabled:opacity-50`}
                                >
                                    Apply
                                </button>
                            </div>

                            <div className="flex items-center gap-2 flex-grow min-w-[200px]">
                                <span className={`${visualizerColors.textSecondary}`}>Custom array:</span>
                                <input
                                    type="text"
                                    placeholder="e.g., 5,3,8,1"
                                    value={customArrayInput}
                                    onChange={(e) => setCustomArrayInput(e.target.value)}
                                    disabled={isAnimating}
                                    className={`flex-grow p-2 rounded-lg ${visualizerColors.backgroundTertiary} border border-${visualizerColors.borderDark} text-${visualizerColors.textPrimary} placeholder-${visualizerColors.textSecondary} focus:outline-none focus:ring-2 focus:ring-${visualizerColors.accentBlue}`}
                                />
                                <button
                                    onClick={applyCustomArray}
                                    disabled={isAnimating}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${visualizerColors.accentBlue} hover:${visualizerColors.secondary} text-white disabled:opacity-50`}
                                >
                                    Apply
                                </button>
                            </div>

                            <button
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2
                                ${visualizerColors.accentBlue} hover:${visualizerColors.secondary} text-white`}
                            >
                                Ascending <FaSortAlphaDown className="ml-1" />
                            </button>

                            <div className="flex items-center gap-2">
                                <span className={`${visualizerColors.textSecondary}`}>Speed:</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={speedPercentage}
                                    onChange={(e) => setSpeedPercentage(Number(e.target.value))}
                                    disabled={isAnimating}
                                    className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb-visualizer"
                                />
                                <span className={`${visualizerColors.textPrimary}`}>{speedPercentage}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Visualization Area */}
                    <div className={`flex-grow flex items-end justify-center rounded-lg border border-${visualizerColors.borderDark} ${visualizerColors.backgroundSecondary} p-4 pb-8 relative shadow-lg`}>
                        {array.map((value, index) => (
                            <div
                                key={index}
                                className="relative transition-all ease-out"
                                style={{
                                    width: `${Math.max(800 / array.length, 3)}px`,
                                    height: `${(value / 300) * 90}%`,
                                    backgroundColor: getBarColor(index), // getBarColor is now in scope
                                    margin: `0 ${Math.max(1, 400 / array.length / 2)}px`,
                                    minHeight: '2px',
                                    transitionDuration: `${animationDelayRef.current}ms`,
                                }}
                            >
                                {arraySize <= 20 && (
                                    <span className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs ${visualizerColors.textSecondary} whitespace-nowrap opacity-90 font-mono`}>
                                        {value}
                                    </span>
                                )}
                                <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs ${visualizerColors.textSecondary} opacity-70 font-mono`}>
                                    {index}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Controls & Stats */}
                    <div className={`mt-6 p-4 rounded-lg border border-${visualizerColors.borderDark} ${visualizerColors.backgroundSecondary} shadow-lg`}>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <button
                                onClick={generateArray}
                                disabled={isAnimating}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50
                                    ${visualizerColors.accentBlue} hover:${visualizerColors.secondary} ${visualizerColors.textPrimary}`}
                            >
                                <FaRandom /> Randomize
                            </button>

                            <button
                                onClick={startSorting}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors
                                    ${isAnimating
                                        ? `${visualizerColors.accentRed} hover:${visualizerColors.danger} ${visualizerColors.textPrimary}`
                                        : `${visualizerColors.accentGreen} hover:${visualizerColors.success} ${visualizerColors.textPrimary}`
                                    }`}
                            >
                                {isAnimating ? <FaPause /> : <FaPlay />}
                                {isAnimating ? 'Stop' : 'Start'}
                            </button>

                            <button
                                onClick={resetArrayVisuals}
                                disabled={isAnimating || (array.length > 0 && array.every((val, i) => val === originalArray[i]))}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50
                                    ${visualizerColors.backgroundTertiary} hover:${visualizerColors.accentGrayHover} text-${visualizerColors.textSecondary}`}
                            >
                                <FaRedoAlt /> Reset
                            </button>
                        </div>
                        {/* Stats Display */}
                        <div className="mt-4 pt-4 border-t border-gray-700/50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div>
                                <div className={`text-2xl font-bold ${visualizerColors.accentBlue}`}>{stats.comparisons}</div>
                                <div className={`text-sm ${visualizerColors.textSecondary}`}>Comparisons</div>
                            </div>
                            <div>
                                <div className={`text-2xl font-bold ${visualizerColors.accentGreen}`}>{stats.swaps}</div>
                                <div className={`text-sm ${visualizerColors.textSecondary}`}>Swaps</div>
                            </div>
                            <div>
                                <div className={`text-2xl font-bold ${visualizerColors.accentOrange}`}>
                                    {(stats.time / 1000).toFixed(2)}s
                                </div>
                                <div className={`text-sm ${visualizerColors.textSecondary}`}>Time</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Injected styles for slider thumb to match reference */}
            <style jsx>{`
                .slider-thumb-visualizer::-webkit-slider-thumb {
                    appearance: none;
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: ${visualizerColors.accentBlue};
                    cursor: pointer;
                    box-shadow: 0 0 2px ${visualizerColors.shadowDark};
                    transition: background .15s ease-in-out;
                }
                .slider-thumb-visualizer::-webkit-slider-thumb:hover {
                    background: ${visualizerColors.secondary};
                }
                .slider-thumb-visualizer::-moz-range-thumb {
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: ${visualizerColors.accentBlue};
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 0 2px ${visualizerColors.shadowDark};
                }
                .slider-thumb-visualizer::-moz-range-thumb:hover {
                    background: ${visualizerColors.secondary};
                }
            `}</style>
        </div>
    );
};

export default EnhancedSortingVisualizer;