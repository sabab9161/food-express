import express from "express";
import {
  createNotification,
  deleteNotification,
  getMyNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../controllers/notificationController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", protect, getMyNotifications);
router.put("/read-all", protect, markAllNotificationsRead);
router.put("/:id/read", protect, markNotificationRead);
router.route("/").get(protect, adminOnly, getNotifications).post(protect, adminOnly, createNotification);
router.delete("/:id", protect, adminOnly, deleteNotification);

export default router;
