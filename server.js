const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// ユーザーごとのUUIDを保持（socket.id → uuid）
const userUUIDs = {};

// UUID → 名前
const userNames = {};

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("接続:", socket.id);

  // 新規UUID生成（本来はCookieやlocalStorageからの再利用もあり得るが今回は省略）
  const uuid = uuidv4();
  userUUIDs[socket.id] = uuid;

  // 初期名前は名無し
  userNames[uuid] = "名無し";

  // クライアントにUUIDを通知（本人識別用）
  socket.emit("your uuid", uuid);

  // 名前変更受信
  socket.on("set name", (name) => {
    if (typeof name === "string" && name.trim().length > 0) {
      userNames[uuid] = name.trim();
      // 名前変更通知
      socket.emit("chat message", {
        system: true,
        text: `[サーバー] 名前を「${userNames[uuid]}」に変更しました。`,
      });
      socket.broadcast.emit("chat message", {
        system: true,
        text: `[サーバー] ${userNames[uuid]}さん（ID: ${uuid.slice(0, 6)}）に名前変更しました。`,
      });
    }
  });

  // 入室通知
  io.emit("chat message", {
    system: true,
    text: `[サーバー] ${userNames[uuid]}さん（ID: ${uuid.slice(0, 6)}）が入室しました。`,
  });

  // メッセージ受信
  socket.on("chat message", (msg) => {
    const timestamp = new Date(Date.now() + 9 * 60 * 60 * 1000)
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);

    const userName = userNames[uuid] || "名無し";
    const logLine = `[${timestamp}] ${userName}(${uuid.slice(0, 6)}): ${msg.text}`;

    fs.appendFile("chatlog.txt", logLine + "\n", (err) => {
      if (err) console.error("ログ保存エラー:", err);
    });

    io.emit("chat message", {
      system: false,
      text: logLine,
      uuid,
    });
  });

  socket.on("disconnect", () => {
    io.emit("chat message", {
      system: true,
      text: `[サーバー] ${userNames[uuid] || "名無し"}さん（ID: ${uuid.slice(0, 6)}）が退出しました。`,
    });
    delete userNames[uuid];
    delete userUUIDs[socket.id];
    console.log("切断:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
