const express = require('express');
const submitRoute = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { 
    submitCode, 
    runCode, 
    getSubmissionHistory, 
    getSubmissionById ,
    getAllSubmission,
    getDailyChallengeStats
} = require("../controllers/submitControllers");

submitRoute.post('/submit/:id', userMiddleware, submitCode);
submitRoute.post("/run/:id", userMiddleware, runCode);
submitRoute.get("/history/:id", userMiddleware, getSubmissionHistory);


submitRoute.get("/details/:submissionId", userMiddleware, getSubmissionById);
submitRoute.get("/getAll", userMiddleware, getAllSubmission);

submitRoute.get('/daily-stats', userMiddleware, getDailyChallengeStats);

module.exports = submitRoute;