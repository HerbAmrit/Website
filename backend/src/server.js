import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { config } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

import productsRouter from "./routes/products.routes.js";
import authRouter from "./routes/auth.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import couponsRouter from "./routes/coupons.routes.js";
import checkoutRouter from "./routes/checkout.routes.js";
import ordersRouter from "./routes/orders.routes.js";
import invoicesRouter from "./routes/invoices.routes.js";
import loyaltyRouter from "./routes/loyalty.routes.js";
import settingsRouter from "./routes/settings.routes.js";
import adminRouter from "./routes/admin.routes.js";
import contactRouter from "./routes/contact.routes.js";
import { generateSitemap } from "./controllers/sitemap.controller.js";

const app = express();

// Behind Netlify's proxy and Railway's edge, req.ip would otherwise be the proxy's address,
// making every visitor share ONE rate-limit bucket on /api/auth. 2 = trust both hops.
app.set("trust proxy", 2);

// --- Security & platform middleware ---
app.use(helmet()); // sets sane security headers, mitigates clickjacking/XSS-via-headers
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" })); // small limit + JSON-only parsing reduces injection surface
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));

// Basic rate limiting on auth endpoints to slow down credential stuffing / brute force.
app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false })
);

// Contact form: 5 submissions per 15 min per visitor keeps spammers from flooding the owner's WhatsApp.
app.use(
  "/api/contact",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false })
);

// --- Health check ---
app.get("/api/health", (req, res) => res.json({ status: "ok", phase: 4 }));

// --- SEO: sitemap.xml, mounted at the conventional root path (not under /api) ---
app.get("/sitemap.xml", generateSitemap);

// --- Routes ---
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/loyalty", loyaltyRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Tea shop API listening on http://localhost:${config.port}`);
  if (!config.razorpay.isConfigured) console.log("  ⚠ Razorpay not configured — checkout will return 503 until RAZORPAY_KEY_ID/SECRET are set");
  if (!config.smtp.isConfigured) console.log("  ⚠ SMTP not configured — emails will log to console instead of sending");
  if (!config.whatsapp.isConfigured) console.log("  ⚠ WhatsApp provider not configured — WhatsApp messages will log to console instead of sending");
});
