import { Router } from "express";
import { submitCustomerQuery } from "../controllers/customerQuery.controller";

const router = Router();

router.route("/").post(submitCustomerQuery);

export default router;
