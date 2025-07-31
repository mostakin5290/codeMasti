// components/Tools/Visualizer/TreeVisualizer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaRandom, FaPlus, FaMinus, FaSearch, FaTrash, FaStepForward, FaStepBackward, FaRedo, FaTachometerAlt } from 'react-icons/fa';

const TreeVisualizer = ({ algorithm, theme, speed = 50 }) => {
    const [treeData, setTreeData] = useState(null);
    const [traversalSequence, setTraversalSequence] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(800);
    const [speedControl, setSpeedControl] = useState(50);
    const [logs, setLogs] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [highlightedNodes, setHighlightedNodes] = useState([]);
    const [visitedNodes, setVisitedNodes] = useState([]);
    const [operationCount, setOperationCount] = useState(0);
    const [currentTraversalType, setCurrentTraversalType] = useState('inorder');
    const [nodeIdCounter, setNodeIdCounter] = useState(100);
    const [pathNodes, setPathNodes] = useState([]);
    const [activeEdges, setActiveEdges] = useState([]);
    const timerRef = useRef(null);
    const pauseRef = useRef(false);
    const logsEndRef = useRef(null);

    useEffect(() => {
        initializeTree();
    }, [algorithm?.name]);

    useEffect(() => {
        const delay = 1100 - (speedControl * 10);
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

    const initializeTree = () => {
        const algorithmName = algorithm?.name || 'Binary Tree Traversal';
        
        let sampleTree;
        switch (algorithmName) {
            case 'Binary Tree Traversal':
            case 'Binary Search Tree':
                sampleTree = {
                    value: 50, id: 50,
                    left: {
                        value: 30, id: 30,
                        left: { value: 20, id: 20, left: null, right: null },
                        right: { value: 40, id: 40, left: null, right: null }
                    },
                    right: {
                        value: 70, id: 70,
                        left: { value: 60, id: 60, left: null, right: null },
                        right: { value: 80, id: 80, left: null, right: null }
                    }
                };
                break;

            case 'AVL Tree':
                sampleTree = {
                    value: 50, id: 50, height: 2, balance: 0,
                    left: {
                        value: 30, id: 30, height: 1, balance: 0,
                        left: { value: 20, id: 20, height: 0, balance: 0, left: null, right: null },
                        right: { value: 40, id: 40, height: 0, balance: 0, left: null, right: null }
                    },
                    right: {
                        value: 70, id: 70, height: 1, balance: 0,
                        left: { value: 60, id: 60, height: 0, balance: 0, left: null, right: null },
                        right: { value: 80, id: 80, height: 0, balance: 0, left: null, right: null }
                    }
                };
                break;

            case 'Red-Black Tree':
                sampleTree = {
                    value: 50, id: 50, color: 'black',
                    left: {
                        value: 30, id: 30, color: 'red',
                        left: { value: 20, id: 20, color: 'black', left: null, right: null },
                        right: { value: 40, id: 40, color: 'black', left: null, right: null }
                    },
                    right: {
                        value: 70, id: 70, color: 'red',
                        left: { value: 60, id: 60, color: 'black', left: null, right: null },
                        right: { value: 80, id: 80, color: 'black', left: null, right: null }
                    }
                };
                break;

            case 'Heap (Binary)':
                sampleTree = {
                    value: 90, id: 90,
                    left: {
                        value: 80, id: 80,
                        left: { value: 70, id: 70, left: null, right: null },
                        right: { value: 60, id: 60, left: null, right: null }
                    },
                    right: {
                        value: 85, id: 85,
                        left: { value: 50, id: 50, left: null, right: null },
                        right: { value: 40, id: 40, left: null, right: null }
                    }
                };
                break;

            case 'Trie (Prefix Tree)':
                sampleTree = {
                    value: '●', id: 'root', isEnd: false,
                    children: {
                        'c': {
                            value: 'c', id: 'c', isEnd: false,
                            children: {
                                'a': {
                                    value: 'a', id: 'ca', isEnd: false,
                                    children: {
                                        't': { value: 't', id: 'cat', isEnd: true, children: {} }
                                    }
                                }
                            }
                        },
                        'd': {
                            value: 'd', id: 'd', isEnd: false,
                            children: {
                                'o': {
                                    value: 'o', id: 'do', isEnd: false,
                                    children: {
                                        'g': { value: 'g', id: 'dog', isEnd: true, children: {} }
                                    }
                                }
                            }
                        }
                    }
                };
                break;

            default:
                sampleTree = {
                    value: 50, id: 50,
                    left: {
                        value: 30, id: 30,
                        left: { value: 20, id: 20, left: null, right: null },
                        right: { value: 40, id: 40, left: null, right: null }
                    },
                    right: {
                        value: 70, id: 70,
                        left: { value: 60, id: 60, left: null, right: null },
                        right: { value: 80, id: 80, left: null, right: null }
                    }
                };
        }

        setTreeData(sampleTree);
        setTraversalSequence([]);
        setCurrentStep(0);
        setVisitedNodes([]);
        setHighlightedNodes([]);
        setPathNodes([]);
        setActiveEdges([]);
        setOperationCount(0);
        setIsAnimating(false);
        setIsPaused(false);
        pauseRef.current = false;
        clearLogs();
        addLog(`Initialized ${algorithmName}`, 'success');
    };

    const reset = () => {
        setCurrentStep(0);
        setVisitedNodes([]);
        setHighlightedNodes([]);
        setPathNodes([]);
        setActiveEdges([]);
        setIsAnimating(false);
        setIsPaused(false);
        pauseRef.current = false;
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        addLog('Tree visualization reset', 'info');
    };

    // Tree Traversal Algorithms
    const inorderTraversal = (node, sequence = []) => {
        if (!node) return sequence;
        inorderTraversal(node.left, sequence);
        sequence.push(node);
        inorderTraversal(node.right, sequence);
        return sequence;
    };

    const preorderTraversal = (node, sequence = []) => {
        if (!node) return sequence;
        sequence.push(node);
        preorderTraversal(node.left, sequence);
        preorderTraversal(node.right, sequence);
        return sequence;
    };

    const postorderTraversal = (node, sequence = []) => {
        if (!node) return sequence;
        postorderTraversal(node.left, sequence);
        postorderTraversal(node.right, sequence);
        sequence.push(node);
        return sequence;
    };

    const levelOrderTraversal = (root) => {
        if (!root) return [];
        const queue = [root];
        const sequence = [];
        
        while (queue.length > 0) {
            const node = queue.shift();
            sequence.push(node);
            
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        
        return sequence;
    };

    const startTraversal = async (type = 'inorder') => {
        if (!treeData) return;

        reset();
        setIsAnimating(true);
        pauseRef.current = false;

        let sequence = [];
        switch (type) {
            case 'inorder':
                sequence = inorderTraversal(treeData);
                addLog('Starting In-order Traversal (Left → Root → Right)', 'start');
                break;
            case 'preorder':
                sequence = preorderTraversal(treeData);
                addLog('Starting Pre-order Traversal (Root → Left → Right)', 'start');
                break;
            case 'postorder':
                sequence = postorderTraversal(treeData);
                addLog('Starting Post-order Traversal (Left → Right → Root)', 'start');
                break;
            case 'levelorder':
                sequence = levelOrderTraversal(treeData);
                addLog('Starting Level-order Traversal (Breadth-First)', 'start');
                break;
        }

        setTraversalSequence(sequence);
        setCurrentTraversalType(type);

        for (let i = 0; i < sequence.length; i++) {
            if (pauseRef.current) await sleep(0);
            
            setCurrentStep(i + 1);
            setHighlightedNodes([sequence[i].id]);
            setVisitedNodes(prev => [...prev, sequence[i].id]);
            
            // Highlight path to current node
            if (i > 0) {
                const pathToNode = findPathToNode(treeData, sequence[i].id);
                setPathNodes(pathToNode);
                setActiveEdges(getEdgesForPath(pathToNode));
            }
            
            addLog(`Visiting node: ${sequence[i].value}`, 'visit');
            setOperationCount(prev => prev + 1);
            
            await sleep(animationSpeed);
            setHighlightedNodes([]);
        }

        addLog(`${type.charAt(0).toUpperCase() + type.slice(1)} traversal completed!`, 'found');
        setPathNodes([]);
        setActiveEdges([]);
        setIsAnimating(false);
        setIsPaused(false);
    };

    // Helper functions for path visualization
    const findPathToNode = (root, targetId, path = []) => {
        if (!root) return null;
        
        path.push(root.id);
        
        if (root.id === targetId) {
            return [...path];
        }
        
        const leftPath = root.left ? findPathToNode(root.left, targetId, path) : null;
        if (leftPath) return leftPath;
        
        const rightPath = root.right ? findPathToNode(root.right, targetId, path) : null;
        if (rightPath) return rightPath;
        
        path.pop();
        return null;
    };

    const getEdgesForPath = (path) => {
        const edges = [];
        for (let i = 0; i < path.length - 1; i++) {
            edges.push(`${path[i]}-${path[i + 1]}`);
        }
        return edges;
    };

    // BST Operations
    const bstInsert = async (value) => {
        if (!treeData) return;
        
        const val = parseInt(value) || 0;
        setIsAnimating(true);
        addLog(`Inserting ${val} into BST`, 'start');
        
        const insertNode = async (node, newValue, path = []) => {
            if (!node) {
                const newNode = { value: newValue, id: nodeIdCounter, left: null, right: null };
                setNodeIdCounter(prev => prev + 1);
                return newNode;
            }
            
            path.push(node.id);
            setHighlightedNodes([node.id]);
            setPathNodes([...path]);
            setActiveEdges(getEdgesForPath(path));
            
            addLog(`Comparing ${newValue} with ${node.value}`, 'compare');
            await sleep(animationSpeed);
            
            if (newValue < node.value) {
                addLog(`${newValue} < ${node.value}, go left`, 'info');
                node.left = await insertNode(node.left, newValue, path);
            } else if (newValue > node.value) {
                addLog(`${newValue} > ${node.value}, go right`, 'info');
                node.right = await insertNode(node.right, newValue, path);
            } else {
                addLog(`${newValue} already exists in tree`, 'warning');
            }
            
            setHighlightedNodes([]);
            return node;
        };
        
        const newTree = await insertNode({ ...treeData }, val);
        setTreeData(newTree);
        addLog(`Inserted ${val} into BST`, 'found');
        setOperationCount(prev => prev + 1);
        setPathNodes([]);
        setActiveEdges([]);
        setIsAnimating(false);
    };

    const bstSearch = async (value) => {
        if (!treeData) return;
        
        const val = parseInt(value) || 0;
        setIsAnimating(true);
        addLog(`Searching for ${val} in BST`, 'start');
        
        const searchNode = async (node, path = []) => {
            if (!node) {
                addLog(`${val} not found in tree`, 'error');
                return false;
            }
            
            path.push(node.id);
            setHighlightedNodes([node.id]);
            setPathNodes([...path]);
            setActiveEdges(getEdgesForPath(path));
            
            addLog(`Checking node: ${node.value}`, 'compare');
            await sleep(animationSpeed);
            
            if (val === node.value) {
                addLog(`Found ${val}!`, 'found');
                setVisitedNodes([node.id]);
                return true;
            } else if (val < node.value) {
                addLog(`${val} < ${node.value}, search left`, 'info');
                return await searchNode(node.left, path);
            } else {
                addLog(`${val} > ${node.value}, search right`, 'info');
                return await searchNode(node.right, path);
            }
        };
        
        await searchNode(treeData);
        setOperationCount(prev => prev + 1);
        setHighlightedNodes([]);
        setPathNodes([]);
        setActiveEdges([]);
        setIsAnimating(false);
    };

    // Enhanced tree rendering with better connections
    const renderBinaryTree = (node, x = 0, y = 0, level = 0, parentX = null, parentY = null) => {
        if (!node) return null;

        const isHighlighted = highlightedNodes.includes(node.id);
        const isVisited = visitedNodes.includes(node.id);
        const isInPath = pathNodes.includes(node.id);
        const nodeSize = 50;
        const levelGap = 90;
        const horizontalGap = Math.max(150 / (level + 1), 40);

        return (
            <g key={node.id}>
                {/* Enhanced connection from parent */}
                {parentX !== null && parentY !== null && (
                    <g>
                        {/* Main connection line */}
                        <line
                            x1={parentX}
                            y1={parentY + nodeSize/2}
                            x2={x}
                            y2={y - nodeSize/2}
                            stroke={
                                activeEdges.includes(`${node.id}`) || isInPath ? '#06b6d4' : '#6b7280'
                            }
                            strokeWidth={
                                activeEdges.includes(`${node.id}`) || isInPath ? '4' : '2'
                            }
                            className="transition-all duration-300"
                        />
                        
                        {/* Arrow head */}
                        <polygon
                            points={`${x-5},${y-nodeSize/2-5} ${x+5},${y-nodeSize/2-5} ${x},${y-nodeSize/2+2}`}
                            fill={
                                activeEdges.includes(`${node.id}`) || isInPath ? '#06b6d4' : '#6b7280'
                            }
                            className="transition-all duration-300"
                        />
                    </g>
                )}

                {/* Enhanced node circle with gradient and shadow */}
                <g>
                    {/* Shadow */}
                    <circle
                        cx={x + 2}
                        cy={y + 2}
                        r={nodeSize/2}
                        fill="rgba(0,0,0,0.3)"
                    />
                    
                    {/* Main node */}
                    <circle
                        cx={x}
                        cy={y}
                        r={nodeSize/2}
                        fill={
                            isHighlighted ? '#facc15' : 
                            isVisited ? '#22c55e' : 
                            isInPath ? '#06b6d4' :
                            algorithm?.name === 'Red-Black Tree' && node.color === 'red' ? '#dc2626' :
                            '#374151'
                        }
                        stroke={
                            isHighlighted ? '#f59e0b' : 
                            isVisited ? '#16a34a' : 
                            isInPath ? '#0284c7' :
                            '#4f46e5'
                        }
                        strokeWidth="3"
                        className="transition-all duration-300 transform hover:scale-110 cursor-pointer"
                    />
                    
                    {/* Node text */}
                    <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                        className="pointer-events-none"
                    >
                        {node.value}
                    </text>

                    {/* Additional info for special trees */}
                    {algorithm?.name === 'AVL Tree' && node.balance !== undefined && (
                        <text
                            x={x + nodeSize/2 + 10}
                            y={y - nodeSize/2 - 5}
                            fill="#06b6d4"
                            fontSize="10"
                            fontWeight="bold"
                        >
                            B:{node.balance}
                        </text>
                    )}
                </g>

                {/* Render children */}
                {node.left && renderBinaryTree(node.left, x - horizontalGap, y + levelGap, level + 1, x, y)}
                {node.right && renderBinaryTree(node.right, x + horizontalGap, y + levelGap, level + 1, x, y)}
            </g>
        );
    };

    // Enhanced Trie rendering
    const renderTrie = (node, x = 0, y = 0, level = 0, parentX = null, parentY = null) => {
        if (!node) return null;

        const isHighlighted = highlightedNodes.includes(node.id);
        const isVisited = visitedNodes.includes(node.id);
        const isInPath = pathNodes.includes(node.id);
        const nodeSize = 35;
        const levelGap = 70;
        const horizontalGap = Math.max(120 / (level + 1), 30);

        const children = node.children ? Object.values(node.children) : [];
        
        return (
            <g key={node.id}>
                {/* Connection from parent */}
                {parentX !== null && parentY !== null && (
                    <line
                        x1={parentX}
                        y1={parentY + nodeSize/2}
                        x2={x}
                        y2={y - nodeSize/2}
                        stroke={isInPath ? '#06b6d4' : '#6b7280'}
                        strokeWidth={isInPath ? '3' : '2'}
                        className="transition-all duration-300"
                    />
                )}
                
                {/* Node */}
                <circle
                    cx={x}
                    cy={y}
                    r={nodeSize/2}
                    fill={
                        isHighlighted ? '#facc15' : 
                        isVisited ? '#22c55e' : 
                        isInPath ? '#06b6d4' :
                        node.isEnd ? '#8b5cf6' : '#374151'
                    }
                    stroke={
                        isHighlighted ? '#f59e0b' : 
                        isVisited ? '#16a34a' : 
                        isInPath ? '#0284c7' :
                        node.isEnd ? '#7c3aed' : '#4f46e5'
                    }
                    strokeWidth="3"
                    className="transition-all duration-300"
                />
                
                {/* Node text */}
                <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                >
                    {node.value}
                </text>

                {/* End of word indicator */}
                {node.isEnd && (
                    <circle
                        cx={x + nodeSize/2 + 8}
                        cy={y - nodeSize/2 - 8}
                        r="4"
                        fill="#10b981"
                        stroke="#059669"
                        strokeWidth="2"
                    />
                )}

                {/* Render children */}
                {children.map((child, index) => {
                    const childX = x + (index - (children.length - 1) / 2) * horizontalGap;
                    return renderTrie(child, childX, y + levelGap, level + 1, x, y);
                })}
            </g>
        );
    };

    const togglePlayPause = () => {
        if (isAnimating) {
            setIsPaused(!isPaused);
            pauseRef.current = !isPaused;
            addLog(isPaused ? 'Resumed' : 'Paused', 'warning');
        }
    };

    const stepForward = () => {
        if (traversalSequence.length > 0 && currentStep < traversalSequence.length) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            if (nextStep <= traversalSequence.length) {
                const node = traversalSequence[nextStep - 1];
                setHighlightedNodes([node.id]);
                setVisitedNodes(prev => [...prev, node.id]);
                addLog(`Step forward: Visiting node ${node.value}`, 'visit');
                setTimeout(() => setHighlightedNodes([]), 500);
            }
        }
    };

    const stepBackward = () => {
        if (currentStep > 0) {
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);
            if (prevStep >= 0 && traversalSequence.length > 0) {
                const nodeToRemove = traversalSequence[prevStep];
                setVisitedNodes(prev => prev.filter(id => id !== nodeToRemove.id));
                addLog(`Step backward: Removed node ${nodeToRemove.value}`, 'info');
            }
        }
    };

    const getLogColor = (type) => {
        switch (type) {
            case 'start': return 'text-cyan-400';
            case 'found': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'compare': return 'text-yellow-400';
            case 'visit': return 'text-blue-400';
            case 'warning': return 'text-orange-400';
            case 'success': return 'text-green-400';
            default: return theme.cardText;
        }
    };

    const renderTreeVisualization = () => {
        const algorithmName = algorithm?.name || 'Binary Tree Traversal';
        
        if (algorithmName === 'Trie (Prefix Tree)') {
            return (
                <div className="flex flex-col items-center space-y-6">
                    <h3 className={`${theme.highlight} text-xl font-semibold`}>Trie (Prefix Tree) Visualization</h3>
                    
                    <div className="border-2 border-gray-600 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 p-4">
                        <svg width="700" height="450" className="rounded-lg">
                            {/* Grid background */}
                            <defs>
                                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                            
                            {treeData && renderTrie(treeData, 350, 60)}
                        </svg>
                    </div>
                    
                    <div className="text-center">
                        <p className={`${theme.cardText} text-sm mb-2`}>
                            Words stored: <span className={`${theme.highlight} font-mono`}>"cat", "dog"</span>
                        </p>
                        <p className={`${theme.cardText} text-xs`}>
                            🟣 Purple nodes indicate end of word • 🟢 Green circle = word endpoint
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center space-y-6">
                <h3 className={`${theme.highlight} text-xl font-semibold`}>
                    {algorithmName} Visualization
                </h3>
                
                <div className="border-2 border-gray-600 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 p-4">
                    <svg width="800" height="500" className="rounded-lg">
                        {/* Grid background */}
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        
                        {treeData && renderBinaryTree(treeData, 400, 60)}
                    </svg>
                </div>
                
                {/* Enhanced Controls */}
                <div className="flex flex-col space-y-4 w-full max-w-4xl">
                    {/* Traversal Controls */}
                    {algorithmName === 'Binary Tree Traversal' && (
                        <div className={`${theme.cardBg} rounded-lg p-4 border ${theme.border}`}>
                            <h4 className={`${theme.highlight} font-semibold mb-3`}>Tree Traversal Controls</h4>
                            <div className="flex flex-wrap gap-3 items-center justify-center">
                                <button
                                    onClick={() => startTraversal('inorder')}
                                    disabled={isAnimating}
                                    className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2`}
                                >
                                    <FaPlay className="text-sm" />
                                    In-order
                                </button>
                                <button
                                    onClick={() => startTraversal('preorder')}
                                    disabled={isAnimating}
                                    className={`px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2`}
                                >
                                    <FaPlay className="text-sm" />
                                    Pre-order
                                </button>
                                <button
                                    onClick={() => startTraversal('postorder')}
                                    disabled={isAnimating}
                                    className={`px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2`}
                                >
                                    <FaPlay className="text-sm" />
                                    Post-order
                                </button>
                                <button
                                    onClick={() => startTraversal('levelorder')}
                                    disabled={isAnimating}
                                    className={`px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2`}
                                >
                                    <FaPlay className="text-sm" />
                                    Level-order
                                </button>
                                
                                {/* Playback Controls */}
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={stepBackward}
                                        disabled={isAnimating || currentStep === 0}
                                        className={`px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50`}
                                        title="Step Backward"
                                    >
                                        <FaStepBackward className="text-sm" />
                                    </button>
                                    
                                    <button
                                        onClick={togglePlayPause}
                                        disabled={!isAnimating}
                                        className={`px-3 py-2 rounded ${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white disabled:opacity-50`}
                                    >
                                        {isPaused ? <FaPlay className="text-sm" /> : <FaPause className="text-sm" />}
                                    </button>
                                    
                                    <button
                                        onClick={stepForward}
                                        disabled={isAnimating || currentStep >= traversalSequence.length}
                                        className={`px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50`}
                                        title="Step Forward"
                                    >
                                        <FaStepForward className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BST Controls */}
                    {algorithmName === 'Binary Search Tree' && (
                        <div className={`${theme.cardBg} rounded-lg p-4 border ${theme.border}`}>
                            <h4 className={`${theme.highlight} font-semibold mb-3`}>BST Operations</h4>
                            <div className="flex flex-wrap gap-4 items-center justify-center">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Value to insert"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-32`}
                                        disabled={isAnimating}
                                    />
                                    <button
                                        onClick={() => bstInsert(inputValue)}
                                        disabled={isAnimating || !inputValue}
                                        className={`px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2`}
                                    >
                                        <FaPlus className="text-sm" />
                                        Insert
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Value to search"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className={`px-3 py-2 rounded bg-gray-700 ${theme.text} border ${theme.border} w-32`}
                                        disabled={isAnimating}
                                    />
                                    <button
                                        onClick={() => bstSearch(searchValue)}
                                        disabled={isAnimating || !searchValue}
                                        className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2`}
                                    >
                                        <FaSearch className="text-sm" />
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Traversal Sequence Display */}
                {traversalSequence.length > 0 && (
                    <div className={`${theme.cardBg} rounded-lg p-4 border ${theme.border} w-full max-w-4xl`}>
                        <h4 className={`${theme.highlight} font-semibold mb-3 flex items-center gap-2`}>
                            <FaStepForward className="text-sm" />
                            {currentTraversalType.charAt(0).toUpperCase() + currentTraversalType.slice(1)} Traversal Sequence:
                            <span className={`text-sm ${theme.cardText} ml-2`}>
                                ({currentStep}/{traversalSequence.length})
                            </span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {traversalSequence.map((node, index) => (
                                <div
                                    key={node.id}
                                    className={`px-4 py-2 rounded-lg border font-bold transition-all duration-300 ${
                                        index < currentStep
                                            ? 'bg-green-500/20 border-green-400 text-green-400 scale-105'
                                            : index === currentStep - 1
                                                ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400 scale-110 animate-pulse'
                                                : 'bg-gray-600/20 border-gray-600 text-gray-400'
                                    }`}
                                >
                                    {node.value}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className={`${theme.cardBg} rounded-lg p-4 border ${theme.border} w-full max-w-4xl`}>
                    <h4 className={`${theme.highlight} font-semibold mb-3`}>Visual Legend</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-yellow-500 rounded-full border-2 border-yellow-400"></div>
                            <span className={theme.cardText}>Currently Processing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-green-400"></div>
                            <span className={theme.cardText}>Visited/Found</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-cyan-500 rounded-full border-2 border-cyan-400"></div>
                            <span className={theme.cardText}>Path/Connection</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-indigo-500"></div>
                            <span className={theme.cardText}>Unvisited Node</span>
                        </div>
                        {algorithm?.name === 'Red-Black Tree' && (
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-red-500"></div>
                                    <span className={theme.cardText}>Red Node</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-900 rounded-full border-2 border-gray-600"></div>
                                    <span className={theme.cardText}>Black Node</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex gap-6 overflow-hidden">
            {/* Main Visualization Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Controls */}
                <div className={`${theme.cardBg} rounded-lg p-6 mb-6 border ${theme.border} flex-shrink-0`}>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <button
                            onClick={initializeTree}
                            disabled={isAnimating}
                            className={`px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50`}
                        >
                            <FaRandom className="text-sm" />
                            Initialize Tree
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
                            className={`px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-2`}
                        >
                            <FaTrash className="text-sm" />
                            Clear Logs
                        </button>

                        {/* Speed Control */}
                        <div className="flex items-center gap-3 ml-4">
                            <FaTachometerAlt className={`${theme.highlight} text-lg`} />
                            <label className={`${theme.cardText} text-sm font-medium`}>Speed:</label>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={speedControl}
                                onChange={(e) => setSpeedControl(parseInt(e.target.value))}
                                className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                disabled={isAnimating && !isPaused}
                            />
                            <span className={`${theme.infoColor} text-sm font-medium w-16`}>
                                {speedControl}%
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                        <span className={`${theme.cardText}`}>
                            Algorithm: <span className={`${theme.highlight} font-bold`}>{algorithm?.name || 'Binary Tree Traversal'}</span>
                        </span>
                        <span className={`${theme.cardText}`}>
                            Operations: <span className={`${theme.highlight} font-bold`}>{operationCount}</span>
                        </span>
                        <span className={`${theme.cardText}`}>
                            Nodes: <span className={`${theme.highlight} font-bold`}>{visitedNodes.length}</span>
                        </span>
                        <span className={`${theme.cardText}`}>
                            Status: <span className={`${isAnimating ? (isPaused ? 'text-orange-400' : theme.infoColor) : theme.successColor} font-bold`}>
                                {isAnimating ? (isPaused ? 'Paused' : 'Processing...') : 'Ready'}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Tree Visualization */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="flex flex-col items-center justify-start min-h-full">
                        {renderTreeVisualization()}
                        
                        {/* Algorithm Info */}
                        <div className={`${theme.cardBg} rounded-lg p-4 border ${theme.border} w-full max-w-2xl mt-8`}>
                            <h3 className={`${theme.highlight} font-semibold mb-2`}>{algorithm?.name || 'Binary Tree Traversal'}</h3>
                            <p className={`${theme.cardText} text-sm mb-2`}>
                                Time Complexity: <span className={`${theme.infoColor} font-mono`}>{algorithm?.complexity || 'O(n)'}</span>
                            </p>
                            <p className={`${theme.cardText} text-sm`}>
                                Difficulty: <span className={`${
                                    algorithm?.difficulty === 'Easy' ? 'text-green-400' : 
                                    algorithm?.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                                } font-bold`}>
                                    {algorithm?.difficulty || 'Easy'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Logs Sidebar */}
            <div className={`w-80 ${theme.cardBg} rounded-lg border ${theme.border} flex flex-col flex-shrink-0 h-full`}>
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                    <h3 className={`${theme.highlight} font-semibold flex items-center gap-2`}>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        Operation Log
                        {isAnimating && (
                            <span className="text-orange-400 text-sm ml-2">
                                {isPaused ? '(Paused)' : '(Running)'}
                            </span>
                        )}
                    </h3>
                </div>
                
                <div 
                    className="flex-1 overflow-y-auto overflow-x-hidden p-4" 
                    ref={logsEndRef}
                >
                    <div className="space-y-2">
                        {logs.length === 0 ? (
                            <div className={`text-center ${theme.cardText} text-sm py-8`}>
                                <div className="text-4xl mb-4 opacity-50">🌳</div>
                                <div>No operations performed yet.</div>
                                <div className="text-xs mt-2 opacity-70">
                                    Try tree traversals or BST operations!
                                </div>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div 
                                    key={log.id} 
                                    className={`text-sm p-3 rounded-lg border-l-4 transition-all duration-300 flex-shrink-0 ${
                                        log.type === 'found' ? 'border-green-500 bg-green-500/10' :
                                        log.type === 'error' ? 'border-red-500 bg-red-500/10' :
                                        log.type === 'compare' ? 'border-yellow-500 bg-yellow-500/10' :
                                        log.type === 'visit' ? 'border-blue-500 bg-blue-500/10' :
                                        log.type === 'start' ? 'border-cyan-500 bg-cyan-500/10' :
                                        log.type === 'warning' ? 'border-orange-600 bg-orange-600/10' :
                                        log.type === 'success' ? 'border-green-600 bg-green-600/10' :
                                        'border-gray-500 bg-gray-500/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-gray-500 text-xs font-mono">{log.timestamp}</span>
                                        <span className="bg-gray-700 px-2 py-0.5 rounded text-xs font-mono">
                                            #{log.step}
                                        </span>
                                        <div className={`w-2 h-2 rounded-full ${
                                            log.type === 'found' ? 'bg-green-500' :
                                            log.type === 'error' ? 'bg-red-500' :
                                            log.type === 'compare' ? 'bg-yellow-500' :
                                            log.type === 'visit' ? 'bg-blue-500' :
                                            log.type === 'start' ? 'bg-cyan-500' :
                                            log.type === 'warning' ? 'bg-orange-500' :
                                            'bg-gray-500'
                                        }`}></div>
                                    </div>
                                    <div className={`${getLogColor(log.type)} text-xs leading-relaxed`}>
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

export default TreeVisualizer;
