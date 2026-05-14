import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ["order", "delivery", "payment", "offer"], default: "order" },
    isRead: { type: Boolean, default: false },
    targetAudience: { type: String, enum: ["All", "Users", "Admins", "Delivery Partners"], default: "Users" }
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema, "notifications");

export default Notification;
