import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email phone")
      .populate("order")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, { paymentStatus: "Refunded" }, { new: true, runValidators: true });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.order) {
      await Order.findByIdAndUpdate(payment.order, { paymentStatus: "Refunded", status: "Refunded" }, { runValidators: true });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
