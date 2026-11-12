/**
 * VEER SETU 🇮🇳 - Unified Navigation Controller
 * Handles active route detection, sticky navbar state, responsive drawer,
 * and animated active nav indicator.
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initActiveNavLinks();
    initStickyHeader();
    initMobileDrawer();
    initNavIndicator();
  });

  /**
   * Highlights the current active page in the main navigation menu
   */
  function initActiveNavLinks() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-menu .nav-link");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      const linkFile = href.split("/").pop().split("?")[0].split("#")[0];

      // Exact match or default homepage match
      if (
        linkFile === currentPath ||
        (currentPath === "" && linkFile === "index.html") ||
        (currentPath === "index.html" && linkFile === "index.html")
      ) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  }

  /**
   * Adds sticky/scrolled styling to the navigation bar
   */
  function initStickyHeader() {
    const header = document.getElementById("main-navbar");
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 30) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  /**
   * Responsive hamburger menu drawer logic
   */
  function initMobileDrawer() {
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    if (!mobileToggle || !navMenu) return;

    const toggleMenu = (open) => {
      const isOpen = typeof open === "boolean" ? open : !navMenu.classList.contains("open");
      navMenu.classList.toggle("open", isOpen);
      mobileToggle.setAttribute("aria-expanded", String(isOpen));

      const icon = mobileToggle.querySelector("i");
      if (icon) {
        if (isOpen) {
          icon.classList.remove("fa-bars");
          icon.classList.add("fa-xmark");
        } else {
          icon.classList.remove("fa-xmark");
          icon.classList.add("fa-bars");
        }
      }
    };

    mobileToggle.addEventListener("click", () => toggleMenu());

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (
        navMenu.classList.contains("open") &&
        !navMenu.contains(e.target) &&
        !mobileToggle.contains(e.target)
      ) {
        toggleMenu(false);
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("open")) {
        toggleMenu(false);
      }
    });
  }

  /**
   * Animated active navigation underline indicator
   */
  function initNavIndicator() {
    const navMenu = document.getElementById("nav-menu");
    if (!navMenu) return;

    let indicator = navMenu.querySelector(".nav-active-pill");
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.className = "nav-active-pill";
      navMenu.appendChild(indicator);
    }

    const updateIndicator = (targetLink) => {
      if (!targetLink) {
        indicator.style.opacity = "0";
        return;
      }
      const navRect = navMenu.getBoundingClientRect();
      const linkRect = targetLink.getBoundingClientRect();

      indicator.style.width = `${linkRect.width}px`;
      indicator.style.left = `${linkRect.left - navRect.left}px`;
      indicator.style.opacity = "1";
    };

    const activeLink = navMenu.querySelector(".nav-link.active");
    if (activeLink) {
      setTimeout(() => updateIndicator(activeLink), 150);
    }

    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("mouseenter", () => updateIndicator(link));
    });

    navMenu.addEventListener("mouseleave", () => {
      const currentActive = navMenu.querySelector(".nav-link.active");
      updateIndicator(currentActive);
    });

    window.addEventListener("resize", () => {
      const currentActive = navMenu.querySelector(".nav-link.active");
      updateIndicator(currentActive);
    }, { passive: true });
  }
})();

