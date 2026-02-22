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

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true },
  path: "/socket.io",
});

setupSocket(io);

const MATCH_CACHE_CRON_MS = 12 * 60 * 60 * 1000;
let matchCronTimer = null;

connectDB().then(() => {
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    matchCronTimer = setInterval(() => {
      recomputeAllMatchCaches().then(() => logger.info("Match cache recomputed")).catch((err) => logger.error("Match cache cron error", err.message));
    }, MATCH_CACHE_CRON_MS);
  });
});

process.on("SIGTERM", () => {
  if (matchCronTimer) clearInterval(matchCronTimer);
});
