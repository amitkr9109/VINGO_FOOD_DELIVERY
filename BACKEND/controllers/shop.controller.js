const shopModel = require ("../models/shop.model");
const { uploadOnCloudinary } = require ("../utils/cloudinary");

const createShopController = async (req, res) => {
    try {
        
        const { name, city, state, address } = req.body;
        if(!name || !city || !state || !address) {
            throw new Error("All fields are required");
        }

        let image;

        if(req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }

        const shop = await shopModel.create({
            name, 
            city, 
            state, 
            address, 
            image, 
            owner: req.userId
        });
        await shop.populate("owner items");

        const io = req.app.get("io");
        if(io) {
            io.emit("newShop", shop);
        }

        return res.status(200).json(shop);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const editShopController = async (req, res) => {
    try {   
        const { name, city, state, address } = req.body;
        if(!name || !city || !state || !address) {
            throw new Error("All fields are required");
        }

        const shopId = req.params.id;

        let image;  
        if(req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        const shop = await shopModel.findByIdAndUpdate(shopId, {
            name, 
            city,
            state,
            address,
            image
        }, { new: true }).populate("owner items");  

        const io = req.app.get("io");
        if(io && shop) {
            io.emit("editShop", shop);
        }
        
        return res.status(200).json(shop);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const deleteShopController = async (req, res) => {
    try {
        const shopId = req.params.id;
        const shop = await shopModel.findByIdAndDelete(shopId);

        const io = req.app.get("io");
        if(io && shop) {
            io.emit("deleteShop", shop._id);
        }

        return res.status(200).json({ message: "Shop deleted successfully" });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getMyShopController = async (req, res) => {
    try {
        
        const shop = await shopModel.find({ owner: req.userId }).populate("owner items");
        if(!shop) {
            return res.status(400).json({ message: "Shop not found" });
        }

        return res.status(200).json(shop);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getShopByCity = async (req, res) => {
    try {
        
        const { city } = req.params;

        const shops = await shopModel.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate("items");

        if(!shops) {
            return res.status(400).json({ message: "shops not found" });
        }

        return res.status(200).json(shops);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}



module.exports = {
    createShopController,
    getMyShopController,
    editShopController,
    deleteShopController,
    getShopByCity
}