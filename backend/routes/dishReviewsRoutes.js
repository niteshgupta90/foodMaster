// routes/dishReviewsRoutes.js
const express = require('express');
const router = express.Router();
const dishReviewsController = require('../controllers/dishReviewsController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure multer (reuse your configuration if available)
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, `review-${Date.now()}.${ext}`);
  }
});
const upload = multer({ storage });

// GET reviews for a dish filtered by restaurant
router.get('/', dishReviewsController.getDishReviewsByRestaurant);

// POST a new review for a dish at a specified restaurant, handling an optional file
router.post('/', auth, upload.single('photo'), dishReviewsController.createDishReviewByRestaurant);

module.exports = router;
