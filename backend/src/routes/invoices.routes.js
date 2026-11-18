import { Router } from "express";
import { downloadInvoice } from "../controllers/invoices.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/:orderId", requireAuth, asyncHandler(downloadInvoice));

export default router;
