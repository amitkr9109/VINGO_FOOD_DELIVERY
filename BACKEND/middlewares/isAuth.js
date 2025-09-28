const jwt = require("jsonwebtoken");
const config = require("../config/config");

const isAuth = async (req, res, next) => {
    try {
        
        const token = req.cookies.token;
        if(!token) {
            return res.status(400).json({ message: "Token not found" });
        }

        const decodedToken = jwt.verify(token, config.JWT_SECRET);
        if(!decodedToken) {
            return res.status(400).json({ message: "Token not verified" });
        }
        req.userId = decodedToken._id;
        next();

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = {
    isAuth
};