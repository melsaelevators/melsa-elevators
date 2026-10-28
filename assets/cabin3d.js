// Melsa Elevators: real 3D cabin for the home page "Your cabin. Your finishes." chapter.
// A slowly turning open-front cabin with switchable finishes (like Apple's colour picker).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const host = document.getElementById("cab3d");
if (host) init().catch((e) => console.warn("cabin3d", e));

async function init() {
  const AR = () => document.documentElement.lang === "ar";
  const W = 1.4, D = 1.5, H = 2.3, T = 0.04; // cabin size in metres

  /* ---------- renderer / scene ---------- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "cab3d-canvas";
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.5;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  const target = new THREE.Vector3(0, 1.12, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xe9e4d8, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 6, 4); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6;
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 15 });
  scene.add(key);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(3, 48), new THREE.ShadowMaterial({ opacity: 0.18 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  /* ---------- textures ---------- */
  const canvasTex = (w, h, draw, rep = [1, 1]) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t;
  };
  const brushed = (base) => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const y = Math.random() * h, a = Math.random() * 0.045;
      g.fillStyle = Math.random() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 0.8})`;
      g.fillRect(0, y, w, 0.6 + Math.random());
    }
  });
  const wood = canvasTex(512, 1024, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, 0);
    grd.addColorStop(0, "#5a3620"); grd.addColorStop(0.5, "#6e4428"); grd.addColorStop(1, "#553219");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      let x = Math.random() * w; g.strokeStyle = `rgba(${30 + Math.random() * 30},${15 + Math.random() * 15},5,${0.15 + Math.random() * 0.25})`;
      g.lineWidth = 0.6 + Math.random() * 2.4; g.beginPath(); g.moveTo(x, 0);
      for (let y = 0; y <= h; y += 32) { x += (Math.random() - 0.5) * 6; g.lineTo(x + Math.sin(y / 90 + i) * 4, y); }
      g.stroke();
    }
  });
  const loader = new THREE.TextureLoader();
  const photo = (src, rep = 1) => {
    const t = loader.load(src); t.colorSpace = THREE.SRGBColorSpace;
    // catalog thumbnails have a white margin, so only sample the middle of the photo
    t.repeat.set(0.56 * rep, 0.56 * rep); t.offset.set(0.22, 0.22); t.anisotropy = 8; return t;
  };

  /* ---------- materials ---------- */
  const M = {
    steel: new THREE.MeshStandardMaterial({ color: 0xe6e9ec, metalness: 0.85, roughness: 0.28, map: brushed("#d4d7da") }),
    gold: new THREE.MeshStandardMaterial({ color: 0xe0bf78, metalness: 1, roughness: 0.22 }),
    champagne: new THREE.MeshStandardMaterial({ color: 0xe2cda6, metalness: 0.85, roughness: 0.28, map: brushed("#d8c29e") }),
    black: new THREE.MeshPhysicalMaterial({ color: 0x0c0e11, metalness: 0.3, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
    wood: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.5, metalness: 0 }),
    mirror: new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.03 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xeaf2f2, metalness: 0, roughness: 0.04, transmission: 0.92, thickness: 0.02, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
    shell: new THREE.MeshStandardMaterial({ color: 0xd3d7db, metalness: 0.6, roughness: 0.32 }),
    light: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4e2, emissiveIntensity: 1.6 }),
    led: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff1d6, emissiveIntensity: 2.2 }),
    btn: new THREE.MeshStandardMaterial({ color: 0xcfd3d7, metalness: 1, roughness: 0.25, emissive: 0x6b4c1e, emissiveIntensity: 0.25 }),
    display: new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xc5ad87, emissiveIntensity: 0.9 }),
  };
  const floors = {
    granite: photo("assets/thumbs-lg/flooring_samples_05.jpg"),
    blackMarble: photo("assets/thumbs-lg/flooring_samples_10.jpg"),
    whiteMarble: photo("assets/thumbs-lg/flooring_samples_02.jpg"),
    darkGranite: photo("assets/thumbs-lg/flooring_samples_08.jpg"),
  };
  const floorMat = new THREE.MeshPhysicalMaterial({ map: floors.granite, roughness: 0.32, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.25 });

  /* ---------- cabin model ---------- */
  const turntable = new THREE.Group(); scene.add(turntable);
  const cabin = new THREE.Group(); turntable.add(cabin);
  const box = (w, h, d, mat, x, y, z, parent = cabin) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const panels = [], trims = [];
  const addPanel = (m) => { panels.push(m); return m; };
  const addTrim = (m) => { trims.push(m); return m; };

  // floor, ceiling and outer shell
  box(W + 0.06, 0.06, D + 0.04, M.shell, 0, 0.03, 0);
  const floor = box(W - 0.02, 0.012, D - 0.04, floorMat, 0, 0.066, 0);
  floor.material = floorMat;
  box(W + 0.06, 0.09, D + 0.04, M.shell, 0, H + 0.045, 0);
  const ceil = addTrim(box(W - 0.02, 0.02, D - 0.04, M.gold, 0, H - 0.01, 0));
  box(W * 0.62, 0.012, D * 0.62, M.light, 0, H - 0.026, -0.02);
  for (const [x, z] of [[-0.46, -0.52], [0.46, -0.52], [-0.46, 0.45], [0.46, 0.45]]) {
    const s = new THREE.Mesh(new THREE.CircleGeometry(0.035, 20), M.led);
    s.rotation.x = Math.PI / 2; s.position.set(x, H - 0.022, z); cabin.add(s);
  }
  const inner = new THREE.PointLight(0xfff0d8, 3.2, 4.5, 1.4); inner.position.set(0, H - 0.3, -0.1); cabin.add(inner);

  // walls made of 3 panels each, with thin trims between them
  const wallY = 0.07, wallH = H - 0.1, ph = wallH;
  function wall(axis, len, fixed, inward) {
    const n = 3, gap = 0.018, pw = (len - gap * (n + 1)) / n;
    for (let i = 0; i < n; i++) {
      const c = -len / 2 + gap + pw / 2 + i * (pw + gap);
      if (axis === "x") addPanel(box(pw, ph, T, M.steel, c, wallY + ph / 2, fixed));
      else addPanel(box(T, ph, pw, M.steel, fixed, wallY + ph / 2, c));
    }
    for (let i = 0; i <= n; i++) {
      const c = -len / 2 + gap / 2 + i * (pw + gap);
      if (axis === "x") addTrim(box(gap, ph, T * 0.7, M.gold, c, wallY + ph / 2, fixed + inward * 0.008));
      else addTrim(box(T * 0.7, ph, gap, M.gold, fixed + inward * 0.008, wallY + ph / 2, c));
    }
  }
  wall("x", W, -D / 2 + T / 2, 1);            // back
  wall("z", D, -W / 2 + T / 2, 1);            // left
  wall("z", D, W / 2 - T / 2, -1);            // right
  // outer skin so the back looks finished when the cabin turns
  const skins = [
    box(W + 0.04, H, 0.01, M.shell, 0, H / 2 + 0.03, -D / 2 - 0.01),
    box(0.01, H, D + 0.02, M.shell, -W / 2 - 0.01, H / 2 + 0.03, 0),
    box(0.01, H, D + 0.02, M.shell, W / 2 + 0.01, H / 2 + 0.03, 0),
  ];

  // mirror on the back wall
  const mirror = box(W * 0.3, 1.05, 0.006, M.mirror, 0, 1.45, -D / 2 + T + 0.004);
  // kick plates and handrails
  addTrim(box(W - 0.06, 0.1, 0.01, M.gold, 0, 0.12, -D / 2 + T + 0.006));
  addTrim(box(0.01, 0.1, D - 0.06, M.gold, -W / 2 + T + 0.006, 0.12, 0));
  addTrim(box(0.01, 0.1, D - 0.06, M.gold, W / 2 - T - 0.006, 0.12, 0));
  const rail = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, metalness: 1, roughness: 0.15 });
  const railGeo = (len) => new THREE.CylinderGeometry(0.018, 0.018, len, 16);
  const r1 = new THREE.Mesh(railGeo(W - 0.3), rail); r1.rotation.z = Math.PI / 2; r1.position.set(0, 0.92, -D / 2 + T + 0.06); cabin.add(r1);
  for (const sx of [-1, 1]) {
    const r = new THREE.Mesh(railGeo(D - 0.5), rail); r.rotation.x = Math.PI / 2; r.position.set(sx * (W / 2 - T - 0.06), 0.92, -0.05); cabin.add(r);
    for (const z of [-D / 2 + 0.35, D / 2 - 0.45]) box(0.06, 0.016, 0.016, rail, sx * (W / 2 - T - 0.03), 0.92, z);
  }

  // front returns and header (open door opening)
  const ret = 0.28;
  for (const sx of [-1, 1]) addPanel(box(ret, H - 0.06, T, M.steel, sx * (W / 2 - ret / 2), (H - 0.06) / 2 + 0.07, D / 2 - T / 2));
  addPanel(box(W - 2 * ret, 0.3, T, M.steel, 0, H - 0.13, D / 2 - T / 2));
  for (const sx of [-1, 1]) addTrim(box(0.02, H - 0.08, T + 0.012, M.gold, sx * (W / 2 - ret), (H - 0.08) / 2 + 0.07, D / 2 - T / 2));
  addTrim(box(W - 2 * ret + 0.02, 0.02, T + 0.012, M.gold, 0, H - 0.28, D / 2 - T / 2));
  // door sill
  box(W - 2 * ret, 0.014, 0.08, M.steel, 0, 0.068, D / 2 - 0.02);

  // car operating panel on the right wall near the door
  const cop = new THREE.Group(); cop.position.set(W / 2 - T - 0.006, 0, D / 2 - 0.34); cabin.add(cop);
  box(0.008, 1.0, 0.2, M.black, 0, 1.15, 0, cop);
  box(0.004, 0.08, 0.13, M.display, -0.006, 1.55, 0, cop);
  for (let i = 0; i < 8; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.01, 20), M.btn);
    b.rotation.z = Math.PI / 2; b.position.set(-0.008, 1.4 - Math.floor(i / 2) * 0.085, (i % 2 ? 0.045 : -0.045)); cop.add(b);
  }

  /* ---------- finishes ---------- */
  const FIN = [
    { id: "steel", en: "Steel & Gold", ar: "ستانلس وذهبي", sw: ["#cfd3d7", "#e0bf78"], panel: M.steel, trim: M.gold, floor: floors.granite, glass: false },
    { id: "walnut", en: "Walnut & Black", ar: "خشب وأسود", sw: ["#6b4226", "#111"], panel: M.wood, trim: M.black, floor: floors.blackMarble, glass: false },
    { id: "champagne", en: "Champagne", ar: "شامبين", sw: ["#d8c39d", "#e8e8e8"], panel: M.champagne, trim: M.steel, floor: floors.whiteMarble, glass: false },
    { id: "glass", en: "Panoramic glass", ar: "زجاج بانوراما", sw: ["#dff0f0", "#9aa3ab"], panel: M.glass, trim: M.steel, floor: floors.darkGranite, glass: true },
  ];
  let cur = 0, pop = 0;
  function apply(i) {
    cur = i; const f = FIN[i];
    panels.forEach((p) => { p.material = f.panel; p.castShadow = !f.glass; });
    trims.forEach((t) => (t.material = f.trim));
    ceil.material = f.trim === M.black ? M.black : M.gold;
    floorMat.map = f.floor; floorMat.needsUpdate = true;
    mirror.visible = !f.glass; skins.forEach((k) => (k.visible = !f.glass));
    pop = 1;
    picker.querySelectorAll("button").forEach((b, k) => b.setAttribute("aria-pressed", k === i));
    label.textContent = AR() ? f.ar : f.en;
  }

  /* ---------- finish picker (dots under the cabin) ---------- */
  const ui = document.createElement("div"); ui.className = "cab3d-ui";
  const picker = document.createElement("div"); picker.className = "cab3d-dots";
  const label = document.createElement("div"); label.className = "cab3d-name";
  FIN.forEach((f, i) => {
    const b = document.createElement("button"); b.type = "button";
    b.style.background = `linear-gradient(135deg,${f.sw[0]} 50%,${f.sw[1]} 50%)`;
    b.setAttribute("aria-label", f.en);
    b.addEventListener("click", () => { apply(i); userPicked = performance.now(); });
    picker.appendChild(b);
  });
  ui.append(label, picker); host.appendChild(ui);
  let userPicked = 0;
  window.addEventListener("melsa:lang", () => { label.textContent = AR() ? FIN[cur].ar : FIN[cur].en; });
  apply(0);
  host.classList.add("has3d");

  /* ---------- drag to turn ---------- */
  let drag = null, dragYaw = 0, yawVel = 0;
  const cv = renderer.domElement;
  cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw: dragYaw, horiz: null }; });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (drag.horiz === null && Math.hypot(dx, dy) > 6) drag.horiz = Math.abs(dx) > Math.abs(dy);
    if (drag.horiz) { dragYaw = drag.yaw + dx * 0.008; userPicked = performance.now(); }
  });
  addEventListener("pointerup", () => { drag = null; });

  /* ---------- size, visibility, loop ---------- */
  function resize() {
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight - 64);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const dist = w / h < 0.9 ? 8.0 : 5.9;
    camera.position.set(dist * 0.36, 1.9, dist * 0.93); camera.lookAt(target); camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host); resize();
  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { rootMargin: "100px" }).observe(host);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clock = new THREE.Clock(); let t = 0, lastSwap = 0;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible) return;
    t += dt;
    const m = parseFloat(getComputedStyle(host.closest(".chap") || host).getPropertyValue("--m")) || 1;
    // gentle turntable: sway around the front, plus a scroll-linked turn and the user's drag
    dragYaw *= drag ? 1 : 0.985; yawVel = 0;
    const sway = reduce ? 0 : Math.sin(t * 0.32) * 0.5;
    turntable.rotation.y = 0.38 + sway - (1 - m) * 1.1 + dragYaw;
    // a small "pop" when the finish changes
    pop = Math.max(0, pop - dt * 2.4);
    const s = 1 + Math.sin(pop * Math.PI) * 0.025; cabin.scale.setScalar(s);
    // auto-cycle finishes every 4.5 s while nobody is interacting
    if (!reduce && performance.now() - userPicked > 9000 && t - lastSwap > 4.5) { lastSwap = t; apply((cur + 1) % FIN.length); }
    renderer.render(scene, camera);
  });
}
