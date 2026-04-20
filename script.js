/* ═══════════════════════════════════════════════════════════════
   MAKKETE — Hero Carrusel + Interacciones
═══════════════════════════════════════════════════════════════ */

// ── Nav scroll state ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

// ═══════════════════════════════════════════════════════════════
// TWEAKS — defaults + state
// ═══════════════════════════════════════════════════════════════
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "autoplay": "scroll-stop",
  "transition": "dust",
  "magenta": "#FF00A8",
  "startSlide": 2
}/*EDITMODE-END*/;

let state = Object.assign({}, TWEAK_DEFAULTS);

function pushEdits(edits) {
  Object.assign(state, edits);
  window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
}

// ═══════════════════════════════════════════════════════════════
// HERO CAROUSEL
// ═══════════════════════════════════════════════════════════════
const hero = document.getElementById('hero');
const slides = [...document.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('.hero__dot')];
const dotFills = dots.map(d => d.querySelector('.hero__dot-fill'));
const labelNum = document.getElementById('heroLabelNum');
const labelName = document.getElementById('heroLabelName');
const prevBtn = document.getElementById('heroPrev');
const nextBtn = document.getElementById('heroNext');
const smokeBg = document.getElementById('heroSmoke');

const SLIDE_DURATION = 7800;
// Visual order: C (brand/wordmark) → A (agent) → B (dashboard)
// Keeping DOM order A,B,C but mapping visual order via indexMap.
const SLIDE_ORDER = [2, 0, 1]; // visualIndex -> domIndex
const SLIDE_NAMES = ['Brand · generativo', 'Precision · agente', 'Data · en vivo'];
const SLIDE_SMOKE = [
  { a: '#7C3AED', b: '#FFD600' },  // violet + yellow (brand)
  { a: '#FF00A8', b: '#00E5FF' },  // magenta + cyan (agent)
  { a: '#C6FF00', b: '#FF00A8' },  // lime + magenta (dashboard)
];

// state.startSlide is stored as DOM-index; convert to visual index
let current = Math.max(0, SLIDE_ORDER.indexOf(Math.max(0, Math.min(2, state.startSlide | 0))));
if (current < 0) current = 0;
let autoplayRAF = null;
let autoplayStart = 0;
let autoplayPaused = false;
let scrollStopped = false;

function applyTransition(kind) {
  hero.dataset.transition = kind;
}
function applySmoke(i) {
  const { a, b } = SLIDE_SMOKE[i];
  smokeBg.style.setProperty('--smoke-a', a);
  smokeBg.style.setProperty('--smoke-b', b);
}

function goToSlide(i, { resetTimer = true } = {}) {
  current = ((i % SLIDE_ORDER.length) + SLIDE_ORDER.length) % SLIDE_ORDER.length;
  const domIdx = SLIDE_ORDER[current];
  slides.forEach((s, idx) => s.classList.toggle('is-active', idx === domIdx));
  dots.forEach((d, idx) => d.classList.toggle('is-active', idx === current));
  dotFills.forEach((f, idx) => {
    if (idx !== current) f.style.width = '0%';
  });
  labelNum.textContent = String(current + 1).padStart(2, '0') + ' / 03';
  labelName.textContent = SLIDE_NAMES[current];
  applySmoke(current);

  // Re-run per-slide entry animations
  slides[domIdx].dispatchEvent(new CustomEvent('slide:enter'));

  if (resetTimer) restartAutoplay();
}

function autoplayTick(now) {
  if (autoplayPaused || state.autoplay === 'off' || (state.autoplay === 'scroll-stop' && scrollStopped)) {
    autoplayRAF = requestAnimationFrame(autoplayTick);
    return;
  }
  const elapsed = now - autoplayStart;
  const pct = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
  if (dotFills[current]) dotFills[current].style.width = pct + '%';
  if (elapsed >= SLIDE_DURATION) {
    goToSlide(current + 1);
  }
  autoplayRAF = requestAnimationFrame(autoplayTick);
}
function restartAutoplay() {
  autoplayStart = performance.now();
  if (!autoplayRAF) autoplayRAF = requestAnimationFrame(autoplayTick);
}

