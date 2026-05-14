import express from "express";
import { chatWithHelpDesk, getHelpDeskHistory } from "../controllers/helpDeskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", protect, chatWithHelpDesk);
router.get("/history", protect, getHelpDeskHistory);

export default router;
