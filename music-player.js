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