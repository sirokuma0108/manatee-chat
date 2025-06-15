const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require("fs");
const path = require("path");

// publicフォルダを静的ファイルとして配信
app.use(express.static(path.join(__dirname, "public")));

// サーバー起動
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});

// クライアント接続処理
io.on("connection", (socket) => {
  console.log("ユーザーが接続しました:", socket.id);

  let userName = "";

  socket.on("set name", (name) => {
    userName = name || "名無し";
    console.log(`ユーザー名セット: ${userName}`);

    // 入室メッセージ
    socket.emit("chat message", `[サーバー] ようこそ、${userName}さん！`);
    socket.broadcast.emit("chat message", `[サーバー] ${userName}さんが入室しました`);
  });

  socket.on("chat message", (msg) => {
    const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");
    const logLine = `[${timestamp}] ${userName}: ${msg}`;

    // チャットログを保存
    fs.appendFile("chatlog.txt", logLine + "\n", (err) => {
      if (err) console.error("ログ保存エラー:", err);
    });

    // 全員に送信
    io.emit("chat message", logLine);
  });

  socket.on("disconnect", () => {
    if (userName) {
      io.emit("chat message", `[サーバー] ${userName}さんが退出しました`);
    }
    console.log("ユーザーが切断しました:", userName);
  });
});
