/**
 * Mode Latihan Santai & Simulasi Ujian Berwaktu
 * Lengkap dengan pembahasan sumber Laprak & analisis per topik.
 */
window.GeoQuiz = (() => {
  const BEST_KEY = "geo_riana_best_quiz_v1";
  let mode = "practice"; // practice | exam
  let count = 10;
  let topic = "all";

  let sessionQuestions = [];
  let current = 0;
  let userAnswers = [];
  let timerId = null;
  let secondsLeft = 0;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function clearTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function getBestScore() {
    const val = localStorage.getItem(BEST_KEY);
    return val ? `${val}%` : "-";
  }

  function renderSetup() {
    clearTimer();
    const stage = document.getElementById("quiz-stage");
    const topics = ["all", ...new Set(window.GEO_DATA.quizQuestions.map((q) => q.topic))];

    stage.innerHTML = `
      <h3 style="margin:0 0 0.35rem;color:var(--sky-900);">Pilih Mode Latihan atau Ujian</h3>
      <p class="muted">Total bank soal tersedia: ${window.GEO_DATA.quizQuestions.length} soal terverifikasi dari Laprak Geologi Struktur.</p>

      <div class="quiz-setup-grid">
        <div class="mode-card ${mode === "practice" ? "is-selected" : ""}" data-mode="practice">
          <strong style="color:var(--sky-900);font-size:1.02rem;">Latihan Santai</strong>
          <p class="muted">Tanpa batas waktu. Pembahasan lengkap langsung tampil setelah kamu memilih jawaban.</p>
        </div>
        <div class="mode-card ${mode === "exam" ? "is-selected" : ""}" data-mode="exam">
          <strong style="color:var(--sky-900);font-size:1.02rem;">Simulasi Ujian (Timer)</strong>
          <p class="muted">Simulasi responsi berwaktu (45 detik/soal). Skor & evaluasi lengkap tampil di akhir.</p>
        </div>
      </div>

      <div class="toolbar-controls" style="margin-top:0.8rem;">
        <label style="font-size:0.86rem;font-weight:700;color:var(--sky-900);">
          Topik:
          <select id="quiz-topic" class="sky-select" style="margin-left:0.35rem;">
            ${topics.map((t) => `<option value="${t}" ${t === topic ? "selected" : ""}>${t === "all" ? "Semua Bab Laprak" : t}</option>`).join("")}
          </select>
        </label>

        <label style="font-size:0.86rem;font-weight:700;color:var(--sky-900);">
          Jumlah Soal:
          <select id="quiz-count" class="sky-select" style="margin-left:0.35rem;">
            <option value="10" ${count === 10 ? "selected" : ""}>10 Soal</option>
            <option value="20" ${count === 20 ? "selected" : ""}>20 Soal</option>
            <option value="32" ${count === 32 ? "selected" : ""}>Semua Soal (Maks)</option>
          </select>
        </label>

        <button id="quiz-start-btn" class="btn btn-primary">Mulai Sekarang 🦋</button>
      </div>
    `;

    stage.querySelectorAll(".mode-card").forEach((card) => {
      card.addEventListener("click", () => {
        mode = card.dataset.mode;
        renderSetup();
      });
    });

    document.getElementById("quiz-topic")?.addEventListener("change", (e) => {
      topic = e.target.value;
    });
    document.getElementById("quiz-count")?.addEventListener("change", (e) => {
      count = Number(e.target.value);
    });
    document.getElementById("quiz-start-btn")?.addEventListener("click", startSession);
  }

  function startSession() {
    const filtered = window.GEO_DATA.quizQuestions.filter((q) => topic === "all" || q.topic === topic);
    sessionQuestions = shuffle(filtered).slice(0, Math.min(count, filtered.length));
    current = 0;
    userAnswers = [];

    if (mode === "exam") {
      secondsLeft = sessionQuestions.length * 45;
      clearTimer();
      timerId = setInterval(() => {
        secondsLeft--;
        const timerEl = document.getElementById("quiz-timer");
        if (timerEl) {
          const m = Math.floor(secondsLeft / 60);
          const s = String(secondsLeft % 60).padStart(2, "0");
          timerEl.textContent = `Sisa Waktu: ${m}:${s}`;
        }
        if (secondsLeft <= 0) {
          clearTimer();
          finishQuiz();
        }
      }, 1000);
    }

    renderQuestion();
  }

  function renderQuestion() {
    if (current >= sessionQuestions.length) {
      finishQuiz();
      return;
    }

    const q = sessionQuestions[current];
    const stage = document.getElementById("quiz-stage");
    const pct = Math.round(((current + 1) / sessionQuestions.length) * 100);
    const m = Math.floor(secondsLeft / 60);
    const s = String(secondsLeft % 60).padStart(2, "0");

    stage.innerHTML = `
      <div class="game-header">
        <div>
          <span class="chapter-badge">${q.topic}</span>
          <span class="muted" style="margin-left:0.5rem;">Soal ${current + 1} dari ${sessionQuestions.length}</span>
        </div>
        <div class="game-stats">
          ${mode === "exam" ? `<span class="stat-chip" id="quiz-timer">Sisa Waktu: ${m}:${s}</span>` : `<span class="stat-chip">Mode Latihan</span>`}
          <button id="quiz-quit-btn" class="btn btn-ghost btn-sm">Keluar</button>
        </div>
      </div>

      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" style="width:${pct}%"></div>
      </div>

      ${q.svgKey ? `<div class="symbol-prompt-box" style="padding:1rem;">${window.GeoSVG.getSymbol(q.svgKey)}</div>` : ""}

      <h3 style="margin:0 0 1rem;color:var(--sky-900);line-height:1.45;">${q.question}</h3>

      <div class="options-grid" style="grid-template-columns:1fr;">
        ${q.options
          .map(
            (opt, oIdx) => `
          <button class="option-btn" data-idx="${oIdx}">
            <span class="option-letter">${String.fromCharCode(65 + oIdx)}</span>
            <span>${opt}</span>
          </button>`
          )
          .join("")}
      </div>

      <div id="quiz-feedback"></div>
    `;

    document.getElementById("quiz-quit-btn")?.addEventListener("click", renderSetup);

    const optBtns = stage.querySelectorAll(".option-btn");
    optBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const chosen = Number(btn.dataset.idx);
        userAnswers[current] = chosen;
        const isOk = chosen === q.answer;

        if (mode === "exam") {
          window.GeoMusic?.playSfx("flip");
          current++;
          renderQuestion();
          return;
        }

        optBtns.forEach((b) => (b.disabled = true));
        if (isOk) {
          btn.classList.add("is-correct");
          window.GeoMusic?.playSfx("ok");
        } else {
          btn.classList.add("is-wrong");
          optBtns[q.answer]?.classList.add("is-correct");
          window.GeoMusic?.playSfx("err");
        }

        document.getElementById("quiz-feedback").innerHTML = `
          <div class="feedback-banner ${isOk ? "ok" : "err"}">
            <strong>${isOk ? "Benar! 🦋" : "Kurang tepat."}</strong> ${q.explanation}
            <div style="margin-top:0.6rem;">
              <button id="quiz-next-btn" class="btn btn-primary btn-sm">
                ${current + 1 < sessionQuestions.length ? "Soal Berikutnya" : "Lihat Hasil Akhir"}
              </button>
            </div>
          </div>
        `;
        document.getElementById("quiz-next-btn")?.addEventListener("click", () => {
          current++;
          renderQuestion();
        });
      });
    });
  }

  function finishQuiz() {
    clearTimer();
    const stage = document.getElementById("quiz-stage");
    let correctCount = 0;

    sessionQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) correctCount++;
    });

    const pct = Math.round((correctCount / Math.max(1, sessionQuestions.length)) * 100);
    const prevBest = Number(localStorage.getItem(BEST_KEY) || "0");
    if (pct > prevBest) {
      localStorage.setItem(BEST_KEY, String(pct));
    }
    window.GeoApp?.refreshStats();

    if (pct >= 75) {
      window.GeoMusic?.playSfx("win");
      window.GeoApp?.butterflyBurst(16);
    }

    const message =
      pct >= 85
        ? "Luar biasa, Riana! Penguasaan materimu sudah sangat siap untuk ujian Geologi Struktur 🦋"
        : pct >= 65
        ? "Bagus sekali! Tinggal ulas sedikit bagian yang masih keliru agar makin sempurna 🦋"
        : "Terus semangat ya! Coba putar musik tenang dan ulangi lewat Flashcard dulu.";

    stage.innerHTML = `
      <div style="text-align:center;padding:0.8rem 0 1.2rem;border-bottom:1px solid var(--border);">
        <div style="font-size:2.4rem;">🦋</div>
        <h3 style="margin:0.3rem 0;font-size:1.6rem;color:var(--sky-900);">Skor Akhir: ${pct}%</h3>
        <p style="margin:0.2rem 0;font-weight:700;color:var(--sky-700);">${correctCount} benar dari ${sessionQuestions.length} soal</p>
        <p class="muted">${message}</p>
        <div style="margin-top:1rem;display:flex;gap:0.6rem;justify-content:center;flex-wrap:wrap;">
          <button id="quiz-retry-btn" class="btn btn-primary">Ulangi Sesi</button>
          <button id="quiz-back-setup" class="btn btn-soft">Pilih Mode Lain</button>
        </div>
      </div>

      <h4 style="margin:1.1rem 0 0.6rem;color:var(--sky-900);">Pembahasan Lengkap</h4>
      <div class="quiz-review-list">
        ${sessionQuestions
          .map((q, idx) => {
            const ans = userAnswers[idx];
            const ok = ans === q.answer;
            return `
            <div class="review-item ${ok ? "" : "is-wrong"}">
              <div style="font-weight:800;color:var(--sky-900);margin-bottom:0.25rem;">
                ${idx + 1}. ${q.question}
              </div>
              <div style="font-size:0.86rem;margin-bottom:0.25rem;">
                Jawabanmu: <strong>${ans !== undefined ? q.options[ans] : "Tidak dijawab"}</strong>
                ${!ok ? ` • Kunci: <strong style="color:var(--emerald-fg);">${q.options[q.answer]}</strong>` : " • Tepat 🦋"}
              </div>
              <div class="muted" style="font-size:0.84rem;">${q.explanation}</div>
            </div>`;
          })
          .join("")}
      </div>
    `;

    document.getElementById("quiz-retry-btn")?.addEventListener("click", startSession);
    document.getElementById("quiz-back-setup")?.addEventListener("click", renderSetup);
  }

  function init() {
    renderSetup();
  }

  return { init, getBestScore };
})();
