import { Router } from "express";
import { listProducts, getProductBySlug, listCategories } from "../controllers/products.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listProducts));
router.get("/categories", asyncHandler(listCategories));
router.get("/:slug", asyncHandler(getProductBySlug));

export default router;
