/* ═══════════════════════════════════════════════════════════════
   MAKKETE — Brand Studio JS
═══════════════════════════════════════════════════════════════ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ── 02 Manifesto reveal ── */
  const lines = $$('.manifesto__line');
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('is-in');
    });
  }, { threshold: 0.35 });
  lines.forEach(l => io.observe(l));

  /* ── 03 Palette swatch burst (canvas) ── */
  const colorMap = {
    magenta: '#FF00A8', cyan: '#00E5FF', lime: '#C6FF00',
    yellow: '#FFD600', violet: '#7C3AED',
    ink: '#FAFAF7', paper: '#0B0B0F'
  };
  $$('.bs-swatch[data-burst]').forEach(sw => {
    const canvas = sw.querySelector('.bs-swatch__canvas');
    if (!canvas) return;
    sw.addEventListener('click', () => {
      sw.classList.add('is-burst');
      burstCanvas(canvas, colorMap[sw.dataset.burst] || '#FF00A8');
      setTimeout(() => sw.classList.remove('is-burst'), 1600);
    });
  });
  function burstCanvas(canvas, color) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = r.width, h = r.height;
    const particles = [];
    for (let i = 0; i < 80; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 4;
      particles.push({
        x: w / 2, y: h / 2,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: 1 + Math.random() * 3, life: 1
      });
    }
    let t = 0;
    function frame() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.04;
        p.life -= 0.012;
        if (p.life > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      t++;
      if (t < 100) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, w, h);
    }
    frame();
  }

  /* ── 05 Mood board (masonry placeholders) ── */
  const moods = [
    { tag: 'color · festival', cap: 'Polvo Holi · India', h: 340, g: 'linear-gradient(135deg,#FF00A8,#FFD600)' },
    { tag: 'editorial · fashion', cap: 'Issey Miyake SS24', h: 460, g: 'linear-gradient(135deg,#0B0B0F,#7C3AED)' },
    { tag: 'retail · experiencia', cap: 'Glossier You NY', h: 280, g: 'linear-gradient(135deg,#FFD1E0,#FF00A8)' },
    { tag: 'arquitectura · brutalismo', cap: 'Barbican Centre', h: 380, g: 'linear-gradient(135deg,#3A3A45,#0B0B0F)' },
    { tag: 'packaging · audaz', cap: 'Chobani reissue', h: 320, g: 'linear-gradient(135deg,#C6FF00,#00E5FF)' },
    { tag: 'tipografía · editorial', cap: 'Bloomberg Businessweek', h: 420, g: 'linear-gradient(135deg,#FFD600,#0B0B0F)' },
    { tag: 'movimiento · light', cap: 'Leo Villareal · Cosmos', h: 300, g: 'linear-gradient(135deg,#00E5FF,#7C3AED)' },
    { tag: 'color · campaign', cap: 'Supreme x Louis', h: 360, g: 'linear-gradient(135deg,#FF00A8,#0B0B0F)' },
    { tag: 'identidad · sistema', cap: 'Pentagram · Mastercard', h: 280, g: 'linear-gradient(135deg,#FF6B00,#FFD600)' },
    { tag: 'ambientación · club', cap: 'Berghain · Berlin', h: 480, g: 'linear-gradient(135deg,#0B0B0F,#FF00A8)' },
    { tag: 'editorial · retail', cap: 'Aesop bookstore', h: 340, g: 'linear-gradient(135deg,#D4C9B0,#3A3A45)' },
    { tag: 'tipografía · display', cap: 'Dia Type specimen', h: 300, g: 'linear-gradient(135deg,#FAFAF7,#0B0B0F)' },
    { tag: 'campaña · OOH', cap: 'Oatly billboard', h: 380, g: 'linear-gradient(135deg,#FFD600,#FF00A8)' },
    { tag: 'motion · kinético', cap: 'Panter & Tourron', h: 260, g: 'linear-gradient(135deg,#7C3AED,#00E5FF)' },
    { tag: 'color · evento', cap: 'La Tomatina · Buñol', h: 420, g: 'linear-gradient(135deg,#FF3A3A,#FF00A8)' },
    { tag: 'minimal · producto', cap: 'Teenage Engineering', h: 340, g: 'linear-gradient(135deg,#FAFAF7,#FFD600)' },
    { tag: 'exterior · arquitectura', cap: 'Casa Gilardi · Barragán', h: 380, g: 'linear-gradient(135deg,#FF00A8,#FF6B00)' },
    { tag: 'editorial · print', cap: 'Apartamento Mag', h: 320, g: 'linear-gradient(135deg,#C6FF00,#0B0B0F)' },
    { tag: 'luz · festival', cap: 'Vivid Sydney', h: 300, g: 'linear-gradient(135deg,#7C3AED,#FF00A8)' },
    { tag: 'retail · concept', cap: 'SSENSE Montreal', h: 440, g: 'linear-gradient(135deg,#0B0B0F,#C6FF00)' }
  ];
  const moodHost = $('#mood');
  if (moodHost) {
    moodHost.innerHTML = moods.map(m => `
      <div class="mood__item">
        <div class="mood__placeholder" style="height: ${m.h}px; --ph-grad: ${m.g};">
          <span class="mood__caption">${m.cap}</span>
          <span class="mood__tag"><b>●</b>${m.tag}</span>
        </div>
      </div>
    `).join('');
  }

  /* ── 06 Principles demos ── */
  // P1 contrast
  const pC = $('#pContrast');
  const pCR = $('#pContrastRange');
  if (pC && pCR) {
    const update = () => {
      const v = pCR.value / 100;
      const lightness = Math.round(60 - v * 60);
      pC.style.background = `linear-gradient(90deg, hsl(240 4% ${60 - lightness * 0.3}%), hsl(240 10% ${lightness}%))`;
      const ratio = (v * 17 + 1.5).toFixed(1);
      const grade = ratio > 7 ? 'AAA' : ratio > 4.5 ? 'AA' : 'FAIL';
      pC.dataset.ratio = `${grade} · ${ratio}`;
    };
    pCR.addEventListener('input', update);
    update();
  }

  // P3 color
  $$('.principle__btn[data-color]').forEach(b => {
    b.addEventListener('click', () => {
      $$('.principle__btn[data-color]').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      const pc = $('#pColor');
      pc.classList.remove('is-pastel', 'is-neon');
      pc.classList.add('is-' + b.dataset.color);
    });
  });

  // P4 motion
  $$('.principle__btn[data-motion]').forEach(b => {
    b.addEventListener('click', () => {
      $$('.principle__btn[data-motion]').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      const pm = $('#pMotion');
      pm.classList.remove('is-decorative', 'is-purposeful');
      pm.classList.add('is-' + b.dataset.motion);
      pm.querySelector('.p-motion__caption').textContent =
        b.dataset.motion === 'decorative' ? '↻ moviéndose para llamar la atención' : '→ muestra el resultado final';
    });
  });

  /* ── 07 Mockups (placeholders) ── */
  const mocks = [
    { label: 'Tarjeta · 85×55mm', cap: 'Business card', dark: true },
    { label: 'Exterior · 4x3m', cap: 'Office signage', dark: false },
    { label: 'Tote · 38×42cm', cap: 'Merchandise tote', dark: false },
    { label: 'IG · grid 9', cap: 'Social grid', dark: true },
    { label: 'Evento · 6×3m', cap: 'Stage backdrop', dark: true },
    { label: 'Apparel', cap: 'Hoodie + cap', dark: false },
    { label: 'Packaging', cap: 'Box system', dark: false },
    { label: 'Mobile · landing', cap: 'Mobile site', dark: true }
  ];
  const mockHost = $('#mockups');
  if (mockHost) {
    mockHost.innerHTML = mocks.map(m => `
      <div class="mockup ${m.dark ? 'mockup--dark' : ''}">
        <span class="mockup__label">${m.label}</span>
        <span class="mockup__ph">placeholder</span>
        <span class="mockup__caption">${m.cap}</span>
      </div>
    `).join('');
  }

  /* ── 08 Icons grid ── */
  const icons = [
    { n: 'arrow', svg: '<path d="M5 12h14M13 6l6 6-6 6"/>' },
    { n: 'spark', svg: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2"/>' },
    { n: 'target', svg: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>' },
    { n: 'chart', svg: '<path d="M3 20h18M6 16l4-5 3 3 5-7"/>' },
    { n: 'bolt', svg: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>' },
    { n: 'search', svg: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>' },
    { n: 'brain', svg: '<path d="M9.5 3a3.5 3.5 0 0 0-3.5 3.5v.5a3.5 3.5 0 0 0 0 7v.5a3.5 3.5 0 0 0 7 0M14.5 3a3.5 3.5 0 0 1 3.5 3.5v.5a3.5 3.5 0 0 1 0 7v.5a3.5 3.5 0 0 1-7 0M12 3v18"/>' },
    { n: 'play', svg: '<polygon points="6,4 20,12 6,20"/>' },
    { n: 'orbit', svg: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4"/>' },
    { n: 'grid', svg: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
    { n: 'link', svg: '<path d="M10 13a5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 7l-1 1M14 11a5 5 0 0 1 0 7l-2 2a5 5 0 0 1-7-7l1-1"/>' },
    { n: 'send', svg: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>' },
    { n: 'pulse', svg: '<path d="M3 12h5l3-8 4 16 3-8h5"/>' },
    { n: 'stack', svg: '<polygon points="12 2 3 7 12 12 21 7"/><polyline points="3 12 12 17 21 12"/><polyline points="3 17 12 22 21 17"/>' },
    { n: 'compass', svg: '<circle cx="12" cy="12" r="9"/><polygon points="16 8 10 10 8 16 14 14"/>' },
    { n: 'flask', svg: '<path d="M10 2v6l-5 11a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-11V2M9 2h6"/>' },
    { n: 'cursor', svg: '<path d="m3 3 8 18 2-8 8-2z"/>' },
    { n: 'layers', svg: '<polygon points="12 2 2 8 12 14 22 8"/><polyline points="2 16 12 22 22 16"/>' },
    { n: 'rocket', svg: '<path d="M5 15c-2 4 0 6 4 4M15 5c4-2 6 0 4 4M10 14l-3 3M16 10l-2-2M15 3c3 0 6 3 6 6l-6 9c-1 2-4 2-5 0l-7-7c-2-1-2-4 0-5l9-6c2-1 4 0 3 3"/>' },
    { n: 'eye', svg: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' },
    { n: 'mic', svg: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>' },
    { n: 'cloud', svg: '<path d="M17 18a5 5 0 0 0-1-9.9A7 7 0 0 0 3 10a5 5 0 0 0 2 9.9h12z"/>' },
    { n: 'shield', svg: '<path d="M12 2 3 6v6c0 6 4 10 9 10s9-4 9-10V6l-9-4z"/>' },
    { n: 'clock', svg: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>' }
  ];
  const iconHost = $('#icons');
  if (iconHost) {
    iconHost.innerHTML = icons.map(i => `
      <div class="icon-cell" title="${i.n}">
        <svg viewBox="0 0 24 24">${i.svg}</svg>
        <span class="icon-cell__label">${i.n}</span>
      </div>
    `).join('');
  }

  /* ── 10 CTA canvas — polvo de colores ── */
  const ctaC = $('#ctaCanvas');
  if (ctaC) {
    const ctx = ctaC.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let W, H;
    const parts = [];
    const colors = ['#FF00A8', '#00E5FF', '#C6FF00', '#FFD600', '#7C3AED'];
    function resize() {
      const r = ctaC.getBoundingClientRect();
      W = r.width; H = r.height;
      ctaC.width = W * dpr; ctaC.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn() {
      parts.push({
        x: Math.random() * W,
        y: H + 10,
        r: 1 + Math.random() * 3,
        vy: 0.3 + Math.random() * 0.9,
        vx: (Math.random() - 0.5) * 0.4,
        c: colors[Math.floor(Math.random() * colors.length)],
        a: 0.4 + Math.random() * 0.5
      });
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      if (parts.length < 140 && Math.random() < 0.3) spawn();
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.y -= p.vy; p.x += p.vx;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.fill();
        if (p.y < -10) parts.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }
    resize();
    window.addEventListener('resize', resize);
    tick();
  }
})();
