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
const coAdminMiddleware = require("../middleware/coAdminMiddleware");
const userMiddleware = require('../middleware/userMiddleware');


// Admin
contestRoute.post('/',coAdminMiddleware,Createnewcontest)
contestRoute.get('/',userMiddleware,ListAllContests);
contestRoute.get('/:id',userMiddleware,GetContestDetails);
contestRoute.put('/:id',coAdminMiddleware,UpdateContest);
contestRoute.post('/:id/problems',coAdminMiddleware,AddProblemToContest);
contestRoute.delete('/:id', coAdminMiddleware,DeleteContest);
contestRoute.delete('/:id/problems/:problemId',coAdminMiddleware,RemoveProblemFromContest);


// User
contestRoute.post('/:id/register', userMiddleware,RegisterForContest,);
contestRoute.get('/:id/participate', userMiddleware,StartContestParticipation);
contestRoute.post('/:id/submit', userMiddleware,SubmitSolutionDuringContest);
contestRoute.get('/:id/leaderboard', userMiddleware,GetContestLeaderboard);




module.exports = contestRoute;