import { Router } from "express";
import * as session from "../controllers/sessionController.js";
import { protect } from "../middlewares/auth.js";

const router = Router();
router.use(protect);
router.post("/", session.createSession);
router.get("/", session.getSessions);
router.patch("/:id/accept", session.acceptSession);
router.patch("/:id/complete", session.completeSession);
export default router;
