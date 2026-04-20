/* ═══════════════════════════════════════════════════════════════
   MAKKETE — Services: switcher + 3 direcciones
═══════════════════════════════════════════════════════════════ */

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ─────────── Switcher A/B/C ─────────── */
  const tabs = $$('.services-switch__tab');
  const dirs = $$('.services-dir');
  function setDir(key) {
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.dir === key));
    dirs.forEach(d => d.classList.toggle('is-active', d.dataset.dir === key));
    if (key === 'B') setTimeout(drawFunnel, 50);
  }
  tabs.forEach(t => t.addEventListener('click', () => setDir(t.dataset.dir)));

  /* ─────────── DIR A — Pilares (click-to-expand) ─────────── */
  $$('.pillar').forEach((p, i) => {
    p.addEventListener('click', (e) => {
      // ignore if click on a service-mini
      if (e.target.closest('.service-mini')) return;
      const open = p.classList.contains('is-open');
      $$('.pillar').forEach(x => x.classList.remove('is-open'));
      if (!open) p.classList.add('is-open');
    });
    // Open first by default
    if (i === 0) p.classList.add('is-open');
  });

  /* ─────────── DIR B — Funnel canvas + list ─────────── */
  const canvas = $('#funnelCanvas');
  const funnelItems = $$('.funnel__item');
  const funnelName = $('#funnelName');
  const funnelDesc = $('#funnelDesc');
  const funnelBot = $('#funnelBot');

  let fCtx = null, fW = 0, fH = 0, fDpr = 1;
  let particles = [];
  let activeStep = 0; // 0 = bottom (entry), higher = up

  function setupFunnel() {
    if (!canvas) return;
    fCtx = canvas.getContext('2d');
    fDpr = window.devicePixelRatio || 1;
    resizeFunnel();
    // particles
    particles = [];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * fW,
        y: fH + Math.random() * fH,
        r: 1 + Math.random() * 2.2,
        v: 0.3 + Math.random() * 0.9,
        hue: Math.random() < 0.6 ? 'm' : (Math.random() < 0.5 ? 'c' : 'l'),
        alpha: 0.5 + Math.random() * 0.4
      });
    }
    drawFunnel();
    tickFunnel();
  }
  function resizeFunnel() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    fW = rect.width; fH = rect.height;
    canvas.width = fW * fDpr; canvas.height = fH * fDpr;
    fCtx.setTransform(fDpr, 0, 0, fDpr, 0, 0);
  }
  function funnelShape(ctx) {
    // Inverted triangle (narrow at bottom, wide at top)
    ctx.beginPath();
    const pad = 20;
    ctx.moveTo(pad, pad); // top-left
    ctx.lineTo(fW - pad, pad); // top-right
    ctx.lineTo(fW * 0.62, fH - pad); // bottom-right
    ctx.lineTo(fW * 0.38, fH - pad); // bottom-left
    ctx.closePath();
  }
  function stepLineY(idx, total) {
    // bottom = idx 0, top = idx total-1
    const pad = 20;
    const usable = fH - pad * 2;
    return fH - pad - (idx / (total - 1)) * usable;
  }
  function drawFunnel() {
    if (!fCtx) return;
    fCtx.clearRect(0, 0, fW, fH);
    // Background gradient inside shape
    fCtx.save();
    funnelShape(fCtx);
    fCtx.clip();
    const g = fCtx.createLinearGradient(0, fH, 0, 0);
    g.addColorStop(0, 'rgba(255,255,255,0.02)');
    g.addColorStop(1, 'rgba(255,0,168,0.08)');
    fCtx.fillStyle = g;
    fCtx.fillRect(0, 0, fW, fH);
    // Horizontal step lines
    const total = funnelItems.length;
    for (let i = 0; i < total; i++) {
      const y = stepLineY(i, total);
      fCtx.beginPath();
      fCtx.moveTo(0, y);
      fCtx.lineTo(fW, y);
      fCtx.strokeStyle = i === activeStep ? 'rgba(255,0,168,0.5)' : 'rgba(255,255,255,0.05)';
      fCtx.lineWidth = i === activeStep ? 1.5 : 1;
      fCtx.stroke();
    }
    // particles
    particles.forEach(p => {
      const color = p.hue === 'm' ? `rgba(255,0,168,${p.alpha})`
                  : p.hue === 'c' ? `rgba(0,229,255,${p.alpha})`
                  : `rgba(198,255,0,${p.alpha})`;
      fCtx.beginPath();
      fCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      fCtx.fillStyle = color;
      fCtx.fill();
    });
    // Funnel outline
    fCtx.restore();
    funnelShape(fCtx);
    fCtx.strokeStyle = 'rgba(255,255,255,0.12)';
    fCtx.lineWidth = 1;
    fCtx.stroke();
  }
  function tickFunnel() {
    if (!fCtx) return;
    particles.forEach(p => {
      p.y -= p.v;
      // horizontal drift to stay in funnel
      const t = 1 - (p.y / fH);
      const cx = fW / 2;
      const halfW = (fW * 0.5 - 20) - t * (fW * 0.12);
      if (p.x < cx - halfW) p.x = cx - halfW + Math.random() * 2;
      if (p.x > cx + halfW) p.x = cx + halfW - Math.random() * 2;
      if (p.y < -10) {
        p.y = fH + Math.random() * 20;
        p.x = fW * 0.42 + Math.random() * fW * 0.16;
      }
    });
    drawFunnel();
    requestAnimationFrame(tickFunnel);
  }

  funnelItems.forEach((it, i) => {
    it.addEventListener('mouseenter', () => activateFunnelItem(it));
    it.addEventListener('click', () => activateFunnelItem(it));
  });
  function activateFunnelItem(it) {
    funnelItems.forEach(x => x.classList.remove('is-active'));
    it.classList.add('is-active');
    activeStep = funnelItems.length - 1 - funnelItems.indexOf(it);
    funnelName.textContent = it.querySelector('.funnel__item-name').textContent;
    funnelDesc.textContent = it.dataset.desc || '';
    funnelBot.textContent = it.dataset.svc === 'entry'
      ? 'entrada · tu marca hoy'
      : `capa ${String(activeStep + 1).padStart(2, '0')} · ${it.querySelector('.funnel__item-name').textContent.toLowerCase()}`;
  }
  window.addEventListener('resize', () => { if (fCtx) { resizeFunnel(); } });

  /* Initialize funnel when DIR B first shown */
  let funnelReady = false;
  const funnelObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !funnelReady) {
        funnelReady = true;
        setupFunnel();
      }
    });
  }, { threshold: 0.1 });
  const funnelHost = $('.services-dir[data-dir="B"]');
  if (funnelHost) funnelObserver.observe(funnelHost);

  /* ─────────── DIR C — Terminal rows ─────────── */
  const services = [
    { n: '01', name: 'Consultoría Estratégica',   time: '1 sesión',    kpi: 'Mapa 90d',       fill: 65, invest: '$5k+',   desc: 'Auditoría data-first de tu marca y un plan de ejecución trimestral con KPIs accionables. Es la línea de salida honesta.', stack: ['Mixpanel','Metabase','Notion'] },
    { n: '02', name: 'Growth Hacking',            time: '4–8 sem',     kpi: 'Exp / semana',   fill: 72, invest: '$20k+',  desc: 'Hipótesis, test, aprendizaje. Un motor de experimentación continuo sobre adquisición, activación y retención.', stack: ['GA4','Amplitude','Hotjar'] },
    { n: '03', name: 'Branding',                  time: '3 sem',       kpi: 'Sistema 360°',   fill: 90, invest: '$30k+',  desc: 'Naming, sistema visual, guía de marca y aplicaciones. Una identidad diseñada para destacar y escalar en cualquier canal.', stack: ['Figma','Adobe','Rive'] },
    { n: '04', name: 'Contenido Audiovisual',     time: 'continuo',    kpi: '+4x reach',      fill: 78, invest: '$8k+ / mes', desc: 'Producción ágil de video, foto y piezas digitales diseñadas para el algoritmo y para la marca, con calendario editorial.', stack: ['Premiere','After FX','CapCut'] },
    { n: '05', name: 'Redes Sociales',            time: 'continuo',    kpi: '+3x engagement', fill: 82, invest: '$10k+ / mes', desc: 'Estrategia + producción + community. Tu marca activa 365 días con voz consistente y métricas que te importan.', stack: ['Meta','TikTok','LinkedIn'] },
    { n: '06', name: 'Landing Pages',             time: '2 sem',       kpi: '2x conversión',  fill: 68, invest: '$15k+',  desc: 'Landings diseñadas para convertir: copy data-tested, diseño performante, A/B integrado con tu CRM.', stack: ['Webflow','Next.js','GTM'] },
    { n: '07', name: 'SEO + GEO',                 time: '3–6 meses',   kpi: 'Top 3 · IA',     fill: 75, invest: '$12k+ / mes', desc: 'Posicionamos en Google y en motores de IA (ChatGPT, Perplexity, Gemini). Tu marca aparece cuando tu cliente pregunta.', stack: ['Semrush','Ahrefs','ChatGPT'] },
    { n: '08', name: 'Paid Media',                time: '1 sem · setup', kpi: '3x ROAS',      fill: 88, invest: '$15k+ / mes', desc: 'Meta, Google, TikTok. Estructuras de campaña optimizadas por IA sobre tu historial de conversión con atribución unificada.', stack: ['Meta Ads','Google Ads','Triple Whale'] }
  ];
  const termRows = $('#terminalRows');
  if (termRows) {
    termRows.innerHTML = services.map((s, i) => `
      <div class="terminal__row" data-i="${i}" style="--fill: ${s.fill}%;">
        <span class="terminal__chev">▸</span>
        <span class="terminal__service">${s.name}</span>
        <span class="terminal__time">${s.time}</span>
        <span class="terminal__kpi">${s.kpi}</span>
        <span class="terminal__invest">${s.invest}</span>
        <span class="terminal__icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
        <div class="terminal__detail">
          <div class="terminal__detail-inner">
            <div>
              <p class="terminal__detail-text">${s.desc}</p>
              <div class="terminal__detail-stack">
                ${s.stack.map(t => `<span class="terminal__detail-chip">${t}</span>`).join('')}
              </div>
            </div>
            <div class="terminal__detail-viz">
              <span class="terminal__detail-viz-label">${s.kpi}</span>
              <span class="terminal__detail-viz-num">${s.fill}<span style="font-size:0.6em;color:var(--ink-40);">%</span></span>
              <div class="terminal__detail-viz-bar"><span class="terminal__detail-viz-bar-fill"></span></div>
              <span class="terminal__detail-viz-label" style="margin-top:4px;">inversión típica · ${s.invest}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    const rows = $$('.terminal__row', termRows);
    rows.forEach(r => {
      r.addEventListener('click', () => {
        const open = r.classList.contains('is-open');
        rows.forEach(x => x.classList.remove('is-open'));
        if (!open) r.classList.add('is-open');
      });
    });
    // Open first by default
    rows[0]?.classList.add('is-open');
  }

  /* ─────────── Terminal live clock ─────────── */
  const clock = $('#terminalClock');
  function tickClock() {
    if (!clock) return;
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  if (clock) { tickClock(); setInterval(tickClock, 1000); }
})();
