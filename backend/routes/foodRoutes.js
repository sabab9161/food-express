import express from "express";
import {
  createFood,
  deleteFood,
  getFoodById,
  getFoods,
  updateFood
} from "../controllers/foodController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { foodValidators, validateObjectId } from "../middleware/validators.js";

const router = express.Router();

router.route("/").get(getFoods).post(protect, adminOnly, foodValidators, createFood);
router
  .route("/:id")
  .get(validateObjectId(), getFoodById)
  .put(protect, adminOnly, validateObjectId(), foodValidators, updateFood)
  .delete(protect, adminOnly, deleteFood);

export default router;
