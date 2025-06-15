io.on("connection", (socket) => {
  console.log("ユーザーが接続しました:", socket.id);

  let userName = "";

  socket.on("set name", (name) => {
    userName = name || "名無し";
    console.log(`ユーザー名セット: ${userName}`);

    // 入室メッセージを本人と他ユーザーに送る
    socket.emit("chat message", `[サーバー] ようこそ、${userName}さん！`);
    socket.broadcast.emit("chat message", `[サーバー] ${userName}さんが入室しました`);
  });

  socket.on("chat message", (msg) => {
    const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");
    const logLine = `[${timestamp}] ${userName}: ${msg}`;

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
