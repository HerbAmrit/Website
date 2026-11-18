import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import {
  listAllProducts, createProduct, updateProduct, deleteProduct, updateStock,
  listCategoriesAdmin, createCategory,
} from "../controllers/admin/products.controller.js";
import { listAllOrders, getOrderAdmin, updateOrderStatus } from "../controllers/admin/orders.controller.js";
import { listCustomers, getCustomer } from "../controllers/admin/customers.controller.js";
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from "../controllers/admin/coupons.controller.js";
import { getOverview } from "../controllers/admin/analytics.controller.js";
import { exportReport } from "../controllers/admin/reports.controller.js";
import { listSettingsAdmin, updateSettings } from "../controllers/admin/settings.controller.js";
import { sendTestNotification } from "../controllers/admin/notifications.controller.js";
import { listMessages, markMessageRead } from "../controllers/admin/messages.controller.js";
import { addProductImage, removeProductImage, setMainProductImage } from "../controllers/admin/productImages.controller.js";

const router = Router();

router.use(requireAuth, requireAdmin);

// Products & categories
router.get("/products", asyncHandler(listAllProducts));
router.post("/products", asyncHandler(createProduct));
router.put("/products/:id", asyncHandler(updateProduct));
router.delete("/products/:id", asyncHandler(deleteProduct));
router.patch("/products/:id/stock", asyncHandler(updateStock));
router.post("/products/:id/images", asyncHandler(addProductImage));
router.post("/products/:id/images/remove", asyncHandler(removeProductImage));
router.post("/products/:id/images/main", asyncHandler(setMainProductImage));
router.get("/categories", asyncHandler(listCategoriesAdmin));
router.post("/categories", asyncHandler(createCategory));

// Orders
router.get("/orders", asyncHandler(listAllOrders));
router.get("/orders/:id", asyncHandler(getOrderAdmin));
router.patch("/orders/:id/status", asyncHandler(updateOrderStatus));

// Customers
router.get("/customers", asyncHandler(listCustomers));
router.get("/customers/:id", asyncHandler(getCustomer));

// Coupons
router.get("/coupons", asyncHandler(listCoupons));
router.post("/coupons", asyncHandler(createCoupon));
router.put("/coupons/:id", asyncHandler(updateCoupon));
router.delete("/coupons/:id", asyncHandler(deleteCoupon));

// Analytics & reports
router.get("/analytics/overview", asyncHandler(getOverview));
router.get("/reports/export", asyncHandler(exportReport));

// Site settings (social links, WhatsApp number, Amazon URL, loyalty rates)
router.get("/settings", asyncHandler(listSettingsAdmin));
router.put("/settings", asyncHandler(updateSettings));

// Notifications
router.post("/notifications/test", asyncHandler(sendTestNotification));

// Contact-form messages
router.get("/messages", asyncHandler(listMessages));
router.patch("/messages/:id/read", asyncHandler(markMessageRead));

export default router;
