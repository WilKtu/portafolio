/* =========================================================
   interactions.js — puntos de interés, detección, tarjetas
   rápidas (toast) y ventanas informativas (modal)
   ========================================================= */
(function () {
  const WC = (window.WC = window.WC || {});
  const $ = (s, r = document) => r.querySelector(s);

  let pois = [];
  let near = null;
  let toastTimer = 0;
  let lastFocus = null;
  const seenKeys = new Set();

  const dict = () => L[WC.nav.lang];
  const col = (i) => WC.particles.COLORS[i % WC.particles.COLORS.length];
  const hex = (id) => WC.world.byId[id].color;

  function initials(name) {
    const w = name.replace(/[—()-]/g, " ").split(/\s+/).filter((x) => /^[A-ZÁÉÍÓÚ]/.test(x));
    return (w[0] ? w[0][0] : name[0]) + (w[1] ? w[1][0] : "");
  }

  const afterDash = (s) => (s.includes(" — ") ? s.split(" — ").slice(1).join(" — ") : s);
  const beforeDash = (s) => s.split(" — ")[0];

  // ---------- Construcción de puntos de interés ----------
  function ring(zoneId, n, radius, start) {
    const z = WC.world.byId[zoneId];
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (start || -Math.PI / 2) + (i / n) * Math.PI * 2;
      const rr = radius * (1 + (i % 2 ? 0.14 : -0.1));
      out.push([z.x + Math.cos(a) * rr, z.y + Math.sin(a) * rr]);
    }
    return out;
  }

  function build() {
    pois = [];
    const add = (o) => {
      o.ph = Math.random() * 6.28;
      pois.push(o);
    };

    // Habilidades (partículas coleccionables grandes)
    const items = [];
    WC.world.content.skillGroups.forEach((g) => {
      if (g.techs.length) g.techs.forEach((x) => items.push({ id: x, g, glyph: WC.world.content.glyphs[x] || x.slice(0, 2) }));
      else items.push({ id: "sk4", g, glyph: "HW" });
    });
    ring("skills", items.length, 245, -Math.PI / 2).forEach((p, i) => {
      const it = items[i];
      add({
        id: "skill-" + it.id,
        zone: "skills",
        kind: "skill",
        x: p[0],
        y: p[1],
        r: 24,
        color: col(it.g.color),
        glyph: it.glyph,
        item: it,
        label: () => (it.id === "sk4" ? dict().sk4 : it.id)
      });
    });

    // Proyectos
    ring("projects", P.length, 285, -Math.PI / 2).forEach((p, i) => {
      add({
        id: "project-" + i,
        zone: "projects",
        kind: "project",
        x: p[0],
        y: p[1],
        r: 28,
        color: hex("projects"),
        glyph: initials(P[i].n),
        project: P[i],
        label: () => P[i].n
      });
    });

    // Sobre mí
    const about = [
      ["profile", "ID", () => WC.t("ui_profile"), () => dict().a1],
      ["goal", "★", () => WC.t("ui_goal"), () => dict().a2],
      ["lang", "Aa", () => dict().langT, () => dict().langv],
      ["soft", "+", () => dict().soft, () => dict().softv]
    ];
    ring("about", about.length, 150, Math.PI / 4).forEach((p, i) => {
      const a = about[i];
      add({ id: "about-" + a[0], zone: "about", kind: "info", x: p[0], y: p[1], r: 24, color: hex("about"), glyph: a[1], label: a[2], text: a[3] });
    });

    // Formación y CV
    const path = [
      ["e1", "26"],
      ["e2", "21"],
      ["cv", "CV"]
    ];
    ring("path", path.length, 180, -Math.PI / 2).forEach((p, i) => {
      const a = path[i];
      add({
        id: "path-" + a[0],
        zone: "path",
        kind: "path",
        x: p[0],
        y: p[1],
        r: 25,
        color: hex("path"),
        glyph: a[1],
        key: a[0],
        label: () => (a[0] === "cv" ? dict().cvT : afterDash(dict()[a[0]]))
      });
    });

    // Vida fuera del código
    const life = [
      ["h1", "⚽"],
      ["h2", "📚"],
      ["h3", "🎌"],
      ["h4", "🎮"]
    ];
    ring("life", life.length, 190, Math.PI / 4).forEach((p, i) => {
      const a = life[i];
      add({ id: "life-" + a[0], zone: "life", kind: "life", x: p[0], y: p[1], r: 26, color: hex("life"), glyph: a[1], key: a[0], label: () => dict()[a[0]] });
    });

    // Contacto
    const contact = [
      ["mail", "@", () => EM],
      ["github", "GH", () => "GitHub"],
      ["linkedin", "in", () => "LinkedIn"]
    ];
    ring("contact", contact.length, 150, -Math.PI / 2).forEach((p, i) => {
      const a = contact[i];
      add({ id: "contact-" + a[0], zone: "contact", kind: "contact", x: p[0], y: p[1], r: 26, color: hex("contact"), glyph: a[1], key: a[0], label: a[2] });
    });
  }

  // ---------- Toast ----------
  function toast(o) {
    const el = $("#toast");
    el.style.setProperty("--tc", o.color);
    el.innerHTML = `<p class="kicker">${o.kicker}</p><h3>${o.title}</h3>${o.text ? `<p>${o.text}</p>` : ""}`;
    el.hidden = false;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), 3800);
  }

  function toastFor(p) {
    const d = dict();
    if (p.kind === "skill") {
      toast({
        kicker: `${WC.t("ui_skill")} · ${d[p.item.g.key]}`,
        title: p.label(),
        text: p.item.id === "sk4" ? d.sk4v : WC.t("ui_hint"),
        color: p.color
      });
    } else {
      toast({ kicker: WC.zoneName(p.zone), title: p.label(), text: WC.t("ui_hint"), color: p.color });
    }
  }

  // ---------- Modal ----------
  function modalContent(p) {
    const d = dict();
    const c = p.color;
    const hero = (inner) => `<div class="modal-hero" style="--mc:${c}" aria-hidden="true">${inner}</div>`;
    const wrap = (kicker, title, body) =>
      `<div class="modal-content" style="--mc:${c}"><p class="kicker">${kicker}</p><h2 id="modal-title">${title}</h2>${body}</div>`;
    const media = (list, kind) =>
      `<div class="grid media">${list
        .map(
          ([n, s]) =>
            `<article class="card"><div class="thumb ${kind}"><img src="assets/img/hobbies/${s}.jpg" alt="${n}" loading="lazy" decoding="async" onerror="this.remove()"></div><h3>${n}</h3></article>`
        )
        .join("")}</div>`;

    switch (p.kind) {
      case "skill": {
        const g = p.item.g;
        const body = g.techs.length
          ? `<p>${d[g.key]}</p><div class="chips">${g.techs.map((x) => `<span>${x}</span>`).join("")}</div>`
          : `<p>${d[g.desc]}</p>`;
        return { c, html: hero(p.glyph) + wrap(`${WC.t("ui_skill")} · ${d[g.key]}`, p.label(), body) };
      }
      case "project": {
        const pr = p.project;
        const links = [
          pr.u ? `<a class="btn fill" href="${pr.u}" target="_blank" rel="noopener">${d.repo}</a>` : `<small class="muted">${d.soon}</small>`,
          pr.d ? `<a class="btn" href="${pr.d}" target="_blank" rel="noopener">${WC.t("ui_demo")}</a>` : ""
        ].join("");
        const body = `<p>${pr[WC.nav.lang]}</p><p class="kicker">${WC.t("ui_techs")}</p><div class="chips">${pr.t.map((x) => `<span>${x}</span>`).join("")}</div><div class="row">${links}</div>`;
        return { c, html: hero(p.glyph) + wrap(WC.t("ui_project"), pr.n, body) };
      }
      case "info":
        return { c, html: hero(p.glyph) + wrap(WC.zoneName("about"), p.label(), `<p>${p.text()}</p>`) };
      case "path": {
        if (p.key === "cv") {
          const body = `<p>${d.cvP}</p><div class="row"><a class="btn fill" href="assets/cv/Wilder_Catu_CV_ES.pdf" download>${d.dl}</a><a class="btn fill" href="assets/cv/Wilder_Catu_CV_EN.pdf" download>${d.dl2}</a><button type="button" class="btn" data-go="path">${WC.t("ui_viewCV")}</button></div>`;
          return { c, html: hero("CV") + wrap(WC.zoneName("path"), d.cvT, body) };
        }
        const line = d[p.key];
        return { c, html: hero(p.glyph) + wrap(afterDash(line), beforeDash(line), `<p>${line}</p>`) };
      }
      case "life": {
        const extra = p.key === "h2" ? media(BK, "book") : p.key === "h4" ? media(GM, "game") : "";
        return { c, html: hero(p.glyph) + wrap(d.lifeT, d[p.key], `<p>${d[p.key + "p"]}</p>${extra}`) };
      }
      case "contact": {
        const map = {
          mail: [`mailto:${EM}`, EM, WC.t("ui_mail"), ""],
          github: ["https://github.com/WilKtu", "GitHub", "GitHub", ' target="_blank" rel="noopener"'],
          linkedin: [LI, "LinkedIn", "LinkedIn", ' target="_blank" rel="noopener"']
        };
        const m = map[p.key];
        return {
          c,
          html: hero(p.glyph) + wrap(d.ctT, m[2], `<p>${d.ctP}</p><div class="row"><a class="btn fill" href="${m[0]}"${m[3]}>${m[1]}</a></div>`)
        };
      }
    }
    return { c, html: "" };
  }

  function openModal(p) {
    const m = modalContent(p);
    const modal = $("#modal");
    const box = $(".modal-box", modal);
    $("#modal-body").innerHTML = m.html;
    box.style.setProperty("--mc", m.c);
    lastFocus = document.activeElement;
    modal.hidden = false;
    box.scrollTop = 0;
    box.focus({ preventScroll: true });
    $("#toast").hidden = true;
    if (!p.seen) markSeen(p, true);
    WC.modalOpen = true;
  }

  function closeModal() {
    const modal = $("#modal");
    if (modal.hidden) return;
    modal.hidden = true;
    WC.modalOpen = false;
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    else $("#content").focus({ preventScroll: true });
  }

  function trapTab(e) {
    const modal = $("#modal");
    if (modal.hidden || e.key !== "Tab") return;
    const f = [...modal.querySelectorAll("a[href],button:not([disabled]),[tabindex='0']")].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === $(".modal-box"))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ---------- Descubrimiento ----------
  function markSeen(p, silent) {
    p.seen = true;
    seenKeys.add(p.id);
    if (WC.addScore) WC.addScore(p.kind === "skill" ? 10 : 5);
    WC.snakeApi.grow(p.kind === "skill" ? 2 : 1);
    WC.particles.burst(p.x, p.y, 0, 18);
    WC.particles.ring(p.x, p.y, WC.particles.COLORS.indexOf(p.color) < 0 ? 0 : WC.particles.COLORS.indexOf(p.color), 120);
    void silent;
  }

  function update(dt, head, headR) {
    let best = null;
    let bd = 1e9;
    for (let i = 0; i < pois.length; i++) {
      const p = pois[i];
      const dx = head.x - p.x;
      const dy = head.y - p.y;
      if (dx > 200 || dx < -200 || dy > 200 || dy < -200) continue;
      const d = Math.hypot(dx, dy);
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    const nearNow = best && bd < best.r + headR + 46 ? best : null;
    if (nearNow !== near) near = nearNow;

    if (best && bd < best.r + headR) {
      const now = performance.now();
      if (!best.seen) markSeen(best);
      if (!best.lastToast || now - best.lastToast > 7000) {
        best.lastToast = now;
        if (!WC.modalOpen) toastFor(best);
      }
    }
  }

  // ---------- Dibujo ----------
  function draw(ctx, cam, t, calm) {
    const x0 = cam.x - 90;
    const y0 = cam.y - 90;
    const x1 = cam.x + cam.w + 90;
    const y1 = cam.y + cam.h + 90;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < pois.length; i++) {
      const p = pois[i];
      if (p.x < x0 || p.x > x1 || p.y < y0 || p.y > y1) continue;
      const bob = calm ? 0 : Math.sin(t * 1.6 + p.ph) * 3.5;
      const y = p.y + bob;
      const isNear = near === p;
      const r = p.r * (isNear ? 1.12 : 1);

      // resplandor
      const gs = r * (isNear ? 6 : 4.6);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = p.seen ? 0.35 : 0.7;
      const si = Math.max(0, WC.particles.COLORS.indexOf(p.color));
      ctx.drawImage(WC.particles.sprites[si], p.x - gs / 2, y - gs / 2, gs, gs);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      ctx.fillStyle = "#0a0f24";
      ctx.strokeStyle = p.color;
      ctx.lineWidth = isNear ? 3.5 : 2.5;
      ctx.beginPath();
      if (p.kind === "project") {
        const a = calm ? 0.785 : 0.785 + Math.sin(t * 0.8 + p.ph) * 0.12;
        for (let k = 0; k < 4; k++) {
          const ang = a + (k * Math.PI) / 2;
          const px = p.x + Math.cos(ang) * r * 1.3;
          const py = y + Math.sin(ang) * r * 1.3;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else if (p.kind === "path") {
        ctx.arc(p.x, y, r, 0, 6.2832);
      } else if (p.kind === "contact") {
        ctx.arc(p.x, y, r, 0, 6.2832);
      } else {
        ctx.arc(p.x, y, r, 0, 6.2832);
      }
      ctx.fill();
      ctx.stroke();
      if (p.kind === "path" || p.kind === "contact" || p.kind === "info") {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(p.x, y, r + 6, 0, 6.2832);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // glifo
      ctx.fillStyle = "#fff";
      const emoji = p.glyph.length > 1 && p.glyph.charCodeAt(0) > 255;
      ctx.font = (emoji ? "20px " : "700 " + (p.glyph.length > 2 ? 12 : 15) + "px ui-monospace, Consolas, monospace");
      if (emoji) ctx.font = "20px system-ui, 'Segoe UI Emoji', sans-serif";
      ctx.fillText(p.glyph, p.x, y + 1);

      // etiqueta
      ctx.font = "600 13px system-ui, 'Segoe UI', sans-serif";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(5,7,18,.92)";
      const lab = p.label();
      const ly = y + r * (p.kind === "project" ? 1.3 : 1) + 18;
      ctx.strokeText(lab, p.x, ly, 210);
      ctx.fillStyle = p.seen ? "#cfd9ff" : "#fff";
      ctx.fillText(lab, p.x, ly, 210);
      if (isNear) {
        ctx.fillStyle = p.color;
        ctx.font = "11px ui-monospace, Consolas, monospace";
        ctx.fillText("▸ " + WC.t("ui_hint"), p.x, ly + 16, 230);
      }
    }
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  }

  // ---------- API pública ----------
  function hit(wx, wy, slack) {
    for (let i = 0; i < pois.length; i++) {
      const p = pois[i];
      if (Math.hypot(wx - p.x, wy - p.y) < p.r * 1.4 + slack) return p;
    }
    return null;
  }

  function tap(wx, wy, slack) {
    const p = hit(wx, wy, slack || 10);
    if (p) openModal(p);
    return !!p;
  }

  function openNear() {
    if (near) {
      openModal(near);
      return true;
    }
    return false;
  }

  function openById(id) {
    const p = pois.find((x) => x.id === id);
    if (p) openModal(p);
  }

  function init() {
    build();
    $("#modal").addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeModal();
      else if (e.target.closest("[data-go]")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!$("#modal").hidden) closeModal();
        else if (WC.nav.panel) WC.nav.closePanel();
      }
      trapTab(e);
    });
  }

  WC.interactions = { init, update, draw, tap, openNear, openById, closeModal, count: () => pois.length, seen: () => seenKeys.size };
})();
