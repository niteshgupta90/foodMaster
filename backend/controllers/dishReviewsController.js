// controllers/dishReviewsController.js
const Review = require('../models/Review');
const Dish = require('../models/Dish');
const { recalcRecommendedRestaurants } = require('./dishHelpers');

exports.getDishReviewsByRestaurant = async (req, res) => {
  try {
    const { dishId, restaurantId } = req.query;
    if (!dishId || !restaurantId) {
      return res.status(400).json({ msg: 'dishId and restaurantId are required' });
    }
    const reviews = await Review.find({ dish: dishId, restaurant: restaurantId })
      .populate('user', 'username')
      .populate('restaurant', 'name');
    return res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createDishReviewByRestaurant = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { dish, rating, comment, restaurant } = req.body;
    if (!dish || !rating || !comment || !restaurant) {
      return res.status(400).json({ msg: 'dish, rating, comment, and restaurant are required.' });
    }

    // Handle photo upload if provided.
    if (req.file) {
      const imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
      await Dish.findByIdAndUpdate(dish, {
        $push: { images: { url: imageUrl, filename: req.file.filename } }
      });
    }

    const newReview = new Review({
      user: userId,
      dish,
      restaurant,
      rating,
      comment,
    });
    await newReview.save();

    // Recalculate top three recommended restaurants for this dish.
    await recalcRecommendedRestaurants(dish);

    return res.status(201).json(newReview);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
