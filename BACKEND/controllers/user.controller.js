const { validationResult } = require("express-validator");
const userModel = require("../models/user.model");
const { sendOtpMail } = require("../utils/mail");


const registerUserController = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { fullName, email, password, mobile, role } = req.body;
        if(!fullName && !email && !mobile && !role) {
            throw new Error("All fields are required");
        }

        const isAlreadyExist = await userModel.findOne({ email });
        if(isAlreadyExist) {
            return res.status(400).json({ message: "User already exist." });
        };

        const hashedPassword = await userModel.hashPassword(password);

        const user = await userModel.create({
            fullName,
            email,
            mobile,
            role,
            password: hashedPassword
        });
        
        const token = user.generateAuthToken();

        res.status(200).json({ message: "User register successfully", user, token });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const loginUserController = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
           return res.status(400).json({ message: "Invalid email or password" }); 
        }

        const token = user.generateAuthToken();

        res.cookie("token", token, {
            httpOnly: true,
            secure: true, 
            sameSite: "none"
        });

        res.status(200).json({ message: "User login successfully", user, token });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const logOutUserController = async (req, res, next) => {
    try {

        if (!req.user) {
            return res.status(401).json({ message: "User not logged in" });
        }

        res.clearCookie("token");

        res.status(200).json({ message: "User logout successfully" });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const currentUserController = async (req, res, next) => {
    try {
        
        const userId = req.userId;
        if(!userId) {
            return res.status(400).json({ message: "userId not found" });
        }

        const user = await userModel.findById(userId);
        if(!user) {
            return res.status(400).json({ message: "users not found" });
        }

        return res.status(200).json(user);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

const deleteUserController = async (req, res) => {
    try {
        
        const id = req.params.id;

        const user = await userModel.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const sendOtpController = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        
        const { email } = req.body;
        
        const user = await userModel.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "User does not exists." });
        }

        const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();

        user.resetOtp = generateOtp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        user.isOtpVerified = false;

        await user.save();

        await sendOtpMail(email, generateOtp);

        return res.status(200).json({ message: "OTP sent successfully", generateOtp });

    } catch (error) {
       return res.status(400).json({ message: error.message }); 
    }
};

const verifyOtpController = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        
        const { email, otp } = req.body;
        
        const user = await userModel.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "User does not exists." });
        }
        if(user.resetOtp != otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if(user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Expires OTP" });
        }

        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined;

        await user.save();

        return res.status(200).json({ message: "OTP verify successfully" });

    } catch (error) {
       return res.status(400).json({ message: error.message }); 
    }
};

const resetPasswordController = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        
        const { email, password } = req.body;
        
        const user = await userModel.findOne({ email });
        if(!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "OTP verification required" });
        }

        const hashedPassword = await userModel.hashPassword(password);

        user.password = hashedPassword;
        user.isOtpVerified = false;

        await user.save();

        return res.status(200).json({ message: "password reset successfully", });

    } catch (error) {
       return res.status(400).json({ message: error.message }); 
    }
};

const updateUserLocationController = async (req, res) => {
    try {
        
        const { lat, lon } = req.body;

        const user = await userModel.findByIdAndUpdate(req.userId, {
            location: {
                type: "Point",
                coordinates: [lon, lat]
            }
        }, { new: true });

        if(!user) {
            return res.status(400).json({ message: "User not found" });
        };

        return res.status(200).json({ message: "location updated" });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logOutUserController,
    currentUserController,
    deleteUserController,
    sendOtpController,
    verifyOtpController,
    resetPasswordController,
    updateUserLocationController,
}