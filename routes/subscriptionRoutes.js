import express from "express";
import { startSubscription, getUserSubscription,upgradeSubscription , cancelSubscription } from "../controllers/subscriptionController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/start", auth, startSubscription);
router.get("/me", auth, getUserSubscription);
router.post("/upgrade", auth, upgradeSubscription);
router.post('/cancel', auth, cancelSubscription);

export default router;
