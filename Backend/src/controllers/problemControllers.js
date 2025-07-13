const { getLanguageById, submitBatch, submitToken } = require('../utils/problemUtils');
const Problem = require('../models/problem');
const Submission = require('../models/submission'); // Ensure Submission model is imported
const mongoose = require('mongoose');
const Video = require('../models/video')

const createProblem = async (req, res) => {
    try {
        const {
            title, description, difficulty, tags,
            visibleTestCases, hiddenTestCases, starterCode, referenceSolution,
            executionConfig // This will now *not* contain wrapperTemplates
        } = req.body;

        // --- 1. Basic Validation & Pre-computation ---
        if (!executionConfig || !executionConfig.inputOutputConfig) {
            return res.status(400).json({ message: "Problem must include complete execution configuration (inputOutputConfig, wrapperTemplates)." });
        }

        const allTestCases = [...(visibleTestCases || []), ...(hiddenTestCases || [])];
        if (allTestCases.length === 0) {
            return res.status(400).json({ message: "Problem must have at least one test case (visible or hidden)." });
        }

        // --- 2. Pre-validate Reference Solutions (using a temporary Problem instance) ---
        const tempProblem = new Problem({
            title, description, difficulty, tags,
            visibleTestCases, hiddenTestCases, starterCode, referenceSolution,
            executionConfig, // This object no longer expects wrapperTemplates
            problemCreator: req.user._id
        });


        // if (referenceSolution && referenceSolution.length > 0) {
        //     for (const { language, completeCode } of referenceSolution) {
        //         if (!language || !completeCode) {
        //             return res.status(400).send("Each reference solution must have a language and complete code.");
        //         }
        //         // Use tempProblem.executionConfig to get judge0LanguageIds from the current problem config
        //         const languageId = tempProblem.executionConfig.judge0LanguageIds[language.toLowerCase()]; // Ensure language is normalized

        //         if (languageId === undefined) { // Check for unsupported language by Judge0 ID
        //             return res.status(400).json({ message: `Unsupported language for reference solution: ${language}. No Judge0 ID found.` });
        //         }

        //         const submissionsForJudge0 = allTestCases.map(testCase => {
        //             const executableCode = tempProblem.generateExecutableCode(completeCode, language, testCase.input);

        //             const formattedExpectedOutput = typeof testCase.output === 'object' ? JSON.stringify(testCase.output) : String(testCase.output);

        //             return {
        //                 source_code: executableCode,
        //                 language_id: languageId,
        //                 expected_output: formattedExpectedOutput
        //             };
        //         });

        //         const submitResult = await submitBatch(submissionsForJudge0);
        //         if (!submitResult || !submitResult.length) {
        //             console.error('Judge0 batch submission failed or returned empty:', submitResult);
        //             return res.status(500).json({ message: 'Failed to submit reference solution to Judge0.' });
        //         }

        //         const resultTokens = submitResult.map(value => value.token);
        //         const testResults = await submitToken(resultTokens);

        //         for (const test of testResults) {
        //             if (test.status.id !== 3) { // Check if not Accepted (Status ID 3)
        //                 const failReason = `Reference solution for '${language}' failed on test case. Status: ${test.status.description || 'Unknown'}. Output: ${test.stdout || test.stderr || 'No output'}`;
        //                 return res.status(400).json({ message: failReason });
        //             }
        //         }
        //     }
        // }

        // --- 3. Save the Problem to DB if all validations pass ---
        const problem = await Problem.create({
            title, description, difficulty, tags,
            visibleTestCases, hiddenTestCases, starterCode, referenceSolution,
            executionConfig,
            problemCreator: req.user._id // <--- And also here, for the actual problem creation
        });

        res.status(201).json({ message: 'Problem created successfully', problem });
    }
    catch (err) {
        console.error("Error in createProblem:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation failed", error: err.message });
        }
        // Handle MongoDB duplicate key error specifically if a slug is generated but not unique
        if (err.code === 11000) {
            return res.status(409).json({ message: "A problem with a similar title already exists (duplicate slug). Please use a unique title.", error: err.message });
        }
        res.status(500).json({ message: "Error creating problem", error: err.message });
    }
};

