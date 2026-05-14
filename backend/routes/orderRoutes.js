import express from "express";
import {
  assignDeliveryPartner,
  createOrder,
  getAllOrders,
  getMyOrders,
  updateOrderStatus
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import {
  assignDeliveryPartnerValidators,
  orderStatusValidators,
  orderValidators,
  validateObjectId
} from "../middleware/validators.js";

const router = express.Router();

router.post("/", protect, orderValidators, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.put(
  "/:id/assign-delivery-partner",
  protect,
  adminOnly,
  validateObjectId(),
  assignDeliveryPartnerValidators,
  assignDeliveryPartner
);
router.put("/:id/status", protect, adminOnly, validateObjectId(), orderStatusValidators, updateOrderStatus);

export default router;
