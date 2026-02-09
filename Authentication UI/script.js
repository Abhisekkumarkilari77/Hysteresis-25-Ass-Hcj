// Shared utilities
const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_LOGIN_IDENTIFIER = "demo@example.com";
const DEFAULT_LOGIN_PASSWORD = "Password123";

function isValidEmail(value) {
  return EMAIL_REGEX.test(String(value).trim());
}

function evaluatePasswordStrength(password) {
  const value = String(password || "");
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  if (!value) return { level: 0, label: "Password strength" };
  if (score <= 2) return { level: 33, label: "Weak" };
  if (score === 3 || score === 4) return { level: 66, label: "Medium" };
  return { level: 100, label: "Strong" };
}

// Toast notifications
function createToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = "success", timeout = 2800) {
  const container = createToastContainer();
  const toast = document.createElement("div");
  toast.className = "toast" + (type === "error" ? " toast--error" : "");
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  const indicator = document.createElement("div");
  indicator.className = "toast__indicator";

  const msg = document.createElement("div");
  msg.className = "toast__message";
  msg.textContent = message;

  const dismiss = document.createElement("button");
  dismiss.className = "toast__dismiss";
  dismiss.type = "button";
  dismiss.textContent = "×";
  dismiss.addEventListener("click", () => {
    container.removeChild(toast);
  });

  toast.appendChild(indicator);
  toast.appendChild(msg);
  toast.appendChild(dismiss);
  container.appendChild(toast);

  setTimeout(() => {
    if (container.contains(toast)) {
      container.removeChild(toast);
    }
  }, timeout);
}

// Theme toggle
function initThemeToggle() {
  const storedTheme = localStorage.getItem("auth-ui-theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme =
    storedTheme || (prefersDark ? "dark" : "light");
  applyTheme(initialTheme);

  document
    .querySelectorAll(".theme-toggle")
    .forEach((btn) => {
      const label = btn.querySelector(".theme-toggle-label");
      const updateLabel = () => {
        const current =
          document.body.classList.contains("dark-theme") ? "Dark" : "Light";
        if (label) label.textContent = current;
      };

      btn.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("dark-theme")
          ? "light"
          : "dark";
        applyTheme(nextTheme);
        updateLabel();
      });

      updateLabel();
    });
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
  localStorage.setItem("auth-ui-theme", theme);
}

// Password visibility
function initPasswordToggles() {
  document
    .querySelectorAll(".password-toggle")
    .forEach((toggleBtn) => {
      toggleBtn.addEventListener("click", () => {
        const wrapper = toggleBtn.closest(".password-input-wrapper");
        if (!wrapper) return;
        const input = wrapper.querySelector("input[type='password'], input[type='text']");
        if (!input) return;
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        toggleBtn.textContent = isPassword ? "Hide" : "Show";
        toggleBtn.setAttribute(
          "aria-label",
          isPassword ? "Hide password" : "Show password"
        );
      });
    });
}

// Forms
function setFieldError(fieldWrapper, message) {
  if (!fieldWrapper) return;
  const errorEl = fieldWrapper.querySelector(".field-error");
  if (!errorEl) return;
  errorEl.textContent = message || "";
}

function getFieldWrapper(input) {
  return input.closest(".form-field");
}

function withLoading(button, fn) {
  if (!button) {
    fn();
    return;
  }
  button.disabled = true;
  button.classList.add("loading");
  fn();
  setTimeout(() => {
    button.disabled = false;
    button.classList.remove("loading");
  }, 1200);
}

