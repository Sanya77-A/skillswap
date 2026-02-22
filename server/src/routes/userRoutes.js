import { Router } from "express";
import * as user from "../controllers/userController.js";
import * as review from "../controllers/reviewController.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema } from "../validators/user.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.get("/me", protect, user.getMe);
router.put("/me", protect, upload.single("profileImage"), validate(updateProfileSchema), user.updateMe);
router.delete("/me", protect, user.deleteMe);
router.get("/", protect, user.getUsers);
router.get("/:id/reviews", protect, review.getReviewsByUser);
router.get("/:id", protect, user.getUserById);

export default router;
