// Customer / Buyer Authentication Controller for Lumen E-Commerce

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  checkExistingUserSession();
  setupAuthTabs();
  setupFormListeners();
});

// Initialize Dark Mode Toggle
function initTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (!themeToggleBtn) return;

  const currentTheme = localStorage.getItem("theme") || "light";
  if (currentTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  themeToggleBtn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// Check existing buyer session
function checkExistingUserSession() {
  const session = window.lumenStore.getUserSession();
  const sessionBanner = document.getElementById("active-session-banner");
  if (!sessionBanner) return;

  if (session) {
    sessionBanner.classList.remove("hidden");
    document.getElementById("session-user-name").textContent = session.name;
    document.getElementById("session-email").textContent = session.email;
  } else {
    sessionBanner.classList.add("hidden");
  }
}

// Tab Switching (Sign In vs Register)
function setupAuthTabs() {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin = document.getElementById("form-login-container");
  const formRegister = document.getElementById("form-register-container");

  if (!tabLogin || !tabRegister) return;

  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("bg-surface-container-lowest", "dark:bg-slate-800", "text-primary", "dark:text-white", "shadow-sm");
    tabLogin.classList.remove("text-outline");
    tabRegister.classList.remove("bg-surface-container-lowest", "dark:bg-slate-800", "text-primary", "dark:text-white", "shadow-sm");
    tabRegister.classList.add("text-outline");

    formLogin.classList.remove("hidden");
    formRegister.classList.add("hidden");
    clearAuthAlerts();
  });

  tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("bg-surface-container-lowest", "dark:bg-slate-800", "text-primary", "dark:text-white", "shadow-sm");
    tabRegister.classList.remove("text-outline");
    tabLogin.classList.remove("bg-surface-container-lowest", "dark:bg-slate-800", "text-primary", "dark:text-white", "shadow-sm");
    tabLogin.classList.add("text-outline");

    formRegister.classList.remove("hidden");
    formLogin.classList.add("hidden");
    clearAuthAlerts();
  });
}

// Form Handlers
function setupFormListeners() {
  const loginForm = document.getElementById("user-login-form");
  const registerForm = document.getElementById("user-register-form");
  const demoBtn = document.getElementById("demo-autofill-btn");
  const logoutSessionBtn = document.getElementById("btn-logout-session");

  // Demo Auto-fill
  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      document.getElementById("login-email").value = "alex.morgan@lumen.com";
      document.getElementById("login-password").value = "password123";
      showToast("Demo Customer credentials auto-filled!", "success");
    });
  }

  // Session Logout Button
  if (logoutSessionBtn) {
    logoutSessionBtn.addEventListener("click", () => {
      window.lumenStore.logoutUser();
      checkExistingUserSession();
      showToast("Signed out from customer account", "info");
    });
  }

  // Login Submit
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearAuthAlerts();

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();

      if (!email || !password) {
        showAuthAlert("Please enter both your email address and password.", "error");
        return;
      }

      const res = window.lumenStore.loginUser(email, password);
      if (res.success) {
        showAuthAlert(`Welcome back, ${res.session.name}! Logging you in...`, "success");
        showToast(`Signed in as ${res.session.name}`, "cart");
        checkExistingUserSession();
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1200);
      } else {
        showAuthAlert(res.message, "error");
      }
    });
  }

  // Register Submit
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearAuthAlerts();

      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value.trim();
      const phone = document.getElementById("reg-phone").value.trim();
      const terms = document.getElementById("reg-terms").checked;

      if (!name || !email || !password) {
        showAuthAlert("Please fill in all required registration fields.", "error");
        return;
      }

      if (password.length < 6) {
        showAuthAlert("Password must be at least 6 characters long.", "error");
        return;
      }

      if (!terms) {
        showAuthAlert("You must accept the Terms of Service to register.", "error");
        return;
      }

      const res = window.lumenStore.registerUser({
        name,
        email,
        password,
        phone
      });

      if (res.success) {
        showAuthAlert(`Account for ${res.session.name} created successfully!`, "success");
        showToast("Customer account registered & logged in!", "cart");
        checkExistingUserSession();
        registerForm.reset();
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1200);
      } else {
        showAuthAlert(res.message, "error");
      }
    });
  }
}

function showAuthAlert(msg, type = "error") {
  const container = document.getElementById("auth-alert-container");
  if (!container) return;

  const isError = type === "error";
  container.className = `p-4 rounded-xl border mb-4 text-xs font-semibold flex items-center gap-2 ${
    isError
      ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300"
      : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300"
  }`;

  container.innerHTML = `
    <span class="material-symbols-outlined text-base">${isError ? 'error' : 'check_circle'}</span>
    <span>${msg}</span>
  `;
  container.classList.remove("hidden");
}

function clearAuthAlerts() {
  const container = document.getElementById("auth-alert-container");
  if (container) {
    container.classList.add("hidden");
    container.innerHTML = "";
  }
}

// Shared Toast Message
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");

  let icon = "info";
  let bgClass = "bg-slate-900 text-white";
  if (type === "cart" || type === "success") {
    icon = "check_circle";
    bgClass = "bg-secondary text-white";
  }

  toast.className = `toast-animate-in ${bgClass} px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold max-w-sm pointer-events-auto border border-outline-variant/30`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-base">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove("toast-animate-in");
    toast.classList.add("toast-animate-out");
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}