prevBtn.addEventListener('click', () => goToSlide(current - 1));
nextBtn.addEventListener('click', () => goToSlide(current + 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

// Hover-pause
hero.addEventListener('mouseenter', () => {
  if (state.autoplay === 'hover-pause') autoplayPaused = true;
});
hero.addEventListener('mouseleave', () => {
  if (state.autoplay === 'hover-pause') {
    autoplayPaused = false;
    autoplayStart = performance.now() - (parseFloat(dotFills[current].style.width || 0) / 100) * SLIDE_DURATION;
  }
});
// Scroll-stop
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) scrollStopped = true;
}, { passive: true });
// Keyboard
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') goToSlide(current - 1);
  if (e.key === 'ArrowRight') goToSlide(current + 1);
});

// Init
applyTransition(state.transition);
applySmoke(current);
goToSlide(current, { resetTimer: true });

// ═══════════════════════════════════════════════════════════════
// SLIDE A — Agent prompt typewriter
// ═══════════════════════════════════════════════════════════════
const agentScenarios = [
  {
    brand: 'd2c · skincare',
    budget: 80,
    rec: [
      { ch: 'Meta Ads', pct: 42, color: 'var(--m-magenta)' },
      { ch: 'TikTok Ads', pct: 28, color: 'var(--m-cyan)' },
      { ch: 'SEO + GEO', pct: 20, color: 'var(--m-lime)' },
      { ch: 'Brand', pct: 10, color: 'var(--m-yellow)' },
    ],
    roas: 3.4,
    confidence: 87,
  },
  {
    brand: 'saas · B2B',
    budget: 120,
    rec: [
      { ch: 'Google Ads', pct: 38, color: 'var(--m-magenta)' },
      { ch: 'LinkedIn Ads', pct: 26, color: 'var(--m-cyan)' },
      { ch: 'Content + SEO', pct: 24, color: 'var(--m-lime)' },
      { ch: 'Growth loops', pct: 12, color: 'var(--m-yellow)' },
    ],
    roas: 4.1,
    confidence: 82,
  },
  {
    brand: 'restaurante · CDMX',
    budget: 35,
    rec: [
      { ch: 'Meta Ads local', pct: 48, color: 'var(--m-magenta)' },
      { ch: 'TikTok orgánico', pct: 22, color: 'var(--m-cyan)' },
      { ch: 'Google Maps / SEO', pct: 20, color: 'var(--m-lime)' },
      { ch: 'Contenido', pct: 10, color: 'var(--m-yellow)' },
    ],
    roas: 3.8,
    confidence: 91,
  },
  {
    brand: 'clínica estética',
    budget: 60,
    rec: [
      { ch: 'Meta Ads', pct: 40, color: 'var(--m-magenta)' },
      { ch: 'Google Ads', pct: 30, color: 'var(--m-cyan)' },
      { ch: 'Landing + CRO', pct: 20, color: 'var(--m-lime)' },
      { ch: 'Referral', pct: 10, color: 'var(--m-yellow)' },
    ],
    roas: 3.2,
    confidence: 89,
  },
];

const agentLog = document.getElementById('agentLog');
let agentScenarioIdx = 0;
let agentTimer = null;

