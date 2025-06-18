// ---------- Canvas 與常數 ----------
const boardCanvas = document.getElementById("boardCanvas");
const boardCtx = boardCanvas.getContext("2d");

const statusCanvas = document.getElementById("statusCanvas");
const statusCtx = statusCanvas.getContext("2d");

const COLS = 7;
const ROWS = 6;
const CELL_SIZE = 60;
const PADDING = 6;
const STATUS_HEIGHT = 60;

const BOARD_WIDTH = COLS * CELL_SIZE + PADDING * 2;
const BOARD_HEIGHT = ROWS * CELL_SIZE + PADDING * 2;

boardCanvas.width = BOARD_WIDTH;
boardCanvas.height = BOARD_HEIGHT;
statusCanvas.width = BOARD_WIDTH;
statusCanvas.height = STATUS_HEIGHT;

const catFaceRadius = Math.min(boardCanvas.width, boardCanvas.height) * 0.04;

// ---------- 狀態變數 ----------
let board, currentPlayer, gameOver, fallingPiece, winCoords, hoverCol;
let blink_counter = 0, blink_timer = 0, blink_interval = 120 + Math.random() * 180;
let facePat = 0;

// ---------- 初始化 ----------
function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  currentPlayer = Math.random() < 0.5 ? "red" : "blue";
  gameOver = false;
  fallingPiece = null;
  winCoords = null;
  hoverCol = null;

  document.querySelector(".reset-btn").classList.remove("blink");
  drawGame();

  if (currentPlayer === "blue") scheduleAiMove();
}

// ---------- 主繪製 ----------
function drawGame() {
  drawBoard();
  drawStatus();
}

function drawBoard() {
  boardCtx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
  const isDark = document.body.classList.contains("dark");
  const offsetX = PADDING;
  const offsetY = PADDING;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = offsetX + c * CELL_SIZE;
      const y = offsetY + r * CELL_SIZE;

      boardCtx.save();
      boardCtx.strokeStyle = isDark ? "#444" : "#aaa";
      boardCtx.lineWidth = 1;
      boardCtx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      boardCtx.restore();

      const piece = board[r][c];
      if (piece) drawPiece(x, y, piece);
    }
  }

  if (fallingPiece) {
    const x = PADDING + fallingPiece.col * CELL_SIZE;
    const y = fallingPiece.y;
    drawPiece(x, y, fallingPiece.color);
  }

  if (winCoords) {
    winCoords.forEach(([r, c]) => {
      boardCtx.strokeStyle = "gold";
      boardCtx.lineWidth = 4;
      const x = offsetX + c * CELL_SIZE + 5;
      const y = offsetY + r * CELL_SIZE + 5;
      const size = CELL_SIZE - 10;
      boardCtx.beginPath();
      roundRect(boardCtx, x, y, size, size, 12);
      boardCtx.stroke();
    });
  }

  // 顯示 hover 預覽
  if (!fallingPiece && hoverCol !== null && currentPlayer === "red") {
    const x = PADDING + hoverCol * CELL_SIZE;
    const y = PADDING;
    drawPiece(x, y, "red", true); // preview = true
  }
  
  boardCtx.save();
  boardCtx.strokeStyle = isDark ? "#fff" : "#333";
  boardCtx.lineWidth = 4;
  boardCtx.strokeRect(offsetX, offsetY, COLS * CELL_SIZE, ROWS * CELL_SIZE);
  boardCtx.restore();
}

function drawPiece(x, y, color, preview = false) {
  const size = CELL_SIZE - 10;
  const radius = 12;
  const gradient = boardCtx.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, color === "red" ? "#ff4c4c" : "#4ea6ff");
  gradient.addColorStop(1, color === "red" ? "#a03028" : "#1f5fa5");

  boardCtx.save();
  boardCtx.fillStyle = gradient;
  if (preview) boardCtx.globalAlpha = 0.4;

  boardCtx.shadowColor = !preview
    ? (document.body.classList.contains("dark") ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)")
    : "transparent";
  boardCtx.shadowBlur = preview ? 0 : 6;

  roundRect(boardCtx, x + 5, y + 5, size, size, radius);
  boardCtx.fill();
  boardCtx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStatus() {
  statusCtx.clearRect(0, 0, statusCanvas.width, statusCanvas.height);
  const isDark = document.body.classList.contains("dark");
  const baseY = STATUS_HEIGHT / 2;

  const msg = gameOver
    ? currentPlayer === "red" ? "你贏啦 🎉" : "汪汪勝出！"
    : currentPlayer === "red" ? "輪到你囉！" : "汪汪正在思考…";

  statusCtx.save();
  statusCtx.globalAlpha = currentPlayer === "red" || gameOver ? 1 : 0.3;
  statusCtx.fillStyle = "#ff6b6b";
  statusCtx.beginPath();
  statusCtx.arc(30, baseY, 20, 0, Math.PI * 2);
  statusCtx.fill();
  statusCtx.restore();

  statusCtx.save();
  statusCtx.globalAlpha = currentPlayer === "blue" || gameOver ? 1 : 0.3;
  drawCatFace(statusCtx, {
    x: statusCanvas.width - catFaceRadius - 16,
    y: baseY,
    r: catFaceRadius,
    pat: facePat
  }, { col: "#4ea6ff" });
  statusCtx.restore();

  statusCtx.save();
  statusCtx.globalAlpha = 1;
  statusCtx.font = "20px 'Noto Sans TC'";
  statusCtx.fillStyle = gameOver ? "#ff4757" : (isDark ? "#eee" : "#333");
  statusCtx.textAlign = "center";
  statusCtx.fillText(msg, statusCanvas.width / 2, baseY + 7);
  statusCtx.restore();
}

