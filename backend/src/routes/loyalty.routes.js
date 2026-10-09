import { Router } from "express";
import { getBalance, getHistory } from "../controllers/loyalty.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.get("/balance", asyncHandler(getBalance));
router.get("/history", asyncHandler(getHistory));

export default router;
