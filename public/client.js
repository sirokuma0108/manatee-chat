const socket = io();

const loginDiv = document.getElementById("login");
const chatDiv = document.getElementById("chat");

const usernameInput = document.getElementById("usernameInput");
const usernameSubmit = document.getElementById("usernameSubmit");

const currentIcon = document.getElementById("currentIcon");
const iconUpload = document.getElementById("iconUpload");
const changeNameBtn = document.getElementById("changeNameBtn");

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

let userName = "";
let userIcon = "/default-icon.png";

function setUser(name, icon, isRename = false) {
  userName = name;
  userIcon = icon || "/default-icon.png";
  socket.emit("set name", userName, isRename);
  socket.emit("set icon", userIcon);
  currentIcon.src = userIcon;
}

usernameSubmit.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (!name) {
    alert("ユーザー名を入力してください");
    return;
  }
  setUser(name, userIcon, false);
  loginDiv.style.display = "none";
  chatDiv.style.display = "block";
  input.focus();
});

changeNameBtn.addEventListener("click", () => {
  const newName = prompt("新しいユーザー名を入力してください", userName);
  if (newName && newName.trim() !== "" && newName.trim() !== userName) {
    setUser(newName.trim(), userIcon, true);
  }
});

// アイコンアップロード処理
iconUpload.addEventListener("change", () => {
  const file = iconUpload.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("icon", file);

  fetch("/upload-icon", {
    method: "POST",
    body: formData
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.path) {
        userIcon = data.path;
        currentIcon.src = userIcon;
        socket.emit("set icon", userIcon);
      } else {
        alert("アップロードに失敗しました");
      }
    })
    .catch(() => {
      alert("アップロード中にエラーが発生しました");
    });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value.trim()) {
    socket.emit("chat message", input.value.trim());
    input.value = "";
  }
});

socket.on("chat message", (data) => {
  const li = document.createElement("li");

  if (typeof data === "string") {
    // サーバーメッセージなどテキストだけ
    li.textContent = data;
  } else {
    // ユーザーメッセージ（オブジェクト）
    const iconImg = document.createElement("img");
    iconImg.src = data.userIcon || "/default-icon.png";
    iconImg.className = "icon";
    li.appendChild(iconImg);

    const text = document.createTextNode(`${data.userName}: ${data.msg}`);
    li.appendChild(text);
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
