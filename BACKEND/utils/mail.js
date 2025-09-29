const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.EMAIL,
    pass: config.PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});

const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: config.EMAIL,
      to,
      subject: "Reset Your Password",
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`
    });
    console.log("OTP mail sent to:", to);
  } catch (err) {
    console.error("Mail send error:", err);
    throw new Error("Failed to send OTP mail");
  }
};


const sendDeliveryOtpMail = async (user, otp) => {
  await transporter.sendMail({
    from: config.EMAIL,
    to: user.email,
    subject: "Delivery OTP",
    html: `<p>Your OTP for delivery otp is <b>${otp}</b>. It expires in 5 minutes.</p>`
  })
};

module.exports = {
  sendOtpMail,
  sendDeliveryOtpMail,
}