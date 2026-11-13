
// ===== Setup =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = 120; // where the underground starts

// The point the hook hangs from
const HOOK_ORIGIN = { x: WIDTH / 2, y: 95 };

// ===== Objects =====
// weight: higher = pulled up more slowly
const OBJECT_TYPES = {
    smallGold: { kind: "gold", radius: 14, weight: 1.2, value: 50 },
    mediumGold: { kind: "gold", radius: 22, weight: 2.2, value: 150 },
    bigGold: { kind: "gold", radius: 34, weight: 4.5, value: 400 },
    smallRock: { kind: "rock", radius: 16, weight: 2.5, value: 15 },
    bigRock: { kind: "rock", radius: 32, weight: 6, value: 40 },
    diamond: { kind: "diamond", radius: 10, weight: 1, value: 500 },
};

// How many of each object to place
const SPAWN_PLAN = {
    smallGold: 5,
    mediumGold: 3,
    bigGold: 2,
    smallRock: 4,
    bigRock: 3,
    diamond: 1,
};


let objects = [];

// ===== Score =====
let score = 0;
let popups = []; // floating "+50" texts
// Find a random spot that doesn't overlap other objects
function createObject(type) {
    const t = OBJECT_TYPES[type];
    for (let tries = 0; tries < 100; tries++) {
        const x = 40 + t.radius + Math.random() * (WIDTH - 80 - t.radius * 2);
        const y = GROUND_Y + 80 + t.radius + Math.random() * (HEIGHT - GROUND_Y - 100 - t.radius * 2);
        const overlaps = objects.some(
            (o) => Math.hypot(o.x - x, o.y - y) < o.radius + t.radius + 10
        );
        if (!overlaps) {
            return { type, ...t, x, y, seed: Math.random() * 10 };
        }
    }
    return null; // no free spot found
}

function spawnObjects() {
    objects = [];
    for (const type in SPAWN_PLAN) {
        for (let i = 0; i < SPAWN_PLAN[type]; i++) {
            const obj = createObject(type);
            if (obj) objects.push(obj);
        }
    }
}

// ===== Hook =====
const hook = {
    angle: 0,          // 0 = straight down, positive = right, negative = left
    direction: 1,      // 1 = swinging right, -1 = swinging left

    length: 30,        // current rope length in pixels
    state: "swinging", // "swinging" | "shooting" | "returning"
    caught: null,      // the object the hook is holding
};

const SWING_SPEED = 1.5;  // radians per second
const MAX_ANGLE = 1.2;    // about 70 degrees to each side
const MIN_LENGTH = 30;    // rope length while swinging
const SHOOT_SPEED = 450;  // pixels per second going down
const RETURN_SPEED = 550; // pixels per second coming back (empty hook)

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

        // Hit the edge of the screen -> come back empty
        if (tip.x < 0 || tip.x > WIDTH || tip.y > HEIGHT) {
            hook.state = "returning";
            return;
        }

        // Touched an object -> grab it
        for (const obj of objects) {
            if (Math.hypot(obj.x - tip.x, obj.y - tip.y) < obj.radius + 6) {
                hook.caught = obj;
                hook.state = "returning";
                break;
            }
        }
    } else if (hook.state === "returning") {
        // Heavier objects come back more slowly
        const speed = hook.caught ? RETURN_SPEED / hook.caught.weight : RETURN_SPEED;
        hook.length -= speed * dt;

        // The caught object moves together with the hook
        if (hook.caught) {
            const tip = getHookTip();
            hook.caught.x = tip.x + Math.sin(hook.angle) * hook.caught.radius * 0.7;
            hook.caught.y = tip.y + Math.cos(hook.angle) * hook.caught.radius * 0.7;

        }

        // Back at the top
        if (hook.length <= MIN_LENGTH) {
            hook.length = MIN_LENGTH;
            if (hook.caught) {
                objects = objects.filter((o) => o !== hook.caught); // collected
                score += hook.caught.value;
                popups.push({
                    text: "+$" + hook.caught.value,
                    x: HOOK_ORIGIN.x,
                    y: HOOK_ORIGIN.y + 20,
                    life: 1, // seconds
                });
                hook.caught = null;
            }
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


// Draws a bumpy, rock-like outline
function traceBlob(x, y, r, seed) {
    ctx.beginPath();
    const points = 10;
    for (let i = 0; i < points; i++) {
        const a = (i / points) * Math.PI * 2;
        const wobble = 0.85 + 0.15 * Math.sin(seed + i * 2.7);
        const px = x + Math.cos(a) * r * wobble;
        const py = y + Math.sin(a) * r * wobble;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}

function drawObject(obj) {
    const { x, y, radius: r } = obj;

    if (obj.kind === "gold") {
        const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
        g.addColorStop(0, "#fff3a0");
        g.addColorStop(0.5, "#ffd700");
        g.addColorStop(1, "#b8860b");
        ctx.fillStyle = g;
        traceBlob(x, y, r, obj.seed);
        ctx.fill();
        ctx.strokeStyle = "#8b6508";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else if (obj.kind === "rock") {
        const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);

        g.addColorStop(0, "#b0b0b0");
        g.addColorStop(1, "#555555");
        ctx.fillStyle = g;
        traceBlob(x, y, r, obj.seed);
        ctx.fill();
        ctx.strokeStyle = "#3d3d3d";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else if (obj.kind === "diamond") {
        const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
        g.addColorStop(0, "#e0ffff");
        g.addColorStop(1, "#00bcd4");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, y - r * 1.3);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r * 1.3);
        ctx.lineTo(x - r, y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
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
function updatePopups(dt) {
    for (const p of popups) {
        p.y -= 40 * dt;  // float upward
        p.life -= dt;
    }
    popups = popups.filter((p) => p.life > 0);
}

function drawPopups() {
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const p of popups) {
        ctx.globalAlpha = Math.max(p.life, 0); // fade out
        ctx.fillStyle = "#ffd700";
        ctx.strokeStyle = "#5c3317";
        ctx.lineWidth = 3;
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
}

function drawScore() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(12, 12, 170, 40);
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffd700";
    ctx.fillText("$ " + score, 24, 32);
}
function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawSky();
    drawUnderground();
    for (const obj of objects) drawObject(obj);
    drawWinch();
    drawHook();
    drawMiner();
    drawPopups();
    drawScore();
}

// ===== Game loop =====
// dt = seconds passed since the last frame, so speed is the same on every computer
let lastTime = performance.now();

function gameLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    updateHook(dt);
    updatePopups(dt);
    draw();
    requestAnimationFrame(gameLoop);
}

spawnObjects();
requestAnimationFrame(gameLoop);