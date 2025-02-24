const Restaurant = require('../models/Restaurant');

exports.getAllRestaurants = async (req, res) => {
  try {
    // Optional: handle query params for filtering or searching
    const restaurants = await Restaurant.find();
    return res.json(restaurants);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.createRestaurant = async (req, res) => {
  try {
    const { name, address, location } = req.body;
    const newRestaurant = new Restaurant({ name, address, location });
    const savedRestaurant = await newRestaurant.save();
    return res.status(201).json(savedRestaurant);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    return res.json(restaurant);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// controllers/restaurantController.js
exports.getRestaurantsNear = async (req, res) => {
  try {
    const { lat, lon } = req.query; // user passes lat & lon
    
    // Convert lat/lon to numbers
    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    // If lat/lon are missing or invalid, handle that
    if (isNaN(userLat) || isNaN(userLon)) {
      return res.status(400).json({ msg: 'Invalid coordinates' });
    }

    // Geo query with $near
    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [userLon, userLat] },
          $maxDistance: 5000 // for example, 5km radius
        }
      }
    });

    // Return sorted by distance (if you have an index on location)
    return res.json(restaurants);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

