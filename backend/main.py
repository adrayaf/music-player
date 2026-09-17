from flask import Flask, jsonify
from flask_cors import CORS
import os
import pygame
from mutagen.mp3 import MP3

app = Flask(__name__)
CORS(app)  # biar Electron bisa akses

# ====== KONFIGURASI ======
MUSIC_FOLDER = os.path.join(os.path.dirname(__file__), "music")

# ====== INISIALISASI AUDIO ======
pygame.mixer.init()

# State global (sederhana dulu)
current_song = None
is_playing = False

# ====== HELPER ======
def scan_music():
    """Baca semua file .mp3 di folder music/ dan ambil metadata-nya.
    Kalau metadata gagal dibaca, tetap masukkan lagu pakai nama file.
    """
    songs = []
    if not os.path.exists(MUSIC_FOLDER):
        return songs

    for filename in os.listdir(MUSIC_FOLDER):
        if filename.lower().endswith(".mp3"):
            filepath = os.path.join(MUSIC_FOLDER, filename)

            # Default: pakai nama file sebagai judul
            title = os.path.splitext(filename)[0]
            artist = "Unknown"
            duration = 0

            # Coba ambil metadata, tapi jangan sampai gagal total
            try:
                audio = MP3(filepath)
                duration = int(audio.info.length)

                if audio.tags:
                    title_tag = audio.tags.get("TIT2")
                    artist_tag = audio.tags.get("TPE1")
                    if title_tag:
                        title = str(title_tag)
                    if artist_tag:
                        artist = str(artist_tag)
            except Exception as e:
                print(f"⚠️ Metadata gagal dibaca untuk {filename}: {e}")
                print(f"   → Tetap dimasukkan pakai nama file.")

            songs.append({
                "filename": filename,
                "title": title,
                "artist": artist,
                "duration": duration,
            })

    return songs

# ====== ROUTES ======

@app.route("/songs", methods=["GET"])
def get_songs():
    """Return daftar semua lagu."""
    return jsonify(scan_music())

@app.route("/play/<path:filename>", methods=["POST"])
def play_song(filename):
    """Play lagu berdasarkan filename."""
    global current_song, is_playing
    filepath = os.path.join(MUSIC_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "File tidak ditemukan"}), 404

    try:
        pygame.mixer.music.load(filepath)
        pygame.mixer.music.play()
        current_song = filename
        is_playing = True
        return jsonify({"status": "playing", "song": filename})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/pause", methods=["POST"])
def pause_song():
    global is_playing
    pygame.mixer.music.pause()
    is_playing = False
    return jsonify({"status": "paused"})

@app.route("/resume", methods=["POST"])
def resume_song():
    global is_playing
    pygame.mixer.music.unpause()
    is_playing = True
    return jsonify({"status": "resumed"})

@app.route("/stop", methods=["POST"])
def stop_song():
    global current_song, is_playing
    pygame.mixer.music.stop()
    current_song = None
    is_playing = False
    return jsonify({"status": "stopped"})

@app.route("/status", methods=["GET"])
def get_status():
    return jsonify({
        "current_song": current_song,
        "is_playing": is_playing,
    })

# ====== MAIN ======
if __name__ == "__main__":
    print(f"📁 Music folder: {MUSIC_FOLDER}")
    print(f"🎵 Ditemukan {len(scan_music())} lagu")
    app.run(host="127.0.0.1", port=5000, debug=True)