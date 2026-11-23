/* =========================================================
   app.js — bucle principal, entrada (mouse/táctil/teclado),
   cámara, minimapa y arranque
   ========================================================= */
(function () {
  const WC = window.WC;
  const $ = (s, r = document) => r.querySelector(s);
  const dev = WC.device;
  const nav = WC.nav;
  const world = WC.world;
  const snake = WC.snake;
  const api = WC.snakeApi;

  const canvas = $("#world");
  const ctx = canvas.getContext("2d", { alpha: false });
  const mini = $("#minimap");
  const mctx = mini.getContext("2d");
  const scoreEl = $("#score");
  const boostBtn = $("#boost");

  const cam = { x: 0, y: 0, w: 0, h: 0, scale: 1 };
  const input = {
    mx: 0,
    my: 0,
    mouse: false,
    mouseDown: false,
    btnBoost: false,
    joy: null,
    keys: {},
    autoMx: 0,
    autoMy: 0
  };

  let auto = null;
  let started = false;
  let score = 0;
  let collected = 0;
  let t = 0;
  let last = 0;
  let raf = 0;
  let frameCount = 0;
  let bgGrad = null;
  let dwell = { id: null, t: 0 };
  const suppress = {};

  // ---------- Tamaño del canvas ----------
  function resize() {
    cam.scale = dev.scale;
    canvas.width = Math.floor(dev.w * dev.dpr);
    canvas.height = Math.floor(dev.h * dev.dpr);
    cam.w = dev.w / cam.scale;
    cam.h = dev.h / cam.scale;
    bgGrad = ctx.createRadialGradient(dev.w / 2, dev.h / 2, 0, dev.w / 2, dev.h / 2, Math.max(dev.w, dev.h) * 0.75);
    bgGrad.addColorStop(0, "#0d1330");
    bgGrad.addColorStop(1, "#050712");
    boostBtn.hidden = !dev.touch || nav.textMode;
  }

  // ---------- Entrada ----------
  function screenToWorld(sx, sy) {
    return [cam.x + sx / cam.scale, cam.y + sy / cam.scale];
  }

  function cancelAuto() {
    auto = null;
  }

  let downInfo = null;

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  canvas.addEventListener("pointerdown", (e) => {
    downInfo = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    if (e.pointerType === "mouse") {
      input.mouse = true;
      input.mx = e.clientX;
      input.my = e.clientY;
      input.mouseDown = true;
    } else {
      cancelAuto();
      input.joy = { id: e.pointerId, ox: e.clientX, oy: e.clientY, cx: e.clientX, cy: e.clientY };
    }
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {}
  });

  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") {
      input.mouse = true;
      input.mx = e.clientX;
      input.my = e.clientY;
      if (auto && Math.hypot(e.clientX - input.autoMx, e.clientY - input.autoMy) > 60) cancelAuto();
    } else if (input.joy && input.joy.id === e.pointerId) {
      input.joy.cx = e.clientX;
      input.joy.cy = e.clientY;
      // el origen sigue al dedo si se aleja demasiado (joystick flotante)
      const dx = e.clientX - input.joy.ox;
      const dy = e.clientY - input.joy.oy;
      const d = Math.hypot(dx, dy);
      if (d > 70) {
        input.joy.ox += (dx / d) * (d - 70);
        input.joy.oy += (dy / d) * (d - 70);
      }
    }
  });

  function endPointer(e) {
    if (e.pointerType === "mouse") input.mouseDown = false;
    else if (input.joy && input.joy.id === e.pointerId) input.joy = null;
    if (downInfo && downInfo.id === e.pointerId && e.type === "pointerup") {
      const moved = Math.hypot(e.clientX - downInfo.x, e.clientY - downInfo.y);
      if (moved < 14 && performance.now() - downInfo.t < 450) {
        const w = screenToWorld(e.clientX, e.clientY);
        WC.interactions.tap(w[0], w[1], e.pointerType === "mouse" ? 8 : 22);
      }
    }
    downInfo = null;
  }
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  canvas.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") {
      input.mouse = false;
      input.mouseDown = false;
    }
  });

  boostBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    input.btnBoost = true;
    boostBtn.classList.add("on");
    try {
      boostBtn.setPointerCapture(e.pointerId);
    } catch (err) {}
  });
  const boostOff = () => {
    input.btnBoost = false;
    boostBtn.classList.remove("on");
  };
  boostBtn.addEventListener("pointerup", boostOff);
  boostBtn.addEventListener("pointercancel", boostOff);

  const KEYMAP = {
    ArrowUp: "u",
    w: "u",
    W: "u",
    ArrowDown: "d",
    s: "d",
    S: "d",
    ArrowLeft: "l",
    a: "l",
    A: "l",
    ArrowRight: "r",
    d: "r",
    D: "r"
  };

  function inUI(el) {
    return el && el.closest && el.closest(".panel, .modal, .dock, .hud");
  }

  addEventListener("keydown", (e) => {
    if (nav.textMode || WC.modalOpen) return;
    if (e.key === "Shift") {
      input.keys.shift = true;
      return;
    }
    if (e.key === "Enter" && !inUI(document.activeElement) && document.activeElement.tagName !== "A") {
      if (WC.interactions.openNear()) e.preventDefault();
      return;
    }
    const k = KEYMAP[e.key];
    if (k && !inUI(document.activeElement) && !e.ctrlKey && !e.metaKey) {
      input.keys[k] = true;
      cancelAuto();
      e.preventDefault();
    }
  });
  addEventListener("keyup", (e) => {
    if (e.key === "Shift") input.keys.shift = false;
    const k = KEYMAP[e.key];
    if (k) input.keys[k] = false;
  });
  addEventListener("blur", () => {
    input.keys = {};
    input.mouseDown = false;
    input.joy = null;
  });

  // ---------- Dirección ----------
  let steerAngle = null;

  function steer() {
    const k = input.keys;
    const boost = !!(k.shift || input.btnBoost || input.mouseDown);
    let angle = null;
    let speed = 1;

    const kx = (k.r ? 1 : 0) - (k.l ? 1 : 0);
    const ky = (k.d ? 1 : 0) - (k.u ? 1 : 0);
    const hx = (snake.xs[0] - cam.x) * cam.scale;
    const hy = (snake.ys[0] - cam.y) * cam.scale;

    if (kx || ky) {
      angle = Math.atan2(ky, kx);
    } else if (input.joy) {
      const dx = input.joy.cx - input.joy.ox;
      const dy = input.joy.cy - input.joy.oy;
      if (Math.hypot(dx, dy) > 10) angle = Math.atan2(dy, dx);
      else speed = 0.6;
    } else if (auto) {
      const dx = auto.x - snake.xs[0];
      const dy = auto.y - snake.ys[0];
      if (Math.hypot(dx, dy) < 40) auto = null;
      else {
        angle = Math.atan2(dy, dx);
        return { angle, speed: 1.9, boost: false };
      }
    }
    if (angle === null && input.mouse) {
      const dx = input.mx - hx;
      const dy = input.my - hy;
      const d = Math.hypot(dx, dy);
      if (d > 22) {
        angle = Math.atan2(dy, dx);
        speed = d < 70 ? 0.5 + d / 140 : 1;
      } else speed = 0.35;
    }
    if (angle === null && !input.joy && !input.mouse && !kx && !ky) {
      // reposo: deriva suave (o detenida en modo calmo)
      if (WC.calm) speed = 0;
      else {
        angle = snake.angle + Math.sin(t * 0.8) * 0.5;
        speed = 0.42;
      }
    }
    return { angle, speed, boost };
  }

  // ---------- Juego ----------
  WC.addScore = function (n) {
    score += n;
    scoreEl.textContent = score;
  };

  function onCollect() {
    score++;
    collected++;
    if (collected % 6 === 0) api.grow(1);
    scoreEl.textContent = score;
  }

  function updateZone(dt) {
    const hx = snake.xs[0];
    const hy = snake.ys[0];
    const z = world.zoneAt(hx, hy, 0.78);
    nav.setZone(z ? z.id : null);

    world.zones.forEach((zz) => {
      if (suppress[zz.id] && Math.hypot(hx - zz.x, hy - zz.y) > zz.r) suppress[zz.id] = false;
    });

    if (z && started && !nav.textMode) {
      if (dwell.id !== z.id) {
        dwell.id = z.id;
        dwell.t = 0;
      } else dwell.t += dt;
      if (dwell.t > 0.8 && nav.panel !== z.id && !suppress[z.id] && !WC.modalOpen && !auto) {
        nav.openPanel(z.id, { focus: false });
      }
    } else dwell.id = null;
  }

  function update(dt) {
    const s = steer();
    steerAngle = s.angle;
    api.update(dt, s.angle, s.speed, s.boost, world);
    const head = { x: snake.xs[0], y: snake.ys[0] };
    WC.particles.update(dt, head, snake.r * 1.18, onCollect);
    WC.interactions.update(dt, head, snake.r * 1.18);
    updateZone(dt);

    // Cámara: sigue a la cabeza; con panel abierto desplaza el foco
    const hero = nav.panel === "home";
    const shiftX = !dev.mobile && nav.panel && !hero ? cam.w * 0.2 : 0;
    const shiftY = dev.mobile && nav.panel ? cam.h * 0.2 : 0;
    let tx = head.x - cam.w / 2 + shiftX;
    let ty = head.y - cam.h / 2 + shiftY;
    tx = cam.w >= world.W + 240 ? (world.W - cam.w) / 2 : Math.max(-120, Math.min(world.W - cam.w + 120, tx));
    ty = cam.h >= world.H + 240 ? (world.H - cam.h) / 2 : Math.max(-120, Math.min(world.H - cam.h + 120, ty));
    const k = WC.calm ? 1 : 1 - Math.exp(-dt * 5);
    cam.x += (tx - cam.x) * k;
    cam.y += (ty - cam.y) * k;
  }

  function render() {
    ctx.setTransform(dev.dpr, 0, 0, dev.dpr, 0, 0);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, dev.w, dev.h);

    const sc = dev.dpr * cam.scale;
    ctx.setTransform(sc, 0, 0, sc, -cam.x * sc, -cam.y * sc);
    world.draw(ctx, cam, t, { calm: WC.calm, zoneId: nav.zone });
    WC.particles.draw(ctx, cam, t);
    WC.interactions.draw(ctx, cam, t, WC.calm);
    api.draw(ctx, cam, t, steerAngle);

    // Joystick táctil
    ctx.setTransform(dev.dpr, 0, 0, dev.dpr, 0, 0);
    if (input.joy) {
      const j = input.joy;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(34,211,238,.5)";
      ctx.beginPath();
      ctx.arc(j.ox, j.oy, 54, 0, 6.2832);
      ctx.stroke();
      ctx.fillStyle = "rgba(34,211,238,.35)";
      ctx.beginPath();
      const dx = j.cx - j.ox;
      const dy = j.cy - j.oy;
      const d = Math.min(54, Math.hypot(dx, dy));
      const a = Math.atan2(dy, dx);
      ctx.arc(j.ox + Math.cos(a) * d, j.oy + Math.sin(a) * d, 24, 0, 6.2832);
      ctx.fill();
    }

    if (frameCount % 3 === 0) drawMinimap();
  }

  function drawMinimap() {
    const w = mini.width;
    const h = mini.height;
    const k = w / world.W;
    mctx.clearRect(0, 0, w, h);
    world.zones.forEach((z) => {
      mctx.fillStyle = z.color + (nav.zone === z.id ? "88" : "33");
      mctx.strokeStyle = z.color;
      mctx.lineWidth = 1;
      mctx.beginPath();
      mctx.arc(z.x * k, z.y * k, z.r * 0.5 * k * 1.6, 0, 6.2832);
      mctx.fill();
      mctx.stroke();
    });
    mctx.strokeStyle = "rgba(255,255,255,.45)";
    mctx.strokeRect(cam.x * k, cam.y * k, cam.w * k, cam.h * k);
    mctx.fillStyle = "#fff";
    mctx.beginPath();
    mctx.arc(snake.xs[0] * k, snake.ys[0] * k, 3, 0, 6.2832);
    mctx.fill();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    t += dt;
    frameCount++;
    update(dt);
    render();
  }

  function startLoop() {
    if (raf || nav.textMode || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stopLoop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  // ---------- Arranque ----------
  function begin() {
    if (started) return;
    started = true;
    suppress.home = true;
    nav.closePanel();
    history.replaceState(null, "", location.pathname + location.search);
  }

  nav.onPanelChange = (id, open) => {
    if (!open) {
      suppress[id] = true;
      if (id === "home") started = true;
    }
  };

  nav.onGo = (id) => {
    started = true;
    const z = world.byId[id];
    if (nav.textMode) return;
    input.autoMx = input.mx;
    input.autoMy = input.my;
    if (WC.calm) {
      api.teleport(z.x, z.y);
      cam.x = z.x - cam.w / 2;
      cam.y = z.y - cam.h / 2;
    } else auto = { x: z.x, y: z.y };
    if (id === "home") suppress.home = true;
  };

  nav.onMode = (on) => {
    boostBtn.hidden = !dev.touch || on;
    if (on) stopLoop();
    else startLoop();
  };

  document.addEventListener("visibilitychange", () => (document.hidden ? stopLoop() : startLoop()));

  WC.onResize(() => {
    resize();
  });

  function init() {
    nav.init();
    WC.particles.init(world, dev.quality);
    WC.interactions.init();
    resize();

    const home = world.byId.home;
    api.spawn(home.x - 130, home.y + 70, -0.3);
    cam.x = snake.xs[0] - cam.w / 2;
    cam.y = snake.ys[0] - cam.h / 2;
    WC.particles.ring(snake.xs[0], snake.ys[0], 0, 170);
    WC.particles.burst(snake.xs[0], snake.ys[0], 0, 30);

    $("#start").addEventListener("click", begin);

    const hash = location.hash.slice(1);
    if (nav.store.get("wc-text") === "1") nav.setTextMode(true);
    else if (world.byId[hash] && hash !== "home") {
      started = true;
      const z = world.byId[hash];
      api.teleport(z.x, z.y);
      cam.x = z.x - cam.w / 2;
      cam.y = z.y - cam.h / 2;
      nav.openPanel(hash, { focus: false });
    } else nav.openPanel("home", { focus: false });

    document.body.classList.remove("loading");
    startLoop();
  }

  if (!ctx) {
    nav.init();
    nav.setTextMode(true);
    document.body.classList.remove("loading");
  } else {
    init();
  }

  // Expuesto para pruebas manuales
  WC.debug = { cam, input, score: () => score };
})();
