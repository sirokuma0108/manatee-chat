const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// public フォルダを公開
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("ユーザーが接続しました");

    // 過去のチャットログを読み込んで送信
    fs.readFile("chatlog.txt", "utf-8", (err, data) => {
        if (!err && data) {
            const lines = data.trim().split("\n");
            lines.forEach(line => {
                socket.emit("chat message", line);
            });
        }
    });

    // メッセージ受信
    socket.on("chat message", (msg) => {
        const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");
        const logLine = `[${timestamp}] ${msg}\n`;

        fs.appendFile("chatlog.txt", logLine, (err) => {
            if (err) {
                console.error("ログ保存中にエラー:", err);
            }
        });

        io.emit("chat message", logLine.trim());
    });

    socket.on("disconnect", () => {
        console.log("ユーザーが切断しました");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`サーバー起動中: http://localhost:${PORT}`);
});
