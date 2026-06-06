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
    <button id="next-btn">next</button>
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
const timeDisplay = document.getElementById("music-time");

let currentSong = null;
let isScrubbing = false;
let dragging = false;
let offsetX = 0;
let offsetY = 0;

/* ---------------------------
   POSITION RESTORE
---------------------------- */
player.style.position = "fixed";
player.style.zIndex = "2147483647";

const savedX = localStorage.getItem("musicPlayerX");
const savedY = localStorage.getItem("musicPlayerY");

if (savedX && savedY) {
  player.style.left = savedX + "px";
  player.style.top = savedY + "px";
  player.style.right = "auto";
  player.style.bottom = "auto";
}

/* ---------------------------
   HELPERS
---------------------------- */
function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ---------------------------
   CORE SONG LOADER
---------------------------- */
function loadSong(song) {
  if (!song) return;

  currentSong = song;

  audio.pause();
  audio.src = song.file;
  songTitle.textContent = song.title;

  progressBar.value = 0;
  currentTimeText.textContent = "0:00";
  durationText.textContent = "0:00";

  audio.load();

  audio.addEventListener("loadedmetadata", () => {
    durationText.textContent = formatTime(audio.duration || 0);

    const saved = localStorage.getItem("music-progress-" + song.file);
    if (saved !== null) {
      audio.currentTime = parseFloat(saved);
    }
  }, { once: true });

  localStorage.setItem("music-last-song", song.file);
}

/* ---------------------------
   INIT
---------------------------- */
(function init() {
  const last = localStorage.getItem("music-last-song");
  const found = songs.find(s => s.file === last);

  loadSong(found || songs[0]);
})();

/* ---------------------------
   PLAY / PAUSE
---------------------------- */
playBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = "pause";
  } else {
    audio.pause();
    playBtn.textContent = "play";
  }
});

/* ---------------------------
   NEXT SONG)
---------------------------- */
nextBtn.addEventListener("click", () => {
  const idx = songs.findIndex(s => s.file === currentSong.file);
  const next = songs[(idx + 1) % songs.length];

  loadSong(next);
  audio.play();
  playBtn.textContent = "pause";
});

/* ---------------------------
   AUTO NEXT
---------------------------- */
audio.addEventListener("ended", () => {
  const idx = songs.findIndex(s => s.file === currentSong.file);
  const next = songs[(idx + 1) % songs.length];

  loadSong(next);
  audio.play();
  playBtn.textContent = "pause";
});

/* ---------------------------
   PROGRESS (FIXED SAVE LOGIC)
---------------------------- */
audio.addEventListener("timeupdate", () => {
  if (!audio.duration || isScrubbing) return;

  const pct = (audio.currentTime / audio.duration) * 100;
  progressBar.value = pct;

  currentTimeText.textContent = formatTime(audio.currentTime);

  localStorage.setItem(
    "music-progress-" + currentSong.file,
    audio.currentTime
  );
});

/* ---------------------------
   SEEK
---------------------------- */
progressBar.addEventListener("pointerdown", () => {
  isScrubbing = true;
});

