const socket = io();

const loginDiv = document.getElementById("login");
const chatDiv = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

const usernameInput = document.getElementById("username");
const startButton = document.getElementById("start");
const changeNameButton = document.getElementById("changeName");

let userName = "";

// 名前確定ボタン押したらチャット画面へ
startButton.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    const isRename = !!userName; // 既に名前があれば変更扱い
    userName = name;
    socket.emit("set name", userName, isRename);
    loginDiv.style.display = "none";
    chatDiv.style.display = "block";
  }
});

// 名前変更ボタン
changeNameButton.addEventListener("click", () => {
  const newName = prompt("新しいユーザー名を入力してください");
  if (newName && newName.trim()) {
    socket.emit("set name", newName.trim(), true);
    userName = newName.trim();
  }
});

// チャット送信
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

// 受信したメッセージを表示
socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.textContent = msg;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// 最初にログイン画面を表示
loginDiv.style.display = "block";
