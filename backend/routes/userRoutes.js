import express from "express";
import { deleteUser, getDashboardStats, getUserOrders, getUsers, updateProfile, updateUserStatus } from "../controllers/userController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);
router.get("/stats", protect, adminOnly, getDashboardStats);
router.put("/profile", protect, updateProfile);
router.get("/:id/orders", protect, adminOnly, getUserOrders);
router.put("/:id/status", protect, adminOnly, updateUserStatus);
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;
