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
        inputOutputConfig: {
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
    const functionName = ioConfig.functionName;
    const inputFormat = ioConfig.inputFormat;
    const returnType = ioConfig.returnType;
    const parameters = ioConfig.parameters;

    let code = '';
    // `parsedInput` is already available from the template's `JSON.parse(rawTestInput)`
    // The code generated here assumes `parsedInput` exists.

    let functionCallArgs = [];

    if (inputFormat === 'array') {
        code += `    if (!Array.isArray(parsedInput)) {\n`;
        code += `        throw new Error('Input format is "array" but the parsed input is not an array. This indicates a problem with the test case definition or input configuration.');\n`;
        code += `    }\n`;

        if (parameters && parameters.length === 1 && parameters[0].type === 'array') {
            functionCallArgs.push('parsedInput');
        } else {
            functionCallArgs.push('...parsedInput');
        }
    } else if (inputFormat === 'single' || inputFormat === 'string' || inputFormat === 'object') {
        functionCallArgs.push('parsedInput');
    } else {
        code += `    // WARNING: Unsupported input format '${inputFormat}'. Calling with parsed input as a single argument.\n`;
        functionCallArgs.push('parsedInput');
    }

    const functionCallLine = `    const result = ${functionName}(${functionCallArgs.join(', ')});`;
    code += functionCallLine + '\n';

    if (returnType !== 'void') {
        code += `    console.log(JSON.stringify(result));\n`;
    } else {
        code += `    // Void return type, no output printed.`;
    }

    return code;
}

problemSchema.methods.generateExecutableCode = function (userCode, language, testInput) {
    const config = this.executionConfig;
    const normalizedLanguage = language.toLowerCase();

    const template = codeWrapperTemplates[normalizedLanguage];

    if (!template) {
        throw new Error(`Wrapper template not found for language: ${language}`);
    }

    const ioConfig = this.executionConfig.inputOutputConfig;

    let embeddedTestInput;
    const inputForStringify = testInput === undefined ? null : testInput;
    try {
        // Step 1: Convert the actual test input value into its JSON string representation.
        // Example: [2,3] -> "[2,3]"
        // Example: "hello" -> "\"hello\""
        // Example: 10 -> "10"
        const jsonStringRepresentation = JSON.stringify(inputForStringify);

        // Step 2: Now, embed this JSON string representation safely into a JavaScript string literal.
        // JSON.stringify will add outer quotes and escape any internal quotes for a JS string literal.
        // Example: "[2,3]" becomes "\"\[2,3]\""
        // Example: "\"hello\"" becomes "\"\\\"hello\\\"\""
        embeddedTestInput = JSON.stringify(jsonStringRepresentation);

    } catch (e) {
        throw new Error(`Test input is not JSON serializable: ${e.message}`);
    }

    let executableCode = template
        .replace(/\{\{USER_CODE\}\}/g, userCode);

    let dynamicInputParsingAndMethodCall = '';

    if (normalizedLanguage === 'javascript') {
        dynamicInputParsingAndMethodCall = generateJavascriptMethodCall(ioConfig);
    } else {
        dynamicInputParsingAndMethodCall = `    throw new Error("Execution logic generation not implemented for language: ${normalizedLanguage}");\n`;
    }

    executableCode = executableCode
        // {{TEST_INPUT}} will be replaced by a string like "\"\[2,3]\"".
        // The template's `const rawTestInput = {{TEST_INPUT}};` will then become
        // `const rawTestInput = "\[2,3]";` after the JS engine processes the string literal.
        // This ensures rawTestInput holds a clean JSON string.
        .replace(/\{\{TEST_INPUT\}\}/g, embeddedTestInput)
        .replace(/\{\{DYNAMIC_INPUT_PARSING_AND_METHOD_CALL\}\}/g, dynamicInputParsingAndMethodCall);

    return executableCode;
};

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;