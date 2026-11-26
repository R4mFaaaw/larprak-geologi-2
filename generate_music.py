"""
Generator musik instrumental ambient & lo-fi lembut untuk folder music/.
Menghasilkan 3 file WAV berdurasi ~45-60 detik yang seamless loopable
tanpa dependensi eksternal (hanya stdlib Python: math, wave, struct, random).
"""
import math
import os
import random
import struct
import wave

SAMPLE_RATE = 22050  # Ukuran file ringan namun tetap hangat & jernih untuk ambient
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "music")


def midi_to_freq(midi: float) -> float:
    return 440.0 * (2.0 ** ((midi - 69.0) / 12.0))


def write_wav(filename: str, samples: list[float]) -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    path = os.path.join(OUTPUT_DIR, filename)
    # Normalisasi lembut agar tidak clipping
    peak = max((abs(s) for s in samples), default=1.0)
    scale = 0.78 / peak if peak > 0 else 1.0
    # Crossfade ujung awal dan akhir (0.5 detik) agar loop mulus
    fade_len = min(int(SAMPLE_RATE * 0.5), len(samples) // 4)
    for i in range(fade_len):
        t = i / fade_len
        samples[i] *= t
        samples[-(i + 1)] *= t

    with wave.open(path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        buf = bytearray()
        for s in samples:
            val = max(-32767, min(32767, int(s * scale * 32767)))
            buf += struct.pack("<h", val)
        wf.writeframes(bytes(buf))
    print(f"Generated: {path} ({len(samples) / SAMPLE_RATE:.1f}s)")


def add_warm_piano_note(buf: list[float], start_sec: float, midi: float, dur_sec: float, amp: float = 0.22) -> None:
    freq = midi_to_freq(midi)
    start_idx = int(start_sec * SAMPLE_RATE)
    n_samples = int(dur_sec * SAMPLE_RATE)
    attack = int(0.018 * SAMPLE_RATE)
    for i in range(n_samples):
        idx = start_idx + i
        if idx >= len(buf):
            break
        t = i / SAMPLE_RATE
        env = (i / attack) if i < attack else math.exp(-2.4 * (t - 0.018))
        # Harmonik hangat (fundamental + oktaf lembut + sedikit harmonic ke-3)
        sig = (
            0.72 * math.sin(2.0 * math.pi * freq * t)
            + 0.21 * math.sin(2.0 * math.pi * freq * 2.0 * t) * math.exp(-1.5 * t)
            + 0.07 * math.sin(2.0 * math.pi * freq * 3.0 * t) * math.exp(-3.0 * t)
        )
        buf[idx] += amp * env * sig


def add_music_box_note(buf: list[float], start_sec: float, midi: float, dur_sec: float, amp: float = 0.18) -> None:
    freq = midi_to_freq(midi)
    start_idx = int(start_sec * SAMPLE_RATE)
    n_samples = int(dur_sec * SAMPLE_RATE)
    attack = int(0.008 * SAMPLE_RATE)
    for i in range(n_samples):
        idx = start_idx + i
        if idx >= len(buf):
            break
        t = i / SAMPLE_RATE
        env = (i / attack) if i < attack else math.exp(-3.1 * t)
        sig = (
            0.80 * math.sin(2.0 * math.pi * freq * t)
            + 0.15 * math.sin(2.0 * math.pi * freq * 2.0 * t) * math.exp(-4.0 * t)
            + 0.05 * math.sin(2.0 * math.pi * freq * 4.0 * t) * math.exp(-8.0 * t)
        )
        buf[idx] += amp * env * sig


def add_sky_pad(buf: list[float], start_sec: float, midis: list[float], dur_sec: float, amp: float = 0.09) -> None:
    start_idx = int(start_sec * SAMPLE_RATE)
    n_samples = int(dur_sec * SAMPLE_RATE)
    fade = max(1, int(0.8 * SAMPLE_RATE))
    freqs = [midi_to_freq(m) for m in midis]
    for i in range(n_samples):
        idx = start_idx + i
        if idx >= len(buf):
            break
        t = i / SAMPLE_RATE
        if i < fade:
            env = i / fade
        elif i > n_samples - fade:
            env = (n_samples - i) / fade
        else:
            env = 1.0
        # Sedikit detune chorus lembut agar terasa luas dan menenangkan
        sig = 0.0
        for f in freqs:
            sig += 0.55 * math.sin(2.0 * math.pi * f * t)
            sig += 0.25 * math.sin(2.0 * math.pi * (f * 1.0025) * t)
            sig += 0.20 * math.sin(2.0 * math.pi * (f * 0.9975) * t)
        buf[idx] += (amp / max(1, len(freqs))) * env * sig


def generate_langit_biru_lofi() -> None:
    # Progresi Fmaj7 -> Em7 -> Dm7 -> Cmaj7 (2 putaran, ~32 detik)
    beat = 0.85  # ~70 BPM santai
    chords = [
        [53, 60, 64, 69],  # Fmaj7
        [52, 59, 62, 67],  # Em7
        [50, 57, 60, 65],  # Dm7
        [48, 55, 59, 64],  # Cmaj7
    ]
    melodies = [
        [(0.0, 76), (1.5, 74), (2.5, 72), (3.5, 74)],
        [(0.0, 74), (1.5, 72), (2.5, 71), (3.5, 72)],
        [(0.0, 72), (1.5, 69), (2.5, 72), (3.5, 74)],
        [(0.0, 76), (1.5, 72), (3.0, 71)],
    ]
    total_sec = 2 * len(chords) * 4 * beat + 1.5
    buf = [0.0] * int(total_sec * SAMPLE_RATE)

    for rep in range(2):
        for c_idx, chord in enumerate(chords):
            bar_start = (rep * 4 + c_idx) * 4 * beat
            add_sky_pad(buf, bar_start, chord, 4 * beat, amp=0.14)
            # Arpeggio lembut akor
            for step, note in enumerate(chord):
                add_warm_piano_note(buf, bar_start + step * 0.14, note, 3.2 * beat, amp=0.13)
            # Melodi kanan
            for offset, mel_note in melodies[c_idx]:
                add_warm_piano_note(buf, bar_start + offset * beat, mel_note, 1.8 * beat, amp=0.18)

    write_wav("01_langit_biru_lofi.wav", buf)


def generate_kupu_kupu_senja() -> None:
    # Kotak musik lembut di G mayor pentatonik (~30 detik)
    step = 0.42
    # G4=67, A4=69, B4=71, D5=74, E5=76, G5=79, F#5=78
    pattern = [
        67, 71, 74, 79, 76, 74, 71, 69,
        67, 71, 74, 78, 74, 71, 69, 67,
        64, 67, 71, 76, 74, 71, 67, 64,
        60, 64, 67, 74, 72, 69, 67, 64,
    ]
    bass_chords = [
        (0, [55, 62]),   # G
        (8, [54, 62]),   # D/F#
        (16, [52, 59]),  # Em
        (24, [48, 55]),  # C
    ]
    total_sec = 2 * len(pattern) * step + 2.0
    buf = [0.0] * int(total_sec * SAMPLE_RATE)

    for rep in range(2):
        base_t = rep * len(pattern) * step
        for start_idx, bass in bass_chords:
            add_sky_pad(buf, base_t + start_idx * step, bass, 8 * step, amp=0.11)
        for i, note in enumerate(pattern):
            t = base_t + i * step
            add_music_box_note(buf, t, note + 12, 2.2, amp=0.16)
            if i % 4 == 0:
                add_warm_piano_note(buf, t, note - 12, 2.4, amp=0.10)

    write_wav("02_kupu_kupu_senja.wav", buf)


def generate_angin_lembah_ambient() -> None:
    # Ambient pad + hembusan angin lembut + lonceng pentatonik (~36 detik)
    total_sec = 36.0
    buf = [0.0] * int(total_sec * SAMPLE_RATE)
    rng = random.Random(2026)

    # Filtered soft pink-ish wind noise sangat halus
    last = 0.0
    for i in range(len(buf)):
        white = rng.uniform(-1.0, 1.0)
        last = 0.965 * last + 0.035 * white
        swell = 0.55 + 0.45 * math.sin(2.0 * math.pi * (i / SAMPLE_RATE) / 9.0)
        buf[i] += 0.045 * swell * last

    chords = [
        (0.0, [48, 55, 60, 67], 9.0),   # Csus2
        (9.0, [45, 52, 57, 64], 9.0),   # Am7
        (18.0, [41, 48, 53, 60], 9.0),  # Fmaj
        (27.0, [43, 50, 55, 62], 9.0),  # Gsus4
    ]
    for start_t, notes, dur in chords:
        add_sky_pad(buf, start_t, notes, dur, amp=0.16)

    chime_notes = [72, 74, 76, 79, 81, 84]
    for i in range(18):
        t = 1.2 + i * 1.9 + rng.uniform(-0.2, 0.2)
        n = chime_notes[(i * 3 + 1) % len(chime_notes)]
        add_music_box_note(buf, t, n, 3.6, amp=0.11)

    write_wav("03_angin_lembah_ambient.wav", buf)


if __name__ == "__main__":
    generate_langit_biru_lofi()
    generate_kupu_kupu_senja()
    generate_angin_lembah_ambient()
    readme_path = os.path.join(OUTPUT_DIR, "README.txt")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(
            "Folder Musik GeoStruktur Studio\n"
            "==============================\n\n"
            "1. Kamu bisa menambahkan file musik favoritmu (.mp3, .wav, .ogg, .m4a) ke dalam folder ini.\n"
            "2. Jika menjalankan website lewat `start_website.bat` atau `python server.py`,\n"
            "   semua lagu baru di folder ini otomatis muncul di Menu Musik!\n"
            "3. Jika membuka `index.html` langsung di browser, kamu juga bisa klik tombol\n"
            "   '+ Tambah Lagu dari Laptop' di dalam Menu Musik untuk memutar lagu apapun secara instan.\n"
        )
    print(f"Wrote {readme_path}")
