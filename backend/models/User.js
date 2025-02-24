// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // For dietary preferences, e.g., vegetarian, vegan, etc.
  preference: { type: String, default: 'vegetarian' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
