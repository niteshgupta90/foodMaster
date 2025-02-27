// controllers/reviewController.js
const Review = require('../models/Review');
const Dish = require('../models/Dish');
const { recalcRecommendedRestaurants } = require('./dishHelpers');

async function updateDishRecommendedRestaurant(dishId) {
  try {
    // Fetch all reviews for this dish and populate the restaurant (only name is needed)
    const reviews = await Review.find({ dish: dishId }).populate('restaurant', 'name');
    if (reviews.length === 0) return;

    // Group reviews by restaurant
    const groups = {};
    reviews.forEach(review => {
      if (review.restaurant && review.restaurant._id) {
        const rid = review.restaurant._id.toString();
        if (!groups[rid]) {
          groups[rid] = { 
            restaurant: review.restaurant, 
            totalRating: 0, 
            count: 0 
          };
        }
        groups[rid].totalRating += review.rating;
        groups[rid].count += 1;
      }
    });

    // Convert groups into an array and compute average rating
    const groupArr = Object.values(groups).map(group => ({
      restaurant: group.restaurant,
      avgRating: group.totalRating / group.count,
      count: group.count
    }));

    // Sort the groups:
    // 1. Descending by average rating
    // 2. Descending by review count if average is tied
    // 3. Ascending alphabetically by restaurant name if still tied
    groupArr.sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
      if (b.count !== a.count) return b.count - a.count;
      return a.restaurant.name.localeCompare(b.restaurant.name);
    });

    const recommended = groupArr[0];
    if (recommended) {
      // Update the dish's recommendedRestaurant field if different
      const dish = await Dish.findById(dishId);
      if (!dish.recommendedRestaurant || dish.recommendedRestaurant.toString() !== recommended.restaurant._id.toString()) {
        dish.recommendedRestaurant = recommended.restaurant._id;
        await dish.save();
      }
    }
  } catch (err) {
    console.error('Error updating recommended restaurant:', err);
  }
}

exports.createReview = async (req, res) => {
  try {
    const userId = req.user.userId; // from auth middleware
    // Expecting: dish, rating, comment, restaurant (the restaurant source for this review)
    const { dish: dishId, rating, comment, restaurant } = req.body;
    
      // Ensure the restaurant field is provided
      if (!restaurant) {
        return res.status(400).json({ msg: "Restaurant source is required for a review." });
      }

      // If a photo is uploaded with the review, handle it.
      if (req.file) {
        // Build the image URL. Adjust the base URL as needed.
        const imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
        
        // Update the dish document's images array.
        await Dish.findByIdAndUpdate(dishId, { 
          $push: { images: { url: imageUrl, filename: req.file.filename } } 
        });
      }

    // Check dish exists
    const dishDoc = await Dish.findById(dishId);
    if (!dishDoc) {
      return res.status(404).json({ msg: 'Dish not found' });
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating)) {
      return res.status(400).json({ msg: 'Invalid rating value' });
    }

    // Create the new review (ensure your Review model includes the restaurant field)
    const newReview = new Review({
      dish: dishId,
      rating,
      comment,
      restaurant, // restaurant source selected by the user
      user: req.user.userId, // assuming you set req.user in your auth middleware
    });
    const savedReview = await newReview.save();

    // Update the dish's recommended restaurant based on all reviews
    await recalcRecommendedRestaurants(dishId);

    // Ensure dishDoc has numeric defaults
    dishDoc.totalRating = dishDoc.totalRating || 0;
    dishDoc.reviewCount = dishDoc.reviewCount || 0;
    
    // Update dish average rating
    // Approach: keep track of totalRating & reviewCount on the dish
    dishDoc.totalRating += rating;
    dishDoc.reviewCount += 1;
    dishDoc.averageRating = dishDoc.reviewCount
      ? Math.min(dishDoc.totalRating / dishDoc.reviewCount, 5) // Ensure averageRating does not exceed 5
      : 0;
    await dishDoc.save();

    return res.status(201).json(savedReview);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