function agentLine(html, cls = '') {
  const d = document.createElement('div');
  d.className = 'agent__line ' + cls;
  d.innerHTML = html;
  agentLog.appendChild(d);
  // force reflow then animate in
  requestAnimationFrame(() => d.classList.add('is-in'));
  return d;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runAgent(scenario) {
  agentLog.innerHTML = '';
  agentLine(`<span class="agent__line--comment"># makkete.agent · run()</span>`, 'agent__line--comment');
  await sleep(380);
  agentLine(`<span class="agent__line--prompt">&gt;</span> analyze(<span class="agent__token">brand</span>)`, 'agent__line--prompt');
  await sleep(500);
  agentLine(`&nbsp;&nbsp;sector: <span class="agent__num">${scenario.brand}</span>`, 'agent__line--result');
  await sleep(280);
  agentLine(`&nbsp;&nbsp;budget: <span class="agent__num">$${scenario.budget}k</span>/mes`, 'agent__line--result');
  await sleep(500);
  agentLine(`<span class="agent__line--prompt">&gt;</span> recommend()`, 'agent__line--prompt');
  await sleep(400);
  for (const r of scenario.rec) {
    const bar = document.createElement('div');
    bar.className = 'agent__line is-in agent__line--kpi';
    bar.innerHTML = `
      <span style="color:${r.color}">▸ ${r.ch}</span>
      <span class="agent__bar"><span class="agent__bar-fill" style="background:${r.color}"></span></span>
      <span class="agent__num" style="min-width:34px;text-align:right">${r.pct}%</span>
    `;
    agentLog.appendChild(bar);
    await sleep(80);
    bar.querySelector('.agent__bar-fill').style.width = r.pct + '%';
    await sleep(240);
  }
  await sleep(400);
  agentLine(`<span class="agent__line--prompt">&gt;</span> forecast()`, 'agent__line--prompt');
  await sleep(320);
  const roasLine = document.createElement('div');
  roasLine.className = 'agent__line is-in agent__line--kpi';
  roasLine.innerHTML = `
    <span>expected ROAS</span>
    <span class="agent__bar"><span class="agent__bar-fill"></span></span>
    <span class="agent__num" style="color:var(--m-lime);min-width:34px;text-align:right">${scenario.roas}x</span>
  `;
  agentLog.appendChild(roasLine);
  await sleep(100);
  roasLine.querySelector('.agent__bar-fill').style.width = Math.min(scenario.roas * 20, 100) + '%';
  await sleep(260);
  agentLine(`&nbsp;&nbsp;confidence: <span class="agent__num" style="color:var(--m-cyan)">${scenario.confidence}%</span> <span class="agent__cursor"></span>`, 'agent__line--result');
}

function startAgentCycle() {
  if (agentTimer) clearTimeout(agentTimer);
  runAgent(agentScenarios[agentScenarioIdx]);
  agentTimer = setTimeout(() => {
    agentScenarioIdx = (agentScenarioIdx + 1) % agentScenarios.length;
    startAgentCycle();
  }, 7500);
}

const slideA = document.getElementById('slideA');
slideA.addEventListener('slide:enter', () => {
  // reset to next scenario on entering
  if (!agentTimer) startAgentCycle();
});
if (SLIDE_ORDER[current] === 0) startAgentCycle();

// ═══════════════════════════════════════════════════════════════
// SLIDE B — Dashboard sparklines + numbers
// ═══════════════════════════════════════════════════════════════
const metrics = [
  { label: 'impresiones', vals: [148220, 162490, 174300, 184220, 196110], delta: '+14.2%' },
  { label: 'engagement', vals: ['9.8%', '10.4%', '11.1%', '12.4%', '13.0%'], delta: '+2.6pp' },
  { label: 'conversiones', vals: [218, 256, 301, 342, 378], delta: '+23%' },
];

function buildSparkline(svg, trend) {
  svg.innerHTML = '';
  const w = 140, h = 28;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const n = trend.length;
  const pts = trend.map((v, i) => [i * (w / (n - 1)), h - (v * (h - 4) + 2)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const ns = 'http://www.w3.org/2000/svg';
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'var(--m-magenta)');
  path.setAttribute('stroke-width', '1.5');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);

  // last point dot
  const last = pts[pts.length - 1];
  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', last[0]);
  circle.setAttribute('cy', last[1]);
  circle.setAttribute('r', '3');
  circle.setAttribute('fill', 'var(--m-magenta)');
  circle.setAttribute('filter', 'drop-shadow(0 0 4px rgba(255,0,168,0.7))');
  svg.appendChild(circle);

  // dash animation
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  path.getBoundingClientRect();
  path.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
  path.style.strokeDashoffset = '0';
}

function randomTrend() {
  let v = 0.3 + Math.random() * 0.2;
  const out = [v];
  for (let i = 0; i < 6; i++) {
    v = Math.max(0.1, Math.min(0.95, v + (Math.random() - 0.3) * 0.2));
    out.push(v);
  }
  return out;
}

const dashClock = document.getElementById('dashClock');
function updateClock() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  dashClock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
updateClock();
setInterval(updateClock, 1000);

const sparks = [...document.querySelectorAll('.dash-row-spark')];
function refreshDashboard() {
  sparks.forEach(s => buildSparkline(s, randomTrend()));
  document.querySelectorAll('.dash-row-metric-num').forEach((el, i) => {
    const m = metrics[i];
    if (!m) return;
    const val = m.vals[Math.floor(Math.random() * m.vals.length)];
    el.textContent = typeof val === 'number' ? val.toLocaleString() : val;
  });
}

const slideB = document.getElementById('slideB');
slideB.addEventListener('slide:enter', refreshDashboard);
if (SLIDE_ORDER[current] === 1) refreshDashboard();
// Also refresh every few seconds while slide B is visible
setInterval(() => {
  if (slideB.classList.contains('is-active')) refreshDashboard();
}, 4200);

// ═══════════════════════════════════════════════════════════════
// SLIDE C — Wordmark particle canvas
// ═══════════════════════════════════════════════════════════════
const wordCanvas = document.getElementById('wordCanvas');
const wordStage = document.getElementById('wordStage');
const wordCtx = wordCanvas.getContext('2d');
let wordParticles = [];
let wordMouse = { x: -9999, y: -9999, active: false };
let wordDPR = Math.min(window.devicePixelRatio || 1, 2);
let wordRunning = false;

function wordResize() {
  const rect = wordStage.getBoundingClientRect();
  wordCanvas.width = Math.max(400, rect.width * wordDPR);
  wordCanvas.height = Math.max(100, rect.height * wordDPR);
  wordCanvas.style.width = rect.width + 'px';
  wordCanvas.style.height = rect.height + 'px';
  buildWordParticles();
}

function buildWordParticles() {
  const w = wordCanvas.width;
  const h = wordCanvas.height;
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const octx = off.getContext('2d');
  octx.fillStyle = '#000';
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  // size text to FIT the canvas width, not proportional to height
  const text = 'Makkete';
  let fontSize = Math.floor(h * 0.88);
  octx.font = `700 ${fontSize}px Syne, 'Space Grotesk', sans-serif`;
  let measured = octx.measureText(text).width;
  const maxWidth = w * 0.92;
  if (measured > maxWidth) {
    fontSize = Math.floor(fontSize * (maxWidth / measured));
    octx.font = `700 ${fontSize}px Syne, 'Space Grotesk', sans-serif`;
  }
  octx.fillText(text, w / 2, h / 2);
  const data = octx.getImageData(0, 0, w, h).data;

  const step = Math.max(4, Math.round(4 * wordDPR));
  const palette = ['#FF00A8', '#00E5FF', '#C6FF00', '#FFD600', '#7C3AED', '#0B0B0F'];
  // density weights: mostly ink, then neons
  const weights = [0.18, 0.12, 0.10, 0.08, 0.08, 0.44];
  function pickColor() {
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < weights.length; i++) {
      acc += weights[i];
      if (r < acc) return palette[i];
    }
    return palette[palette.length - 1];
  }

  wordParticles.length = 0;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 128) {
        wordParticles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          tx: x, ty: y,
          vx: 0, vy: 0,
          r: (1.4 + Math.random() * 1.6) * wordDPR,
          color: pickColor(),
        });
      }
    }
  }
}

