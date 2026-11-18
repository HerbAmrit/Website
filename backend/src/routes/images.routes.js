import { Router } from "express";
import { serveImage } from "../controllers/images.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/:id", asyncHandler(serveImage));

export default router;
