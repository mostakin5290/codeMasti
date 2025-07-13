const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify');
const codeWrapperTemplates = require('../utils/codeWrapperTemplates');

const problemSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    difficulty: {
        type: String,
        enum: {
            values: ['easy', 'medium', 'hard'],
            message: 'Difficulty must be either easy, medium, or hard'
        },
        required: [true, 'Difficulty is required']
    },
    tags: {
        type: [String],
        enum: {
            values: [
                // ... your existing tags ...
                'array', 'string', 'linkedList', 'stack', 'queue', 'deque', 'hashTable', 'set', 'map', 'tree', 'binaryTree', 'binarySearchTree', 'heap', 'priorityQueue', 'graph', 'trie', 'segmentTree', 'fenwickTree', 'unionFind', 'recursion', 'backtracking', 'divideAndConquer', 'greedy', 'dp', 'memoization', 'tabulation', 'bitManipulation', 'slidingWindow', 'twoPointers', 'binarySearch', 'prefixSum', 'matrix', 'topologicalSort', 'bfs', 'dfs', 'dijkstra', 'floydWarshall', 'bellmanFord', 'kruskal', 'prim', 'unionByRank', 'pathCompression', 'cycleDetection', 'math', 'combinatorics', 'probability', 'geometry', 'numberTheory', 'modularArithmetic', 'gcd', 'lcm', 'sieve', 'palindrome', 'anagram', 'sorting', 'mergeSort', 'quickSort', 'countingSort', 'bucketSort', 'radixSort', 'simulation', 'implementation', 'design', 'gameTheory', 'recurrenceRelation', 'randomized', 'rotation'
            ],
            message: 'Invalid tag provided'
        },
        required: [true, 'At least one tag is required'],
        validate: {
            validator: function (tags) {
                return tags.length > 0;
            },
            message: 'At least one tag is required'
        }
    },
    visibleTestCases: [{
        input: { type: Schema.Types.Mixed, required: [true, 'Test case input is required'] },
        output: { type: Schema.Types.Mixed, required: [true, 'Test case output is required'] },
        explanation: { type: String, trim: true }
    }],
    hiddenTestCases: [{
        input: { type: Schema.Types.Mixed, required: [true, 'Hidden test case input is required'] },
        output: { type: Schema.Types.Mixed, required: [true, 'Hidden test case output is required'] }
    }],
    starterCode: [{
        language: {
            type: String,
            required: [true, 'Language is required for starter code'],
            enum: {
                values: ['javascript', 'python', 'java', 'c', 'cpp'],
                message: 'Unsupported language'
            }
        },
        code: { type: String, required: [true, 'Starter code is required'], trim: true },
        functionSignature: { type: String, required: [true, 'Function signature is required'], trim: true }
    }],
    referenceSolution: [{
        language: {
            type: String,
            required: [true, 'Language is required for solution code'],
            enum: {
                values: ['javascript', 'python', 'java', 'c', 'cpp'],
                message: 'Unsupported language'
            }
        },
        completeCode: { type: String, required: [true, 'Solution code is required'] }
    }],
    executionConfig: {
        judge0LanguageIds: { // KEEP THIS - these are problem-specific Judge0 IDs or defaults
            javascript: { type: Number, default: 102 },
            python: { type: Number, default: 109 },
            java: { type: Number, default: 91 },
            c: { type: Number, default: 103 },
            cpp: { type: Number, default: 105 }
        },
        inputOutputConfig: { // KEEP THIS - this is highly problem-specific
            inputFormat: {
                type: String,
                enum: ['array', 'single', 'object', 'string'],
                default: 'array',
                required: true
            },
            functionName: { type: String, required: [true, 'Function name is required'], trim: true },
            parameters: [{
                name: { type: String, required: true, trim: true },
                type: { type: String, enum: ['int', 'string', 'array', 'object', 'boolean', 'float', 'long', 'double'], required: true },
                description: { type: String, trim: true }
            }],
            returnType: {
                type: String,
                enum: ['int', 'string', 'array', 'object', 'boolean', 'void', 'float', 'long', 'double'],
                required: true
            }
        },
        // REMOVE wrapperTemplates from the schema
        timeout: { type: Number, default: 2000, min: [500, 'Timeout must be at least 500ms'], max: [5000, 'Timeout cannot exceed 5000ms'] },
        memoryLimit: { type: Number, default: 128000, min: [64000, 'Memory limit must be at least 64MB'], max: [256000, 'Memory limit cannot exceed 256MB'] }
    },
    isDailyChallenge: { type: Boolean, default: false },
    dailyChallengeDate: { type: Date, index: true },
    challengeStreakBonus: { type: Number, default: 0, min: 0, max: 100 },
    challengeStatistics: {
        totalAttempts: { type: Number, default: 0 },
        successfulSubmissions: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0, min: 0, max: 100 },
        problemCreator: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }
}, { timestamps: true });

problemSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});



function generateJavascriptMethodCall(ioConfig) {
    const params = ioConfig.parameters;
    const functionName = ioConfig.functionName;
    const inputFormat = ioConfig.inputFormat;
    const returnType = ioConfig.returnType;

    let parsingCode = '';
    let functionCallArgs = [];
    let resultHandlingCode = '';

    // Parse the input (which is now expected to be a JSON array of arguments)
    parsingCode += `    let parsedInput;\n`;
    parsingCode += `    try { parsedInput = JSON.parse(rawTestInput); } catch (e) { parsedInput = rawTestInput; }\n\n`;

    if (inputFormat === 'array' && params.length > 0) {
        // For 'array' input format, and multiple parameters, assume parsedInput is [arg1, arg2, ...]
        params.forEach((param, index) => {
            const paramName = `param_${param.name}_${index}`;
            parsingCode += `    let ${paramName} = parsedInput[${index}];\n`;
            // Add type conversion if necessary (e.g., if parsing '5' to int vs string)
            // For JS, JSON.parse usually handles basic types fine.
            functionCallArgs.push(paramName);
        });
    } else if (inputFormat === 'single' || inputFormat === 'string' || inputFormat === 'object') {
        // For single argument inputs, just pass the parsed input directly
        functionCallArgs.push('parsedInput');
    } else {
        // Fallback for unexpected formats
        parsingCode += `    // WARNING: Unsupported input format/parameter count. Calling with raw parsed input.\n`;
        functionCallArgs.push('parsedInput');
    }

    const functionCallLine = `    const result = ${functionName}(${functionCallArgs.join(', ')});`;

    if (returnType !== 'void') {
        resultHandlingCode = `    console.log(JSON.stringify(result));`;
    } else {
        resultHandlingCode = `    // Void return type, no output printed.`;
    }

    return `${parsingCode}${functionCallLine}\n${resultHandlingCode}`;
}

function generatePythonMethodCall(ioConfig) {
    const params = ioConfig.parameters;
    const functionName = ioConfig.functionName;
    const inputFormat = ioConfig.inputFormat;
    const returnType = ioConfig.returnType;

    let parsingCode = '';
    let functionCallArgs = [];
    let resultHandlingCode = '';

    // Parse the input (which is now expected to be a JSON array of arguments)
    parsingCode += `    parsed_input = None\n`;
    parsingCode += `    try:\n`;
    parsingCode += `        parsed_input = json.loads(test_input_str)\n`;
    parsingCode += `    except json.JSONDecodeError:\n`;
    parsingCode += `        parsed_input = test_input_str\n\n`;

    if (inputFormat === 'array' && params.length > 0) {
        // For 'array' input format, and multiple parameters, assume parsed_input is [arg1, arg2, ...]
        params.forEach((param, index) => {
            const paramName = `param_${param.name}_${index}`;
            parsingCode += `    ${paramName} = parsed_input[${index}]\n`;
            functionCallArgs.push(paramName);
        });
    } else if (inputFormat === 'single' || inputFormat === 'string' || inputFormat === 'object') {
        // For single argument inputs, pass the parsed input directly
        functionCallArgs.push('parsed_input');
    } else {
        // Fallback for unexpected formats
        parsingCode += `    # WARNING: Unsupported input format/parameter count. Calling with raw parsed input.\n`;
        functionCallArgs.push('parsed_input');
    }

    // Handle class-based solutions (like 'self' in twoSum) or direct function calls
    let functionCallLine;
    if (ioConfig.functionName && ioConfig.starterCode?.[0]?.functionSignature?.includes('(self')) { // Check for 'self' in signature to detect class method
        functionCallLine = `    if 'Solution' in globals():\n        solution_instance = Solution()\n        result = solution_instance.${functionName}(${functionCallArgs.join(', ')})\n    else:\n        result = globals()["${functionName}"](${functionCallArgs.join(', ')})\n`;
    } else {
        functionCallLine = `    result = globals()["${functionName}"](${functionCallArgs.join(', ')})\n`;
    }

    if (returnType !== 'void') {
        resultHandlingCode = `    print(json.dumps(result))\n`;
    } else {
        resultHandlingCode = `    # Void return type, no output printed.\n`;
    }

    return `${parsingCode}${functionCallLine}${resultHandlingCode}`;
}



