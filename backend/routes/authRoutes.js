import express from "express";
import rateLimit from "express-rate-limit";
import {
  forgotPassword,
  getMe,
  login,
  register,
  registerAdmin,
  resetPassword,
  sendLoginOtp,
  sendSignupOtp,
  verifyLoginOtp,
  verifySignupOtp
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  forgotPasswordValidators,
  loginValidators,
  otpVerifyValidators,
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

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isProduction ? 5 : 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Please wait and try again." }
});

router.post("/send-signup-otp", authLimiter, otpLimiter, signupValidators, sendSignupOtp);
router.post("/verify-signup-otp", authLimiter, signupValidators, otpVerifyValidators, verifySignupOtp);
router.post("/send-login-otp", authLimiter, otpLimiter, loginValidators, sendLoginOtp);
router.post("/verify-login-otp", authLimiter, otpVerifyValidators, verifyLoginOtp);
router.post("/forgot-password", authLimiter, otpLimiter, forgotPasswordValidators, forgotPassword);
router.post("/reset-password", authLimiter, resetPasswordValidators, resetPassword);
router.post("/register", authLimiter, signupValidators, register);
router.post("/admin-register", authLimiter, signupValidators, registerAdmin);
router.post("/login", authLimiter, loginValidators, login);
router.get("/me", protect, getMe);

export default router;
