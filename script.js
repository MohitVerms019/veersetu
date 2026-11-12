/**
 * VEER SETU 🇮🇳 - Classic Authentication Controller (script.js)
 * Clean, lightweight, and robust client-side validation & interactivity.
 */

document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggles();
  initPasswordStrengthMeter();
  initLoginForm();
  initRegisterForm();
  initForgotPasswordModal();
  initTermsModal();
});

/* ====================================================
   1. SHOW / HIDE PASSWORD TOGGLE
   ==================================================== */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".eye-toggle-btn");

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetInputId = btn.getAttribute("data-target");
      const targetInput = document.getElementById(targetInputId);
      const icon = btn.querySelector("i");

      if (!targetInput) return;

      if (targetInput.type === "password") {
        targetInput.type = "text";
        if (icon) {
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        }
        btn.setAttribute("aria-label", "Hide password");
      } else {
        targetInput.type = "password";
        if (icon) {
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
        btn.setAttribute("aria-label", "Show password");
      }
    });
  });
}

/* ====================================================
   2. PASSWORD STRENGTH METER (Classic Natural Styling)
   ==================================================== */
function initPasswordStrengthMeter() {
  const pwdInput = document.getElementById("reg-password");
  const meterFill = document.getElementById("strength-meter-fill");
  const strengthState = document.getElementById("strength-result-state");

  const ruleLength = document.getElementById("rule-length");
  const ruleUpper = document.getElementById("rule-upper");
  const ruleNumber = document.getElementById("rule-number");
  const ruleSpecial = document.getElementById("rule-special");

  if (!pwdInput || !meterFill) return;

  pwdInput.addEventListener("input", (e) => {
    const val = e.target.value;
    let score = 0;

    // 1. Min 8 characters
    const hasLength = val.length >= 8;
    updateRuleState(ruleLength, hasLength);
    if (hasLength) score++;

    // 2. Uppercase letter
    const hasUpper = /[A-Z]/.test(val);
    updateRuleState(ruleUpper, hasUpper);
    if (hasUpper) score++;

    // 3. Number
    const hasNumber = /[0-9]/.test(val);
    updateRuleState(ruleNumber, hasNumber);
    if (hasNumber) score++;

    // 4. Special symbol
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val);
    updateRuleState(ruleSpecial, hasSpecial);
    if (hasSpecial) score++;

    // Update meter fill and text states with earthy, calm tones
    if (val.length === 0) {
      meterFill.style.width = "0%";
      meterFill.style.backgroundColor = "var(--warm-beige)";
      if (strengthState) {
        strengthState.textContent = "None";
        strengthState.style.color = "var(--text-muted)";
      }
    } else if (score <= 1) {
      meterFill.style.width = "25%";
      meterFill.style.backgroundColor = "#A34E45"; // Warm Terracotta / Red
      if (strengthState) {
        strengthState.textContent = "Weak";
        strengthState.style.color = "#A34E45";
      }
    } else if (score === 2) {
      meterFill.style.width = "50%";
      meterFill.style.backgroundColor = "#B9AA98"; // Warm Beige
      if (strengthState) {
        strengthState.textContent = "Moderate";
        strengthState.style.color = "#6F897D";
      }
    } else if (score === 3) {
      meterFill.style.width = "75%";
      meterFill.style.backgroundColor = "#526B60"; // Forest Grey
      if (strengthState) {
        strengthState.textContent = "Good";
        strengthState.style.color = "#526B60";
      }
    } else if (score === 4) {
      meterFill.style.width = "100%";
      meterFill.style.backgroundColor = "#303C36"; // Deep Charcoal Green
      if (strengthState) {
        strengthState.textContent = "Strong (Protected)";
        strengthState.style.color = "#303C36";
      }
    }
  });

  // Real-time confirm password matching check
  const confirmPwdInput = document.getElementById("reg-confirm-password");
  if (confirmPwdInput) {
    confirmPwdInput.addEventListener("input", validatePasswordMatch);
  }
}

function updateRuleState(element, isValid) {
  if (!element) return;
  const icon = element.querySelector("i");
  if (isValid) {
    element.classList.add("valid");
    if (icon) {
      icon.className = "fa-solid fa-check";
    }
  } else {
    element.classList.remove("valid");
    if (icon) {
      icon.className = "fa-regular fa-circle";
    }
  }
}

function validatePasswordMatch() {
  const pwd = document.getElementById("reg-password");
  const confirmPwd = document.getElementById("reg-confirm-password");
  const parent = confirmPwd ? confirmPwd.closest(".field-group") : null;

  if (!pwd || !confirmPwd || !parent) return true;

  if (confirmPwd.value && pwd.value !== confirmPwd.value) {
    parent.classList.add("has-error");
    return false;
  } else {
    parent.classList.remove("has-error");
    return true;
  }
}

/* ====================================================
   3. LOGIN FORM VALIDATION & SIMULATION
   ==================================================== */
