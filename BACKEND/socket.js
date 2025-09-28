const userModel = require("./models/user.model");

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        socket.on("identity", async ({ userId }) => {
            try {
                const user = await userModel.findByIdAndUpdate(userId, {
                    socketId: socket.id,
                    isOnline: true
                }, { new: true });
            } catch (error) {
                console.log(error);
            }
        });

        socket.on("update-location", async ({ latitude, longitude, userId }) => {
            try {

                const user = await userModel.findByIdAndUpdate(userId, {
                    location: {
                        type: "Point",
                        coordinates: [ longitude, latitude ]
                    },
                    isOnline: true,
                    socketId: socket.id
                });

                if(user) {
                    io.emit("update-delivery-location", {
                        deliveryBoyId: userId,
                        latitude,
                        longitude
                    })
                }

            } catch (error) {
                console.log(error);
            }
        })

        socket.on("disconnect", async () => {
            await userModel.findOneAndUpdate({ socketId: socket.id }, {
                socketId: null,
                isOnline: false
            });
        })
    })
};

module.exports = {
    socketHandler,
};