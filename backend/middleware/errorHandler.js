module.exports = (err, req, res, next) => {
  const uploadError =
    err.name === "MulterError" ||
    err.message === "Use a JPEG, PNG, or WebP image";
  const status = uploadError ? 400 : err.statusCode || 500;
  res
    .status(status)
    .json({
      msg: uploadError
        ? err.code === "LIMIT_FILE_SIZE"
          ? "Photo must be 5 MB or smaller"
          : err.message
        : "Unable to complete the request",
    });
};