// Helper functions for Java code generation
function getJavaType(paramType) {
    switch (paramType) {
        case 'int': return 'int';
        case 'string': return 'String';
        case 'boolean': return 'boolean';
        case 'float': return 'float';
        case 'double': return 'double';
        case 'long': return 'long';
        case 'array': return 'int[]';
        case 'object': return 'Object';
        default: return 'Object';
    }
}

// Generate Java method call with simplified parsing
function generateJavaMethodCall(ioConfig) {
    const params = ioConfig.parameters;
    const functionName = ioConfig.functionName;
    const inputFormat = ioConfig.inputFormat;

    let parsingCode = '';
    let functionCallArgs = [];
    let resultDeclaration = '';
    let outputCode = '';

    // Handle result declaration and output based on return type
    if (ioConfig.returnType === 'void') {
        resultDeclaration = '';
        outputCode = '';
    } else if (ioConfig.returnType === 'int') {
        resultDeclaration = 'int result = ';
        outputCode = 'System.out.println(result);';
    } else if (ioConfig.returnType === 'string') {
        resultDeclaration = 'String result = ';
        outputCode = 'System.out.println("\"" + result + "\"");';
    } else if (ioConfig.returnType === 'boolean') {
        resultDeclaration = 'boolean result = ';
        outputCode = 'System.out.println(result);';
    } else if (ioConfig.returnType === 'array') {
        resultDeclaration = 'int[] result = ';
        outputCode = 'System.out.println(formatOutput(result));';
    } else {
        resultDeclaration = 'Object result = ';
        outputCode = 'System.out.println(formatOutput(result));';
    }

    if (inputFormat === 'single' || inputFormat === 'string') {
        const param = params[0];

        if (param.type === 'string') {
            parsingCode += `            String ${param.name} = (String) parseValue(inputJson);\n`;
        } else if (param.type === 'int') {
            parsingCode += `            int ${param.name} = (Integer) parseValue(inputJson);\n`;
        } else if (param.type === 'boolean') {
            parsingCode += `            boolean ${param.name} = (Boolean) parseValue(inputJson);\n`;
        } else if (param.type === 'double') {
            parsingCode += `            double ${param.name} = (Double) parseValue(inputJson);\n`;
        } else if (param.type === 'array') {
            parsingCode += `            int[] ${param.name} = parseIntArray(inputJson);\n`;
        }
        functionCallArgs.push(param.name);
    } else if (inputFormat === 'array') {
        parsingCode += `            List<Object> parsedArray = parseArray(inputJson);\n`;
        params.forEach((param, index) => {
            if (param.type === 'int') {
                parsingCode += `            int ${param.name} = (Integer) parsedArray.get(${index});\n`;
            } else if (param.type === 'string') {
                parsingCode += `            String ${param.name} = (String) parsedArray.get(${index});\n`;
            } else if (param.type === 'boolean') {
                parsingCode += `            boolean ${param.name} = (Boolean) parsedArray.get(${index});\n`;
            } else if (param.type === 'double') {
                parsingCode += `            double ${param.name} = (Double) parsedArray.get(${index});\n`;
            }
            functionCallArgs.push(param.name);
        });
    }

    let methodCallLine = `            ${resultDeclaration}solution.${functionName}(${functionCallArgs.join(', ')});`;
    if (outputCode) {
        methodCallLine += `\n            ${outputCode}`;
    }

    return `${parsingCode}${methodCallLine}`;
}

// In models/problem.js

