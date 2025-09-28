const config = require('../config/config');
const cloudinary = require('cloudinary').v2;
const fs = require("fs");

const uploadOnCloudinary = async (file) => {
    cloudinary.config({ 
        cloud_name: config.CLOUDINARY_CLOUD_NAME, 
        api_key: config.CLOUDINARY_API_KEY, 
        api_secret: config.CLOUDINARY_API_SECRET
    });

    try {
        
        const result = await cloudinary.uploader.upload(file);
        fs.unlinkSync(file);
        return result.secure_url;

    } catch (error) {
        fs.unlinkSync(file);
        console.log(error);
    }
};

module.exports = {
    uploadOnCloudinary
};