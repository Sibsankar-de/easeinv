import { Router } from "express";
import userRoutes from "./user.routes";
import storeRoutes from "./store.routes";
import productRoutes from "./product.routes";
import customerRoutes from "./customer.routes";
import invoiceRoutes from "./invoice.routes";
import analyticsRoutes from "./analytics.routes";
import oauthRoutes from "./oauth.routes";
import searchRoutes from "./search.routes";
import galleryRoutes from "./galleryImage.routes";
import apiKeyRoutes from "./apiKey.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/stores", storeRoutes);
router.use("/products", productRoutes);
router.use("/customers", customerRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/oauth", oauthRoutes);
router.use("/search", searchRoutes);
router.use("/gallery", galleryRoutes);
router.use("/api-keys", apiKeyRoutes);

export default router;
