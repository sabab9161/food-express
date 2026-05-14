import express from "express";
import { createReview, deleteReview, getReviews, replyReview } from "../controllers/reviewController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, adminOnly, getReviews).post(protect, createReview);
router.put("/:id/reply", protect, adminOnly, replyReview);
router.delete("/:id", protect, adminOnly, deleteReview);

export default router;
