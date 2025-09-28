const http = require("http");
const app = require("./app");
const config = require("./config/config");
const { Server } = require("socket.io");
const { socketHandler } = require("./socket");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "https://vingo-food-delivery-frontend.onrender.com",
            "http://localhost:5173"
        ],
        credentials: true,
    }
});

app.set("io", io);

socketHandler(io);

const port = config.PORT

server.listen(port, () => {
    console.log(`server is running on port ${port}`);
});