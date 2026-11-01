// app.js
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON payload

// Import routes
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const dishRoutes = require("./routes/dishRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const dishReviewsRoutes = require("./routes/dishReviewsRoutes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dish-reviews", dishReviewsRoutes);
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

// Error handling middleware (should be last)
app.use(errorHandler);

// Connect before accepting requests; imports remain side-effect free for tests.
async function start() {
  if (process.env.LOCAL_DNS_SERVERS)
    require("dns").setServers(process.env.LOCAL_DNS_SERVERS.split(","));
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/foodRatingApp",
    { serverSelectionTimeoutMS: 10000, autoIndex: false },
  );
  const PORT = process.env.PORT || 5001;
  return app.listen(PORT, () =>
    console.log(`MongoDB connected. Server running on port ${PORT}`),
  );
}
if (require.main === module)
  start().catch(() => {
    console.error(
      "MongoDB connection failed. Check MONGO_URI and Atlas network access.",
    );
    process.exitCode = 1;
  });
module.exports = app;
module.exports.start = start;
