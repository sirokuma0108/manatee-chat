const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

// 接続時にユーザー名を聞く
let userName = "";
while (!userName) {
  userName = prompt("ユーザー名を入力してください");
}
socket.emit("set name", userName);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.textContent = msg;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
