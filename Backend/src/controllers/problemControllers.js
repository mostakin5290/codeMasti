const { getLanguageById, submitBatch, submitToken } = require('../utils/problemUtils');
const Problem = require('../models/problem');
const Submission = require('../models/submission'); 
const mongoose = require('mongoose');
const Video = require('../models/video')
const DailyChallengeHistory = require('../models/DailyChallengeHistory');
const User = require('../models/user');

const createProblem = async (req, res) => {
    try {
        const {
            title, description, difficulty, tags,
            visibleTestCases, hiddenTestCases, starterCode, referenceSolution,
            executionConfig
        } = req.body;

        if (!executionConfig.inputOutputConfig) {
            return res.status(400).json({ message: "Problem must include complete execution configuration (inputOutputConfig, wrapperTemplates)." });
        }

        const allTestCases = [...(visibleTestCases || []), ...(hiddenTestCases || [])];
        if (allTestCases.length === 0) {
            return res.status(400).json({ message: "Problem must have at least one test case (visible or hidden)." });
        }

        const tempProblem = new Problem({
            title, description, difficulty, tags,
            visibleTestCases, hiddenTestCases, starterCode, referenceSolution,
            executionConfig,
            problemCreator: req.user._id
        });

        const problem = await Problem.create({
            title, description, difficulty, tags,
            visibleTestCases, hiddenTestCases, starterCode, referenceSolution,
            executionConfig,
            problemCreator: req.user._id 
        });

        res.status(201).json({ message: 'Problem created successfully', problem });
    }
    catch (err) {
        console.error("Error in createProblem:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation failed", error: err.message });
        }
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
        executionConfig 
    } = req.body;

    try {
        if (!id) {
            return res.status(400).json({ message: "Problem ID is required." });
        }

        const existingProblem = await Problem.findById(id);
        if (!existingProblem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        const updatedProblemCandidate = new Problem({
            ...existingProblem.toObject(), 
            ...req.body,                  
            _id: existingProblem._id      
        });

        const allTestCases = [...(updatedProblemCandidate.visibleTestCases || []), ...(updatedProblemCandidate.hiddenTestCases || [])];
        if (allTestCases.length === 0) {
            return res.status(400).json({ message: "Problem must have at least one test case (visible or hidden)." });
        }


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
        const problem = await Problem.findById(id);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        const video = await Video.findOne({ problemId: id }).lean(); 

        if (video) {
            problem.secureUrl = video.secureUrl;
            problem.cloudinaryPublicId = video.cloudinaryPublicId;
            problem.thumbnailUrl = video.thumbnailUrl;
            problem.duration = video.duration;
            problem.videoSolutionId = video._id;
        }
        res.status(200).json(problem);
    } 
    catch (err) {
        res.status(500).json({ message: 'Error fetching problem', error: err.message });
    }
};


