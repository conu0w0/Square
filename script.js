const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 7;
const ROWS = 6;
const CELL_SIZE = 60;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPlayer = "red";
let gameOver = false;
let fallingPiece = null;
let winCoords = null;

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.save();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 1;
      ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.restore();

      const piece = board[r][c];
      if (piece) drawPiece(c, r, piece);
    }
  }

  if (fallingPiece) {
    drawPiece(fallingPiece.col, fallingPiece.y / CELL_SIZE, fallingPiece.color);
  }

  if (winCoords) {
    winCoords.forEach(([r, c]) => {
      ctx.strokeStyle = "gold";
      ctx.lineWidth = 4;
      const x = c * CELL_SIZE + 5;
      const y = r * CELL_SIZE + 5;
      const size = CELL_SIZE - 10;
      ctx.beginPath();
      roundRect(ctx, x, y, size, size, 12);
      ctx.stroke();
    });
  }
}

function drawPiece(col, row, color) {
  const x = col * CELL_SIZE + 5;
  const y = row * CELL_SIZE + 5;
  const size = CELL_SIZE - 10;
  const radius = 12;

  // 建立漸層填色
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  if (color === "red") {
    gradient.addColorStop(0, "#ff6b6b");
    gradient.addColorStop(1, "#c0392b");
  } else {
    gradient.addColorStop(0, "#74b9ff");
    gradient.addColorStop(1, "#2980b9");
  }

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = gradient;
  ctx.beginPath();
  roundRect(ctx, x, y, size, size, radius);
  ctx.fill();
  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function getAvailableRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) return r;
  }
  return null;
}

canvas.addEventListener("click", (e) => {
  if (gameOver || fallingPiece) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const col = Math.floor(x / CELL_SIZE);
  const row = getAvailableRow(col);

  if (row === null) return;

  fallingPiece = {
    col,
    row,
    y: 0,
    color: currentPlayer,
  };

  animateDrop();
});

function animateDrop() {
  if (!fallingPiece) return;

  fallingPiece.y += 10;
  if (fallingPiece.y / CELL_SIZE >= fallingPiece.row) {
    board[fallingPiece.row][fallingPiece.col] = fallingPiece.color;
    fallingPiece = null;

    if (checkForSquareWin(currentPlayer)) {
      document.getElementById("status").textContent = `玩家 ${currentPlayer === "red" ? "🟥" : "🟦"} 獲勝！`;
      gameOver = true;
      document.querySelector(".reset-btn").classList.add("blink");
    } else if (isBoardFull()) {
      document.getElementById("status").textContent = "平手！";
      gameOver = true;
      document.querySelector(".reset-btn").classList.add("blink");
    } else {
      currentPlayer = currentPlayer === "red" ? "blue" : "red";
      document.getElementById("status").textContent = `輪到玩家 ${currentPlayer === "red" ? "🟥" : "🟦"}`;
    }
  }

  drawBoard();
  if (fallingPiece) requestAnimationFrame(animateDrop);
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
  currentPlayer = "red";
  gameOver = false;
  winCoords = null;
  document.getElementById("status").textContent = "輪到玩家 🟥";
  document.querySelector(".reset-btn").classList.remove("blink");
  drawBoard();
}

// ✅ 合併後的唯一 toggleRules 函數
function toggleRules() {
  const overlay = document.getElementById("overlay");
  overlay.classList.toggle("hidden");
}

// ✅ 背景點擊時也能關閉
function closeRules(event) {
  const overlay = document.getElementById("overlay");
  if (event.target === overlay) {
    overlay.classList.add("hidden");
  }
}

resetGame();
