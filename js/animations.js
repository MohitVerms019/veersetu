/**
 * VEER SETU 🇮🇳 - Motion Graphics & Scroll Animation Engine
 * Handles IntersectionObserver triggers, stats count-up, and interactive micro-animations.
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initScrollReveal();
    initCountUpStats();
    initAccordionAnimations();
  });

  /**
   * Triggers entrance animations when elements enter the viewport
   */
  function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
      ".scroll-reveal, .service-card, .pillar-card, .deadline-card, .feature-block"
    );
    if (!revealTargets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach((el, index) => {
      el.style.setProperty("--reveal-index", index % 6);
      observer.observe(el);
    });
  }

  /**
   * Animated stats counter (e.g. 12+ schemes, 100% portals, etc.)
   */
  function initCountUpStats() {
    const counters = document.querySelectorAll(".stat-counter-number[data-target]");
    if (!counters.length) return;

    let animated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            animated = true;
            counters.forEach((counter) => {
              const target = parseInt(counter.getAttribute("data-target"), 10);
              const suffix = counter.getAttribute("data-suffix") || "";
              const duration = 1600;
              const stepTime = 25;
              const steps = duration / stepTime;
              const increment = target / steps;
              let current = 0;

              const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                  counter.textContent = target + suffix;
                  clearInterval(timer);
                } else {
                  counter.textContent = Math.floor(current) + suffix;
                }
              }, stepTime);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsSection = document.querySelector(".stats-strip") || counters[0].closest("section");
    if (statsSection) {
      observer.observe(statsSection);
    }
  }

  /**
   * Smooth accordion expansion for FAQ
   */
  function initAccordionAnimations() {
    const accordionButtons = document.querySelectorAll(".faq-item-header");
    accordionButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const body = item.querySelector(".faq-item-body");
        const isOpen = item.classList.contains("open");

        // Close other items
        document.querySelectorAll(".faq-item.open").forEach((openItem) => {
          if (openItem !== item) {
            openItem.classList.remove("open");
            const otherBody = openItem.querySelector(".faq-item-body");
            if (otherBody) otherBody.style.maxHeight = null;
          }
        });

        if (isOpen) {
          item.classList.remove("open");
          if (body) body.style.maxHeight = null;
        } else {
          item.classList.add("open");
          if (body) body.style.maxHeight = body.scrollHeight + "px";
        }
      });
    });
  }
})();

