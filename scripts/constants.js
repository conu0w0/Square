const CELL_SIZE = 60;
const ROWS = 6;
const COLS = 7;
const STATUS_HEIGHT = 120; // 留白加大

const BOARD_WIDTH = COLS * CELL_SIZE;
const BOARD_HEIGHT = ROWS * CELL_SIZE;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = BOARD_WIDTH;
canvas.height = BOARD_HEIGHT + STATUS_HEIGHT;

const maxR = Math.min(canvas.width, canvas.height) * 0.04;
const catFaceRadius = Math.min(maxR, 20);
