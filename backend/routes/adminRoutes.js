import express from "express";
import { getAdminAnalytics, getAdminDashboard } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getAdminDashboard);
router.get("/analytics", protect, adminOnly, getAdminAnalytics);

export default router;
