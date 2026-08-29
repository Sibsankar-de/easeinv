import { Router } from "express";
import cors from "cors";
import { env } from "../configs/env";
import userRoutes from "./user.routes";
import storeRoutes from "./store.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import customerRoutes from "./customer.routes";
import invoiceRoutes from "./invoice.routes";
import analyticsRoutes from "./analytics.routes";
import oauthRoutes from "./oauth.routes";
import searchRoutes from "./search.routes";
import galleryRoutes from "./galleryImage.routes";
import apiKeyRoutes from "./apiKey.routes";
import notificationRoutes from "./notification.routes";
import webhookRoutes from "./webhook.routes";
import customerQueryRoutes from "./customerQuery.routes";
import adminApiRoutes from "./adminApi.routes";
import couponRoutes from "./coupon.routes";
import orderRoutes from "./order.routes";

const router = Router();

const origins = env.CORS_ORIGIN.split(",");
router.use(
  cors({
    origin: origins,
    credentials: true,
  }),
);

router.use("/users", userRoutes);
router.use("/stores", storeRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/coupons", couponRoutes);
router.use("/customers", customerRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/orders", orderRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/oauth", oauthRoutes);
router.use("/search", searchRoutes);
router.use("/gallery", galleryRoutes);
router.use("/api-keys", apiKeyRoutes);
router.use("/notifications", notificationRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/customer-queries", customerQueryRoutes);
router.use("/contact", customerQueryRoutes);
router.use("/admin", adminApiRoutes);

export default router;
