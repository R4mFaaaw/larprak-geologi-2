"""
GeoStruktur Studio — Fullstack Local Server (Python stdlib)
Menyajikan frontend HTML5/CSS3/JS, auto-scan folder music/,
dan menyediakan generator tantangan geometri Geologi Struktur berbasis Python.
"""
from __future__ import annotations

import json
import math
import mimetypes
import os
import random
import urllib.parse
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MUSIC_DIR = os.path.join(BASE_DIR, "music")
AUDIO_EXTS = {".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac"}

FRIENDLY_TITLES = {
    "01_langit_biru_lofi.wav": ("Langit Biru (Piano Lembut)", "Instrumen Lo-Fi • Tenang"),
    "02_kupu_kupu_senja.wav": ("Kupu-Kupu Senja (Kotak Musik)", "Melodi Lembut • Fokus"),
    "03_angin_lembah_ambient.wav": ("Angin Lembah (Ambient Langit)", "Ambient Santai • Rileks"),
}


def format_track_name(filename: str) -> tuple[str, str]:
    if filename in FRIENDLY_TITLES:
        return FRIENDLY_TITLES[filename]
    stem = os.path.splitext(filename)[0]
    cleaned = stem.replace("_", " ").replace("-", " ").strip()
    return (cleaned.title() if cleaned else filename, "Koleksi Folder Musik")


def list_music_files() -> list[dict]:
    if not os.path.isdir(MUSIC_DIR):
        return []
    tracks = []
    for entry in sorted(os.listdir(MUSIC_DIR)):
        full_path = os.path.join(MUSIC_DIR, entry)
        ext = os.path.splitext(entry)[1].lower()
        if os.path.isfile(full_path) and ext in AUDIO_EXTS:
            title, subtitle = format_track_name(entry)
            tracks.append(
                {
                    "id": entry,
                    "filename": entry,
                    "title": title,
                    "subtitle": subtitle,
                    "url": "music/" + urllib.parse.quote(entry),
                    "sizeBytes": os.path.getsize(full_path),
                }
            )
    return tracks


def generate_python_geometry_challenge(seed: int | None = None) -> dict:
    """Generator soal dinamik Python untuk minigame hitungan Laprak (Bab 2.6 & 2.8)."""
    rng = random.Random(seed)
    mode = rng.choice(["dip_3_point", "true_thickness"])

    if mode == "dip_3_point":
        # tan(delta) = delta_h / d
        angles = [15, 20, 25, 30, 35, 40, 45, 50, 60]
        target_angle = rng.choice(angles)
        d = rng.choice([20, 40, 50, 80, 100, 120])
        delta_h = round(d * math.tan(math.radians(target_angle)), 1)
        exact_angle = round(math.degrees(math.atan2(delta_h, d)), 1)
        return {
            "source": "python-engine",
            "mode": "tan_dip",
            "question": (
                f"Pada analisis Problema Tiga Titik, selisih ketinggian (Δh) antara garis jurus "
                f"adalah {delta_h} m dengan jarak horizontal tegak lurus (d) sebesar {d} m. "
                f"Berapa besar sudut kemiringan (dip) lapisan batuan tersebut?"
            ),
            "formula": "tan δ = Δh / d",
            "answer": exact_angle,
            "unit": "°",
            "tolerance": 1.2,
            "explanation": f"tan δ = {delta_h} / {d} = {delta_h / d:.3f}, sehingga δ = arctan({delta_h / d:.3f}) ≈ {exact_angle}°.",
        }

    # True thickness = Apparent thickness * sin(dip)
    dip = rng.choice([20, 25, 30, 35, 40, 45, 50, 60])
    apparent = rng.choice([20, 30, 40, 50, 60, 80, 100])
    true_t = round(apparent * math.sin(math.radians(dip)), 1)
    return {
        "source": "python-engine",
        "mode": "true_thickness",
        "question": (
            f"Suatu singkapan batuan memiliki ketebalan semu (apparent thickness) {apparent} m "
            f"dengan sudut kemiringan lapisan (dip) {dip}°. Hitung ketebalan sebenarnya (true thickness)!"
        ),
        "formula": "True thickness = Apparent thickness × sin(Dip)",
        "answer": true_t,
        "unit": "m",
        "tolerance": 1.0,
        "explanation": f"True thickness = {apparent} × sin({dip}°) = {apparent} × {math.sin(math.radians(dip)):.3f} ≈ {true_t} m.",
    }


class GeoStrukturHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/music":
            payload = {"tracks": list_music_files()}
            self._send_json(payload)
            return
        if parsed.path == "/api/minigame/geometry":
            payload = generate_python_geometry_challenge()
            self._send_json(payload)
            return
        if parsed.path == "/api/health":
            self._send_json({"status": "ok", "app": "GeoStruktur Studio"})
            return
        super().do_GET()

    def _send_json(self, data: dict, status: int = HTTPStatus.OK) -> None:
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def log_message(self, format: str, *args) -> None:
        # Log ringkas agar terminal tetap rapi
        pass


def run_server(port: int = 8080) -> None:
    mimetypes.add_type("audio/wav", ".wav")
    mimetypes.add_type("audio/mpeg", ".mp3")
    mimetypes.add_type("application/javascript", ".js")
    server = ThreadingHTTPServer(("127.0.0.1", port), GeoStrukturHandler)
    print(f"GeoStruktur Studio berjalan di http://127.0.0.1:{port}")
    print(f"Folder musik aktif: {MUSIC_DIR} ({len(list_music_files())} lagu ditemukan)")
    print("Tekan Ctrl+C untuk berhenti.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer dihentikan.")
        server.server_close()


if __name__ == "__main__":
    run_server(int(os.environ.get("PORT", "8080")))
