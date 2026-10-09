import { Router } from "express";
import { validateCoupon } from "../controllers/coupons.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/validate", requireAuth, asyncHandler(validateCoupon));

export default router;
