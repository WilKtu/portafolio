/* =========================================================
   particles.js — partículas coleccionables, chispas y anillos
   (sin DOM: todo en Canvas, con sprites pre-renderizados)
   ========================================================= */
(function () {
  const WC = (window.WC = window.WC || {});

  const COLORS = ["#22d3ee", "#4f8cff", "#a855f7", "#f472b6", "#4ade80", "#fbbf24"];

  function makeSprite(color, size) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const h = size / 2;
    const grad = g.createRadialGradient(h, h, 0, h, h, h);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.18, color);
    grad.addColorStop(0.45, color + "55");
    grad.addColorStop(1, color + "00");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return c;
  }

  const sprites = COLORS.map((c) => makeSprite(c, 64));

  // ---- Partículas del mundo ----
  let N = 0;
  let px, py, pr, pc, pph, pvx, pvy;
  let worldW = 0;
  let worldH = 0;

  // ---- Chispas (pool fijo) ----
  const MAX_SPARKS = 220;
  const sx = new Float32Array(MAX_SPARKS);
  const sy = new Float32Array(MAX_SPARKS);
  const svx = new Float32Array(MAX_SPARKS);
  const svy = new Float32Array(MAX_SPARKS);
  const slife = new Float32Array(MAX_SPARKS);
  const sc = new Uint8Array(MAX_SPARKS);
  let sparkCursor = 0;

  // ---- Anillos de onda ----
  const rings = [];

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function place(i, avoid) {
    for (let k = 0; k < 6; k++) {
      px[i] = rand(60, worldW - 60);
      py[i] = rand(60, worldH - 60);
      if (!avoid || Math.hypot(px[i] - avoid.x, py[i] - avoid.y) > 260) break;
    }
    pr[i] = rand(3, 6.5);
    pc[i] = (Math.random() * COLORS.length) | 0;
    pph[i] = Math.random() * 6.28;
    pvx[i] = pvy[i] = 0;
  }

  function init(world, quality) {
    worldW = world.W;
    worldH = world.H;
    N = [150, 280, 420][quality] || 280;
    px = new Float32Array(N);
    py = new Float32Array(N);
    pr = new Float32Array(N);
    pc = new Uint8Array(N);
    pph = new Float32Array(N);
    pvx = new Float32Array(N);
    pvy = new Float32Array(N);
    for (let i = 0; i < N; i++) place(i);
  }

  /** Actualiza partículas; devuelve cuántas recogió la serpiente. */
  function update(dt, head, headR, onCollect) {
    const magnet = 95;
    for (let i = 0; i < N; i++) {
      const dx = head.x - px[i];
      const dy = head.y - py[i];
      if (dx > 140 || dx < -140 || dy > 140 || dy < -140) continue;
      const d = Math.hypot(dx, dy);
      if (d < headR + pr[i] + 2) {
        burst(px[i], py[i], pc[i], 7);
        onCollect(pc[i]);
        place(i, head);
        continue;
      }
      if (d < magnet) {
        const pull = (1 - d / magnet) * 340 * dt;
        px[i] += (dx / d) * pull;
        py[i] += (dy / d) * pull;
      }
    }
    // chispas
    for (let i = 0; i < MAX_SPARKS; i++) {
      if (slife[i] <= 0) continue;
      slife[i] -= dt;
      sx[i] += svx[i] * dt;
      sy[i] += svy[i] * dt;
      svx[i] *= 0.96;
      svy[i] *= 0.96;
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      rings[i].t += dt;
      if (rings[i].t > rings[i].life) rings.splice(i, 1);
    }
  }

  function burst(x, y, color, n) {
    if (WC.fxOff) return;
    for (let k = 0; k < n; k++) {
      const i = sparkCursor++ % MAX_SPARKS;
      const a = Math.random() * 6.283;
      const v = rand(40, 170);
      sx[i] = x;
      sy[i] = y;
      svx[i] = Math.cos(a) * v;
      svy[i] = Math.sin(a) * v;
      slife[i] = rand(0.35, 0.8);
      sc[i] = color % COLORS.length;
    }
  }

  function ring(x, y, color, maxR) {
    if (WC.fxOff) return;
    if (rings.length > 12) rings.shift();
    rings.push({ x, y, color, maxR: maxR || 90, t: 0, life: 0.7 });
  }

  function draw(ctx, cam, t) {
    const x0 = cam.x - 20;
    const y0 = cam.y - 20;
    const x1 = cam.x + cam.w + 20;
    const y1 = cam.y + cam.h + 20;
    const anim = !WC.fxOff;
    for (let i = 0; i < N; i++) {
      const x = px[i];
      const y = py[i];
      if (x < x0 || x > x1 || y < y0 || y > y1) continue;
      const pulse = anim ? 1 + Math.sin(t * 2.2 + pph[i]) * 0.18 : 1;
      const s = pr[i] * 6 * pulse;
      ctx.drawImage(sprites[pc[i]], x - s / 2, y - s / 2, s, s);
    }
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < MAX_SPARKS; i++) {
      if (slife[i] <= 0) continue;
      const s = 14 * Math.min(1, slife[i] * 2.2);
      ctx.drawImage(sprites[sc[i]], sx[i] - s / 2, sy[i] - s / 2, s, s);
    }
    for (let i = 0; i < rings.length; i++) {
      const r = rings[i];
      const k = r.t / r.life;
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = COLORS[r.color % COLORS.length];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 10 + r.maxR * k, 0, 6.283);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  WC.particles = { COLORS, sprites, init, update, draw, burst, ring };
})();
