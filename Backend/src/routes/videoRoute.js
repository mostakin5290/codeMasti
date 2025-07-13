const express = require('express');
const videoRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware")
const {generateUploadSignature,saveVideoMetadata,deleteVideo} = require("../controllers/videoController")


videoRouter.get("/create/:problemId", adminMiddleware, generateUploadSignature);
videoRouter.post("/save", adminMiddleware, saveVideoMetadata);
// videoRouter.delete("/delete/:problemId", adminMiddleware, deleteVideo);
videoRouter.delete("/delete/:videoId", adminMiddleware, deleteVideo);
module.exports = videoRouter;