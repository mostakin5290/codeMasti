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
    FaRandom
} from 'react-icons/fa';
import Header from '../components/layout/Header';
import SearchingVisualizer from '../components/Tools/Visualizer/SearchingVisualizer';
import SortingVisualizer from '../components/Tools/Visualizer/SortingVisualizer';

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
            { name: 'Radix Sort', complexity: 'O(d×n)', difficulty: 'Medium' },
            { name: 'Counting Sort', complexity: 'O(n+k)', difficulty: 'Medium' },
            { name: 'Bucket Sort', complexity: 'O(n²)', difficulty: 'Medium' },
            { name: 'Shell Sort', complexity: 'O(n log n)', difficulty: 'Medium' },
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
            { name: 'Priority Queue', complexity: 'O(log n)', difficulty: 'Medium' },
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

    useEffect(() => {
        // Auto-expand first category on load
        if (!expandedCategory && algorithmCategories.length > 0) {
            setExpandedCategory(algorithmCategories[0].name);
        }
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
        
        // Default fallback for other algorithms
        return (
            <div className={`w-full h-full ${theme.cardBg} rounded-lg flex items-center justify-center text-xl ${theme.cardText}`}>
                <div className="text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className={`text-2xl font-bold mb-2 ${theme.highlight}`}>
                        {selectedAlgorithm.name}
                    </h3>
                    <p className={`${theme.cardText} mb-4`}>
                        Visualization Coming Soon
                    </p>
                    <div className={`text-sm ${theme.cardText} space-y-2`}>
                        <p>Algorithm: <span className={`${theme.highlight} font-mono`}>{selectedAlgorithm.name}</span></p>
                        <p>Complexity: <span className={`${theme.infoColor} font-mono`}>{selectedAlgorithm.complexity}</span></p>
                        <p>Difficulty: <span className={`${getDifficultyColor(selectedAlgorithm.difficulty)} font-mono`}>{selectedAlgorithm.difficulty}</span></p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen flex flex-col ${theme.background} ${theme.text}`}>
            {/* Animated background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 -left-4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            <Header />

            <div className="flex flex-1 relative z-10">
                {/* Left Sidebar - Fixed Width */}
                <aside className={`w-80 flex-shrink-0 border-r ${theme.border} ${theme.cardBg} backdrop-blur-sm`}>
                    <div className="h-full flex flex-col">
                        {/* Sidebar Header - Fixed Height */}
                        <div className={`${theme.cardBg} p-4 border-b ${theme.border} flex-shrink-0`}>
                            <h2 className={`text-xl font-bold mb-3 ${theme.highlight} flex items-center`}>
                                <FaRocket className="mr-2 text-cyan-400" />
                                Algorithm Visualizer
                            </h2>

                            {/* Search Bar */}
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type="text"
                                    placeholder="Search algorithms..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-700/50 border ${theme.border} ${theme.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                />
                            </div>
                        </div>

                        {/* Scrollable Algorithm List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <nav className="space-y-2">
                                {filteredCategories.map((category, index) => (
                                    <div key={category.name} className="transform transition-all duration-300">
                                        <button
                                            onClick={() => toggleCategory(category.name)}
                                            className={`flex items-center justify-between w-full py-3 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${theme.cardText} hover:bg-gray-700/50 hover:text-white group`}
                                        >
                                            <span className="flex items-center">
                                                <div className={`p-1.5 rounded-lg ${category.bgColor} mr-2`}>
                                                    <category.icon className={`${category.color} text-sm`} />
                                                </div>
                                                <span className="truncate">{category.name}</span>
                                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full bg-gray-600/50 ${theme.cardText}`}>
                                                    {category.algorithms.length}
                                                </span>
                                            </span>
                                            {expandedCategory === category.name ? (
                                                <FaChevronDown className="text-xs" />
                                            ) : (
                                                <FaChevronRight className="text-xs" />
                                            )}
                                        </button>

                                        <div className={`overflow-hidden transition-all duration-300 ${expandedCategory === category.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <ul className="ml-4 mt-1 space-y-1">
                                                {category.algorithms.map((algorithm) => (
                                                    <li key={algorithm.name}>
                                                        <button
                                                            onClick={() => handleAlgorithmSelect(algorithm)}
                                                            className={`w-full text-left py-2 px-3 rounded-lg text-xs transition-all duration-300 hover:bg-gray-700/30 ${selectedAlgorithm?.name === algorithm.name
                                                                ? `${theme.highlight} bg-cyan-500/10 border-l-2 border-cyan-500`
                                                                : theme.cardText
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium truncate pr-2">{algorithm.name}</span>
                                                                <span className={`text-xs px-1.5 py-0.5 rounded ${getDifficultyColor(algorithm.difficulty)} bg-current/10 flex-shrink-0`}>
                                                                    {algorithm.difficulty}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className="text-xs text-gray-400">
                                                                    {algorithm.complexity}
                                                                </span>
                                                                {selectedAlgorithm?.name === algorithm.name && (
                                                                    <FaBolt className="text-cyan-400 text-xs" />
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
                        </div>
                    </div>
                </aside>

                {/* Main Content Area - Takes Remaining Space */}
                <main className="flex-1 flex flex-col">
                    {selectedAlgorithm ? (
                        <>
                            {/* Header - Fixed Height */}
                            <div className="flex-shrink-0 p-4 border-b border-gray-700">
                                <h1 className={`text-2xl font-bold ${theme.highlight}`}>
                                    {selectedAlgorithm.name} Visualizer
                                </h1>
                            </div>

                            {/* Visualization Content - Auto Height */}
                            <div className="flex-1 p-4">
                                <div className="w-full h-auto min-h-[600px]">
                                    {getVisualizerComponent(selectedAlgorithm)}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="relative mb-6">
                                <FaCodeBranch className={`text-7xl ${theme.primary} opacity-30`} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FaNetworkWired className={`text-3xl ${theme.highlight}`} />
                                </div>
                            </div>
                            <h1 className={`text-4xl font-bold mb-4 ${theme.highlight}`}>
                                Algorithm Visualizer
                            </h1>
                            <p className={`${theme.cardText} text-lg max-w-2xl mb-6`}>
                                Explore algorithms through interactive visualizations.
                                Select any algorithm from the sidebar to begin.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                                <div className={`${theme.cardBg} rounded-lg p-4 border ${theme.border}`}>
                                    <FaRocket className="text-2xl text-cyan-400 mb-2 mx-auto" />
                                    <h3 className="text-sm font-semibold mb-1">Interactive Learning</h3>
                                    <p className={`${theme.cardText} text-xs`}>
                                        Step through algorithms with controls
                                    </p>
                                </div>
                                <div className={`${theme.cardBg} rounded-lg p-4 border ${theme.border}`}>
                                    <FaCube className="text-2xl text-blue-400 mb-2 mx-auto" />
                                    <h3 className="text-sm font-semibold mb-1">Visual Learning</h3>
                                    <p className={`${theme.cardText} text-xs`}>
                                        Watch algorithms in action
                                    </p>
                                </div>
                                <div className={`${theme.cardBg} rounded-lg p-4 border ${theme.border}`}>
                                    <FaChartLine className="text-2xl text-green-400 mb-2 mx-auto" />
                                    <h3 className="text-sm font-semibold mb-1">Performance Analysis</h3>
                                    <p className={`${theme.cardText} text-xs`}>
                                        Real-time complexity analysis
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default VisualizerPage;
