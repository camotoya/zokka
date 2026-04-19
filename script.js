// ── Mobile nav toggle ──
const toggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
  navLinksEl.classList.toggle('active');
  toggle.classList.toggle('open');
});

// Close menu on link click
navLinksEl.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinksEl.classList.remove('active');
    toggle.classList.remove('open');
  });
});

// ── Scroll fade-up animations ──
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(
  '.service-card, .founder-card, .step, .contact__info, .contact__form'
).forEach(el => {
  el.classList.add('fade-up');
  fadeObserver.observe(el);
});

// ── Nav scroll state ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// ── Active section indicator ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -60% 0px' }
);

sections.forEach(section => sectionObserver.observe(section));

// ── Story scroll storytelling ──
const storyBlocks = document.querySelectorAll('.story__block');
const storyCounter = document.getElementById('storyCounter');

const storyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        if (storyCounter) {
          storyCounter.textContent = entry.target.dataset.step;
        }
      } else {
        entry.target.classList.remove('active');
      }
    });
  },
  { threshold: 0.5 }
);

storyBlocks.forEach(block => storyObserver.observe(block));

// ── Hero word-by-word animation ──
const heroWords = document.querySelectorAll('.anim-word');
heroWords.forEach((word, i) => {
  setTimeout(() => word.classList.add('revealed'), 200 + i * 100);
});

// ── Counter animation ──
const counters = document.querySelectorAll('[data-count]');
let countersDone = false;

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersDone) {
        countersDone = true;
        counters.forEach(el => {
          const target = parseInt(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          const duration = 2000;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(update);
          }
          requestAnimationFrame(update);
        });
      }
    });
  },
  { threshold: 0.3 }
);

const statsEl = document.querySelector('.hero__stats');
if (statsEl) counterObserver.observe(statsEl);


// ── WhatsApp click tracking ──
document.querySelectorAll('.wa-link').forEach((link) => {
  link.addEventListener('click', () => {
    const source = link.dataset.waSource || 'unknown';
    // GA4 + Google Ads conversion
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
    // Meta Pixel
    if (typeof fbq === 'function') {
      fbq('track', 'Contact', {
        contact_method: 'whatsapp',
        source: source,
      });
    }
  });
});

// ── Form handler ──
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbypoW9aBeY-aKSb-SjGulKsM6Dn3jZFfd8ydyZcNRvrG2zcjFFjdHOoG4vmjyDJbco0/exec';

document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Enviando...';
  btn.disabled = true;

  // Obtener cookies de Meta (fbp y fbc)
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : '';
  }

  // Obtener fbclid de la URL (para fbc)
  function getFbc() {
    var stored = getCookie('_fbc');
    if (stored) return stored;
    var params = new URLSearchParams(window.location.search);
    var fbclid = params.get('fbclid');
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
      // Enviar evento de lead a Google Analytics
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          event_category: 'formulario',
          event_label: data.servicio,
          value: 1,
        });
        // Conversion para Google Ads (Registro Formulario)
        gtag('event', 'conversion', {
          send_to: 'AW-18069208452/aE-xCKiw6pwcEIT7iKhD',
        });
      }
      // Enviar evento Lead a Meta Pixel
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
          content_name: data.servicio,
          content_category: 'formulario_contacto',
        });
      }
      btn.textContent = 'Enviado!';
      btn.style.background = 'linear-gradient(135deg, #84cc16 0%, #06b6d4 100%)';
      form.reset();
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    })
    .catch(() => {
      btn.textContent = 'Error, intenta de nuevo';
      btn.style.background = '#ef4444';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    });
});
