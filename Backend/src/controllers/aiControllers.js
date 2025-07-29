const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createSystemInstruction, generationConfig, safetySettings } = require("../config/geminiConfig_chat"); // Adjust path if needed
const { createTCSCInstruction, generationTCSCConfig, safetyTCSCSettings } = require('../config/geminiConfig_analysis')
const { createAISupportInstruction, generationAISupportConfig, safetyAISupportSettings } = require('../config/geminiConfig_help')

const solveDoubt = async (req, res) => {
    try {
        const { question, history, problemContext } = req.body;
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
        const systemInstruction = createSystemInstruction({
            title: problemContext.title,
            description: problemContext.description,
            testCases: problemContext.testCases || 'Not provided.',
            startCode: problemContext.startCode || 'Not provided.',
        });

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction,
        });

        const chat = model.startChat({
            history: history || [],
            generationConfig: generationConfig,
            safetySettings: safetySettings,
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

    // remove extra response
    const jsonBlockRegex = /^```json\s*([\s\S]*?)\s*```$/;
    const match = cleanedText.match(jsonBlockRegex);

    // Extract the content inside the JSON block
    if (match && match) {
        cleanedText = match.trim();
    }

    try {
        return JSON.parse(cleanedText);
    } catch (e) {
        const formatFixedText = cleanedText
            .replace(/'/g, '"') 
            .replace(/([a-zA-Z0-9_]+):/g, '"$1":');

        try {
            return JSON.parse(formatFixedText);
        } catch (e2) {
            return { error: "Could not parse response", raw: text };
        }
    }
};


const analyzeCode = async (req, res) => {
    try {
        const { code, history } = req.body;
        if (!code) {
            return res.status(400).json({ error: "The 'code' field is required." });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("API key not configured.");
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const systemInstruction = createTCSCInstruction();
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction,
        });
        const chat = model.startChat({
            history: history || [],
            generationTCSCConfig,
            safetyTCSCSettings,
        });
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
        const { question, history, problemContext } = req.body; 

        if (!question) {
            return res.status(400).json({ error: "The 'question' field is required." });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("API key not configured. Please set GOOGLE_API_KEY in your environment variables.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const systemInstruction = createAISupportInstruction();

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash", 
            systemInstruction,
        });

        const chat = model.startChat({
            history: history || [], 
            generationConfig: generationAISupportConfig,
            safetySettings: safetyAISupportSettings,     
        });

        const result = await chat.sendMessage(question);
        const response = result.response;
        const text = response.text(); 

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