export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Marks routes for features that are architected (schema + route exists) but not
// wired up yet in this phase, instead of crashing or 404ing silently.
export function notImplemented(featureName, phase) {
  return (req, res) => {
    res.status(501).json({
      error: "NOT_IMPLEMENTED",
      message: `${featureName} is scaffolded but not implemented yet — planned for Phase ${phase}.`,
    });
  };
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "NOT_FOUND", message: `No route for ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  if (statusCode === 500) {
    console.error(err);
  }
  res.status(statusCode).json({
    error: err.name || "SERVER_ERROR",
    message: statusCode === 500 ? "Something went wrong. Please try again." : err.message,
    details: err.details,
  });
}
