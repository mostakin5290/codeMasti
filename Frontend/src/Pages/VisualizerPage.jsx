import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
    FaChevronRight,
    FaChevronDown,
    FaCodeBranch,
    FaSearch,
    FaSort,
    FaLayerGroup,
    FaTree,
    FaProjectDiagram,
    FaPlay,
    FaPause,
    FaStop,
    FaRedo,
    FaCog,
    FaRocket,
    FaBolt,
    FaInfinity,
    FaCube,
    FaNetworkWired,
    FaChartLine,
    FaCalculator,
    FaLock,
    FaBrain,
    FaRandom,
    FaCode,
    FaGraduationCap,
    FaLightbulb
} from 'react-icons/fa';
import Header from '../components/layout/Header';
import SearchingVisualizer from '../components/Tools/Visualizer/SearchingVisualizer';
import SortingVisualizer from '../components/Tools/Visualizer/SortingVisualizer';
import DataStructureVisualizer from '../components/Tools/Visualizer/DataStructureVisualizer';
import TreeVisualizer from '../components/Tools/Visualizer/TreeVisualizer';

const defaultTheme = {
    background: 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900',
    text: 'text-white',
    primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600',
    secondary: 'bg-blue-600',
    secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800/40 backdrop-blur-sm',
    cardText: 'text-gray-300',
    border: 'border-gray-700/50',
    buttonPrimary: 'bg-indigo-600',
    buttonPrimaryHover: 'bg-indigo-700',
    buttonText: 'text-white',
    highlight: 'text-cyan-400',
    highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400',
    iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900',
    gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
    accent: 'bg-cyan-500',
};

