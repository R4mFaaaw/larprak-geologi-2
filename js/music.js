/**
 * Pengelola Musik Folder `music/`, Pemutar Mini, Slide-Over Drawer,
 * Upload Lagu Lokal, dan Efek Suara Lembut (Web Audio API).
 */
window.GeoMusic = (() => {
  const DEFAULT_TRACKS = [
    {
      id: "01_langit_biru_lofi.wav",
      title: "Langit Biru (Piano Lembut)",
      subtitle: "Instrumen Lo-Fi • Tenang",
      url: "music/01_langit_biru_lofi.wav",
    },
    {
      id: "02_kupu_kupu_senja.wav",
      title: "Kupu-Kupu Senja (Kotak Musik)",
      subtitle: "Melodi Lembut • Fokus",
      url: "music/02_kupu_kupu_senja.wav",
    },
    {
      id: "03_angin_lembah_ambient.wav",
      title: "Angin Lembah (Ambient Langit)",
      subtitle: "Ambient Santai • Rileks",
      url: "music/03_angin_lembah_ambient.wav",
    },
  ];

  let tracks = [...DEFAULT_TRACKS];
  let currentIndex = 0;
  let isPlaying = false;
  let loopOne = false;
  let sfxEnabled = true;

  const audio = new Audio();
  audio.preload = "metadata";
  audio.volume = 0.55;

  let audioCtx = null;

  function ensureAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playSfx(type) {
    if (!sfxEnabled) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const playTone = (freq, start, dur, gainVal = 0.06, oscType = "sine") => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(gainVal, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };

    if (type === "flip") {
      playTone(523.25, now, 0.11, 0.035, "triangle");
    } else if (type === "ok") {
      playTone(587.33, now, 0.14, 0.055);
      playTone(880, now + 0.08, 0.22, 0.055);
    } else if (type === "err") {
      playTone(310, now, 0.14, 0.045, "triangle");
      playTone(255, now + 0.09, 0.18, 0.045, "triangle");
    } else if (type === "win") {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        playTone(f, now + idx * 0.09, 0.34, 0.06);
      });
    }
  }

  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function renderPlaylist() {
    const list = document.getElementById("playlist-list");
    if (!list) return;
    list.innerHTML = tracks
      .map(
        (t, idx) => `
      <li class="playlist-item ${idx === currentIndex ? "is-active" : ""}" data-track-idx="${idx}">
        <div>
          <strong>${t.title}</strong>
          <span>${t.subtitle || "Musik Belajar"}</span>
        </div>
        <span class="badge badge-sky">${idx === currentIndex && isPlaying ? "Diputar" : "Putar"}</span>
      </li>`
      )
      .join("");

    list.querySelectorAll(".playlist-item").forEach((el) => {
      el.addEventListener("click", () => {
        const idx = Number(el.dataset.trackIdx);
        loadTrack(idx, true);
      });
    });
  }

  function updatePlayUI() {
    const track = tracks[currentIndex] || tracks[0];
    const playSvg = isPlaying
      ? '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>'
      : '<polygon points="6,4 20,12 6,20"/>';

    const mainIcon = document.getElementById("main-play-icon");
    const miniIcon = document.getElementById("mini-play-icon");
    if (mainIcon) mainIcon.innerHTML = playSvg;
    if (miniIcon) miniIcon.innerHTML = playSvg;

    document.getElementById("topbar-eq")?.classList.toggle("is-playing", isPlaying);
    document.querySelector(".album-art")?.classList.toggle("is-playing", isPlaying);

    if (track) {
      document.getElementById("player-title").textContent = track.title;
      document.getElementById("player-subtitle").textContent = track.subtitle || "";
      document.getElementById("mini-track-title").textContent = track.title;
      document.getElementById("mini-track-status").textContent = isPlaying
        ? "Sedang diputar • Rileks 🦋"
        : "Dijeda • Klik untuk menu musik";
    }
    renderPlaylist();
  }

  function loadTrack(idx, autoPlay = false) {
    if (!tracks.length) return;
    currentIndex = (idx + tracks.length) % tracks.length;
    const track = tracks[currentIndex];
    audio.src = track.url;
    audio.load();
    if (autoPlay) {
      audio
        .play()
        .then(() => {
          isPlaying = true;
          updatePlayUI();
        })
        .catch(() => {
          isPlaying = false;
          updatePlayUI();
          window.GeoApp?.toast("Ketuk tombol putar sekali lagi untuk memulai audio.");
        });
    } else {
      updatePlayUI();
    }
  }

  function togglePlay() {
    if (!audio.src && tracks.length) {
      loadTrack(currentIndex, true);
      return;
    }
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      updatePlayUI();
    } else {
      audio
        .play()
        .then(() => {
          isPlaying = true;
          updatePlayUI();
        })
        .catch(() => {
          window.GeoApp?.toast("Gagal memutar track. Pastikan file audio tersedia.");
        });
    }
  }

  function openDrawer(open) {
    const drawer = document.getElementById("music-drawer");
    const backdrop = document.getElementById("music-backdrop");
    drawer?.classList.toggle("is-open", open);
    backdrop?.classList.toggle("is-open", open);
    drawer?.setAttribute("aria-hidden", String(!open));
  }

  async function discoverServerTracks() {
    if (location.protocol === "file:") return;
    try {
      const res = await fetch("/api/music", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        tracks = data.tracks;
        loadTrack(0, false);
      }
    } catch {
      // Fallback mulus ke DEFAULT_TRACKS
    }
  }

  function init() {
    loadTrack(0, false);
    discoverServerTracks();

    document.getElementById("open-music-btn")?.addEventListener("click", () => openDrawer(true));
    document.getElementById("mini-open-drawer")?.addEventListener("click", () => openDrawer(true));
    document.getElementById("close-music-btn")?.addEventListener("click", () => openDrawer(false));
    document.getElementById("music-backdrop")?.addEventListener("click", () => openDrawer(false));

    document.getElementById("btn-main-play")?.addEventListener("click", togglePlay);
    document.getElementById("mini-play-btn")?.addEventListener("click", togglePlay);
    document.getElementById("btn-prev-track")?.addEventListener("click", () => loadTrack(currentIndex - 1, true));
    document.getElementById("btn-next-track")?.addEventListener("click", () => loadTrack(currentIndex + 1, true));
    document.getElementById("mini-next-btn")?.addEventListener("click", () => loadTrack(currentIndex + 1, true));

    const loopBtn = document.getElementById("btn-loop-mode");
    loopBtn?.addEventListener("click", () => {
      loopOne = !loopOne;
      loopBtn.classList.toggle("is-active", loopOne);
      window.GeoApp?.toast(loopOne ? "Mode ulang 1 lagu aktif" : "Mode putar berurutan aktif");
    });

    const sfxBtn = document.getElementById("btn-sfx-toggle");
    sfxBtn?.addEventListener("click", () => {
      sfxEnabled = !sfxEnabled;
      sfxBtn.classList.toggle("is-active", sfxEnabled);
      window.GeoApp?.toast(sfxEnabled ? "Efek suara lembut aktif" : "Efek suara dimatikan");
    });

    const volSlider = document.getElementById("volume-slider");
    const volPct = document.getElementById("volume-pct");
    volSlider?.addEventListener("input", () => {
      const v = Number(volSlider.value);
      audio.volume = v;
      if (volPct) volPct.textContent = `${Math.round(v * 100)}%`;
    });

    const seekSlider = document.getElementById("seek-slider");
    seekSlider?.addEventListener("input", () => {
      if (audio.duration) {
        audio.currentTime = (Number(seekSlider.value) / 100) * audio.duration;
      }
    });

    audio.addEventListener("timeupdate", () => {
      const cur = audio.currentTime || 0;
      const dur = audio.duration || 0;
      document.getElementById("time-current").textContent = formatTime(cur);
      document.getElementById("time-total").textContent = formatTime(dur);
      if (seekSlider && dur > 0) {
        seekSlider.value = String((cur / dur) * 100);
      }
    });

    audio.addEventListener("ended", () => {
      if (loopOne) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        loadTrack(currentIndex + 1, true);
      }
    });

    // Upload lagu lokal langsung dari laptop/HP
    document.getElementById("local-music-input")?.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const startNewIdx = tracks.length;
      files.forEach((file) => {
        const cleanName = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
        tracks.push({
          id: `local-${Date.now()}-${file.name}`,
          title: cleanName,
          subtitle: "Lagu Pilihanmu • Lokal",
          url: URL.createObjectURL(file),
        });
      });
      loadTrack(startNewIdx, true);
      window.GeoApp?.toast(`${files.length} lagu ditambahkan ke Menu Musik 🦋`);
    });
  }

  return { init, playSfx };
})();
