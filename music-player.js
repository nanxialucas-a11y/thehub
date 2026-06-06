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
