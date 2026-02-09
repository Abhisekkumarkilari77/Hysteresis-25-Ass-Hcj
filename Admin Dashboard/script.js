// Simple utility for Local Storage with JSON handling
const Storage = {
  get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Ignore quota/security errors in this demo.
    }
  },
};

const PERSIST_KEYS = {
  SIDEBAR_COLLAPSED: "admin-dashboard.sidebar-collapsed",
  THEME: "admin-dashboard.theme",
};

// Simple front-end authentication using Local Storage
const Auth = (() => {
  const DEFAULT_USER = {
    id: "admin",
    name: "Demo Admin",
    email: "admin@demo.com",
    password: "Admin@123",
    role: "admin",
  };

  function loadUsers() {
    return Storage.get("admin-dashboard.users", []);
  }

  function saveUsers(users) {
    Storage.set("admin-dashboard.users", users);
  }

  function ensureDefaultUser() {
    const users = loadUsers();
    const hasDefault = users.some((u) => u.email === DEFAULT_USER.email);
    if (!hasDefault) {
      users.push(DEFAULT_USER);
      saveUsers(users);
    }
  }

  function getCurrentUser() {
    return Storage.get("admin-dashboard.currentUser", null);
  }

  function setCurrentUser(user) {
    const safeUser = {
      id: user.id || user.email,
      name: user.name || user.email,
      email: user.email,
      role: user.role || "user",
    };
    Storage.set("admin-dashboard.currentUser", safeUser);
    return safeUser;
  }

  function updateProfileUI(user) {
    const nameEl = document.querySelector(".profile__name");
    const roleEl = document.querySelector(".profile__role");
    if (nameEl) nameEl.textContent = user.name || user.email;
    if (roleEl) {
      roleEl.textContent =
        user.role === "admin" ? "Administrator" : "Standard user";
    }
  }

  function showApp() {
    document.body.classList.add("is-authenticated");
  }

  function showAuth() {
    document.body.classList.remove("is-authenticated");
  }

  function handleLogin(onAuthenticated) {
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const errorEl = document.getElementById("loginError");
    if (!form || !emailInput || !passwordInput || !errorEl) return;

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;
      const users = loadUsers();
      const match = users.find(
        (u) => u.email.toLowerCase() === email && u.password === password
      );

      if (!match) {
        errorEl.textContent = "Invalid email or password for this demo.";
        return;
      }

      errorEl.textContent = "";
      const safeUser = setCurrentUser(match);
      updateProfileUI(safeUser);
      showApp();
      if (typeof onAuthenticated === "function") {
        onAuthenticated();
      }
    });
  }

  function handleSignup(onAuthenticated) {
    const form = document.getElementById("signupForm");
    const nameInput = document.getElementById("signupName");
    const emailInput = document.getElementById("signupEmail");
    const passwordInput = document.getElementById("signupPassword");
    const errorEl = document.getElementById("signupError");
    if (!form || !nameInput || !emailInput || !passwordInput || !errorEl) return;

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const name = nameInput.value.trim();
      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;

      if (!name || !email || !password) {
        errorEl.textContent = "Please fill in all fields.";
        return;
      }

      const users = loadUsers();
      const exists = users.some((u) => u.email.toLowerCase() === email);
      if (exists) {
        errorEl.textContent = "An account with this email already exists.";
        return;
      }

      const newUser = {
        id: email,
        name,
        email,
        password,
        role: "user",
      };
      users.push(newUser);
      saveUsers(users);

      errorEl.textContent = "";
      const safeUser = setCurrentUser(newUser);
      updateProfileUI(safeUser);
      showApp();
      if (typeof onAuthenticated === "function") {
        onAuthenticated();
      }
    });
  }

  function initTabs() {
    const tabs = document.querySelectorAll(".auth-tab");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    if (!tabs.length || !loginForm || !signupForm) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-auth-tab");
        tabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");

        if (target === "signup") {
          loginForm.classList.add("is-hidden");
          signupForm.classList.remove("is-hidden");
        } else {
          signupForm.classList.add("is-hidden");
          loginForm.classList.remove("is-hidden");
        }
      });
    });
  }

  function signOut() {
    try {
      window.localStorage.removeItem("admin-dashboard.currentUser");
    } catch (e) {
      // ignore
    }
    showAuth();
  }

  function init(onAuthenticated) {
    ensureDefaultUser();
    initTabs();

    const current = getCurrentUser();
    if (current) {
      updateProfileUI(current);
      showApp();
      if (typeof onAuthenticated === "function") {
        onAuthenticated();
      }
    } else {
      showAuth();
    }

    handleLogin(onAuthenticated);
    handleSignup(onAuthenticated);
  }

  return { init, signOut, getCurrentUser };
})();

