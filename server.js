const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const upload = multer({
  dest: path.join(__dirname, "public/uploads"),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MBまで
});

app.use(express.static("public"));

// アイコンアップロードエンドポイント
app.post("/upload", upload.single("icon"), (req, res) => {
  if (!req.file) return res.status(400).send("ファイルがありません");
  const ext = path.extname(req.file.originalname);
  const newPath = req.file.path + ext;
  fs.renameSync(req.file.path, newPath);
  const fileUrl = "/uploads/" + path.basename(newPath);
  res.send({ url: fileUrl });
});

io.on("connection", (socket) => {
  console.log("接続:", socket.id);
  let user = { name: "名無し", icon: null };

  socket.on("set user", (data) => {
    user.name = data.name || "名無し";
    user.icon = data.icon || null;

    socket.emit("chat message", {
      system: true,
      text: `[サーバー] ようこそ、${user.name}さん！`,
    });

    socket.broadcast.emit("chat message", {
      system: true,
      text: `[サーバー] ${user.name}さんが入室しました`,
    });
  });

  socket.on("chat message", (msg) => {
    const time = new Date().toLocaleTimeString();
    io.emit("chat message", {
      user: user.name,
      icon: user.icon,
      time,
      text: msg,
    });
  });

  socket.on("disconnect", () => {
    io.emit("chat message", {
      system: true,
      text: `[サーバー] ${user.name}さんが退出しました`,
    });
    console.log("切断:", user.name);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
