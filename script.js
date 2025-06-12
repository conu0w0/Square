const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 7;
const ROWS = 6;
const CELL_SIZE = 60;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPlayer = "red";
let gameOver = false;
let fallingPiece = null;

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 格線
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.strokeStyle = "#aaa";
      ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      const piece = board[r][c];
      if (piece) drawCircle(c, r, piece);
    }
  }

  // 動畫棋子
  if (fallingPiece) {
    drawCircle(fallingPiece.col, fallingPiece.y / CELL_SIZE, fallingPiece.color);
  }
}

function drawCircle(col, row, color) {
  ctx.beginPath();
  ctx.arc(
    col * CELL_SIZE + CELL_SIZE / 2,
    row * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 5,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = color === "red" ? "#e74c3c" : "#3498db";
  ctx.fill();
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

  // 動畫啟動
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
          return true;
        }
      }
    }
  }
  return false;
}

function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  currentPlayer = "red";
  gameOver = false;
  document.getElementById("status").textContent = "輪到玩家 🟥";
  drawBoard();
}

function toggleRules() {
  document.getElementById("rules").classList.toggle("hidden");
}

resetGame();
