const { Resend } = require("@resend/node");
const config = require("../config/config");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpMail = async (to, otp) => {
  try {
    await resend.emails.send({
      from: config.EMAIL,   // ye wahi email hogi jo aapne verify ki hai resend pe
      to,
      subject: "Reset Your Password",
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
    console.log("OTP mail sent to:", to);
  } catch (err) {
    console.error("Mail send error:", err);
    throw new Error("Failed to send OTP mail");
  }
};

const sendDeliveryOtpMail = async (user, otp) => {
  try {
    await resend.emails.send({
      from: config.EMAIL,
      to: user.email,
      subject: "Delivery OTP",
      html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
    console.log("Delivery OTP sent to:", user.email);
  } catch (err) {
    console.error("Delivery mail send error:", err);
    throw new Error("Failed to send delivery OTP");
  }
};

module.exports = {
  sendOtpMail,
  sendDeliveryOtpMail,
};
