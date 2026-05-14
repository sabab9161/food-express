import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", default: null },
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", default: null },
    customerName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    reply: { type: String, default: "" },
    isFake: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema, "reviews");

export default Review;
