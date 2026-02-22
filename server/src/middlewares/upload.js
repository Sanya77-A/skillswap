import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/i;
  const ext = path.extname(file.originalname).slice(1);
  if (allowed.test(ext) && allowed.test(file.mimetype)) return cb(null, true);
  cb(new Error("Only image files are allowed"));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const chatFileFilter = (req, file, cb) => {
  const allowedImages = /jpeg|jpg|png|gif|webp/i;
  const allowedPdf = /pdf/i;
  const ext = path.extname(file.originalname).slice(1);
  const mime = file.mimetype;
  if ((allowedImages.test(ext) && allowedImages.test(mime)) || (ext === "pdf" && allowedPdf.test(mime))) {
    return cb(null, true);
  }
  cb(new Error("Only images and PDF allowed"));
};

export const chatUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: chatFileFilter,
}).array("attachments", 5);
