// theme.js
(function () {
  function applyTheme() {
    // 1. Storage se saved theme load karein
    const savedTheme = localStorage.getItem("appTheme") || "dark";
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }

    // 2. Existing Button check ya naya Create
    let toggleBtn = document.getElementById("globalThemeToggleBtn");
    if (!toggleBtn) {
      toggleBtn = document.createElement("button");
      toggleBtn.id = "globalThemeToggleBtn";
      toggleBtn.style.cssText = `
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        width: 50px !important;
        height: 50px !important;
        border-radius: 50% !important;
        background-color: #0f172a !important;
        border: 2px solid #14b8a6 !important;
        color: #14b8a6 !important;
        font-size: 20px !important;
        cursor: pointer !important;
        z-index: 9999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
      `;
      document.body.appendChild(toggleBtn);
    }

    // Update Icon
    const isLight = document.documentElement.classList.contains("light");
    toggleBtn.innerHTML = isLight ? "🌙" : "☀️";

    // Click Listener
    toggleBtn.onclick = function () {
      const isCurrentlyLight = document.documentElement.classList.toggle("light");
      localStorage.setItem("appTheme", isCurrentlyLight ? "light" : "dark");
      toggleBtn.innerHTML = isCurrentlyLight ? "🌙" : "☀️";
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyTheme);
  } else {
    applyTheme();
  }
})();