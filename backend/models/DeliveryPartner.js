import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    vehicleType: { type: String, required: true, trim: true },
    vehicleNumber: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Online", "Offline", "Busy", "Blocked"], default: "Offline" },
    earnings: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

const DeliveryPartner = mongoose.model("DeliveryPartner", deliveryPartnerSchema, "deliverypartners");

export default DeliveryPartner;
