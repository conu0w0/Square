let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPlayer = "red";
let gameOver = false;
let fallingPiece = null;
let winCoords = null;
let hoverCol = null;

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

function drawBoard() {
  const padding = 8; // 對應 canvas 的 CSS padding
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const offsetX = (canvas.width - BOARD_WIDTH) / 2 + padding;
  const offsetY = padding;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.save();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 1;
      ctx.strokeRect(offsetX + c * CELL_SIZE, offsetY + r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.restore();

      const piece = board[r][c];
      if (piece) {
        drawPiece(offsetX + c * CELL_SIZE, offsetY + r * CELL_SIZE, piece);
      }
    }
  }

  if (hoverCol !== null && !fallingPiece && !gameOver && currentPlayer === "red") {
    const row = getAvailableRow(hoverCol);
    if (row !== null) {
      drawPiece(offsetX + hoverCol * CELL_SIZE, offsetY + row * CELL_SIZE, currentPlayer, true);
    }
  }

  if (winCoords) {
    winCoords.forEach(([r, c]) => {
      ctx.strokeStyle = "gold";
      ctx.lineWidth = 4;
      const x = offsetX + c * CELL_SIZE + 5;
      const y = offsetY + r * CELL_SIZE + 5;
      const size = CELL_SIZE - 10;
      ctx.beginPath();
      roundRect(ctx, x, y, size, size, 12);
      ctx.stroke();
    });
  }

  if (fallingPiece) {
    drawPiece(
      offsetX + fallingPiece.col * CELL_SIZE,
      offsetY + fallingPiece.y,
      fallingPiece.color
    );
  }

  drawBottomStatus(offsetX);

  // 畫棋盤外框（依主題切換顏色）
  ctx.save();
  const isDark = document.body.classList.contains("dark");
  ctx.strokeStyle = isDark ? "#fff" : "#333";
  ctx.lineWidth = 4;
  ctx.strokeRect(offsetX - 2, offsetY - 2, COLS * CELL_SIZE + 4, ROWS * CELL_SIZE + 4);
  ctx.restore();
}
