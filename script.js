/* ═══════════════════════════════════════════════════════════════
   MAKKETE — Hero + interacciones producción
═══════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════
// NAV SCROLL STATE
// ═══════════════════════════════════════════════════════════════
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

// ═══════════════════════════════════════════════════════════════
// MOBILE NAV TOGGLE
// ═══════════════════════════════════════════════════════════════
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');
if (navToggle && navLinksEl) {
  navToggle.addEventListener('click', () => {
    navLinksEl.classList.toggle('active');
    navToggle.classList.toggle('open');
  });
  navLinksEl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinksEl.classList.remove('active');
      navToggle.classList.remove('open');
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// WORDMARK CANVAS — partículas que reaccionan al mouse
// ═══════════════════════════════════════════════════════════════
const wordCanvas = document.getElementById('wordCanvas');
const wordStage = document.getElementById('wordStage');
if (wordCanvas && wordStage) {
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
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      p.vx += dx * 0.02;
      p.vy += dy * 0.02;

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

  // Pausar canvas cuando el hero no es visible (perf)
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) startWord();
      else stopWord();
    });
  }, { threshold: 0.1 });
  heroObserver.observe(wordStage);
}

// ═══════════════════════════════════════════════════════════════
// AGENT SECTION — demo en vivo (se activa al hacer scroll hasta él)
// ═══════════════════════════════════════════════════════════════
const agentLog = document.getElementById('agentLog');
if (agentLog) {
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

  let agentScenarioIdx = 0;
  let agentTimer = null;
  let agentStarted = false;

  function agentLine(html, cls = '') {
    const d = document.createElement('div');
    d.className = 'agent__line ' + cls;
    d.innerHTML = html;
    agentLog.appendChild(d);
    requestAnimationFrame(() => d.classList.add('is-in'));
    return d;
  }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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

  // Activar solo cuando el usuario llega a la sección (perf + UX)
  const agentObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !agentStarted) {
        agentStarted = true;
        startAgentCycle();
      }
    });
  }, { threshold: 0.25 });
  agentObserver.observe(agentLog);
}

// ═══════════════════════════════════════════════════════════════
// STORY SECTION — scroll counter (01 / 04)
// ═══════════════════════════════════════════════════════════════
const storyBlocks = document.querySelectorAll('.story__block');
const storyCounter = document.getElementById('storyCounter');
if (storyBlocks.length && storyCounter) {
  const storyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          storyCounter.textContent = entry.target.dataset.step;
        } else {
          entry.target.classList.remove('active');
        }
      });
    },
    { threshold: 0.5 }
  );
  storyBlocks.forEach(b => storyObserver.observe(b));
}

// ═══════════════════════════════════════════════════════════════
// FADE-UP OBSERVER — cards, steps, contact
// ═══════════════════════════════════════════════════════════════
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(
  '.founder-card, .step, .contact__info, .contact__form, .pillar, .funnel__item, .faq__item'
).forEach(el => {
  el.classList.add('fade-up');
  fadeObserver.observe(el);
});

// ═══════════════════════════════════════════════════════════════
// FORM HANDLER — envía a Apps Script + dispara GA4/Ads/Meta
// ═══════════════════════════════════════════════════════════════
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbypoW9aBeY-aKSb-SjGulKsM6Dn3jZFfd8ydyZcNRvrG2zcjFFjdHOoG4vmjyDJbco0/exec';
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const btnSpan = btn.querySelector('span') || btn;
    const originalText = btnSpan.textContent;

    btnSpan.textContent = 'Enviando...';
    btn.disabled = true;

    function getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : '';
    }
    function getFbc() {
      const stored = getCookie('_fbc');
      if (stored) return stored;
      const params = new URLSearchParams(window.location.search);
      const fbclid = params.get('fbclid');
      if (fbclid) return 'fb.1.' + Date.now() + '.' + fbclid;
      return '';
    }

    const data = {
      nombre: form.querySelector('input[name="nombre"]').value,
      email: form.querySelector('input[name="email"]').value,
      telefono: form.querySelector('input[name="telefono"]').value,
      empresa: form.querySelector('input[name="empresa"]').value,
      servicio: form.querySelector('select[name="servicio"]').value,
      mensaje: form.querySelector('textarea[name="mensaje"]').value,
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      fbp: getCookie('_fbp'),
      fbc: getFbc(),
    };

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(() => {
        if (typeof gtag === 'function') {
          gtag('event', 'generate_lead', {
            event_category: 'formulario',
            event_label: data.servicio,
            value: 1,
          });
          gtag('event', 'conversion', {
            send_to: 'AW-18069208452/aE-xCKiw6pwcEIT7iKhD',
          });
        }
        if (typeof fbq === 'function') {
          fbq('track', 'Lead', {
            content_name: data.servicio,
            content_category: 'formulario_contacto',
          });
        }
        btnSpan.textContent = '¡Enviado!';
        btn.style.background = 'var(--m-lime)';
        btn.style.color = 'var(--ink)';
        form.reset();
        setTimeout(() => {
          btnSpan.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
        }, 3000);
      })
      .catch(() => {
        btnSpan.textContent = 'Error, intenta de nuevo';
        btn.style.background = '#ef4444';
        setTimeout(() => {
          btnSpan.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      });
  });
}

// ═══════════════════════════════════════════════════════════════
// WHATSAPP CLICK TRACKING — floating + footer
// ═══════════════════════════════════════════════════════════════
document.querySelectorAll('.wa-link').forEach((link) => {
  link.addEventListener('click', () => {
    const source = link.dataset.waSource || 'unknown';
    if (typeof gtag === 'function') {
      gtag('event', 'whatsapp_click', {
        event_category: 'contacto',
        event_label: source,
        value: 1,
      });
      gtag('event', 'conversion', {
        send_to: 'AW-18069208452/IO_iCJGakp8cEIT7iKhD',
      });
    }
    if (typeof fbq === 'function') {
      fbq('track', 'Contact', {
        contact_method: 'whatsapp',
        source: source,
      });
    }
  });
});
