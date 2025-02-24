const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const auth = require('../middleware/auth');

// GET /api/restaurants - get all or search
router.get('/', restaurantController.getAllRestaurants);

// POST /api/restaurants - (maybe protected for admin or owners)
router.post('/', auth, restaurantController.createRestaurant);

router.get('/near', restaurantController.getRestaurantsNear);

// GET /api/restaurants/:id
router.get('/:id', restaurantController.getRestaurantById);

module.exports = router;
