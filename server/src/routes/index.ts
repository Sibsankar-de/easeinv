import { Router } from "express";
import internalRoutes from "./internalRoutes";
import externalRoutes from "./externalRoutes";

const router = Router();

router.use("/backend/api/v1", internalRoutes);
router.use("/api/v1", externalRoutes);

export default router;
