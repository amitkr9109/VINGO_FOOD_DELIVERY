const config = require("../config/config");
const deliveryAssignmentModel = require("../models/deliveryAssignment.model");
const orderModel = require("../models/order.model");
const shopModel = require("../models/shop.model");
const userModel = require("../models/user.model");
const { sendDeliveryOtpMail } = require("../utils/mail");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET
});

const placeOrderController = async (req, res) => {
    try {

        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
        if(cartItems.length == 0 || !cartItems) {
            return res.status(400).json({ message: "cart is empty !" });
        }
        if(!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({ message: "Please, send complete deliveryAddress" });
        }

        const cleanedCartItems = cartItems.map(item => ({
            ...item,
            id: typeof item.id === "object" && item.id !== null
                ? item.id._id?.toString() || item.id.toString()
                : item.id?.toString(),
            shop: typeof item.shop === "object" && item.shop !== null
                ? item.shop._id?.toString() || item.shop.toString()
                : item.shop?.toString()
        }));

        const groupItemsByShop = {};

        cleanedCartItems.forEach(item => {
            const shopId = item.shop;
            if(!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = [];
            }
            groupItemsByShop[shopId].push(item);
        });

        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
            const shop = await shopModel.findById(shopId).populate("owner")
            if(!shop) {
                return res.status(400).json({ message: "Shop not found" });
            }

            const items = groupItemsByShop[shopId];
            const subTotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

            return {
                shop: shop._id,
                owner: shop.owner._id,
                subTotal,
                shopOrderItems: items.map((i) => ({
                    item: i.id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                }))
            }
        }));




        // razorpay payment integration


        if(paymentMethod === "online") {
            const razorOrder = await instance.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: "INR",
                receipt: `receipt_${Date.now()}`
            });

            const newOrder = await orderModel.create({
                user: req.userId,
                paymentMethod,
                deliveryAddress,
                totalAmount,
                shopOrders,
                razorpayOrderId: razorOrder.id,
                payment: false
            });

            return res.status(200).json({
                razorOrder,
                orderId: newOrder._id,
            });

        }


        const newOrder = await orderModel.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        })

        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
        await newOrder.populate("shopOrders.shop", "name")
        await newOrder.populate("shopOrders.owner", "name socketId")
        await newOrder.populate("user", "name email mobile")

        const io = req.app.get("io");

        if(io) {
            newOrder.shopOrders.forEach(shopOrder => {
                const ownerSocketId = shopOrder.owner.socketId;
                if(ownerSocketId) {
                    io.to(ownerSocketId).emit("newOrder", {
                        _id: newOrder._id,
                        paymentMethod: newOrder.paymentMethod,
                        user: newOrder.user,
                        shopOrders: [shopOrder],
                        createdAt: newOrder.createdAt,
                        deliveryAddress: newOrder.deliveryAddress,
                        payment: newOrder.payment,
                        totalAmount: newOrder.totalAmount
                    })
                }
            })
        }

        return res.status(201).json(newOrder);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

