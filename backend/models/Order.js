import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(items) => items.length > 0, "Order must contain at least one item"]
    },
    deliveryAddress: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "Card", "PayLater"],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending"
    },
    paymentDetails: {
      upiApp: { type: String, default: "" },
      upiId: { type: String, default: "" },
      cardLast4: { type: String, default: "" },
      payLaterProvider: { type: String, default: "" }
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null
    },
    deliveryPartnerAssignedAt: {
      type: Date,
      default: null
    },
    subtotal: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      default: 3.99
    },
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Preparing", "Ready for Pickup", "Out for Delivery", "Delivered", "Cancelled", "Refunded"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema, "orders");

export default Order;
