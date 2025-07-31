// components/Tools/Visualizer/DataStructureVisualizer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaRandom, FaPlus, FaMinus, FaSearch, FaTrash, FaEdit, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const DataStructureVisualizer = ({ algorithm, theme, speed = 50 }) => {
    const [elements, setElements] = useState([]);
    const [currentOperation, setCurrentOperation] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(800);
    const [speedControl, setSpeedControl] = useState(50);
    const [logs, setLogs] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [indexValue, setIndexValue] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [operationCount, setOperationCount] = useState(0);
    const [stackTop, setStackTop] = useState(-1);
    const [queueFront, setQueueFront] = useState(0);
    const [queueRear, setQueueRear] = useState(-1);
    const [currentDataStructure, setCurrentDataStructure] = useState('');
    const logsEndRef = useRef(null);
    const pauseRef = useRef(false);

    useEffect(() => {
        // Only initialize if the data structure has changed
        const dsName = algorithm?.name || 'Array Operations';
        if (currentDataStructure !== dsName) {
            setCurrentDataStructure(dsName);
            initializeDataStructure();
        }
    }, [algorithm?.name, currentDataStructure]);

    useEffect(() => {
        const delay = 1100 - (speedControl * 10);
        setAnimationSpeed(delay);
    }, [speedControl]);

    // Auto-scroll logs
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
                operation: operationCount
            }];
            return newLogs.slice(-100);
        });
    };

    const clearLogs = () => {
        setLogs([]);
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

    const initializeDataStructure = () => {
        const dsName = algorithm?.name || 'Array Operations';

        // Reset all states
        setHighlightedIndex(-1);
        setOperationCount(0);
        setIsAnimating(false);
        setIsPaused(false);
        setInputValue('');
        setSearchValue('');
        setIndexValue('');
        pauseRef.current = false;

        switch (dsName) {
            case 'Array Operations':
                setElements([10, 20, 30, 40, 50]);
                setStackTop(-1);
                setQueueFront(0);
                setQueueRear(-1);
                break;
            case 'Linked List':
                setElements([
                    { value: 10, next: 1, prev: null, id: 0 },
                    { value: 20, next: 2, prev: 0, id: 1 },
                    { value: 30, next: null, prev: 1, id: 2 }
                ]);
                setStackTop(-1);
                setQueueFront(0);
                setQueueRear(-1);
                break;
            case 'Doubly Linked List':
                setElements([
                    { value: 10, next: 1, prev: null, id: 0 },
                    { value: 20, next: 2, prev: 0, id: 1 },
                    { value: 30, next: null, prev: 1, id: 2 }
                ]);
                setStackTop(-1);
                setQueueFront(0);
                setQueueRear(-1);
                break;
            case 'Stack (LIFO)':
                setElements([10, 20, 30]);
                setStackTop(2);
                setQueueFront(0);
                setQueueRear(-1);
                break;
            case 'Queue (FIFO)':
            case 'Circular Queue':
                setElements([10, 20, 30]);
                setQueueFront(0);
                setQueueRear(2);
                setStackTop(-1);
                break;
            case 'Hash Table':
                setElements(Array(8).fill(null).map((_, i) => ({ index: i, value: null, key: null })));
                setStackTop(-1);
                setQueueFront(0);
                setQueueRear(-1);
                break;
            default:
                setElements([10, 20, 30, 40]);
                setStackTop(-1);
                setQueueFront(0);
                setQueueRear(-1);
        }

        clearLogs();
        addLog(`Initialized ${dsName}`, 'success');
    };

    const reset = () => {
        initializeDataStructure();
    };

    // Helper function to get display value from element
    const getElementValue = (element) => {
        if (typeof element === 'object' && element !== null) {
            return element.value;
        }
        return element;
    };

    // Helper function to get array display string
    const getArrayDisplayString = (elements) => {
        return elements.map(element => getElementValue(element)).join(', ');
    };

    // Array Operations
    const arrayInsert = async (value, index) => {
        setIsAnimating(true);
        const val = parseInt(value) || 0;
        const idx = parseInt(index);

        if (idx < 0 || idx > elements.length) {
            addLog(`Invalid index ${idx}. Must be between 0 and ${elements.length}`, 'error');
            setIsAnimating(false);
            return;
        }

        addLog(`Inserting ${val} at index ${idx}`, 'start');

        setHighlightedIndex(idx);
        await sleep(animationSpeed);

        for (let i = idx; i < elements.length; i++) {
            setHighlightedIndex(i);
            addLog(`Shifting element at index ${i} to the right`, 'info');
            await sleep(animationSpeed / 2);
        }

        const newElements = [...elements];
        newElements.splice(idx, 0, val);
        setElements(newElements);
        setHighlightedIndex(idx);

        addLog(`Inserted ${val} at index ${idx}. Array size: ${newElements.length}`, 'found');
        setOperationCount(prev => prev + 1);

        await sleep(animationSpeed);
        setHighlightedIndex(-1);
        setIsAnimating(false);
    };

    const arrayDelete = async (index) => {
        setIsAnimating(true);
        const idx = parseInt(index);

        if (idx < 0 || idx >= elements.length) {
            addLog(`Invalid index ${idx}. Array size: ${elements.length}`, 'error');
            setIsAnimating(false);
            return;
        }

        const deletedValue = getElementValue(elements[idx]);
        addLog(`Deleting element ${deletedValue} at index ${idx}`, 'start');

        setHighlightedIndex(idx);
        await sleep(animationSpeed);

        const newElements = [...elements];
        newElements.splice(idx, 1);
        setElements(newElements);

        for (let i = idx; i < newElements.length; i++) {
            setHighlightedIndex(i);
            addLog(`Shifting element at index ${i + 1} to the left`, 'info');
            await sleep(animationSpeed / 2);
        }

        addLog(`Deleted ${deletedValue}. Array size: ${newElements.length}`, 'found');
        setOperationCount(prev => prev + 1);

        await sleep(animationSpeed);
        setHighlightedIndex(-1);
        setIsAnimating(false);
    };

    const arraySearch = async (value) => {
        setIsAnimating(true);
        const val = parseInt(value) || 0;
        addLog(`Searching for ${val} in array`, 'start');

        for (let i = 0; i < elements.length; i++) {
            setHighlightedIndex(i);
            const currentValue = getElementValue(elements[i]);
            addLog(`Checking index ${i}: ${currentValue}`, 'compare');
            await sleep(animationSpeed);

            if (currentValue === val) {
                addLog(`Found ${val} at index ${i}!`, 'found');
                setOperationCount(prev => prev + 1);
                await sleep(animationSpeed * 2);
                setHighlightedIndex(-1);
                setIsAnimating(false);
                return;
            }
        }

        addLog(`${val} not found in array`, 'error');
        setOperationCount(prev => prev + 1);
        setHighlightedIndex(-1);
        setIsAnimating(false);
    };

    // Stack Operations
    const stackPush = async (value) => {
        setIsAnimating(true);
        const val = parseInt(value) || 0;

        addLog(`Pushing ${val} onto stack`, 'start');

        const newElements = [...elements, val];
        setElements(newElements);
        setStackTop(newElements.length - 1);
        setHighlightedIndex(newElements.length - 1);

        addLog(`Pushed ${val}. Stack size: ${newElements.length}`, 'found');
        setOperationCount(prev => prev + 1);

        await sleep(animationSpeed);
        setHighlightedIndex(-1);
        setIsAnimating(false);
    };

    const stackPop = async () => {
        setIsAnimating(true);

        if (elements.length === 0) {
            addLog('Cannot pop from empty stack', 'error');
            setIsAnimating(false);
            return;
        }

        const poppedValue = getElementValue(elements[elements.length - 1]);
        addLog(`Popping ${poppedValue} from stack`, 'start');

        setHighlightedIndex(elements.length - 1);
        await sleep(animationSpeed);

        const newElements = elements.slice(0, -1);
        setElements(newElements);
        setStackTop(newElements.length - 1);

        addLog(`Popped ${poppedValue}. Stack size: ${newElements.length}`, 'found');
        setOperationCount(prev => prev + 1);

        await sleep(animationSpeed);
        setHighlightedIndex(-1);
        setIsAnimating(false);
    };

    // Queue Operations
    const queueEnqueue = async (value) => {
        setIsAnimating(true);
        const val = parseInt(value) || 0;

        addLog(`Enqueuing ${val} to queue`, 'start');

        const newElements = [...elements, val];
        setElements(newElements);
        setQueueRear(newElements.length - 1);
        setHighlightedIndex(newElements.length - 1);

        addLog(`Enqueued ${val}. Queue size: ${newElements.length}`, 'found');
        setOperationCount(prev => prev + 1);

        await sleep(animationSpeed);
        setHighlightedIndex(-1);
        setIsAnimating(false);
    };

    const queueDequeue = async () => {
        setIsAnimating(true);

        if (elements.length === 0) {
            addLog('Cannot dequeue from empty queue', 'error');
            setIsAnimating(false);
            return;
        }

        const dequeuedValue = getElementValue(elements[0]);
        addLog(`Dequeuing ${dequeuedValue} from queue`, 'start');

        setHighlightedIndex(0);
        await sleep(animationSpeed);

        const newElements = elements.slice(1);
        setElements(newElements);
        setQueueFront(0);
        setQueueRear(newElements.length > 0 ? newElements.length - 1 : -1);

        addLog(`Dequeued ${dequeuedValue}. Queue size: ${newElements.length}`, 'found');
        setOperationCount(prev => prev + 1);

        await sleep(animationSpeed);
        setHighlightedIndex(-1);
        setIsAnimating(false);
    };

    // Linked List Operations
    const linkedListAdd = async (value, position = 'end') => {
        setIsAnimating(true);
        const val = parseInt(value) || 0;

        addLog(`Adding ${val} to ${position} of linked list`, 'start');

        const newNode = {
            value: val,
            next: null,
            prev: null,
            id: Date.now() + Math.random()
        };

        let newElements = [...elements];

        if (position === 'beginning' || elements.length === 0) {
            newNode.next = newElements.length > 0 ? 0 : null;
            if (newElements.length > 0) {
                newElements[0].prev = newElements.length;
            }
            newElements.unshift(newNode);

            newElements.forEach((node, index) => {
                node.id = index;
                if (index > 0) node.prev = index - 1;
                if (index < newElements.length - 1) node.next = index + 1;
            });
        } else {
            if (newElements.length > 0) {
                newElements[newElements.length - 1].next = newElements.length;
                newNode.prev = newElements.length - 1;
            }
            newNode.id = newElements.length;
            newElements.push(newNode);
        }

        setElements(newElements);
        setHighlightedIndex(position === 'beginning' ? 0 : newElements.length - 1);

        addLog(`Added ${val}. List size: ${newElements.length}`, 'found');
        setOperationCount(prev => prev + 1);

        await sleep(animationSpeed);
        setHighlightedIndex(-1);
        setIsAnimating(false);
    };

    const linkedListDelete = async (value) => {
        setIsAnimating(true);
        const val = parseInt(value) || 0;

        addLog(`Searching for ${val} to delete`, 'start');

        const indexToDelete = elements.findIndex(node => node.value === val);

        if (indexToDelete === -1) {
            addLog(`Value ${val} not found in list`, 'error');
            setIsAnimating(false);
            return;
        }

        setHighlightedIndex(indexToDelete);
        await sleep(animationSpeed);

        const newElements = elements.filter((_, index) => index !== indexToDelete);

        newElements.forEach((node, index) => {
            node.id = index;
            node.prev = index > 0 ? index - 1 : null;
            node.next = index < newElements.length - 1 ? index + 1 : null;
        });

        setElements(newElements);

        addLog(`Deleted ${val}. List size: ${newElements.length}`, 'found');
        setOperationCount(prev => prev + 1);

        await sleep(animationSpeed);
        setHighlightedIndex(-1);
        setIsAnimating(false);
    };

    // Hash Table Operations
    const hashFunction = (key) => {
        return Math.abs(key) % elements.length;
    };

    const hashInsert = async (key, value) => {
        setIsAnimating(true);
        const k = parseInt(key) || 0;
        const v = parseInt(value) || 0;

        const hash = hashFunction(k);
        addLog(`Inserting key ${k}, value ${v}. Hash: ${hash}`, 'start');

        setHighlightedIndex(hash);
        await sleep(animationSpeed);

        const newElements = [...elements];
        newElements[hash] = { index: hash, key: k, value: v };
        setElements(newElements);

        addLog(`Inserted at bucket ${hash}`, 'found');
        setOperationCount(prev => prev + 1);

        await sleep(animationSpeed);
        setHighlightedIndex(-1);
        setIsAnimating(false);
    };

    const renderDataStructure = () => {
        const dsName = algorithm?.name || 'Array Operations';

        switch (dsName) {
            case 'Array Operations':
                return renderArray();
            case 'Linked List':
                return renderLinkedList();
            case 'Doubly Linked List':
                return renderDoublyLinkedList();
            case 'Stack (LIFO)':
                return renderStack();
            case 'Queue (FIFO)':
            case 'Circular Queue':
                return renderQueue();
            case 'Hash Table':
                return renderHashTable();
            default:
                return renderArray();
        }
    };

    const renderArray = () => (
        <div className="flex flex-col items-center space-y-6">
            <h3 className={`${theme.highlight} text-xl font-semibold`}>Array Visualization</h3>
            <div className="flex gap-2 flex-wrap justify-center">
                {elements.map((value, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div
                            className={`
                                w-16 h-16 flex items-center justify-center rounded-lg border-2 
                                font-bold text-lg transition-all duration-300 transform
                                ${highlightedIndex === index
                                    ? 'bg-yellow-500 text-black border-yellow-400 scale-110'
                                    : 'bg-blue-500 text-white border-blue-400 hover:scale-105'
                                }
                            `}
                        >
                            {getElementValue(value)}
                        </div>
                        <div className={`mt-1 text-xs ${theme.cardText}`}>[{index}]</div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-4 items-center">
                <input
                    type="number"
                    placeholder="Value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-20`}
                    disabled={isAnimating}
                />
                <input
                    type="number"
                    placeholder="Index"
                    value={indexValue}
                    onChange={(e) => setIndexValue(e.target.value)}
                    className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-20`}
                    disabled={isAnimating}
                />
                <button
                    onClick={() => arrayInsert(inputValue, indexValue)}
                    disabled={isAnimating || !inputValue || indexValue === ''}
                    className={`px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50`}
                >
                    <FaPlus className="inline mr-1" /> Insert
                </button>
                <button
                    onClick={() => arrayDelete(indexValue)}
                    disabled={isAnimating || indexValue === ''}
                    className={`px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
                >
                    <FaMinus className="inline mr-1" /> Delete
                </button>
                <input
                    type="number"
                    placeholder="Search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-20`}
                    disabled={isAnimating}
                />
                <button
                    onClick={() => arraySearch(searchValue)}
                    disabled={isAnimating || !searchValue}
                    className={`px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50`}
                >
                    <FaSearch className="inline mr-1" /> Search
                </button>
            </div>
        </div>
    );

const renderStack = () => (
    <div className="flex items-start justify-center gap-8 w-full">
        {/* Left Side - Controls */}
        <div className="flex flex-col items-center space-y-6">
            <h3 className={`${theme.highlight} text-xl font-semibold`}>Stack Controls</h3>
            
            <div className="flex flex-col gap-4 items-center">
                <input
                    type="number"
                    placeholder="Value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-20`}
                    disabled={isAnimating}
                />
                <button
                    onClick={() => stackPush(inputValue)}
                    disabled={isAnimating || !inputValue}
                    className={`px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2`}
                >
                    <FaPlus className="text-sm" /> Push
                </button>
                <button
                    onClick={stackPop}
                    disabled={isAnimating || elements.length === 0}
                    className={`px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2`}
                >
                    <FaMinus className="text-sm" /> Pop
                </button>
            </div>
        </div>

        {/* Right Side - Stack Visualization */}
        <div className="flex flex-col items-center space-y-6">
            <h3 className={`${theme.highlight} text-xl font-semibold`}>Stack Visualization (LIFO)</h3>
            
            <div className="flex flex-col items-center">
                <div className={`text-sm ${theme.highlight} font-bold mb-2 flex items-center gap-2`}>
                    <span>TOP (Push/Pop here)</span>
                    <span className="animate-pulse">↓</span>
                </div>
                
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-8 w-1 bg-gray-500"></div>
                    <div className="absolute right-0 top-0 bottom-8 w-1 bg-gray-500"></div>
                    
                    <div 
                        className="flex flex-col-reverse gap-1 px-4 py-2 bg-gray-800/20"
                        style={{ 
                            minHeight: '120px',
                            maxHeight: '400px',
                            width: '140px',
                            overflowY: elements.length > 8 ? 'auto' : 'visible'
                        }}
                    >
                        {elements.length === 0 ? (
                            <div className={`text-center ${theme.cardText} py-8 text-sm`}>
                                Stack is empty
                            </div>
                        ) : (
                            elements.map((value, index) => (
                                <div key={index} className="flex items-center justify-center relative">
                                    <div
                                        className={`
                                            w-28 h-10 flex items-center justify-center rounded-lg border-2 
                                            font-bold text-lg transition-all duration-300 transform
                                            ${highlightedIndex === index 
                                                ? 'bg-yellow-500 text-black border-yellow-400 scale-110 shadow-lg' 
                                                : index === stackTop 
                                                    ? 'bg-green-500 text-white border-green-400 shadow-md' 
                                                    : 'bg-blue-500 text-white border-blue-400'
                                            }
                                        `}
                                    >
                                        {getElementValue(value)}
                                    </div>
                                    {index === stackTop && (
                                        <div className="absolute -right-12 flex items-center">
                                            <FaArrowLeft className={`${theme.highlight} animate-pulse`} />
                                            <span className={`text-xs ${theme.highlight} font-bold ml-1`}>TOP</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="w-36 h-6 bg-gray-600 rounded-b-lg border-2 border-gray-500 -mx-2"></div>
                </div>
                
                {elements.length > 0 && (
                    <div className={`text-xs ${theme.cardText} mt-2`}>
                        Stack Size: {elements.length}
                    </div>
                )}
            </div>
        </div>
    </div>
);



    const renderQueue = () => (
        <div className="flex flex-col items-center space-y-6">
            <h3 className={`${theme.highlight} text-xl font-semibold`}>Queue Visualization (FIFO)</h3>

            <div className="relative">
                <div className="flex flex-col items-center">
                    <div className="flex justify-between w-full max-w-md mb-2">
                        <div className={`text-sm ${theme.highlight} font-bold`}>
                            ← FRONT (Dequeue)
                        </div>
                        <div className={`text-sm ${theme.highlight} font-bold`}>
                            REAR (Enqueue) →
                        </div>
                    </div>

                    <div className="bg-gray-800/30 border-2 border-gray-500 rounded-lg p-3 min-w-[400px] min-h-[100px] flex items-center justify-center overflow-x-auto">
                        {elements.length === 0 ? (
                            <div className={`text-center ${theme.cardText} py-4`}>
                                Queue is empty
                            </div>
                        ) : (
                            <div className="flex gap-2 items-center">
                                {elements.map((value, index) => (
                                    <div key={index} className="flex flex-col items-center relative">
                                        <div
                                            className={`
                                                w-16 h-16 flex items-center justify-center rounded-lg border-2 
                                                font-bold text-lg transition-all duration-300 transform
                                                ${highlightedIndex === index
                                                    ? 'bg-yellow-500 text-black border-yellow-400 scale-110'
                                                    : index === queueFront
                                                        ? 'bg-green-500 text-white border-green-400'
                                                        : index === queueRear
                                                            ? 'bg-red-500 text-white border-red-400'
                                                            : 'bg-blue-500 text-white border-blue-400'
                                                }
                                            `}
                                        >
                                            {getElementValue(value)}
                                        </div>
                                        <div className={`mt-1 text-xs ${theme.cardText} font-bold`}>
                                            {index === queueFront && 'FRONT'}
                                            {index === queueRear && 'REAR'}
                                            {index !== queueFront && index !== queueRear && `[${index}]`}
                                        </div>
                                        {index < elements.length - 1 && (
                                            <FaArrowRight className={`absolute top-6 -right-4 ${theme.cardText} text-xs`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <input
                    type="number"
                    placeholder="Value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-20`}
                    disabled={isAnimating}
                />
                <button
                    onClick={() => queueEnqueue(inputValue)}
                    disabled={isAnimating || !inputValue}
                    className={`px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50`}
                >
                    <FaPlus className="inline mr-1" /> Enqueue
                </button>
                <button
                    onClick={queueDequeue}
                    disabled={isAnimating || elements.length === 0}
                    className={`px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
                >
                    <FaMinus className="inline mr-1" /> Dequeue
                </button>
            </div>
        </div>
    );

    const renderLinkedList = () => (
        <div className="flex flex-col items-center space-y-6">
            <h3 className={`${theme.highlight} text-xl font-semibold`}>Linked List Visualization</h3>

            <div className="overflow-x-auto w-full flex justify-center">
                <div className="flex items-center gap-2 min-w-max p-4">
                    <div className="flex flex-col items-center">
                        <div className={`text-sm ${theme.highlight} font-bold mb-2`}>HEAD</div>
                        <FaArrowRight className={`${theme.highlight}`} />
                    </div>

                    {elements.map((node, index) => (
                        <div key={node.id} className="flex items-center">
                            <div
                                className={`
                                    flex items-center bg-blue-500 text-white rounded-lg border-2 border-blue-400
                                    transition-all duration-300 transform
                                    ${highlightedIndex === index ? 'bg-yellow-500 text-black border-yellow-400 scale-110' : ''}
                                `}
                            >
                                <div className="px-4 py-3 font-bold text-lg">{node.value}</div>
                                <div className="px-2 py-3 border-l border-blue-300 text-sm">
                                    {index < elements.length - 1 ? '→' : 'NULL'}
                                </div>
                            </div>
                            {index < elements.length - 1 && (
                                <FaArrowRight className={`mx-2 ${theme.cardText}`} />
                            )}
                        </div>
                    ))}

                    {elements.length === 0 && (
                        <div className={`text-center ${theme.cardText} py-4`}>
                            List is empty
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-center">
                <input
                    type="number"
                    placeholder="Value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-20`}
                    disabled={isAnimating}
                />
                <button
                    onClick={() => linkedListAdd(inputValue, 'beginning')}
                    disabled={isAnimating || !inputValue}
                    className={`px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50`}
                >
                    <FaPlus className="inline mr-1" /> Add to Head
                </button>
                <button
                    onClick={() => linkedListAdd(inputValue, 'end')}
                    disabled={isAnimating || !inputValue}
                    className={`px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50`}
                >
                    <FaPlus className="inline mr-1" /> Add to Tail
                </button>
                <input
                    type="number"
                    placeholder="Delete Value"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-24`}
                    disabled={isAnimating}
                />
                <button
                    onClick={() => linkedListDelete(searchValue)}
                    disabled={isAnimating || !searchValue}
                    className={`px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
                >
                    <FaTrash className="inline mr-1" /> Delete
                </button>
            </div>
        </div>
    );

    const renderDoublyLinkedList = () => (
        <div className="flex flex-col items-center space-y-6">
            <h3 className={`${theme.highlight} text-xl font-semibold`}>Doubly Linked List Visualization</h3>

            <div className="overflow-x-auto w-full flex justify-center">
                <div className="flex items-center gap-2 min-w-max p-4">
                    <div className="flex flex-col items-center">
                        <div className={`text-sm ${theme.highlight} font-bold mb-2`}>HEAD</div>
                        <FaArrowRight className={`${theme.highlight}`} />
                    </div>

                    {elements.map((node, index) => (
                        <div key={node.id} className="flex items-center">
                            <div
                                className={`
                                    flex items-center bg-purple-500 text-white rounded-lg border-2 border-purple-400
                                    transition-all duration-300 transform
                                    ${highlightedIndex === index ? 'bg-yellow-500 text-black border-yellow-400 scale-110' : ''}
                                `}
                            >
                                <div className="px-2 py-3 text-sm">
                                    {index > 0 ? '←' : 'NULL'}
                                </div>
                                <div className="px-4 py-3 font-bold text-lg border-x border-purple-300">{node.value}</div>
                                <div className="px-2 py-3 text-sm">
                                    {index < elements.length - 1 ? '→' : 'NULL'}
                                </div>
                            </div>
                            {index < elements.length - 1 && (
                                <div className="flex flex-col items-center mx-2">
                                    <FaArrowRight className={`${theme.cardText} text-xs`} />
                                    <FaArrowLeft className={`${theme.cardText} text-xs mt-1`} />
                                </div>
                            )}
                        </div>
                    ))}

                    {elements.length === 0 && (
                        <div className={`text-center ${theme.cardText} py-4`}>
                            List is empty
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-center">
                <input
                    type="number"
                    placeholder="Value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-20`}
                    disabled={isAnimating}
                />
                <button
                    onClick={() => linkedListAdd(inputValue, 'beginning')}
                    disabled={isAnimating || !inputValue}
                    className={`px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50`}
                >
                    <FaPlus className="inline mr-1" /> Add to Head
                </button>
                <button
                    onClick={() => linkedListAdd(inputValue, 'end')}
                    disabled={isAnimating || !inputValue}
                    className={`px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50`}
                >
                    <FaPlus className="inline mr-1" /> Add to Tail
                </button>
                <input
                    type="number"
                    placeholder="Delete Value"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-24`}
                    disabled={isAnimating}
                />
                <button
                    onClick={() => linkedListDelete(searchValue)}
                    disabled={isAnimating || !searchValue}
                    className={`px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
                >
                    <FaTrash className="inline mr-1" /> Delete
                </button>
            </div>
        </div>
    );

    const renderHashTable = () => (
        <div className="flex flex-col items-center space-y-6">
            <h3 className={`${theme.highlight} text-xl font-semibold`}>Hash Table Visualization</h3>
            <div className="grid grid-cols-4 gap-4">
                {elements.map((bucket, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className={`text-xs ${theme.cardText} mb-1`}>Bucket {index}</div>
                        <div
                            className={`
                                w-20 h-16 flex flex-col items-center justify-center rounded-lg border-2 
                                text-sm transition-all duration-300 transform
                                ${highlightedIndex === index
                                    ? 'bg-yellow-500 text-black border-yellow-400 scale-110'
                                    : bucket.value !== null
                                        ? 'bg-green-500 text-white border-green-400'
                                        : 'bg-gray-600 text-gray-300 border-gray-500'
                                }
                            `}
                        >
                            {bucket.value !== null ? (
                                <>
                                    <div className="font-bold">K:{bucket.key}</div>
                                    <div>V:{bucket.value}</div>
                                </>
                            ) : (
                                'Empty'
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 items-center">
                <input
                    type="number"
                    placeholder="Key"
                    value={indexValue}
                    onChange={(e) => setIndexValue(e.target.value)}
                    className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-20`}
                    disabled={isAnimating}
                />
                <input
                    type="number"
                    placeholder="Value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-20`}
                    disabled={isAnimating}
                />
                <button
                    onClick={() => hashInsert(indexValue, inputValue)}
                    disabled={isAnimating || !inputValue || indexValue === ''}
                    className={`px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50`}
                >
                    <FaPlus className="inline mr-1" /> Insert
                </button>
            </div>
        </div>
    );

    const getLogColor = (type) => {
        switch (type) {
            case 'start': return 'text-cyan-400';
            case 'found': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'compare': return 'text-yellow-400';
            case 'info': return 'text-blue-400';
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

    return (
        <div className="h-full flex gap-6 overflow-hidden">
            {/* Main Visualization Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Controls */}
                <div className={`${theme.cardBg} rounded-lg p-6 mb-6 border ${theme.border} flex-shrink-0`}>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <button
                            onClick={initializeDataStructure}
                            disabled={isAnimating}
                            className={`px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50`}
                        >
                            <FaRandom className="text-sm" />
                            Initialize
                        </button>

                        <button
                            onClick={reset}
                            className={`px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2`}
                        >
                            <FaStop className="text-sm" />
                            Reset
                        </button>

                        <button
                            onClick={clearLogs}
                            className={`px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700`}
                        >
                            Clear Logs
                        </button>

                        <div className="flex items-center gap-2">
                            <label className={`${theme.cardText} text-sm`}>Speed:</label>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={speedControl}
                                onChange={(e) => setSpeedControl(parseInt(e.target.value))}
                                className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                disabled={isAnimating}
                            />
                            <span className={`${theme.cardText} text-sm`}>{getSpeedLabel(speedControl)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                        <span className={`${theme.cardText}`}>
                            Data Structure: <span className={`${theme.highlight} font-bold`}>{algorithm?.name || 'Array Operations'}</span>
                        </span>
                        <span className={`${theme.cardText}`}>
                            Elements: <span className={`${theme.highlight} font-bold`}>{elements.length}</span>
                        </span>
                        <span className={`${theme.cardText}`}>
                            Operations: <span className={`${theme.highlight} font-bold`}>{operationCount}</span>
                        </span>
                        <span className={`${theme.cardText}`}>
                            Status: <span className={`${isAnimating ? theme.infoColor : theme.successColor} font-bold`}>
                                {isAnimating ? 'Processing...' : 'Ready'}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Data Structure Visualization */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="flex flex-col items-center justify-start min-h-full">
                        {renderDataStructure()}

                        {/* Current Array Display - FIXED */}
                        <div className={`mb-4 text-sm ${theme.cardText} text-center mt-4`}>
                            Current Array: [{getArrayDisplayString(elements)}]
                        </div>

                        {/* Data Structure Info */}
                        <div className={`${theme.cardBg} rounded-lg p-4 border ${theme.border} w-full max-w-2xl mt-8`}>
                            <h3 className={`${theme.highlight} font-semibold mb-2`}>{algorithm?.name || 'Array Operations'}</h3>
                            <p className={`${theme.cardText} text-sm mb-2`}>
                                Time Complexity: <span className={`${theme.infoColor} font-mono`}>{algorithm?.complexity || 'O(1)'}</span>
                            </p>
                            <p className={`${theme.cardText} text-sm`}>
                                Difficulty: <span className={`${algorithm?.difficulty === 'Easy' ? 'text-green-400' :
                                        algorithm?.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                                    } font-bold`}>
                                    {algorithm?.difficulty || 'Easy'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Sidebar */}
            <div className={`w-80 ${theme.cardBg} rounded-lg border ${theme.border} flex flex-col flex-shrink-0 h-full`}>
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                    <h3 className={`${theme.highlight} font-semibold`}>
                        Operation Log
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
                                No operations performed yet. <br />
                                Try some operations above!
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div
                                    key={log.id}
                                    className={`text-sm p-2 rounded border-l-4 transition-all duration-300 flex-shrink-0 ${log.type === 'found' ? 'border-green-500 bg-green-500/10' :
                                            log.type === 'error' ? 'border-red-500 bg-red-500/10' :
                                                log.type === 'compare' ? 'border-yellow-500 bg-yellow-500/10' :
                                                    log.type === 'start' ? 'border-cyan-500 bg-cyan-500/10' :
                                                        log.type === 'success' ? 'border-green-600 bg-green-600/10' :
                                                            log.type === 'info' ? 'border-blue-500 bg-blue-500/10' :
                                                                'border-gray-500 bg-gray-500/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-gray-500 text-xs">{log.timestamp}</span>
                                        <span className="bg-gray-700 px-1 rounded text-xs">Op #{log.operation}</span>
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

export default DataStructureVisualizer;
