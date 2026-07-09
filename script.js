(() => {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  const body = document.body;
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const year = document.getElementById('year');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (navToggle && navMenu) {
    const closeMenu = () => {
      body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.addEventListener('click', (event) => {
      if (event.target instanceof HTMLAnchorElement) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }
})();

(() => {
  const panel = document.querySelector('.hero-signal');
  const field = document.querySelector('.ascii-field');
  const baseLayer = document.querySelector('.ascii-base');
  const accentLayer = document.querySelector('.ascii-accent');
  const glyphLayer = document.querySelector('.ascii-glyph');
  if (!panel || !field || !baseLayer || !accentLayer || !glyphLayer) return;

  const BASE_RAMP = '  ..::--=+*';
  // Opening sequence: the P brand mark, then a quick 3-2-1 countdown, then
  // an endless random cycle through the site's motifs. Shapes are drawn as
  // chunky bitmaps because the ~22×15 glyph grid erases fine detail.
  const SYMBOLS = [
    {
      label: 'P',
      ramp: 'pppPP@',
      bitmap: [
        '1111111100',
        '1111111110',
        '1100000111',
        '1100000011',
        '1100000111',
        '1111111110',
        '1111111100',
        '1100000000',
        '1100000000',
        '1100000000',
        '1100000000',
        '1100000000',
      ],
    },
    {
      label: '3',
      ramp: ':33333@',
      bitmap: [
        '1111111111',
        '1111111111',
        '0000000011',
        '0000000011',
        '0000000011',
        '1111111111',
        '1111111111',
        '0000000011',
        '0000000011',
        '0000000011',
        '1111111111',
        '1111111111',
      ],
    },
    {
      label: '2',
      ramp: ':22222@',
      bitmap: [
        '1111111111',
        '1111111111',
        '0000000011',
        '0000000011',
        '0000000011',
        '1111111111',
        '1111111111',
        '1100000000',
        '1100000000',
        '1100000000',
        '1111111111',
        '1111111111',
      ],
    },
    {
      label: '1',
      ramp: ':11111@',
      bitmap: [
        '0000110000',
        '0001110000',
        '0011110000',
        '0000110000',
        '0000110000',
        '0000110000',
        '0000110000',
        '0000110000',
        '0000110000',
        '0000110000',
        '0111111100',
        '0111111100',
      ],
    },
    {
      label: '?',
      ramp: '..:??#',
      bitmap: [
        '0011111100',
        '0111111110',
        '1110000111',
        '1100000011',
        '0000000111',
        '0000001110',
        '0000011100',
        '0000111000',
        '0000110000',
        '0000000000',
        '0000110000',
        '0000110000',
      ],
    },
    {
      label: '>_',
      ramp: '.:>>#@',
      bitmap: [
        '110000000000',
        '111000000000',
        '011100000000',
        '000111000000',
        '000011100000',
        '000001110000',
        '000011100000',
        '000111000000',
        '011100000000',
        '111000000000',
        '110000111111',
        '000000111111',
      ],
    },
    {
      label: 'INVADER',
      ramp: '.:*##@',
      bitmap: [
        '00100000100',
        '00010001000',
        '00111111100',
        '01101110110',
        '11111111111',
        '10111111101',
        '10100000101',
        '00011011000',
      ],
    },
    {
      label: 'CURSOR',
      ramp: '..:##@',
      bitmap: [
        '1000000000',
        '1100000000',
        '1110000000',
        '1111000000',
        '1111100000',
        '1111110000',
        '1111111000',
        '1111111100',
        '1111111110',
        '1111110000',
        '1100111000',
        '0000011100',
      ],
    },
    {
      label: 'IDEA',
      ramp: '.:o##@',
      bitmap: [
        '0011111100',
        '0111111110',
        '1111111111',
        '1111111111',
        '1111111111',
        '1111111111',
        '0111111110',
        '0011111100',
        '0001111000',
        '0001111000',
        '0001111000',
        '0000110000',
      ],
    },
  ];
  const INTRO_SEQ = ['3', '2', '1'];
  const POOL = ['?', '>_', 'INVADER', 'CURSOR', 'IDEA'];
  let introStep = 0;
  let symbolIndex = 0;
  let symbol = SYMBOLS[0];
  const counter = document.querySelector('.signal-count');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let cols = 0;
  let rows = 0;
  let charW = 8;
  let charH = 15;
  let maskBox = null;

  const mouse = { x: -1, y: -1, strength: 0, target: 0 };
  // Char cells only visibly move when a threshold is crossed, so the field
  // clock has to run well above real time to read as fluid.
  const BASE_SPEED = 2.6;
  let speed = BASE_SPEED;
  let speedTarget = BASE_SPEED;
  // Irregular tempo: mostly calm, with random surges of acceleration.
  let tempo = 1;
  let tempoTarget = 1;
  let tempoTimer = 0;
  // Cohesion drives the metamorphosis: at 1 the glyph is whole; the morph
  // dissolves it almost completely, swaps the symbol at the bottom where the
  // change is invisible, then reforms slowly by accretion.
  let cohesion = 1;
  let morphState = 'hold';
  let morphTimer = 4;

  const pickNextSymbol = () => {
    if (introStep < INTRO_SEQ.length) {
      const idx = SYMBOLS.findIndex((s) => s.label === INTRO_SEQ[introStep]);
      introStep++;
      return idx;
    }
    const pool = SYMBOLS
      .map((s, i) => (POOL.includes(s.label) && i !== symbolIndex ? i : -1))
      .filter((i) => i >= 0);
    return pool[Math.floor(Math.random() * pool.length)];
  };
  let visible = true;
  let rafId = 0;
  let lastFrame = 0;
  let clock = 0;
  let lastTick = 0;

  const measure = () => {
    const probe = document.createElement('span');
    probe.textContent = '0'.repeat(10);
    probe.style.whiteSpace = 'pre';
    baseLayer.textContent = '';
    baseLayer.appendChild(probe);
    const rect = probe.getBoundingClientRect();
    charW = rect.width / 10 || 8;
    charH = parseFloat(getComputedStyle(baseLayer).lineHeight) || 15;
    baseLayer.textContent = '';

    cols = Math.max(20, Math.floor(field.clientWidth / charW));
    rows = Math.max(12, Math.floor(field.clientHeight / charH));

    setMaskBox();
  };

  // The glyph keeps its bitmap's shape in pixels despite cells being taller
  // than wide.
  const setMaskBox = () => {
    const bw = symbol.bitmap[0].length;
    const bh = symbol.bitmap.length;
    const maskRows = Math.round(rows * 0.66);
    const maskCols = Math.min(cols - 4, Math.round(maskRows * (bw / bh) * (charH / charW)));
    maskBox = {
      top: Math.floor((rows - maskRows) / 2),
      left: Math.floor((cols - maskCols) / 2),
      cols: maskCols,
      rows: maskRows,
    };
  };

  // Samples the P bitmap with a time-varying warp so the glyph undulates,
  // and a repulsion term so it dents away from the cursor.
  const inGlyph = (x, y, t, warpAmp) => {
    if (!maskBox) return false;
    let wx = Math.sin(y * 0.31 + t * 0.9) * warpAmp + Math.sin(y * 0.09 - t * 0.43) * warpAmp * 0.7;
    let wy = Math.cos(x * 0.17 + t * 0.53) * warpAmp * 0.5;
    if (mouse.strength > 0.01) {
      const mdx = x - mouse.x;
      const mdy = (y - mouse.y) * (charH / charW);
      const d2 = mdx * mdx + mdy * mdy;
      const push = mouse.strength * 30 / (14 + d2);
      wx += mdx * push;
      wy += mdy * push;
    }
    const u = (x + wx - maskBox.left) / maskBox.cols;
    const v = (y + wy - maskBox.top) / maskBox.rows;
    if (u < 0 || u >= 1 || v < 0 || v >= 1) return false;
    const row = symbol.bitmap[Math.floor(v * symbol.bitmap.length)];
    return row[Math.floor(u * row.length)] === '1';
  };

  const cellHash = (x, y) => {
    const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };

  const render = (t) => {
    const aspect = charW / charH;
    const cx = cols / 2;
    const cy = rows / 2;
    // Undulation amplitude follows the tempo surges, so accelerations twist
    // the glyph harder.
    const warpAmp = (0.5 + Math.abs(Math.sin(t * 0.37) * Math.sin(t * 0.13 + 2)) * 1.1) * (0.35 + tempo * 0.4);
    let base = '';
    let accent = '';
    let glyph = '';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dx = (x - cx) * aspect;
        const dy = y - cy;
        let v = Math.sin(x * aspect * 0.32 + t * 0.9)
          + Math.sin(y * 0.34 - t * 0.6)
          + Math.sin((x * aspect + y) * 0.21 + t * 0.4)
          + Math.sin(Math.hypot(dx, dy) * 0.5 - t * 1.4) * 0.9;
        if (mouse.strength > 0.01) {
          const mdx = (x - mouse.x) * aspect;
          const mdy = y - mouse.y;
          const d2 = mdx * mdx + mdy * mdy;
          v += mouse.strength * 2.4 * Math.exp(-d2 / 26) * Math.sin(Math.sqrt(d2) * 0.9 - t * 3.2);
        }
        let n = Math.min(1, Math.max(0, (v + 3.9) / 7.8));
        const h = cellHash(x, y);
        if (inGlyph(x, y, t, warpAmp)) {
          // Below full cohesion, high-hash cells escape the glyph and the
          // field shows through the gap.
          if (cohesion >= 0.99 || h <= cohesion) {
            base += ' ';
            accent += ' ';
            glyph += symbol.ramp[Math.min(symbol.ramp.length - 1, Math.floor(n * symbol.ramp.length))];
            continue;
          }
        } else if (cohesion < 0.97 && h > cohesion && h < cohesion + 0.07 && n > 0.3 && maskBox
          && x > maskBox.left - 9 && x < maskBox.left + maskBox.cols + 9
          && y > maskBox.top - 5 && y < maskBox.top + maskBox.rows + 5) {
          // The escaped cells wander as loose acid particles around the P.
          base += ' ';
          accent += ' ';
          glyph += n > 0.6 ? 'p' : '·';
          continue;
        }
        // The cloud thins toward the edges like a nebula rather than filling the box.
        const r = Math.hypot(dx / (cols * aspect * 0.5), dy / (rows * 0.5));
        n *= Math.min(1, Math.max(0, 1.35 - r * 1.25));
        // Independent per-cell twinkle so the sparse outskirts never look frozen.
        n = Math.min(1, Math.max(0, n + Math.sin(t * 1.2 + h * 6.283) * 0.12));
        if (h > 0.982 && n > 0.42) {
          base += ' ';
          accent += h > 0.994 ? '*' : 'p';
        } else {
          base += BASE_RAMP[Math.min(BASE_RAMP.length - 1, Math.floor(n * BASE_RAMP.length))];
          accent += ' ';
        }
        glyph += ' ';
      }
      base += '\n';
      accent += '\n';
      glyph += '\n';
    }
    baseLayer.textContent = base;
    accentLayer.textContent = accent;
    glyphLayer.textContent = glyph;
  };

  const frame = (now) => {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - lastTick) / 1000);
    lastTick = now;
    lastFrame = now;
    tempoTimer -= dt;
    if (tempoTimer <= 0) {
      // Mostly calm phases; the power curve makes strong surges rare.
      tempoTarget = 0.5 + Math.pow(Math.random(), 2.5) * 2.4;
      tempoTimer = 2 + Math.random() * 4;
    }
    tempo += (tempoTarget - tempo) * Math.min(1, dt * 1.6);
    morphTimer -= dt;
    // The countdown runs on tighter timings than the ambient cycle.
    const quick = introStep <= INTRO_SEQ.length && INTRO_SEQ.includes(symbol.label);
    if (morphState === 'hold' && morphTimer <= 0) {
      morphState = 'out';
    } else if (morphState === 'out') {
      cohesion += (0.05 - cohesion) * Math.min(1, dt * (quick || introStep < INTRO_SEQ.length ? 3.4 : 1.5));
      if (cohesion < 0.18) {
        symbolIndex = pickNextSymbol();
        symbol = SYMBOLS[symbolIndex];
        setMaskBox();
        if (counter) counter.textContent = symbol.label;
        morphState = 'in';
      }
    } else if (morphState === 'in') {
      cohesion += (1 - cohesion) * Math.min(1, dt * (quick ? 2.6 : 0.75));
      if (cohesion > 0.97) {
        cohesion = 1;
        morphState = 'hold';
        morphTimer = quick ? 0.9 : 6 + Math.random() * 8;
      }
    }
    speed += (speedTarget - speed) * 0.04;
    mouse.strength += (mouse.target - mouse.strength) * 0.05;
    clock += dt * speed * tempo;
    render(clock);
  };

  const start = () => {
    if (rafId || reducedMotion.matches || document.hidden || !visible) return;
    lastTick = performance.now();
    lastFrame = 0;
    rafId = requestAnimationFrame(frame);
  };

  const stop = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const rebuild = () => {
    measure();
    render(clock);
  };

  panel.addEventListener('pointermove', (event) => {
    const rect = field.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) / charW;
    mouse.y = (event.clientY - rect.top) / charH;
    mouse.target = 1;
    speedTarget = BASE_SPEED * 1.8;
  });
  panel.addEventListener('pointerleave', () => {
    mouse.target = 0;
    speedTarget = BASE_SPEED;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
      else stop();
    }).observe(panel);
  }

  if ('ResizeObserver' in window) {
    let resizeTimer = 0;
    new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rebuild, 120);
    }).observe(field);
  }

  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) {
      stop();
      render(2.4);
    } else {
      start();
    }
  });

  rebuild();
  if (reducedMotion.matches) render(2.4);
  else start();
})();

(() => {
  const layers = document.querySelectorAll('.hero-stars');
  if (!layers.length) return;

  const GLYPHS = '..··++00';

  // Two static seeds; the twinkle comes from CSS crossfading the layers.
  const paint = () => {
    layers.forEach((layer) => {
      const cols = Math.ceil(layer.clientWidth / 12) || 0;
      const rows = Math.ceil(layer.clientHeight / 20) || 0;
      let out = '';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          out += Math.random() < 0.02 ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : ' ';
        }
        out += '\n';
      }
      layer.textContent = out;
    });
  };

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(paint, 150);
  });

  paint();
})();
