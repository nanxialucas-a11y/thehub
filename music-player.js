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
