const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = nodemailer.createTransport({
  // service: "GMAIL",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.EMAIL,
    pass: config.PASSWORD,
  },
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