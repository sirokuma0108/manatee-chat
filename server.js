const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// publicフォルダを静的配信
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("ユーザーが接続しました:", socket.id);

  let userName = "";

  socket.on("set name", (name, isRename) => {
    if (typeof name === "string") {
      const oldName = userName;
      userName = name || "名無し";

      if (isRename && oldName && oldName !== userName) {
        // 名前変更メッセージ
        socket.emit("chat message", `[サーバー] ユーザー名を「${userName}」に変更しました`);
        socket.broadcast.emit("chat message", `[サーバー] ${oldName}さんが「${userName}」に名前を変更しました`);
      } else {
        // 初回入室メッセージ
        socket.emit("chat message", `[サーバー] ようこそ、${userName}さん！`);
        socket.broadcast.emit("chat message", `[サーバー] ${userName}さんが入室しました`);
      }
    }
  });

  socket.on("chat message", (msg) => {
    const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");
    const logLine = `[${timestamp}] ${userName}: ${msg}`;

    // チャットログに保存
    fs.appendFile("chatlog.txt", logLine + "\n", (err) => {
      if (err) console.error("ログ保存エラー:", err);
    });

    io.emit("chat message", logLine);
  });

  socket.on("disconnect", () => {
    if (userName) {
      io.emit("chat message", `[サーバー] ${userName}さんが退出しました`);
    }
    console.log("ユーザーが切断しました:", userName);
  });
});

server.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
