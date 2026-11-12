(function () {
  "use strict";

  /* ─── Active Link Detection ──────────────────────────────────────────────── */
  function detectActiveLink() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkFile = href.split('/').pop().split('?')[0];

      if (linkFile === currentFile || (currentFile === '' && linkFile === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ─── Sticky Scroll ───────────────────────────────────────────────────────── */
  function initStickyScroll() {
    const navbar = document.getElementById('main-navbar');
    if (!navbar) return;

    function onScroll() {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* ─── Mobile Drawer ───────────────────────────────────────────────────────── */
  function initMobileDrawer() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (!toggle || !navMenu) return;

    const icon = toggle.querySelector('i') || toggle.querySelector('[data-icon]');

    function openMenu() {
      navMenu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      }
    }

    function closeMenu() {
      navMenu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    }

    function isOpen() {
      return navMenu.classList.contains('open');
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen() ? closeMenu() : openMenu();
    });

    // Click outside → close
    document.addEventListener('click', (e) => {
      if (isOpen() && !navMenu.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Escape key → close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
        toggle.focus();
      }
    });

    // Close drawer on nav link click (mobile)
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992) closeMenu();
      });
    });
  }

  /* ─── Sliding Active Pill Indicator ──────────────────────────────────────── */
  function initActiveIndicator() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    // Create pill if not present
    let pill = navMenu.querySelector('.nav-active-pill');
    if (!pill) {
      pill = document.createElement('span');
      pill.className = 'nav-active-pill';
      pill.setAttribute('aria-hidden', 'true');
      navMenu.appendChild(pill);
    }

    function getMenuOffset() {
      return navMenu.getBoundingClientRect();
    }

    function movePillTo(el) {
      if (!el) {
        pill.style.opacity = '0';
        return;
      }
      const elRect = el.getBoundingClientRect();
      const menuRect = getMenuOffset();
      pill.style.opacity = '1';
      pill.style.left = `${elRect.left - menuRect.left}px`;
      pill.style.width = `${elRect.width}px`;
    }

    function positionOnActive() {
      const activeLink = navMenu.querySelector('.nav-link.active');
      movePillTo(activeLink);
    }

    // Hover: move pill under hovered nav link
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('mouseover', () => movePillTo(link));
    });

    // Mouse leave: return to active link
    navMenu.addEventListener('mouseleave', positionOnActive);

    // Resize: recalculate
    window.addEventListener('resize', positionOnActive, { passive: true });

    // On load: delay 100ms for fonts
    setTimeout(positionOnActive, 100);
  }

  /* ─── Bootstrap ─────────────────────────────────────────────────────────── */
  function initNavigation() {
    detectActiveLink();
    initStickyScroll();
    initMobileDrawer();
    initActiveIndicator();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }

})();
