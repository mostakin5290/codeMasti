const codeWrapperTemplates = {
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
    } else if ('{{INPUT_FORMAT}}' === 'single' || '{{INPUT_FORMAT}}' === 'string') {
        result = functionToCall(parsedInput);
    } else if ('{{INPUT_FORMAT}}' === 'object') {
        result = functionToCall(parsedInput);
    } else {
        result = functionToCall(parsedInput);
    }
    
    console.log(JSON.stringify(result));
} catch (error) {
    console.error("RUNTIME_ERROR:", error.toString());
    console.error("STACK_TRACE:", error.stack);
}`,

};

module.exports = codeWrapperTemplates;