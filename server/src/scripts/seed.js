/**
 * Seed demo users and swap requests for local development
 * Run: node src/scripts/seed.js (from server directory)
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import SwapRequest from "../models/SwapRequest.js";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/skillswap";

const users = [
  {
    name: "Admin User",
    email: "admin@skillswap.com",
    password: "admin123",
    role: "admin",
    skillsOffered: ["System Design", "Mentoring"],
    skillsWanted: ["React Native"],
    experienceLevel: "expert",
    availability: ["weekdays", "weekends"],
    bio: "Platform admin",
  },
  {
    name: "Alice Dev",
    email: "alice@skillswap.com",
    password: "alice123",
    skillsOffered: ["React", "TypeScript", "Frontend"],
    skillsWanted: ["DSA", "System Design"],
    experienceLevel: "advanced",
    availability: ["weekdays"],
    bio: "Frontend enthusiast",
  },
  {
    name: "Bob Engineer",
    email: "bob@skillswap.com",
    password: "bob123",
    skillsOffered: ["DSA", "Python", "Backend"],
    skillsWanted: ["React", "JavaScript"],
    experienceLevel: "advanced",
    availability: ["weekends", "flexible"],
    bio: "Backend and algorithms",
  },
  {
    name: "Carol Fullstack",
    email: "carol@skillswap.com",
    password: "carol123",
    skillsOffered: ["Node.js", "MongoDB", "React"],
    skillsWanted: ["Python", "Machine Learning"],
    experienceLevel: "intermediate",
    availability: ["flexible"],
    bio: "Full stack developer",
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  await User.deleteMany({});
  await SwapRequest.deleteMany({});
  console.log("Cleared old data");

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log("Skip (exists):", u.email);
      continue;
    }
    await User.create(u);
    console.log("Created:", u.email);
  }

  const alice = await User.findOne({ email: "alice@skillswap.com" });
  const bob = await User.findOne({ email: "bob@skillswap.com" });
  if (alice && bob) {
    const existing = await SwapRequest.findOne({ sender: alice._id, receiver: bob._id });
    if (!existing) {
      await SwapRequest.create({
        sender: alice._id,
        receiver: bob._id,
        skillToLearn: "DSA",
        skillToTeach: "React",
        message: "Let's swap!",
        status: "PENDING",
      });
      console.log("Created demo swap request (Alice -> Bob)");
    }
  }

  console.log("Seed done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
