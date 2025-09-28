const { validationResult } = require("express-validator");
const userModel = require("../models/user.model");

const googleAuthRegisterController = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
       const { fullName, email, mobile, role } = req.body;

       let user = await userModel.findOne({ email });
       if(user) {
        return res.status(400).json({ message: "User already exist." });
       }
       if(!user) {
        user = await userModel.create({
            fullName,
            email,
            mobile,
            role 
        })
       }

       const token = user.generateAuthToken();
       res.cookie("token", token, {
        httpOnly: true,
        secure: true, 
        sameSite: "none"
       });

       return res.status(200).json(user);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const googleAuthLoginController = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
       const { email } = req.body;

       let user = await userModel.findOne({ email });
       if(!user) {
        return res.status(400).json({ message: "Invalid email or password" });
       }

       const token = user.generateAuthToken();
       res.cookie("token", token);

       return res.status(200).json(user);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = {
    googleAuthRegisterController,
    googleAuthLoginController,
}