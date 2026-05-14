import nodemailer from "nodemailer";

const sendEmail = async ({ to, otp }) => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPassword = process.env.EMAIL_PASSWORD?.trim();

  if (!emailUser || !emailPassword) {
    throw new Error("SMTP credentials missing. Check EMAIL_USER and EMAIL_PASSWORD in backend/.env");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPassword
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const subject = "FoodExpress OTP Verification";
  const text = `Your OTP is: ${otp}\nThis OTP expires in 5 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172033;">
      <h2>FoodExpress OTP Verification</h2>
      <p>Your OTP is: <strong style="font-size: 24px; letter-spacing: 4px; color: #f97316;">${otp}</strong></p>
      <p>This OTP expires in 5 minutes.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"FoodExpress" <${process.env.EMAIL_FROM_ADDRESS || emailUser}>`,
      to,
      subject,
      text,
      html
    });
  } catch (error) {
    const smtpMessage = error.response || error.message || "Unable to send email";
    console.error(`Nodemailer sendMail failed: ${smtpMessage}`);
    error.smtpMessage = smtpMessage;
    error.statusCode = error.code === "EAUTH" ? 401 : 502;
    throw error;
  }
};

export default sendEmail;
