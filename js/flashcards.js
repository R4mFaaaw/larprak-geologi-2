/**
 * Engine Flashcard Pintar dengan 3D Flip, Filter Kategori,
 * Mode Fokus Belum Hafal, dan Shortcut Keyboard.
 */
window.GeoFlashcards = (() => {
  const STORAGE_KEY = "geo_riana_fc_ratings_v1";
  const CAT_LABELS = {
    dasar: "Bab I & Deformasi",
    kekar_sesar: "Kekar & Sesar",
    lipatan: "Lipatan",
    simbol: "Simbol Geologi",
    geometri: "Geometri & Rumus",
    praktikum: "Data Praktikum",
  };

  let ratings = {};
  let deck = [];
  let cursor = 0;
  let focusUnlearned = false;

  function loadRatings() {
    try {
      ratings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      ratings = {};
    }
  }

  function saveRatings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  }

  function getCounts() {
    const all = window.GEO_DATA.flashcards;
    let hard = 0;
    let mid = 0;
    let easy = 0;
    all.forEach((c) => {
      const r = ratings[c.id];
      if (r === "hard") hard++;
      else if (r === "mid") mid++;
      else if (r === "easy") easy++;
    });
    return { total: all.length, hard, mid, easy };
  }

  function buildDeck() {
    const cat = document.getElementById("fc-category")?.value || "all";
    let list = window.GEO_DATA.flashcards.filter((c) => cat === "all" || c.category === cat);
    if (focusUnlearned) {
      const unlearned = list.filter((c) => ratings[c.id] !== "easy");
      if (unlearned.length > 0) {
        list = unlearned;
      } else {
        window.GeoApp?.toast("Semua kartu pada kategori ini sudah ditandai Hafal 🦋");
        focusUnlearned = false;
        document.getElementById("fc-focus-unlearned")?.classList.remove("btn-primary");
      }
    }
    deck = [...list];
    cursor = 0;
    renderCard();
  }

  function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    cursor = 0;
    renderCard(false);
    window.GeoApp?.toast("Urutan flashcard diacak!");
  }

  function renderCard(resetFlip = true) {
    const cardEl = document.getElementById("fc-card");
    if (!cardEl || !deck.length) return;
    if (resetFlip) cardEl.classList.remove("is-flipped");

    const card = deck[cursor];
    document.getElementById("fc-counter").textContent = `Kartu ${cursor + 1} dari ${deck.length}`;
    document.getElementById("fc-tag-front").textContent = CAT_LABELS[card.category] || "Materi";
    document.getElementById("fc-question").textContent = card.front;
    document.getElementById("fc-answer").textContent = card.back;

    const svgBox = document.getElementById("fc-svg-front");
    svgBox.innerHTML = card.svgKey ? window.GeoSVG.getSymbol(card.svgKey) : "";

    const st = ratings[card.id];
    const statusText =
      st === "easy"
        ? "Status: Sudah Hafal 🦋"
        : st === "mid"
        ? "Status: Masih Ragu"
        : st === "hard"
        ? "Status: Perlu Diulang"
        : "Status: Belum Dinilai";
    document.getElementById("fc-current-status").textContent = statusText;

    const counts = getCounts();
    document.getElementById("fc-count-hard").textContent = `Belum: ${counts.hard}`;
    document.getElementById("fc-count-mid").textContent = `Ragu: ${counts.mid}`;
    document.getElementById("fc-count-easy").textContent = `Hafal: ${counts.easy}`;
    window.GeoApp?.refreshStats();
  }

  function flip() {
    const cardEl = document.getElementById("fc-card");
    if (!cardEl) return;
    cardEl.classList.toggle("is-flipped");
    window.GeoMusic?.playSfx("flip");
  }

  function rateCurrent(level) {
    if (!deck.length) return;
    const card = deck[cursor];
    ratings[card.id] = level;
    saveRatings();
    window.GeoMusic?.playSfx(level === "easy" ? "ok" : "flip");

    if (cursor < deck.length - 1) {
      cursor++;
    } else {
      cursor = 0;
      if (level === "easy") window.GeoApp?.butterflyBurst(8);
    }
    renderCard(true);
  }

  function init() {
    loadRatings();
    buildDeck();

    const cardEl = document.getElementById("fc-card");
    cardEl?.addEventListener("click", flip);

    document.getElementById("fc-category")?.addEventListener("change", buildDeck);
    document.getElementById("fc-shuffle")?.addEventListener("click", shuffleDeck);

    const focusBtn = document.getElementById("fc-focus-unlearned");
    focusBtn?.addEventListener("click", () => {
      focusUnlearned = !focusUnlearned;
      focusBtn.classList.toggle("btn-primary", focusUnlearned);
      focusBtn.classList.toggle("btn-soft", !focusUnlearned);
      buildDeck();
    });

    document.getElementById("fc-reset-progress")?.addEventListener("click", () => {
      ratings = {};
      saveRatings();
      buildDeck();
      window.GeoApp?.toast("Progres hafalan flashcard direset.");
    });

    document.getElementById("fc-prev")?.addEventListener("click", () => {
      if (!deck.length) return;
      cursor = (cursor - 1 + deck.length) % deck.length;
      renderCard(true);
    });

    document.getElementById("fc-next")?.addEventListener("click", () => {
      if (!deck.length) return;
      cursor = (cursor + 1) % deck.length;
      renderCard(true);
    });

    document.querySelectorAll(".btn-rate").forEach((btn) => {
      btn.addEventListener("click", () => rateCurrent(btn.dataset.rate));
    });

    document.addEventListener("keydown", (e) => {
      const fcTabActive = document.getElementById("tab-flashcard")?.classList.contains("is-active");
      if (!fcTabActive) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        flip();
      } else if (e.code === "ArrowRight") {
        cursor = (cursor + 1) % deck.length;
        renderCard(true);
      } else if (e.code === "ArrowLeft") {
        cursor = (cursor - 1 + deck.length) % deck.length;
        renderCard(true);
      } else if (e.key === "1") rateCurrent("hard");
      else if (e.key === "2") rateCurrent("mid");
      else if (e.key === "3") rateCurrent("easy");
    });
  }

  return { init, getCounts };
})();
