import { Router } from "express";
import { submitContact } from "../controllers/contact.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.post("/", asyncHandler(submitContact));

export default router;
