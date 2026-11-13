// ===== Setup =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = 120; // where the underground starts

// The point the hook hangs from
const HOOK_ORIGIN = { x: WIDTH / 2, y: 95 };

// ===== Hook =====
const hook = {
  angle: 0,          // 0 = straight down, positive = right, negative = left
  direction: 1,      // 1 = swinging right, -1 = swinging left
  length: 30,        // current rope length in pixels
  state: "swinging", // "swinging" | "shooting" | "returning"
};

const SWING_SPEED = 1.5;  // radians per second
const MAX_ANGLE = 1.2;    // about 70 degrees to each side
const MIN_LENGTH = 30;    // rope length while swinging
const SHOOT_SPEED = 450;  // pixels per second going down
const RETURN_SPEED = 550; // pixels per second coming back

// Position of the hook's tip, based on its angle and rope length
function getHookTip() {
  return {
    x: HOOK_ORIGIN.x + Math.sin(hook.angle) * hook.length,
    y: HOOK_ORIGIN.y + Math.cos(hook.angle) * hook.length,
  };
}


function fireHook() {
  if (hook.state === "swinging") {
    hook.state = "shooting";
  }
}

function updateHook(dt) {
  if (hook.state === "swinging") {
    hook.angle += hook.direction * SWING_SPEED * dt;
    if (hook.angle > MAX_ANGLE) {
      hook.angle = MAX_ANGLE;
      hook.direction = -1;
    }
    if (hook.angle < -MAX_ANGLE) {
      hook.angle = -MAX_ANGLE;
      hook.direction = 1;
    }
  } else if (hook.state === "shooting") {
    hook.length += SHOOT_SPEED * dt;
    const tip = getHookTip();
    // Hit the edge of the screen -> come back
    if (tip.x < 0 || tip.x > WIDTH || tip.y > HEIGHT) {
      hook.state = "returning";
    }
  } else if (hook.state === "returning") {
    hook.length -= RETURN_SPEED * dt;
    if (hook.length <= MIN_LENGTH) {
      hook.length = MIN_LENGTH;
      hook.state = "swinging";
    }
  }

}

// ===== Input =====
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowDown") {
    e.preventDefault(); // stop the page from scrolling
    fireHook();
  }
});

canvas.addEventListener("pointerdown", fireHook); // mouse click or touch

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

function drawHook() {
  const tip = getHookTip();

  // Rope
  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(HOOK_ORIGIN.x, HOOK_ORIGIN.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.stroke();


  // Claw (rotated to match the rope direction)
  ctx.save();
  ctx.translate(tip.x, tip.y);
  ctx.rotate(-hook.angle);
  ctx.strokeStyle = "#9aa3ad";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  ctx.beginPath(); // left prong
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-14, 6, -8, 18);
  ctx.stroke();

  ctx.beginPath(); // right prong
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, 6, 8, 18);
  ctx.stroke();

  ctx.fillStyle = "#6c757d"; // center joint
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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
  drawHook();
  drawMiner();
}

// ===== Game loop =====
// dt = seconds passed since the last frame, so speed is the same on every computer
let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  updateHook(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);