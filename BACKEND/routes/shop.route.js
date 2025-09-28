const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop.controller");
const upload = require("../middlewares/multer");
const { isAuth } = require("../middlewares/isAuth");

router.post("/create", isAuth, upload.single("image"), shopController.createShopController);

router.get("/get-my", isAuth, shopController.getMyShopController);

router.put("/edit/:id", isAuth, upload.single("image"), shopController.editShopController);

router.delete("/delete/:id", isAuth, shopController.deleteShopController);

router.get("/get-by-city/:city", isAuth, shopController.getShopByCity);

module.exports = router;