(() => {
  // Prevent double-loading entirely
  if (window.__musicPlayerLoaded) return;
  window.__musicPlayerLoaded = true;

  // Song list (safe global fallback)
  const songs = window.songs ?? (window.songs = [
    { title: "Rainy", file: "/music/rainy.mp3" },
    { title: "Analog Morning", file: "/music/analogmorning.mp3" },
    { title: "Wildflower", file: "/music/wildflower.mp3" }
  ]);

  // Inject UI once
  if (!document.getElementById("music-player")) {
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
  }

  // Elements
  const audio = document.getElementById("audio-player");
  const player = document.getElementById("music-player");
  const songTitle = document.getElementById("song-title");
  const playBtn = document.getElementById("play-btn");
  const nextBtn = document.getElementById("next-btn");
  const progressBar = document.getElementById("music-progress");
  const currentTimeText = document.getElementById("current-time");
  const durationText = document.getElementById("duration");
  const minimizeBtn = document.getElementById("music-minimize");
  const controls = document.getElementById("music-controls");
  const header = document.getElementById("music-header");

  let currentSong = null;
  let isScrubbing = false;

  // Helpers
  function keyProgress(file) {
    return "music-progress-" + file;
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  // Load song safely
  function loadSong(song) {
    if (!song) return;

    currentSong = song;

    audio.src = song.file;
    songTitle.textContent = song.title;

    audio.load();

    audio.addEventListener("loadedmetadata", () => {
      const saved = localStorage.getItem(keyProgress(song.file));
      if (saved !== null) {
        audio.currentTime = parseFloat(saved);
      }
    }, { once: true });

    playBtn.textContent = "play";
  }

  // Random song (no repeats)
  let lastIndex = -1;

  function loadRandomSong() {
    if (songs.length === 0) return;

    let index;
    do {
      index = Math.floor(Math.random() * songs.length);
    } while (index === lastIndex && songs.length > 1);

    lastIndex = index;
    loadSong(songs[index]);
  }

  // Restore last session
  const lastSong = localStorage.getItem("music-last-song");
  const startSong = songs.find(s => s.file === lastSong);

  if (startSong) loadSong(startSong);
  else loadRandomSong();

  // Play/Pause
  playBtn.addEventListener("click", () => {
    if (!currentSong) return;

    if (audio.paused) {
      audio.play();
      playBtn.textContent = "pause";
    } else {
      audio.pause();
      playBtn.textContent = "play";
    }
  });

  // Next
  nextBtn.addEventListener("click", () => {
    loadRandomSong();
    audio.play();
    playBtn.textContent = "pause";
  });

  // Auto next
  audio.addEventListener("ended", () => {
    loadRandomSong();
    audio.play();
  });

  // Progress update
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || isScrubbing) return;

    progressBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeText.textContent = formatTime(audio.currentTime);
    durationText.textContent = formatTime(audio.duration);

    if (currentSong) {
      localStorage.setItem(keyProgress(currentSong.file), audio.currentTime);
    }
  });

  // Seek
  progressBar.addEventListener("pointerdown", () => isScrubbing = true);

  progressBar.addEventListener("input", () => {
    if (!audio.duration) return;
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  });

  progressBar.addEventListener("pointerup", () => isScrubbing = false);

  // Save on exit
  window.addEventListener("beforeunload", () => {
    if (!currentSong) return;

    localStorage.setItem("music-last-song", currentSong.file);
    localStorage.setItem(keyProgress(currentSong.file), audio.currentTime);
  });

  // Drag system (safe)
  let dragging = false;
  let ox = 0, oy = 0;

  header.addEventListener("mousedown", (e) => {
    dragging = true;
    ox = e.clientX - player.offsetLeft;
    oy = e.clientY - player.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    let x = e.clientX - ox;
    let y = e.clientY - oy;

    const maxX = window.innerWidth - player.offsetWidth;
    const maxY = window.innerHeight - player.offsetHeight;

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    player.style.left = x + "px";
    player.style.top = y + "px";
  });

  document.addEventListener("mouseup", () => dragging = false);

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

})();
