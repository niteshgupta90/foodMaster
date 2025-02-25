// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure Multer storage for review photo uploads.
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists and is served as static
  },
  filename: function(req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, `review-${Date.now()}.${ext}`);
  }
});
const upload = multer({ storage });

// Use upload.single('photo') so that the file comes in as req.file.
router.post('/', auth, upload.single('photo'), reviewController.createReview);

module.exports = router;
