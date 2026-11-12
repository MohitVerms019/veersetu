/**
 * VEER SETU 🇮🇳 - Core Application Logic
 * UI Interactions, Filtering, Modals, Dynamic Schemes, Stats Counter, and Forms.
 */

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initStatsCounter();
  initSchemesManager();
  initQuickFinder();
  initNoticeBoard();
  initFaqAccordion();
  initContactForm();
  initAuthModal();
  initEmergencyTicker();
});

/* ----------------------------------------------------
   1. NAVBAR & NAVIGATION
---------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById("main-navbar");
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Sticky header with blur on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    highlightActiveSection();
  });

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
      const icon = mobileToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-xmark");
      }
    });

    // Close on link click
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        const icon = mobileToggle.querySelector("i");
        if (icon) {
          icon.classList.add("fa-bars");
          icon.classList.remove("fa-xmark");
        }
      });
    });
  }
}

function highlightActiveSection() {
  const sections = document.querySelectorAll("section[id]");
  const scrollPos = window.scrollY + 120;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute("id");

    if (scrollPos >= top && scrollPos < top + height) {
      document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${id}`) {
          link.classList.add("active");
        }
      });
    }
  });
}

/* ----------------------------------------------------
   2. STATS COUNTER ANIMATION
---------------------------------------------------- */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll(".stat-counter-number");
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute("data-target"), 10);
          const duration = 1800; // ms
          const stepTime = 25;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              stat.textContent = target + (stat.getAttribute("data-suffix") || "");
              clearInterval(timer);
            } else {
              stat.textContent = Math.floor(current) + (stat.getAttribute("data-suffix") || "");
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById("stats-strip");
  if (statsSection) {
    observer.observe(statsSection);
  }
}

/* ----------------------------------------------------
   3. SCHEMES MANAGER (Filter, Search, Detail Modal)
---------------------------------------------------- */
function initSchemesManager() {
  const container = document.getElementById("schemes-cards-grid");
  const categoryFilters = document.querySelectorAll(".category-filter-btn");
  const audienceFilters = document.querySelectorAll(".audience-filter-btn");
  const searchInput = document.getElementById("schemes-search-input");
  const countBadge = document.getElementById("schemes-count-badge");

  if (!container || typeof VEER_SETU_SCHEMES === "undefined") return;

  let activeCategory = "all";
  let activeAudience = "all";
  let searchTerm = "";

  function renderSchemes() {
    const filtered = VEER_SETU_SCHEMES.filter(scheme => {
      const matchCategory = activeCategory === "all" || scheme.category === activeCategory;
      const matchAudience = activeAudience === "all" || scheme.targetAudience.includes(activeAudience);
      const matchSearch = searchTerm === "" || 
        scheme.title.toLowerCase().includes(searchTerm) ||
        scheme.agency.toLowerCase().includes(searchTerm) ||
        scheme.shortDesc.toLowerCase().includes(searchTerm) ||
        scheme.benefitAmount.toLowerCase().includes(searchTerm);

      return matchCategory && matchAudience && matchSearch;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Schemes Available`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <i class="fa-solid fa-folder-open empty-icon"></i>
          <h3>No Welfare Schemes Found</h3>
          <p>Try clearing your search filters or searching for terms like "scholarship", "hospital", "pension", or "canteen".</p>
          <button class="btn btn-outline-forest mt-3" id="reset-filters-btn">
            <i class="fa-solid fa-arrows-rotate"></i> Reset All Filters
          </button>
        </div>
      `;
      const resetBtn = document.getElementById("reset-filters-btn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          activeCategory = "all";
          activeAudience = "all";
          searchTerm = "";
          if (searchInput) searchInput.value = "";
          categoryFilters.forEach(b => b.classList.toggle("active", b.dataset.category === "all"));
          audienceFilters.forEach(b => b.classList.toggle("active", b.dataset.audience === "all"));
          renderSchemes();
        });
      }
      return;
    }

    const categoryIcons = {
      education: "fa-graduation-cap",
      healthcare: "fa-heart-pulse",
      financial: "fa-hand-holding-dollar",
      canteen: "fa-cart-shopping",
      pension: "fa-money-bill-transfer",
      housing: "fa-house-shield",
      "family-support": "fa-people-roof"
    };

    container.innerHTML = filtered.map(scheme => `
      <article class="scheme-card" data-category="${scheme.category}">
        <div class="scheme-card-top">
          <div class="scheme-icon-box">
            <i class="fa-solid ${categoryIcons[scheme.category] || "fa-shield-halved"}"></i>
          </div>
          <span class="scheme-badge ${scheme.badge ? 'badge-highlight' : ''}">${scheme.badge || "Welfare"}</span>
        </div>

        <div class="scheme-agency-tag">
          <i class="fa-solid fa-building-columns"></i> ${scheme.agency}
        </div>

        <h3 class="scheme-card-title">${scheme.title}</h3>
        <p class="scheme-card-desc">${scheme.shortDesc}</p>

        <div class="scheme-benefit-box">
          <span class="benefit-label"><i class="fa-solid fa-circle-check text-green"></i> Key Benefit</span>
          <strong class="benefit-amount">${scheme.benefitAmount}</strong>
        </div>

        <div class="scheme-card-footer">
          <div class="target-pills">
            ${scheme.targetAudience.map(aud => `<span class="target-pill pill-${aud}">${formatAudience(aud)}</span>`).join("")}
          </div>
          <button class="btn btn-sm btn-forest view-scheme-btn" data-scheme-id="${scheme.id}">
            View Details <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </article>
    `).join("");

    // Attach click listeners to view detail buttons
    container.querySelectorAll(".view-scheme-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-scheme-id");
        openSchemeModal(id);
      });
    });
  }

  function formatAudience(aud) {
    const map = {
      serving: "Serving",
      veteran: "Veterans (ESM)",
      veernari: "Veer Nari",
      dependent: "Dependents"
    };
    return map[aud] || aud;
  }

  // Category filter clicks
  categoryFilters.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryFilters.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-category");
      renderSchemes();
    });
  });

  // Audience filter clicks
  audienceFilters.forEach(btn => {
    btn.addEventListener("click", () => {
      audienceFilters.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeAudience = btn.getAttribute("data-audience");
      renderSchemes();
    });
  });

  // Search input with debounce
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchTerm = e.target.value.trim().toLowerCase();
        renderSchemes();
      }, 200);
    });
  }

  // Initial render
  renderSchemes();
}

