/* Melsa — site-wide motion: smooth scrolling (Lenis) and image curtain reveals.
   Uses only transform / opacity / clip-path so it stays light on phones. */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  /* ---------- 1. smooth scrolling ---------- */
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js";
  s.onload = () => {
    if (!window.Lenis) return;
    const lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
    window.melsaLenis = lenis;
    // pause while a pop-up or lightbox is open
    const locked = () => document.documentElement.classList.contains("mdl-open") || document.body.style.overflow === "hidden" || document.querySelector(".lb");
    let paused = false;
    function raf(t) {
      const l = !!locked();
      if (l !== paused) { paused = l; l ? lenis.stop() : lenis.start(); }
      lenis.raf(t); requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    // in-page links (#faq, #hl …) glide instead of jumping
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
      const id = a.getAttribute("href"); if (id.length < 2) return;
      const el = document.querySelector(id); if (!el) return;
      e.preventDefault(); lenis.scrollTo(el, { offset: -70, duration: 1.2 });
    });
  };
  document.head.appendChild(s);
  // inner scroll areas keep their own scrolling
  const prevent = () => document.querySelectorAll(".nav,.mdl,.pm,.lb,.dd-m").forEach((el) => el.setAttribute("data-lenis-prevent", ""));

  /* ---------- 2. image curtain reveal ---------- */
  const SEL = ".chap-media.one img, .ph3 img, .pv img, .pg-i img, .rail img, .tech img, .mini .photo img, .g-card img, .pm-grid img";
  let io;
  function reveal() {
    prevent();
    io = io || new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const img = e.target, go = () => requestAnimationFrame(() => img.classList.add("rv-in"));
      img.complete ? go() : img.addEventListener("load", go, { once: true });
      setTimeout(go, 1500);                          // never leave an image hidden
      io.unobserve(img);
    }), { rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(SEL).forEach((img) => {
      if (img.classList.contains("rv") || img.classList.contains("rv-skip")) return;
      img.decoding = "async";
      if (img.getBoundingClientRect().top < innerHeight * 0.92 && !img.closest(".hs")) { img.classList.add("rv-skip"); return; } // already on screen
      img.classList.add("rv"); io.observe(img);
    });
  }
  let q = 0;
  const start = () => { reveal(); new MutationObserver(() => { if (q) return; q = requestAnimationFrame(() => { q = 0; reveal(); }); }).observe(document.body, { childList: true, subtree: true }); };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start();
})();
