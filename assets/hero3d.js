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
  governor: ["Overspeed governor", "الجفرنر (منظم السرعة)"], cable: ["Travelling cable", "الكابل المرن"],
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
  comp("rails", rails, { p: [-4.0, 0.3, -1.6], r: [0, -0.4, 0.12], s: 0.4 }, [5.0, 6.2], [0.3, TOP * 0.45, 0]);

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

  // overspeed governor (top) + its rope and tension pulley (pit)
  const gov = new THREE.Group();
  gov.add(edges(box(0.34, 0.06, 0.3, metal(0x2b3550)))); gov.children[0].position.y = -0.2;
  for (const x of [-0.12, 0.12]) { const s = box(0.03, 0.22, 0.03, metal(0x39445a)); s.position.set(x, -0.08, 0); gov.add(s); }
  const govSheave = edges(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 28), metal(0xf2c94c, 0.9, 0.25)), 0x0a1730, 0.9);
  govSheave.rotation.z = Math.PI / 2; gov.add(govSheave);
  for (const a of [0, Math.PI]) { const fw = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: RED })); fw.position.set(0.03, Math.sin(a) * 0.09, Math.cos(a) * 0.09); govSheave.add(fw); }
  const GX = -0.68, GZ = 0.5;
  const gc = comp("governor", gov, { p: [0.2, 6.3, 0.4], r: [0.2, 0.8, 0], s: 2.2 }, [6.4, 7.5], [0, 0.45, 0]);
  gc.asm.p.set(GX, TOP + 0.3, GZ);
  const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 20), metal(0xf2c94c, 0.9, 0.25));
  pulley.rotation.z = Math.PI / 2; pulley.position.set(GX, 0.3, GZ); scene.add(pulley);
  const govRope = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(GX, TOP + 0.3, GZ + 0.16), new THREE.Vector3(GX, 0.3, GZ + 0.11),
    new THREE.Vector3(GX, TOP + 0.3, GZ - 0.16), new THREE.Vector3(GX, 0.3, GZ - 0.11)]),
    new THREE.LineBasicMaterial({ color: 0xff8a96, transparent: true, opacity: 0.8 }));
  scene.add(govRope);

  // travelling cable: a coil when shown apart, a hanging loop under the car once installed
  const coilPts = []; for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI * 2 * 3.2; coilPts.push(new THREE.Vector3(Math.cos(a) * 0.32, i / 120 * 0.34 - 0.17, Math.sin(a) * 0.32)); }
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x1a1d24, metalness: 0.2, roughness: 0.6, emissive: new THREE.Color(0x3aa0ff), emissiveIntensity: 0.15, transparent: true });
  const coilG = new THREE.Group(); const coil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts), 240, 0.03, 8), cableMat); coilG.add(coil);
  const cab2 = comp("cable", coilG, { p: [-3.2, 2.0, 0.9], r: [0.5, 0.3, 0], s: 1.6 }, [7.6, 8.6], [0, 0.42, 0]);
  const CA = new THREE.Vector3(0.82, B + 2.8 + 1.2, -0.38), CL = 4.4;
  cab2.asm.p.copy(CA); cab2.asm.s = 0.2;
  const hangMat = cableMat.clone(); let hang = null;
  function hangCable(carY, op) {
    if (hang) { scene.remove(hang); hang.geometry.dispose(); hang = null; }
    if (op < 0.01) return;
    const cy = carY, lo = Math.max(0.18, (CA.y + cy) / 2 - CL / 2);
    const P = [CA.clone(), new THREE.Vector3(0.82, Math.min(CA.y - 0.3, lo + 0.45), -0.38), new THREE.Vector3(0.8, lo + 0.1, -0.38),
      new THREE.Vector3(0.69, lo, -0.38), new THREE.Vector3(0.58, lo + 0.1, -0.38), new THREE.Vector3(0.56, Math.max(lo + 0.12, Math.min(cy - 0.08, lo + 0.45)), -0.38), new THREE.Vector3(0.55, cy, -0.38)];
    hangMat.opacity = op;
    hang = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 48, 0.025, 6), hangMat); scene.add(hang);
  }

  // hoisting ropes: drawn as tubes that arrive from far away and wrap the traction sheave
  const ropeGeo = new THREE.BufferGeometry(); const ropePts = new Float32Array(6 * 3 * 2);
  ropeGeo.setAttribute("position", new THREE.BufferAttribute(ropePts, 3));
  const ropes = new THREE.LineSegments(ropeGeo, new THREE.LineBasicMaterial({ color: 0xdfe6ee, transparent: true, opacity: 0.85 })); scene.add(ropes);
  const SX = 0.12, SY = TOP + 0.38, SZ = -0.35, SR = 0.28;
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xe6edf5, metalness: 0.9, roughness: 0.25, emissive: new THREE.Color(0x7cc8ff), emissiveIntensity: 0.35, transparent: true });
  const r1 = [new THREE.Vector3(3.6, TOP + 2.4, 3.2), new THREE.Vector3(2.2, TOP + 1.5, 1.8), new THREE.Vector3(0.9, SY + 0.7, 0.5), new THREE.Vector3(SX + 0.1, SY + SR + 0.05, SZ + 0.15)];
  for (let k = 0; k <= 60; k++) { const th = Math.PI / 2 + k / 60 * Math.PI * 2 * 1.5; r1.push(new THREE.Vector3(SX + 0.06 - k / 60 * 0.08, SY + Math.sin(th) * SR, SZ + Math.cos(th) * SR)); }
  r1.push(new THREE.Vector3(SX - 0.04, SY - 0.6, SZ + SR - 0.02), new THREE.Vector3(0, B + 2.67, 0));
  const r2 = [new THREE.Vector3(SX - 0.02, SY, SZ - SR), new THREE.Vector3(0.02, SY - 1.2, -D / 2 + 0.16), new THREE.Vector3(0, B + 7.3, -D / 2 + 0.16)];
  const tube = (pts, n) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2), n, 0.016, 6), ropeMat);
  const rope1 = tube(r1, 260), rope2 = tube(r2, 60); scene.add(rope1, rope2);
  const rCount1 = rope1.geometry.index.count, rCount2 = rope2.geometry.index.count;
  const headCurve = new THREE.CatmullRomCurve3(r1, false, "catmullrom", 0.2);

  /* ---------- labels (HTML, follow their component on screen) ---------- */
  const lab = {};
  for (const k in LABELS) { const s = document.createElement("span"); s.className = "c3-lab"; host.append(s); lab[k] = s; }
  let langNow = -1;

  /* ---------- timeline: overview, then one part at a time with the camera on it ---------- */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  // focus: [offset x, y, z, size] in the part's own scale
  const FOCUS = { rails: [0, TOP * 0.5, 0, 5.2], buffers: [0, 0.2, 0, 1.8], cw: [0, 0, 0, 2.2], machine: [0, 0, 0, 2.2], governor: [0, -0.05, 0, 1.6],
    controller: [0, 0, 0, 1.6], cabin: [0, 1.2, 0, 3.4], lop: [0, 0, 0, 1.4], cable: [0, 0, 0, 2.0] };
  const ORDER = [["rails", 3.4], ["buffers", 2.8], ["shaft", 3.6], ["cw", 3.0], ["machine", 3.2], ["governor", 3.0], ["controller", 2.8],
    ["cabin", 3.6], ["doors", 3.2], ["lop", 2.8], ["cable", 3.2], ["ropes", 6.0]];
  const INTRO = 4.5, HOLD = 0.9; // HOLD = time spent zoomed on the part before it moves
  const STEP = {}; let tt = INTRO;
  for (const [n, d] of ORDER) { STEP[n] = [tt, tt + d]; tt += d; }
  const BUILT = tt;                                  // ≈ 44s
  const R = { lights: BUILT + 0.2, close1: [BUILT + 1.4, BUILT + 2.3], up: [BUILT + 2.6, BUILT + 7.4], open1: [BUILT + 7.4, BUILT + 8.3], close2: [BUILT + 9.8, BUILT + 10.7],
    down: [BUILT + 11.0, BUILT + 15.8], open2: [BUILT + 15.8, BUILT + 16.7] };
  const OUT = [BUILT + 18.0, BUILT + 21.0], CYCLE = BUILT + 22.0;
  for (const n in comps) comps[n].win = [STEP[n][0] + HOLD, STEP[n][1] - 0.2];
  const v = new THREE.Vector3(), camT = new THREE.Vector3(0, 4.2, 0);
  let lastInd = "", focusSize = 0, focus = new THREE.Vector3();

  function apply(T) {
    const t = T % CYCLE;
    const out = ease(seg(t, OUT[0], OUT[1]));
    const showIn = ease(seg(t, 0, 1.4));
    const up = ease(seg(t, ...R.up)), down = ease(seg(t, ...R.down));
    const carY = FLOORS[0] + 5.6 * (up - down);
    cabC.asm.p.set(0, carY, 0);
    comps.cw.asm.p.set(0, B + 0.55 + (5.6 - (carY - B)) + 0.6, -D / 2 + 0.16);

    // which step is running now
    let cur = null; for (const [n] of ORDER) { const [a, b] = STEP[n]; if (t >= a && t < b) { cur = n; break; } }
    for (const name in comps) {
      const c = comps[name], o = c.obj;
      const a = ease(seg(t, c.win[0], c.win[1])) * (1 - out);
      const live = name === cur && t < c.win[0];   // zoomed on it, not moving yet: little "presentation" spin
      const bob = (1 - a) * Math.sin(T * 0.9 + c.win[0] * 3) * 0.1;
      const spin = (1 - a) * (Math.sin(T * 0.35 + c.win[0]) * 0.3 + (live ? (t - STEP[name][0]) * 0.9 : 0));
      o.position.set(...c.show.p).lerp(c.asm.p, a); o.position.y += bob;
      o.rotation.set(c.show.r[0] * (1 - a), (c.show.r[1] + spin) * (1 - a), c.show.r[2] * (1 - a));
      o.scale.setScalar((c.show.s + (c.asm.s - c.show.s) * a) * (0.6 + 0.4 * showIn) * (live ? 1.06 : 1));
      c.a = a;
    }
    // doors
    const da = ease(seg(t, STEP.doors[0] + HOLD, STEP.doors[1] - 0.2)) * (1 - out);
    doors.position.copy(doorShow).multiplyScalar(1 - da);
    doors.rotation.y = -0.6 * (1 - da) + (cur === "doors" && da === 0 ? (t - STEP.doors[0]) * 0.9 : 0) * (1 - da);
    const open = Math.max(1 - seg(t, ...R.close1), seg(t, ...R.open1) * (1 - seg(t, ...R.close2)), seg(t, ...R.open2) * (1 - seg(t, OUT[0] - 0.9, OUT[0])));
    const o2 = ease(open) * 0.56 * da; doorL.position.x = -0.31 - o2; doorR.position.x = 0.31 + o2;
    sheave.rotation.x = carY * 2.4; govSheave.rotation.x = carY * 4; pulley.rotation.x = carY * 6;
    // shaft builds with a scan beam
    const [s0, s1] = STEP.shaft;
    const built = ease(seg(t, s0 + 0.4, s1 - 0.3)) * (1 - out);
    structure.visible = built > 0.01;
    structMats.forEach(m => m.opacity = built); glassMat.opacity = 0.08 * built;
    structEdges.forEach(m => m.opacity = m.userData.base * built);
    scan.visible = t > s0 + 0.3 && t < s1; scan.position.y = TOP * ease(seg(t, s0 + 0.4, s1 - 0.3)); scan.material.opacity = 0.55 * (1 - seg(t, s1 - 0.5, s1));
    // governor rope
    const gOn = (comps.governor.a > 0.98 ? 1 : 0) * (1 - out);
    govRope.material.opacity = 0.8 * gOn; govRope.visible = pulley.visible = gOn > 0.01;
    // travelling cable
    const ca = comps.cable.a || 0; cableMat.opacity = 1 - ca; coilG.visible = ca < 0.98; hangCable(carY, ca);
    // hoisting ropes: tube arrives from far, wraps the sheave, drops to car & counterweight, then hands over to live lines
    const [q0, q1] = STEP.ropes, qd = q1 - q0;
    const p1 = ease(seg(t, q0 + 0.5, q0 + qd * 0.72)), p2 = ease(seg(t, q0 + qd * 0.55, q0 + qd * 0.85));
    const hand = seg(t, q1 - 0.6, q1);
    rope1.visible = p1 > 0 && hand < 1 && out === 0; rope2.visible = p2 > 0 && hand < 1 && out === 0;
    rope1.geometry.setDrawRange(0, Math.floor(p1 * rCount1 / 36) * 36); rope2.geometry.setDrawRange(0, Math.floor(p2 * rCount2 / 36) * 36);
    ropeMat.opacity = 1 - hand;
    const ropeOn = hand * (1 - out) * (t >= q1 - 0.6 ? 1 : 0);
    ropes.material.opacity = 0.85 * ropeOn; ropes.visible = ropeOn > 0.01;
    const cwy = comps.cw.obj.position.y;
    let i = 0; const put = (a, b) => { ropePts.set([...a, ...b], i); i += 6; };
    for (const dx of [-0.05, 0, 0.05]) { put([dx, carY + 2.67, 0], [dx + SX, SY, SZ + SR]); put([dx + SX, SY, SZ - SR], [dx, cwy + 0.55, -D / 2 + 0.16]); }
    ropeGeo.attributes.position.needsUpdate = true;

    // camera focus
    let wantD, ropeHead = null;
    if (t < INTRO || t >= OUT[0]) { focus.set(0, 4.2, 0); wantD = dShow; }
    else if (cur === "shaft") { focus.set(0, 5.0, 0); wantD = fit(10.6, 5); }
    else if (cur === "doors") { doors.getWorldPosition(focus); focus.y += 1.0 * car.scale.x; wantD = fit(3.0, 3.0); }
    else if (cur === "ropes") {
      const u = clamp(p1 * 1.0); ropeHead = headCurve.getPointAt(Math.min(0.999, u));
      if (u < 0.5) { focus.copy(ropeHead).lerp(new THREE.Vector3(SX, SY, SZ), seg(u, 0.25, 0.5)); wantD = fit(3.2, 3.2); }
      else { focus.set(SX, SY, SZ).lerp(new THREE.Vector3(0, 5.2, 0), ease(seg(t, q0 + qd * 0.6, q1))); wantD = fit(2.6 + 8 * ease(seg(t, q0 + qd * 0.6, q1)), 3.0); }
    }
    else if (cur && FOCUS[cur]) { const c = comps[cur], f = FOCUS[cur]; focus.set(f[0], f[1], f[2]).multiplyScalar(c.obj.scale.x).add(c.obj.position); wantD = fit(f[3] * c.obj.scale.x / (cur === "rails" ? 1 : 1) + 0.6, f[3] * c.obj.scale.x + 0.6); }
    else if (t < R.up[0]) { focus.set(0, 5.2, 0); wantD = fit(10.6, 5); }
    else { focus.set(0, carY + 1.6, 0); wantD = dRide; }

    // labels: everything during the intro, then only the part in focus
    const L = document.documentElement.lang === "ar" ? 1 : 0;
    const introVis = ease(seg(t, 0.8, 1.8)) * (1 - ease(seg(t, INTRO - 0.6, INTRO)));
    const W2 = host.clientWidth, H2 = host.clientHeight;
    for (const kname in lab) {
      const el = lab[kname];
      if (L !== langNow) el.textContent = LABELS[kname][L];
      if (kname === "doors") { doors.getWorldPosition(v); v.y += 2.3 * car.scale.x; }
      else { const c = comps[kname]; v.copy(c.labelOff).multiplyScalar(c.obj.scale.x).add(c.obj.position); }
      const st = STEP[kname], mine = st && t >= st[0] && t < st[1] ? Math.min(seg(t, st[0], st[0] + 0.4), 1 - seg(t, st[1] - 0.5, st[1])) : 0;
      const vis = Math.max(introVis, mine);
      v.project(camera);
      el.style.opacity = (vis * (v.z < 1 ? 1 : 0)).toFixed(2);
      el.classList.toggle("big", mine > 0);
      el.style.transform = `translate(-50%,-100%) translate(${((v.x + 1) / 2 * W2).toFixed(1)}px,${((1 - v.y) / 2 * H2).toFixed(1)}px)`;
    }
    langNow = L;
    if (ind) {
      const f = Math.round((carY - B) / 2.8), dir = t > R.up[0] && t < R.up[1] ? "▲" : t > R.down[0] && t < R.down[1] ? "▼" : "•";
      const txt = dir + " " + ["G", "1", "2"][clamp(f, 0, 2)];
      if (txt !== lastInd) { ind.textContent = txt; lastInd = txt; }
      ind.classList.toggle("on", t > R.close1[0] && t < OUT[0]);
    }
    ring.material.opacity = 0.35 + 0.35 * Math.sin(T * 2.2) ** 2;
    return wantD;
  }

  /* ---------- camera & loop ---------- */
  function fit(H, Wd) { const f = THREE.MathUtils.degToRad(camera.fov) / 2; return Math.max((H / 2) / Math.tan(f), (Wd / 2) / (Math.tan(f) * camera.aspect)) * 1.08; }
  let dShow = 20, dRide = 14;
  function resize() {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    dShow = fit(9.2, 9.6); dRide = fit(6.6, 4.2);
  }
  new ResizeObserver(resize).observe(host); resize();

  const FIX = (q => q === null ? null : +q)(new URLSearchParams(location.search).get("t3d"));
  let visible = true, t0 = performance.now(), last = t0, camD = dShow;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(host);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const T = FIX != null ? FIX : reduce ? BUILT + 1 : (now - t0) / 1000;
    const wantD = apply(T);
    const s = FIX != null ? 1 : 1 - Math.exp(-dt * 2.2);
    camT.lerp(focus, s); camD += (wantD - camD) * s;
    const a = -0.5 + (reduce ? 0 : Math.sin(T * 0.08) * 0.35);
    camera.position.set(camT.x + Math.sin(a) * camD, camT.y + camD * 0.12, camT.z + Math.cos(a) * camD);
    camera.lookAt(camT);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  return true;
}

if (host) {
  const go = () => { try { if (start()) document.querySelector(".hero")?.classList.add("has3d"); } catch (e) { console.warn(e); } };
  if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
}
