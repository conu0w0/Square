canvas.addEventListener("click", (e) => {
  if (gameOver || fallingPiece || currentPlayer !== "red") return;
  const col = getCanvasColFromEvent(e);
  const row = getAvailableRow(col);
  if (row === null || col < 0 || col >= COLS) return;
  fallingPiece = { col, row, y: 0, color: "red" };
  animateDrop();
});

canvas.addEventListener("mousemove", (e) => {
  if (gameOver || fallingPiece || currentPlayer !== "red") return;
  hoverCol = getCanvasColFromEvent(e);
  if (hoverCol < 0 || hoverCol >= COLS) hoverCol = null;
  drawBoard();
});

canvas.addEventListener("mouseleave", () => {
  hoverCol = null;
  drawBoard();
});

canvas.addEventListener("touchstart", (e) => {
  if (gameOver || fallingPiece || currentPlayer !== "red") return;
  e.preventDefault();
  const col = getCanvasColFromEvent(e);
  const row = getAvailableRow(col);
  if (row === null || col < 0 || col >= COLS) return;
  fallingPiece = { col, row, y: 0, color: "red" };
  animateDrop();
});

canvas.addEventListener("touchmove", (e) => {
  if (gameOver || fallingPiece || currentPlayer !== "red") return;
  hoverCol = getCanvasColFromEvent(e);
  if (hoverCol < 0 || hoverCol >= COLS) hoverCol = null;
  drawBoard();
});

canvas.addEventListener("touchend", () => {
  hoverCol = null;
  drawBoard();
});

function getCanvasColFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const offsetX = (canvas.width - BOARD_WIDTH) / 2;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const x = (clientX - rect.left) * (canvas.width / rect.width) - offsetX;
  return Math.floor(x / CELL_SIZE);
}
