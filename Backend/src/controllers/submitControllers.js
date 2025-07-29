const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtils");
const Contest = require('../models/Contest');
const ContestParticipation = require('../models/ ContestParticipation');

const normalizeLanguage = (lang) => {
    const lowerLang = String(lang).toLowerCase();
    if (lowerLang === 'c++') return 'cpp';
    if (lowerLang === 'js') return 'javascript';
    if (lowerLang === 'py') return 'python';
    return lowerLang;
};

const formatForComparison = (value) => {
    if (value === undefined || value === null) {
        return "";
    }
    let formattedString;
    if (typeof value === 'object') {
        try {
            formattedString = JSON.stringify(value);
        } catch (e) {
            console.warn("Could not JSON.stringify value for comparison:", value, e);
            formattedString = String(value);
        }
    } else {
        formattedString = String(value);
    }
    return formattedString.trim();
};

const submitCodeInternal = async ({ userId, problemId, code, language, contestId = null }) => {
    try {
        if (!userId || !code || !problemId || !language) {
            throw new Error("All fields are required for internal submission.");
        }

        let contest = null;
        let contestProblem = null;
        if (contestId) {
            contest = await Contest.findById(contestId);
            if (!contest) {
                throw new Error('Contest not found.');
            }
            const now = new Date();
            if (now < contest.startTime || now > contest.endTime) {
                throw new Error('Contest is not active.');
            }
            contestProblem = contest.problems.find(p => p.problemId.equals(problemId));
            if (!contestProblem) {
                throw new Error('Problem not part of this contest.');
            }
            const participation = await ContestParticipation.findOne({ contestId, userId });
            if (!participation) {
                throw new Error('Not registered for this contest.');
            }
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            throw new Error("Problem not found.");
        }
        if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
            throw new Error("Problem has no hidden test cases to submit against.");
        }

        const normalizedLang = normalizeLanguage(language);
        const languageId = getLanguageById(normalizedLang);
        if (!languageId) {
            throw new Error(`Language '${language}' is not configured for this specific problem.`);
        }

        const submissionsForJudge0 = problem.generateExecutableCode(code, language, problem.hiddenTestCases[0].input) ?
            problem.hiddenTestCases.map(testCase => ({
                source_code: problem.generateExecutableCode(code, language, testCase.input),
                language_id: languageId,
                expected_output: formatForComparison(testCase.output)
            })) : [];

        if (submissionsForJudge0.length === 0 && problem.hiddenTestCases.length > 0) {
            throw new Error("Failed to generate executable code for Judge0.");
        }

        const submitResult = await submitBatch(submissionsForJudge0);
        if (!submitResult || !Array.isArray(submitResult) || submitResult.length === 0) {
            console.error('Judge0 batch submission failed or returned empty:', submitResult);
            throw new Error('Failed to submit code to Judge0 for testing.');
        }
        const resultTokens = submitResult.map(value => value.token);
        const testResultsFromJudge0 = await submitToken(resultTokens);

        let testCasesPassed = 0;
        const testCaseDetails = [];
        let maxRuntime = 0;
        let maxMemory = 0;
        let compilationErrorOutput = null;

        for (let i = 0; i < testResultsFromJudge0.length; i++) {
            const result = testResultsFromJudge0[i];
            const testCase = problem.hiddenTestCases[i];

            maxRuntime = Math.max(maxRuntime, parseFloat(result.time || 0));
            maxMemory = Math.max(maxMemory, parseInt(result.memory || 0));

            const currentTestCaseResult = {
                input: testCase.input,
                expected: testCase.output,
                actual: null,
                passed: false,
                runtime: parseFloat(result.time || 0),
                memory: parseInt(result.memory || 0),
                error: result.status.description
            };

            if (result.status.id === 6) { 
                compilationErrorOutput = result.compile_output || "Compilation Error: No output provided.";
                currentTestCaseResult.actual = compilationErrorOutput;
                currentTestCaseResult.error = "Compilation Error";
                testCaseDetails.push(currentTestCaseResult);
                break;
            } else if (result.status.id !== 3) { 
                currentTestCaseResult.actual = result.stderr || result.stdout || "No specific output/error provided.";
                currentTestCaseResult.passed = false;
                testCaseDetails.push(currentTestCaseResult);
            } else { 
                const actualOutputString = formatForComparison(result.stdout);
                const expectedOutputString = formatForComparison(testCase.output);

                const passed = actualOutputString === expectedOutputString;

                currentTestCaseResult.actual = result.stdout;
                currentTestCaseResult.passed = passed;
                currentTestCaseResult.error = passed ? null : "Wrong Answer";
                testCaseDetails.push(currentTestCaseResult);

                if (passed) {
                    testCasesPassed++;
                }
            }
        }

        let finalStatus, errorMessage;
        if (compilationErrorOutput) {
            finalStatus = 'Compilation Error';
            errorMessage = compilationErrorOutput;
        } else if (testCasesPassed === problem.hiddenTestCases.length) {
            finalStatus = 'Accepted';
            errorMessage = '';
        } else {
            const firstFailedTest = testResultsFromJudge0.find(r => r.status.id !== 3);
            if (firstFailedTest) {
                finalStatus = firstFailedTest.status.description || 'Wrong Answer';
                errorMessage = firstFailedTest.stderr || firstFailedTest.stdout || 'Test failed.';
            } else {
                finalStatus = 'Wrong Answer';
                errorMessage = 'One or more hidden test cases failed.';
            }
        }

        const submission = await Submission.create({
            userId, problemId, code, language, status: finalStatus,
            runtime: maxRuntime, memory: maxMemory, errorMessage,
            testCasesPassed, testCasesTotal: problem.hiddenTestCases.length,
            testCaseResults: testCaseDetails,
            isDailyChallenge: problem.isDailyChallenge,
            contestId: contestId
        });

        let updatedUser = null;
        let isFirstAcceptedDailyChallengeToday = false;

        if (finalStatus === 'Accepted') {
            await User.findByIdAndUpdate(userId, { $addToSet: { problemsSolved: problemId } }, { new: false });

            let userDoc = await User.findById(userId);
            if (!userDoc) {
                console.warn("User not found after submission processing, potential data inconsistency.");
            } else {
                userDoc.dailyChallenges = userDoc.dailyChallenges || {
                    completed: [],
                    currentStreak: 0,
                    longestStreak: 0
                };

                if (problem.isDailyChallenge) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const alreadyCompletedThisChallengeToday = userDoc.dailyChallenges.completed.some(c =>
                        c.challengeId.toString() === problemId.toString() &&
                        new Date(c.date).getTime() === today.getTime()
                    );

                    isFirstAcceptedDailyChallengeToday = !alreadyCompletedThisChallengeToday;

                    if (!alreadyCompletedThisChallengeToday) {
                        const lastCompletion = userDoc.dailyChallenges.completed.length > 0 ?
                            userDoc.dailyChallenges.completed[userDoc.dailyChallenges.completed.length - 1] : null;
                        const lastDate = lastCompletion?.date ? new Date(lastCompletion.date) : null;

                        const yesterday = new Date(today);
                        yesterday.setDate(today.getDate() - 1);
                        yesterday.setHours(0, 0, 0, 0);

                        const isConsecutive = lastDate && lastDate.getTime() === yesterday.getTime();

                        const newStreak = isConsecutive ? (userDoc.dailyChallenges.currentStreak || 0) + 1 : 1;

                        userDoc.dailyChallenges.completed.push({
                            challengeId: problemId,
                            date: today,
                            streak: newStreak
                        });
                        userDoc.dailyChallenges.currentStreak = newStreak;
                        userDoc.dailyChallenges.longestStreak = Math.max(
                            userDoc.dailyChallenges.longestStreak,
                            newStreak
                        );
                        await userDoc.save();
                    }
                }

                if (contestId && contestProblem) {
                    const participation = await ContestParticipation.findOne({ contestId, userId });

                    if (participation) {
                        const existingAcceptedSubmission = participation.submissions.find(s =>
                            s.problemId.equals(problemId) && s.points > 0
                        );

                        if (!existingAcceptedSubmission) {
                            participation.submissions.push({
                                problemId,
                                submissionId: submission._id,
                                timestamp: new Date(),
                                points: contestProblem.points
                            });

                            participation.totalPoints = participation.submissions.reduce(
                                (sum, sub) => sum + sub.points, 0
                            );

                            participation.timeTaken = Math.floor(
                                (new Date() - new Date(participation.startTime)) / (1000 * 60)
                            );
                            await participation.save();
                        }
                    }
                }
            }
            updatedUser = userDoc ? userDoc.toObject() : null;
        }

        const responseData = {
            status: finalStatus,
            runtime: `${maxRuntime.toFixed(3)}s`,
            memory: `${maxMemory} KB`,
            testCases: testCaseDetails,
            code: code,
            passed: testCasesPassed,
            total: problem.hiddenTestCases.length,
            errorMessage: errorMessage,
            submissionId: submission._id
        };

        if (finalStatus === 'Accepted' && problem.isDailyChallenge && updatedUser) {
            responseData.userDailyChallenges = updatedUser.dailyChallenges;
            responseData.isFirstAcceptedDailyChallengeToday = isFirstAcceptedDailyChallengeToday;
        }

        return responseData; 
    } catch (err) {
        console.error('Submission Error (Internal):', err);
        throw new Error(`Failed to submit code internally: ${err.message}`);
    }
};