// Sidebar behaviour: desktop collapse + mobile drawer
const Sidebar = (() => {
  function applyCollapsedState(isCollapsed) {
    document.body.classList.toggle("sidebar-collapsed", !!isCollapsed);
  }

  function initDesktopToggle() {
    const toggle = document.querySelector(".sidebar__toggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const current = !!Storage.get(PERSIST_KEYS.SIDEBAR_COLLAPSED, false);
      const next = !current;
      Storage.set(PERSIST_KEYS.SIDEBAR_COLLAPSED, next);
      applyCollapsedState(next);
    });
  }

  function initNavLinks() {
    const links = document.querySelectorAll(".sidebar__link");
    const titleEl = document.querySelector(".topbar__title");

    links.forEach((link) => {
      link.addEventListener("click", (ev) => {
        ev.preventDefault();
        links.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");

        const section = link.getAttribute("data-section") || "dashboard";
        if (titleEl) {
          const label = section.charAt(0).toUpperCase() + section.slice(1);
          titleEl.textContent = label;
        }

        if (window.innerWidth <= 768) {
          document.body.classList.remove("sidebar-open");
        }
      });
    });
  }

  function initMobileBehaviour() {
    const topbarTitle = document.querySelector(".topbar__title");
    if (!topbarTitle) return;

    topbarTitle.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        const open = document.body.classList.toggle("sidebar-open");
        if (!open) {
          const overlay = document.querySelector(".sidebar-overlay");
          if (overlay) overlay.remove();
        }
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        document.body.classList.remove("sidebar-open");
      }
    });
  }

  function restoreCollapsedState() {
    const collapsed = !!Storage.get(PERSIST_KEYS.SIDEBAR_COLLAPSED, false);
    applyCollapsedState(collapsed);
  }

  function init() {
    restoreCollapsedState();
    initDesktopToggle();
    initNavLinks();
    initMobileBehaviour();
  }

  return { init };
})();

// Theme toggle (light/dark, no neon)
const Theme = (() => {
  function applyTheme(theme) {
    const body = document.body;
    const normalized = theme === "dark" ? "dark" : "light";
    body.classList.remove("theme-light", "theme-dark");
    body.classList.add(`theme-${normalized}`);

    const toggleIcon = document.querySelector(".theme-toggle__icon");
    const toggleText = document.querySelector(".theme-toggle__text");

    if (toggleIcon && toggleText) {
      if (normalized === "dark") {
        toggleIcon.textContent = "🌙";
        toggleText.textContent = "Dark mode";
      } else {
        toggleIcon.textContent = "☀️";
        toggleText.textContent = "Light mode";
      }
    }
  }

  function restoreTheme() {
    const stored = Storage.get(PERSIST_KEYS.THEME, "light");
    applyTheme(stored);
  }

  function initToggle() {
    const button = document.querySelector(".sidebar__theme-toggle");
    if (!button) return;

    button.addEventListener("click", () => {
      const current = Storage.get(PERSIST_KEYS.THEME, "light");
      const next = current === "dark" ? "light" : "dark";
      Storage.set(PERSIST_KEYS.THEME, next);
      applyTheme(next);
    });
  }

  function init() {
    restoreTheme();
    initToggle();
  }

  return { init };
})();

