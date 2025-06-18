// 初始載入時套用主題
(function () {
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = storedTheme || (prefersDark ? "dark" : "light");
  applyTheme(theme);
})();

// 啟動遊戲
resetGame();
