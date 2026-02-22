import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";

const TEST_URI = process.env.MONGO_URI || "mongodb://localhost:27017/skillswap_test";

describe("Auth routes", () => {
  beforeAll(async () => {
    await mongoose.connect(TEST_URI);
  });
  afterAll(async () => {
    await User.deleteMany({ email: /test-auth@/ });
    await mongoose.disconnect();
  });

  test("POST /api/auth/register returns 201 and user", async () => {
    const email = `test-auth-${Date.now()}@test.com`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email, password: "password123" })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty("email", email);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("POST /api/auth/login with invalid credentials returns 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@test.com", password: "wrong" })
      .expect(401);
    expect(res.body.success).toBe(false);
  });
});
