(function () {
  "use strict";

  const API_BASE = 'http://127.0.0.1:8000/api';

  /* ════════════════════════════════════════════════════════════════════════════
     SHARED HELPERS
  ════════════════════════════════════════════════════════════════════════════ */

  /**
   * Show a field-level validation error beneath an input element.
   * @param {HTMLElement} inputEl
   * @param {string} message
   */
  function showFieldError(inputEl, message) {
    clearFieldError(inputEl);
    inputEl.classList.add('field-error');

    const errorId = `err-${inputEl.id || Math.random().toString(36).slice(2)}`;
    const span = document.createElement('span');
    span.className = 'error-msg';
    span.id = errorId;
    span.setAttribute('role', 'alert');
    span.textContent = message;

    inputEl.setAttribute('aria-describedby', errorId);
    inputEl.parentNode.insertBefore(span, inputEl.nextSibling);
  }

  /**
   * Clear field-level error state.
   * @param {HTMLElement} inputEl
   */
  function clearFieldError(inputEl) {
    inputEl.classList.remove('field-error');
    inputEl.removeAttribute('aria-describedby');
    const existing = inputEl.parentNode.querySelector('.error-msg');
    if (existing) existing.remove();
  }

  /**
   * Show a form-level banner (success or error) at the top of a form container.
   * @param {HTMLElement} containerEl
   * @param {string} message
   * @param {'success'|'error'} type
   */
  function showFormBanner(containerEl, message, type) {
    // Remove old banner if any
    const old = containerEl.querySelector('.form-banner');
    if (old) old.remove();

    const banner = document.createElement('div');
    banner.className = `form-banner form-banner--${type}`;
    banner.setAttribute('role', type === 'error' ? 'alert' : 'status');
    banner.setAttribute('aria-live', 'polite');

    const icon = type === 'success' ? '✔' : '✖';
    banner.innerHTML = `<span class="form-banner__icon">${icon}</span> ${message}`;

    containerEl.insertBefore(banner, containerEl.firstChild);

    // Scroll banner into view
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Delegate to global toast system if available.
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   */
  function showToast(message, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
    }
  }

  /* ────────────────────────────────────────────────────────────────────────────
     USER CATEGORY SELECTOR (shared between login & register)
  ──────────────────────────────────────────────────────────────────────────── */
  function initUserCategorySelector() {
    const catBtns = document.querySelectorAll('.user-cat-btn');
    const hiddenInput = document.getElementById('user-category');
    if (!catBtns.length) return;

    catBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        catBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        if (hiddenInput) hiddenInput.value = btn.dataset.value || btn.textContent.trim();
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════════════
     LOGIN PAGE
  ════════════════════════════════════════════════════════════════════════════ */
  function initLoginPage() {
    const form = document.getElementById('login-form');
    if (!form) return;

    initUserCategorySelector();

    // ── Password visibility toggle ───────────────────────────────────────────
    const passInput = document.getElementById('login-password');
    const passToggle = document.getElementById('show-login-pass');

    if (passInput && passToggle) {
      passToggle.addEventListener('click', () => {
        const isHidden = passInput.type === 'password';
        passInput.type = isHidden ? 'text' : 'password';
        passToggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
        const icon = passToggle.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-eye', !isHidden);
          icon.classList.toggle('fa-eye-slash', isHidden);
        }
      });
    }

    // ── Form submit ──────────────────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const usernameEl = form.querySelector('#login-username') || form.querySelector('#login-email');
      const passwordEl = document.getElementById('login-password');
      const userCategoryEl = document.getElementById('user-category');

      // Clear previous errors
      if (usernameEl) clearFieldError(usernameEl);
      if (passwordEl) clearFieldError(passwordEl);

      let valid = true;

      if (!usernameEl || !usernameEl.value.trim()) {
        if (usernameEl) showFieldError(usernameEl, 'Please enter your username or email.');
        valid = false;
      }

      if (!passwordEl || !passwordEl.value.trim()) {
        if (passwordEl) showFieldError(passwordEl, 'Please enter your password.');
        valid = false;
      }

      if (!valid) return;

      const userCategory = userCategoryEl ? userCategoryEl.value : '';
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Signing in…'; }

      try {
        const response = await fetch(`${API_BASE}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: usernameEl.value.trim(),
            password: passwordEl.value,
            role: userCategory
          })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          // Store auth data
          localStorage.setItem('vs_auth_token', data.token || data.access || '');
          localStorage.setItem('vs_user_role', userCategory || data.role || '');
          showToast('Login successful! Redirecting…', 'success');
          setTimeout(() => {
            window.location.href = '../dashboard.html';
          }, 800);
        } else if (response.status === 401) {
          showFormBanner(form, 'Invalid credentials. Please check your username and password.', 'error');
        } else if (response.status === 423) {
          showFormBanner(form, 'Account temporarily locked due to multiple failed attempts. Try again in 30 minutes.', 'error');
        } else {
          showFormBanner(form, data.detail || 'Login failed. Please try again.', 'error');
        }
      } catch {
        showFormBanner(form, 'Unable to connect to the Veer Setu server. Please try again.', 'error');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
      }
    });

    // ── Forgot password modal ────────────────────────────────────────────────
    const forgotLink = document.getElementById('forgot-pass-link');
    const forgotModal = document.getElementById('forgot-modal');
    const forgotForm = document.getElementById('forgot-form');
    const modalCloseButtons = forgotModal ? forgotModal.querySelectorAll('[data-modal-close], .modal-close, .modal-overlay-bg') : [];

    if (forgotLink && forgotModal) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotModal.classList.add('active');
        forgotModal.setAttribute('aria-hidden', 'false');
      });
    }

    modalCloseButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        forgotModal.classList.remove('active');
        forgotModal.setAttribute('aria-hidden', 'true');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && forgotModal && forgotModal.classList.contains('active')) {
        forgotModal.classList.remove('active');
        forgotModal.setAttribute('aria-hidden', 'true');
      }
    });

    if (forgotForm) {
      forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailEl = forgotForm.querySelector('input[type="email"]') || forgotForm.querySelector('#forgot-email');
        if (!emailEl || !emailEl.value.trim()) {
          if (emailEl) showFieldError(emailEl, 'Please enter your email address.');
          return;
        }

        const submitBtn = forgotForm.querySelector('[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; }

        try {
          const response = await fetch(`${API_BASE}/auth/password-reset/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailEl.value.trim() })
          });

          if (response.ok) {
            showFormBanner(forgotForm, 'Password reset link sent! Please check your email.', 'success');
          } else {
            showFormBanner(forgotForm, 'Could not send reset link. Please verify your email.', 'error');
          }
        } catch {
          showFormBanner(forgotForm, 'Unable to connect. Please try again later.', 'error');
        } finally {
          if (submitBtn) { submitBtn.disabled = false; }
        }
      });
    }
  }

  /* ════════════════════════════════════════════════════════════════════════════
     REGISTER PAGE
  ════════════════════════════════════════════════════════════════════════════ */

  /**
   * Calculate password strength score and label.
   * @param {string} password
   * @returns {{ score: number, label: string }}
   */
  function checkStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    return { score, label: labels[score] };
  }

  function initRegisterPage() {
    const form = document.getElementById('register-form');
    if (!form) return;

    initUserCategorySelector();

    const passwordEl = document.getElementById('reg-password');
    const confirmEl = document.getElementById('reg-confirm-password');
    const strengthBar = document.querySelector('.strength-bar-fill');
    const strengthLabel = document.querySelector('.strength-label');

    // ── Password strength meter ──────────────────────────────────────────────
    const STRENGTH_COLORS = ['#c0392b', '#e67e22', '#f1c40f', '#27ae60', '#1a6b3c'];

    if (passwordEl && strengthBar && strengthLabel) {
      passwordEl.addEventListener('input', () => {
        const { score, label } = checkStrength(passwordEl.value);
        const pct = (score / 4) * 100;
        strengthBar.style.width = `${pct}%`;
        strengthBar.style.backgroundColor = STRENGTH_COLORS[score] || STRENGTH_COLORS[0];
        strengthLabel.textContent = passwordEl.value.length ? label : '';
      });
    }

    // ── Confirm password live check ──────────────────────────────────────────
    if (confirmEl && passwordEl) {
      confirmEl.addEventListener('input', () => {
        if (confirmEl.value && confirmEl.value !== passwordEl.value) {
          showFieldError(confirmEl, 'Passwords do not match.');
        } else {
          clearFieldError(confirmEl);
        }
      });
    }

    // ── Show/hide password toggles ───────────────────────────────────────────
    function setupPassToggle(inputId, toggleId) {
      const input = document.getElementById(inputId);
      const toggle = document.getElementById(toggleId);
      if (!input || !toggle) return;

      toggle.addEventListener('click', () => {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        const icon = toggle.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-eye', !show);
          icon.classList.toggle('fa-eye-slash', show);
        }
      });
    }

    setupPassToggle('reg-password', 'show-reg-pass');
    setupPassToggle('reg-confirm-password', 'show-reg-confirm-pass');

    // ── Terms & Conditions modal ─────────────────────────────────────────────
    const termsLink = document.getElementById('terms-link');
    const termsModal = document.getElementById('terms-modal');
    const acceptTermsBtn = document.getElementById('accept-terms-btn');
    const termsCheckbox = document.getElementById('terms-checkbox');
    const termsCloseButtons = termsModal ? termsModal.querySelectorAll('[data-modal-close], .modal-close') : [];

    if (termsLink && termsModal) {
      termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        termsModal.classList.add('active');
        termsModal.setAttribute('aria-hidden', 'false');
      });
    }

    termsCloseButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        termsModal.classList.remove('active');
        termsModal.setAttribute('aria-hidden', 'true');
      });
    });

    if (acceptTermsBtn && termsCheckbox && termsModal) {
      acceptTermsBtn.addEventListener('click', () => {
        termsCheckbox.checked = true;
        clearFieldError(termsCheckbox);
        termsModal.classList.remove('active');
        termsModal.setAttribute('aria-hidden', 'true');
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && termsModal && termsModal.classList.contains('active')) {
        termsModal.classList.remove('active');
        termsModal.setAttribute('aria-hidden', 'true');
      }
    });

    // ── Form submit ──────────────────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fields = {
        fullName: form.querySelector('#reg-fullname'),
        email: form.querySelector('#reg-email'),
        mobile: form.querySelector('#reg-mobile'),
        password: document.getElementById('reg-password'),
        confirm: document.getElementById('reg-confirm-password'),
        terms: document.getElementById('terms-checkbox'),
        category: document.getElementById('user-category')
      };

      // Clear existing errors
      Object.values(fields).forEach((el) => { if (el && el.type !== 'checkbox' && el.id !== 'user-category') clearFieldError(el); });

      let valid = true;
      const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const MOBILE_RE = /^\d{10}$/;

      if (!fields.fullName || !fields.fullName.value.trim()) {
        if (fields.fullName) showFieldError(fields.fullName, 'Full name is required.');
        valid = false;
      }

      if (!fields.email || !EMAIL_RE.test(fields.email.value.trim())) {
        if (fields.email) showFieldError(fields.email, 'Please enter a valid email address.');
        valid = false;
      }

      if (!fields.mobile || !MOBILE_RE.test(fields.mobile.value.trim())) {
        if (fields.mobile) showFieldError(fields.mobile, 'Please enter a valid 10-digit mobile number.');
        valid = false;
      }

      if (fields.password) {
        const { score } = checkStrength(fields.password.value);
        if (score < 2) {
          showFieldError(fields.password, 'Password too weak. Use at least 8 characters with uppercase and a number.');
          valid = false;
        }
      } else {
        valid = false;
      }

      if (fields.confirm && fields.confirm.value !== (fields.password ? fields.password.value : '')) {
        if (fields.confirm) showFieldError(fields.confirm, 'Passwords do not match.');
        valid = false;
      }

      if (!fields.terms || !fields.terms.checked) {
        if (fields.terms) showFieldError(fields.terms, 'You must accept the Terms & Conditions.');
        valid = false;
      }

      if (!fields.category || !fields.category.value) {
        showFormBanner(form, 'Please select your user category (Veteran, Recruit, or Civilian).', 'error');
        valid = false;
      }

      if (!valid) return;

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating Account…'; }

      const payload = {
        full_name: fields.fullName.value.trim(),
        email: fields.email.value.trim(),
        mobile: fields.mobile.value.trim(),
        password: fields.password.value,
        role: fields.category.value
      };

      try {
        const response = await fetch(`${API_BASE}/auth/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 201) {
          showFormBanner(form, 'Account created successfully! Redirecting to login…', 'success');
          showToast('Registration successful!', 'success');
          setTimeout(() => {
            window.location.href = 'login.html?registered=1';
          }, 2500);
        } else if (response.status === 400) {
          if (data.email) {
            showFieldError(fields.email, 'An account with this email already exists.');
          } else {
            showFormBanner(form, data.detail || 'Registration failed. Please check your details.', 'error');
          }
        } else {
          showFormBanner(form, data.detail || 'An unexpected error occurred. Please try again.', 'error');
        }
      } catch {
        showFormBanner(form, 'Unable to connect to the Veer Setu server. Please try again.', 'error');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
      }
    });
  }

  /* ════════════════════════════════════════════════════════════════════════════
     BOOTSTRAP
  ════════════════════════════════════════════════════════════════════════════ */
  function initAuth() {
    initLoginPage();
    initRegisterPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }

})();
