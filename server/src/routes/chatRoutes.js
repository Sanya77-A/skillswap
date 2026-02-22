import { Router } from "express";
import * as chat from "../controllers/chatController.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { chatUpload } from "../middlewares/upload.js";
import { postMessageSchema } from "../validators/chat.js";

const router = Router();
router.use(protect);
router.get("/", chat.getConversations);
router.post("/conversation", chat.getOrCreateChat);
router.get("/:conversationId/messages", chat.getMessages);
router.patch("/:conversationId/read", chat.markConversationRead);
router.post("/:conversationId/messages", (req, res, next) => {
  chatUpload(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, validate(postMessageSchema), chat.postMessage);
export default router;
