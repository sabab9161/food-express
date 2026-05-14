import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, adminOnly, getSettings).put(protect, adminOnly, updateSettings);

export default router;
