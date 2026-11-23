/* =========================================================
   responsive.js — detección de dispositivo, calidad y resize
   ========================================================= */
(function () {
  const WC = (window.WC = window.WC || {});

  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mqCoarse = window.matchMedia("(pointer: coarse)");

  function pickQuality() {
    const mem = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const small = Math.min(innerWidth, innerHeight) < 600;
    if (mem <= 2 || cores <= 2) return 0; // gama baja
    if (mem <= 4 || cores <= 4 || small) return 1; // gama media
    return 2; // gama alta
  }

  const device = {
    w: innerWidth,
    h: innerHeight,
    dpr: 1,
    scale: 1,
    touch: false,
    mobile: false,
    quality: pickQuality(),
    reduced: mqReduce.matches
  };

  function measure() {
    device.w = innerWidth;
    device.h = innerHeight;
    device.touch = mqCoarse.matches || (navigator.maxTouchPoints > 0 && innerWidth < 1100);
    device.mobile = innerWidth <= 700;
    // Limita la resolución interna según el dispositivo
    const cap = device.quality === 0 ? 1 : device.mobile ? 1.5 : 2;
    device.dpr = Math.min(window.devicePixelRatio || 1, cap);
    // Zoom del mundo: pantallas pequeñas ven más área
    device.scale = Math.max(0.62, Math.min(1.15, Math.min(device.w, device.h * 1.4) / 1000));
    document.documentElement.classList.toggle("is-touch", device.touch);
    document.documentElement.classList.toggle("is-mobile", device.mobile);
  }

  const listeners = [];
  let timer = 0;

  function onResize(fn) {
    listeners.push(fn);
  }

  function fire() {
    measure();
    listeners.forEach((fn) => fn(device));
  }

  addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(fire, 120);
  });
  addEventListener("orientationchange", () => setTimeout(fire, 250));

  mqReduce.addEventListener
    ? mqReduce.addEventListener("change", (e) => {
        device.reduced = e.matches;
        listeners.forEach((fn) => fn(device));
      })
    : null;

  measure();
  WC.device = device;
  WC.onResize = onResize;
})();