function wordTick() {
  if (!wordRunning) return;
  const w = wordCanvas.width, h = wordCanvas.height;
  wordCtx.clearRect(0, 0, w, h);

  const mx = wordMouse.x, my = wordMouse.y;
  const active = wordMouse.active;

  for (let i = 0; i < wordParticles.length; i++) {
    const p = wordParticles[i];
    // attraction to target
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    p.vx += dx * 0.02;
    p.vy += dy * 0.02;

    // mouse repel
    if (active) {
      const mdx = p.x - mx;
      const mdy = p.y - my;
      const md2 = mdx * mdx + mdy * mdy;
      const R = 100 * wordDPR;
      if (md2 < R * R && md2 > 0.01) {
        const md = Math.sqrt(md2);
        const f = (R - md) / R * 2.2;
        p.vx += (mdx / md) * f;
        p.vy += (mdy / md) * f;
      }
    }

    p.vx *= 0.82;
    p.vy *= 0.82;
    p.x += p.vx;
    p.y += p.vy;

    wordCtx.fillStyle = p.color;
    wordCtx.beginPath();
    wordCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    wordCtx.fill();
  }

  requestAnimationFrame(wordTick);
}

function startWord() {
  if (wordRunning) return;
  wordRunning = true;
  wordResize();
  requestAnimationFrame(wordTick);
}
function stopWord() { wordRunning = false; }

