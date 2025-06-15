const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// アップロード用の設定
const upload = multer({
  dest: path.join(__dirname, "public", "uploads"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MBまで
});

app.use(express.static(path.join(__dirname, "public")));

// アイコンアップロード用エンドポイント
app.post("/upload", upload.single("icon"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "ファイルがありません" });

  // アップロードされたファイルを public/uploads にリネームして保存
  const ext = path.extname(req.file.originalname);
  const newPath = path.join(req.file.destination, req.file.filename + ext);
  fs.renameSync(req.file.path, newPath);

  // クライアントへ新しいファイルパスを返す
  res.json({ path: `/uploads/${req.file.filename + ext}` });
});

// ユーザー名とアイコンを記憶するためのマップ
const users = new Map();

io.on("connection", (socket) => {
  console.log("ユーザーが接続しました:", socket.id);

  users.set(socket.id, { name: "名無し", icon: "" });

  socket.on("set user info", (data) => {
    users.set(socket.id, {
      name: data.name || "名無し",
      icon: data.icon || "",
    });

    console.log(`ユーザー情報設定: ${data.name} (${socket.id})`);

    socket.emit("chat message", {
      name: "サーバー",
      icon: "",
      message: `ようこそ、${data.name}さん！`,
    });

    socket.broadcast.emit("chat message", {
      name: "サーバー",
      icon: "",
      message: `${data.name}さんが入室しました`,
    });
  });

  socket.on("chat message", (msgText) => {
    const user = users.get(socket.id) || { name: "名無し", icon: "" };
    const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");
    const logLine = `[${timestamp}] ${user.name}: ${msgText}`;

    // ログ保存
    fs.appendFile("chatlog.txt", logLine + "\n", (err) => {
      if (err) console.error("ログ保存エラー:", err);
    });

    // 全体に送信
    io.emit("chat message", {
      name: user.name,
      icon: user.icon,
      message: msgText,
    });
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      io.emit("chat message", {
        name: "サーバー",
        icon: "",
        message: `${user.name}さんが退出しました`,
      });
      users.delete(socket.id);
    }
    console.log("ユーザー切断:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
