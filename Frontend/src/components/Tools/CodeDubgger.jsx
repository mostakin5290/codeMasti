import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
    Play,
    Pause,
    Square,
    RotateCcw,
    Settings,
    ChevronDown,
    ChevronRight,
    X,
    Minimize2,
    Maximize2,
    MoreHorizontal,
    Terminal,
    Bug,
    Eye,
    List,
    Code,
    Search,
    GitBranch,
    Bell,
    StepForward,
    StepBack,
    Zap,
    Activity,
    Monitor,
    Cpu,
    MemoryStick
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";

// Enhanced VS Code theme generator using your dynamic color system
const getVSCodeTheme = (appTheme) => {
    // Extract color values from Tailwind classes
    const extractColor = (tailwindClass, fallback) => {
        if (!tailwindClass) return fallback;

        const colorMap = {
            // Cyan colors
            'text-cyan-400': '#22d3ee',
            'bg-cyan-500': '#06b6d4',
            'bg-cyan-600': '#0891b2',
            'text-cyan-300': '#67e8f9',

            // Blue colors
            'text-blue-400': '#60a5fa',
            'bg-blue-600': '#2563eb',
            'bg-blue-700': '#1d4ed8',
            'text-blue-300': '#93c5fd',

            // Purple colors
            'text-purple-400': '#c084fc',
            'bg-purple-600': '#9333ea',
            'text-purple-300': '#d8b4fe',

            // Gray colors
            'bg-gray-900': '#111827',
            'bg-gray-800': '#1f2937',
            'bg-gray-700': '#374151',
            'text-gray-300': '#d1d5db',
            'text-white': '#ffffff',
            'border-gray-700': '#374151',

            // Success/Error colors
            'text-emerald-400': '#34d399',
            'text-red-400': '#f87171',
            'text-amber-400': '#fbbf24',
            'text-green-400': '#4ade80',
        };

        return colorMap[tailwindClass] || fallback;
    };

    const primaryColor = extractColor(appTheme.highlight, '#22d3ee');
    const backgroundColor = extractColor(appTheme.background, '#111827');
    const cardBg = extractColor(appTheme.cardBg, '#1f2937');
    const textColor = extractColor(appTheme.text, '#ffffff');
    const cardTextColor = extractColor(appTheme.cardText, '#d1d5db');

    return {
        // Activity Bar
        activityBarBg: '#1e1e1e',
        activityBarFg: '#cccccc',
        activityBarActiveBg: '#37373d',
        activityBarBorder: '#2b2d30',
        activityBarActiveIndicator: primaryColor,

        // Side Bar
        sideBarBg: '#252526',
        sideBarFg: '#cccccc',
        sideBarSectionHeader: '#2d2d30',
        sideBarBorder: '#2b2d30',
        sideBarSelection: primaryColor + '20',

        // Editor
        editorBg: '#1e1e1e',
        editorFg: '#d4d4d4',
        editorLineNumberFg: '#858585',
        editorSelectionBg: primaryColor + '30',
        editorCurrentLineBg: '#2a2d2e',
        editorCursorFg: primaryColor,

        // Status Bar
        statusBarBg: primaryColor,
        statusBarFg: '#ffffff',
        statusBarNoFolderBg: '#68217a',

        // Panel
        panelBg: '#181818',
        panelBorder: '#2b2d30',
        panelTabActiveBg: '#1e1e1e',
        panelTabInactiveBg: '#2d2d30',
        panelTabActiveIndicator: primaryColor,

        // Debug
        debugToolbarBg: '#2d2d30',
        debugConsoleBg: '#181818',
        debugCurrentLineBg: primaryColor + '20',

        // Accent colors
        accent: primaryColor,
        error: extractColor(appTheme.errorColor, '#f87171'),
        warning: extractColor(appTheme.warningColor, '#fbbf24'),
        info: extractColor(appTheme.infoColor, '#60a5fa'),
        success: extractColor(appTheme.successColor, '#34d399'),

        // Additional UI colors
        buttonPrimary: primaryColor,
        buttonSecondary: '#3c3c3c',
        buttonHover: primaryColor + 'dd',
        inputBg: '#3c3c3c',
        inputBorder: '#5a5a5a',
        scrollbarThumb: primaryColor + '60',

        // Syntax highlighting
        syntaxKeyword: '#569cd6',
        syntaxString: '#ce9178',
        syntaxComment: '#6a9955',
        syntaxNumber: '#b5cea8',
        syntaxFunction: '#dcdcaa',
        syntaxVariable: '#9cdcfe',
    };
};

