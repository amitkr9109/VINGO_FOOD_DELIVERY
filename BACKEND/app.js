const express = require("express");
const app = express();
const cors = require("cors");
const connectToDB = require("./db/db");
connectToDB();
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.route");
const shopRoutes = require("./routes/shop.route");
const itemRoutes = require("./routes/item.route");
const orderRoutes = require("./routes/order.route");

app.use(cors({
    origin: [
        "https://vingo-food-delivery-frontend.onrender.com",
        "http://localhost:5173"
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hello world!");
});

app.use("/users", userRoutes);
app.use("/shops", shopRoutes);
app.use("/items", itemRoutes);
app.use("/orders", orderRoutes);

module.exports = app;