progressBar.addEventListener("input", () => {
  if (!audio.duration) return;
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

progressBar.addEventListener("pointerup", () => {
  isScrubbing = false;
});

/* ---------------------------
   DRAGGING (FIXED CONSISTENCY)
---------------------------- */
header.addEventListener("mousedown", (e) => {
  dragging = true;
  offsetX = e.clientX - player.offsetLeft;
  offsetY = e.clientY - player.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  const x = e.clientX - offsetX;
  const y = e.clientY - offsetY;

  player.style.left = x + "px";
  player.style.top = y + "px";
  player.style.right = "auto";
  player.style.bottom = "auto";

  localStorage.setItem("musicPlayerX", x);
  localStorage.setItem("musicPlayerY", y);
});

document.addEventListener("mouseup", () => {
  dragging = false;
});

/* ---------------------------
   MINIMIZE
---------------------------- */
let minimized = false;

minimizeBtn.addEventListener("click", () => {
  minimized = !minimized;

  controls.style.display = minimized ? "none" : "flex";
  progressBar.style.display = minimized ? "none" : "block";
  timeDisplay.style.display = minimized ? "none" : "flex";

  minimizeBtn.textContent = minimized ? "expand" : "minimize";
});// Music library
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
    <button id="next-btn">next</button>
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
let currentIndex = 0;

let isScrubbing = false;
let isSwitching = false;

// Save key helper
function saveKey(song) {
  return "music-progress-" + song.file;
}

// Time format
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Load song (SAFE, no flicker, no accidental saving)
function loadSong(index, resume = true) {
  isSwitching = true;

  currentIndex = index;
  currentSong = songs[currentIndex];

  songTitle.textContent = currentSong.title;

  audio.pause();
  audio.src = currentSong.file;
  audio.load();

  playBtn.textContent = "play";

  audio.addEventListener("loadedmetadata", () => {
    const saved = localStorage.getItem(saveKey(currentSong));

    if (resume && saved !== null) {
      audio.currentTime = parseFloat(saved);
    }

    isSwitching = false;
  }, { once: true });
}

// Next song (linear)
nextBtn.addEventListener("click", () => {
  let next = currentIndex + 1;
  if (next >= songs.length) next = 0;

  loadSong(next, false);
  audio.play();
  playBtn.textContent = "pause";
});

// Play / Pause
playBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = "pause";
  } else {
    audio.pause();
    playBtn.textContent = "play";
  }
});

// Auto next
audio.addEventListener("ended", () => {
  let next = currentIndex + 1;
  if (next >= songs.length) next = 0;

  loadSong(next, false);
  audio.play();
});

// Progress update (stable + safe saving)
audio.addEventListener("timeupdate", () => {
  if (isSwitching) return;
  if (!audio.duration) return;
  if (isScrubbing) return;

  progressBar.value =
    (audio.currentTime / audio.duration) * 100;

  currentTimeText.textContent = formatTime(audio.currentTime);
  durationText.textContent = formatTime(audio.duration);

  localStorage.setItem(
    saveKey(currentSong),
    audio.currentTime
  );
});

// Seek
progressBar.addEventListener("pointerdown", () => {
  isScrubbing = true;
});

progressBar.addEventListener("input", () => {
  if (!audio.duration) return;
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

progressBar.addEventListener("pointerup", () => {
  isScrubbing = false;
});

// Dragging
let dragging = false;
let offsetX = 0;
let offsetY = 0;

header.addEventListener("mousedown", (e) => {
  dragging = true;
  offsetX = e.clientX - player.offsetLeft;
  offsetY = e.clientY - player.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  let x = e.clientX - offsetX;
  let y = e.clientY - offsetY;

  const maxX = window.innerWidth - player.offsetWidth;
  const maxY = window.innerHeight - player.offsetHeight;

  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));

  player.style.left = x + "px";
  player.style.top = y + "px";

  localStorage.setItem("musicPlayerX", x);
  localStorage.setItem("musicPlayerY", y);
});

document.addEventListener("mouseup", () => {
  dragging = false;
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

// Startup restore
window.addEventListener("DOMContentLoaded", () => {
  const lastSong = localStorage.getItem("music-last-song");

  if (lastSong) {
    const index = songs.findIndex(s => s.file === lastSong);

    if (index !== -1) {
      loadSong(index, false);

      audio.addEventListener("loadedmetadata", () => {
        const saved = localStorage.getItem(saveKey(songs[index]));

        if (saved !== null) {
          audio.currentTime = parseFloat(saved);
        }
      }, { once: true });

      return;
    }
  }

  loadSong(0, false);
});

// Save on exit
window.addEventListener("beforeunload", () => {
  if (!currentSong) return;

  localStorage.setItem("music-last-song", currentSong.file);
  localStorage.setItem(saveKey(currentSong), audio.currentTime);
});
