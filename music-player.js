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

  <input type="range" id="music-progress" value="0" min="0" max="100">

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
let allowProgressSave = true;
let lastIndex = -1;

// Restore player position
const savedX = localStorage.getItem("musicPlayerX");
const savedY = localStorage.getItem("musicPlayerY");

if (savedX && savedY) {
  player.style.left = savedX + "px";
  player.style.top = savedY + "px";
  player.style.right = "auto";
  player.style.bottom = "auto";
}

// FORMAT TIME
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// GET SAVE KEY
function getKey(song) {
  return "music-progress-" + song.file;
}

// LOAD RANDOM SONG (no duplicate + safe saving control)
function loadRandomSong() {
  allowProgressSave = false;

  let index;
  do {
    index = Math.floor(Math.random() * songs.length);
  } while (index === lastIndex && songs.length > 1);

  lastIndex = index;
  currentSong = songs[index];

  audio.src = currentSong.file;
  songTitle.textContent = currentSong.title;

  audio.load();

  audio.addEventListener("loadedmetadata", () => {
    const saved = localStorage.getItem(getKey(currentSong));

    if (saved !== null) {
      audio.currentTime = parseFloat(saved);
    }

    allowProgressSave = true;
  }, { once: true });

  playBtn.textContent = "play";
}

// PLAY / PAUSE
playBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = "pause";
  } else {
    audio.pause();
    playBtn.textContent = "play";
  }
});

// NEXT
nextBtn.addEventListener("click", () => {
  loadRandomSong();
  audio.play();
  playBtn.textContent = "pause";
});

// AUTO NEXT
audio.addEventListener("ended", () => {
  loadRandomSong();
  audio.play();
});

// PROGRESS UPDATE
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  if (isScrubbing) return;
  if (!currentSong) return;

  progressBar.value =
    (audio.currentTime / audio.duration) * 100;

  currentTimeText.textContent =
    formatTime(audio.currentTime);

  durationText.textContent =
    formatTime(audio.duration);

  if (allowProgressSave) {
    localStorage.setItem(
      getKey(currentSong),
      audio.currentTime
    );
  }
});

// SEEK
progressBar.addEventListener("pointerdown", () => {
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

// DRAG
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

// MINIMIZE
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

// STARTUP
window.addEventListener("DOMContentLoaded", () => {
  const lastSong = localStorage.getItem("music-last-song");

  if (lastSong) {
    const song = songs.find(s => s.file === lastSong);

    if (song) {
      currentSong = song;

      audio.src = song.file;
      songTitle.textContent = song.title;

      audio.load();

      audio.addEventListener("loadedmetadata", () => {
        const saved = localStorage.getItem(getKey(song));

        if (saved !== null) {
          audio.currentTime = parseFloat(saved);
        }
      }, { once: true });

      playBtn.textContent = "play";
      return;
    }
  }

  loadRandomSong();
});

// SAVE ON LEAVE
window.addEventListener("beforeunload", () => {
  if (!currentSong) return;

  localStorage.setItem("music-last-song", currentSong.file);
  localStorage.setItem(getKey(currentSong), audio.currentTime);
});
