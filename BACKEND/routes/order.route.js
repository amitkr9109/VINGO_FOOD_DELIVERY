const express = require("express");
const { isAuth } = require("../middlewares/isAuth");
const router = express.Router();
const orderController = require("../controllers/order.controller");

router.post("/place-order", isAuth, orderController.placeOrderController);

router.post("/verify-payment", isAuth, orderController.verifyPaymentController);

router.get("/my-orders", isAuth, orderController.getMyOrdersController);

router.delete("/delete/:id", isAuth, orderController.deleteOrderController);

router.post("/update-status/:orderId/:shopId", isAuth, orderController.updateOrderStatusController);

router.get("/delivery-assignment", isAuth, orderController.getDeliveryBoyAssignmentController);

router.get("/accept-order/:assignmentId", isAuth, orderController.acceptOrderController);

router.get("/current-order", isAuth, orderController.getCurrentOrderController);

router.get("/track-order-user/:id", isAuth, orderController.getTrackOrderUserController);

router.post("/send-delivery-otp", isAuth, orderController.sendDeliveryOTPController);

router.post("/verify-delivery-otp", isAuth, orderController.verifyDeliveryOTPController);

router.get("/all-orders-delivery-boy", isAuth, orderController.deliveryBoyAllOrdersController);

router.delete("/history-delete/:id", isAuth, orderController.deliveryBoyOrdersHistoryDelete);

module.exports = router;