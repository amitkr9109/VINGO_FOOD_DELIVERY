const { body } = require("express-validator");

const googleAuthRegisterValidation = [
    body("fullName").isLength({ min: 3 }).withMessage("name must be at least 3 characters only"),
    body("email").isEmail().withMessage("Invalid Email"),
    body("mobile").isLength({ min: 10 }).withMessage("mobile no must be at least 10 digits long"),
    body("role").isIn(["user", "owner", "deliveryboy"]).withMessage("role must be user, owner or deliveryboy"),
];

const googleAuthLoginValidation = [
    body("email").isEmail().withMessage("Invalid Email"),
];

module.exports = {
    googleAuthRegisterValidation,
    googleAuthLoginValidation,
};