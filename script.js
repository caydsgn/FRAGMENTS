/* ============================================
   LIMINAL — Main Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── PARTICLES ──────────────────────────────
  const particlesContainer = document.getElementById('hero-particles');
  if (particlesContainer) {
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (6 + Math.random() * 10) + 's';
      particle.style.animationDelay = (Math.random() * 8) + 's';
      particle.style.width = (1 + Math.random() * 2.5) + 'px';
      particle.style.height = particle.style.width;
      particle.style.opacity = 0;

      // Random color for some particles
      const colors = ['var(--clr-red)', 'var(--clr-blue)', 'var(--clr-cyan)'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];

      particlesContainer.appendChild(particle);
    }
  }

  // ── HEADER VISIBILITY ──────────────────────
  const header = document.getElementById('header');
  const hero = document.getElementById('hero');

  if (header && hero) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          header.classList.remove('visible');
        } else {
          header.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    heroObserver.observe(hero);

    // Scrolled style
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  } else if (header) {
    // Sub-pages: always show header
    header.classList.add('visible', 'scrolled');
  }

  // ── SCROLL INDICATOR ───────────────────────
  const scrollIndicator = document.getElementById('scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const sinopsis = document.getElementById('sinopsis');
      if (sinopsis) {
        sinopsis.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ── MOBILE HAMBURGER ───────────────────────
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    // Close on link click
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }

  // ── REVEAL ON SCROLL ───────────────────────
  const reveals = document.querySelectorAll('.reveal');

  if (reveals.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => revealObserver.observe(el));
  }

  // ── CAROUSEL (fade mode) ─────────────────────
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');

  if (track && prevBtn && nextBtn && dotsContainer) {
    const slides = track.querySelectorAll('.carousel__slide');
    const dots = dotsContainer.querySelectorAll('.carousel__dot');
    let current = 0;
    const total = slides.length;
    let autoplayInterval;
    let isTransitioning = false;

    function goTo(index) {
      if (isTransitioning) return;
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      if (index === current) return;

      isTransitioning = true;

      // Remove active from old slide
      slides[current].classList.remove('active');

      current = index;

      // Add active to new slide (image fades in, text follows via CSS delay)
      slides[current].classList.add('active');

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });

      // Unlock after transition completes
      setTimeout(() => {
        isTransitioning = false;
      }, 900);
    }

    prevBtn.addEventListener('click', () => {
      goTo(current - 1);
      resetAutoplay();
    });

    nextBtn.addEventListener('click', () => {
      goTo(current + 1);
      resetAutoplay();
    });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.index));
        resetAutoplay();
      });
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(current + 1);
        else goTo(current - 1);
        resetAutoplay();
      }
    }, { passive: true });

    // Hover parallax movement on active image
    track.addEventListener('mousemove', (e) => {
      const activeSlide = slides[current];
      if (!activeSlide) return;
      const imageLayer = activeSlide.querySelector('.carousel__image-layer');
      if (!imageLayer) return;

      const rect = track.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;  // -1 to 1
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      const moveX = x * 12;  // px of movement
      const moveY = y * 8;

      const placeholder = imageLayer.querySelector('.carousel__image-placeholder');
      const img = imageLayer.querySelector('img');
      const target = img || placeholder;
      if (target) {
        target.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.04)`;
      }
    });

    track.addEventListener('mouseleave', () => {
      const activeSlide = slides[current];
      if (!activeSlide) return;
      const imageLayer = activeSlide.querySelector('.carousel__image-layer');
      if (!imageLayer) return;
      const placeholder = imageLayer.querySelector('.carousel__image-placeholder');
      const img = imageLayer.querySelector('img');
      const target = img || placeholder;
      if (target) {
        target.style.transform = '';
      }
    });

    // Autoplay
    function startAutoplay() {
      autoplayInterval = setInterval(() => goTo(current + 1), 6000);
    }

    function resetAutoplay() {
      clearInterval(autoplayInterval);
      startAutoplay();
    }

    startAutoplay();

    // Keyboard nav
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { goTo(current - 1); resetAutoplay(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); resetAutoplay(); }
    });
  }

  // ── SMOOTH SCROLL FOR NAV LINKS ────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── PARALLAX HERO (subtle) ─────────────────
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        const content = document.querySelector('.hero__content');
        if (content) {
          content.style.transform = `translateY(${scrolled * 0.3}px)`;
          content.style.opacity = 1 - (scrolled / window.innerHeight);
        }
      }
    }, { passive: true });
  }

  // ── CUSTOM INTERACTIVE CURSOR ─────────────────
  // Safety check: skip custom cursor if the user is on a touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
  
  if (!isTouchDevice) {
    // 1. Inject cursor elements dynamically
    const cursorRing = document.createElement('div');
    cursorRing.id = 'custom-cursor';
    cursorRing.className = 'custom-cursor';
    
    const cursorDot = document.createElement('div');
    cursorDot.id = 'custom-cursor-dot';
    cursorDot.className = 'custom-cursor-dot';
    
    document.body.appendChild(cursorRing);
    document.body.appendChild(cursorDot);
    
    // 2. Mouse position tracking variables
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isCursorVisible = false;
    
    // 3. Update mouse coordinates
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Make visible upon first movement
      if (!isCursorVisible) {
        cursorRing.style.opacity = '1';
        cursorDot.style.opacity = '1';
        isCursorVisible = true;
      }
      
      // The tiny precision dot follows mouse instantly for perfect responsiveness
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }, { passive: true });
    
    // Hide cursor when mouse leaves viewport
    document.addEventListener('mouseleave', () => {
      cursorRing.style.opacity = '0';
      cursorDot.style.opacity = '0';
      isCursorVisible = false;
    });
    
    document.addEventListener('mouseenter', () => {
      cursorRing.style.opacity = '1';
      cursorDot.style.opacity = '1';
      isCursorVisible = true;
    });
    
    // 4. Smooth lerp animation loop for the outer crosshair ring (inertia)
    function renderCursor() {
      const lerp = 0.15; // Smooth inertia factor
      ringX += (mouseX - ringX) * lerp;
      ringY += (mouseY - ringY) * lerp;
      
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
    
    // 5. Robust Event Delegation for Interactive Hover States
    const hoverSelector = 'a, button, [role="button"], .concept-card, .carousel__btn, .carousel__dot, .gallery-item, .gameplay__play-btn, .header__hamburger, #hamburger';
    
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(hoverSelector);
      if (target) {
        cursorRing.classList.add('custom-cursor--active');
        cursorDot.classList.add('custom-cursor-dot--active');
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(hoverSelector);
      if (target) {
        cursorRing.classList.remove('custom-cursor--active');
        cursorDot.classList.remove('custom-cursor-dot--active');
      }
    });
  }

});


// Patch: add drift var to particles
document.querySelectorAll('.particle').forEach(p => {
  p.style.setProperty('--drift', (Math.random() * 60 - 30).toFixed(0));
});

/* ============================================
   FOREGROUND PARALLAX LAYERS
   ============================================
   Elementos .fg-layer que flotan en primer
   plano y se desplazan al hacer scroll.

   CÓMO USAR en HTML (antes del </body>):

   <div class="fg-layer fg-layer--placeholder"
        data-speed="0.4"
        data-x="6vw"
        data-y="30vh"
        data-size="300px"
        data-opacity="0.55"
        data-blend="screen"
        data-label="Nombre del efecto">
     <!-- <img src="img/efecto.png" alt=""> -->
   </div>

   data-speed:
     0   = no se mueve (pegado a la página)
     0.5 = flota lento, hacia abajo con el scroll
    -0.3 = sube al bajar la página (efecto más marcado)
     1.5 = baja rápido, pasa por delante de todo
   data-x:      posición izquierda. Ej: "6vw", "70%"
   data-y:      posición vertical inicial. Ej: "20vh", "800px"
   data-size:   anchura. Ej: "300px", "25vw"
   data-opacity: 0 a 1. Ej: "0.6"
   data-blend:  mix-blend-mode. "screen" elimina fondos negros.
                Opciones: screen | lighten | overlay | normal
   data-label:  texto del placeholder (solo visual, sin imagen)
   ============================================ */

