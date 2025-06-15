const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("ユーザーが接続しました:", socket.id);

  let userName = "";
  let userIcon = "/初期アイコン.webp";  // デフォルトアイコン

  socket.on("set name", (data) => {
    userName = data.name || "名無し";
    userIcon = data.icon || "/初期アイコン.webp";

    console.log(`ユーザー名セット: ${userName}, アイコン: ${userIcon}`);

    socket.emit("chat message", {
      text: `[サーバー] ようこそ、${userName}さん！`,
      icon: "/初期アイコン.webp",
      system: true,
    });

    socket.broadcast.emit("chat message", {
      text: `[サーバー] ${userName}さんが入室しました`,
      icon: "/初期アイコン.webp",
      system: true,
    });
  });

  socket.on("chat message", (msg) => {
    const date = new Date();
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC+9時間（日本時間）
    const timestamp = jstDate.toISOString().replace("T", " ").replace("Z", "");

    const logLine = `[${timestamp}] ${userName}: ${msg.text}`;

    fs.appendFile("chatlog.txt", logLine + "\n", (err) => {
      if (err) console.error("ログ保存エラー:", err);
    });

    io.emit("chat message", {
      text: `[${timestamp}] ${userName}: ${msg.text}`,
      icon: userIcon,
      system: false,
    });
  });

  socket.on("change name", (data) => {
    const oldName = userName;
    userName = data.name || userName;
    userIcon = data.icon || userIcon;
    io.emit("chat message", {
      text: `[サーバー] 名前を変更しました。`,
      icon: "/初期アイコン.webp",
      system: true,
    });
  });

  socket.on("disconnect", () => {
    if (userName) {
      io.emit("chat message", {
        text: `[サーバー] ${userName}さんが退出しました`,
        icon: "/初期アイコン.webp",
        system: true,
      });
    }
    console.log("ユーザーが切断しました:", userName);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバー起動中: http://localhost:${PORT}`);
});
