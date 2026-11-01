// routes/dishReviewsRoutes.js
const express = require("express");
const router = express.Router();
const dishReviewsController = require("../controllers/dishReviewsController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// GET reviews for a dish filtered by restaurant
router.get("/", dishReviewsController.getDishReviewsByRestaurant);

// POST a new review for a dish at a specified restaurant, handling an optional file
router.post(
  "/",
  auth,
  upload.single("photo"),
  dishReviewsController.createDishReviewByRestaurant,
);

module.exports = router;
