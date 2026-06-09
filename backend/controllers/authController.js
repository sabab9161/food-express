import Otp from "../models/Otp.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

const OTP_TTL_MINUTES = 5;
const phoneRegex = /^[6-9]\d{9}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;

const passwordValidationMessage = "Password is weak";
const phoneValidationMessage = "Enter valid 10 digit Indian mobile number";

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
  restaurantName: user.restaurantName,
  restaurantAddress: user.restaurantAddress,
  city: user.city,
});

const validateUserSignup = ({ name, email, phone = "", password }) => {
  if (!name?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) {
    return "All fields are required";
  }

  if (!passwordRegex.test(password.trim())) {
    return passwordValidationMessage;
  }

  if (!phoneRegex.test(phone.trim())) {
    return phoneValidationMessage;
  }

  return null;
};

const validateAdminSignup = ({
  name,
  email,
  phone,
  password,
  restaurantName,
  restaurantAddress,
  city,
}) => {
  if (
    !name?.trim() ||
    !email?.trim() ||
    !phone?.trim() ||
    !password?.trim() ||
    !restaurantName?.trim() ||
    !restaurantAddress?.trim() ||
    !city?.trim()
  ) {
    return "All fields are required";
  }

  if (!passwordRegex.test(password.trim())) {
    return passwordValidationMessage;
  }

  if (!phoneRegex.test(phone.trim())) {
    return phoneValidationMessage;
  }

  return null;
};

const normalizeSignupIdentity = ({ email, phone }) => ({
  email: email.toLowerCase().trim(),
  phone: phone.trim(),
});

const findDuplicateSignupIdentity = async ({ email, phone }) => {
  const existingEmail = await User.findOne({ email });
  if (existingEmail) return "Email already registered";

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) return "Mobile number already registered";

  return null;
};

const duplicateKeyMessage = (error) => {
  if (error.code !== 11000) return null;

  const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
  return field === "email"
    ? "Email already registered"
    : "Mobile number already registered";
};

export const register = async (req, res) => {
  try {
    console.log("Register Body:", req.body);

    const validationError = validateUserSignup(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError, body: req.body });
    }

    const { email: normalizedEmail, phone: normalizedPhone } =
      normalizeSignupIdentity(req.body);

    const duplicateMessage = await findDuplicateSignupIdentity({
      email: normalizedEmail,
      phone: normalizedPhone,
    });

    if (duplicateMessage) {
      return res.status(400).json({ message: duplicateMessage });
    }

    const user = await User.create({
      name: req.body.name.trim(),
      email: normalizedEmail,
      password: req.body.password.trim(),
      role: "user",
      phone: normalizedPhone,
      address: req.body.address?.trim() || "",
    });

    res.status(201).json({
      message: "Account created successfully",
      token: generateToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("register failed:", error);

    const message = duplicateKeyMessage(error);
    if (message) {
      return res.status(400).json({ message });
    }

    res.status(500).json({ message: error.message });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    console.log("Admin Register Body:", req.body);

    const validationError = validateAdminSignup(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError, body: req.body });
    }

    const { email: normalizedEmail, phone: normalizedPhone } =
      normalizeSignupIdentity(req.body);

    const duplicateMessage = await findDuplicateSignupIdentity({
      email: normalizedEmail,
      phone: normalizedPhone,
    });

    if (duplicateMessage) {
      return res.status(400).json({ message: duplicateMessage });
    }

    const user = await User.create({
      name: req.body.name.trim(),
      email: normalizedEmail,
      password: req.body.password.trim(),
      role: "admin",
      phone: normalizedPhone,
      address: req.body.restaurantAddress.trim(),
      restaurantName: req.body.restaurantName.trim(),
      restaurantAddress: req.body.restaurantAddress.trim(),
      city: req.body.city.trim(),
    });

    res.status(201).json({
      message: "Admin account created successfully",
      token: generateToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("admin-register failed:", error);

    const message = duplicateKeyMessage(error);
    if (message) {
      return res.status(400).json({ message });
    }

    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role = "user" } = req.body;

    const normalizedRole = role === "admin" ? "admin" : "user";
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role !== normalizedRole) {
      return res.status(403).json({
        message:
          user.role === "admin"
            ? "Please use Admin Login for this account"
            : "Please use User Login for this account",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    res.json({
      token: generateToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("login failed:", error);
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, role = "user" } = req.body;

    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedRole = role === "admin" ? "admin" : "user";

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({
      email: normalizedEmail,
      role: normalizedRole,
    });

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email: normalizedEmail, purpose: "forgot-password", role: normalizedRole },
      {
        email: normalizedEmail,
        otp,
        purpose: "forgot-password",
        role: normalizedRole,
        expiresAt,
        attempts: 0,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("FoodExpress Forgot Password OTP:", otp);

    try {
      await sendEmail({ to: normalizedEmail, otp });
      return res.json({ message: "Password reset OTP sent to email" });
    } catch (error) {
      console.error("Email failed:", error.smtpMessage || error.message);
      return res.json({
        message: "OTP generated. Email delivery failed. Check server logs for OTP.",
        devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
      });
    }
  } catch (error) {
    console.error("forgot-password failed:", error);
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, role = "user" } = req.body;

    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedRole = role === "admin" ? "admin" : "user";

    if (!normalizedEmail || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!passwordRegex.test(newPassword.trim())) {
      return res.status(400).json({ message: passwordValidationMessage });
    }

    const otpDoc = await Otp.findOne({
      email: normalizedEmail,
      otp,
      purpose: "forgot-password",
      role: normalizedRole,
    });

    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({
      email: normalizedEmail,
      role: normalizedRole,
    });

    if (!user) {
      await otpDoc.deleteOne();
      return res.status(404).json({ message: "Account not found" });
    }

    user.password = newPassword.trim();
    await user.save();
    await otpDoc.deleteOne();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("reset-password failed:", error);
    res.status(500).json({ message: error.message || "Unable to reset password" });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: serializeUser(req.user) });
};