const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user"); // Make sure to import the User model
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
        return ""; // Always return an empty string for null/undefined
    }
    let formattedString;
    // If it's an object or array, stringify it
    if (typeof value === 'object') {
        try {
            // Use JSON.stringify for objects/arrays.
            // Sorting keys for objects might be considered for stricter equality, but usually not needed if outputs are consistent.
            formattedString = JSON.stringify(value);
        } catch (e) {
            // Fallback for circular references or complex objects not meant for JSON.stringify
            console.warn("Could not JSON.stringify value for comparison:", value, e);
            formattedString = String(value); // Fallback
        }
    } else {
        // For primitives (numbers, booleans, strings)
        formattedString = String(value);
    }
    // CRUCIAL CHANGE: Remove leading/trailing whitespace (including newlines) for robust comparison
    return formattedString.trim();
};

const submitCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id; // Problem ID from URL param
        let { code, language } = req.body;
        const contestId = req.query.contestId; // <-- NEW: Get contestId from query parameter!

        // 1. Basic Validation
        if (!userId || !code || !problemId || !language) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Add contest-specific checks if contestId is provided
        let contest = null;
        let contestProblem = null;
        if (contestId) {
            contest = await Contest.findById(contestId); // Ensure Contest model is imported
            if (!contest) {
                return res.status(404).json({ error: 'Contest not found.' });
            }

            // Check if contest is ongoing
            const now = new Date();
            if (now < contest.startTime || now > contest.endTime) {
                return res.status(400).json({ error: 'Contest is not active.' });
            }

            // Check if this problem is part of this contest
            contestProblem = contest.problems.find(p => p.problemId.equals(problemId));
            if (!contestProblem) {
                return res.status(404).json({ error: 'Problem not part of this contest.' });
            }

            // For contest submissions, user MUST be registered
            const participation = await ContestParticipation.findOne({
                contestId,
                userId
            });
            if (!participation) {
                return res.status(403).json({ error: 'Not registered for this contest.' });
            }
        }


        // 2. Fetch Problem
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }
        if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
            // For contests, you might allow problems without hidden test cases for practice,
            // but for submission, it's typically required.
            return res.status(400).json({ message: "Problem has no hidden test cases to submit against." });
        }

        const normalizedLang = normalizeLanguage(language);

        // if (!problem.executionConfig || !problem.executionConfig.judge0LanguageIds) {
        //     return res.status(500).json({ message: "Problem is missing its execution configuration." });
        // }

        const languageId = getLanguageById(normalizedLang);
        if (!languageId) {
            return res.status(400).json({ message: `Language '${language}' is not configured for this specific problem.` });
        }

        // 3. Prepare Submissions for Judge0 (using problem.generateExecutableCode)
        const submissionsForJudge0 = problem.generateExecutableCode(code, language, problem.hiddenTestCases[0].input) ?
            problem.hiddenTestCases.map(testCase => ({
                source_code: problem.generateExecutableCode(code, language, testCase.input),
                language_id: languageId,
                expected_output: formatForComparison(testCase.output)
            })) : []; // Handle case where generateExecutableCode might fail or be undefined

        if (submissionsForJudge0.length === 0 && problem.hiddenTestCases.length > 0) {
            return res.status(500).json({ message: "Failed to generate executable code for Judge0." });
        }


        // 4. Submit to Judge0
        const submitResult = await submitBatch(submissionsForJudge0);
        if (!submitResult || !Array.isArray(submitResult) || submitResult.length === 0) {
            console.error('Judge0 batch submission failed or returned empty:', submitResult);
            return res.status(500).json({ message: 'Failed to submit code to Judge0 for testing.' });
        }
        const resultTokens = submitResult.map(value => value.token);
        const testResultsFromJudge0 = await submitToken(resultTokens);

        // 5. Process Judge0 Results (unchanged logic)
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

            if (result.status.id === 6) { // Compilation Error
                compilationErrorOutput = result.compile_output || "Compilation Error: No output provided.";
                currentTestCaseResult.actual = compilationErrorOutput;
                currentTestCaseResult.error = "Compilation Error";
                testCaseDetails.push(currentTestCaseResult);
                break; // Stop processing further tests on compilation error
            } else if (result.status.id !== 3) { // Any other non-accepted status
                currentTestCaseResult.actual = result.stderr || result.stdout || "No specific output/error provided.";
                currentTestCaseResult.passed = false;
                testCaseDetails.push(currentTestCaseResult);
            } else { // Status ID 3 = Accepted
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

        // 6. Determine Final Submission Status (unchanged logic)
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

        // 7. Create Submission Record
        const submission = await Submission.create({
            userId, problemId, code, language, status: finalStatus,
            runtime: maxRuntime, memory: maxMemory, errorMessage,
            testCasesPassed, testCasesTotal: problem.hiddenTestCases.length,
            testCaseResults: testCaseDetails,
            isDailyChallenge: problem.isDailyChallenge,
            contestId: contestId // <-- NEW: Store contestId in submission if present
        });

        // 8. Update User's Solved Problems and Daily Challenge Streak (if Accepted)
        // And for ContestParticipation if contestId is present
        let updatedUser = null;
        let isFirstAcceptedDailyChallengeToday = false;

        if (finalStatus === 'Accepted') {
            // Update problemsSolved. Use $addToSet to prevent duplicates if user already solved it.
            await User.findByIdAndUpdate(userId, { $addToSet: { problemsSolved: problemId } }, { new: false });

            // Re-fetch user to get the absolute latest state before daily challenge logic
            let userDoc = await User.findById(userId);
            if (!userDoc) {
                return res.status(404).json({ message: "User not found after submission processing." });
            }

            // Daily Challenge Tracking (unchanged logic)
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

            // --- NEW: Update ContestParticipation if this was a contest submission ---
            if (contestId && contestProblem) {
                const participation = await ContestParticipation.findOne({
                    contestId,
                    userId
                });

                if (participation) {
                    // Check if this problem was already accepted in this contest by this user
                    const existingAcceptedSubmission = participation.submissions.find(s =>
                        s.problemId.equals(problemId) && s.points > 0
                    );

                    if (!existingAcceptedSubmission) {
                        // If it's the first Accepted submission for this problem in this contest
                        participation.submissions.push({
                            problemId,
                            submissionId: submission._id,
                            timestamp: new Date(), // Time of current submission
                            points: contestProblem.points // Award points as defined in contest
                        });

                        // Recalculate total points for the participation
                        participation.totalPoints = participation.submissions.reduce(
                            (sum, sub) => sum + sub.points, 0
                        );

                        // Update time taken (in minutes, from start of contest participation)
                        // Assumes participation.startTime is when they registered or started the contest.
                        participation.timeTaken = Math.floor(
                            (new Date() - new Date(participation.startTime)) / (1000 * 60)
                        );
                        await participation.save();
                    } else {
                    }
                } else {
                    console.warn(`ContestParticipation not found for user ${userId} in contest ${contestId} during submission. This should have been caught earlier.`);
                }
            }

            updatedUser = await User.findById(userId).select('dailyChallenges problemsSolved').lean();
        }

        const responseData = {
            status: finalStatus,
            runtime: `${maxRuntime.toFixed(3)}s`,
            memory: `${maxMemory} KB`,
            testCases: testCaseDetails,
            code:code,
            passed: testCasesPassed,
            total: problem.hiddenTestCases.length,
            errorMessage: errorMessage,
            submissionId: submission._id
        };

        if (finalStatus === 'Accepted' && problem.isDailyChallenge && updatedUser) {
            responseData.userDailyChallenges = updatedUser.dailyChallenges;
            responseData.isFirstAcceptedDailyChallengeToday = isFirstAcceptedDailyChallengeToday;
        }

        res.status(200).json(responseData);

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
        let { code, language, customInput } = req.body; 

        if (!userId || !code || !problemId || !language) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        const normalizedLang = normalizeLanguage(language);

        // if (!problem.executionConfig || !problem.executionConfig.judge0LanguageIds) {
        //     return res.status(500).json({ message: "Problem is missing its execution configuration." });
        // }

        const languageId = getLanguageById(normalizedLang);
        if (!languageId) {
            return res.status(400).json({ message: `Language '${language}' is not configured for this specific problem.` });
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
                return res.status(400).json({ message: "No visible test cases or custom input provided to run against." });
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
            return res.status(500).json({ message: 'Failed to submit code to Judge0 for testing.' });
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
            const testCase = testCasesToRun[i]; // Use testCasesToRun here

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

            if (result.status.id === 6) { // Compilation Error
                compilationErrorOutput = result.compile_output || "Compilation Error: No output provided.";
                currentTestCaseResult.actual = compilationErrorOutput;
                currentTestCaseResult.error = "Compilation Error";
                testCaseDetails.push(currentTestCaseResult);
                break;
            } else if (result.status.id !== 3) { // Any other non-accepted status
                currentTestCaseResult.actual = result.stderr || result.stdout || "No specific output/error provided.";
                currentTestCaseResult.passed = false;
                testCaseDetails.push(currentTestCaseResult);
            } else { // Status ID 3 = Accepted
                const actualOutputString = formatForComparison(result.stdout);
                const expectedOutputString = testCase.output !== null ? formatForComparison(testCase.output) : null;

                // Comparison logic: If expected output is null (e.g., for custom input), it's considered 'passed'
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

        // 6. Determine Final Run Status
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
                errorMessage = 'One or more tests failed.'; // Use generic message
            }
        }

        // 7. Send Response to Frontend (no database saving for 'runCode')
        res.status(200).json({
            status: finalStatus,
            runtime: `${maxRuntime.toFixed(3)}s`,
            memory: `${maxMemory} KB`,
            testCases: testCaseDetails,
            passed: testCasesPassed,
            total: testCasesToRun.length, // total based on what was run
            errorMessage: errorMessage
        });

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

        // Get today's challenge to see if it's been completed
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayChallenge = await Problem.findOne({
            isDailyChallenge: true,
            dailyChallengeDate: { $gte: today }
        });

        let todayCompleted = false;
        if (todayChallenge && user.dailyChallenges?.completed) {
            todayCompleted = user.dailyChallenges.completed.some(c =>
                c.challengeId.equals(todayChallenge._id) &&
                new Date(c.date).getTime() >= today.getTime()
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


module.exports = { getSubmissionById, submitCode, runCode, getSubmissionHistory, getAllSubmission, getDailyChallengeStats };