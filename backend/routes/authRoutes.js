const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const account = require("../controllers/accountController");
const { rateLimit } = require("express-rate-limit");
const recoveryLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    msg: "Too many password requests. Please try again in 15 minutes.",
  },
});
router.post("/forgot-password", recoveryLimit, account.forgotPassword);
router.post("/reset-password", recoveryLimit, account.resetPassword);
router.get("/me", auth, account.getProfile);
router.patch("/me", auth, account.updateProfile);
router.post("/change-password", auth, recoveryLimit, account.changePassword);
const authController = require("../controllers/authController");

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

module.exports = router;
