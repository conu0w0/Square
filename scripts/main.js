// 啟動遊戲主迴圈
function gameLoop() {
  drawBoard();
  requestAnimationFrame(gameLoop);
}

resetGame();
gameLoop();
