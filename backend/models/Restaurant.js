// models/Restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
  },
  // NEW FIELDS
  placeId: { type: String, unique: true, sparse: true }, 
  photoRef: String,
  // Possibly store overall rating or maintain separate rating doc
}, { timestamps: true });

// For geospatial queries
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
