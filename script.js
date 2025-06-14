const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 7;
const ROWS = 6;
const CELL_SIZE = 60;
const STATUS_HEIGHT = 80;
const BOARD_WIDTH = COLS * CELL_SIZE;
const BOARD_HEIGHT = ROWS * CELL_SIZE;
canvas.width = BOARD_WIDTH;
canvas.height = BOARD_HEIGHT + STATUS_HEIGHT;
const maxR = Math.min(canvas.width, canvas.height) * 0.04;
const catFaceRadius = Math.min(maxR, 20);

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPlayer = "red";
let gameOver = false;
let fallingPiece = null;
let winCoords = null;
let hoverCol = null;
let blink_counter = 0;
let blink_timer = 0;
let blink_interval = 120 + Math.floor(Math.random() * 180);
let counter = 0;
let facePat = 0;

function goHome() {
  window.location.href = "https://github.com/conu0w0/Square";
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const offsetX = (canvas.width - BOARD_WIDTH) / 2;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.save();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "#aaa";
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
}

function drawPiece(col, row, color, preview = false) {
  const x = col * CELL_SIZE + 5;
  const y = row * CELL_SIZE + 5;
  const size = CELL_SIZE - 10;
  const radius = 12;
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);

  gradient.addColorStop(0, color === "red" ? "#ff6b6b" : "#74b9ff");
  gradient.addColorStop(1, color === "red" ? "#c0392b" : "#2980b9");

  ctx.save();
  if (preview) ctx.globalAlpha = 0.4;
  else {
    const isDark = document.body.classList.contains("dark");
    ctx.shadowColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  ctx.fillStyle = gradient;
  ctx.beginPath();
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

function getAvailableRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) return r;
  }
  return null;
}

canvas.addEventListener("click", (e) => {
  if (gameOver || fallingPiece || currentPlayer !== "red") return;
  const rect = canvas.getBoundingClientRect();
  const offsetX = (canvas.width - BOARD_WIDTH) / 2;
  const x = e.clientX - rect.left - offsetX;
  const col = Math.floor(x / CELL_SIZE);
  const row = getAvailableRow(col);
  if (row === null || col < 0 || col >= COLS) return;
  fallingPiece = { col, row, y: 0, color: "red" };
  animateDrop();
});

canvas.addEventListener("mousemove", (e) => {
  if (gameOver || fallingPiece || currentPlayer !== "red") return;
  const rect = canvas.getBoundingClientRect();
  const offsetX = (canvas.width - BOARD_WIDTH) / 2;
  const x = e.clientX - rect.left - offsetX;
  const col = Math.floor(x / CELL_SIZE);
  hoverCol = (col >= 0 && col < COLS) ? col : null;
  drawBoard();
});

canvas.addEventListener("mouseleave", () => {
  hoverCol = null;
  drawBoard();
});

function animateDrop() {
  if (!fallingPiece) return;
  fallingPiece.y += 10;
  if (fallingPiece.y / CELL_SIZE >= fallingPiece.row) {
    board[fallingPiece.row][fallingPiece.col] = fallingPiece.color;
    fallingPiece = null;
    if (checkForSquareWin(currentPlayer)) {
      gameOver = true;
      document.querySelector(".reset-btn").classList.add("blink");
    } else if (isBoardFull()) {
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
  if (row !== null) {
    fallingPiece = { col, row, y: 0, color: "blue" };
    animateDrop();
  }
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

function isBoardFull() {
  return board.every(row => row.every(cell => cell !== null));
}

function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  gameOver = false;
  winCoords = null;
  fallingPiece = null;
  hoverCol = null;
  blink_counter = 0;
  blink_timer = 0;
  blink_interval = 120 + Math.floor(Math.random() * 180);
  counter = 0;

  currentPlayer = Math.random() < 0.5 ? "red" : "blue";
  document.querySelector(".reset-btn").classList.remove("blink");
  drawBoard();

  if (currentPlayer === "blue") scheduleAiMove();
}

function drawBottomStatus(offsetX) {
  const baseY = BOARD_HEIGHT + 10;
  const msg = gameOver
    ? currentPlayer === "red"
      ? "你贏啦 🎉"
      : "汪汪勝出！"
    : currentPlayer === "red"
    ? "輪到你囉！"
    : "汪汪正在思考…";

  ctx.save();
  ctx.globalAlpha = currentPlayer === "red" || gameOver ? 1 : 0.3;
  ctx.fillStyle = "#ff6b6b";
  ctx.beginPath();
  ctx.arc(offsetX + 30, baseY + 20, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = currentPlayer === "blue" || gameOver ? 1 : 0.3;
  drawCatFace(
    { x: offsetX + BOARD_WIDTH - catFaceRadius - 10, y: baseY + catFaceRadius, r: catFaceRadius, pat: facePat },
    { col: "#74b9ff" }
  );

  ctx.restore();

  ctx.save();
  ctx.font = "16px 'Noto Sans TC'";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.fillText(msg, canvas.width / 2, baseY + 25);
  ctx.restore();
}

function drawCatFace(face, resetbutton) {
  const x = face.x, y = face.y, r = face.r;
  const size = r * 2;

  ctx.lineWidth = 2;
  ctx.strokeStyle = resetbutton.col;
  ctx.fillStyle = resetbutton.col;

  // 臉部
  ctx.beginPath();
  roundRect(ctx, x - r, y - r, size, size, r);
  ctx.fill();
  ctx.stroke();

  // 耳朵（左）
  ctx.beginPath();
  ctx.moveTo(x - r + r * 0.25, y - r + r * 0.75);
  ctx.lineTo(x - r + r * 1.25, y - r - r * 0.75);
  ctx.lineTo(x - r + r * 2.25, y - r + r * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 耳朵（右）
  ctx.beginPath();
  ctx.moveTo(x + r - r * 0.25, y - r + r * 0.75);
  ctx.lineTo(x + r - r * 1.25, y - r - r * 0.75);
  ctx.lineTo(x + r - r * 2.25, y - r + r * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 眨眼計時
  blink_timer++;
  if (blink_timer > blink_interval) {
    blink_counter++;
    if (blink_counter > 6) {
      blink_counter = 0;
      blink_timer = 0;
      blink_interval = 120 + Math.floor(Math.random() * 180);
    }
  }

  // 眼睛
  if (blink_counter === 0) {
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(x - r * 0.65, y - r * 0.25, r * 0.25, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + r * 0.65, y - r * 0.25, r * 0.25, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#000";
    ctx.beginPath(); ctx.moveTo(x - r * 0.9, y - r * 0.25); ctx.lineTo(x - r * 0.4, y - r * 0.25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + r * 0.4, y - r * 0.25); ctx.lineTo(x + r * 0.9, y - r * 0.25); ctx.stroke();
  }

  // 嘴巴
  ctx.strokeStyle = "#000";
  if (face.pat === 0) {
    ctx.beginPath(); ctx.arc(x - r * 0.2, y + r * 0.5, r * 0.2, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + r * 0.2, y + r * 0.5, r * 0.2, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
  } else if (face.pat === 1) {
    ctx.beginPath(); ctx.moveTo(x - r * 0.3, y + r * 0.4); ctx.lineTo(x + r * 0.3, y + r * 0.4); ctx.stroke();
  } else if (face.pat === 2) {
    ctx.beginPath(); ctx.arc(x, y + r * 0.5, r * 0.3, 0, Math.PI); ctx.stroke();
  }
}

resetGame();

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

// 初始載入時偵測主題
(function () {
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = storedTheme || (prefersDark ? "dark" : "light");
  applyTheme(theme);
})();
