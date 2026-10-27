import { Router } from "express";
import { verifyApiKey } from "../middlewares/verifyApiKey.middleware";
import { externalCorsMiddleware } from "../middlewares/cors.middleware";
import inventoryRoutes from "./apiKey/inventory.routes";
import customerRoutes from "./apiKey/customer.routes";
import invoiceRoutes from "./apiKey/invoice.routes";
import orderRoutes from "./apiKey/order.routes";

const router = Router();

router.use(verifyApiKey);
router.use(externalCorsMiddleware);

router.use("/inventory", inventoryRoutes);
router.use("/products", inventoryRoutes);
router.use("/customers", customerRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/orders", orderRoutes);

export default router;
