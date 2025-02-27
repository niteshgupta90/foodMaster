// controllers/dishHelpers.js
const Dish = require('../models/Dish');
const Review = require('../models/Review');

async function recalcRecommendedRestaurants(dishId) {
  // Fetch all reviews for the given dish and populate the restaurant field (only name is needed)
  const reviews = await Review.find({ dish: dishId }).populate('restaurant', 'name');
  if (!reviews.length) {
    // If no reviews exist, clear recommendedRestaurants
    await Dish.findByIdAndUpdate(dishId, { recommendedRestaurants: [] });
    return [];
  }

  // Group reviews by restaurant
  const groups = {};
  reviews.forEach(review => {
    if (review.restaurant && review.restaurant._id) {
      const restId = review.restaurant._id.toString();
      if (!groups[restId]) {
        groups[restId] = {
          _id: review.restaurant._id,
          name: review.restaurant.name,
          totalRating: 0,
          count: 0,
        };
      }
      groups[restId].totalRating += review.rating;
      groups[restId].count += 1;
    }
  });

  // Convert groups into an array with computed average ratings
  const grouped = Object.values(groups).map(group => ({
    ...group,
    avgRating: group.totalRating / group.count,
  }));

  // Sort: highest average rating, then highest review count, then alphabetically by name
  grouped.sort((a, b) => {
    if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });

  // Select the top three restaurants
  const topThree = grouped.slice(0, 3).map(group => group._id);

  // Update the dish document
  await Dish.findByIdAndUpdate(dishId, { recommendedRestaurants: topThree });

  return topThree;
}

module.exports = { recalcRecommendedRestaurants };
