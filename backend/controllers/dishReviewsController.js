const mongoose = require("mongoose");
// controllers/dishReviewsController.js
const Review = require("../models/Review");
const Dish = require("../models/Dish");
const { recalcRecommendedRestaurants } = require("./dishHelpers");

exports.getDishReviewsByRestaurant = async (req, res) => {
  try {
    const { dishId, restaurantId } = req.query;
    if (
      ![dishId, restaurantId].every((x) => mongoose.isObjectIdOrHexString(x))
    ) {
      return res
        .status(400)
        .json({ msg: "dishId and restaurantId are required" });
    }
    const reviews = await Review.find({
      dish: dishId,
      restaurant: restaurantId,
    })
      .populate("user", "username")
      .populate("restaurant", "name");
    return res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.createDishReviewByRestaurant =
  require("./reviewController").createReview;
