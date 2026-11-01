const mongoose = require("mongoose");
const Dish = require("../models/Dish");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const { recalcRecommendedRestaurants } = require("./dishHelpers");
exports.createReview = async (req, res) => {
  try {
    const { dish, restaurant, comment } = req.body;
    const rating = Number(req.body.rating);
    if (
      ![dish, restaurant].every((x) => mongoose.isObjectIdOrHexString(x)) ||
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 5 ||
      typeof comment !== "string" ||
      !comment.trim()
    )
      return res
        .status(400)
        .json({
          msg: "A valid dish, restaurant, rating (1–5), and comment are required",
        });
    if (
      !(await Dish.exists({ _id: dish })) ||
      !(await Restaurant.exists({ _id: restaurant }))
    )
      return res.status(404).json({ msg: "Dish or restaurant not found" });
    const review = await Review.create({
      dish,
      restaurant,
      rating,
      comment: comment.trim(),
      user: req.user.userId,
    });
    if (req.file)
      await Dish.findByIdAndUpdate(dish, {
        $push: {
          images: {
            url: `/uploads/${req.file.filename}`,
            filename: req.file.filename,
          },
        },
      });
    await recalcRecommendedRestaurants(dish);
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Unable to save review" });
  }
};
