const Dish = require('../models/Dish');
const Review = require('../models/Review');

exports.getDishes = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    let query = {};
    if (restaurantId) {
      query.restaurant = restaurantId;
    }
    const dishes = await Dish.find(query)
    .populate('restaurant')
    .populate('recommendedRestaurant');

    return res.json(dishes);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.createDish = async (req, res) => {
  try {
    const { restaurant, name, isVegetarian, price } = req.body;
    const newDish = new Dish({ restaurant, recommendedRestaurant, name, isVegetarian, price });
    const savedDish = await newDish.save();
    return res.status(201).json(savedDish);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getDishById = async (req, res) => {
  try {
    // 1. Get the Dish itself
    const dish = await Dish.findById(req.params.id)
      .populate('restaurant')
      .populate('recommendedRestaurant');  // e.g., if you want restaurant data

    if (!dish) {
      return res.status(404).json({ msg: 'Dish not found' });
    }

    // 2. Fetch all reviews for this dish
    const reviews = await Review.find({ dish: dish._id })
      .populate('user', 'username'); 
      // ^ This ensures `reviews[x].user` is replaced by the user object, 
      //   showing only 'username' field if you want

    // 3. Merge dish object with reviews into a single response
    const dishData = { ...dish.toObject(), reviews };

    return res.json(dishData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};


exports.uploadDishImage = async (req, res) => {
  try {
    const dishId = req.params.id;
    const file = req.file; // Multer attaches this
    if (!file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // e.g., local path: 'uploads/dish-1662121212122.jpg'
    const imageUrl = `http://localhost:5001/${file.path}`; 
    // Or just `file.path` if you plan to handle it differently

    // Fetch dish
    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ msg: 'Dish not found' });
    }

    // Push the new image info into the array
    dish.images.push({ url: imageUrl, filename: file.filename });

    await dish.save();
    return res.json(dish);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};