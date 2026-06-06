// Music library
const songs = [
  {
    title: "Rainy",
    file: "/music/rainy.mp3"
  },
  {
    title: "Analog Morning",
    file: "/music/analogmorning.mp3"
  },
  {
    title: "Wildflower",
    file: "/music/wildflower.mp3"
  }
];

// Create player
document.body.insertAdjacentHTML("beforeend", `
<div id="music-player">
  <div id="music-header">
    <span id="song-title">Loading...</span>
    <button id="music-minimize">−</button>
  </div>

  <div id="music-controls">
    <button id="play-btn">▶</button>
    <button id="next-btn">🎲</button>
  </div>

  <audio id="audio-player"></audio>
</div>
`);
const audio = document.getElementById("audio-player");
const songTitle = document.getElementById("song-title");

let currentSong = null;

function loadRandomSong() {
  currentSong = songs[Math.floor(Math.random() * songs.length)];

  audio.src = currentSong.file;
  songTitle.textContent = currentSong.title;
}

loadRandomSong();

document.getElementById("play-btn").addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    document.getElementById("play-btn").textContent = "⏸";
  } else {
    audio.pause();
    document.getElementById("play-btn").textContent = "▶";
  }
});

document.getElementById("next-btn").addEventListener("click", () => {
  loadRandomSong();
  audio.play();
  document.getElementById("play-btn").textContent = "⏸";
});

audio.addEventListener("ended", () => {
  loadRandomSong();
  audio.play();
});
const player = document.getElementById("music-player");
const header = document.getElementById("music-header");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

header.addEventListener("mousedown", (e) => {
  isDragging = true;

  offsetX = e.clientX - player.offsetLeft;
  offsetY = e.clientY - player.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  player.style.left = `${e.clientX - offsetX}px`;
  player.style.top = `${e.clientY - offsetY}px`;

  player.style.right = "auto";
  player.style.bottom = "auto";
});
document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  let x = e.clientX - offsetX;
  let y = e.clientY - offsetY;

  const maxX = window.innerWidth - player.offsetWidth;
  const maxY = window.innerHeight - player.offsetHeight;

  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));

  player.style.left = `${x}px`;
  player.style.top = `${y}px`;

  localStorage.setItem("musicPlayerX", x);
  localStorage.setItem("musicPlayerY", y);

  player.style.right = "auto";
  player.style.bottom = "auto";
});
document.addEventListener("mouseup", () => {
  isDragging = false;
});
document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  let x = e.clientX - offsetX;
  let y = e.clientY - offsetY;

  const maxX = window.innerWidth - player.offsetWidth;
  const maxY = window.innerHeight - player.offsetHeight;

  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));

  player.style.left = `${x}px`;
  player.style.top = `${y}px`;

  player.style.right = "auto";
  player.style.bottom = "auto";
});
const minimizeBtn = document.getElementById("music-minimize");
const controls = document.getElementById("music-controls");

let minimized = false;

minimizeBtn.addEventListener("click", () => {
  minimized = !minimized;

  if (minimized) {
    controls.style.display = "none";
    minimizeBtn.textContent = "+";
  } else {
    controls.style.display = "flex";
    minimizeBtn.textContent = "−";
  }
});
