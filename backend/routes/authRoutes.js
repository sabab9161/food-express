import express from "express";
import rateLimit from "express-rate-limit";
import {
  forgotPassword,
  getMe,
  login,
  register,
  registerAdmin,
  resetPassword
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  forgotPasswordValidators,
  loginValidators,
  resetPasswordValidators,
  signupValidators
} from "../middleware/validators.js";

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 10 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication requests, please try again later" }
});

const passwordResetLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isProduction ? 5 : 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Please wait and try again." }
});

router.post("/forgot-password", authLimiter, passwordResetLimiter, forgotPasswordValidators, forgotPassword);
router.post("/reset-password", authLimiter, resetPasswordValidators, resetPassword);
router.post("/register", authLimiter, signupValidators, register);
router.post("/admin-register", authLimiter, signupValidators, registerAdmin);
router.post("/login", authLimiter, loginValidators, login);
router.get("/me", protect, getMe);

export default router;
