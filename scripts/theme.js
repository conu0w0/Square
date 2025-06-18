function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  const themeBtn = document.querySelector(".theme-btn");
  if (themeBtn) themeBtn.textContent = theme === "dark" ? "🌞" : "🌙";
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
}
