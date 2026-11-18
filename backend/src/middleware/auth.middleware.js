import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { ApiError } from "./errorHandler.js";

// Attaches req.user if a valid token is present; rejects otherwise.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return next(new ApiError(401, "Authentication required."));

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload; // { id, role, email }
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired session. Please log in again."));
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return next(new ApiError(403, "Admin access required."));
  }
  next();
}
