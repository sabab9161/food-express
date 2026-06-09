import { body, param, validationResult } from "express-validator";

const strongPasswordMessage = "Password is weak";
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array(), body: req.body });
  }
  next();
};

export const validateObjectId = (field = "id") => [
  param(field).isMongoId().withMessage("Invalid id"),
  validate
];

export const signupValidators = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 80 }).withMessage("Name is too long"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").trim().matches(strongPasswordRegex).withMessage(strongPasswordMessage),
  body("confirmPassword").trim().notEmpty().withMessage("All fields are required"),
  body("phone").matches(phoneRegex).withMessage("Enter valid 10 digit Indian mobile number"),
  body("role").optional().isIn(["user", "admin"]).withMessage("Invalid role"),
  validate
];

export const loginValidators = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  body("role").optional().isIn(["user", "admin"]).withMessage("Invalid role"),
  validate
];

export const otpVerifyValidators = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("Valid OTP is required"),
  validate
];

export const forgotPasswordValidators = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("role").optional().isIn(["user", "admin"]).withMessage("Invalid role"),
  validate
];

export const resetPasswordValidators = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("Valid OTP is required"),
  body("newPassword").matches(strongPasswordRegex).withMessage(strongPasswordMessage),
  validate
];

export const foodValidators = [
  body("name").trim().notEmpty().withMessage("Food name is required").isLength({ max: 120 }).withMessage("Food name is too long"),
  body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
  body("offerPrice").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Valid offer price is required"),
  body("category").optional().trim().isLength({ max: 80 }).withMessage("Category is too long"),
  body("restaurant").optional().isMongoId().withMessage("Invalid restaurant"),
  validate
];

export const restaurantValidators = [
  body("name").trim().notEmpty().withMessage("Restaurant name is required").isLength({ max: 120 }).withMessage("Restaurant name is too long"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("city").optional().trim().isLength({ max: 80 }).withMessage("City is too long"),
  validate
];

export const orderValidators = [
  body("items").isArray({ min: 1 }).withMessage("Order must contain at least one item"),
  body("items.*.food").optional().isMongoId().withMessage("Invalid food item"),
  body("deliveryAddress").trim().notEmpty().withMessage("Delivery address is required"),
  body("phone").matches(phoneRegex).withMessage("Enter valid 10 digit Indian mobile number"),
  body("paymentMethod").isIn(["COD", "UPI", "Card", "PayLater"]).withMessage("Invalid payment method"),
  body("paymentDetails.upiId").if(body("paymentMethod").equals("UPI")).matches(upiRegex).withMessage("Valid UPI ID is required"),
  body("paymentDetails.cardNumber").if(body("paymentMethod").equals("Card")).customSanitizer((value) => String(value || "").replace(/\D/g, "")).isLength({ min: 16, max: 16 }).withMessage("Card number must be 16 digits"),
  body("paymentDetails.cvv").if(body("paymentMethod").equals("Card")).isLength({ min: 3, max: 3 }).isNumeric().withMessage("CVV must be 3 digits"),
  body("paymentDetails.payLaterProvider").if(body("paymentMethod").equals("PayLater")).trim().notEmpty().withMessage("Pay later provider is required"),
  validate
];

export const orderStatusValidators = [
  body("status").trim().notEmpty().withMessage("Status is required"),
  validate
];

export const assignDeliveryPartnerValidators = [
  body("deliveryPartnerId").isMongoId().withMessage("Valid delivery partner is required"),
  validate
];

export const couponValidators = [
  body("code").trim().notEmpty().withMessage("Coupon code is required").isLength({ max: 40 }).withMessage("Coupon code is too long"),
  body("discountType").optional().isIn(["percentage", "fixed", "Percent", "Fixed"]).withMessage("Invalid discount type"),
  body("discountValue").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Valid discount is required"),
  validate
];

export const paymentValidators = [
  body("amount").isFloat({ min: 0 }).withMessage("Valid amount is required"),
  body("paymentMethod").isIn(["COD", "UPI", "Card", "PayLater"]).withMessage("Invalid payment method"),
  body("paymentStatus").optional().isIn(["Pending", "Paid", "Failed", "Refunded"]).withMessage("Invalid payment status"),
  body("paymentDetails.cardLast4").optional({ checkFalsy: true }).isLength({ min: 4, max: 4 }).isNumeric().withMessage("Only card last 4 digits may be stored"),
  body("paymentDetails").custom((details = {}) => {
    if (details.cardNumber || details.cvv) throw new Error("Do not store full card number or CVV");
    return true;
  }),
  validate
];

export const validateUploadFile = (file) => {
  if (!file) return true;
  if (!allowedImageTypes.includes(file.mimetype)) {
    throw new Error("Only jpg, jpeg, png, and webp files are allowed");
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("File size must be 2MB or less");
  }
  return true;
};
