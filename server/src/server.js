import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { setupSocket } from "./socket/index.js";
import { recomputeAllMatchCaches } from "./services/matchService.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const defaultOrigins = [
  "http://localhost:5173",
  "https://skillswap-lyart.vercel.app",
  "https://skillswap-kxq1s9bc6-sanyas-projects-5686af3a.vercel.app"
];

const allowedOrigins = process.env.CLIENT_URL
  ? [...defaultOrigins, ...process.env.CLIENT_URL.split(",").map((url) => url.trim().replace(/\/$/, ""))]
  : defaultOrigins;

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const originClean = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(originClean)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  },
  path: "/socket.io",
});

setupSocket(io);

const MATCH_CACHE_CRON_MS = 12 * 60 * 60 * 1000;
let matchCronTimer = null;

connectDB().then(() => {
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
    matchCronTimer = setInterval(() => {
      recomputeAllMatchCaches().then(() => logger.info("Match cache recomputed")).catch((err) => logger.error("Match cache cron error", err.message));
    }, MATCH_CACHE_CRON_MS);
  });
});

process.on("SIGTERM", () => {
  if (matchCronTimer) clearInterval(matchCronTimer);
});
