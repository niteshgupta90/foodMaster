// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }, // NEW FIELD
  comment: String,
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
