const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const extensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),
  filename: (req, file, cb) =>
    cb(null, `photo-${crypto.randomUUID()}${extensions[file.mimetype]}`),
});
module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    extensions[file.mimetype]
      ? cb(null, true)
      : cb(new Error("Use a JPEG, PNG, or WebP image")),
});
