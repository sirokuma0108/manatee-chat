const socket = io();

let myUUID = null;
let myName = "";

const nameEntry = document.getElementById("nameEntry");
const nameInput = document.getElementById("nameInput");
const nameSetBtn = document.getElementById("nameSetBtn");

const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");

nameSetBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) {
    alert("ユーザー名を入力してください");
    return;
  }
  myName = name;
  socket.emit("set name", name);
  nameEntry.style.display = "none";
  messages.style.display = "block";
  form.style.display = "block";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;
  socket.emit("chat message", { text: input.value });
  input.value = "";
});

socket.on("your uuid", (uuid) => {
  myUUID = uuid;
  console.log("あなたのUUID:", myUUID);
});

socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  if (msg.system) {
    li.classList.add("system");
    li.textContent = msg.text;
  } else {
    li.textContent = msg.text;
  }
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
