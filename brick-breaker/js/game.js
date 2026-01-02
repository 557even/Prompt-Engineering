/* Brick Breaker - Vanilla JS + Canvas
   Features:
   - Paddle + ball physics with angle control
   - Brick grid levels (procedural templates)
   - Score, lives, level progression
   - Keyboard + mouse + touch input
   - Pause overlay
*/

(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });

  const elScore = document.getElementById("score");
  const elLives = document.getElementById("lives");
  const elLevel = document.getElementById("level");

  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const btnStart = document.getElementById("btnStart");
  const btnResume = document.getElementById("btnResume");
  const btnRestart = document.getElementById("btnRestart");

  // ---------- Utilities ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  function drawRoundedRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function setOverlay(show, title, text, showResume) {
    if (show) overlay.classList.remove("hidden");
    else overlay.classList.add("hidden");

    if (title != null) overlayTitle.textContent = title;
    if (text != null) overlayText.textContent = text;

    btnResume.classList.toggle("hidden", !showResume);
    btnStart.classList.toggle("hidden", showResume);
  }

  // ---------- Game State ----------
  const GAME = {
    running: false,
    paused: false,
    waitingForLaunch: true,
    score: 0,
    lives: 3,
    level: 1,
    bricksLeft: 0,
    lastT: 0,
  };

  const WORLD = {
    w: canvas.width,
    h: canvas.height,
    marginTop: 60,
    marginSide: 28,
  };

  const paddle = {
    w: 140,
    h: 16,
    x: WORLD.w / 2,
    y: WORLD.h - 50,
    speed: 820, // px/s
    targetX: WORLD.w / 2,
  };

  const ball = {
    r: 8,
    x: WORLD.w / 2,
    y: WORLD.h - 70,
    vx: 260,
    vy: -260,
    maxSpeed: 760,
    speedBoostPerLevel: 25,
  };

  const bricks = []; // {x,y,w,h,hp,color,points}

  // ---------- Levels ----------
  // 0=empty, 1=normal, 2=strong
  const LEVEL_TEMPLATES = [
    [
      "0011111100",
      "0112222110",
      "0111111110",
      "0011111100",
    ],
    [
      "0122222210",
      "0111111110",
      "0011111100",
      "0001111000",
    ],
    [
      "0011221100",
      "0112222110",
      "0122222210",
      "0112222110",
      "0011221100",
    ],
    [
      "1111111111",
      "1222222221",
      "1111111111",
      "1222222221",
    ],
  ];

  function buildLevel(level) {
    bricks.length = 0;

    const template = LEVEL_TEMPLATES[(level - 1) % LEVEL_TEMPLATES.length];
    const rows = template.length;
    const cols = template[0].length;

    const gap = 8;
    const top = WORLD.marginTop + 16;
    const left = WORLD.marginSide;

    const availableW = WORLD.w - WORLD.marginSide * 2;
    const brickW = Math.floor((availableW - gap * (cols - 1)) / cols);
    const brickH = 20;

    const palette = [
      "#000000",
      "#7c5cff",
      "#2ee59d",
      "#ffcc00",
      "#ff4d6d",
      "#4da3ff",
    ];

    let leftCount = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = template[r][c];
        const kind = ch.charCodeAt(0) - 48;
        if (kind <= 0) continue;

        const hp = kind; // 1 or 2
        const color = hp === 1 ? palette[(c + r) % palette.length] : "#ff4d6d";
        const points = hp === 1 ? 50 : 120;

        const x = left + c * (brickW + gap);
        const y = top + r * (brickH + gap);

        bricks.push({ x, y, w: brickW, h: brickH, hp, color, points });
        leftCount++;
      }
    }

    GAME.bricksLeft = leftCount;
  }

  function resetBallOnPaddle() {
    GAME.waitingForLaunch = true;
    ball.x = paddle.x;
    ball.y = paddle.y - paddle.h / 2 - ball.r - 1;

    // Randomize initial direction slightly (upwards)
    const base = 320 + (GAME.level - 1) * ball.speedBoostPerLevel;
    const speed = clamp(base, 280, ball.maxSpeed);
    const ang = rand((-Math.PI * 3) / 4, (-Math.PI * 1) / 4);
    ball.vx = Math.cos(ang) * speed;
    ball.vy = Math.sin(ang) * speed;
  }

  function resetPaddle() {
    paddle.x = WORLD.w / 2;
    paddle.targetX = paddle.x;
  }

  function resetGame() {
    GAME.running = false;
    GAME.paused = false;
    GAME.score = 0;
    GAME.lives = 3;
    GAME.level = 1;

    resetPaddle();
    buildLevel(GAME.level);
    resetBallOnPaddle();

    syncHud();
    setOverlay(true, "Brick Breaker", "Move with A/D or ←/→. Launch with Space/Enter.", false);
  }

  function nextLevel() {
    GAME.level += 1;
    buildLevel(GAME.level);
    resetPaddle();
    resetBallOnPaddle();
    syncHud();
  }

  function syncHud() {
    elScore.textContent = String(GAME.score);
    elLives.textContent = String(GAME.lives);
    elLevel.textContent = String(GAME.level);
  }

  // ---------- Input ----------
  const input = {
    left: false,
    right: false,
    mouseActive: false,
    pointerX: paddle.x,
  };

  function onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (k === "a" || k === "arrowleft") input.left = true;
    if (k === "d" || k === "arrowright") input.right = true;

    if (k === " " || k === "enter") {
      if (!GAME.running) startGame();
      else if (GAME.paused) togglePause(false);
      else if (GAME.waitingForLaunch) GAME.waitingForLaunch = false;
    }

    if (k === "p" || k === "escape") {
      if (GAME.running) togglePause(!GAME.paused);
    }
  }

  function onKeyUp(e) {
    const k = e.key.toLowerCase();
    if (k === "a" || k === "arrowleft") input.left = false;
    if (k === "d" || k === "arrowright") input.right = false;
  }

  function canvasToWorldX(clientX) {
    // Convert pointer X to canvas coordinates (accounts for CSS scaling)
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * WORLD.w;
    return x;
  }

  function onPointerMove(e) {
    input.mouseActive = true;
    input.pointerX = canvasToWorldX(e.clientX);
  }

  function onTouchMove(e) {
    if (!e.touches || e.touches.length === 0) return;
    input.mouseActive = true;
    input.pointerX = canvasToWorldX(e.touches[0].clientX);
    e.preventDefault();
  }

  function onPointerDown(e) {
    input.mouseActive = true;
    input.pointerX = canvasToWorldX(e.clientX);

    if (!GAME.running) startGame();
    else if (GAME.paused) togglePause(false);
    else if (GAME.waitingForLaunch) GAME.waitingForLaunch = false;
  }

  // ---------- Physics ----------
  function rectCircleCollide(rx, ry, rw, rh, cx, cy, cr) {
    // Closest point on rectangle to circle
    const px = clamp(cx, rx, rx + rw);
    const py = clamp(cy, ry, ry + rh);
    const dx = cx - px;
    const dy = cy - py;
    return dx * dx + dy * dy <= cr * cr;
  }

  function reflectBallFromPaddle() {
    // Add "english": hit position changes angle
    const hit = (ball.x - paddle.x) / (paddle.w / 2); // -1..1
    const clamped = clamp(hit, -1, 1);

    // Desired angle range: 160°..20° (in radians from +x)
    // Better: compute vx based on hit, keep speed constant, force vy upward
    const speed = Math.min(Math.hypot(ball.vx, ball.vy), ball.maxSpeed);
    const maxAngle = (Math.PI * 5) / 12; // 75°
    const angle = clamped * maxAngle;

    ball.vx = Math.sin(angle) * speed;
    ball.vy = -Math.cos(angle) * speed;

    // Small extra speed as levels increase
    const boost = 1 + Math.min(0.22, (GAME.level - 1) * 0.03);
    ball.vx *= boost;
    ball.vy *= boost;

    // Clamp
    const s2 = Math.hypot(ball.vx, ball.vy);
    if (s2 > ball.maxSpeed) {
      ball.vx = (ball.vx / s2) * ball.maxSpeed;
      ball.vy = (ball.vy / s2) * ball.maxSpeed;
    }
  }

  function update(dt) {
    // Paddle movement
    let moveDir = 0;
    if (input.left) moveDir -= 1;
    if (input.right) moveDir += 1;

    if (input.mouseActive) {
      paddle.targetX = input.pointerX;
      const dx = paddle.targetX - paddle.x;
      const step = clamp(dx, -paddle.speed * dt, paddle.speed * dt);
      paddle.x += step;
    } else {
      paddle.x += moveDir * paddle.speed * dt;
    }

    const halfW = paddle.w / 2;
    paddle.x = clamp(paddle.x, WORLD.marginSide + halfW, WORLD.w - WORLD.marginSide - halfW);

    // Ball "sticky" before launch
    if (GAME.waitingForLaunch) {
      ball.x = paddle.x;
      ball.y = paddle.y - paddle.h / 2 - ball.r - 1;
      return;
    }

    // Ball movement
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Wall collisions
    if (ball.x - ball.r <= WORLD.marginSide) {
      ball.x = WORLD.marginSide + ball.r;
      ball.vx *= -1;
    } else if (ball.x + ball.r >= WORLD.w - WORLD.marginSide) {
      ball.x = WORLD.w - WORLD.marginSide - ball.r;
      ball.vx *= -1;
    }

    if (ball.y - ball.r <= WORLD.marginTop) {
      ball.y = WORLD.marginTop + ball.r;
      ball.vy *= -1;
    }

    // Bottom (lose life)
    if (ball.y - ball.r > WORLD.h) {
      GAME.lives -= 1;
      syncHud();

      if (GAME.lives <= 0) {
        GAME.running = false;
        setOverlay(true, "Game Over", `Final Score: ${GAME.score}. Press Restart to play again.`, false);
        return;
      }

      resetBallOnPaddle();
      return;
    }

    // Paddle collision
    const px = paddle.x - paddle.w / 2;
    const py = paddle.y - paddle.h / 2;

    if (ball.vy > 0 && rectCircleCollide(px, py, paddle.w, paddle.h, ball.x, ball.y, ball.r)) {
      ball.y = py - ball.r - 0.5;
      reflectBallFromPaddle();
    }

    // Brick collisions (check only near by; here: simple loop)
    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (b.hp <= 0) continue;

      if (rectCircleCollide(b.x, b.y, b.w, b.h, ball.x, ball.y, ball.r)) {
        // Determine collision side by comparing overlaps
        const cx = ball.x;
        const cy = ball.y;

        const closestX = clamp(cx, b.x, b.x + b.w);
        const closestY = clamp(cy, b.y, b.y + b.h);
        const dx = cx - closestX;
        const dy = cy - closestY;

        // If dx is larger, reflect X, else reflect Y (approx)
        if (Math.abs(dx) > Math.abs(dy)) ball.vx *= -1;
        else ball.vy *= -1;

        b.hp -= 1;
        if (b.hp === 1) b.color = "#ffcc00";
        if (b.hp <= 0) {
          GAME.score += b.points;
          GAME.bricksLeft -= 1;
          syncHud();
        } else {
          GAME.score += 10;
          syncHud();
        }

        // Only one brick collision per frame to keep behavior stable
        break;
      }
    }

    // Level cleared
    if (GAME.bricksLeft <= 0) {
      // brief pause-like overlay
      GAME.waitingForLaunch = true;
      setOverlay(true, "Level Cleared!", `Level ${GAME.level} complete. Press Start/Space to continue.`, false);
      // Keep running false until user presses start
      GAME.running = false;
    }
  }

  // ---------- Render ----------
  function render() {
    // Background
    ctx.fillStyle = "#070b18";
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);

    // Subtle grid
    ctx.globalAlpha = 0.10;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    for (let x = WORLD.marginSide; x < WORLD.w - WORLD.marginSide; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, WORLD.marginTop);
      ctx.lineTo(x, WORLD.h);
      ctx.stroke();
    }
    for (let y = WORLD.marginTop; y < WORLD.h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(WORLD.marginSide, y);
      ctx.lineTo(WORLD.w - WORLD.marginSide, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Playfield border
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      WORLD.marginSide,
      WORLD.marginTop,
      WORLD.w - WORLD.marginSide * 2,
      WORLD.h - WORLD.marginTop - 10
    );

    // Bricks
    for (const b of bricks) {
      if (b.hp <= 0) continue;

      const glow = b.hp === 2 ? "rgba(255,77,109,0.35)" : "rgba(124,92,255,0.25)";
      ctx.shadowColor = glow;
      ctx.shadowBlur = 12;

      ctx.fillStyle = b.color;
      drawRoundedRect(b.x, b.y, b.w, b.h, 8);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.20)";
      ctx.lineWidth = 1;
      drawRoundedRect(b.x, b.y, b.w, b.h, 8);
      ctx.stroke();

      // HP pips
      if (b.hp > 1) {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.arc(b.x + b.w - 10, b.y + 10, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Paddle
    const px = paddle.x - paddle.w / 2;
    const py = paddle.y - paddle.h / 2;

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    drawRoundedRect(px - 4, py - 4, paddle.w + 8, paddle.h + 8, 12);
    ctx.fill();

    const grad = ctx.createLinearGradient(px, py, px + paddle.w, py);
    grad.addColorStop(0, "#7c5cff");
    grad.addColorStop(0.5, "#4da3ff");
    grad.addColorStop(1, "#2ee59d");

    ctx.fillStyle = grad;
    drawRoundedRect(px, py, paddle.w, paddle.h, 10);
    ctx.fill();

    // Ball
    ctx.shadowColor = "rgba(77,163,255,0.45)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#eaf0ff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Top HUD bar inside canvas
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(WORLD.marginSide, 14, WORLD.w - WORLD.marginSide * 2, 34);

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "700 14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText(`Score: ${GAME.score}`, WORLD.marginSide + 14, 36);
    ctx.fillText(`Lives: ${GAME.lives}`, WORLD.marginSide + 170, 36);
    ctx.fillText(`Level: ${GAME.level}`, WORLD.marginSide + 300, 36);

    if (!GAME.running && !GAME.paused && GAME.lives > 0 && GAME.bricksLeft > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "600 13px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText(
        "Press Start / Space / Enter to play",
        WORLD.w - WORLD.marginSide - 280,
        36
      );
    }

    if (GAME.waitingForLaunch && GAME.running) {
      ctx.fillStyle = "rgba(255,255,255,0.70)";
      ctx.font = "600 13px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText(
        "Launch: Space / Enter / Click",
        WORLD.w - WORLD.marginSide - 255,
        WORLD.h - 18
      );
    }
  }

  // ---------- Loop ----------
  function loop(t) {
    if (!GAME.running) {
      render();
      requestAnimationFrame(loop);
      return;
    }
    if (GAME.paused) {
      render();
      requestAnimationFrame(loop);
      return;
    }

    const dt = Math.min(0.02, (t - GAME.lastT) / 1000 || 0.016);
    GAME.lastT = t;

    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function togglePause(paused) {
    GAME.paused = paused;
    if (paused) {
      setOverlay(true, "Paused", "Press Resume or P/Esc to continue.", true);
    } else {
      setOverlay(false);
    }
  }

  function startGame() {
    // If level cleared overlay is showing, resume by making game running again
    overlay.classList.add("hidden");
    GAME.running = true;
    GAME.paused = false;

    // If we cleared a level previously, we want to actually advance now
    if (GAME.bricksLeft <= 0) {
      nextLevel();
    }

    // On first start after reset, the ball is waiting on paddle
    GAME.lastT = performance.now();
  }

  // ---------- UI Buttons ----------
  btnStart.addEventListener("click", () => {
    if (!GAME.running) {
      startGame();
      if (GAME.waitingForLaunch) GAME.waitingForLaunch = false;
    }
  });

  btnResume.addEventListener("click", () => togglePause(false));

  btnRestart.addEventListener("click", () => {
    resetGame();
  });

  // ---------- Event Listeners ----------
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  canvas.addEventListener("mousemove", onPointerMove);
  canvas.addEventListener("mousedown", onPointerDown);

  canvas.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches[0]) {
      input.mouseActive = true;
      input.pointerX = canvasToWorldX(e.touches[0].clientX);
    }
    if (!GAME.running) startGame();
    else if (GAME.paused) togglePause(false);
    else if (GAME.waitingForLaunch) GAME.waitingForLaunch = false;
  }, { passive: false });

  canvas.addEventListener("touchmove", onTouchMove, { passive: false });

  // ---------- Boot ----------
  resetGame();
  requestAnimationFrame(loop);
})();