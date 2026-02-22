import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

/**
 * Connect to MongoDB with retry logic
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/skillswap";
  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
