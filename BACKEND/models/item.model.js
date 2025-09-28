const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
    },
    category: {
        type: String,
        enum: [
            "Snacks",
            "Main Course",
            "Desserts",
            "Pizza",
            "Burgers",
            "Sandwiches",
            "South Indian",
            "North Indian",
            "Chinese",
            "Fast Food",
            "Others",
        ],
        required: true,
    },
    foodType: {
        type: String,
        enum: ["veg", "non veg"],
        required: true,
    },
    price: {
        type: Number,
        min: 0,
        required: true,
    },
    rating: {
        average: {
            type: Number,
            default: 0,
        },
        count: {
            type: Number,
            default: 0,
        },
    },

}, {
    timestamps: true
});

const itemModel = mongoose.model("Item", itemSchema);
module.exports = itemModel;