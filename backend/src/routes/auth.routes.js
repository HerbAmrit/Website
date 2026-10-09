import { Router } from "express";
import { register, verifyOtp, resendOtp, login, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/verify-otp", asyncHandler(verifyOtp));
router.post("/resend-otp", asyncHandler(resendOtp));
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

export default router;
