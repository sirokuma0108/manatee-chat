const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

let user = { name: "", icon: "" };

// ユーザー設定ボタン
document.getElementById("setUser").onclick = async () => {
  const name = document.getElementById("name").value.trim();
  const iconFile = document.getElementById("icon").files[0];

  if (!name) return alert("名前を入力してください");

  let iconUrl = "";
  if (iconFile) {
    const formData = new FormData();
    formData.append("icon", iconFile);
    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();
    iconUrl = data.url;
  }

  user = { name, icon: iconUrl };
  socket.emit("set user", user);
};

// メッセージ送信
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

// メッセージ受信
socket.on("chat message", (msg) => {
  const li = document.createElement("li");

  if (msg.system) {
    li.textContent = msg.text;
    li.classList.add("system");
  } else {
    li.classList.add("msg");
    const icon = document.createElement("img");
    icon.src = msg.icon || "https://placehold.co/32x32";
    icon.alt = "icon";

    const text = document.createElement("span");
    text.textContent = `${msg.user} (${msg.time}): ${msg.text}`;

    li.appendChild(icon);
    li.appendChild(text);
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
