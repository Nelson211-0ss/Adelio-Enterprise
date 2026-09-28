// ==========================================================================
// Adelio & Sons Enterprise — Site scripts
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initActiveNav();
  initScrollReveal();
  initBackToTop();
  initFaq();
  initCategoryTabs();
  initContactForm();
  initHeaderShrink();
  initHeroSliders();
});

// ---------- Hero image sliders ----------
function initHeroSliders() {
  document.querySelectorAll('.hero-slider').forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('.slide'));
    if (!slides.length) return;

    const dotsContainer = slider.querySelector('.slider-dots');
    const interval = parseInt(slider.dataset.interval, 10) || 6000;
    let current = slides.findIndex((s) => s.classList.contains('active'));
    if (current === -1) current = 0;
    let timer = null;

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === current) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      });
    }

    function goTo(index) {
      slides[current].classList.remove('active');
      dotsContainer?.children[current]?.classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dotsContainer?.children[current]?.classList.add('active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    slider.querySelector('.slider-arrow.next')?.addEventListener('click', () => { next(); restart(); });
    slider.querySelector('.slider-arrow.prev')?.addEventListener('click', () => { prev(); restart(); });

    function start() {
      if (slides.length < 2) return;
      timer = setInterval(next, interval);
    }
    function stop() { clearInterval(timer); }
    function restart() { stop(); start(); }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    // Swipe between slides on touch screens
    let touchX = null;
    slider.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) < 50) return;
      dx < 0 ? next() : prev();
      restart();
    });

    start();
  });
}

// ---------- Mobile nav toggle ----------
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.setAttribute('aria-expanded', 'false');

  function setOpen(open) {
    toggle.classList.toggle('open', open);
    links.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  // Close the mobile menu if the viewport grows back to desktop width
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

// ---------- Highlight active nav link ----------
function initActiveNav() {
  const segments = window.location.pathname.replace(/index\.html$/, '').split('/').filter(Boolean);
  const current = segments.length ? segments[segments.length - 1] : 'home';
  document.querySelectorAll('.nav-links a[data-page]').forEach((link) => {
    if (link.dataset.page === current) link.classList.add('active');
  });
}

// ---------- Scroll reveal ----------
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
}

// ---------- Back to top ----------
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---------- Header shrink on scroll ----------
function initHeaderShrink() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 20 ? '0 8px 24px rgba(0,0,0,0.35)' : 'none';
  });
}

// ---------- FAQ accordion ----------
function initFaq() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      items.forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// ---------- Product/service category tabs ----------
function initCategoryTabs() {
  const tabs = document.querySelectorAll('.category-tabs button');
  const items = document.querySelectorAll('.product-item');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;

      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      items.forEach((item) => {
        item.classList.toggle('active', category === 'all' || item.dataset.category === category);
      });
    });
  });
}

// ---------- Contact form (front-end only — wire to a backend/email service) ----------
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const status = form.querySelector('.form-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;
    requiredFields.forEach((field) => {
      if (!field.value.trim()) valid = false;
    });

    if (!valid) {
      showStatus(status, 'error', 'Please fill in all required fields.');
      return;
    }

    // NOTE: No backend is wired up yet. Replace this with a fetch() call to
    // your form endpoint (e.g. Formspree, EmailJS, or your own API route).
    showStatus(status, 'success', "Thank you! Your message has been noted. We'll get back to you shortly.");
    form.reset();
  });
}

function showStatus(statusEl, type, message) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `form-status show ${type}`;
}
