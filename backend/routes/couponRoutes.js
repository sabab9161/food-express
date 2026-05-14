import express from "express";
import { applyCoupon, createCoupon, deleteCoupon, getCoupons, updateCoupon } from "../controllers/couponController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { couponValidators, validateObjectId } from "../middleware/validators.js";

const router = express.Router();

router.route("/").get(protect, adminOnly, getCoupons).post(protect, adminOnly, couponValidators, createCoupon);
router.post("/apply", protect, applyCoupon);
router.route("/:id").put(protect, adminOnly, validateObjectId(), couponValidators, updateCoupon).delete(protect, adminOnly, validateObjectId(), deleteCoupon);

export default router;
