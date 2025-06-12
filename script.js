const COLS = 7;
const ROWS = 6;
let board = [];
let currentPlayer = "red";
let gameOver = false;

const game = document.getElementById("game");
const status = document.getElementById("status");

function createBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  game.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      game.appendChild(cell);
    }
  }
}

function resetGame() {
  createBoard();
  currentPlayer = "red";
  gameOver = false;
  status.textContent = "輪到玩家 🟥";
}

function dropPiece(col) {
  if (gameOver) return;

  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) {
      board[r][col] = currentPlayer;
      updateCell(r, col, currentPlayer);

      const winCoords = checkForSquareWin(currentPlayer);
      if (winCoords) {
        winCoords.forEach(([r, c]) => {
          const index = r * COLS + c;
          game.children[index].classList.add("win");
        });
        status.textContent = `玩家 ${currentPlayer === "red" ? "🟥" : "🟦"} 獲勝！`;
        gameOver = true;
      } else if (isBoardFull()) {
        status.textContent = "平手！";
        gameOver = true;
      } else {
        currentPlayer = currentPlayer === "red" ? "blue" : "red";
        status.textContent = `輪到玩家 ${currentPlayer === "red" ? "🟥" : "🟦"}`;
      }
      break;
    }
  }
}

function updateCell(row, col, color) {
  const index = row * COLS + col;
  const cell = game.children[index];
  cell.classList.add(color);
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
          return [
            [r, c],
            [r, c + size - 1],
            [r + size - 1, c],
            [r + size - 1, c + size - 1]
          ];
        }
      }
    }
  }
  return null;
}

game.addEventListener("click", (e) => {
  if (!e.target.classList.contains("cell")) return;
  const col = parseInt(e.target.dataset.col);
  dropPiece(col);
});

resetGame();
