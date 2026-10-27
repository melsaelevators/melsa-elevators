/* Melsa Elevators — animated 3D hero.
   1) The elevator's components are shown apart, each labelled.
   2) They fly into place one by one and build the full elevator.
   3) The cabin rides up and down the floors.
   4) Everything comes apart again and the loop restarts. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const host = document.getElementById("hero3d");
const ind = document.getElementById("liftInd");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const LABELS = {
  machine: ["Traction machine", "الماكينة"], controller: ["Controller", "لوحة الكنترول"], rails: ["Guide rails", "السكك"],
  cabin: ["Cabin", "الكابينة"], doors: ["Doors", "الأبواب"], cw: ["Counterweight", "الثقل"],
  buffers: ["Buffers", "المخمدات"], lop: ["LOP panel", "لوحة الطلبات"],
};

function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { return false; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.5;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xbfd6ff, 0x0a1730, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 10, 6); scene.add(key);
  const rim = new THREE.PointLight(0x3aa0ff, 30, 30); rim.position.set(-4, 6, -3); scene.add(rim);
  const redL = new THREE.PointLight(0xff2a3d, 12, 12); redL.position.set(3, 1, 3); scene.add(redL);

  const CYAN = 0x7cc8ff, NAVY = 0x023584, RED = 0xd8031a;
  const B = 0.4, FLOORS = [B, B + 2.8, B + 5.6], TOP = B + 9.2, W = 1.95, D = 1.85;

  const edgeMats = [];
  function edges(mesh, color = CYAN, op = 0.7) {
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false });
    m.userData.base = op; edgeMats.push(m);
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 20), m)); return mesh;
  }
  const metal = (c, m = 0.85, r = 0.3) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r });
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

  /* ---------- ground ---------- */
  const grid = new THREE.GridHelper(16, 32, 0x3a7bd5, 0x1d3f7a);
  grid.material.transparent = true; grid.material.opacity = 0.35; scene.add(grid);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.56, 64), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01; scene.add(ring);

  /* ---------- structure: glass shaft + landings (builds with a scan beam) ---------- */
  const structure = new THREE.Group(); scene.add(structure);
  const structMats = [];
  const sm = (c, m, r) => { const x = metal(c, m, r); x.transparent = true; structMats.push(x); return x; };
  const postMat = sm(0x1b2433, 0.7, 0.4);
  for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]]) {
    const p = edges(box(0.07, TOP, 0.07, postMat), CYAN, 0.5); p.position.set(x, TOP / 2, z); structure.add(p);
  }
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x9fd3ff, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false });
  for (const [w, x, z, ry] of [[W, 0, -D / 2, 0], [D, -W / 2, 0, Math.PI / 2], [D, W / 2, 0, Math.PI / 2]]) {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(w, TOP), glassMat); g.position.set(x, TOP / 2, z); g.rotation.y = ry; structure.add(g);
  }
  const slabMat = sm(0x26324a, 0.4, 0.6), frameMat = sm(0xd9dee5, 0.9, 0.25);
  const structEdges = [];
  const se = (m, c, o) => { edges(m, c, o); structEdges.push(m.children[m.children.length - 1].material); return m; };
  FLOORS.forEach(y => {
    const slab = se(box(3.4, 0.14, 1.4, slabMat), CYAN, 0.35); slab.position.set(0, y - 0.07, D / 2 + 0.7); structure.add(slab);
    for (const [w, h, x, yy] of [[0.08, 2.25, -0.66, 1.12], [0.08, 2.25, 0.66, 1.12], [1.4, 0.1, 0, 2.3]]) {
      const f = se(box(w, h, 0.06, frameMat), RED, 0.8); f.position.set(x, y + yy, D / 2 + 0.01); structure.add(f);
    }
  });
  structure.children.forEach(o => { if (o.children[0] && o.children[0].material && !structEdges.includes(o.children[0].material)) structEdges.push(o.children[0].material); });
  const pit = se(box(W, 0.06, D, sm(0x141c2c, 0.3, 0.7)), CYAN, 0.4); pit.position.y = 0.03; structure.add(pit);
  const topFrame = se(box(W + 0.1, 0.12, D + 0.1, sm(0x1b2433)), CYAN, 0.6); topFrame.position.y = TOP; structure.add(topFrame);
  const scan = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, 0.02, D + 0.4), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(scan);

  /* ---------- components (each shown apart, then assembled) ---------- */
  const comps = {};
  function comp(name, obj, show, win, labelOff = [0, 1, 0]) {
    scene.add(obj);
    comps[name] = { obj, show, win, labelOff: new THREE.Vector3(...labelOff), asm: { p: new THREE.Vector3(), s: 1 } };
    return comps[name];
  }

  // traction machine
  const machine = new THREE.Group();
  const mb = edges(box(1.1, 0.12, 0.6, metal(0x2b3550))); mb.position.y = -0.3; machine.add(mb);
  const motor = edges(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.42, 32), metal(NAVY, 0.6, 0.35)), CYAN, 0.4); motor.rotation.z = Math.PI / 2; motor.position.x = -0.32; machine.add(motor);
  const sheave = edges(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 32), metal(0xf2c94c, 0.9, 0.25)), 0x0a1730, 0.9); sheave.rotation.z = Math.PI / 2; sheave.position.x = 0.12; machine.add(sheave);
  const mc = comp("machine", machine, { p: [-2.4, 7.2, 0.6], r: [0.3, 0.6, 0], s: 1.6 }, [6.3, 7.5], [0, 0.6, 0]);
  mc.asm.p.set(0, TOP + 0.38, -0.35);

  // controller cabinet
  const ctrl = new THREE.Group();
  ctrl.add(edges(box(0.36, 0.6, 0.22, metal(0x2a3346, 0.5, 0.45))));
  for (let i = 0; i < 3; i++) { const led = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.01), new THREE.MeshBasicMaterial({ color: i ? 0x2bff88 : RED })); led.position.set(-0.08 + i * 0.08, 0.2, 0.115); ctrl.add(led); }
  const cc = comp("controller", ctrl, { p: [2.4, 7.0, 0.6], r: [0.2, -0.6, 0], s: 1.8 }, [6.5, 7.6], [0, 0.5, 0]);
  cc.asm.p.set(0.72, TOP + 0.36, 0.5);

  // guide rails
  const rails = new THREE.Group();
  for (const x of [-0.82, 0.82]) { const g = new THREE.BoxGeometry(0.05, TOP, 0.09); g.translate(0, TOP / 2, 0); const r = edges(new THREE.Mesh(g, metal(0xaab4c0, 0.9, 0.3)), CYAN, 0.6); r.position.x = x; rails.add(r); }
  comp("rails", rails, { p: [3.5, 0.5, -0.8], r: [0, -0.4, 0.12], s: 0.4 }, [5.0, 6.2], [0.3, TOP * 0.45, 0]);

  // buffers (springs in the pit)
  const buffers = new THREE.Group();
  for (const x of [-0.4, 0.4]) {
    const sp = edges(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.3, 16), metal(0xd8031a, 0.5, 0.4)), CYAN, 0.5); sp.position.set(x, 0.21, 0); buffers.add(sp);
    const bs = box(0.26, 0.06, 0.26, metal(0x39445a)); bs.position.set(x, 0.06, 0); buffers.add(bs);
  }
  comp("buffers", buffers, { p: [-2.0, 1.0, 1.4], r: [0.3, 0.5, 0], s: 2.0 }, [5.3, 6.3], [0, 0.5, 0]);

  // counterweight
  const cwG = new THREE.Group(); cwG.add(edges(box(0.62, 1.1, 0.16, metal(0x39445a, 0.6, 0.5)), CYAN, 0.6));
  for (let i = 0; i < 4; i++) { const s = box(0.6, 0.02, 0.17, metal(0x222a3a)); s.position.y = -0.4 + i * 0.27; cwG.add(s); }
  comp("cw", cwG, { p: [-3.1, 4.0, 0.2], r: [0, 0.7, 0], s: 1.2 }, [5.8, 7.0], [0, 0.75, 0]);

  // cabin (car) — doors live inside it but have their own showcase position
  const car = new THREE.Group();
  const wallM = metal(0xc9d1da, 0.92, 0.22), goldM = metal(0xc8a45e, 0.95, 0.22), darkM = metal(0x2b2f36, 0.3, 0.5);
  const add = (m, x, y, z, ec = CYAN) => { edges(m, ec, 0.5); m.position.set(x, y, z); car.add(m); return m; };
  add(box(1.4, 0.08, 1.3, darkM), 0, 0.04, 0);
  const ceil = add(box(1.4, 0.08, 1.3, metal(0xe8edf3, 0.5, 0.4)), 0, 2.26, 0);
  add(box(1.4, 2.18, 0.04, wallM), 0, 1.13, -0.63);
  add(box(0.04, 2.18, 1.3, wallM), -0.68, 1.13, 0);
  add(box(0.04, 2.18, 1.3, wallM), 0.68, 1.13, 0);
  add(box(0.12, 2.18, 0.04, goldM), -0.64, 1.13, 0.64);
  add(box(0.12, 2.18, 0.04, goldM), 0.64, 1.13, 0.64);
  add(box(1.4, 0.16, 0.04, goldM), 0, 2.14, 0.64);
  const hr = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 12), goldM); hr.rotation.z = Math.PI / 2; add(hr, 0, 0.95, -0.58);
  const copM = metal(0x111318, 0.4, 0.3); copM.emissive = new THREE.Color(RED); copM.emissiveIntensity = 0.5;
  add(box(0.12, 0.7, 0.02, copM), 0.55, 1.25, 0.6, RED);
  add(box(0.07, 2.7, 0.07, metal(0x1b2433)), -0.76, 1.3, 0);
  add(box(0.07, 2.7, 0.07, metal(0x1b2433)), 0.76, 1.3, 0);
  add(box(1.6, 0.1, 0.12, metal(0x1b2433)), 0, 2.62, 0);
  ceil.material.emissive = new THREE.Color(0xfff1c8); ceil.material.emissiveIntensity = 0.25;
  const light = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.9), new THREE.MeshBasicMaterial({ color: 0xfff1c8 }));
  light.rotation.x = Math.PI / 2; light.position.y = 2.21; car.add(light);
  const carLight = new THREE.PointLight(0xfff1c8, 6, 3); carLight.position.y = 1.9; car.add(carLight);
  const doors = new THREE.Group(); car.add(doors);
  const doorL = edges(box(0.62, 2.02, 0.03, goldM), CYAN, 0.5); doorL.position.set(-0.31, 1.05, 0.67); doors.add(doorL);
  const doorR = edges(box(0.62, 2.02, 0.03, goldM), CYAN, 0.5); doorR.position.set(0.31, 1.05, 0.67); doors.add(doorR);
  const cabC = comp("cabin", car, { p: [0, 2.4, 0.9], r: [0.08, 0.55, 0], s: 1.0 }, [6.6, 7.9], [0, 2.8, 0]);
  const doorShow = new THREE.Vector3(2.3, 0.3, 1.4), doorWin = [7.2, 8.3];

  // LOP panel on the ground landing
  const lop = new THREE.Group();
  lop.add(edges(box(0.16, 0.42, 0.03, metal(0xd9dee5, 0.9, 0.25))));
  for (const y of [0.07, -0.07]) { const b = new THREE.Mesh(new THREE.CircleGeometry(0.035, 20), new THREE.MeshBasicMaterial({ color: RED })); b.position.set(0, y, 0.017); lop.add(b); }
  const lc = comp("lop", lop, { p: [2.3, 0.9, 2.4], r: [0, -0.4, 0], s: 2.4 }, [7.4, 8.4], [0, 0.4, 0]);
  lc.asm.p.set(0.95, B + 1.15, D / 2 + 0.05);

  // ropes
  const ropeGeo = new THREE.BufferGeometry(); const ropePts = new Float32Array(6 * 3 * 2);
  ropeGeo.setAttribute("position", new THREE.BufferAttribute(ropePts, 3));
  const ropes = new THREE.LineSegments(ropeGeo, new THREE.LineBasicMaterial({ color: 0xdfe6ee, transparent: true, opacity: 0.85 })); scene.add(ropes);

  /* ---------- labels (HTML, follow their component on screen) ---------- */
  const lab = {};
  for (const k in LABELS) { const s = document.createElement("span"); s.className = "c3-lab"; host.append(s); lab[k] = s; }
  let langNow = -1;

  /* ---------- timeline ---------- */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const CYCLE = 22, OUT = [20.4, 21.9];
  const v = new THREE.Vector3();
  let lastInd = "";

  function apply(T) {
    const t = T % CYCLE;
    const out = ease(seg(t, OUT[0], OUT[1]));
    const showIn = ease(seg(t, 0, 1.2));
    const up = ease(seg(t, 10.0, 13.4)), down = ease(seg(t, 15.6, 19.0));
    const carY = FLOORS[0] + 5.6 * (up - down);
    cabC.asm.p.set(0, carY, 0);
    comps.cw.asm.p.set(0, B + 0.55 + (5.6 - (carY - B)) + 0.6, -D / 2 + 0.16);

    let k = 0;
    for (const name in comps) {
      const c = comps[name], o = c.obj;
      const a = ease(seg(t, c.win[0], c.win[1])) * (1 - out);
      if (name === "cabin") k = a;
      const bob = (1 - a) * Math.sin(T * 1.3 + c.win[0] * 3) * 0.12;
      const spin = (1 - a) * Math.sin(T * 0.5 + c.win[0]) * 0.35;
      o.position.set(...c.show.p).lerp(c.asm.p, a); o.position.y += bob;
      o.rotation.set(c.show.r[0] * (1 - a), (c.show.r[1] + spin) * (1 - a), c.show.r[2] * (1 - a));
      o.scale.setScalar((c.show.s + (c.asm.s - c.show.s) * a) * (0.6 + 0.4 * showIn));
    }
    // doors: shown beside the cabin, slide into the car, open at the floors
    const da = ease(seg(t, doorWin[0], doorWin[1])) * (1 - out);
    doors.position.copy(doorShow).multiplyScalar(1 - da);
    doors.rotation.y = -0.6 * (1 - da);
    const open = Math.max(seg(t, 13.4, 14.0) * (1 - seg(t, 15.0, 15.6)), seg(t, 19.0, 19.6) * (1 - seg(t, 20.0, 20.4)));
    const o2 = ease(open) * 0.56; doorL.position.x = -0.31 - o2; doorR.position.x = 0.31 + o2;
    sheave.rotation.x = carY * 2.4;
    // the shaft builds with a scan beam
    const built = ease(seg(t, 5.2, 6.9)) * (1 - out);
    structure.visible = built > 0.01;
    structMats.forEach(m => m.opacity = built); glassMat.opacity = 0.08 * built;
    structEdges.forEach(m => m.opacity = m.userData.base * built);
    scan.visible = t > 5.1 && t < 7.2; scan.position.y = TOP * ease(seg(t, 5.2, 6.9)); scan.material.opacity = 0.55 * (1 - seg(t, 6.7, 7.2));
    // ropes
    const ropeOn = ease(seg(t, 8.0, 8.8)) * (1 - out);
    ropes.material.opacity = 0.85 * ropeOn; ropes.visible = ropeOn > 0.01;
    const sy = TOP + 0.38, sz = -0.35, cwy = comps.cw.obj.position.y;
    let i = 0; const put = (a, b) => { ropePts.set([...a, ...b], i); i += 6; };
    for (const dx of [-0.05, 0, 0.05]) { put([dx, carY + 2.67, 0], [dx + 0.12, sy, sz + 0.2]); put([dx + 0.12, sy, sz - 0.2], [dx, cwy + 0.55, -D / 2 + 0.16]); }
    ropeGeo.attributes.position.needsUpdate = true;
    // labels follow their part on screen
    const L = document.documentElement.lang === "ar" ? 1 : 0;
    const labVis = ease(seg(t, 0.6, 1.6)) * (1 - ease(seg(t, 4.8, 5.5)));
    const W2 = host.clientWidth, H2 = host.clientHeight;
    for (const kname in lab) {
      const el = lab[kname];
      if (L !== langNow) el.textContent = LABELS[kname][L];
      if (kname === "doors") { doors.getWorldPosition(v); v.y += 2.3 * car.scale.x; }
      else { const c = comps[kname]; v.copy(c.labelOff).multiplyScalar(c.obj.scale.x).add(c.obj.position); }
      v.project(camera);
      el.style.opacity = (labVis * (v.z < 1 ? 1 : 0)).toFixed(2);
      el.style.transform = `translate(-50%,-100%) translate(${((v.x + 1) / 2 * W2).toFixed(1)}px,${((1 - v.y) / 2 * H2).toFixed(1)}px)`;
    }
    langNow = L;
    if (ind) {
      const f = Math.round((carY - B) / 2.8), dir = t > 10 && t < 13.4 ? "▲" : t > 15.6 && t < 19 ? "▼" : "•";
      const txt = dir + " " + ["G", "1", "2"][clamp(f, 0, 2)];
      if (txt !== lastInd) { ind.textContent = txt; lastInd = txt; }
      ind.classList.toggle("on", t > 9 && t < 20.4);
    }
    ring.material.opacity = 0.35 + 0.35 * Math.sin(T * 2.2) ** 2;
    return { k, carY };
  }

  /* ---------- camera & loop ---------- */
  const fit = (H, Wd) => { const f = THREE.MathUtils.degToRad(camera.fov) / 2; return Math.max((H / 2) / Math.tan(f), (Wd / 2) / (Math.tan(f) * camera.aspect)) * 1.06; };
  let dShow = 20, dRide = 14;
  function resize() {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    dShow = fit(9.2, 8.0); dRide = fit(6.6, 4.2);
  }
  new ResizeObserver(resize).observe(host); resize();

  let visible = true, t0 = performance.now(), last = t0, camY = 4.2, camD = dShow;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(host);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const T = reduce ? 9.0 : (now - t0) / 1000;
    const { k, carY } = apply(T);
    const wantY = 4.2 + (carY + 1.6 - 4.2) * k, wantD = dShow + (dRide - dShow) * k;
    const s = 1 - Math.exp(-dt * 3); camY += (wantY - camY) * s; camD += (wantD - camD) * s;
    const a = -0.5 + (reduce ? 0 : Math.sin(T * 0.12) * 0.3) * (0.3 + 0.7 * k);
    camera.position.set(Math.sin(a) * camD, camY + 1.6, Math.cos(a) * camD);
    camera.lookAt(0, camY, 0);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  return true;
}

if (host) {
  const go = () => { try { if (start()) document.querySelector(".hero")?.classList.add("has3d"); } catch (e) { console.warn(e); } };
  if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
}
