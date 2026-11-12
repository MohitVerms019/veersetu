(function () {
  "use strict";

  /* ════════════════════════════════════════════════════════════════════════════
     TOAST NOTIFICATION SYSTEM
  ════════════════════════════════════════════════════════════════════════════ */

  const TOAST_ICONS = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  let toastContainer = null;

  function initToastContainer() {
    if (document.getElementById('vs-toast-container')) {
      toastContainer = document.getElementById('vs-toast-container');
      return;
    }
    toastContainer = document.createElement('div');
    toastContainer.id = 'vs-toast-container';
    toastContainer.setAttribute('role', 'region');
    toastContainer.setAttribute('aria-label', 'Notifications');
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'false');
    document.body.appendChild(toastContainer);
  }

  /**
   * Display a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'info'} [type='info']
   */
  window.showToast = function showToast(message, type) {
    type = type || 'info';
    if (!toastContainer) initToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    const iconClass = TOAST_ICONS[type] || TOAST_ICONS.info;
    toast.innerHTML = `
      <i class="fa-solid ${iconClass} toast-icon" aria-hidden="true"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-dismiss" aria-label="Dismiss notification" title="Dismiss">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    `;

    // Dismiss button
    toast.querySelector('.toast-dismiss').addEventListener('click', () => removeToast(toast));

    toastContainer.appendChild(toast);

    // Fade in
    setTimeout(() => toast.classList.add('toast-visible'), 10);

    // Auto dismiss
    const fadeOutTimer = setTimeout(() => removeToast(toast), 4000);

    // Cancel auto-dismiss if manually dismissed
    toast._fadeOutTimer = fadeOutTimer;
  };

  function removeToast(toast) {
    clearTimeout(toast._fadeOutTimer);
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 350);
  }

  /* ════════════════════════════════════════════════════════════════════════════
     SCROLL REVEAL (IntersectionObserver)
  ════════════════════════════════════════════════════════════════════════════ */

  function initScrollReveal() {
    const elements = document.querySelectorAll('.scroll-reveal');
    if (!elements.length) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((el) => el.classList.add('revealed'));
      return;
    }

    if (!('IntersectionObserver' in window)) {
      // Fallback: reveal all immediately
      elements.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ════════════════════════════════════════════════════════════════════════════
     STATS COUNT-UP ANIMATION
  ════════════════════════════════════════════════════════════════════════════ */

  function initCountUp() {
    const statEls = document.querySelectorAll('.stat-num[data-target]');
    if (!statEls.length) return;

    const DURATION_MS = 1600;
    const FRAME_RATE = 60; // target fps
    const INTERVAL_MS = 1000 / FRAME_RATE;

    function animateStat(el) {
      const target = parseFloat(el.dataset.target) || 0;
      const suffix = el.dataset.suffix || '';
      const isFloat = target % 1 !== 0;
      const decimalPlaces = isFloat ? (String(target).split('.')[1] || '').length : 0;
      const totalFrames = Math.round(DURATION_MS / INTERVAL_MS);
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        // Ease-out: starts fast, decelerates
        const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
        const current = target * progress;

        el.textContent = (isFloat ? current.toFixed(decimalPlaces) : Math.floor(current)) + suffix;

        if (frame >= totalFrames) {
          clearInterval(timer);
          el.textContent = (isFloat ? target.toFixed(decimalPlaces) : target) + suffix;
        }
      }, INTERVAL_MS);
    }

    if (!('IntersectionObserver' in window)) {
      statEls.forEach(animateStat);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    statEls.forEach((el) => observer.observe(el));
  }

  /* ════════════════════════════════════════════════════════════════════════════
     FAQ ACCORDION
  ════════════════════════════════════════════════════════════════════════════ */

  function initFaq() {
    const faqBtns = document.querySelectorAll('.faq-btn');
    if (!faqBtns.length) return;

    faqBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (!item) return;

        const body = item.querySelector('.faq-body');
        const isOpen = item.classList.contains('open');

        // Close all siblings first
        const allItems = item.parentNode.querySelectorAll('.faq-item');
        allItems.forEach((sibling) => {
          if (sibling !== item) {
            sibling.classList.remove('open');
            const sibBody = sibling.querySelector('.faq-body');
            if (sibBody) sibBody.style.maxHeight = '0px';
            const sibBtn = sibling.querySelector('.faq-btn');
            if (sibBtn) sibBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('open');
          if (body) body.style.maxHeight = '0px';
          btn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          if (body) {
            // Measure the natural height
            body.style.maxHeight = 'none';
            const height = body.scrollHeight;
            body.style.maxHeight = '0px';
            // Trigger reflow
            void body.offsetHeight;
            body.style.maxHeight = `${height}px`;
          }
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      // Set initial aria state
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  /* ════════════════════════════════════════════════════════════════════════════
     BOOTSTRAP — run all inits on DOMContentLoaded
  ════════════════════════════════════════════════════════════════════════════ */

  function initAll() {
    initToastContainer();
    initScrollReveal();
    initCountUp();
    initFaq();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