/* ----------------------------------------------------
   4. SCHEME DETAIL MODAL
---------------------------------------------------- */
function openSchemeModal(schemeId) {
  const scheme = VEER_SETU_SCHEMES.find(s => s.id === schemeId);
  if (!scheme) return;

  const modal = document.getElementById("scheme-detail-modal");
  const modalContent = document.getElementById("scheme-modal-body");
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="modal-scheme-header">
      <div class="modal-tag-row">
        <span class="badge-agency"><i class="fa-solid fa-landmark"></i> ${scheme.agency}</span>
        <span class="badge-status-open"><i class="fa-solid fa-circle-check"></i> Applications Active</span>
      </div>
      <h2 class="modal-scheme-title">${scheme.title}</h2>
      <div class="modal-benefit-ribbon">
        <span class="ribbon-label">Maximum Entitlement / Financial Coverage:</span>
        <span class="ribbon-value">${scheme.benefitAmount}</span>
      </div>
    </div>

    <div class="modal-body-sections">
      <div class="modal-section">
        <h4 class="section-title"><i class="fa-solid fa-circle-info text-saffron"></i> Scheme Overview</h4>
        <p>${scheme.overview}</p>
      </div>

      <div class="modal-section">
        <h4 class="section-title"><i class="fa-solid fa-user-check text-green"></i> Eligibility Criteria</h4>
        <ul class="styled-list">
          ${scheme.eligibility.map(item => `<li><i class="fa-solid fa-check text-green"></i> ${item}</li>`).join("")}
        </ul>
      </div>

      <div class="modal-section">
        <h4 class="section-title"><i class="fa-solid fa-folder-closed text-saffron"></i> Mandatory Documents Required</h4>
        <div class="doc-checklist-grid">
          ${scheme.documentsRequired.map(doc => `
            <div class="doc-item">
              <i class="fa-solid fa-file-lines text-forest"></i>
              <span>${doc}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="modal-section">
        <h4 class="section-title"><i class="fa-solid fa-route text-saffron"></i> How to Apply</h4>
        <p class="apply-steps-box">${scheme.applicationProcess}</p>
      </div>
    </div>

    <div class="modal-action-footer">
      <a href="${scheme.link}" target="_blank" rel="noopener noreferrer" class="btn btn-forest">
        <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Official Portal (${scheme.agency.split('(')[0].trim()})
      </a>
      <button class="btn btn-outline-forest" onclick="copyChecklist('${scheme.id}')">
        <i class="fa-solid fa-copy"></i> Copy Documents Checklist
      </button>
      <button class="btn btn-outline-ivory" onclick="closeSchemeModal()">
        Close Window
      </button>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeSchemeModal() {
  const modal = document.getElementById("scheme-detail-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

// Global modal close handlers
window.addEventListener("click", (e) => {
  const schemeModal = document.getElementById("scheme-detail-modal");
  const authModal = document.getElementById("auth-modal");
  if (e.target === schemeModal) closeSchemeModal();
  if (e.target === authModal) closeAuthModal();
});

function copyChecklist(schemeId) {
  const scheme = VEER_SETU_SCHEMES.find(s => s.id === schemeId);
  if (!scheme) return;

  const text = `VEER SETU Checklist for ${scheme.title}:\n\n` +
    scheme.documentsRequired.map((d, i) => `${i + 1}. ${d}`).join('\n') +
    `\n\nOfficial Portal: ${scheme.link}`;

  navigator.clipboard.writeText(text).then(() => {
    showToast("Documents checklist copied to clipboard!", "success");
  }).catch(() => {
    showToast("Checklist printed to console.", "info");
  });
}

/* ----------------------------------------------------
   5. QUICK SCHEME FINDER WIZARD
---------------------------------------------------- */
function initQuickFinder() {
  const finderBtn = document.getElementById("finder-submit-btn");
  if (!finderBtn) return;

  finderBtn.addEventListener("click", () => {
    const role = document.getElementById("finder-role").value;
    const need = document.getElementById("finder-need").value;

    // Set filters in schemes manager
    const audienceBtn = document.querySelector(`.audience-filter-btn[data-audience="${role}"]`) || 
                        document.querySelector('.audience-filter-btn[data-audience="all"]');
    const categoryBtn = document.querySelector(`.category-filter-btn[data-category="${need}"]`) || 
                        document.querySelector('.category-filter-btn[data-category="all"]');

    if (audienceBtn) audienceBtn.click();
    if (categoryBtn) categoryBtn.click();

    // Scroll smoothly to schemes section
    const schemesSection = document.getElementById("welfare-schemes");
    if (schemesSection) {
      schemesSection.scrollIntoView({ behavior: "smooth" });
      showToast(`Showing schemes matched for your profile!`, "info");
    }
  });
}

/* ----------------------------------------------------
   6. NOTICE BOARD & UPDATES
---------------------------------------------------- */
const NOTICES_DATA = [
  {
    tag: "Deadlines",
    type: "urgent",
    title: "SPARSH Digital Life Certificate (DLC) Annual Submission Open",
    date: "10 Nov 2026",
    desc: "Defense Pensioners are requested to complete annual biometric / Jeevan Pramaan submission before 30th November to ensure uninterrupted monthly disbursement."
  },
  {
    tag: "Scholarships",
    type: "primary",
    title: "Prime Minister's Scholarship Scheme (PMSS) AY 2026-27 Online Form Active",
    date: "04 Nov 2026",
    desc: "Eligible wards of Ex-Servicemen joining 1st year professional degree courses can now apply through ksb.gov.in. Early submission advised."
  },
  {
    tag: "Healthcare",
    type: "info",
    title: "ECHS 64-KB Smart Card Online Upgrade Advisory",
    date: "28 Oct 2026",
    desc: "All legacy 16KB/32KB cardholders who have not yet transitioned to 64-KB biometrics are requested to apply via echs.gov.in for cashless pan-India coverage."
  },
  {
    tag: "CSD Canteen",
    type: "accent",
    title: "New Four-Wheeler (Car) AFD-I Purchase Quota Revised by MoD",
    date: "15 Oct 2026",
    desc: "Revised index quota limits and reduced dealer delivery waiting periods have been updated on afd.csdindia.gov.in."
  }
];

function initNoticeBoard() {
  const container = document.getElementById("notices-list-container");
  const filterTabs = document.querySelectorAll(".notice-tab-btn");

  if (!container) return;

  function renderNotices(filter = "all") {
    const list = filter === "all" ? NOTICES_DATA : NOTICES_DATA.filter(n => n.tag.toLowerCase() === filter.toLowerCase());

    container.innerHTML = list.map(item => `
      <div class="notice-card ${item.type}">
        <div class="notice-meta">
          <span class="notice-badge badge-${item.type}">${item.tag}</span>
          <span class="notice-date"><i class="fa-regular fa-calendar"></i> ${item.date}</span>
        </div>
        <h4 class="notice-title">${item.title}</h4>
        <p class="notice-desc">${item.desc}</p>
      </div>
    `).join("");
  }

  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderNotices(tab.getAttribute("data-notice-filter"));
    });
  });

  renderNotices();
}

/* ----------------------------------------------------
   7. FAQ ACCORDION
---------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-accordion-item");

  faqItems.forEach(item => {
    const header = item.querySelector(".faq-header");
    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Close other items
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove("active");
      });

      // Toggle current
      item.classList.toggle("active", !isOpen);
    });
  });
}

/* ----------------------------------------------------
   8. CONTACT FORM WITH TICKET GENERATION
---------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("support-contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const serviceNo = document.getElementById("contact-service-no").value.trim() || "N/A";
    const category = document.getElementById("contact-category").value;
    const message = document.getElementById("contact-message").value.trim();

    if (!name || !message) {
      showToast("Please fill in all mandatory fields.", "warning");
      return;
    }

    const ticketId = "VS-TK-" + Math.floor(10000 + Math.random() * 90000);

    // Show simulated confirmation modal
    const resultBox = document.getElementById("contact-result-box");
    if (resultBox) {
      resultBox.innerHTML = `
        <div class="ticket-success-card">
          <div class="ticket-icon"><i class="fa-solid fa-circle-check text-green"></i></div>
          <h3>Support Ticket Generated</h3>
          <p class="ticket-code">Ticket ID: <strong>${ticketId}</strong></p>
          <p class="ticket-sub">Jai Hind <strong>${name}</strong>, our welfare liaison officer will review your query regarding <em>${category}</em> within 24 business hours.</p>
          <button class="btn btn-sm btn-outline-forest mt-3" onclick="document.getElementById('contact-result-box').innerHTML=''; document.getElementById('support-contact-form').reset();">
            Submit Another Query
          </button>
        </div>
      `;
    }

    showToast(`Support Ticket ${ticketId} created successfully!`, "success");
  });
}

/* ----------------------------------------------------
   9. AUTH MODAL (Login / Register)
---------------------------------------------------- */
function initAuthModal() {
  const authModal = document.getElementById("auth-modal");
  const openBtns = document.querySelectorAll(".open-auth-modal-btn");
  const closeBtn = document.getElementById("close-auth-modal");
  const tabBtns = document.querySelectorAll(".auth-tab-btn");
  const loginForm = document.getElementById("login-form-panel");
  const registerForm = document.getElementById("register-form-panel");

  openBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openAuthModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeAuthModal);

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-tab");
      if (target === "login") {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
      } else {
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
      }
    });
  });

  // Handle Login submission
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const armyNo = document.getElementById("login-armyno").value.trim();
      showToast(`Welcome back, Soldier/Family member (${armyNo})! Access Granted.`, "success");
      closeAuthModal();
    });
  }

  // Handle Register submission
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast(`Registration request received. Please check your mobile for OTP verification.`, "info");
      closeAuthModal();
    });
  }
}

function openAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

/* ----------------------------------------------------
   10. EMERGENCY TICKER / QUICK DIAL
---------------------------------------------------- */
function initEmergencyTicker() {
  const strip = document.getElementById("helpline-ticker-content");
  if (!strip || typeof EMERGENCY_HELPLINES === "undefined") return;

  strip.innerHTML = EMERGENCY_HELPLINES.map(h => `
    <span class="ticker-item">
      <i class="fa-solid fa-phone-volume text-saffron"></i>
      <strong>${h.name}:</strong> 
      <a href="tel:${h.number.replace(/-/g, '')}" class="ticker-tel">${h.number}</a> 
      <span class="ticker-sub">(${h.toll})</span>
    </span>
  `).join("");
}

/* ----------------------------------------------------
   11. TOAST NOTIFICATION UTILITY
---------------------------------------------------- */
function showToast(message, type = "info") {
  let toastContainer = document.getElementById("toast-notification-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-notification-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast-pill toast-${type}`;
  
  const icons = {
    success: "fa-circle-check",
    warning: "fa-triangle-exclamation",
    info: "fa-circle-info"
  };

  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || 'fa-bell'}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

