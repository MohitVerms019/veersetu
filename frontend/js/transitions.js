(function () {
  "use strict";

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Route → transition mode mapping
  const ROUTE_MAP = {
    'index.html': 'curtain',
    'about.html': 'curtain',
    'login.html': 'wipe',
    'register.html': 'wipe'
  };

  class PageTransitions {
    constructor() {
      this.overlay = null;
      this.busy = false;
      this.init();
    }

    init() {
      this.buildOverlay();
      document.addEventListener('DOMContentLoaded', () => {
        this.playEntrance();
        this.interceptLinks();
        this.handleBfCache();
      });
    }

    buildOverlay() {
      const overlay = document.createElement('div');
      overlay.id = 'vs-overlay';
      overlay.className = 'vs-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      // Curtain panels
      const curtainLeft = document.createElement('div');
      curtainLeft.className = 'vs-curtain-left';

      const curtainRight = document.createElement('div');
      curtainRight.className = 'vs-curtain-right';

      // Wipe layers
      const wipeLayer = document.createElement('div');
      wipeLayer.className = 'vs-wipe-layer';

      const wipeAccent = document.createElement('div');
      wipeAccent.className = 'vs-wipe-accent';

      // Military sweep
      const milSweep = document.createElement('div');
      milSweep.className = 'vs-mil-sweep';

      // Tricolor beam
      const tricolorBeam = document.createElement('div');
      tricolorBeam.className = 'vs-tricolor-beam';

      // Center emblem
      const emblem = document.createElement('div');
      emblem.className = 'vs-emblem-center';
      emblem.innerHTML = `
        <svg class="vs-emblem-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="72" height="72" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="none" stroke="#F1EEE6" stroke-width="2"/>
          <circle cx="40" cy="40" r="30" fill="none" stroke="#B9AA98" stroke-width="1"/>
          <!-- Ashok Chakra simplified -->
          <circle cx="40" cy="40" r="10" fill="none" stroke="#F1EEE6" stroke-width="2"/>
          <circle cx="40" cy="40" r="3" fill="#F1EEE6"/>
          <!-- Spokes -->
          <g stroke="#F1EEE6" stroke-width="1.2">
            <line x1="40" y1="30" x2="40" y2="50"/>
            <line x1="30" y1="40" x2="50" y2="40"/>
            <line x1="32.9" y1="32.9" x2="47.1" y2="47.1"/>
            <line x1="47.1" y1="32.9" x2="32.9" y2="47.1"/>
            <line x1="30.4" y1="35" x2="49.6" y2="45"/>
            <line x1="35" y1="30.4" x2="45" y2="49.6"/>
            <line x1="49.6" y1="35" x2="30.4" y2="45"/>
            <line x1="45" y1="30.4" x2="35" y2="49.6"/>
          </g>
          <!-- Bridge arch -->
          <path d="M18 56 Q40 28 62 56" fill="none" stroke="#F1EEE6" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="18" y1="56" x2="62" y2="56" stroke="#B9AA98" stroke-width="1.5"/>
          <!-- Cables -->
          <line x1="40" y1="36" x2="25" y2="56" stroke="#D5C9BA" stroke-width="1"/>
          <line x1="40" y1="36" x2="32" y2="56" stroke="#D5C9BA" stroke-width="1"/>
          <line x1="40" y1="36" x2="48" y2="56" stroke="#D5C9BA" stroke-width="1"/>
          <line x1="40" y1="36" x2="55" y2="56" stroke="#D5C9BA" stroke-width="1"/>
        </svg>
        <span class="vs-emblem-wordmark">VEER SETU</span>
        <span class="vs-emblem-motto">वीर सेतु — Connecting Warriors, Enabling Futures</span>
      `;

      overlay.appendChild(curtainLeft);
      overlay.appendChild(curtainRight);
      overlay.appendChild(wipeLayer);
      overlay.appendChild(wipeAccent);
      overlay.appendChild(milSweep);
      overlay.appendChild(tricolorBeam);
      overlay.appendChild(emblem);

      document.body.appendChild(overlay);
      this.overlay = overlay;
    }

    playEntrance() {
      if (REDUCED_MOTION) {
        this.triggerStaggeredEntrances();
        return;
      }

      const mode = sessionStorage.getItem('vs_next_mode') || 'curtain';
      sessionStorage.removeItem('vs_next_mode');

      const overlay = this.overlay;
      // Immediately set active + mode + closing (overlay covers screen as we "arrive")
      overlay.className = `vs-overlay active ${mode} closing`;

      // After one rAF (~16ms), schedule the opening phase
      requestAnimationFrame(() => {
        setTimeout(() => {
          overlay.classList.remove('closing');
          overlay.classList.add('opening');

          // After transition completes, clean up
          setTimeout(() => {
            overlay.className = 'vs-overlay';
            this.busy = false;
            this.triggerStaggeredEntrances();
          }, 650);
        }, 60);
      });
    }

    triggerStaggeredEntrances() {
      if (REDUCED_MOTION) return;

      const elements = document.querySelectorAll('.vs-anim');
      const hasDelayClass = /\bd-[1-6]\b/;

      elements.forEach((el, index) => {
        if (hasDelayClass.test(el.className)) return;
        const delay = Math.min(0.08 * index, 0.6);
        el.style.animationDelay = `${delay}s`;
      });
    }

    interceptLinks() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip special protocols and modifiers
        if (
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          href.startsWith('javascript:') ||
          link.target === '_blank' ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.altKey
        ) return;

        // Only handle same-origin HTML or extensionless links
        let destUrl;
        try {
          destUrl = new URL(href, window.location.href);
        } catch {
          return;
        }

        if (destUrl.origin !== window.location.origin) return;

        const pathname = destUrl.pathname;
        const hasHtmlExt = pathname.endsWith('.html');
        const hasNoExt = !pathname.includes('.', pathname.lastIndexOf('/'));

        if (!hasHtmlExt && !hasNoExt) return;

        e.preventDefault();

        const destFile = pathname.split('/').pop() || 'index.html';
        const mode = link.dataset.transition || ROUTE_MAP[destFile] || 'curtain';

        this.exitTo(destUrl.href, mode);
      });
    }

    exitTo(url, mode) {
      if (this.busy) return;
      this.busy = true;

      sessionStorage.setItem('vs_next_mode', mode);
      this.overlay.className = `vs-overlay active ${mode} closing`;

      const delay = mode === 'wipe' ? 480 : 520;
      setTimeout(() => {
        window.location.href = url;
      }, delay);
    }

    handleBfCache() {
      window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
          this.overlay.className = 'vs-overlay';
          this.busy = false;
        }
      });
    }
  }

  // Bootstrap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.vsTransitions = new PageTransitions();
    });
  } else {
    window.vsTransitions = new PageTransitions();
  }

})();
