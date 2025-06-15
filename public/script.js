const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const usernameInput = document.getElementById("username");
const iconUpload = document.getElementById("iconUpload");

let user = {
  name: "",
  icon: "",
};

function askUserInfo() {
  let name = "";
  while (!name) {
    name = prompt("ユーザー名を入力してください");
  }
  user.name = name;
}

askUserInfo();
sendUserData();

function sendUserData() {
  socket.emit("set user", user);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

socket.on("chat message", (data) => {
  const li = document.createElement("li");
  const container = document.createElement("div");
  container.classList.add("chat-message");

  if (data.icon) {
    const img = document.createElement("img");
    img.src = data.icon;
    container.appendChild(img);
  }

  const text = document.createElement("span");
  text.textContent = `${data.name}: ${data.message}`;
  container.appendChild(text);

  li.appendChild(container);
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

usernameInput.addEventListener("change", () => {
  user.name = usernameInput.value;
  sendUserData();
});

iconUpload.addEventListener("change", () => {
  const file = iconUpload.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("icon", file);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then(res => res.json())
    .then(data => {
      user.icon = data.filePath;
      sendUserData();
    });
});