const algorithmCategories = [
    {
        name: 'Searching Algorithms',
        icon: FaSearch,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        algorithms: [
            { name: 'Linear Search', complexity: 'O(n)', difficulty: 'Easy' },
            { name: 'Binary Search', complexity: 'O(log n)', difficulty: 'Easy' },
        ],
    },
    {
        name: 'Sorting Algorithms',
        icon: FaSort,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        algorithms: [
            { name: 'Bubble Sort', complexity: 'O(n²)', difficulty: 'Easy' },
            { name: 'Selection Sort', complexity: 'O(n²)', difficulty: 'Easy' },
            { name: 'Insertion Sort', complexity: 'O(n²)', difficulty: 'Easy' },
            { name: 'Quick Sort', complexity: 'O(n log n)', difficulty: 'Medium' },
            { name: 'Merge Sort', complexity: 'O(n log n)', difficulty: 'Medium' },
            { name: 'Heap Sort', complexity: 'O(n log n)', difficulty: 'Hard' },
            { name: 'Counting Sort', complexity: 'O(n+k)', difficulty: 'Medium' },
            { name: 'Bucket Sort', complexity: 'O(n²)', difficulty: 'Medium' },
        ],
    },
    {
        name: 'Data Structures',
        icon: FaLayerGroup,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        algorithms: [
            { name: 'Array Operations', complexity: 'O(1)', difficulty: 'Easy' },
            { name: 'Linked List', complexity: 'O(n)', difficulty: 'Easy' },
            { name: 'Doubly Linked List', complexity: 'O(n)', difficulty: 'Medium' },
            { name: 'Stack (LIFO)', complexity: 'O(1)', difficulty: 'Easy' },
            { name: 'Queue (FIFO)', complexity: 'O(1)', difficulty: 'Easy' },
            { name: 'Circular Queue', complexity: 'O(1)', difficulty: 'Medium' },
            { name: 'Hash Table', complexity: 'O(1)', difficulty: 'Medium' },
            { name: 'Deque', complexity: 'O(1)', difficulty: 'Medium' },
        ],
    },
    {
        name: 'Tree Structures',
        icon: FaTree,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        algorithms: [
            { name: 'Binary Tree Traversal', complexity: 'O(n)', difficulty: 'Easy' },
            { name: 'Binary Search Tree', complexity: 'O(log n)', difficulty: 'Medium' },
            { name: 'AVL Tree', complexity: 'O(log n)', difficulty: 'Hard' },
            { name: 'Red-Black Tree', complexity: 'O(log n)', difficulty: 'Hard' },
            { name: 'B-Tree', complexity: 'O(log n)', difficulty: 'Hard' },
            { name: 'Trie (Prefix Tree)', complexity: 'O(m)', difficulty: 'Medium' },
            { name: 'Segment Tree', complexity: 'O(log n)', difficulty: 'Hard' },
            { name: 'Fenwick Tree', complexity: 'O(log n)', difficulty: 'Hard' },
            { name: 'Heap (Binary)', complexity: 'O(log n)', difficulty: 'Medium' },
        ],
    },
    {
        name: 'Graph Algorithms',
        icon: FaProjectDiagram,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        algorithms: [
            { name: 'Breadth-First Search (BFS)', complexity: 'O(V+E)', difficulty: 'Medium' },
            { name: 'Depth-First Search (DFS)', complexity: 'O(V+E)', difficulty: 'Medium' },
            { name: 'Dijkstra\'s Algorithm', complexity: 'O(V²)', difficulty: 'Hard' },
            { name: 'A* Pathfinding', complexity: 'O(b^d)', difficulty: 'Hard' },
            { name: 'Bellman-Ford Algorithm', complexity: 'O(VE)', difficulty: 'Hard' },
            { name: 'Floyd-Warshall', complexity: 'O(V³)', difficulty: 'Hard' },
            { name: 'Prim\'s Algorithm', complexity: 'O(V²)', difficulty: 'Hard' },
            { name: 'Kruskal\'s Algorithm', complexity: 'O(E log V)', difficulty: 'Hard' },
            { name: 'Topological Sort', complexity: 'O(V+E)', difficulty: 'Medium' },
            { name: 'Strongly Connected Components', complexity: 'O(V+E)', difficulty: 'Hard' },
        ],
    },
    {
        name: 'Dynamic Programming',
        icon: FaBrain,
        color: 'text-pink-400',
        bgColor: 'bg-pink-500/10',
        algorithms: [
            { name: 'Fibonacci Sequence', complexity: 'O(n)', difficulty: 'Easy' },
            { name: 'Knapsack Problem', complexity: 'O(nW)', difficulty: 'Medium' },
            { name: 'Longest Common Subsequence', complexity: 'O(mn)', difficulty: 'Medium' },
            { name: 'Edit Distance', complexity: 'O(mn)', difficulty: 'Medium' },
            { name: 'Coin Change Problem', complexity: 'O(nW)', difficulty: 'Medium' },
            { name: 'Maximum Subarray', complexity: 'O(n)', difficulty: 'Medium' },
            { name: 'Rod Cutting Problem', complexity: 'O(n²)', difficulty: 'Medium' },
        ],
    },
    {
        name: 'Mathematical Algorithms',
        icon: FaCalculator,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        algorithms: [
            { name: 'Prime Number Sieve', complexity: 'O(n log log n)', difficulty: 'Medium' },
            { name: 'Euclidean Algorithm (GCD)', complexity: 'O(log n)', difficulty: 'Easy' },
            { name: 'Fast Fourier Transform', complexity: 'O(n log n)', difficulty: 'Hard' },
            { name: 'Matrix Multiplication', complexity: 'O(n³)', difficulty: 'Medium' },
            { name: 'Exponentiation by Squaring', complexity: 'O(log n)', difficulty: 'Medium' },
        ],
    },
    {
        name: 'Cryptographic Algorithms',
        icon: FaLock,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        algorithms: [
            { name: 'RSA Algorithm', complexity: 'O(n³)', difficulty: 'Hard' },
            { name: 'AES Encryption', complexity: 'O(1)', difficulty: 'Hard' },
            { name: 'Hash Functions (SHA)', complexity: 'O(n)', difficulty: 'Medium' },
            { name: 'Diffie-Hellman Key Exchange', complexity: 'O(log n)', difficulty: 'Hard' },
        ],
    },
];

