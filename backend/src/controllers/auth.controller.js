import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/db.js";
import { config } from "../config/env.js";
import { ApiError } from "../middleware/errorHandler.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function toPublicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// The email is only a login ID (all customer updates go out via WhatsApp to the number given
// at checkout), so it is checked for format but not verified.
export async function register(req, res, next) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, "Please check your details and try again.", parsed.error.flatten()));
  }
  const { name, email, password, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return next(new ApiError(409, "An account with this email already exists."));
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, passwordHash, phone } });

  res.status(201).json({ token: signToken(user), user: toPublicUser(user) });
}

export async function login(req, res, next) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, "Please enter a valid email and password."));
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) {
    return next(new ApiError(401, "Incorrect email or password."));
  }

  res.json({ token: signToken(user), user: toPublicUser(user) });
}

export async function me(req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return next(new ApiError(404, "User not found."));
  res.json(toPublicUser(user));
}
