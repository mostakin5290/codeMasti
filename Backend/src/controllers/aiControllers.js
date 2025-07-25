const { GoogleGenerativeAI } = require("@google/generative-ai");
// Import the configuration, including our new function
const { createSystemInstruction, generationConfig, safetySettings } = require("../config/geminiConfig_chat"); // Adjust path if needed
const { createTCSCInstruction, generationTCSCConfig, safetyTCSCSettings } = require('../config/geminiConfig_analysis')
const { createAISupportInstruction, generationAISupportConfig, safetyAISupportSettings } = require('../config/geminiConfig_help')

const solveDoubt = async (req, res) => {
    try {
        // 1. Get user's question, history, AND the problem context from the request
        const { question, history, problemContext } = req.body;

        // 2. Add validation for all required fields
        if (!question) {
            return res.status(400).json({ error: "The 'question' field is required." });
        }
        if (!problemContext || !problemContext.title || !problemContext.description) {
            return res.status(400).json({ error: "The 'problemContext' object with title and description is required." });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("API key not configured.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // 3. Generate the system instruction dynamically for THIS request
        const systemInstruction = createSystemInstruction({
            title: problemContext.title,
            description: problemContext.description,
            testCases: problemContext.testCases || 'Not provided.', // Add defaults for optional fields
            startCode: problemContext.startCode || 'Not provided.',
        });

        // 4. Initialize the model with the dynamic system instruction
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction,
        });

        // Use startChat for conversational context
        const chat = model.startChat({
            history: history || [],
            generationConfig: generationConfig, // Use from imported config
            safetySettings: safetySettings,   // Use from imported config
        });

        const result = await chat.sendMessage(question);
        const response = result.response;
        const text = response.text();

        res.status(200).json({ response: text });

    } catch (error) {
        res.status(500).json({ error: "An internal error occurred while processing your request." });
    }
};

const tryParseGeminiResponse = (text) => {
    let cleanedText = text.trim();

    // 1. Try to unwrap markdown code blocks
    const jsonBlockRegex = /^```json\s*([\s\S]*?)\s*```$/; // Matches ```json\n{...}\n```
    const match = cleanedText.match(jsonBlockRegex);

    if (match && match) {
        cleanedText = match.trim(); // Extract the content inside the JSON block
    }

    try {
        // 2. Attempt to parse as pure JSON first (after unwrap)
        // This handles cases where Gemini directly returns valid JSON without extra formatting
        // like { "tc": "O(1)", "sc": "O(1)" }
        return JSON.parse(cleanedText);
    } catch (e) {
        // 3. If direct parsing fails, try to fix common Gemini formatting issues:
        //    - Convert single quotes to double quotes
        //    - Add double quotes around unquoted keys (e.g., tc: -> "tc":)
        const formatFixedText = cleanedText
            .replace(/'/g, '"') // Convert single quotes to double quotes
            // This regex specifically targets property names that are alphanumeric
            // followed by a colon, ensuring it doesn't mess up values.
            .replace(/([a-zA-Z0-9_]+):/g, '"$1":');

        try {
            return JSON.parse(formatFixedText);
        } catch (e2) {
            // If all parsing attempts fail
            return { error: "Could not parse response", raw: text };
        }
    }
};


const analyzeCode = async (req, res) => {
    try {
        // 1. Get the code input from the request
        const { code, history } = req.body;
        // 2. Validate required fields
        if (!code) {
            return res.status(400).json({ error: "The 'code' field is required." });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("API key not configured.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // 3. Get system instruction that expects only code and outputs { t.c: '...', s.c: '...' }
        const systemInstruction = createTCSCInstruction();

        // 4. Initialize model with minimal instruction
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction,
        });

        // 5. Start a chat session (optional history)
        const chat = model.startChat({
            history: history || [],
            generationTCSCConfig,
            safetyTCSCSettings,
        });

        // 6. Send the code to the model
        const result = await chat.sendMessage(code);
        const response = result.response;
        const text = response.text();

        res.status(200).json({
            success: true,
            analysis: {
                raw: text,
                parsed: tryParseGeminiResponse(text)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: "An internal error occurred while processing your request."
        });
    }
};

const help = async (req, res) => {
    try {
        // 1. Get the user's question and conversation history from the request body
        const { question, history, problemContext } = req.body; // `problemContext` might be optional here,
        // depending on if general AI needs it

        // 2. Validate required fields
        if (!question) {
            return res.status(400).json({ error: "The 'question' field is required." });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("API key not configured. Please set GOOGLE_API_KEY in your environment variables.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // 3. Get system instruction specifically for the AI Support Assistant
        const systemInstruction = createAISupportInstruction();

        // 4. Initialize model with the correct support instruction and configs
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash", // Or "gemini-pro" if you prefer
            systemInstruction,
        });

        // 5. Start a chat session with the provided history
        // The `history` array from the frontend should already be in the correct format for Gemini API.
        const chat = model.startChat({
            history: history || [], // Use the history provided by the frontend
            generationConfig: generationAISupportConfig, // Use support-specific generation config
            safetySettings: safetyAISupportSettings,     // Use support-specific safety settings
        });

        // 6. Send the user's question to the model
        // We're expecting a natural language response here, not a specific JSON object.
        const result = await chat.sendMessage(question);
        const response = result.response;
        const text = response.text(); // This will be the natural language response from the AI

        // 7. Return the AI's natural language response
        res.status(200).json({
            success: true,
            response: text,
        });

    } catch (error) {
        if (error.response && error.response.data) {
            return res.status(error.response.status).json({
                success: false,
                error: error.response.data.message || "An error occurred with the AI service.",
            });
        }
        res.status(500).json({
            success: false,
            error: "An internal server error occurred.",
        });
    }
};



module.exports = { solveDoubt, analyzeCode, help };