// Login form
function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  const identifierInput = document.getElementById("login-identifier");
  const passwordInput = document.getElementById("login-password");
  const rememberCheckbox = document.getElementById("remember-me");
  const submitBtn = document.getElementById("login-submit");

  // Prefill identifier: use stored value if Remember Me was checked previously,
  // otherwise fall back to the demo credentials for convenience.
  const storedIdentifier = localStorage.getItem("auth-ui-remember-identifier");
  if (identifierInput) {
    if (storedIdentifier) {
      identifierInput.value = storedIdentifier;
      if (rememberCheckbox) {
        rememberCheckbox.checked = true;
      }
    } else {
      identifierInput.value = DEFAULT_LOGIN_IDENTIFIER;
    }
  }

  if (passwordInput) {
    passwordInput.value = DEFAULT_LOGIN_PASSWORD;
  }

  function validateLogin(showErrors = false) {
    let isValid = true;

    if (identifierInput) {
      const value = identifierInput.value.trim();
      const wrapper = getFieldWrapper(identifierInput);
      let error = "";
      if (!value) {
        error = "Please enter your email or username.";
        isValid = false;
      }
      if (showErrors) {
        setFieldError(wrapper, error);
      }
    }

    if (passwordInput) {
      const value = passwordInput.value;
      const wrapper = getFieldWrapper(passwordInput);
      let error = "";
      if (!value) {
        error = "Please enter your password.";
        isValid = false;
      }
      if (showErrors) {
        setFieldError(wrapper, error);
      }
    }

    if (submitBtn) {
      submitBtn.disabled = !isValid;
    }

    return isValid;
  }

  form.addEventListener("input", () => {
    validateLogin(false);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const isValid = validateLogin(true);
    if (!isValid) {
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    withLoading(submitBtn, () => {
      // Remember identifier
      if (identifierInput && rememberCheckbox) {
        if (rememberCheckbox.checked) {
          localStorage.setItem(
            "auth-ui-remember-identifier",
            identifierInput.value.trim()
          );
        } else {
          localStorage.removeItem("auth-ui-remember-identifier");
        }
      }

      showToast("Logged in (UI only).", "success");

      // Navigate to a simple welcome page after a short delay.
      setTimeout(() => {
        window.location.href = "welcome.html";
      }, 900);
    });
  });
}

