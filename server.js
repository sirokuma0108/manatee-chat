const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// アップロード保存先とファイル名の設定
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // オリジナルファイル名にタイムスタンプを付与
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MBまで
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("画像ファイルのみ許可されています"));
    }
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// 画像アップロード用API
app.post("/upload-icon", upload.single("icon"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "ファイルがアップロードされていません" });
  }
  // アップロードされた画像のパス（クライアントがアクセス可能なパス）
  const imagePath = `/uploads/${req.file.filename}`;
  res.json({ path: imagePath });
});

io.on("connection", (socket) => {
  console.log("ユーザーが接続しました:", socket.id);

  let userName = "";
  let userIcon = "/default-icon.png"; // デフォルトアイコン（publicに置いておく）

  socket.on("set name", (name, isRename) => {
    const oldName = userName;
    userName = name || "名無し";

    if (isRename && oldName && oldName !== userName) {
      socket.emit("chat message", `[サーバー] ${oldName}さんが${userName}に名前を変更しました。`);
      socket.broadcast.emit("chat message", `[サーバー] ${oldName}さんが名前を変更しました`);
    } else {
      socket.emit("chat message", `[サーバー] ようこそ、${userName}さん！`);
      socket.broadcast.emit("chat message", `[サーバー] ${userName}さんが入室しました`);
    }
  });

  socket.on("set icon", (iconPath) => {
    userIcon = iconPath || "/default-icon.png";
    socket.emit("chat message", `[サーバー] アイコンを変更しました。`);
    socket.broadcast.emit("chat message", `[サーバー] ${userName}さんがアイコンを変更しました`);
  });

  socket.on("chat message", (msg) => {
    const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");
    // アイコンも一緒に送信
    const logLine = { timestamp, userName, userIcon, msg };

    fs.appendFile(
      "chatlog.txt",
      `[${timestamp}] ${userName}: ${msg}\n`,
      (err) => {
        if (err) console.error("ログ保存エラー:", err);
      }
    );

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
