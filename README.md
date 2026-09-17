# 🎵 arch-music

![license](https://img.shields.io/badge/license-MIT-1793d1)
![last commit](https://img.shields.io/github/last-commit/adrayaf/music-player?color=1793d1)

A minimalist music player with **Arch Linux terminal aesthetic**, built with **Python (Flask + pygame)** backend and **Electron** frontend.

> Multi-language desktop app: Python handles audio, HTML/CSS/JS handles UI.

![status](https://img.shields.io/badge/status-active-1793d1)
![python](https://img.shields.io/badge/python-3.12-3776ab)
![electron](https://img.shields.io/badge/electron-33-47848f)

---

## ✨ Features

- 🎧 Play local MP3 files from `backend/music/`
- ⏯️ Play / Pause / Resume / Stop
- ⏭️ Next / Previous track
- 📊 Progress bar with auto-next
- 🎨 Arch Linux terminal theme (monokuro, mono font)
- 📱 Responsive layout (1-column on narrow windows)
- 🔌 REST API between Python and Electron

---

## 🏗️ Architecture
┌─────────────────────────────┐
│ Electron (HTML/CSS/JS) │ ← UI, playlist, controls
│ renderer.js → fetch() │
└──────────────┬──────────────┘
│ HTTP (localhost:5000)
┌──────────────▼──────────────┐
│ Flask API (Python) │ ← /songs /play /pause /stop
│ pygame.mixer (audio) │
│ mutagen (metadata) │
└─────────────────────────────┘


---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend (Python)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install flask flask-cors pygame mutagen

Taruh file .mp3 kamu ke backend/music/, lalu:
python main.py
Server jalan di http://127.0.0.1:5000.

Frontend (Electron)
Buka terminal baru:
cd frontend
npm install
npm start

🔌 API Endpoints
Method	Endpoint	        Deskripsi
GET	    /songs	            List semua lagu
POST	/play/<filename>	Play lagu
POST	/pause	            Pause
POST	/resume	            Resume
POST	/stop	            Stop
GET	    /status	            Status player

📁 Project Structure
music-player/
├── backend/
│   ├── main.py           # Flask + pygame audio engine
│   ├── requirements.txt
│   └── music/            # taruh MP3 di sini
├── frontend/
│   ├── main.js           # Electron main process
│   ├── index.html        # UI
│   ├── style.css         # Arch theme
│   ├── renderer.js       # UI logic
│   └── package.json
├── docs/
│   └── screenshot.png
├── .gitignore
├── LICENSE
└── README.md

🛠️ Tech Stack
Python 3.12 — backend logic
Flask — REST API
pygame — audio playback
mutagen — MP3 metadata
Electron — desktop shell
HTML/CSS/JS — UI

📸 Screenshot
https://docs/screenshot.png

📝 License
MIT

