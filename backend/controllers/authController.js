import Otp from "../models/Otp.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

const OTP_TTL_MINUTES = 5;
const phoneRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;
const passwordValidationMessage =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
const phoneValidationMessage = "Enter valid 10 digit Indian mobile number";

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address
});

const sendOtpEmail = async ({ email, otp, purpose, role }) => {
  console.log(`Sending ${purpose} OTP email for ${role} account: ${email}`);
  await sendEmail({ to: email, otp });
};

const createAndSendOtp = async ({ email, purpose, role }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await Otp.findOneAndUpdate(
    { email: normalizedEmail, purpose, role },
    { email: normalizedEmail, otp, purpose, role, expiresAt, attempts: 0 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("FoodExpress OTP:", otp);

  try {
    await sendOtpEmail({ email: normalizedEmail, otp, purpose, role });
    return { otp, emailDelivered: true };
  } catch (error) {
    console.error("Email failed:", error.smtpMessage || error.message);
    return { otp, emailDelivered: false };
  }
};

const otpDeliveryFailedResponse = (otp) => ({
  message: "OTP generated. Email delivery failed. Check Render logs for OTP.",
  devOtp: process.env.NODE_ENV !== "production" ? otp : undefined
});

const verifyOtpCode = async ({ email, otp, purpose, role }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const otpDoc = await Otp.findOne({ email: normalizedEmail, purpose, role });

  if (!otpDoc || otpDoc.expiresAt < new Date()) {
    return null;
  }

  if (otpDoc.attempts >= 5) {
    await otpDoc.deleteOne();
    return null;
  }

  if (otpDoc.otp !== otp) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    return null;
  }

  return otpDoc;
};

const validateUserSignup = ({ name, email, password, confirmPassword, phone = "", address = "" }) => {
  if (!name || !email || !password || !confirmPassword || !phone || !address) {
    return "All fields are required";
  }

  if (!passwordRegex.test(password)) {
    return passwordValidationMessage;
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
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
  confirmPassword,
  restaurantName,
  restaurantAddress,
  city
}) => {
  if (
    !name ||
    !email ||
    !phone ||
    !password ||
    !confirmPassword ||
    !restaurantName ||
    !restaurantAddress ||
    !city
  ) {
    return "All fields are required";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  if (!passwordRegex.test(password)) {
    return passwordValidationMessage;
  }

  if (!phoneRegex.test(phone.trim())) {
    return phoneValidationMessage;
  }

  return null;
};

const normalizeSignupIdentity = ({ email, phone }) => ({
  email: email.toLowerCase().trim(),
  phone: phone.trim()
});

const findDuplicateSignupIdentity = async ({ email, phone }) => {
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return "Email already registered";
  }

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    return "Mobile number already registered";
  }

  return null;
};

const duplicateKeyMessage = (error) => {
  if (error.code !== 11000) return null;

  const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
  return field === "email" ? "Email already registered" : "Mobile number already registered";
};

export const sendSignupOtp = async (req, res) => {
  try {
    const { role = "user" } = req.body;
    const normalizedRole = role === "admin" ? "admin" : "user";
    const validationError =
      normalizedRole === "admin"
        ? validateAdminSignup(req.body)
        : validateUserSignup(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { email: normalizedEmail, phone: normalizedPhone } = normalizeSignupIdentity(req.body);
    const duplicateMessage = await findDuplicateSignupIdentity({ email: normalizedEmail, phone: normalizedPhone });
    if (duplicateMessage) {
      return res.status(400).json({ message: duplicateMessage });
    }

    const otpResult = await createAndSendOtp({ email: normalizedEmail, purpose: "signup", role: normalizedRole });

    if (!otpResult.emailDelivered) {
      return res.json(otpDeliveryFailedResponse(otpResult.otp));
    }

    res.json({ message: "Signup OTP sent to email" });
  } catch (error) {
    console.error("send-signup-otp failed:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Unable to send signup OTP" });
  }
};

