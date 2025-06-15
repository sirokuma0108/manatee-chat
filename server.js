const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// public フォルダを公開する
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("ユーザーが接続しました");

    socket.on("chat message", (msg) => {
        io.emit("chat message", msg); // 全員にメッセージ送信
    });

    socket.on("disconnect", () => {
        console.log("ユーザーが切断しました");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`サーバー起動中: http://localhost:${PORT}`);
});
