const jwt = require("jsonwebtoken");
const User = require("../models/User");
module.exports = async function (req, res, next) {
  const token =
    req.header("x-auth-token") || req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("tokenVersion");
    if (
      !user ||
      Number(decoded.tokenVersion || 0) !== Number(user.tokenVersion || 0)
    )
      return res
        .status(401)
        .json({ msg: "Your session has expired. Please sign in again." });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