export const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp, role = "user" } = req.body;
    const normalizedRole = role === "admin" ? "admin" : "user";
    const validationError =
      normalizedRole === "admin"
        ? validateAdminSignup(req.body)
        : validateUserSignup(req.body);

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const otpDoc = await verifyOtpCode({ email, otp, purpose: "signup", role: normalizedRole });
    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const { email: normalizedEmail, phone: normalizedPhone } = normalizeSignupIdentity(req.body);
    const duplicateMessage = await findDuplicateSignupIdentity({ email: normalizedEmail, phone: normalizedPhone });
    if (duplicateMessage) {
      await otpDoc.deleteOne();
      return res.status(400).json({ message: duplicateMessage });
    }

    const userPayload =
      normalizedRole === "admin"
        ? {
            name: req.body.name,
            email: normalizedEmail,
            password: req.body.password,
            role: "admin",
            phone: normalizedPhone,
            address: req.body.restaurantAddress,
            restaurantName: req.body.restaurantName,
            restaurantAddress: req.body.restaurantAddress,
            city: req.body.city
          }
        : {
            name: req.body.name,
            email: normalizedEmail,
            password: req.body.password,
            role: "user",
            phone: normalizedPhone,
            address: req.body.address
          };

    const user = await User.create(userPayload);
    await otpDoc.deleteOne();

    res.status(201).json({
      message: "Account created successfully",
      token: generateToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    console.error("verify-signup-otp failed:", error);
    const message = duplicateKeyMessage(error);
    if (message) {
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const sendLoginOtp = async (req, res) => {
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
        message: user.role === "admin" ? "Please use Admin Login for this account" : "Please use User Login for this account"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    const otpResult = await createAndSendOtp({ email: normalizedEmail, purpose: "login", role: normalizedRole });

    if (!otpResult.emailDelivered) {
      return res.json(otpDeliveryFailedResponse(otpResult.otp));
    }

    res.json({ message: "Login OTP sent to email" });
  } catch (error) {
    console.error("send-login-otp failed:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Unable to send login OTP" });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp, role = "user" } = req.body;
    const normalizedRole = role === "admin" ? "admin" : "user";
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpDoc = await verifyOtpCode({ email: normalizedEmail, otp, purpose: "login", role: normalizedRole });
    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.role !== normalizedRole) {
      await otpDoc.deleteOne();
      return res.status(401).json({ message: "Invalid login request" });
    }

    await otpDoc.deleteOne();

    res.json({
      token: generateToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    console.error("verify-login-otp failed:", error);
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

    const user = await User.findOne({ email: normalizedEmail, role: normalizedRole });
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    const otpResult = await createAndSendOtp({
      email: normalizedEmail,
      purpose: "forgot-password",
      role: normalizedRole
    });

    if (!otpResult.emailDelivered) {
      return res.json(otpDeliveryFailedResponse(otpResult.otp));
    }

    res.json({ message: "Password reset OTP sent to email" });
  } catch (error) {
    console.error("forgot-password failed:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Unable to send password reset OTP" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword, role = "user" } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedRole = role === "admin" ? "admin" : "user";

    if (!normalizedEmail || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: passwordValidationMessage });
    }

    const otpDoc = await verifyOtpCode({
      email: normalizedEmail,
      otp,
      purpose: "forgot-password",
      role: normalizedRole
    });
    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email: normalizedEmail, role: normalizedRole });
    if (!user) {
      await otpDoc.deleteOne();
      return res.status(404).json({ message: "Account not found" });
    }

    user.password = newPassword;
    await user.save();
    await otpDoc.deleteOne();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("reset-password failed:", error);
    res.status(500).json({ message: error.message || "Unable to reset password" });
  }
};

export const register = sendSignupOtp;
export const registerAdmin = sendSignupOtp;
export const login = sendLoginOtp;

export const getMe = async (req, res) => {
  res.json({ user: serializeUser(req.user) });
};
