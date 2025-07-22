const axios = require('axios');

const judge0LanguageMap = {
    "c": 103,         // C (GCC 14.1.0) 
    "cpp": 105,       // C++ 20 (GCC 14.1.0) 
    "java": 91,      // Java (JDK 17.0.6) 
    "python": 109,    // Python 3.13.2 
    "javascript": 102,// Node.js 22.08.0
};

const getLanguageById = (lang) => {
    const normalizedLang = String(lang).toLowerCase().replace(/\s+/g, '');
    return judge0LanguageMap[normalizedLang] || null;
};

const submitBatch = async (submissions) => {
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: { base64_encoded: 'false' },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: { submissions }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error("Error submitting batch to Judge0:", error.response ? error.response.data : error.message);
        throw new Error("Failed to submit code batch to Judge0.");
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const submitToken = async (resultTokens) => {
    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: resultTokens.join(","),
            base64_encoded: 'false',
            fields: '*' 
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    while (true) {
        try {
            const response = await axios.request(options);
            const results = response.data.submissions;

            const allSubmissionsProcessed = results.every(r => r.status_id > 2);

            if (allSubmissionsProcessed) {
                return results;
            }

            await delay(1000); 

        } catch (error) {
            console.error("Error fetching submission tokens from Judge0:", error.response ? error.response.data : error.message);
            throw new Error("Failed to retrieve submission results from Judge0.");
        }
    }
};

module.exports = {
    getLanguageById,
    submitBatch,
    submitToken
};
