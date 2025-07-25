// utils/codeWrapperTemplates.js
const codeWrapperTemplates = {
    javascript: `// User's function will be inserted here
{{USER_CODE}}

// Begin problem execution logic
try {
    // rawTestInput will be a valid JavaScript string literal (e.g., "\[2,3]").
    // It already contains the JSON string.
    const rawTestInput = {{TEST_INPUT}}; 
    
    let parsedInput = JSON.parse(rawTestInput);
    
    // Dynamic logic for preparing arguments and calling the user's function.
{{DYNAMIC_INPUT_PARSING_AND_METHOD_CALL}} 
} catch (error) {
    console.error("RUNTIME_ERROR:", error.toString());
    console.error("STACK_TRACE:", error.stack);
}`,

};

module.exports = codeWrapperTemplates;