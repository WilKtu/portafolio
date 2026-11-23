const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const get = (k) => {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return null;
  }
};

const set = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch (e) {}
};

let lang =
  get("lang") || ((navigator.language || "es").slice(0, 2) === "en" ? "en" : "es");
let theme = get("theme") || "dark";

const pages = [
  ["index", "home"],
  ["sobre-mi", "about"],
  ["proyectos", "projects"],
  ["cv", "cv"],
  ["vida-fuera-del-codigo", "life"],
  ["contacto", "contact"]
];

const cur =
  (location.pathname.split("/").pop() || "index.html").replace(".html", "") || "index";

$("#h").innerHTML = `
  <a class="logo" href="index.html">&gt; wilder_catu</a>
  <nav>
    ${pages
      .map(
        ([p, k]) =>
          `<a href="${p}.html" data-i="${k}" class="${p === cur ? "on" : ""}"></a>`
      )
      .join("")}
  </nav>
  <div class="ctl">
    <button id="lg" aria-label="Language"></button>
    <button id="th" aria-label="Theme"></button>
  </div>
`;

$("#f").innerHTML = `
  <p>
    <a href="${G}" target="_blank" rel="noopener">GitHub</a> ·
    <a href="${LI}" target="_blank" rel="noopener">LinkedIn</a> ·
    <a href="mailto:${EM}">${EM}</a>
  </p>
  <p>© ${new Date().getFullYear()} Wilder Catú · <span data-i="foot"></span></p>
`;

const card = (n, s, kind) => `
  <div class="card hobby-card">
    <div class="hobby-image ${kind}-image">
      <img
        src="assets/img/hobbies/${s}.jpg"
        alt="${n}"
        loading="lazy"
        decoding="async"
        onerror="this.remove()"
      >
    </div>
    <h3>${n}</h3>
  </div>
`;

function render() {
  const d = L[lang];
  document.documentElement.lang = lang;
  document.documentElement.dataset.theme = theme;

  $$("[data-i]").forEach((e) => {
    e.textContent = d[e.dataset.i];
  });

  $("#lg").textContent = lang === "es" ? "EN" : "ES";
  $("#th").textContent = theme === "dark" ? "☀" : "☾";

  const pr = $("#proj");
  if (pr) {
    pr.innerHTML = P.map(
      (p) => `
        <div class="card">
          <h3>${p.n}</h3>
          <p>${p[lang]}</p>
          <div class="chips">
            ${p.t.map((t) => `<span>${t}</span>`).join("")}
          </div>
          ${
            p.u
              ? `<a class="btn" href="${p.u}" target="_blank" rel="noopener">${d.repo}</a>`
              : `<small>${d.soon}</small>`
          }
        </div>
      `
    ).join("");
  }

  const g = $("#games");
  if (g) {
    g.innerHTML = GM.map(([n, s]) => card(n, s, "game")).join("");
  }

  const b = $("#books");
  if (b) {
    b.innerHTML = BK.map(([n, s]) => card(n, s, "book")).join("");
  }

  const v = $("#cvf");
  if (v) {
    v.src = `assets/cv/Wilder_Catu_CV_${lang.toUpperCase()}.pdf`;
  }

  mx();
}

$("#lg").onclick = () => {
  lang = lang === "es" ? "en" : "es";
  set("lang", lang);
  render();
};

$("#th").onclick = () => {
  theme = theme === "dark" ? "light" : "dark";
  set("theme", theme);
  render();
};

const cv = document.createElement("canvas");
cv.id = "mx";
document.body.prepend(cv);

let raf;

function mx() {
  cancelAnimationFrame(raf);
  const c = cv.getContext("2d");
  cv.width = innerWidth;
  cv.height = innerHeight;
  c.clearRect(0, 0, cv.width, cv.height);

  if (theme !== "dark" || matchMedia("(prefers-reduced-motion:reduce)").matches) {
    cv.style.display = "none";
    return;
  }

  cv.style.display = "block";
  const s = 16;
  const cols = Math.ceil(cv.width / s);
  const y = Array(cols).fill(0).map(() => Math.random() * -50);
  const ch = "01アイウエオカキクケコ";
  let t = 0;

  (function f() {
    raf = requestAnimationFrame(f);
    if (++t % 3) return;

    c.fillStyle = "rgba(1,10,4,.12)";
    c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = "#00ff6a";
    c.font = s + "px monospace";

    y.forEach((v, i) => {
      c.fillText(ch[Math.random() * ch.length | 0], i * s, v * s);
      y[i] = v * s > cv.height && Math.random() > 0.975 ? 0 : v + 1;
    });
  })();
}

addEventListener("resize", mx);
render();
