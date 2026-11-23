/* =========================================================
   navigation.js — idioma, textos de interfaz, paneles, dock,
   indicador de zona y modo texto
   ========================================================= */
(function () {
  const WC = (window.WC = window.WC || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Textos de interfaz (los de contenido viven en data.js) ----------
  const UI = {
    es: {
      ui_skip: "Saltar al contenido",
      ui_zone: "Zona",
      ui_energy: "Energía",
      ui_backHome: "Volver al inicio",
      ui_langLabel: "Cambiar idioma a inglés",
      ui_classic: "Versión clásica",
      ui_start: "Comenzar exploración",
      ui_how1: "Mueve el cursor: la serpiente te sigue. Mantén el clic para acelerar.",
      ui_how2: "En el móvil, arrastra el dedo como un joystick y usa el botón ⚡.",
      ui_how3: "Teclado: flechas o WASD, Shift para acelerar, Enter para abrir lo cercano.",
      ui_how4: "¿Prefieres leer? Usa el menú, el Modo texto o la versión clásica.",
      ui_interests: "Intereses",
      ui_skillsHint: "Recoge las partículas del mundo para descubrir cada tecnología, o consúltalas aquí.",
      ui_close: "Cerrar",
      ui_boost: "Acelerar",
      ui_calmOn: "Pausar animaciones",
      ui_calmOff: "Activar animaciones",
      ui_textOn: "Modo texto",
      ui_textOff: "Modo mundo",
      ui_open: "Mundo abierto",
      ui_details: "Ver detalles",
      ui_viewCV: "Ver CV aquí",
      ui_hideCV: "Ocultar CV",
      ui_hint: "Clic, toque o Enter para abrir",
      ui_skill: "Habilidad",
      ui_project: "Proyecto",
      ui_techs: "Tecnologías",
      ui_demo: "Ver demostración",
      ui_profile: "Perfil",
      ui_goal: "Objetivo",
      ui_welcome: "Explora el mundo: recoge partículas y visita cada zona.",
      ui_mail: "Correo",
      ui_swipeHint: "Arrastra para mover",
      z_home: "Inicio",
      z_about: "Sobre mí",
      z_skills: "Habilidades",
      z_projects: "Proyectos",
      z_path: "Formación y CV",
      z_life: "Vida fuera del código",
      z_contact: "Contacto",
      zs_home: "Inicio",
      zs_about: "Sobre mí",
      zs_skills: "Skills",
      zs_projects: "Proyectos",
      zs_path: "Formación",
      zs_life: "Vida",
      zs_contact: "Contacto"
    },
    en: {
      ui_skip: "Skip to content",
      ui_zone: "Zone",
      ui_energy: "Energy",
      ui_backHome: "Back to start",
      ui_langLabel: "Cambiar idioma a español",
      ui_classic: "Classic version",
      ui_start: "Start exploring",
      ui_how1: "Move the cursor: the snake follows you. Hold click to boost.",
      ui_how2: "On mobile, drag your finger like a joystick and use the ⚡ button.",
      ui_how3: "Keyboard: arrows or WASD, Shift to boost, Enter to open what's nearby.",
      ui_how4: "Prefer reading? Use the menu, Text mode or the classic version.",
      ui_interests: "Interests",
      ui_skillsHint: "Collect the particles in the world to discover each technology, or browse them here.",
      ui_close: "Close",
      ui_boost: "Boost",
      ui_calmOn: "Pause animations",
      ui_calmOff: "Enable animations",
      ui_textOn: "Text mode",
      ui_textOff: "World mode",
      ui_open: "Open world",
      ui_details: "View details",
      ui_viewCV: "View CV here",
      ui_hideCV: "Hide CV",
      ui_hint: "Click, tap or Enter to open",
      ui_skill: "Skill",
      ui_project: "Project",
      ui_techs: "Technologies",
      ui_demo: "View demo",
      ui_profile: "Profile",
      ui_goal: "Goal",
      ui_welcome: "Explore the world: collect particles and visit each zone.",
      ui_mail: "Email",
      ui_swipeHint: "Drag to move",
      z_home: "Home",
      z_about: "About me",
      z_skills: "Skills",
      z_projects: "Projects",
      z_path: "Education & CV",
      z_life: "Life outside code",
      z_contact: "Contact",
      zs_home: "Home",
      zs_about: "About",
      zs_skills: "Skills",
      zs_projects: "Projects",
      zs_path: "Education",
      zs_life: "Life",
      zs_contact: "Contact"
    }
  };

  const store = {
    get(k) {
      try {
        return localStorage.getItem(k);
      } catch (e) {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v);
      } catch (e) {}
    }
  };

  const nav = {
    lang:
      store.get("lang") ||
      ((navigator.language || "es").slice(0, 2) === "en" ? "en" : "es"),
    panel: null,
    textMode: false,
    zone: null,
    onGo: null,
    onPanelChange: null,
    onLang: null
  };

  const t = (k) => (UI[nav.lang][k] !== undefined ? UI[nav.lang][k] : L[nav.lang][k] !== undefined ? L[nav.lang][k] : k);
  WC.t = t;
  WC.zoneName = (id) => t("z_" + id);
  WC.nav = nav;

  // ---------- i18n ----------
  function applyI18n() {
    document.documentElement.lang = nav.lang;
    $$("[data-i]").forEach((el) => (el.textContent = t(el.dataset.i)));
    $$("[data-i-label]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.iLabel)));
    $("#btn-lang").textContent = nav.lang === "es" ? "EN" : "ES";
    renderContent();
    renderDock();
    updateToggles();
    updateZoneLabel();
  }

  // ---------- Contenido dinámico (a partir de data.js) ----------
  function renderContent() {
    const d = L[nav.lang];
    const groups = WC.world.content.skillGroups;

    $("#skills-list").innerHTML = groups
      .map(
        (g) => `
      <article class="card skill-group">
        <h3>${d[g.key]}</h3>
        ${
          g.desc
            ? `<p>${d[g.desc]}</p>`
            : `<div class="chips">${g.techs
                .map((x) => `<button type="button" data-poi="skill-${x}">${x}</button>`)
                .join("")}</div>`
        }
      </article>`
      )
      .join("");

    $("#proj").innerHTML = P.map(
      (p, i) => `
      <article class="card proj-card">
        <h3>${p.n}</h3>
        <p>${p[nav.lang]}</p>
        <div class="chips">${p.t.map((x) => `<span>${x}</span>`).join("")}</div>
        <div class="row">
          <button type="button" class="btn small" data-poi="project-${i}">${t("ui_details")}</button>
          ${
            p.u
              ? `<a class="btn small" href="${p.u}" target="_blank" rel="noopener">${d.repo}</a>`
              : `<small class="muted">${d.soon}</small>`
          }
        </div>
      </article>`
    ).join("");

    $("#timeline").innerHTML = `<li>${d.e1}</li><li>${d.e2}</li>`;

    $("#interests").innerHTML = ["h1", "h2", "h3", "h4"]
      .map((k) => `<button type="button" data-go="life">${d[k]}</button>`)
      .join("");

    const media = (list, kind) =>
      list
        .map(
          ([n, s]) => `
      <article class="card">
        <div class="thumb ${kind}">
          <img src="assets/img/hobbies/${s}.jpg" alt="${n}" loading="lazy" decoding="async" onerror="this.remove()">
        </div>
        <h3>${n}</h3>
      </article>`
        )
        .join("");
    $("#books").innerHTML = media(BK, "book");
    $("#games").innerHTML = media(GM, "game");

    $("#contact-links").innerHTML = `
      <a class="btn fill" href="mailto:${EM}">${EM}</a>
      <a class="btn" href="https://github.com/WilKtu" target="_blank" rel="noopener">GitHub</a>
      <a class="btn" href="${LI}" target="_blank" rel="noopener">LinkedIn</a>`;

    const frameWrap = $("#cv-frame-wrap");
    if (frameWrap.firstChild) frameWrap.firstChild.src = `assets/cv/Wilder_Catu_CV_${nav.lang.toUpperCase()}.pdf`;
    $("#cv-toggle").textContent = frameWrap.hidden ? t("ui_viewCV") : t("ui_hideCV");

    $$("[data-i]", $("#content")).forEach((el) => (el.textContent = t(el.dataset.i)));
  }

  // ---------- Dock ----------
  function renderDock() {
    $("#dock").innerHTML = WC.world.zones
      .map(
        (z) => `
      <button type="button" data-go="${z.id}" style="--zc:${z.color}" title="${t("z_" + z.id)}"
        aria-label="${t("z_" + z.id)}">
        <span class="dot" aria-hidden="true"></span><span>${t("zs_" + z.id)}</span>
      </button>`
      )
      .join("");
    markDock();
  }

  function markDock() {
    const active = nav.panel || nav.zone;
    $$("#dock button").forEach((b) => {
      if (b.dataset.go === active) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
  }

  // ---------- Indicador de zona ----------
  function updateZoneLabel() {
    const z = nav.zone ? WC.world.byId[nav.zone] : null;
    $("#zone-name").textContent = z ? t("z_" + z.id) : t("ui_open");
    $("#zone-indicator").style.setProperty("--zc", z ? z.color : "#7a8bb8");
  }

  function setZone(id) {
    if (nav.zone === id) return;
    nav.zone = id;
    updateZoneLabel();
    markDock();
  }

  // ---------- Paneles ----------
  function panelEl(id) {
    return $("#p-" + id);
  }

  function openPanel(id, opts) {
    opts = opts || {};
    const el = panelEl(id);
    if (!el) return;
    if (!nav.textMode) {
      $$(".panel").forEach((p) => (p.hidden = p !== el));
      el.scrollTop = 0;
    }
    el.style.setProperty("--zc", WC.world.byId[id].color);
    nav.panel = id;
    document.body.classList.add("has-panel");
    markDock();
    if (opts.focus) {
      const h = $("h2", el);
      if (nav.textMode) el.scrollIntoView({ behavior: WC.device.reduced ? "auto" : "smooth", block: "start" });
      if (h) {
        h.setAttribute("tabindex", "-1");
        h.focus({ preventScroll: true });
      }
    }
    if (nav.onPanelChange) nav.onPanelChange(id, true);
  }

  function closePanel() {
    if (nav.textMode || !nav.panel) return;
    const id = nav.panel;
    const el = panelEl(id);
    if (el) el.hidden = true;
    nav.panel = null;
    document.body.classList.remove("has-panel");
    markDock();
    if (nav.onPanelChange) nav.onPanelChange(id, false);
  }

  /** Navegación iniciada por el usuario (menú, botones, hash). */
  function go(id, fromHash) {
    if (!WC.world.byId[id]) return;
    openPanel(id, { focus: true });
    if (!fromHash) history.replaceState(null, "", "#" + id);
    if (nav.onGo) nav.onGo(id);
  }

  // ---------- Modos ----------
  function setTextMode(on) {
    nav.textMode = on;
    store.set("wc-text", on ? "1" : "0");
    document.body.classList.toggle("text-mode", on);
    if (on) {
      $$(".panel").forEach((p) => {
        p.hidden = false;
        p.style.setProperty("--zc", WC.world.byId[p.dataset.zone].color);
      });
      document.body.classList.remove("has-panel");
      nav.panel = null;
    } else {
      $$(".panel").forEach((p) => (p.hidden = true));
      nav.panel = null;
    }
    updateToggles();
    markDock();
    if (nav.onMode) nav.onMode(on);
  }

  function setCalm(on) {
    WC.calm = on;
    WC.fxOff = on;
    store.set("wc-calm", on ? "1" : "0");
    document.body.classList.toggle("calm", on);
    updateToggles();
  }

  function updateToggles() {
    const calm = $("#btn-calm");
    calm.textContent = WC.calm ? t("ui_calmOff") : t("ui_calmOn");
    calm.setAttribute("aria-pressed", String(!!WC.calm));
    const tx = $("#btn-text");
    tx.textContent = nav.textMode ? t("ui_textOff") : t("ui_textOn");
    tx.setAttribute("aria-pressed", String(nav.textMode));
  }

  // ---------- Inicialización ----------
  function init() {
    // botones de cierre en cada panel
    $$(".panel").forEach((p) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "panel-close";
      b.textContent = "×";
      b.setAttribute("data-close-panel", "");
      p.prepend(b);
    });
    $$("[data-close-panel]").forEach((b) => b.setAttribute("aria-label", t("ui_close")));

    document.addEventListener("click", (e) => {
      const g = e.target.closest("[data-go]");
      if (g) {
        e.preventDefault();
        go(g.dataset.go);
        return;
      }
      if (e.target.closest("[data-close-panel]")) {
        closePanel();
        return;
      }
      const p = e.target.closest("[data-poi]");
      if (p && WC.interactions) WC.interactions.openById(p.dataset.poi, p);
    });

    $("#btn-lang").addEventListener("click", () => {
      nav.lang = nav.lang === "es" ? "en" : "es";
      store.set("lang", nav.lang);
      applyI18n();
      $$("[data-close-panel]").forEach((b) => b.setAttribute("aria-label", t("ui_close")));
      if (nav.onLang) nav.onLang();
    });
    $("#btn-calm").addEventListener("click", () => setCalm(!WC.calm));
    $("#btn-text").addEventListener("click", () => setTextMode(!nav.textMode));
    $("#btn-home").addEventListener("click", () => {
      if (nav.textMode) {
        scrollTo({ top: 0 });
        return;
      }
      go("home");
    });

    $("#cv-toggle").addEventListener("click", () => {
      const wrap = $("#cv-frame-wrap");
      if (wrap.hidden) {
        if (!wrap.firstChild) {
          const f = document.createElement("iframe");
          f.title = "CV";
          f.loading = "lazy";
          f.src = `assets/cv/Wilder_Catu_CV_${nav.lang.toUpperCase()}.pdf`;
          wrap.appendChild(f);
        }
        wrap.hidden = false;
      } else wrap.hidden = true;
      $("#cv-toggle").setAttribute("aria-expanded", String(!wrap.hidden));
      $("#cv-toggle").textContent = wrap.hidden ? t("ui_viewCV") : t("ui_hideCV");
    });

    addEventListener("hashchange", () => {
      const id = location.hash.slice(1);
      if (WC.world.byId[id]) go(id, true);
    });

    WC.calm = store.get("wc-calm") === null ? WC.device.reduced : store.get("wc-calm") === "1";
    setCalm(WC.calm);
    applyI18n();
  }

  nav.init = init;
  nav.go = go;
  nav.openPanel = openPanel;
  nav.closePanel = closePanel;
  nav.setZone = setZone;
  nav.setTextMode = setTextMode;
  nav.store = store;
})();
