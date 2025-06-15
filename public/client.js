const socket = io();

const loginArea = document.getElementById("loginArea");
const chatArea = document.getElementById("chatArea");
const loginBtn = document.getElementById("loginBtn");
const nameInput = document.getElementById("nameInput");
const iconInput = document.getElementById("iconInput");
const iconPreview = document.getElementById("iconPreview");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const changeNameBtn = document.getElementById("changeNameBtn");

let userName = "";
let userIcon = "/初期アイコン.webp";
let userIconDataURL = null;

// アイコンプレビュー表示
iconInput.addEventListener("change", () => {
  const file = iconInput.files[0];
  if (!file) {
    iconPreview.src = "/初期アイコン.webp";
    userIconDataURL = null;
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    iconPreview.src = reader.result;
    userIconDataURL = reader.result;
  };
  reader.readAsDataURL(file);
});

// ログイン確定
loginBtn.addEventListener("click", () => {
  if (!nameInput.value.trim()) {
    alert("ユーザー名を入力してください");
    return;
  }
  userName = nameInput.value.trim();
  userIcon = userIconDataURL || "/初期アイコン.webp";

  socket.emit("set name", { name: userName, icon: userIcon });

  loginArea.style.display = "none";
  chatArea.style.display = "block";
  input.focus();
});

// メッセージ送信
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value.trim() === "") return;
  socket.emit("chat message", { text: input.value.trim() });
  input.value = "";
});

// メッセージ受信
socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  if (msg.system) {
    li.textContent = msg.text;
    li.classList.add("system");
  } else {
    const icon = document.createElement("img");
    icon.src = msg.icon || "/初期アイコン.webp";
    icon.classList.add("icon");

    const span = document.createElement("span");
    span.textContent = msg.text;

    li.appendChild(icon);
    li.appendChild(span);
  }
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// 名前・アイコン変更ボタン
changeNameBtn.addEventListener("click", () => {
  loginArea.style.display = "block";
  chatArea.style.display = "none";

  nameInput.value = userName;
  iconPreview.src = userIconDataURL || userIcon || "/初期アイコン.webp";
});

// 名前変更確定（再利用）
loginBtn.addEventListener("click", () => {
  if (!nameInput.value.trim()) return;
  const newName = nameInput.value.trim();
  const newIcon = userIconDataURL || userIcon || "/初期アイコン.webp";

  userName = newName;
  userIcon = newIcon;

  socket.emit("change name", { name: userName, icon: userIcon });

  loginArea.style.display = "none";
  chatArea.style.display = "block";})