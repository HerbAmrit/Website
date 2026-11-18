import { Router } from "express";
import { getWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(getWishlist));
router.post("/", asyncHandler(addToWishlist));
router.delete("/:productId", asyncHandler(removeFromWishlist));

export default router;
