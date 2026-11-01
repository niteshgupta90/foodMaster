// routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// Use upload.single('photo') so that the file comes in as req.file.
router.post("/", auth, upload.single("photo"), reviewController.createReview);

module.exports = router;
