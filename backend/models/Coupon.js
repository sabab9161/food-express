import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "flat"], required: true, default: "percentage" },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, default: 0, min: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableType: { type: String, enum: ["all", "restaurants", "foods"], default: "all" },
    restaurantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
    foodIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }]
  },
  { timestamps: true }
);

couponSchema.pre("validate", function validateCouponScope(next) {
  if (this.applicableType === "restaurants" && (!this.restaurantIds || this.restaurantIds.length === 0)) {
    this.invalidate("restaurantIds", "Select at least one restaurant");
  }

  if (this.applicableType === "foods" && (!this.foodIds || this.foodIds.length === 0)) {
    this.invalidate("foodIds", "Select at least one food item");
  }

  next();
});

const Coupon = mongoose.model("Coupon", couponSchema, "coupons");

export default Coupon;
