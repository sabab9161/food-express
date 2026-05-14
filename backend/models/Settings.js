import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    platformName: { type: String, default: "FoodExpress", trim: true },
    logo: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    deliveryCharges: { type: Number, default: 0, min: 0 },
    openingTime: { type: String, default: "09:00" },
    closingTime: { type: String, default: "23:00" },
    taxPercentage: { type: Number, default: 5, min: 0 },
    supportEmail: { type: String, default: "" },
    supportPhone: { type: String, default: "" }
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema, "settings");

export default Settings;
