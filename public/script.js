const socket = io();
let currentRoom = "";
let uuid = "";

socket.on("your uuid", (id) => {
  uuid = id;
  const name = prompt("表示名を入力してください") || "名無し";
  socket.emit("set name", name);
});

socket.on("room joined", (room, roomList, messages) => {
  currentRoom = room;
  const roomsUl = document.getElementById("rooms");
  roomsUl.innerHTML = "";
  roomList.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = r;
    li.style.cursor = "pointer";
    li.onclick = () => socket.emit("join room", r);
    roomsUl.appendChild(li);
  });

  const msgUl = document.getElementById("messages");
  msgUl.innerHTML = "";
  messages.forEach((m) => {
    const li = document.createElement("li");
    li.textContent = m;
    msgUl.appendChild(li);
  });
});

socket.on("chat message", (room, msg) => {
  if (room !== currentRoom) return;
  const li = document.createElement("li");
  li.textContent = msg;
  document.getElementById("messages").appendChild(li);
});

document.getElementById("create-room").onclick = () => {
  const room = document.getElementById("new-room").value.trim();
  if (room) socket.emit("create room", room);
  document.getElementById("new-room").value = "";
};

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("input");
  if (input.value && currentRoom) {
    socket.emit("chat message", { room: currentRoom, message: input.value });
    input.value = "";
  }
});
