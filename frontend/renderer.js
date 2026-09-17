const API = "http://127.0.0.1:5000";

// State
let songs = [];
let currentIndex = -1;
let isPlaying = false;
let progressInterval = null;

// Elemen DOM
const playlistEl = document.getElementById("playlist");
const currentTitle = document.getElementById("current-title");
const currentArtist = document.getElementById("current-artist");
const statusEl = document.getElementById("status");
const btnPlay = document.getElementById("btn-play");
const btnStop = document.getElementById("btn-stop");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const progressFill = document.getElementById("progress-fill");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");

// ====== HELPER ======
function formatTime(seconds) {
  if (!seconds || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function setStatus(msg) {
  statusEl.textContent = msg;
}

// ====== FETCH DARI BACKEND ======
async function loadSongs() {
  try {
    const res = await fetch(`${API}/songs`);
    songs = await res.json();
    renderPlaylist();
    setStatus(`✅ Terhubung — ${songs.length} lagu ditemukan`);
  } catch (err) {
    setStatus(`❌ Gagal konek ke backend: ${err.message}`);
    console.error(err);
  }
}

async function playSong(index) {
  if (index < 0 || index >= songs.length) return;
  const song = songs[index];
  const encoded = encodeURIComponent(song.filename);

  try {
    const res = await fetch(`${API}/play/${encoded}`, { method: "POST" });
    if (!res.ok) throw new Error("Gagal play");

    currentIndex = index;
    isPlaying = true;
    updateNowPlaying(song);
    updatePlayButton();
    updateActivePlaylistItem();
    startProgress(song.duration);
    setStatus(`▶️ Memutar: ${song.title}`);
  } catch (err) {
    setStatus(`❌ ${err.message}`);
  }
}

async function pauseSong() {
  await fetch(`${API}/pause`, { method: "POST" });
  isPlaying = false;
  updatePlayButton();
  stopProgress();
  setStatus("⏸ Dijeda");
}

async function resumeSong() {
  await fetch(`${API}/resume`, { method: "POST" });
  isPlaying = true;
  updatePlayButton();
  startProgress(songs[currentIndex].duration);
  setStatus("▶️ Dilanjutkan");
}

async function stopSong() {
  await fetch(`${API}/stop`, { method: "POST" });
  isPlaying = false;
  currentIndex = -1;
  updatePlayButton();
  stopProgress();
  progressFill.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  currentTitle.textContent = "Belum ada lagu";
  currentArtist.textContent = "—";
  updateActivePlaylistItem();
  setStatus("⏹ Dihentikan");
}

// ====== UI UPDATES ======
function renderPlaylist() {
  playlistEl.innerHTML = "";
  if (songs.length === 0) {
    playlistEl.innerHTML = "<li style='color:#666'>Tidak ada lagu di folder music/</li>";
    return;
  }

  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${song.title}</span>
      <span class="duration">${formatTime(song.duration)}</span>
    `;
    li.addEventListener("click", () => playSong(index));
    playlistEl.appendChild(li);
  });
}

function updateNowPlaying(song) {
  currentTitle.textContent = song.title;
  currentArtist.textContent = song.artist;
  totalTimeEl.textContent = formatTime(song.duration);
}

function updatePlayButton() {
  btnPlay.textContent = isPlaying ? "⏸" : "▶";
}

function updateActivePlaylistItem() {
  [...playlistEl.children].forEach((li, i) => {
    li.classList.toggle("active", i === currentIndex);
  });
}

// ====== PROGRESS BAR (simulasi) ======
function startProgress(duration) {
  stopProgress();
  if (!duration || duration <= 0) return;
  let elapsed = 0;
  progressInterval = setInterval(() => {
    elapsed += 1;
    const pct = Math.min((elapsed / duration) * 100, 100);
    progressFill.style.width = `${pct}%`;
    currentTimeEl.textContent = formatTime(elapsed);
    if (elapsed >= duration) {
      stopProgress();
      // Auto next
      if (currentIndex < songs.length - 1) playSong(currentIndex + 1);
      else stopSong();
    }
  }, 1000);
}

function stopProgress() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

// ====== EVENT LISTENERS ======
btnPlay.addEventListener("click", () => {
  if (isPlaying) pauseSong();
  else if (currentIndex >= 0) resumeSong();
  else if (songs.length > 0) playSong(0);
});

btnStop.addEventListener("click", stopSong);

btnPrev.addEventListener("click", () => {
  if (currentIndex > 0) playSong(currentIndex - 1);
});

btnNext.addEventListener("click", () => {
  if (currentIndex < songs.length - 1) playSong(currentIndex + 1);
});

// ====== INIT ======
loadSongs();