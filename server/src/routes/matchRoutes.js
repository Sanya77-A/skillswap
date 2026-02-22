import { Router } from "express";
import * as match from "../controllers/matchController.js";
import { protect } from "../middlewares/auth.js";

const router = Router();
router.get("/", protect, match.getRecommendedMatches);
export default router;
