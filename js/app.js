/**
 * Controller Utama GeoStruktur Studio — Navigasi Tab, Materi Laprak Interaktif,
 * Mode Tutup Kata Kunci, Katalog Simbol, Progress Ring, Toast & Konfeti Kupu-Kupu.
 */
window.GeoApp = (() => {
  const READ_KEY = "geo_riana_chapters_read_v1";
  let readChapters = {};
  let activeChapterId = "bab1";
  let symbolFilter = "all";

  function loadReadState() {
    try {
      readChapters = JSON.parse(localStorage.getItem(READ_KEY) || "{}");
    } catch {
      readChapters = {};
    }
  }

  function saveReadState() {
    localStorage.setItem(READ_KEY, JSON.stringify(readChapters));
  }

  function toast(msg) {
    const box = document.getElementById("toast-container");
    if (!box) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => el.remove(), 3100);
  }

  function butterflyBurst(count = 10) {
    const layer = document.getElementById("butterfly-burst");
    if (!layer) return;
    for (let i = 0; i < count; i++) {
      const bf = document.createElement("span");
      bf.className = "burst-bf";
      bf.textContent = "🦋";
      bf.style.left = `${15 + Math.random() * 70}%`;
      bf.style.top = `${25 + Math.random() * 40}%`;
      bf.style.setProperty("--dx", `${(Math.random() - 0.5) * 260}px`);
      bf.style.setProperty("--dy", `${-90 - Math.random() * 190}px`);
      bf.style.setProperty("--rot", `${(Math.random() - 0.5) * 90}deg`);
      layer.appendChild(bf);
      setTimeout(() => bf.remove(), 1900);
    }
  }

  function formatKeywords(text) {
    return text.replace(/\[\[(.*?)\]\]/g, '<span class="kw" title="Klik untuk membuka/menutup">$1</span>');
  }

  function renderChapterSidebar() {
    const list = document.getElementById("chapter-list");
    if (!list) return;
    list.innerHTML = window.GEO_DATA.chapters
      .map((ch) => {
        const done = Boolean(readChapters[ch.id]);
        return `
        <button class="chapter-item-btn ${ch.id === activeChapterId ? "is-active" : ""}" data-ch="${ch.id}">
          <span class="chapter-item-badge">
            <span>${ch.badge}</span>
            ${done ? '<span class="chapter-done-dot">Selesai</span>' : ""}
          </span>
          <span class="chapter-item-title">${ch.title}</span>
        </button>`;
      })
      .join("");

    list.querySelectorAll(".chapter-item-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeChapterId = btn.dataset.ch;
        renderChapterSidebar();
        renderChapterContent();
      });
    });
  }

  function renderSymbolCatalogHTML() {
    const cats = [
      { id: "all", label: "Semua (31)" },
      { id: "garis", label: "2.1 Struktur Garis" },
      { id: "bidang", label: "2.2 Struktur Bidang" },
      { id: "foliasi", label: "2.3 Foliasi" },
      { id: "sesar", label: "2.4 Sesar" },
      { id: "kekar", label: "2.5 Kekar" },
      { id: "lipatan", label: "2.6 Lipatan" },
    ];

    const filtered = window.GEO_DATA.symbols.filter(
      (s) => symbolFilter === "all" || s.category === symbolFilter
    );

    return `
      <div class="symbol-filter-row">
        ${cats
          .map(
            (c) =>
              `<button class="sym-filter-btn ${symbolFilter === c.id ? "is-active" : ""}" data-symcat="${c.id}">${c.label}</button>`
          )
          .join("")}
      </div>
      <div class="symbols-grid">
        ${filtered
          .map(
            (s) => `
          <div class="symbol-card">
            ${window.GeoSVG.getSymbol(s.svgKey)}
            <div class="symbol-name">${s.name}</div>
            <div class="symbol-table-tag">${s.table}</div>
            <div class="symbol-clue">${s.clue}</div>
          </div>`
          )
          .join("")}
      </div>
    `;
  }

  function renderChapterContent() {
    const viewer = document.getElementById("chapter-content");
    const ch = window.GEO_DATA.chapters.find((c) => c.id === activeChapterId);
    if (!viewer || !ch) return;

    const isDone = Boolean(readChapters[ch.id]);
    let bodyHTML = "";

    if (ch.isSymbolCatalog) {
      bodyHTML = renderSymbolCatalogHTML();
    } else {
      bodyHTML = (ch.sections || [])
        .map(
          (sec) => `
        <div class="section-block">
          <h4>${sec.heading}</h4>
          <ul class="point-list">
            ${sec.points.map((pt) => `<li>${formatKeywords(pt)}</li>`).join("")}
          </ul>
        </div>`
        )
        .join("");

      if (ch.diagrams?.length) {
        bodyHTML += `
          <div class="section-block">
            <h4>Visualisasi Penampang & Konsep</h4>
            <div class="diagram-grid">
              ${ch.diagrams.map((dk) => `<div class="diagram-card">${window.GeoSVG.getDiagram(dk)}</div>`).join("")}
            </div>
          </div>`;
      }

      if (ch.kekarTable?.length) {
        bodyHTML += `
          <div class="section-block">
            <h4>Tabel 2.9 Data Mengukur Kemiringan Kekar (Pertemuan 2)</h4>
            <table class="kekar-table">
              <thead><tr><th>No</th><th>Strike</th><th>Dip</th></tr></thead>
              <tbody>
                ${ch.kekarTable.map((r) => `<tr><td>${r.no}</td><td><strong>${r.strike}</strong></td><td>${r.dip}</td></tr>`).join("")}
              </tbody>
            </table>
          </div>`;
      }
    }

    viewer.innerHTML = `
      <div class="chapter-header">
        <div>
          <span class="chapter-badge">${ch.badge}</span>
          <h3>${ch.title}</h3>
          <p class="muted">${ch.summary}</p>
        </div>
        <button id="toggle-chapter-done" class="btn ${isDone ? "btn-primary" : "btn-soft"} btn-sm">
          ${isDone ? "Sudah Dibaca 🦋" : "Tandai Sudah Dibaca"}
        </button>
      </div>
      ${bodyHTML}
    `;

    document.getElementById("toggle-chapter-done")?.addEventListener("click", () => {
      readChapters[ch.id] = !readChapters[ch.id];
      saveReadState();
      renderChapterSidebar();
      renderChapterContent();
      refreshStats();
      if (readChapters[ch.id]) {
        window.GeoMusic?.playSfx("ok");
        toast(`Mantap! ${ch.badge} ditandai selesai 🦋`);
      }
    });

    viewer.querySelectorAll(".kw").forEach((kw) => {
      kw.addEventListener("click", () => {
        if (document.body.classList.contains("blur-keywords")) {
          kw.classList.toggle("is-revealed");
        }
      });
    });

    viewer.querySelectorAll(".sym-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        symbolFilter = btn.dataset.symcat;
        renderChapterContent();
      });
    });
  }

  function switchTab(tabId) {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === tabId));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("is-active", p.id === `tab-${tabId}`));
  }

  function refreshStats() {
    const fc = window.GeoFlashcards?.getCounts() || { easy: 0, total: 42 };
    const pct = Math.round((fc.easy / Math.max(1, fc.total)) * 100);

    const headerText = document.getElementById("header-mastery-text");
    if (headerText) headerText.textContent = `${fc.easy}/${fc.total} Hafal`;

    const pctEl = document.getElementById("hero-mastery-pct");
    if (pctEl) pctEl.textContent = `${pct}%`;

    const ring = document.getElementById("hero-ring-fg");
    if (ring) {
      const circumference = 264;
      ring.style.strokeDashoffset = String(circumference - (pct / 100) * circumference);
    }

    const doneCh = window.GEO_DATA.chapters.filter((c) => readChapters[c.id]).length;
    const chEl = document.getElementById("metric-chapters");
    if (chEl) chEl.textContent = `${doneCh}/${window.GEO_DATA.chapters.length}`;

    const bestEl = document.getElementById("metric-best-quiz");
    if (bestEl) bestEl.textContent = window.GeoQuiz?.getBestScore() || "-";

    const winsEl = document.getElementById("metric-games-won");
    if (winsEl) winsEl.textContent = String(window.GeoMinigames?.getWins() || 0);
  }

  function init() {
    loadReadState();
    renderChapterSidebar();
    renderChapterContent();

    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    document.querySelectorAll("[data-jump]").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.jump));
    });

    const blurToggle = document.getElementById("toggle-blur-keywords");
    blurToggle?.addEventListener("change", () => {
      document.body.classList.toggle("blur-keywords", blurToggle.checked);
      toast(
        blurToggle.checked
          ? "Kata kunci ditutup! Klik kata yang tertutup untuk mengintip."
          : "Semua kata kunci ditampilkan kembali."
      );
    });

    document.getElementById("reveal-all-keywords")?.addEventListener("click", () => {
      document.querySelectorAll(".kw").forEach((el) => el.classList.add("is-revealed"));
    });

    window.GeoMusic.init();
    window.GeoFlashcards.init();
    window.GeoMinigames.init();
    window.GeoQuiz.init();
    refreshStats();
  }

  return { init, toast, butterflyBurst, refreshStats };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.GeoApp.init();
});
