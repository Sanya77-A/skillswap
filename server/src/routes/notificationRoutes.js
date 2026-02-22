import { Router } from "express";
import * as notification from "../controllers/notificationController.js";
import { protect } from "../middlewares/auth.js";

const router = Router();
router.use(protect);
router.get("/", notification.list);
router.get("/unread-count", notification.unreadCount);
router.patch("/:id/read", notification.markRead);
router.patch("/read-all", notification.markAllRead);
export default router;
