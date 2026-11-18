import { Router } from "express";
import { getPublicSettings } from "../controllers/settings.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(getPublicSettings));

export default router;
