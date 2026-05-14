import Coupon from "../models/Coupon.js";
import HelpDeskMessage from "../models/HelpDeskMessage.js";
import Order from "../models/Order.js";

const fallbackResponse =
  "I'm sorry, I could not understand. Please contact support or try asking about order, payment, coupon, refund, or delivery.";

const noOrderResponse = "You have no orders yet. Please place an order first.";

const intentKeywords = {
  cancel: ["cancel", "cancellation"],
  payment: ["payment", "paid", "card", "upi", "cod", "cash", "paylater", "refund", "failed"],
  coupon: ["coupon", "offer", "discount", "promo"],
  deliveryPartner: ["partner", "delivery boy", "rider", "driver", "phone", "mobile"],
  account: ["account", "login", "signup", "password", "profile"],
  foodMenu: ["food", "menu", "item", "price", "restaurant food"],
  restaurant: ["restaurant", "hotel", "shop", "store"],
  orderStatus: ["order", "status", "track", "tracking", "where", "delivery", "arrive"]
};

const hasKeyword = (text, keywords) => keywords.some((keyword) => text.includes(keyword));

const detectIntent = (text) => {
  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    if (hasKeyword(text, keywords)) {
      return intent;
    }
  }

  return "unknown";
};

const getLatestOrder = (userId) =>
  Order.findOne({ user: userId })
    .sort({ createdAt: -1 })
    .populate({ path: "restaurant", strictPopulate: false })
    .populate("deliveryPartner")
    .populate({
      path: "items.food",
      populate: {
        path: "restaurant",
        select: "name address city openingTime closingTime deliveryTime"
      }
    });

const getRestaurantFromOrder = (order) => {
  if (!order) return null;
  if (order.restaurant) return order.restaurant;

  const itemWithRestaurant = order.items?.find((item) => item.food?.restaurant);
  return itemWithRestaurant?.food?.restaurant || null;
};

const getLatestOrderFoodSummary = (order) => {
  const items = order.items || [];
  if (!items.length) return "No food items were found in your latest order.";

  return items
    .map((item) => `${item.name || item.food?.name || "Food item"} x ${item.quantity}`)
    .join(", ");
};

const getActiveCouponsResponse = async () => {
  const coupons = await Coupon.find({
    isActive: true,
    expiryDate: { $gte: new Date() }
  }).sort({ expiryDate: 1 });

  if (!coupons.length) {
    return "There are no active coupons available right now.";
  }

  const codes = coupons.map((coupon) => coupon.code).join(", ");
  return `Active coupons available: ${codes}.`;
};

const buildIntentResponse = async (intent, latestOrder) => {
  if (intent === "coupon") {
    return getActiveCouponsResponse();
  }

  if (intent === "account") {
    return "For account issues, please check your profile page. If you have login, signup, or password issues, contact support with your registered email or mobile number.";
  }

  if (!latestOrder) {
    return noOrderResponse;
  }

  const orderStatus = latestOrder.status;
  const paymentStatus = latestOrder.paymentStatus;
  const paymentMethod = latestOrder.paymentMethod;

  if (intent === "orderStatus") {
    return `Your latest order is currently ${orderStatus}. Payment status is ${paymentStatus}.`;
  }

  if (intent === "cancel") {
    if (["Pending", "Accepted"].includes(orderStatus)) {
      return "You can cancel this order from My Orders page.";
    }

    return `This order cannot be cancelled now because it is already ${orderStatus}.`;
  }

  if (intent === "payment") {
    return `Your payment method is ${paymentMethod} and payment status is ${paymentStatus}.`;
  }

  if (intent === "deliveryPartner") {
    if (latestOrder.deliveryPartner) {
      return `Your delivery partner is ${latestOrder.deliveryPartner.name}. Mobile number: ${latestOrder.deliveryPartner.phone}.`;
    }

    return "Delivery partner is not assigned yet.";
  }

  if (intent === "restaurant") {
    const restaurant = getRestaurantFromOrder(latestOrder);

    if (!restaurant) {
      return "Restaurant details are not available for your latest order.";
    }

    return `Your latest order is from ${restaurant.name}.`;
  }

  if (intent === "foodMenu") {
    return `Food items in your latest order: ${getLatestOrderFoodSummary(latestOrder)}. You can browse the Foods page to view menu items and prices.`;
  }

  return fallbackResponse;
};

export const chatWithHelpDesk = async (req, res) => {
  try {
    const message = req.body.message?.trim();

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const text = message.toLowerCase();
    const intent = detectIntent(text);

    console.log("HelpDesk message:", message);
    console.log("Detected intent:", intent);

    const latestOrder = await getLatestOrder(req.user._id);
    const response = await buildIntentResponse(intent, latestOrder);

    await HelpDeskMessage.create({
      user: req.user._id,
      message,
      response
    });

    res.status(201).json({ reply: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHelpDeskHistory = async (req, res) => {
  try {
    const messages = await HelpDeskMessage.find({ user: req.user._id })
      .sort({ createdAt: 1 })
      .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
