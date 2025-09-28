const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = nodemailer.createTransport({
  service: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: config.EMAIL,
    pass: config.PASSWORD,
  },
});

const sendOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: config.EMAIL,
    to,
    subject: "Reset Your Password",
    html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`
  })
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