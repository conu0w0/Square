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

function toggleRules() {
  const overlay = document.getElementById("overlay");
  overlay.classList.toggle("hidden");
}

function goHome() {
  window.location.href = "https://github.com/conu0w0/Square";
}
