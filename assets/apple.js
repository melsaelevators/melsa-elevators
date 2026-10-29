/* Melsa home page: Apple-style pieces (sticky local nav, highlights slideshow,
   "closer look" viewer, cards with + pop-ups, FAQ, staggered reveals). */
(function () {
  const M = window.Melsa; if (!M) return;
  const esc = M.esc, L = () => (M.lang() === "ar" ? "ar" : "en");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);

  const D = {
    en: {
      lnavName: "Melsa Elevators", lnavCta: "Get a quote", lnavLinks: [["#hl", "Highlights"], ["#closer", "Closer look"], ["#svcg", "Services"], ["#faq", "FAQ"]],
      hlTitle: "Get the highlights.",
      hl: [
        ["hero/02.jpg", "Panoramic. Polished.<br><span class='soft'>Made to be seen.</span>"],
        ["hero/06.jpg", "Home lifts that fit<br><span class='soft'>right into your villa.</span>"],
        ["projects/acrow/1.jpg", "Built for buildings<br><span class='soft'>that never stop.</span>"],
        ["hero/09.jpg", "Glass, steel and light.<br><span class='soft'>Your vision, installed.</span>"],
        ["photos/technician.jpg", "Maintained by people<br><span class='soft'>who know every bolt.</span>"],
      ],
      play: "Play", pause: "Pause",
      clTitle: "Take a closer look.",
      cl: [
        ["Machine", "Quiet, efficient traction machines sized for your load and speed, installed and aligned by our engineers.", "projects/ccc/2.jpg"],
        ["Control panel", "Modern controllers with smooth starts, precise levelling and clear fault reporting for faster service.", "projects/ccc/3.jpg"],
        ["Landing doors", "Automatic and semi-automatic doors in stainless steel, glass, wood and colour finishes.", "photos/landing-door.jpg"],
        ["Cabin", "Walls, ceiling, handrails and floor chosen from our catalog, or designed around your interior.", "hero/02.jpg"],
        ["Call panels", "Elegant LOP and COP panels with clear displays and durable buttons.", "thumbs-lg/control_panels_01.jpg", 1],
        ["Safety & service", "Every lift is tested before handover and kept safe with scheduled maintenance.", "photos/technician.jpg"],
      ],
      gTitle: "Everything your elevator needs.<br><span class='soft'>One team.</span>",
      more: "Learn more",
      g: [
        ["Installation", "New elevators, start to finish.", "hero/03.jpg", "Elevator installation", "From the first site survey to the handover, one Melsa team plans, supplies and installs your elevator.", ["Passenger, home, hospital and goods elevators", "Electric (traction) or hydraulic drives", "Testing of every safety system before use", "Handover and user training"], "quote.html", "Request a quote"],
        ["Maintenance", "Contracts that keep you running.", "projects/ccc/2.jpg", "Maintenance contracts", "Scheduled visits keep your elevator safe, smooth and reliable, for Melsa lifts and other brands.", ["Preventive visits on a fixed schedule", "Cleaning, lubrication and adjustment", "Safety checks of brakes, ropes and doors", "A direct line to our team"], "maintenance.html", "Book maintenance"],
        ["Repairs", "Fast help when it stops.", "projects/ccc/3.jpg", "Breakdown repairs", "If your elevator stops or behaves abnormally, our technicians respond quickly to find and fix the fault.", ["Fault diagnosis on site", "Original and compatible spare parts", "Repairs for all major brands"], "maintenance.html", "Report a problem"],
        ["Modernization", "New life for older lifts.", "hero/08.jpg", "Modernization", "Upgrade an existing elevator without replacing everything, after a technical assessment.", ["New machines and controllers", "New doors, cabins and call panels", "Better safety, comfort and efficiency"], "consulting.html", "Ask our engineers"],
        ["Consultation", "The right specs from day one.", "photos/landing-door.jpg", "Consultation & site survey", "We help owners, contractors and consultants choose the right elevator and shaft design.", ["Shaft, pit and headroom measurements", "Capacity, speed and drive recommendations", "Specifications ready for your tender"], "consulting.html", "Request a consultation"],
        ["Finishes", "Design every detail.", "cutouts/cabin_02.webp", "Cabins & finishes", "Choose your cabin, doors, panels and floor from more than 40 designs, many in several colours.", ["Stainless steel, gold, wood and glass", "Marble and granite floors", "Matching landing doors and panels"], "catalog.html", "Explore the catalog"],
      ],
      faqTitle: "Questions? Answers.",
      faq: [
        ["What do you need from me to prepare a quotation?", "The building type, number of floors and the shaft size if it already exists. We then arrange a site survey to measure the shaft, pit and headroom before sending a detailed quotation."],
        ["Do you maintain elevators installed by other companies?", "Yes. Our maintenance team services elevators from all major brands, with scheduled maintenance contracts or one-time repairs."],
        ["Which elevator is right for a villa or a private home?", "It depends on the space and the number of floors. Home lifts can be electric or hydraulic, and we recommend the best option after a site survey."],
        ["How long does an installation take?", "It depends on the building and the elevator type. We share a clear timeline with the quotation and keep you updated at every stage."],
        ["Can I choose the cabin design and finishes?", "Yes. You can pick the cabin, doors, call panels and floor from our catalog, or ask us for a custom design."],
        ["Do you modernize old elevators?", "Yes. After a technical assessment we can replace the machine, controller, doors or cabin without replacing the whole elevator."],
      ],
    },
    ar: {
      lnavName: "إلكتروميلسا", lnavCta: "اطلب عرض سعر", lnavLinks: [["#hl", "أبرز النقاط"], ["#closer", "نظرة أقرب"], ["#svcg", "الخدمات"], ["#faq", "الأسئلة"]],
      hlTitle: "أبرز ما نقدمه.",
      hl: [
        ["hero/02.jpg", "بانوراما. لامعة.<br><span class='soft'>مصممة لتُرى.</span>"],
        ["hero/06.jpg", "مصاعد منزلية<br><span class='soft'>تناسب فيلتك تمامًا.</span>"],
        ["projects/acrow/1.jpg", "مصممة لمبانٍ<br><span class='soft'>لا تتوقف.</span>"],
        ["hero/09.jpg", "زجاج وستانلس وإضاءة.<br><span class='soft'>رؤيتك، مُنفّذة.</span>"],
        ["photos/technician.jpg", "صيانة على يد فريق<br><span class='soft'>يعرف كل مسمار.</span>"],
      ],
      play: "تشغيل", pause: "إيقاف",
      clTitle: "نظرة أقرب.",
      cl: [
        ["الماكينة", "ماكينات جر هادئة وموفرة مناسبة لحمولتك وسرعتك، يركبها ويضبطها مهندسونا.", "projects/ccc/2.jpg"],
        ["لوحة التحكم", "لوحات تحكم حديثة بقيام ناعم ووقوف دقيق وتقارير أعطال واضحة لصيانة أسرع.", "projects/ccc/3.jpg"],
        ["الأبواب الخارجية", "أبواب أوتوماتيك ونصف أوتوماتيك من الستانلس والزجاج والخشب والألوان.", "photos/landing-door.jpg"],
        ["الكابينة", "حوائط وسقف وهاندريل وأرضية من كتالوجنا، أو تصميم يناسب ديكورك.", "hero/02.jpg"],
        ["لوحات الطلب", "لوحات LOP وCOP أنيقة بشاشات واضحة وأزرار متينة.", "thumbs-lg/control_panels_01.jpg", 1],
        ["الأمان والصيانة", "كل مصعد يُختبر قبل التسليم، ويبقى آمنًا بالصيانة الدورية.", "photos/technician.jpg"],
      ],
      gTitle: "كل ما يحتاجه مصعدك.<br><span class='soft'>فريق واحد.</span>",
      more: "اعرف أكثر",
      g: [
        ["التركيب", "مصاعد جديدة من البداية للنهاية.", "hero/03.jpg", "تركيب المصاعد", "من أول معاينة حتى التسليم، فريق واحد من ميلسا يخطط ويورد ويركب مصعدك.", ["مصاعد ركاب ومنازل ومستشفيات وبضائع", "تشغيل كهرباء (جر) أو هيدروليك", "اختبار كل أنظمة الأمان قبل التشغيل", "التسليم وتدريب المستخدمين"], "quote.html", "اطلب عرض سعر"],
        ["الصيانة", "عقود تحافظ على تشغيله.", "projects/ccc/2.jpg", "عقود الصيانة", "زيارات دورية تحافظ على مصعدك آمنًا وناعمًا وموثوقًا، لمصاعد ميلسا والماركات الأخرى.", ["زيارات وقائية بجدول ثابت", "تنظيف وتشحيم وضبط", "فحص الفرامل والحبال والأبواب", "خط مباشر مع فريقنا"], "maintenance.html", "احجز صيانة"],
        ["الإصلاح", "مساعدة سريعة عند التوقف.", "projects/ccc/3.jpg", "إصلاح الأعطال", "لو المصعد وقف أو بيشتغل بشكل غير طبيعي، فنيونا بيستجيبوا بسرعة لتحديد العطل وإصلاحه.", ["تشخيص العطل في الموقع", "قطع غيار أصلية ومتوافقة", "إصلاح لجميع الماركات الكبرى"], "maintenance.html", "بلّغ عن عطل"],
        ["التحديث", "حياة جديدة للمصاعد القديمة.", "hero/08.jpg", "تحديث المصاعد", "طوّر مصعدك الحالي من غير ما تغيّر كل حاجة، بعد تقييم فني.", ["ماكينات ولوحات تحكم جديدة", "أبواب وكبائن ولوحات طلب جديدة", "أمان وراحة وكفاءة أعلى"], "consulting.html", "اسأل مهندسينا"],
        ["الاستشارات", "المواصفات الصحيحة من أول يوم.", "photos/landing-door.jpg", "الاستشارات ومعاينة الموقع", "بنساعد الملاك والمقاولين والاستشاريين يختاروا المصعد وتصميم البئر المناسب.", ["قياس البئر والحفرة والارتفاع العلوي", "توصيات الحمولة والسرعة ونوع التشغيل", "مواصفات جاهزة للمناقصة"], "consulting.html", "اطلب استشارة"],
        ["التشطيبات", "صمم كل تفصيلة.", "cutouts/cabin_02.webp", "الكبائن والتشطيبات", "اختار الكابينة والأبواب واللوحات والأرضية من أكتر من 40 تصميم، وكتير منها بأكتر من لون.", ["ستانلس وذهبي وخشب وزجاج", "أرضيات رخام وجرانيت", "أبواب خارجية ولوحات متناسقة"], "catalog.html", "تصفح الكتالوج"],
      ],
      faqTitle: "أسئلة؟ إجابات.",
      faq: [
        ["محتاجين مني إيه عشان تجهزوا عرض السعر؟", "نوع المبنى وعدد الأدوار ومقاس البئر لو موجود. بعدها بنحدد معاينة لقياس البئر والحفرة والارتفاع العلوي قبل ما نبعت عرض سعر تفصيلي."],
        ["بتعملوا صيانة لمصاعد ركبتها شركات تانية؟", "أيوه. فريق الصيانة عندنا بيخدم مصاعد كل الماركات الكبرى، بعقود صيانة دورية أو إصلاح لمرة واحدة."],
        ["أنهي مصعد مناسب لفيلا أو بيت خاص؟", "حسب المساحة وعدد الأدوار. مصاعد المنازل ممكن تكون كهرباء أو هيدروليك، وبنرشحلك الأنسب بعد المعاينة."],
        ["التركيب بياخد قد إيه؟", "حسب المبنى ونوع المصعد. بنوضح جدول زمني واضح مع عرض السعر وبنبلغك بكل مرحلة."],
        ["أقدر أختار تصميم الكابينة والتشطيبات؟", "أكيد. تقدر تختار الكابينة والأبواب ولوحات الطلب والأرضية من الكتالوج، أو تطلب تصميم خاص."],
        ["بتحدّثوا المصاعد القديمة؟", "أيوه. بعد تقييم فني نقدر نغيّر الماكينة أو لوحة التحكم أو الأبواب أو الكابينة من غير ما نغيّر المصعد كله."],
      ],
    },
  };
  const A = (p) => "assets/" + p;
  const icon = { play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>', pause: '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>' };

  /* ---------- sticky local nav ---------- */
  const lnav = $("#lnav"), hero = $(".hero");
  function renderLnav(T) {
    if (!lnav) return;
    lnav.innerHTML = `<div class="lnav-in"><a class="lnav-name" href="#top">${esc(T.lnavName)}</a><span class="lnav-links">${T.lnavLinks.map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join("")}</span><a class="lnav-cta" href="quote.html">${esc(T.lnavCta)}</a></div>`;
  }
  if (lnav && hero) new IntersectionObserver((es) => { const on = !es[0].isIntersecting; lnav.classList.toggle("on", on); document.body.classList.toggle("lnav-on", on); }, { rootMargin: "-80px 0px 0px 0px" }).observe(hero);

  /* ---------- highlights slideshow ---------- */
  let hlIdx = 0, hlTimer = null, hlPlaying = !reduce, hlStart = 0;
  const HL_MS = 5200;
  function renderHL(T) {
    const box = $("#hl"); if (!box) return;
    box.querySelector(".ah").innerHTML = T.hlTitle;
    $("#hlTrack").innerHTML = T.hl.map(([src, cap], i) => `<figure class="hl-slide${i === hlIdx ? " on" : ""}" data-i="${i}"><img src="${A(src)}" alt="" loading="${i ? "lazy" : "eager"}"><figcaption>${cap}</figcaption></figure>`).join("");
    $("#hlDots").innerHTML = T.hl.map((_, i) => `<button type="button" aria-label="${i + 1}" class="${i === hlIdx ? "on" : ""}"><i></i></button>`).join("");
    $("#hlDots").querySelectorAll("button").forEach((b, i) => b.onclick = () => { go(i, true); });
    const pb = $("#hlPlay"); pb.innerHTML = hlPlaying ? icon.pause : icon.play; pb.setAttribute("aria-label", hlPlaying ? T.pause : T.play);
    pb.onclick = () => { hlPlaying = !hlPlaying; pb.innerHTML = hlPlaying ? icon.pause : icon.play; pb.setAttribute("aria-label", hlPlaying ? T.pause : T.play); hlPlaying ? schedule() : stop(); };
    position(false);
  }
  function position(smooth) {
    const tr = $("#hlTrack"); if (!tr) return;
    const s = tr.children[hlIdx]; if (!s) return;
    const off = s.offsetLeft - (tr.clientWidth - s.clientWidth) / 2;
    tr.scrollTo({ left: off, behavior: smooth && !reduce ? "smooth" : "auto" });
    [...tr.children].forEach((c, i) => c.classList.toggle("on", i === hlIdx));
    $("#hlDots").querySelectorAll("button").forEach((b, i) => { b.classList.toggle("on", i === hlIdx); b.classList.remove("run"); });
    if (hlPlaying) { const b = $("#hlDots").children[hlIdx]; void b.offsetWidth; b.classList.add("run"); b.style.setProperty("--ms", HL_MS + "ms"); }
  }
  function go(i, user) { const n = $("#hlTrack").children.length; hlIdx = (i + n) % n; position(true); if (hlPlaying) schedule(); }
  function stop() { clearTimeout(hlTimer); $("#hlDots").querySelectorAll("button").forEach((b) => b.classList.remove("run")); }
  function schedule() { clearTimeout(hlTimer); position(true); hlTimer = setTimeout(() => go(hlIdx + 1), HL_MS); }
  // swipe on the track
  (function () {
    const tr = $("#hlTrack"); if (!tr) return; let x0 = null;
    tr.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
    tr.addEventListener("pointerup", (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(hlIdx + ((dx < 0) !== (document.dir === "rtl") ? 1 : -1), true); });
    tr.addEventListener("click", (e) => { const f = e.target.closest(".hl-slide"); if (f && +f.dataset.i !== hlIdx) go(+f.dataset.i, true); });
    addEventListener("resize", () => position(false));
    // only run while visible
    new IntersectionObserver((es) => { if (es[0].isIntersecting) { if (hlPlaying) schedule(); } else clearTimeout(hlTimer); }, { threshold: 0.3 }).observe($("#hl"));
  })();

  /* ---------- closer look ---------- */
  let clIdx = 0;
  function renderCL(T) {
    const box = $("#closer"); if (!box) return;
    box.querySelector(".ah").innerHTML = T.clTitle;
    $("#clList").innerHTML = T.cl.map(([n, d], i) => `<button type="button" class="cl-item${i === clIdx ? " on" : ""}" aria-expanded="${i === clIdx}" data-i="${i}"><span class="cl-plus" aria-hidden="true"></span><span class="cl-t"><b>${esc(n)}</b><span class="cl-d">${esc(d)}</span></span></button>`).join("");
    $("#clMedia").innerHTML = T.cl.map(([, , src, contain], i) => `<img class="${i === clIdx ? "on" : ""}${contain ? " contain" : ""}" src="${A(src)}" alt="" loading="lazy">`).join("");
    $("#clList").querySelectorAll(".cl-item").forEach((b) => b.onclick = () => {
      clIdx = +b.dataset.i;
      $("#clList").querySelectorAll(".cl-item").forEach((x, i) => { x.classList.toggle("on", i === clIdx); x.setAttribute("aria-expanded", i === clIdx); });
      $("#clMedia").querySelectorAll("img").forEach((x, i) => x.classList.toggle("on", i === clIdx));
    });
  }

  /* ---------- service cards with + pop-up ---------- */
  function renderG(T) {
    const box = $("#svcg"); if (!box) return;
    box.querySelector(".ah").innerHTML = T.gTitle;
    $("#gTrack").innerHTML = T.g.map(([e, h, src], i) => `<article class="g-card${src.includes("cutouts") ? " light" : ""}"><img src="${A(src)}" alt="" loading="lazy"><div class="g-txt"><small>${esc(e)}</small><h3>${esc(h)}</h3></div><button type="button" class="g-plus" data-i="${i}" aria-label="${esc(T.more)}: ${esc(e)}"><span></span></button></article>`).join("");
    $("#gTrack").querySelectorAll(".g-plus").forEach((b) => b.onclick = () => openModal(T.g[+b.dataset.i], T));
  }
  const mdl = $("#mdl"); let lastFocus = null;
  function openModal(g, T) {
    const [e, , src, title, p, list, href, cta] = g;
    mdl.querySelector(".mdl-body").innerHTML = `<div class="mdl-media${src.includes("cutouts") ? " light" : ""}"><img src="${A(src)}" alt=""></div><div class="mdl-txt"><small>${esc(e)}</small><h3>${esc(title)}</h3><p>${esc(p)}</p><ul>${list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><a class="btn red" href="${href}">${esc(cta)}</a></div>`;
    lastFocus = document.activeElement; mdl.hidden = false; document.documentElement.classList.add("mdl-open");
    requestAnimationFrame(() => { mdl.classList.add("on"); mdl.querySelector(".mdl-x").focus(); });
  }
  function closeModal() { mdl.classList.remove("on"); document.documentElement.classList.remove("mdl-open"); setTimeout(() => { mdl.hidden = true; }, reduce ? 0 : 380); if (lastFocus) lastFocus.focus(); }
  if (mdl) {
    mdl.addEventListener("click", (e) => { if (e.target === mdl || e.target.closest(".mdl-x")) closeModal(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !mdl.hidden) closeModal(); });
  }
  (function () {
    const tr = $("#gTrack"); if (!tr) return;
    const step = (d) => { const c = tr.querySelector(".g-card"); const w = c ? c.getBoundingClientRect().width + 20 : 320; tr.scrollBy({ left: (document.dir === "rtl" ? -d : d) * w, behavior: "smooth" }); };
    $("#gPrev").onclick = () => step(-1); $("#gNext").onclick = () => step(1);
  })();

  /* ---------- FAQ with smooth open/close ---------- */
  function renderFAQ(T) {
    const box = $("#faq"); if (!box) return;
    box.querySelector(".ah").innerHTML = T.faqTitle;
    $("#faqList").innerHTML = T.faq.map(([q, a]) => `<div class="fq"><button type="button" class="fq-q" aria-expanded="false"><span>${esc(q)}</span><i aria-hidden="true"></i></button><div class="fq-a"><p>${esc(a)}</p></div></div>`).join("");
    $("#faqList").querySelectorAll(".fq-q").forEach((b) => b.onclick = () => {
      const open = b.getAttribute("aria-expanded") !== "true", a = b.nextElementSibling;
      b.setAttribute("aria-expanded", open); a.style.height = open ? a.scrollHeight + "px" : "0px";
    });
  }

  /* ---------- staggered reveal (fade up, one after another) ---------- */
  function reveal() {
    if (reduce || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll(".ah, .apl .sub, .hl-ctl, .cl-box, .g-card, .fq, .numgrid>div, .rail a, .finale .btns, .finale .consult").forEach((el) => {
      if (el.classList.contains("pop") || el.getBoundingClientRect().top < innerHeight * 0.85) return;
      const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.classList.add("pop"); el.style.setProperty("--d", Math.min(sib, 6) * 90 + "ms"); io.observe(el);
    });
  }

  function render() {
    const T = D[L()];
    renderLnav(T); renderHL(T); renderCL(T); renderG(T); renderFAQ(T);
  }
  render();
  if (hlPlaying) schedule();
  window.addEventListener("melsa:lang", () => { render(); reveal(); });
  document.readyState === "complete" ? reveal() : addEventListener("load", reveal);
})();
