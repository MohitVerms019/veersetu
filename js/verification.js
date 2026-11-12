/**
 * VEER SETU 🇮🇳 - Verification Engine & Digital Pass Generator
 * Simulates military service verification and generates a secure digital welfare pass.
 * NOTE: Academic prototype. Does not access live Ministry of Defence networks.
 */

class VeerSetuVerifier {
  constructor() {
    this.form = document.getElementById("verification-form");
    this.step1 = document.getElementById("verify-step-input");
    this.step2 = document.getElementById("verify-step-processing");
    this.step3 = document.getElementById("verify-step-result");
    this.passCard = document.getElementById("digital-pass-card");
    this.uploadInput = document.getElementById("doc-file-input");
    this.uploadZone = document.getElementById("file-upload-dropzone");
    this.fileNameDisplay = document.getElementById("uploaded-file-name");
    
    this.selectedFile = null;
    this.init();
  }

  init() {
    if (!this.form) return;

    // File drag & drop setup
    this.setupFileUpload();

    // Form submission
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleVerification();
    });

    // Reset button
    const resetBtn = document.getElementById("verify-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetVerification());
    }

    // Print pass button
    const printBtn = document.getElementById("print-pass-btn");
    if (printBtn) {
      printBtn.addEventListener("click", () => window.print());
    }
  }

  setupFileUpload() {
    if (!this.uploadZone || !this.uploadInput) return;

    this.uploadZone.addEventListener("click", () => this.uploadInput.click());

    this.uploadInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        this.processFile(e.target.files[0]);
      }
    });

    this.uploadZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.uploadZone.classList.add("dragover");
    });

    this.uploadZone.addEventListener("dragleave", () => {
      this.uploadZone.classList.remove("dragover");
    });

    this.uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.processFile(e.dataTransfer.files[0]);
      }
    });
  }

  processFile(file) {
    this.selectedFile = file;
    if (this.fileNameDisplay) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      this.fileNameDisplay.innerHTML = `
        <div class="uploaded-pill">
          <i class="fa-solid fa-file-shield text-saffron"></i>
          <span class="file-title">${file.name} (${sizeMb} MB)</span>
          <span class="badge-verified"><i class="fa-solid fa-check"></i> Attached</span>
        </div>
      `;
    }
  }

  handleVerification() {
    const serviceCategory = document.getElementById("verify-category").value;
    const armyNo = document.getElementById("verify-armyno").value.trim().toUpperCase();
    const fullName = document.getElementById("verify-fullname").value.trim();
    const rank = document.getElementById("verify-rank").value;
    const regiment = document.getElementById("verify-regiment").value;
    const ppoNo = document.getElementById("verify-ppono").value.trim() || "N/A (Serving Record)";

    // Basic format validation
    if (!armyNo || armyNo.length < 5) {
      alert("Please enter a valid Army / Service Number (e.g. JC-245890P or 15284920A)");
      return;
    }

    if (!fullName) {
      alert("Please enter the Service Personnel / Dependent full name.");
      return;
    }

    // Switch to processing stage
    this.step1.classList.add("hidden");
    this.step2.classList.remove("hidden");

    const statusText = document.getElementById("processing-status-text");
    const progressBar = document.getElementById("verification-progress-fill");

    const steps = [
      { pct: 25, text: "Validating Military Service Number format..." },
      { pct: 50, text: "Consulting simulated Army Records & Regiment Register..." },
      { pct: 75, text: "Verifying encrypted credentials & document integrity..." },
      { pct: 100, text: "Verification complete! Synthesizing Veer Setu Digital Pass..." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        if (progressBar) progressBar.style.width = `${steps[currentStep].pct}%`;
        if (statusText) statusText.textContent = steps[currentStep].text;
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          this.showVerificationResult({
            category: serviceCategory,
            armyNo,
            fullName,
            rank,
            regiment,
            ppoNo,
            verifiedAt: new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })
          });
        }, 600);
      }
    }, 600);
  }

  showVerificationResult(data) {
    this.step2.classList.add("hidden");
    this.step3.classList.remove("hidden");

    // Generate random pass hash
    const passId = "VS-" + Math.floor(100000 + Math.random() * 900000);
    const categoryLabels = {
      serving: "Serving Personnel",
      veteran: "Ex-Serviceman (Veteran)",
      veernari: "Veer Nari / War Widow",
      dependent: "Dependent Ward / Family"
    };

    // Populate Pass Card HTML
    if (this.passCard) {
      this.passCard.innerHTML = `
        <div class="digital-pass-inner">
          <div class="pass-header">
            <div class="pass-brand">
              <span class="pass-flag-accent"></span>
              <div>
                <h4 class="pass-motto">VEER SETU • DIGITAL WELFARE PASS</h4>
                <p class="pass-subtitle">Welfare & Entitlement Verification Card 🇮🇳</p>
              </div>
            </div>
            <div class="pass-badge">
              <span class="status-verified-pill"><i class="fa-solid fa-circle-check"></i> VERIFIED ELIGIBLE</span>
            </div>
          </div>

          <div class="pass-body">
            <div class="pass-avatar">
              <div class="avatar-shield">
                <i class="fa-solid fa-user-shield"></i>
              </div>
              <span class="pass-id-label">PASS ID</span>
              <span class="pass-id-code">${passId}</span>
            </div>

            <div class="pass-details-grid">
              <div class="detail-cell">
                <label>Full Name</label>
                <strong>${data.fullName}</strong>
              </div>
              <div class="detail-cell">
                <label>Army / Service No.</label>
                <strong class="text-saffron">${data.armyNo}</strong>
              </div>
              <div class="detail-cell">
                <label>Rank & Arm</label>
                <strong>${data.rank} • ${data.regiment}</strong>
              </div>
              <div class="detail-cell">
                <label>Category</label>
                <strong class="text-green">${categoryLabels[data.category] || data.category}</strong>
              </div>
              <div class="detail-cell">
                <label>PPO / Record ID</label>
                <strong>${data.ppoNo}</strong>
              </div>
              <div class="detail-cell">
                <label>Issued On</label>
                <strong>${data.verifiedAt}</strong>
              </div>
            </div>

            <div class="pass-qr-box">
              <svg class="qr-svg" viewBox="0 0 100 100" width="84" height="84">
                <rect width="100" height="100" fill="#303C36" rx="6"/>
                <rect x="8" y="8" width="28" height="28" fill="#526B60" rx="2"/>
                <rect x="14" y="14" width="16" height="16" fill="#F1EEE6"/>
                <rect x="64" y="8" width="28" height="28" fill="#526B60" rx="2"/>
                <rect x="70" y="14" width="16" height="16" fill="#F1EEE6"/>
                <rect x="8" y="64" width="28" height="28" fill="#526B60" rx="2"/>
                <rect x="14" y="70" width="16" height="16" fill="#F1EEE6"/>
                <circle cx="50" cy="50" r="10" fill="#DE7928"/>
                <rect x="42" y="12" width="6" height="16" fill="#D5C9BA"/>
                <rect x="78" y="44" width="14" height="6" fill="#D5C9BA"/>
                <rect x="44" y="72" width="24" height="6" fill="#D5C9BA"/>
                <rect x="72" y="72" width="16" height="16" fill="#D5C9BA"/>
              </svg>
              <span class="qr-caption">Scan for Digital Proof</span>
            </div>
          </div>

          <div class="pass-footer">
            <div class="schemes-entitlement">
              <span class="entitlement-title"><i class="fa-solid fa-list-check text-saffron"></i> Pre-Qualified Schemes (${this.getQualifiedCount(data.category)}):</span>
              <div class="tags-row">
                ${this.renderQualifiedPills(data.category)}
              </div>
            </div>
            <div class="academic-disclaimer">
              <i class="fa-solid fa-shield-halved"></i> Demonstration Prototype: Veer Setu Academic Project. Not an official MoD identity card.
            </div>
          </div>
        </div>
      `;
    }
  }

  getQualifiedCount(category) {
    if (typeof VEER_SETU_SCHEMES === "undefined") return 6;
    const matches = VEER_SETU_SCHEMES.filter(s => s.targetAudience.includes(category));
    return matches.length;
  }

  renderQualifiedPills(category) {
    if (typeof VEER_SETU_SCHEMES === "undefined") {
      return `<span class="pill">ECHS Healthcare</span><span class="pill">PMSS Scholarship</span><span class="pill">CSD AFD</span>`;
    }
    const matches = VEER_SETU_SCHEMES.filter(s => s.targetAudience.includes(category)).slice(0, 4);
    return matches.map(s => `<span class="pill" title="${s.title}">${s.title.split('(')[0]}</span>`).join("");
  }

  resetVerification() {
    if (this.form) this.form.reset();
    if (this.fileNameDisplay) this.fileNameDisplay.innerHTML = "";
    this.selectedFile = null;
    this.step3.classList.add("hidden");
    this.step2.classList.add("hidden");
    this.step1.classList.remove("hidden");
  }
}

// Instantiate on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  new VeerSetuVerifier();
});

