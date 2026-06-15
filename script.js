/* ============================================================
   JEFERSON RAFAEL — Personal Trainer
   script.js — Interatividade completa
============================================================ */

/* ============================================================
   1. CURSOR PERSONALIZADO
============================================================ */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot    = document.getElementById('cursorDot');
  if (!cursor || !dot) return;

  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Suavização do cursor principal
  function animateCursor() {
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Expandir cursor em links/botões
  const interactables = document.querySelectorAll('a, button, .cupon-card, .depo-card, .transf-card, .sobre-card');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
  });
})();

/* ============================================================
   2. NAVBAR — scroll state
============================================================ */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!navbar) return;

  // Scroll state
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile menu toggle
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    // Fechar ao clicar em link
    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }
})();

/* ============================================================
   3. HERO CAROUSEL — troca de frases
============================================================ */
(function initCarousel() {
  const items    = document.querySelectorAll('.carousel-item');
  const dotsWrap = document.getElementById('carouselDots');
  const bar      = document.getElementById('progressBar');
  if (!items.length) return;

  const INTERVAL = 3200; // ms por frase
  let current = 0;
  let startTime = null;
  let paused = false;

  // Criar dots
  items.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Frase ' + (i + 1));
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
    if (dotsWrap) dotsWrap.appendChild(dot);
  });

  function getDots() {
    return document.querySelectorAll('.carousel-dot');
  }

  function goTo(index) {
    // Sair do atual
    items[current].classList.remove('active');
    items[current].classList.add('exit');
    getDots()[current]?.classList.remove('active');

    setTimeout(() => {
      items[current].classList.remove('exit');
    }, 600);

    current = index;

    // Entrar no novo
    items[current].classList.add('active');
    getDots()[current]?.classList.add('active');
  }

  function next() {
    goTo((current + 1) % items.length);
  }

  // Barra de progresso
  let rafId;
  function resetTimer() {
    startTime = performance.now();
    if (bar) bar.style.width = '0%';
  }

  function tick(now) {
    if (!startTime) startTime = now;
    if (!paused) {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / INTERVAL) * 100, 100);
      if (bar) bar.style.width = pct + '%';
      if (elapsed >= INTERVAL) {
        next();
        startTime = now;
      }
    }
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);

  // Pausar no hover
  const track = document.querySelector('.hero-carousel');
  if (track) {
    track.addEventListener('mouseenter', () => { paused = true; });
    track.addEventListener('mouseleave', () => { paused = false; startTime = performance.now(); });
  }
})();

/* ============================================================
   4. SCROLL REVEAL
============================================================ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Não desobservar para re-animar se voltar (opcional: observer.unobserve)
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   5. CONTADORES ANIMADOS (seção Sobre)
============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.card-num[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 2000;
      let startTime = null;

      function animate(now) {
        if (!startTime) startTime = now;
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing cubic out
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          el.textContent = target;
        }
      }

      requestAnimationFrame(animate);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ============================================================
   6. COPIAR CUPOM
============================================================ */
function copyCupom(btn, code) {
  // Copiar para clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).catch(() => fallbackCopy(code));
  } else {
    fallbackCopy(code);
  }

  // Feedback visual no botão
  const span = btn.querySelector('span');
  const original = span ? span.textContent : '';
  btn.classList.add('copied');
  if (span) span.textContent = 'Copiado!';
  setTimeout(() => {
    btn.classList.remove('copied');
    if (span) span.textContent = original;
  }, 2000);

  // Toast global
  showToast('Código ' + code + ' copiado!');
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
}

/* ============================================================
   7. TOAST
============================================================ */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg + ' ✓';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ============================================================
   8. SMOOTH SCROLL para anchors
============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 64;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   9. PARALLAX LEVE no hero glow
============================================================ */
(function initParallax() {
  const glow = document.querySelector('.hero-glow');
  if (!glow) return;
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    glow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  }, { passive: true });
})();

/* ============================================================
   10. WHATSAPP — mostrar tooltip ao rolar
============================================================ */
(function initWhatsApp() {
  const btn = document.getElementById('whatsappBtn');
  if (!btn) return;

  // Número configurável — altere aqui
  const WHATSAPP_NUMBER = '555192147753';
  const WHATSAPP_MSG    = encodeURIComponent('Olá, Jeferson! Vi seu site e quero saber mais sobre os teus serviços.');
  btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;

  // Aparecer após scroll
  btn.style.opacity = '0';
  btn.style.transform = 'scale(0.8) translateY(10px)';
  btn.style.transition = 'opacity 0.4s, transform 0.4s';

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1) translateY(0)';
    } else {
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.8) translateY(10px)';
    }
  }, { passive: true });
})();

/* ============================================================
   11. TRANSF CARDS — tilt leve no hover
============================================================ */
(function initTilt() {
  const cards = document.querySelectorAll('.cupon-card, .depo-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ============================================================
   12. LAZY LOAD de imagens (quando adicionadas)
============================================================ */
(function initLazyLoad() {
  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.src = e.target.dataset.src;
        io.unobserve(e.target);
      }
    });
  });
  imgs.forEach(img => io.observe(img));
})();
/* ============================================================
   MODAL CASAL — abre automático ao entrar no site
============================================================ */
(function initModalCasal() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('modalCasal').classList.add('active');
    }, 800);
  });
})();
/* ============================================================
   CARROSSEL DE ACADEMIAS
============================================================ */
(function initCarrosselAcademias() {
  const estados = {};

  function setup(id, total) {
    estados[id] = { atual: 0, total };
  }

  setup('bigboy', 3);
  setup('xteam', 3);

  window.moverCarrossel = function(id, direcao) {
    const e = estados[id];
    e.atual = (e.atual + direcao + e.total) % e.total;
    atualizar(id);
  };

  window.irParaSlide = function(id, index) {
    estados[id].atual = index;
    atualizar(id);
  };

  function atualizar(id) {
    const { atual, total } = estados[id];
    const track   = document.getElementById('track-' + id);
    const dots    = document.querySelectorAll('#dots-' + id + ' .cdot');
    const counter = document.getElementById('counter-' + id);

    if (track)   track.style.transform = `translateX(-${atual * 100}%)`;
    if (counter) counter.textContent = `${atual + 1} / ${total}`;
    dots.forEach((d, i) => d.classList.toggle('active', i === atual));
  }

  // Swipe touch
  document.querySelectorAll('.academia-carrossel').forEach(el => {
    const id = el.dataset.carrossel;
    let startX = 0;

    el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) moverCarrossel(id, diff > 0 ? 1 : -1);
    }, { passive: true });
  });
})();

/* ============================================================
   LOG
============================================================ */
console.log('%c☠ JEFERSON RAFAEL — Personal Trainer ☠', 'color:#e74c3c;font-size:14px;font-weight:bold;');
console.log('%cSite desenvolvido com HTML, CSS e JS puro.', 'color:#888;font-size:11px;');