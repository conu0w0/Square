// ---------- Canvas 與常數 ----------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 7;
const ROWS = 6;
const CELL_SIZE = 60;
const STATUS_HEIGHT = 60;
const BOARD_WIDTH = COLS * CELL_SIZE;
const BOARD_HEIGHT = ROWS * CELL_SIZE;
canvas.width = BOARD_WIDTH;
canvas.height = BOARD_HEIGHT + STATUS_HEIGHT;

const catFaceRadius = Math.min(canvas.width, canvas.height) * 0.04;

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
  drawBoard();

  if (currentPlayer === "blue") scheduleAiMove();
}

// ---------- 主繪製 ----------
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const offsetX = (canvas.width - BOARD_WIDTH) / 2;
  const isDark = document.body.classList.contains("dark");

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.save();
      ctx.strokeStyle = isDark ? "#444" : "#aaa";
      ctx.lineWidth = 1;
      ctx.strokeRect(offsetX + c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.restore();

      const piece = board[r][c];
      if (piece) drawPiece(offsetX + c, r, piece);
    }
  }

  if (hoverCol !== null && !fallingPiece && !gameOver && currentPlayer === "red") {
    const row = getAvailableRow(hoverCol);
    if (row !== null) drawPiece(offsetX + hoverCol, row, currentPlayer, true);
  }

  if (winCoords) {
    winCoords.forEach(([r, c]) => {
      ctx.strokeStyle = "gold";
      ctx.lineWidth = 4;
      const x = offsetX + c * CELL_SIZE + 5;
      const y = r * CELL_SIZE + 5;
      const size = CELL_SIZE - 10;
      ctx.beginPath();
      roundRect(ctx, x, y, size, size, 12);
      ctx.stroke();
    });
  }

  if (fallingPiece) {
    drawPiece(offsetX + fallingPiece.col, fallingPiece.y / CELL_SIZE, fallingPiece.color);
  }

  drawBottomStatus(offsetX);

  ctx.save();
  ctx.strokeStyle = isDark ? "#fff" : "#333";
  ctx.lineWidth = 4;
  ctx.strokeRect(offsetX, 0, BOARD_WIDTH, BOARD_HEIGHT);
  ctx.restore();
}

function drawPiece(col, row, color, preview = false) {
  const x = col * CELL_SIZE + 5;
  const y = row * CELL_SIZE + 5;
  const size = CELL_SIZE - 10;
  const radius = 12;
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);

  gradient.addColorStop(0, color === "red" ? "#ff4c4c" : "#4ea6ff");
  gradient.addColorStop(1, color === "red" ? "#a03028" : "#1f5fa5");

  ctx.save();
  ctx.fillStyle = gradient;
  if (preview) ctx.globalAlpha = 0.4;
  ctx.shadowColor = !preview ? (document.body.classList.contains("dark") ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)") : "transparent";
  ctx.shadowBlur = preview ? 0 : 6;
  roundRect(ctx, x, y, size, size, radius);
  ctx.fill();
  ctx.restore();
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

