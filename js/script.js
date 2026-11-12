/**
 * VEER SETU 🇮🇳 - Primary Client Interactivity Script
 * Modals, Tickets, FAQ Accordion, Toasts, and UI utilities.
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initToastContainer();
    initSupportTicketForm();
    initCopyChecklists();
    initModalDismissal();
  });

  /**
   * Toast notification system
   */
  function initToastContainer() {
    if (!document.getElementById("vs-toast-container")) {
      const container = document.createElement("div");
      container.id = "vs-toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
  }

  window.showToast = function (message, type = "info") {
    const container = document.getElementById("vs-toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;

    const icons = {
      success: "fa-circle-check",
      error: "fa-circle-exclamation",
      info: "fa-circle-info"
    };

    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || "fa-bell"}"></i>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("visible");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  };

  /**
   * Support ticket generation form
   */
  function initSupportTicketForm() {
    const form = document.getElementById("support-contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const category = document.getElementById("contact-category").value;
      const message = document.getElementById("contact-message").value.trim();

      if (!name || !email || !message) {
        window.showToast("Please fill in all required fields.", "error");
        return;
      }

      const ticketId = "VS-TK-" + Math.floor(100000 + Math.random() * 900000);
      const resultBox = document.getElementById("contact-result-box");

      if (resultBox) {
        resultBox.innerHTML = `
          <div class="ticket-success-card" style="background: var(--warm-ivory); border: 2px solid var(--forest-grey); border-radius: 12px; padding: 2rem; margin-top: 1.5rem; text-align: center;">
            <div style="font-size: 2.5rem; color: #316847; margin-bottom: 0.5rem;"><i class="fa-solid fa-circle-check"></i></div>
            <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--deep-charcoal); margin-bottom: 0.5rem;">Support Ticket Generated</h3>
            <p style="font-family: var(--font-military); font-size: 1.2rem; font-weight: 700; color: #DE7928; margin-bottom: 0.75rem;">Ticket ID: ${ticketId}</p>
            <p style="color: var(--deep-charcoal); opacity: 0.9; line-height: 1.5; max-width: 500px; margin: 0 auto 1.5rem;">
              Jai Hind <strong>${name}</strong>, our welfare liaison officer will review your inquiry regarding <em>${category}</em> within 24 business hours. A confirmation has been logged.
            </p>
            <button class="btn btn-sm btn-outline-forest" onclick="document.getElementById('contact-result-box').innerHTML=''; document.getElementById('support-contact-form').reset();">
              Submit Another Query
            </button>
          </div>
        `;
      }

      window.showToast(`Support Ticket ${ticketId} generated successfully!`, "success");
    });
  }

  /**
   * Clipboard copying for scheme document checklists
   */
  function initCopyChecklists() {
    window.copySchemeChecklist = function (schemeTitle, items) {
      const text = `VEER SETU Document Checklist for ${schemeTitle}:\n\n` +
        items.map((it, idx) => `${idx + 1}. ${it}`).join("\n") +
        "\n\nIssued by Veer Setu Academic Support Portal";

      navigator.clipboard.writeText(text).then(() => {
        window.showToast("Checklist copied to clipboard!", "success");
      }).catch(() => {
        window.showToast("Unable to copy to clipboard.", "error");
      });
    };
  }

  /**
   * Global modal dismissals
   */
  function initModalDismissal() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const activeModal = document.querySelector(".modal-overlay.active");
        if (activeModal) {
          activeModal.classList.remove("active");
          document.body.style.overflow = "auto";
        }
      }
    });

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        e.target.classList.remove("active");
        document.body.style.overflow = "auto";
      }
    });
  }
})();

