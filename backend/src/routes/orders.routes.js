import { Router } from "express";
import { listOrders, getOrder } from "../controllers/orders.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(listOrders));
router.get("/:id", asyncHandler(getOrder));

export default router;
