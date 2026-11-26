/**
 * Generator ilustrasi SVG tajam untuk Simbol Struktur Geologi (Tabel 2.1 - 2.6)
 * serta Diagram Penampang Interaktif (Sesar, Lipatan, Ketebalan & Kemiringan Semu).
 */
window.GeoSVG = (() => {
  const INK = "#0c4a6e";
  const SKY = "#0ea5e9";
  const SKY_SOFT = "#bae6fd";
  const SAND = "#fde68a";
  const CLAY = "#bae6fd";
  const ROCK = "#7dd3fc";

  const wrap = (inner, w = 140, h = 64) =>
    `<svg viewBox="0 0 ${w} ${h}" class="geo-svg" aria-hidden="true">${inner}</svg>`;

  const symbols = {
    // Tabel 2.1 Struktur Garis
    line_plunge: () =>
      wrap(`
        <line x1="20" y1="32" x2="114" y2="32" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        <polyline points="104,24 118,32 104,40" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      `),
    pebble_elong: () =>
      wrap(`
        <ellipse cx="26" cy="32" rx="9" ry="5" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
        <line x1="35" y1="32" x2="114" y2="32" stroke="${INK}" stroke-width="3"/>
        <polyline points="104,25 117,32 104,39" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      `),
    mineral_elong: () =>
      wrap(`
        <rect x="20" y="27" width="12" height="10" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
        <line x1="32" y1="32" x2="114" y2="32" stroke="${INK}" stroke-width="3"/>
        <polyline points="104,25 117,32 104,39" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      `),
    line_horizontal: () =>
      wrap(`
        <line x1="24" y1="32" x2="116" y2="32" stroke="${INK}" stroke-width="3"/>
        <polyline points="34,25 21,32 34,39" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="106,25 119,32 106,39" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      `),
    line_vertical: () =>
      wrap(`
        <line x1="24" y1="32" x2="116" y2="32" stroke="${INK}" stroke-width="3"/>
        <line x1="70" y1="14" x2="70" y2="50" stroke="${INK}" stroke-width="3"/>
      `),
    line_double: () =>
      wrap(`
        <line x1="24" y1="26" x2="116" y2="26" stroke="${INK}" stroke-width="3"/>
        <polyline points="54,48 70,26 86,48" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      `),
    line_on_plane: () =>
      wrap(`
        <line x1="22" y1="22" x2="118" y2="22" stroke="${INK}" stroke-width="3"/>
        <line x1="70" y1="22" x2="48" y2="50" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      `),
    fracture_intersection: () =>
      wrap(`
        <line x1="24" y1="32" x2="108" y2="32" stroke="${INK}" stroke-width="3"/>
        <line x1="108" y1="16" x2="108" y2="48" stroke="${INK}" stroke-width="3"/>
      `),
    plane_foliation_intersection: () =>
      wrap(`
        <line x1="22" y1="32" x2="88" y2="32" stroke="${INK}" stroke-width="3"/>
        <polyline points="114,18 88,32 114,46" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      `),
    pitch_on_plane: () =>
      wrap(`
        <line x1="24" y1="22" x2="116" y2="22" stroke="${INK}" stroke-width="3"/>
        <line x1="70" y1="22" x2="70" y2="38" stroke="${INK}" stroke-width="3"/>
        <line x1="70" y1="22" x2="46" y2="48" stroke="${SKY}" stroke-width="3"/>
        <polyline points="55,48 45,49 47,39" fill="none" stroke="${SKY}" stroke-width="2.5" stroke-linecap="round"/>
      `),

    // Tabel 2.2 Struktur Bidang
    bed_vertical: () =>
      wrap(`
        <line x1="20" y1="32" x2="120" y2="32" stroke="${INK}" stroke-width="3"/>
        <line x1="70" y1="16" x2="70" y2="48" stroke="${INK}" stroke-width="3"/>
      `),
    bed_horizontal: () =>
      wrap(`
        <circle cx="70" cy="32" r="17" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <line x1="53" y1="32" x2="87" y2="32" stroke="${INK}" stroke-width="2.8"/>
        <line x1="70" y1="15" x2="70" y2="49" stroke="${INK}" stroke-width="2.8"/>
      `),
    strike_dip: () =>
      wrap(`
        <line x1="20" y1="24" x2="120" y2="24" stroke="${INK}" stroke-width="3.2"/>
        <line x1="70" y1="24" x2="70" y2="46" stroke="${INK}" stroke-width="3.2"/>
      `),
    bed_overturned: () =>
      wrap(`
        <line x1="20" y1="22" x2="120" y2="22" stroke="${INK}" stroke-width="3"/>
        <path d="M 70 22 L 70 42 C 70 50, 86 50, 86 40 L 86 32" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      `),
    bed_undulating: () =>
      wrap(`
        <path d="M 20 32 Q 37 16, 54 32 T 88 32 T 122 32" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      `),

    // Tabel 2.3 Foliasi
    foliation_strike_dip: () =>
      wrap(`
        <line x1="20" y1="38" x2="120" y2="38" stroke="${INK}" stroke-width="3"/>
        <polygon points="56,38 84,38 70,18" fill="${INK}"/>
      `),
    foliation_vertical: () =>
      wrap(`
        <line x1="20" y1="32" x2="120" y2="32" stroke="${INK}" stroke-width="3"/>
        <polygon points="70,15 86,32 70,49 54,32" fill="${INK}"/>
      `),
    foliation_horizontal: () =>
      wrap(`
        <line x1="20" y1="32" x2="120" y2="32" stroke="${INK}" stroke-width="2.8"/>
        <line x1="70" y1="10" x2="70" y2="54" stroke="${INK}" stroke-width="2.8"/>
        <polygon points="70,17 85,32 70,47 55,32" fill="${INK}"/>
      `),
    cleavage_strike_dip: () =>
      wrap(`
        <line x1="20" y1="24" x2="120" y2="24" stroke="${INK}" stroke-width="3"/>
        <line x1="70" y1="24" x2="70" y2="46" stroke="${INK}" stroke-width="3"/>
        <line x1="60" y1="46" x2="80" y2="46" stroke="${INK}" stroke-width="3"/>
      `),
    cleavage_horizontal: () =>
      wrap(`
        <line x1="20" y1="32" x2="120" y2="32" stroke="${INK}" stroke-width="2.8"/>
        <line x1="70" y1="16" x2="70" y2="48" stroke="${INK}" stroke-width="2.8"/>
        <line x1="58" y1="16" x2="82" y2="16" stroke="${INK}" stroke-width="2.8"/>
        <line x1="58" y1="48" x2="82" y2="48" stroke="${INK}" stroke-width="2.8"/>
      `),

    // Tabel 2.4 Sesar
    fault_breccia: () =>
      wrap(`
        <polygon points="24,44 38,20 52,44" fill="none" stroke="${INK}" stroke-width="2.6"/>
        <polygon points="56,44 70,20 84,44" fill="none" stroke="${INK}" stroke-width="2.6"/>
        <polygon points="88,44 102,20 116,44" fill="none" stroke="${INK}" stroke-width="2.6"/>
      `),
    fault_inferred: () =>
      wrap(`
        <line x1="20" y1="32" x2="120" y2="32" stroke="${INK}" stroke-width="3.2" stroke-dasharray="10 7"/>
      `),
    fault_concealed: () =>
      wrap(`
        <line x1="20" y1="32" x2="120" y2="32" stroke="${INK}" stroke-width="3.2" stroke-dasharray="12 5 3 5"/>
      `),
    fault_normal: () =>
      wrap(`
        <line x1="20" y1="24" x2="120" y2="24" stroke="${INK}" stroke-width="3.2"/>
        <line x1="34" y1="24" x2="34" y2="42" stroke="${INK}" stroke-width="2.8"/>
        <line x1="58" y1="24" x2="58" y2="42" stroke="${INK}" stroke-width="2.8"/>
        <line x1="82" y1="24" x2="82" y2="42" stroke="${INK}" stroke-width="2.8"/>
        <line x1="106" y1="24" x2="106" y2="42" stroke="${INK}" stroke-width="2.8"/>
      `),
    fault_strike_slip: () =>
      wrap(`
        <line x1="20" y1="32" x2="120" y2="32" stroke="${INK}" stroke-width="3"/>
        <polyline points="86,18 106,18 96,11" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="54,46 34,46 44,53" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      `),

    // Tabel 2.5 Kekar
    joint_strike_dip: () =>
      wrap(`
        <line x1="20" y1="40" x2="120" y2="40" stroke="${INK}" stroke-width="3"/>
        <rect x="52" y="24" width="36" height="16" fill="${INK}"/>
      `),
    joint_vertical: () =>
      wrap(`
        <line x1="20" y1="32" x2="120" y2="32" stroke="${INK}" stroke-width="3"/>
        <rect x="56" y="18" width="28" height="28" fill="${INK}"/>
      `),
    joint_horizontal: () =>
      wrap(`
        <line x1="20" y1="32" x2="120" y2="32" stroke="${INK}" stroke-width="2.8"/>
        <line x1="70" y1="10" x2="70" y2="54" stroke="${INK}" stroke-width="2.8"/>
        <rect x="57" y="19" width="26" height="26" fill="${INK}"/>
      `),

    // Tabel 2.6 Lipatan
    fold_anticline: () =>
      wrap(`
        <line x1="20" y1="32" x2="120" y2="32" stroke="${INK}" stroke-width="3"/>
        <line x1="70" y1="12" x2="70" y2="52" stroke="${INK}" stroke-width="2.6"/>
        <polyline points="63,20 70,10 77,20" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="63,44 70,54 77,44" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      `),
    fold_syncline: () =>
      wrap(`
        <line x1="20" y1="32" x2="120" y2="32" stroke="${INK}" stroke-width="3"/>
        <line x1="70" y1="12" x2="70" y2="52" stroke="${INK}" stroke-width="2.6"/>
        <polyline points="63,16 70,27 77,16" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="63,48 70,37 77,48" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      `),
    fold_monocline: () =>
      wrap(`
        <line x1="20" y1="32" x2="120" y2="32" stroke="${INK}" stroke-width="3"/>
        <line x1="70" y1="18" x2="70" y2="52" stroke="${INK}" stroke-width="2.6"/>
        <polyline points="63,43 70,54 77,43" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      `),
  };

  // Diagram Penampang Besar untuk Materi & Minigame Lab
  const diagrams = {
    normal_fault: () => `
      <svg viewBox="0 0 360 190" class="diagram-svg" role="img" aria-label="Diagram Sesar Turun">
        <defs>
          <linearGradient id="skyG1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e0f2fe"/><stop offset="100%" stop-color="#f0f9ff"/>
          </linearGradient>
        </defs>
        <rect width="360" height="190" rx="14" fill="url(#skyG1)"/>
        <!-- Hanging wall (kiri, turun) -->
        <polygon points="30,68 175,68 150,160 30,160" fill="#bae6fd" stroke="${INK}" stroke-width="2"/>
        <polygon points="30,104 166,104 159,128 30,128" fill="#7dd3fc" stroke="${INK}" stroke-width="1.5"/>
        <!-- Footwall (kanan, relatif di atas) -->
        <polygon points="186,42 330,42 330,160 154,160" fill="#e2e8f0" stroke="${INK}" stroke-width="2"/>
        <polygon points="178,76 330,76 330,100 172,100" fill="#94a3b8" stroke="${INK}" stroke-width="1.5"/>
        <!-- Bidang Sesar -->
        <line x1="184" y1="30" x2="150" y2="170" stroke="#0284c7" stroke-width="3.5" stroke-dasharray="6 4"/>
        <!-- Panah gerak -->
        <path d="M 140 58 L 130 90" stroke="#e11d48" stroke-width="3" marker-end="url(#arr)"/>
        <path d="M 48 34 L 18 34" stroke="${INK}" stroke-width="2.5"/>
        <polyline points="26,29 17,34 26,39" fill="none" stroke="${INK}" stroke-width="2.5"/>
        <path d="M 312 34 L 342 34" stroke="${INK}" stroke-width="2.5"/>
        <polyline points="334,29 343,34 334,39" fill="none" stroke="${INK}" stroke-width="2.5"/>
        <text x="86" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}">Hanging Wall (Turun)</text>
        <text x="256" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}">Footwall</text>
        <text x="180" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="#0369a1">Gaya Tarikan (Ekstensi)</text>
      </svg>
    `,
    reverse_fault: () => `
      <svg viewBox="0 0 360 190" class="diagram-svg" role="img" aria-label="Diagram Sesar Naik">
        <rect width="360" height="190" rx="14" fill="#f0f9ff"/>
        <!-- Hanging wall (kiri, naik) -->
        <polygon points="30,40 184,40 152,160 30,160" fill="#bae6fd" stroke="${INK}" stroke-width="2"/>
        <polygon points="30,76 174,76 167,100 30,100" fill="#7dd3fc" stroke="${INK}" stroke-width="1.5"/>
        <!-- Footwall (kanan, relatif di bawah) -->
        <polygon points="178,72 330,72 330,160 156,160" fill="#e2e8f0" stroke="${INK}" stroke-width="2"/>
        <polygon points="169,108 330,108 330,132 162,132" fill="#94a3b8" stroke="${INK}" stroke-width="1.5"/>
        <!-- Bidang Sesar -->
        <line x1="186" y1="30" x2="152" y2="170" stroke="#0284c7" stroke-width="3.5" stroke-dasharray="6 4"/>
        <!-- Gaya tekan -->
        <path d="M 18 30 L 52 30" stroke="${INK}" stroke-width="2.5"/>
        <polyline points="44,25 53,30 44,35" fill="none" stroke="${INK}" stroke-width="2.5"/>
        <path d="M 342 30 L 308 30" stroke="${INK}" stroke-width="2.5"/>
        <polyline points="316,25 307,30 316,35" fill="none" stroke="${INK}" stroke-width="2.5"/>
        <text x="90" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}">Hanging Wall (Naik)</text>
        <text x="256" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}">Footwall</text>
        <text x="180" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="#0369a1">Gaya Tekan (Kompresi)</text>
      </svg>
    `,
    strike_slip_fault: () => `
      <svg viewBox="0 0 360 190" class="diagram-svg" role="img" aria-label="Diagram Sesar Mendatar">
        <rect width="360" height="190" rx="14" fill="#f0f9ff"/>
        <polygon points="40,56 176,42 176,136 40,152" fill="#bae6fd" stroke="${INK}" stroke-width="2"/>
        <polygon points="184,56 320,42 320,136 184,152" fill="#7dd3fc" stroke="${INK}" stroke-width="2"/>
        <line x1="180" y1="34" x2="180" y2="162" stroke="#0284c7" stroke-width="3.5" stroke-dasharray="6 4"/>
        <!-- Panah horizontal berlawanan -->
        <line x1="145" y1="70" x2="145" y2="122" stroke="#0c4a6e" stroke-width="3"/>
        <polyline points="139,112 145,124 151,112" fill="none" stroke="#0c4a6e" stroke-width="3"/>
        <line x1="215" y1="122" x2="215" y2="70" stroke="#0c4a6e" stroke-width="3"/>
        <polyline points="209,80 215,68 221,80" fill="none" stroke="#0c4a6e" stroke-width="3"/>
        <text x="180" y="24" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0369a1">Sesar Mendatar (Gaya Geser: Dekstral / Sinistral)</text>
        <text x="180" y="176" text-anchor="middle" font-size="11" font-weight="600" fill="${INK}">Pergeseran Horizontal tanpa perpindahan vertikal dominan</text>
      </svg>
    `,
    folds: () => `
      <svg viewBox="0 0 360 190" class="diagram-svg" role="img" aria-label="Diagram Antiklin dan Sinklin">
        <rect width="360" height="190" rx="14" fill="#f0f9ff"/>
        <path d="M 24 115 Q 98 35, 178 96 T 336 86 L 336 154 L 24 154 Z" fill="#bae6fd" stroke="${INK}" stroke-width="2"/>
        <path d="M 24 134 Q 98 56, 178 116 T 336 106" fill="none" stroke="${INK}" stroke-width="2"/>
        <path d="M 24 150 Q 98 78, 178 136 T 336 126" fill="none" stroke="#0369a1" stroke-width="2"/>
        <!-- Sumbu Antiklin & Sinklin -->
        <line x1="100" y1="26" x2="100" y2="160" stroke="#0284c7" stroke-width="2" stroke-dasharray="5 4"/>
        <line x1="258" y1="26" x2="258" y2="160" stroke="#0284c7" stroke-width="2" stroke-dasharray="5 4"/>
        <text x="100" y="20" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0369a1">Antiklin (Huruf A)</text>
        <text x="100" y="176" text-anchor="middle" font-size="10.5" font-weight="600" fill="${INK}">Inti: Batuan Tertua</text>
        <text x="258" y="20" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0369a1">Sinklin (Huruf U)</text>
        <text x="258" y="176" text-anchor="middle" font-size="10.5" font-weight="600" fill="${INK}">Inti: Batuan Termuda</text>
      </svg>
    `,
    thickness_dip: () => `
      <svg viewBox="0 0 360 190" class="diagram-svg" role="img" aria-label="Diagram Ketebalan dan Kemiringan">
        <rect width="360" height="190" rx="14" fill="#f0f9ff"/>
        <!-- Permukaan horizontal -->
        <line x1="25" y1="54" x2="335" y2="54" stroke="${INK}" stroke-width="2.5"/>
        <!-- Lapisan miring -->
        <polygon points="80,54 200,54 315,155 195,155" fill="#bae6fd" stroke="${INK}" stroke-width="2"/>
        <!-- Garis tegak lurus True Thickness -->
        <line x1="145" y1="111" x2="200" y2="54" stroke="#0284c7" stroke-width="3"/>
        <!-- Label -->
        <text x="140" y="42" text-anchor="middle" font-size="11" font-weight="700" fill="${INK}">Apparent Thickness (Lebar Singkapan)</text>
        <text x="242" y="96" font-size="11" font-weight="700" fill="#0369a1">True Thickness</text>
        <text x="242" y="110" font-size="10" fill="${INK}">= Apparent × sin(Dip)</text>
        <text x="106" y="72" font-size="11" font-weight="700" fill="#0c4a6e">Dip (θ)</text>
      </svg>
    `,
  };

  function getSymbol(key) {
    return symbols[key] ? symbols[key]() : "";
  }

  function getDiagram(key) {
    return diagrams[key] ? diagrams[key]() : "";
  }

  return { getSymbol, getDiagram, symbols, diagrams };
})();
