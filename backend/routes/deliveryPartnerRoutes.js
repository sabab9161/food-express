import express from "express";
import {
  createDeliveryPartner,
  deleteDeliveryPartner,
  getDeliveryPartners,
  updateDeliveryPartner
} from "../controllers/deliveryPartnerController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, adminOnly, getDeliveryPartners).post(protect, adminOnly, createDeliveryPartner);
router.route("/:id").put(protect, adminOnly, updateDeliveryPartner).delete(protect, adminOnly, deleteDeliveryPartner);

export default router;