const AlgoVisualiser = ({ appTheme }) => {
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionStep, setExecutionStep] = useState(0);
    const [executionSteps, setExecutionSteps] = useState([]);
    const [variables, setVariables] = useState({});
    const [currentLine, setCurrentLine] = useState(null);
    const [output, setOutput] = useState([]);
    const [error, setError] = useState(null);
    const [speed, setSpeed] = useState(500);
    const [callStack, setCallStack] = useState([]);
    const [executionInterval, setExecutionInterval] = useState(null);

    // Panel states
    const [collapsedPanels, setCollapsedPanels] = useState({
        variables: false,
        callStack: false,
        watch: true,
        breakpoints: true,
        loadedScripts: true,
    });

    // Layout states
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [panelHeight, setPanelHeight] = useState(250);
    const [activeTab, setActiveTab] = useState('console');
    const [isResizing, setIsResizing] = useState({ sidebar: false, panel: false });
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Monaco Editor refs
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const [decorations, setDecorations] = useState([]);
    const [editorFontSize, setEditorFontSize] = useState(14);

    const theme = getVSCodeTheme(appTheme);

    // Default code examples with better algorithms
    const getDefaultCode = (lang) => {
        const algorithmCodes = {
            javascript: `// Binary Search Algorithm Visualization
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    console.log("Starting binary search for:", target);
    console.log("Array:", arr);
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        console.log(\`Checking middle index \${mid} with value \${arr[mid]}\`);
        
        if (arr[mid] === target) {
            console.log(\`Found target \${target} at index \${mid}\`);
            return mid;
        } else if (arr[mid] < target) {
            console.log(\`\${arr[mid]} < \${target}, searching right half\`);
            left = mid + 1;
        } else {
            console.log(\`\${arr[mid]} > \${target}, searching left half\`);
            right = mid - 1;
        }
    }
    
    console.log("Target not found");
    return -1;
}

// Quick Sort Algorithm
function quickSort(arr, low = 0, high = arr.length - 1) {
    console.log(\`QuickSort called with range [\${low}, \${high}]\`);
    console.log("Current array:", arr.slice(low, high + 1));
    
    if (low < high) {
        let pivotIndex = partition(arr, low, high);
        console.log(\`Pivot placed at index \${pivotIndex}\`);
        
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
    
    return arr;
}

function partition(arr, low, high) {
    let pivot = arr[high];
    console.log(\`Using pivot: \${pivot}\`);
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            console.log(\`Swapped \${arr[j]} and \${arr[i]}\`);
        }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}

// Demo execution
const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
const target = 7;

console.log("=== Binary Search Demo ===");
const searchResult = binarySearch(sortedArray, target);

console.log("\\n=== Quick Sort Demo ===");
const unsortedArray = [64, 34, 25, 12, 22, 11, 90, 5];
const result = quickSort([...unsortedArray]);
console.log("Sorted array:", result);`,

            python: `# Advanced Algorithm Visualization in Python

def merge_sort(arr):
    """Merge Sort with step-by-step visualization"""
    print(f"Merge sort called with: {arr}")
    
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left_half = arr[:mid]
    right_half = arr[mid:]
    
    print(f"Splitting: {left_half} | {right_half}")
    
    left_sorted = merge_sort(left_half)
    right_sorted = merge_sort(right_half)
    
    return merge(left_sorted, right_sorted)

def merge(left, right):
    """Merge two sorted arrays"""
    result = []
    i = j = 0
    
    print(f"Merging {left} and {right}")
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            print(f"Added {left[i]} from left")
            i += 1
        else:
            result.append(right[j])
            print(f"Added {right[j]} from right")
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    
    print(f"Merged result: {result}")
    return result

def dijkstra_shortest_path(graph, start):
    """Dijkstra's algorithm simulation"""
    import heapq
    
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    visited = set()
    
    print(f"Starting Dijkstra from node {start}")
    print(f"Initial distances: {distances}")
    
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        
        if current_node in visited:
            continue
        
        visited.add(current_node)
        print(f"Visiting node {current_node} with distance {current_distance}")
        
        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
                print(f"Updated distance to {neighbor}: {distance}")
    
    return distances

# Demo execution
print("=== Merge Sort Demo ===")
numbers = [38, 27, 43, 3, 9, 82, 10]
sorted_numbers = merge_sort(numbers.copy())
print(f"Final sorted array: {sorted_numbers}")

print("\\n=== Dijkstra's Algorithm Demo ===")
graph = {
    'A': {'B': 4, 'C': 2},
    'B': {'C': 1, 'D': 5},
    'C': {'D': 8, 'E': 10},
    'D': {'E': 2},
    'E': {}
}
shortest_paths = dijkstra_shortest_path(graph, 'A')
print(f"Shortest paths from A: {shortest_paths}")`,

            cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <queue>
#include <climits>

using namespace std;

// Advanced Heap Sort Implementation
class HeapSort {
public:
    static void heapify(vector<int>& arr, int n, int i) {
        cout << "Heapifying subtree rooted at index " << i << endl;
        
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        
        if (left < n && arr[left] > arr[largest]) {
            largest = left;
        }
        
        if (right < n && arr[right] > arr[largest]) {
            largest = right;
        }
        
        if (largest != i) {
            cout << "Swapping " << arr[i] << " with " << arr[largest] << endl;
            swap(arr[i], arr[largest]);
            heapify(arr, n, largest);
        }
    }
    
    static void heapSort(vector<int>& arr) {
        int n = arr.size();
        cout << "Building max heap..." << endl;
        
        // Build heap
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(arr, n, i);
        }
        
        cout << "Max heap built. Starting sort..." << endl;
        
        // Extract elements from heap
        for (int i = n - 1; i > 0; i--) {
            cout << "Moving " << arr[0] << " to position " << i << endl;
            swap(arr[0], arr[i]);
            heapify(arr, i, 0);
        }
    }
};

// Graph algorithms
class Graph {
private:
    int vertices;
    vector<vector<pair<int, int>>> adjList;
    
public:
    Graph(int v) : vertices(v) {
        adjList.resize(v);
    }
    
    void addEdge(int u, int v, int weight) {
        adjList[u].push_back({v, weight});
        adjList[v].push_back({u, weight});
    }
    
    void primMST() {
        cout << "Finding Minimum Spanning Tree using Prim's algorithm" << endl;
        
        vector<int> key(vertices, INT_MAX);
        vector<bool> inMST(vertices, false);
        vector<int> parent(vertices, -1);
        
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
        
        key[0] = 0;
        pq.push({0, 0});
        
        while (!pq.empty()) {
            int u = pq.top().second;
            pq.pop();
            
            if (inMST[u]) continue;
            
            inMST[u] = true;
            cout << "Added vertex " << u << " to MST" << endl;
            
            for (auto& edge : adjList[u]) {
                int v = edge.first;
                int weight = edge.second;
                
                if (!inMST[v] && key[v] > weight) {
                    key[v] = weight;
                    parent[v] = u;
                    pq.push({key[v], v});
                    cout << "Updated key for vertex " << v << " to " << weight << endl;
                }
            }
        }
        
        cout << "MST Edges:" << endl;
        for (int i = 1; i < vertices; i++) {
            cout << parent[i] << " - " << i << " : " << key[i] << endl;
        }
    }
};

int main() {
    cout << "=== Heap Sort Demo ===" << endl;
    vector<int> arr = {12, 11, 13, 5, 6, 7, 15, 3, 9};
    
    cout << "Original array: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    
    HeapSort::heapSort(arr);
    
    cout << "Sorted array: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    
    cout << "\\n=== Prim's MST Demo ===" << endl;
    Graph g(5);
    g.addEdge(0, 1, 2);
    g.addEdge(0, 3, 6);
    g.addEdge(1, 2, 3);
    g.addEdge(1, 3, 8);
    g.addEdge(1, 4, 5);
    g.addEdge(2, 4, 7);
    g.addEdge(3, 4, 9);
    
    g.primMST();
    
    return 0;
}`,

            java: `import java.util.*;

public class AdvancedAlgorithms {
    
    // Advanced Binary Search Tree with visualization
    static class BST {
        class Node {
            int data;
            Node left, right;
            
            Node(int data) {
                this.data = data;
                left = right = null;
            }
        }
        
        private Node root;
        
        public void insert(int data) {
            System.out.println("Inserting " + data + " into BST");
            root = insertRec(root, data, 0);
        }
        
        private Node insertRec(Node root, int data, int depth) {
            if (root == null) {
                System.out.println("Created new node with value " + data + " at depth " + depth);
                return new Node(data);
            }
            
            if (data < root.data) {
                System.out.println(data + " < " + root.data + ", going left");
                root.left = insertRec(root.left, data, depth + 1);
            } else if (data > root.data) {
                System.out.println(data + " > " + root.data + ", going right");
                root.right = insertRec(root.right, data, depth + 1);
            }
            
            return root;
        }
        
        public void inorderTraversal() {
            System.out.println("Inorder traversal (sorted order):");
            inorderRec(root);
            System.out.println();
        }
        
        private void inorderRec(Node root) {
            if (root != null) {
                inorderRec(root.left);
                System.out.print(root.data + " ");
                inorderRec(root.right);
            }
        }
    }
    
    // Dynamic Programming - Longest Common Subsequence
    public static int longestCommonSubsequence(String text1, String text2) {
        System.out.println("Finding LCS for: '" + text1 + "' and '" + text2 + "'");
        
        int m = text1.length();
        int n = text2.length();
        int[][] dp = new int[m + 1][n + 1];
        
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                char c1 = text1.charAt(i - 1);
                char c2 = text2.charAt(j - 1);
                
                if (c1 == c2) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    System.out.println("Match found: " + c1 + " at positions (" + i + "," + j + ")");
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                    System.out.println("No match at (" + i + "," + j + "), taking max: " + dp[i][j]);
                }
            }
        }
        
        return dp[m][n];
    }
    
    // Graph DFS with visualization
    public static void depthFirstSearch(Map<Integer, List<Integer>> graph, int start) {
        System.out.println("Starting DFS from vertex " + start);
        Set<Integer> visited = new HashSet<>();
        Stack<Integer> stack = new Stack<>();
        
        stack.push(start);
        
        while (!stack.isEmpty()) {
            int vertex = stack.pop();
            
            if (!visited.contains(vertex)) {
                visited.add(vertex);
                System.out.println("Visited vertex: " + vertex);
                
                List<Integer> neighbors = graph.getOrDefault(vertex, new ArrayList<>());
                for (int neighbor : neighbors) {
                    if (!visited.contains(neighbor)) {
                        stack.push(neighbor);
                        System.out.println("Added vertex " + neighbor + " to stack");
                    }
                }
            }
        }
    }
    
    public static void main(String[] args) {
        System.out.println("=== Binary Search Tree Demo ===");
        BST bst = new BST();
        int[] values = {50, 30, 20, 40, 70, 60, 80};
        
        for (int value : values) {
            bst.insert(value);
        }
        
        bst.inorderTraversal();
        
        System.out.println("\\n=== Longest Common Subsequence Demo ===");
        String str1 = "ABCDGH";
        String str2 = "AEDFHR";
        int lcsLength = longestCommonSubsequence(str1, str2);
        System.out.println("LCS Length: " + lcsLength);
        
        System.out.println("\\n=== Depth First Search Demo ===");
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1, 2));
        graph.put(1, Arrays.asList(2));
        graph.put(2, Arrays.asList(0, 3));
        graph.put(3, Arrays.asList(3));
        
        depthFirstSearch(graph, 2);
    }
}`
        };
        return algorithmCodes[lang] || algorithmCodes.javascript;
    };

    // Initialize code when language changes
    useEffect(() => {
        setCode(getDefaultCode(language));
        reset();
    }, [language]);

    // Enhanced Monaco Editor setup with custom dark theme
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        try {
            // Define custom dark theme based on your app theme
            monaco.editor.defineTheme('custom-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: theme.syntaxComment.replace('#', '') },
                    { token: 'keyword', foreground: theme.syntaxKeyword.replace('#', '') },
                    { token: 'string', foreground: theme.syntaxString.replace('#', '') },
                    { token: 'number', foreground: theme.syntaxNumber.replace('#', '') },
                    { token: 'identifier.function', foreground: theme.syntaxFunction.replace('#', '') },
                    { token: 'identifier', foreground: theme.syntaxVariable.replace('#', '') },
                    { token: 'type', foreground: theme.info.replace('#', '') },
                    { token: 'delimiter', foreground: theme.editorFg.replace('#', '') },
                ],
                colors: {
                    'editor.background': theme.editorBg,
                    'editor.foreground': theme.editorFg,
                    'editor.lineHighlightBackground': theme.editorCurrentLineBg,
                    'editorLineNumber.foreground': theme.editorLineNumberFg,
                    'editorLineNumber.activeForeground': theme.accent,
                    'editor.selectionBackground': theme.editorSelectionBg,
                    'editor.inactiveSelectionBackground': theme.editorSelectionBg + '40',
                    'editorCursor.foreground': theme.editorCursorFg,
                    'editorWhitespace.foreground': '#404040',
                    'editorIndentGuide.background': '#404040',
                    'editorIndentGuide.activeBackground': theme.accent + '60',
                    'editor.findMatchBackground': theme.accent + '40',
                    'editor.findMatchHighlightBackground': theme.accent + '20',
                }
            });

            monaco.editor.setTheme('custom-dark');
        } catch (error) {
            console.warn('Failed to set custom theme:', error);
        }
    };

    // Enhanced execution with better parsing
    const executeJavaScript = (code) => {
        try {
            const steps = [];
            const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
            let variableState = {};
            let outputLog = [];
            let stackTrace = [];
            let stepCounter = 0;

            lines.forEach((line, index) => {
                const trimmedLine = line.trim();

                // Enhanced variable detection
                const varMatches = trimmedLine.match(/(?:let|const|var)\s+(\w+)\s*=\s*(.+);?/);
                if (varMatches) {
                    variableState[varMatches[1]] = varMatches[2].replace(/;$/, '');
                }

                // Function call detection
                const funcMatches = trimmedLine.match(/(\w+)\s*\(/);
                if (funcMatches && !trimmedLine.includes('console.log')) {
                    stackTrace.push({
                        function: funcMatches[1],
                        parameters: 'params',
                        line: index + 1
                    });
                }

                // Console.log detection with better parsing
                const consoleMatches = trimmedLine.match(/console\.log\((.*)\)/);
                if (consoleMatches) {
                    const logContent = consoleMatches[1]
                        .replace(/[`"']/g, '')
                        .replace(/\$\{([^}]+)\}/g, '${$1}');
                    outputLog.push(`[${new Date().toLocaleTimeString()}] ${logContent}`);
                }

                steps.push({
                    step: stepCounter++,
                    line: index + 1,
                    type: 'execution',
                    code: trimmedLine,
                    variables: { ...variableState, _step: stepCounter, _totalLines: lines.length },
                    callStack: [...stackTrace],
                    output: [...outputLog],
                    timestamp: Date.now()
                });

                // Simulate function returns
                if (trimmedLine.includes('return')) {
                    stackTrace.pop();
                }
            });

            return steps;
        } catch (error) {
            throw new Error(`JavaScript execution failed: ${error.message}`);
        }
    };

    // Other execution and control functions remain the same but with enhanced error handling
    const executeCode = async () => {
        try {
            setError(null);
            setOutput([]);
            setVariables({});
            setCallStack([]);
            setCurrentLine(null);
            setExecutionStep(0);

            if (!code.trim()) {
                setError('No code to execute. Please write some code first.');
                return;
            }

            let steps;
            if (language === "javascript") {
                steps = executeJavaScript(code);
            } else {
                // Enhanced simulation for other languages
                steps = simulateExecution(code, language);
            }

            setExecutionSteps(steps);

            if (steps.length > 0) {
                setExecutionStep(0);
                updateVisualization(steps[0]);
                setOutput(['🚀 Execution started...', ...steps[0].output]);
            } else {
                setError('No executable statements found in the code.');
            }
        } catch (err) {
            setError(`Execution Error: ${err.message}`);
            setExecutionSteps([]);
        }
    };

    const simulateExecution = (code, lang) => {
        const steps = [];
        const lines = code.split('\n').filter(line => line.trim());
        let outputLog = ['🔄 Simulating execution...'];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) return;

            // Language-specific output detection
            const isOutput =
                (lang === 'python' && (trimmedLine.includes('print(') || trimmedLine.includes('print '))) ||
                (lang === 'cpp' && trimmedLine.includes('cout')) ||
                (lang === 'java' && trimmedLine.includes('System.out'));

            if (isOutput) {
                outputLog.push(`📤 Output from line ${index + 1}`);
            }

            steps.push({
                step: steps.length,
                line: index + 1,
                type: 'simulation',
                code: trimmedLine,
                variables: {
                    language: lang.toUpperCase(),
                    currentLine: index + 1,
                    executionMode: 'simulation',
                    progress: `${steps.length + 1}/${lines.length}`
                },
                callStack: [],
                output: [...outputLog],
                timestamp: Date.now()
            });
        });

        return steps;
    };

    const updateVisualization = (step) => {
        if (step) {
            setCurrentLine(step.line);
            setVariables(step.variables || {});
            setOutput(step.output || []);
            setCallStack(step.callStack || []);
        }
    };

    // Auto-execution with interval
    useEffect(() => {
        if (isExecuting && executionSteps.length > 0) {
            const interval = setInterval(() => {
                setExecutionStep(prev => {
                    if (prev >= executionSteps.length - 1) {
                        setIsExecuting(false);
                        setOutput(current => [...current, '✅ Execution completed']);
                        return prev;
                    }
                    const nextStep = prev + 1;
                    updateVisualization(executionSteps[nextStep]);
                    return nextStep;
                });
            }, speed);

            setExecutionInterval(interval);
            return () => clearInterval(interval);
        } else if (executionInterval) {
            clearInterval(executionInterval);
            setExecutionInterval(null);
        }
    }, [isExecuting, executionSteps, speed]);

    // Resizing functionality
    const handleMouseDown = (type) => (e) => {
        setIsResizing({ ...isResizing, [type]: true });
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isResizing.sidebar) {
                const newWidth = Math.max(250, Math.min(600, e.clientX));
                setSidebarWidth(newWidth);
            }
            if (isResizing.panel) {
                const rect = document.querySelector('.main-editor-area')?.getBoundingClientRect();
                if (rect) {
                    const newHeight = Math.max(150, Math.min(400, rect.bottom - e.clientY));
                    setPanelHeight(newHeight);
                }
            }
        };

        const handleMouseUp = () => {
            setIsResizing({ sidebar: false, panel: false });
        };

        if (isResizing.sidebar || isResizing.panel) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // Update decorations for current line
    useEffect(() => {
        if (editorRef.current && monacoRef.current && currentLine !== null) {
            try {
                const newDecorations = [{
                    range: new monacoRef.current.Range(currentLine, 1, currentLine, 1),
                    options: {
                        isWholeLine: true,
                        className: 'current-line-decoration',
                        linesDecorationsClassName: 'current-line-gutter-decoration',
                    }
                }];
                const newDecorationIds = editorRef.current.deltaDecorations(decorations, newDecorations);
                setDecorations(newDecorationIds);
            } catch (error) {
                console.warn('Failed to update decorations:', error);
            }
        }
    }, [currentLine]);

    // Control functions
    const stepForward = () => {
        if (executionStep < executionSteps.length - 1) {
            const nextStep = executionStep + 1;
            setExecutionStep(nextStep);
            updateVisualization(executionSteps[nextStep]);
        }
    };

    const stepBackward = () => {
        if (executionStep > 0) {
            const prevStep = executionStep - 1;
            setExecutionStep(prevStep);
            updateVisualization(executionSteps[prevStep]);
        }
    };

    const reset = () => {
        setIsExecuting(false);
        setExecutionStep(0);
        setCurrentLine(null);
        setVariables({});
        setOutput([]);
        setCallStack([]);
        setError(null);
        setExecutionSteps([]);
        if (executionInterval) {
            clearInterval(executionInterval);
            setExecutionInterval(null);
        }
    };

    const toggleExecution = () => {
        if (executionSteps.length === 0) {
            executeCode();
            return;
        }
        setIsExecuting(!isExecuting);
    };

    const togglePanel = (panelName) => {
        setCollapsedPanels({
            ...collapsedPanels,
            [panelName]: !collapsedPanels[panelName]
        });
    };

    return (
        <div
            className="h-screen flex flex-col overflow-hidden relative"
            style={{
                backgroundColor: theme.editorBg,
                color: theme.editorFg,
                fontFamily: 'Inter, system-ui, sans-serif'
            }}
        >
            {/* Enhanced CSS with your theme colors */}
            <style>{`
                .current-line-decoration {
                    background: linear-gradient(90deg, ${theme.accent}15 0%, ${theme.accent}25 50%, ${theme.accent}15 100%) !important;
                    border-left: 3px solid ${theme.accent} !important;
                    animation: pulse-glow 2s ease-in-out infinite alternate;
                }
                
                .current-line-gutter-decoration {
                    background-color: ${theme.accent} !important;
                    width: 4px !important;
                    border-radius: 2px;
                }
                
                @keyframes pulse-glow {
                    0% { box-shadow: inset 0 0 0 1px ${theme.accent}20; }
                    100% { box-shadow: inset 0 0 0 1px ${theme.accent}40; }
                }
                
                .resize-handle {
                    background: linear-gradient(90deg, transparent, ${theme.panelBorder}, transparent);
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                .resize-handle:hover {
                    background: ${theme.accent};
                    transform: scaleX(1.5);
                }
                
                .resize-handle:active {
                    background: ${theme.accent};
                    box-shadow: 0 0 10px ${theme.accent}50;
                }
                
                .resize-handle-horizontal {
                    background: linear-gradient(0deg, transparent, ${theme.panelBorder}, transparent);
                }
                
                .resize-handle-horizontal:hover {
                    transform: scaleY(1.5);
                }
                
                /* Enhanced scrollbars */
                ::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                
                ::-webkit-scrollbar-track {
                    background: ${theme.sideBarBg};
                    border-radius: 5px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(45deg, ${theme.scrollbarThumb}, ${theme.accent}80);
                    border-radius: 5px;
                    border: 2px solid ${theme.sideBarBg};
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(45deg, ${theme.accent}, ${theme.accent}cc);
                }
                
                /* Smooth animations */
                .panel-transition {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .button-hover-effect {
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .button-hover-effect:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px ${theme.accent}30;
                }
                
                .button-hover-effect:active {
                    transform: translateY(0);
                }
                
                /* Glowing effects */
                .glow-accent {
                    box-shadow: 0 0 20px ${theme.accent}20;
                }
                
                .executing-indicator {
                    animation: executing-pulse 1.5s ease-in-out infinite;
                }
                
                @keyframes executing-pulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.05); }
                }
                
                /* Modern card styles */
                .modern-card {
                    backdrop-filter: blur(10px);
                    border: 1px solid ${theme.panelBorder}40;
                    background: linear-gradient(135deg, ${theme.cardBg || theme.sideBarBg}90 0%, ${theme.panelBg}70 100%);
                }
                
                .gradient-border {
                    border: 2px solid transparent;
                    background: linear-gradient(135deg, ${theme.sideBarBg}, ${theme.panelBg}) padding-box,
                                linear-gradient(135deg, ${theme.accent}, ${theme.info}) border-box;
                }
            `}</style>

            {/* Modern Title Bar */}
            <div
                className="flex items-center justify-between h-12 px-6 relative"
                style={{
                    background: `linear-gradient(135deg, ${theme.activityBarBg} 0%, ${theme.sideBarBg} 100%)`,
                    borderBottom: `1px solid ${theme.panelBorder}`
                }}
            >
                <div className="flex items-center space-x-4">
                    <div className="flex space-x-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer transition-colors"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 cursor-pointer transition-colors"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 cursor-pointer transition-colors"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Bug className="w-5 h-5" style={{ color: theme.accent }} />
                        <span className="text-lg font-semibold tracking-wide">
                            Algorithm Debugger
                        </span>
                        <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor: theme.accent + '20',
                                color: theme.accent,
                                border: `1px solid ${theme.accent}40`
                            }}
                        >
                            {language.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Toggle Fullscreen"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <Link to="/tools">
                        <button

                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors group"
                            title="Close Debugger"
                        >
                            <X className="w-4 h-4 group-hover:text-red-400" />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Enhanced Debug Toolbar */}
            <div
                className="flex items-center h-14 px-4 space-x-3 border-b"
                style={{
                    background: `linear-gradient(135deg, ${theme.debugToolbarBg} 0%, ${theme.sideBarBg} 100%)`,
                    borderColor: theme.panelBorder
                }}
            >
                {/* Language Selector */}
                <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4" style={{ color: theme.accent }} />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="px-4 py-2 rounded-lg text-sm font-medium modern-card border-0 focus:outline-none focus:ring-2"
                        style={{
                            backgroundColor: theme.inputBg,
                            color: theme.editorFg,
                            focusRingColor: theme.accent
                        }}
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>
                </div>

                <div className="h-8 w-px" style={{ backgroundColor: theme.panelBorder }}></div>

                {/* Main Controls */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={executeCode}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-white button-hover-effect"
                        style={{ backgroundColor: theme.success }}
                        title="Start Debugging (F5)"
                    >
                        <Play className="w-4 h-4" />
                        <span>Start</span>
                    </button>

                    <button
                        onClick={toggleExecution}
                        className="p-2 rounded-lg text-white button-hover-effect"
                        style={{
                            backgroundColor: isExecuting ? theme.warning : theme.accent,
                        }}
                        disabled={executionSteps.length === 0}
                        title={isExecuting ? "Pause (F6)" : "Continue (F5)"}
                    >
                        {isExecuting ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={stepBackward}
                        className="p-2 rounded-lg button-hover-effect"
                        style={{
                            backgroundColor: theme.buttonSecondary,
                            color: executionStep === 0 ? theme.editorLineNumberFg : theme.editorFg
                        }}
                        disabled={executionStep === 0}
                        title="Step Back (F7)"
                    >
                        <StepBack className="w-4 h-4" />
                    </button>

                    <button
                        onClick={stepForward}
                        className="p-2 rounded-lg button-hover-effect"
                        style={{
                            backgroundColor: theme.buttonSecondary,
                            color: executionStep >= executionSteps.length - 1 ? theme.editorLineNumberFg : theme.editorFg
                        }}
                        disabled={executionStep >= executionSteps.length - 1}
                        title="Step Forward (F8)"
                    >
                        <StepForward className="w-4 h-4" />
                    </button>

                    <button
                        onClick={reset}
                        className="p-2 rounded-lg text-white button-hover-effect"
                        style={{ backgroundColor: theme.error }}
                        title="Stop (Shift+F5)"
                    >
                        <Square className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1"></div>

                {/* Speed Control */}
                <div className="flex items-center space-x-3">
                    <Zap className="w-4 h-4" style={{ color: theme.accent }} />
                    <span className="text-sm font-medium">Speed:</span>
                    <input
                        type="range"
                        min="100"
                        max="2000"
                        value={speed}
                        onChange={(e) => setSpeed(parseInt(e.target.value))}
                        className="w-24 accent-current"
                        style={{ accentColor: theme.accent }}
                    />
                    <span className="text-sm w-16" style={{ color: theme.cardTextColor || theme.editorLineNumberFg }}>
                        {speed}ms
                    </span>
                </div>

                <div className="h-8 w-px" style={{ backgroundColor: theme.panelBorder }}></div>

                {/* Status Indicator */}
                <div className="flex items-center space-x-2">
                    {isExecuting && (
                        <div className="flex items-center space-x-2 executing-indicator">
                            <Activity className="w-4 h-4" style={{ color: theme.success }} />
                            <span className="text-sm font-medium" style={{ color: theme.success }}>
                                Running
                            </span>
                        </div>
                    )}
                    <span className="text-sm" style={{ color: theme.editorLineNumberFg }}>
                        Step {executionSteps.length > 0 ? executionStep + 1 : 0} of {executionSteps.length}
                        {currentLine && ` • Line ${currentLine}`}
                    </span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Activity Bar */}
                <div
                    className="w-16 flex flex-col items-center py-4 space-y-6"
                    style={{
                        background: `linear-gradient(180deg, ${theme.activityBarBg} 0%, ${theme.sideBarBg} 100%)`,
                        borderRight: `1px solid ${theme.activityBarBorder}`
                    }}
                >
                    <div
                        className="p-2 rounded-xl transition-all duration-200"
                        style={{
                            backgroundColor: theme.activityBarActiveBg,
                            borderLeft: `3px solid ${theme.activityBarActiveIndicator}`
                        }}
                    >
                        <Bug className="w-6 h-6" style={{ color: theme.accent }} />
                    </div>
                    <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                        <Search className="w-5 h-5" style={{ color: theme.activityBarFg }} />
                    </button>
                    <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                        <GitBranch className="w-5 h-5" style={{ color: theme.activityBarFg }} />
                    </button>
                    <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                        <Settings className="w-5 h-5" style={{ color: theme.activityBarFg }} />
                    </button>
                </div>

                {/* Enhanced Side Bar */}
                <div
                    className="flex flex-col modern-card"
                    style={{
                        width: sidebarWidth,
                        borderRight: `1px solid ${theme.sideBarBorder}`
                    }}
                >
                    {/* Side Bar Header */}
                    <div
                        className="h-10 flex items-center px-4 text-xs font-bold tracking-wider"
                        style={{
                            backgroundColor: theme.sideBarSectionHeader,
                            color: theme.sideBarFg,
                            borderBottom: `1px solid ${theme.panelBorder}`
                        }}
                    >
                        <Monitor className="w-4 h-4 mr-2" style={{ color: theme.accent }} />
                        RUN AND DEBUG
                    </div>

                    {/* Debug Panels with enhanced styling */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Variables Panel */}
                        <div className="border-b" style={{ borderColor: theme.panelBorder }}>
                            <div
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 text-sm font-medium transition-colors panel-transition"
                                onClick={() => togglePanel('variables')}
                            >
                                <div className="flex items-center space-x-2">
                                    {collapsedPanels.variables ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                    <MemoryStick className="w-4 h-4" style={{ color: theme.info }} />
                                    <span style={{ color: theme.sideBarFg }}>VARIABLES</span>
                                </div>
                                <span
                                    className="px-2 py-1 rounded-full text-xs font-medium"
                                    style={{
                                        backgroundColor: theme.accent + '20',
                                        color: theme.accent
                                    }}
                                >
                                    {Object.keys(variables).length}
                                </span>
                            </div>
                            <AnimatePresence>
                                {!collapsedPanels.variables && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-3 max-h-48 overflow-y-auto">
                                            {Object.entries(variables).map(([name, value]) => (
                                                <div key={name} className="flex justify-between items-center py-2 text-sm group">
                                                    <span
                                                        className="font-mono font-medium"
                                                        style={{ color: theme.info }}
                                                    >
                                                        {name}
                                                    </span>
                                                    <span
                                                        className="font-mono text-xs truncate ml-2 max-w-32 group-hover:max-w-none group-hover:overflow-visible"
                                                        style={{ color: theme.success }}
                                                        title={String(value)}
                                                    >
                                                        {String(value)}
                                                    </span>
                                                </div>
                                            ))}
                                            {Object.keys(variables).length === 0 && (
                                                <div
                                                    className="text-sm py-6 text-center"
                                                    style={{ color: theme.sideBarFg, opacity: 0.6 }}
                                                >
                                                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <div>No variables in current scope</div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Call Stack Panel */}
                        <div className="border-b" style={{ borderColor: theme.panelBorder }}>
                            <div
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 text-sm font-medium transition-colors"
                                onClick={() => togglePanel('callStack')}
                            >
                                <div className="flex items-center space-x-2">
                                    {collapsedPanels.callStack ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                    <List className="w-4 h-4" style={{ color: theme.warning }} />
                                    <span style={{ color: theme.sideBarFg }}>CALL STACK</span>
                                </div>
                                <span
                                    className="px-2 py-1 rounded-full text-xs font-medium"
                                    style={{
                                        backgroundColor: theme.warning + '20',
                                        color: theme.warning
                                    }}
                                >
                                    {callStack.length}
                                </span>
                            </div>
                            <AnimatePresence>
                                {!collapsedPanels.callStack && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-3 max-h-48 overflow-y-auto">
                                            {callStack.map((call, index) => (
                                                <div key={index} className="py-2 text-sm border-l-2 pl-3 mb-2" style={{ borderColor: theme.accent + '40' }}>
                                                    <div className="font-mono font-semibold" style={{ color: theme.accent }}>
                                                        {call.function}
                                                    </div>
                                                    <div className="font-mono text-xs mt-1" style={{ color: theme.sideBarFg, opacity: 0.7 }}>
                                                        {call.parameters && `(${call.parameters})`}
                                                        {call.line && ` • line ${call.line}`}
                                                    </div>
                                                </div>
                                            ))}
                                            {callStack.length === 0 && (
                                                <div
                                                    className="text-sm py-6 text-center"
                                                    style={{ color: theme.sideBarFg, opacity: 0.6 }}
                                                >
                                                    <Cpu className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <div>No function calls</div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Watch Panel */}
                        <div className="border-b" style={{ borderColor: theme.panelBorder }}>
                            <div
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 text-sm font-medium transition-colors"
                                onClick={() => togglePanel('watch')}
                            >
                                <div className="flex items-center space-x-2">
                                    {collapsedPanels.watch ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                    <Eye className="w-4 h-4" style={{ color: theme.info }} />
                                    <span style={{ color: theme.sideBarFg }}>WATCH</span>
                                </div>
                            </div>
                            <AnimatePresence>
                                {!collapsedPanels.watch && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-3">
                                            <div
                                                className="text-sm py-4 text-center"
                                                style={{ color: theme.sideBarFg, opacity: 0.6 }}
                                            >
                                                No watch expressions
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Breakpoints Panel */}
                        <div>
                            <div
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 text-sm font-medium transition-colors"
                                onClick={() => togglePanel('breakpoints')}
                            >
                                <div className="flex items-center space-x-2">
                                    {collapsedPanels.breakpoints ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.error }}></div>
                                    <span style={{ color: theme.sideBarFg }}>BREAKPOINTS</span>
                                </div>
                            </div>
                            <AnimatePresence>
                                {!collapsedPanels.breakpoints && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-3">
                                            <div
                                                className="text-sm py-4 text-center"
                                                style={{ color: theme.sideBarFg, opacity: 0.6 }}
                                            >
                                                No breakpoints set
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Resize Handle for Sidebar */}
                <div
                    className="w-2 resize-handle cursor-col-resize flex items-center justify-center group"
                    onMouseDown={handleMouseDown('sidebar')}
                >
                    <div className="w-1 h-12 rounded-full bg-current opacity-30 group-hover:opacity-60 transition-opacity"></div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 flex flex-col main-editor-area">
                    {/* Editor Container */}
                    <div className="flex-1 flex flex-col" style={{ height: `calc(100% - ${panelHeight}px)` }}>
                        {/* Editor Tabs */}
                        <div
                            className="h-10 flex items-center"
                            style={{
                                backgroundColor: theme.panelTabInactiveBg,
                                borderBottom: `1px solid ${theme.panelBorder}`
                            }}
                        >
                            <div
                                className="px-4 py-2 flex items-center space-x-2 text-sm border-r relative"
                                style={{
                                    backgroundColor: theme.panelTabActiveBg,
                                    borderColor: theme.panelBorder,
                                    color: theme.editorFg
                                }}
                            >
                                <div
                                    className="absolute bottom-0 left-0 right-0 h-0.5"
                                    style={{ backgroundColor: theme.panelTabActiveIndicator }}
                                ></div>
                                <Code className="w-4 h-4" />
                                <span>main.{language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : 'java'}</span>
                                <button className="hover:bg-white/20 rounded p-1 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Monaco Editor with enhanced setup */}
                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                language={language}
                                value={code}
                                onChange={(newValue) => setCode(newValue || '')}
                                onMount={handleEditorDidMount}
                                options={{
                                    fontSize: editorFontSize,
                                    fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
                                    fontLigatures: true,
                                    minimap: { enabled: true, side: 'right' },
                                    scrollBeyondLastLine: false,
                                    lineNumbers: 'on',
                                    wordWrap: 'on',
                                    automaticLayout: true,
                                    theme: 'custom-dark',
                                    folding: true,
                                    lineDecorationsWidth: 10,
                                    lineNumbersMinChars: 4,
                                    glyphMargin: true,
                                    contextmenu: true,
                                    selectOnLineNumbers: true,
                                    roundedSelection: true,
                                    readOnly: false,
                                    cursorStyle: 'line',
                                    cursorBlinking: 'blink',
                                    renderWhitespace: 'selection',
                                    renderControlCharacters: true,
                                    smoothScrolling: true,
                                    mouseWheelZoom: true,
                                    bracketPairColorization: { enabled: true },
                                    guides: {
                                        bracketPairs: true,
                                        indentation: true
                                    },
                                    suggest: {
                                        showKeywords: true,
                                        showSnippets: true
                                    },
                                    quickSuggestions: {
                                        other: true,
                                        comments: true,
                                        strings: true
                                    }
                                }}
                            />

                            {/* Execution Status Overlay */}
                            {isExecuting && (
                                <div className="absolute top-4 right-4 flex items-center space-x-2 px-3 py-2 rounded-lg modern-card">
                                    <div
                                        className="w-2 h-2 rounded-full animate-pulse"
                                        style={{ backgroundColor: theme.success }}
                                    ></div>
                                    <span className="text-sm font-medium" style={{ color: theme.success }}>
                                        Executing...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Horizontal Resize Handle */}
                    <div
                        className="h-2 resize-handle resize-handle-horizontal cursor-row-resize flex items-center justify-center group"
                        onMouseDown={handleMouseDown('panel')}
                    >
                        <div className="h-1 w-12 rounded-full bg-current opacity-30 group-hover:opacity-60 transition-opacity"></div>
                    </div>

                    {/* Enhanced Bottom Panel */}
                    <div
                        className="flex flex-col modern-card"
                        style={{
                            height: panelHeight,
                            borderTop: `1px solid ${theme.panelBorder}`
                        }}
                    >
                        {/* Panel Tabs */}
                        <div
                            className="h-10 flex items-center"
                            style={{ borderBottom: `1px solid ${theme.panelBorder}` }}
                        >
                            {['console', 'terminal', 'output'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium capitalize transition-all duration-200 flex items-center space-x-2 relative ${activeTab === tab ? 'border-b-2' : 'hover:bg-white/5'
                                        }`}
                                    style={{
                                        color: activeTab === tab ? theme.accent : theme.sideBarFg,
                                        borderColor: activeTab === tab ? theme.accent : 'transparent',
                                        backgroundColor: activeTab === tab ? theme.panelBg : 'transparent'
                                    }}
                                >
                                    {tab === 'console' && <Terminal className="w-4 h-4" />}
                                    {tab === 'terminal' && <Terminal className="w-4 h-4" />}
                                    {tab === 'output' && <List className="w-4 h-4" />}
                                    <span>{tab}</span>
                                    {tab === 'console' && output.length > 0 && (
                                        <span
                                            className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: theme.accent,
                                                color: 'white'
                                            }}
                                        >
                                            {output.length}
                                        </span>
                                    )}
                                    {activeTab === tab && (
                                        <div
                                            className="absolute bottom-0 left-0 right-0 h-0.5"
                                            style={{ backgroundColor: theme.accent }}
                                        ></div>
                                    )}
                                </button>
                            ))}
                            <div className="flex-1"></div>
                            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                <MoreHorizontal className="w-4 h-4" style={{ color: theme.sideBarFg }} />
                            </button>
                        </div>

                        {/* Enhanced Panel Content */}
                        <div
                            className="flex-1 overflow-y-auto p-4"
                            style={{ backgroundColor: theme.debugConsoleBg }}
                        >
                            {activeTab === 'console' && (
                                <div className="font-mono text-sm space-y-2">
                                    <AnimatePresence>
                                        {output.map((log, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-start space-x-3 p-2 rounded-lg group hover:bg-white/5"
                                            >
                                                <span style={{ color: theme.info }} className="select-none text-lg">›</span>
                                                <div className="flex-1">
                                                    <span style={{ color: theme.success }} className="break-all">
                                                        {log}
                                                    </span>
                                                </div>
                                                <span
                                                    className="text-xs opacity-50 group-hover:opacity-100 transition-opacity"
                                                    style={{ color: theme.editorLineNumberFg }}
                                                >
                                                    {new Date().toLocaleTimeString()}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {output.length === 0 && (
                                        <div
                                            className="text-center py-12"
                                            style={{ color: theme.sideBarFg, opacity: 0.6 }}
                                        >
                                            <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <div className="text-lg font-medium mb-2">Console Ready</div>
                                            <div className="text-sm">Output from your code will appear here</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'terminal' && (
                                <div className="font-mono text-sm" style={{ color: theme.sideBarFg }}>
                                    <div className="mb-4 p-3 rounded-lg modern-card">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Terminal className="w-5 h-5" style={{ color: theme.accent }} />
                                            <span className="font-semibold" style={{ color: theme.accent }}>
                                                Integrated Terminal
                                            </span>
                                        </div>
                                        <div className="text-sm">Ready for commands...</div>
                                    </div>
                                    <div className="text-sm opacity-60">
                                        Terminal functionality will be available in future updates.
                                    </div>
                                </div>
                            )}

                            {activeTab === 'output' && (
                                <div className="font-mono text-sm space-y-3">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 rounded-lg modern-card"
                                            style={{
                                                backgroundColor: theme.error + '10',
                                                border: `1px solid ${theme.error}40`
                                            }}
                                        >
                                            <div className="flex items-center space-x-2 mb-3">
                                                <div
                                                    className="w-5 h-5 rounded-full flex items-center justify-center"
                                                    style={{ backgroundColor: theme.error }}
                                                >
                                                    <X className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="font-semibold" style={{ color: theme.error }}>
                                                    Execution Error
                                                </span>
                                            </div>
                                            <pre
                                                className="whitespace-pre-wrap text-sm leading-relaxed"
                                                style={{ color: theme.error }}
                                            >
                                                {error}
                                            </pre>
                                        </motion.div>
                                    )}

                                    {!error && executionSteps.length === 0 && (
                                        <div
                                            className="text-center py-12"
                                            style={{ color: theme.sideBarFg, opacity: 0.6 }}
                                        >
                                            <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <div className="text-lg font-medium mb-2">No Debug Information</div>
                                            <div className="text-sm">Start debugging to see execution details</div>
                                        </div>
                                    )}

                                    {!error && executionSteps.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-3"
                                        >
                                            <div
                                                className="p-4 rounded-lg modern-card"
                                                style={{
                                                    backgroundColor: theme.success + '10',
                                                    border: `1px solid ${theme.success}40`
                                                }}
                                            >
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div
                                                        className="w-5 h-5 rounded-full flex items-center justify-center"
                                                        style={{ backgroundColor: theme.success }}
                                                    >
                                                        <Play className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="font-semibold" style={{ color: theme.success }}>
                                                        Execution Successful
                                                    </span>
                                                </div>
                                                <div className="text-sm grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span style={{ color: theme.editorLineNumberFg }}>Steps:</span>
                                                        <span className="ml-2 font-medium">{executionSteps.length}</span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: theme.editorLineNumberFg }}>Variables:</span>
                                                        <span className="ml-2 font-medium">{Object.keys(variables).length}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Status Bar */}
            <div
                className="h-7 flex items-center justify-between px-4 text-xs"
                style={{
                    background: `linear-gradient(135deg, ${theme.statusBarBg} 0%, ${theme.statusBarBg}dd 100%)`,
                    color: theme.statusBarFg
                }}
            >
                <div className="flex items-center space-x-6">
                    <span className="font-medium">Ln {currentLine || 1}, Col 1</span>
                    <span className="px-2 py-1 rounded bg-white/10">{language.toUpperCase()}</span>
                    <span>UTF-8</span>
                    <span>CRLF</span>
                    {executionSteps.length > 0 && (
                        <span className="flex items-center space-x-1">
                            <Activity className="w-3 h-3" />
                            <span>Debug Active</span>
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    {isExecuting && (
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full animate-pulse bg-green-400"></div>
                            <span>Running</span>
                        </div>
                    )}
                    <Bell className="w-3 h-3" />
                    <span>Ready</span>
                </div>
            </div>
        </div>
    );
};

export default AlgoVisualiser;
