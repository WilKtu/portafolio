/* =========================================================
   world.js — dimensiones, zonas y render del escenario
   ========================================================= */
(function () {
  const WC = (window.WC = window.WC || {});

  const W = 3200;
  const H = 2200;

  // Cada zona corresponde a una sección original del portafolio.
  const zones = [
    { id: "home", x: 520, y: 520, r: 230, color: "#22d3ee" },
    { id: "about", x: 1380, y: 400, r: 250, color: "#4f8cff" },
    { id: "skills", x: 2350, y: 540, r: 360, color: "#a855f7" },
    { id: "projects", x: 2640, y: 1400, r: 420, color: "#f472b6" },
    { id: "path", x: 1850, y: 1760, r: 320, color: "#4ade80" },
    { id: "life", x: 800, y: 1660, r: 330, color: "#fbbf24" },
    { id: "contact", x: 1500, y: 1060, r: 280, color: "#38bdf8" }
  ];
  const byId = {};
  zones.forEach((z) => (byId[z.id] = z));

  // Habilidades tal como existen en el portafolio original
  const content = {
    skillGroups: [
      { key: "sk1", techs: ["HTML5", "CSS3", "JavaScript"], color: 0 },
      { key: "sk2", techs: ["MySQL", "SQL"], color: 1 },
      { key: "sk3", techs: ["Node.js", "Python", "n8n", "Git", "GitHub"], color: 2 },
      { key: "sk4", desc: "sk4v", techs: [], color: 3 }
    ],
    glyphs: {
      HTML5: "H5",
      CSS3: "C3",
      JavaScript: "JS",
      MySQL: "My",
      SQL: "SQL",
      "Node.js": "No",
      Python: "Py",
      n8n: "n8",
      Git: "Git",
      GitHub: "GH"
    }
  };

  // Sprites de zona pre-renderizados (resplandor)
  const zoneSprites = {};
  function buildSprites() {
    zones.forEach((z) => {
      const c = document.createElement("canvas");
      const s = 256;
      c.width = c.height = s;
      const g = c.getContext("2d");
      const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grad.addColorStop(0, z.color + "30");
      grad.addColorStop(0.7, z.color + "12");
      grad.addColorStop(1, z.color + "00");
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
      zoneSprites[z.id] = c;
    });
  }

  // Estrellas con paralaje (posiciones deterministas)
  const stars = [];
  let seed = 7;
  function rnd() {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  }
  for (let i = 0; i < 90; i++) stars.push([rnd(), rnd(), 0.6 + rnd() * 1.4, 0.2 + rnd() * 0.5]);

  function zoneAt(x, y, k) {
    k = k || 0.75;
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i];
      if (Math.hypot(x - z.x, y - z.y) < z.r * k) return z;
    }
    return null;
  }

  const ORDER = ["home", "about", "skills", "projects", "path", "life", "contact"];

  function draw(ctx, cam, t, opts) {
    const anim = !opts.calm;
    const s = cam.scale;

    // Estrellas (en espacio de pantalla relativo al mundo, con paralaje)
    ctx.fillStyle = "#8fb4ff";
    for (let i = 0; i < stars.length; i++) {
      const st = stars[i];
      const sxw = (((st[0] * (cam.w + 400) - cam.x * st[3]) % (cam.w + 400)) + cam.w + 400) % (cam.w + 400);
      const syw = (((st[1] * (cam.h + 400) - cam.y * st[3]) % (cam.h + 400)) + cam.h + 400) % (cam.h + 400);
      ctx.globalAlpha = 0.25 + 0.25 * st[3];
      ctx.fillRect(cam.x + sxw - 200, cam.y + syw - 200, st[2] / s, st[2] / s);
    }
    ctx.globalAlpha = 1;

    // Cuadrícula
    const G = 90;
    const gx0 = Math.max(0, Math.floor(cam.x / G) * G);
    const gy0 = Math.max(0, Math.floor(cam.y / G) * G);
    const gx1 = Math.min(W, cam.x + cam.w + G);
    const gy1 = Math.min(H, cam.y + cam.h + G);
    ctx.lineWidth = 1.2 / s;
    ctx.strokeStyle = "rgba(110,150,255,.075)";
    ctx.beginPath();
    for (let x = gx0; x <= gx1; x += G) {
      if ((x / G) % 5) {
        ctx.moveTo(x, gy0);
        ctx.lineTo(x, gy1);
      }
    }
    for (let y = gy0; y <= gy1; y += G) {
      if ((y / G) % 5) {
        ctx.moveTo(gx0, y);
        ctx.lineTo(gx1, y);
      }
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(110,150,255,.16)";
    ctx.beginPath();
    for (let x = gx0; x <= gx1; x += G) {
      if (!((x / G) % 5)) {
        ctx.moveTo(x, gy0);
        ctx.lineTo(x, gy1);
      }
    }
    for (let y = gy0; y <= gy1; y += G) {
      if (!((y / G) % 5)) {
        ctx.moveTo(gx0, y);
        ctx.lineTo(gx1, y);
      }
    }
    ctx.stroke();

    // Borde del mundo
    ctx.strokeStyle = "rgba(244,114,182,.55)";
    ctx.lineWidth = 4 / s;
    ctx.strokeRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(244,114,182,.12)";
    ctx.lineWidth = 26 / s;
    ctx.strokeRect(-6, -6, W + 12, H + 12);

    // Ruta entre zonas
    ctx.setLineDash([10 / s, 18 / s]);
    ctx.lineDashOffset = anim ? -t * 24 : 0;
    ctx.strokeStyle = "rgba(160,190,255,.22)";
    ctx.lineWidth = 3 / s;
    ctx.beginPath();
    ORDER.forEach((id, i) => {
      const z = byId[id];
      if (i === 0) ctx.moveTo(z.x, z.y);
      else ctx.lineTo(z.x, z.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Zonas
    ctx.textAlign = "center";
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i];
      if (z.x + z.r < cam.x || z.x - z.r > cam.x + cam.w || z.y + z.r < cam.y || z.y - z.r > cam.y + cam.h) continue;
      const active = opts.zoneId === z.id;
      ctx.globalAlpha = active ? 1 : 0.8;
      ctx.drawImage(zoneSprites[z.id], z.x - z.r * 1.25, z.y - z.r * 1.25, z.r * 2.5, z.r * 2.5);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = z.color;
      ctx.lineWidth = (active ? 3.2 : 1.8) / s;
      ctx.setLineDash([16 / s, 12 / s]);
      ctx.lineDashOffset = anim ? -t * 18 * (i % 2 ? 1 : -1) : 0;
      ctx.globalAlpha = active ? 0.95 : 0.5;
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r * 0.75, 0, 6.2832);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = z.color;
      ctx.font = "700 " + Math.round(24) + "px ui-monospace, Consolas, monospace";
      ctx.fillText(WC.zoneName(z.id).toUpperCase(), z.x, z.y - z.r * 0.75 - 16);
    }
    ctx.textAlign = "start";
  }

  buildSprites();

  WC.world = { W, H, zones, byId, content, draw, zoneAt, ORDER };
})();