// Signup form
function initSignupForm() {
  const form = document.getElementById("signup-form");
  if (!form) return;

  const nameInput = document.getElementById("signup-name");
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");
  const confirmPasswordInput = document.getElementById(
    "signup-confirm-password"
  );
  const termsCheckbox = document.getElementById("signup-terms");
  const submitBtn = document.getElementById("signup-submit");

  const strengthBar = document.querySelector(".password-strength-bar");
  const strengthLabel = document.querySelector(".password-strength-label");

  function updateStrength() {
    if (!passwordInput || !strengthBar || !strengthLabel) return;
    const { level, label } = evaluatePasswordStrength(passwordInput.value);
    strengthBar.style.setProperty("--strength", `${level}%`);
    strengthBar.style.setProperty(
      "background-size",
      `${level}% 100%`
    );
    strengthBar.style.setProperty("width", "100%");
    strengthBar.style.setProperty(
      "--strength-width",
      `${level}%`
    );
    strengthBar.style.setProperty(
      "clip-path",
      `inset(0 ${100 - level}% 0 0)`
    );
    strengthBar.style.setProperty(
      "mask-image",
      "linear-gradient(to right, #000 0, #000)"
    );
    strengthBar.style.setProperty(
      "overflow",
      "hidden"
    );
    strengthBar.style.setProperty(
      "position",
      "relative"
    );
    strengthBar.style.setProperty(
      "--pw-strength",
      `${level}`
    );
    strengthBar.style.setProperty(
      "--pw-label",
      `"${label}"`
    );
    strengthBar.style.setProperty(
      "--pw-color",
      level < 34 ? "#f97316" : level < 67 ? "#eab308" : "#15803d"
    );
    strengthBar.style.background = `linear-gradient(90deg, #f97316, #eab308, #15803d)`;
    strengthBar.style.setProperty(
      "box-shadow",
      level ? "0 0 0 1px rgba(15,23,42,0.05)" : "none"
    );
    strengthBar.style.setProperty(
      "transform",
      level ? "scaleY(1.05)" : "none"
    );
    strengthBar.style.setProperty(
      "transform-origin",
      "center"
    );
    strengthBar.style.setProperty(
      "transition",
      "box-shadow 0.16s ease, transform 0.16s ease"
    );
    strengthBar.style.setProperty(
      "--pw-width",
      `${level}`
    );

    strengthBar.style.setProperty(
      "background-image",
      "linear-gradient(90deg, #f97316, #eab308, #15803d)"
    );

    strengthBar.style.setProperty(
      "background-position",
      "left center"
    );

    strengthLabel.textContent = label;
    strengthBar.style.setProperty(
      "--pw-strength-percent",
      `${level}%`
    );
    strengthBar.style.setProperty(
      "--pw-strength-label",
      `"${label}"`
    );
    // visual fill via ::after width
    strengthBar.style.setProperty(
      "--after-width",
      `${level}%`
    );
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", updateStrength);
  }

  function validateSignup(showErrors = false) {
    let isValid = true;

    if (nameInput) {
      const value = nameInput.value.trim();
      const wrapper = getFieldWrapper(nameInput);
      let error = "";
      if (!value) {
        error = "Please enter your full name.";
        isValid = false;
      }
      if (showErrors) setFieldError(wrapper, error);
    }

    if (emailInput) {
      const value = emailInput.value.trim();
      const wrapper = getFieldWrapper(emailInput);
      let error = "";
      if (!value) {
        error = "Email is required.";
        isValid = false;
      } else if (!isValidEmail(value)) {
        error = "Please enter a valid email.";
        isValid = false;
      }
      if (showErrors) setFieldError(wrapper, error);
    }

    if (passwordInput) {
      const value = passwordInput.value;
      const wrapper = getFieldWrapper(passwordInput);
      let error = "";
      if (!value) {
        error = "Password is required.";
        isValid = false;
      } else if (value.length < 8) {
        error = "Use at least 8 characters.";
        isValid = false;
      } else if (
        !/[A-Z]/.test(value) ||
        !/[a-z]/.test(value) ||
        !/[0-9]/.test(value)
      ) {
        error = "Include upper, lower case and a number.";
        isValid = false;
      }
      if (showErrors) setFieldError(wrapper, error);
    }

    if (confirmPasswordInput && passwordInput) {
      const value = confirmPasswordInput.value;
      const wrapper = getFieldWrapper(confirmPasswordInput);
      let error = "";
      if (!value) {
        error = "Please confirm your password.";
        isValid = false;
      } else if (value !== passwordInput.value) {
        error = "Passwords do not match.";
        isValid = false;
      }
      if (showErrors) setFieldError(wrapper, error);
    }

    if (termsCheckbox) {
      const wrapper = getFieldWrapper(termsCheckbox);
      let error = "";
      if (!termsCheckbox.checked) {
        error = "You must accept the Terms & Conditions.";
        isValid = false;
      }
      if (showErrors) setFieldError(wrapper, error);
    }

    if (submitBtn) {
      submitBtn.disabled = !isValid;
    }

    return isValid;
  }

  form.addEventListener("input", () => {
    validateSignup(false);
  });

  if (termsCheckbox) {
    termsCheckbox.addEventListener("change", () => validateSignup(false));
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const isValid = validateSignup(true);
    if (!isValid) {
      showToast("Please review the highlighted fields.", "error");
      return;
    }

    withLoading(submitBtn, () => {
      showToast("Account created (UI only).", "success");
      form.reset();
      updateStrength();
      validateSignup(false);
    });
  });
}

// Forgot password form
function initForgotForm() {
  const form = document.getElementById("forgot-form");
  if (!form) return;

  const emailInput = document.getElementById("forgot-email");
  const submitBtn = document.getElementById("forgot-submit");
  const successMessage = document.getElementById("forgot-success");

  function validateForgot(showErrors = false) {
    let isValid = true;
    if (emailInput) {
      const value = emailInput.value.trim();
      const wrapper = getFieldWrapper(emailInput);
      let error = "";
      if (!value) {
        error = "Email is required.";
        isValid = false;
      } else if (!isValidEmail(value)) {
        error = "Please enter a valid email.";
        isValid = false;
      }
      if (showErrors) setFieldError(wrapper, error);
    }
    if (submitBtn) {
      submitBtn.disabled = !isValid;
    }
    return isValid;
  }

  form.addEventListener("input", () => validateForgot(false));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const isValid = validateForgot(true);
    if (!isValid) {
      showToast("Please enter a valid email.", "error");
      return;
    }

    withLoading(submitBtn, () => {
      if (successMessage) {
        successMessage.textContent =
          "If this email exists, a reset link has been sent (UI only).";
      }
      showToast("Reset link sent (UI only).", "success");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initPasswordToggles();
  initLoginForm();
  initSignupForm();
  initForgotForm();
});

