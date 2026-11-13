// ===== Setup =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = 120; // where the underground starts

// The point the hook will hang from (used in the next task)
const HOOK_ORIGIN = { x: WIDTH / 2, y: 95 };

// ===== Drawing =====
function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  gradient.addColorStop(0, "#87ceeb");
  gradient.addColorStop(1, "#f6d68f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, GROUND_Y);
}

function drawUnderground() {
  const gradient = ctx.createLinearGradient(0, GROUND_Y, 0, HEIGHT);
  gradient.addColorStop(0, "#8b5a2b");
  gradient.addColorStop(1, "#3b2412");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

  // Grass strip
  ctx.fillStyle = "#5a8f29";
  ctx.fillRect(0, GROUND_Y - 6, WIDTH, 8);
}


function drawWinch() {
  const x = HOOK_ORIGIN.x;
  const groundTop = GROUND_Y - 6;

  // Wooden frame
  ctx.fillStyle = "#6b4423";
  ctx.fillRect(x - 32, 68, 8, groundTop - 68); // left post
  ctx.fillRect(x + 24, 68, 8, groundTop - 68); // right post
  ctx.fillRect(x - 36, 64, 72, 8);             // top bar

  // Rope reel
  ctx.fillStyle = "#a0522d";
  ctx.beginPath();
  ctx.arc(x, 82, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5c3317";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawMiner() {
  const x = HOOK_ORIGIN.x + 75; // miner stands right of the winch
  const feet = GROUND_Y - 6;

  // Legs
  ctx.fillStyle = "#2f4f8f";
  ctx.fillRect(x - 9, feet - 22, 7, 22);
  ctx.fillRect(x + 2, feet - 22, 7, 22);

  // Body
  ctx.fillStyle = "#3b6fd1";
  ctx.fillRect(x - 12, feet - 50, 24, 30);


  // Head
  ctx.fillStyle = "#f1c27d";
  ctx.beginPath();
  ctx.arc(x, feet - 62, 12, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#222";
  ctx.fillRect(x - 5, feet - 63, 3, 3);
  ctx.fillRect(x + 3, feet - 63, 3, 3);

  // Helmet
  ctx.fillStyle = "#ff9f1c";
  ctx.beginPath();
  ctx.arc(x, feet - 66, 13, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(x - 16, feet - 67, 32, 4);

  // Headlamp
  ctx.fillStyle = "#fff6a0";
  ctx.beginPath();
  ctx.arc(x, feet - 73, 4, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawSky();
  drawUnderground();
  drawWinch();
  drawMiner();

}

// ===== Game loop =====
// Redraws the screen about 60 times per second
function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();