const verifyPaymentController = async (req, res) => {
    try {
        
        const { razorpay_payment_id, orderId } = req.body;

        const payment = await instance.payments.fetch(razorpay_payment_id);
        if(!payment || payment.status != "captured") {
            return res.status(400).json({ message: "payment does not captured" });
        }

        const order = await orderModel.findById(orderId);
        if(!order) {
            return res.status(400).json({ message: "order not found" });
        }

        order.payment = true;
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        await order.populate("shopOrders.shopOrderItems.item", "name image price")
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.owner", "name socketId")
        await order.populate("user", "name email mobile")

        const io = req.app.get("io");

        if(io) {
            order.shopOrders.forEach((shopOrder) => {
                const ownerSocketId = shopOrder.owner.socketId;
                if(ownerSocketId) {
                    io.to(ownerSocketId).emit("newOrder", {
                        _id: order._id,
                        paymentMethod: order.paymentMethod,
                        user: order.user,
                        shopOrders: [shopOrder],
                        createdAt: order.createdAt,
                        deliveryAddress: order.deliveryAddress,
                        payment: order.payment,
                        totalAmount: order.totalAmount
                    })
                }
            })
        }

        return res.status(200).json(order);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

const getMyOrdersController = async (req, res) => {
    try {
        
        const user = await userModel.findById(req.userId);

        if(user.role == "user") {
            const orders = await orderModel.find({ user: req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "name email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")

            return res.status(200).json(orders);    

        }
        else if(user.role == "owner") {
            const orders = await orderModel.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("user")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

            const filteredOrders = orders.map((order => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                shopOrders: order.shopOrders.filter(odr => odr.owner._id == req.userId),
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress,
                payment: order.payment,
                totalAmount: order.totalAmount
            })))

            return res.status(200).json(filteredOrders);
        }

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

const deleteOrderController = async (req, res) => {
    try {
        
        const id = req.params.id;

        const order = await orderModel.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const io = req.app.get("io");
        if(io && order) {
            io.emit("delete-order", order._id);
        }

        return res.status(200).json({ message: "Order deleted successfully" });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const updateOrderStatusController = async (req, res) => {
    try {
       
        const { orderId, shopId } = req.params;
        const {status} = req.body;

        const order = await orderModel.findById(orderId);

        const shopOrder = order.shopOrders.find(odr => odr.shop == shopId);
        if(!shopOrder) {
            return res.status(400).json({ message: "shop order not found" });
        }

        shopOrder.status = status;

        let deliveryBoysPayload = []

        if(status === "out of delivery" || !shopOrder.assignment) {
            const { longitude, latitude } = order.deliveryAddress;

            const nearByDeliveryBoys = await userModel.find({
                role: "deliveryboy",
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [ Number(longitude), Number(latitude) ] },
                        $maxDistance: 5000
                    }
                }
            });

            const nearByIds = nearByDeliveryBoys.map(boy => boy._id);

            const busyIds = await deliveryAssignmentModel.find({
                assignedTo: { $in: nearByIds },
                status: { $nin: [ "brodcasted", "completed" ] }
            }).distinct("assignedTo");

            const busyIdSet = new Set(busyIds.map(id => String(id)));

            const availableBoys = nearByDeliveryBoys.filter(boy => !busyIdSet.has(String(boy._id)));

            const candidates = availableBoys.map(boy => boy._id);
            if(candidates.length === 0) {
                await order.save();
                return res.json({ message: "order status updated but there is no available delivery boys." });
            }

            const deliveryAssignment = await deliveryAssignmentModel.create({
                order: order._id,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                brodcastedTo: candidates,
                status: "brodcasted"
            });

            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;
            shopOrder.assignment = deliveryAssignment._id;

            deliveryBoysPayload = availableBoys.map(boy => ({
                id: boy._id,
                fullName: boy.fullName,
                longitude: boy.location.coordinates?.[0],
                latitude: boy.location.coordinates?.[1],
                mobile: boy.mobile
            }))
            await deliveryAssignment.populate("order")
            await deliveryAssignment.populate("shop")

            const io = req.app.get("io");

            if(io) {
                availableBoys.forEach(deliveryBoy => {
                    const deliveryBoySocketId = deliveryBoy.socketId;
                    if(deliveryBoySocketId) {
                        io.to(deliveryBoySocketId).emit("newAssignment", {
                            sentTo: deliveryBoy._id,
                            assignmentId: deliveryAssignment?._id,
                            orderId: deliveryAssignment?.order?._id,
                            shopName: deliveryAssignment?.shop?.name,
                            deliveryAddress: deliveryAssignment?.order?.deliveryAddress,
                            items: deliveryAssignment.order.shopOrders.find(item => item._id.equals(deliveryAssignment.shopOrderId)).shopOrderItems || [],
                            subTotal: deliveryAssignment.order.shopOrders.find(total => total._id.equals(deliveryAssignment.shopOrderId))?.subTotal
                        })
                    }
                })
            }
        }


        await order.save();

        const updatedShopOrder = order.shopOrders.find(odr => odr.shop == shopId);

        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")
        await order.populate("user", "socketId")

        const io = req.app.get("io");

        if(io) {
            const userSocketId = order.user.socketId;
            if(userSocketId) {
                io.to(userSocketId).emit("update-status", {
                    orderId: order._id,
                    shopId: updatedShopOrder.shop._id,
                    status: updatedShopOrder.status,
                    userId: order.user?._id
                })
            }
        }

        return res.status(200).json({
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder?.assignment._id
        });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

const getDeliveryBoyAssignmentController = async (req, res) => {
    try {
        
        const deliveryBoyId = req.userId;

        const assignments = await deliveryAssignmentModel.find({
            brodcastedTo: deliveryBoyId,
            status: "brodcasted"
        }).populate("order shop");

        const formated = assignments?.map(ass => ({
            assignmentId: ass?._id,
            orderId: ass?.order?._id,
            shopName: ass?.shop?.name,
            deliveryAddress: ass?.order?.deliveryAddress,
            items: ass?.order?.shopOrders?.find(item => item._id.equals(ass.shopOrderId)).shopOrderItems || [],
            subTotal: ass?.order?.shopOrders?.find(total => total._id.equals(ass.shopOrderId))?.subTotal
        }));

        return res.status(200).json(formated);

    } catch (error) {
      return res.status(400).json({ message: error.message });  
    }
};

const acceptOrderController = async (req, res) => {
    try {
        
        const {assignmentId} = req.params;

        const assignment = await deliveryAssignmentModel.findById(assignmentId);
        if(!assignment) {
            return res.status(400).json({ message: "Assignment not found" });
        }

        if(assignment.status !== "brodcasted") {
            return res.status(400).json({ message: "Assignment is expired, because another delivery boy is accepted this order." });
        }

        const alreadyAssignedDeliveryBoy = await deliveryAssignmentModel.findOne({
            assignedTo: req.userId,
            status: { $nin: ["brodcasted", "completed"] }
        });
        if(alreadyAssignedDeliveryBoy) {
            return res.status(400).json({ message: "You are already assigned to another order." });
        }

        assignment.assignedTo = req.userId;
        assignment.status = "assigned";
        assignment.acceptedAt = new Date();
        await assignment.save();

        const order = await orderModel.findById(assignment.order);
        if(!order) {
            return res.status(400).json({ message: "order not found" });
        }

        let shopOrder = order.shopOrders.id(assignment.shopOrderId);
        shopOrder.assignedDeliveryBoy = req.userId;
        await order.save();

        return res.status(200).json({ message: "order accepted successfully" });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getCurrentOrderController = async (req, res) => {
    try {
        
        const assignment = await deliveryAssignmentModel.findOne({
            assignedTo: req.userId,
            status: "assigned"
        })
        .populate("shop", "name")
        .populate("assignedTo", "fullName email location mobile")
        .populate({
            path: "order",
            populate: [{ path: "user", select: "fullName email location mobile" }]
        })

        if(!assignment) {
            return res.status(400).json({ message: "assignment not found" });
        }

        if(!assignment.order) {
            return res.status(400).json({ message: "order not found" });
        }

        const shopOrder = assignment.order.shopOrders.find(shop => String(shop._id) === String(assignment.shopOrderId));
        if(!shopOrder) {
            return res.status(400).json({ message: "shopOrder not found" });
        }

        let deliveryBoyLocation = { lat: null, lon: null }
        if(assignment.assignedTo.location.coordinates.length === 2){
            deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1]
            deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0]
        }

        let customerLocation = { lat: null, lon: null }
        if(assignment.order.deliveryAddress) {
            customerLocation.lat = assignment.order.deliveryAddress.latitude
            customerLocation.lon = assignment.order.deliveryAddress.longitude
        }

        return res.status(200).json({
            _id: assignment.order._id,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation,
            shop: assignment.shop,
        })

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getTrackOrderUserController = async (req, res) => {
    try {

        const {id} = req.params;

        const order = await orderModel.findById(id)
        .populate("user")
        .populate({
            path: "shopOrders.shop",
            model: "Shop"
        })
        .populate({
            path: "shopOrders.assignedDeliveryBoy",
            model: "User"
        })
        .populate({
            path: "shopOrders.shopOrderItems.item",
            model: "Item"
        })
        .lean()

        if(!order) {
            return res.status(400).json({ message: "order not found" });
        }

        return res.status(200).json(order);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const sendDeliveryOTPController = async (req, res) => {
    try {
       
        const { orderId, shopOrderId } = req.body;

        const order = await orderModel.findById(orderId).populate("user");
        if(!order) {
            return res.status(400).json({ message: "order not found" });
        }

        const shopOrder = order.shopOrders.id(shopOrderId);
        if(!shopOrder) {
            return res.status(400).json({ message: "shopOrder Id not found" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        shopOrder.deliveryOtp = otp;
        shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;

        await order.save();

        await sendDeliveryOtpMail(order.user, otp)

        return res.status(200).json({ message: `Delivery OTP sent successfully to ${order?.user?.fullName}`, otp });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const verifyDeliveryOTPController = async (req, res) => {
    try {
        
        const { orderId, shopOrderId, otp } = req.body;

        const order = await orderModel.findById(orderId).populate("user");
        if(!order) {
            return res.status(400).json({ message: "order not found" });
        }

        const shopOrder = order.shopOrders.id(shopOrderId);
        if(!shopOrder) {
            return res.status(400).json({ message: "shopOrder Id not found" });
        }

        if(shopOrder.deliveryOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if(!shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP Expired" });
        }

        shopOrder.status = "delivered";
        shopOrder.deliveredAt = Date.now();

        await order.save();

        await deliveryAssignmentModel.findOneAndUpdate(
            {
                shopOrderId: shopOrder._id,
                order: order._id,
                assignedTo: shopOrder.assignedDeliveryBoy
            }, 
            {
                status: "completed",
                completedAt: Date.now()
            }, { new: true }
        )

        await order.populate("user", "socketId");
        await order.populate("shopOrders.owner", "socketId");

        const io = req.app.get("io");

        if (io && order.user.socketId) {
            io.to(order.user.socketId).emit("update-status", {
                orderId: order._id,
                shopId: shopOrder.shop,
                status: "delivered",
                userId: order.user?._id
            });
        }

        const ownerSocketId = shopOrder.owner?.socketId;
        if (io && ownerSocketId) {
            io.to(ownerSocketId).emit("update-status", {
                orderId: order._id,
                shopId: shopOrder.shop,
                status: "delivered",
                userId: shopOrder.owner._id
            });
        }


        return res.status(200).json({ message: "Order deliverd successfully!" });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const deliveryBoyAllOrdersController = async (req, res) => {
    try {
        const deliveryBoyId = req.userId;

        const assignments = await deliveryAssignmentModel.find({
            assignedTo: deliveryBoyId,
            status: "completed"
        })
        .populate("order")
        .populate("shop")
        .sort({ completedAt: -1 });

        return res.status(200).json(assignments);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const deliveryBoyOrdersHistoryDelete = async (req, res) => {
    try {
        
        const id = req.params.id;

        const deliveryBoy = await deliveryAssignmentModel.findByIdAndDelete(id);
        if (!deliveryBoy) {
            return res.status(404).json({ message: "deliveryBoy not found" });
        }

        return res.status(200).json({ message: "deliveryBoy History deleted successfully" });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

module.exports = {
    placeOrderController,
    verifyPaymentController,
    getMyOrdersController,
    deleteOrderController,
    updateOrderStatusController,
    getDeliveryBoyAssignmentController,
    acceptOrderController,
    getCurrentOrderController,
    getTrackOrderUserController,
    sendDeliveryOTPController,
    verifyDeliveryOTPController,
    deliveryBoyAllOrdersController,
    deliveryBoyOrdersHistoryDelete,
};