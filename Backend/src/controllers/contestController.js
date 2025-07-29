const Contest = require('../models/Contest');
const ContestParticipation = require('../models/ ContestParticipation');
const Problem = require('../models/problem');
const Submission = require('../models/submission');
const User = require('../models/user');

const Createnewcontest = async (req, res) => {
    try {
        const { title, description, startTime, endTime, duration, isPublic, maxParticipants, problems } = req.body;

        if (new Date(startTime) < new Date()) {
            return res.status(400).json({ error: 'Start time must be in the future' });
        }
        if (new Date(endTime) <= new Date(startTime)) {
            return res.status(400).json({ error: 'End time must be after start time' });
        }

        const contest = new Contest({
            title,
            description,
            startTime,
            endTime,
            duration,
            isPublic,
            maxParticipants,
            problems: problems || [],
            createdBy: req.user._id
        });

        await contest.save();
        res.status(201).json(contest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const GetContestDetails = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id)
            .populate('problems.problemId', 'title difficulty points')
            .populate('createdBy', 'username');

        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        res.json(contest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const UpdateContest = async (req, res) => {
    try {
        const { title, description, startTime, endTime, duration, isPublic, maxParticipants } = req.body;

        const contest = await Contest.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        if (new Date(contest.startTime) < new Date()) {
            return res.status(400).json({ error: 'Cannot update a contest that has already started' });
        }

        contest.title = title || contest.title;
        contest.description = description || contest.description;
        contest.startTime = startTime || contest.startTime;
        contest.endTime = endTime || contest.endTime;
        contest.duration = duration || contest.duration;
        contest.isPublic = isPublic !== undefined ? isPublic : contest.isPublic;
        contest.maxParticipants = maxParticipants || contest.maxParticipants;

        await contest.save();
        res.json(contest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const ListAllContests = async (req, res) => {
    try {
        const { filter } = req.query;
        const now = new Date();
        let query = {};

        if (filter === 'upcoming') {
            query.startTime = { $gt: now };
        } else if (filter === 'ongoing') {
            query.startTime = { $lte: now };
            query.endTime = { $gte: now };
        } else if (filter === 'past') {
            query.endTime = { $lt: now };
        }

        let contests = await Contest.find(query)
            .sort({ startTime: 1 })
            .populate('problems.problemId', 'title difficulty');

        const contestIds = contests.map(c => c._id);

        const participantCounts = await ContestParticipation.aggregate([
            { $match: { contestId: { $in: contestIds } } },
            { $group: { _id: "$contestId", count: { $sum: 1 } } }
        ]);

        const participantCountsMap = new Map(
            participantCounts.map(item => [item._id.toString(), item.count])
        );

        let userRegisteredContestIds = new Set();
        if (req.user && req.user._id) {
            const userParticipations = await ContestParticipation.find({ userId: req.user._id, contestId: { $in: contestIds } });
            userRegisteredContestIds = new Set(userParticipations.map(p => p.contestId.toString()));
        }

        contests = contests.map(contest => {
            const contestObj = contest.toObject(); 
            contestObj.participantCount = participantCountsMap.get(contestObj._id.toString()) || 0;
            contestObj.isRegistered = userRegisteredContestIds.has(contestObj._id.toString());
            return contestObj;
        });

        res.json(contests);
    } catch (error) {
        console.error("Error in ListAllContests:", error); 
        res.status(500).json({ error: error.message });
    }
};

const AddProblemToContest = async (req, res) => {
    try {
        const { problemId, points } = req.body;

        const contest = await Contest.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Check if problem already exists in contest
        if (contest.problems.some(p => p.problemId.equals(problemId))) {
            return res.status(400).json({ error: 'Problem already exists in contest' });
        }

        contest.problems.push({ problemId, points });
        await contest.save();

        res.json(contest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const DeleteContest = async (req, res) => {
    try {
        const contest = await Contest.findByIdAndDelete(req.params.id);
        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        await ContestParticipation.deleteMany({ contestId: req.params.id });

        res.json({ message: 'Contest deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const RemoveProblemFromContest = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        if (new Date(contest.startTime) < new Date()) {
            return res.status(400).json({ error: 'Cannot remove problems from a contest that has started' });
        }

        contest.problems = contest.problems.filter(
            p => !p.problemId.equals(req.params.problemId)
        );

        await contest.save();
        res.json(contest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const RegisterForContest = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        // Check if registration is allowed
        if (new Date(contest.startTime) < new Date()) {
            return res.status(400).json({ error: 'Contest has already started' });
        }

        // Check if user already registered
        const existing = await ContestParticipation.findOne({
            contestId: req.params.id,
            userId: req.user._id
        });
        if (existing) {
            return res.status(400).json({ error: 'Already registered for this contest' });
        }

        // Check if contest is full
        if (contest.maxParticipants) {
            const participantCount = await ContestParticipation.countDocuments({
                contestId: req.params.id
            });
            if (participantCount >= contest.maxParticipants) {
                return res.status(400).json({ error: 'Contest is full' });
            }
        }

        const participation = new ContestParticipation({
            contestId: req.params.id,
            userId: req.user._id,
            startTime: contest.startTime
        });

        await participation.save();
        res.status(201).json(participation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const StartContestParticipation = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id)
            .populate('problems.problemId', 'title difficulty points');
        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        // Check if contest is active
        const now = new Date();
        if (now < contest.startTime || now > contest.endTime) {
            return res.status(400).json({ error: 'Contest is not currently active' });
        }

        // Check if user is registered
        const participation = await ContestParticipation.findOne({
            contestId: req.params.id,
            userId: req.user._id
        });
        if (!participation) {
            return res.status(403).json({ error: 'Not registered for this contest' });
        }

        // Calculate time left in minutes
        const timeLeft = Math.floor((contest.endTime - now) / (1000 * 60));

        res.json({
            contest,
            participation,
            timeLeft
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const SubmitSolutionDuringContest = async (req, res) => {
    try {
        const { problemId, code, language } = req.body;
        const contestId = req.params.id;
        const userId = req.user._id;

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        // Check if contest is ongoing
        const now = new Date();
        if (now < contest.startTime || now > contest.endTime) {
            return res.status(400).json({ error: 'Contest is not active' });
        }

        // Check if problem exists in contest
        const contestProblem = contest.problems.find(p => p.problemId.equals(problemId));
        if (!contestProblem) {
            return res.status(404).json({ error: 'Problem not part of this contest' });
        }

        // Check if user is registered
        const participation = await ContestParticipation.findOne({
            contestId,
            userId
        });
        if (!participation) {
            return res.status(403).json({ error: 'Not registered for this contest' });
        }

        // Create submission
        const submission = new Submission({
            problemId,
            userId,
            code,
            language,
            contestId,
            submittedAt: now
        });

        const submissionResult = await processSubmission(submission);

        // Add to participation
        participation.submissions.push({
            problemId,
            submissionId: submission._id,
            timestamp: now,
            points: submissionResult.status === 'Accepted' ? contestProblem.points : 0
        });

        // Update total points
        participation.totalPoints = participation.submissions.reduce(
            (sum, sub) => sum + sub.points, 0
        );

        // Update time taken (in minutes)
        participation.timeTaken = Math.floor(
            (now - participation.startTime) / (1000 * 60)
        );

        await Promise.all([submission.save(), participation.save()]);

        res.json({
            submission,
            participation
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const GetContestLeaderboard = async (req, res) => {
    try {
        const contestId = req.params.id;

        const leaderboard = await ContestParticipation.find({ contestId })
            .sort({ totalPoints: -1, timeTaken: 1 })
            .populate('userId', 'username')
            .limit(100);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function processSubmission(submission) {
    return {
        status: 'Accepted',
        runtime: 100, // ms
        memory: 1024, // KB
        testCases: []
    };
}

module.exports = {
    Createnewcontest,
    ListAllContests,
    GetContestDetails: GetContestDetails,
    UpdateContest,
    AddProblemToContest,
    DeleteContest,
    RemoveProblemFromContest,
    RegisterForContest,
    SubmitSolutionDuringContest,
    StartContestParticipation,
    GetContestLeaderboard
};