function generateCppMethodCall(ioConfig) {
    const params = ioConfig.parameters;
    const functionName = ioConfig.functionName;
    const inputFormat = ioConfig.inputFormat;

    let parsingCode = '        // Parsing logic generated by the backend\n';
    let functionCallArgs = [];
    let resultDeclaration = '';
    let outputCode = '';

    // Determine result type and print statement
    switch (ioConfig.returnType) {
        case 'void':
            resultDeclaration = '';
            outputCode = '        // No output for void return type';
            break;
        case 'int':
            resultDeclaration = 'int result = ';
            outputCode = '        printResult(result);';
            break;
        case 'string':
            resultDeclaration = 'string result = ';
            outputCode = '        printResult(result);';
            break;
        case 'boolean':
            resultDeclaration = 'bool result = ';
            outputCode = '        printResult(result);';
            break;
        case 'array': // Assuming array of int for now
            resultDeclaration = 'vector<int> result = ';
            outputCode = '        printResult(result);';
            break;
        default:
            resultDeclaration = 'auto result = ';
            outputCode = '        printResult(result);';
            break;
    }

    if (inputFormat === 'single' || inputFormat === 'string') {
        const param = params[0];
        // The SimpleParser in the wrapper will handle basic types from a string
        if (param.type === 'array') {
            parsingCode += `        vector<int> ${param.name} = SimpleParser::parseIntArray(input_str);\n`;
        } else if (param.type === 'string') {
            parsingCode += `        string ${param.name} = SimpleParser::parseString(input_str);\n`;
        } else if (param.type === 'int') {
            parsingCode += `        int ${param.name} = SimpleParser::parseInt(input_str);\n`;
        } // ... add other types like double, bool as needed
        functionCallArgs.push(param.name);

    } else if (inputFormat === 'array') {
        // This format is for when the input is a JSON array containing multiple arguments
        // e.g., input_str is like "[ [1,2,3], 5 ]" for (vector<int>, int)
        // This requires a more complex parser than your current SimpleParser.
        // Let's stick to a simple case for your existing parser:
        // Assume input_str is like "[5,10]" and you need to extract 5 and 10.
        parsingCode += `        vector<int> parsed_params = SimpleParser::parseIntArray(input_str);\n`;
        params.forEach((param, index) => {
            if (param.type === 'int') {
                parsingCode += `        int ${param.name} = parsed_params[${index}];\n`;
                functionCallArgs.push(param.name);
            }
            // You would need to extend SimpleParser to handle mixed types (e.g., arrays of strings)
        });
    }

    let methodCallLine = `        Solution solution;\n        ${resultDeclaration}solution.${functionName}(${functionCallArgs.join(', ')});`;
    if (ioConfig.returnType !== 'void') {
        methodCallLine += `\n${outputCode}`;
    }

    return `${parsingCode}${methodCallLine}`;
}

// Generate C method call with simplified parsing
function generateCMethodCall(ioConfig) {
    const params = ioConfig.parameters;
    const functionName = ioConfig.functionName;
    const inputFormat = ioConfig.inputFormat;

    let parsingCode = '';
    let functionCallArgs = [];
    let resultDeclaration = '';
    let outputCode = '';

    // Handle result declaration and output based on return type
    if (ioConfig.returnType === 'void') {
        resultDeclaration = '';
        outputCode = '';
    } else if (ioConfig.returnType === 'int') {
        resultDeclaration = 'int result = ';
        outputCode = 'printf("%d\\n", result);';
    } else if (ioConfig.returnType === 'string') {
        resultDeclaration = 'char* result = ';
        outputCode = 'printf("\\\"%s\\\"\\n", result);';
    } else if (ioConfig.returnType === 'double') {
        resultDeclaration = 'double result = ';
        outputCode = 'printf("%.6f\\n", result);';
    } else if (ioConfig.returnType === 'array') {
        resultDeclaration = 'int* result = ';
        outputCode = 'printIntArray(result, size);';
    }

    if (inputFormat === 'single' || inputFormat === 'string') {
        const param = params[0];
        if (param.type === 'string') {
            parsingCode += `    char ${param.name}[256];\n`;
            parsingCode += `    strcpy(${param.name}, input_str + 1);\n`;
            parsingCode += `    ${param.name}[strlen(${param.name}) - 1] = '\\0';\n`;
        } else if (param.type === 'int') {
            parsingCode += `    int ${param.name} = parseInt(input_str);\n`;
        } else if (param.type === 'double') {
            parsingCode += `    double ${param.name} = parseDouble(input_str);\n`;
        } else if (param.type === 'array') {
            parsingCode += `    int size;\n`;
            parsingCode += `    int* ${param.name} = parseIntArray(input_str, &size);\n`;
        }
        functionCallArgs.push(param.name);
    } else if (inputFormat === 'array') {
        if (params.length === 2 && params[0].type === 'int' && params[1].type === 'int') {
            parsingCode += `    int size;\n`;
            parsingCode += `    int* parsedArray = parseIntArray(input_str, &size);\n`;
            parsingCode += `    int ${params[0].name} = parsedArray[0];\n`;
            parsingCode += `    int ${params[1].name} = parsedArray[1];\n`;
            functionCallArgs.push(params[0].name, params[1].name);
        }
    }

    let methodCallLine = `    ${resultDeclaration}${functionName}(${functionCallArgs.join(', ')});`;
    if (outputCode) {
        methodCallLine += `\n    ${outputCode}`;
    }

    return `${parsingCode}${methodCallLine}`;
}

