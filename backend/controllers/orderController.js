import Food from "../models/Food.js";
import Notification from "../models/Notification.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, phone, paymentDetails = {} } = req.body;
    const methodMap = {
      "Cash on Delivery": "COD",
      COD: "COD",
      UPI: "UPI",
      Card: "Card",
      PayLater: "PayLater"
    };
    const paymentMethod = methodMap[req.body.paymentMethod] || "COD";
    const paymentStatus = ["UPI", "Card", "PayLater"].includes(paymentMethod) ? "Paid" : "Pending";

    if (!items?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const sanitizedPaymentDetails = {
      upiApp: "",
      upiId: "",
      cardLast4: "",
      payLaterProvider: ""
    };

    if (paymentMethod === "UPI") {
      if (!paymentDetails.upiId?.trim()) {
        return res.status(400).json({ message: "UPI ID is required" });
      }
      sanitizedPaymentDetails.upiApp = paymentDetails.upiApp || "";
      sanitizedPaymentDetails.upiId = paymentDetails.upiId.trim();
    }

    if (paymentMethod === "Card") {
      const digits = String(paymentDetails.cardNumber || "").replace(/\D/g, "");
      if (digits.length !== 16) {
        return res.status(400).json({ message: "Card number must be 16 digits" });
      }
      if (!/^\d{3}$/.test(String(paymentDetails.cvv || ""))) {
        return res.status(400).json({ message: "CVV must be 3 digits" });
      }
      if (!paymentDetails.expiry?.trim()) {
        return res.status(400).json({ message: "Expiry date is required" });
      }
      sanitizedPaymentDetails.cardLast4 = digits.slice(-4);
    }

    if (paymentMethod === "PayLater") {
      if (!paymentDetails.payLaterProvider?.trim()) {
        return res.status(400).json({ message: "Pay later provider is required" });
      }
      sanitizedPaymentDetails.payLaterProvider = paymentDetails.payLaterProvider.trim();
    }

    const foodIds = items.map((item) => item.food || item._id);
    const foods = await Food.find({ _id: { $in: foodIds } });
    const foodMap = new Map(foods.map((food) => [food._id.toString(), food]));

    const orderItems = items.map((item) => {
      const id = String(item.food || item._id);
      const food = foodMap.get(id);
      if (!food) throw new Error("One or more food items were not found");

      return {
        food: food._id,
        name: food.name,
        price: food.offerPrice > 0 ? food.offerPrice : food.price,
        quantity: Number(item.quantity),
        image: food.image
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 50 ? 0 : 3.99;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryAddress,
      phone,
      paymentMethod,
      paymentStatus,
      paymentDetails: sanitizedPaymentDetails,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee
    });

    await Payment.create({
      order: order._id,
      user: req.user._id,
      amount: order.total,
      paymentMethod,
      paymentStatus,
      paymentDetails: sanitizedPaymentDetails,
      transactionId: `FE${Date.now()}`
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("deliveryPartner", "name phone vehicleNumber vehicleType status")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignDeliveryPartner = async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.deliveryPartner) {
      return res.status(400).json({
        message: "Once you assign partner, you cannot change or unassign partner."
      });
    }

    if (!deliveryPartnerId) {
      return res.status(400).json({ message: "Select a delivery partner" });
    }

    order.deliveryPartner = deliveryPartnerId;
    order.deliveryPartnerAssignedAt = new Date();
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("deliveryPartner", "name phone vehicleNumber vehicleType status");

    const partner = updatedOrder.deliveryPartner;
    await Notification.create({
      user: order.user,
      order: order._id,
      title: "Delivery Partner Assigned",
      message: `Your order has been assigned to ${partner.name}. Mobile: ${partner.phone}. Vehicle: ${partner.vehicleNumber || "Not available"}.`,
      type: "delivery"
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const statusOrder = ["Pending", "Accepted", "Preparing", "Ready for Pickup", "Out for Delivery", "Delivered"];
    const allowedTransitions = {
      Pending: ["Accepted", "Cancelled"],
      Accepted: ["Preparing", "Cancelled"],
      Preparing: ["Ready for Pickup", "Cancelled"],
      "Ready for Pickup": ["Out for Delivery"],
      "Out for Delivery": ["Delivered"],
      Delivered: [],
      Cancelled: ["Refunded"],
      Refunded: []
    };

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const currentStatus = order.status;
    const nextStatus = req.body.status || currentStatus;

    if (currentStatus === "Delivered") {
      return res.status(400).json({ message: "Delivered orders cannot be changed" });
    }

    if (currentStatus === "Cancelled" && nextStatus !== "Refunded") {
      return res.status(400).json({ message: "Cancelled orders cannot be changed" });
    }

    if (currentStatus === "Refunded") {
      return res.status(400).json({ message: "Refunded orders cannot be changed" });
    }

    if (nextStatus !== currentStatus) {
      const currentStatusIndex = statusOrder.indexOf(currentStatus);
      const nextStatusIndex = statusOrder.indexOf(nextStatus);

      if (currentStatusIndex !== -1 && nextStatusIndex !== -1 && nextStatusIndex < currentStatusIndex) {
        return res.status(400).json({ message: "Order status cannot move backward" });
      }

      if (nextStatus === "Refunded" && currentStatus !== "Cancelled" && order.paymentStatus !== "Refunded") {
        return res.status(400).json({ message: "Order can be refunded only after cancellation or payment refund" });
      }

      if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
        return res.status(400).json({ message: "Invalid order status transition" });
      }
    }

    const updates = {
      status: nextStatus
    };

    if (nextStatus === "Refunded") {
      updates.paymentStatus = "Refunded";
      await Payment.updateMany({ order: order._id }, { paymentStatus: "Refunded" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("user", "name email phone").populate("deliveryPartner", "name phone vehicleNumber vehicleType status");

    if (nextStatus !== currentStatus) {
      await Notification.create({
        user: order.user,
        order: order._id,
        title: "Order Status Updated",
        message: `Your order status is now ${nextStatus}.`,
        type: "order"
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const [totalOrders, revenueResult] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }])
    ]);

    res.json({
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
