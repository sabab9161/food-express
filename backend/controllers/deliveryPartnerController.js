import DeliveryPartner from "../models/DeliveryPartner.js";

const duplicateMessage = (error) => {
  if (error.code !== 11000) return error.message;
  const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
  return field === "email" ? "Email already exists" : "Mobile number already exists";
};

export const getDeliveryPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDeliveryPartner = async (req, res) => {
  try {
    const partner = await DeliveryPartner.create(req.body);
    res.status(201).json(partner);
  } catch (error) {
    res.status(400).json({ message: duplicateMessage(error) });
  }
};

export const updateDeliveryPartner = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!partner) return res.status(404).json({ message: "Delivery partner not found" });
    res.json(partner);
  } catch (error) {
    res.status(400).json({ message: duplicateMessage(error) });
  }
};

export const deleteDeliveryPartner = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ message: "Delivery partner not found" });
    res.json({ message: "Delivery partner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
