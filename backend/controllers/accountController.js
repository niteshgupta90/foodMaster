const User = require("../models/User");
const bcrypt = require("bcrypt");
const { hashToken, issueResetLink } = require("../services/passwordReset");
const mail = require("../services/resetEmail");
const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  displayName: user.displayName || "",
  city: user.city || "",
  bio: user.bio || "",
  preference: user.preference || "none",
  isAdmin: !!user.isAdmin,
  createdAt: user.createdAt,
});
const validPassword = (value) =>
  typeof value === "string" &&
  value.length >= 12 &&
  Buffer.byteLength(value, "utf8") <= 72;
const passwordMessage =
  "Use at least 12 characters and no more than 72 UTF-8 bytes.";
exports.publicUser = publicUser;
exports.validPassword = validPassword;
exports.forgotPassword = async (req, res) => {
  if (
    typeof req.body.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)
  )
    return res.status(400).json({ msg: "Enter a valid email address." });
  if (!mail.isConfigured())
    return res
      .status(503)
      .json({
        msg: "Password-reset email is not configured yet. Please contact the app administrator.",
      });
  // Respond identically before looking up an account or sending mail.
  const email = req.body.email.trim().toLowerCase();
  res
    .status(202)
    .json({
      msg: "If an account matches that email, a reset link will arrive shortly. Check your spam folder too.",
    });
  setImmediate(async () => {
    try {
      const user = await User.findOne({ email });
      if (user) {
        const url = await issueResetLink(user);
        await mail.send(user.email, url);
      }
    } catch {
      console.error("Password-reset email could not be delivered.");
    }
  });
};
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token))
    return res
      .status(400)
      .json({
        msg: "This reset link is invalid or has expired. Request a new link.",
      });
  if (!validPassword(password))
    return res.status(400).json({ msg: passwordMessage });
  const tokenHash = hashToken(token);
  try {
    const query = {
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    };
    if (!(await User.exists(query)))
      return res
        .status(400)
        .json({
          msg: "This reset link is invalid or has expired. Request a new link.",
        });
    const passwordHash = await bcrypt.hash(password, 12);
    // Consuming the token and replacing the password are one atomic write.
    const user = await User.findOneAndUpdate(
      { ...query, passwordResetExpires: { $gt: new Date() } },
      {
        $set: { password: passwordHash },
        $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 },
        $inc: { tokenVersion: 1 },
      },
      { new: true },
    );
    if (!user)
      return res
        .status(400)
        .json({
          msg: "This reset link is invalid or has expired. Request a new link.",
        });
    res.json({
      msg: "Password reset. Sign in with your new password. Previous sessions have been signed out.",
    });
  } catch {
    res
      .status(500)
      .json({ msg: "Unable to reset the password. Please try again." });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ msg: "Please sign in again." });
    res.json({ user: publicUser(user) });
  } catch {
    res.status(500).json({ msg: "Unable to load your profile." });
  }
};
exports.updateProfile = async (req, res) => {
  const limits = { displayName: 100, city: 100, bio: 300 };
  const fields = {};
  for (const [key, max] of Object.entries(limits))
    if (req.body[key] !== undefined) {
      if (
        typeof req.body[key] !== "string" ||
        req.body[key].trim().length > max
      )
        return res
          .status(400)
          .json({ msg: `${key} must be ${max} characters or fewer.` });
      fields[key] = req.body[key].trim();
    }
  if (req.body.preference !== undefined) {
    if (!["none", "vegetarian", "vegan"].includes(req.body.preference))
      return res
        .status(400)
        .json({ msg: "Choose a valid dietary preference." });
    fields.preference = req.body.preference;
  }
  // Account identity and privileges cannot be changed through profile fields.
  if (
    ["email", "username", "isAdmin", "password", "tokenVersion"].some(
      (key) => key in req.body,
    )
  )
    return res
      .status(400)
      .json({
        msg: "Account email, username, role, and password cannot be changed in this form.",
      });
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: fields },
      { new: true, runValidators: true },
    );
    if (!user) return res.status(401).json({ msg: "Please sign in again." });
    res.json({ user: publicUser(user), msg: "Profile saved." });
  } catch {
    res.status(500).json({ msg: "Unable to save your profile." });
  }
};
exports.changePassword = async (req, res) => {
  const { currentPassword, password } = req.body;
  if (typeof currentPassword !== "string" || !validPassword(password))
    return res.status(400).json({ msg: passwordMessage });
  if (currentPassword === password)
    return res
      .status(400)
      .json({ msg: "Choose a different password from your current one." });
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !(await bcrypt.compare(currentPassword, user.password)))
      return res.status(400).json({ msg: "Current password is incorrect." });
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await User.updateOne(
      { _id: user._id, password: user.password },
      {
        $set: { password: passwordHash },
        $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 },
        $inc: { tokenVersion: 1 },
      },
    );
    if (!result.modifiedCount)
      return res
        .status(409)
        .json({ msg: "Your account changed. Please sign in again." });
    res.json({ msg: "Password changed. Sign in again on each device." });
  } catch {
    res.status(500).json({ msg: "Unable to change your password." });
  }
};
