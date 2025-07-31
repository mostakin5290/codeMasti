// components/Tools/Visualizer/SortingVisualizer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaRandom, FaTachometerAlt } from 'react-icons/fa';

const SortingVisualizer = ({ algorithm, theme, speed = 50 }) => {
    const [array, setArray] = useState([]);
    const [arraySize, setArraySize] = useState(8);
    const [comparing, setComparing] = useState([]);
    const [swapping, setSwapping] = useState([]);
    const [sorted, setSorted] = useState([]);
    const [pivot, setPivot] = useState(-1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [comparisons, setComparisons] = useState(0);
    const [swaps, setSwaps] = useState(0);
    const [animationSpeed, setAnimationSpeed] = useState(800);
    const [speedControl, setSpeedControl] = useState(50);
    const [logs, setLogs] = useState([]);
    const [animatingElements, setAnimatingElements] = useState([]);
    const [mergingElements, setMergingElements] = useState([]);
    const [dividePhase, setDividePhase] = useState([]);
    const [heapElements, setHeapElements] = useState([]);
    const animationRef = useRef(null);
    const pauseRef = useRef(false);
    const logsEndRef = useRef(null);

    useEffect(() => {
        generateArray();
    }, [arraySize]);

    useEffect(() => {
        const delay = 2100 - (speedControl * 20);
        setAnimationSpeed(delay);
    }, [speedControl]);

    useEffect(() => {
        if (logsEndRef.current && logs.length > 0) {
            setTimeout(() => {
                logsEndRef.current.scrollTo({
                    top: logsEndRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
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
                value: Math.floor(Math.random() * 99) + 1,
                id: i + Date.now() + Math.random(),
                originalIndex: i
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
        setAnimatingElements([]);
        setMergingElements([]);
        setDividePhase([]);
        setHeapElements([]);
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

    const animatedSwap = async (arr, i, j) => {
        if (i === j) return arr;
        
        setAnimatingElements([i, j]);
        setSwapping([i, j]);
        
        addLog(`Swapping positions ${i} ↔ ${j}: ${arr[i].value} ↔ ${arr[j].value}`, 'swap');
        
        await sleep(animationSpeed);
        
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray([...arr]);
        
        await sleep(animationSpeed / 2);
        
        setAnimatingElements([]);
        setSwapping([]);
        
        return arr;
    };

    // Bubble Sort
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
                
                await sleep(animationSpeed / 2);
                
                if (arr[j].value > arr[j + 1].value) {
                    await animatedSwap(arr, j, j + 1);
                    swaps++;
                    setSwaps(swaps);
                } else {
                    addLog(`No swap needed (${arr[j].value} ≤ ${arr[j + 1].value})`, 'compare');
                }
                
                setComparing([]);
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

    // Selection Sort
    const selectionSort = async () => {
        const arr = [...array];
        const n = arr.length;
        let comparisons = 0;
        let swaps = 0;

        addLog('Starting Selection Sort algorithm', 'start');

        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            addLog(`Pass ${i + 1}: Finding minimum element from position ${i}`, 'info');
            
            setPivot(i);
            
            for (let j = i + 1; j < n; j++) {
                if (pauseRef.current) await sleep(0);
                
                setComparing([minIdx, j]);
                setCurrentStep(prev => prev + 1);
                comparisons++;
                setComparisons(comparisons);
                
                addLog(`Compare: arr[${minIdx}] = ${arr[minIdx].value} vs arr[${j}] = ${arr[j].value}`, 'compare');
                
                await sleep(animationSpeed / 2);
                
                if (arr[j].value < arr[minIdx].value) {
                    minIdx = j;
                    addLog(`New minimum found at position ${j}: ${arr[j].value}`, 'info');
                }
                
                setComparing([]);
            }
            
            if (minIdx !== i) {
                await animatedSwap(arr, i, minIdx);
                swaps++;
                setSwaps(swaps);
            } else {
                addLog(`Element ${arr[i].value} is already in correct position`, 'info');
            }
            
            setSorted(prev => [...prev, i]);
            setPivot(-1);
            addLog(`Position ${i} is now sorted with value ${arr[i].value}`, 'found');
        }
        
        setSorted(prev => [...prev, n - 1]);
        setComparing([]);
        setIsAnimating(false);
        setIsPaused(false);
        pauseRef.current = false;
        addLog(`Selection Sort completed! Comparisons: ${comparisons}, Swaps: ${swaps}`, 'found');
    };

    // Insertion Sort
    const insertionSort = async () => {
        const arr = [...array];
        const n = arr.length;
        let comparisons = 0;
        let shifts = 0;

        addLog('Starting Insertion Sort algorithm', 'start');
        setSorted([0]);

        for (let i = 1; i < n; i++) {
            const key = arr[i];
            let j = i - 1;
            
            addLog(`Insert ${key.value} into sorted portion [0...${i-1}]`, 'info');
            setPivot(i);
            
            await sleep(animationSpeed / 2);
            
            while (j >= 0) {
                if (pauseRef.current) await sleep(0);
                
                setComparing([j, i]);
                setCurrentStep(prev => prev + 1);
                comparisons++;
                setComparisons(comparisons);
                
                addLog(`Compare: ${key.value} vs ${arr[j].value}`, 'compare');
                
                await sleep(animationSpeed / 2);
                
                if (arr[j].value > key.value) {
                    addLog(`Shift ${arr[j].value} to the right`, 'swap');
                    arr[j + 1] = arr[j];
                    setArray([...arr]);
                    shifts++;
                    setSwaps(shifts);
                    
                    await sleep(animationSpeed / 2);
                    j--;
                } else {
                    break;
                }
                
                setComparing([]);
            }
            
            arr[j + 1] = key;
            setArray([...arr]);
            addLog(`Inserted ${key.value} at position ${j + 1}`, 'found');
            
            setSorted(prev => [...prev, i]);
            setPivot(-1);
            setComparing([]);
            
            await sleep(animationSpeed / 2);
        }
        
        setComparing([]);
        setIsAnimating(false);
        setIsPaused(false);
        pauseRef.current = false;
        addLog(`Insertion Sort completed! Comparisons: ${comparisons}, Shifts: ${shifts}`, 'found');
    };

    // Quick Sort
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
                await sleep(animationSpeed / 2);

                if (arr[j].value < pivot) {
                    i++;
                    if (i !== j) {
                        await animatedSwap(arr, i, j);
                        swaps++;
                        setSwaps(swaps);
                    }
                } else {
                    addLog(`${arr[j].value} stays in right partition`, 'compare');
                }
                
                setComparing([]);
            }

            if (i + 1 !== high) {
                await animatedSwap(arr, i + 1, high);
                swaps++;
                setSwaps(swaps);
            }
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

    // Merge Sort with proper divide and conquer visualization
    const mergeSort = async () => {
        const arr = [...array];
        let comparisons = 0;
        let merges = 0;

        addLog('Starting Merge Sort algorithm (Divide and Conquer)', 'start');

        const merge = async (arr, left, mid, right) => {
            const leftArr = arr.slice(left, mid + 1);
            const rightArr = arr.slice(mid + 1, right + 1);
            
            addLog(`Merging subarrays [${left}...${mid}] and [${mid + 1}...${right}]`, 'info');
            setMergingElements([...Array.from({length: right - left + 1}, (_, i) => left + i)]);
            
            let i = 0, j = 0, k = left;
            
            while (i < leftArr.length && j < rightArr.length) {
                if (pauseRef.current) await sleep(0);
                
                setComparing([left + i, mid + 1 + j]);
                comparisons++;
                setComparisons(comparisons);
                
                addLog(`Compare: ${leftArr[i].value} vs ${rightArr[j].value}`, 'compare');
                await sleep(animationSpeed);
                
                if (leftArr[i].value <= rightArr[j].value) {
                    arr[k] = leftArr[i];
                    i++;
                } else {
                    arr[k] = rightArr[j];
                    j++;
                }
                
                setArray([...arr]);
                merges++;
                setSwaps(merges);
                k++;
                
                await sleep(animationSpeed / 2);
                setComparing([]);
            }
            
            while (i < leftArr.length) {
                arr[k] = leftArr[i];
                setArray([...arr]);
                i++;
                k++;
                await sleep(animationSpeed / 3);
            }
            
            while (j < rightArr.length) {
                arr[k] = rightArr[j];
                setArray([...arr]);
                j++;
                k++;
                await sleep(animationSpeed / 3);
            }
            
            setMergingElements([]);
            addLog(`Merged subarray [${left}...${right}]`, 'found');
        };

        const mergeSortHelper = async (arr, left, right) => {
            if (left < right) {
                const mid = Math.floor((left + right) / 2);
                
                addLog(`Dividing array [${left}...${right}] at position ${mid}`, 'info');
                setDividePhase([...Array.from({length: right - left + 1}, (_, i) => left + i)]);
                await sleep(animationSpeed);
                setDividePhase([]);
                
                await mergeSortHelper(arr, left, mid);
                await mergeSortHelper(arr, mid + 1, right);
                await merge(arr, left, mid, right);
            }
        };

        await mergeSortHelper(arr, 0, arr.length - 1);
        setSorted([...Array.from({length: arr.length}, (_, i) => i)]);
        setComparing([]);
        setIsAnimating(false);
        setIsPaused(false);
        pauseRef.current = false;
        addLog(`Merge Sort completed! Comparisons: ${comparisons}, Merges: ${merges}`, 'found');
    };

    // Heap Sort
    const heapSort = async () => {
        const arr = [...array];
        const n = arr.length;
        let comparisons = 0;
        let swaps = 0;

        addLog('Starting Heap Sort algorithm', 'start');

        const heapify = async (arr, n, i) => {
            let largest = i;
            let left = 2 * i + 1;
            let right = 2 * i + 2;

            setHeapElements([i, left, right].filter(idx => idx < n));
            await sleep(animationSpeed / 2);

            if (left < n) {
                setComparing([left, largest]);
                comparisons++;
                setComparisons(comparisons);
                addLog(`Compare left child: ${arr[left].value} vs ${arr[largest].value}`, 'compare');
                await sleep(animationSpeed / 2);
                
                if (arr[left].value > arr[largest].value) {
                    largest = left;
                }
                setComparing([]);
            }

            if (right < n) {
                setComparing([right, largest]);
                comparisons++;
                setComparisons(comparisons);
                addLog(`Compare right child: ${arr[right].value} vs ${arr[largest].value}`, 'compare');
                await sleep(animationSpeed / 2);
                
                if (arr[right].value > arr[largest].value) {
                    largest = right;
                }
                setComparing([]);
            }

            if (largest !== i) {
                await animatedSwap(arr, i, largest);
                swaps++;
                setSwaps(swaps);
                await heapify(arr, n, largest);
            }
            
            setHeapElements([]);
        };

        // Build max heap
        addLog('Building max heap', 'info');
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            if (pauseRef.current) await sleep(0);
            await heapify(arr, n, i);
        }

        addLog('Max heap built, now extracting elements', 'info');

        // Extract elements from heap
        for (let i = n - 1; i > 0; i--) {
            if (pauseRef.current) await sleep(0);
            
            await animatedSwap(arr, 0, i);
            swaps++;
            setSwaps(swaps);
            
            setSorted(prev => [...prev, i]);
            addLog(`Extracted ${arr[i].value} to sorted position`, 'found');
            
            await heapify(arr, i, 0);
        }

        setSorted(prev => [...prev, 0]);
        setComparing([]);
        setHeapElements([]);
        setIsAnimating(false);
        setIsPaused(false);
        pauseRef.current = false;
        addLog(`Heap Sort completed! Comparisons: ${comparisons}, Swaps: ${swaps}`, 'found');
    };

    // Counting Sort
    const countingSort = async () => {
        const arr = [...array];
        const n = arr.length;
        const max = Math.max(...arr.map(item => item.value));
        let operations = 0;

        addLog(`Starting Counting Sort algorithm (max value: ${max})`, 'start');

        // Count occurrences
        const count = new Array(max + 1).fill(0);
        
        addLog('Counting occurrences of each element', 'info');
        for (let i = 0; i < n; i++) {
            if (pauseRef.current) await sleep(0);
            
            setComparing([i]);
            count[arr[i].value]++;
            operations++;
            setSwaps(operations);
            addLog(`Count[${arr[i].value}]++`, 'compare');
            await sleep(animationSpeed / 2);
            setComparing([]);
        }

        // Build output array
        addLog('Building sorted output array', 'info');
        let index = 0;
        for (let i = 0; i <= max; i++) {
            while (count[i] > 0) {
                if (pauseRef.current) await sleep(0);
                
                setComparing([index]);
                arr[index] = { value: i, id: Date.now() + Math.random(), originalIndex: index };
                setArray([...arr]);
                setSorted(prev => [...prev, index]);
                
                addLog(`Placed ${i} at position ${index}`, 'found');
                operations++;
                setSwaps(operations);
                
                count[i]--;
                index++;
                await sleep(animationSpeed);
                setComparing([]);
            }
        }

        setComparing([]);
        setIsAnimating(false);
        setIsPaused(false);
        pauseRef.current = false;
        addLog(`Counting Sort completed! Operations: ${operations}`, 'found');
    };

    // Bucket Sort
    const bucketSort = async () => {
        const arr = [...array];
        const n = arr.length;
        const bucketCount = Math.min(n, 5); // Limit buckets for visualization
        let operations = 0;

        addLog(`Starting Bucket Sort algorithm (${bucketCount} buckets)`, 'start');

        // Create buckets
        const buckets = Array.from({ length: bucketCount }, () => []);
        const max = Math.max(...arr.map(item => item.value));
        const min = Math.min(...arr.map(item => item.value));
        const range = max - min + 1;

        // Distribute elements into buckets
        addLog('Distributing elements into buckets', 'info');
        for (let i = 0; i < n; i++) {
            if (pauseRef.current) await sleep(0);
            
            const bucketIndex = Math.floor(((arr[i].value - min) / range) * bucketCount);
            const actualBucket = Math.min(bucketIndex, bucketCount - 1);
            
            setComparing([i]);
            buckets[actualBucket].push(arr[i]);
            operations++;
            setSwaps(operations);
            
            addLog(`Element ${arr[i].value} goes to bucket ${actualBucket}`, 'compare');
            await sleep(animationSpeed);
            setComparing([]);
        }

        // Sort each bucket and concatenate
        addLog('Sorting buckets and concatenating', 'info');
        let index = 0;
        for (let i = 0; i < bucketCount; i++) {
            if (buckets[i].length > 0) {
                // Simple insertion sort for each bucket
                buckets[i].sort((a, b) => a.value - b.value);
                
                for (let j = 0; j < buckets[i].length; j++) {
                    if (pauseRef.current) await sleep(0);
                    
                    setComparing([index]);
                    arr[index] = buckets[i][j];
                    setArray([...arr]);
                    setSorted(prev => [...prev, index]);
                    
                    addLog(`Placed ${buckets[i][j].value} from bucket ${i} at position ${index}`, 'found');
                    operations++;
                    setSwaps(operations);
                    
                    index++;
                    await sleep(animationSpeed);
                    setComparing([]);
                }
            }
        }

        setComparing([]);
        setIsAnimating(false);
        setIsPaused(false);
        pauseRef.current = false;
        addLog(`Bucket Sort completed! Operations: ${operations}`, 'found');
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
            case 'Selection Sort':
                await selectionSort();
                break;
            case 'Insertion Sort':
                await insertionSort();
                break;
            case 'Quick Sort':
                await quickSort();
                break;
            case 'Merge Sort':
                await mergeSort();
                break;
            case 'Heap Sort':
                await heapSort();
                break;
            case 'Counting Sort':
                await countingSort();
                break;
            case 'Bucket Sort':
                await bucketSort();
                break;
            default:
                await bubbleSort();
        }
    };

    const getElementStyle = (index) => {
        let baseClasses = `
            w-16 h-16 flex items-center justify-center rounded-xl border-2 
            font-bold text-lg transition-all duration-500 transform cursor-pointer
        `;
        
        if (sorted.includes(index)) {
            return baseClasses + ' bg-green-500 text-white shadow-lg shadow-green-500/50 border-green-400 scale-105';
        }
        if (mergingElements.includes(index)) {
            return baseClasses + ' bg-cyan-500 text-white shadow-lg shadow-cyan-500/50 border-cyan-400 scale-105';
        }
        if (dividePhase.includes(index)) {
            return baseClasses + ' bg-pink-500 text-white shadow-lg shadow-pink-500/50 border-pink-400 scale-105';
        }
        if (heapElements.includes(index)) {
            return baseClasses + ' bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 border-indigo-400 scale-105';
        }
        if (animatingElements.includes(index)) {
            return baseClasses + ' bg-red-500 text-white animate-bounce shadow-lg shadow-red-500/50 border-red-400 scale-110 z-10';
        }
        if (swapping.includes(index)) {
            return baseClasses + ' bg-orange-500 text-white shadow-lg shadow-orange-500/50 border-orange-400 scale-105';
        }
        if (comparing.includes(index)) {
            return baseClasses + ' bg-yellow-400 text-black shadow-lg shadow-yellow-400/50 border-yellow-400 scale-105';
        }
        if (pivot === index) {
            return baseClasses + ' bg-purple-500 text-white shadow-lg shadow-purple-500/50 border-purple-400 scale-105';
        }
        
        return baseClasses + ' bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 border-blue-400 hover:scale-105';
    };

    const getLogColor = (type) => {
        switch (type) {
            case 'start': return 'text-cyan-400';
            case 'found': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'compare': return 'text-yellow-400';
            case 'swap': return 'text-orange-400';
            case 'warning': return 'text-orange-400';
            case 'success': return 'text-green-400';
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

    return (
        <div className="h-full flex gap-6 overflow-hidden">
            {/* Main Visualization Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Controls - Fixed */}
                <div className={`${theme.cardBg} rounded-lg p-6 mb-6 border ${theme.border} flex-shrink-0`}>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <label className={`${theme.cardText} text-sm`}>Array Size:</label>
                            <input
                                type="number"
                                min="5"
                                max="12"
                                value={arraySize}
                                onChange={(e) => setArraySize(Math.max(5, Math.min(12, parseInt(e.target.value) || 5)))}
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
                                <button
                                    onClick={togglePlayPause}
                                    className={`px-4 py-2 rounded ${isPaused ? theme.buttonPrimary : 'bg-orange-600'} ${theme.buttonText} hover:${isPaused ? theme.buttonPrimaryHover : 'bg-orange-700'} flex items-center gap-2`}
                                >
                                    {isPaused ? <FaPlay className="text-sm" /> : <FaPause className="text-sm" />}
                                    {isPaused ? 'Resume' : 'Pause'}
                                </button>
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
                                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:cursor-pointer`}
                                disabled={isAnimating && !isPaused}
                            />
                            <span className={`${theme.cardText} text-xs`}>Fast</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`${theme.infoColor} text-sm font-medium`}>
                                {getSpeedLabel(speedControl)} ({speedControl}%)
                            </span>
                        </div>

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
                </div>

                {/* Array Visualization - Fixed Position */}
                <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <h3 className={`${theme.highlight} text-xl font-semibold mb-6`}>
                            {algorithm?.name || 'Bubble Sort'} - Array Animation
                            {isPaused && <span className="text-orange-400 ml-2">(PAUSED)</span>}
                        </h3>
                        
                        {/* Current Array Display */}
                        <div className={`mb-6 text-sm ${theme.cardText}`}>
                            Current Array: [{array.map(item => item.value).join(', ')}]
                        </div>
                        
                        {/* Array Elements - Animated */}
                        <div className="flex gap-3 mb-8 flex-wrap justify-center items-center px-4">
                            {array.map((item, index) => (
                                <div key={item.id} className="flex flex-col items-center">
                                    <div className={getElementStyle(index)}>
                                        {item.value}
                                    </div>
                                    <div className={`mt-2 text-xs ${theme.cardText} font-mono`}>
                                        [{index}]
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Algorithm Info */}
                        <div className={`${theme.cardBg} rounded-lg p-4 border ${theme.border} w-full max-w-2xl`}>
                            <h3 className={`${theme.highlight} font-semibold mb-2`}>{algorithm?.name || 'Bubble Sort'}</h3>
                            <p className={`${theme.cardText} text-sm mb-2`}>
                                Time Complexity: <span className={`${theme.infoColor} font-mono`}>{algorithm?.complexity || 'O(n²)'}</span>
                            </p>
                            <div className="flex items-center gap-4 text-xs flex-wrap">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded border border-blue-400"></div>
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
                                    <div className="w-4 h-4 bg-cyan-500 rounded border border-cyan-400"></div>
                                    <span className={theme.cardText}>Merging</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-pink-500 rounded border border-pink-400"></div>
                                    <span className={theme.cardText}>Dividing</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-indigo-500 rounded border border-indigo-400"></div>
                                    <span className={theme.cardText}>Heap</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded border border-green-400"></div>
                                    <span className={theme.cardText}>Sorted</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Sidebar - FIXED HEIGHT */}
            <div className={`w-80 ${theme.cardBg} rounded-lg border ${theme.border} flex flex-col flex-shrink-0 h-full`}>
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                    <h3 className={`${theme.highlight} font-semibold`}>
                        Execution Log
                        {isPaused && <span className="text-orange-400 text-sm ml-2">(Paused)</span>}
                    </h3>
                </div>
                
                <div 
                    className="flex-1 overflow-y-auto overflow-x-hidden p-4" 
                    ref={logsEndRef}
                    style={{ 
                        scrollBehavior: 'smooth',
                        maxHeight: 'calc(100vh - 200px)',
                        minHeight: '400px'
                    }}
                >
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
                                    className={`text-sm p-2 rounded border-l-4 transition-all duration-300 flex-shrink-0 ${
                                        log.type === 'found' ? 'border-green-500 bg-green-500/10' :
                                        log.type === 'error' ? 'border-red-500 bg-red-500/10' :
                                        log.type === 'compare' ? 'border-yellow-500 bg-yellow-500/10' :
                                        log.type === 'swap' ? 'border-orange-500 bg-orange-500/10' :
                                        log.type === 'start' ? 'border-cyan-500 bg-cyan-500/10' :
                                        log.type === 'warning' ? 'border-orange-600 bg-orange-600/10' :
                                        log.type === 'success' ? 'border-green-600 bg-green-600/10' :
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