const getAllProblem = async (req, res) => {
    try {
        const userId = req.user ? new mongoose.Types.ObjectId(req.user._id) : null;

        const problems = await Problem.aggregate([
            {
                $lookup: {
                    from: 'submissions', 
                    localField: '_id',
                    foreignField: 'problemId',
                    as: 'submissions'
                }
            },
            {
                $lookup: {
                    from: 'Videos', 
                    localField: '_id',
                    foreignField: 'problemId',
                    as: 'Videos'
                }
            },
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
                    Video: { $arrayElemAt: ['$Videos', 0] } // Gets the first video if multiple exist
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    difficulty: 1,
                    tags: 1,
                    status: 1,
                    acceptance: 1,
                    'Video._id': 1, 
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

const getProblemByIdForAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ message: "Invalid ID provided." });
        }

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

// const getAllScheduledAndHistoricalDailyChallenges = async (req, res) => {
//     try {
//         // Fetch all historical challenges from the new collection
//         const historicalChallenges = await DailyChallengeHistory.find()
//             .populate('problemId', 'title difficulty tags') // Populate problem details for display
//             .sort({ challengeDate: -1 }); // Latest dates first

//         // Get the currently active daily challenge (from the Problem model)
//         const currentActiveChallenge = await Problem.findOne({ isDailyChallenge: true })
//             .select('title difficulty dailyChallengeDate _id');

//         const combinedChallenges = [];
//         const seenDates = new Set(); // To prevent duplicates in case the active challenge also has a history record

//         // Add historical challenges to the list
//         historicalChallenges.forEach(hist => {
//             if (hist.problemId) { // Ensure problemId is populated
//                 const normalizedDate = new Date(hist.challengeDate);
//                 normalizedDate.setUTCHours(0, 0, 0, 0); // Normalize history date
//                 const dateKey = normalizedDate.toISOString();

//                 if (!seenDates.has(dateKey)) {
//                     combinedChallenges.push({
//                         _id: hist._id, // This is the ID of the DailyChallengeHistory record (for deletion/editing)
//                         problemId: hist.problemId._id, // The ID of the actual problem
//                         title: hist.problemId.title,
//                         difficulty: hist.problemId.difficulty,
//                         dailyChallengeDate: hist.challengeDate,
//                         isCurrentActive: false // History records are not 'active'
//                     });
//                     seenDates.add(dateKey);
//                 }
//             }
//         });

//         // Add the current active challenge if it exists and is not already in the combined list (e.g., just set it)
//         if (currentActiveChallenge && currentActiveChallenge.dailyChallengeDate) {
//             const currentChallengeDate = new Date(currentActiveChallenge.dailyChallengeDate);
//             currentChallengeDate.setUTCHours(0, 0, 0, 0); // Normalize active challenge date
//             const dateKey = currentChallengeDate.toISOString();

//             if (!seenDates.has(dateKey)) {
//                 combinedChallenges.push({
//                     _id: currentActiveChallenge._id, // For current active, _id is the problem's ID
//                     problemId: currentActiveChallenge._id,
//                     title: currentActiveChallenge.title,
//                     difficulty: currentActiveChallenge.difficulty,
//                     dailyChallengeDate: currentActiveChallenge.dailyChallengeDate,
//                     isCurrentActive: true // This one is the current active
//                 });
//             } else {
//                 // If a history record already exists for this date, ensure its 'isCurrentActive' status is true
//                 const existingIndex = combinedChallenges.findIndex(c =>
//                     new Date(c.dailyChallengeDate).setUTCHours(0,0,0,0) === currentChallengeDate.getTime()
//                 );
//                 if (existingIndex !== -1) {
//                     combinedChallenges[existingIndex].isCurrentActive = true;
//                     // Also ensure its _id is the history id if it was a history record
//                     // And problemId is consistent.
//                     // If combinedChallenges[existingIndex]._id was problem ID, keep it.
//                     // If it was history ID, keep it. This relies on frontend using problemId for selection.
//                 }
//             }
//         }

//         // Final sort by date, latest first for admin display
//         combinedChallenges.sort((a, b) => new Date(b.dailyChallengeDate).getTime() - new Date(a.dailyChallengeDate).getTime());

//         res.status(200).json(combinedChallenges);
//     } catch (err) {
//         console.error("Error fetching all daily challenge history:", err);
//         res.status(500).json({ message: "Error fetching daily challenge history", error: err.message });
//     }
// };


const getTodayChallenge = async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); // Normalize to start of today UTC

        let challengeProblem = null;
        let challengeHistoryEntry = null;

        // 1. Try to find today's challenge from DailyChallengeHistory
        challengeHistoryEntry = await DailyChallengeHistory.findOne({ challengeDate: today });

        if (challengeHistoryEntry) {
            // 2. If an entry exists in history, fetch the actual problem details
            challengeProblem = await Problem.findById(challengeHistoryEntry.problemId)
                .select('-hiddenTestCases -referenceSolution'); // Exclude sensitive data for users

            if (!challengeProblem) {
                // Scenario: A problem was scheduled, but then deleted.
                console.warn(`Problem ${challengeHistoryEntry.problemId} not found for daily challenge on ${today.toISOString().split('T')[0]}. Removing history entry.`);
                await DailyChallengeHistory.deleteOne({ _id: challengeHistoryEntry._id });
                // Fall through to return 404
            } else {
                // 3. This is the activation step: Ensure this problem is marked as the *active*
                // daily challenge on the Problem model, and all others are unset.
                // This handles daily rollover and manual unsetting/re-setting.
                if (!challengeProblem.isDailyChallenge ||
                    !challengeProblem.dailyChallengeDate ||
                    new Date(challengeProblem.dailyChallengeDate).getTime() !== today.getTime()) {

                    // First, unset the 'isDailyChallenge' flag for any other problem
                    // that might still have it set (e.g., from a previous day or a manual override).
                    await Problem.updateMany(
                        { isDailyChallenge: true, _id: { $ne: challengeProblem._id } }, // Exclude the current problem
                        { $set: { isDailyChallenge: false, dailyChallengeDate: null } }
                    );

                    // Then, set the 'isDailyChallenge' flag and date for today's challenge.
                    await Problem.findByIdAndUpdate(challengeProblem._id, {
                        $set: { isDailyChallenge: true, dailyChallengeDate: today }
                    });

                    // Update the in-memory object for the current request's response
                    challengeProblem.isDailyChallenge = true;
                    challengeProblem.dailyChallengeDate = today;
                }
            }
        } else {
            // If no history entry for today, ensure NO problem is marked as the current daily challenge.
            // This cleans up old active challenges if the admin hasn't scheduled one for today.
            await Problem.updateMany(
                { isDailyChallenge: true },
                { $set: { isDailyChallenge: false, dailyChallengeDate: null } }
            );
        }

        if (!challengeProblem) {
            return res.status(404).json({
                message: "No daily challenge found for today",
                suggestion: "Check back tomorrow or contact admin"
            });
        }

        // Fetch user's submission status and streak (unchanged logic)
        const submission = req.user ? await Submission.findOne({
            userId: req.user._id,
            problemId: challengeProblem._id,
            status: 'Accepted'
        }) : null;

        res.status(200).json({
            challenge: challengeProblem,
            alreadySolved: !!submission,
            streak: req.user?.dailyChallenges?.currentStreak || 0
        });
    } catch (err) {
        console.error("Error fetching today's challenge:", err);
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
        todayStart.setHours(0, 0, 0, 0); 

        const challenges = await Problem.find({
            isDailyChallenge: true,
            dailyChallengeDate: { $gte: todayStart } 
        })
            .sort({ dailyChallengeDate: -1 }) 
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
        const { problemId, date } = req.body;

        if (!problemId || !date) {
            return res.status(400).json({ message: "Problem ID and date are required" });
        }

        const targetDate = new Date(date);
        targetDate.setUTCHours(0, 0, 0, 0); 
        console.log(targetDate);
        
        // 1. Validate if the problem exists
        const problemToSet = await Problem.findById(problemId);
        if (!problemToSet) {
            return res.status(404).json({ message: "Problem not found." });
        }

        // 2. Create or update the DailyChallengeHistory entry for the target date.
        // This is the source of truth for scheduled daily challenges.
        // This part handles both "add" and "modify" functionality for a given date.
        const historyEntry = await DailyChallengeHistory.findOneAndUpdate(
            { challengeDate: targetDate },
            {
                problemId: problemId,
                title: problemToSet.title,
                difficulty: problemToSet.difficulty
            },
            { upsert: true, new: true, runValidators: true } // upsert: create if not exists, new: return updated doc
        );

        // IMPORTANT CHANGE: We are intentionally NOT setting isDailyChallenge:true on the Problem model here.
        // That flag will now be managed by the getTodayChallenge function when the date becomes current.
        // This solves the problem of a newly scheduled challenge for a future date removing the current/previous one.

        res.status(200).json({
            message: `Daily challenge scheduled successfully for ${targetDate.toISOString().split('T')[0]}`,
            challengeTitle: problemToSet.title,
            date: targetDate,
            historyEntryId: historyEntry._id
        });
    } catch (err) {
        console.error("Error setting daily challenge:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation failed", error: err.message });
        }
        if (err.code === 11000) {
             return res.status(409).json({ message: "A daily challenge is already set for this date. Use edit or choose another date.", error: err.message });
        }
        res.status(500).json({
            message: "Error setting daily challenge",
            error: err.message
        });
    }
};

