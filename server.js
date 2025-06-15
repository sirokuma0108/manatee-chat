const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.post("/upload", upload.single("icon"), (req, res) => {
  res.json({ filePath: "/uploads/" + req.file.filename });
});

io.on("connection", (socket) => {
  let user = { name: "名無し", icon: "" };

  socket.on("set user", (userData) => {
    user.name = userData.name || "名無し";
    user.icon = userData.icon || "";

    socket.emit("chat message", {
      name: "サーバー",
      icon: "",
      message: `ようこそ、${user.name}さん！`,
    });

    socket.broadcast.emit("chat message", {
      name: "サーバー",
      icon: "",
      message: `${user.name}さんが入室しました`,
    });
  });

  socket.on("chat message", (msg) => {
    const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");
    const logLine = `[${timestamp}] ${user.name}: ${msg}`;
    fs.appendFile("chatlog.txt", logLine + "\n", (err) => {
      if (err) console.error("ログ保存エラー:", err);
    });

    io.emit("chat message", {
      name: user.name,
      icon: user.icon,
      message: msg,
    });
  });

  socket.on("disconnect", () => {
    io.emit("chat message", {
      name: "サーバー",
      icon: "",
      message: `${user.name}さんが退出しました`,
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバー起動中: http://localhost:${PORT}`);
});
