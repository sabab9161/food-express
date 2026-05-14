import jwt from "jsonwebtoken";

// JWT payload is intentionally small and signed only on the backend.
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d"
    }
  );
};

export default generateToken;
