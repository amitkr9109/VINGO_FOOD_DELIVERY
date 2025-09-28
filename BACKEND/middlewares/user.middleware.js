const { body } = require("express-validator");
const userModel = require("../models/user.model");

const registerUserValidation = [
    body("fullName").isLength({ min: 3 }).withMessage("name must be at least 3 characters only"),
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 4 }).withMessage("password must be at least 4 characters only"),
    body("mobile").isLength({ min: 10 }).withMessage("mobile no must be at least 10 digits long"),
    body("role").isIn(["user", "owner", "deliveryboy"]).withMessage("role must be user, owner or deliveryboy"),
];

const loginUserValidation = [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 4 }).withMessage("Password must be at least 4 characters only"),
];

const autUser = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token) {
        return res.status(401).json({ message: "Unauthorized User" });
    }
    try {
        const decoded = userModel.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid Token" });
    }
};

const sendOtpValidation = [ 
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Please enter a valid email"),
];

const verifyOtpValidation = [
    body("email").isEmail().withMessage("Invalid email"),
    body("otp").isLength({ min: 4, max: 4 }).withMessage("OTP must be 4 digits"),
]

const resetPasswordValidation = [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 4 }).withMessage("Password must be at least 4 characters only"),
];

module.exports = {
    registerUserValidation,
    loginUserValidation,
    autUser,
    sendOtpValidation,
    verifyOtpValidation,
    resetPasswordValidation,
};