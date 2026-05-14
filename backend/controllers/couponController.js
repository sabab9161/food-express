import Coupon from "../models/Coupon.js";

const normalizeCouponPayload = (body) => ({
  code: body.code,
  discountType: body.discountType,
  discountValue: Number(body.discountValue),
  minOrderAmount: Number(body.minOrderAmount || 0),
  maxDiscountAmount: Number(body.maxDiscountAmount || 0),
  expiryDate: body.expiryDate,
  isActive: body.isActive,
  applicableType: body.applicableType || "all",
  restaurantIds: body.applicableType === "restaurants" ? body.restaurantIds || [] : [],
  foodIds: body.applicableType === "foods" ? body.foodIds || [] : []
});

const calculateDiscount = (coupon, totalAmount) => {
  const discount =
    coupon.discountType === "percentage"
      ? (Number(totalAmount) * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscountAmount > 0) {
    return Math.min(discount, coupon.maxDiscountAmount);
  }

  return discount;
};

const hasApplicableItem = ({ coupon, cartItems, restaurantId }) => {
  if (coupon.applicableType === "all") return true;

  if (coupon.applicableType === "restaurants") {
    const restaurantIds = coupon.restaurantIds.map((id) => id.toString());
    const cartRestaurantIds = cartItems
      .map((item) => item.restaurantId || item.restaurant?._id || item.restaurant)
      .filter(Boolean)
      .map((id) => id.toString());

    if (restaurantId && restaurantIds.includes(restaurantId.toString())) return true;
    return cartRestaurantIds.some((id) => restaurantIds.includes(id));
  }

  if (coupon.applicableType === "foods") {
    const foodIds = coupon.foodIds.map((id) => id.toString());
    const cartFoodIds = cartItems
      .map((item) => item.food || item._id || item.id)
      .filter(Boolean)
      .map((id) => id.toString());

    return cartFoodIds.some((id) => foodIds.includes(id));
  }

  return false;
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate("restaurantIds", "name")
      .populate("foodIds", "name")
      .sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(normalizeCouponPayload(req.body));
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.code === 11000 ? "Coupon code already exists" : error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    Object.assign(coupon, normalizeCouponPayload(req.body));
    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } catch (error) {
    res.status(400).json({ message: error.code === 11000 ? "Coupon code already exists" : error.message });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code, cartItems = [], restaurantId, totalAmount } = req.body;
    const amount = Number(totalAmount);

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "Coupon is inactive" });
    }

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (amount < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount is ${coupon.minOrderAmount}` });
    }

    if (!hasApplicableItem({ coupon, cartItems, restaurantId })) {
      return res.status(400).json({ message: "Coupon is not applicable for these items" });
    }

    const discountAmount = Math.min(calculateDiscount(coupon, amount), amount);
    const finalAmount = Math.max(amount - discountAmount, 0);

    res.json({
      discountAmount,
      finalAmount,
      message: "Coupon applied successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
