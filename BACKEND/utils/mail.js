const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: config.EMAIL,
    pass: config.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendOtpMail = async (to, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"Vingo Food" <${config.EMAIL}>`,
      to,
      subject: "Reset Your Password",
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`
    });
    console.log("✅ OTP Mail sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending OTP mail:", error);
    throw error;
  }
};

const sendDeliveryOtpMail = async (user, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"Vingo Food" <${config.EMAIL}>`,
      to: user.email,
      subject: "Delivery OTP",
      html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`
    });
    console.log("✅ Delivery Mail sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending Delivery mail:", error);
    throw error;
  }
};

module.exports = {
  sendOtpMail,
  sendDeliveryOtpMail,
};