function initLoginForm() {
  const loginForm = document.getElementById("veer-setu-login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    const submitBtn = document.getElementById("login-submit-btn");

    let isValid = true;

    // Username / Email validation
    if (!usernameInput.value.trim()) {
      setFieldError(usernameInput, "Please enter your Email Address or Army Username.");
      isValid = false;
    } else {
      clearFieldError(usernameInput);
    }

    // Password validation
    if (!passwordInput.value) {
      setFieldError(passwordInput, "Please enter your account password.");
      isValid = false;
    } else if (passwordInput.value.length < 6) {
      setFieldError(passwordInput, "Password must contain at least 6 characters.");
      isValid = false;
    } else {
      clearFieldError(passwordInput);
    }

    if (!isValid) return;

    // Feedback simulation
    submitBtn.classList.add("loading");
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...`;

    setTimeout(() => {
      submitBtn.classList.remove("loading");
      submitBtn.innerHTML = `<span>Login to Welfare Portal</span> <i class="fa-solid fa-arrow-right"></i>`;

      showClassicToast("Identity Verified! Welcome to Veer Setu.", "success");

      setTimeout(() => {
        window.location.href = "index.html#welfare-schemes";
      }, 1200);
    }, 1100);
  });
}

/* ====================================================
   4. REGISTRATION FORM VALIDATION & SIMULATION
   ==================================================== */
function initRegisterForm() {
  const regForm = document.getElementById("veer-setu-register-form");
  if (!regForm) return;

  regForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("reg-name");
    const emailInput = document.getElementById("reg-email");
    const phoneInput = document.getElementById("reg-phone");
    const categorySelect = document.getElementById("reg-category");
    const pwdInput = document.getElementById("reg-password");
    const confirmPwdInput = document.getElementById("reg-confirm-password");
    const termsCheck = document.getElementById("reg-terms");
    const submitBtn = document.getElementById("register-submit-btn");

    let isValid = true;

    // Full Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
      setFieldError(nameInput, "Please enter your full legal name (minimum 3 characters).");
      isValid = false;
    } else {
      clearFieldError(nameInput);
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      setFieldError(emailInput, "Please provide a valid email address (e.g. name@domain.com).");
      isValid = false;
    } else {
      clearFieldError(emailInput);
    }

    // Mobile Number (Indian 10-digit format)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phoneInput.value.replace(/[\s\-\+]/g, "").slice(-10);
    if (!phoneRegex.test(cleanPhone)) {
      setFieldError(phoneInput, "Please enter a valid 10-digit mobile number.");
      isValid = false;
    } else {
      clearFieldError(phoneInput);
    }

    // User Category
    if (!categorySelect.value) {
      setFieldError(categorySelect, "Please select an applicable service category.");
      isValid = false;
    } else {
      clearFieldError(categorySelect);
    }

    // Password criteria
    if (!pwdInput.value || pwdInput.value.length < 8) {
      setFieldError(pwdInput, "Password must be at least 8 characters with upper, number & symbol.");
      isValid = false;
    } else {
      clearFieldError(pwdInput);
    }

    if (pwdInput.value !== confirmPwdInput.value) {
      setFieldError(confirmPwdInput, "Passwords do not match. Please verify.");
      isValid = false;
    } else {
      clearFieldError(confirmPwdInput);
    }

    // Terms
    if (!termsCheck.checked) {
      showClassicToast("Please acknowledge the Terms of Service to proceed.", "error");
      isValid = false;
    }

    if (!isValid) return;

    // Submit Simulation
    submitBtn.classList.add("loading");
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Creating Defense Profile...`;

    setTimeout(() => {
      submitBtn.classList.remove("loading");
      submitBtn.innerHTML = `<span>Complete Registration</span> <i class="fa-solid fa-arrow-right"></i>`;

      showClassicToast("Account Created Successfully! Navigating to Login...", "success");

      setTimeout(() => {
        window.location.href = "login.html?registered=true";
      }, 1400);
    }, 1300);
  });
}

function setFieldError(inputElement, message) {
  const group = inputElement.closest(".field-group");
  if (!group) return;
  group.classList.add("has-error");
  const msgEl = group.querySelector(".field-error-hint");
  if (msgEl) {
    msgEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
  }
}

function clearFieldError(inputElement) {
  const group = inputElement.closest(".field-group");
  if (!group) return;
  group.classList.remove("has-error");
}

/* ====================================================
   5. FORGOT PASSWORD MODAL
   ==================================================== */
function initForgotPasswordModal() {
  const openLink = document.getElementById("forgot-password-link");
  const modal = document.getElementById("forgot-password-modal");
  const closeBtn = document.getElementById("close-forgot-modal");
  const form = document.getElementById("forgot-password-form");

  if (!modal) return;

  if (openLink) {
    openLink.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.add("active");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("forgot-email-input");
      if (input && input.value.trim()) {
        modal.classList.remove("active");
        showClassicToast(`Verification code sent to ${input.value.trim()}!`, "info");
        form.reset();
      }
    });
  }
}

/* ====================================================
   6. TERMS & CONDITIONS MODAL
   ==================================================== */
function initTermsModal() {
  const openTermsBtn = document.getElementById("view-terms-link");
  const termsModal = document.getElementById("terms-modal");
  const closeTermsBtn = document.getElementById("close-terms-modal");

  if (!termsModal) return;

  if (openTermsBtn) {
    openTermsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      termsModal.classList.add("active");
    });
  }

  if (closeTermsBtn) {
    closeTermsBtn.addEventListener("click", () => {
      termsModal.classList.remove("active");
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === termsModal) {
      termsModal.classList.remove("active");
    }
  });
}

/* ====================================================
   7. CLASSIC TOAST NOTIFICATIONS
   ==================================================== */
function showClassicToast(message, type = "info") {
  let container = document.getElementById("classic-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "classic-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `classic-toast-pill toast-${type}`;

  const icons = {
    success: "fa-circle-check",
    error: "fa-triangle-exclamation",
    info: "fa-circle-info"
  };

  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || 'fa-bell'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}
