import express from "express";
import { createPayment, getPayments, refundPayment, updatePayment } from "../controllers/paymentController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { paymentValidators, validateObjectId } from "../middleware/validators.js";

const router = express.Router();

router.route("/").get(protect, adminOnly, getPayments).post(protect, adminOnly, paymentValidators, createPayment);
router.put("/:id", protect, adminOnly, validateObjectId(), paymentValidators, updatePayment);
router.put("/:id/refund", protect, adminOnly, validateObjectId(), refundPayment);

export default router;
