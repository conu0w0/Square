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
let redActive = 1;   // 紅色目前是否亮
let blueActive = 0;  // 藍色目前是否亮


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
  updateStatusTransition();
  drawBoard();
  drawStatus();
}

function updateStatusTransition() {
  const speed = 0.1;
  const redTarget = (fallingPiece && fallingPiece.color === "blue") || (!fallingPiece && currentPlayer === "blue") ? 1 : 0;
  const blueTarget = (fallingPiece && fallingPiece.color === "red") || (!fallingPiece && currentPlayer === "red") ? 1 : 0;

  redActive += (redTarget - redActive) * speed;
  blueActive += (blueTarget - blueActive) * speed;
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

  // 畫掉落中的棋子
  if (fallingPiece) {
    const x = PADDING + fallingPiece.col * CELL_SIZE;
    const y = fallingPiece.y;
    drawPiece(x, y, fallingPiece.color);
  }

  // 勝利方框
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

  // Hover 預覽
  if (!fallingPiece && hoverCol !== null && currentPlayer === "red") {
    const x = PADDING + hoverCol * CELL_SIZE;
    const y = PADDING;
    drawPiece(x, y, "red", true);
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
  boardCtx.shadowColor = preview ? "transparent" : (document.body.classList.contains("dark") ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)");
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

  const isTouchDevice = 'ontouchstart' in window;
  const msg = gameOver
    ? currentPlayer === "red" ? "你贏啦 🎉" : "汪汪勝出！"
    : currentPlayer === "red"
    ? isTouchDevice ? "點一下預覽，再點一下落子！" : "輪到你囉！"
    : "汪汪正在思考…";

  // 混合顏色（深 → 亮）
  const redColor = mixColor("#661111", "#ff6b6b", redActive);
  const blueColor = mixColor("#123e78", "#4ea6ff", blueActive);


  // 畫紅色圓形（不是棋子）
  statusCtx.save();
  statusCtx.fillStyle = redColor;
  statusCtx.beginPath();
  statusCtx.arc(30, baseY, 20, 0, Math.PI * 2);
  statusCtx.fill();
  statusCtx.restore();

  // 畫汪汪臉
  drawCatFace(statusCtx, {
    x: statusCanvas.width - catFaceRadius - 16,
    y: baseY,
    r: catFaceRadius,
    pat: facePat
  }, { col: blueColor });

  // 畫中間訊息
  statusCtx.save();
  statusCtx.font = "20px 'Noto Sans TC'";
  statusCtx.fillStyle = gameOver ? "#ff4757" : (isDark ? "#eee" : "#333");
  statusCtx.textAlign = "center";
  statusCtx.fillText(msg, statusCanvas.width / 2, baseY + 7);
  statusCtx.restore();
}

function drawCatFace(ctx, face, colorObj) {
  const x = face.x, y = face.y, r = face.r;
  const size = r * 2;
  const cornerRadius = r * 0.3;

  // === 臉的輪廓 ===
  ctx.lineWidth = 2;
  ctx.fillStyle = ctx.strokeStyle = colorObj.col;
  roundRect(ctx, x - r, y - r, size, size, cornerRadius);
  ctx.fill();
  ctx.stroke();

  // === 耳朵 ===
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

  // === 眨眼計時 ===
  blink_timer++;
  if (blink_timer > blink_interval) {
    blink_counter++;
    if (blink_counter > 6) {
      blink_counter = 0;
      blink_timer = 0;
      blink_interval = 120 + Math.random() * 180;
    }
  }

  // === 眼睛 ===
  if (blink_counter === 0) {
    // 睜眼
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x - r * 0.5, y - r * 0.3, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.5, y - r * 0.3, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 閉眼
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y - r * 0.3);
    ctx.lineTo(x - r * 0.3, y - r * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + r * 0.3, y - r * 0.3);
    ctx.lineTo(x + r * 0.7, y - r * 0.3);
    ctx.stroke();
  }

  // === ω 嘴 ===
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x - r * 0.4, y + r * 0.3);
  ctx.quadraticCurveTo(x - r * 0.2, y + r * 0.5, x, y + r * 0.4);
  ctx.quadraticCurveTo(x + r * 0.2, y + r * 0.5, x + r * 0.4, y + r * 0.3);
  ctx.stroke();
}

// ---------- 邏輯 ----------
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

// ---------- 動畫與 AI ----------
function animateDrop() {
  if (!fallingPiece) return;

  const gravity = 1;
  fallingPiece.vy += gravity;
  fallingPiece.y += fallingPiece.vy;

  if (fallingPiece.y >= fallingPiece.targetY) {
    fallingPiece.y = fallingPiece.targetY;

    if (fallingPiece.vy > 0) {
      fallingPiece.vy *= -0.4;
    }

    if (Math.abs(fallingPiece.vy) < 1) {
      // 落子
      board[fallingPiece.row][fallingPiece.col] = fallingPiece.color;

      // 預先切換（讓下一位亮起來）
      const prevPlayer = currentPlayer;
      currentPlayer = currentPlayer === "red" ? "blue" : "red";

      const hasWinner = checkForSquareWin(prevPlayer);
      const isFull = isBoardFull();

      fallingPiece = null;

      if (hasWinner || isFull) {
        gameOver = true;
        document.querySelector(".reset-btn").classList.add("blink");
        currentPlayer = prevPlayer; // 勝負已分，恢復為勝利方亮起
      } else if (currentPlayer === "blue") {
        scheduleAiMove();
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
    col, row, y: 0, vy: 0,
    color: "blue",
    targetY: row * CELL_SIZE + PADDING
  };
  animateDrop();
}

// ---------- 事件 ----------
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

  const isTouch = !!e.touches;

  if (isTouch) {
    if (hoverCol === col) {
      // 第二次點同一欄：落子
      fallingPiece = {
        col, row, y: 0, vy: 0,
        color: "red",
        targetY: row * CELL_SIZE + PADDING
      };
      hoverCol = null;
      animateDrop();
    } else {
      // 第一次點：預覽
      hoverCol = col;
      drawBoard();
    }
  } else {
    // 電腦：直接落子
    fallingPiece = {
      col, row, y: 0, vy: 0,
      color: "red",
      targetY: row * CELL_SIZE + PADDING
    };
    animateDrop();
  }
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
boardCanvas.addEventListener("touchstart", e => {
  e.preventDefault(); handleInput(e);
}, { passive: false });
boardCanvas.addEventListener("touchmove", e => {
  updateHoverCol(e);
}, { passive: false });
document.addEventListener("touchcancel", () => {
  hoverCol = null; drawBoard();
}, { passive: true });

// ---------- UI ----------
function goHome() {
  window.location.href = "https://github.com/conu0w0/Square";
}
function toggleRules() {
  document.getElementById("overlay").classList.toggle("hidden");
}
function closeRules(e) {
  e.stopPropagation();
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

// ---------- 工具 ----------
function mixColor(c1, c2, t) {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);

  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `rgb(${r},${g},${b})`;
}

// ---------- 頁面載入 ----------
window.onload = () => {
  resetGame();
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = storedTheme || (prefersDark ? "dark" : "light");
  applyTheme(theme);
};
