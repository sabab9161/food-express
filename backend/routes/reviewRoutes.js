import express from "express";
import { createReview, deleteReview, getDeliveryPartnerReviews, getReviews, replyReview } from "../controllers/reviewController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, adminOnly, getReviews).post(protect, createReview);
router.get("/delivery-partner/:partnerId", getDeliveryPartnerReviews);
router.put("/:id/reply", protect, adminOnly, replyReview);
router.delete("/:id", protect, adminOnly, deleteReview);

export default router;
