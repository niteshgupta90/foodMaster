const mongoose = require("mongoose");
const Dish = require("../models/Dish");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getFilterOptions = async (req, res) => {
  try {
    res.json({
      cuisines: await Dish.distinct("cuisineType"),
      dietary: !!(await Dish.exists({
        $or: ["isVegetarian", "isVegan", "isGlutenFree"].map((key) => ({
          [`dietary.${key}`]: { $exists: true },
        })),
      })),
    });
  } catch {
    res.status(500).json({ msg: "Unable to load filters" });
  }
};

exports.getDishes = async (req, res) => {
  try {
    const { q, city, restaurantId, distance, lat, lng, rating, sortBy } =
      req.query;
    if (
      [q, city, restaurantId, distance, lat, lng, rating, sortBy].some(
        (x) => x !== undefined && typeof x !== "string",
      )
    )
      return res.status(400).json({ msg: "Invalid filter value" });
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 21));
    const conditions = [];
    if (q)
      conditions.push({
        name: { $regex: escapeRegex(q.trim()), $options: "i" },
      });
    let restaurantQuery = {};
    if (restaurantId) {
      if (!mongoose.isObjectIdOrHexString(restaurantId))
        return res.status(400).json({ msg: "Invalid restaurant ID" });
      restaurantQuery._id = restaurantId;
    }
    if (city)
      restaurantQuery.address = {
        $regex: escapeRegex(city.trim()),
        $options: "i",
      };
    if (distance) {
      if (
        !(Number(distance) > 0) ||
        !Number.isFinite(Number(lat)) ||
        !Number.isFinite(Number(lng)) ||
        lat === undefined ||
        lng === undefined ||
        Math.abs(Number(lat)) > 90 ||
        Math.abs(Number(lng)) > 180
      )
        return res
          .status(400)
          .json({ msg: "Valid coordinates and distance are required" });
      restaurantQuery.location = {
        $geoWithin: {
          $centerSphere: [
            [Number(lng), Number(lat)],
            Number(distance) / 3958.8,
          ],
        },
      };
    }
    if (Object.keys(restaurantQuery).length) {
      const ids = (await Restaurant.find(restaurantQuery).select("_id")).map(
        (x) => x._id,
      );
      // Support both legacy singular and current plural restaurant references.
      conditions.push({
        $or: [
          "restaurant",
          "restaurants",
          "recommendedRestaurant",
          "recommendedRestaurants",
        ].map((key) => ({ [key]: { $in: ids } })),
      });
    }
    const array = (value) =>
      value == null ? [] : Array.isArray(value) ? value : [value];
    const tiers = array(req.query.priceTier);
    if (tiers.some((x) => !["$", "$$", "$$$", "$$$$"].includes(x)))
      return res.status(400).json({ msg: "Invalid price range" });
    if (tiers.length) conditions.push({ priceTier: { $in: tiers } });
    const cuisines = array(req.query.cuisineType);
    if (cuisines.length) conditions.push({ cuisineType: { $in: cuisines } });
    if (rating) {
      if (
        !Number.isFinite(Number(rating)) ||
        Number(rating) < 0 ||
        Number(rating) > 5
      )
        return res.status(400).json({ msg: "Rating must be between 0 and 5" });
    }
    const dietary = req.query.dietary || {};
    for (const key of ["isVegetarian", "isVegan", "isGlutenFree"]) {
      if (dietary[key] === "true" || dietary[key] === true) {
        conditions.push({ [`dietary.${key}`]: true });
      }
    }
    const query = conditions.length ? { $and: conditions } : {};
    const sort =
      sortBy === "name"
        ? { name: 1, _id: 1 }
        : sortBy === "rating"
          ? { averageRating: -1, _id: 1 }
          : { _id: 1 };
    // Compute review summaries on reads so legacy cached averages don't mislead users.
    const result = await Dish.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "reviews",
          let: { dishId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$dish", "$$dishId"] } } },
            {
              $group: {
                _id: null,
                average: { $avg: "$rating" },
                count: { $sum: 1 },
                total: { $sum: "$rating" },
              },
            },
          ],
          as: "reviewSummary",
        },
      },
      {
        $set: {
          averageRating: {
            $ifNull: [{ $arrayElemAt: ["$reviewSummary.average", 0] }, 0],
          },
          reviewCount: {
            $ifNull: [{ $arrayElemAt: ["$reviewSummary.count", 0] }, 0],
          },
        },
      },
      ...(rating
        ? [{ $match: { averageRating: { $gte: Number(rating) } } }]
        : []),
      {
        $facet: {
          metadata: [{ $count: "total" }],
          dishes: [
            { $sort: sort },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $unset: "reviewSummary" },
          ],
        },
      },
    ]);
    const total = result[0].metadata[0]?.total || 0;
    const dishes = await Dish.populate(result[0].dishes, [
      { path: "restaurant" },
      { path: "restaurants" },
      { path: "recommendedRestaurants" },
    ]);
    res.json({ dishes, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Unable to load dishes" });
  }
};
exports.filterDishes = exports.getDishes;

exports.createDish = async (req, res) => {
  try {
    const {
      restaurant,
      name,
      description,
      isVegetarian = true,
      price,
      cuisineType,
      priceTier,
    } = req.body;
    if (
      !name?.trim() ||
      !cuisineType ||
      !priceTier ||
      !mongoose.isObjectIdOrHexString(restaurant) ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    )
      return res
        .status(400)
        .json({
          msg: "A name, restaurant, cuisine, price range, and valid price are required",
        });
    if (!(await Restaurant.exists({ _id: restaurant })))
      return res.status(404).json({ msg: "Restaurant not found" });
    const dish = await Dish.create({
      name: name.trim(),
      description,
      restaurant,
      restaurants: [restaurant],
      isVegetarian,
      dietary: { isVegetarian },
      price: Number(price),
      cuisineType,
      priceTier,
    });
    return res.status(201).json(dish);
  } catch (err) {
    return res
      .status(err.code === 11000 ? 409 : 400)
      .json({
        msg:
          err.code === 11000
            ? "This dish already exists"
            : "Check the dish details",
      });
  }
};

exports.getDishById = async (req, res) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id))
      return res.status(400).json({ msg: "Invalid dish ID" });
    // 1. Get the Dish itself
    const dish = await Dish.findById(req.params.id)
      .populate("restaurant")
      .populate("restaurants")
      .populate("recommendedRestaurants", "name address location");

    if (!dish) {
      return res.status(404).json({ msg: "Dish not found" });
    }

    // 2. Fetch all reviews for this dish
    const reviews = await Review.find({ dish: dish._id })
      .populate("user", "username")
      .populate("restaurant", "name");
    // ^ This ensures `reviews[x].user` is replaced by the user object,
    //   showing only 'username' field if you want

    // 3. Merge dish object with reviews into a single response
    const dishData = {
      ...dish.toObject(),
      reviews,
      reviewCount: reviews.length,
      averageRating: reviews.length
        ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
        : 0,
    };

    return res.json(dishData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.uploadDishImage = async (req, res) => {
  try {
    const dishId = req.params.id;
    const file = req.file; // Multer attaches this
    if (!file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    // e.g., local path: 'uploads/dish-1662121212122.jpg'
    const imageUrl = `/uploads/${file.filename}`;
    // Or just `file.path` if you plan to handle it differently

    // Fetch dish
    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ msg: "Dish not found" });
    }

    // Push the new image info into the array
    dish.images.push({ url: imageUrl, filename: file.filename });

    await dish.save();
    return res.json(dish);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};
