// models/Dish.js
const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  // e.g., recommended restaurant (reference to Restaurant model)
  recommendedRestaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant' 
  },
  description: String,
  // Additional tags: vegetarian, vegan, containsEgg, etc.
  isVegetarian: { type: Boolean, default: true },
  price: Number,
  // Keep an average rating for quick lookups
  averageRating: { type: Number, default: 0, min: 0, max: 5,},
  totalRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  // For storing images:
  images: [
    {
      url: { type: String, required: true }, // could be local path or remote URL
      filename: String, // optional, if needed
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Dish', dishSchema);
