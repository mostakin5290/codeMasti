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
            { name: 'Jump Search', complexity: 'O(√n)', difficulty: 'Medium' },
            { name: 'Exponential Search', complexity: 'O(log n)', difficulty: 'Medium' },
            { name: 'Interpolation Search', complexity: 'O(log log n)', difficulty: 'Medium' },
            { name: 'Ternary Search', complexity: 'O(log₃ n)', difficulty: 'Medium' },
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

    return (
        <div className={`min-h-screen ${theme.background} ${theme.text} overflow-hidden`}>
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 -left-4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            <Header />

            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] relative z-10">
                {/* Left Sidebar */}
                <aside className={`w-full lg:w-80 p-6 border-r ${theme.border} ${theme.cardBg} lg:min-h-full overflow-y-auto backdrop-blur-sm transition-all duration-300 ease-in-out`}>
                    <div className="sticky top-0 bg-gray-800/60 backdrop-blur-sm p-4 -m-4 mb-6 rounded-lg">
                        <h2 className={`text-2xl font-bold mb-4 ${theme.highlight} flex items-center`}>
                            <FaRocket className="mr-3 text-cyan-400 animate-bounce" />
                            Algorithm Visualizer
                        </h2>

                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search algorithms..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700/50 border ${theme.border} ${theme.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200`}
                            />
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {filteredCategories.map((category, index) => (
                            <div
                                key={category.name}
                                className="transform transition-all duration-300 ease-in-out hover:scale-[1.02]"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <button
                                    onClick={() => toggleCategory(category.name)}
                                    className={`flex items-center justify-between w-full py-4 px-4 rounded-xl text-lg font-semibold transition-all duration-300 ${theme.cardText} hover:bg-gray-700/50 hover:text-white group relative overflow-hidden`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    <span className="flex items-center relative z-10">
                                        <div className={`p-2 rounded-lg ${category.bgColor} mr-3 transition-all duration-300 group-hover:scale-110`}>
                                            <category.icon className={`${category.color} text-lg`} />
                                        </div>
                                        {category.name}
                                        <span className={`ml-2 text-xs px-2 py-1 rounded-full bg-gray-600/50 ${theme.cardText}`}>
                                            {category.algorithms.length}
                                        </span>
                                    </span>
                                    <div className="relative z-10">
                                        {expandedCategory === category.name ? (
                                            <FaChevronDown className="text-sm transition-transform duration-300 transform rotate-180" />
                                        ) : (
                                            <FaChevronRight className="text-sm transition-transform duration-300" />
                                        )}
                                    </div>
                                </button>

                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedCategory === category.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <ul className="ml-6 mt-2 space-y-1">
                                        {category.algorithms.map((algorithm, algIndex) => (
                                            <li
                                                key={algorithm.name}
                                                className="transform transition-all duration-300"
                                                style={{ animationDelay: `${algIndex * 50}ms` }}
                                            >
                                                <button
                                                    onClick={() => handleAlgorithmSelect(algorithm)}
                                                    className={`w-full text-left py-3 px-4 rounded-lg text-sm transition-all duration-300 hover:bg-gray-700/30 group relative overflow-hidden ${selectedAlgorithm?.name === algorithm.name
                                                        ? `${theme.highlight} bg-cyan-500/10 border-l-4 border-cyan-500 font-medium`
                                                        : theme.cardText
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{algorithm.name}</span>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(algorithm.difficulty)} bg-current/10`}>
                                                                {algorithm.difficulty}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-gray-400">
                                                            Time: {algorithm.complexity}
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
                </aside>

                {/* Main Content / Visualization Area */}
                <main className="flex-1 p-8 overflow-auto">

                    {selectedAlgorithm ? (
                        <>
                            <h1 className={`text-4xl font-extrabold mb-6 ${theme.highlight}`}>
                                {selectedAlgorithm.name} Visualizer
                            </h1>

                            {/* Check if it's a searching algorithm */}
                            {algorithmCategories[0].algorithms.some(algo => algo.name === selectedAlgorithm.name) ? (
                                <SearchingVisualizer
                                    algorithm={selectedAlgorithm}
                                    theme={theme}
                                    isPlaying={isPlaying}
                                    speed={speed}
                                    onPlayPause={() => setIsPlaying(!isPlaying)}
                                />
                            ) : (
                                <div className={`w-full h-96 ${theme.cardBg} rounded-lg flex items-center justify-center text-xl ${theme.cardText}`}>
                                    [ {selectedAlgorithm.name} Visualization Coming Soon ]
                                </div>
                            )}
                        </>
                    )
                        : (
                            <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                                <div className="relative mb-8">
                                    <FaCodeBranch className={`text-9xl ${theme.primary} opacity-30 animate-pulse`} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FaNetworkWired className={`text-4xl ${theme.highlight} animate-spin-slow`} />
                                    </div>
                                </div>
                                <h1 className={`text-5xl font-extrabold mb-6 ${theme.highlight} bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent`}>
                                    Algorithm Visualizer
                                </h1>
                                <p className={`${theme.cardText} text-xl max-w-3xl mb-8 leading-relaxed`}>
                                    Explore the fascinating world of algorithms and data structures through interactive 3D visualizations.
                                    Select any algorithm from the sidebar to watch it come to life with real-time animations,
                                    complexity analysis, and step-by-step execution.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full max-w-4xl">
                                    <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border} backdrop-blur-sm transform hover:scale-105 transition-all duration-300`}>
                                        <FaRocket className="text-3xl text-cyan-400 mb-3 mx-auto" />
                                        <h3 className="text-lg font-semibold mb-2">Interactive Learning</h3>
                                        <p className={`${theme.cardText} text-sm`}>
                                            Step through algorithms at your own pace with interactive controls
                                        </p>
                                    </div>
                                    <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border} backdrop-blur-sm transform hover:scale-105 transition-all duration-300`}>
                                        <FaCube className="text-3xl text-blue-400 mb-3 mx-auto" />
                                        <h3 className="text-lg font-semibold mb-2">3D Visualizations</h3>
                                        <p className={`${theme.cardText} text-sm`}>
                                            Experience algorithms in immersive 3D environments
                                        </p>
                                    </div>
                                    <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border} backdrop-blur-sm transform hover:scale-105 transition-all duration-300`}>
                                        <FaChartLine className="text-3xl text-green-400 mb-3 mx-auto" />
                                        <h3 className="text-lg font-semibold mb-2">Performance Analysis</h3>
                                        <p className={`${theme.cardText} text-sm`}>
                                            Real-time complexity analysis and performance metrics
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
