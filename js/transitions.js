/**
 * VEER SETU 🇮🇳 - Cinematic Multi-Page Transition Engine
 * Coordinates smooth, hardware-accelerated transitions across separate HTML pages.
 * Supports Curtain, Sage Reveal, Military Tricolor/Shield, and Staggered Entrances.
 */

(function () {
  "use strict";

  // Check user motion preferences
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Default transition mapping for specific routes
  const ROUTE_TRANSITIONS = {
    "index.html": "curtain",
    "about.html": "curtain",
    "schemes.html": "reveal",
    "education.html": "reveal",
    "healthcare.html": "military",
    "financial.html": "curtain",
    "family.html": "military",
    "contact.html": "reveal",
    "login.html": "military",
    "register.html": "curtain"
  };

  class PageTransitionManager {
    constructor() {
      this.overlay = null;
      this.isTransitioning = false;
      this.init();
    }

    init() {
      this.ensureOverlay();
      this.handleIncomingTransition();
      this.bindLinkInterception();
      this.handleBfCache();
    }

    /**
     * Builds and appends transition markup to DOM if not already present
     */
    ensureOverlay() {
      let overlay = document.getElementById("vs-page-transition-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "vs-page-transition-overlay";
        overlay.className = "vs-page-transition-overlay";
        overlay.setAttribute("aria-hidden", "true");

        overlay.innerHTML = `
          <!-- Curtain Panels -->
          <div class="vs-curtain-panel vs-curtain-left"></div>
          <div class="vs-curtain-panel vs-curtain-right"></div>

          <!-- Sage Geometric Wipe -->
          <div class="vs-reveal-wipe"></div>
          <div class="vs-reveal-wipe-accent"></div>
          <div class="vs-geometric-shapes">
            <div class="vs-geo-polygon vs-geo-1"></div>
            <div class="vs-geo-polygon vs-geo-2"></div>
            <div class="vs-geo-polygon vs-geo-3"></div>
          </div>

          <!-- Military Sweep & Tricolor Beam -->
          <div class="vs-military-sweep"></div>
          <div class="vs-tricolor-beam"></div>

          <!-- Centerpiece: Veer Setu Emblem & Motto -->
          <div class="vs-transition-centerpiece">
            <div class="vs-transition-emblem-wrap">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,4 94,22 94,74 50,96 6,74 6,22" fill="#303C36" stroke="#B9AA98" stroke-width="4"/>
                <path d="M28,32 L72,68 M72,32 L28,68" stroke="#F1EEE6" stroke-width="4" stroke-linecap="round"/>
                <circle cx="50" cy="50" r="14" fill="#829B8F" stroke="#F1EEE6" stroke-width="2"/>
                <polygon points="50,42 53,48 59,48 54,52 56,58 50,54 44,58 46,52 41,48 47,48" fill="#F1EEE6"/>
              </svg>
            </div>
            <div class="vs-transition-wordmark">
              <span class="vs-wordmark-title">VEER <span>SETU</span></span>
              <span class="vs-wordmark-tagline">DIGITAL WELFARE BRIDGE • वीर सेतु</span>
              <span class="vs-wordmark-motto">"सेवा अस्माकं धर्मः"</span>
            </div>
          </div>
        `;

        document.body.appendChild(overlay);
      }
      this.overlay = overlay;
    }

    /**
     * Executes the entrance animation when a page opens
     */
    handleIncomingTransition() {
      if (prefersReducedMotion) return;

      const savedMode = sessionStorage.getItem("vs_transition_mode");
      if (savedMode) {
        sessionStorage.removeItem("vs_transition_mode");

        // Set initial closed state immediately
        this.overlay.className = `vs-page-transition-overlay active transition-${savedMode} closing`;

        // Request animation frame to transition from closing to opening
        requestAnimationFrame(() => {
          setTimeout(() => {
            this.overlay.classList.remove("closing");
            this.overlay.classList.add("opening");

            // Clean up after curtain/wipe opens completely
            setTimeout(() => {
              this.overlay.className = "vs-page-transition-overlay";
              this.isTransitioning = false;
            }, 650);
          }, 60);
        });
      }

      // Trigger entrance stagger animations on elements
      this.triggerEntranceAnimations();
    }

    /**
     * Staggers in content elements matching .vs-animate-entry
     */
    triggerEntranceAnimations() {
      const animatedElements = document.querySelectorAll(".vs-animate-entry");
      if (!animatedElements.length) return;

      animatedElements.forEach((el, index) => {
        // If element doesn't have an explicit delay class, apply dynamic stagger
        if (!el.className.includes("vs-delay-")) {
          const delay = Math.min((index + 1) * 0.08, 0.6);
          el.style.animationDelay = `${delay}s`;
        }
      });
    }

    /**
     * Intercepts navigation clicks on internal links to play exit transition
     */
    bindLinkInterception() {
      document.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href) return;

        // Skip anchors on same page, javascript, mailto, tel, target="_blank", or modifier clicks
        if (
          href.startsWith("#") ||
          href.startsWith("javascript:") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          link.getAttribute("target") === "_blank" ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }

        // Determine destination file
        const url = new URL(link.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Only transition within same origin and between HTML pages
        if (url.origin !== currentUrl.origin) return;

        const destFile = url.pathname.split("/").pop() || "index.html";
        const currentFile = currentUrl.pathname.split("/").pop() || "index.html";

        // If clicking link to current page without query params, prevent redundant navigation
        if (destFile === currentFile && url.search === currentUrl.search && !url.hash) {
          e.preventDefault();
          return;
        }

        // Check if destination is one of our site pages
        const isInternalHtmlPage =
          destFile.endsWith(".html") || destFile === "" || !destFile.includes(".");

        if (isInternalHtmlPage && !prefersReducedMotion) {
          e.preventDefault();
          const customTransition = link.getAttribute("data-transition");
          this.executeExitTransition(link.href, destFile, customTransition);
        }
      });
    }

    /**
     * Plays the cinematic exit animation, then navigates to target URL
     */
    executeExitTransition(targetUrl, destFile, customMode) {
      if (this.isTransitioning) return;
      this.isTransitioning = true;

      // Select transition mode: explicit data attribute > route mapping > default curtain
      const mode = customMode || ROUTE_TRANSITIONS[destFile] || "curtain";

      // Store in session storage so incoming page knows how to reveal itself
      sessionStorage.setItem("vs_transition_mode", mode);

      // Reset and trigger closing animation
      this.overlay.className = `vs-page-transition-overlay active transition-${mode} closing`;

      // Allow exit animation to complete before page redirection
      const exitDuration = mode === "military" ? 520 : 500;

      setTimeout(() => {
        window.location.href = targetUrl;
      }, exitDuration);
    }

    /**
     * Fixes back/forward cache so the overlay doesn't remain visible
     */
    handleBfCache() {
      window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
          this.isTransitioning = false;
          if (this.overlay) {
            this.overlay.className = "vs-page-transition-overlay";
          }
        }
      });
    }
  }

  // Initialize on DOM load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.VeerSetuTransitions = new PageTransitionManager();
    });
  } else {
    window.VeerSetuTransitions = new PageTransitionManager();
  }
})();

