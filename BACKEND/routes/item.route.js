const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item.controller");
const upload = require("../middlewares/multer");
const { isAuth } = require("../middlewares/isAuth");

router.post("/item-add", isAuth, upload.single("image"), itemController.addItemController);

router.post("/edit/:id", isAuth, upload.single("image"), itemController.editItemController);

router.delete("/delete/:id", isAuth, itemController.deleteItemController);

router.get("/get-by-city/:city", isAuth, itemController.getAllItemsByCityController);

router.get("/get-shops/:id", isAuth, itemController.getAllShopsController);

router.get("/search-items", isAuth, itemController.searchAllItemsInput);



module.exports = router;