function drawBottomStatus(offsetX) {
  const baseY = BOARD_HEIGHT + 10;
  const msg = gameOver
    ? currentPlayer === "red" ? "你贏啦 🎉" : "汪汪勝出！"
    : currentPlayer === "red" ? "輪到你囉！" : "汪汪正在思考…";

  ctx.save();
  ctx.globalAlpha = currentPlayer === "red" || gameOver ? 1 : 0.3;
  ctx.fillStyle = "#ff6b6b";
  ctx.beginPath();
  ctx.arc(offsetX + 30, baseY + 20, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = currentPlayer === "blue" || gameOver ? 1 : 0.3;
  drawCatFace({
    x: canvas.width - catFaceRadius - 16,
    y: baseY + catFaceRadius,
    r: catFaceRadius,
    pat: facePat
  }, { col: "#4ea6ff" });
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.font = "20px 'Noto Sans TC'";
  ctx.fillStyle = gameOver ? "#ff4757" : "#333";
  ctx.textAlign = "center";
  ctx.fillText(msg, canvas.width / 2, baseY + 25);
  ctx.restore();
}

function drawCatFace(face, resetbutton) {
  const x = face.x, y = face.y, r = face.r;
  const cornerRadius = r * 0.3;

  ctx.lineWidth = 2;
  ctx.fillStyle = resetbutton.col;
  ctx.strokeStyle = resetbutton.col;
  roundRect(ctx, x - r, y - r, r * 2, r * 2, cornerRadius);
  ctx.fill();
  ctx.stroke();

  const earY = y - r - 6;
  const earW = r * 0.8;
  const earH = r * 0.8;
  const earXOffset = r * 0.5;

  // 左耳
  ctx.beginPath();
  ctx.moveTo(x - earXOffset, earY);
  ctx.lineTo(x - earXOffset - earW / 2, earY + earH);
  ctx.lineTo(x - earXOffset + earW / 2, earY + earH * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 右耳
  ctx.beginPath();
  ctx.moveTo(x + earXOffset, earY);
  ctx.lineTo(x + earXOffset - earW / 2, earY + earH * 0.7);
  ctx.lineTo(x + earXOffset + earW / 2, earY + earH);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 眨眼
  blink_timer++;
  if (blink_timer > blink_interval) {
    blink_counter++;
    if (blink_counter > 6) {
      blink_counter = 0;
      blink_timer = 0;
      blink_interval = 120 + Math.random() * 180;
    }
  }

  if (blink_counter === 0) {
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(x - r * 0.5, y - r * 0.3, r * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + r * 0.5, y - r * 0.3, r * 0.2, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#000";
    ctx.beginPath(); ctx.moveTo(x - r * 0.7, y - r * 0.3); ctx.lineTo(x - r * 0.3, y - r * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + r * 0.3, y - r * 0.3); ctx.lineTo(x + r * 0.7, y - r * 0.3); ctx.stroke();
  }

  // 嘴
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.4, y + r * 0.4);
  ctx.quadraticCurveTo(x - r * 0.2, y + r * 0.6, x, y + r * 0.4);
  ctx.quadraticCurveTo(x + r * 0.2, y + r * 0.6, x + r * 0.4, y + r * 0.4);
  ctx.stroke();
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

// ---------- 掉落與 AI ----------
function animateDrop() {
  if (!fallingPiece) return;
  fallingPiece.y += 10;
  if (fallingPiece.y / CELL_SIZE >= fallingPiece.row) {
    board[fallingPiece.row][fallingPiece.col] = fallingPiece.color;
    fallingPiece = null;

    if (checkForSquareWin(currentPlayer) || isBoardFull()) {
      gameOver = true;
      document.querySelector(".reset-btn").classList.add("blink");
    } else {
      currentPlayer = currentPlayer === "red" ? "blue" : "red";
      if (currentPlayer === "blue") scheduleAiMove();
    }
  }
  drawBoard();
  if (fallingPiece) requestAnimationFrame(animateDrop);
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
  fallingPiece = { col, row, y: 0, color: "blue" };
  animateDrop();
}

// ---------- 事件監聽 ----------
canvas.addEventListener("click", handleInput);
canvas.addEventListener("mousemove", updateHoverCol);
canvas.addEventListener("mouseleave", () => { hoverCol = null; drawBoard(); });

canvas.addEventListener("touchstart", (e) => { e.preventDefault(); handleInput(e); });
canvas.addEventListener("touchmove", updateHoverCol);
canvas.addEventListener("touchend", () => { hoverCol = null; drawBoard(); });

function handleInput(e) {
  if (gameOver || fallingPiece || currentPlayer !== "red") return;
  const col = getCanvasColFromEvent(e);
  const row = getAvailableRow(col);
  if (row === null || col < 0 || col >= COLS) return;
  fallingPiece = { col, row, y: 0, color: "red" };
  animateDrop();
}

function updateHoverCol(e) {
  if (gameOver || fallingPiece || currentPlayer !== "red") return;
  hoverCol = getCanvasColFromEvent(e);
  if (hoverCol < 0 || hoverCol >= COLS) hoverCol = null;
  drawBoard();
}

function getCanvasColFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const offsetX = (canvas.width - BOARD_WIDTH) / 2;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const x = (clientX - rect.left) * (canvas.width / rect.width) - offsetX;
  return Math.floor(x / CELL_SIZE);
}

// ---------- UI 控制全域公開 ----------
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
  if (board) drawBoard();
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