wordStage.addEventListener('mousemove', (e) => {
  const rect = wordStage.getBoundingClientRect();
  wordMouse.x = (e.clientX - rect.left) * wordDPR;
  wordMouse.y = (e.clientY - rect.top) * wordDPR;
  wordMouse.active = true;
});
wordStage.addEventListener('mouseleave', () => {
  wordMouse.active = false;
});
window.addEventListener('resize', () => {
  if (wordRunning) wordResize();
});

const slideC = document.getElementById('slideC');
slideC.addEventListener('slide:enter', startWord);
// Observe to stop when slide c is not visible (perf)
const slideCObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && slideC.classList.contains('is-active')) startWord();
  });
});
slideCObserver.observe(slideC);
if (SLIDE_ORDER[current] === 2) startWord();

// Pause canvas when slide changes away
slides.forEach((s, i) => {
  s.addEventListener('slide:enter', () => {
    if (i !== 2) stopWord();
    if (i === 2) startWord();
  });
});

// ═══════════════════════════════════════════════════════════════
// EDIT MODE (Tweaks)
// ═══════════════════════════════════════════════════════════════
const tweaksPanel = document.getElementById('tweaks');
const tweaksToggle = document.getElementById('tweaksToggle');
const tweaksClose = document.getElementById('tweaksClose');

// Listener first, then announce
window.addEventListener('message', (e) => {
  const msg = e.data || {};
  if (msg.type === '__activate_edit_mode') {
    tweaksToggle.style.display = 'inline-flex';
  } else if (msg.type === '__deactivate_edit_mode') {
    tweaksToggle.style.display = 'none';
    tweaksPanel.classList.remove('is-open');
  }
});
window.parent.postMessage({ type: '__edit_mode_available' }, '*');

tweaksToggle.addEventListener('click', () => {
  tweaksPanel.classList.add('is-open');
  tweaksToggle.style.display = 'none';
});
tweaksClose.addEventListener('click', () => {
  tweaksPanel.classList.remove('is-open');
  tweaksToggle.style.display = 'inline-flex';
});

// Autoplay options
document.querySelectorAll('[data-tweak="autoplay"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.value;
    document.querySelectorAll('[data-tweak="autoplay"]').forEach(b => b.classList.toggle('is-active', b === btn));
    pushEdits({ autoplay: v });
    if (v === 'scroll-stop') scrollStopped = window.scrollY > 60;
    restartAutoplay();
  });
});
// Transition options
document.querySelectorAll('[data-tweak="transition"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.value;
    document.querySelectorAll('[data-tweak="transition"]').forEach(b => b.classList.toggle('is-active', b === btn));
    pushEdits({ transition: v });
    applyTransition(v);
  });
});
// Magenta swatches
document.querySelectorAll('[data-tweak="magenta"]').forEach(sw => {
  sw.addEventListener('click', () => {
    const v = sw.dataset.value;
    document.querySelectorAll('[data-tweak="magenta"]').forEach(b => b.classList.toggle('is-active', b === sw));
    pushEdits({ magenta: v });
    document.documentElement.style.setProperty('--m-magenta', v);
    // rebuild dashboard and word particles to pick new magenta
    if (slideB.classList.contains('is-active')) refreshDashboard();
    if (slideC.classList.contains('is-active')) { stopWord(); startWord(); }
  });
});

// Set initial active states from defaults
function syncTweakUI() {
  document.querySelectorAll(`[data-tweak="autoplay"]`).forEach(b => b.classList.toggle('is-active', b.dataset.value === state.autoplay));
  document.querySelectorAll(`[data-tweak="transition"]`).forEach(b => b.classList.toggle('is-active', b.dataset.value === state.transition));
  document.querySelectorAll(`[data-tweak="magenta"]`).forEach(b => b.classList.toggle('is-active', b.dataset.value === state.magenta));
  document.documentElement.style.setProperty('--m-magenta', state.magenta);
  applyTransition(state.transition);
}
syncTweakUI();