// Canvas-based charts with simple rendering
const Charts = (() => {
  function drawAxes(ctx, width, height, padding) {
    ctx.strokeStyle = "rgba(148, 163, 184, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
  }

  function drawLineChart(canvas, values, labels) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 32;

    ctx.clearRect(0, 0, width, height);

    drawAxes(ctx, width, height, padding);

    const maxValue = Math.max(...values) * 1.1;
    const minValue = Math.min(...values) * 0.9;
    const range = maxValue - minValue || 1;
    const stepX =
      values.length > 1
        ? (width - padding * 2) / (values.length - 1)
        : width - padding * 2;

    ctx.strokeStyle = "rgba(37, 99, 235, 0.18)";
    ctx.fillStyle = "rgba(37, 99, 235, 0.16)";
    ctx.beginPath();

    values.forEach((value, idx) => {
      const x = padding + idx * stepX;
      const y =
        height -
        padding -
        ((value - minValue) / range) * (height - padding * 2);
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(59, 130, 246, 1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((value, idx) => {
      const x = padding + idx * stepX;
      const y =
        height -
        padding -
        ((value - minValue) / range) * (height - padding * 2);
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.fillStyle = "rgba(37, 99, 235, 1)";
    values.forEach((value, idx) => {
      const x = padding + idx * stepX;
      const y =
        height -
        padding -
        ((value - minValue) / range) * (height - padding * 2);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
    ctx.font = "10px system-ui, sans-serif";
    labels.forEach((label, idx) => {
      const x = padding + idx * stepX;
      const y = height - padding + 14;
      ctx.textAlign = "center";
      ctx.fillText(label, x, y);
    });
  }

  function drawBarChart(canvas, seriesA, seriesB, labels) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 32;

    ctx.clearRect(0, 0, width, height);
    drawAxes(ctx, width, height, padding);

    const combined = seriesA.concat(seriesB);
    const maxValue = Math.max(...combined) * 1.15 || 1;
    const barGroupWidth =
      labels.length > 0
        ? (width - padding * 2) / labels.length
        : width - padding * 2;

    const barWidth = barGroupWidth * 0.28;
    const gap = barGroupWidth * 0.1;

    seriesA.forEach((value, idx) => {
      const x =
        padding + idx * barGroupWidth - barWidth / 2 - gap / 2 + barGroupWidth / 2;
      const barHeight =
        ((value || 0) / maxValue) * (height - padding * 2 - 4);
      const y = height - padding - barHeight;
      ctx.fillStyle = "rgba(37, 99, 235, 0.9)";
      ctx.fillRect(x, y, barWidth, barHeight);
    });

    seriesB.forEach((value, idx) => {
      const x =
        padding + idx * barGroupWidth + barWidth / 2 + gap / 2 + barGroupWidth / 2;
      const barHeight =
        ((value || 0) / maxValue) * (height - padding * 2 - 4);
      const y = height - padding - barHeight;
      ctx.fillStyle = "rgba(148, 163, 184, 0.95)";
      ctx.fillRect(x, y, barWidth, barHeight);
    });

    ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
    ctx.font = "10px system-ui, sans-serif";
    labels.forEach((label, idx) => {
      const x = padding + idx * barGroupWidth + barGroupWidth / 2;
      const y = height - padding + 14;
      ctx.textAlign = "center";
      ctx.fillText(label, x, y);
    });
  }

  function init() {
    const growthCanvas = document.getElementById("growthLineChart");
    const salesCanvas = document.getElementById("salesBarChart");

    const growthValues = [3.2, 4.1, 4.5, 5.2, 5.0, 5.8, 6.3, 6.9, 7.4, 7.9, 8.2, 8.4];
    const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

    drawLineChart(growthCanvas, growthValues, monthLabels);

    const onlineSales = [42, 56, 61, 58, 67, 73];
    const retailSales = [26, 30, 28, 32, 34, 35];
    const channels = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"];

    drawBarChart(salesCanvas, onlineSales, retailSales, channels);
  }

  return { init };
})();

// Profile dropdown
const ProfileMenu = (() => {
  function init() {
    const button = document.querySelector(".profile__button");
    const dropdown = document.querySelector(".profile__dropdown");
    if (!button || !dropdown) return;

    button.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const isOpen = dropdown.classList.toggle("is-open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click", () => {
      if (dropdown.classList.contains("is-open")) {
        dropdown.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
      }
    });

    dropdown.addEventListener("click", (ev) => ev.stopPropagation());

    const signOutBtn = dropdown.querySelector(".profile__menu-item--danger");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", () => {
        Auth.signOut();
      });
    }
  }

  return { init };
})();

// CSV export for the current table
const TableExport = (() => {
  function toCSV(table) {
    const rows = Array.from(table.querySelectorAll("tr"));
    return rows
      .map((row) => {
        const cells = Array.from(row.children).filter(
          (cell) => !cell.classList.contains("data-table__cell--actions")
        );
        return cells
          .map((cell) => {
            const text = cell.textContent.trim().replace(/\s+/g, " ");
            const escaped = text.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",");
      })
      .join("\r\n");
  }

  function download(filename, content) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function init() {
    const button = document.getElementById("exportCsvButton");
    const table = document.querySelector(".data-table");
    if (!button || !table) return;

    button.addEventListener("click", () => {
      const csv = toCSV(table);
      download("users.csv", csv);
    });
  }

  return { init };
})();

let dashboardInitialized = false;

function initializeDashboardOnce() {
  if (dashboardInitialized) return;
  dashboardInitialized = true;
  Sidebar.init();
  Theme.init();
  Charts.init();
  ProfileMenu.init();
  TableExport.init();
}

document.addEventListener("DOMContentLoaded", () => {
  Auth.init(initializeDashboardOnce);
});

