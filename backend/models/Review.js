import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", default: null },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", default: null },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPartner", default: null },
    reviewType: {
      type: String,
      enum: ["food", "restaurant", "deliveryPartner"],
      required: true
    },
    customerName: { type: String, trim: true, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    reply: { type: String, default: "" },
    isVisible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

reviewSchema.index(
  { user: 1, order: 1, deliveryPartner: 1, reviewType: 1 },
  {
    unique: true,
    partialFilterExpression: { reviewType: "deliveryPartner" }
  }
);

const Review = mongoose.model("Review", reviewSchema, "reviews");

export default Review;
