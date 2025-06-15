const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

let userName = "";
while (!userName) {
  userName = prompt("ユーザー名を入力してください");
}

console.log("ユーザー名送信:", userName);
socket.emit("set name", userName);

// 入室メッセージを受けてチャットフォーム表示
form.style.display = "none";

socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.textContent = msg;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;

  if (msg.includes(`ようこそ、${userName}さん`)) {
    form.style.display = "block";
    input.focus();
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});