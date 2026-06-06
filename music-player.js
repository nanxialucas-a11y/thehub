// Music library
const songs = [
  { title: "Rainy", file: "/music/rainy.mp3" },
  { title: "Analog Morning", file: "/music/analogmorning.mp3" },
  { title: "Wildflower", file: "/music/wildflower.mp3" }
];

// Create player
document.body.insertAdjacentHTML("beforeend", `
<div id="music-player">
  <div id="music-header">
    <span id="song-title">Loading...</span>
    <button id="music-minimize">minimize</button>
  </div>

  <div id="music-controls">
    <button id="play-btn">play</button>
    <button id="next-btn">random</button>
  </div>

  <input
    type="range"
    id="music-progress"
    value="0"
    min="0"
    max="100"
  >

  <div id="music-time">
    <span id="current-time">0:00</span>
    <span id="duration">0:00</span>
  </div>

  <audio id="audio-player"></audio>
</div>
`);

const audio = document.getElementById("audio-player");
const songTitle = document.getElementById("song-title");
const playBtn = document.getElementById("play-btn");
const nextBtn = document.getElementById("next-btn");

const progressBar = document.getElementById("music-progress");
const currentTimeText = document.getElementById("current-time");
const durationText = document.getElementById("duration");

const player = document.getElementById("music-player");
const header = document.getElementById("music-header");

const minimizeBtn = document.getElementById("music-minimize");
const controls = document.getElementById("music-controls");

let currentSong = null;
let isScrubbing = false;

// Restore player position
const savedX = localStorage.getItem("musicPlayerX");
const savedY = localStorage.getItem("musicPlayerY");

if (savedX && savedY) {
  player.style.left = savedX + "px";
  player.style.top = savedY + "px";

  player.style.right = "auto";
  player.style.bottom = "auto";
}

// Random song loader
function loadRandomSong() {
  currentSong = songs[Math.floor(Math.random() * songs.length)];

  audio.src = currentSong.file;
  songTitle.textContent = currentSong.title;
}

loadRandomSong();function loadRandomSong() {
  currentSong = songs[Math.floor(Math.random() * songs.length)];

  audio.src = currentSong.file;
  songTitle.textContent = currentSong.title;

  audio.load();

  audio.addEventListener("loadedmetadata", () => {
    const saved = localStorage.getItem("music-progress-" + currentSong.file);

    if (saved !== null) {
      audio.currentTime = parseFloat(saved);
    }
  }, { once: true });
}

// Play/Pause
playBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    saveLastSong();
    playBtn.textContent = "pause";
  } else {
    audio.pause();
    playBtn.textContent = "play";
  }
});

// Next song
nextBtn.addEventListener("click", () => {
  loadRandomSong();
  audio.play();
  saveLastSong();
  playBtn.textContent = "pause";
});

// Auto next
audio.addEventListener("ended", () => {
  saveLastSong();
  loadRandomSong();
  audio.play();
});

// Time formatting
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Song progress saving
function getProgressKey(song) {
  return "music-progress-" + song.file;
}

function saveProgress() {
  if (!currentSong || !audio.duration) return;

  localStorage.setItem(
    getProgressKey(currentSong),
    audio.currentTime
  );
}

// Update progress bar
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  if (isScrubbing) return;

  progressBar.value =
    (audio.currentTime / audio.duration) * 100;

  currentTimeText.textContent =
    formatTime(audio.currentTime);

  durationText.textContent =
    formatTime(audio.duration);

  saveProgress();  
});

// Seek
progressBar.addEventListener("input", () => {
  if (!audio.duration) return;

  audio.currentTime =
    (progressBar.value / 100) * audio.duration;
});progressBar.addEventListener("pointerdown", () => {
  isScrubbing = true;
});

progressBar.addEventListener("input", () => {
  if (!audio.duration) return;

  audio.currentTime =
    (progressBar.value / 100) * audio.duration;
});

progressBar.addEventListener("pointerup", () => {
  isScrubbing = false;
});

// Dragging
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

  localStorage.setItem("musicPlayerX", x);
  localStorage.setItem("musicPlayerY", y);
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Minimize
let minimized = false;

minimizeBtn.addEventListener("click", () => {
  minimized = !minimized;

  if (minimized) {
    controls.style.display = "none";
    progressBar.style.display = "none";
    document.getElementById("music-time").style.display = "none";
    minimizeBtn.textContent = "expand";
  } else {
    controls.style.display = "flex";
    progressBar.style.display = "block";
    document.getElementById("music-time").style.display = "flex";
    minimizeBtn.textContent = "minimize";
  }
});

//Saves Last Song played
function saveLastSong() {
  if (!currentSong) return;

  localStorage.setItem("music-last-song", currentSong.file);
}
