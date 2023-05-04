const http = require("http");
const io = require("socket.io");

const apiServer = require("./api.js");
const httpServer = http.createServer(apiServer);
const socketServer = io(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 4000;
httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}...`));

let readyPlayerCount = 0;

const pongNamespace = socketServer.of("/pong"); // Can create namespaces

pongNamespace.on("connection", (socket) => {
  let room;
  console.log("A user connected", socket.id);

  socket.on("ready", () => {
    room = "room" + Math.floor(readyPlayerCount / 2);
    socket.join(room); // Crete room + join room / join room

    console.log("Player ready", pongNamespace.name, socket.id, room);
    readyPlayerCount++;

    if (readyPlayerCount % 2 === 0) {
      // Send broadcast to all clients inside room including the sender that emmited 'ready
      pongNamespace.in(room).emit("startGame", socket.id);
    }
  });

  socket.on("paddleMove", (paddleData) => {
    // Send broadcast to all clients inside room except the sender that emmited 'paddleMove'
    socket.to(room).emit("paddleMove", paddleData);
  });

  socket.on("ballMove", (ballData) => {
    // Send broadcast to all clients inside room except the sender that emmited 'ballMove'
    socket.to(room).emit("ballMove", ballData);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Client ${socket.id} disconnected: ${reason}`);
    socket.leave(room);
  });
});