const VisualizerPage = () => {
    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };

    const [expandedCategory, setExpandedCategory] = useState(null);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(50);
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        // Auto-expand first category on load with delay for animation
        setTimeout(() => {
            if (!expandedCategory && algorithmCategories.length > 0) {
                setExpandedCategory(algorithmCategories[0].name);
            }
            setIsInitialLoad(false);
        }, 1000);
    }, []);

    const toggleCategory = (categoryName) => {
        setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
    };

    const handleAlgorithmSelect = (algorithm) => {
        setSelectedAlgorithm(algorithm);
        setIsPlaying(false);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-400';
            case 'Medium': return 'text-yellow-400';
            case 'Hard': return 'text-red-400';
            default: return theme.cardText;
        }
    };

    const filteredCategories = algorithmCategories.map(category => ({
        ...category,
        algorithms: category.algorithms.filter(algo =>
            algo.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(category => category.algorithms.length > 0);

    // Enhanced Coming Soon Component
    const ComingSoonVisualization = ({ selectedAlgorithm }) => {
        const [currentFrame, setCurrentFrame] = useState(0);
        
        useEffect(() => {
            const interval = setInterval(() => {
                setCurrentFrame(prev => (prev + 1) % 4);
            }, 1000);
            return () => clearInterval(interval);
        }, []);

        const loadingDots = '.'.repeat(currentFrame + 1);
        
        return (
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                {/* Animated Background Particles */}
                <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-cyan-500/20 rounded-full animate-pulse"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>

                {/* Main Content */}
                <div className={`${theme.cardBg} rounded-2xl p-12 border ${theme.border} backdrop-blur-md shadow-2xl w-full mx-auto text-center relative z-10 `}>

                    {/* Title with Gradient */}
                    <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                        {selectedAlgorithm.name}
                    </h3>

                    {/* Animated Status */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-3 bg-gray-800/60 rounded-full px-6 py-3 border border-gray-600/50">
                            <div className="flex space-x-1">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                            i <= currentFrame ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'
                                        }`}
                                        style={{ animationDelay: `${i * 0.2}s` }}
                                    />
                                ))}
                            </div>
                            <span className={`${theme.highlight} font-medium`}>
                                Visualization Coming Soon{loadingDots}
                            </span>
                        </div>
                    </div>

                    {/* Algorithm Details Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300 hover:bg-gray-700/40">
                            <FaCode className="text-2xl text-cyan-400 mb-2 mx-auto" />
                            <h4 className="font-semibold text-sm mb-1">Algorithm</h4>
                            <p className={`${theme.highlight} font-mono text-sm`}>
                                {selectedAlgorithm.name}
                            </p>
                        </div>
                        
                        <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30 hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-700/40">
                            <FaChartLine className="text-2xl text-blue-400 mb-2 mx-auto" />
                            <h4 className="font-semibold text-sm mb-1">Complexity</h4>
                            <p className={`${theme.infoColor} font-mono text-sm`}>
                                {selectedAlgorithm.complexity}
                            </p>
                        </div>
                        
                        <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:bg-gray-700/40">
                            <FaGraduationCap className="text-2xl text-purple-400 mb-2 mx-auto" />
                            <h4 className="font-semibold text-sm mb-1">Difficulty</h4>
                            <p className={`${getDifficultyColor(selectedAlgorithm.difficulty)} font-mono text-sm font-bold`}>
                                {selectedAlgorithm.difficulty}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"
                                style={{ width: '45%' }}
                            />
                        </div>
                        <p className={`${theme.cardText} text-sm mt-2`}>
                            Development Progress: <span className="text-cyan-400 font-semibold">45%</span>
                        </p>
                    </div>

                    {/* Feature Preview */}
                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 border border-gray-600/30">
                        <h4 className={`${theme.highlight} font-semibold mb-3 flex items-center gap-2`}>
                            <FaLightbulb className="text-yellow-400" />
                            What's Coming
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className={theme.cardText}>Interactive Step-by-Step</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                <span className={theme.cardText}>Real-time Visualization</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                                <span className={theme.cardText}>Performance Analysis</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                                <span className={theme.cardText}>Code Playground</span>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-6">
                        <p className={`${theme.cardText} text-sm mb-3`}>
                            Want to be notified when this visualizer is ready?
                        </p>
                        <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                            Stay Updated
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Helper function to determine which visualizer to use
    const getVisualizerComponent = (selectedAlgorithm) => {
        // Check if it's a searching algorithm
        if (algorithmCategories[0].algorithms.some(algo => algo.name === selectedAlgorithm.name)) {
            return (
                <SearchingVisualizer
                    algorithm={selectedAlgorithm}
                    theme={theme}
                    isPlaying={isPlaying}
                    speed={speed}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                />
            );
        }
        
        // Check if it's a sorting algorithm
        if (algorithmCategories[1].algorithms.some(algo => algo.name === selectedAlgorithm.name)) {
            return (
                <SortingVisualizer
                    algorithm={selectedAlgorithm}
                    theme={theme}
                    isPlaying={isPlaying}
                    speed={speed}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                />
            );
        }
        
        // Check if it's a data structure
        if (algorithmCategories[2].algorithms.some(algo => algo.name === selectedAlgorithm.name)) {
            return (
                <DataStructureVisualizer
                    algorithm={selectedAlgorithm}
                    theme={theme}
                    speed={speed}
                />
            );
        }
        
        // Check if it's a tree structure
        if (algorithmCategories[3].algorithms.some(algo => algo.name === selectedAlgorithm.name)) {
            return (
                <TreeVisualizer
                    algorithm={selectedAlgorithm}
                    theme={theme}
                    speed={speed}
                />
            );
        }
        
        
        // Enhanced Coming Soon for other algorithms
        return <ComingSoonVisualization selectedAlgorithm={selectedAlgorithm} />;
    };

    return (
        <div className={`h-screen flex flex-col ${theme.background} ${theme.text} overflow-hidden`}>
            {/* Enhanced Animated background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 -left-4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
                <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-pink-500/3 rounded-full blur-2xl animate-pulse delay-3000"></div>
                <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-green-500/3 rounded-full blur-3xl animate-pulse delay-4000"></div>
            </div>

            {/* Header - Fixed at top */}
            <div className="flex-shrink-0 z-10">
                <Header />
            </div>

            {/* Main Content Container */}
            <div className="flex flex-1 relative z-10 overflow-hidden">
                {/* Enhanced Left Sidebar */}
                <aside className={`w-80 flex-shrink-0 border-r ${theme.border} ${theme.cardBg} backdrop-blur-sm flex flex-col transition-all duration-300 ${isInitialLoad ? 'translate-x-[-100%]' : 'translate-x-0'}`} style={{ height: 'calc(100vh - 64px)' }}>
                    {/* Sidebar Header */}
                    <div className={`${theme.cardBg} p-4 border-b ${theme.border} flex-shrink-0`}>
                        <h2 className={`text-xl font-bold mb-3 ${theme.highlight} flex items-center animate-fadeIn`}>
                            <FaRocket className="mr-2 text-cyan-400 animate-bounce" />
                            Algorithm Visualizer
                        </h2>

                        {/* Enhanced Search Bar */}
                        <div className="relative group">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm group-focus-within:text-cyan-400 transition-colors duration-200" />
                            <input
                                type="text"
                                placeholder="Search algorithms..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-700/50 border ${theme.border} ${theme.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-gray-700/70 transition-all duration-200`}
                            />
                        </div>
                    </div>

                    {/* Scrollable Algorithm List */}
                    <div 
                        className="flex-1 overflow-y-auto overflow-x-hidden" 
                        style={{ 
                            maxHeight: 'calc(100vh - 200px)',
                            minHeight: '0',
                            scrollBehavior: 'smooth'
                        }}
                    >
                        <div className="p-4 pb-8">
                            <nav className="space-y-2">
                                {filteredCategories.map((category, index) => (
                                    <div 
                                        key={category.name} 
                                        className="transform transition-all duration-300 hover:scale-[1.02]"
                                        style={{ 
                                            animation: `slideInLeft 0.5s ease-out ${index * 0.1}s both` 
                                        }}
                                    >
                                        <button
                                            onClick={() => toggleCategory(category.name)}
                                            className={`flex items-center justify-between w-full py-3 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${theme.cardText} hover:bg-gray-700/50 hover:text-white group hover:shadow-lg`}
                                        >
                                            <span className="flex items-center min-w-0">
                                                <div className={`p-1.5 rounded-lg ${category.bgColor} mr-2 flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                                                    <category.icon className={`${category.color} text-sm`} />
                                                </div>
                                                <span className="truncate">{category.name}</span>
                                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full bg-gray-600/50 ${theme.cardText} flex-shrink-0 group-hover:bg-gray-500/50 transition-colors duration-200`}>
                                                    {category.algorithms.length}
                                                </span>
                                            </span>
                                            <div className="flex-shrink-0 ml-2 transition-transform duration-300">
                                                {expandedCategory === category.name ? (
                                                    <FaChevronDown className="text-xs" />
                                                ) : (
                                                    <FaChevronRight className="text-xs" />
                                                )}
                                            </div>
                                        </button>

                                        {/* Enhanced Expandable Section */}
                                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                            expandedCategory === category.name 
                                                ? 'max-h-screen opacity-100 mt-2' 
                                                : 'max-h-0 opacity-0 mt-0'
                                        }`}>
                                            <ul className="ml-4 space-y-1">
                                                {category.algorithms.map((algorithm, algIndex) => (
                                                    <li 
                                                        key={algorithm.name}
                                                        style={{ 
                                                            animation: expandedCategory === category.name 
                                                                ? `fadeInUp 0.3s ease-out ${algIndex * 0.05}s both` 
                                                                : 'none'
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() => handleAlgorithmSelect(algorithm)}
                                                            className={`w-full text-left py-2 px-3 rounded-lg text-xs transition-all duration-300 hover:bg-gray-700/30 hover:scale-[1.02] group ${
                                                                selectedAlgorithm?.name === algorithm.name
                                                                    ? `${theme.highlight} bg-cyan-500/10 border-l-2 border-cyan-500 shadow-lg`
                                                                    : theme.cardText
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium truncate pr-2 group-hover:text-white transition-colors duration-200">
                                                                    {algorithm.name}
                                                                </span>
                                                                <span className={`text-xs px-1.5 py-0.5 rounded ${getDifficultyColor(algorithm.difficulty)} bg-current/10 flex-shrink-0 group-hover:bg-current/20 transition-all duration-200`}>
                                                                    {algorithm.difficulty}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                                                                    {algorithm.complexity}
                                                                </span>
                                                                {selectedAlgorithm?.name === algorithm.name && (
                                                                    <FaBolt className="text-cyan-400 text-xs animate-pulse" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </nav>
                            
                            {/* Extra padding at bottom */}
                            <div className="h-4"></div>
                        </div>
                    </div>
                </aside>

                {/* Enhanced Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {selectedAlgorithm ? (
                        <>
                            {/* Header - Fixed */}
                            <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
                                <h1 className={`text-2xl font-bold ${theme.highlight} animate-slideInRight flex items-center gap-3`}>
                                    <FaCube className="text-cyan-400 animate-pulse" />
                                    {selectedAlgorithm.name} Visualizer
                                    <span className="text-sm bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full animate-pulse">
                                        {selectedAlgorithm.difficulty}
                                    </span>
                                </h1>
                            </div>

                            {/* Visualization Content */}
                            <div className="flex-1 overflow-hidden animate-fadeIn">
                                {getVisualizerComponent(selectedAlgorithm)}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 overflow-y-auto overflow-x-hidden">
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fadeIn">

                                <h1 className={`text-5xl font-bold mb-6 ${theme.highlight} animate-slideInUp bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent`}>
                                    Algorithm Visualizer
                                </h1>
                                
                                <p className={`${theme.cardText} text-xl max-w-3xl mb-8 animate-slideInUp leading-relaxed`} style={{ animationDelay: '0.2s' }}>
                                    Explore the fascinating world of algorithms through interactive visualizations.
                                    <br />
                                    <span className="text-cyan-400 font-semibold">Select any algorithm from the sidebar to begin your journey.</span>
                                </p>

                                {/* Enhanced Feature Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
                                    {[
                                        {
                                            icon: FaRocket,
                                            title: "Interactive Learning",
                                            description: "Step through algorithms with intuitive controls and real-time feedback",
                                            color: "text-cyan-400",
                                            bg: "bg-cyan-500/10",
                                            delay: "0.3s"
                                        },
                                        {
                                            icon: FaCube,
                                            title: "Visual Learning",
                                            description: "Watch data structures and algorithms come to life with smooth animations",
                                            color: "text-blue-400",
                                            bg: "bg-blue-500/10",
                                            delay: "0.4s"
                                        },
                                        {
                                            icon: FaChartLine,
                                            title: "Performance Analysis",
                                            description: "Understand time and space complexity with real-time metrics",
                                            color: "text-green-400",
                                            bg: "bg-green-500/10",
                                            delay: "0.5s"
                                        }
                                    ].map((feature, index) => (
                                        <div 
                                            key={index}
                                            className={`${theme.cardBg} rounded-xl p-6 border ${theme.border} backdrop-blur-sm hover:scale-105 hover:shadow-xl transition-all duration-300 animate-slideInUp group hover:bg-gray-700/40`}
                                            style={{ animationDelay: feature.delay }}
                                        >
                                            <div className={`${feature.bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                                <feature.icon className={`text-2xl ${feature.color}`} />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors duration-300">
                                                {feature.title}
                                            </h3>
                                            <p className={`${theme.cardText} text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300`}>
                                                {feature.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Call to Action */}
                                <div className="animate-slideInUp" style={{ animationDelay: '0.6s' }}>
                                    <p className={`${theme.cardText} mb-4`}>Ready to start learning?</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <button 
                                            onClick={() => setExpandedCategory(algorithmCategories[0].name)}
                                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2"
                                        >
                                            <FaPlay className="text-sm" />
                                            Start Exploring
                                        </button>
                                        <button className="border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105">
                                            Learn More
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out both;
                }
                
                .animate-slideInLeft {
                    animation: slideInLeft 0.6s ease-out both;
                }
                
                .animate-slideInRight {
                    animation: slideInRight 0.6s ease-out both;
                }
                
                .animate-slideInUp {
                    animation: slideInUp 0.6s ease-out both;
                }
            `}</style>
        </div>
    );
};

export default VisualizerPage;
