import { Router } from "express";
import userRoutes from "./user.routes";
import storeRoutes from "./store.routes";
import productRoutes from "./product.routes";
import customerRoutes from "./customer.routes";
import invoiceRoutes from "./invoice.routes";
import analyticsRoutes from "./analytics.routes";
import oauthRoutes from "./oauth.routes";
import searchRoutes from "./search.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/stores", storeRoutes);
router.use("/products", productRoutes);
router.use("/customers", customerRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/oauth", oauthRoutes);
router.use("/search", searchRoutes);

export default router;
