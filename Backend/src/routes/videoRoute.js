const express = require('express');
const videoRouter = express.Router();
const coAdminMiddleware = require("../middleware/coAdminMiddleware")
const {generateUploadSignature,saveVideoMetadata,deleteVideo} = require("../controllers/videoController")


videoRouter.get("/create/:problemId", coAdminMiddleware, generateUploadSignature);
videoRouter.post("/save", coAdminMiddleware, saveVideoMetadata);
// videoRouter.delete("/delete/:problemId", coAdminMiddleware, deleteVideo);
videoRouter.delete("/delete/:videoId", coAdminMiddleware, deleteVideo);
module.exports = videoRouter;