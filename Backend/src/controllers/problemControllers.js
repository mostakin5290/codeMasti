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
        const problem = await Problem.findById(id).lean();

        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        const video = await Video.findOne({ problemId: id }).lean();

        if (video) {
            problem.solutionVideo = video;
        } else {
            problem.solutionVideo = null;
        }

        res.status(200).json(problem);
    }
    catch (err) {
        console.error('Error fetching problem by ID:', err);
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
                    from: 'videos',
                    localField: '_id',
                    foreignField: 'problemId',
                    as: 'videos'
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
                    solutionVideo: { $arrayElemAt: ['$videos', 0] }
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
                    'solutionVideo._id': 1,
                    'solutionVideo.cloudinaryPublicId': 1,
                    'solutionVideo.secureUrl': 1,
                    'solutionVideo.thumbnailUrl': 1,
                    'solutionVideo.duration': 1
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

const getTodayChallenge = async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let challengeProblem = null;
        let challengeHistoryEntry = null;

        challengeHistoryEntry = await DailyChallengeHistory.findOne({ challengeDate: today });

        if (challengeHistoryEntry) {
            challengeProblem = await Problem.findById(challengeHistoryEntry.problemId)
                .select('-hiddenTestCases -referenceSolution'); // Exclude sensitive data for users

            if (!challengeProblem) {
                console.warn(`Problem ${challengeHistoryEntry.problemId} not found for daily challenge on ${today.toISOString().split('T')[0]}. Removing history entry.`);
                await DailyChallengeHistory.deleteOne({ _id: challengeHistoryEntry._id });
            } else {
                if (!challengeProblem.isDailyChallenge ||
                    !challengeProblem.dailyChallengeDate ||
                    new Date(challengeProblem.dailyChallengeDate).getTime() !== today.getTime()) {

                    await Problem.updateMany(
                        { isDailyChallenge: true, _id: { $ne: challengeProblem._id } }, 
                        { $set: { isDailyChallenge: false, dailyChallengeDate: null } }
                    );

                    await Problem.findByIdAndUpdate(challengeProblem._id, {
                        $set: { isDailyChallenge: true, dailyChallengeDate: today }
                    });

                    challengeProblem.isDailyChallenge = true;
                    challengeProblem.dailyChallengeDate = today;
                }
            }
        } else {
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

        const problemToSet = await Problem.findById(problemId);
        if (!problemToSet) {
            return res.status(404).json({ message: "Problem not found." });
        }

        const historyEntry = await DailyChallengeHistory.findOneAndUpdate(
            { challengeDate: targetDate },
            {
                problemId: problemId,
                title: problemToSet.title,
                difficulty: problemToSet.difficulty
            },
            { upsert: true, new: true, runValidators: true }
        );


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
    const { id: historyRecordId } = req.params;

    try {
        if (!historyRecordId) {
            return res.status(400).json({ message: "Daily challenge history record ID is required." });
        }

        const deletedHistoryEntry = await DailyChallengeHistory.findByIdAndDelete(historyRecordId);

        if (!deletedHistoryEntry) {
            return res.status(404).json({ message: "Daily challenge history record not found." });
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const deletedChallengeDate = new Date(deletedHistoryEntry.challengeDate);
        deletedChallengeDate.setUTCHours(0, 0, 0, 0);

        if (deletedChallengeDate.getTime() === today.getTime()) {
            const associatedProblem = await Problem.findById(deletedHistoryEntry.problemId);
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
            .populate('problemId', 'title difficulty tags')
            .sort({ challengeDate: -1 });

        const currentActiveChallenge = await Problem.findOne({ isDailyChallenge: true })
            .select('title difficulty dailyChallengeDate _id');

        const combinedChallenges = [];
        const seenDates = new Set();

        historicalChallenges.forEach(hist => {
            if (hist.problemId) {
                const normalizedDate = new Date(hist.challengeDate);
                normalizedDate.setUTCHours(0, 0, 0, 0);
                const dateKey = normalizedDate.toISOString();

                if (!seenDates.has(dateKey)) {
                    combinedChallenges.push({
                        _id: hist._id,
                        problemId: hist.problemId._id,
                        title: hist.problemId.title,
                        difficulty: hist.problemId.difficulty,
                        dailyChallengeDate: hist.challengeDate,
                        isCurrentActive: false,
                        tags: hist.problemId.tags
                    });
                    seenDates.add(dateKey);
                }
            }
        });

        if (currentActiveChallenge && currentActiveChallenge.dailyChallengeDate) {
            const currentChallengeDate = new Date(currentActiveChallenge.dailyChallengeDate);
            currentChallengeDate.setUTCHours(0, 0, 0, 0);
            const dateKey = currentChallengeDate.toISOString();

            if (!seenDates.has(dateKey)) {
                const fullProblemDetails = await Problem.findById(currentActiveChallenge._id).select('title difficulty tags');
                if (fullProblemDetails) {
                    combinedChallenges.push({
                        _id: currentActiveChallenge._id,
                        problemId: currentActiveChallenge._id,
                        title: fullProblemDetails.title,
                        difficulty: fullProblemDetails.difficulty,
                        dailyChallengeDate: currentActiveChallenge.dailyChallengeDate,
                        isCurrentActive: true,
                        tags: fullProblemDetails.tags
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
        const userId = req.user._id;

        const historicalChallenges = await DailyChallengeHistory.find({})
            .populate('problemId', 'title difficulty tags')
            .lean();

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
                _id: challenge._id,
                problemId: challenge.problemId,
                dailyChallengeDate: challenge.challengeDate,
                title: challenge.problemId.title,
                difficulty: challenge.problemId.difficulty,
                tags: challenge.problemId.tags,
                isSolved: isSolved
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
    deleteDailyChallenge,
    getAllScheduledAndHistoricalDailyChallenges,
    getDailyChallengeCalendarData
};