const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("ユーザーが接続しました");

  let userName = "";

  // ユーザー名セット受信
  socket.on("set name", (name) => {
    userName = name || "名無し";
    socket.emit("chat message", `[サーバー] ようこそ、${userName}さん！`);
    socket.broadcast.emit("chat message", `[サーバー] ${userName}さんが入室しました`);
  });

  socket.on("chat message", (msg) => {
    const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");
    const logLine = `[${timestamp}] ${userName}: ${msg}`;

    fs.appendFile("chatlog.txt", logLine + "\n", (err) => {
      if (err) console.error("ログ保存エラー:", err);
    });

    io.emit("chat message", logLine);
  });

  socket.on("disconnect", () => {
    if (userName) {
      io.emit("chat message", `[サーバー] ${userName}さんが退出しました`);
    }
    console.log("ユーザーが切断しました");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバー起動中: http://localhost:${PORT}`);
});
