// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // For dietary preferences, e.g., vegetarian, vegan, etc.
    preference: { type: String, default: "vegetarian" },
    displayName: { type: String, default: "", maxlength: 100 },
    city: { type: String, default: "", maxlength: 100 },
    bio: { type: String, default: "", maxlength: 300 },
    tokenVersion: { type: Number, default: 0 },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
