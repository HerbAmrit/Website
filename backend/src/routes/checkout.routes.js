import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/checkout.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.post("/create-order", asyncHandler(createOrder));
router.post("/verify-payment", asyncHandler(verifyPayment));

export default router;
