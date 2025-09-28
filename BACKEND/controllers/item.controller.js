const itemModel = require("../models/item.model");
const shopModel = require ("../models/shop.model");
const { uploadOnCloudinary } = require ("../utils/cloudinary");

const addItemController = async (req, res) => {
    try {
        
        const { name, category, foodType, price, shopId } = req.body;
        if(!name || !category || !foodType || !price || !shopId) {
            throw new Error("All fields are required");
        }

        let image;

        if(req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }

        const shop = await shopModel.findOne({ _id: shopId, owner: req.userId });
        if(!shop) {
            return res.status(400).json({ message: "shop not found" });
        }

        const item = await itemModel.create({
            name,
            category, 
            foodType, 
            price, 
            image, 
            shop: shop._id
        });

        shop.items.push(item._id);
        await shop.save();
        await shop.populate("items owner")
        const populatedItem = await itemModel.findById(item._id).populate("shop", "city name image")

        const io = req.app.get("io");
        if (io) {
            io.emit("newItem", populatedItem);
        }

        return res.status(200).json(shop);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const editItemController = async (req, res) => {
    try {
        
        const id = req.params.id;

        const { name, category, foodType, price, shopId } = req.body;
        if(!name || !category || !foodType || !price || !shopId) {
            throw new Error("All fields are required");
        }

        let image;
        if(req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        

        const item = await itemModel.findByIdAndUpdate(id, {
            name,
            category,
            foodType,
            price,
            image,
        }, { new: true });

        if(!item) {
            return res.status(400).json({ message: "item not found" });
        }

        const populatedItem = await itemModel.findById(item._id).populate("shop", "city name image");

        const io = req.app.get("io");
        if (io && populatedItem) {
            io.emit("editItem", populatedItem);
        }

        const shop = await shopModel.findOne({ owner: req.userId }).populate("items");
        if(!shop) {
            return res.status(400).json({ message: "shop not found" });
        }

        return res.status(200).json(shop);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const deleteItemController = async (req, res) => {
    try {   
        const id = req.params.id;

        const item = await itemModel.findByIdAndDelete(id);
        if(!item) {
            return res.status(400).json({ message: "item not found" });
        }

        const io = req.app.get("io");
        if(io && item) {
            io.emit("deleteItem", item._id);
        }

        const shop = await shopModel.findOne({ owner: req.userId });
        if(!shop) {
            return res.status(400).json({ message: "shop not found" });
        }
        
        shop.items = shop.items.filter(i => i !== item._id);
        await shop.save();
        await shop.populate("items");

        return res.status(200).json(shop);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getAllItemsByCityController = async (req, res) => {
    try {
       
        const { city } = req.params;
        if(!city) {
            return res.status(400).json({ message: "city is required" });
        }

        const shops = await shopModel.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate("items");
        if(!shops) {
            return res.status(400).json({ message: "shops not found" });
        }

        const shopsId = shops.map((shop) => shop._id);

        const items = await itemModel.find({ shop: { $in: shopsId } });

        return res.status(200).json(items);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

const getAllShopsController = async (req, res) => {
    try {
        
        const { id } = req.params;

        const shop = await shopModel.findById(id).populate("items");
        if(!shop) {
            return res.status(400).json({ message: "Shop not found" });
        }

        return res.status(200).json({ shop, items: shop.items })

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

const searchAllItemsInput = async (req, res) => {
    try {
        
        const { query, city} = req.query;
        if(!query || !city) {
            return null;
        }

        const shops = await shopModel.find({
            city: {$regex: new RegExp(`^${city}$`, "i")}
        }).populate("items");
        if(!shops) {
            return res.status(400).json({ message: "shops not found" });
        }

        const shopId = shops.map(shop => shop._id);

        const items = await itemModel.find({
            shop: {$in: shopId},
            $or: [
                {name: {$regex: query, $options: "i"}},
                {category: {$regex: query, $options: "i"}}
            ]
        }).populate("shop", "name image");

        return res.status(200).json(items);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}


module.exports = {
    addItemController,
    editItemController,
    deleteItemController,
    getAllItemsByCityController, 
    getAllShopsController,  
    searchAllItemsInput,
};