import express from "express";
import { createCheckoutSession,manageBillingPortal } from "../controllers/billingController.js";
import {auth} from "../middlewares/auth.js";
const router = express.Router();


router.post("/create-checkout-session", createCheckoutSession);
router.post("/manage-billing", auth, manageBillingPortal);

export default router;