const updateProblem = async (req, res) => {
    const { id } = req.params;
    const {
        title, description, difficulty, tags,
        visibleTestCases, hiddenTestCases, starterCode, referenceSolution,
        executionConfig // Allow updating executionConfig
    } = req.body;

    try {
        if (!id) {
            return res.status(400).json({ message: "Problem ID is required." });
        }

        const existingProblem = await Problem.findById(id);
        if (!existingProblem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        // --- Re-validate Reference Solutions if they are being updated or the problem config is updated ---
        // Create a temporary Problem instance by merging existing data with new data from the request.
        // This ensures the `generateExecutableCode` method uses the *proposed* updated config.
        const updatedProblemCandidate = new Problem({
            ...existingProblem.toObject(), // Start with existing problem data
            ...req.body,                  // Overlay with data from the request body
            _id: existingProblem._id      // Ensure the _id is preserved for consistency (though not strictly necessary for temporary instance)
        });

        const allTestCases = [...(updatedProblemCandidate.visibleTestCases || []), ...(updatedProblemCandidate.hiddenTestCases || [])];
        if (allTestCases.length === 0) {
            return res.status(400).json({ message: "Problem must have at least one test case (visible or hidden)." });
        }

        // If reference solutions are provided in the update, or if executionConfig is being modified, re-validate them.
        // if ((referenceSolution && referenceSolution.length > 0) || executionConfig) {
        //     for (const { language, completeCode } of referenceSolution) {
        //         if (!language || !completeCode) {
        //             return res.status(400).send("Each reference solution must have a language and complete code.");
        //         }
        //         const languageId = getLanguageById(language);
        //         if (languageId === null) {
        //             return res.status(400).json({ message: `Unsupported language for reference solution: ${language}` });
        //         }

        //         const submissionsForJudge0 = allTestCases.map(testCase => {
        //             const executableCode = updatedProblemCandidate.generateExecutableCode(completeCode, language, testCase.input);
        //             const formattedExpectedOutput = typeof testCase.output === 'object' ? JSON.stringify(testCase.output) : String(testCase.output);

        //             return {
        //                 source_code: executableCode,
        //                 language_id: languageId,
        //                 expected_output: formattedExpectedOutput
        //             };
        //         });

        //         const submitResult = await submitBatch(submissionsForJudge0);
        //         if (!submitResult || !submitResult.length) {
        //             console.error('Judge0 batch submission failed or returned empty:', submitResult);
        //             return res.status(500).json({ message: 'Failed to submit reference solution to Judge0 during update.' });
        //         }

        //         const resultTokens = submitResult.map(value => value.token);
        //         const testResults = await submitToken(resultTokens);

        //         for (const test of testResults) {
        //             if (test.status_id !== 3) { // Check if not Accepted
        //                 const failReason = `Updated reference solution for '${language}' failed. Status: ${test.status.description || 'Unknown'}. Output: ${test.stdout || test.stderr || 'No output'}`;
        //                 return res.status(400).json({ message: failReason });
        //             }
        //         }
        //     }
        // }

        // Construct the final update object based on what's provided in the request body
        const finalUpdateData = {};
        if (title !== undefined) finalUpdateData.title = title;
        if (description !== undefined) finalUpdateData.description = description;
        if (difficulty !== undefined) finalUpdateData.difficulty = difficulty;
        if (tags !== undefined) finalUpdateData.tags = tags;
        if (visibleTestCases !== undefined) finalUpdateData.visibleTestCases = visibleTestCases;
        if (hiddenTestCases !== undefined) finalUpdateData.hiddenTestCases = hiddenTestCases;
        if (starterCode !== undefined) finalUpdateData.starterCode = starterCode;
        if (referenceSolution !== undefined) finalUpdateData.referenceSolution = referenceSolution;
        if (executionConfig !== undefined) finalUpdateData.executionConfig = executionConfig; // Include executionConfig

        const updatedProblem = await Problem.findByIdAndUpdate(id, finalUpdateData, { new: true, runValidators: true });

        res.status(200).json({ message: 'Problem updated successfully', problem: updatedProblem });

    } catch (err) {
        console.error("Error in updateProblem:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation failed", error: err.message });
        }
        res.status(500).json({ message: 'Error updating problem', error: err.message });
    }
};

const deleteProblem = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ message: 'Problem ID is required.' });
        }

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if (!deletedProblem) {
            return res.status(404).json({ message: 'Problem not found.' });
        }

        res.status(200).json({ message: 'Problem deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: "Error deleting problem", error: err.message });
    }
};

const getProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).json({ message: "Invalid ID provided." });
        }
        const problem = await Problem.findById(id).select(
            '_id title description difficulty tags visibleTestCases starterCode executionConfig referenceSolution'
        ).lean(); // Add .lean() for performance, as you're modifying it in memory

        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        // --- FIX HERE ---
        // Change 'Video' to 'Video' (your actual model name)
        const video = await Video.findOne({ problemId: id }).lean(); // Also .lean()
        // --- END FIX ---

        if (video) {
            // Attach video properties directly to the problem object
            // Note: Since you're using .lean() on problem, you can directly add properties.
            problem.secureUrl = video.secureUrl;
            problem.cloudinaryPublicId = video.cloudinaryPublicId;
            problem.thumbnailUrl = video.thumbnailUrl;
            problem.duration = video.duration;
            problem.videoSolutionId = video._id;
        }
        res.status(200).json(problem);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching problem', error: err.message });
    }
};


const getAllProblem = async (req, res) => {
    try {
        const userId = req.user ? new mongoose.Types.ObjectId(req.user._id) : null;

        const problems = await Problem.aggregate([
            {
                $lookup: {
                    from: 'submissions', // The actual collection name for Submissions
                    localField: '_id',
                    foreignField: 'problemId',
                    as: 'submissions'
                }
            },
            // NEW Stage 2: Lookup (join) with the Videos collection
            {
                $lookup: {
                    from: 'Videos', // <<-- IMPORTANT: Verify this is your actual MongoDB collection name for Video
                    localField: '_id',
                    foreignField: 'problemId',
                    as: 'Videos'
                }
            },
            // Stage 3: Add new fields (status, acceptance, and first video details)
            {
                $addFields: {
                    status: {
                        $cond: {
                            if: { $eq: [userId, null] },
                            then: 'none',
                            else: {
                                $let: {
                                    vars: {
                                        userSubmissions: {
                                            $filter: {
                                                input: '$submissions',
                                                as: 'sub',
                                                cond: { $eq: ['$$sub.userId', userId] }
                                            }
                                        }
                                    },
                                    in: {
                                        $cond: {
                                            if: { $anyElementTrue: [{ $map: { input: '$$userSubmissions', as: 's', in: { $eq: ['$$s.status', 'Accepted'] } } }] },
                                            then: 'solved',
                                            else: {
                                                $cond: {
                                                    if: { $gt: [{ $size: '$$userSubmissions' }, 0] },
                                                    then: 'attempted',
                                                    else: 'none'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    acceptance: {
                        $let: {
                            vars: {
                                totalAttempts: { $setUnion: '$submissions.userId' },
                                acceptedAttempts: {
                                    $setUnion: {
                                        $map: {
                                            input: { $filter: { input: '$submissions', as: 's', cond: { $eq: ['$$s.status', 'Accepted'] } } },
                                            as: 'sub',
                                            in: '$$sub.userId'
                                        }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: { $eq: [{ $size: '$$totalAttempts' }, 0] },
                                    then: 0,
                                    else: {
                                        $round: [
                                            { $multiply: [{ $divide: [{ $size: '$$acceptedAttempts' }, { $size: '$$totalAttempts' }] }, 100] },
                                            1
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    // NEW: Add video details from the first found video for this problem
                    Video: { $arrayElemAt: ['$Videos', 0] } // Gets the first video if multiple exist
                }
            },
            // Stage 4: Project (select) the final fields to send to the frontend
            {
                $project: {
                    _id: 1,
                    title: 1,
                    difficulty: 1,
                    tags: 1,
                    status: 1,
                    acceptance: 1,
                    // Include necessary video fields from the selected Video
                    'Video._id': 1, // The video document's ID, crucial for deletion
                    'Video.cloudinaryPublicId': 1,
                    'Video.secureUrl': 1,
                    'Video.thumbnailUrl': 1,
                    'Video.duration': 1
                }
            }
        ]);

        res.status(200).json(problems);
    }
    catch (err) {
        console.error("Aggregation Error in getAllProblem:", err);
        res.status(500).json({ message: "Error fetching problems", error: err.message });
    }
};
// ... (rest of problem controllers)

const getProblemByIdForAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ message: "Invalid ID provided." });
        }

        // For admin, fetch ALL fields including hidden test cases and reference solutions
        const problem = await Problem.findById(id);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        res.status(200).json(problem);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching problem', error: err.message });
    }
};

const searchProblems = async (req, res) => {
    try {
        const query = req.query.q || '';
        if (query.length < 2) {
            return res.json([]);
        }
        const problems = await Problem.find({
            title: { $regex: query, $options: 'i' }
        }).select('title _id').limit(10);

        res.json(problems);
    } catch (error) {
        console.error('Problem search error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// Add these new methods to your existing exports

const getTodayChallenge = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const challenge = await Problem.findOne({
            isDailyChallenge: true,
            dailyChallengeDate: { $gte: today }
        }).select('-hiddenTestCases -referenceSolution');

        if (!challenge) {
            return res.status(404).json({
                message: "No daily challenge found for today",
                suggestion: "Check back tomorrow or contact admin"
            });
        }

        // Check if user already solved it
        const submission = await Submission.findOne({
            userId: req.user._id,
            problemId: challenge._id,
            status: 'Accepted'
        });

        res.status(200).json({
            challenge,
            alreadySolved: !!submission,
            streak: req.user.dailyChallenges?.currentStreak || 0
        });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching today's challenge",
            error: err.message
        });
    }
};

const getUserStreak = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('dailyChallenges');

        res.status(200).json({
            currentStreak: user.dailyChallenges.currentStreak,
            longestStreak: user.dailyChallenges.longestStreak,
            completedChallenges: user.dailyChallenges.completed.length
        });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching streak data",
            error: err.message
        });
    }
};

const getPreviousChallenges = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Normalize to the start of today

        const challenges = await Problem.find({
            isDailyChallenge: true,
            dailyChallengeDate: { $gte: todayStart } // This gets challenges from today onwards
        })
            .sort({ dailyChallengeDate: -1 }) // Still sort by date descending for most recent first
            .skip(skip)
            .limit(limit)
            .select('title difficulty dailyChallengeDate tags');

        res.status(200).json(challenges);
    } catch (err) {
        res.status(500).json({
            message: "Error fetching previous challenges",
            error: err.message
        });
    }
};
const setDailyChallenge = async (req, res) => {
    try {
        const { problemId, date } = req.body; // Expect 'date' in the request body

        if (!problemId || !date) {
            return res.status(400).json({ message: "Problem ID and date are required" });
        }

        const targetDate = new Date(date);
        // Ensure the date is at the start of the day (midnight) for accurate comparison
        targetDate.setHours(0, 0, 0, 0);

        // 1. Find and unset any existing daily challenge for the TARGET DATE.
        // This prevents having multiple daily challenges on the same future date.
        await Problem.updateMany(
            { dailyChallengeDate: { $gte: targetDate, $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) } },
            { $set: { isDailyChallenge: false, dailyChallengeDate: null } }
        );

        // 2. Set the new daily challenge for the specified date
        const updatedProblem = await Problem.findByIdAndUpdate(
            problemId,
            {
                isDailyChallenge: true,
                dailyChallengeDate: targetDate // Store the normalized date
            },
            { new: true } // Return the updated document
        );

        if (!updatedProblem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({
            message: "Daily challenge set successfully",
            challenge: updatedProblem.title,
            date: targetDate // Return the date for confirmation
        });
    } catch (err) {
        console.error("Error setting daily challenge:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation failed", error: err.message });
        }
        res.status(500).json({
            message: "Error setting daily challenge",
            error: err.message
        });
    }
};

const deleteDailyChallenge = async (req, res) => {
    const { id: problemId } = req.params; // Assuming the ID passed is the Problem ID

    try {
        if (!problemId) {
            return res.status(400).json({ message: "Problem ID is required to remove the daily challenge." });
        }

        // Find the problem and unset the daily challenge flags
        const updatedProblem = await Problem.findByIdAndUpdate(
            problemId,
            {
                $unset: {
                    isDailyChallenge: "", // Unset the boolean flag
                    dailyChallengeDate: "" // Unset the date
                }
            },
            { new: true } // Return the updated document
        );

        if (!updatedProblem) {
            return res.status(404).json({ message: "Problem not found or was not set as a daily challenge." });
        }

        res.status(200).json({
            message: "Daily challenge status removed successfully.",
            problem: updatedProblem // Optionally return the problem
        });
    } catch (err) {
        console.error("Error removing daily challenge:", err);
        res.status(500).json({
            message: "Error removing daily challenge.",
            error: err.message
        });
    }
};

module.exports = {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblem,
    getProblemByIdForAdmin,
    searchProblems,
    getTodayChallenge,
    getUserStreak,
    setDailyChallenge,
    getPreviousChallenges,
    deleteDailyChallenge
};