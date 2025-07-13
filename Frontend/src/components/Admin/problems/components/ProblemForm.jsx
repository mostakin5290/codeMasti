import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import { useTheme } from '../../../../context/ThemeContext';

// --- Constants ---
const difficultyOptions = ['easy', 'medium', 'hard'];
const tagOptions = [
    // Data Structures
    'array',
    'string',
    'linkedList',
    'stack',
    'queue',
    'deque',
    'hashTable',
    'set',
    'map',
    'tree',
    'binaryTree',
    'binarySearchTree',
    'heap',
    'priorityQueue',
    'graph',
    'trie',
    'segmentTree',
    'fenwickTree', // Binary Indexed Tree
    'unionFind',   // Disjoint Set

    // Algorithms / Paradigms
    'recursion',
    'backtracking',
    'divideAndConquer',
    'greedy',
    'dp', // Dynamic Programming
    'memoization',
    'tabulation',
    'bitManipulation',
    'slidingWindow',
    'twoPointers',
    'binarySearch',
    'prefixSum',
    'matrix',
    'topologicalSort',
    'bfs',
    'dfs',
    'dijkstra',
    'floydWarshall',
    'bellmanFord',
    'kruskal',
    'prim',
    'unionByRank',
    'pathCompression',
    'cycleDetection',

    // Math & Misc
    'math',
    'combinatorics',
    'probability',
    'geometry',
    'numberTheory',
    'modularArithmetic',
    'gcd',
    'lcm',
    'sieve',
    'palindrome',
    'anagram',

    // Sorting & Searching
    'sorting',
    'mergeSort',
    'quickSort',
    'countingSort',
    'bucketSort',
    'radixSort',

    // Others
    'simulation',
    'implementation',
    'design',
    'gameTheory',
    'recurrenceRelation',
    'randomized',
    'rotation'
];

const languageOptions = ['javascript', 'python', 'java', 'c', 'cpp']; // Changed 'c++' to 'cpp'
const inputFormatOptions = ['array', 'single', 'object', 'string'];
const returnTypeOptions = ['int', 'string', 'array', 'object', 'boolean', 'void'];
const paramTypeOptions = ['int', 'string', 'array', 'object', 'boolean']; // 'void' is not a parameter type

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

// Default theme for fallback (as before)
const defaultAppTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

// Helper function to safely stringify for display in textarea
const safeStringify = (value) => {
    if (typeof value === 'object' && value !== null) {
        try {
            return JSON.stringify(value, null, 2); // Pretty print JSON
        } catch (e) {
            return String(value); // Fallback for circular or invalid JSON objects
        }
    }
    return String(value); // For primitives
};

// Helper function to safely parse from textarea string back to original type
const safeParse = (value) => {
    try {
        const parsed = JSON.parse(value);
        return parsed; // If it's valid JSON (object or array or primitive)
    } catch (e) {
        // If not valid JSON, try to convert to number/boolean or keep as string
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (!isNaN(Number(value)) && value.trim() !== '') return Number(value); // Handle numbers
        return value; // Keep as string
    }
};


