import { Router } from "express";
import * as auth from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { verifyRefreshTokenMiddleware } from "../middlewares/auth.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.js";
import rateLimit from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts" },
});

router.post("/register", authLimiter, validate(registerSchema), auth.register);
router.post("/login", authLimiter, validate(loginSchema), auth.login);
router.post("/refresh", verifyRefreshTokenMiddleware, auth.refresh);
router.post("/logout", auth.logout);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), auth.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), auth.resetPassword);

export default router;