(function initFgLayers() {
  const layers = document.querySelectorAll('.fg-layer');
  if (!layers.length) return;

  layers.forEach((el, i) => {
    const size    = el.dataset.size    || '280px';
    const x       = el.dataset.x      || '5vw';
    const blend   = el.dataset.blend  || 'screen';
    const opacity = parseFloat(el.dataset.opacity || '0.5');
    const y       = el.dataset.y      || '20vh';

    el.style.width        = size;
    el.style.left         = x;
    el.style.top          = y;
    el.style.mixBlendMode = blend;

    // Fade in escalonado
    setTimeout(() => {
      el.classList.add('fg-layer--visible');
      el.style.opacity = opacity;
    }, 400 + i * 150);
  });

  function tick() {
    const scrollY = window.scrollY;
    layers.forEach(el => {
      const speed = parseFloat(el.dataset.speed || '0.5');
      el.style.transform = `translateY(${(scrollY * speed).toFixed(2)}px)`;
    });
  }

  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

/* ============================================
   BACKGROUND PARALLAX LAYERS
   Las capas .bg-parallax-layer se mueven a
   diferentes velocidades según data-speed,
   creando profundidad en el fondo.
   ============================================ */
(function initBgParallax() {
  const bgLayers = document.querySelectorAll('.bg-parallax-layer');
  if (!bgLayers.length) return;

  function tickBg() {
    const scrollY = window.scrollY;
    bgLayers.forEach(el => {
      const speed = parseFloat(el.dataset.speed || '0.08');
      el.style.transform = `translateY(${(scrollY * speed).toFixed(2)}px)`;
    });
  }

  window.addEventListener('scroll', tickBg, { passive: true });
  tickBg();
})();

/* ============================================
   GLITCH JS — efectos adicionales en scroll
   Activa glitch en títulos al hacer scroll
   rápido y aplica glitch aleatorio al bg.
   ============================================ */
(function initScrollGlitch() {
  let lastScrollY = 0;
  let glitchTimeout;

  // Elementos que reciben glitch class temporal al scroll rápido
  const glitchTargets = document.querySelectorAll(
    '.section__title, .hero__title, .subpage-hero .section__title'
  );

  // Capa de glitch de fondo
  const bgGlitchLayer = document.querySelector('.bg-parallax-layer--glitch');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const delta = Math.abs(scrollY - lastScrollY);
    lastScrollY = scrollY;

    // Si el scroll es rápido (> 30px por frame), dispara glitch visual
    if (delta > 30) {
      clearTimeout(glitchTimeout);

      // Añade clase de glitch al bg
      if (bgGlitchLayer) {
        bgGlitchLayer.style.opacity = '1';
        bgGlitchLayer.style.transform = `translateX(${(Math.random() * 6 - 3).toFixed(1)}px)`;
      }

      // Glitch en títulos visibles
      glitchTargets.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top > -100 && rect.bottom < window.innerHeight + 100) {
          el.classList.add('glitch-flicker--hard');
        }
      });

      glitchTimeout = setTimeout(() => {
        if (bgGlitchLayer) {
          bgGlitchLayer.style.opacity = '0';
          bgGlitchLayer.style.transform = '';
        }
        glitchTargets.forEach(el => el.classList.remove('glitch-flicker--hard'));
      }, 120);
    }
  }, { passive: true });

  // Glitch espontáneo aleatorio cada 8–20s en el ambient-bg
  function randomBgGlitch() {
    const delay = 8000 + Math.random() * 12000;
    setTimeout(() => {
      const ambientBg = document.querySelector('.ambient-bg');
      if (ambientBg) {
        ambientBg.style.transition = 'transform 0.05s steps(1)';
        ambientBg.style.transform = `translateX(${(Math.random() * 8 - 4).toFixed(1)}px) scaleY(1.002)`;
        setTimeout(() => {
          ambientBg.style.transform = `translateX(${(Math.random() * -4).toFixed(1)}px)`;
          setTimeout(() => {
            ambientBg.style.transform = '';
            ambientBg.style.transition = '';
          }, 60);
        }, 50);
      }
      randomBgGlitch();
    }, delay);
  }
  randomBgGlitch();
})();
