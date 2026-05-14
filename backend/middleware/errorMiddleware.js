export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    message: isProduction && statusCode === 500 ? "Server error" : err.message || "Server error",
    ...(isProduction ? {} : { stack: err.stack })
  });
};
