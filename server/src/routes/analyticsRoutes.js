import { Router } from "express";
import * as analytics from "../controllers/analyticsController.js";
import { protect } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/role.js";

const router = Router();
router.get("/user", protect, analytics.getUserAnalytics);
router.get("/platform", protect, adminOnly, analytics.getPlatformAnalytics);
export default router;
