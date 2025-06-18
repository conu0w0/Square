let blink_counter = 0;
let blink_timer = 0;
let blink_interval = 120 + Math.floor(Math.random() * 180);
let counter = 0;
let facePat = 0;

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const offsetX = (canvas.width - BOARD_WIDTH) / 2;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.save();
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

  ctx.save();
  const isDark = document.body.classList.contains("dark");
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
  ctx.globalAlpha = 1;
  ctx.font = "16px 'Noto Sans TC'";
  ctx.fillStyle = gameOver ? "#ff4757" : "#333";
  ctx.textAlign = "center";
  ctx.fillText(msg, canvas.width / 2, baseY + 25);
  ctx.restore();
}

function drawCatFace(face, resetbutton) {
  const x = face.x, y = face.y, r = face.r;
  const size = r * 2;
  const cornerRadius = r * 0.3;

  ctx.lineWidth = 2;
  ctx.strokeStyle = resetbutton.col;
  ctx.fillStyle = resetbutton.col;
  ctx.beginPath();
  roundRect(ctx, x - r, y - r, size, size, cornerRadius);
  ctx.fill();
  ctx.stroke();

  const earW = r * 0.8;
  const earH = r * 0.8;
  const earY = y - r;
  const earXOffset = r * 0.5;

  ctx.beginPath();
  ctx.moveTo(x - earXOffset, earY);
  ctx.lineTo(x - earXOffset - earW / 2, earY + earH);
  ctx.lineTo(x - earXOffset + earW / 2, earY + earH * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + earXOffset, earY);
  ctx.lineTo(x + earXOffset - earW / 2, earY + earH * 0.7);
  ctx.lineTo(x + earXOffset + earW / 2, earY + earH);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  blink_timer++;
  if (blink_timer > blink_interval) {
    blink_counter++;
    if (blink_counter > 6) {
      blink_counter = 0;
      blink_timer = 0;
      blink_interval = 120 + Math.floor(Math.random() * 180);
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

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.4, y + r * 0.4);
  ctx.quadraticCurveTo(x - r * 0.2, y + r * 0.6, x, y + r * 0.4);
  ctx.quadraticCurveTo(x + r * 0.2, y + r * 0.6, x + r * 0.4, y + r * 0.4);
  ctx.stroke();
}
