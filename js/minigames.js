/**
 * 4 Minigames Interaktif Geologi Struktur:
 * 1. Pasangkan Kata Kunci (Term & Definition Match)
 * 2. Tebak Simbol Peta Geologi (Visual SVG)
 * 3. Klasifikasi Cepat (Sortir Struktur & Gaya)
 * 4. Lab Geometri & Python Engine (Visual Penampang + Hitungan Rumus)
 */
window.GeoMinigames = (() => {
  const WINS_KEY = "geo_riana_games_won_v1";
  let activeGame = "match";
  let gamesWon = Number(localStorage.getItem(WINS_KEY) || "0");

  function recordWin() {
    gamesWon++;
    localStorage.setItem(WINS_KEY, String(gamesWon));
    window.GeoMusic?.playSfx("win");
    window.GeoApp?.butterflyBurst(12);
    window.GeoApp?.refreshStats();
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /* ==================== GAME 1: PASANGKAN KATA KUNCI ==================== */
  let matchLevelIdx = 0;
  function renderMatchGame() {
    const stage = document.getElementById("minigame-stage");
    const sets = window.GEO_DATA.matchSets;
    const set = sets[matchLevelIdx];

    const leftItems = shuffle(set.pairs.map((p, i) => ({ id: i, text: p.term })));
    const rightItems = shuffle(set.pairs.map((p, i) => ({ id: i, text: p.def })));

    let selectedLeft = null;
    let matchedCount = 0;
    let mistakes = 0;
    let score = 0;
    const startMs = Date.now();

    stage.innerHTML = `
      <div class="game-header">
        <div>
          <h3 style="margin:0;color:var(--sky-900);">${set.title}</h3>
          <p class="muted">Pilih satu istilah di kiri, lalu pasangkan dengan definisi yang tepat di kanan.</p>
        </div>
        <div class="game-stats">
          <select id="match-level-select" class="sky-select" aria-label="Pilih Level">
            ${sets.map((s, idx) => `<option value="${idx}" ${idx === matchLevelIdx ? "selected" : ""}>${s.title}</option>`).join("")}
          </select>
          <span class="stat-chip" id="match-score">Skor: 0</span>
          <span class="stat-chip" id="match-progress">0 / ${set.pairs.length}</span>
        </div>
      </div>
      <div class="match-columns">
        <div class="match-col" id="match-left">
          ${leftItems.map((it) => `<button class="match-tile" data-id="${it.id}">${it.text}</button>`).join("")}
        </div>
        <div class="match-col" id="match-right">
          ${rightItems.map((it) => `<button class="match-tile" data-id="${it.id}">${it.text}</button>`).join("")}
        </div>
      </div>
      <div id="match-result"></div>
    `;

    document.getElementById("match-level-select")?.addEventListener("change", (e) => {
      matchLevelIdx = Number(e.target.value);
      renderMatchGame();
    });

    const leftBtns = stage.querySelectorAll("#match-left .match-tile");
    const rightBtns = stage.querySelectorAll("#match-right .match-tile");

    leftBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("is-matched")) return;
        leftBtns.forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        selectedLeft = btn;
        window.GeoMusic?.playSfx("flip");
      });
    });

    rightBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("is-matched") || !selectedLeft) return;
        const leftId = selectedLeft.dataset.id;
        const rightId = btn.dataset.id;

        if (leftId === rightId) {
          selectedLeft.classList.remove("is-selected");
          selectedLeft.classList.add("is-matched");
          btn.classList.add("is-matched");
          selectedLeft.disabled = true;
          btn.disabled = true;
          selectedLeft = null;
          matchedCount++;
          score += 20;
          window.GeoMusic?.playSfx("ok");
          document.getElementById("match-score").textContent = `Skor: ${score}`;
          document.getElementById("match-progress").textContent = `${matchedCount} / ${set.pairs.length}`;

          if (matchedCount === set.pairs.length) {
            const sec = Math.max(1, Math.round((Date.now() - startMs) / 1000));
            recordWin();
            document.getElementById("match-result").innerHTML = `
              <div class="feedback-banner ok">
                Hebat, Riana 🦋 Semua ${set.pairs.length} pasangan cocok dalam ${sec} detik (${mistakes} salah).
                <button class="btn btn-primary btn-sm" id="match-next-lvl" style="margin-left:0.6rem;">Level Berikutnya</button>
              </div>
            `;
            document.getElementById("match-next-lvl")?.addEventListener("click", () => {
              matchLevelIdx = (matchLevelIdx + 1) % sets.length;
              renderMatchGame();
            });
          }
        } else {
          mistakes++;
          score = Math.max(0, score - 5);
          document.getElementById("match-score").textContent = `Skor: ${score}`;
          btn.classList.add("is-wrong");
          selectedLeft.classList.add("is-wrong");
          window.GeoMusic?.playSfx("err");
          setTimeout(() => {
            btn.classList.remove("is-wrong");
            selectedLeft?.classList.remove("is-wrong");
          }, 420);
        }
      });
    });
  }

  /* ==================== GAME 2: TEBAK SIMBOL PETA ==================== */
  function renderSymbolGame() {
    const stage = document.getElementById("minigame-stage");
    const pool = shuffle(window.GEO_DATA.symbols).slice(0, 10);
    let idx = 0;
    let score = 0;
    let streak = 0;

    function drawRound() {
      if (idx >= pool.length) {
        recordWin();
        stage.innerHTML = `
          <div style="text-align:center;padding:1.5rem 0;">
            <div style="font-size:2.4rem;">🦋</div>
            <h3 style="color:var(--sky-900);margin:0.4rem 0;">Tebak Simbol Peta Selesai!</h3>
            <p class="muted">Skor akhirmu: <strong>${score} poin</strong> dari 10 simbol Tabel 2.1 – 2.6.</p>
            <button class="btn btn-primary" id="sym-replay" style="margin-top:0.8rem;">Main Lagi (Simbol Baru)</button>
          </div>
        `;
        document.getElementById("sym-replay")?.addEventListener("click", renderSymbolGame);
        return;
      }

      const target = pool[idx];
      const distractors = shuffle(window.GEO_DATA.symbols.filter((s) => s.id !== target.id)).slice(0, 3);
      const options = shuffle([target, ...distractors]);

      stage.innerHTML = `
        <div class="game-header">
          <div>
            <h3 style="margin:0;color:var(--sky-900);">Tebak Simbol Peta Geologi</h3>
            <p class="muted">Sumber: ${target.table}</p>
          </div>
          <div class="game-stats">
            <span class="stat-chip">Soal ${idx + 1} / ${pool.length}</span>
            <span class="stat-chip">Streak: ${streak}</span>
            <span class="stat-chip">Skor: ${score}</span>
          </div>
        </div>
        <div class="symbol-prompt-box">
          ${window.GeoSVG.getSymbol(target.svgKey)}
          <button class="btn btn-ghost btn-sm" id="sym-clue-btn" style="margin-top:0.5rem;">Lihat Petunjuk</button>
          <p id="sym-clue-text" class="muted" style="display:none;margin-top:0.3rem;text-align:center;"></p>
        </div>
        <div class="options-grid">
          ${options
            .map(
              (opt, oIdx) => `
            <button class="option-btn" data-id="${opt.id}">
              <span class="option-letter">${String.fromCharCode(65 + oIdx)}</span>
              <span>${opt.name}</span>
            </button>`
            )
            .join("")}
        </div>
        <div id="sym-feedback"></div>
      `;

      document.getElementById("sym-clue-btn")?.addEventListener("click", () => {
        const p = document.getElementById("sym-clue-text");
        p.textContent = target.clue;
        p.style.display = "block";
      });

      const optBtns = stage.querySelectorAll(".option-btn");
      optBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          optBtns.forEach((b) => (b.disabled = true));
          const picked = btn.dataset.id;
          const isOk = picked === target.id;
          if (isOk) {
            btn.classList.add("is-correct");
            streak++;
            score += 10 + streak * 2;
            window.GeoMusic?.playSfx("ok");
          } else {
            btn.classList.add("is-wrong");
            streak = 0;
            optBtns.forEach((b) => {
              if (b.dataset.id === target.id) b.classList.add("is-correct");
            });
            window.GeoMusic?.playSfx("err");
          }
          document.getElementById("sym-feedback").innerHTML = `
            <div class="feedback-banner ${isOk ? "ok" : "err"}">
              ${isOk ? "Benar sekali! 🦋" : `Kurang tepat — jawaban benar: <strong>${target.name}</strong>.`} ${target.clue}
              <div style="margin-top:0.55rem;">
                <button class="btn btn-primary btn-sm" id="sym-next">Lanjut</button>
              </div>
            </div>
          `;
          document.getElementById("sym-next")?.addEventListener("click", () => {
            idx++;
            drawRound();
          });
        });
      });
    }
    drawRound();
  }

  /* ==================== GAME 3: KLASIFIKASI CEPAT ==================== */
  function renderSortGame() {
    const stage = document.getElementById("minigame-stage");
    const cards = shuffle(window.GEO_DATA.sortingCards).slice(0, 12);
    let idx = 0;
    let correct = 0;

    const buckets = [
      { id: "kekar", title: "Kekar (Joint)", sub: "Rekahan tanpa geser" },
      { id: "sesar", title: "Sesar (Fault)", sub: "Rekahan + pergeseran" },
      { id: "lipatan", title: "Lipatan (Fold)", sub: "Lengkungan plastis" },
      { id: "deformasi", title: "Deformasi & Geometri", sub: "Elastis, Dip, Ketebalan" },
    ];

    function drawCard() {
      if (idx >= cards.length) {
        if (correct >= 8) recordWin();
        stage.innerHTML = `
          <div style="text-align:center;padding:1.5rem 0;">
            <div style="font-size:2.4rem;">🦋</div>
            <h3 style="color:var(--sky-900);margin:0.4rem 0;">Klasifikasi Cepat Selesai!</h3>
            <p class="muted">Kamu mengelompokkan <strong>${correct} dari ${cards.length}</strong> pernyataan dengan benar.</p>
            <button class="btn btn-primary" id="sort-replay" style="margin-top:0.8rem;">Main Lagi</button>
          </div>
        `;
        document.getElementById("sort-replay")?.addEventListener("click", renderSortGame);
        return;
      }

      const item = cards[idx];
      stage.innerHTML = `
        <div class="game-header">
          <div>
            <h3 style="margin:0;color:var(--sky-900);">Klasifikasi Cepat Struktur Geologi</h3>
            <p class="muted">Klik kelompok yang paling sesuai dengan ciri atau konsep di bawah.</p>
          </div>
          <div class="game-stats">
            <span class="stat-chip">Kartu ${idx + 1} / ${cards.length}</span>
            <span class="stat-chip">Benar: ${correct}</span>
          </div>
        </div>
        <div class="sort-card-box">${item.text}</div>
        <div class="buckets-grid">
          ${buckets
            .map(
              (b) => `
            <button class="bucket-btn" data-bucket="${b.id}">
              ${b.title}
              <span>${b.sub}</span>
            </button>`
            )
            .join("")}
        </div>
        <div id="sort-feedback"></div>
      `;

      stage.querySelectorAll(".bucket-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          stage.querySelectorAll(".bucket-btn").forEach((b) => (b.disabled = true));
          const ok = btn.dataset.bucket === item.bucket;
          if (ok) {
            correct++;
            window.GeoMusic?.playSfx("ok");
          } else {
            window.GeoMusic?.playSfx("err");
          }
          const rightBucket = buckets.find((b) => b.id === item.bucket)?.title;
          document.getElementById("sort-feedback").innerHTML = `
            <div class="feedback-banner ${ok ? "ok" : "err"}">
              ${ok ? "Tepat! 🦋" : `Kurang tepat — masuk ke kategori <strong>${rightBucket}</strong>.`}
              <button class="btn btn-primary btn-sm" id="sort-next" style="margin-left:0.6rem;">Kartu Berikutnya</button>
            </div>
          `;
          document.getElementById("sort-next")?.addEventListener("click", () => {
            idx++;
            drawCard();
          });
        });
      });
    }
    drawCard();
  }

  /* ==================== GAME 4: LAB GEOMETRI & PYTHON ENGINE ==================== */
  function generateLocalGeometryChallenge() {
    const mode = Math.random() < 0.5 ? "tan_dip" : "true_thickness";
    if (mode === "tan_dip") {
      const targetAngle = [15, 20, 25, 30, 35, 40, 45, 50, 60][Math.floor(Math.random() * 9)];
      const d = [20, 40, 50, 80, 100][Math.floor(Math.random() * 5)];
      const deltaH = Number((d * Math.tan((targetAngle * Math.PI) / 180)).toFixed(1));
      const exact = Number(((Math.atan2(deltaH, d) * 180) / Math.PI).toFixed(1));
      return {
        source: "js-fallback",
        mode,
        question: `Pada Problema Tiga Titik, selisih ketinggian (Δh) adalah ${deltaH} m dan jarak horizontal tegak lurus (d) adalah ${d} m. Berapa besar sudut kemiringan (dip) lapisan?`,
        formula: "tan δ = Δh / d",
        answer: exact,
        unit: "°",
        tolerance: 1.2,
        explanation: `tan δ = ${deltaH} / ${d} = ${(deltaH / d).toFixed(3)}, maka δ ≈ ${exact}°.`,
      };
    }
    const dip = [20, 30, 35, 40, 45, 50, 60][Math.floor(Math.random() * 7)];
    const app = [20, 30, 40, 50, 60, 80, 100][Math.floor(Math.random() * 7)];
    const trueT = Number((app * Math.sin((dip * Math.PI) / 180)).toFixed(1));
    return {
      source: "js-fallback",
      mode,
      question: `Ketebalan semu (apparent thickness) suatu lapisan adalah ${app} m dengan sudut dip ${dip}°. Hitung ketebalan sebenarnya (true thickness)!`,
      formula: "True thickness = Apparent thickness × sin(Dip)",
      answer: trueT,
      unit: "m",
      tolerance: 1.0,
      explanation: `True thickness = ${app} × sin(${dip}°) ≈ ${trueT} m.`,
    };
  }

  async function fetchGeometryChallenge() {
    if (location.protocol !== "file:") {
      try {
        const res = await fetch("/api/minigame/geometry", { cache: "no-store" });
        if (res.ok) return await res.json();
      } catch {
        // fallback ke JS
      }
    }
    return generateLocalGeometryChallenge();
  }

  async function renderLabGame() {
    const stage = document.getElementById("minigame-stage");
    stage.innerHTML = `<p class="muted">Memuat tantangan geometri & penampang...</p>`;

    const challenge = await fetchGeometryChallenge();
    const diagramKey = challenge.mode === "tan_dip" ? "folds" : "thickness_dip";
    const engineBadge =
      challenge.source === "python-engine"
        ? "Python Engine Aktif"
        : "Mode Offline (JS Engine)";

    stage.innerHTML = `
      <div class="game-header">
        <div>
          <h3 style="margin:0;color:var(--sky-900);">Lab Geometri & Penampang Laprak</h3>
          <p class="muted">Latih rumus Problema Tiga Titik (Bab 2.6) dan Ketebalan Sebenarnya (Bab 2.8).</p>
        </div>
        <div class="game-stats">
          <span class="stat-chip">${engineBadge}</span>
          <span class="stat-chip">Rumus: ${challenge.formula}</span>
        </div>
      </div>
      <div class="lab-grid">
        <div class="diagram-card">
          ${window.GeoSVG.getDiagram(diagramKey)}
        </div>
        <div>
          <p style="font-weight:700;color:var(--sky-900);margin-top:0;">${challenge.question}</p>
          <p class="muted">Boleh dibulatkan 1 angka di belakang koma (gunakan kalkulator seperti Bab 1.4).</p>
          <div class="lab-input-row">
            <input type="number" step="0.1" id="lab-answer-input" class="sky-input" placeholder="Jawaban (${challenge.unit})" />
            <button id="lab-check-btn" class="btn btn-primary">Periksa</button>
            <button id="lab-new-btn" class="btn btn-soft">Soal Baru</button>
          </div>
          <div id="lab-feedback"></div>
        </div>
      </div>
    `;

    document.getElementById("lab-new-btn")?.addEventListener("click", renderLabGame);
    document.getElementById("lab-check-btn")?.addEventListener("click", () => {
      const raw = document.getElementById("lab-answer-input")?.value;
      const val = Number(raw);
      if (raw === "" || Number.isNaN(val)) {
        window.GeoApp?.toast("Masukkan angka jawaban terlebih dahulu.");
        return;
      }
      const ok = Math.abs(val - challenge.answer) <= challenge.tolerance;
      if (ok) {
        recordWin();
      } else {
        window.GeoMusic?.playSfx("err");
      }
      document.getElementById("lab-feedback").innerHTML = `
        <div class="feedback-banner ${ok ? "ok" : "err"}">
          ${ok ? "Perhitunganmu tepat! 🦋" : `Belum tepat (jawaban: <strong>${challenge.answer} ${challenge.unit}</strong>).`}
          <div style="margin-top:0.35rem;">${challenge.explanation}</div>
        </div>
      `;
    });
  }

  function renderActiveGame() {
    if (activeGame === "match") renderMatchGame();
    else if (activeGame === "symbol") renderSymbolGame();
    else if (activeGame === "sort") renderSortGame();
    else if (activeGame === "lab") renderLabGame();
  }

  function init() {
    document.querySelectorAll("#game-tabs .game-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#game-tabs .game-pill").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        activeGame = btn.dataset.game;
        renderActiveGame();
      });
    });
    renderActiveGame();
  }

  function getWins() {
    return gamesWon;
  }

  return { init, getWins };
})();