const runCodeInternal = async ({ userId, problemId, code, language, customInput }) => {
    try {
        if (!userId || !code || !problemId || !language) {
            throw new Error("All fields are required for internal run.");
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            throw new Error("Problem not found.");
        }

        const normalizedLang = normalizeLanguage(language);
        const languageId = getLanguageById(normalizedLang);
        if (!languageId) {
            throw new Error(`Language '${language}' is not configured for this specific problem.`);
        }

        let testCasesToRun = [];
        if (customInput && customInput.trim() !== '') {
            let parsedCustomInput;
            try {
                parsedCustomInput = JSON.parse(customInput);
            } catch (e) {
                parsedCustomInput = customInput;
            }
            testCasesToRun.push({ input: parsedCustomInput, output: null });
        } else {
            if (!problem.visibleTestCases || problem.visibleTestCases.length === 0) {
                throw new Error("No visible test cases or custom input provided to run against.");
            }
            testCasesToRun = problem.visibleTestCases;
        }

        const submissionsForJudge0 = testCasesToRun.map(testCase => {
            const executableCode = problem.generateExecutableCode(code, language, testCase.input);
            const formattedExpectedOutput = testCase.output !== null ? formatForComparison(testCase.output) : null;

            return {
                source_code: executableCode,
                language_id: languageId,
                expected_output: formattedExpectedOutput
            };
        });

        const submitResult = await submitBatch(submissionsForJudge0);
        if (!submitResult || !Array.isArray(submitResult) || submitResult.length === 0) {
            console.error('Judge0 batch submission failed or returned empty:', submitResult);
            throw new Error('Failed to submit code to Judge0 for testing.');
        }
        const resultTokens = submitResult.map(value => value.token);
        const testResultsFromJudge0 = await submitToken(resultTokens);

        let testCasesPassed = 0;
        const testCaseDetails = [];
        let maxRuntime = 0;
        let maxMemory = 0;
        let compilationErrorOutput = null;

        for (let i = 0; i < testResultsFromJudge0.length; i++) {
            const result = testResultsFromJudge0[i];
            const testCase = testCasesToRun[i];

            maxRuntime = Math.max(maxRuntime, parseFloat(result.time || 0));
            maxMemory = Math.max(maxMemory, parseInt(result.memory || 0));

            const currentTestCaseResult = {
                input: testCase.input,
                expected: testCase.output,
                actual: null,
                passed: false,
                runtime: parseFloat(result.time || 0),
                memory: parseInt(result.memory || 0),
                error: result.status.description
            };

            if (result.status.id === 6) { 
                compilationErrorOutput = result.compile_output || "Compilation Error: No output provided.";
                currentTestCaseResult.actual = compilationErrorOutput;
                currentTestCaseResult.error = "Compilation Error";
                testCaseDetails.push(currentTestCaseResult);
                break;
            } else if (result.status.id !== 3) { 
                currentTestCaseResult.actual = result.stderr || result.stdout || "No specific output/error provided.";
                currentTestCaseResult.passed = false;
                testCaseDetails.push(currentTestCaseResult);
            } else { 
                const actualOutputString = formatForComparison(result.stdout);
                const expectedOutputString = testCase.output !== null ? formatForComparison(testCase.output) : null;

                const passed = expectedOutputString === null || actualOutputString === expectedOutputString;

                currentTestCaseResult.actual = result.stdout;
                currentTestCaseResult.passed = passed;
                currentTestCaseResult.error = passed ? null : "Wrong Answer";
                testCaseDetails.push(currentTestCaseResult);

                if (passed) {
                    testCasesPassed++;
                }
            }
        }

        let finalStatus, errorMessage;
        if (compilationErrorOutput) {
            finalStatus = 'Compilation Error';
            errorMessage = compilationErrorOutput;
        } else if (testCasesPassed === testCasesToRun.length) {
            finalStatus = 'Accepted';
            errorMessage = '';
        } else {
            const firstFailedTest = testResultsFromJudge0.find(r => r.status.id !== 3);
            if (firstFailedTest) {
                finalStatus = firstFailedTest.status.description || 'Wrong Answer';
                errorMessage = firstFailedTest.stderr || firstFailedTest.stdout || 'Test failed.';
            } else {
                finalStatus = 'Wrong Answer';
                errorMessage = 'One or more tests failed.';
            }
        }

        return {
            status: finalStatus,
            runtime: `${maxRuntime.toFixed(3)}s`,
            memory: `${maxMemory} KB`,
            testCases: testCaseDetails,
            passed: testCasesPassed,
            total: testCasesToRun.length,
            errorMessage: errorMessage
        };

    } catch (err) {
        console.error('Run Code Error (Internal):', err);
        throw new Error(`Failed to run code internally: ${err.message}`);
    }
};


const submitCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;
        const { code, language } = req.body;
        const contestId = req.query.contestId;

        const submissionResult = await submitCodeInternal({
            userId,
            problemId,
            code,
            language,
            contestId
        });

        res.status(200).json(submissionResult);

    } catch (err) {
        console.error('Submission Error:', err);
        res.status(500).json({
            message: 'Failed to submit code',
            error: err.message
        });
    }
};

const runCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;
        const { code, language, customInput } = req.body;

        const runResult = await runCodeInternal({
            userId,
            problemId,
            code,
            language,
            customInput
        });

        res.status(200).json(runResult);

    } catch (err) {
        console.error('Run Code Error:', err);
        res.status(500).json({
            message: 'Failed to run code',
            error: err.message
        });
    }
};

const getSubmissionHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: problemId } = req.params;

        const submissions = await Submission.find({ userId, problemId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('problemId', 'title')
            .lean();

        const formattedSubmissions = submissions.map(sub => ({
            _id: sub._id,
            status: sub.status,
            language: sub.language,
            createdAt: sub.createdAt,
            runtime: sub.runtime ? `${sub.runtime.toFixed(3)}s` : null,
            memory: sub.memory ? `${Math.floor(sub.memory / 1024)} KB` : null,
            title: sub.problemId ? sub.problemId.title : 'N/A'
        }));

        res.status(200).json(formattedSubmissions);

    } catch (err) {
        console.error('Get History Error:', err);
        res.status(500).json({ message: 'Failed to fetch submission history.', error: err.message });
    }
};

