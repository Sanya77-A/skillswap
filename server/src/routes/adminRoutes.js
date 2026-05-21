// This file defines the Express router for admin-related routes in the application.

// Import dependencies
import { Router } from "express"; // Express Router for defining route handlers
import * as admin from "../controllers/adminController.js"; // Import all admin controller functions
import { protect } from "../middlewares/auth.js"; // Middleware to ensure user is authenticated
import { adminOnly } from "../middlewares/role.js"; // Middleware to ensure user has admin privileges

// Create a new Router instance
const router = Router();

// Apply authentication and admin check middleware to all routes defined below
router.use(protect, adminOnly);

// Route to get a list of all users (GET /admin/users)
router.get("/users", admin.getUsers);

// Route to get a list of all reports (GET /admin/reports)
router.get("/reports", admin.getReports);

// Route to block a user by ID (PATCH /admin/users/:id/block)
router.patch("/users/:id/block", admin.blockUser);

// Route to unblock a user by ID (PATCH /admin/users/:id/unblock)
router.patch("/users/:id/unblock", admin.unblockUser);

// Route to delete a user by ID (DELETE /admin/users/:id)
router.delete("/users/:id", admin.deleteUser);

// Route to get admin statistics (GET /admin/stats)
router.get("/stats", admin.getStats);

// Export the router to be used in the main server file
export default router;
