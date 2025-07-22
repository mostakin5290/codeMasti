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

problemSchema.methods.generateExecutableCode = function (userCode, language, testInput) {
    const config = this.executionConfig;
    const normalizedLanguage = language.toLowerCase();

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