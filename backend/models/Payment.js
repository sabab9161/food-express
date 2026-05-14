import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["COD", "UPI", "Card", "PayLater"], default: "COD" },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed", "Refunded"], default: "Pending" },
    paymentDetails: {
      upiApp: { type: String, default: "" },
      upiId: { type: String, default: "" },
      cardLast4: { type: String, default: "" },
      payLaterProvider: { type: String, default: "" }
    },
    transactionId: { type: String, default: "" }
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema, "payments");

export default Payment;
