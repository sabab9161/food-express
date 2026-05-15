import nodemailer from "nodemailer";

const sendEmail = async ({ to, otp }) => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPassword = process.env.EMAIL_PASSWORD?.trim();

  if (!emailUser || !emailPassword) {
    throw new Error("SMTP credentials missing");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE) === "true",
    requireTLS: true,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });

  const subject = "FoodExpress OTP Verification";

  await transporter.sendMail({
    from: `"FoodExpress" <${process.env.EMAIL_FROM_ADDRESS?.trim() || emailUser}>`,
    to,
    subject,
    text: `Your OTP is: ${otp}\nThis OTP expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172033;">
        <h2>FoodExpress OTP Verification</h2>
        <p>Your OTP is:
          <strong style="font-size: 24px; letter-spacing: 4px; color: #f97316;">
            ${otp}
          </strong>
        </p>
        <p>This OTP expires in 5 minutes.</p>
      </div>
    `,
  });
};

export default sendEmail;