// ── Mobile nav toggle ──
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
  links.classList.toggle('active');
  toggle.classList.toggle('open');
});

// Close menu on link click
links.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    links.classList.remove('active');
    toggle.classList.remove('open');
  });
});

// ── Scroll animations ──
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(
  '.service-card, .founder-card, .step, .contact__info, .contact__form'
).forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// ── Nav background on scroll ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.style.boxShadow = '0 1px 12px rgba(0,0,0,0.06)';
  } else {
    nav.style.boxShadow = 'none';
  }
});

// ── Form handler ──
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Enviado!';
  btn.style.background = 'linear-gradient(135deg, #84cc16 0%, #06b6d4 100%)';
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});