const deleteDailyChallenge = async (req, res) => {
    const { id: historyRecordId } = req.params; // Expecting history record ID

    try {
        if (!historyRecordId) {
            return res.status(400).json({ message: "Daily challenge history record ID is required." });
        }

        // 1. Delete the record from DailyChallengeHistory
        const deletedHistoryEntry = await DailyChallengeHistory.findByIdAndDelete(historyRecordId);

        if (!deletedHistoryEntry) {
            return res.status(404).json({ message: "Daily challenge history record not found." });
        }

        // 2. If the deleted history entry was for *today's date*,
        // and its associated problem was currently marked as active for today, unset that problem.
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const deletedChallengeDate = new Date(deletedHistoryEntry.challengeDate);
        deletedChallengeDate.setUTCHours(0, 0, 0, 0);

        if (deletedChallengeDate.getTime() === today.getTime()) {
            const associatedProblem = await Problem.findById(deletedHistoryEntry.problemId);
            // Only unset if the problem currently holds the 'isDailyChallenge' flag for TODAY
            if (associatedProblem && associatedProblem.isDailyChallenge &&
                new Date(associatedProblem.dailyChallengeDate).getTime() === today.getTime()) {
                await Problem.findByIdAndUpdate(
                    associatedProblem._id,
                    { $set: { isDailyChallenge: false, dailyChallengeDate: null } }
                );
            }
        }

        res.status(200).json({
            message: "Daily challenge record removed successfully.",
            deletedRecord: deletedHistoryEntry
        });
    } catch (err) {
        console.error("Error removing daily challenge record:", err);
        res.status(500).json({
            message: "Error removing daily challenge record.",
            error: err.message
        });
    }
};


