// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// POST /api/reviews - create a new review for a dish
router.post('/', auth, reviewController.createReview);

module.exports = router;
