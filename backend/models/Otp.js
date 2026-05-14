import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    otp: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ["signup", "login", "forgot-password"],
      required: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  { timestamps: true }
);

const Otp = mongoose.model("OTP", otpSchema, "otps");

export default Otp;