problemSchema.methods.generateExecutableCode = function (userCode, language, testInput) {
    const config = this.executionConfig;
    // Normalize language to match keys in wrapperTemplates
    const normalizedLanguage = language.toLowerCase();

    let template = config.wrapperTemplates[normalizedLanguage];
    const ioConfig = this.executionConfig.inputOutputConfig;

    // Convert testInput to a JSON string that can be embedded
    let embeddedTestInput;
    try {
        embeddedTestInput = JSON.stringify(testInput);
    } catch (e) {
        // Fallback if testInput is not directly JSON serializable
        embeddedTestInput = String(testInput);
        console.warn(`Test input for problem ${this.id} (${language}) not JSON serializable, using string representation. Input:`, testInput);
    }


    let executableCode = template
        .replace(/\{\{USER_CODE\}\}/g, userCode); // User code is inserted first

    // Initialize dynamic code placeholder
    let dynamicInputParsingAndMethodCall = '';

    // Generate dynamic input parsing and method call based on language and config
    if (normalizedLanguage === 'javascript') {
        dynamicInputParsingAndMethodCall = generateJavascriptMethodCall(ioConfig);
    } else if (normalizedLanguage === 'python') {
        dynamicInputParsingAndMethodCall = generatePythonMethodCall(ioConfig);
    } else if (normalizedLanguage === 'java') {
        dynamicInputParsingAndMethodCall = generateJavaMethodCall(ioConfig); // Your existing Java helper
    } else if (normalizedLanguage === 'cpp') {
        dynamicInputParsingAndMethodCall = generateCppMethodCall(ioConfig); // Your existing C++ helper
    } else if (normalizedLanguage === 'c') {
        dynamicInputParsingAndMethodCall = generateCMethodCall(ioConfig); // Your existing C helper
    }

    // Now, replace placeholders in the _main_ wrapper template
    executableCode = executableCode
        .replace(/\{\{TEST_INPUT\}\}/g, embeddedTestInput)
        .replace(/\{\{INPUT_FORMAT\}\}/g, ioConfig.inputFormat || '') // Add default for safety
        .replace(/\{\{FUNCTION_NAME\}\}/g, ioConfig.functionName)
        .replace(/\{\{RETURN_TYPE\}\}/g, ioConfig.returnType || '') // Add default for safety
        .replace(/\{\{DYNAMIC_INPUT_PARSING_AND_METHOD_CALL\}\}/g, dynamicInputParsingAndMethodCall);


    return executableCode;
};

problemSchema.methods.generateExecutableCode = function (userCode, language, testInput) {
    const config = this.executionConfig;
    const normalizedLanguage = language.toLowerCase();

    // GET THE TEMPLATE FROM THE CENTRALIZED FILE, NOT FROM THE PROBLEM DOCUMENT
    const template = codeWrapperTemplates[normalizedLanguage];

    if (!template) {
        throw new Error(`Wrapper template not found for language: ${language}`);
    }

    const ioConfig = this.executionConfig.inputOutputConfig;

    let embeddedTestInput;
    try {
        embeddedTestInput = JSON.stringify(testInput);
    } catch (e) {
        embeddedTestInput = String(testInput);
        console.warn(`Test input for problem ${this.id} (${language}) not JSON serializable, using string representation. Input:`, testInput);
    }

    let executableCode = template
        .replace(/\{\{USER_CODE\}\}/g, userCode);

    let dynamicInputParsingAndMethodCall = '';

    if (normalizedLanguage === 'javascript') {
        dynamicInputParsingAndMethodCall = generateJavascriptMethodCall(ioConfig);
    } else if (normalizedLanguage === 'python') {
        dynamicInputParsingAndMethodCall = generatePythonMethodCall(ioConfig);
    } else if (normalizedLanguage === 'java') {
        dynamicInputParsingAndMethodCall = generateJavaMethodCall(ioConfig);
    } else if (normalizedLanguage === 'cpp') {
        dynamicInputParsingAndMethodCall = generateCppMethodCall(ioConfig);
    } else if (normalizedLanguage === 'c') {
        dynamicInputParsingAndMethodCall = generateCMethodCall(ioConfig);
    }

    executableCode = executableCode
        .replace(/\{\{TEST_INPUT\}\}/g, embeddedTestInput)
        .replace(/\{\{INPUT_FORMAT\}\}/g, ioConfig.inputFormat || '')
        .replace(/\{\{FUNCTION_NAME\}\}/g, ioConfig.functionName)
        .replace(/\{\{RETURN_TYPE\}\}/g, ioConfig.returnType || '')
        .replace(/\{\{DYNAMIC_INPUT_PARSING_AND_METHOD_CALL\}\}/g, dynamicInputParsingAndMethodCall);

    return executableCode;
};

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;