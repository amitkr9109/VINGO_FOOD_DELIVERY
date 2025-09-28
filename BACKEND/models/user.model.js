const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    mobile: {
        type: Number,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "owner", "deliveryboy"],
        required: true,
    },
    resetOtp: {
        type: String,
    },
    isOtpVerified: {
        type: Boolean,
        default: false,
    },
    otpExpires: {
        type: Date,
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0,0],
        },
    },
    socketId: {
        type: String,
    },
    isOnline: {
        type: Boolean,
        default: false
    },

}, {
    timestamps: true
});



userSchema.index({ location: "2dsphere" });

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, config.JWT_SECRET, { expiresIn: config.JWT_SECRET_EXPIRES_IN });
    return token;
};

userSchema.statics.verifyToken = function (token) {
    if(!token) {
        throw new Error("Token is required");
    }
    return jwt.verify(token, config.JWT_SECRET);
};

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;