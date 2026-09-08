/* ============================================================================
   CALLORA PREMIUM ENHANCEMENT — JavaScript
   All runtime enhancements layered on top of the Framer export.
   Executes after DOMContentLoaded to avoid hydration conflicts.
   ============================================================================ */

(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     0. REDUCED-MOTION DETECTION
     ----------------------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* -----------------------------------------------------------------------
     1. INJECT DECORATIVE ELEMENTS (noise, blobs, scroll progress)
     ----------------------------------------------------------------------- */
  function injectDecorations() {
    // Noise overlay
    const noise = document.createElement('div');
    noise.className = 'ce-noise';
    noise.setAttribute('aria-hidden', 'true');
    document.body.appendChild(noise);

    // Animated blobs
    const blobContainer = document.createElement('div');
    blobContainer.className = 'ce-blob-container';
    blobContainer.setAttribute('aria-hidden', 'true');
    ['ce-blob--1', 'ce-blob--2', 'ce-blob--3'].forEach((cls) => {
      const blob = document.createElement('div');
      blob.className = 'ce-blob ' + cls;
      blobContainer.appendChild(blob);
    });
    document.body.appendChild(blobContainer);

    // Scroll progress bar
    const progress = document.createElement('div');
    progress.className = 'ce-scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);

    return progress;
  }

  /* -----------------------------------------------------------------------
     2. SCROLL PROGRESS BAR
     ----------------------------------------------------------------------- */
  function initScrollProgress(progressEl) {
    if (prefersReducedMotion || !progressEl) return;

    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressEl.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* -----------------------------------------------------------------------
     3. GLASSMORPHISM NAVBAR ON SCROLL
     ----------------------------------------------------------------------- */
  function initNavbarScroll() {
    const navContainer = document.querySelector('.framer-16tbhsi-container, .framer-riypkh-container');
    if (!navContainer) return;

    // Find the closest scrollable parent or use the root
    const root = document.querySelector('.framer-4aXHm') || document.body;
    let isScrolled = false;

    function handleScroll() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const shouldBeScrolled = scrollY > 60;

      if (shouldBeScrolled !== isScrolled) {
        isScrolled = shouldBeScrolled;
        if (isScrolled) {
          root.classList.add('navbar-scrolled');
        } else {
          root.classList.remove('navbar-scrolled');
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* -----------------------------------------------------------------------
     4. INTERSECTION OBSERVER — SECTION REVEALS
     ----------------------------------------------------------------------- */
  function initSectionReveals() {
    if (prefersReducedMotion) return;

    // Major sections to reveal
    const sectionSelectors = [
      '#services',
      '#projects',
      '#cta',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ce-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    sectionSelectors.forEach((sel, index) => {
      const el = document.querySelector(sel);
      if (!el) return;

      el.classList.add('ce-reveal');

      // Alternate directions: up, left, right
      const directions = ['ce-reveal--up', 'ce-reveal--left', 'ce-reveal--right'];
      el.classList.add(directions[index % directions.length]);

      observer.observe(el);
    });
  }

  /* -----------------------------------------------------------------------
     5. STAGGERED CARD REVEALS
     ----------------------------------------------------------------------- */
  function initCardReveals() {
    if (prefersReducedMotion) return;

    // Service cards
    const serviceCards = document.querySelectorAll(
      '#services .framer-1y68dgt-container, #services .framer-17hb1rm-container, #services .framer-tqhw79-container'
    );

    // Project cards
    const projectCards = document.querySelectorAll(
      '#projects .framer-xrs5rl-container'
    );

    function revealCards(cards) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('ce-revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
      );

      cards.forEach((card, i) => {
        card.classList.add('ce-reveal', 'ce-reveal--up');
        card.classList.add('ce-stagger-' + Math.min(i + 1, 6));
        observer.observe(card);
      });
    }

    revealCards(serviceCards);
    revealCards(projectCards);
  }

  /* -----------------------------------------------------------------------
     6. MAGNETIC BUTTON EFFECT
     ----------------------------------------------------------------------- */
  function initMagneticButtons() {
    if (prefersReducedMotion) return;

    // Target CTA buttons in the hero area
    const buttons = document.querySelectorAll(
      '.framer-o2fx5o .framer-2Djyo, .framer-gkr2ar-container .framer-ftTJY'
    );

    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Subtle 4px max displacement
        const moveX = x * 0.08;
        const moveY = y * 0.08;

        btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* -----------------------------------------------------------------------
     7. BUTTON RIPPLE EFFECT
     ----------------------------------------------------------------------- */
  function initButtonRipple() {
    if (prefersReducedMotion) return;

    const buttons = document.querySelectorAll('.framer-2Djyo');

    buttons.forEach((btn) => {
      // Ensure the button is positioned for the ripple
      const currentPosition = window.getComputedStyle(btn).position;
      if (currentPosition === 'static') {
        btn.style.position = 'relative';
      }
      btn.style.overflow = 'hidden';

      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ce-ripple';

        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
        ripple.style.top = e.clientY - rect.top - size / 2 + 'px';

        btn.appendChild(ripple);

        ripple.addEventListener('animationend', () => {
          ripple.remove();
        });
      });
    });
  }

  /* -----------------------------------------------------------------------
     8. HERO PARALLAX — subtle mouse-driven image shift
     ----------------------------------------------------------------------- */
  function initHeroParallax() {
    if (prefersReducedMotion) return;

    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    // Find the parallax image inside the hero
    const heroImage = heroSection.querySelector(
      '[data-framer-name="Image Wrapper"] [style*="background-image"]'
    );
    if (!heroImage) return;

    let rafId = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalized -1 to 1
      const x = (e.clientX - rect.left - centerX) / centerX;
      const y = (e.clientY - rect.top - centerY) / centerY;

      // Max 15px displacement
      targetX = x * 15;
      targetY = y * 10;

      if (!rafId) {
        rafId = requestAnimationFrame(animateParallax);
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      if (!rafId) {
        rafId = requestAnimationFrame(animateParallax);
      }
    });

    function animateParallax() {
      // Lerp for smooth follow
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      heroImage.style.transform = `translate(${currentX}px, ${currentY}px)`;

      if (
        Math.abs(targetX - currentX) > 0.1 ||
        Math.abs(targetY - currentY) > 0.1
      ) {
        rafId = requestAnimationFrame(animateParallax);
      } else {
        rafId = null;
      }
    }
  }

  /* -----------------------------------------------------------------------
     9. GSAP TEXT REVEAL — hero section word-by-word stagger
     ----------------------------------------------------------------------- */
  function initGSAPTextReveal() {
    if (prefersReducedMotion) return;
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Services section heading — word-by-word reveal
    // The words are already split into individual spans by Framer
    const serviceHeading = document.querySelector(
      '#services .framer-7swvtp h2'
    );
    if (serviceHeading) {
      const words = serviceHeading.querySelectorAll(
        'span[style*="inline-block"]'
      );

      if (words.length > 0) {
        gsap.fromTo(
          words,
          {
            opacity: 0.001,
            y: 10,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.04,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: serviceHeading,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }

    // CTA heading reveal
    const ctaHeading = document.querySelector('#cta .framer-ohc6vy');
    if (ctaHeading) {
      gsap.fromTo(
        ctaHeading,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaHeading,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }

    // Parallax speed effect on hero image via ScrollTrigger
    const heroImageWrapper = document.querySelector(
      '#hero [data-framer-name="Image Wrapper"]'
    );
    if (heroImageWrapper) {
      gsap.to(heroImageWrapper, {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }
  }

  /* -----------------------------------------------------------------------
     10. LENIS SMOOTH SCROLL ENHANCEMENT
     ----------------------------------------------------------------------- */
  function initLenis() {
    if (prefersReducedMotion) return;
    if (typeof Lenis === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Integrate with GSAP ticker if available
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Intercept anchor links for smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const target = anchor.getAttribute('href');
        if (!target || target === '#') return;

        const targetEl = document.querySelector(target);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { offset: -80 });
        }
      });
    });

    return lenis;
  }

  /* -----------------------------------------------------------------------
     11. LAZY LOAD OFF-SCREEN IMAGES
     ----------------------------------------------------------------------- */
  function initLazyImages() {
    // Add loading="lazy" to images not in the viewport initially
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach((img) => {
      const rect = img.getBoundingClientRect();
      // If below the fold, lazy load
      if (rect.top > window.innerHeight) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  function initFooterEmail() {
    const footerEmail = 'hellocallora.ai@gmail.com';
    const emailLinks = document.querySelectorAll(
      '[data-framer-name="Email"] a[href^="mailto:"]'
    );

    emailLinks.forEach((link) => {
      if (link.textContent.trim() !== footerEmail) {
        link.textContent = footerEmail;
      }
      if (link.getAttribute('href') !== `mailto:${footerEmail}`) {
        link.setAttribute('href', `mailto:${footerEmail}`);
      }
    });
  }

  function observeFooterEmail() {
    const observer = new MutationObserver(initFooterEmail);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  }

  /* -----------------------------------------------------------------------
     12. CURSOR GLOW — subtle glow follows cursor on service cards
     ----------------------------------------------------------------------- */
  function initCursorGlow() {
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.framer-zMINs.framer-bud0sv');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
        card.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(0, 72, 249, 0.04), transparent 60%)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.background = '';
      });
    });
  }

  /* -----------------------------------------------------------------------
     CALLORA NAVBAR LOGO — Ensure logo appears before CALLORA in navbar
     ----------------------------------------------------------------------- */
  function initNavbarLogo() {
    function ensureNavbarLogo() {
      const logoWrappers = document.querySelectorAll('.framer-19f5bx3, [data-framer-name="Logo Wrapper"]');
      logoWrappers.forEach((wrapper) => {
        if (!wrapper.classList.contains('callora-brand')) {
          wrapper.classList.add('callora-brand');
        }
        let logoImg = wrapper.querySelector('.callora-logo');
        if (!logoImg) {
          logoImg = document.createElement('img');
          logoImg.src = 'images/logo.png';
          logoImg.alt = 'Callora Logo';
          logoImg.className = 'callora-logo';
          wrapper.insertBefore(logoImg, wrapper.firstChild);
        }
        const textContainer = wrapper.querySelector('[data-framer-component-type="RichTextContainer"]');
        if (textContainer && !textContainer.classList.contains('brand-text')) {
          textContainer.classList.add('brand-text');
        }
      });
    }

    ensureNavbarLogo();
    setTimeout(ensureNavbarLogo, 50);
    setTimeout(ensureNavbarLogo, 200);
    setTimeout(ensureNavbarLogo, 500);
    setTimeout(ensureNavbarLogo, 1200);

    const observer = new MutationObserver(() => {
      const wrappers = document.querySelectorAll('.framer-19f5bx3, [data-framer-name="Logo Wrapper"]');
      let needsPatch = false;
      for (let i = 0; i < wrappers.length; i++) {
        if (!wrappers[i].querySelector('.callora-logo')) {
          needsPatch = true;
          break;
        }
      }
      if (needsPatch) {
        ensureNavbarLogo();
      }
    });

    const targetNode = document.querySelector('.framer-16tbhsi-container') || document.body;
    if (targetNode) {
      observer.observe(targetNode, { childList: true, subtree: true });
    }
  }

  /* -----------------------------------------------------------------------
     INITIALIZATION — wait for DOM + a tick for Framer hydration
     ----------------------------------------------------------------------- */
  function init() {
    initNavbarLogo();
    initFooterEmail();
    observeFooterEmail();
    const progressEl = injectDecorations();
    initScrollProgress(progressEl);
    initNavbarScroll();
    initSectionReveals();
    initCardReveals();
    initMagneticButtons();
    initButtonRipple();
    initHeroParallax();
    initLazyImages();
    initCursorGlow();

    // GSAP & Lenis may load after this script
    // Use a small delay to ensure CDN scripts are parsed
    requestAnimationFrame(() => {
      setTimeout(() => {
        initGSAPTextReveal();
        initLenis();
      }, 100);
    });
  }

  // Run navbar logo check immediately
  if (document.readyState !== 'loading') {
    initNavbarLogo();
  }

  // Wait for the DOM, then give Framer a tick to hydrate
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(init);
    });
  } else {
    requestAnimationFrame(init);
  }
})();
