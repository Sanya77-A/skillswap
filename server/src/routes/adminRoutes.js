import { Router } from "express";
import * as admin from "../controllers/adminController.js";
import { protect } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/role.js";

const router = Router();
router.use(protect, adminOnly);
router.get("/users", admin.getUsers);
router.get("/reports", admin.getReports);
router.patch("/users/:id/block", admin.blockUser);
router.patch("/users/:id/unblock", admin.unblockUser);
router.delete("/users/:id", admin.deleteUser);
router.get("/stats", admin.getStats);
export default router;