// ---------- 遊戲邏輯 ----------
function getAvailableRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) return r;
  }
  return null;
}

function isBoardFull() {
  return board.every(row => row.every(cell => cell !== null));
}

function checkForSquareWin(player) {
  for (let size = 2; size <= Math.min(ROWS, COLS); size++) {
    for (let r = 0; r <= ROWS - size; r++) {
      for (let c = 0; c <= COLS - size; c++) {
        if (
          board[r][c] === player &&
          board[r][c + size - 1] === player &&
          board[r + size - 1][c] === player &&
          board[r + size - 1][c + size - 1] === player
        ) {
          winCoords = [
            [r, c],
            [r, c + size - 1],
            [r + size - 1, c],
            [r + size - 1, c + size - 1]
          ];
          return true;
        }
      }
    }
  }
  return false;
}

// ---------- 掉落動畫與 AI ----------
function animateDrop() {
  if (!fallingPiece) return;

  const gravity = 1;
  fallingPiece.vy += gravity;
  fallingPiece.y += fallingPiece.vy;

  // 到達或超過落點 → 彈跳
  if (fallingPiece.y >= fallingPiece.targetY) {
    fallingPiece.y = fallingPiece.targetY;

    if (fallingPiece.vy > 0) {
      fallingPiece.vy *= -0.4; // 輕微反彈
    }

    // 反彈速度太小 → 停止動畫，放入棋盤
    if (Math.abs(fallingPiece.vy) < 1) {
      board[fallingPiece.row][fallingPiece.col] = fallingPiece.color;
      fallingPiece = null;

      if (checkForSquareWin(currentPlayer) || isBoardFull()) {
        gameOver = true;
        document.querySelector(".reset-btn").classList.add("blink");
      } else {
        currentPlayer = currentPlayer === "red" ? "blue" : "red";
        if (currentPlayer === "blue") scheduleAiMove();
      }

      drawGame();
      return;
    }
  }

  drawGame();
  requestAnimationFrame(animateDrop);
}

function scheduleAiMove() {
  const delay = 500 + Math.random() * 700;
  setTimeout(aiMove, delay);
}

function aiMove() {
  if (gameOver) return;

  const options = [];
  for (let c = 0; c < COLS; c++) {
    if (getAvailableRow(c) !== null) options.push(c);
  }

  const col = options[Math.floor(Math.random() * options.length)];
  const row = getAvailableRow(col);

  fallingPiece = {
    col,
    row,
    y: 0,
    vy: 0,
    color: "blue",
    targetY: row * CELL_SIZE + PADDING
  };

  animateDrop();
}

// ---------- 事件監聽 ----------
function getCanvasColFromEvent(e) {
  const rect = boardCanvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const scaleX = boardCanvas.width / rect.width;
  const x = (clientX - rect.left) * scaleX - PADDING;
  return Math.floor(x / CELL_SIZE);
}

function handleInput(e) {
  if (gameOver || fallingPiece || currentPlayer !== "red") return;

  const col = getCanvasColFromEvent(e);
  const row = getAvailableRow(col);

  if (row === null || col < 0 || col >= COLS) return;

  fallingPiece = {
    col,
    row,
    y: 0,
    vy: 0, // 初速
    color: "red",
    targetY: row * CELL_SIZE + PADDING
  };

  animateDrop();
}

function updateHoverCol(e) {
  if (gameOver || fallingPiece || currentPlayer !== "red") return;
  const col = getCanvasColFromEvent(e);
  hoverCol = col < 0 || col >= COLS ? null : col;
  drawBoard();
}

boardCanvas.addEventListener("click", handleInput);
boardCanvas.addEventListener("mousemove", updateHoverCol);
boardCanvas.addEventListener("mouseleave", () => {
  hoverCol = null;
  drawBoard();
});
boardCanvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  handleInput(e);
}, { passive: false });
boardCanvas.addEventListener("touchmove", (e) => {
  updateHoverCol(e);
}, { passive: false });
boardCanvas.addEventListener("touchend", () => {
  hoverCol = null;
});
document.addEventListener("touchcancel", () => {
  hoverCol = null;
  drawBoard();
}, { passive: true });

// ---------- UI 控制 ----------
function goHome() {
  window.location.href = "https://github.com/conu0w0/Square";
}
function toggleRules() {
  document.getElementById("overlay").classList.toggle("hidden");
}
function closeRules(event) {
  event.stopPropagation();
  toggleRules();
}
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  const themeBtn = document.querySelector(".theme-btn");
  if (themeBtn) themeBtn.textContent = theme === "dark" ? "🌞" : "🌙";
  localStorage.setItem("theme", theme);
  drawGame();
}
function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
}

// ---------- 頁面載入 ----------
(function () {
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = storedTheme || (prefersDark ? "dark" : "light");
  applyTheme(theme);
})();
window.onload = resetGame;
