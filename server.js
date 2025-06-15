const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

const userUUIDs = {}; // socket.id -> uuid
const userNames = {}; // uuid -> name
const userRooms = {}; // uuid -> Set of room names
const roomMessages = {}; // room name -> array of messages

io.on("connection", (socket) => {
  const uuid = uuidv4();
  userUUIDs[socket.id] = uuid;
  userNames[uuid] = "名無し";
  userRooms[uuid] = new Set();

  socket.emit("your uuid", uuid);

  socket.on("set name", (name) => {
    userNames[uuid] = name;
  });

  socket.on("create room", (room) => {
    if (typeof room === "string" && room.trim()) {
      room = room.trim();
      userRooms[uuid].add(room);
      socket.join(room);
      if (!roomMessages[room]) roomMessages[room] = [];
      socket.emit("room joined", room, Array.from(userRooms[uuid]), roomMessages[room]);
    }
  });

  socket.on("join room", (room) => {
    if (typeof room === "string" && room.trim()) {
      room = room.trim();
      userRooms[uuid].add(room);
      socket.join(room);
      if (!roomMessages[room]) roomMessages[room] = [];
      socket.emit("room joined", room, Array.from(userRooms[uuid]), roomMessages[room]);
    }
  });

  socket.on("chat message", ({ room, message }) => {
    const timestamp = new Date(Date.now() + 9 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19);
    const msg = `[${timestamp}] ${userNames[uuid]}(${uuid.slice(0, 6)}): ${message}`;
    roomMessages[room] = roomMessages[room] || [];
    roomMessages[room].push(msg);
    io.to(room).emit("chat message", room, msg);
  });

  socket.on("disconnect", () => {
    delete userUUIDs[socket.id];
    delete userNames[uuid];
    delete userRooms[uuid];
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
