import { Router } from "express";
import * as report from "../controllers/reportController.js";
import { protect } from "../middlewares/auth.js";

const router = Router();
router.post("/", protect, report.createReport);
export default router;
