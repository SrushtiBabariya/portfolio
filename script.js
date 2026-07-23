/**
 * Portfolio – script.js
 * Features:
 *  1. Navbar: scroll-shadow + active-link highlight + mobile toggle
 *  2. Smooth scroll for anchor links (fallback for browsers without CSS support)
 *  3. Scroll-reveal animations (IntersectionObserver)
 *  4. Animated stat counters
 *  5. Skill-bar fill animation triggered on scroll
 *  6. Project filter buttons
 *  7. Contact form validation + simulated submission
 *  8. Back-to-top button
 *  9. Footer year
 */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/**
 * Throttle a function so it fires at most once per `limit` ms.
 * Used on scroll/resize listeners to keep them cheap.
 */
function throttle(fn, limit = 100) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Ease an integer counter from 0 to `target` over ~1.2 s.
 */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1200;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* ============================================================
   1. NAVBAR
   ============================================================ */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const links    = navLinks ? navLinks.querySelectorAll('a') : [];

  if (!navbar) return;

  /* Scroll shadow */
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveLink();
    toggleBackToTop();
  }
  window.addEventListener('scroll', throttle(onScroll, 80), { passive: true });

  /* Mobile hamburger toggle */
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    /* Close menu when a link is clicked */
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    /* Close menu when clicking outside */
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Active link highlight based on scroll position */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + navbar.offsetHeight + 60;
    let current = '';

    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop) current = sec.id;
    });

    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  updateActiveLink(); // run once on load
})();

/* ============================================================
   2. SMOOTH SCROLL (CSS fallback)
   ============================================================ */
(function initSmoothScroll() {
  // If the browser doesn't support scroll-behavior: smooth natively via CSS,
  // this JS fallback kicks in.
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      if (prefersReduced) {
        target.scrollIntoView();
        target.focus({ preventScroll: true });
        return;
      }

      const navH = document.getElementById('navbar')?.offsetHeight ?? 64;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   3. ADD REVEAL CLASSES DYNAMICALLY — runs BEFORE the observer
   so all elements carry their class when the observer scans.
   ============================================================ */
(function addRevealClasses() {
  const sectionMap = [
    { selector: '.about-text',    cls: 'reveal-left'  },
    { selector: '.about-stats',   cls: 'reveal-right' },
    { selector: '.skill-group',   cls: 'reveal'       },
    { selector: '.project-card',  cls: 'reveal'       },
    { selector: '.timeline-item', cls: 'reveal'       },
    { selector: '.cert-item',     cls: 'reveal'       },
    { selector: '.contact-info',  cls: 'reveal-left'  },
    { selector: '.contact-form',  cls: 'reveal-right' },
    { selector: '.stat-card',     cls: 'reveal'       },
  ];

  sectionMap.forEach(({ selector, cls }) => {
    document.querySelectorAll(selector).forEach(el => el.classList.add(cls));
  });

  // Add stagger to grid containers
  document.querySelectorAll('.projects-grid, .about-stats, .skills-categories')
    .forEach(el => el.classList.add('stagger'));
})();

/* ============================================================
   4. SCROLL-REVEAL  (IntersectionObserver)
   ============================================================ */
(function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    .forEach(el => observer.observe(el));
})();

/* ============================================================
   5. STAT COUNTERS
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  if (!('IntersectionObserver' in window)) {
    counters.forEach(el => { el.textContent = el.dataset.target; });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();

/* ============================================================
   6. SKILL BARS
   ============================================================ */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill[data-width]');
  if (!fills.length) return;

  if (!('IntersectionObserver' in window)) {
    fills.forEach(el => { el.style.width = el.dataset.width + '%'; });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width + '%';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  fills.forEach(el => observer.observe(el));
})();

/* ============================================================
   7. PROJECT FILTER
   ============================================================ */
(function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;

        if (match) {
          // Fade in
          card.classList.remove('hidden');
          // Brief delay so the DOM reflow fires before the opacity transition
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          // Fade out then hide
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            // Only hide if still filtered out (user might have changed filter again)
            if (btn.classList.contains('active') && card.dataset.category !== filter && filter !== 'all') {
              card.classList.add('hidden');
            }
          }, 280);
        }
      });
    });
  });
})();

/* ============================================================
   8. CONTACT FORM
   ============================================================ */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const statusEl   = document.getElementById('formStatus');

  if (!form) return;

  /* --- Validation helpers --- */
  function showError(fieldId, errorId, msg) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field)  field.classList.add('error');
    if (error)  error.textContent = msg;
  }

  function clearError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field)  field.classList.remove('error');
    if (error)  error.textContent = '';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* Inline validation on blur */
  const fields = [
    { id: 'name',    errId: 'nameError',    validate: v => v.trim().length >= 2 ? '' : 'Please enter your name (min 2 characters).' },
    { id: 'email',   errId: 'emailError',   validate: v => isValidEmail(v.trim()) ? '' : 'Please enter a valid email address.' },
    { id: 'subject', errId: 'subjectError', validate: v => v.trim().length >= 3 ? '' : 'Subject must be at least 3 characters.' },
    { id: 'message', errId: 'messageError', validate: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.' },
  ];

  fields.forEach(({ id, errId, validate }) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('blur', () => {
      const msg = validate(el.value);
      if (msg) showError(id, errId, msg);
      else     clearError(id, errId);
    });

    el.addEventListener('input', () => {
      // Clear error as soon as user starts correcting
      if (el.classList.contains('error') && !validate(el.value)) {
        clearError(id, errId);
      }
    });
  });

  /* --- Form submit --- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Full validation pass
    let hasError = false;
    fields.forEach(({ id, errId, validate }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const msg = validate(el.value);
      if (msg) { showError(id, errId, msg); hasError = true; }
      else       clearError(id, errId);
    });

    if (hasError) {
      // Focus first error field for accessibility
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Disable button + show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    try {
      // Simulate an async API call (replace with your actual endpoint)
      await simulateSend({
        name:    document.getElementById('name').value.trim(),
        email:   document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim(),
      });

      statusEl.textContent = '✓ Message sent! I\'ll get back to you within 24 hours.';
      statusEl.classList.add('success');
      form.reset();

    } catch (err) {
      statusEl.textContent = '✗ Something went wrong. Please try emailing me directly.';
      statusEl.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });

  /**
   * Simulated network delay (1.2 s).
   * Replace this with a real fetch() call to your backend / Formspree / EmailJS, etc.
   */
  function simulateSend(data) {
    return new Promise((resolve, reject) => {
      console.log('Form submission data:', data); // for dev inspection
      setTimeout(() => {
        // Randomly fail ~10 % of the time so you can test the error path
        Math.random() < 0.9 ? resolve() : reject(new Error('Simulated network error'));
      }, 1200);
    });
  }
})();

/* ============================================================
   9. BACK-TO-TOP BUTTON
   ============================================================ */
function toggleBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  btn.classList.toggle('visible', window.scrollY > 400);
}

(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Initial state on load
  toggleBackToTop();
})();

/* ============================================================
   10. FOOTER YEAR
   ============================================================ */
(function setFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();


