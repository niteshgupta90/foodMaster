const express = require("express");
const router = express.Router();
const dishController = require("../controllers/dishController");
const auth = require("../middleware/auth");
// Import multer
const upload = require("../middleware/upload");

// 1. Upload an image for a dish
router.post(
  "/:id/upload",
  auth,
  upload.single("image"),
  dishController.uploadDishImage,
);

// GET /api/dishes?restaurantId=xxx
router.get("/", dishController.getDishes);
router.get("/options", dishController.getFilterOptions);

// POST /api/dishes
router.post("/", auth, dishController.createDish);

// GET /api/dishes/filter
// Filter routes with validation
router.get("/filter", dishController.filterDishes);
// router.get('/filter/nearby', validateDishFilters, dishController.getNearbyDishes);

// GET /api/dishes/:id
router.get("/:id", dishController.getDishById);

module.exports = router;
