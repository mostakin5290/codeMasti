const express = require('express');
const contestRoute = express.Router();
const {Createnewcontest,
    ListAllContests,
    GetContestDetails,
    UpdateContest,
    AddProblemToContest,
    DeleteContest,
    RemoveProblemFromContest,
    RegisterForContest,
    SubmitSolutionDuringContest,
    StartContestParticipation,
    GetContestLeaderboard} = require('../controllers/contestController')
const adminMiddleware = require("../middleware/adminMiddleware");
const userMiddleware = require('../middleware/userMiddleware');


// Admin
contestRoute.post('/',adminMiddleware,Createnewcontest)
contestRoute.get('/',adminMiddleware,ListAllContests);
contestRoute.get('/:id',adminMiddleware,GetContestDetails);
contestRoute.put('/:id',adminMiddleware,UpdateContest);
contestRoute.post('/:id/problems',adminMiddleware,AddProblemToContest);
contestRoute.delete('/:id', adminMiddleware,DeleteContest);
contestRoute.delete('/:id/problems/:problemId',adminMiddleware,RemoveProblemFromContest);


// User
contestRoute.post('/:id/register', userMiddleware,RegisterForContest,);
contestRoute.get('/:id/participate', userMiddleware,StartContestParticipation);
contestRoute.post('/:id/submit', userMiddleware,SubmitSolutionDuringContest);
contestRoute.get('/:id/leaderboard', userMiddleware,GetContestLeaderboard);




module.exports = contestRoute;