const getAllScheduledAndHistoricalDailyChallenges = async (req, res) => {
    try {
        const historicalChallenges = await DailyChallengeHistory.find()
            .populate('problemId', 'title difficulty tags') // Populate problem details for display
            .sort({ challengeDate: -1 }); // Latest dates first

        const currentActiveChallenge = await Problem.findOne({ isDailyChallenge: true })
            .select('title difficulty dailyChallengeDate _id');

        const combinedChallenges = [];
        const seenDates = new Set(); // To prevent duplicates in case the active challenge also has a history record

        historicalChallenges.forEach(hist => {
            if (hist.problemId) { // Ensure problemId is populated
                const normalizedDate = new Date(hist.challengeDate);
                normalizedDate.setUTCHours(0, 0, 0, 0); // Normalize history date
                const dateKey = normalizedDate.toISOString();

                if (!seenDates.has(dateKey)) {
                    combinedChallenges.push({
                        _id: hist._id, // This is the ID of the DailyChallengeHistory record (for deletion/editing)
                        problemId: hist.problemId._id, // The ID of the actual problem
                        title: hist.problemId.title,
                        difficulty: hist.problemId.difficulty,
                        dailyChallengeDate: hist.challengeDate,
                        isCurrentActive: false, // History records are not 'active'
                        tags: hist.problemId.tags // Include tags
                    });
                    seenDates.add(dateKey);
                }
            }
        });

        if (currentActiveChallenge && currentActiveChallenge.dailyChallengeDate) {
            const currentChallengeDate = new Date(currentActiveChallenge.dailyChallengeDate);
            currentChallengeDate.setUTCHours(0, 0, 0, 0); // Normalize active challenge date
            const dateKey = currentChallengeDate.toISOString();

            if (!seenDates.has(dateKey)) {
                const fullProblemDetails = await Problem.findById(currentActiveChallenge._id).select('title difficulty tags');
                if (fullProblemDetails) {
                    combinedChallenges.push({
                        _id: currentActiveChallenge._id, // For current active, _id is the problem's ID
                        problemId: currentActiveChallenge._id,
                        title: fullProblemDetails.title,
                        difficulty: fullProblemDetails.difficulty,
                        dailyChallengeDate: currentActiveChallenge.dailyChallengeDate,
                        isCurrentActive: true, // This one is the current active
                        tags: fullProblemDetails.tags // Include tags
                    });
                }
            } else {
                const existingIndex = combinedChallenges.findIndex(c =>
                    new Date(c.dailyChallengeDate).setUTCHours(0, 0, 0, 0) === currentChallengeDate.getTime()
                );
                if (existingIndex !== -1) {
                    combinedChallenges[existingIndex].isCurrentActive = true;
                }
            }
        }

        combinedChallenges.sort((a, b) => new Date(b.dailyChallengeDate).getTime() - new Date(a.dailyChallengeDate).getTime());

        res.status(200).json(combinedChallenges);
    } catch (err) {
        console.error("Error fetching all daily challenge history:", err);
        res.status(500).json({ message: "Error fetching daily challenge history", error: err.message });
    }
};

const getDailyChallengeCalendarData = async (req, res) => {
    try {
        const userId = req.user._id; // Get authenticated user ID

        const historicalChallenges = await DailyChallengeHistory.find({})
            .populate('problemId', 'title difficulty tags') // Populate problem details
            .lean(); // Use lean() for better performance as we are modifying

        const user = await User.findById(userId)
            .select('dailyChallenges.completed')
            .lean();

        const userCompletedChallengesMap = new Map();
        if (user && user.dailyChallenges && user.dailyChallenges.completed) {
            user.dailyChallenges.completed.forEach(completion => {
                const dateKey = new Date(completion.date).setUTCHours(0, 0, 0, 0);
                const problemId = completion.challengeId.toString();
                userCompletedChallengesMap.set(`${problemId}-${dateKey}`, true);
            });
        }

        const calendarData = historicalChallenges.map(challenge => {
            const challengeDateKey = new Date(challenge.challengeDate).setUTCHours(0, 0, 0, 0);
            const isSolved = userCompletedChallengesMap.has(`${challenge.problemId._id.toString()}-${challengeDateKey}`);

            return {
                _id: challenge._id, // History record ID
                problemId: challenge.problemId, // Populated problem object
                dailyChallengeDate: challenge.challengeDate,
                title: challenge.problemId.title,
                difficulty: challenge.problemId.difficulty,
                tags: challenge.problemId.tags,
                isSolved: isSolved // Add solved status for the user
            };
        });

        res.status(200).json(calendarData);

    } catch (err) {
        console.error("Error fetching daily challenge calendar data:", err);
        res.status(500).json({
            message: "Error fetching daily challenge calendar data",
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
    // getPreviousChallenges,
    deleteDailyChallenge,
    getAllScheduledAndHistoricalDailyChallenges,
    getDailyChallengeCalendarData
};