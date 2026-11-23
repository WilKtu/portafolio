/* =========================================================
   snake.js — serpiente: movimiento, crecimiento y render
   ========================================================= */
(function () {
  const WC = (window.WC = window.WC || {});

  const MAX = 90;
  const START = 18;
  const BASE_SPEED = 215;
  const BOOST_MULT = 1.7;

  const xs = new Float32Array(MAX);
  const ys = new Float32Array(MAX);

  const snake = {
    xs,
    ys,
    n: 1,
    target: START,
    angle: 0,
    r: 8,
    growTimer: 0,
    boosting: false,
    speed: 0
  };

  // Tabla de colores cabeza→cola (cian → azul → morado)
  const BODY = [];
  for (let i = 0; i < MAX; i++) {
    const k = i / (MAX - 1);
    BODY.push(`hsl(${186 + k * 96} 92% ${60 - k * 8}%)`);
  }

  function wrap(a) {
    while (a > Math.PI) a -= 6.2832;
    while (a < -Math.PI) a += 6.2832;
    return a;
  }

  function spawn(x, y, angle) {
    snake.n = 1;
    snake.target = START;
    snake.angle = angle || 0;
    xs[0] = x;
    ys[0] = y;
    snake.growTimer = 0;
    snake.r = 8;
  }

  /** Coloca toda la serpiente en una nueva posición (viaje instantáneo). */
  function teleport(x, y) {
    const sp = spacing();
    for (let i = 0; i < snake.n; i++) {
      xs[i] = x - Math.cos(snake.angle) * sp * i;
      ys[i] = y - Math.sin(snake.angle) * sp * i;
    }
  }

  function spacing() {
    return snake.r * 0.9;
  }

  function grow(k) {
    snake.target = Math.min(MAX, snake.target + k);
  }

  function update(dt, desiredAngle, speedFactor, boost, world) {
    snake.boosting = !!boost;

    // Giro suave y limitado (sensación de serpiente)
    if (desiredAngle !== null && desiredAngle !== undefined) {
      const diff = wrap(desiredAngle - snake.angle);
      const maxTurn = (boost ? 3.4 : 5) * dt;
      snake.angle += Math.max(-maxTurn, Math.min(maxTurn, diff * Math.min(1, dt * 10)));
    }

    const speed = BASE_SPEED * speedFactor * (boost ? BOOST_MULT : 1);
    snake.speed = speed;
    xs[0] += Math.cos(snake.angle) * speed * dt;
    ys[0] += Math.sin(snake.angle) * speed * dt;

    // Límites del mundo: la serpiente rebota suavemente hacia el centro
    const m = 30;
    if (xs[0] < m || xs[0] > world.W - m || ys[0] < m || ys[0] > world.H - m) {
      xs[0] = Math.max(m, Math.min(world.W - m, xs[0]));
      ys[0] = Math.max(m, Math.min(world.H - m, ys[0]));
      const toC = Math.atan2(world.H / 2 - ys[0], world.W / 2 - xs[0]);
      snake.angle += wrap(toC - snake.angle) * Math.min(1, dt * 6);
    }

    // Crecimiento progresivo (aparición y recolección)
    if (snake.n < snake.target) {
      snake.growTimer += dt;
      if (snake.growTimer > 0.045) {
        snake.growTimer = 0;
        const i = snake.n++;
        xs[i] = xs[i - 1];
        ys[i] = ys[i - 1];
      }
    }
    snake.r = 8 + Math.min(snake.n - START, 50) * 0.07;

    // Cuerpo: cada segmento persigue al anterior
    const sp = spacing();
    for (let i = 1; i < snake.n; i++) {
      const dx = xs[i - 1] - xs[i];
      const dy = ys[i - 1] - ys[i];
      const d = Math.hypot(dx, dy);
      if (d > sp) {
        const f = (d - sp) / d;
        xs[i] += dx * f;
        ys[i] += dy * f;
      }
    }
  }

  function draw(ctx, cam, t, steerAngle) {
    const n = snake.n;
    const r = snake.r;
    const glow = WC.particles.sprites[0];
    const glow2 = WC.particles.sprites[2];
    const boost = snake.boosting;

    // Resplandor
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = boost ? 0.55 : 0.32;
    for (let i = n - 1; i >= 0; i -= 3) {
      const s = r * (i === 0 ? 7 : 5);
      ctx.drawImage(i > n / 2 ? glow2 : glow, xs[i] - s / 2, ys[i] - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    // Cuerpo de cola a cabeza
    for (let i = n - 1; i >= 1; i--) {
      const rr = r * (1 - 0.35 * (i / n));
      ctx.fillStyle = BODY[Math.min(MAX - 1, Math.round((i / n) * (MAX - 1)))];
      ctx.beginPath();
      ctx.arc(xs[i], ys[i], rr, 0, 6.2832);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.2)";
      ctx.beginPath();
      ctx.arc(xs[i] - rr * 0.25, ys[i] - rr * 0.3, rr * 0.45, 0, 6.2832);
      ctx.fill();
    }

    // Cabeza
    const hx = xs[0];
    const hy = ys[0];
    const hr = r * 1.18;
    ctx.fillStyle = BODY[0];
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, 6.2832);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.25)";
    ctx.beginPath();
    ctx.arc(hx - hr * 0.25, hy - hr * 0.3, hr * 0.5, 0, 6.2832);
    ctx.fill();

    // Ojos (miran hacia donde se dirige)
    const a = snake.angle;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const look = steerAngle === null || steerAngle === undefined ? a : steerAngle;
    for (let side = -1; side <= 1; side += 2) {
      const ex = hx + ca * hr * 0.4 - sa * hr * 0.5 * side;
      const ey = hy + sa * hr * 0.4 + ca * hr * 0.5 * side;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(ex, ey, hr * 0.32, 0, 6.2832);
      ctx.fill();
      ctx.fillStyle = "#0a0f24";
      ctx.beginPath();
      ctx.arc(ex + Math.cos(look) * hr * 0.12, ey + Math.sin(look) * hr * 0.12, hr * 0.17, 0, 6.2832);
      ctx.fill();
    }
  }

  WC.snake = snake;
  WC.snakeApi = { spawn, teleport, grow, update, draw, MAX, START };
})();
