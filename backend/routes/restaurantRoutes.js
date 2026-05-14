import express from "express";
import {
  createRestaurant,
  deleteRestaurant,
  getRestaurantById,
  getRestaurants,
  updateRestaurant
} from "../controllers/restaurantController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { restaurantValidators, validateObjectId } from "../middleware/validators.js";

const router = express.Router();

router.route("/").get(getRestaurants).post(protect, adminOnly, restaurantValidators, createRestaurant);
router
  .route("/:id")
  .get(validateObjectId(), getRestaurantById)
  .put(protect, adminOnly, validateObjectId(), restaurantValidators, updateRestaurant)
  .delete(protect, adminOnly, deleteRestaurant);

export default router;