const getSubmissionById = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findOne({ _id: submissionId, userId: req.user._id });

        if (!submission) {
            return res.status(404).json({ message: "Submission not found or you do not have permission to view it." });
        }

        const formattedResult = {
            id: submission._id,
            status: submission.status,
            errorMessage: submission.errorMessage,
            passed: submission.testCasesPassed,
            total: submission.testCasesTotal,
            language: submission.language,
            code: submission.code,
            runtime: `${submission.runtime.toFixed(3)}s`,
            memory: `${Math.floor(submission.memory / 1024)} KB`,
            testCases: submission.testCaseResults
        };

        res.status(200).json(formattedResult);

    } catch (err) {
        console.error('Get Submission By ID Error:', err);
        res.status(500).json({ message: 'Failed to fetch submission details.', error: err.message });
    }
};

const getAllSubmission = async (req, res) => {
    try {
        const targetUserId = req.query.userId || (req.user ? req.user._id : null);

        if (!targetUserId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        const submissions = await Submission.find({ userId: targetUserId })
            .sort({ createdAt: -1 })
            .populate('problemId', 'title')
            .lean();

        if (!submissions.length) {
            return res.status(200).json({ results: [], message: "No submissions found for this user." });
        }

        const formattedResults = submissions.map(sub => {
            const problemTitle = sub.problemId ? sub.problemId.title : "Deleted Problem";
            return {
                id: sub._id,
                problemId: sub.problemId ? sub.problemId._id : null,
                status: sub.status,
                title: problemTitle,
                errorMessage: sub.errorMessage,
                passed: sub.testCasesPassed,
                total: sub.testCasesTotal,
                createdAt: sub.createdAt,
                runtime: sub.runtime ? `${sub.runtime.toFixed(3)}s` : null,
                language: sub.language
            };
        });

        res.status(200).json({ results: formattedResults });

    } catch (err) {
        console.error('Get All Submissions Error:', err);
        res.status(500).json({ message: 'Failed to fetch submissions.', error: err.message });
    }
};

const getDailyChallengeStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('dailyChallenges')
            .populate({
                path: 'dailyChallenges.completed.challengeId',
                select: 'title difficulty'
            });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayChallenge = await Problem.findOne({
            isDailyChallenge: true,
            dailyChallengeDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } // Ensure it's for today
        });

        let todayCompleted = false;
        if (todayChallenge && user.dailyChallenges?.completed) {
            todayCompleted = user.dailyChallenges.completed.some(c =>
                c.challengeId.equals(todayChallenge._id) &&
                new Date(c.date).getTime() === today.getTime()
            );
        }

        res.status(200).json({
            currentStreak: user.dailyChallenges?.currentStreak || 0,
            longestStreak: user.dailyChallenges?.longestStreak || 0,
            totalCompleted: user.dailyChallenges?.completed?.length || 0,
            todayCompleted,
            history: user.dailyChallenges?.completed?.map(c => ({
                date: c.date,
                streak: c.streak,
                challenge: c.challengeId
            })) || []
        });

    } catch (err) {
        console.error('Daily Challenge Stats Error:', err);
        res.status(500).json({
            message: 'Failed to fetch daily challenge stats',
            error: err.message
        });
    }
};


module.exports = {
    getSubmissionById,
    submitCode,
    runCode,
    getSubmissionHistory,
    getAllSubmission,
    getDailyChallengeStats,
    submitCodeInternal, 
    runCodeInternal 
};