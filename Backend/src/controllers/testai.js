// test-ai.js
require('dotenv').config();

console.log("--- Starting AI Test ---");

try {
    console.log("Attempting to require '@google/genai'...");
    const { GoogleGenerativeAI } = require("@google/genai");
    console.log("Successfully required '@google/genai'.");

    console.log("The required object is:", GoogleGenerativeAI);

    if (typeof GoogleGenerativeAI !== 'function') {
        console.error("FATAL: GoogleGenerativeAI is NOT a function/constructor!");
        // Let's inspect what was actually imported
        const fullModule = require("@google/genai");
        console.log("Full module content:", fullModule);
        process.exit(1); // Exit with an error code
    }

    console.log("Attempting to create a new GoogleGenerativeAI instance...");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_API_KEY);
    console.log("SUCCESS! Created an instance of GoogleGenerativeAI.");
    console.log("--- Test Complete ---");

} catch (e) {
    console.error("--- TEST FAILED ---");
    console.error("An error occurred:", e);
}