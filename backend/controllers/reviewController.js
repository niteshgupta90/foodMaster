// controllers/reviewController.js
const Review = require('../models/Review');
const Dish = require('../models/Dish');

exports.createReview = async (req, res) => {
  try {
    const userId = req.user.userId; // from auth middleware
    const { dish, rating, comment } = req.body;

    // Check dish exists
    const dishDoc = await Dish.findById(dish);
    if (!dishDoc) {
      return res.status(404).json({ msg: 'Dish not found' });
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating)) {
      return res.status(400).json({ msg: 'Invalid rating value' });
    }

    // Create review
    const newReview = new Review({
      user: userId,
      dish,
      rating: parsedRating,
      comment
    });
    await newReview.save();

    // Ensure dishDoc has numeric defaults
    dishDoc.totalRating = dishDoc.totalRating || 0;
    dishDoc.reviewCount = dishDoc.reviewCount || 0;
    
    // Update dish average rating
    // Approach: keep track of totalRating & reviewCount on the dish
    dishDoc.totalRating += rating;
    dishDoc.reviewCount += 1;
    dishDoc.averageRating = dishDoc.reviewCount
      ? dishDoc.totalRating / dishDoc.reviewCount
      : 0;
    await dishDoc.save();

    return res.status(201).json(newReview);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
