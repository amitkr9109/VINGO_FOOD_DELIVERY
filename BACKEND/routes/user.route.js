const express = require("express");
const router = express.Router();
const userMiddleware = require("../middlewares/user.middleware");
const userController = require("../controllers/user.controller");
const googleMiddleware = require("../middlewares/google.auth.middleware");
const googleController = require("../controllers/google.controller");
const { isAuth } = require("../middlewares/isAuth");

router.post("/register", userMiddleware.registerUserValidation, userController.registerUserController);

router.post("/login", userMiddleware.loginUserValidation, userController.loginUserController);

router.get("/logout", userMiddleware.autUser, userController.logOutUserController);

router.get("/current", isAuth, userController.currentUserController);

router.delete("/delete/:id", isAuth, userController.deleteUserController);

router.post("/send-otp", userMiddleware.sendOtpValidation, userController.sendOtpController);

router.post("/verify-otp", userMiddleware.verifyOtpValidation, userController.verifyOtpController);

router.post("/reset-password", userMiddleware.resetPasswordValidation, userController.resetPasswordController);

router.post("/google-register", googleMiddleware.googleAuthRegisterValidation, googleController.googleAuthRegisterController);

router.post("/google-login", googleMiddleware.googleAuthLoginValidation, googleController.googleAuthLoginController);

router.post("/update-location", isAuth, userController.updateUserLocationController);

module.exports = router;