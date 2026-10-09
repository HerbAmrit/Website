import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/db.js";
import { config } from "../config/env.js";
import { ApiError } from "../middleware/errorHandler.js";
import { sendEmail } from "../services/email.service.js";
import { generateOtp, otpExpiry } from "../services/otp.service.js";

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

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "Enter the 6-digit code."),
});

const MAX_OTP_ATTEMPTS = 5;

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

async function sendOtpEmail(email, name, otp) {
  await sendEmail({
    to: email,
    subject: "Verify your email — HerbAmrit",
    html: `<p>Hi ${name},</p><p>Your verification code is:</p><h2 style="letter-spacing:4px;">${otp}</h2><p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>`,
  });
}

// POST /api/auth/register — step 1 of 2. Validates the details and emails a 6-digit
// code, but does NOT create the account yet — that only happens once verifyOtp
// confirms the email is real and actually reachable. This is what stops someone
// from registering with a typo'd domain (e.g. "gmial.com") that can never receive
// anything: the OTP email would simply never arrive, and signup can't complete.
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
  const otpCode = generateOtp();

  // upsert: re-registering the same (still-unverified) email just issues a fresh code,
  // rather than erroring — handles someone abandoning signup partway and trying again.
  await prisma.emailVerification.upsert({
    where: { email },
    create: { email, name, passwordHash, phone, otpCode, otpExpiresAt: otpExpiry(), attempts: 0 },
    update: { name, passwordHash, phone, otpCode, otpExpiresAt: otpExpiry(), attempts: 0 },
  });

  await sendOtpEmail(email, name, otpCode);

  res.status(200).json({ pendingVerification: true, email });
}

// POST /api/auth/verify-otp — step 2 of 2. Confirms the code, then actually
// creates the account and logs the person in.
export async function verifyOtp(req, res, next) {
  const parsed = otpSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, "Enter the 6-digit code sent to your email."));
  }
  const { email, otp } = parsed.data;

  const pending = await prisma.emailVerification.findUnique({ where: { email } });
  if (!pending) {
    return next(new ApiError(400, "No pending signup found for this email. Please register again."));
  }
  if (pending.otpExpiresAt < new Date()) {
    await prisma.emailVerification.delete({ where: { email } });
    return next(new ApiError(400, "This code has expired. Please register again to get a new one."));
  }
  if (pending.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.emailVerification.delete({ where: { email } });
    return next(new ApiError(429, "Too many incorrect attempts. Please register again to get a new code."));
  }
  if (pending.otpCode !== otp) {
    await prisma.emailVerification.update({ where: { email }, data: { attempts: { increment: 1 } } });
    return next(new ApiError(400, "That code isn't correct."));
  }

  // Guard against a race where the email somehow got registered between step 1 and now.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.emailVerification.delete({ where: { email } });
    return next(new ApiError(409, "An account with this email already exists."));
  }

  const user = await prisma.user.create({
    data: { name: pending.name, email: pending.email, phone: pending.phone, passwordHash: pending.passwordHash },
  });
  await prisma.emailVerification.delete({ where: { email } });

  res.status(201).json({ token: signToken(user), user: toPublicUser(user) });
}

// POST /api/auth/resend-otp — in case the first email is lost, delayed, or the code expired.
export async function resendOtp(req, res, next) {
  const { email } = req.body;
  if (!email) return next(new ApiError(400, "Email is required."));

  const pending = await prisma.emailVerification.findUnique({ where: { email } });
  if (!pending) {
    return next(new ApiError(400, "No pending signup found for this email. Please register again."));
  }

  const otpCode = generateOtp();
  await prisma.emailVerification.update({
    where: { email },
    data: { otpCode, otpExpiresAt: otpExpiry(), attempts: 0 },
  });
  await sendOtpEmail(pending.email, pending.name, otpCode);

  res.json({ sent: true });
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
