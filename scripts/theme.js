function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");

  const themeBtn = document.querySelector(".theme-btn");
  if (themeBtn) {
    themeBtn.textContent = theme === "dark" ? "🌞" : "🌙";
  }

  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
}

// 自動套用主題（初次載入時）
(function () {
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = storedTheme || (prefersDark ? "dark" : "light");
  applyTheme(theme);
})();

// 持續提供 HTML 使用
window.toggleTheme = toggleTheme;
