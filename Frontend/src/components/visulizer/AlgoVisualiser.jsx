import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react"; // Import Monaco Editor
import {
    Play,
    Pause,
    RotateCcw,
    Code,
    Bug,
    Eye,
    List,
    Terminal,
    Settings,
    ChevronDown,
    ChevronRight,
    Square,
    ChevronsRight,
    ArrowUpFromDot,
    ArrowDownToDot,
    RotateCcwSquare,
    StopCircle,
    Lightbulb,
    FolderDot,
    BookOpen, // Added for How to Use Guide
    X, // For Close button and Guide close
    TextCursorInput, // Using for font size control
} from "lucide-react";
import {
    FaRocket,
    FaRegLightbulb,
    FaQuestionCircle,
    FaBug,
    FaSearch,
    FaSyncAlt,
    FaCode,
    FaPlayCircle,
    FaForward,
    FaEye,
    FaCheckCircle,
    FaExclamationTriangle
} from 'react-icons/fa';
import { GiBubbles } from 'react-icons/gi';
import { MdOutlineCompassCalibration } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from "framer-motion";

// Accept appTheme and onClose as props
const AlgoVisualiser = ({ appTheme, onClose }) => {
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
    const [showGuide, setShowGuide] = useState(false);

    // Monaco Editor Refs and State
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const [decorations, setDecorations] = useState([]);
    const [editorFontSize, setEditorFontSize] = useState(14); // New state for font size

    // Panel collapse states
    const [collapsedPanels, setCollapsedPanels] = useState({
        controls: false,
        variables: false,
        callStack: false,
        watch: true,
        breakpoints: true,
        loadedScripts: true,
    });

    const togglePanel = (panelName) => {
        setCollapsedPanels(prevState => ({
            ...prevState,
            [panelName]: !prevState[panelName]
        }));
    };

    // Helper to get accent color base, e.g., 'cyan' from 'bg-cyan-500'
    const getAccentColorBase = () => {
        const accentColorClass = appTheme.accent || appTheme.buttonPrimary;
        const match = accentColorClass.match(/bg-(\w+)-\d+/);
        return match ? match[1] : 'blue'; // Default to 'blue' if no match
    };

    // Default code for each language - Bubble Sort specific
    const getDefaultCode = (lang) => {
        const bubbleSortCodes = {
            javascript: `function bubbleSort(arr) {
    let n = arr.length;
    console.log("Original array:", JSON.stringify(arr));
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            console.log("Comparing arr[" + j + "] (" + arr[j] + ") and arr[" + (j + 1) + "] (" + arr[j+1] + ")");
            if (arr[j] > arr[j + 1]) {
                // Swap
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                console.log("Swapped. Array now:", JSON.stringify(arr));
            }
        }
    }
    console.log("Sorted array:", JSON.stringify(arr));
    return arr;
}

const myArr = [64, 34, 25, 12, 22, 11, 90];
bubbleSort(myArr);`,
            cpp: `#include <iostream>
#include <vector>

void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    std::cout << "Original array: [";
    for (int k = 0; k < n; ++k) {
        std::cout << arr[k] << (k == n - 1 ? "" : ", ");
    }
    std::cout << "]" << std::endl;

    for (int i = 0; i < n - 1; ++i) {
        for (int j = 0; j < n - i - 1; ++j) {
            std::cout << "Comparing arr[" << j << "] (" << arr[j] << ") and arr[" << (j + 1) << "] (" << arr[j+1] << ")" << std::endl;
            if (arr[j] > arr[j + 1]) {
                // Swap
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                std::cout << "Swapped. Array now: [";
                for (int k = 0; k < n; ++k) {
                    std::cout << arr[k] << (k == n - 1 ? "" : ", ");
                }
                std::cout << "]" << std::endl;
            }
        }
    }
    std::cout << "Sorted array: [";
    for (int k = 0; k < n; ++k) {
        std::cout << arr[k] << (k == n - 1 ? "" : ", ");
    }
    std::cout << "]" << std::endl;
}

int main() {
    std::vector<int> myVector = {64, 34, 25, 12, 22, 11, 90};
    bubbleSort(myVector);
    return 0;
}`,
            python: `def bubble_sort(arr):
    n = len(arr)
    print("Original array:", arr)
    for i in range(n - 1):
        for j in range(0, n - i - 1):
            print(f"Comparing arr[{j}] ({arr[j]}) and arr[{j+1}] ({arr[j+1]})")
            if arr[j] > arr[j + 1]:
                # Swap
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                print("Swapped. Array now:", arr)
    print("Sorted array:", arr)
    return arr

my_list = [64, 34, 25, 12, 22, 11, 90]
bubble_sort(my_list)`,
            java: `import java.util.Arrays;

public class BubbleSortExample {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        System.out.println("Original array: " + Arrays.toString(arr));
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                System.out.println("Comparing arr[" + j + "] (" + arr[j] + ") and arr[" + (j + 1) + "] (" + arr[j+1] + ")");
                if (arr[j] > arr[j + 1]) {
                    // Swap
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    System.out.println("Swapped. Array now: " + Arrays.toString(arr));
                }
            }
        }
        System.out.println("Sorted array: " + Arrays.toString(arr));
    }

    public static void main(String[] args) {
        int[] myArr = {64, 34, 25, 12, 22, 11, 90};
        bubbleSort(myArr);
    }
}`,
        };
        return bubbleSortCodes[lang] || bubbleSortCodes.javascript;
    };

    // Initialize code and reset when language changes
    useEffect(() => {
        setCode(getDefaultCode(language));
        reset();
    }, [language]);

    // Monaco Editor Mount handler
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        // Set initial decorations if currentLine is already set (e.g., on reset with previous state)
        if (currentLine !== null && editorRef.current && monacoRef.current) {
            updateMonacoDecorations(currentLine);
        }
    };

    // Update Monaco decorations when currentLine changes
    useEffect(() => {
        if (editorRef.current && monacoRef.current) {
            updateMonacoDecorations(currentLine);
        }
    }, [currentLine, appTheme]);

    const updateMonacoDecorations = (line) => {
        const newDecorations = [];
        if (line !== null) {
            // Using `className` for line number highlight and `linesContentClassName` for text area highlight
            newDecorations.push({
                range: new monacoRef.current.Range(line, 1, line, 1),
                options: {
                    isWholeLine: true, // Highlight the entire line
                    className: `monaco-current-line-highlight-gutter`, // For line number background
                    linesContentClassName: `monaco-current-line-highlight-content`, // For content area background
                    overviewRuler: {
                        color: appTheme.warningColor.includes('yellow') ? '#facc15' : '#eab308', // yellow-400 or yellow-500
                        position: monacoRef.current.editor.OverviewRulerLane.Full
                    },
                    stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                },
            });
        }
        setDecorations(editorRef.current.deltaDecorations(decorations, newDecorations));
    };

    // Custom styles for Monaco Editor highlighting (injected directly for simplicity)
    const monacoHighlightStyle = `
        .monaco-editor .monaco-current-line-highlight-content {
            background-color: 
        }
        .monaco-editor .monaco-current-line-highlight-gutter {
            border-left: 3px solid ${appTheme.warningColor.includes('yellow') ? '#facc15' : '#eab308'}; /* Tailwind yellow-400 or yellow-500 */
        }
    `;

    // Validate JavaScript syntax before execution
    const validateJavaScriptSyntax = (code) => {
        try {
            new Function(code);
            return { valid: true, error: null };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    };

    // Clean and prepare JavaScript code (simplified)
    const cleanJavaScriptCode = (code) => {
        // This cleaning logic is highly simplified and may not catch all cases
        let cleanedCode = code
            .replace(/;;+/g, ";")
            .replace(/\s*;\s*}/g, ";}");
        return cleanedCode;
    };

    // Execute code based on language
    const executeCode = async () => {
        try {
            setError(null);
            setOutput([]);
            setVariables({});
            setCallStack([]);
            setExecutionSteps([]); // Clear previous steps

            let steps = [];
            if (language === "javascript") {
                const cleanedCode = cleanJavaScriptCode(code);
                const validation = validateJavaScriptSyntax(cleanedCode);
                if (!validation.valid) {
                    throw new Error(`Syntax Error: ${validation.error}`);
                }
                steps = executeJavaScript(cleanedCode);
            } else if (language === "cpp") {
                steps = simulateCppExecution(code);
            } else if (language === "python") {
                steps = simulatePythonExecution(code);
            } else if (language === "java") {
                steps = simulateJavaExecution(code);
            }

            setExecutionSteps(steps);
            setExecutionStep(0);
            if (steps.length > 0) {
                updateVisualization(steps[0]);
                setIsExecuting(false); // Do not auto-start, user clicks play
            } else {
                setOutput(["No execution steps generated."]);
            }
        } catch (err) {
            setError(`Execution Error: ${err.message || err}`);
            console.error("Code execution error:", err);
            setIsExecuting(false);
        }
    };

    // JavaScript Execution
    const executeJavaScript = (cleanedCode) => {
        const steps = [];
        const vars = {};
        const logs = [];
        const stack = [];

        const context = {
            addStep: (lineNum, type, data) => {
                steps.push({
                    step: steps.length,
                    line: lineNum,
                    type: type,
                    data: data,
                    variables: { ...vars },
                    callStack: [...stack],
                    output: [...logs],
                });
            },
            setVariable: (name, value) => {
                vars[name] = value;
            },
            log: (...args) => {
                logs.push(
                    args
                        .map((arg) =>
                            typeof arg === "object" ? JSON.stringify(arg) : String(arg)
                        )
                        .join(" ")
                );
            },
            pushCall: (funcName, params) => {
                stack.push({
                    function: String(funcName),
                    parameters: String(params),
                });
            },
            popCall: () => {
                if (stack.length > 0) stack.pop();
            },
        };

        const instrumentedCode = instrumentJavaScriptCode(cleanedCode);

        try {
            // Create a function in a controlled scope to execute the instrumented code
            new Function('context', instrumentedCode)(context);
        } catch (err) {
            throw new Error(`JavaScript Runtime Error: ${err.message}`);
        }
        return steps;
    };

    // C++ Execution (Simulated)
    const simulateCppExecution = (cppCode) => {
        const steps = [];
        const lines = cppCode.split("\n");
        let vars = {};
        let logs = [];
        let stack = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmedLine = line.trim();

            if (trimmedLine === "" || trimmedLine.startsWith("//") || trimmedLine.startsWith("#") || trimmedLine.startsWith("using")) {
                return;
            }

            // Capture state before line execution
            steps.push({
                step: steps.length,
                line: lineNum,
                type: "execution",
                data: trimmedLine,
                variables: { ...vars },
                callStack: [...stack],
                output: [...logs],
            });

            // Variable declarations and assignments (simplified)
            let varMatch = trimmedLine.match(/(?:int|std::vector<int>)\s+(\w+)(?:\s*=\s*([^;]+))?;?/);
            if (!varMatch) {
                varMatch = trimmedLine.match(/^(\w+)\s*=\s*([^;]+);?/); // Assignment only
            }
            if (varMatch) {
                const varName = varMatch[1];
                let varValue = varMatch[2];
                if (varValue) {
                    // Basic attempt to evaluate simple expressions
                    try {
                        const evaluated = eval(varValue.replace(/arr\[(\d+)\]/g, (m, idx) => `vars['arr'][${idx}]`).replace(/(\w+)/g, (m) => vars.hasOwnProperty(m) ? JSON.stringify(vars[m]) : m));
                        vars[varName] = evaluated;
                    } catch {
                        if (varValue.startsWith("{") && varValue.endsWith("}")) { // e.g. std::vector initialization
                            try {
                                vars[varName] = JSON.parse(`[${varValue.substring(1, varValue.length - 1)}]`);
                            } catch {
                                vars[varName] = varValue;
                            }
                        } else if (varValue.includes("arr[")) { // Simple array access simulation for logging
                            const arrAccessMatch = varValue.match(/arr\[(\d+)\]/);
                            if (arrAccessMatch && vars['arr'] && typeof vars['arr'] === 'object') {
                                vars[varName] = vars['arr'][parseInt(arrAccessMatch[1])];
                            } else {
                                vars[varName] = varValue; // fallback
                            }
                        } else {
                            vars[varName] = varValue; // Keep as string if complex
                        }
                    }
                } else {
                    vars[varName] = "uninitialized";
                }
            }

            // std::cout statements
            const coutMatch = trimmedLine.match(/std::cout\s*<<\s*(.+?)(?:<<\s*std::endl)?;?/);
            if (coutMatch) {
                let logContent = coutMatch[1];
                // Replace string literals
                logContent = logContent.replace(/"([^"]*)"/g, (_, p1) => p1);
                // Replace variable names with their current values
                logContent = logContent.replace(/(\w+)/g, (match) => vars.hasOwnProperty(match) ? String(vars[match]) : match);
                logs.push(logContent.trim());
            }

            // Function calls/definitions (simplified)
            const funcDefMatch = trimmedLine.match(/(?:int|void|public static void)\s+(\w+)\s*\(([^)]*)\)\s*{/);
            if (funcDefMatch && funcDefMatch[1] !== "main") {
                stack.push({ function: funcDefMatch[1], parameters: funcDefMatch[2] || 'void' });
            }
            if (trimmedLine.startsWith("return")) {
                if (stack.length > 0) stack.pop();
            }
        });
        // Add final state for the last line if any
        if (lines.length > 0) {
            steps.push({
                step: steps.length,
                line: lines.length, // Last line
                type: "end",
                data: "End of execution",
                variables: { ...vars },
                callStack: [...stack],
                output: [...logs],
            });
        }
        return steps;
    };

    // Python Execution (Simulated)
    const simulatePythonExecution = (pythonCode) => {
        const steps = [];
        const lines = pythonCode.split("\n");
        let vars = {};
        let logs = [];
        let stack = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmedLine = line.trim();

            if (trimmedLine === "" || trimmedLine.startsWith("#")) {
                return;
            }

            steps.push({
                step: steps.length,
                line: lineNum,
                type: "execution",
                data: trimmedLine,
                variables: { ...vars },
                callStack: [...stack],
                output: [...logs],
            });

            // Variable assignments (simple)
            const assignmentMatch = trimmedLine.match(/^(\w+)\s*=\s*(.+)$/);
            if (assignmentMatch) {
                const varName = assignmentMatch[1];
                let varValue = assignmentMatch[2];
                try {
                    // Attempt to evaluate basic Python literals/expressions (numbers, strings, lists)
                    if (varValue.startsWith('[') && varValue.endsWith(']')) {
                        vars[varName] = JSON.parse(varValue.replace(/'/g, '"')); // Convert single quotes to double for JSON.parse
                    } else if (!isNaN(Number(varValue))) {
                        vars[varName] = Number(varValue);
                    } else if (varValue.startsWith('"') && varValue.endsWith('"')) {
                        vars[varName] = varValue.substring(1, varValue.length - 1);
                    } else if (varValue === 'True' || varValue === 'False') {
                        vars[varName] = varValue === 'True';
                    } else { // Try to resolve from other variables
                        const resolvedValue = varValue.replace(/(\w+)/g, (match) => vars.hasOwnProperty(match) ? JSON.stringify(vars[match]) : match);
                        vars[varName] = eval(resolvedValue); // Dangerous but for simple cases
                    }
                } catch {
                    vars[varName] = varValue; // Store as string if cannot parse
                }
            }

            // print statements
            const printMatch = trimmedLine.match(/print\s*\((.*)\)/);
            if (printMatch) {
                let logContent = printMatch[1];
                // Replace f-strings (simplified)
                logContent = logContent.replace(/f"([^"]*)"/g, (_, p1) => {
                    return p1.replace(/\{(\w+)\}/g, (m, varName) => vars.hasOwnProperty(varName) ? String(vars[varName]) : m);
                });
                // Replace variables in regular prints
                logContent = logContent.split(',').map(part => {
                    part = part.trim();
                    if (part.startsWith('"') && part.endsWith('"')) {
                        return part.substring(1, part.length - 1);
                    }
                    if (vars.hasOwnProperty(part)) {
                        return String(vars[part]);
                    }
                    return part;
                }).join(' ');
                logs.push(logContent);
            }

            // Function definitions and calls
            const funcDefMatch = trimmedLine.match(/^def\s+(\w+)\s*\(([^)]*)\):/);
            if (funcDefMatch && funcDefMatch[1] !== "main" && funcDefMatch[1] !== "bubble_sort") { // Exclude 'main' concept and main sorting function
                stack.push({ function: funcDefMatch[1], parameters: funcDefMatch[2] || 'void' });
            }
            if (trimmedLine.includes("return")) {
                if (stack.length > 0) stack.pop();
            }
        });
        if (lines.length > 0) {
            steps.push({
                step: steps.length,
                line: lines.length,
                type: "end",
                data: "End of execution",
                variables: { ...vars },
                callStack: [...stack],
                output: [...logs],
            });
        }
        return steps;
    };

    // Java Execution (Simulated)
    const simulateJavaExecution = (javaCode) => {
        const steps = [];
        const lines = javaCode.split("\n");
        let vars = {};
        let logs = [];
        let stack = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmedLine = line.trim();

            if (trimmedLine === "" || trimmedLine.startsWith("//") || trimmedLine.startsWith("import") || trimmedLine.startsWith("public class") || trimmedLine === "}" || trimmedLine.startsWith("public static void main")) {
                return;
            }

            steps.push({
                step: steps.length,
                line: lineNum,
                type: "execution",
                data: trimmedLine,
                variables: { ...vars },
                callStack: [...stack],
                output: [...logs],
            });

            // Variable declarations and assignments
            let varDeclAssignMatch = trimmedLine.match(/(?:int|String|boolean|double|float|char|long|short|byte|public static void|private static void)\s+(\w+)(?:\s*=\s*([^;]+))?;?/);
            if (!varDeclAssignMatch) {
                varDeclAssignMatch = trimmedLine.match(/^(\w+)\s*=\s*([^;]+);?/); // Assignment only
            }

            if (varDeclAssignMatch) {
                const varName = varDeclAssignMatch[1];
                let varValue = varDeclAssignMatch[2];
                if (varValue) {
                    try {
                        if (varValue.startsWith("{") && varValue.endsWith("}")) { // e.g. array initialization
                            vars[varName] = JSON.parse(`[${varValue.substring(1, varValue.length - 1)}]`);
                        } else if (varValue.startsWith('"') && varValue.endsWith('"')) {
                            vars[varName] = varValue.substring(1, varValue.length - 1);
                        } else if (varValue === 'true' || varValue === 'false') {
                            vars[varName] = varValue === 'true';
                        } else if (varValue.includes("Arrays.toString")) {
                            const arrayNameMatch = varValue.match(/Arrays\.toString\((\w+)\)/);
                            if (arrayNameMatch && vars.hasOwnProperty(arrayNameMatch[1])) {
                                vars[varName] = JSON.stringify(vars[arrayNameMatch[1]]);
                            } else {
                                vars[varName] = varValue;
                            }
                        }
                        else {
                            // Basic eval, replacing vars
                            const evaluated = eval(varValue.replace(/arr\[(\d+)\]/g, (m, idx) => `vars['arr'][${idx}]`).replace(/(\w+)/g, (m) => vars.hasOwnProperty(m) ? JSON.stringify(vars[m]) : m));
                            vars[varName] = evaluated;
                        }
                    } catch {
                        vars[varName] = varValue;
                    }
                } else {
                    vars[varName] = "uninitialized";
                }
            }

            // System.out.println statements
            const sysoutMatch = trimmedLine.match(/System\.out\.println\s*\((.+?)\);?/);
            if (sysoutMatch) {
                let logContent = sysoutMatch[1];
                logContent = logContent.replace(/"([^"]*)"/g, (_, p1) => p1); // Unquote strings
                logContent = logContent.replace(/\+\s*(\w+)/g, (m, varName) => { // Replace vars in concatenation
                    if (vars.hasOwnProperty(varName)) return String(vars[varName]);
                    return m;
                });
                logs.push(logContent.trim());
            }

            // Function definitions and calls
            const funcDefMatch = trimmedLine.match(/(?:public|private|protected|static|void|int|String)\s+(\w+)\s*\(([^)]*)\)\s*{/);
            if (funcDefMatch && funcDefMatch[1] !== "main" && funcDefMatch[1] !== "bubbleSort") {
                stack.push({ function: funcDefMatch[1], parameters: funcDefMatch[2] || 'void' });
            }
            if (trimmedLine.startsWith("return")) {
                if (stack.length > 0) stack.pop();
            }
        });
        if (lines.length > 0) {
            steps.push({
                step: steps.length,
                line: lines.length,
                type: "end",
                data: "End of execution",
                variables: { ...vars },
                callStack: [...stack],
                output: [...logs],
            });
        }
        return steps;
    };

    // Instrument JavaScript Code
    const instrumentJavaScriptCode = (originalCode) => {
        let lines = originalCode.split("\n");
        let instrumentedLines = [];

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const trimmedLine = line.trim();

            if (trimmedLine === "" || trimmedLine.startsWith("//")) {
                instrumentedLines.push(line);
                return;
            }

            // Add step tracking before the line is executed
            instrumentedLines.push(
                `context.addStep(${lineNumber}, 'execution', ${JSON.stringify(trimmedLine)});`
            );

            // Handle variable declarations and assignments
            const varDeclMatch = trimmedLine.match(/^(let|const|var)\s+(\w+)\s*=\s*([^;]+);?/);
            const varAssignMatch = trimmedLine.match(/^(\w+)\s*=\s*([^;]+);?/);
            const consoleLogMatch = trimmedLine.includes("console.log");
            const functionDeclMatch = trimmedLine.match(/function\s+(\w+)\s*\(([^)]*)\)/);
            const returnMatch = trimmedLine.includes("return");

            if (varDeclMatch) {
                const [, keyword, varName, value] = varDeclMatch;
                instrumentedLines.push(`${keyword} ${varName} = ${value};`);
                instrumentedLines.push(`context.setVariable(${JSON.stringify(varName)}, ${varName});`);
            } else if (varAssignMatch && !functionDeclMatch && !consoleLogMatch) {
                const [, varName] = varAssignMatch;
                instrumentedLines.push(line); // Original assignment
                instrumentedLines.push(`context.setVariable(${JSON.stringify(varName)}, ${varName});`);
            } else if (consoleLogMatch) {
                instrumentedLines.push(line.replace("console.log", "context.log"));
            } else if (functionDeclMatch) {
                const [, funcName, params] = functionDeclMatch;
                instrumentedLines.push(line); // Original function line
                instrumentedLines.push(`context.pushCall(${JSON.stringify(funcName)}, ${JSON.stringify(params.split(',').map(p => p.trim()))});`);
            } else if (returnMatch) {
                // Add return step before the actual return statement
                instrumentedLines.push(
                    `context.addStep(${lineNumber}, 'return', ${JSON.stringify(trimmedLine)});`
                );
                instrumentedLines.push(line);
                instrumentedLines.push(`context.popCall();`);
            } else {
                instrumentedLines.push(line);
            }
        });
        return instrumentedLines.join("\n");
    };

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

    const updateVisualization = (step) => {
        if (step) {
            setCurrentLine(step.line);
            setVariables(step.variables || {});
            setOutput(step.output || []);
            setCallStack(step.callStack || []);
        } else {
            // No step, reset visualization
            setCurrentLine(null);
            setVariables({});
            setOutput([]);
            setCallStack([]);
        }
    };

    useEffect(() => {
        if (isExecuting && executionSteps.length > 0) {
            if (executionStep < executionSteps.length - 1) {
                const timer = setTimeout(() => {
                    stepForward();
                }, speed);
                return () => clearTimeout(timer);
            } else {
                setIsExecuting(false); // Stop when last step is reached
            }
        }
    }, [isExecuting, executionStep, speed, executionSteps.length]);

    const reset = () => {
        setIsExecuting(false);
        setExecutionStep(0);
        setCurrentLine(null);
        setVariables({});
        setOutput([]);
        setCallStack([]);
        setError(null);
        setExecutionSteps([]);
        if (editorRef.current && monacoRef.current) {
            editorRef.current.deltaDecorations(decorations, []); // Clear Monaco decorations
            setDecorations([]);
        }
    };

    const toggleExecution = () => {
        if (executionSteps.length === 0) {
            executeCode(); // Run parse & setup if not done
        }
        setIsExecuting(!isExecuting);
    };

    // Helper for common panel styling
    const panelClasses = `${appTheme.cardBg} rounded-md border ${appTheme.border} shadow-sm`;
    const panelHeaderClasses = `flex items-center justify-between p-3 border-b ${appTheme.border} cursor-pointer hover:${appTheme.primary}/10 transition-colors`;
    const panelContentClasses = `p-3 text-sm font-mono`;

    const debuggerButtonClass = `${appTheme.cardBg} hover:${appTheme.primary}/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm transition-colors ${appTheme.text} text-sm p-1.5`;

    return (
        <div className={`min-h-[calc(100vh-64px)] ${appTheme.background} ${appTheme.text} relative z-10 p-4 lg:p-6 font-sans flex flex-col`}>
            {/* Inject Monaco custom styles */}
            <style>{monacoHighlightStyle}</style>

            {/* Close Button for Debugger */}
            <button
                onClick={onClose}
                className={`absolute top-4 right-4 p-2 rounded-full ${appTheme.cardBg} ${appTheme.text} hover:${appTheme.primaryHover} hover:${appTheme.buttonText} transition-all duration-200 z-50`}
                title="Exit Debugger"
            >
                <X className="w-5 h-5" />
            </button>

            {/* How to Use Guide Modal */}
            <AnimatePresence>
                {showGuide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 ${appTheme.background}/80 backdrop-blur-sm z-50 flex items-center justify-center p-4`}
                        onClick={() => setShowGuide(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`${appTheme.cardBg} rounded-lg p-8 max-w-4xl max-h-[80vh] overflow-y-auto border ${appTheme.border} shadow-xl`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-2xl font-bold ${appTheme.text} flex items-center gap-2`}>
                                    <FaRocket className={`w-6 h-6 ${appTheme.infoColor}`} />
                                    Code Visualization Playground
                                    <span className="text-yellow-400">✨</span>
                                </h2>
                                <button
                                    onClick={() => setShowGuide(false)}
                                    className={`p-1 rounded-full ${appTheme.cardBg} hover:${appTheme.background} transition-colors`}
                                >
                                    <IoClose className={`w-5 h-5 ${appTheme.cardText}`} />
                                </button>
                            </div>

                            <div className={`space-y-6 ${appTheme.cardText}`}>
                                <div>
                                    <h3 className={`text-lg font-semibold ${appTheme.infoColor} mb-3 flex items-center gap-2`}>
                                        <MdOutlineCompassCalibration className="w-5 h-5" />
                                        Getting Oriented
                                    </h3>
                                    <ol className="list-decimal list-inside space-y-3 pl-5">
                                        <li className="flex items-start gap-2">
                                            <FaCode className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>Select your preferred language from our supported options</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <GiBubbles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>A bubble sort implementation is pre-loaded as a starting example</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaPlayCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>Click <strong className={`${appTheme.successColor}`}>Initialize Visualization</strong> to prepare your code</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaForward className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>Use the interactive controls to navigate through each execution step</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaEye className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>Watch real-time updates in variables, call hierarchy, and program output</span>
                                        </li>
                                    </ol>
                                </div>

                                <div>
                                    <h3 className={`text-lg font-semibold ${appTheme.infoColor} mb-3 flex items-center gap-2`}>
                                        <FaRegLightbulb className="w-5 h-5" />
                                        Pro Tips & Language Features
                                    </h3>
                                    <div className={`${appTheme.background} p-4 rounded-lg border ${appTheme.border}`}>
                                        <div className="flex items-start gap-2 mb-3">
                                            <FaCode className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <p>
                                                Our visualizer provides rich syntax highlighting across all supported languages through Monaco Editor. JavaScript execution offers detailed instrumentation, while other languages are intelligently simulated.
                                            </p>
                                        </div>

                                        <div className="mt-4 mb-2 flex items-center gap-2">
                                            <span className="text-yellow-500">⚡</span>
                                            <strong>Key Supported Features:</strong>
                                        </div>
                                        <ul className="list-disc list-inside space-y-2 pl-5">
                                            <li className="flex items-start gap-2">
                                                <FaCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                                                <span>Variable tracking for primitive values and simple collections</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <FaCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                                                <span>Output capture for standard print/display functions</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <FaCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                                                <span>Function call tracking with basic parameter values</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <FaCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                                                <span>Iteration monitoring for standard loop constructs</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <FaExclamationTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-500" />
                                                <span><strong>Note:</strong> Advanced patterns like recursion, OOP concepts, and complex data flows may have limited visualization</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className={`text-lg font-semibold ${appTheme.infoColor} mb-3 flex items-center gap-2`}>
                                        <FaQuestionCircle className="w-5 h-5" />
                                        Need Help?
                                    </h3>
                                    <ul className="list-disc list-inside space-y-3 pl-5">
                                        <li className="flex items-start gap-2">
                                            <FaBug className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>
                                                <strong className={`${appTheme.errorColor}`}>Code not parsing?</strong> Ensure basic syntax correctness and avoid unconventional patterns for best results.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaSearch className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>
                                                <strong className={`${appTheme.errorColor}`}>Missing elements?</strong> Declare variables explicitly and use standard function definitions.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaSyncAlt className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>
                                                <strong className={`${appTheme.errorColor}`}>Blank visualization?</strong> Remember to initialize first! Still stuck? Try simplifying complex logic.
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                <div className={`mt-6 pt-4 border-t ${appTheme.border} flex items-center gap-2`}>
                                    <FaQuestionCircle className="w-5 h-5" />
                                    <span>For advanced help, check our documentation or community forums</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Bar: Language Selection & Guide Button */}
            <div className={`mb-4 flex flex-col md:flex-row items-center justify-between p-3 rounded-lg ${appTheme.cardBg} border ${appTheme.border} shadow-md`}>
                <div className="flex items-center gap-4 mb-3 md:mb-0">
                    <span className={`${appTheme.text} font-semibold text-sm`}>Language:</span>
                    <div className="flex space-x-3">
                        {["javascript", "cpp", "python", "java"].map((lang) => (
                            <label key={lang} className="inline-flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="language"
                                    value={lang}
                                    checked={language === lang}
                                    onChange={() => setLanguage(lang)}
                                    className={`form-radio h-4 w-4 ${appTheme.accent.replace('bg-', 'text-')}`}
                                />
                                <span className={`ml-2 text-sm font-medium ${appTheme.cardText}`}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <TextCursorInput className={`w-4 h-4 ${appTheme.cardText}`} />
                        <label htmlFor="font-size" className={`text-sm font-medium ${appTheme.cardText}`}>Font Size:</label>
                        <select
                            id="font-size"
                            value={editorFontSize}
                            onChange={(e) => setEditorFontSize(Number(e.target.value))}
                            className={`px-2 py-1 rounded-sm ${appTheme.background} ${appTheme.cardText} border ${appTheme.border} text-sm focus:outline-none focus:ring-1 focus:ring-${getAccentColorBase()}-500`}
                        >
                            {[12, 13, 14, 15, 16, 17, 18, 20, 22].map((size) => (
                                <option key={size} value={size}>{size}px</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowGuide(true)}
                        className={`flex items-center gap-1 px-3 py-1.5 ${appTheme.buttonSecondary} hover:${appTheme.buttonSecondaryHover} ${appTheme.buttonText} rounded-md text-sm font-medium transition-all shadow-sm`}
                        title="How to Use Guide"
                    >
                        <BookOpen className="w-4 h-4" />
                        Guide
                    </button>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
                {/* Left Sidebar for Debug Panels */}
                <div className={`flex flex-col space-y-4 ${appTheme.cardBg} p-2 rounded-lg border ${appTheme.border} bg-opacity-50`}>
                    {/* RUN & DEBUG Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={panelClasses}
                    >
                        <div className={panelHeaderClasses + ` border-b-0 py-2`}>
                            <h3 className={`font-semibold text-sm ${appTheme.text} flex items-center gap-2`}>
                                <Bug className={`w-4 h-4 ${appTheme.primary}`} />
                                RUN & DEBUG
                            </h3>
                            <button
                                onClick={reset}
                                className={`p-1 ${appTheme.accent}/20 hover:${appTheme.accent}/40 rounded-md transition-colors ${appTheme.text} text-xs`}
                                title="Reset Debugger"
                            >
                                <RotateCcw className="w-3 h-3" />
                            </button>
                        </div>
                        <div className={panelContentClasses + ` flex flex-col gap-3 pt-0`}>
                            {/* Launch Program Button */}
                            <button
                                onClick={executeCode}
                                className={`flex items-center gap-2 px-3 py-1.5 ${appTheme.buttonPrimary} hover:${appTheme.buttonPrimaryHover} ${appTheme.buttonText} rounded-sm text-sm font-semibold transition-all shadow-md`}
                                title="Start Debugging"
                            >
                                <Play className="w-4 h-4" />
                                Parse & Setup
                                <Settings className="w-3 h-3 ml-auto opacity-70" />
                            </button>

                            {/* Playback Controls */}
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <button
                                    onClick={stepBackward}
                                    disabled={executionStep === 0 || executionSteps.length === 0}
                                    className={debuggerButtonClass}
                                    title="Step Back"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={toggleExecution}
                                    disabled={executionSteps.length === 0 && !isExecuting} // Disable if no steps and not executing
                                    className={`p-1.5 rounded-sm transition-all ${isExecuting
                                        ? `${appTheme.errorColor.replace('text-', 'bg-')} hover:${appTheme.errorColor.replace('text-', 'bg-')}/80 shadow-md`
                                        : `${appTheme.successColor.replace('text-', 'bg-')} hover:${appTheme.successColor.replace('text-', 'bg-')}/80 shadow-md`
                                        } ${appTheme.buttonText}`}
                                    title={isExecuting ? "Pause" : "Play"}
                                >
                                    {isExecuting ? (
                                        <Pause className="w-4 h-4" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                </button>

                                <button
                                    onClick={stepForward}
                                    disabled={executionStep >= executionSteps.length - 1 || executionSteps.length === 0}
                                    className={debuggerButtonClass}
                                    title="Step Forward"
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2 mt-3">
                                <div className="flex items-center gap-3">
                                    <label className={`text-xs font-medium ${appTheme.cardText} min-w-[50px]`}>
                                        Speed:
                                    </label>
                                    <input
                                        type="range"
                                        min="100"
                                        max="2000"
                                        value={speed}
                                        onChange={(e) => setSpeed(Number(e.target.value))}
                                        className={`flex-1 accent-${getAccentColorBase()}-500 h-1 rounded-lg cursor-pointer`}
                                    />
                                    <span className={`text-xs ${appTheme.cardText} min-w-[40px] text-right`}>
                                        {speed}ms
                                    </span>
                                </div>

                                <div className={`text-xs ${appTheme.cardText} ${appTheme.background} px-2 py-1.5 rounded-sm`}>
                                    Step{" "}
                                    <span className={`font-semibold ${appTheme.text}`}>
                                        {executionStep + 1}
                                    </span>{" "}
                                    of{" "}
                                    <span className={`font-semibold ${appTheme.text}`}>
                                        {executionSteps.length}
                                    </span>
                                    {currentLine && (
                                        <span>
                                            {" "}
                                            • Line{" "}
                                            <span className={`${appTheme.warningColor} font-semibold`}>
                                                {currentLine}
                                            </span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Variables Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className={panelClasses + ` flex-1 flex flex-col`}
                    >
                        <div className={panelHeaderClasses} onClick={() => togglePanel('variables')}>
                            <h3 className={`font-semibold text-sm ${appTheme.text} flex items-center gap-2`}>
                                <Eye className={`w-4 h-4 ${appTheme.infoColor}`} />
                                VARIABLES
                            </h3>
                            {collapsedPanels.variables ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        {!collapsedPanels.variables && (
                            <div className={panelContentClasses + ` flex-1 overflow-y-auto custom-scrollbar`}>
                                <AnimatePresence>
                                    {Object.entries(variables).map(([name, value]) => (
                                        <motion.div
                                            key={name}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className={`flex justify-between items-center ${appTheme.background} px-2 py-1.5 rounded-sm border ${appTheme.border} text-xs mb-1`}
                                        >
                                            <span className={`${appTheme.infoColor} font-mono font-semibold`}>
                                                {name}
                                            </span>
                                            <span className={`${appTheme.successColor} font-mono`}>
                                                {typeof value === "object"
                                                    ? JSON.stringify(value)
                                                    : String(value)}
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {Object.keys(variables).length === 0 && (
                                    <div className={`${appTheme.cardText} text-xs text-center py-2`}>
                                        No variables yet
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* WATCH Panel (Placeholder) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={panelClasses}
                    >
                        <div className={panelHeaderClasses} onClick={() => togglePanel('watch')}>
                            <h3 className={`font-semibold text-sm ${appTheme.text} flex items-center gap-2`}>
                                <Lightbulb className={`w-4 h-4 ${appTheme.highlightSecondary}`} />
                                WATCH
                            </h3>
                            {collapsedPanels.watch ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        {!collapsedPanels.watch && (
                            <div className={panelContentClasses + ` text-xs text-center py-2`}>
                                <p className={`${appTheme.cardText}/70`}>Feature coming soon!</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Call Stack Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={panelClasses + ` flex-1 flex flex-col`}
                    >
                        <div className={panelHeaderClasses} onClick={() => togglePanel('callStack')}>
                            <h3 className={`font-semibold text-sm ${appTheme.text} flex items-center gap-2`}>
                                <List className={`w-4 h-4 ${appTheme.highlightTertiary}`} />
                                CALL STACK
                            </h3>
                            {collapsedPanels.callStack ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        {!collapsedPanels.callStack && (
                            <div className={panelContentClasses + ` flex-1 overflow-y-auto custom-scrollbar`}>
                                {callStack.map((call, index) => (
                                    <div
                                        key={index}
                                        className={`${appTheme.background} px-2 py-1.5 rounded-sm text-xs border ${appTheme.border} mb-1`}
                                    >
                                        <span className={`${appTheme.highlightTertiary} font-semibold`}>
                                            {call.function}
                                        </span>
                                        <span className={`${appTheme.cardText}`}>({call.parameters})</span>
                                    </div>
                                ))}
                                {callStack.length === 0 && (
                                    <div className={`${appTheme.cardText} text-xs text-center py-2`}>
                                        No function calls
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* BREAKPOINTS Panel (Placeholder) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className={panelClasses}
                    >
                        <div className={panelHeaderClasses} onClick={() => togglePanel('breakpoints')}>
                            <h3 className={`font-semibold text-sm ${appTheme.text} flex items-center gap-2`}>
                                <Square className={`w-4 h-4 ${appTheme.errorColor}`} />
                                BREAKPOINTS
                            </h3>
                            {collapsedPanels.breakpoints ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        {!collapsedPanels.breakpoints && (
                            <div className={panelContentClasses + ` text-xs text-center py-2`}>
                                <p className={`${appTheme.cardText}/70`}>Set breakpoints in your code.</p>
                            </div>
                        )}
                    </motion.div>

                    {/* LOADED SCRIPTS Panel (Placeholder) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className={panelClasses + ` mb-4`}
                    >
                        <div className={panelHeaderClasses} onClick={() => togglePanel('loadedScripts')}>
                            <h3 className={`font-semibold text-sm ${appTheme.text} flex items-center gap-2`}>
                                <FolderDot className={`w-4 h-4 ${appTheme.accent}`} />
                                LOADED SCRIPTS
                            </h3>
                            {collapsedPanels.loadedScripts ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        {!collapsedPanels.loadedScripts && (
                            <div className={panelContentClasses + ` text-xs text-center py-2`}>
                                <p className={`${appTheme.cardText}/70`}>View loaded files.</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right Side for Code Editor & Debug Console */}
                <div className="flex flex-col space-y-4">
                    {/* Code Editor */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={panelClasses + ` overflow-hidden flex-grow flex flex-col`}
                    >
                        {/* Editor Tabs Header */}
                        <div className={`px-4 py-2 flex items-center border-b ${appTheme.border}`}>
                            <div className={`flex items-center gap-2 px-3 py-1 ${appTheme.background} rounded-t-md text-sm font-semibold ${appTheme.text}`}>
                                <Code className="w-4 h-4" />
                                <span>{`main.${language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : 'java'}`}</span>
                                <button className={`p-0.5 rounded-full hover:${appTheme.cardBg} ${appTheme.cardText}`} onClick={() => { }}>
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1">
                            <Editor
                                height="100%"
                                language={language}
                                theme={appTheme.theme === 'dark' ? 'vs-dark' : 'vs-light'} // Adjust Monaco theme based on appTheme
                                value={code}
                                onChange={(newValue) => setCode(newValue)}
                                onMount={handleEditorDidMount}
                                options={{
                                    readOnly: false,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    fontSize: editorFontSize, // Apply font size
                                    lineNumbers: 'on',
                                    wordWrap: 'on',
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Debug Console */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={panelClasses + ` h-48 flex-shrink-0 flex flex-col`}
                    >
                        <div className={`px-4 py-2 flex items-center border-b ${appTheme.border}`}>
                            <h3 className={`font-semibold text-sm ${appTheme.text} flex items-center gap-2`}>
                                <Terminal className={`w-4 h-4 ${appTheme.successColor}`} />
                                DEBUG CONSOLE
                            </h3>
                        </div>
                        <div className={`${appTheme.background} p-3 flex-1 overflow-y-auto font-mono text-xs custom-scrollbar`}>
                            {output.map((log, index) => (
                                <div key={index} className={`${appTheme.successColor} mb-0.5`}>
                                    <span className={`${appTheme.cardText}/50`}>{">"}</span>{" "}
                                    {typeof log === "object"
                                        ? JSON.stringify(log)
                                        : String(log)}
                                </div>
                            ))}
                            {output.length === 0 && (
                                <div className={`${appTheme.cardText}/50 text-center py-4`}>
                                    Awaiting execution...
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Error Display (persists below console if space allows) */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`${appTheme.errorColor.replace('text-', 'bg-')}/20 border ${appTheme.errorColor.replace('text-', 'border-')} rounded-md p-4 mt-4`}
                            >
                                <h3 className={`font-semibold text-md mb-2 flex items-center gap-2 ${appTheme.text}`}>
                                    <Bug className={`w-4 h-4 ${appTheme.errorColor}`} />
                                    Error
                                </h3>
                                <pre className={`${appTheme.errorColor} text-xs whitespace-pre-wrap ${appTheme.errorColor.replace('text-', 'bg-')}/10 p-2 rounded-sm custom-scrollbar max-h-32 overflow-y-auto`}>
                                    {error}
                                </pre>
                                <div className={`mt-2 text-xs ${appTheme.errorColor}`}>
                                    <strong>Tips:</strong>
                                    <ul className="list-disc list-inside mt-1">
                                        <li>Check for missing semicolons or extra braces.</li>
                                        <li>Ensure variables are declared correctly.</li>
                                        <li>Review function/loop syntax.</li>
                                        <li>Try a sample problem for a working example.</li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AlgoVisualiser;