socket.on("chat message", function(msg) {
    const item = document.createElement("li");
    
    // オブジェクトか文字列かチェック
    if (typeof msg === "object" && msg.past) {
        item.textContent = "(過去) " + msg.text;
        item.style.color = "gray"; // 過去ログは薄い色に
    } else {
        item.textContent = msg;
    }
    
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});
