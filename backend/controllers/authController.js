const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, password, preference } = req.body;
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (
      typeof username !== "string" ||
      !username.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "") ||
      typeof password !== "string" ||
      !require("./accountController").validPassword(password)
    )
      return res.status(400).json({
        msg: "Enter a username, valid email, and password of at least 12 characters (up to 72 UTF-8 bytes)",
      });
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      preference,
      isAdmin: false,
    });
    const savedUser = await newUser.save();

    return res.status(201).json({
      msg: "User registered successfully",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
      },
    });
  } catch (err) {
    return res.status(err.code === 11000 ? 409 : 500).json({
      msg:
        err.code === 11000
          ? "User already exists"
          : "Unable to complete authentication",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (typeof email !== "string" || typeof password !== "string")
      return res.status(400).json({ msg: "Email and password are required" });
    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, tokenVersion: user.tokenVersion || 0 },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    return res.status(200).json({
      token,
      user: require("./accountController").publicUser(user),
    });
  } catch (err) {
    return res.status(err.code === 11000 ? 409 : 500).json({
      msg:
        err.code === 11000
          ? "User already exists"
          : "Unable to complete authentication",
    });
  }
};