const ProblemForm = ({ initialData = null, onSubmit, isSubmitting, isEditing = false, onValidationFail }) => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...appThemeFromContext };

    // Default execution config templates (these are usually static and not directly editable by admin)
    // They are here to provide a fallback if initialData doesn't have them
    // --- REPLACE THE OLD CONSTANT WITH THIS NEW ONE ---

    const defaultExecutionConfigTemplates = {
        javascript: `// User's function will be inserted here
{{USER_CODE}}

// Input processing and execution
try {
    const rawTestInput = '{{TEST_INPUT}}';
    let parsedInput;
    try {
        parsedInput = JSON.parse(rawTestInput);
    } catch (e) {
        parsedInput = rawTestInput;
    }

    let result;
    const functionToCall = {{FUNCTION_NAME}};

    if ('{{INPUT_FORMAT}}' === 'array') {
        result = functionToCall(...parsedInput);
    } else {
        result = functionToCall(parsedInput);
    }
    
    console.log(JSON.stringify(result));
} catch (error) {
    console.error("RUNTIME_ERROR:", error.toString());
    console.error("STACK_TRACE:", error.stack);
}`,
        python: `# User's function will be inserted here
{{USER_CODE}}

# Input processing and execution
import json
import sys
import traceback

try:
    test_input_str = '{{TEST_INPUT}}'
    parsed_input = None
    try:
        parsed_input = json.loads(test_input_str)
    except json.JSONDecodeError:
        parsed_input = test_input_str

    if 'Solution' in globals():
        solution_instance = Solution()
        function_to_call = getattr(solution_instance, "{{FUNCTION_NAME}}")
    else:
        function_to_call = globals()["{{FUNCTION_NAME}}"]

    result = None
    if '{{INPUT_FORMAT}}' == 'array':
        result = function_to_call(*parsed_input)
    else:
        result = function_to_call(parsed_input)
    
    print(json.dumps(result))

except Exception as e:
    print(f"RUNTIME_ERROR: {str(e)}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)`,
        java: `import java.util.*;

// User's code will be inserted here
{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        try {
            // The backend replaces this with the actual test case
            String inputJson = "{{TEST_INPUT}}";
            Solution solution = new Solution();
            
            // The backend generates the dynamic parsing and method call code here
            {{DYNAMIC_INPUT_PARSING_AND_METHOD_CALL}}
            
        } catch (Exception e) {
            System.err.println("RUNTIME_ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // Self-contained helper methods for parsing and formatting. No external libraries needed.
    private static Object parseValue(String value) {
        value = value.trim();
        if (value.equals("null")) return null;
        if (value.equals("true")) return true;
        if (value.equals("false")) return false;
        if (value.startsWith("\\"") && value.endsWith("\\"")) {
            return value.substring(1, value.length() - 1);
        }
        if (value.startsWith("[") && value.endsWith("]")) {
            return parseArray(value);
        }
        try {
            if (value.contains(".")) return Double.parseDouble(value);
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return value;
        }
    }
    
    private static List<Object> parseArray(String arrayStr) {
        List<Object> result = new ArrayList<>();
        String content = arrayStr.substring(1, arrayStr.length() - 1).trim();
        if (content.isEmpty()) return result;
        String[] elements = content.split(",");
        for (String element : elements) {
            result.add(parseValue(element.trim()));
        }
        return result;
    }

    private static int[] parseIntArray(String arrayStr) {
        List<Object> list = parseArray(arrayStr);
        int[] result = new int[list.size()];
        for (int i = 0; i < list.size(); i++) {
            result[i] = ((Number) list.get(i)).intValue();
        }
        return result;
    }
    
    private static String formatOutput(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof String) return "\\"\\"" + obj + "\\"\\"";
        if (obj.getClass().isArray()) {
            StringBuilder sb = new StringBuilder("[");
            int length = java.lang.reflect.Array.getLength(obj);
            for (int i = 0; i < length; i++) {
                sb.append(formatOutput(java.lang.reflect.Array.get(obj, i)));
                if (i < length - 1) sb.append(",");
            }
            sb.append("]");
            return sb.toString();
        }
        return obj.toString();
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <stdexcept>
using namespace std;

// This template is self-contained and does NOT require external libraries like nlohmann/json.

{{USER_CODE}}

class SimpleParser {
public:
    static vector<int> parseIntArray(const string& str) {
        vector<int> result;
        string content = str.substr(1, str.length() - 2);
        if (content.empty()) return result;
        stringstream ss(content);
        string item;
        while (getline(ss, item, ',')) {
            result.push_back(stoi(item));
        }
        return result;
    }
    static int parseInt(const string& str) { return stoi(str); }
};

template<typename T> void printResult(const T& result) { cout << result; }
template<> void printResult<vector<int>>(const vector<int>& result) {
    cout << "[";
    for (size_t i = 0; i < result.size(); ++i) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]";
}
template<> void printResult<string>(const string& result) { cout << "\\"" << result << "\\""; }
template<> void printResult<bool>(const bool& result) { cout << (result ? "true" : "false"); }

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string input_str = R"({{TEST_INPUT}})";
    try {
        {{DYNAMIC_INPUT_PARSING_AND_METHOD_CALL}}
    } catch (const exception& e) {
        cerr << "RUNTIME_ERROR: " << e.what() << endl;
        return 1;
    }
    return 0;
}`,
        c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

{{USER_CODE}}

int* parseIntArray(const char* str, int* size) {
    *size = 0;
    const char* p = str;
    while (*p) { if (*p++ == ',') (*size)++; }
    (*size)++;
    
    int* arr = (int*)malloc(*size * sizeof(int));
    p = str;
    for (int i = 0; i < *size; i++) {
        arr[i] = atoi(p);
        while (*p && *p != ',') p++;
        p++;
    }
    return arr;
}

void printIntArray(int* arr, int size) {
    printf("[");
    for (int i = 0; i < size; i++) {
        printf("%d", arr[i]);
        if (i < size - 1) printf(",");
    }
    printf("]");
}

int main() {
    char input_str[] = "{{TEST_INPUT}}";
    {{DYNAMIC_INPUT_PARSING_AND_METHOD_CALL}}
    return 0;
}`
    };


    const blankForm = {
        title: '', description: '', difficulty: 'easy', tags: [],
        visibleTestCases: [{ input: '', output: '', explanation: '' }],
        hiddenTestCases: [{ input: '', output: '' }],
        starterCode: [{ language: 'javascript', code: '', functionSignature: '' }], // Added functionSignature
        referenceSolution: [],
        executionConfig: {
            judge0LanguageIds: { // Default IDs (can be extended in backend or here)
                javascript: 93, python: 92, java: 91, c: 50, cpp: 76
            },
            inputOutputConfig: {
                inputFormat: 'array',
                functionName: '',
                parameters: [], // Start with an empty array of parameters
                returnType: 'void'
            },
            wrapperTemplates: defaultExecutionConfigTemplates, // Use the default templates
            timeout: 2000,
            memoryLimit: 128000
        }
    };

    const [formData, setFormData] = useState(initialData || blankForm);
    const [currentTags, setCurrentTags] = useState(initialData?.tags?.join(', ') || '');
    const [errors, setErrors] = useState({});

    // Effect to set initial data when it becomes available or changes
    useEffect(() => {
        if (initialData) {
            // Deep merge initialData into blankForm to ensure all keys are present
            const mergedData = {
                ...blankForm,
                ...initialData,
                // Ensure nested objects/arrays are deeply merged/initialized
                executionConfig: {
                    ...blankForm.executionConfig,
                    ...(initialData.executionConfig || {}),
                    inputOutputConfig: {
                        ...blankForm.executionConfig.inputOutputConfig,
                        ...(initialData.executionConfig?.inputOutputConfig || {}),
                        parameters: (initialData.executionConfig?.inputOutputConfig?.parameters || []).map(p => ({ ...p })) // Deep copy parameters
                    },
                    wrapperTemplates: {
                        ...blankForm.executionConfig.wrapperTemplates, // Preserve default templates if not in initialData
                        ...(initialData.executionConfig?.wrapperTemplates || {}) // Overlay fetched templates
                    }
                },
                visibleTestCases: (initialData.visibleTestCases || []).map(tc => ({
                    ...tc,
                    input: safeStringify(tc.input), // Stringify for textarea display
                    output: safeStringify(tc.output)
                })),
                hiddenTestCases: (initialData.hiddenTestCases || []).map(tc => ({
                    ...tc,
                    input: safeStringify(tc.input), // Stringify for textarea display
                    output: safeStringify(tc.output)
                })),
                starterCode: (initialData.starterCode || []).map(sc => ({ // Ensure functionSignature exists
                    ...sc,
                    functionSignature: sc.functionSignature || ''
                }))
                // referenceSolution, tags are fine as they are simple arrays/objects
            };
            setFormData(mergedData);
            setCurrentTags(initialData.tags?.join(', ') || '');
        }
    }, [initialData]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Generalized handler for nested properties (e.g., executionConfig.inputOutputConfig.functionName)
    const handleNestedInputChange = useCallback((path, value) => {
        setFormData(prev => {
            const newState = { ...prev };
            let current = newState;
            const pathParts = path.split('.');
            for (let i = 0; i < pathParts.length - 1; i++) {
                const part = pathParts[i];
                if (!current[part]) {
                    current[part] = {}; // Initialize if undefined
                }
                current = current[part];
            }
            current[pathParts[pathParts.length - 1]] = value;
            return newState;
        });
    }, []);

    const handleTagsChange = (e) => {
        setCurrentTags(e.target.value);
        const newTags = e.target.value.split(',')
            // .map(tag => tag.trim().toLowerCase())
            .filter(tag => tagOptions.includes(tag) && tag !== '');
        setFormData(prev => ({ ...prev, tags: [...new Set(newTags)] }));
    };

    const handleDynamicListChange = (listName, index, field, value) => {
        setFormData(prev => {
            const newList = [...prev[listName]];
            const currentItem = prev[listName][index];
            newList[index] = { ...currentItem, [field]: value };
            return { ...prev, [listName]: newList };
        });
    };

    // Handler for changes within the parameters array (nested dynamic list)
    const handleParameterChange = useCallback((index, field, value) => {
        setFormData(prev => {
            const newParameters = [...prev.executionConfig.inputOutputConfig.parameters];
            newParameters[index] = { ...newParameters[index], [field]: value };
            return {
                ...prev,
                executionConfig: {
                    ...prev.executionConfig,
                    inputOutputConfig: {
                        ...prev.executionConfig.inputOutputConfig,
                        parameters: newParameters
                    }
                }
            };
        });
    }, []);

    const addDynamicListItem = (listName) => {
        let newItem = {};
        if (listName === 'visibleTestCases') newItem = { input: '', output: '', explanation: '' };
        else if (listName === 'hiddenTestCases') newItem = { input: '', output: '' };
        else if (listName === 'starterCode') newItem = { language: 'javascript', code: '', functionSignature: '' }; // Add functionSignature
        else if (listName === 'referenceSolution') newItem = { language: 'javascript', completeCode: '' };
        else if (listName === 'parameters') newItem = { name: '', type: 'int', description: '' }; // For parameters list
        setFormData(prev => {
            if (listName === 'parameters') {
                return {
                    ...prev,
                    executionConfig: {
                        ...prev.executionConfig,
                        inputOutputConfig: {
                            ...prev.executionConfig.inputOutputConfig,
                            parameters: [...(prev.executionConfig.inputOutputConfig.parameters || []), newItem]
                        }
                    }
                };
            }
            return { ...prev, [listName]: [...(prev[listName] || []), newItem] };
        });
    };

    const removeDynamicListItem = (listName, index) => {
        setFormData(prev => {
            if (listName === 'parameters') {
                return {
                    ...prev,
                    executionConfig: {
                        ...prev.executionConfig,
                        inputOutputConfig: {
                            ...prev.executionConfig.inputOutputConfig,
                            parameters: prev.executionConfig.inputOutputConfig.parameters.filter((_, i) => i !== index)
                        }
                    }
                };
            }
            return {
                ...prev,
                [listName]: prev[listName].filter((_, i) => i !== index)
            };
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title || formData.title.length < 3) {
            newErrors.title = ['Title must be at least 3 characters long.'];
        }
        if (!formData.description || formData.description.length < 10) {
            newErrors.description = ['Description must be at least 10 characters long.'];
        }
        if (!formData.tags || formData.tags.length === 0) {
            newErrors.tags = ['At least one tag is required.'];
        }

        // Validate test cases
        if (!formData.visibleTestCases || formData.visibleTestCases.length === 0) {
            newErrors.visibleTestCases = ['At least one visible test case is required.'];
        } else {
            formData.visibleTestCases.forEach((tc, index) => {
                if (tc.input.trim() === '' || tc.output.trim() === '') { // Use trim to check empty
                    newErrors.visibleTestCases = newErrors.visibleTestCases || [];
                    newErrors.visibleTestCases.push(`Visible Test case ${index + 1} requires input and output.`);
                }
            });
        }
        if (!formData.hiddenTestCases || formData.hiddenTestCases.length === 0) {
            newErrors.hiddenTestCases = ['At least one hidden test case is required.'];
        } else {
            formData.hiddenTestCases.forEach((tc, index) => {
                if (tc.input.trim() === '' || tc.output.trim() === '') { // Use trim to check empty
                    newErrors.hiddenTestCases = newErrors.hiddenTestCases || [];
                    newErrors.hiddenTestCases.push(`Hidden Test case ${index + 1} requires input and output.`);
                }
            });
        }

        // Validate starter code
        if (!formData.starterCode || formData.starterCode.length === 0) {
            newErrors.starterCode = ['At least one starter code template is required.'];
        } else {
            formData.starterCode.forEach((sc, index) => {
                if (!sc.code || sc.code.trim() === '') {
                    newErrors.starterCode = newErrors.starterCode || [];
                    newErrors.starterCode.push(`Starter code ${index + 1} cannot be empty.`);
                }
                if (!sc.functionSignature || sc.functionSignature.trim() === '') {
                    newErrors.starterCode = newErrors.starterCode || [];
                    newErrors.starterCode.push(`Starter code ${index + 1} requires a function signature.`);
                }
            });
        }

        // Validate executionConfig
        if (!formData.executionConfig.inputOutputConfig.functionName || formData.executionConfig.inputOutputConfig.functionName.trim() === '') {
            newErrors.executionConfig = newErrors.executionConfig || {};
            newErrors.executionConfig.functionName = 'Function name is required.';
        }
        if (formData.executionConfig.inputOutputConfig.inputFormat === 'array' || formData.executionConfig.inputOutputConfig.inputFormat === 'object') {
            if (!formData.executionConfig.inputOutputConfig.parameters || formData.executionConfig.inputOutputConfig.parameters.length === 0) {
                newErrors.executionConfig = newErrors.executionConfig || {};
                newErrors.executionConfig.parameters = 'At least one parameter is required for array/object input format.';
            } else {
                formData.executionConfig.inputOutputConfig.parameters.forEach((param, index) => {
                    if (!param.name || param.name.trim() === '' || !param.type || param.type.trim() === '') {
                        newErrors.executionConfig = newErrors.executionConfig || {};
                        newErrors.executionConfig.parameters = newErrors.executionConfig.parameters || [];
                        newErrors.executionConfig.parameters.push(`Parameter ${index + 1} requires a name and type.`);
                    }
                });
            }
        }

        return newErrors;
    };

    const handleSubmitForm = () => {
        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            if (onValidationFail) onValidationFail();
            return;
        }

        // Prepare data for submission: convert test case inputs/outputs back to parsed types
        const dataToSend = {
            ...formData,
            visibleTestCases: formData.visibleTestCases.map(tc => ({
                ...tc,
                input: safeParse(tc.input),
                output: safeParse(tc.output)
            })),
            hiddenTestCases: formData.hiddenTestCases.map(tc => ({
                ...tc,
                input: safeParse(tc.input),
                output: safeParse(tc.output)
            })),
            // Ensure reference solutions that are empty are filtered out
            referenceSolution: (formData.referenceSolution || []).filter(sol => sol.completeCode && sol.completeCode.trim() !== ''),
        };

        onSubmit(dataToSend);
    };

    // Helper for primary button classes
    const getPrimaryButtonClasses = () =>
        `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.secondary.replace('bg-', 'to-')} hover:${appTheme.primaryHover.replace('bg-', 'from-')} hover:${appTheme.secondaryHover.replace('bg-', 'to-')} ${appTheme.buttonText}`;

    const getAddButtonClasses = () =>
        `bg-gradient-to-r ${appTheme.primary.replace('bg-', 'from-')} ${appTheme.highlightSecondary.replace('text-', 'to-')} hover:${appTheme.primaryHover.replace('bg-', 'from-')} hover:${appTheme.highlight.replace('text-', 'to-')} ${appTheme.buttonText}`;

    const getRemoveButtonClasses = () =>
        `text-${appTheme.errorColor.split('-')[1]}-400 hover:text-${appTheme.errorColor.split('-')[1]}-300 transition-colors`;

    return (
        <div className="p-4">
            <div className="max-w-5xl mx-auto">
                <div className="space-y-4">
                    {/* Basic Information */}
                    <div className={`${appTheme.cardBg}/10 backdrop-blur-md rounded-lg border ${appTheme.border}/20 p-4`}>
                        <h2 className={`text-lg font-semibold mb-3 ${appTheme.highlight}`}>Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="title" className={`block text-sm font-medium mb-1 ${appTheme.cardText}`}>Title <span className={appTheme.errorColor}>*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 ${appTheme.cardBg}/80 border rounded-md ${appTheme.text} placeholder-${appTheme.cardText.split('-')[1]}-400 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 ${errors.title ? `border-${appTheme.errorColor.split('-')[1]}-500` : `${appTheme.border}`}`}
                                />
                                {errors.title && <p className={`${appTheme.errorColor} text-xs mt-1`}>{errors.title[0]}</p>}
                            </div>
                            <div>
                                <label htmlFor="difficulty" className={`block text-sm font-medium mb-1 ${appTheme.cardText}`}>Difficulty <span className={appTheme.errorColor}>*</span></label>
                                <select
                                    name="difficulty"
                                    id="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 ${appTheme.cardBg}/80 border ${appTheme.border} rounded-md ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500`}
                                >
                                    {difficultyOptions.map(opt => (<option key={opt} value={opt} className={`${appTheme.cardBg}`}>{capitalizeFirstLetter(opt)}</option>))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="tags-input" className={`block text-sm font-medium mb-1 ${appTheme.cardText}`}>Tags <span className={appTheme.errorColor}>*</span></label>
                                <input
                                    type="text"
                                    id="tags-input"
                                    value={currentTags}
                                    onChange={handleTagsChange}
                                    placeholder="array, string, dp"
                                    className={`w-full px-3 py-2 ${appTheme.cardBg}/80 border rounded-md ${appTheme.text} placeholder-${appTheme.cardText.split('-')[1]}-400 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 ${errors.tags ? `border-${appTheme.errorColor.split('-')[1]}-500` : `${appTheme.border}`}`}
                                />
                                <div className={`mt-1 text-xs ${appTheme.cardText}`}>Selected: {formData.tags.join(', ') || 'None'}</div>
                                {errors.tags && <p className={`${appTheme.errorColor} text-xs mt-1`}>{Array.isArray(errors.tags) ? errors.tags[0] : errors.tags}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Problem Description */}
                    <div className={`${appTheme.cardBg}/10 backdrop-blur-md rounded-lg border ${appTheme.border}/20 p-4`}>
                        <h2 className={`text-lg font-semibold mb-3 ${appTheme.highlight}`}>Problem Description <span className={appTheme.errorColor}>*</span></h2>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={8}
                            className={`w-full px-3 py-2 ${appTheme.cardBg}/80 border rounded-md ${appTheme.text} placeholder-${appTheme.cardText.split('-')[1]}-400 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 resize-none ${errors.description ? `border-${appTheme.errorColor.split('-')[1]}-500` : `${appTheme.border}`}`}
                            placeholder="Write your problem description here..."
                        />
                        {errors.description && <p className={`${appTheme.errorColor} text-xs mt-1`}>{errors.description[0]}</p>}
                    </div>

                    {/* Execution Configuration */}
                    <div className={`${appTheme.cardBg}/10 backdrop-blur-md rounded-lg border ${appTheme.border}/20 p-4`}>
                        <h2 className={`text-lg font-semibold mb-3 ${appTheme.highlight}`}>Execution Configuration</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Function Name */}
                            <div>
                                <label htmlFor="functionName" className={`block text-sm font-medium mb-1 ${appTheme.cardText}`}>Function Name <span className={appTheme.errorColor}>*</span></label>
                                <input
                                    type="text"
                                    name="functionName"
                                    id="functionName"
                                    value={formData.executionConfig.inputOutputConfig.functionName}
                                    onChange={e => handleNestedInputChange('executionConfig.inputOutputConfig.functionName', e.target.value)}
                                    className={`w-full px-3 py-2 ${appTheme.cardBg}/80 border rounded-md ${appTheme.text} placeholder-${appTheme.cardText.split('-')[1]}-400 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 ${errors.executionConfig?.functionName ? `border-${appTheme.errorColor.split('-')[1]}-500` : `${appTheme.border}`}`}
                                    placeholder="e.g., twoSum, isPalindrome"
                                />
                                {errors.executionConfig?.functionName && <p className={`${appTheme.errorColor} text-xs mt-1`}>{errors.executionConfig.functionName}</p>}
                            </div>
                            {/* Input Format */}
                            <div>
                                <label htmlFor="inputFormat" className={`block text-sm font-medium mb-1 ${appTheme.cardText}`}>Input Format <span className={appTheme.errorColor}>*</span></label>
                                <select
                                    name="inputFormat"
                                    id="inputFormat"
                                    value={formData.executionConfig.inputOutputConfig.inputFormat}
                                    onChange={e => handleNestedInputChange('executionConfig.inputOutputConfig.inputFormat', e.target.value)}
                                    className={`w-full px-3 py-2 ${appTheme.cardBg}/80 border ${appTheme.border} rounded-md ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500`}
                                >
                                    {inputFormatOptions.map(opt => (<option key={opt} value={opt} className={`${appTheme.cardBg}`}>{capitalizeFirstLetter(opt)}</option>))}
                                </select>
                                <p className={`mt-1 text-xs ${appTheme.cardText} opacity-70`}>How the test case <code>input</code> should be parsed (e.g., <code>[1,2]</code> as <code>array</code>, <code>5</code> as <code>single</code>, <code>{`{"a":1}`}</code> as <code>object</code>).</p>
                            </div>
                            {/* Return Type */}
                            <div>
                                <label htmlFor="returnType" className={`block text-sm font-medium mb-1 ${appTheme.cardText}`}>Return Type <span className={appTheme.errorColor}>*</span></label>
                                <select
                                    name="returnType"
                                    id="returnType"
                                    value={formData.executionConfig.inputOutputConfig.returnType}
                                    onChange={e => handleNestedInputChange('executionConfig.inputOutputConfig.returnType', e.target.value)}
                                    className={`w-full px-3 py-2 ${appTheme.cardBg}/80 border ${appTheme.border} rounded-md ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500`}
                                >
                                    {returnTypeOptions.map(opt => (<option key={opt} value={opt} className={`${appTheme.cardBg}`}>{capitalizeFirstLetter(opt)}</option>))}
                                </select>
                            </div>
                            {/* Timeout and Memory Limits */}
                            <div>
                                <label htmlFor="timeout" className={`block text-sm font-medium mb-1 ${appTheme.cardText}`}>Timeout (ms)</label>
                                <input
                                    type="number"
                                    name="timeout"
                                    id="timeout"
                                    value={formData.executionConfig.timeout}
                                    onChange={e => handleNestedInputChange('executionConfig.timeout', parseInt(e.target.value))}
                                    className={`w-full px-3 py-2 ${appTheme.cardBg}/80 border rounded-md ${appTheme.text} placeholder-${appTheme.cardText.split('-')[1]}-400 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 ${appTheme.border}`}
                                    min="500" max="5000"
                                />
                            </div>
                            <div>
                                <label htmlFor="memoryLimit" className={`block text-sm font-medium mb-1 ${appTheme.cardText}`}>Memory Limit (KB)</label>
                                <input
                                    type="number"
                                    name="memoryLimit"
                                    id="memoryLimit"
                                    value={formData.executionConfig.memoryLimit}
                                    onChange={e => handleNestedInputChange('executionConfig.memoryLimit', parseInt(e.target.value))}
                                    className={`w-full px-3 py-2 ${appTheme.cardBg}/80 border rounded-md ${appTheme.text} placeholder-${appTheme.cardText.split('-')[1]}-400 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 ${appTheme.border}`}
                                    min="64000" max="256000"
                                />
                            </div>
                        </div>

                        {/* Parameters (Conditional based on inputFormat) */}
                        {(formData.executionConfig.inputOutputConfig.inputFormat === 'array' || formData.executionConfig.inputOutputConfig.inputFormat === 'object') && (
                            <div className="mt-6">
                                <h3 className={`text-base font-semibold mb-2 ${appTheme.highlightSecondary}`}>Function Parameters <span className={appTheme.errorColor}>*</span></h3>
                                {Array.isArray(errors.executionConfig?.parameters) && <p className={`${appTheme.errorColor} text-xs mb-2`}>{errors.executionConfig.parameters.join(', ')}</p>}
                                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                    {(formData.executionConfig.inputOutputConfig.parameters || []).map((param, index) => (
                                        <div key={index} className={`${appTheme.cardBg}/50 border ${appTheme.border} rounded-md p-3 flex items-center space-x-2`}>
                                            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <div>
                                                    <label className={`block text-xs font-medium mb-1 ${appTheme.cardText}`}>Name <span className={appTheme.errorColor}>*</span></label>
                                                    <input
                                                        type="text"
                                                        value={param.name}
                                                        onChange={e => handleParameterChange(index, 'name', e.target.value)}
                                                        className={`w-full px-2 py-1 ${appTheme.background}/80 border ${appTheme.border} rounded ${appTheme.text} text-xs placeholder-${appTheme.cardText.split('-')[1]}-500 focus:outline-none focus:ring-1 focus:ring-${appTheme.primary.split('-')[1]}-500`}
                                                        placeholder="e.g., nums, target"
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`block text-xs font-medium mb-1 ${appTheme.cardText}`}>Type <span className={appTheme.errorColor}>*</span></label>
                                                    <select
                                                        value={param.type}
                                                        onChange={e => handleParameterChange(index, 'type', e.target.value)}
                                                        className={`w-full px-2 py-1 ${appTheme.background}/80 border ${appTheme.border} rounded ${appTheme.text} text-xs focus:outline-none focus:ring-1 focus:ring-${appTheme.primary.split('-')[1]}-500`}
                                                    >
                                                        {paramTypeOptions.map(type => (<option key={type} value={type} className={`${appTheme.cardBg}`}>{capitalizeFirstLetter(type)}</option>))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={`block text-xs font-medium mb-1 ${appTheme.cardText}`}>Description (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={param.description || ''}
                                                        onChange={e => handleParameterChange(index, 'description', e.target.value)}
                                                        className={`w-full px-2 py-1 ${appTheme.background}/80 border ${appTheme.border} rounded ${appTheme.text} text-xs placeholder-${appTheme.cardText.split('-')[1]}-500 focus:outline-none focus:ring-1 focus:ring-${appTheme.primary.split('-')[1]}-500`}
                                                        placeholder="e.g., array of numbers"
                                                    />
                                                </div>
                                            </div>
                                            {formData.executionConfig.inputOutputConfig.parameters.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeDynamicListItem('parameters', index)}
                                                    className={getRemoveButtonClasses()}
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => addDynamicListItem('parameters')}
                                    className={`mt-3 flex items-center px-3 py-1 text-xs rounded transition-colors ${getAddButtonClasses()}`}
                                >
                                    <FaPlus className="mr-1" size={10} /> Add Parameter
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Test Cases */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {['visibleTestCases', 'hiddenTestCases'].map(listName => (
                            <div key={listName} className={`${appTheme.cardBg}/10 backdrop-blur-md rounded-lg border ${appTheme.border}/20 p-4`}>
                                <h2 className={`text-lg font-semibold mb-3 ${appTheme.highlight}`}>
                                    {listName === 'visibleTestCases' ? 'Visible' : 'Hidden'} Test Cases <span className={appTheme.errorColor}>*</span>
                                </h2>
                                {Array.isArray(errors[listName]) && <p className={`${appTheme.errorColor} text-xs mb-2`}>{errors[listName].join(', ')}</p>}

                                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                    {(formData[listName] || []).map((tc, index) => (
                                        <div key={index} className={`${appTheme.cardBg}/50 border ${appTheme.border} rounded-md p-3`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className={`text-sm font-medium ${appTheme.cardText}`}>Test Case {index + 1}</h3>
                                                {(formData[listName].length > 1 || listName === 'hiddenTestCases') && ( // Allow removing last hidden test case if there's only one.
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDynamicListItem(listName, index)}
                                                        className={getRemoveButtonClasses()}
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <div>
                                                    <label className={`block text-xs font-medium mb-1 ${appTheme.cardText}`}>Input <span className={appTheme.errorColor}>*</span></label>
                                                    <textarea
                                                        value={tc.input}
                                                        onChange={e => handleDynamicListChange(listName, index, 'input', e.target.value)}
                                                        rows={2}
                                                        className={`w-full px-2 py-1 ${appTheme.background}/80 border ${appTheme.border} rounded ${appTheme.text} text-xs font-mono placeholder-${appTheme.cardText.split('-')[1]}-500 focus:outline-none focus:ring-1 focus:ring-${appTheme.primary.split('-')[1]}-500 resize-none`}
                                                        placeholder='[0, 1] or {"a": 2, "b": 4}'
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`block text-xs font-medium mb-1 ${appTheme.cardText}`}>Output <span className={appTheme.errorColor}>*</span></label>
                                                    <textarea
                                                        value={tc.output}
                                                        onChange={e => handleDynamicListChange(listName, index, 'output', e.target.value)}
                                                        rows={2}
                                                        className={`w-full px-2 py-1 ${appTheme.background}/80 border ${appTheme.border} rounded ${appTheme.text} text-xs font-mono placeholder-${appTheme.cardText.split('-')[1]}-500 focus:outline-none focus:ring-1 focus:ring-${appTheme.primary.split('-')[1]}-500 resize-none`}
                                                        placeholder='1 or [0, 1]'
                                                    />
                                                </div>

                                                {listName === 'visibleTestCases' && (
                                                    <div>
                                                        <label className={`block text-xs font-medium mb-1 ${appTheme.cardText}`}>Explanation (Optional)</label>
                                                        <input
                                                            type="text"
                                                            value={tc.explanation || ''}
                                                            onChange={e => handleDynamicListChange(listName, index, 'explanation', e.target.value)}
                                                            className={`w-full px-2 py-1 ${appTheme.background}/80 border ${appTheme.border} rounded ${appTheme.text} text-xs placeholder-${appTheme.cardText.split('-')[1]}-500 focus:outline-none focus:ring-1 focus:ring-${appTheme.primary.split('-')[1]}-500`}
                                                            placeholder="Explain the test case..."
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => addDynamicListItem(listName)}
                                    className={`mt-3 flex items-center px-3 py-1 text-xs rounded transition-colors ${getAddButtonClasses()}`}
                                >
                                    <FaPlus className="mr-1" size={10} /> Add Test Case
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Code Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {['starterCode', 'referenceSolution'].map(listName => (
                            <div key={listName} className={`${appTheme.cardBg}/10 backdrop-blur-md rounded-lg border ${appTheme.border}/20 p-4`}>
                                <h2 className={`text-lg font-semibold mb-3 ${appTheme.highlight}`}>
                                    {listName === 'starterCode' ? 'Starter Code' : 'Reference Solution'}
                                    {listName === 'starterCode' && <span className={appTheme.errorColor}>*</span>}
                                </h2>

                                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                                    {(formData[listName] || []).map((item, index) => (
                                        <div key={index} className={`${appTheme.cardBg}/50 border ${appTheme.border} rounded-md p-3`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className={`text-sm font-medium ${appTheme.cardText}`}>
                                                    {capitalizeFirstLetter(item.language)} {listName === 'starterCode' ? 'Template' : 'Solution'}
                                                </h3>
                                                {(formData[listName].length > 1 || (listName === 'referenceSolution' && formData[listName].length > 0)) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDynamicListItem(listName, index)}
                                                        className={getRemoveButtonClasses()}
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className={`block text-xs font-medium mb-1 ${appTheme.cardText}`}>Language <span className={appTheme.errorColor}>*</span></label>
                                                <select
                                                    value={item.language}
                                                    onChange={e => handleDynamicListChange(listName, index, 'language', e.target.value)}
                                                    className={`w-full px-2 py-1 ${appTheme.background}/80 border ${appTheme.border} rounded ${appTheme.text} text-xs focus:outline-none focus:ring-1 focus:ring-${appTheme.primary.split('-')[1]}-500`}
                                                >
                                                    {languageOptions.map(lang => (<option key={lang} value={lang} className={`${appTheme.cardBg}`}>{capitalizeFirstLetter(lang)}</option>))}
                                                </select>
                                            </div>
                                            {listName === 'starterCode' && (
                                                <div className="mb-3">
                                                    <label className={`block text-xs font-medium mb-1 ${appTheme.cardText}`}>Function Signature (e.g., `function add(a, b)`) <span className={appTheme.errorColor}>*</span></label>
                                                    <input
                                                        type="text"
                                                        value={item.functionSignature}
                                                        onChange={e => handleDynamicListChange(listName, index, 'functionSignature', e.target.value)}
                                                        className={`w-full px-2 py-1 ${appTheme.background}/80 border ${appTheme.border} rounded ${appTheme.text} text-xs placeholder-${appTheme.cardText.split('-')[1]}-500 focus:outline-none focus:ring-1 focus:ring-${appTheme.primary.split('-')[1]}-500`}
                                                        placeholder="e.g., function twoSum(nums, target)"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <label className={`block text-xs font-medium mb-1 ${appTheme.cardText}`}>Code <span className={appTheme.errorColor}>*</span></label>
                                                <textarea
                                                    value={item.code || item.completeCode}
                                                    onChange={e => handleDynamicListChange(listName, index, listName === 'starterCode' ? 'code' : 'completeCode', e.target.value)}
                                                    rows={8}
                                                    className={`w-full px-2 py-1 ${appTheme.background}/80 border ${appTheme.border} rounded ${appTheme.text} text-xs font-mono placeholder-${appTheme.cardText.split('-')[1]}-500 focus:outline-none focus:ring-1 focus:ring-${appTheme.primary.split('-')[1]}-500 resize-none`}
                                                    placeholder={`Write your ${listName === 'starterCode' ? 'starter' : 'solution'} code here...`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => addDynamicListItem(listName)}
                                    className={`mt-3 flex items-center px-3 py-1 text-xs rounded transition-colors ${getAddButtonClasses()}`}
                                >
                                    <FaPlus className="mr-1" size={10} /> Add {listName === 'starterCode' ? 'Template' : 'Solution'}
                                </button>
                                {errors[listName] && <p className={`${appTheme.errorColor} text-xs mt-2`}>{Array.isArray(errors[listName]) ? errors[listName].join(', ') : errors[listName]}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="text-center pt-4">
                        <button
                            type="button"
                            onClick={handleSubmitForm}
                            disabled={isSubmitting}
                            className={`px-8 py-3 font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${getPrimaryButtonClasses()}`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center">
                                    <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${appTheme.buttonText.replace('text-', 'border-')} mr-2`}></div>
                                    {isEditing ? 'Saving...' : 'Creating...'}
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <FaSave className="mr-2" />
                                    {isEditing ? 'Save Changes' : 'Create Problem'}
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemForm;