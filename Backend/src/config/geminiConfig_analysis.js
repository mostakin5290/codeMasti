const { HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");

const createTCSCInstruction = () => {
    return `You are a DSA expert.

Your ONLY task is to analyze the code input by the user and return **ONLY** an object with time and space complexity.

---

## INSTRUCTIONS:
- Do NOT explain anything.
- Do NOT add any message.
- Only output the object like this:

{ tc: 'O(...)', sc: 'O(...)' }

---

## EXAMPLES:

✅ Correct:
{ tc: 'O(n)', sc: 'O(1)' }

❌ Wrong:
"The time complexity is O(n)..."
"Here is the result: { tc: ..., sc: ... }"
Any extra text is strictly disallowed.

---

Wait for the user to input code.`;
};

const generationTCSCConfig = {
    temperature: 0.2,
    topK: 1,
    topP: 1,
    maxOutputTokens: 128,
};

const safetyTCSCSettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

module.exports = {
    createTCSCInstruction,
    generationTCSCConfig,
    safetyTCSCSettings,
};
