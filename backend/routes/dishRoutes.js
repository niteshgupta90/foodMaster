const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const auth = require('../middleware/auth');
// Import multer
const multer = require('multer');

// Configure multer storage (local folder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // store in /uploads at project root
  },
  filename: function (req, file, cb) {
    // e.g., dish-1662121212122.jpg
    const ext = file.originalname.split('.').pop();
    cb(null, `dish-${Date.now()}.${ext}`);
  },
});
const upload = multer({ storage });

// 1. Upload an image for a dish
router.post('/:id/upload', auth, upload.single('image'), dishController.uploadDishImage);

// GET /api/dishes?restaurantId=xxx
router.get('/', dishController.getDishes);

// POST /api/dishes
router.post('/', auth, dishController.createDish);

// GET /api/dishes/:id
router.get('/:id', dishController.getDishById);

module.exports = router;
