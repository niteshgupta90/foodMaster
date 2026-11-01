const crypto = require("crypto");
const User = require("../models/User");
const EXPIRY_MS = 15 * 60 * 1000;
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
function resetUrl(token) {
  const origin = process.env.FRONTEND_URL || "http://localhost:3000";
  const url = new URL("/reset-password", origin);
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  )
    throw new Error("FRONTEND_URL must use HTTPS outside localhost");
  url.hash = new URLSearchParams({ token }).toString();
  return url.toString();
}
async function issueResetLink(user) {
  const token = crypto.randomBytes(32).toString("hex");
  const url = resetUrl(token);
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordResetTokenHash: hashToken(token),
        passwordResetExpires: new Date(Date.now() + EXPIRY_MS),
      },
    },
  );
  return url;
}
module.exports = { hashToken, issueResetLink, resetUrl };
